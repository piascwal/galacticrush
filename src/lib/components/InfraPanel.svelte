<script lang="ts">
  import { game } from '../state/gameState.svelte';
  import { fmtCur } from '../format';
  import { playBuildTone } from '../audio';
  import { fx } from '../systems/fx.svelte';
  import { victory } from '../systems/victory.svelte';

  const def = $derived(game.activePlanetDef);
  const ps = $derived(game.activePlanetState);

  function buy(buildingKey: string): void {
    const building = def.buildings.find((b) => b.key === buildingKey);
    if (!building) return;
    const result = game.buyBuilding(building);
    if (!result.bought) return;
    playBuildTone();
    if (result.firstOfType) fx.triggerFirstBuild(building.icon, building.name);
    victory.check();
  }
</script>

{#each def.buildings as b, index (b.key)}
  {#if index === 0 || (ps.buildings[def.buildings[index - 1]!.key] ?? 0) > 0}
    {@const owned = ps.buildings[b.key] ?? 0}
    {@const cost = game.buildingCost(b, owned)}
    {@const affordable = ps.energy >= cost}
    <div class="card" class:disabled={!affordable} class:owned-highlight={owned > 0} onclick={() => buy(b.key)}>
      <div class="icon-badge">{b.icon}</div>
      <div class="info">
        <div class="name">{b.name}</div>
        <div class="desc">{b.desc}</div>
        <div class="prod-line">+{b.baseProd.toFixed(1)} {def.currency}/s par exemplaire</div>
      </div>
      <div class="stat">
        <div class="cost">{fmtCur(cost, def.id)}</div>
        <div class="owned">Possédé : {owned}</div>
      </div>
    </div>
  {/if}
{/each}
