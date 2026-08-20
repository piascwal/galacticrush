<script lang="ts">
  import { PLANET_DEFS, planetDefById } from '../data/planets';
  import { game } from '../state/gameState.svelte';
  import { fmtCur } from '../format';
  import { playUnlockTone } from '../audio';
  import { travel } from '../systems/travel.svelte';
  import { activateOnEnterOrSpace } from '../a11y';

  function unlock(def: (typeof PLANET_DEFS)[number]): void {
    if (def.unlockFrom === null) return;
    const sourceDef = planetDefById(def.unlockFrom);
    const unlocked = game.tryUnlockPlanet(def);
    if (!unlocked) return;
    playUnlockTone();
    travel.request(sourceDef, def, 'Décollage depuis ' + sourceDef.name);
  }
</script>

{#each PLANET_DEFS as def (def.id)}
  {@const ps = game.planetState(def.id)}
  {#if ps.unlocked}
    <div
      class="card owned-highlight"
      role="button"
      tabindex="0"
      onclick={() => game.selectPlanet(def.id)}
      onkeydown={activateOnEnterOrSpace(() => game.selectPlanet(def.id))}
    >
      <div class="info">
        <div class="name">{def.name}</div>
        <div class="desc">Clic x{def.clickMult} · Autonomie {game.planetAutonomyPct(def.id)}%</div>
      </div>
      <div class="stat">
        <div class="cost" style="color:var(--ok)">Débloqué</div>
        <div class="owned">{fmtCur(ps.energy, def.id)}</div>
      </div>
    </div>
  {:else}
    {@const cost = game.unlockCostFor(def)}
    {@const source = def.unlockFrom ? game.planetState(def.unlockFrom) : null}
    {@const affordable = !!source && source.energy >= cost}
    {@const sourceDef = def.unlockFrom ? planetDefById(def.unlockFrom) : null}
    <div
      class="card"
      class:disabled={!affordable}
      role="button"
      tabindex="0"
      onclick={() => unlock(def)}
      onkeydown={activateOnEnterOrSpace(() => unlock(def))}
    >
      <div class="info">
        <div class="name">{def.name}</div>
        <div class="desc">Clic x{def.clickMult} · Payé depuis {sourceDef?.name}</div>
      </div>
      <div class="stat">
        <div class="cost">{def.unlockFrom ? fmtCur(cost, def.unlockFrom) : ''}</div>
        <div class="owned">Verrouillé</div>
      </div>
    </div>
  {/if}
{/each}
