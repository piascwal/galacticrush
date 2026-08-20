<script lang="ts">
  import { RD_DEFS } from '../data/research';
  import { planetDefById, HOME_PLANET_ID } from '../data/planets';
  import { game } from '../state/gameState.svelte';
  import { fmtCur } from '../format';
  import { playUnlockTone } from '../audio';
  import * as economy from '../state/economy';

  function buy(defKey: string): void {
    const def = RD_DEFS.find((d) => d.key === defKey);
    if (!def) return;
    if (game.buyRD(def)) playUnlockTone();
  }
</script>

{#each RD_DEFS as def (def.key)}
  {#if def.scope !== 'local' || game.planetState(def.planetId!).unlocked}
    {@const payerId = economy.rdPayerId(def, HOME_PLANET_ID)}
    {@const payer = game.planetState(payerId)}
    {@const bought = game.rd[def.key]}
    {@const affordable = payer.energy >= def.cost}
    <div class="card rd-card" class:bought class:disabled={!bought && !affordable} class:locked={!bought && !affordable} onclick={() => !bought && buy(def.key)}>
      {#if def.scope === 'global'}
        <span class="rd-badge global">🌐 GLOBAL</span>
      {:else}
        {@const planetDef = planetDefById(def.planetId!)}
        <span class="rd-badge local"><span class="rd-badge-dot" style="background:{planetDef.glow}; box-shadow:0 0 5px {planetDef.glow};"></span>{planetDef.name.toUpperCase()}</span>
      {/if}
      <div class="info">
        <div class="name">{def.name}</div>
        <div class="desc">{def.desc}</div>
      </div>
      <div class="stat"><div class="cost">{bought ? 'Acquis' : fmtCur(def.cost, payerId)}</div></div>
    </div>
  {/if}
{/each}
