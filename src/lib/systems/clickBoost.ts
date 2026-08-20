// Suit les gains de clic récents pour afficher un taux de production "boosté"
// par le clic manuel, en plus de la production passive.
import type { PlanetId } from '../data/types';

const CLICK_BOOST_WINDOW_MS = 2000;

interface Contribution {
  t: number;
  val: number;
  planetId: PlanetId;
}

const contribs: Contribution[] = [];

export function registerClickContribution(val: number, planetId: PlanetId): void {
  contribs.push({ t: Date.now(), val, planetId });
}

export function clickBoostRateFor(planetId: PlanetId): number {
  const now = Date.now();
  while (contribs.length && now - contribs[0]!.t > CLICK_BOOST_WINDOW_MS) contribs.shift();
  const sum = contribs.filter((c) => c.planetId === planetId).reduce((s, c) => s + c.val, 0);
  return sum / (CLICK_BOOST_WINDOW_MS / 1000);
}
