import { HOME_PLANET_ID, PLANET_DEFS, planetDefById } from '../data/planets';
import { RD_DEFS } from '../data/research';
import type { ActiveBonus, BuildingDef, PlanetId, PlanetState, RdDef } from '../data/types';
import * as economy from './economy';

function createInitialPlanets(): Record<PlanetId, PlanetState> {
  const planets = {} as Record<PlanetId, PlanetState>;
  for (const def of PLANET_DEFS) {
    const buildings: Record<string, number> = {};
    for (const b of def.buildings) buildings[b.key] = 0;
    planets[def.id] = { energy: 0, unlocked: def.unlockFrom === null, buildings };
  }
  return planets;
}

function createInitialRd(): Record<string, boolean> {
  const rd: Record<string, boolean> = {};
  for (const def of RD_DEFS) rd[def.key] = false;
  return rd;
}

export type TabId = 'infra' | 'nav' | 'rd';

class GameStateStore {
  activePlanetId: PlanetId = $state(HOME_PLANET_ID);
  activeTab: TabId = $state('infra');
  planets: Record<PlanetId, PlanetState> = $state(createInitialPlanets());
  rd: Record<string, boolean> = $state(createInitialRd());
  activeBonus: ActiveBonus | null = $state(null);
  totalClicks = $state(0);
  gameStartTime = $state(Date.now());
  victoryShown = $state(false);

  get activePlanetDef() {
    return planetDefById(this.activePlanetId);
  }
  get activePlanetState(): PlanetState {
    // invariant : chaque PlanetDef a une entrée initialisée dans `planets`
    return this.planets[this.activePlanetId]!;
  }

  planetState(id: PlanetId): PlanetState {
    return this.planets[id]!;
  }

  buildingCost(def: BuildingDef, ownedCount: number): number {
    return economy.buildingCost(this, def, ownedCount);
  }
  planetPassiveRate(id: PlanetId): number {
    return economy.planetPassiveRate(this, planetDefById(id));
  }
  planetAutonomyPct(id: PlanetId): number {
    return economy.planetAutonomyPct(this, planetDefById(id));
  }
  clickValue(): number {
    return economy.clickValue(this, this.activePlanetDef);
  }
  unlockCostFor(def: { unlockCost: number }): number {
    let cost = def.unlockCost;
    if (this.rd.distorsion) cost = cost / 2;
    return cost;
  }

  /** Applique un clic manuel et renvoie l'énergie gagnée. */
  applyClick(speedMult: number): number {
    const val = this.clickValue() * speedMult;
    this.activePlanetState.energy += val;
    this.totalClicks++;
    return val;
  }

  tickPassiveProduction(deltaSeconds: number): void {
    for (const def of PLANET_DEFS) {
      const ps = this.planets[def.id]!;
      if (!ps.unlocked) continue;
      ps.energy += economy.planetPassiveRate(this, def) * deltaSeconds;
    }
  }

  /** @returns true si l'achat a eu lieu, et si c'était le premier exemplaire de ce bâtiment. */
  buyBuilding(def: BuildingDef): { bought: boolean; firstOfType: boolean } {
    const ps = this.activePlanetState;
    const owned = ps.buildings[def.key] ?? 0;
    const cost = economy.buildingCost(this, def, owned);
    if (ps.energy < cost) return { bought: false, firstOfType: false };
    ps.energy -= cost;
    ps.buildings[def.key] = owned + 1;
    return { bought: true, firstOfType: owned === 0 };
  }

  buyRD(def: RdDef): boolean {
    if (this.rd[def.key]) return false;
    const payerId = economy.rdPayerId(def, HOME_PLANET_ID);
    const payer = this.planets[payerId]!;
    if (payer.energy < def.cost) return false;
    payer.energy -= def.cost;
    this.rd[def.key] = true;
    return true;
  }

  selectPlanet(id: PlanetId): void {
    if (!this.planets[id]!.unlocked) return;
    this.activePlanetId = id;
  }

  /** @returns true si le déblocage a eu lieu (déclenche l'overlay fusée côté appelant). */
  tryUnlockPlanet(def: { id: PlanetId; unlockFrom: PlanetId | null; unlockCost: number }): boolean {
    if (def.unlockFrom === null) return false;
    const source = this.planets[def.unlockFrom]!;
    const target = this.planets[def.id]!;
    if (target.unlocked) return false;
    const cost = this.unlockCostFor(def);
    if (source.energy < cost) return false;
    source.energy -= cost;
    target.unlocked = true;
    this.activePlanetId = def.id;
    return true;
  }

  allPlanetsAutonomous(): boolean {
    return PLANET_DEFS.every((def) => {
      const ps = this.planets[def.id]!;
      return ps.unlocked && economy.planetAutonomyPct(this, def) === 100;
    });
  }
}

export const game = new GameStateStore();
