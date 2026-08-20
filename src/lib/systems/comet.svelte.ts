// Événement cosmique : une comète cliquable traverse l'écran toutes les 2-3
// minutes et offre un bonus temporaire (production ×10 ou clics ×5).
//
// La comète a une hitbox visuelle minuscule (14px) et se déplace en continu :
// on lui donne une marge de tolérance généreuse et on l'intercepte en phase de
// capture (avant les listeners de clic du jeu) pour qu'un clic/tap proche
// compte toujours pour la comète en priorité, jamais pour le clic du clicker
// en dessous.
import { COMET_HIT_TOLERANCE_PX, COMET_MAX_DELAY_MS, COMET_MIN_DELAY_MS, COSMIC_BONUSES } from '../data/bonuses';
import { playUnlockTone } from '../audio';
import { startBonus } from './bonus';

export interface CometFlight {
  readonly id: number;
  readonly sx: number;
  readonly sy: number;
  readonly ex: number;
  readonly ey: number;
  readonly angle: number;
  readonly duration: number;
}

export interface CometFlash {
  readonly id: number;
  readonly x: number;
  readonly y: number;
}

let nextId = 1;

class CometSystem {
  active: CometFlight | null = $state(null);
  flash: CometFlash | null = $state(null);

  #el: HTMLElement | null = null;
  #collected = false;
  #timeoutId: ReturnType<typeof setTimeout> | null = null;
  #initialized = false;

  /** Enregistre l'élément DOM réellement rendu pour la comète active (mesure de position). */
  bindElement(el: HTMLElement | null): void {
    this.#el = el;
  }

  /** Enregistre les listeners globaux (une seule fois). Ne planifie pas encore
   * de comète : c'est `startScheduling()` qui le fait, une fois la partie
   * réellement commencée (fin de la séquence d'intro). */
  init(): () => void {
    if (this.#initialized) return () => {};
    this.#initialized = true;

    const onTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (touch && this.tryCollectAt(touch.clientX, touch.clientY)) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    const onClick = (e: MouseEvent) => {
      if (this.tryCollectAt(e.clientX, e.clientY)) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    document.addEventListener('touchstart', onTouchStart, { capture: true, passive: false });
    document.addEventListener('click', onClick, { capture: true });

    return () => {
      document.removeEventListener('touchstart', onTouchStart, { capture: true });
      document.removeEventListener('click', onClick, { capture: true });
      if (this.#timeoutId) clearTimeout(this.#timeoutId);
    };
  }

  startScheduling(): void {
    this.scheduleNext();
  }

  scheduleNext(): void {
    if (this.#timeoutId) clearTimeout(this.#timeoutId);
    const delay = COMET_MIN_DELAY_MS + Math.random() * (COMET_MAX_DELAY_MS - COMET_MIN_DELAY_MS);
    this.#timeoutId = setTimeout(() => this.spawn(), delay);
  }

  spawn(): void {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const margin = 60;
    const side = Math.floor(Math.random() * 4);
    let sx: number, sy: number, ex: number, ey: number;
    if (side === 0) {
      sx = -margin;
      sy = Math.random() * h;
      ex = w + margin;
      ey = Math.random() * h;
    } else if (side === 1) {
      sx = w + margin;
      sy = Math.random() * h;
      ex = -margin;
      ey = Math.random() * h;
    } else if (side === 2) {
      sx = Math.random() * w;
      sy = -margin;
      ex = Math.random() * w;
      ey = h + margin;
    } else {
      sx = Math.random() * w;
      sy = h + margin;
      ex = Math.random() * w;
      ey = -margin;
    }

    const angle = (Math.atan2(ey - sy, ex - sx) * 180) / Math.PI;
    const duration = 3 + Math.random() * 1.5;

    this.#collected = false;
    this.active = { id: nextId++, sx, sy, ex, ey, angle, duration };

    this.#timeoutId = setTimeout(
      () => {
        if (!this.#collected) {
          this.active = null;
          this.#el = null;
          this.scheduleNext();
        }
      },
      duration * 1000 + 100,
    );
  }

  tryCollectAt(clientX: number, clientY: number): boolean {
    if (!this.active || this.#collected || !this.#el) return false;
    const rect = this.#el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const hitRadius = rect.width / 2 + COMET_HIT_TOLERANCE_PX;
    const dx = clientX - cx;
    const dy = clientY - cy;
    if (dx * dx + dy * dy > hitRadius * hitRadius) return false;

    this.#collected = true;
    this.active = null;
    this.#el = null;
    const flash: CometFlash = { id: nextId++, x: clientX, y: clientY };
    this.flash = flash;
    setTimeout(() => {
      if (this.flash?.id === flash.id) this.flash = null;
    }, 700);
    playUnlockTone();
    const bonusDef = COSMIC_BONUSES[Math.floor(Math.random() * COSMIC_BONUSES.length)]!;
    startBonus(bonusDef);
    this.scheduleNext();
    return true;
  }
}

export const comet = new CometSystem();
