<script lang="ts">
  import { travel } from '../systems/travel.svelte';
  import LaunchStage from './LaunchStage.svelte';

  // RocketOverlay reste monté en permanence (voir App.svelte) : `travel.launch`
  // doit donc être lu de façon réactive (pas capturé une fois dans une const au
  // montage), sinon l'overlay ne s'affiche plus jamais après le tout premier
  // rendu — c'était le bug : aucune animation ne se déclenchait au déblocage.
  $effect(() => {
    const req = travel.launch;
    if (!req) return;
    const t = setTimeout(() => {
      if (travel.launch?.id === req.id) travel.launch = null;
    }, 2550);
    return () => clearTimeout(t);
  });
</script>

{#if travel.launch}
  <div class="rocket-overlay">
    <LaunchStage source={travel.launch.source} target={travel.launch.target} caption={'Décollage depuis ' + travel.launch.source.name} />
  </div>
{/if}
