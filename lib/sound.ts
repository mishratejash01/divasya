// Tiny WebAudio helpers — synthesized temple sounds, no asset files needed.
let ctx: AudioContext | null = null;

function ac(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const C = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!C) return null;
    ctx = new C();
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
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
