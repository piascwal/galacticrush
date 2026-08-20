import { describe, expect, it } from 'vitest';
import * as economy from './economy';
import type { EconomyState } from './economy';
import type { BuildingDef, PlanetDef, PlanetState } from '../data/types';
import { PLANET_DEFS, planetDefById } from '../data/planets';

const BUILDING: BuildingDef = { key: 'drill', name: 'Drill', icon: '⛏️', desc: '', baseCost: 10, baseProd: 2 };
const CAPSTONE: BuildingDef = { key: 'village', name: 'Village', icon: '🏘️', desc: '', baseCost: 1000, baseProd: 100 };

const PLANET: PlanetDef = {
  id: 'moon',
  name: 'Test Moon',
  currency: 'TM',
  clickMult: 2,
  unlockCost: 0,
  unlockFrom: null,
  habitability: '',
  gradient: '',
  glow: '',
  signature: 'massdriver',
  buildings: [BUILDING, CAPSTONE],
};

function makeState(overrides: Partial<EconomyState> = {}): EconomyState {
  const planetState: PlanetState = { energy: 0, unlocked: true, buildings: { drill: 0, village: 0 } };
  return {
    rd: {},
    planets: { moon: planetState } as EconomyState['planets'],
    activeBonus: null,
    ...overrides,
  };
}

describe('buildingCost', () => {
  it('grows exponentially at 1.17^owned', () => {
    const state = makeState();
    expect(economy.buildingCost(state, BUILDING, 0)).toBeCloseTo(10);
    expect(economy.buildingCost(state, BUILDING, 1)).toBeCloseTo(11.7);
    expect(economy.buildingCost(state, BUILDING, 5)).toBeCloseTo(10 * Math.pow(1.17, 5));
  });

  it('applies the -15% nanorobots discount', () => {
    const state = makeState({ rd: { nanorobots: true } });
    expect(economy.buildingCost(state, BUILDING, 0)).toBeCloseTo(10 * 0.85);
  });
});

describe('buildingProduction', () => {
  it('scales linearly with owned count', () => {
    const state = makeState();
    expect(economy.buildingProduction(state, BUILDING, 3, 'moon')).toBeCloseTo(6);
  });

  it('applies the fusion +50% global multiplier', () => {
    const state = makeState({ rd: { fusion: true } });
    expect(economy.buildingProduction(state, BUILDING, 1, 'moon')).toBeCloseTo(3);
  });

  it('applies the local passive-research ×2 multiplier only for its own planet', () => {
    const state = makeState({ rd: { moonDrill: true } });
    expect(economy.buildingProduction(state, BUILDING, 1, 'moon')).toBeCloseTo(4);
    expect(economy.buildingProduction(state, BUILDING, 1, 'mars')).toBeCloseTo(2);
  });

  it('applies an active passive-multiplier bonus (e.g. Tempête Solaire ×10)', () => {
    const state = makeState({ activeBonus: { def: { key: 'solarStorm', name: '', icon: '', desc: '', passiveMult: 10 }, endsAt: 0 } });
    expect(economy.buildingProduction(state, BUILDING, 1, 'moon')).toBeCloseTo(20);
  });

  it('stacks fusion, local research and the active bonus multiplicatively', () => {
    const state = makeState({
      rd: { fusion: true, moonDrill: true },
      activeBonus: { def: { key: 'solarStorm', name: '', icon: '', desc: '', passiveMult: 10 }, endsAt: 0 },
    });
    // 2 * 1 owned * 1.5 (fusion) * 2 (local) * 10 (bonus) = 60
    expect(economy.buildingProduction(state, BUILDING, 1, 'moon')).toBeCloseTo(60);
  });
});

describe('planetPassiveRate', () => {
  it('sums production across all buildings on the planet', () => {
    const state = makeState();
    state.planets.moon!.buildings = { drill: 2, village: 1 };
    expect(economy.planetPassiveRate(state, PLANET)).toBeCloseTo(2 * 2 + 100 * 1);
  });
});

describe('planetAutonomyPct', () => {
  it('is 0% with no buildings and 100% once every type is owned at least once', () => {
    const state = makeState();
    expect(economy.planetAutonomyPct(state, PLANET)).toBe(0);
    state.planets.moon!.buildings = { drill: 1, village: 0 };
    expect(economy.planetAutonomyPct(state, PLANET)).toBe(50);
    state.planets.moon!.buildings = { drill: 5, village: 1 };
    expect(economy.planetAutonomyPct(state, PLANET)).toBe(100);
  });
});

describe('clickValue', () => {
  it('starts at 1 × the planet click multiplier', () => {
    const state = makeState();
    expect(economy.clickValue(state, PLANET)).toBe(2);
  });

  it('stacks condensateurs (×2), exo (×2) and quantum (×3) multiplicatively', () => {
    const state = makeState({ rd: { condensateurs: true, exo: true, quantum: true } });
    expect(economy.clickValue(state, PLANET)).toBeCloseTo(2 * 2 * 2 * 3);
  });

  it('adds 25% of the planet passive rate with neural sync, computed before the flat multipliers', () => {
    const state = makeState({ rd: { neural: true } });
    state.planets.moon!.buildings = { drill: 10, village: 0 }; // passive rate = 20
    expect(economy.clickValue(state, PLANET)).toBeCloseTo(2 + 20 * 0.25);
  });

  it('applies the local click-research ×2 multiplier only on its own planet', () => {
    const withRd = makeState({ rd: { moonClick: true } });
    expect(economy.clickValue(withRd, PLANET)).toBe(4);
    const mars = { ...PLANET, id: 'mars' as const };
    const withoutMatch = makeState({ rd: { moonClick: true } });
    expect(economy.clickValue(withoutMatch, mars)).toBe(2);
  });

  it('applies an active click-multiplier bonus (e.g. Surchauffe Quantique ×5)', () => {
    const state = makeState({ activeBonus: { def: { key: 'quantumOverheat', name: '', icon: '', desc: '', clickMult: 5 }, endsAt: 0 } });
    expect(economy.clickValue(state, PLANET)).toBe(10);
  });
});

describe('unlockCostFor', () => {
  it('halves the unlock cost with the distorsion engine', () => {
    const def: PlanetDef = { ...PLANET, unlockCost: 1000 };
    expect(economy.unlockCostFor(makeState(), def)).toBe(1000);
    expect(economy.unlockCostFor(makeState({ rd: { distorsion: true } }), def)).toBe(500);
  });
});

describe('rdPayerId', () => {
  it('routes local research cost to its own planet and global research to the home planet', () => {
    expect(economy.rdPayerId({ key: 'moonDrill', name: '', desc: '', cost: 0, scope: 'local', planetId: 'moon' }, 'moon')).toBe('moon');
    expect(economy.rdPayerId({ key: 'fusion', name: '', desc: '', cost: 0, scope: 'global' }, 'moon')).toBe('moon');
  });
});

describe('integration with real game data', () => {
  it('every planet reaches exactly 100% autonomy once all of its buildings are owned', () => {
    for (const def of PLANET_DEFS) {
      const buildings: Record<string, number> = {};
      for (const b of def.buildings) buildings[b.key] = 1;
      const state = makeState();
      state.planets[def.id] = { energy: 0, unlocked: true, buildings };
      expect(economy.planetAutonomyPct(state, planetDefById(def.id))).toBe(100);
    }
  });
});
