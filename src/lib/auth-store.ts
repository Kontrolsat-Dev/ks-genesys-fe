// src/lib/auth-store.ts
type Listener = (token: string | null) => void;

const ACCESS_KEY = "auth_token";
const REFRESH_KEY = "auth_refresh_token";

// rehidratar de forma síncrona ao carregar o módulo
let _token: string | null = (() => {
  try {
    return localStorage.getItem(ACCESS_KEY);
  } catch {
    return null;
  }
})();

let _refreshToken: string | null = (() => {
  try {
    return localStorage.getItem(REFRESH_KEY);
  } catch {
    return null;
  }
})();

const listeners = new Set<Listener>();

// manter várias tabs sincronizadas
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === ACCESS_KEY) {
      _token = e.newValue;
      listeners.forEach((fn) => fn(_token));
    }
    if (e.key === REFRESH_KEY) {
      _refreshToken = e.newValue;
    }
  });
}

export const authStore = {
  get: () => _token,
  set: (t: string | null) => {
    _token = t;
    try {
      if (t) localStorage.setItem(ACCESS_KEY, t);
      else localStorage.removeItem(ACCESS_KEY);
    } catch {}
    listeners.forEach((fn) => fn(_token));
  },
  getRefresh: () => _refreshToken,
  setRefresh: (t: string | null) => {
    _refreshToken = t;
    try {
      if (t) localStorage.setItem(REFRESH_KEY, t);
      else localStorage.removeItem(REFRESH_KEY);
    } catch {}
  },
  clear: () => {
    authStore.set(null);
    authStore.setRefresh(null);
  },
  subscribe: (fn: Listener) => {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
};

