<script lang="ts">
  // Rendu au niveau racine de l'app (voir App.svelte), volontairement PAS à
  // l'intérieur de PlanetStage/#stage : #stage a `perspective` + `overflow:hidden`
  // en CSS, ce qui transforme tout descendant `position:fixed` en élément
  // confiné à sa boîte (comportement CSS standard). La comète doit traverser
  // tout l'écran, pas juste la zone de clic.
  import { comet } from '../systems/comet.svelte';

  let cometEl: HTMLDivElement | null = $state(null);

  $effect(() => {
    comet.bindElement(cometEl);
  });
</script>

{#if comet.active}
  {@const c = comet.active}
  <div
    bind:this={cometEl}
    class="cosmic-comet"
    style="--sx:{c.sx}px; --sy:{c.sy}px; --ex:{c.ex}px; --ey:{c.ey}px; --angle:{c.angle}deg; --duration:{c.duration}s;"
  ></div>
{/if}
{#if comet.flash}
  <div class="comet-flash" style="left:{comet.flash.x}px; top:{comet.flash.y}px;"></div>
{/if}
