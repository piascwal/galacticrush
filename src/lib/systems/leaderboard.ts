import type { LeaderboardEntry } from '../data/types';

// `window.storage` : API de stockage cloud partagé optionnelle, fournie par
// certains environnements d'hébergement (absente sur un déploiement statique
// classique type GitHub Pages — le classement retombe alors sur localStorage,
// local à l'appareil).
interface CloudStorage {
  get(key: string, shared?: boolean): Promise<{ value: string } | null>;
  set(key: string, value: string, shared?: boolean): Promise<void>;
}
declare global {
  interface Window {
    storage?: CloudStorage;
  }
}

const LB_LOCAL_KEY = 'galactic_harvest_leaderboard';

export const hasCloudStorage = typeof window !== 'undefined' && typeof window.storage?.get === 'function';

export const hasLocalStorage = (() => {
  try {
    window.localStorage.setItem('__gh_test__', '1');
    window.localStorage.removeItem('__gh_test__');
    return true;
  } catch {
    return false;
  }
})();

export const leaderboardAvailable = hasCloudStorage || hasLocalStorage;

function isLeaderboardEntry(value: unknown): value is LeaderboardEntry {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return typeof v.name === 'string' && typeof v.timeMs === 'number' && typeof v.clicks === 'number';
}

export async function loadLeaderboard(): Promise<LeaderboardEntry[]> {
  if (hasCloudStorage) {
    try {
      const res = await window.storage!.get('leaderboard', true);
      if (res) {
        const parsed: unknown = JSON.parse(res.value);
        if (Array.isArray(parsed) && parsed.every(isLeaderboardEntry)) return parsed;
      }
    } catch {
      // on retombe sur le stockage local
    }
  }
  if (hasLocalStorage) {
    try {
      const raw = window.localStorage.getItem(LB_LOCAL_KEY);
      const parsed: unknown = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) && parsed.every(isLeaderboardEntry) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

export async function saveLeaderboardList(list: readonly LeaderboardEntry[]): Promise<boolean> {
  let ok = false;
  if (hasCloudStorage) {
    try {
      await window.storage!.set('leaderboard', JSON.stringify(list), true);
      ok = true;
    } catch {
      // on retombe sur le stockage local
    }
  }
  if (!ok && hasLocalStorage) {
    try {
      window.localStorage.setItem(LB_LOCAL_KEY, JSON.stringify(list));
      ok = true;
    } catch {
      ok = false;
    }
  }
  return ok;
}
