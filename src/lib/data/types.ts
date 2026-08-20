export type PlanetId = 'moon' | 'mars' | 'europa' | 'enceladus' | 'titan';

export type PlanetSignature = 'massdriver' | 'terraform' | 'icecracks' | 'geysers' | 'stargate';

export interface BuildingDef {
  readonly key: string;
  readonly name: string;
  readonly icon: string;
  readonly desc: string;
  readonly baseCost: number;
  readonly baseProd: number;
}

export interface PlanetDef {
  readonly id: PlanetId;
  readonly name: string;
  readonly currency: string;
  readonly clickMult: number;
  readonly unlockCost: number;
  readonly unlockFrom: PlanetId | null;
  readonly habitability: string;
  readonly gradient: string;
  readonly glow: string;
  readonly signature: PlanetSignature;
  readonly buildings: readonly BuildingDef[];
}

export type RdScope = 'global' | 'local';

export interface RdDef {
  readonly key: string;
  readonly name: string;
  readonly desc: string;
  readonly cost: number;
  readonly scope: RdScope;
  readonly planetId?: PlanetId;
}

export interface CosmicBonusDef {
  readonly key: string;
  readonly name: string;
  readonly icon: string;
  readonly desc: string;
  readonly passiveMult?: number;
  readonly clickMult?: number;
  readonly forceHot?: boolean;
}

export interface PlanetState {
  energy: number;
  unlocked: boolean;
  buildings: Record<string, number>;
}

export interface ActiveBonus {
  def: CosmicBonusDef;
  endsAt: number;
}

export interface LeaderboardEntry {
  name: string;
  timeMs: number;
  clicks: number;
}
