<script lang="ts">
  import { onMount } from 'svelte';
  import type { LeaderboardEntry } from '../data/types';
  import { formatDurationTenths } from '../format';
  import { hasCloudStorage, leaderboardAvailable, loadLeaderboard } from '../systems/leaderboard';

  interface Props {
    onclose: () => void;
  }
  const { onclose }: Props = $props();

  let list: LeaderboardEntry[] | null = $state(null);

  onMount(() => {
    if (leaderboardAvailable) {
      loadLeaderboard().then((l) => {
        list = l;
      });
    }
    const onKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onclose();
    };
    window.addEventListener('keydown', onKeydown);
    return () => window.removeEventListener('keydown', onKeydown);
  });

  const subtitle = hasCloudStorage
    ? 'Top 50 des colonisations les plus rapides · visible de tous'
    : 'Top 50 des colonisations les plus rapides · classement local à cet appareil';
</script>

<!-- Le clic sur le fond ferme l'overlay par confort souris ; le clavier dispose
     déjà du bouton ✕ et de la touche Échap ci-dessus. -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class="leaderboard-overlay"
  onclick={(e) => {
    if (e.target === e.currentTarget) onclose();
  }}
>
  <div class="leaderboard-card">
    <button class="leaderboard-close" onclick={onclose}>✕</button>
    <div class="leaderboard-title">🏆 Classement galactique</div>
    <div class="leaderboard-subtitle">{subtitle}</div>
    <div class="leaderboard-list">
      {#if !leaderboardAvailable}
        <div class="leaderboard-empty">Classement indisponible : ce navigateur bloque tout stockage.</div>
      {:else if list === null}
        <div class="leaderboard-loading">Chargement…</div>
      {:else if list.length === 0}
        <div class="leaderboard-empty">Aucun score enregistré pour le moment. Soyez le premier !</div>
      {:else}
        {#each list as entry, idx (idx)}
          <div class="leaderboard-row" class:top3={idx < 3}>
            <span class="lb-rank">#{idx + 1}</span>
            <span class="lb-name">{entry.name}</span>
            <span class="lb-time">{formatDurationTenths(entry.timeMs)}</span>
          </div>
        {/each}
      {/if}
    </div>
  </div>
</div>
