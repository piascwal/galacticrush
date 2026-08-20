<script lang="ts">
  import { onMount } from 'svelte';
  import { game } from '../state/gameState.svelte';
  import { ClickGauge, GAUGE_ARC_LEN, getSpeedMultiplier } from '../systems/gauge.svelte';
  import { comet } from '../systems/comet.svelte';
  import { fx } from '../systems/fx.svelte';
  import { ensureAudio, playClickTone } from '../audio';
  import { fmt } from '../format';
  import { registerClickContribution } from '../systems/clickBoost';
  import { EARTH_CITY_SPOTS, CRACK_ANGLES, lerpColor } from '../systems/planetVisual';

  let stageEl: HTMLDivElement;
  let planetEl: HTMLDivElement | undefined = $state();
  let cometElBinding: HTMLDivElement | null = $state(null);

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
      delay: i * 0.22 + 's'
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
      particles: Array.from({ length: particleCount }, (_, i) => (i / particleCount) * Math.PI * 2)
    };
  });

  const planetBackground = $derived(terraform?.background ?? def.gradient);

  // ---------------------------------------------------------
  // Anneaux orbitaux de bâtiments — angle continu géré hors réactivité Svelte
  // (mutation directe du style à chaque frame, comme dans la version d'origine)
  // ---------------------------------------------------------
  interface MarkerSpec { id: string; icon: string; isCapstone: boolean; }
  interface MarkerPhysics { angle: number; speed: number; radiusX: number; radiusY: number; el: HTMLElement | null }

  let markerSpecs: MarkerSpec[] = $state([]);
  const physicsMap = new Map<string, MarkerPhysics>();

  function markerRef(node: HTMLElement, id: string) {
    const entry = physicsMap.get(id);
    if (entry) entry.el = node;
    return { destroy() { physicsMap.delete(id); } };
  }

  $effect(() => {
    const d = def;
    const state = ps;
    const planetSize = planetEl?.offsetWidth || 180;
    const lastIndex = d.buildings.length - 1;
    const specs: MarkerSpec[] = [];
    physicsMap.clear();
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
        physicsMap.set(id, { angle: (k / count) * Math.PI * 2, speed, radiusX, radiusY, el: null });
      }
    });
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
  // Particules (étincelles, escarbilles, click-pop) — DOM direct, transitoire
  // ---------------------------------------------------------
  function spawnSparkParticles(x: number, y: number): void {
    const color = def.glow;
    const count = 4 + Math.floor(Math.random() * 3);
    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'spark-particle';
      const angle = Math.PI + Math.random() * Math.PI;
      const speed = 30 + Math.random() * 45;
      const dx = Math.cos(angle) * speed;
      const dy = Math.sin(angle) * speed * 0.7;
      p.style.setProperty('--dx', dx.toFixed(1) + 'px');
      p.style.setProperty('--dy', dy.toFixed(1) + 'px');
      p.style.setProperty('--fall', (70 + Math.random() * 55).toFixed(0) + 'px');
      p.style.setProperty('--spin', (Math.random() * 180 - 90).toFixed(0) + 'deg');
      p.style.left = x + 'px';
      p.style.top = y + 'px';
      p.style.background = color;
      p.style.boxShadow = '0 0 5px ' + color;
      stageEl.appendChild(p);
      setTimeout(() => p.remove(), 900);
    }
  }

  function spawnEmbers(x: number, y: number): void {
    for (let i = 0; i < 6; i++) {
      const ember = document.createElement('div');
      ember.className = 'ember';
      const angle = Math.random() * Math.PI * 2;
      const dist = 18 + Math.random() * 24;
      ember.style.left = x + 'px';
      ember.style.top = y + 'px';
      ember.style.setProperty('--ex', (Math.cos(angle) * dist).toFixed(1) + 'px');
      ember.style.setProperty('--ey', (Math.sin(angle) * dist - 10).toFixed(1) + 'px');
      stageEl.appendChild(ember);
      setTimeout(() => ember.remove(), 650);
    }
  }

  function spawnClickPop(evt: { clientX: number; clientY: number } | null, val: number, isHot: boolean, isWarm: boolean): void {
    const rect = stageEl.getBoundingClientRect();
    let x = rect.width / 2;
    let y = rect.height / 2;
    if (evt) {
      x = evt.clientX - rect.left;
      y = evt.clientY - rect.top;
    }
    const pop = document.createElement('div');
    pop.className = 'click-pop' + (isHot ? ' hot' : isWarm ? ' warm' : '');
    pop.textContent = '+' + fmt(val);
    pop.style.left = x + 'px';
    pop.style.top = y + 'px';
    stageEl.appendChild(pop);
    setTimeout(() => pop.remove(), 1200);
    spawnSparkParticles(x, y);
    if (isHot) spawnEmbers(x, y);
  }

  function spawnMassDriverStreak(): void {
    const rect = stageEl.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const angle = Math.random() * Math.PI * 2;
    const streak = document.createElement('div');
    streak.className = 'streak';
    const startR = (planetEl?.offsetWidth || 180) / 2 + 6;
    streak.style.left = cx + Math.cos(angle) * startR + 'px';
    streak.style.top = cy + Math.sin(angle) * startR + 'px';
    streak.style.transform = 'rotate(' + (angle * 180) / Math.PI + 'deg)';
    stageEl.appendChild(streak);
    let dist = startR;
    const speed = 6;
    const iv = setInterval(() => {
      dist += speed;
      streak.style.left = cx + Math.cos(angle) * dist + 'px';
      streak.style.top = cy + Math.sin(angle) * dist + 'px';
      streak.style.opacity = String(Math.max(0, 1 - (dist - startR) / 140));
      if (dist - startR > 150) {
        clearInterval(iv);
        streak.remove();
      }
    }, 30);
  }

  // ---------------------------------------------------------
  // Effet "première construction"
  // ---------------------------------------------------------
  $effect(() => {
    const req = fx.firstBuild;
    if (!req || !stageEl) return;
    const el = document.createElement('div');
    el.className = 'first-build-fx';
    el.innerHTML =
      '<div class="first-build-ring"></div>' +
      `<div class="first-build-icon">${req.icon}</div>` +
      `<div class="first-build-text">${req.name} déployée !</div>`;
    stageEl.appendChild(el);
    setTimeout(() => el.remove(), 1650);
  });

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
    const gaugeIv = setInterval(() => { gauge.tick(!!game.activeBonus?.def.forceHot); }, 100);
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

  $effect(() => {
    comet.bindElement(cometElBinding);
  });
</script>

<div bind:this={stageEl} id="stage" ontouchstart={onTouchStart} onclick={onClick}>
  <div id="atmosphere-halo" style="opacity:{haloOpacity}; filter:blur({haloBlur}); transform:scale({haloScale});"></div>
  <div id="orbit-layer">
    {#each markerSpecs as m (m.id)}
      <div class="marker-icon" class:capstone-icon={m.isCapstone} title={m.icon} use:markerRef={m.id}>{m.icon}</div>
    {/each}
    {#if stargate}
      {@const ringSize = (planetEl?.offsetWidth || 180) * (1.35 + stargate.capped * 0.12)}
      <div class="stargate-ring" style="width:{ringSize}px; height:{ringSize}px; left:50%; top:50%; transform:translate(-50%,-50%); opacity:{stargate.opacity};"></div>
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
        <div class="crack-line" style="width:{(planetEl?.offsetWidth || 180) * crack.widthPct}px; transform:rotate({crack.angle}deg); animation-delay:{crack.delay};"></div>
      {/each}
    </div>
  </div>

  <div id="click-gauge" class:warm={gauge.warm} class:hot={gauge.hot}>
    <svg class="gauge-svg" viewBox="0 0 120 70" width="100" height="58">
      <path d="M8,64 A52,52 0 0 1 112,64" fill="none" stroke="rgba(255,255,255,.15)" stroke-width="7" stroke-linecap="round" />
      <path d="M8,64 A52,52 0 0 1 112,64" fill="none" stroke="url(#gaugeGrad)" stroke-width="7" stroke-linecap="round" stroke-dasharray={GAUGE_ARC_LEN} stroke-dashoffset={arcOffset} />
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

  {#if comet.active}
    {@const c = comet.active}
    <div
      bind:this={cometElBinding}
      class="cosmic-comet"
      style="--sx:{c.sx}px; --sy:{c.sy}px; --ex:{c.ex}px; --ey:{c.ey}px; --angle:{c.angle}deg; --duration:{c.duration}s;"
    ></div>
  {/if}
  {#if comet.flash}
    <div class="comet-flash" style="left:{comet.flash.x}px; top:{comet.flash.y}px;"></div>
  {/if}
</div>
