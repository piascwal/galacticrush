<script lang="ts">
  import { onMount } from 'svelte';
  import { game } from '../state/gameState.svelte';
  import { BONUS_DURATION_MS } from '../data/bonuses';

  let remainingLabel = $state((BONUS_DURATION_MS / 1000).toFixed(1) + 's');

  onMount(() => {
    const iv = setInterval(() => {
      const bonus = game.activeBonus;
      if (!bonus) return;
      const remaining = Math.max(0, bonus.endsAt - Date.now());
      remainingLabel = (remaining / 1000).toFixed(1) + 's';
    }, 150);
    return () => clearInterval(iv);
  });
</script>

<div id="bonus-banner" class:show={!!game.activeBonus}>
  {#if game.activeBonus}
    <span>{game.activeBonus.def.icon}</span>
    <span class="bonus-name">{game.activeBonus.def.name}</span>
    <span>{game.activeBonus.def.desc}</span>
    <span class="bonus-timer">{remainingLabel}</span>
  {/if}
</div>
