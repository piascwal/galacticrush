// Bus léger pour déclencher des effets visuels ponctuels sur la scène planète
// depuis un composant qui n'y a pas de référence directe (ex: achat d'un
// bâtiment depuis le panneau Infrastructures).
export interface FirstBuildFxRequest {
  readonly id: number;
  readonly icon: string;
  readonly name: string;
}

let nextId = 1;

class FxBus {
  firstBuild: FirstBuildFxRequest | null = $state(null);

  triggerFirstBuild(icon: string, name: string): void {
    this.firstBuild = { id: nextId++, icon, name };
  }
}

export const fx = new FxBus();
