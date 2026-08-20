<script lang="ts">
  import { onMount } from 'svelte';
  import { EARTH_GLOW, EARTH_GRADIENT, EARTH_NAME, PLANET_DEFS } from '../data/planets';
  import { playClickTone, playUnlockTone } from '../audio';
  import { comet } from '../systems/comet.svelte';
  import { game } from '../state/gameState.svelte';
  import LaunchStage from './LaunchStage.svelte';

  interface Props {
    oncomplete: () => void;
  }
  const { oncomplete }: Props = $props();

  const STEPS = [3, 2, 1];
  let phase: 'countdown' | 'launch' = $state('countdown');
  let count = $state(STEPS[0]);
  let pulseKey = $state(0);

  const firstPlanet = PLANET_DEFS[0]!;
  const earth = { name: EARTH_NAME, gradient: EARTH_GRADIENT, glow: EARTH_GLOW };

  onMount(() => {
    let i = 0;
    let stepTimeout: ReturnType<typeof setTimeout>;
    let removeTimeout: ReturnType<typeof setTimeout>;

    function showNext(): void {
      if (i < STEPS.length) {
        count = STEPS[i]!;
        pulseKey++;
        playClickTone(260);
        i++;
        stepTimeout = setTimeout(showNext, 750);
      } else {
        playUnlockTone();
        phase = 'launch';
        game.gameStartTime = Date.now();
        comet.startScheduling();
        removeTimeout = setTimeout(oncomplete, 2550);
      }
    }
    showNext();

    return () => {
      clearTimeout(stepTimeout);
      clearTimeout(removeTimeout);
    };
  });
</script>

<div class="intro-overlay">
  {#if phase === 'countdown'}
    {#key pulseKey}
      <div class="intro-countdown">{count}</div>
    {/key}
  {:else}
    <LaunchStage source={earth} target={firstPlanet} caption={'Décollage depuis ' + earth.name} />
  {/if}
</div>
