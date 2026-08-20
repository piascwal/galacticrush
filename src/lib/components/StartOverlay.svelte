<script lang="ts">
  import LeaderboardOverlay from './LeaderboardOverlay.svelte';
  import { victory } from '../systems/victory.svelte';

  interface Props {
    onplay: () => void;
  }
  const { onplay }: Props = $props();

  let showLeaderboard = $state(false);
</script>

<div class="start-overlay">
  <div class="start-card">
    <div class="start-title">GALACTIC HARVEST</div>
    <div class="start-tagline">La course à la colonisation vient de commencer</div>
    <div class="start-hook">
      Un empire spatial ne se bâtit pas deux fois de la même façon. Combien de temps vous faudra-t-il pour rendre tout le système autonome ?
    </div>
    <button class="start-play-btn" onclick={onplay}>Lancer la colonisation</button>
    <button class="start-lb-btn" onclick={() => (showLeaderboard = true)}>🏆 Voir le classement</button>
    <button class="start-dev-btn" onclick={() => victory.previewCinematic()}>🎬 Aperçu de la cinématique de fin</button>
  </div>
</div>

{#if showLeaderboard}
  <LeaderboardOverlay onclose={() => (showLeaderboard = false)} />
{/if}
