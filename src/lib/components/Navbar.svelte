<script lang="ts">
  import { PLANET_DEFS } from '../data/planets';
  import { game } from '../state/gameState.svelte';
  import { fmt, currencyFor } from '../format';
  import { activateOnEnterOrSpace } from '../a11y';
</script>

<div id="navbar">
  {#each PLANET_DEFS as def (def.id)}
    {@const ps = game.planetState(def.id)}
    {@const pct = game.planetAutonomyPct(def.id)}
    <div
      class="nav-node"
      class:unlocked={ps.unlocked}
      class:active={def.id === game.activePlanetId}
      role="button"
      tabindex="0"
      onclick={() => game.selectPlanet(def.id)}
      onkeydown={activateOnEnterOrSpace(() => game.selectPlanet(def.id))}
    >
      <div class="dot" style:background={def.gradient}></div>
      <div class="label">{def.name}</div>
      {#if ps.unlocked}
        <div class="nav-autonomy" style:color={pct === 100 ? 'var(--ok)' : undefined}>{pct}%</div>
      {:else if def.unlockFrom}
        <div class="lock-cost">{fmt(game.unlockCostFor(def))} {currencyFor(def.unlockFrom)}</div>
      {/if}
    </div>
  {/each}
</div>
