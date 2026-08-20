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
    const req = { id: nextId++, icon, name };
    this.firstBuild = req;
    setTimeout(() => {
      if (this.firstBuild?.id === req.id) this.firstBuild = null;
    }, 1650);
  }
}

export const fx = new FxBus();
