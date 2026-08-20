<script lang="ts">
  import { game, type TabId } from '../state/gameState.svelte';

  const TABS: { id: TabId; label: string }[] = [
    { id: 'infra', label: 'Infrastructures' },
    { id: 'nav', label: 'Navigation' },
    { id: 'rd', label: 'R&D' }
  ];
</script>

<div id="tabs">
  {#each TABS as tab (tab.id)}
    <div class="tab-btn" class:active={game.activeTab === tab.id} onclick={() => (game.activeTab = tab.id)}>
      {tab.label}
    </div>
  {/each}
</div>
