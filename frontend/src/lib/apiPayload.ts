export function readArrayPayload<T>(payload: unknown, keys: string[] = ["data"]): T[] {
  if (Array.isArray(payload)) {
    return payload as T[];
  }

  if (!payload || typeof payload !== "object") {
    return [];
  }

  const record = payload as Record<string, unknown>;
  for (const key of keys) {
    if (Array.isArray(record[key])) {
      return record[key] as T[];
    }
  }

  return Object.values(record).filter((value) => {
    return value !== null && typeof value === "object" && "id" in (value as Record<string, unknown>);
  }) as T[];
}

export function assertOk(response: { ok: boolean }, message: string) {
  if (!response.ok) {
    throw new Error(message);
  }
}
