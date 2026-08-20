import { planetDefById } from './data/planets';
import type { PlanetId } from './data/types';

export function fmt(n: number): string {
  if (n >= 1e9) return (n / 1e9).toFixed(2) + 'G';
  if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(2) + 'k';
  return n.toFixed(1);
}

export function currencyFor(planetId: PlanetId): string {
  return planetDefById(planetId).currency;
}

export function fmtCur(n: number, planetId: PlanetId): string {
  return `${fmt(n)} ${currencyFor(planetId)}`;
}

export function formatDurationTenths(ms: number): string {
  const totalTenths = Math.max(0, Math.floor(ms / 100));
  const tenths = totalTenths % 10;
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const pad = (v: number) => (v < 10 ? '0' + v : '' + v);
  return (h > 0 ? h + ':' : '') + pad(m) + ':' + pad(s) + '.' + tenths;
}
