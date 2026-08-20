import { game } from '../state/gameState.svelte';

class VictorySystem {
  cinematicActive = $state(false);

  /** Vérifie la condition de victoire (toutes les planètes autonomes à 100%). */
  check(): void {
    if (game.victoryShown) return;
    if (game.allPlanetsAutonomous()) {
      game.victoryShown = true;
      this.cinematicActive = true;
    }
  }

  /** Aperçu depuis l'écran de démarrage — ne marque pas la victoire comme acquise. */
  previewCinematic(): void {
    this.cinematicActive = true;
  }
}

export const victory = new VictorySystem();
