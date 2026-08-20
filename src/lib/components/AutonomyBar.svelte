<script lang="ts">
  import { game } from '../state/gameState.svelte';

  const pct = $derived(game.planetAutonomyPct(game.activePlanetId));
</script>

<div id="autonomy-wrap">
  <div id="autonomy-label"><span>Autonomie</span><span>{pct}%</span></div>
  <div id="autonomy-track"><div id="autonomy-fill" style:width={pct + '%'}></div></div>
</div>
