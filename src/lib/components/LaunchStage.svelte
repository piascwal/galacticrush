<script lang="ts">
  import type { PlanetVisual } from '../systems/travel.svelte';

  interface Props {
    source: PlanetVisual;
    target: PlanetVisual;
    caption?: string;
  }
  const { source, target, caption }: Props = $props();
</script>

{#if caption}<div class="launch-caption">{caption}</div>{/if}
<div class="launch-stage">
  <div class="launch-path"></div>
  <div class="launch-planet source" style="background:{source.gradient}; --src-glow:{source.glow};"></div>
  <div class="arrival-flash"></div>
  <div class="launch-planet target" style="background:{target.gradient}; --tgt-glow:{target.glow};"></div>
  <div class="launch-rocket">🚀</div>
</div>
<div class="rocket-label">Cap sur {target.name} !</div>
