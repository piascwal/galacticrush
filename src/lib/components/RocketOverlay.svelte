<script lang="ts">
  import { onMount } from 'svelte';
  import { travel } from '../systems/travel.svelte';
  import LaunchStage from './LaunchStage.svelte';

  const req = travel.launch;

  onMount(() => {
    const t = setTimeout(() => {
      if (travel.launch?.id === req?.id) travel.launch = null;
    }, 2550);
    return () => clearTimeout(t);
  });
</script>

{#if req}
  <div class="rocket-overlay">
    <LaunchStage source={req.source} target={req.target} caption={'Décollage depuis ' + req.source.name} />
  </div>
{/if}
