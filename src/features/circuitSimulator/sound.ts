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

let soundEnabled = true;
export function setSoundEnabled(enabled: boolean) {
  soundEnabled = enabled;
}
export function isSoundEnabled() {
  return soundEnabled;
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

interface Hum {
  osc: OscillatorNode;
  gain: GainNode;
}

const hums = new Map<string, Hum>();

/** Continuous motor hum, keyed by component id so each motor has its own voice. */
export function setMotorHum(id: string, opts: { active: boolean; frequency: number; volume: number }) {
  const c = getCtx();
  if (!c) return;
  const now = c.currentTime;

  if (!opts.active || !soundEnabled) {
    const existing = hums.get(id);
    if (existing) {
      existing.gain.gain.cancelScheduledValues(now);
      existing.gain.gain.setValueAtTime(existing.gain.gain.value, now);
      existing.gain.gain.linearRampToValueAtTime(0, now + 0.15);
      existing.osc.stop(now + 0.16);
      hums.delete(id);
    }
    return;
  }

  let hum = hums.get(id);
  if (!hum) {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = 'triangle';
    osc.frequency.value = opts.frequency;
    gain.gain.value = 0;
    osc.connect(gain).connect(c.destination);
    osc.start(now);
    hum = { osc, gain };
    hums.set(id, hum);
    hum.gain.gain.linearRampToValueAtTime(opts.volume, now + 0.12);
  } else {
    hum.osc.frequency.cancelScheduledValues(now);
    hum.osc.frequency.linearRampToValueAtTime(opts.frequency, now + 0.12);
    hum.gain.gain.cancelScheduledValues(now);
    hum.gain.gain.linearRampToValueAtTime(opts.volume, now + 0.12);
  }
}

export function stopAllHums() {
  const c = getCtx();
  const now = c?.currentTime ?? 0;
  for (const [, hum] of hums) {
    hum.gain.gain.cancelScheduledValues(now);
    hum.gain.gain.setValueAtTime(hum.gain.gain.value, now);
    hum.gain.gain.linearRampToValueAtTime(0, now + 0.1);
    hum.osc.stop(now + 0.12);
  }
  hums.clear();
}
