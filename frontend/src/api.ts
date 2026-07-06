import { API_BASE_URL } from "./config/env";

export interface ErrorPayload {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface SuccessPayload {
  success: boolean;
  [key: string]: unknown;
}

export type ApiPayload = ErrorPayload | SuccessPayload;

export type ApiResult = ApiPayload & {
  ok: boolean;
  response: Response;
};

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

function clearTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

function setTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

function buildHeaders(init: RequestInit) {
  const headers = new Headers(init.headers);

  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const accessToken = getAccessToken();
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  return headers;
}

function buildUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return new URL(`${API_BASE_URL}${normalizedPath}`);
}

async function parsePayload(response: Response): Promise<ApiPayload> {
  const rawBody = await response.text();
  if (!rawBody) {
    return { success: response.ok };
  }

  return JSON.parse(rawBody) as ApiPayload;
}

async function refreshAccessToken() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    return false;
  }

  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Refresh-Token": refreshToken,
    },
  });

  if (!response.ok) {
    return false;
  }

  const payload = await response.json();
  if (!payload.accessToken || !payload.refreshToken) {
    return false;
  }

  setTokens(payload.accessToken, payload.refreshToken);
  return true;
}

function redirectToLogin() {
  clearTokens();
  window.location.href = "/login";
}

export const apiFetch = async (path: string, init: RequestInit = {}): Promise<ApiResult> => {
  const response = await fetch(buildUrl(path), {
    ...init,
    headers: buildHeaders(init),
  });

  const payload = await parsePayload(response);

  if (!payload.success && "error" in payload) {
    if (payload.error.code === "TOKEN_EXPIRED" && await refreshAccessToken()) {
      return apiFetch(path, init);
    }

    if (["TOKEN_EXPIRED", "TOKEN_MISSING", "TOKEN_INVALID"].includes(payload.error.code)) {
      redirectToLogin();
      return { ...payload, response, ok: false };
    }
  }

  if (Array.isArray(payload)) {
    return Object.assign(payload, { response, ok: response.ok }) as unknown as ApiResult;
  }

  return { ...payload, response, ok: response.ok };
};
