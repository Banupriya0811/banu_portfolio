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
  type CloudBackend,
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

// Clean up any legacy client-side GitHub token key if previously saved
const LEGACY_GITHUB_SYNC_KEY = "banupriya_admin_github_sync";

export function readExistingLocalPortfolioData(): PortfolioData | null {
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
  return readExistingLocalPortfolioData() || DEFAULT_PORTFOLIO_DATA;
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

function stripTimestampsForCompare(data: PortfolioData): string {
  const { updatedAt: _u, ...rest } = data;
  return JSON.stringify(rest);
}

export function usePortfolioData(initialData?: PortfolioData | null) {
  const [data, setData] = useState<PortfolioData>(
    initialData ? normalizePortfolioData(initialData) : DEFAULT_PORTFOLIO_DATA,
  );
  const [dataSource, setDataSource] = useState<CloudBackend>(
    initialData ? "supabase" : "none",
  );
  const [isLoaded, setIsLoaded] = useState(Boolean(initialData));
  const [isPublishing, setIsPublishing] = useState(false);
  const [lastPublishedAt, setLastPublishedAt] = useState<number | null>(
    initialData?.updatedAt || null,
  );
  const [localMigrationCandidate, setLocalMigrationCandidate] =
    useState<PortfolioData | null>(null);
  const [cloudStatus, setCloudStatus] = useState<CloudSyncStatus & { checked: boolean }>({
    backend: initialData ? "supabase" : "none",
    supabaseConfigured: Boolean(initialData),
    hasPublishedRow: Boolean(initialData),
    checked: false,
  });

  const refreshCloudStatus = useCallback(async () => {
    try {
      const status = await getCloudSyncStatusFn();
      setCloudStatus({ ...status, checked: true });
      return status;
    } catch {
      setCloudStatus((prev) => ({ ...prev, checked: true }));
      return null;
    }
  }, []);

  const refreshPortfolio = useCallback(async () => {
    const localSnapshot = readExistingLocalPortfolioData();
    const [remoteRes, staticJson, status] = await Promise.all([
      getRemotePortfolioDataFn().catch(() => ({ data: null, source: "none" as const })),
      fetchStaticPortfolioJson(),
      refreshCloudStatus(),
    ]);

    if (remoteRes.source === "supabase" && remoteRes.data) {
      // Supabase is authoritative for published site across all browsers
      setData(remoteRes.data);
      setDataSource("supabase");
      setLastPublishedAt(remoteRes.data.updatedAt || Date.now());

      // Check if this browser has differing localStorage edits ready to migrate
      if (
        localSnapshot &&
        stripTimestampsForCompare(localSnapshot) !==
          stripTimestampsForCompare(remoteRes.data)
      ) {
        setLocalMigrationCandidate(localSnapshot);
      } else {
        setLocalMigrationCandidate(null);
        saveStoredPortfolioData(remoteRes.data);
      }
    } else if (remoteRes.source === "supabase-empty") {
      // Supabase is connected, but no row published yet -> preserve localStorage for 1-click migration!
      setDataSource("supabase-empty");
      if (
        localSnapshot &&
        stripTimestampsForCompare(localSnapshot) !==
          stripTimestampsForCompare(DEFAULT_PORTFOLIO_DATA)
      ) {
        setLocalMigrationCandidate(localSnapshot);
        setData(localSnapshot);
      } else {
        setLocalMigrationCandidate(localSnapshot);
        setData(staticJson || DEFAULT_PORTFOLIO_DATA);
      }
    } else {
      // Offline / local fallback
      setDataSource(remoteRes.source);
      setData(localSnapshot || remoteRes.data || staticJson || DEFAULT_PORTFOLIO_DATA);
      if (localSnapshot) {
        setLocalMigrationCandidate(localSnapshot);
      }
    }

    if (status) {
      setCloudStatus({ ...status, checked: true });
    }
    setIsLoaded(true);
  }, [refreshCloudStatus]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(LEGACY_GITHUB_SYNC_KEY);
      } catch {
        // Ignore storage restrictions
      }
    }

    refreshPortfolio();

    const handleUpdate = () => {
      setData(getStoredPortfolioData());
    };

    window.addEventListener("portfolio_data_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener("portfolio_data_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, [refreshPortfolio]);

  const updateData = (updater: (prev: PortfolioData) => PortfolioData) => {
    setData((current) => {
      const next = updater(current);
      const withTimestamp = { ...next, updatedAt: Date.now() };
      saveStoredPortfolioData(withTimestamp);
      return withTimestamp;
    });
  };

  const publishData = async (nextData: PortfolioData): Promise<SaveRemoteResult> => {
    setIsPublishing(true);
    const localTimestamped: PortfolioData = {
      ...normalizePortfolioData(nextData),
      updatedAt: Date.now(),
    };
    saveStoredPortfolioData(localTimestamped);

    try {
      const result = await saveRemotePortfolioDataFn({
        data: {
          data: localTimestamped,
        },
      });

      if (result.ok && result.data) {
        saveStoredPortfolioData(result.data);
        setData(result.data);
        setDataSource("supabase");
        setLastPublishedAt(result.data.updatedAt || Date.now());
        setLocalMigrationCandidate(null);
      }
      await refreshCloudStatus();
      return result;
    } catch (err) {
      return {
        ok: false,
        backend: cloudStatus.backend,
        reason: "SUPABASE_ERROR",
        message:
          err instanceof Error
            ? `Failed to publish to Supabase: ${err.message}`
            : "Failed to publish changes to Supabase.",
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
    dataSource,
    updateData,
    publishData,
    isPublishing,
    lastPublishedAt,
    cloudStatus,
    localMigrationCandidate,
    clearLocalMigrationCandidate: () => setLocalMigrationCandidate(null),
    refreshPortfolio,
    refreshCloudStatus,
    resetData,
    exportJson,
    importJson,
    isLoaded,
  };
}
