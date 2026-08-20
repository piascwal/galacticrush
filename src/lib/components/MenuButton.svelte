<script lang="ts">
  import MenuOverlay from './MenuOverlay.svelte';

  interface Props {
    fadeout?: boolean;
  }
  const { fadeout = false }: Props = $props();

  let showMenu = $state(false);
</script>

<button id="menu-btn" class:empire-fadeout={fadeout} title="Menu" onclick={() => (showMenu = true)}>☰</button>

{#if showMenu}
  <MenuOverlay onclose={() => (showMenu = false)} />
{/if}
