<script lang="ts">
  import { onMount } from 'svelte';
  import { PLANET_DEFS } from '../data/planets';
  import { game } from '../state/gameState.svelte';
  import { formatDurationTenths } from '../format';
  import { leaderboardAvailable, loadLeaderboard, saveLeaderboardList } from '../systems/leaderboard';
  import type { LeaderboardEntry } from '../data/types';
  import LeaderboardOverlay from './LeaderboardOverlay.svelte';

  interface Dot {
    id: number;
    gradient: string;
    glow: string;
    size: number;
    startX: number;
    startY: number;
    angle: number;
    revealed: boolean;
  }

  let dots: Dot[] = $state([]);
  let showConstellation = $state(true);

  let showShip = $state(false);
  let shipAppear = $state(false);
  let shipLaunch = $state(false);

  let showFlash = $state(false);
  let flashExpand = $state(false);
  let flashFadeOut = $state(false);

  let showTypewriter = $state(false);
  let typewriterShow = $state(false);
  let typedText = $state('');
  const FULL_TEXT = 'EMPIRE GALACTIQUE AUTONOME RETROUVÉ.';

  let showFinale = $state(false);
  let finaleShow = $state(false);

  let showLeaderboard = $state(false);
  let elapsed = $state(0);
  let leaderboardList: LeaderboardEntry[] | null = $state(null);
  let qualifies = $state(false);
  let playerName = $state('');
  let saved = $state(false);
  let savedRank = $state<number | null>(null);

  onMount(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    const t = (fn: () => void, ms: number) => {
      timers.push(setTimeout(fn, ms));
    };

    dots = PLANET_DEFS.map((def, i) => ({
      id: i,
      gradient: def.gradient,
      glow: def.glow,
      size: 24 + i * 5,
      startX: (Math.random() * 1.5 - 0.75) * (window.innerWidth / 2 + 120),
      startY: (Math.random() * 1.5 - 0.75) * (window.innerHeight / 2 + 120),
      angle: (i / PLANET_DEFS.length) * Math.PI * 2,
      revealed: false,
    }));
    requestAnimationFrame(() => {
      dots = dots.map((d) => ({ ...d, revealed: true }));
    });

    // ---- Phase 2 : le vaisseau vibre puis s'élance (à 3s) ----
    t(() => {
      showShip = true;
      requestAnimationFrame(() => {
        shipAppear = true;
      });
      t(() => {
        shipLaunch = true;
      }, 1080);

      // ---- Phase 3 : flash cosmique au moment où le vaisseau quitte l'écran (à 3s de plus) ----
      t(() => {
        showFlash = true;
        requestAnimationFrame(() => {
          flashExpand = true;
        });

        // ---- Phase 4 : le flash s'efface, le terminal apparaît ----
        t(() => {
          flashFadeOut = true;
          showConstellation = false;
          showShip = false;
          startTypewriter();
          t(() => {
            showFlash = false;
          }, 950);
        }, 1000);
      }, 3000);
    }, 3000);

    function startTypewriter(): void {
      showTypewriter = true;
      requestAnimationFrame(() => {
        typewriterShow = true;
      });
      let i = 0;
      const typeIv = setInterval(() => {
        i++;
        typedText = FULL_TEXT.slice(0, i);
        if (i >= FULL_TEXT.length) {
          clearInterval(typeIv);
          t(() => {
            elapsed = Date.now() - game.gameStartTime;
            showFinale = true;
            requestAnimationFrame(() => {
              finaleShow = true;
            });
            void loadFinaleLeaderboard();
          }, 500);
        }
      }, 45);
      timers.push(typeIv as unknown as ReturnType<typeof setTimeout>);
    }

    async function loadFinaleLeaderboard(): Promise<void> {
      if (!leaderboardAvailable) return;
      const list = await loadLeaderboard();
      leaderboardList = list;
      qualifies = list.length < 50 || elapsed < list[list.length - 1]!.timeMs;
    }

    return () => timers.forEach(clearTimeout);
  });

  async function saveScore(): Promise<void> {
    if (!leaderboardList) return;
    const name = (playerName || 'Anonyme').trim().slice(0, 18) || 'Anonyme';
    const record: LeaderboardEntry = { name, timeMs: elapsed, clicks: game.totalClicks };
    const newList = [...leaderboardList, record].sort((a, b) => a.timeMs - b.timeMs).slice(0, 50);
    await saveLeaderboardList(newList);
    const rank = newList.indexOf(record) + 1;
    savedRank = rank > 0 ? rank : null;
    saved = true;
  }
</script>

<div class="cinema-overlay">
  {#if showConstellation}
    {#each dots as dot (dot.id)}
      {@const r = 46}
      {@const cx = dot.revealed ? Math.cos(dot.angle) * r : dot.startX}
      {@const cy = dot.revealed ? Math.sin(dot.angle) * r : dot.startY}
      <div
        class="constellation-dot"
        style="width:{dot.size}px; height:{dot.size}px; background:{dot.gradient}; box-shadow:0 0 18px 4px {dot.glow}; opacity:{dot.revealed
          ? 1
          : 0}; transform:translate(calc(-50% + {cx.toFixed(0)}px), calc(-50% + {cy.toFixed(0)}px));"
      ></div>
    {/each}
  {/if}

  {#if showShip}
    <div class="cinema-ship" class:appear={shipAppear} class:launch={shipLaunch}>
      🚀
      <div class="ship-trail"></div>
    </div>
  {/if}

  {#if showFlash}
    <div class="cinema-flash" class:expand={flashExpand} class:fade-out={flashFadeOut}></div>
  {/if}

  {#if showTypewriter}
    <div class="cinema-typewriter" class:show={typewriterShow}>
      {typedText}<span class="cursor">█</span>
    </div>
  {/if}

  <div class="cinema-finale-slot" class:show={finaleShow}>
    {#if showFinale}
      <div class="victory-card cyberpunk-card">
        <div class="victory-title">🌌 Empire Galactique Autonome</div>
        <div class="victory-desc">Toutes les planètes produisent désormais leur propre énergie. La colonisation est un succès total.</div>
        <div class="victory-time">Temps : {formatDurationTenths(elapsed)}</div>
        <div class="victory-clicks">{game.totalClicks} clics manuels</div>
        <div>
          {#if !leaderboardAvailable}
            <!-- classement indisponible -->
          {:else if leaderboardList === null}
            <div class="leaderboard-loading">Vérification du classement…</div>
          {:else if saved}
            <div class="victory-saved">Score enregistré — rang #{savedRank ?? '?'} !</div>
          {:else if qualifies}
            <div class="victory-qualify">🎉 Score classable ! Entrez votre nom :</div>
            <input type="text" maxlength="18" placeholder="Votre nom" class="victory-name-input" bind:value={playerName} />
            <button class="victory-save-btn" onclick={saveScore}>Enregistrer mon score</button>
          {/if}
        </div>
        <div class="victory-actions">
          <button class="victory-secondary" onclick={() => (showLeaderboard = true)}>Classement</button>
          <button class="victory-replay" onclick={() => location.reload()}>Rejouer</button>
        </div>
      </div>
    {/if}
  </div>
</div>

{#if showLeaderboard}
  <LeaderboardOverlay onclose={() => (showLeaderboard = false)} />
{/if}
