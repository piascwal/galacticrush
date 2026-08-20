// Cartes/nœuds cliquables du jeu : rendus interactifs au clavier (rôle
// "button" + activation par Entrée/Espace) sans changer leur balisage `<div>`
// existant, pour ne pas perturber le CSS déjà en place.
export function activateOnEnterOrSpace(fn: () => void): (e: KeyboardEvent) => void {
  return (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fn();
    }
  };
}
