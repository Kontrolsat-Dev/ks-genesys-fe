// src/lib/http-client.ts
import { authStore } from "./auth-store";

export type TokenProvider = () => string | null;

export type QueryParamValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | Array<string | number | boolean | null | undefined>;

export type RequestOptions = Omit<RequestInit, "body" | "method"> & {
  params?: Record<string, QueryParamValue>;
  skipRefresh?: boolean; // para evitar loop infinito
};

export type HttpClientOptions = {
  baseUrl: string;
  token?: TokenProvider;
  headers?: Record<string, string>;
  timeoutMs?: number;
  onRefreshFailed?: () => void;
};

// Flag para evitar múltiplos refreshes simultâneos
let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

async function doRefresh(baseUrl: string): Promise<boolean> {
  const refreshToken = authStore.getRefresh();
  if (!refreshToken) return false;

  try {
    const res = await fetch(`${baseUrl}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!res.ok) return false;

    const data = await res.json();
    authStore.set(data.access_token);
    authStore.setRefresh(data.refresh_token);
    return true;
  } catch {
    return false;
  }
}

export class HttpClient {
  constructor(private opts: HttpClientOptions) {}

  private buildUrl(path: string, params?: RequestOptions["params"]): string {
    const base = this.opts.baseUrl.endsWith("/")
      ? this.opts.baseUrl
      : this.opts.baseUrl + "/";
    const url = path.startsWith("http") ? new URL(path) : new URL(path, base);

    if (params) {
      for (const [key, val] of Object.entries(params)) {
        if (val == null) continue;
        if (Array.isArray(val)) {
          for (const v of val) {
            if (v == null) continue;
            url.searchParams.append(key, String(v));
          }
        } else {
          url.searchParams.set(key, String(val));
        }
      }
    }
    return url.toString();
  }

  private async request<T>(
    path: string,
    init?: RequestOptions & { method?: string; body?: unknown }
  ): Promise<T> {
    const url = this.buildUrl(path, init?.params);

    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      this.opts.timeoutMs ?? 15000
    );

    const token = this.opts.token?.();
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...(this.opts.headers ?? {}),
      ...(init?.headers ?? {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    const fetchInit: RequestInit = {
      method: init?.method ?? "GET",
      headers,
      signal: controller.signal,
      body:
        init?.body !== undefined
          ? typeof init.body === "string"
            ? init.body
            : JSON.stringify(init.body)
          : undefined,
    };

    const res = await fetch(url, fetchInit).finally(() =>
      clearTimeout(timeout)
    );

    const isJson = res.headers
      .get("content-type")
      ?.includes("application/json");
    const body = isJson ? await res.json().catch(() => ({})) : await res.text();

    // Auto-refresh on 401
    if (res.status === 401 && !init?.skipRefresh) {
      // Evitar múltiplos refreshes simultâneos
      if (!isRefreshing) {
        isRefreshing = true;
        refreshPromise = doRefresh(this.opts.baseUrl);
      }

      const refreshed = await refreshPromise;
      isRefreshing = false;
      refreshPromise = null;

      if (refreshed) {
        // Retry com novo token
        return this.request<T>(path, { ...init, skipRefresh: true });
      } else {
        // Refresh falhou - limpar tokens e notificar
        authStore.clear();
        this.opts.onRefreshFailed?.();
        throw new HttpError(401, body);
      }
    }

    if (!res.ok) throw new HttpError(res.status, body);
    return body as T;
  }

  get<T>(p: string, init?: RequestOptions) {
    return this.request<T>(p, { method: "GET", ...(init || {}) });
  }
  post<T>(p: string, body?: unknown, init?: RequestOptions) {
    return this.request<T>(p, { method: "POST", body, ...(init || {}) });
  }
  put<T>(p: string, body?: unknown, init?: RequestOptions) {
    return this.request<T>(p, { method: "PUT", body, ...(init || {}) });
  }
  patch<T>(p: string, body?: unknown, init?: RequestOptions) {
    return this.request<T>(p, { method: "PATCH", body, ...(init || {}) });
  }
  delete<T>(p: string, init?: RequestOptions) {
    return this.request<T>(p, { method: "DELETE", ...(init || {}) });
  }
}

export class HttpError extends Error {
  constructor(public status: number, public data: unknown) {
    super(`HTTP ${status}`);
  }
}

