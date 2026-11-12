import { describe, expect, it, vi } from "vitest";
import {
  classifySupabaseKey,
  createSafeSupabaseFetch,
  resolveSupabaseServerConfig,
} from "@/lib/portfolio-server";

describe("resolveSupabaseServerConfig", () => {
  it("normalizes clean Supabase URL and recognizes sb_publishable_ keys", () => {
    const res = resolveSupabaseServerConfig({
      SUPABASE_URL: "https://demo1234.supabase.co/",
      SUPABASE_ANON_KEY: "sb_publishable_dummy_key_12345",
    });

    expect(res.error).toBeUndefined();
    expect(res.config).toEqual({
      url: "https://demo1234.supabase.co",
      anonKey: "sb_publishable_dummy_key_12345",
      serviceRoleKey: "",
      keyKind: "sb_publishable",
      urlHadExtraPath: false,
    });
  });

  it("strips accidental service subpaths like /rest/v1 or /auth/v1 to prevent PGRST125 URL errors", () => {
    const restRes = resolveSupabaseServerConfig({
      SUPABASE_URL: "https://demo1234.supabase.co/rest/v1",
      SUPABASE_ANON_KEY: "sb_publishable_dummy",
    });
    expect(restRes.config?.url).toBe("https://demo1234.supabase.co");
    expect(restRes.config?.urlHadExtraPath).toBe(true);

    const authRes = resolveSupabaseServerConfig({
      SUPABASE_URL: "https://demo1234.supabase.co/auth/v1/",
      SUPABASE_ANON_KEY: "sb_publishable_dummy",
    });
    expect(authRes.config?.url).toBe("https://demo1234.supabase.co");
    expect(authRes.config?.urlHadExtraPath).toBe(true);
  });

  it("strips surrounding quotes and whitespace and adds https:// if omitted", () => {
    const res = resolveSupabaseServerConfig({
      SUPABASE_URL: '  "demo1234.supabase.co/"  ',
      SUPABASE_ANON_KEY: " 'sb_publishable_dummy' ",
    });

    expect(res.config?.url).toBe("https://demo1234.supabase.co");
    expect(res.config?.anonKey).toBe("sb_publishable_dummy");
  });

  it("rejects Supabase Dashboard URLs with an actionable error message", () => {
    const res = resolveSupabaseServerConfig({
      SUPABASE_URL: "https://supabase.com/dashboard/project/demo1234",
      SUPABASE_ANON_KEY: "sb_publishable_dummy",
    });

    expect(res.config).toBeNull();
    expect(res.error).toContain("Dashboard URL");
  });

  it("detects swapped SUPABASE_URL and SUPABASE_ANON_KEY", () => {
    const res = resolveSupabaseServerConfig({
      SUPABASE_URL: "sb_publishable_dummy",
      SUPABASE_ANON_KEY: "https://demo1234.supabase.co",
    });

    expect(res.config).toBeNull();
    expect(res.error).toContain("swapped");
  });

  it("classifies JWT vs publishable keys accurately", () => {
    expect(classifySupabaseKey("sb_publishable_abc123")).toBe("sb_publishable");
    expect(classifySupabaseKey("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiJ9.sig")).toBe("jwt");
  });
});

describe("createSafeSupabaseFetch", () => {
  it("removes Authorization Bearer when it mirrors a sb_publishable_ key, while preserving apikey", async () => {
    const mockFetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    const safeFetch = createSafeSupabaseFetch("sb_publishable_test_key", mockFetch as unknown as typeof fetch);

    await safeFetch("https://demo.supabase.co/auth/v1/token?grant_type=password", {
      method: "POST",
      headers: {
        apikey: "sb_publishable_test_key",
        Authorization: "Bearer sb_publishable_test_key",
      },
    });

    const [, init] = mockFetch.mock.calls[0]!;
    const headers = init.headers as Headers;
    expect(headers.get("apikey")).toBe("sb_publishable_test_key");
    expect(headers.get("Authorization")).toBeNull();
  });

  it("preserves Authorization Bearer when carrying a real user JWT", async () => {
    const mockFetch = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }));
    const safeFetch = createSafeSupabaseFetch("sb_publishable_test_key", mockFetch as unknown as typeof fetch);

    await safeFetch("https://demo.supabase.co/rest/v1/admin_users", {
      headers: {
        apikey: "sb_publishable_test_key",
        Authorization: "Bearer eyJhbGciOiJIUzI1NiJ9.payload.sig",
      },
    });

    const [, init] = mockFetch.mock.calls[0]!;
    const headers = init.headers as Headers;
    expect(headers.get("apikey")).toBe("sb_publishable_test_key");
    expect(headers.get("Authorization")).toBe("Bearer eyJhbGciOiJIUzI1NiJ9.payload.sig");
  });

  it("falls back cleanly when a runtime rejects RequestInit.cache", async () => {
    const mockFetch = vi
      .fn()
      .mockRejectedValueOnce(new TypeError("The 'cache' field on 'RequestInitializerDict' is not implemented."))
      .mockResolvedValueOnce(new Response("{}", { status: 200 }));

    const safeFetch = createSafeSupabaseFetch("sb_publishable_test_key", mockFetch as unknown as typeof fetch);
    const res = await safeFetch("https://demo.supabase.co/rest/v1/portfolio_site");

    expect(res.status).toBe(200);
    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(mockFetch.mock.calls[1]![1].cache).toBeUndefined();
  });
});

