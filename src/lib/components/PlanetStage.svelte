<script lang="ts">
  import { onMount } from 'svelte';
  import { game } from '../state/gameState.svelte';
  import { ClickGauge, GAUGE_ARC_LEN, getSpeedMultiplier } from '../systems/gauge.svelte';
  import { fx } from '../systems/fx.svelte';
  import { ensureAudio, playClickTone } from '../audio';
  import { fmt } from '../format';
  import { registerClickContribution } from '../systems/clickBoost';
  import { activateOnEnterOrSpace } from '../a11y';
  import { EARTH_CITY_SPOTS, CRACK_ANGLES, lerpColor } from '../systems/planetVisual';

  let stageEl: HTMLDivElement;
  let planetEl: HTMLDivElement | undefined = $state();

  const def = $derived(game.activePlanetDef);
  const ps = $derived(game.activePlanetState);
  const autonomyPct = $derived(game.planetAutonomyPct(def.id));

  // ---------------------------------------------------------
  // Halo d'atmosphère — évolue avec le % d'autonomie
  // ---------------------------------------------------------
  const haloOpacity = $derived((0.22 + (autonomyPct / 100) * 0.5).toFixed(2));
  const haloBlur = $derived((12 + (autonomyPct / 100) * 12).toFixed(0) + 'px');
  const haloScale = $derived((1.3 + (autonomyPct / 100) * 0.25).toFixed(2));

  // ---------------------------------------------------------
  // Lumières de ville — mêmes emplacements réutilisés sur toutes les planètes
  // ---------------------------------------------------------
  const cityLights = $derived.by(() => {
    const count = Math.round((autonomyPct / 100) * EARTH_CITY_SPOTS.length);
    return EARTH_CITY_SPOTS.slice(0, count).map((spot, i) => ({ left: spot[0], top: spot[1], delay: i * 0.18 + 's' }));
  });

  // ---------------------------------------------------------
  // Effet signature propre à chaque planète
  // ---------------------------------------------------------
  const terraform = $derived.by(() => {
    if (def.signature !== 'terraform') return null;
    const t = Math.min((ps.buildings.converter ?? 0) / 8, 1);
    const c1 = lerpColor('#f6624a', '#7fd18f', t);
    const c2 = lerpColor('#a61c1c', '#1c7ed6', t);
    return { background: `radial-gradient(circle at 35% 32%, ${c1}, ${c2} 70%)`, hazeOpacity: t > 0.03 ? (t * 0.5).toFixed(2) : null };
  });

  const crackLines = $derived.by(() => {
    if (def.signature !== 'icecracks') return [];
    const active = (ps.buildings.cryodrill ?? 0) + (ps.buildings.submarine ?? 0);
    if (active <= 0) return [];
    const n = Math.min(CRACK_ANGLES.length, Math.max(2, active));
    return Array.from({ length: n }, (_, i) => ({
      angle: CRACK_ANGLES[i % CRACK_ANGLES.length]!,
      widthPct: 0.3 + (i % 3) * 0.08,
      delay: i * 0.22 + 's',
    }));
  });

  const stargate = $derived.by(() => {
    if (def.signature !== 'stargate') return null;
    const gate = ps.buildings.gate ?? 0;
    if (gate <= 0) return null;
    const capped = Math.min(gate, 5);
    const particleCount = Math.min(capped * 2, 8);
    return {
      capped,
      opacity: (0.45 + capped * 0.1).toFixed(2),
      particles: Array.from({ length: particleCount }, (_, i) => (i / particleCount) * Math.PI * 2),
    };
  });

  const planetBackground = $derived(terraform?.background ?? def.gradient);

  // ---------------------------------------------------------
  // Anneaux orbitaux de bâtiments — angle continu géré hors réactivité Svelte
  // (mutation directe du style à chaque frame, comme dans la version d'origine)
  // ---------------------------------------------------------
  interface MarkerSpec {
    id: string;
    icon: string;
    isCapstone: boolean;
  }
  interface MarkerPhysics {
    angle: number;
    speed: number;
    radiusX: number;
    radiusY: number;
    el: HTMLElement | null;
  }

  let markerSpecs: MarkerSpec[] = $state([]);
  // Map non-réactive intentionnellement : l'angle de chaque marqueur est muté à
  // chaque frame (60/s) directement sur le style de l'élément (voir orbitLoop),
  // en dehors du système de réactivité Svelte pour éviter de déclencher un cycle
  // de rendu par marqueur et par frame. Passer à SvelteMap annulerait ce gain.
  // eslint-disable-next-line svelte/prefer-svelte-reactivity
  const physicsMap = new Map<string, MarkerPhysics>();

  function markerRef(node: HTMLElement, id: string) {
    const entry = physicsMap.get(id);
    if (entry) entry.el = node;
    return {
      destroy() {
        physicsMap.delete(id);
      },
    };
  }

  $effect(() => {
    const d = def;
    const state = ps;
    const planetSize = planetEl?.offsetWidth || 180;
    const lastIndex = d.buildings.length - 1;
    const specs: MarkerSpec[] = [];
    d.buildings.forEach((b, index) => {
      const owned = state.buildings[b.key] ?? 0;
      if (owned <= 0) return;
      const isCapstone = index === lastIndex;
      const count = Math.min(owned, 6);
      const radiusX = (planetSize / 2) * 1.25 + index * 20;
      const radiusY = radiusX * 0.4;
      const speed = (0.22 + index * 0.07) * (index % 2 === 0 ? 1 : -1);
      for (let k = 0; k < count; k++) {
        const id = `${b.key}-${k}`;
        specs.push({ id, icon: b.icon, isCapstone });
        // Un marqueur dont l'id existe déjà (ex: on achète un 2e exemplaire du
        // même bâtiment, ce qui ajoute un nouvel id sans recréer les
        // précédents) garde son élément DOM lié : `use:markerRef` ne se
        // redéclenche pas sur un nœud réutilisé par la keyed-each, donc vider
        // la map ici perdait `.el` pour tous les marqueurs déjà affichés et
        // les figeait définitivement (c'était le bug).
        const existing = physicsMap.get(id);
        if (existing) {
          existing.speed = speed;
          existing.radiusX = radiusX;
          existing.radiusY = radiusY;
        } else {
          physicsMap.set(id, { angle: (k / count) * Math.PI * 2, speed, radiusX, radiusY, el: null });
        }
      }
    });
    for (const id of [...physicsMap.keys()]) {
      if (!specs.some((s) => s.id === id)) physicsMap.delete(id);
    }
    markerSpecs = specs;
  });

  let orbitLastTs: number | null = null;
  function orbitLoop(ts: number): void {
    const dt = orbitLastTs == null ? 0 : Math.min((ts - orbitLastTs) / 1000, 0.05);
    orbitLastTs = ts;
    physicsMap.forEach((m) => {
      if (!m.el) return;
      m.angle += m.speed * dt;
      const x = Math.cos(m.angle) * m.radiusX;
      const y = Math.sin(m.angle) * m.radiusY;
      m.el.style.transform = `translate(-50%,-50%) translate(${x.toFixed(1)}px,${y.toFixed(1)}px)`;
    });
    requestAnimationFrame(orbitLoop);
  }

  // ---------------------------------------------------------
  // Jauge de vitesse de clic
  // ---------------------------------------------------------
  const gauge = new ClickGauge();
  const needleAngle = $derived((-80 + gauge.ratio * 160).toFixed(1) + 'deg');
  const arcOffset = $derived((GAUGE_ARC_LEN * (1 - gauge.ratio)).toFixed(1));

  // ---------------------------------------------------------
  // Particules (étincelles, escarbilles, click-pop, mass driver) — rendues
  // via des listes réactives (chaque particule se retire elle-même de la
  // liste après sa durée de vie) plutôt que par manipulation DOM directe :
  // ça laisse Svelte gérer la création/suppression des nœuds.
  // ---------------------------------------------------------
  interface SparkParticle {
    id: number;
    x: number;
    y: number;
    color: string;
    dx: string;
    dy: string;
    fall: string;
    spin: string;
  }
  interface EmberParticle {
    id: number;
    x: number;
    y: number;
    ex: string;
    ey: string;
  }
  interface ClickPop {
    id: number;
    x: number;
    y: number;
    text: string;
    cls: string;
  }
  interface Streak {
    id: number;
    left: number;
    top: number;
    angleDeg: number;
  }

  let sparkParticles: SparkParticle[] = $state([]);
  let emberParticles: EmberParticle[] = $state([]);
  let clickPops: ClickPop[] = $state([]);
  let streaks: Streak[] = $state([]);
  let particleIdCounter = 0;

  function spawnSparkParticles(x: number, y: number): void {
    const color = def.glow;
    const count = 4 + Math.floor(Math.random() * 3);
    const created: SparkParticle[] = [];
    for (let i = 0; i < count; i++) {
      const angle = Math.PI + Math.random() * Math.PI;
      const speed = 30 + Math.random() * 45;
      created.push({
        id: particleIdCounter++,
        x,
        y,
        color,
        dx: (Math.cos(angle) * speed).toFixed(1) + 'px',
        dy: (Math.sin(angle) * speed * 0.7).toFixed(1) + 'px',
        fall: (70 + Math.random() * 55).toFixed(0) + 'px',
        spin: (Math.random() * 180 - 90).toFixed(0) + 'deg',
      });
    }
    sparkParticles = [...sparkParticles, ...created];
    const ids = new Set(created.map((p) => p.id));
    setTimeout(() => {
      sparkParticles = sparkParticles.filter((p) => !ids.has(p.id));
    }, 900);
  }

  function spawnEmbers(x: number, y: number): void {
    const created: EmberParticle[] = [];
    for (let i = 0; i < 6; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 18 + Math.random() * 24;
      created.push({
        id: particleIdCounter++,
        x,
        y,
        ex: (Math.cos(angle) * dist).toFixed(1) + 'px',
        ey: (Math.sin(angle) * dist - 10).toFixed(1) + 'px',
      });
    }
    emberParticles = [...emberParticles, ...created];
    const ids = new Set(created.map((p) => p.id));
    setTimeout(() => {
      emberParticles = emberParticles.filter((p) => !ids.has(p.id));
    }, 650);
  }

  function spawnClickPop(evt: { clientX: number; clientY: number } | null, val: number, isHot: boolean, isWarm: boolean): void {
    const rect = stageEl.getBoundingClientRect();
    let x = rect.width / 2;
    let y = rect.height / 2;
    if (evt) {
      x = evt.clientX - rect.left;
      y = evt.clientY - rect.top;
    }
    const id = particleIdCounter++;
    clickPops = [...clickPops, { id, x, y, text: '+' + fmt(val), cls: isHot ? 'hot' : isWarm ? 'warm' : '' }];
    setTimeout(() => {
      clickPops = clickPops.filter((p) => p.id !== id);
    }, 1200);
    spawnSparkParticles(x, y);
    if (isHot) spawnEmbers(x, y);
  }

  function spawnMassDriverStreak(): void {
    const rect = stageEl.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const angle = Math.random() * Math.PI * 2;
    const startR = (planetEl?.offsetWidth || 180) / 2 + 6;
    const id = particleIdCounter++;
    streaks = [
      ...streaks,
      { id, left: cx + Math.cos(angle) * startR, top: cy + Math.sin(angle) * startR, angleDeg: (angle * 180) / Math.PI },
    ];
    setTimeout(() => {
      streaks = streaks.filter((s) => s.id !== id);
    }, 760);
  }

  // ---------------------------------------------------------
  // Clic — extraction manuelle d'énergie
  // ---------------------------------------------------------
  let lastStageTouchAt = 0;

  function handleClick(evt: { clientX: number; clientY: number } | null): void {
    gauge.registerClick();
    const reading = gauge.tick(!!game.activeBonus?.def.forceHot);
    const speedMult = getSpeedMultiplier(reading.cps);
    const activeDef = def;
    const val = game.applyClick(speedMult);
    registerClickContribution(val, activeDef.id);
    ensureAudio();
    playClickTone(activeDef.clickMult * 4 + (reading.hot ? 220 : reading.warm ? 100 : 0));
    spawnClickPop(evt, val, reading.hot, reading.warm);
  }

  function onTouchStart(e: TouchEvent): void {
    e.preventDefault();
    lastStageTouchAt = Date.now();
    const touch = e.changedTouches[0];
    handleClick(touch ? { clientX: touch.clientX, clientY: touch.clientY } : null);
  }
  function onClick(e: MouseEvent): void {
    if (Date.now() - lastStageTouchAt < 500) return;
    handleClick(e);
  }

  onMount(() => {
    requestAnimationFrame(orbitLoop);
    const gaugeIv = setInterval(() => {
      gauge.tick(!!game.activeBonus?.def.forceHot);
    }, 100);
    const ambianceIv = setInterval(() => {
      if (game.activePlanetId === 'moon' && (game.planetState('moon').buildings.railgun ?? 0) > 0) {
        spawnMassDriverStreak();
      }
    }, 1400);
    return () => {
      clearInterval(gaugeIv);
      clearInterval(ambianceIv);
    };
  });
</script>

<div
  bind:this={stageEl}
  id="stage"
  role="button"
  tabindex="0"
  aria-label="Cliquer sur l'astre pour extraire de l'énergie"
  ontouchstart={onTouchStart}
  onclick={onClick}
  onkeydown={activateOnEnterOrSpace(() => handleClick(null))}
>
  <div id="atmosphere-halo" style="opacity:{haloOpacity}; filter:blur({haloBlur}); transform:scale({haloScale});"></div>
  <div id="orbit-layer">
    {#each markerSpecs as m (m.id)}
      <div class="marker-icon" class:capstone-icon={m.isCapstone} title={m.icon} use:markerRef={m.id}>{m.icon}</div>
    {/each}
    {#if stargate}
      {@const ringSize = (planetEl?.offsetWidth || 180) * (1.35 + stargate.capped * 0.12)}
      <div
        class="stargate-ring"
        style="width:{ringSize}px; height:{ringSize}px; left:50%; top:50%; transform:translate(-50%,-50%); opacity:{stargate.opacity};"
      ></div>
      {#each stargate.particles as angle, i (i)}
        {@const pr = ringSize / 2}
        <div class="gate-particle" style="left:calc(50% + {Math.cos(angle) * pr}px); top:calc(50% + {Math.sin(angle) * pr}px);"></div>
      {/each}
    {/if}
  </div>
  <div id="planet-wobble">
    <div bind:this={planetEl} id="planet" style="background:{planetBackground}; --planet-glow:{def.glow};">
      {#each cityLights as light, i (i)}
        <div class="city-light" style="left:{light.left}%; top:{light.top}%; animation-delay:{light.delay};"></div>
      {/each}
      {#if terraform?.hazeOpacity}
        <div class="haze-layer" style="opacity:{terraform.hazeOpacity};"></div>
      {/if}
      {#each crackLines as crack, i (i)}
        <div
          class="crack-line"
          style="width:{(planetEl?.offsetWidth || 180) *
            crack.widthPct}px; transform:rotate({crack.angle}deg); animation-delay:{crack.delay};"
        ></div>
      {/each}
    </div>
  </div>

  <div id="click-gauge" class:warm={gauge.warm} class:hot={gauge.hot}>
    <svg class="gauge-svg" viewBox="0 0 120 70" width="100" height="58">
      <path d="M8,64 A52,52 0 0 1 112,64" fill="none" stroke="rgba(255,255,255,.15)" stroke-width="7" stroke-linecap="round" />
      <path
        d="M8,64 A52,52 0 0 1 112,64"
        fill="none"
        stroke="url(#gaugeGrad)"
        stroke-width="7"
        stroke-linecap="round"
        stroke-dasharray={GAUGE_ARC_LEN}
        stroke-dashoffset={arcOffset}
      />
      <defs>
        <linearGradient id="gaugeGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stop-color="#00d9ff" />
          <stop offset="0.55" stop-color="#ffb020" />
          <stop offset="1" stop-color="#ff3d1a" />
        </linearGradient>
      </defs>
      <line class="gauge-tick" x1="14.7" y1="56.0" x2="6.8" y2="54.6" />
      <line class="gauge-tick" x1="30.4" y1="28.8" x2="25.3" y2="22.6" />
      <line class="gauge-tick" x1="60" y1="18" x2="60" y2="10" />
      <line class="gauge-tick" x1="90.4" y1="28.8" x2="94.7" y2="22.6" />
      <line class="gauge-tick" x1="105.3" y1="56.0" x2="113.2" y2="54.6" />
      <text class="gauge-tier-icon" x="50.8" y="25.1" text-anchor="middle">⚡</text>
      <text class="gauge-fire-icon" x="92.1" y="40.1" text-anchor="middle">🔥</text>
      <g id="gauge-needle-group" style="transform-origin:60px 64px; transform:rotate({needleAngle});">
        <rect class="gauge-needle-tail" x="57.5" y="64" width="5" height="9" rx="2" />
        <polygon class="gauge-needle-blade" points="60,21 63,60 60,64 57,60" />
      </g>
      <circle class="gauge-pivot-cap" cx="60" cy="64" r="5.5" />
    </svg>
    <div class="gauge-readout-row">
      <span class="gauge-readout">{gauge.cps.toFixed(1)}</span>
      <span class="gauge-label">C/S</span>
    </div>
  </div>

  {#each streaks as s (s.id)}
    <div class="streak" style="left:{s.left}px; top:{s.top}px; --angle:{s.angleDeg}deg;"></div>
  {/each}
  {#each sparkParticles as p (p.id)}
    <div
      class="spark-particle"
      style="left:{p.x}px; top:{p.y}px; background:{p.color}; box-shadow:0 0 5px {p.color}; --dx:{p.dx}; --dy:{p.dy}; --fall:{p.fall}; --spin:{p.spin};"
    ></div>
  {/each}
  {#each emberParticles as p (p.id)}
    <div class="ember" style="left:{p.x}px; top:{p.y}px; --ex:{p.ex}; --ey:{p.ey};"></div>
  {/each}
  {#each clickPops as p (p.id)}
    <div class="click-pop {p.cls}" style="left:{p.x}px; top:{p.y}px;">{p.text}</div>
  {/each}
  {#if fx.firstBuild}
    <div class="first-build-fx">
      <div class="first-build-ring"></div>
      <div class="first-build-icon">{fx.firstBuild.icon}</div>
      <div class="first-build-text">{fx.firstBuild.name} déployée !</div>
    </div>
  {/if}
</div>
