<script lang="ts">
  import { onMount } from 'svelte';
  import { game } from '../state/gameState.svelte';
  import { fmt, fmtCur } from '../format';
  import { clickBoostRateFor } from '../systems/clickBoost';
  import InfoOverlay from './InfoOverlay.svelte';

  let showInfo = $state(false);
  let tick = $state(0);

  onMount(() => {
    const iv = setInterval(() => { tick++; }, 100);
    return () => clearInterval(iv);
  });

  const def = $derived(game.activePlanetDef);
  const ps = $derived(game.activePlanetState);
  const effectiveRate = $derived.by(() => {
    tick; // dépendance explicite pour la ré-évaluation périodique
    return game.planetPassiveRate(def.id) + clickBoostRateFor(def.id);
  });
  const boosted = $derived.by(() => {
    tick;
    return clickBoostRateFor(def.id) > 0;
  });
</script>

<div id="hud">
  <div class="planet-name-row">
    <div class="planet-name">{def.name}<small>Astre actif</small></div>
    <button id="info-btn" title="En savoir plus sur cet astre" onclick={() => (showInfo = true)}>ⓘ</button>
  </div>
  <div id="energy-readout">
    <div class="val">{fmtCur(ps.energy, def.id)}</div>
    <div class="rate" class:boosted>+{fmt(effectiveRate)} {def.currency}/s</div>
  </div>
</div>

{#if showInfo}
  <InfoOverlay {def} onclose={() => (showInfo = false)} />
{/if}
