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

// Real recorded samples (CC-licensed, from Wikimedia Commons) for the temple
// bell and conch — decoded once into AudioBuffers and replayed with low latency.
const buffers: Record<string, AudioBuffer | undefined> = {};
const loadingSample: Record<string, Promise<AudioBuffer | null> | undefined> = {};

function loadSample(url: string): Promise<AudioBuffer | null> {
  const c = ac();
  if (!c) return Promise.resolve(null);
  if (buffers[url]) return Promise.resolve(buffers[url]!);
  if (loadingSample[url]) return loadingSample[url]!;
  loadingSample[url] = fetch(url)
    .then((r) => r.arrayBuffer())
    .then((b) => c.decodeAudioData(b))
    .then((buf) => { buffers[url] = buf; return buf; })
    .catch(() => null);
  return loadingSample[url]!;
}

function playSample(url: string, volume = 1, rate = 1) {
  const c = ac();
  if (!c) return;
  void loadSample(url).then((buf) => {
    if (!buf || !ctx) return;
    const src = c.createBufferSource();
    src.buffer = buf;
    src.playbackRate.value = rate;
    const g = c.createGain();
    g.gain.value = volume;
    src.connect(g);
    g.connect(c.destination);
    src.start();
  });
}

/** Preload the temple samples so the first ring/blow has no fetch delay. */
export function preloadTempleSounds() {
  void loadSample("/sounds/bell.wav");
  void loadSample("/sounds/conch.wav");
}

/** The temple bell — a real recorded brass bell. Args kept for compatibility;
 *  `gain` maps to playback volume. */
export function bell(_freq = 640, _dur = 1.8, gain = 0.22) {
  playSample("/sounds/bell.wav", Math.min(1, gain * 3.4));
}

/** A short, crisp synth tick for mala beads — deliberately not the big bell. */
export function ting() {
  const c = ac();
  if (!c) return;
  const t = c.currentTime;
  const o = c.createOscillator();
  const ga = c.createGain();
  o.type = "triangle";
  o.frequency.value = 880;
  o.connect(ga);
  ga.connect(c.destination);
  ga.gain.setValueAtTime(0, t);
  ga.gain.linearRampToValueAtTime(0.12, t + 0.006);
  ga.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
  o.start(t);
  o.stop(t + 0.5);
}

/** The conch (shankh) — a real recorded blow. */
export function conch() {
  playSample("/sounds/conch.wav", 0.95);
}
