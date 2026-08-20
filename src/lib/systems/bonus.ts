import { BONUS_DURATION_MS } from '../data/bonuses';
import type { CosmicBonusDef } from '../data/types';
import { game } from '../state/gameState.svelte';

let tickerStarted = false;

export function startBonus(def: CosmicBonusDef): void {
  game.activeBonus = { def, endsAt: Date.now() + BONUS_DURATION_MS };
  if (!tickerStarted) {
    tickerStarted = true;
    setInterval(() => {
      if (!game.activeBonus) return;
      if (game.activeBonus.endsAt - Date.now() <= 0) game.activeBonus = null;
    }, 150);
  }
}
