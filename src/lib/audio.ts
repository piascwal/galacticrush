// Web Audio API, oscillateurs purs — pas de fichiers audio à charger.
let audioCtx: AudioContext | null = null;

interface WindowWithWebkitAudio {
  webkitAudioContext?: typeof AudioContext;
}

export function ensureAudio(): AudioContext | null {
  if (!audioCtx) {
    try {
      const Ctor = window.AudioContext ?? (window as unknown as WindowWithWebkitAudio).webkitAudioContext;
      audioCtx = Ctor ? new Ctor() : null;
    } catch {
      audioCtx = null;
    }
  }
  return audioCtx;
}

export function playClickTone(pitchBoost = 0): void {
  const ctx = ensureAudio();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  const base = 340 + pitchBoost;
  osc.frequency.setValueAtTime(base, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(base * 0.6, ctx.currentTime + 0.12);
  gain.gain.setValueAtTime(0.08, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.15);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.16);
}

export function playUnlockTone(): void {
  const ctx = ensureAudio();
  if (!ctx) return;
  [440, 554, 659, 880].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.07);
    gain.gain.setValueAtTime(0.06, ctx.currentTime + i * 0.07);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + i * 0.07 + 0.3);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime + i * 0.07);
    osc.stop(ctx.currentTime + i * 0.07 + 0.32);
  });
}

export function playBuildTone(): void {
  const ctx = ensureAudio();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'square';
  osc.frequency.setValueAtTime(220, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.1);
  gain.gain.setValueAtTime(0.04, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.18);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.2);
}
