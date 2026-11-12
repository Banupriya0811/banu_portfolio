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
  diagnostic?: string;
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

export interface SupabaseServerConfig {
  url: string;
  anonKey: string;
  serviceRoleKey: string;
  keyKind: "sb_publishable" | "jwt" | "other";
  urlHadExtraPath: boolean;
}

export interface SupabaseConfigResolution {
  config: SupabaseServerConfig | null;
  error?: string;
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
  const processEnv = typeof process !== "undefined" && process.env ? process.env : {};
  const globalEnv =
    typeof globalThis !== "undefined" &&
    (globalThis as { __env__?: Record<string, string | undefined> }).__env__
      ? (globalThis as { __env__?: Record<string, string | undefined> }).__env__!
      : {};
  return { ...globalEnv, ...processEnv };
}

function stripQuotesAndWhitespace(value: string | undefined): string {
  if (!value) return "";
  let cleaned = value.trim();
  if (
    (cleaned.startsWith('"') && cleaned.endsWith('"')) ||
    (cleaned.startsWith("'") && cleaned.endsWith("'"))
  ) {
    cleaned = cleaned.slice(1, -1).trim();
  }
  return cleaned;
}

export function classifySupabaseKey(key: string): "sb_publishable" | "jwt" | "other" {
  if (key.startsWith("sb_publishable_") || key.startsWith("sb_secret_")) {
    return "sb_publishable";
  }
  if (key.split(".").length === 3 && key.startsWith("eyJ")) {
    return "jwt";
  }
  return "other";
}

export function isNonJwtSupabaseKey(key: string): boolean {
  return key.startsWith("sb_publishable_") || key.startsWith("sb_secret_");
}

function logSupabaseDiagnostic(
  level: "info" | "warn" | "error",
  event: string,
  meta: Record<string, unknown>,
) {
  const logger = level === "error" ? console.error : level === "warn" ? console.warn : console.info;
  logger(`[supabase:${event}]`, JSON.stringify(meta));
}

export function resolveSupabaseServerConfig(
  env: Record<string, string | undefined> = getEnv(),
): SupabaseConfigResolution {
  const rawUrl = stripQuotesAndWhitespace(
    env["SUPABASE_URL"] ||
      env["NEXT_PUBLIC_SUPABASE_URL"] ||
      env["VITE_SUPABASE_URL"],
  );
  const rawAnonKey = stripQuotesAndWhitespace(
    env["SUPABASE_ANON_KEY"] ||
      env["SUPABASE_PUBLISHABLE_KEY"] ||
      env["NEXT_PUBLIC_SUPABASE_ANON_KEY"] ||
      env["NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY"] ||
      env["VITE_SUPABASE_ANON_KEY"],
  );
  // Strictly server-only env var for service role key (never read from VITE_*)
  const serviceRoleKey = stripQuotesAndWhitespace(env["SUPABASE_SERVICE_ROLE_KEY"]);

  if (!rawUrl || !rawAnonKey) {
    return {
      config: null,
      error: "Supabase environment variables (SUPABASE_URL, SUPABASE_ANON_KEY) are not configured.",
    };
  }

  // Catch swapped URL and key
  if (rawUrl.startsWith("eyJ") || rawUrl.startsWith("sb_") || /^https?:\/\//i.test(rawAnonKey)) {
    logSupabaseDiagnostic("error", "config_swapped", {
      urlLooksLikeKey: rawUrl.startsWith("eyJ") || rawUrl.startsWith("sb_"),
      keyLooksLikeUrl: /^https?:\/\//i.test(rawAnonKey),
    });
    return {
      config: null,
      error:
        "SUPABASE_URL and SUPABASE_ANON_KEY appear to be swapped or malformed in your environment variables.",
    };
  }

  const candidateUrl = /^https?:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`;
  let parsed: URL;
  try {
    parsed = new URL(candidateUrl);
  } catch {
    logSupabaseDiagnostic("error", "config_invalid_url", { hasUrl: true });
    return {
      config: null,
      error: "SUPABASE_URL is malformed. Expected format: https://<project-ref>.supabase.co",
    };
  }

  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    return {
      config: null,
      error: "SUPABASE_URL must use http:// or https://.",
    };
  }

  if (parsed.hostname === "supabase.com" && parsed.pathname.includes("/dashboard/project/")) {
    logSupabaseDiagnostic("error", "config_dashboard_url", { host: parsed.host });
    return {
      config: null,
      error:
        "SUPABASE_URL is set to your Supabase Dashboard URL instead of your Project API URL (https://<project-ref>.supabase.co).",
    };
  }

  // Normalize to clean origin so extra subpaths (e.g. /rest/v1 or /auth/v1) never duplicate in SDK URLs
  const cleanPathname = parsed.pathname.replace(/\/+$/, "");
  const urlHadExtraPath = Boolean(cleanPathname && cleanPathname !== "/");
  const normalizedUrl = parsed.origin;
  const keyKind = classifySupabaseKey(rawAnonKey);

  if (urlHadExtraPath) {
    logSupabaseDiagnostic("warn", "url_path_normalized", {
      host: parsed.host,
      strippedPath: cleanPathname,
      keyKind,
    });
  }

  return {
    config: {
      url: normalizedUrl,
      anonKey: rawAnonKey,
      serviceRoleKey,
      keyKind,
      urlHadExtraPath,
    },
  };
}

function isLocalDevServer(env: Record<string, string | undefined>): boolean {
  return (
    env["NODE_ENV"] === "development" &&
    !env["VERCEL"] &&
    !env["CF_PAGES"] &&
    !env["CLOUDFLARE_ENV"]
  );
}

/**
 * Custom fetch wrapper for Supabase requests:
 * 1. Bypasses stale runtime fetch caching (`cache: "no-store"`) safely across Node and Edge runtimes.
 * 2. Strips `Authorization: Bearer <sb_publishable_...>` injected by `@supabase/supabase-js` AuthClient
 *    for non-JWT publishable keys, keeping `apikey` intact and preserving real user session JWTs.
 */
export function createSafeSupabaseFetch(
  apiKey: string,
  baseFetch: typeof fetch = fetch,
): typeof fetch {
  const nonJwtKey = isNonJwtSupabaseKey(apiKey);

  return async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const headers = new Headers(init?.headers);
    if (nonJwtKey) {
      const authHeader = headers.get("Authorization");
      if (authHeader && authHeader === `Bearer ${apiKey}`) {
        headers.delete("Authorization");
      }
    }

    const requestInit: RequestInit = {
      ...init,
      headers,
      cache: "no-store",
    };

    try {
      return await baseFetch(input, requestInit);
    } catch (err) {
      // Some edge runtimes (e.g. Cloudflare Workers) reject `cache: "no-store"` in RequestInit
      if (
        err instanceof TypeError &&
        err.message.toLowerCase().includes("cache")
      ) {
        const { cache: _ignored, ...fallbackInit } = requestInit;
        return baseFetch(input, fallbackInit);
      }
      throw err;
    }
  };
}

function createAnonSupabaseClient(config: SupabaseServerConfig): SupabaseClient {
  return createClient(config.url, config.anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      fetch: createSafeSupabaseFetch(config.anonKey),
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
      fetch: createSafeSupabaseFetch(config.anonKey),
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

  if (error) {
    logSupabaseDiagnostic("warn", "admin_table_check_failed", {
      host: new URL(config.url).host,
      code: error.code,
      message: error.message,
    });
  }

  // Fallback check via service-role if RLS read on admin_users wasn't configured
  if (config.serviceRoleKey) {
    const serviceClient = createClient(config.url, config.serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { fetch: createSafeSupabaseFetch(config.serviceRoleKey) },
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
    const resolved = resolveSupabaseServerConfig(env);
    if (!resolved.config) {
      return {
        backend: isLocalDevServer(env) ? "local" : "none",
        supabaseConfigured: false,
        hasPublishedRow: false,
        ...(resolved.error ? { diagnostic: resolved.error } : {}),
      };
    }

    const config = resolved.config;
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
      if (error) {
        logSupabaseDiagnostic("warn", "status_query_error", {
          host: new URL(config.url).host,
          keyKind: config.keyKind,
          code: error.code,
          message: error.message,
        });
      }
      return {
        backend: "supabase-empty",
        supabaseConfigured: true,
        hasPublishedRow: false,
        ...(error ? { diagnostic: error.message } : {}),
      };
    } catch (err) {
      return {
        backend: "supabase-empty",
        supabaseConfigured: true,
        hasPublishedRow: false,
        diagnostic: err instanceof Error ? err.message : "Failed to reach Supabase",
      };
    }
  },
);

export const getRemotePortfolioDataFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ data: PortfolioData | null; source: CloudBackend }> => {
    const env = getEnv();
    const { config } = resolveSupabaseServerConfig(env);

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
        if (error) {
          logSupabaseDiagnostic("warn", "public_read_error", {
            host: new URL(config.url).host,
            keyKind: config.keyKind,
            code: error.code,
            message: error.message,
          });
        }
        return { data: null, source: "supabase-empty" };
      } catch (err) {
        logSupabaseDiagnostic("error", "public_read_exception", {
          host: new URL(config.url).host,
          message: err instanceof Error ? err.message : "Unknown error",
        });
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
    const resolved = resolveSupabaseServerConfig();
    if (!resolved.config) {
      return {
        authenticated: false,
        email: null,
        supabaseConfigured: false,
        reason: resolved.error || "Supabase environment variables are not configured.",
      };
    }

    const session = await resolveAuthenticatedAdmin(resolved.config);
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
      const resolved = resolveSupabaseServerConfig();
      if (!resolved.config) {
        return {
          ok: false,
          message:
            resolved.error ||
            "Supabase is not configured. Add SUPABASE_URL and SUPABASE_ANON_KEY to your environment variables.",
        };
      }

      const config = resolved.config;
      const email = (data?.email || "").trim();
      const password = data?.password || "";
      if (!email || !password) {
        return { ok: false, message: "Please enter both email and password." };
      }

      const host = new URL(config.url).host;
      logSupabaseDiagnostic("info", "admin_login_attempt", {
        host,
        keyKind: config.keyKind,
        urlHadExtraPath: config.urlHadExtraPath,
      });

      const supabase = createAnonSupabaseClient(config);
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error || !authData.session || !authData.user) {
        logSupabaseDiagnostic("error", "admin_login_failed", {
          host,
          keyKind: config.keyKind,
          status: error?.status ?? null,
          code: error?.code ?? null,
          message: error?.message ?? "Missing session or user",
        });

        const rawMessage = error?.message || "Invalid email or password.";
        const hint =
          rawMessage.toLowerCase().includes("invalid path specified")
            ? " (Check that SUPABASE_URL is your root project URL https://<project-ref>.supabase.co with no extra path segments.)"
            : "";

        return {
          ok: false,
          message: `${rawMessage}${hint}`,
        };
      }

      const isAdmin = await verifyUserIsAdmin(
        config,
        authData.session.access_token,
        authData.user.id,
      );

      if (!isAdmin) {
        clearAuthCookies();
        logSupabaseDiagnostic("warn", "admin_login_not_in_allowlist", { host });
        return {
          ok: false,
          message:
            "Account authenticated, but this email is not listed in public.admin_users. Add your user to public.admin_users in Supabase SQL Editor.",
        };
      }

      writeAuthCookies(authData.session.access_token, authData.session.refresh_token);
      logSupabaseDiagnostic("info", "admin_login_success", { host });

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
    const resolved = resolveSupabaseServerConfig();
    if (!resolved.config) {
      return { ok: false, message: resolved.error || "Supabase is not configured." };
    }

    const config = resolved.config;
    const newPassword = (data?.newPassword || "").trim();
    if (newPassword.length < 8) {
      return { ok: false, message: "Password must be at least 8 characters long." };
    }

    const admin = await resolveAuthenticatedAdmin(config);
    if (!admin.ok || !admin.accessToken) {
      return { ok: false, message: admin.reason || "Unauthorized." };
    }

    const res = await createSafeSupabaseFetch(config.anonKey)(`${config.url}/auth/v1/user`, {
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
    const resolved = resolveSupabaseServerConfig();
    if (!resolved.config) {
      return {
        ok: false,
        backend: "none",
        reason: "SUPABASE_NOT_CONFIGURED",
        message:
          resolved.error ||
          "Supabase is not configured on the server. Add SUPABASE_URL and SUPABASE_ANON_KEY to Vercel Environment Variables.",
      };
    }

    const config = resolved.config;
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

    const authedClient = createAuthedSupabaseClient(config, admin.accessToken);
    const { data: savedRow, error } = await authedClient
      .from(PORTFOLIO_TABLE)
      .upsert(rowPayload, { onConflict: "id" })
      .select(
        "id, profile, about, skills, projects, experience, education, certifications, contact, footer, updated_at",
      )
      .single();

    if (error || !savedRow) {
      logSupabaseDiagnostic("error", "portfolio_upsert_failed", {
        host: new URL(config.url).host,
        code: error?.code ?? null,
        message: error?.message ?? "No saved row returned",
      });
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

    logSupabaseDiagnostic("info", "portfolio_upsert_success", {
      host: new URL(config.url).host,
    });
    const mapped = mapRowToPortfolioData(savedRow as PortfolioSiteRow);
    return {
      ok: true,
      backend: "supabase",
      data: mapped,
      message: "Published live to Supabase! All browsers & devices now show your updates immediately.",
    };
  });
