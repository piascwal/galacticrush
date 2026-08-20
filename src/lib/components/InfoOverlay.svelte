<script lang="ts">
  import { onMount } from 'svelte';
  import type { PlanetDef } from '../data/types';

  interface Props {
    def: PlanetDef;
    onclose: () => void;
  }
  const { def, onclose }: Props = $props();

  onMount(() => {
    const onKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onclose();
    };
    window.addEventListener('keydown', onKeydown);
    return () => window.removeEventListener('keydown', onKeydown);
  });
</script>

<!-- Le clic sur le fond ferme l'overlay par confort souris ; le clavier dispose
     déjà du bouton ✕ et de la touche Échap ci-dessus. -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class="info-overlay"
  onclick={(e) => {
    if (e.target === e.currentTarget) onclose();
  }}
>
  <div class="info-card">
    <button class="info-close" onclick={onclose}>✕</button>
    <div class="info-planet-dot" style:background={def.gradient}></div>
    <div class="info-title">{def.name}</div>
    <div class="info-subtitle">Pourquoi cet astre ?</div>
    <div class="info-body">{def.habitability}</div>
  </div>
</div>
