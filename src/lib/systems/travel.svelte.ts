export interface PlanetVisual {
  readonly name: string;
  readonly gradient: string;
  readonly glow: string;
}

export interface RocketLaunchRequest {
  readonly id: number;
  readonly source: PlanetVisual;
  readonly target: PlanetVisual;
  readonly caption: string;
}

let nextId = 1;

class TravelSystem {
  launch: RocketLaunchRequest | null = $state(null);

  request(source: PlanetVisual, target: PlanetVisual, caption: string): void {
    this.launch = { id: nextId++, source, target, caption };
  }
}

export const travel = new TravelSystem();
