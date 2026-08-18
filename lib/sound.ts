// Tiny WebAudio helpers — synthesized temple sounds, no asset files needed.
let ctx: AudioContext | null = null;

function ac(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const C = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!C) return null;
    ctx = new C();
  }
  if (ctx.state === "suspended") void ctx.resume().catch(() => undefined);
  return ctx;
}

type AmbientState = {
  master: GainNode;
  drones: OscillatorNode[];
  timer: number;
  muted: boolean;
};

let ambient: AmbientState | null = null;

function ambientNote(c: AudioContext, master: GainNode, frequency: number, duration: number, delay = 0) {
  const start = c.currentTime + delay;
  const osc = c.createOscillator();
  const gain = c.createGain();
  const filter = c.createBiquadFilter();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(frequency, start);
  osc.frequency.linearRampToValueAtTime(frequency * 1.006, start + duration * 0.52);
  osc.frequency.linearRampToValueAtTime(frequency, start + duration);
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(1700, start);
  filter.frequency.linearRampToValueAtTime(2600, start + duration * 0.35);
  filter.frequency.linearRampToValueAtTime(1500, start + duration);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(0.055, start + 0.18);
  gain.gain.setValueAtTime(0.055, start + duration * 0.55);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(filter);
  filter.connect(gain);
  gain.connect(master);
  osc.start(start);
  osc.stop(start + duration + 0.05);
}

/** Starts a quiet, generated veena/flute-like ambient bed for the mala screen. */
export function startAmbient() {
  const c = ac();
  if (!c) return;
  if (ambient) return;

  const master = c.createGain();
  master.gain.setValueAtTime(0.045, c.currentTime);
  master.connect(c.destination);

  const drones = [130.81, 196.0].map((frequency, index) => {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = index === 0 ? "sine" : "triangle";
    osc.frequency.value = frequency;
    gain.gain.value = index === 0 ? 0.12 : 0.055;
    osc.connect(gain);
    gain.connect(master);
    osc.start();
    return osc;
  });

  ambient = { master, drones, timer: 0, muted: false };
  const notes = [261.63, 293.66, 329.63, 392.0, 329.63, 293.66];
  let index = 0;
  const loop = () => {
    if (!ambient) return;
    ambientNote(c, master, notes[index % notes.length], 4.8, 0.08);
    index += 1;
    ambient.timer = window.setTimeout(loop, 4800);
  };
  loop();
}

export function setAmbientMuted(muted: boolean) {
  if (!ambient || !ctx) return;
  ambient.muted = muted;
  const now = ctx.currentTime;
  ambient.master.gain.cancelScheduledValues(now);
  ambient.master.gain.setTargetAtTime(muted ? 0.0001 : 0.045, now, 0.08);
}

export function stopAmbient() {
  if (!ambient) return;
  window.clearTimeout(ambient.timer);
  ambient.drones.forEach((osc) => {
    try { osc.stop(); } catch { /* already stopped */ }
  });
  ambient.master.disconnect();
  ambient = null;
}

export function bell(freq = 640, dur = 1.8, gain = 0.22) {
  const c = ac();
  if (!c) return;
  const t = c.currentTime;
  const mk = (f: number, g: number, type: OscillatorType, d: number) => {
    const o = c.createOscillator();
    const ga = c.createGain();
    o.type = type;
    o.frequency.value = f;
    o.connect(ga);
    ga.connect(c.destination);
    ga.gain.setValueAtTime(0, t);
    ga.gain.linearRampToValueAtTime(g, t + 0.008);
    ga.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.start(t);
    o.stop(t + d);
  };
  mk(freq, gain, "triangle", dur);
  mk(freq * 2.01, gain * 0.45, "sine", dur * 0.7);
  mk(freq * 2.78, gain * 0.2, "sine", dur * 0.5);
}

export function ting() {
  bell(880, 0.7, 0.12);
}

export function conch() {
  const c = ac();
  if (!c) return;
  const t = c.currentTime;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = "sawtooth";
  o.frequency.setValueAtTime(180, t);
  o.frequency.linearRampToValueAtTime(240, t + 0.4);
  o.frequency.linearRampToValueAtTime(220, t + 1.6);
  const f = c.createBiquadFilter();
  f.type = "lowpass";
  f.frequency.value = 900;
  o.connect(f);
  f.connect(g);
  g.connect(c.destination);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(0.16, t + 0.25);
  g.gain.setValueAtTime(0.16, t + 1.3);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 1.9);
  o.start(t);
  o.stop(t + 1.9);
}
