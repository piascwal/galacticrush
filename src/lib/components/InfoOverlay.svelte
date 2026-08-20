<script lang="ts">
  import type { PlanetDef } from '../data/types';

  interface Props {
    def: PlanetDef;
    onclose: () => void;
  }
  const { def, onclose }: Props = $props();
</script>

<div class="info-overlay" onclick={(e) => { if (e.target === e.currentTarget) onclose(); }}>
  <div class="info-card">
    <button class="info-close" onclick={onclose}>✕</button>
    <div class="info-planet-dot" style:background={def.gradient}></div>
    <div class="info-title">{def.name}</div>
    <div class="info-subtitle">Pourquoi cet astre ?</div>
    <div class="info-body">{def.habitability}</div>
  </div>
</div>
