/**
 author: Francis/ GuittZoom
 data: 2026-04-27 
 title: altar sonoro 
 subtitle: "Estados Alterados de Consciência · Cura · Natureza"
 */

/* ════════════════════════════════════════════
   COSMOS SETUP
════════════════════════════════════════════ */
const cosmos = document.getElementById("cosmos");
for (let i = 0; i < 60; i++) {
  const s = document.createElement("div");
  s.className = "star";
  const sz = Math.random() * 1.8 + 0.3;
  s.style.cssText = `width:${sz}px;height:${sz}px;top:${Math.random() * 100}%;left:${Math.random() * 100}%;--d:${(Math.random() * 5 + 2).toFixed(1)}s;--o:${(Math.random() * 0.6 + 0.1).toFixed(2)};animation-delay:${(Math.random() * 6).toFixed(1)}s`;
  cosmos.appendChild(s);
}
const sacred = document.getElementById("sacred");
[300, 500, 700, 900, 1100].forEach((sz, i) => {
  const r = document.createElement("div");
  r.className = "geo-ring";
  r.style.cssText = `width:${sz}px;height:${sz}px;--gs:${70 + i * 25}s;${i % 2 ? "animation-direction:reverse" : ""}`;
  sacred.appendChild(r);
});
[0, 1].forEach((i) => {
  const r = document.createElement("div");
  r.className = "pulse-ring";
  r.style.cssText = `width:400px;height:400px;--pd:${5 + i * 1.5}s;animation-delay:${i * 1.3}s`;
  sacred.appendChild(r);
});

/* ════════════════════════════════════════════
   AUDIO CONTEXT
════════════════════════════════════════════ */
let ACX = null;
let masterGain = null;
let globalAnalyser = null;
let globalRafId = null;
let timerInt = null;
let elapsed = 0;

function ensureContext() {
  if (ACX) return;
  ACX = new (window.AudioContext || window.webkitAudioContext)();
  masterGain = ACX.createGain();
  masterGain.gain.value = 0; // começa mudo — sobe quando o primeiro som ligar
  globalAnalyser = ACX.createAnalyser();
  globalAnalyser.fftSize = 1024;
  masterGain.connect(globalAnalyser);
  globalAnalyser.connect(ACX.destination);
  drawGlobalVis();
}

document.getElementById("masterVol").addEventListener("input", (e) => {
  if (!masterGain) return;
  // Aplica imediatamente — sem rampa — para resposta instantânea ao slider
  masterGain.gain.cancelScheduledValues(ACX.currentTime);
  masterGain.gain.setValueAtTime(e.target.value / 100, ACX.currentTime);
});

/* ════════════════════════════════════════════
   DATA DEFINITIONS
════════════════════════════════════════════ */

const BINAURAL = [
  {
    id: "delta",
    icon: "🌊",
    name: "Delta",
    badge: "0.5–4 Hz",
    accent: "#818cf8",
    glow: "rgba(129,140,248,.35)",
    desc: "Sono profundo, cura celular, inconsciente profundo",
    freqs: [
      { l: "0.5", v: 0.5 },
      { l: "1", v: 1 },
      { l: "2", v: 2 },
      { l: "3", v: 3 },
      { l: "4", v: 4 },
    ],
    defFreq: 0.5,
    base: 120,
  },
  {
    id: "theta",
    icon: "🔮",
    name: "Teta",
    badge: "4–8 Hz",
    accent: "#7c3aed",
    glow: "rgba(124,58,237,.4)",
    desc: "Meditação profunda, sonhos lúcidos, criatividade",
    freqs: [
      { l: "4", v: 4 },
      { l: "5", v: 5 },
      { l: "6", v: 6 },
      { l: "7", v: 7 },
      { l: "8", v: 8 },
    ],
    defFreq: 6,
    base: 200,
  },
  {
    id: "alpha",
    icon: "✨",
    name: "Alpha",
    badge: "8–14 Hz",
    accent: "#22d3ee",
    glow: "rgba(34,211,238,.35)",
    desc: "Relaxamento, foco tranquilo, estado de flow",
    freqs: [
      { l: "8", v: 8 },
      { l: "10", v: 10 },
      { l: "12", v: 12 },
      { l: "14", v: 14 },
    ],
    defFreq: 10,
    base: 220,
  },
  {
    id: "beta",
    icon: "⚡",
    name: "Beta",
    badge: "14–30 Hz",
    accent: "#f59e0b",
    glow: "rgba(245,158,11,.35)",
    desc: "Foco intenso, cognição elevada, alerta mental",
    freqs: [
      { l: "14", v: 14 },
      { l: "18", v: 18 },
      { l: "22", v: 22 },
      { l: "30", v: 30 },
    ],
    defFreq: 18,
    base: 240,
  },
  {
    id: "gamma",
    icon: "🌟",
    name: "Gamma",
    badge: "30–100 Hz",
    accent: "#f0d080",
    glow: "rgba(240,208,128,.4)",
    desc: "Consciência expandida, insight místico, êxtase",
    freqs: [
      { l: "30", v: 30 },
      { l: "40", v: 40 },
      { l: "60", v: 60 },
      { l: "80", v: 80 },
      { l: "100", v: 100 },
    ],
    defFreq: 40,
    base: 280,
  },
  {
    id: "epsilon",
    icon: "🕳️",
    name: "Epsilon",
    badge: "0.1–0.5 Hz",
    accent: "#e11d48",
    glow: "rgba(225,29,72,.35)",
    desc: "Estado samadhi, dissolução do ego, vazio consciente",
    freqs: [
      { l: "0.1", v: 0.1 },
      { l: "0.2", v: 0.2 },
      { l: "0.3", v: 0.3 },
      { l: "0.5", v: 0.5 },
    ],
    defFreq: 0.2,
    base: 100,
  },
  {
    id: "lambda",
    icon: "🌀",
    name: "Lambda",
    badge: "100–200 Hz",
    accent: "#10b981",
    glow: "rgba(16,185,129,.35)",
    desc: "Hiper-consciência, experiências fora do corpo",
    freqs: [
      { l: "100", v: 100 },
      { l: "150", v: 150 },
      { l: "200", v: 200 },
    ],
    defFreq: 150,
    base: 320,
  },
  {
    id: "schumann",
    icon: "🌍",
    name: "Schumann",
    badge: "7.83 Hz",
    accent: "#34d399",
    glow: "rgba(52,211,153,.35)",
    desc: "Ressonância da Terra, sincronização planetária",
    freqs: [
      { l: "7.83", v: 7.83 },
      { l: "14.3", v: 14.3 },
      { l: "20.8", v: 20.8 },
    ],
    defFreq: 7.83,
    base: 194,
  },
];

const SOLFEGGIO = [
  {
    id: "sol174",
    icon: "🔴",
    name: "174 Hz",
    badge: "Anestesia",
    accent: "#ef4444",
    glow: "rgba(239,68,68,.35)",
    desc: "Reduz dor, dá segurança e amor à órgãos",
  },
  {
    id: "sol285",
    icon: "🟠",
    name: "285 Hz",
    badge: "Regeneração",
    accent: "#f97316",
    glow: "rgba(249,115,22,.35)",
    desc: "Regenera tecidos, cura feridas energéticas",
  },
  {
    id: "sol396",
    icon: "🟡",
    name: "396 Hz",
    badge: "Libertação",
    accent: "#eab308",
    glow: "rgba(234,179,8,.35)",
    desc: "Liberta medo e culpa, ativa raiz",
  },
  {
    id: "sol417",
    icon: "🟢",
    name: "417 Hz",
    badge: "Mudança",
    accent: "#22c55e",
    glow: "rgba(34,197,94,.35)",
    desc: "Facilita mudança, desfaz padrões negativos",
  },
  {
    id: "sol528",
    icon: "💚",
    name: "528 Hz",
    badge: "Amor/DNA",
    accent: "#10b981",
    glow: "rgba(16,185,129,.4)",
    desc: "Frequência do amor, reparação do DNA",
  },
  {
    id: "sol639",
    icon: "🔵",
    name: "639 Hz",
    badge: "Conexão",
    accent: "#3b82f6",
    glow: "rgba(59,130,246,.35)",
    desc: "Harmoniza relacionamentos, abre coração",
  },
  {
    id: "sol741",
    icon: "💜",
    name: "741 Hz",
    badge: "Expressão",
    accent: "#8b5cf6",
    glow: "rgba(139,92,246,.35)",
    desc: "Desperta intuição, limpa toxinas",
  },
  {
    id: "sol852",
    icon: "🟣",
    name: "852 Hz",
    badge: "Intuição",
    accent: "#a855f7",
    glow: "rgba(168,85,247,.35)",
    desc: "Retorna à ordem espiritual, abre terceiro olho",
  },
  {
    id: "sol963",
    icon: "⚪",
    name: "963 Hz",
    badge: "Iluminação",
    accent: "#e2e8f0",
    glow: "rgba(226,232,240,.3)",
    desc: "Conecta à luz divina, consciência cósmica",
  },
];

/* ════════════════════════════════════════════
   ACTIVE NODES REGISTRY
════════════════════════════════════════════ */
const activeNodes = {}; // id -> { left, right, gain, analyser }

/* ════════════════════════════════════════════
   BINAURAL ENGINE
════════════════════════════════════════════ */
function startBinaural(cfg) {
  ensureContext();
  if (activeNodes[cfg.id]) return;
  const gainNode = ACX.createGain();
  gainNode.gain.value = 0.5;
  const analyser = ACX.createAnalyser();
  analyser.fftSize = 512;
  const merger = ACX.createChannelMerger(2);
  const lOsc = ACX.createOscillator();
  lOsc.type = "sine";
  lOsc.frequency.value = cfg.base;
  const rOsc = ACX.createOscillator();
  rOsc.type = "sine";
  rOsc.frequency.value = cfg.base + cfg.beatFreq;
  const lG = ACX.createGain();
  lG.gain.value = 1;
  const rG = ACX.createGain();
  rG.gain.value = 1;
  lOsc.connect(lG);
  lG.connect(merger, 0, 0);
  rOsc.connect(rG);
  rG.connect(merger, 0, 1);
  merger.connect(gainNode);
  gainNode.connect(analyser);
  analyser.connect(masterGain);
  lOsc.start();
  rOsc.start();
  activeNodes[cfg.id] = {
    lOsc,
    rOsc,
    gainNode,
    analyser,
    lG,
    rG,
    merger,
  };
}

function stopBinaural(id) {
  const n = activeNodes[id];
  if (!n) return;
  try {
    n.lOsc.stop();
    n.rOsc.stop();
  } catch (e) {}
  delete activeNodes[id];
}

function updateBinauralFreq(cfg, beatFreq) {
  const n = activeNodes[cfg.id];
  if (!n) return;
  n.rOsc.frequency.setTargetAtTime(cfg.base + beatFreq, ACX.currentTime, 0.1);
}
function updateBinauralBase(cfg, base) {
  const n = activeNodes[cfg.id];
  if (!n) return;
  n.lOsc.frequency.setTargetAtTime(base, ACX.currentTime, 0.1);
  n.rOsc.frequency.setTargetAtTime(
    base + cfg.currentBeat,
    ACX.currentTime,
    0.1,
  );
}
function updateBinauralVol(id, vol) {
  const n = activeNodes[id];
  if (!n) return;
  n.gainNode.gain.setTargetAtTime(vol, ACX.currentTime, 0.05);
}

/* ════════════════════════════════════════════
   SOLFEGGIO ENGINE
════════════════════════════════════════════ */
function startSolfeggio(cfg) {
  ensureContext();
  if (activeNodes[cfg.id]) return;
  const gainNode = ACX.createGain();
  gainNode.gain.value = 0.4;
  const analyser = ACX.createAnalyser();
  analyser.fftSize = 512;
  // Pure tone + slight harmonics for warmth
  const osc = ACX.createOscillator();
  osc.type = "sine";
  osc.frequency.value = cfg.hz;
  const osc2 = ACX.createOscillator();
  osc2.type = "sine";
  osc2.frequency.value = cfg.hz * 2;
  const g2 = ACX.createGain();
  g2.gain.value = 0.15;
  osc.connect(gainNode);
  osc2.connect(g2);
  g2.connect(gainNode);
  gainNode.connect(analyser);
  analyser.connect(masterGain);
  osc.start();
  osc2.start();
  activeNodes[cfg.id] = { osc, osc2, gainNode, analyser };
}

function stopSolfeggio(id) {
  const n = activeNodes[id];
  if (!n) return;
  try {
    n.osc.stop();
    n.osc2.stop();
  } catch (e) {}
  delete activeNodes[id];
}
function updateSolVol(id, vol) {
  const n = activeNodes[id];
  if (!n) return;
  n.gainNode.gain.setTargetAtTime(vol, ACX.currentTime, 0.05);
}

/* ════════════════════════════════════════════
   NATURE SOUNDS ENGINE (Procedural)
════════════════════════════════════════════ */
const NATURE = [
  {
    id: "rain",
    icon: "🌧️",
    name: "Chuva no Telhado",
    badge: "Ruído Rosa",
    accent: "#60a5fa",
    glow: "rgba(96,165,250,.3)",
    desc: "Gotas suaves em telhado de zinco",
    type: "rain",
  },
  {
    id: "thunder",
    icon: "⛈️",
    name: "Tempestade",
    badge: "Trovão",
    accent: "#6366f1",
    glow: "rgba(99,102,241,.35)",
    desc: "Chuva pesada com trovões distantes",
    type: "thunder",
  },
  {
    id: "forest",
    icon: "🌲",
    name: "Floresta",
    badge: "Pássaros",
    accent: "#22c55e",
    glow: "rgba(34,197,94,.3)",
    desc: "Pássaros, vento entre folhas, riachos",
    type: "forest",
  },
  {
    id: "ocean",
    icon: "🌊",
    name: "Oceano",
    badge: "Ondas",
    accent: "#0ea5e9",
    glow: "rgba(14,165,233,.35)",
    desc: "Ondas quebrando na areia, brisa marinha",
    type: "ocean",
  },
  {
    id: "fire",
    icon: "🔥",
    name: "Fogueira",
    badge: "Crepitar",
    accent: "#f97316",
    glow: "rgba(249,115,22,.35)",
    desc: "Fogo crepitando, madeira estralando",
    type: "fire",
  },
  {
    id: "river",
    icon: "🏔️",
    name: "Riacho",
    badge: "Água Corrente",
    accent: "#34d399",
    glow: "rgba(52,211,153,.3)",
    desc: "Água correndo sobre pedras, natureza viva",
    type: "river",
  },
  {
    id: "wind",
    icon: "💨",
    name: "Vento",
    badge: "Brisa",
    accent: "#a78bfa",
    glow: "rgba(167,139,250,.3)",
    desc: "Vento suave passando em campo aberto",
    type: "wind",
  },
  {
    id: "cave",
    icon: "🦇",
    name: "Caverna",
    badge: "Eco Profundo",
    accent: "#94a3b8",
    glow: "rgba(148,163,184,.2)",
    desc: "Gotas em caverna, silêncio profundo",
    type: "cave",
  },
  {
    id: "crickets",
    icon: "🦗",
    name: "Grilos",
    badge: "Noite",
    accent: "#86efac",
    glow: "rgba(134,239,172,.25)",
    desc: "Noite de verão, concerto dos grilos",
    type: "crickets",
  },
];

/* Procedural noise generators */
class NoiseSource {
  constructor(ctx, type, gainNode) {
    this.ctx = ctx;
    this.type = type;
    this.gainNode = gainNode;
    this.nodes = [];
    this.running = false;
    this.analyser = ctx.createAnalyser();
    this.analyser.fftSize = 512;
    this.analyser.connect(gainNode);
    this.build();
  }

  build() {
    const ctx = this.ctx;
    if (this.type === "rain" || this.type === "cave") {
      // Pink-ish noise via filtered white noise
      const bufSize = ctx.sampleRate * 2;
      const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
      const data = buf.getChannelData(0);
      let b0 = 0,
        b1 = 0,
        b2 = 0,
        b3 = 0,
        b4 = 0,
        b5 = 0;
      for (let i = 0; i < bufSize; i++) {
        const w = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + w * 0.0555179;
        b1 = 0.99332 * b1 + w * 0.0750759;
        b2 = 0.969 * b2 + w * 0.153852;
        b3 = 0.8665 * b3 + w * 0.3104856;
        b4 = 0.55 * b4 + w * 0.5329522;
        b5 = -0.7616 * b5 - w * 0.016898;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + w * 0.5362) * 0.11;
      }
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.loop = true;
      const filt = ctx.createBiquadFilter();
      filt.type = this.type === "cave" ? "lowpass" : "bandpass";
      filt.frequency.value = this.type === "cave" ? 800 : 2000;
      filt.Q.value = this.type === "cave" ? 2 : 0.5;
      src.connect(filt);
      filt.connect(this.analyser);
      this.nodes = [src, filt];
      src.start();
      if (this.type === "cave") this._scheduleCaveDrops();
    } else if (this.type === "thunder") {
      this._scheduleThunder();
      // heavy rain
      const bufSize = ctx.sampleRate * 2;
      const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < bufSize; i++)
        data[i] = (Math.random() * 2 - 1) * 0.15;
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.loop = true;
      const filt = ctx.createBiquadFilter();
      filt.type = "bandpass";
      filt.frequency.value = 1500;
      filt.Q.value = 0.3;
      src.connect(filt);
      filt.connect(this.analyser);
      this.nodes.push(src, filt);
      src.start();
    } else if (this.type === "forest") {
      this._scheduleForestBirds();
      // ambient breeze
      const bufSize = ctx.sampleRate;
      const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < bufSize; i++)
        data[i] = (Math.random() * 2 - 1) * 0.04;
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.loop = true;
      const filt = ctx.createBiquadFilter();
      filt.type = "lowpass";
      filt.frequency.value = 600;
      src.connect(filt);
      filt.connect(this.analyser);
      this.nodes.push(src, filt);
      src.start();
    } else if (this.type === "ocean") {
      this._scheduleWaves();
    } else if (this.type === "fire") {
      this._scheduleFire();
    } else if (this.type === "river") {
      // white noise filtered to simulate rushing water
      const bufSize = ctx.sampleRate * 2;
      const buf = ctx.createBuffer(2, bufSize, ctx.sampleRate);
      for (let c = 0; c < 2; c++) {
        const data = buf.getChannelData(c);
        for (let i = 0; i < bufSize; i++)
          data[i] = (Math.random() * 2 - 1) * 0.2;
      }
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.loop = true;
      const f1 = ctx.createBiquadFilter();
      f1.type = "bandpass";
      f1.frequency.value = 800;
      f1.Q.value = 0.8;
      const f2 = ctx.createBiquadFilter();
      f2.type = "highpass";
      f2.frequency.value = 300;
      src.connect(f1);
      f1.connect(f2);
      f2.connect(this.analyser);
      this.nodes = [src, f1, f2];
      src.start();
    } else if (this.type === "wind") {
      const bufSize = ctx.sampleRate * 4;
      const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1) * 0.1;
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.loop = true;
      const filt = ctx.createBiquadFilter();
      filt.type = "lowpass";
      filt.frequency.value = 400;
      filt.Q.value = 5;
      // LFO for wind variation
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.1;
      const lfoG = ctx.createGain();
      lfoG.gain.value = 200;
      lfo.connect(lfoG);
      lfoG.connect(filt.frequency);
      src.connect(filt);
      filt.connect(this.analyser);
      lfo.start();
      src.start();
      this.nodes = [src, filt, lfo, lfoG];
    } else if (this.type === "crickets") {
      this._scheduleCrickets();
    }
    this.running = true;
  }

  _scheduleCaveDrops() {
    if (!this.running && this.nodes.length) return;
    const ctx = this.ctx;
    const delay = 1 + Math.random() * 4;
    this._caveTimeout = setTimeout(() => {
      if (!this.running) return;
      const osc = ctx.createOscillator();
      osc.frequency.value = 900 + Math.random() * 300;
      osc.type = "sine";
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.3, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.connect(g);
      g.connect(this.analyser);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
      this._scheduleCaveDrops();
    }, delay * 1000);
  }

  _scheduleThunder() {
    const ctx = this.ctx;
    const delay = 8 + Math.random() * 20;
    this._tTimeout = setTimeout(() => {
      if (!this.running) return;
      const buf = ctx.createBuffer(1, ctx.sampleRate * 3, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const filt = ctx.createBiquadFilter();
      filt.type = "lowpass";
      filt.frequency.value = 200;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, ctx.currentTime);
      g.gain.linearRampToValueAtTime(0.8, ctx.currentTime + 0.1);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 3);
      src.connect(filt);
      filt.connect(g);
      g.connect(this.analyser);
      src.start();
      src.stop(ctx.currentTime + 3);
      this._scheduleThunder();
    }, delay * 1000);
  }

  _scheduleForestBirds() {
    const ctx = this.ctx;
    const delay = 0.5 + Math.random() * 4;
    this._bTimeout = setTimeout(() => {
      if (!this.running) return;
      const numChirps = 2 + Math.floor(Math.random() * 5);
      for (let c = 0; c < numChirps; c++) {
        const t = ctx.currentTime + c * 0.12 + Math.random() * 0.08;
        const osc = ctx.createOscillator();
        osc.type = "sine";
        const startF = 1200 + Math.random() * 2000;
        osc.frequency.setValueAtTime(startF, t);
        osc.frequency.linearRampToValueAtTime(
          startF * (1 + Math.random() * 0.4),
          t + 0.08,
        );
        const g = ctx.createGain();
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.18 + Math.random() * 0.12, t + 0.02);
        g.gain.exponentialRampToValueAtTime(
          0.001,
          t + 0.1 + Math.random() * 0.05,
        );
        osc.connect(g);
        g.connect(this.analyser);
        osc.start(t);
        osc.stop(t + 0.2);
        this.nodes.push(osc, g);
      }
      this._scheduleForestBirds();
    }, delay * 1000);
  }

  _scheduleWaves() {
    const ctx = this.ctx;
    const scheduleOne = () => {
      if (!this.running) return;
      const dur = 3 + Math.random() * 4;
      const bufSize = Math.floor(ctx.sampleRate * dur);
      const buf = ctx.createBuffer(2, bufSize, ctx.sampleRate);
      for (let ch = 0; ch < 2; ch++) {
        const d = buf.getChannelData(ch);
        for (let i = 0; i < bufSize; i++) d[i] = Math.random() * 2 - 1;
      }
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const f1 = ctx.createBiquadFilter();
      f1.type = "lowpass";
      f1.frequency.value = 400;
      const g = ctx.createGain();
      const t0 = ctx.currentTime;
      g.gain.setValueAtTime(0, t0);
      g.gain.linearRampToValueAtTime(0.35, t0 + dur * 0.3);
      g.gain.linearRampToValueAtTime(0.5, t0 + dur * 0.5);
      g.gain.exponentialRampToValueAtTime(0.001, t0 + dur * 0.95);
      src.connect(f1);
      f1.connect(g);
      g.connect(this.analyser);
      src.start();
      this.nodes.push(src, f1, g);
      this._waveTimeout = setTimeout(
        scheduleOne,
        dur * 0.7 * 1000 + Math.random() * 1000,
      );
    };
    scheduleOne();
  }

  _scheduleFire() {
    const ctx = this.ctx;
    // Base crackle noise
    const bufSize = ctx.sampleRate * 2;
    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1) * 0.15;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    const f1 = ctx.createBiquadFilter();
    f1.type = "bandpass";
    f1.frequency.value = 800;
    f1.Q.value = 0.5;
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.3 + Math.random() * 0.2;
    const lfoG = ctx.createGain();
    lfoG.gain.value = 0.15;
    lfo.connect(lfoG);
    lfoG.connect(src.playbackRate || {});
    src.connect(f1);
    f1.connect(this.analyser);
    lfo.start();
    src.start();
    this.nodes = [src, f1, lfo, lfoG];
    // Schedule pops
    this._scheduleFirePops();
  }

  _scheduleFirePops() {
    const ctx = this.ctx;
    const delay = 0.3 + Math.random() * 2;
    this._fpTimeout = setTimeout(() => {
      if (!this.running) return;
      const buf = ctx.createBuffer(
        1,
        Math.floor(ctx.sampleRate * 0.05),
        ctx.sampleRate,
      );
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const filt = ctx.createBiquadFilter();
      filt.type = "bandpass";
      filt.frequency.value = 600 + Math.random() * 400;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.6, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
      src.connect(filt);
      filt.connect(g);
      g.connect(this.analyser);
      src.start();
      this._scheduleFirePops();
    }, delay * 1000);
  }

  _scheduleCrickets() {
    const ctx = this.ctx;
    const numCrickets = 6 + Math.floor(Math.random() * 4);
    for (let c = 0; c < numCrickets; c++) {
      const baseF = 3000 + Math.random() * 2000;
      const rate = 15 + Math.random() * 10;
      this._scheduleCricket(baseF, rate, Math.random() * 2);
    }
  }

  _scheduleCricket(freq, rate, offset) {
    const ctx = this.ctx;
    let time = ctx.currentTime + offset;
    const scheduleChirp = () => {
      if (!this.running) return;
      const osc = ctx.createOscillator();
      osc.frequency.value = freq;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, time);
      g.gain.linearRampToValueAtTime(0.04, time + 0.01);
      g.gain.setValueAtTime(0.04, time + 0.03);
      g.gain.linearRampToValueAtTime(0, time + 0.04);
      osc.connect(g);
      g.connect(this.analyser);
      osc.start(time);
      osc.stop(time + 0.05);
      time += 1 / rate;
      this._crTimeout = setTimeout(scheduleChirp, (1 / rate) * 1000);
    };
    scheduleChirp();
  }

  setVolume(vol) {
    if (this.gainNode)
      this.gainNode.gain.setTargetAtTime(vol, this.ctx.currentTime, 0.05);
  }

  stop() {
    this.running = false;
    clearTimeout(this._caveTimeout);
    clearTimeout(this._tTimeout);
    clearTimeout(this._bTimeout);
    clearTimeout(this._waveTimeout);
    clearTimeout(this._fpTimeout);
    clearTimeout(this._crTimeout);
    this.nodes.forEach((n) => {
      try {
        n.stop?.();
        n.disconnect?.();
      } catch (e) {}
    });
    this.nodes = [];
    try {
      this.analyser.disconnect();
    } catch (e) {}
  }
}

const natureInstances = {};

function startNature(cfg) {
  ensureContext();
  if (natureInstances[cfg.id]) return;
  const gainNode = ACX.createGain();
  gainNode.gain.value = 0.45;
  gainNode.connect(masterGain);
  const ns = new NoiseSource(ACX, cfg.type, gainNode);
  natureInstances[cfg.id] = { ns, gainNode };
}

function stopNature(id) {
  const n = natureInstances[id];
  if (!n) return;
  n.ns.stop();
  try {
    n.gainNode.disconnect();
  } catch (e) {}
  delete natureInstances[id];
}

function updateNatureVol(id, vol) {
  const n = natureInstances[id];
  if (!n) return;
  n.gainNode.gain.setTargetAtTime(vol, ACX.currentTime, 0.05);
}

/* ════════════════════════════════════════════
   BUILD UI
════════════════════════════════════════════ */

function buildBinauralCard(cfg) {
  cfg.currentBeat = cfg.defFreq;
  const card = document.createElement("div");
  card.className = "card";
  card.style.setProperty("--card-accent", cfg.accent);
  card.style.setProperty("--card-glow", cfg.glow);

  card.innerHTML = `
    <div class="card-header">
      <span class="card-icon">${cfg.icon}</span>
      <span class="card-name">${cfg.name}</span>
      <span class="card-badge">${cfg.badge}</span>
      <button class="toggle-btn" id="tog-${cfg.id}"></button>
    </div>
    <div class="card-desc">${cfg.desc}</div>
    <div class="pill-row" id="pills-${cfg.id}">
      ${cfg.freqs.map((f) => `<button class="pill${f.v === cfg.defFreq ? " active" : ""}" data-v="${f.v}">${f.l} Hz</button>`).join("")}
    </div>
    <div class="slider-row">
      <span class="lbl">Vol</span>
      <input type="range" id="vol-${cfg.id}" min="0" max="100" value="50">
      <span class="val-lbl" id="volv-${cfg.id}">50%</span>
    </div>
    <div class="slider-row">
      <span class="lbl">Base</span>
      <input type="range" id="base-${cfg.id}" min="60" max="400" value="${cfg.base}">
      <span class="val-lbl" id="basev-${cfg.id}">${cfg.base}Hz</span>
    </div>
    <canvas class="wave" id="wave-${cfg.id}"></canvas>
  `;

  const tog = card.querySelector(`#tog-${cfg.id}`);
  tog.addEventListener("click", () => {
    const on = tog.classList.toggle("on");
    card.classList.toggle("active", on);
    if (on) {
      cfg.currentBeat = cfg.currentBeat || cfg.defFreq;
      startBinaural({ ...cfg, beatFreq: cfg.currentBeat });
      startWave(cfg.id);
    } else {
      stopBinaural(cfg.id);
      stopWave(cfg.id);
    }
  });

  card.querySelector(`#pills-${cfg.id}`).addEventListener("click", (e) => {
    const pill = e.target.closest(".pill");
    if (!pill) return;
    card.querySelectorAll(".pill").forEach((p) => p.classList.remove("active"));
    pill.classList.add("active");
    cfg.currentBeat = parseFloat(pill.dataset.v);
    updateBinauralFreq(cfg, cfg.currentBeat);
  });

  const volSl = card.querySelector(`#vol-${cfg.id}`);
  const volV = card.querySelector(`#volv-${cfg.id}`);
  volSl.addEventListener("input", () => {
    volV.textContent = volSl.value + "%";
    updateBinauralVol(cfg.id, volSl.value / 100);
  });

  const baseSl = card.querySelector(`#base-${cfg.id}`);
  const baseV = card.querySelector(`#basev-${cfg.id}`);
  baseSl.addEventListener("input", () => {
    cfg.base = parseInt(baseSl.value);
    baseV.textContent = cfg.base + "Hz";
    updateBinauralBase(cfg, cfg.base);
  });

  return card;
}

function buildSolfeggioCard(cfg) {
  const hz = parseInt(cfg.id.replace("sol", ""));
  cfg.hz = hz;
  const card = document.createElement("div");
  card.className = "card";
  card.style.setProperty("--card-accent", cfg.accent);
  card.style.setProperty("--card-glow", cfg.glow);

  card.innerHTML = `
    <div class="card-header">
      <span class="card-icon">${cfg.icon}</span>
      <span class="card-name">${cfg.name}</span>
      <span class="card-badge">${cfg.badge}</span>
      <button class="toggle-btn" id="tog-${cfg.id}"></button>
    </div>
    <div class="card-desc">${cfg.desc}</div>
    <div class="slider-row">
      <span class="lbl">Vol</span>
      <input type="range" id="vol-${cfg.id}" min="0" max="100" value="40">
      <span class="val-lbl" id="volv-${cfg.id}">40%</span>
    </div>
    <canvas class="wave" id="wave-${cfg.id}"></canvas>
  `;

  const tog = card.querySelector(`#tog-${cfg.id}`);
  tog.addEventListener("click", () => {
    const on = tog.classList.toggle("on");
    card.classList.toggle("active", on);
    if (on) {
      startSolfeggio(cfg);
      startWave(cfg.id);
    } else {
      stopSolfeggio(cfg.id);
      stopWave(cfg.id);
    }
  });

  const volSl = card.querySelector(`#vol-${cfg.id}`);
  const volV = card.querySelector(`#volv-${cfg.id}`);
  volSl.addEventListener("input", () => {
    volV.textContent = volSl.value + "%";
    updateSolVol(cfg.id, volSl.value / 100);
  });

  return card;
}

function buildNatureCard(cfg) {
  const card = document.createElement("div");
  card.className = "card";
  card.style.setProperty("--card-accent", cfg.accent);
  card.style.setProperty("--card-glow", cfg.glow);

  card.innerHTML = `
    <div class="card-header">
      <span class="card-icon">${cfg.icon}</span>
      <span class="card-name">${cfg.name}</span>
      <span class="card-badge">${cfg.badge}</span>
      <button class="toggle-btn" id="tog-${cfg.id}"></button>
    </div>
    <div class="card-desc">${cfg.desc}</div>
    <div class="slider-row">
      <span class="lbl">Vol</span>
      <input type="range" id="vol-${cfg.id}" min="0" max="100" value="45">
      <span class="val-lbl" id="volv-${cfg.id}">45%</span>
    </div>
    <canvas class="wave" id="wave-${cfg.id}"></canvas>
  `;

  const tog = card.querySelector(`#tog-${cfg.id}`);
  tog.addEventListener("click", () => {
    const on = tog.classList.toggle("on");
    card.classList.toggle("active", on);
    if (on) {
      startNature(cfg);
      startNatureWave(cfg.id);
    } else {
      stopNature(cfg.id);
      stopNatureWave(cfg.id);
    }
  });

  const volSl = card.querySelector(`#vol-${cfg.id}`);
  const volV = card.querySelector(`#volv-${cfg.id}`);
  volSl.addEventListener("input", () => {
    volV.textContent = volSl.value + "%";
    updateNatureVol(cfg.id, volSl.value / 100);
  });

  return card;
}

BINAURAL.forEach((cfg) =>
  document.getElementById("binauralGrid").appendChild(buildBinauralCard(cfg)),
);
SOLFEGGIO.forEach((cfg) =>
  document.getElementById("solfeggioGrid").appendChild(buildSolfeggioCard(cfg)),
);
NATURE.forEach((cfg) =>
  document.getElementById("natureGrid").appendChild(buildNatureCard(cfg)),
);

/* ════════════════════════════════════════════
   MINI WAVEFORM PER CARD
════════════════════════════════════════════ */
const waveRafs = {};

function startWave(id) {
  const canvas = document.getElementById(`wave-${id}`);
  if (!canvas) return;
  canvas.width = canvas.offsetWidth * devicePixelRatio;
  canvas.height = canvas.offsetHeight * devicePixelRatio;
  const ctx2 = canvas.getContext("2d");
  const accent = canvas
    .closest(".card")
    .style.getPropertyValue("--card-accent");

  function draw() {
    const n = activeNodes[id];
    if (!n) return;
    const analyser = n.analyser;
    waveRafs[id] = requestAnimationFrame(draw);
    const buf = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteTimeDomainData(buf);
    const w = canvas.width / devicePixelRatio,
      h = canvas.height / devicePixelRatio;
    ctx2.save();
    ctx2.scale(devicePixelRatio, devicePixelRatio);
    ctx2.clearRect(0, 0, w, h);
    ctx2.fillStyle = "rgba(3,5,15,.5)";
    ctx2.fillRect(0, 0, w, h);
    ctx2.strokeStyle = accent || "#7c3aed";
    ctx2.lineWidth = 1.5;
    ctx2.shadowBlur = 6;
    ctx2.shadowColor = accent || "#7c3aed";
    ctx2.beginPath();
    const sl = w / buf.length;
    let x = 0;
    buf.forEach((v, i) => {
      const y = (v / 128) * (h / 2);
      i ? ctx2.lineTo(x, y) : ctx2.moveTo(x, y);
      x += sl;
    });
    ctx2.stroke();
    ctx2.restore();
  }
  draw();
}

function stopWave(id) {
  cancelAnimationFrame(waveRafs[id]);
  const canvas = document.getElementById(`wave-${id}`);
  if (canvas) {
    const c = canvas.getContext("2d");
    c.clearRect(0, 0, canvas.width, canvas.height);
  }
}

function startNatureWave(id) {
  const canvas = document.getElementById(`wave-${id}`);
  if (!canvas) return;
  canvas.width = canvas.offsetWidth * devicePixelRatio;
  canvas.height = canvas.offsetHeight * devicePixelRatio;
  const ctx2 = canvas.getContext("2d");
  const accent = canvas
    .closest(".card")
    .style.getPropertyValue("--card-accent");

  function draw() {
    const n = natureInstances[id];
    if (!n) return;
    const analyser = n.ns.analyser;
    waveRafs["n_" + id] = requestAnimationFrame(draw);
    const buf = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteTimeDomainData(buf);
    const w = canvas.width / devicePixelRatio,
      h = canvas.height / devicePixelRatio;
    ctx2.save();
    ctx2.scale(devicePixelRatio, devicePixelRatio);
    ctx2.clearRect(0, 0, w, h);
    ctx2.fillStyle = "rgba(3,5,15,.5)";
    ctx2.fillRect(0, 0, w, h);
    ctx2.strokeStyle = accent || "#22c55e";
    ctx2.lineWidth = 1.5;
    ctx2.shadowBlur = 6;
    ctx2.shadowColor = accent || "#22c55e";
    ctx2.beginPath();
    const sl = w / buf.length;
    let x = 0;
    buf.forEach((v, i) => {
      const y = (v / 128) * (h / 2);
      i ? ctx2.lineTo(x, y) : ctx2.moveTo(x, y);
      x += sl;
    });
    ctx2.stroke();
    ctx2.restore();
  }
  draw();
}

function stopNatureWave(id) {
  cancelAnimationFrame(waveRafs["n_" + id]);
  const canvas = document.getElementById(`wave-${id}`);
  if (canvas) {
    const c = canvas.getContext("2d");
    c.clearRect(0, 0, canvas.width, canvas.height);
  }
}

/* ════════════════════════════════════════════
   GLOBAL VISUALIZER
════════════════════════════════════════════ */
const gCanvas = document.getElementById("globalVis");
gCanvas.width = gCanvas.offsetWidth * devicePixelRatio;
gCanvas.height = gCanvas.offsetHeight * devicePixelRatio;
const gCtx = gCanvas.getContext("2d");
window.addEventListener("resize", () => {
  gCanvas.width = gCanvas.offsetWidth * devicePixelRatio;
  gCanvas.height = gCanvas.offsetHeight * devicePixelRatio;
});

function drawGlobalVis() {
  globalRafId = requestAnimationFrame(drawGlobalVis);
  if (!globalAnalyser) return;
  const buf = new Uint8Array(globalAnalyser.frequencyBinCount);
  globalAnalyser.getByteFrequencyData(buf);
  const w = gCanvas.width / devicePixelRatio,
    h = gCanvas.height / devicePixelRatio;
  gCtx.save();
  gCtx.scale(devicePixelRatio, devicePixelRatio);
  gCtx.fillStyle = "rgba(3,5,15,.15)";
  gCtx.fillRect(0, 0, w, h);
  const bw = w / buf.length;
  const grad = gCtx.createLinearGradient(0, h, 0, 0);
  grad.addColorStop(0, "#7c3aed");
  grad.addColorStop(0.4, "#22d3ee");
  grad.addColorStop(1, "#f0d080");
  buf.forEach((v, i) => {
    const bh = (v / 255) * h;
    gCtx.fillStyle = grad;
    gCtx.shadowBlur = 8;
    gCtx.shadowColor = "#7c3aed";
    gCtx.fillRect(i * bw, h - bh, bw * 0.8, bh);
  });
  gCtx.restore();
}

/* ════════════════════════════════════════════
   MASTER CONTROLS
════════════════════════════════════════════ */

// Timer: starts automatically when the first sound is turned on
function tryStartTimer() {
  // Sempre sincroniza o masterGain com o slider ao ligar qualquer som
  const sliderVal = document.getElementById("masterVol").value / 100;
  masterGain.gain.cancelScheduledValues(ACX.currentTime);
  masterGain.gain.setValueAtTime(sliderVal, ACX.currentTime);
  if (timerInt) return;
  timerInt = setInterval(() => {
    elapsed++;
    const m = String(Math.floor(elapsed / 60)).padStart(2, "0");
    const s = String(elapsed % 60).padStart(2, "0");
    document.getElementById("timerDisp").textContent = `${m}:${s}`;
  }, 1000);
}
function tryStopTimer() {
  const anyActive =
    Object.keys(activeNodes).length > 0 ||
    Object.keys(natureInstances).length > 0;
  if (!anyActive) {
    clearInterval(timerInt);
    timerInt = null;
    // Silencia o master quando não há mais nada tocando
    if (masterGain) masterGain.gain.setTargetAtTime(0, ACX.currentTime, 0.1);
  }
}

// Patch toggle handlers to manage timer automatically
const _origStartBinaural = startBinaural;
startBinaural = function (...a) {
  _origStartBinaural(...a);
  tryStartTimer();
};
const _origStopBinaural = stopBinaural;
stopBinaural = function (...a) {
  _origStopBinaural(...a);
  tryStopTimer();
};
const _origStartNature = startNature;
startNature = function (...a) {
  _origStartNature(...a);
  tryStartTimer();
};
const _origStopNature = stopNature;
stopNature = function (...a) {
  _origStopNature(...a);
  tryStopTimer();
};
const _origStartSolfeggio = startSolfeggio;
startSolfeggio = function (...a) {
  _origStartSolfeggio(...a);
  tryStartTimer();
};
const _origStopSolfeggio = stopSolfeggio;
stopSolfeggio = function (...a) {
  _origStopSolfeggio(...a);
  tryStopTimer();
};

// "Parar Tudo" — desliga todos os sons de uma vez
document.getElementById("btnStop").addEventListener("click", () => {
  [...Object.keys(activeNodes)].forEach((id) => {
    const tog = document.getElementById(`tog-${id}`);
    if (tog) {
      tog.classList.remove("on");
      tog.closest(".card").classList.remove("active");
    }
    _origStopBinaural(id);
    stopWave(id);
    _origStopSolfeggio(id);
    stopWave(id);
  });
  [...Object.keys(natureInstances)].forEach((id) => {
    const tog = document.getElementById(`tog-${id}`);
    if (tog) {
      tog.classList.remove("on");
      tog.closest(".card").classList.remove("active");
    }
    _origStopNature(id);
    stopNatureWave(id);
  });
  // Also sweep solfeggio toggles
  SOLFEGGIO.forEach((s) => {
    const tog = document.getElementById(`tog-${s.id}`);
    if (tog && tog.classList.contains("on")) {
      tog.classList.remove("on");
      tog.closest(".card").classList.remove("active");
    }
  });
  clearInterval(timerInt);
  timerInt = null;
  elapsed = 0;
  document.getElementById("timerDisp").textContent = "00:00";
  // Silencia o master
  if (masterGain) masterGain.gain.setTargetAtTime(0, ACX.currentTime, 0.1);
});

/* ════════════════════════════════════════════
   SCHEDULER
════════════════════════════════════════════ */
let schedStartInt = null;
let schedStopInt = null;

document.getElementById("btnSchedToggle").addEventListener("click", () => {
  const sc = document.getElementById("scheduler");
  sc.style.display = sc.style.display === "none" ? "block" : "none";
});

document.getElementById("btnSchedConfirm").addEventListener("click", () => {
  const startVal = document.getElementById("schedStart").value;
  const stopVal = document.getElementById("schedStop").value;
  const status = document.getElementById("schedStatus");
  const btnCancel = document.getElementById("btnSchedCancel");

  if (!startVal && !stopVal) {
    status.textContent = "Defina ao menos um horário.";
    status.className = "sched-status warn";
    return;
  }

  // Clear previous schedules
  clearInterval(schedStartInt);
  clearInterval(schedStopInt);

  function timeMatches(hhmm) {
    const now = new Date();
    const [h, m] = hhmm.split(":").map(Number);
    return now.getHours() === h && now.getMinutes() === m;
  }

  // Captura quais toggles estão ON agora (no momento de confirmar)
  const scheduledToggles = [...document.querySelectorAll(".toggle-btn.on")].map(
    (t) => t.id,
  );

  function activateAll() {
    ensureContext();
    // Liga APENAS os toggles que estavam ON quando o usuário agendou
    scheduledToggles.forEach((id) => {
      const tog = document.getElementById(id);
      // Se por algum motivo já está on, não duplica
      if (tog && !tog.classList.contains("on")) tog.click();
      // Se estava on e continua on, o áudio já está tocando — não faz nada
    });
    // Se nenhum estava selecionado, avisa
    if (scheduledToggles.length === 0) {
      document.getElementById("schedStatus").textContent =
        "Nenhum som estava selecionado ao agendar.";
    }
  }

  function stopAll() {
    document.getElementById("btnStop").click();
  }

  let msgs = [];
  if (startVal) {
    msgs.push("▶ " + startVal);
    schedStartInt = setInterval(() => {
      if (timeMatches(startVal)) {
        activateAll();
        clearInterval(schedStartInt);
      }
    }, 5000);
  }
  if (stopVal) {
    msgs.push("■ " + stopVal);
    schedStopInt = setInterval(() => {
      if (timeMatches(stopVal)) {
        stopAll();
        clearInterval(schedStopInt);
      }
    }, 5000);
  }

  status.textContent = "Agendado: " + msgs.join("  →  ");
  status.className = "sched-status ok";
  btnCancel.style.display = "inline-block";
});

document.getElementById("btnSchedCancel").addEventListener("click", () => {
  clearInterval(schedStartInt);
  clearInterval(schedStopInt);
  schedStartInt = schedStopInt = null;
  document.getElementById("schedStatus").textContent = "Agendamento cancelado.";
  document.getElementById("schedStatus").className = "sched-status";
  document.getElementById("btnSchedCancel").style.display = "none";
  document.getElementById("schedStart").value = "";
  document.getElementById("schedStop").value = "";
});
