const env = (import.meta as any).env ?? {};

export const API_BASE_URL = env.VITE_API_BASE_URL || env.VITE_BACKEND_API_URL || "http://localhost:3000/api";

export const ENV = {
  BACKEND_API_URL: API_BASE_URL,
} as const;
