/**
 * Tiny, SSR-safe localStorage helpers. Every browser-side persistence
 * key in this app should flow through these helpers (and live in
 * STORAGE_KEYS below) so we have one place to:
 *   - tolerate SSR / private-mode access errors,
 *   - JSON.parse with a fallback instead of crashing,
 *   - track every namespace the app writes under `sudocode:*`.
 */

export const STORAGE_KEYS = {
  tracker: "sudocode:tracker:v2",
  labChat: "sudocode:chat:v1",
  workspaceLayout: (slug: string) => `sudocode:layout:${slug}`,
  labComplete: (slug: string) => `sudocode:lab:complete:${slug}`,
} as const;

function safeStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

/** Read a raw string key, returning null on SSR or quota/permission errors. */
export function readString(key: string): string | null {
  const storage = safeStorage();
  if (!storage) return null;
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
}

/** Write a raw string key, swallowing SSR/quota errors. */
export function writeString(key: string, value: string): void {
  const storage = safeStorage();
  if (!storage) return;
  try {
    storage.setItem(key, value);
  } catch {
    /* quota or permission — best effort */
  }
}

/** Read + JSON.parse, returning fallback on missing/corrupt/SSR. */
export function readJSON<T>(key: string, fallback: T): T {
  const raw = readString(key);
  if (raw === null) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/** JSON.stringify + write. Swallows serialization errors. */
export function writeJSON<T>(key: string, value: T): void {
  try {
    writeString(key, JSON.stringify(value));
  } catch {
    /* circular / unserializable — best effort */
  }
}
