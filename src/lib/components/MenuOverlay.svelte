<script lang="ts">
  import { onMount } from 'svelte';
  import { game } from '../state/gameState.svelte';
  import { formatDurationTenths } from '../format';
  import LeaderboardOverlay from './LeaderboardOverlay.svelte';

  interface Props {
    onclose: () => void;
  }
  const { onclose }: Props = $props();

  let timeLabel = $state('00:00.0');
  let showLeaderboard = $state(false);
  let restartArmed = $state(false);
  let restartTimeout: ReturnType<typeof setTimeout> | null = null;

  onMount(() => {
    const update = () => {
      timeLabel = formatDurationTenths(Date.now() - game.gameStartTime);
    };
    update();
    const iv = setInterval(update, 100);
    const onKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onclose();
    };
    window.addEventListener('keydown', onKeydown);
    return () => {
      clearInterval(iv);
      if (restartTimeout) clearTimeout(restartTimeout);
      window.removeEventListener('keydown', onKeydown);
    };
  });

  function handleRestartClick(): void {
    if (!restartArmed) {
      restartArmed = true;
      restartTimeout = setTimeout(() => {
        restartArmed = false;
      }, 4000);
    } else {
      if (restartTimeout) clearTimeout(restartTimeout);
      location.reload();
    }
  }
</script>

<!-- Le clic sur le fond ferme l'overlay par confort souris ; le clavier dispose
     déjà du bouton ✕ et de la touche Échap ci-dessus. -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class="menu-overlay"
  onclick={(e) => {
    if (e.target === e.currentTarget) onclose();
  }}
>
  <div class="menu-card">
    <button class="menu-close" onclick={onclose}>✕</button>
    <div class="menu-title">Menu</div>
    <div class="menu-stat"><span>Temps de jeu</span><span>{timeLabel}</span></div>
    <div class="menu-stat"><span>Clics manuels</span><span>{game.totalClicks}</span></div>
    <button
      class="menu-leaderboard-btn"
      onclick={() => {
        onclose();
        showLeaderboard = true;
      }}>🏆 Voir le classement</button
    >
    <button class="menu-restart-btn" class:armed={restartArmed} onclick={handleRestartClick}>
      {restartArmed ? 'Confirmer ? Tout sera perdu' : 'Recommencer la partie'}
    </button>
  </div>
</div>

{#if showLeaderboard}
  <LeaderboardOverlay onclose={() => (showLeaderboard = false)} />
{/if}
