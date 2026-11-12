import { useState, useEffect, useCallback } from "react";
import {
  DEFAULT_PORTFOLIO_DATA,
  normalizePortfolioData,
  type PortfolioData,
  type ProjectItem,
  type SkillCategory,
  type ExperienceItem,
  type EducationItem,
  type CertificationItem,
} from "./portfolio-shared";
import {
  getCloudSyncStatusFn,
  getRemotePortfolioDataFn,
  saveRemotePortfolioDataFn,
  type CloudSyncStatus,
  type SaveRemoteResult,
} from "./portfolio-server";

export {
  DEFAULT_PORTFOLIO_DATA,
  normalizePortfolioData,
  type PortfolioData,
  type ProjectItem,
  type SkillCategory,
  type ExperienceItem,
  type EducationItem,
  type CertificationItem,
};

const STORAGE_KEYS = [
  "banupriya_portfolio_data_v4",
  "banupriya_portfolio_data_v3",
  "banupriya_portfolio_data_v2",
  "banupriya_portfolio_data",
];

const GITHUB_SYNC_CONFIG_KEY = "banupriya_admin_github_sync";

export interface GitHubSyncConfig {
  token: string;
  repo: string;
  branch: string;
}

export function getSavedGitHubSyncConfig(): GitHubSyncConfig {
  const fallback: GitHubSyncConfig = {
    token: "",
    repo: "Banupriya0811/banu_portfolio",
    branch: "main",
  };
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(GITHUB_SYNC_CONFIG_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<GitHubSyncConfig>;
    return {
      token: parsed.token || "",
      repo: parsed.repo || fallback.repo,
      branch: parsed.branch || fallback.branch,
    };
  } catch {
    return fallback;
  }
}

export function saveGitHubSyncConfig(config: GitHubSyncConfig): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(GITHUB_SYNC_CONFIG_KEY, JSON.stringify(config));
}

export function clearGitHubSyncConfig(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(GITHUB_SYNC_CONFIG_KEY);
}

function readRawLocalStorage(): PortfolioData | null {
  if (typeof window === "undefined") return null;
  try {
    for (const key of STORAGE_KEYS) {
      const val = localStorage.getItem(key);
      if (val) {
        return normalizePortfolioData(JSON.parse(val));
      }
    }
    return null;
  } catch (e) {
    console.error("Failed to load portfolio data from localStorage:", e);
    return null;
  }
}

export function getStoredPortfolioData(): PortfolioData {
  return readRawLocalStorage() || DEFAULT_PORTFOLIO_DATA;
}

export function saveStoredPortfolioData(data: PortfolioData): void {
  if (typeof window === "undefined") return;
  try {
    const serialized = JSON.stringify(data);
    for (const key of STORAGE_KEYS) {
      localStorage.setItem(key, serialized);
    }
    window.dispatchEvent(new Event("portfolio_data_updated"));
  } catch (e) {
    console.error("Failed to save portfolio data to localStorage:", e);
  }
}

export function resetStoredPortfolioData(): void {
  if (typeof window === "undefined") return;
  for (const key of STORAGE_KEYS) {
    localStorage.removeItem(key);
  }
  window.dispatchEvent(new Event("portfolio_data_updated"));
}

async function fetchStaticPortfolioJson(): Promise<PortfolioData | null> {
  if (typeof window === "undefined") return null;
  try {
    const res = await fetch(`/portfolio-data.json?t=${Date.now()}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = await res.json();
    return normalizePortfolioData(json);
  } catch {
    return null;
  }
}

function pickNewestData(
  candidates: Array<PortfolioData | null | undefined>,
): PortfolioData {
  let winner: PortfolioData | null = null;
  for (const item of candidates) {
    if (!item) continue;
    if (!winner) {
      winner = item;
      continue;
    }
    if ((item.updatedAt || 0) > (winner.updatedAt || 0)) {
      winner = item;
    }
  }
  return winner || DEFAULT_PORTFOLIO_DATA;
}

export function usePortfolioData(initialData?: PortfolioData | null) {
  const [data, setData] = useState<PortfolioData>(
    initialData ? normalizePortfolioData(initialData) : DEFAULT_PORTFOLIO_DATA,
  );
  const [isLoaded, setIsLoaded] = useState(Boolean(initialData));
  const [isPublishing, setIsPublishing] = useState(false);
  const [cloudStatus, setCloudStatus] = useState<CloudSyncStatus & { checked: boolean }>({
    backend: "none",
    hasServerKv: false,
    hasServerGithub: false,
    repo: "Banupriya0811/banu_portfolio",
    branch: "main",
    checked: false,
  });

  const refreshCloudStatus = useCallback(async () => {
    try {
      const status = await getCloudSyncStatusFn();
      setCloudStatus({ ...status, checked: true });
    } catch {
      setCloudStatus((prev) => ({ ...prev, checked: true }));
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    // 1. Immediate fast hydrate from localStorage if available
    const localData = readRawLocalStorage();
    if (localData) {
      setData((current) => pickNewestData([current, localData]));
    }

    // 2. Fetch authoritative cloud / static portfolio data for cross-browser sync
    (async () => {
      const [remoteRes, staticJson] = await Promise.all([
        getRemotePortfolioDataFn().catch(() => ({ data: null, source: "none" as const })),
        fetchStaticPortfolioJson(),
      ]);

      if (cancelled) return;

      const remoteBest = pickNewestData([remoteRes.data, staticJson]);
      const latestLocal = readRawLocalStorage();

      // If remote has newer published timestamp (or user has no local edits yet), adopt remote
      const best =
        latestLocal && (latestLocal.updatedAt || 0) > (remoteBest.updatedAt || 0)
          ? latestLocal
          : remoteBest;

      setData(best);
      if ((best.updatedAt || 0) > 0 && best === remoteBest) {
        saveStoredPortfolioData(best);
      }
      setIsLoaded(true);
    })();

    const handleUpdate = () => {
      setData(getStoredPortfolioData());
    };

    window.addEventListener("portfolio_data_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      cancelled = true;
      window.removeEventListener("portfolio_data_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const updateData = (updater: (prev: PortfolioData) => PortfolioData) => {
    setData((current) => {
      const next = updater(current);
      const withTimestamp = { ...next, updatedAt: Date.now() };
      saveStoredPortfolioData(withTimestamp);
      return withTimestamp;
    });
  };

  const publishData = async (
    nextData: PortfolioData,
    options?: {
      passcode?: string | undefined;
      githubToken?: string | undefined;
      githubRepo?: string | undefined;
      githubBranch?: string | undefined;
    },
  ): Promise<SaveRemoteResult> => {
    setIsPublishing(true);
    const localTimestamped: PortfolioData = {
      ...normalizePortfolioData(nextData),
      updatedAt: Date.now(),
    };
    saveStoredPortfolioData(localTimestamped);
    setData(localTimestamped);

    try {
      const savedGh = getSavedGitHubSyncConfig();
      const result = await saveRemotePortfolioDataFn({
        data: {
          data: localTimestamped,
          passcode: options?.passcode || "admin123",
          githubToken: options?.githubToken ?? savedGh.token,
          githubRepo: options?.githubRepo ?? savedGh.repo,
          githubBranch: options?.githubBranch ?? savedGh.branch,
        },
      });

      if (result.ok && result.data) {
        saveStoredPortfolioData(result.data);
        setData(result.data);
      }
      await refreshCloudStatus();
      return result;
    } catch (err) {
      return {
        ok: false,
        backend: "none",
        data: localTimestamped,
        message:
          err instanceof Error
            ? `Saved locally, but cloud sync failed: ${err.message}`
            : "Saved locally, but cloud sync request failed.",
      };
    } finally {
      setIsPublishing(false);
    }
  };

  const resetData = () => {
    resetStoredPortfolioData();
    setData(DEFAULT_PORTFOLIO_DATA);
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `banupriya_portfolio_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importJson = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed || typeof parsed !== "object") return false;
      const merged: PortfolioData = {
        ...normalizePortfolioData(parsed),
        updatedAt: Date.now(),
      };
      saveStoredPortfolioData(merged);
      setData(merged);
      return true;
    } catch {
      return false;
    }
  };

  return {
    data,
    updateData,
    publishData,
    isPublishing,
    cloudStatus,
    refreshCloudStatus,
    resetData,
    exportJson,
    importJson,
    isLoaded,
  };
}
