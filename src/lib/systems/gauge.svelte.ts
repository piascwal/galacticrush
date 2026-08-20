// Jauge de vitesse de clic (type compteur de voiture) : ratio 0..1 dérivé du
// nombre de clics sur une fenêtre glissante, avec paliers de multiplicateur.
export const GAUGE_WINDOW_MS = 1200;
export const GAUGE_MAX_CPS = 12;
export const GAUGE_TIER2_CPS = 5; // dès 5 clics/s : ×1.25
export const GAUGE_TIER3_CPS = 10; // dès 10 clics/s : ×1.5
export const GAUGE_HOT_RATIO = GAUGE_TIER3_CPS / GAUGE_MAX_CPS;
export const GAUGE_WARM_RATIO = GAUGE_TIER2_CPS / GAUGE_MAX_CPS;
export const GAUGE_ARC_LEN = 163;

export interface GaugeReading {
  ratio: number;
  cps: number;
  hot: boolean;
  warm: boolean;
}

export class ClickGauge {
  ratio = $state(0);
  cps = $state(0);
  hot = $state(false);
  warm = $state(false);

  #timestamps: number[] = [];

  registerClick(): void {
    this.#timestamps.push(Date.now());
  }

  /** Recalcule ratio/cps/hot/warm. `forceHot` = bonus "surchauffe quantique" en cours. */
  tick(forceHot: boolean): GaugeReading {
    if (forceHot) {
      this.ratio = 1;
      this.cps = GAUGE_MAX_CPS;
    } else {
      const now = Date.now();
      while (this.#timestamps.length && now - this.#timestamps[0]! > GAUGE_WINDOW_MS) this.#timestamps.shift();
      this.cps = this.#timestamps.length / (GAUGE_WINDOW_MS / 1000);
      this.ratio = Math.max(0, Math.min(1, this.cps / GAUGE_MAX_CPS));
    }
    this.hot = this.ratio >= GAUGE_HOT_RATIO;
    this.warm = !this.hot && this.ratio >= GAUGE_WARM_RATIO;
    return { ratio: this.ratio, cps: this.cps, hot: this.hot, warm: this.warm };
  }
}

/** Multiplicateur de gain selon la vitesse de clic : ×1 normal, ×1.25 dès 5 clics/s, ×1.5 dès 10 clics/s. */
export function getSpeedMultiplier(cps: number): number {
  if (cps >= GAUGE_TIER3_CPS) return 1.5;
  if (cps >= GAUGE_TIER2_CPS) return 1.25;
  return 1;
}
