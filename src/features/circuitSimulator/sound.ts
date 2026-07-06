// Small synthesized sound-effect engine (Web Audio API only, no audio files).
// Browsers require a user gesture before audio can play, so we lazily create
// the AudioContext on the first pointerdown anywhere on the page.

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

if (typeof window !== 'undefined') {
  const unlock = () => getCtx();
  window.addEventListener('pointerdown', unlock, { once: true, passive: true });
}

let soundEnabled = false;
export function setSoundEnabled(enabled: boolean) {
  soundEnabled = enabled;
}

function noiseBuffer(c: AudioContext, durationSec: number): AudioBuffer {
  const buffer = c.createBuffer(1, Math.max(1, Math.floor(c.sampleRate * durationSec)), c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  return buffer;
}

/** Short mechanical click - breaker toggle, switch flip, relay clack. */
export function playClick(pitch: 'high' | 'low' = 'high') {
  const c = getCtx();
  if (!c || !soundEnabled) return;
  const now = c.currentTime;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = 'square';
  osc.frequency.value = pitch === 'high' ? 1400 : 700;
  gain.gain.setValueAtTime(0.16, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
  osc.connect(gain).connect(c.destination);
  osc.start(now);
  osc.stop(now + 0.06);
}

/** Sharp "pop" - a fuse blowing. */
export function playFusePop() {
  const c = getCtx();
  if (!c || !soundEnabled) return;
  const now = c.currentTime;
  const src = c.createBufferSource();
  src.buffer = noiseBuffer(c, 0.18);
  const filter = c.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(2200, now);
  filter.frequency.exponentialRampToValueAtTime(200, now + 0.16);
  const gain = c.createGain();
  gain.gain.setValueAtTime(0.5, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
  src.connect(filter).connect(gain).connect(c.destination);
  src.start(now);
}

/** Electrical buzz/spark - short circuit. */
export function playSpark() {
  const c = getCtx();
  if (!c || !soundEnabled) return;
  const now = c.currentTime;
  const osc = c.createOscillator();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(90, now);
  osc.frequency.linearRampToValueAtTime(60, now + 0.3);

  const trem = c.createOscillator();
  trem.frequency.value = 55;
  const tremGain = c.createGain();
  tremGain.gain.value = 0.5;
  trem.connect(tremGain);

  const gain = c.createGain();
  gain.gain.setValueAtTime(0.001, now);
  gain.gain.linearRampToValueAtTime(0.22, now + 0.02);
  tremGain.connect(gain.gain);
  gain.gain.setValueAtTime(0.22, now + 0.28);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

  osc.connect(gain).connect(c.destination);
  osc.start(now);
  trem.start(now);
  osc.stop(now + 0.42);
  trem.stop(now + 0.42);
}

