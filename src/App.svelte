<script lang="ts">
  import { onMount } from 'svelte';
  import StarsBackground from './lib/components/StarsBackground.svelte';
  import StartOverlay from './lib/components/StartOverlay.svelte';
  import IntroOverlay from './lib/components/IntroOverlay.svelte';
  import MenuButton from './lib/components/MenuButton.svelte';
  import Navbar from './lib/components/Navbar.svelte';
  import Hud from './lib/components/Hud.svelte';
  import AutonomyBar from './lib/components/AutonomyBar.svelte';
  import PlanetStage from './lib/components/PlanetStage.svelte';
  import Tabs from './lib/components/Tabs.svelte';
  import InfraPanel from './lib/components/InfraPanel.svelte';
  import NavPanel from './lib/components/NavPanel.svelte';
  import RdPanel from './lib/components/RdPanel.svelte';
  import RocketOverlay from './lib/components/RocketOverlay.svelte';
  import BonusBanner from './lib/components/BonusBanner.svelte';
  import VictoryCinematic from './lib/components/VictoryCinematic.svelte';
  import { game } from './lib/state/gameState.svelte';
  import { comet } from './lib/systems/comet.svelte';
  import { victory } from './lib/systems/victory.svelte';

  type Screen = 'start' | 'intro' | 'game';
  let screen: Screen = $state('start');
  let appShaking = $state(false);

  onMount(() => {
    const cleanupComet = comet.init();

    const passiveIv = setInterval(() => {
      game.tickPassiveProduction(0.1);
    }, 100);

    const checkIv = setInterval(() => {
      victory.check();
    }, 500);

    return () => {
      cleanupComet();
      clearInterval(passiveIv);
      clearInterval(checkIv);
    };
  });

  $effect(() => {
    if (!victory.cinematicActive) return;
    appShaking = true;
    const t = setTimeout(() => { appShaking = false; }, 520);
    return () => clearTimeout(t);
  });
</script>

<StarsBackground />

{#if screen === 'start'}
  <StartOverlay onplay={() => (screen = 'intro')} />
{:else if screen === 'intro'}
  <IntroOverlay oncomplete={() => (screen = 'game')} />
{/if}

{#if screen !== 'start'}
  <MenuButton fadeout={victory.cinematicActive} />
{/if}

{#if screen === 'game' || screen === 'intro'}
  <div id="app" class:empire-shake={appShaking} class:empire-fadeout={victory.cinematicActive}>
    <Navbar />
    <Hud />
    <AutonomyBar />
    <PlanetStage />
    <div id="click-hint">Cliquez sur l'astre pour extraire de l'énergie</div>
    <Tabs />
    <div id="panel-content">
      {#if game.activeTab === 'infra'}
        <InfraPanel />
      {:else if game.activeTab === 'nav'}
        <NavPanel />
      {:else}
        <RdPanel />
      {/if}
    </div>
    <div id="footer-note">GALACTIC HARVEST · Colonisation en cours</div>
  </div>
  <RocketOverlay />
  <BonusBanner />
{/if}

{#if victory.cinematicActive}
  <VictoryCinematic />
{/if}
