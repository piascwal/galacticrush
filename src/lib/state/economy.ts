// Logique économique pure — aucune dépendance au DOM ni à Svelte, testable en isolation.
import type { ActiveBonus, BuildingDef, PlanetDef, PlanetId, PlanetState, RdDef } from '../data/types';
import { LOCAL_CLICK_RD_BY_PLANET, LOCAL_PASSIVE_RD_BY_PLANET } from '../data/research';

export interface EconomyState {
  readonly rd: Record<string, boolean>;
  readonly planets: Record<PlanetId, PlanetState>;
  readonly activeBonus: ActiveBonus | null;
}

export function buildingCost(state: EconomyState, def: BuildingDef, ownedCount: number): number {
  let cost = def.baseCost * Math.pow(1.17, ownedCount);
  if (state.rd.nanorobots) cost *= 0.85;
  return cost;
}

export function buildingProduction(state: EconomyState, def: BuildingDef, ownedCount: number, planetId: PlanetId): number {
  let prod = def.baseProd * ownedCount;
  if (state.rd.fusion) prod *= 1.5;
  const localPassiveKey = LOCAL_PASSIVE_RD_BY_PLANET[planetId];
  if (localPassiveKey && state.rd[localPassiveKey]) prod *= 2;
  if (state.activeBonus?.def.passiveMult) prod *= state.activeBonus.def.passiveMult;
  return prod;
}

export function planetPassiveRate(state: EconomyState, def: PlanetDef): number {
  const ps = state.planets[def.id];
  let total = 0;
  for (const b of def.buildings) total += buildingProduction(state, b, ps.buildings[b.key] ?? 0, def.id);
  return total;
}

export function planetAutonomyPct(state: EconomyState, def: PlanetDef): number {
  const ps = state.planets[def.id];
  const ownedTypes = def.buildings.filter((b) => (ps.buildings[b.key] ?? 0) > 0).length;
  return Math.round((ownedTypes / def.buildings.length) * 100);
}

export function clickValue(state: EconomyState, activeDef: PlanetDef): number {
  let val = 1 * activeDef.clickMult;
  if (state.rd.condensateurs) val *= 2;
  if (state.rd.exo) val *= 2;
  if (state.rd.quantum) val *= 3;
  if (state.rd.neural) val += planetPassiveRate(state, activeDef) * 0.25;
  const localClickKey = LOCAL_CLICK_RD_BY_PLANET[activeDef.id];
  if (localClickKey && state.rd[localClickKey]) val *= 2;
  if (state.activeBonus?.def.clickMult) val *= state.activeBonus.def.clickMult;
  return val;
}

export function unlockCostFor(state: EconomyState, def: PlanetDef): number {
  let cost = def.unlockCost;
  if (state.rd.distorsion) cost = cost / 2;
  return cost;
}

export function rdPayerId(def: RdDef, homePlanetId: PlanetId): PlanetId {
  return def.scope === 'local' && def.planetId ? def.planetId : homePlanetId;
}
