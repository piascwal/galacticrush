import type { CosmicBonusDef } from './types';

export const COSMIC_BONUSES: readonly CosmicBonusDef[] = [
  { key: 'solarStorm', name: 'Tempête Solaire', icon: '☀️', desc: 'Production passive ×10', passiveMult: 10 },
  { key: 'quantumOverheat', name: 'Surchauffe Quantique', icon: '⚡', desc: 'Clics ×5 · jauge bloquée au max', clickMult: 5, forceHot: true }
];

export const BONUS_DURATION_MS = 15000;
export const COMET_MIN_DELAY_MS = 120000; // 2 min
export const COMET_MAX_DELAY_MS = 180000; // 3 min
export const COMET_HIT_TOLERANCE_PX = 26;
