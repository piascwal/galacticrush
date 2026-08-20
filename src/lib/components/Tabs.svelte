<script lang="ts">
  import { game, type TabId } from '../state/gameState.svelte';
  import { activateOnEnterOrSpace } from '../a11y';

  const TABS: { id: TabId; label: string }[] = [
    { id: 'infra', label: 'Infrastructures' },
    { id: 'nav', label: 'Navigation' },
    { id: 'rd', label: 'R&D' },
  ];
</script>

<div id="tabs" role="tablist">
  {#each TABS as tab (tab.id)}
    <div
      class="tab-btn"
      class:active={game.activeTab === tab.id}
      role="tab"
      aria-selected={game.activeTab === tab.id}
      tabindex="0"
      onclick={() => (game.activeTab = tab.id)}
      onkeydown={activateOnEnterOrSpace(() => (game.activeTab = tab.id))}
    >
      {tab.label}
    </div>
  {/each}
</div>
