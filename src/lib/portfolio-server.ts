import { createServerFn } from "@tanstack/react-start";
import { normalizePortfolioData, type PortfolioData } from "./portfolio-shared";

const DEFAULT_GITHUB_REPO = "Banupriya0811/banu_portfolio";
const DEFAULT_GITHUB_BRANCH = "main";
const GITHUB_DATA_PATH = "public/portfolio-data.json";
const KV_DATA_KEY = "banupriya_portfolio_data";
const KV_PASSCODE_KEY = "banupriya_admin_passcode";

export type CloudBackend = "kv" | "github" | "local" | "none";

export interface CloudSyncStatus {
  backend: CloudBackend;
  hasServerKv: boolean;
  hasServerGithub: boolean;
  repo: string;
  branch: string;
}

export interface SaveRemoteResult {
  ok: boolean;
  backend: CloudBackend;
  data?: PortfolioData;
  message: string;
  reason?: "UNAUTHORIZED" | "NO_CLOUD_BACKEND" | "GITHUB_ERROR" | "KV_ERROR";
}

function getEnv(): Record<string, string | undefined> {
  if (typeof process !== "undefined" && process.env) {
    return process.env;
  }
  return {};
}

function getKvCredentials(env: Record<string, string | undefined>) {
  const url = (env["KV_REST_API_URL"] || env["UPSTASH_REDIS_REST_URL"] || "").replace(/\/+$/, "");
  const token = env["KV_REST_API_TOKEN"] || env["UPSTASH_REDIS_REST_TOKEN"] || "";
  return url && token ? { url, token } : null;
}

function getGitHubTarget(
  env: Record<string, string | undefined>,
  override?: {
    token?: string | undefined;
    repo?: string | undefined;
    branch?: string | undefined;
  },
) {
  const token = (override?.token || env["GITHUB_TOKEN"] || "").trim();
  const repo = (override?.repo || env["GITHUB_REPO"] || DEFAULT_GITHUB_REPO).trim();
  const branch = (override?.branch || env["GITHUB_BRANCH"] || DEFAULT_GITHUB_BRANCH).trim();
  return { token, repo, branch };
}

function isLocalDevServer(env: Record<string, string | undefined>): boolean {
  return (
    env["NODE_ENV"] === "development" &&
    !env["VERCEL"] &&
    !env["CF_PAGES"] &&
    !env["CLOUDFLARE_ENV"]
  );
}

function utf8ToBase64(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    const code = bytes[i];
    if (code !== undefined) {
      binary += String.fromCharCode(code);
    }
  }
  return btoa(binary);
}

async function kvCommand<T = unknown>(
  kv: { url: string; token: string },
  args: string[],
): Promise<T | null> {
  const res = await fetch(kv.url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${kv.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(args),
    cache: "no-store",
  });
  if (!res.ok) return null;
  const payload = (await res.json()) as { result?: T };
  return payload.result ?? null;
}

async function readFromKv(kv: { url: string; token: string }): Promise<PortfolioData | null> {
  try {
    const raw = await kvCommand<string>(kv, ["GET", KV_DATA_KEY]);
    if (!raw || typeof raw !== "string") return null;
    return normalizePortfolioData(JSON.parse(raw));
  } catch {
    return null;
  }
}

async function readFromGitHub(
  repo: string,
  branch: string,
  token?: string,
): Promise<PortfolioData | null> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.raw+json",
    "User-Agent": "banu-portfolio-app",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(
      `https://api.github.com/repos/${repo}/contents/${GITHUB_DATA_PATH}?ref=${encodeURIComponent(branch)}`,
      {
        headers,
        cache: "no-store",
        signal: AbortSignal.timeout(3500),
      },
    );
    if (res.ok) {
      const json = await res.json();
      return normalizePortfolioData(json);
    }
  } catch {
    // Fall through to raw URL below
  }

  try {
    const rawRes = await fetch(
      `https://raw.githubusercontent.com/${repo}/${encodeURIComponent(branch)}/${GITHUB_DATA_PATH}?t=${Date.now()}`,
      {
        cache: "no-store",
        signal: AbortSignal.timeout(2500),
      },
    );
    if (rawRes.ok) {
      const json = await rawRes.json();
      return normalizePortfolioData(json);
    }
  } catch {
    // Ignore unreachable network / private repo
  }

  return null;
}

async function writeToGitHub(
  target: { token: string; repo: string; branch: string },
  data: PortfolioData,
): Promise<{ ok: boolean; error?: string }> {
  const baseUrl = `https://api.github.com/repos/${target.repo}/contents/${GITHUB_DATA_PATH}`;
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${target.token}`,
    "User-Agent": "banu-portfolio-app",
    "Content-Type": "application/json",
  };

  let sha: string | undefined;
  try {
    const existing = await fetch(`${baseUrl}?ref=${encodeURIComponent(target.branch)}`, {
      headers,
      cache: "no-store",
    });
    if (existing.ok) {
      const meta = (await existing.json()) as { sha?: string };
      sha = meta.sha;
    } else if (existing.status !== 404) {
      const errBody = await existing.text();
      return { ok: false, error: `GitHub read failed (${existing.status}): ${errBody.slice(0, 140)}` };
    }
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to connect to GitHub API",
    };
  }

  const content = utf8ToBase64(`${JSON.stringify(data, null, 2)}\n`);
  const putRes = await fetch(baseUrl, {
    method: "PUT",
    headers,
    body: JSON.stringify({
      message: "chore(admin): publish portfolio updates",
      content,
      branch: target.branch,
      ...(sha ? { sha } : {}),
    }),
  });

  if (!putRes.ok) {
    const errText = await putRes.text();
    return {
      ok: false,
      error: `GitHub update failed (${putRes.status}): ${errText.slice(0, 160)}`,
    };
  }

  return { ok: true };
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

async function writeLocalDevFile(data: PortfolioData): Promise<boolean> {
  try {
    const fs = await import(/* @vite-ignore */ "node:fs/promises");
    const path = await import(/* @vite-ignore */ "node:path");
    const filePath = path.join(process.cwd(), "public", "portfolio-data.json");
    await fs.writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
    return true;
  } catch {
    return false;
  }
}

async function resolveExpectedServerPasscode(
  env: Record<string, string | undefined>,
  kv: { url: string; token: string } | null,
): Promise<{ expected: string; serverManaged: boolean }> {
  const envPasscode = env["ADMIN_PASSCODE"];
  if (envPasscode && envPasscode.trim()) {
    return { expected: envPasscode.trim(), serverManaged: true };
  }
  if (kv) {
    try {
      const kvPass = await kvCommand<string>(kv, ["GET", KV_PASSCODE_KEY]);
      if (kvPass && typeof kvPass === "string" && kvPass.trim()) {
        return { expected: kvPass.trim(), serverManaged: true };
      }
    } catch {
      // Ignore
    }
  }
  return { expected: "admin123", serverManaged: false };
}

export const getCloudSyncStatusFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<CloudSyncStatus> => {
    const env = getEnv();
    const kv = getKvCredentials(env);
    const gh = getGitHubTarget(env);
    const local = isLocalDevServer(env);

    const backend: CloudBackend = kv
      ? "kv"
      : gh.token
        ? "github"
        : local
          ? "local"
          : "none";

    return {
      backend,
      hasServerKv: Boolean(kv),
      hasServerGithub: Boolean(gh.token),
      repo: gh.repo,
      branch: gh.branch,
    };
  },
);

export const getRemotePortfolioDataFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ data: PortfolioData | null; source: CloudBackend }> => {
    const env = getEnv();
    const kv = getKvCredentials(env);

    if (kv) {
      const kvData = await readFromKv(kv);
      if (kvData) {
        return { data: kvData, source: "kv" };
      }
    }

    const gh = getGitHubTarget(env);
    const localData = isLocalDevServer(env) ? await readLocalDevFile() : null;
    const ghData = await readFromGitHub(gh.repo, gh.branch, gh.token);

    if (localData && ghData) {
      return (localData.updatedAt || 0) >= (ghData.updatedAt || 0)
        ? { data: localData, source: "local" }
        : { data: ghData, source: "github" };
    }

    if (ghData) return { data: ghData, source: "github" };
    if (localData) return { data: localData, source: "local" };

    return { data: null, source: "none" };
  },
);

export const verifyAdminPasscodeFn = createServerFn({ method: "POST" })
  .validator((input: unknown) => input as { passcode: string })
  .handler(async ({ data }): Promise<{ valid: boolean; serverManaged: boolean }> => {
    const env = getEnv();
    const kv = getKvCredentials(env);
    const { expected, serverManaged } = await resolveExpectedServerPasscode(env, kv);
    return {
      valid: (data?.passcode || "").trim() === expected,
      serverManaged,
    };
  });

export const updateRemotePasscodeFn = createServerFn({ method: "POST" })
  .validator((input: unknown) => input as { currentPasscode: string; newPasscode: string })
  .handler(async ({ data }): Promise<{ ok: boolean; syncedToKv: boolean; message: string }> => {
    const env = getEnv();
    const kv = getKvCredentials(env);
    const nextPass = (data?.newPasscode || "").trim();

    if (nextPass.length < 4) {
      return { ok: false, syncedToKv: false, message: "Passcode must be at least 4 characters." };
    }

    if (env["ADMIN_PASSCODE"]) {
      return {
        ok: false,
        syncedToKv: false,
        message: "Passcode is managed via ADMIN_PASSCODE environment variable on the server.",
      };
    }

    if (!kv) {
      return {
        ok: true,
        syncedToKv: false,
        message: "Passcode updated in this browser.",
      };
    }

    const { expected } = await resolveExpectedServerPasscode(env, kv);
    if ((data?.currentPasscode || "").trim() !== expected) {
      return { ok: false, syncedToKv: false, message: "Current passcode is incorrect." };
    }

    const res = await kvCommand(kv, ["SET", KV_PASSCODE_KEY, nextPass]);
    return res
      ? { ok: true, syncedToKv: true, message: "Admin passcode synced globally!" }
      : { ok: false, syncedToKv: false, message: "Failed to save passcode to cloud database." };
  });

export const saveRemotePortfolioDataFn = createServerFn({ method: "POST" })
  .validator(
    (input: unknown) =>
      input as {
        data: PortfolioData;
        passcode?: string | undefined;
        githubToken?: string | undefined;
        githubRepo?: string | undefined;
        githubBranch?: string | undefined;
      },
  )
  .handler(async ({ data: input }): Promise<SaveRemoteResult> => {
    const env = getEnv();
    const kv = getKvCredentials(env);
    const gh = getGitHubTarget(env, {
      token: input.githubToken,
      repo: input.githubRepo,
      branch: input.githubBranch,
    });

    const { expected, serverManaged } = await resolveExpectedServerPasscode(env, kv);
    const providedPass = (input.passcode || "").trim();
    const hasCustomGithubToken = Boolean(input.githubToken?.trim());

    if (serverManaged && providedPass !== expected) {
      return {
        ok: false,
        backend: "none",
        reason: "UNAUTHORIZED",
        message: "Incorrect admin passcode.",
      };
    }

    if (!serverManaged && providedPass !== expected && !hasCustomGithubToken) {
      return {
        ok: false,
        backend: "none",
        reason: "UNAUTHORIZED",
        message: "Incorrect admin passcode.",
      };
    }

    const stamped: PortfolioData = {
      ...normalizePortfolioData(input.data),
      updatedAt: Date.now(),
    };

    if (kv) {
      try {
        const res = await kvCommand(kv, ["SET", KV_DATA_KEY, JSON.stringify(stamped)]);
        if (res !== null) {
          // Best-effort secondary mirror to GitHub if token is also configured
          if (gh.token) {
            await writeToGitHub(gh, stamped).catch(() => {});
          }
          return {
            ok: true,
            backend: "kv",
            data: stamped,
            message: "Published live! All browsers & devices now show your updates immediately.",
          };
        }
      } catch {
        // Fall through to GitHub if KV write fails
      }
      if (!gh.token) {
        return {
          ok: false,
          backend: "kv",
          reason: "KV_ERROR",
          message: "Cloud database write failed. Please check KV credentials.",
        };
      }
    }

    if (gh.token) {
      const ghRes = await writeToGitHub(gh, stamped);
      if (ghRes.ok) {
        return {
          ok: true,
          backend: "github",
          data: stamped,
          message:
            "Published to GitHub! All browsers & devices will now see your updates (Vercel rebuild completes in ~30s).",
        };
      }
      return {
        ok: false,
        backend: "github",
        reason: "GITHUB_ERROR",
        message: ghRes.error || "Failed to publish to GitHub.",
      };
    }

    if (isLocalDevServer(env)) {
      const wrote = await writeLocalDevFile(stamped);
      if (wrote) {
        return {
          ok: true,
          backend: "local",
          data: stamped,
          message: "Saved to local public/portfolio-data.json (visible across local browsers).",
        };
      }
    }

    return {
      ok: false,
      backend: "none",
      reason: "NO_CLOUD_BACKEND",
      data: stamped,
      message:
        "Saved in this browser only. Connect Cloud Sync in Settings so other browsers see your updates.",
    };
  });
