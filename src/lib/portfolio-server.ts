import { createServerFn } from "@tanstack/react-start";
import {
  getCookie,
  setCookie,
  deleteCookie,
  getRequestProtocol,
} from "@tanstack/react-start/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { normalizePortfolioData, type PortfolioData } from "./portfolio-shared";

const ACCESS_COOKIE = "banu_sb_access";
const REFRESH_COOKIE = "banu_sb_refresh";
const PORTFOLIO_TABLE = "portfolio_site";
const ADMIN_TABLE = "admin_users";
const PORTFOLIO_ROW_ID = "main";

export type CloudBackend = "supabase" | "supabase-empty" | "local" | "none";

export interface CloudSyncStatus {
  backend: CloudBackend;
  supabaseConfigured: boolean;
  hasPublishedRow: boolean;
}

export interface AdminSessionStatus {
  authenticated: boolean;
  email: string | null;
  supabaseConfigured: boolean;
  reason?: string;
}

export interface SaveRemoteResult {
  ok: boolean;
  backend: CloudBackend;
  data?: PortfolioData;
  message: string;
  reason?:
    | "UNAUTHORIZED"
    | "SUPABASE_NOT_CONFIGURED"
    | "RLS_FORBIDDEN"
    | "SUPABASE_ERROR";
}

interface SupabaseServerConfig {
  url: string;
  anonKey: string;
  serviceRoleKey: string;
}

interface PortfolioSiteRow {
  id: string;
  profile: unknown;
  about: unknown;
  skills: unknown;
  projects: unknown;
  experience: unknown;
  education: unknown;
  certifications: unknown;
  contact: unknown;
  footer: unknown;
  updated_at?: string;
}

function getEnv(): Record<string, string | undefined> {
  if (typeof process !== "undefined" && process.env) {
    return process.env;
  }
  return {};
}

function getSupabaseServerConfig(): SupabaseServerConfig | null {
  const env = getEnv();
  const url = (
    env["SUPABASE_URL"] ||
    env["NEXT_PUBLIC_SUPABASE_URL"] ||
    env["VITE_SUPABASE_URL"] ||
    ""
  )
    .trim()
    .replace(/\/+$/, "");
  const anonKey = (
    env["SUPABASE_ANON_KEY"] ||
    env["NEXT_PUBLIC_SUPABASE_ANON_KEY"] ||
    env["VITE_SUPABASE_ANON_KEY"] ||
    ""
  ).trim();
  // Strictly server-only env var for service role key (never read from VITE_*)
  const serviceRoleKey = (env["SUPABASE_SERVICE_ROLE_KEY"] || "").trim();

  if (!url || !anonKey) return null;
  return { url, anonKey, serviceRoleKey };
}

function isLocalDevServer(env: Record<string, string | undefined>): boolean {
  return (
    env["NODE_ENV"] === "development" &&
    !env["VERCEL"] &&
    !env["CF_PAGES"] &&
    !env["CLOUDFLARE_ENV"]
  );
}

function noStoreFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  return fetch(input, { ...init, cache: "no-store" });
}

function createAnonSupabaseClient(config: SupabaseServerConfig): SupabaseClient {
  return createClient(config.url, config.anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      fetch: noStoreFetch,
    },
  });
}

function createAuthedSupabaseClient(
  config: SupabaseServerConfig,
  accessToken: string,
): SupabaseClient {
  return createClient(config.url, config.anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      fetch: noStoreFetch,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });
}

function writeAuthCookies(accessToken: string, refreshToken: string) {
  let secure = false;
  try {
    secure = getRequestProtocol({ xForwardedProto: true }) === "https";
  } catch {
    secure = false;
  }

  const baseOptions = {
    httpOnly: true,
    secure,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  };

  setCookie(ACCESS_COOKIE, accessToken, baseOptions);
  setCookie(REFRESH_COOKIE, refreshToken, baseOptions);
}

function clearAuthCookies() {
  deleteCookie(ACCESS_COOKIE, { path: "/" });
  deleteCookie(REFRESH_COOKIE, { path: "/" });
}

function mapRowToPortfolioData(row: PortfolioSiteRow): PortfolioData {
  const parsedTime = row.updated_at ? Date.parse(row.updated_at) : 0;
  return normalizePortfolioData({
    profile: row.profile,
    about: row.about,
    skills: row.skills,
    projects: row.projects,
    experience: row.experience,
    education: row.education,
    certifications: row.certifications,
    contact: row.contact,
    footer: row.footer,
    updatedAt: Number.isFinite(parsedTime) && parsedTime > 0 ? parsedTime : Date.now(),
  });
}

async function verifyUserIsAdmin(
  config: SupabaseServerConfig,
  accessToken: string,
  userId: string,
): Promise<boolean> {
  const authedClient = createAuthedSupabaseClient(config, accessToken);
  const { data, error } = await authedClient
    .from(ADMIN_TABLE)
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (!error && data?.user_id === userId) {
    return true;
  }

  // Fallback check via service-role if RLS read on admin_users wasn't configured
  if (config.serviceRoleKey) {
    const serviceClient = createClient(config.url, config.serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { fetch: noStoreFetch },
    });
    const { data: svcData } = await serviceClient
      .from(ADMIN_TABLE)
      .select("user_id")
      .eq("user_id", userId)
      .maybeSingle();
    if (svcData?.user_id === userId) return true;
  }

  return false;
}

async function resolveAuthenticatedAdmin(config: SupabaseServerConfig): Promise<{
  ok: boolean;
  userId?: string;
  email?: string | null;
  accessToken?: string;
  reason?: string;
}> {
  const accessToken = getCookie(ACCESS_COOKIE);
  const refreshToken = getCookie(REFRESH_COOKIE);

  if (!accessToken && !refreshToken) {
    return { ok: false, reason: "Not signed in." };
  }

  const supabase = createAnonSupabaseClient(config);
  let activeToken = accessToken || "";
  let user: { id: string; email?: string | undefined } | null = null;

  if (activeToken) {
    const { data } = await supabase.auth.getUser(activeToken);
    if (data?.user) {
      user = data.user;
    }
  }

  if (!user && refreshToken) {
    const { data: refreshed } = await supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });
    if (refreshed?.session && refreshed.user) {
      activeToken = refreshed.session.access_token;
      user = refreshed.user;
      writeAuthCookies(refreshed.session.access_token, refreshed.session.refresh_token);
    }
  }

  if (!user || !activeToken) {
    clearAuthCookies();
    return { ok: false, reason: "Session expired. Please sign in again." };
  }

  const isAdmin = await verifyUserIsAdmin(config, activeToken, user.id);
  if (!isAdmin) {
    return {
      ok: false,
      reason: "Signed-in account is not authorized in public.admin_users.",
    };
  }

  return {
    ok: true,
    userId: user.id,
    email: user.email ?? null,
    accessToken: activeToken,
  };
}

async function readLocalDevFile(): Promise<PortfolioData | null> {
  try {
    const fs = await import(/* @vite-ignore */ "node:fs/promises");
    const path = await import(/* @vite-ignore */ "node:path");
    const filePath = path.join(process.cwd(), "public", "portfolio-data.json");
    const raw = await fs.readFile(filePath, "utf8");
    return normalizePortfolioData(JSON.parse(raw));
  } catch {
    return null;
  }
}

export const getCloudSyncStatusFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<CloudSyncStatus> => {
    const env = getEnv();
    const config = getSupabaseServerConfig();
    if (!config) {
      return {
        backend: isLocalDevServer(env) ? "local" : "none",
        supabaseConfigured: false,
        hasPublishedRow: false,
      };
    }

    try {
      const supabase = createAnonSupabaseClient(config);
      const { data, error } = await supabase
        .from(PORTFOLIO_TABLE)
        .select("id")
        .eq("id", PORTFOLIO_ROW_ID)
        .maybeSingle();

      if (!error && data?.id === PORTFOLIO_ROW_ID) {
        return {
          backend: "supabase",
          supabaseConfigured: true,
          hasPublishedRow: true,
        };
      }
      return {
        backend: "supabase-empty",
        supabaseConfigured: true,
        hasPublishedRow: false,
      };
    } catch {
      return {
        backend: "supabase-empty",
        supabaseConfigured: true,
        hasPublishedRow: false,
      };
    }
  },
);

export const getRemotePortfolioDataFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ data: PortfolioData | null; source: CloudBackend }> => {
    const env = getEnv();
    const config = getSupabaseServerConfig();

    if (config) {
      try {
        const supabase = createAnonSupabaseClient(config);
        const { data, error } = await supabase
          .from(PORTFOLIO_TABLE)
          .select(
            "id, profile, about, skills, projects, experience, education, certifications, contact, footer, updated_at",
          )
          .eq("id", PORTFOLIO_ROW_ID)
          .maybeSingle();

        if (!error && data) {
          return {
            data: mapRowToPortfolioData(data as PortfolioSiteRow),
            source: "supabase",
          };
        }
        return { data: null, source: "supabase-empty" };
      } catch {
        return { data: null, source: "supabase-empty" };
      }
    }

    if (isLocalDevServer(env)) {
      const local = await readLocalDevFile();
      if (local) return { data: local, source: "local" };
    }

    return { data: null, source: "none" };
  },
);

export const getAdminSessionFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<AdminSessionStatus> => {
    const config = getSupabaseServerConfig();
    if (!config) {
      return {
        authenticated: false,
        email: null,
        supabaseConfigured: false,
        reason: "Supabase environment variables (SUPABASE_URL, SUPABASE_ANON_KEY) are not configured.",
      };
    }

    const session = await resolveAuthenticatedAdmin(config);
    return {
      authenticated: session.ok,
      email: session.email ?? null,
      supabaseConfigured: true,
      ...(session.reason ? { reason: session.reason } : {}),
    };
  },
);

export const adminLoginFn = createServerFn({ method: "POST" })
  .validator((input: unknown) => input as { email: string; password: string })
  .handler(
    async ({
      data,
    }): Promise<{ ok: boolean; email?: string | null; message: string }> => {
      const config = getSupabaseServerConfig();
      if (!config) {
        return {
          ok: false,
          message:
            "Supabase is not configured. Add SUPABASE_URL and SUPABASE_ANON_KEY to your environment variables.",
        };
      }

      const email = (data?.email || "").trim();
      const password = data?.password || "";
      if (!email || !password) {
        return { ok: false, message: "Please enter both email and password." };
      }

      const supabase = createAnonSupabaseClient(config);
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error || !authData.session || !authData.user) {
        return {
          ok: false,
          message: error?.message || "Invalid email or password.",
        };
      }

      const isAdmin = await verifyUserIsAdmin(
        config,
        authData.session.access_token,
        authData.user.id,
      );

      if (!isAdmin) {
        clearAuthCookies();
        return {
          ok: false,
          message:
            "Account authenticated, but this email is not listed in public.admin_users. Add your user to public.admin_users in Supabase SQL Editor.",
        };
      }

      writeAuthCookies(authData.session.access_token, authData.session.refresh_token);

      return {
        ok: true,
        email: authData.user.email ?? email,
        message: "Signed in securely via Supabase Auth!",
      };
    },
  );

export const adminLogoutFn = createServerFn({ method: "POST" }).handler(async () => {
  clearAuthCookies();
  return { ok: true };
});

export const updateAdminPasswordFn = createServerFn({ method: "POST" })
  .validator((input: unknown) => input as { newPassword: string })
  .handler(async ({ data }): Promise<{ ok: boolean; message: string }> => {
    const config = getSupabaseServerConfig();
    if (!config) {
      return { ok: false, message: "Supabase is not configured." };
    }

    const newPassword = (data?.newPassword || "").trim();
    if (newPassword.length < 8) {
      return { ok: false, message: "Password must be at least 8 characters long." };
    }

    const admin = await resolveAuthenticatedAdmin(config);
    if (!admin.ok || !admin.accessToken) {
      return { ok: false, message: admin.reason || "Unauthorized." };
    }

    const res = await fetch(`${config.url}/auth/v1/user`, {
      method: "PUT",
      headers: {
        apikey: config.anonKey,
        Authorization: `Bearer ${admin.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ password: newPassword }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      return {
        ok: false,
        message: `Failed to update password (${res.status}): ${errBody.slice(0, 140)}`,
      };
    }

    return { ok: true, message: "Supabase admin password updated successfully!" };
  });

export const saveRemotePortfolioDataFn = createServerFn({ method: "POST" })
  .validator((input: unknown) => input as { data: PortfolioData })
  .handler(async ({ data: input }): Promise<SaveRemoteResult> => {
    const config = getSupabaseServerConfig();
    if (!config) {
      return {
        ok: false,
        backend: "none",
        reason: "SUPABASE_NOT_CONFIGURED",
        message:
          "Supabase is not configured on the server. Add SUPABASE_URL and SUPABASE_ANON_KEY to Vercel Environment Variables.",
      };
    }

    const admin = await resolveAuthenticatedAdmin(config);
    if (!admin.ok || !admin.accessToken || !admin.userId) {
      return {
        ok: false,
        backend: "supabase",
        reason: "UNAUTHORIZED",
        message: admin.reason || "Admin authentication required to publish changes.",
      };
    }

    const normalized = normalizePortfolioData(input.data);
    const nowIso = new Date().toISOString();

    const rowPayload = {
      id: PORTFOLIO_ROW_ID,
      profile: normalized.profile,
      about: normalized.about,
      skills: normalized.skills,
      projects: normalized.projects,
      experience: normalized.experience,
      education: normalized.education,
      certifications: normalized.certifications,
      contact: normalized.contact ?? {},
      footer: normalized.footer ?? {},
      updated_at: nowIso,
      updated_by: admin.userId,
    };

    // Execute write with the authenticated admin's JWT so PostgreSQL RLS policies enforce authorization
    const authedClient = createAuthedSupabaseClient(config, admin.accessToken);
    const { data: savedRow, error } = await authedClient
      .from(PORTFOLIO_TABLE)
      .upsert(rowPayload, { onConflict: "id" })
      .select(
        "id, profile, about, skills, projects, experience, education, certifications, contact, footer, updated_at",
      )
      .single();

    if (error || !savedRow) {
      const isRls =
        error?.code === "42501" ||
        error?.message?.toLowerCase().includes("row-level security") ||
        error?.message?.toLowerCase().includes("permission denied");
      return {
        ok: false,
        backend: "supabase",
        reason: isRls ? "RLS_FORBIDDEN" : "SUPABASE_ERROR",
        message: isRls
          ? "Database permission denied by Supabase RLS. Ensure your user is added to public.admin_users."
          : `Failed to save to Supabase: ${error?.message || "Unknown error"}`,
      };
    }

    const mapped = mapRowToPortfolioData(savedRow as PortfolioSiteRow);
    return {
      ok: true,
      backend: "supabase",
      data: mapped,
      message: "Published live to Supabase! All browsers & devices now show your updates immediately.",
    };
  });
