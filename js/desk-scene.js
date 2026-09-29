/* ==========================================================================
   Desk scene — a warm desk at night: laptop, lamp, mug, plant, books,
   a little planet model and a window full of stars.
   The laptop screen is a live canvas texture. Entering flies the camera
   into the screen until it fills the viewport.
   ========================================================================== */
(function () {
  const T = window.THREE;
  const TAU = Math.PI * 2;
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const easeInOut = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const easeOut = t => 1 - Math.pow(1 - t, 3);

  function canvasTex(w, h, draw, opts = {}) {
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    const g = c.getContext("2d");
    draw(g, w, h);
    const t = new T.CanvasTexture(c);
    t.encoding = T.sRGBEncoding;
    t.anisotropy = opts.aniso || 4;
    if (opts.repeat) { t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(opts.repeat[0], opts.repeat[1]); }
    return t;
  }

  function roundedRectShape(w, h, r, x0 = -w / 2, y0 = -h / 2) {
    const s = new T.Shape();
    s.moveTo(x0 + r, y0);
    s.lineTo(x0 + w - r, y0);
    s.quadraticCurveTo(x0 + w, y0, x0 + w, y0 + r);
    s.lineTo(x0 + w, y0 + h - r);
    s.quadraticCurveTo(x0 + w, y0 + h, x0 + w - r, y0 + h);
    s.lineTo(x0 + r, y0 + h);
    s.quadraticCurveTo(x0, y0 + h, x0, y0 + h - r);
    s.lineTo(x0, y0 + r);
    s.quadraticCurveTo(x0, y0, x0 + r, y0);
    return s;
  }

  // ---------- procedural textures ----------
  function woodTexture() {
    return canvasTex(1024, 512, (g, w, h) => {
      g.fillStyle = "#6a4128"; g.fillRect(0, 0, w, h);
      for (let i = 0; i < 260; i++) {
        const y = Math.random() * h;
        const amp = 2 + Math.random() * 7;
        const f = 0.004 + Math.random() * 0.01;
        const ph = Math.random() * 10;
        g.strokeStyle = `rgba(${40 + Math.random() * 40},${20 + Math.random() * 20},${10},${0.08 + Math.random() * 0.18})`;
        g.lineWidth = 0.6 + Math.random() * 2.4;
        g.beginPath();
        for (let x = 0; x <= w; x += 8) {
          const yy = y + Math.sin(x * f + ph) * amp + Math.sin(x * f * 3.1 + ph) * amp * 0.3;
          x === 0 ? g.moveTo(x, yy) : g.lineTo(x, yy);
        }
        g.stroke();
      }
      // a few knots
      for (let k = 0; k < 3; k++) {
        const x = Math.random() * w, y = Math.random() * h;
        const gr = g.createRadialGradient(x, y, 1, x, y, 22);
        gr.addColorStop(0, "rgba(40,20,10,.55)"); gr.addColorStop(1, "rgba(40,20,10,0)");
        g.fillStyle = gr; g.beginPath(); g.ellipse(x, y, 30, 10, 0, 0, TAU); g.fill();
      }
      const sheen = g.createLinearGradient(0, 0, 0, h);
      sheen.addColorStop(0, "rgba(255,210,160,.05)"); sheen.addColorStop(1, "rgba(0,0,0,.12)");
      g.fillStyle = sheen; g.fillRect(0, 0, w, h);
    }, { aniso: 8 });
  }

  function wallTexture() {
    return canvasTex(512, 512, (g, w, h) => {
      g.fillStyle = "#443e4c"; g.fillRect(0, 0, w, h);
      const img = g.getImageData(0, 0, w, h);
      for (let i = 0; i < img.data.length; i += 4) {
        const n = (Math.random() - 0.5) * 14;
        img.data[i] += n; img.data[i + 1] += n; img.data[i + 2] += n;
      }
      g.putImageData(img, 0, 0);
    }, { repeat: [3, 2] });
  }

  // ---------- sky for every time of day and weather ----------
  const SKY = {
    night: ["#0a1030", "#1b1b4a", "#3b2a55"],
    dawn:  ["#3b2f6b", "#e07a5f", "#f6c98a"],
    day:   ["#3f95e0", "#7cc0f2", "#d6eeff"],
    dusk:  ["#2a2560", "#c1566b", "#f2a541"]
  };
  const GREY  = { night: "#1a1d2a", dawn: "#8a8590", day: "#9aa4b0", dusk: "#6a6270" };
  const HAZE  = { night: "#2a2f40", dawn: "#c9bfc2", day: "#d4dade", dusk: "#a89aa0" };
  const HILLS = { night: "#0c0a18", dawn: "#2a2440", day: "#3d5a4a", dusk: "#1e1a30" };
  const DULL  = { sunny: 0, cloudy: 0.5, rainy: 0.8, foggy: 0.6, snowy: 0.6 };

  function hexMix(a, b, t) {
    const A = parseInt(a.slice(1), 16), B = parseInt(b.slice(1), 16);
    const ch = sh => Math.round(((A >> sh) & 255) * (1 - t) + ((B >> sh) & 255) * t);
    return "#" + ((1 << 24) | (ch(16) << 16) | (ch(8) << 8) | ch(0)).toString(16).slice(1);
  }
  const hexRgba = (hex, a) => { const n = parseInt(hex.slice(1), 16); return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`; };

  function drawSky(g, w, h, phase, weather) {
    const dull = DULL[weather];
    let cols = SKY[phase].map(c => hexMix(c, GREY[phase], dull));
    if (weather === "foggy") cols = cols.map(c => hexMix(c, HAZE[phase], 0.55));
    if (weather === "snowy") cols = cols.map(c => hexMix(c, phase === "night" ? "#2b3350" : "#c8d2de", 0.35));
    const bg = g.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, cols[0]); bg.addColorStop(0.7, cols[1]); bg.addColorStop(1, cols[2]);
    g.fillStyle = bg; g.fillRect(0, 0, w, h);
    const clear = weather === "sunny", partly = weather === "cloudy";

    if (phase === "night" && clear) {
      [["rgba(120,80,190,.20)", 0.3, 0.35, 320], ["rgba(242,165,65,.10)", 0.75, 0.6, 260], ["rgba(111,211,224,.10)", 0.6, 0.2, 240]].forEach(([c, x, y, r]) => {
        const gr = g.createRadialGradient(x * w, y * h, 0, x * w, y * h, r);
        gr.addColorStop(0, c); gr.addColorStop(1, "rgba(0,0,0,0)");
        g.fillStyle = gr; g.fillRect(0, 0, w, h);
      });
    }
    if (phase === "night" && (clear || partly)) {
      const n = clear ? 700 : 160;
      for (let i = 0; i < n; i++) {
        const r = Math.random() < 0.94 ? Math.random() * 1.1 + 0.3 : Math.random() * 2 + 1.2;
        g.fillStyle = `rgba(255,${230 + Math.random() * 25},${200 + Math.random() * 55},${0.4 + Math.random() * 0.6})`;
        g.beginPath(); g.arc(Math.random() * w, Math.random() * h * 0.8, r, 0, TAU); g.fill();
      }
    }
    if (clear || partly) {           // the moon or the sun
      g.save(); g.globalAlpha = clear ? 1 : 0.6;
      if (phase === "night") {
        const mx = w * 0.78, my = h * 0.26, mr = 46;
        const glow = g.createRadialGradient(mx, my, mr * 0.6, mx, my, mr * 3);
        glow.addColorStop(0, "rgba(255,240,210,.35)"); glow.addColorStop(1, "rgba(255,240,210,0)");
        g.fillStyle = glow; g.fillRect(0, 0, w, h);
        g.fillStyle = "#f3ead6"; g.beginPath(); g.arc(mx, my, mr, 0, TAU); g.fill();
        g.fillStyle = "rgba(170,160,140,.35)";
        [[-12, -8, 10], [14, 10, 7], [4, -20, 5], [-16, 16, 6]].forEach(([dx, dy, r]) => { g.beginPath(); g.arc(mx + dx, my + dy, r, 0, TAU); g.fill(); });
      } else {
        const pos = { dawn: [0.2, 0.68], day: [0.7, 0.22], dusk: [0.82, 0.64] }[phase];
        const x = w * pos[0], y = h * pos[1], r = phase === "day" ? 52 : 64;
        const core = phase === "day" ? "#fff6d0" : "#ffb27a";
        const glow = g.createRadialGradient(x, y, r * 0.5, x, y, r * 4.5);
        glow.addColorStop(0, hexRgba(core, 0.6)); glow.addColorStop(1, hexRgba(core, 0));
        g.fillStyle = glow; g.fillRect(0, 0, w, h);
        g.fillStyle = core; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
      }
      g.restore();
    }

    let hill = hexMix(HILLS[phase], GREY[phase], dull * 0.5);
    if (weather === "foggy") hill = hexMix(hill, HAZE[phase], 0.55);
    if (weather === "snowy") hill = phase === "night" ? "#48546e" : "#cfd9e4";
    const ridge = x => h * 0.86 - Math.sin(x * 0.006) * 30 - Math.sin(x * 0.02) * 8;
    g.fillStyle = hill; g.beginPath(); g.moveTo(0, h);
    for (let x = 0; x <= w; x += 16) g.lineTo(x, ridge(x));
    g.lineTo(w, h); g.fill();
    if (weather === "snowy") {
      g.strokeStyle = "#f4f8fc"; g.lineWidth = 4; g.beginPath();
      for (let x = 0; x <= w; x += 16) (x === 0 ? g.moveTo(x, ridge(x)) : g.lineTo(x, ridge(x)));
      g.stroke();
    }
    if (phase !== "day") {           // lights in the valley
      const n = phase === "night" ? 40 : 22, a0 = weather === "foggy" ? 0.35 : 1;
      for (let i = 0; i < n; i++) {
        g.fillStyle = `rgba(255,${180 + Math.random() * 60},90,${(0.5 + Math.random() * 0.5) * a0})`;
        g.fillRect(Math.random() * w, h * 0.9 + Math.random() * h * 0.08, 2, 2);
      }
    }
    if (weather === "foggy") {
      const f = g.createLinearGradient(0, h * 0.35, 0, h);
      f.addColorStop(0, "rgba(255,255,255,0)"); f.addColorStop(1, hexRgba(HAZE[phase], 0.8));
      g.fillStyle = f; g.fillRect(0, 0, w, h);
    }
  }
  const skyTexture = (phase, weather) => canvasTex(1024, 768, (g, w, h) => drawSky(g, w, h, phase, weather));

  // ---------- tileable layers that drift across the window ----------
  function cloudTile(count, rMin, rMax, alpha) {
    return canvasTex(1024, 256, (g, w, h) => {
      g.clearRect(0, 0, w, h);
      for (let i = 0; i < count; i++) {
        const x = Math.random() * w, y = h * (0.2 + Math.random() * 0.6), r = rMin + Math.random() * (rMax - rMin);
        for (const dx of [-w, 0, w]) {
          const gr = g.createRadialGradient(x + dx, y, 0, x + dx, y, r);
          gr.addColorStop(0, `rgba(255,255,255,${alpha})`); gr.addColorStop(0.5, `rgba(255,255,255,${alpha * 0.45})`); gr.addColorStop(1, "rgba(255,255,255,0)");
          g.fillStyle = gr; g.beginPath(); g.ellipse(x + dx, y, r * 1.8, r * 0.7, 0, 0, TAU); g.fill();
        }
      }
    }, { repeat: [1, 1] });
  }
  function hazeTile() {
    return canvasTex(512, 256, (g, w, h) => {
      g.clearRect(0, 0, w, h);
      for (let i = 0; i < 26; i++) {
        const x = Math.random() * w, y = Math.random() * h, rx = 120 + Math.random() * 140, ry = 14 + Math.random() * 30, a = 0.10 + Math.random() * 0.14;
        for (const dx of [-w, 0, w]) {
          const gr = g.createRadialGradient(x + dx, y, 0, x + dx, y, rx);
          gr.addColorStop(0, `rgba(255,255,255,${a})`); gr.addColorStop(1, "rgba(255,255,255,0)");
          g.save(); g.translate(x + dx, y); g.scale(1, ry / rx); g.translate(-(x + dx), -y);
          g.fillStyle = gr; g.beginPath(); g.arc(x + dx, y, rx, 0, TAU); g.fill(); g.restore();
        }
      }
    }, { repeat: [1, 1] });
  }
  function dropletTexture() {
    return canvasTex(512, 512, (g, w, h) => {
      g.clearRect(0, 0, w, h);
      for (let i = 0; i < 26; i++) {
        const x = Math.random() * w, y0 = Math.random() * h, len = 60 + Math.random() * 180;
        const gr = g.createLinearGradient(0, y0, 0, y0 + len);
        gr.addColorStop(0, "rgba(220,235,255,0)"); gr.addColorStop(0.8, "rgba(220,235,255,.25)"); gr.addColorStop(1, "rgba(255,255,255,.5)");
        g.strokeStyle = gr; g.lineWidth = 1.5 + Math.random() * 2;
        g.beginPath(); g.moveTo(x, y0); g.lineTo(x + (Math.random() - 0.5) * 6, y0 + len); g.stroke();
      }
      for (let i = 0; i < 160; i++) {
        const x = Math.random() * w, y = Math.random() * h, r = 1.5 + Math.random() * 4.5;
        const gr = g.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
        gr.addColorStop(0, "rgba(255,255,255,.6)"); gr.addColorStop(0.6, "rgba(200,220,245,.22)"); gr.addColorStop(1, "rgba(200,220,245,.05)");
        g.fillStyle = gr; g.beginPath(); g.ellipse(x, y, r * 0.85, r, 0, 0, TAU); g.fill();
      }
    }, { repeat: [1, 1] });
  }

  // ---------- the three books ----------
  const BOOK_SPECS = [
    { title: "MANAGEMENT", lines: ["MANAGEMENT"], sub: "Projects \u00b7 Teams \u00b7 Delivery", color: "#2f4b7c", foil: "#f2c46b", art: "gantt", w: 0.245, h: 0.04, d: 0.17 },
    { title: "BLOCKCHAIN", lines: ["BLOCKCHAIN"], sub: "Ledgers & Smart Contracts", color: "#6b2e3e", foil: "#e8c27a", art: "chain", w: 0.23, h: 0.036, d: 0.165 },
    { title: "ARTIFICIAL INTELLIGENCE", lines: ["ARTIFICIAL", "INTELLIGENCE"], sub: "Machine Learning & Language Models", color: "#0f3d47", foil: "#7fd6c4", art: "net", w: 0.24, h: 0.04, d: 0.17 }
  ];
  const ART = {
    gantt(g, w, h, foil) {
      g.fillStyle = foil;
      const x0 = w * 0.2, y0 = h * 0.16, bh = 20, gap = 14;
      [[0, 0.22], [0.14, 0.3], [0.34, 0.26], [0.5, 0.32]].forEach(([a, b], i) => g.fillRect(x0 + a * w * 0.6, y0 + i * (bh + gap), b * w * 0.6, bh));
      const dx = w * 0.74, dy = y0 + 4 * (bh + gap) + 4;
      g.beginPath(); g.moveTo(dx, dy - 16); g.lineTo(dx + 16, dy); g.lineTo(dx, dy + 16); g.lineTo(dx - 16, dy); g.closePath(); g.fill();
    },
    chain(g, w, h, foil) {
      const y = h * 0.3, s = 46, gap = 34, n = 4, total = n * s + (n - 1) * gap, x0 = (w - total) / 2;
      g.strokeStyle = foil; g.fillStyle = foil; g.lineWidth = 6;
      for (let i = 0; i < n; i++) {
        const x = x0 + i * (s + gap);
        g.strokeRect(x, y - s / 2, s, s);
        g.globalAlpha = 0.35; g.fillRect(x + 8, y - s / 2 + 8, s - 16, s - 16); g.globalAlpha = 1;
        if (i < n - 1) { g.beginPath(); g.moveTo(x + s, y); g.lineTo(x + s + gap, y); g.stroke(); }
      }
    },
    net(g, w, h, foil) {
      const layers = [3, 4, 3], xs = [w * 0.28, w * 0.5, w * 0.72], top = h * 0.14, bot = h * 0.46;
      const pts = layers.map((n, li) => Array.from({ length: n }, (_, i) => [xs[li], top + (bot - top) * ((i + 0.5) / n)]));
      g.strokeStyle = foil; g.globalAlpha = 0.45; g.lineWidth = 2;
      for (let l = 0; l < 2; l++) pts[l].forEach(a => pts[l + 1].forEach(b => { g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); }));
      g.globalAlpha = 1; g.fillStyle = foil;
      pts.flat().forEach(pt => { g.beginPath(); g.arc(pt[0], pt[1], 9, 0, TAU); g.fill(); });
    }
  };
  function bookCover(spec) {
    return canvasTex(720, 510, (g, w, h) => {
      g.fillStyle = spec.color; g.fillRect(0, 0, w, h);
      const sh = g.createLinearGradient(0, 0, w, h); sh.addColorStop(0, "rgba(255,255,255,.12)"); sh.addColorStop(1, "rgba(0,0,0,.28)");
      g.fillStyle = sh; g.fillRect(0, 0, w, h);
      g.strokeStyle = spec.foil; g.lineWidth = 6; g.strokeRect(26, 26, w - 52, h - 52); g.lineWidth = 2; g.strokeRect(38, 38, w - 76, h - 76);
      ART[spec.art](g, w, h, spec.foil);
      g.fillStyle = spec.foil; g.textAlign = "center"; g.textBaseline = "middle";
      const two = spec.lines.length > 1;
      g.font = `700 ${two ? 50 : 64}px Georgia, 'Times New Roman', serif`;
      spec.lines.forEach((l, i) => g.fillText(l, w / 2, two ? 300 + i * 58 : 330));
      g.font = "italic 27px Georgia, 'Times New Roman', serif";
      g.fillText(spec.sub, w / 2, 440);
    }, { aniso: 8 });
  }
  function bookSpine(spec) {
    return canvasTex(1024, Math.round(1024 * spec.h / spec.w), (g, w, h) => {
      g.fillStyle = spec.color; g.fillRect(0, 0, w, h);
      const sh = g.createLinearGradient(0, 0, 0, h); sh.addColorStop(0, "rgba(255,255,255,.14)"); sh.addColorStop(1, "rgba(0,0,0,.25)");
      g.fillStyle = sh; g.fillRect(0, 0, w, h);
      g.strokeStyle = spec.foil; g.lineWidth = 4;
      [h * 0.14, h * 0.86].forEach(y => { g.beginPath(); g.moveTo(30, y); g.lineTo(w - 30, y); g.stroke(); });
      g.fillStyle = spec.foil; g.textAlign = "center"; g.textBaseline = "middle";
      let size = 78; g.font = `700 ${size}px Georgia, 'Times New Roman', serif`;
      while (g.measureText(spec.title).width > w * 0.8 && size > 30) { size -= 2; g.font = `700 ${size}px Georgia, 'Times New Roman', serif`; }
      g.fillText(spec.title, w / 2, h / 2 + 3);
    }, { aniso: 8 });
  }
  function pagesTexture() {
    return canvasTex(128, 64, (g, w, h) => {
      g.fillStyle = "#efe7d4"; g.fillRect(0, 0, w, h);
      g.strokeStyle = "rgba(120,100,70,.28)"; g.lineWidth = 1;
      for (let y = 1; y < h; y += 3) { g.beginPath(); g.moveTo(0, y + 0.5); g.lineTo(w, y + 0.5); g.stroke(); }
    });
  }

  // ---------- lighting per time of day, and how each weather changes it ----------
  const PH = {
    night: { hemiSky: "#9aa8ff", hemiGnd: "#3a2414", hemi: 0.38, dirCol: "#8ea6ff", dir: 0.45, bounceCol: "#ffe9d0", bounce: 0,    lamp: 1,    bg: "#120d12" },
    dawn:  { hemiSky: "#ffc9a8", hemiGnd: "#4a3020", hemi: 0.55, dirCol: "#ffb07a", dir: 0.75, bounceCol: "#ffd9b8", bounce: 0.28, lamp: 0.7,  bg: "#241a20" },
    day:   { hemiSky: "#cfe4ff", hemiGnd: "#8a7050", hemi: 1.25, dirCol: "#fff2d8", dir: 1.25, bounceCol: "#fff6ea", bounce: 0.6,  lamp: 0.04, bg: "#2f2b36" },
    dusk:  { hemiSky: "#ffb48a", hemiGnd: "#3a2438", hemi: 0.5,  dirCol: "#ff9a6a", dir: 0.7,  bounceCol: "#ffc9a0", bounce: 0.22, lamp: 0.85, bg: "#1c141c" }
  };
  const WX = {
    sunny:  { tone: null,      k: 0,    dir: 1,    hemi: 1,    lampMin: 0 },
    cloudy: { tone: "#b8c0cc", k: 0.35, dir: 0.55, hemi: 0.95, lampMin: 0.1 },
    rainy:  { tone: "#8fa0b8", k: 0.5,  dir: 0.25, hemi: 0.8,  lampMin: 0.55 },
    foggy:  { tone: "#c8ced6", k: 0.55, dir: 0.3,  hemi: 0.95, lampMin: 0.3 },
    snowy:  { tone: "#dce8f5", k: 0.5,  dir: 0.45, hemi: 1.05, lampMin: 0.3 }
  };
  const CLOUD_LIGHT = { night: "#3a4260", dawn: "#f0c5b4", day: "#ffffff", dusk: "#e0a08a" };
  const CLOUD_DARK  = { night: "#232840", dawn: "#8f7f90", day: "#727b88", dusk: "#7a5f70" };
  const FOG_TINT    = { night: "#38405a", dawn: "#d8c8c8", day: "#dfe5ea", dusk: "#c4a8a8" };

  function keyboardTexture() {
    return canvasTex(1024, 400, (g, w, h) => {
      g.fillStyle = "#1c1d22"; g.fillRect(0, 0, w, h);
      const rows = 6, pad = 10;
      const kh = (h - pad * (rows + 1)) / rows;
      for (let r = 0; r < rows; r++) {
        const keys = r === 5 ? [1.3, 1.1, 1.3, 5.6, 1.3, 1.1, 1, 1, 1] : r === 0 ? Array(14).fill(1) : [1.4, ...Array(11).fill(1), 1.6];
        const total = keys.reduce((a, b) => a + b, 0);
        const unit = (w - pad * (keys.length + 1)) / total;
        let x = pad;
        keys.forEach(k => {
          const kw = unit * k;
          const y = pad + r * (kh + pad);
          g.fillStyle = "#0b0b0e";
          g.beginPath(); g.roundRect ? g.roundRect(x, y, kw, r === 0 ? kh * 0.7 : kh, 6) : g.rect(x, y, kw, kh); g.fill();
          g.fillStyle = "rgba(255,255,255,.05)"; g.fillRect(x + 3, y + 2, kw - 6, 2);
          x += kw + pad;
        });
      }
    });
  }

  function softDot(color = "255,255,255") {
    return canvasTex(64, 64, (g, w) => {
      const gr = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
      gr.addColorStop(0, `rgba(${color},1)`); gr.addColorStop(0.35, `rgba(${color},.45)`); gr.addColorStop(1, `rgba(${color},0)`);
      g.fillStyle = gr; g.fillRect(0, 0, w, w);
    });
  }

  // ======================================================================
  // ---------- props you can tap: the CV sheet and the Egety coin ----------
  function cvSheetTexture(name, role) {
    return canvasTex(420, 594, (g, w, h) => {
      g.fillStyle = "#f7f3ea"; g.fillRect(0, 0, w, h);
      g.fillStyle = "#1f2a44"; g.fillRect(0, 0, w, 96);
      g.textAlign = "left"; g.textBaseline = "middle";
      g.fillStyle = "#f7f3ea"; g.font = "700 34px Georgia, 'Times New Roman', serif"; g.fillText(name, 28, 40);
      g.fillStyle = "#f2c46b"; g.font = "500 16px Arial, sans-serif"; g.fillText(role, 28, 70);
      g.fillStyle = "#c9a25e"; g.beginPath(); g.arc(w - 56, 48, 30, 0, TAU); g.fill();
      g.fillStyle = "#1f2a44"; g.font = "700 30px Georgia, serif"; g.textAlign = "center"; g.fillText("CV", w - 56, 49); g.textAlign = "left";
      const section = (y, title, lines) => {
        g.fillStyle = "#1f2a44"; g.font = "700 15px Arial, sans-serif"; g.fillText(title, 28, y);
        g.fillStyle = "#c9a25e"; g.fillRect(28, y + 12, 364, 2);
        g.fillStyle = "#c4bfb0";
        for (let i = 0; i < lines; i++) g.fillRect(28, y + 30 + i * 16, 364 - (i % 3 === 2 ? 120 : i % 2 ? 30 : 0), 6);
        return y + 30 + lines * 16 + 14;
      };
      let y = 132;
      y = section(y, "PROFILE", 3); y = section(y + 6, "WORK EXPERIENCE", 8); y = section(y + 6, "TECHNICAL LEADERSHIP", 5); section(y + 6, "EDUCATION", 3);
    }, { aniso: 8 });
  }
  function coinTexture() {
    return canvasTex(256, 256, (g, w) => {
      const c = w / 2, gr = g.createRadialGradient(c * 0.8, c * 0.7, 10, c, c, c);
      gr.addColorStop(0, "#ffe9a8"); gr.addColorStop(0.6, "#e0b04a"); gr.addColorStop(1, "#a9791f");
      g.fillStyle = gr; g.fillRect(0, 0, w, w);
      g.strokeStyle = "#7a5510"; g.lineWidth = 8; g.beginPath(); g.arc(c, c, c - 16, 0, TAU); g.stroke();
      g.lineWidth = 3; g.beginPath(); g.arc(c, c, c - 30, 0, TAU); g.stroke();
      g.fillStyle = "#6b4a0e"; g.textAlign = "center"; g.textBaseline = "middle";
      g.font = "700 150px Georgia, 'Times New Roman', serif"; g.fillText("E", c, c - 8);
      g.font = "700 22px Arial, sans-serif"; g.fillText("EGETY", c, c + 88);
    });
  }

  function DeskScene(renderer, opts) {
    this.renderer = renderer;
    this.mobile = opts.mobile;
    this.reduced = opts.reducedMotion;
    this.profileName = opts.name;
    this.role = opts.role;
    this.scene = new T.Scene();
    this.scene.background = new T.Color("#120d12");
    this.scene.fog = new T.Fog("#120d12", 4, 9);
    this.camera = new T.PerspectiveCamera(40, 1, 0.01, 40);
    this.clock = 0;
    this.pointer = new T.Vector2(0, 0);
    this.pointerSmooth = new T.Vector2(0, 0);
    this.lidAngle = Math.PI / 2 - 0.02; // closed
    this.lidTarget = this.lidAngle;
    this.screenPower = 0; // 0 off → 1 on
    this.mode = "intro";
    this.fly = null;
    this.hoverScreen = false;
    this.hgHover = false;
    this.hoverProp = null;
    this.loc = { rtl: false, role: opts.role, tabs: ["Home", "Education", "Experience", "Projects", "Contact", "Resume", "Blog"], url: "devleb://home",
                 lines: ["Backend / Blockchain / Intelligence & data", "BSc Computer Science"], cta: "Step inside" };
    this._build();
    this._buildScreen();
    this._updateHourglass(0);
    this.resize(window.innerWidth, window.innerHeight);
    this.camera.position.copy(this.introPos);
    this.camera.lookAt(this.introLook);
  }

  DeskScene.prototype._build = function () {
    const s = this.scene;
    const shadowSize = this.mobile ? 1024 : 2048;
    const DESK_Y = 0.75;
    this.DESK_Y = DESK_Y;

    // --- lights (their colour and strength follow the time of day and weather, see _initEnv)
    this.hemi = new T.HemisphereLight(0x9aa8ff, 0x3a2414, 0.38); s.add(this.hemi);
    const moon = new T.DirectionalLight(0x8ea6ff, 0.45);
    moon.position.set(0.8, 2.6, -2.5);
    s.add(moon); this.sunMoon = moon;
    const bounce = new T.DirectionalLight(0xfff6ea, 0);
    bounce.position.set(-1.2, 1.6, 2.5);
    s.add(bounce); this.bounce = bounce;

    // --- room
    const floor = new T.Mesh(new T.PlaneGeometry(12, 12), new T.MeshStandardMaterial({ color: "#0c0909", roughness: 1 }));
    floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; s.add(floor);

    const wallMat = new T.MeshStandardMaterial({ map: wallTexture(), roughness: 0.95 });
    const wall = new T.Mesh(new T.PlaneGeometry(8, 4), wallMat);
    wall.position.set(0, 2, -0.72); wall.receiveShadow = true; s.add(wall);

    // window on the wall
    const win = new T.Group();
    const winGeo = new T.PlaneGeometry(1.2, 0.86);
    const sky = new T.Mesh(winGeo, new T.MeshBasicMaterial({ map: skyTexture("night", "sunny"), toneMapped: false }));
    win.add(sky);
    const sky2 = new T.Mesh(winGeo, new T.MeshBasicMaterial({ map: canvasTex(4, 4, () => {}), transparent: true, opacity: 0, toneMapped: false, depthWrite: false }));
    sky2.position.z = 0.002; sky2.renderOrder = 1; sky2.visible = false; win.add(sky2);
    this.sky = { a: sky, b: sky2 };
    const layer = (tex, w, hh, y, z, order) => {
      const m = new T.Mesh(new T.PlaneGeometry(w, hh), new T.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0, depthWrite: false, toneMapped: false, fog: false }));
      m.position.set(0, y, z); m.renderOrder = order; m.visible = false; win.add(m); return m;
    };
    this.layers = {
      sparse: layer(cloudTile(7, 60, 110, 0.85), 1.2, 0.5, 0.18, 0.003, 2),
      dense: layer(cloudTile(16, 70, 130, 0.9), 1.2, 0.7, 0.08, 0.004, 3),
      fog: layer(hazeTile(), 1.2, 0.86, 0, 0.005, 4),
      glass: layer(dropletTexture(), 1.2, 0.86, 0, 0.047, 7)
    };
    const rainN = this.mobile ? 110 : 200, snowN = this.mobile ? 80 : 150;
    this.rain = { n: rainN, x: new Float32Array(rainN), y: new Float32Array(rainN), v: new Float32Array(rainN), l: new Float32Array(rainN), pos: new Float32Array(rainN * 6) };
    for (let i = 0; i < rainN; i++) { this.rain.x[i] = (Math.random() - 0.5) * 1.16; this.rain.y[i] = (Math.random() - 0.5) * 0.84; this.rain.v[i] = 1.4 + Math.random() * 1.2; this.rain.l[i] = 0.04 + Math.random() * 0.05; }
    const rg = new T.BufferGeometry(); rg.setAttribute("position", new T.BufferAttribute(this.rain.pos, 3));
    this.rainMesh = new T.LineSegments(rg, new T.LineBasicMaterial({ color: 0xc4d8f0, transparent: true, opacity: 0, depthWrite: false, fog: false }));
    this.rainMesh.position.z = 0.012; this.rainMesh.renderOrder = 5; this.rainMesh.frustumCulled = false; this.rainMesh.visible = false; win.add(this.rainMesh);
    this.snow = { n: snowN, x: new Float32Array(snowN), y: new Float32Array(snowN), v: new Float32Array(snowN), ph: new Float32Array(snowN), pos: new Float32Array(snowN * 3) };
    for (let i = 0; i < snowN; i++) { this.snow.x[i] = (Math.random() - 0.5) * 1.16; this.snow.y[i] = (Math.random() - 0.5) * 0.84; this.snow.v[i] = 0.05 + Math.random() * 0.06; this.snow.ph[i] = Math.random() * TAU; }
    const sg = new T.BufferGeometry(); sg.setAttribute("position", new T.BufferAttribute(this.snow.pos, 3));
    this.snowMesh = new T.Points(sg, new T.PointsMaterial({ size: 0.017, map: softDot("255,255,255"), transparent: true, opacity: 0, depthWrite: false, fog: false }));
    this.snowMesh.position.z = 0.012; this.snowMesh.renderOrder = 5; this.snowMesh.frustumCulled = false; this.snowMesh.visible = false; win.add(this.snowMesh);
    const frameMat = new T.MeshStandardMaterial({ color: "#2a2230", roughness: 0.7 });
    const bars = [[1.3, 0.05, 0, 0.455], [1.3, 0.05, 0, -0.455], [0.05, 0.96, -0.625, 0], [0.05, 0.96, 0.625, 0], [0.03, 0.9, 0, 0], [1.25, 0.03, 0, 0]];
    bars.forEach(([w, h, x, y]) => { const b = new T.Mesh(new T.BoxGeometry(w, h, 0.05), frameMat); b.position.set(x, y, 0.02); win.add(b); });
    const sill = new T.Mesh(new T.BoxGeometry(1.42, 0.035, 0.12), frameMat); sill.position.set(0, -0.49, 0.05); win.add(sill);
    win.position.set(0.5, 1.52, -0.71);
    s.add(win);

    // --- desk
    const wood = woodTexture();
    const deskMat = new T.MeshStandardMaterial({ map: wood, roughness: 0.55, metalness: 0.05 });
    const top = new T.Mesh(new T.BoxGeometry(2.3, 0.05, 1.15), deskMat);
    top.position.set(0, DESK_Y - 0.025, -0.1); top.receiveShadow = true; top.castShadow = true; s.add(top);
    const legMat = new T.MeshStandardMaterial({ color: "#2a1c14", roughness: 0.6 });
    [[-1.08, 0.4], [1.08, 0.4], [-1.08, -0.6], [1.08, -0.6]].forEach(([x, z]) => {
      const l = new T.Mesh(new T.BoxGeometry(0.06, DESK_Y - 0.05, 0.06), legMat);
      l.position.set(x, (DESK_Y - 0.05) / 2, z); l.castShadow = true; s.add(l);
    });

    // --- laptop
    const lap = new T.Group();
    lap.position.set(0, DESK_Y, 0.02);
    s.add(lap);
    this.laptop = lap;
    const W = 0.62, D = 0.43, H = 0.02, LT = 0.008, LH = 0.405;
    this.lapDims = { W, D, H, LT, LH };
    const alu = new T.MeshStandardMaterial({ color: "#8d9099", metalness: 0.75, roughness: 0.32 });
    const baseGeo = new T.ExtrudeGeometry(roundedRectShape(W, D, 0.02), { depth: H, bevelEnabled: true, bevelThickness: 0.002, bevelSize: 0.002, bevelSegments: 2, curveSegments: 8 });
    baseGeo.rotateX(-Math.PI / 2);
    const base = new T.Mesh(baseGeo, alu);
    base.position.y = 0.002; base.castShadow = true; base.receiveShadow = true; lap.add(base);
    const kb = new T.Mesh(new T.PlaneGeometry(0.54, 0.2), new T.MeshStandardMaterial({ map: keyboardTexture(), roughness: 0.8 }));
    kb.rotation.x = -Math.PI / 2; kb.position.set(0, H + 0.0045, -0.07); lap.add(kb);
    const pad = new T.Mesh(new T.PlaneGeometry(0.2, 0.115), new T.MeshStandardMaterial({ color: "#7c7f88", metalness: 0.6, roughness: 0.25 }));
    pad.rotation.x = -Math.PI / 2; pad.position.set(0, H + 0.0045, 0.125); lap.add(pad);

    // lid pivot on the hinge
    const hinge = new T.Group();
    hinge.position.set(0, H + 0.004 + LT, -D / 2 + 0.012);
    lap.add(hinge);
    this.hinge = hinge;
    const lidGeo = new T.ExtrudeGeometry(roundedRectShape(W, LH, 0.02, -W / 2, 0), { depth: LT, bevelEnabled: true, bevelThickness: 0.0015, bevelSize: 0.0015, bevelSegments: 2, curveSegments: 8 });
    const lid = new T.Mesh(lidGeo, alu);
    lid.castShadow = true; hinge.add(lid);
    const bezel = new T.Mesh(new T.PlaneGeometry(W - 0.012, LH - 0.012), new T.MeshStandardMaterial({ color: "#09090c", roughness: 0.3, metalness: 0.2 }));
    bezel.position.set(0, LH / 2, LT + 0.0017); hinge.add(bezel);
    // logo on the back of the lid
    const logo = new T.Mesh(new T.CircleGeometry(0.028, 32), new T.MeshStandardMaterial({ color: "#f2a541", emissive: "#f2a541", emissiveIntensity: 0.25, metalness: 0.5, roughness: 0.3 }));
    logo.position.set(0, LH / 2, -0.0018); logo.rotation.y = Math.PI; hinge.add(logo);

    this.SCREEN_W = 0.566; this.SCREEN_H = this.SCREEN_W / 1.6;
    this.screenCanvas = document.createElement("canvas");
    this.screenCanvas.width = 1280; this.screenCanvas.height = 800;
    this.screenTex = new T.CanvasTexture(this.screenCanvas);
    this.screenTex.encoding = T.sRGBEncoding;
    this.screenTex.anisotropy = 8;
    const screen = new T.Mesh(new T.PlaneGeometry(this.SCREEN_W, this.SCREEN_H), new T.MeshBasicMaterial({ map: this.screenTex, toneMapped: false }));
    screen.position.set(0, LH / 2 + 0.006, LT + 0.0022);
    hinge.add(screen);
    this.screen = screen;

    this.screenLight = new T.PointLight(0x8aa0ff, 0, 1.4, 2);
    this.screenLight.position.set(0, LH / 2, 0.25);
    hinge.add(this.screenLight);

    // --- desk lamp
    const lamp = new T.Group();
    lamp.position.set(-0.78, DESK_Y, -0.32);
    s.add(lamp);
    const lampMat = new T.MeshStandardMaterial({ color: "#23262d", metalness: 0.6, roughness: 0.35 });
    const lb = new T.Mesh(new T.CylinderGeometry(0.1, 0.11, 0.02, 40), lampMat); lb.position.y = 0.01; lb.castShadow = true; lamp.add(lb);
    const arm1 = new T.Mesh(new T.CylinderGeometry(0.009, 0.009, 0.46, 12), lampMat);
    arm1.position.set(0.05, 0.23, 0.02); arm1.rotation.z = -0.22; arm1.castShadow = true; lamp.add(arm1);
    const joint = new T.Mesh(new T.SphereGeometry(0.018, 16, 12), lampMat); joint.position.set(0.1, 0.45, 0.04); lamp.add(joint);
    const arm2 = new T.Mesh(new T.CylinderGeometry(0.008, 0.008, 0.36, 12), lampMat);
    arm2.position.set(0.24, 0.5, 0.11); arm2.rotation.z = -1.25; arm2.rotation.y = -0.45; arm2.castShadow = true; lamp.add(arm2);
    const head = new T.Group(); head.position.set(0.39, 0.53, 0.19); lamp.add(head);
    const shade = new T.Mesh(new T.ConeGeometry(0.085, 0.13, 40, 1, true), new T.MeshStandardMaterial({ color: "#23262d", metalness: 0.55, roughness: 0.35, side: T.DoubleSide }));
    shade.castShadow = true;
    head.add(shade);
    const bulb = new T.Mesh(new T.SphereGeometry(0.03, 20, 16), new T.MeshBasicMaterial({ color: "#ffd9a0", toneMapped: false })); this.bulb = bulb;
    bulb.position.y = -0.03; head.add(bulb);
    // point the lamp head toward the laptop
    const headWorld = new T.Vector3(); head.getWorldPosition(headWorld);
    const target = new T.Vector3(0.05, DESK_Y, 0.05);
    head.lookAt(target); head.rotateX(-Math.PI / 2);
    const spot = new T.SpotLight(0xffb45e, 3.4, 4, 0.72, 0.65, 1.4);
    spot.position.copy(headWorld);
    spot.target.position.copy(target);
    spot.castShadow = true;
    spot.shadow.mapSize.set(shadowSize, shadowSize);
    spot.shadow.bias = -0.0004;
    spot.shadow.camera.near = 0.1; spot.shadow.camera.far = 3;
    s.add(spot); s.add(spot.target);
    this.spot = spot;
    const warmFill = new T.PointLight(0xff9a4a, 0.35, 2.2, 2); warmFill.position.copy(headWorld); s.add(warmFill); this.warmFill = warmFill;

    // dust drifting in the lamp beam
    const dustN = this.mobile ? 70 : 140;
    const dustGeo = new T.BufferGeometry();
    const dp = new Float32Array(dustN * 3);
    for (let i = 0; i < dustN; i++) {
      const t = Math.random();
      dp[i * 3] = lerp(headWorld.x, target.x, t) + (Math.random() - 0.5) * 0.35 * t;
      dp[i * 3 + 1] = lerp(headWorld.y, target.y + 0.05, t);
      dp[i * 3 + 2] = lerp(headWorld.z, target.z, t) + (Math.random() - 0.5) * 0.35 * t;
    }
    dustGeo.setAttribute("position", new T.BufferAttribute(dp, 3));
    this.dust = new T.Points(dustGeo, new T.PointsMaterial({ size: 0.006, map: softDot("255,210,150"), transparent: true, opacity: 0.55, depthWrite: false, blending: T.AdditiveBlending }));
    this.dustBase = dp.slice();
    s.add(this.dust);

    // --- mug with steam
    const mug = new T.Group(); mug.position.set(0.55, DESK_Y, 0.2); s.add(mug);
    const pts = [];
    for (let i = 0; i <= 12; i++) { const t = i / 12; pts.push(new T.Vector2(0.043 + Math.sin(t * Math.PI) * 0.003, t * 0.1)); }
    const mugMat = new T.MeshStandardMaterial({ color: "#e9e4da", roughness: 0.35 });
    const body = new T.Mesh(new T.LatheGeometry(pts, 40), new T.MeshStandardMaterial({ color: "#e9e4da", roughness: 0.35, side: T.DoubleSide }));
    body.castShadow = true; mug.add(body);
    const bottom = new T.Mesh(new T.CircleGeometry(0.043, 32), mugMat); bottom.rotation.x = -Math.PI / 2; bottom.position.y = 0.002; mug.add(bottom);
    const coffee = new T.Mesh(new T.CircleGeometry(0.041, 32), new T.MeshStandardMaterial({ color: "#2b160c", roughness: 0.2 }));
    coffee.rotation.x = -Math.PI / 2; coffee.position.y = 0.085; mug.add(coffee);
    const handle = new T.Mesh(new T.TorusGeometry(0.026, 0.007, 12, 24, Math.PI * 1.2), mugMat);
    handle.position.set(0.046, 0.05, 0); handle.rotation.z = -Math.PI * 0.6; handle.castShadow = true; mug.add(handle);
    mug.rotation.y = -0.6;
    this.steam = [];
    const steamTex = softDot("255,255,255");
    for (let i = 0; i < 5; i++) {
      const sp = new T.Sprite(new T.SpriteMaterial({ map: steamTex, transparent: true, opacity: 0, depthWrite: false }));
      sp.position.set(0.55, DESK_Y + 0.1, 0.2); sp.scale.setScalar(0.05);
      sp.userData.offset = i / 5; s.add(sp); this.steam.push(sp);
    }

    // --- plant
    const plant = new T.Group(); plant.position.set(0.92, DESK_Y, -0.38); s.add(plant);
    const pot = new T.Mesh(new T.CylinderGeometry(0.075, 0.058, 0.13, 32), new T.MeshStandardMaterial({ color: "#c9cfc0", roughness: 0.6 }));
    pot.position.y = 0.065; pot.castShadow = true; plant.add(pot);
    const soil = new T.Mesh(new T.CircleGeometry(0.07, 24), new T.MeshStandardMaterial({ color: "#2a1d14" })); soil.rotation.x = -Math.PI / 2; soil.position.y = 0.125; plant.add(soil);
    const leafMat = new T.MeshStandardMaterial({ color: "#3f7a4a", roughness: 0.55, side: T.DoubleSide });
    for (let i = 0; i < 11; i++) {
      const leaf = new T.Mesh(new T.SphereGeometry(0.05, 12, 8), leafMat);
      leaf.scale.set(0.35, 1.7, 0.12);
      const a = (i / 11) * TAU + Math.random() * 0.3;
      const tilt = 0.35 + Math.random() * 0.45;
      leaf.position.set(Math.cos(a) * 0.035, 0.2 + Math.random() * 0.05, Math.sin(a) * 0.035);
      leaf.rotation.set(Math.sin(a) * tilt, -a, -Math.cos(a) * tilt);
      leaf.castShadow = true; plant.add(leaf);
    }
    this.plant = plant;

    // --- books: management, blockchain and AI, stacked bottom to top
    const books = new T.Group(); books.position.set(-0.52, DESK_Y, 0.25); books.rotation.y = 0.35; s.add(books); this.booksGroup = books;
    const pageTex = pagesTexture();
    BOOK_SPECS.reduce((y, spec, i) => {
      const { w, h, d } = spec, t = 0.004;
      const b = new T.Group();
      const cloth = new T.MeshStandardMaterial({ color: spec.color, roughness: 0.75 });
      const pageMat = new T.MeshStandardMaterial({ map: pageTex, roughness: 0.95 });
      const topMats = [cloth, cloth, new T.MeshStandardMaterial({ map: bookCover(spec), roughness: 0.6 }), cloth, cloth, cloth];
      const spineMats = [cloth, cloth, cloth, cloth, new T.MeshStandardMaterial({ map: bookSpine(spec), roughness: 0.6 }), cloth];
      const bottom = new T.Mesh(new T.BoxGeometry(w, t, d), cloth); bottom.position.y = t / 2;
      const top = new T.Mesh(new T.BoxGeometry(w, t, d), topMats); top.position.y = h - t / 2;
      const spine = new T.Mesh(new T.BoxGeometry(w, h, t), spineMats); spine.position.set(0, h / 2, d / 2 - t / 2);
      const pages = new T.Mesh(new T.BoxGeometry(w - 0.008, h - 2 * t - 0.002, d - t - 0.006), pageMat); pages.position.set(0, h / 2, -t / 2 - 0.001);
      [bottom, top, spine, pages].forEach(m => { m.castShadow = true; m.receiveShadow = true; b.add(m); });
      b.position.set((i - 1) * 0.008, y, 0); b.rotation.y = (i - 1) * 0.08;
      books.add(b);
      return y + h;
    }, 0);

    // --- notebook + pen
    const note = new T.Mesh(new T.BoxGeometry(0.15, 0.008, 0.21), new T.MeshStandardMaterial({ color: "#1f3a3d", roughness: 0.85 }));
    note.position.set(0.5, DESK_Y + 0.004, 0.4); note.rotation.y = -0.25; note.castShadow = true; note.receiveShadow = true; s.add(note);
    const pen = new T.Mesh(new T.CylinderGeometry(0.004, 0.004, 0.14, 10), new T.MeshStandardMaterial({ color: "#f2a541", metalness: 0.4, roughness: 0.3 }));
    pen.rotation.z = Math.PI / 2; pen.rotation.y = 0.6; pen.position.set(0.51, DESK_Y + 0.013, 0.4); pen.castShadow = true; s.add(pen);

    // --- CV sheet: tap it to open the CV
    const cvGroup = new T.Group(); cvGroup.position.set(0.25, DESK_Y + 0.001, 0.45); cvGroup.rotation.y = 0.12; s.add(cvGroup);
    const paper = new T.MeshStandardMaterial({ color: "#f3eee2", roughness: 0.9 });
    const sheet = new T.Mesh(new T.BoxGeometry(0.148, 0.002, 0.21), [paper, paper, new T.MeshStandardMaterial({ map: cvSheetTexture(this.profileName, this.role), roughness: 0.85 }), paper, paper, paper]);
    sheet.position.y = 0.001; sheet.castShadow = true; sheet.receiveShadow = true; cvGroup.add(sheet);
    const cvHit = new T.Mesh(new T.BoxGeometry(0.17, 0.03, 0.23), new T.MeshBasicMaterial({ visible: false }));
    cvHit.position.y = 0.012; cvHit.userData.prop = "cv"; cvGroup.add(cvHit);
    this.cvGroup = cvGroup; this.cvHit = cvHit;

    // --- Egety coin on a little stand: tap it to see the project
    const coinBase = new T.Group(); coinBase.position.set(-0.4, DESK_Y, -0.26); s.add(coinBase);
    const brass2 = new T.MeshStandardMaterial({ color: "#b8945a", metalness: 0.7, roughness: 0.35 });
    const cBase = new T.Mesh(new T.CylinderGeometry(0.03, 0.034, 0.008, 32), brass2); cBase.position.y = 0.004; cBase.castShadow = true; coinBase.add(cBase);
    const cPost = new T.Mesh(new T.CylinderGeometry(0.0025, 0.0025, 0.08, 8), brass2); cPost.position.y = 0.048; coinBase.add(cPost);
    const coinSpin = new T.Group(); coinSpin.position.y = 0.098; coinBase.add(coinSpin);
    const rimMat = new T.MeshStandardMaterial({ color: "#c9992e", metalness: 0.7, roughness: 0.35 });
    const faceMat = new T.MeshStandardMaterial({ map: coinTexture(), metalness: 0.5, roughness: 0.4, emissive: "#3a2a08", emissiveIntensity: 0.35 });
    const coinMesh = new T.Mesh(new T.CylinderGeometry(0.038, 0.038, 0.007, 48), [rimMat, faceMat, faceMat]);
    coinMesh.rotation.x = Math.PI / 2; coinMesh.castShadow = true; coinSpin.add(coinMesh);
    const coinHit = new T.Mesh(new T.CylinderGeometry(0.065, 0.065, 0.14, 12), new T.MeshBasicMaterial({ visible: false }));
    coinHit.position.y = 0.09; coinHit.userData.prop = "coin"; coinBase.add(coinHit);
    this.coin = { group: coinBase, spin: coinSpin, boost: 0 }; this.coinHit = coinHit;

    // --- hourglass: the desk's hint at what is inside the laptop
    const hg = new T.Group(); hg.position.set(0.5, DESK_Y, -0.3); s.add(hg); this.hgGroup = hg;
    const brass = new T.MeshStandardMaterial({ color: "#b8945a", metalness: 0.7, roughness: 0.35 });
    const spin = new T.Group(); spin.position.y = 0.088; hg.add(spin);
    [0.08, -0.08].forEach(y => { const pl = new T.Mesh(new T.CylinderGeometry(0.05, 0.05, 0.01, 32), brass); pl.position.y = y; pl.castShadow = true; spin.add(pl); });
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * TAU + 0.4;
      const post = new T.Mesh(new T.CylinderGeometry(0.0035, 0.0035, 0.16, 8), brass);
      post.position.set(Math.cos(a) * 0.043, 0, Math.sin(a) * 0.043); post.castShadow = true; spin.add(post);
    }
    const prof = [[0.001, -0.07], [0.028, -0.066], [0.036, -0.045], [0.03, -0.02], [0.01, -0.006], [0.004, 0], [0.01, 0.006], [0.03, 0.02], [0.036, 0.045], [0.028, 0.066], [0.001, 0.07]].map(([r, y]) => new T.Vector2(r, y));
    spin.add(new T.Mesh(new T.LatheGeometry(prof, 32), new T.MeshStandardMaterial({ color: "#cfe6ff", transparent: true, opacity: 0.2, roughness: 0.05, metalness: 0.1, side: T.DoubleSide, depthWrite: false })));
    const sandMat = new T.MeshStandardMaterial({ color: "#f2a541", roughness: 0.8, emissive: "#f2a541", emissiveIntensity: 0.08 });
    const topSand = new T.Mesh(new T.CylinderGeometry(0.03, 0.005, 1, 20), sandMat); spin.add(topSand);
    const botSand = new T.Mesh(new T.ConeGeometry(0.033, 1, 20), sandMat); spin.add(botSand);
    const stream = new T.Mesh(new T.CylinderGeometry(0.0012, 0.0012, 0.07, 6), sandMat); stream.position.y = -0.03; spin.add(stream);
    // a generous invisible target so a fingertip can hit it, and a soft glow that invites a flip
    const hgHit = new T.Mesh(new T.CylinderGeometry(0.085, 0.085, 0.24, 12), new T.MeshBasicMaterial({ visible: false }));
    hgHit.position.y = 0.11; hgHit.userData.prop = "hourglass"; hg.add(hgHit); this.hgHit = hgHit;
    const hgHint = new T.Sprite(new T.SpriteMaterial({ map: softDot("242,165,65"), transparent: true, opacity: 0, depthWrite: false, blending: T.AdditiveBlending }));
    hgHint.scale.setScalar(0.3); hgHint.position.y = 0.09; hg.add(hgHint);
    this.hourglass = { spin, topSand, botSand, stream, hint: hgHint, n: 0, k: 0, flipT: null, RUN: 45 };

    // raycast targets
    this.raycaster = new T.Raycaster();
    this.hitTargets = [this.screen, bezel, lid];

    // camera framing
    this.introLook = new T.Vector3(0.02, DESK_Y + 0.17, -0.04);
    this.introPosBase = new T.Vector3(0.42, DESK_Y + 0.58, 1.38);
    this.introPos = this.introPosBase.clone();

    this._initEnv();
  };

  // ---------- the laptop screen (canvas) ----------
  DeskScene.prototype._buildScreen = function () {
    const n = 180;
    this.screenStars = Array.from({ length: n }, () => ({ x: Math.random(), y: 0.14 + Math.random() * 0.86, r: Math.random() * 1.6 + 0.4, p: Math.random() * TAU, s: 0.5 + Math.random() * 2 }));
    this._drawScreen(0);
  };

  DeskScene.prototype._drawScreen = function (t) {
    const g = this.screenCanvas.getContext("2d");
    const w = 1280, h = 800;
    const p = this.screenPower;
    g.fillStyle = "#000"; g.fillRect(0, 0, w, h);
    if (p <= 0.001) { this.screenTex.needsUpdate = true; return; }
    g.globalAlpha = clamp(p, 0, 1);

    const bg = g.createRadialGradient(w * 0.72, h * 0.45, 20, w * 0.6, h * 0.5, w * 0.9);
    bg.addColorStop(0, "#2a1a4a"); bg.addColorStop(0.5, "#101634"); bg.addColorStop(1, "#070b1a");
    g.fillStyle = bg; g.fillRect(0, 0, w, h);
    this.screenStars.forEach(st => {
      const a = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * st.s + st.p));
      g.fillStyle = `rgba(234,230,218,${a})`;
      g.beginPath(); g.arc(st.x * w, st.y * h, st.r, 0, TAU); g.fill();
    });
    const L = this.loc, rtl = !!L.rtl, fx = x => (rtl ? w - x : x);      // fx mirrors a position for right-to-left
    const FONT = "'Cairo', 'Instrument Sans', system-ui, sans-serif";
    // time dial: a brass-rimmed clock whose minute hand runs backwards
    const px = w * (rtl ? 0.23 : 0.77), py = h * 0.58, pr = 150;
    const halo = g.createRadialGradient(px, py, pr * 0.7, px, py, pr * 2.1);
    halo.addColorStop(0, "rgba(242,165,65,.32)"); halo.addColorStop(1, "rgba(242,165,65,0)");
    g.fillStyle = halo; g.fillRect(0, 0, w, h);
    g.lineWidth = 2;
    for (let i = 1; i <= 5; i++) {
      g.strokeStyle = `rgba(201,162,94,${0.34 - i * 0.05})`;
      g.setLineDash([7, 11]); g.lineDashOffset = t * 14 * (i % 2 ? 1 : -1);
      g.beginPath(); g.arc(px, py, pr * (1 + i * 0.3), 0, TAU); g.stroke();
    }
    g.setLineDash([]);
    const face = g.createRadialGradient(px - 40, py - 50, 10, px, py, pr);
    face.addColorStop(0, "#242d55"); face.addColorStop(1, "#090d1d");
    g.fillStyle = face; g.beginPath(); g.arc(px, py, pr, 0, TAU); g.fill();
    g.strokeStyle = "#c9a25e"; g.lineWidth = 9; g.beginPath(); g.arc(px, py, pr, 0, TAU); g.stroke();
    for (let i = 0; i < 60; i++) {
      const a = (i / 60) * TAU, major = i % 5 === 0, r1 = pr - 12, r2 = pr - (major ? 36 : 22);
      g.strokeStyle = major ? "#f6c98a" : "rgba(201,162,94,.6)"; g.lineWidth = major ? 4 : 2;
      g.beginPath(); g.moveTo(px + Math.cos(a) * r1, py + Math.sin(a) * r1); g.lineTo(px + Math.cos(a) * r2, py + Math.sin(a) * r2); g.stroke();
    }
    const hand = (a, len, wd, col) => {
      g.strokeStyle = col; g.lineWidth = wd; g.lineCap = "round";
      g.beginPath(); g.moveTo(px, py); g.lineTo(px + Math.sin(a) * len, py - Math.cos(a) * len); g.stroke();
    };
    hand(-t * 0.05 + 0.9, pr * 0.5, 9, "#eae6da");
    hand(-t * 0.6, pr * 0.78, 5, "#f2a541");
    g.lineCap = "butt";
    g.fillStyle = "#f2a541"; g.beginPath(); g.arc(px, py, 9, 0, TAU); g.fill();

    // browser chrome
    g.direction = rtl ? "rtl" : "ltr";
    g.fillStyle = "rgba(10,14,34,.92)"; g.fillRect(0, 0, w, 104);
    ["#ff6b5a", "#f2c14e", "#57c26a"].forEach((c, i) => { g.fillStyle = c; g.beginPath(); g.arc(fx(34 + i * 30), 30, 9, 0, TAU); g.fill(); });
    g.font = `500 20px ${FONT}`; g.textAlign = "center";
    let tx = fx(140);
    L.tabs.forEach((name, i) => {
      const tw = g.measureText(name).width + 44, x0 = rtl ? tx - tw : tx;
      if (i === 0) { g.fillStyle = "rgba(234,230,218,.12)"; g.beginPath(); (g.roundRect ? g.roundRect(x0, 10, tw, 40, 10) : g.rect(x0, 10, tw, 40)); g.fill(); }
      g.fillStyle = i === 0 ? "#eae6da" : "rgba(234,230,218,.55)";
      g.fillText(name, x0 + tw / 2, 37);
      tx += rtl ? -(tw + 6) : tw + 6;
    });
    g.fillStyle = "rgba(234,230,218,.08)";
    g.beginPath(); (g.roundRect ? g.roundRect(rtl ? 40 : 140, 60, w - 180, 34, 17) : g.rect(rtl ? 40 : 140, 60, w - 180, 34)); g.fill();
    g.fillStyle = "rgba(234,230,218,.7)"; g.font = `400 18px ${FONT}`; g.direction = "ltr"; g.textAlign = rtl ? "right" : "left";
    g.fillText(L.url, rtl ? w - 162 : 162, 83);

    // hero text
    g.direction = rtl ? "rtl" : "ltr"; g.textAlign = rtl ? "right" : "left";
    g.fillStyle = "#eae6da";
    g.font = `600 76px 'Unbounded', ${FONT}`;
    g.fillText(this.profileName, fx(86), 330);
    g.fillStyle = "#f2a541";
    g.font = `500 30px ${FONT}`;
    g.fillText(L.role, fx(90), 385);
    g.fillStyle = "rgba(234,230,218,.7)";
    g.font = `400 24px ${FONT}`;
    L.lines.forEach((l, i) => g.fillText(l, fx(90), 440 + i * 36));

    // call to action pulse
    const pulse = 0.5 + 0.5 * Math.sin(t * 3);
    const hover = this.hoverScreen ? 1 : 0, bx = rtl ? w - 340 : 90;
    g.fillStyle = `rgba(242,165,65,${0.85 + 0.15 * hover})`;
    g.beginPath(); (g.roundRect ? g.roundRect(bx, 560, 250, 64, 32) : g.rect(bx, 560, 250, 64)); g.fill();
    g.strokeStyle = `rgba(242,165,65,${0.4 * (1 - pulse)})`; g.lineWidth = 3 + pulse * 10;
    g.beginPath(); (g.roundRect ? g.roundRect(bx - pulse * 8, 560 - pulse * 8, 250 + pulse * 16, 64 + pulse * 16, 40) : g.rect(bx, 560, 250, 64)); g.stroke();
    g.fillStyle = "#1a0f06"; g.font = `600 24px ${FONT}`; g.textAlign = "center";
    g.fillText(L.cta, bx + 125, 600);
    g.direction = "ltr"; g.textAlign = "left";

    // boot overlay
    if (p < 1) {
      g.globalAlpha = 1 - p;
      g.fillStyle = "#070b1a"; g.fillRect(0, 0, w, h);
      g.fillStyle = "#f2a541"; g.font = "600 56px 'Unbounded', system-ui, sans-serif";
      g.textAlign = "center"; g.fillText("DevLeb", w / 2, h / 2 + 18); g.textAlign = "left";
    }
    g.globalAlpha = 1;
    // subtle scanline glare
    const glare = g.createLinearGradient(0, 0, w, h);
    glare.addColorStop(0, "rgba(255,255,255,.06)"); glare.addColorStop(0.4, "rgba(255,255,255,0)");
    g.fillStyle = glare; g.fillRect(0, 0, w, h);
    this.screenTex.needsUpdate = true;
  };

  // Which prop (if any) is under the pointer: "hourglass", "cv", "coin" or null.
  DeskScene.prototype.pickProp = function (ndcX, ndcY) {
    this.raycaster.setFromCamera({ x: ndcX, y: ndcY }, this.camera);
    const hits = this.raycaster.intersectObjects([this.hgHit, this.cvHit, this.coinHit], false);
    return hits.length ? hits[0].object.userData.prop : null;
  };
  DeskScene.prototype.setHoverProp = function (prop) { this.hoverProp = prop; this.hgHover = prop === "hourglass"; };
  DeskScene.prototype.spinCoin = function () { this.coin.boost = 12; };
  DeskScene.prototype._updateProps = function (dt) {
    const c = this.coin;
    if (this.reduced) c.spin.rotation.y = 0.5;
    else { c.spin.rotation.y += dt * (0.9 + (this.hoverProp === "coin" ? 2.2 : 0) + c.boost); c.boost = Math.max(0, c.boost - dt * 6); }
    const target = this.DESK_Y + 0.001 + (this.hoverProp === "cv" ? 0.014 : 0);
    this.cvGroup.position.y += (target - this.cvGroup.position.y) * (this.reduced ? 1 : 1 - Math.exp(-dt * 10));
  };

  // text drawn on the laptop screen (English or Arabic, left-to-right or right-to-left)
  DeskScene.prototype.setLocale = function (loc) { this.loc = Object.assign({}, this.loc, loc); };

  // The sand runs for 45 s and then waits for the visitor to flip the hourglass.
  // k = how much sand has fallen; n = how many times it has been flipped.
  DeskScene.prototype._updateHourglass = function (dt) {
    const h = this.hourglass, FLIP = this.reduced ? 0.01 : 1.2;
    let rot, lift = 0;
    if (h.flipT !== null) {
      h.flipT += dt;
      const p = clamp(h.flipT / FLIP, 0, 1);
      rot = Math.PI * (h.n - 1 + easeInOut(p)); lift = Math.sin(Math.PI * p) * 0.03;
      if (p >= 1) h.flipT = null;
    } else {
      rot = Math.PI * h.n;
      if (h.k < 1) h.k = Math.min(1, h.k + dt / h.RUN);
    }
    h.spin.rotation.z = rot; h.spin.position.y = 0.088 + lift;
    const top = h.n % 2 === 0 ? 1 - h.k : h.k, bot = 1 - top;
    const th = Math.max(0.001, top * 0.055), bh = Math.max(0.001, bot * 0.05);
    h.topSand.scale.y = th; h.topSand.position.y = 0.006 + th / 2;
    h.botSand.scale.y = bh; h.botSand.position.y = -0.066 + bh / 2;
    h.stream.visible = h.flipT === null && h.k > 0.001 && h.k < 0.999;
    const done = h.flipT === null && h.k >= 1;
    h.hint.material.opacity = done ? 0.25 + 0.2 * Math.sin(this.clock * 3) : (this.hgHover ? 0.3 : 0);
  };

  DeskScene.prototype.hitHourglass = function (ndcX, ndcY) {
    this.raycaster.setFromCamera({ x: ndcX, y: ndcY }, this.camera);
    return this.raycaster.intersectObject(this.hgHit, false).length > 0;
  };

  // Flip it. Flipping mid-run sends the sand back up: what had fallen becomes what still has to fall.
  DeskScene.prototype.flipHourglass = function () {
    const h = this.hourglass;
    if (h.flipT !== null) return false;
    h.k = 1 - h.k; h.n++; h.flipT = 0;
    return true;
  };

  // ---------- time of day + weather ----------
  DeskScene.prototype._envTarget = function (phase, weather) {
    const P = PH[phase], W = WX[weather];
    const mixc = hex => { const c = new T.Color(hex); if (W.tone) c.lerp(new T.Color(W.tone), W.k); return c; };
    const tint = new T.Color(CLOUD_LIGHT[phase]);
    const dark = { sunny: 0, cloudy: 0.15, rainy: 0.6, foggy: 0.2, snowy: 0.1 }[weather];
    tint.lerp(new T.Color(CLOUD_DARK[phase]), dark);
    return {
      hemiSky: mixc(P.hemiSky), hemiGnd: mixc(P.hemiGnd), dirCol: mixc(P.dirCol), bounceCol: mixc(P.bounceCol), bg: new T.Color(P.bg),
      cloudTint: tint, fogTint: new T.Color(FOG_TINT[phase]),
      hemi: P.hemi * W.hemi, dir: P.dir * W.dir, bounce: P.bounce * (weather === "sunny" ? 1 : 0.8), lamp: Math.max(P.lamp, W.lampMin),
      rain: weather === "rainy" ? 1 : 0, snow: weather === "snowy" ? 1 : 0, fog: weather === "foggy" ? 1 : 0,
      sparse: weather === "sunny" ? (phase === "night" ? 0.3 : 0.85) : weather === "cloudy" ? 0.5 : 0,
      dense: { sunny: 0, cloudy: 0.65, rainy: 0.95, foggy: 0.3, snowy: 0.85 }[weather],
      glass: weather === "rainy" ? 1 : weather === "foggy" ? 0.35 : 0
    };
  };
  DeskScene.prototype._cloneEnv = function (t) {
    const o = {}; for (const k in t) o[k] = t[k].isColor ? t[k].clone() : t[k]; return o;
  };
  DeskScene.prototype._initEnv = function () {
    this.env = { phase: "night", weather: "sunny" };
    this.env.tgt = this._envTarget("night", "sunny");
    this.env.cur = this._cloneEnv(this.env.tgt);
    this.colOn = new T.Color("#ffd9a0"); this.colOff = new T.Color("#5f564b");
    this.skyFade = null;
    this._stepEnv(0); this._updateFx(0);
  };
  DeskScene.prototype.getEnvironment = function () { return { phase: this.env.phase, weather: this.env.weather }; };

  DeskScene.prototype.setEnvironment = function (phase, weather, opts) {
    const e = this.env;
    if (!PH[phase] || !WX[weather] || (e.phase === phase && e.weather === weather)) return;
    const instant = !!(opts && opts.instant) || this.reduced;
    e.tgt = this._envTarget(phase, weather);
    if (instant) e.cur = this._cloneEnv(e.tgt);
    const tex = skyTexture(phase, weather), s = this.sky;
    if (this.skyFade) this._finishSkyFade();
    if (instant) {
      s.a.material.map.dispose(); s.a.material.map = tex;
    } else {
      s.b.material.map.dispose(); s.b.material.map = tex; s.b.material.opacity = 0; s.b.visible = true;
      this.skyFade = { t: 0, dur: 1.6 };
    }
    e.phase = phase; e.weather = weather;
    if (instant) { this._stepEnv(0); this._updateFx(0); }
  };
  DeskScene.prototype._finishSkyFade = function () {
    const s = this.sky;
    s.a.material.map.dispose(); s.a.material.map = s.b.material.map;
    s.b.material.map = canvasTex(4, 4, () => {}); s.b.material.opacity = 0; s.b.visible = false;
    this.skyFade = null;
  };

  // eases the lights toward the current target and applies them
  DeskScene.prototype._stepEnv = function (dt) {
    const e = this.env; if (!e) return;
    const k = this.reduced ? 1 : 1 - Math.exp(-dt * 2.4);
    for (const key in e.tgt) {
      const a = e.cur[key], b = e.tgt[key];
      if (a.isColor) a.lerp(b, k); else e.cur[key] = a + (b - a) * k;
    }
    const c = e.cur;
    this.hemi.color.copy(c.hemiSky); this.hemi.groundColor.copy(c.hemiGnd); this.hemi.intensity = c.hemi;
    this.sunMoon.color.copy(c.dirCol); this.sunMoon.intensity = c.dir;
    this.bounce.color.copy(c.bounceCol); this.bounce.intensity = c.bounce;
    this.scene.background.copy(c.bg); this.scene.fog.color.copy(c.bg);
    this.spot.intensity = 3.4 * c.lamp; this.warmFill.intensity = 0.35 * c.lamp; this.dust.material.opacity = 0.55 * c.lamp;
    this.bulb.material.color.copy(this.colOff).lerp(this.colOn, Math.min(1, c.lamp));
  };

  // clouds, fog, rain, snow and the droplets on the glass
  DeskScene.prototype._updateFx = function (dt) {
    const c = this.env.cur, L = this.layers, drift = this.reduced ? 0 : dt;
    if (this.skyFade) {
      const f = this.skyFade; f.t = Math.min(1, f.t + dt / f.dur);
      this.sky.b.material.opacity = easeInOut(f.t);
      if (f.t >= 1) this._finishSkyFade();
    }
    const setLayer = (m, op, tint, speed) => {
      m.visible = op > 0.01; if (!m.visible) return;
      m.material.opacity = op; m.material.color.copy(tint);
      m.material.map.offset.x = (m.material.map.offset.x + drift * speed) % 1;
    };
    setLayer(L.sparse, c.sparse, c.cloudTint, 0.006);
    setLayer(L.dense, c.dense, c.cloudTint, 0.011);
    setLayer(L.fog, c.fog * 0.7, c.fogTint, 0.004);
    const gl = L.glass; gl.visible = c.glass > 0.01;
    if (gl.visible) { gl.material.opacity = c.glass * 0.9; gl.material.map.offset.y = (gl.material.map.offset.y + drift * 0.012 * (c.rain > 0.5 ? 1 : 0.15)) % 1; }

    const R = this.rain, rm = this.rainMesh;
    rm.visible = c.rain > 0.01;
    if (rm.visible) {
      rm.material.opacity = 0.55 * c.rain;
      for (let i = 0; i < R.n; i++) {
        if (drift) {
          R.y[i] -= R.v[i] * drift * 0.5; R.x[i] -= R.v[i] * drift * 0.12;
          if (R.y[i] < -0.44) { R.y[i] = 0.44; R.x[i] = (Math.random() - 0.5) * 1.16; }
          if (R.x[i] < -0.6) R.x[i] += 1.2;
        }
        const j = i * 6;
        R.pos[j] = R.x[i]; R.pos[j + 1] = R.y[i]; R.pos[j + 2] = 0;
        R.pos[j + 3] = R.x[i] + R.l[i] * 0.25; R.pos[j + 4] = R.y[i] + R.l[i]; R.pos[j + 5] = 0;
      }
      rm.geometry.attributes.position.needsUpdate = true;
    }
    const S = this.snow, sm = this.snowMesh;
    sm.visible = c.snow > 0.01;
    if (sm.visible) {
      sm.material.opacity = 0.9 * c.snow;
      for (let i = 0; i < S.n; i++) {
        if (drift) { S.y[i] -= S.v[i] * drift; if (S.y[i] < -0.44) { S.y[i] = 0.44; S.x[i] = (Math.random() - 0.5) * 1.16; } }
        S.pos[i * 3] = S.x[i] + Math.sin(this.clock * 0.9 + S.ph[i]) * 0.02; S.pos[i * 3 + 1] = S.y[i]; S.pos[i * 3 + 2] = 0;
      }
      sm.geometry.attributes.position.needsUpdate = true;
    }
  };

  // ---------- public API ----------
  DeskScene.prototype.resize = function (w, h) {
    const aspect = w / h;
    this.camera.aspect = aspect;
    // pull back on narrow (portrait) screens so the laptop stays framed
    const k = aspect < 1 ? clamp(0.8 / aspect, 1, 1.9) : aspect < 1.3 ? 1.15 : 1;
    // on a portrait screen keep the books and the hourglass inside the frame
    this.booksGroup.position.x = aspect < 1 ? -0.44 : -0.52;
    this.hgGroup.position.x = aspect < 1 ? 0.42 : 0.5;
    this.camera.fov = aspect < 1 ? 56 : 40;
    // on portrait screens aim a little lower so the laptop sits above the intro text
    this.introLook.y = this.DESK_Y + (aspect < 1 ? 0.02 : 0.17);
    this.introPos = this.introLook.clone().add(this.introPosBase.clone().sub(this.introLook).multiplyScalar(k));
    this.camera.updateProjectionMatrix();
    if (this.mode === "intro" && !this.fly) this.camera.position.copy(this.introPos);
  };

  DeskScene.prototype.openLid = function () {
    this.lidTarget = -0.26;
    this.powerOnAt = this.clock + (this.reduced ? 0 : 1.1);
  };

  DeskScene.prototype.setPointer = function (x, y) { this.pointer.set(x, y); };

  DeskScene.prototype.hitScreen = function (ndcX, ndcY) {
    this.raycaster.setFromCamera({ x: ndcX, y: ndcY }, this.camera);
    return this.raycaster.intersectObjects(this.hitTargets, false).length > 0;
  };

  DeskScene.prototype._screenFrame = function () {
    this.scene.updateMatrixWorld(true);
    const center = new T.Vector3(); this.screen.getWorldPosition(center);
    const q = new T.Quaternion(); this.screen.getWorldQuaternion(q);
    const normal = new T.Vector3(0, 0, 1).applyQuaternion(q);
    const up = new T.Vector3(0, 1, 0).applyQuaternion(q);
    const vfov = (this.camera.fov * Math.PI) / 180;
    const tanH = Math.tan(vfov / 2);
    const dH = this.SCREEN_H / 2 / tanH;
    const dW = this.SCREEN_W / 2 / (tanH * this.camera.aspect);
    const d = Math.min(dH, dW) * 0.96; // fill the viewport completely
    const pos = center.clone().add(normal.clone().multiplyScalar(d));
    const m = new T.Matrix4().lookAt(pos, center, up);
    const quat = new T.Quaternion().setFromRotationMatrix(m);
    return { pos, quat, center };
  };

  // fly into the screen; onProgress(t 0..1)
  DeskScene.prototype.enter = function (onProgress) {
    return new Promise(resolve => {
      this.lidAngle = this.lidTarget = -0.26;
      this.screenPower = 1;
      const end = this._screenFrame();
      const startPos = this.camera.position.clone();
      const startQuat = this.camera.quaternion.clone();
      const mid = startPos.clone().lerp(end.pos, 0.5); mid.y += 0.08; mid.x += 0.12;
      this.mode = "entering";
      this.fly = { t: 0, dur: this.reduced ? 0.01 : 1.7, startPos, startQuat, mid, end, onProgress, resolve };
    });
  };

  // fly back out to the desk view
  DeskScene.prototype.exit = function (onProgress) {
    return new Promise(resolve => {
      const from = this._screenFrame();
      this.camera.position.copy(from.pos);
      this.camera.quaternion.copy(from.quat);
      const m = new T.Matrix4().lookAt(this.introPos, this.introLook, new T.Vector3(0, 1, 0));
      const endQuat = new T.Quaternion().setFromRotationMatrix(m);
      const mid = from.pos.clone().lerp(this.introPos, 0.5); mid.y += 0.1; mid.x -= 0.1;
      this.mode = "exiting";
      this.fly = { t: 0, dur: this.reduced ? 0.01 : 1.5, startPos: from.pos.clone(), startQuat: from.quat.clone(), mid, end: { pos: this.introPos.clone(), quat: endQuat }, onProgress, resolve, out: true };
    });
  };

  DeskScene.prototype.update = function (dt) {
    this.clock += dt;
    const t = this.clock;

    // lid
    this.lidAngle += (this.lidTarget - this.lidAngle) * (this.reduced ? 1 : 1 - Math.pow(0.02, dt));
    this.hinge.rotation.x = this.lidAngle;
    if (this.powerOnAt !== undefined && t > this.powerOnAt) this.screenPower = Math.min(1, this.screenPower + dt / (this.reduced ? 0.01 : 1.2));
    this.screenLight.intensity = 0.7 * this.screenPower;

    // screen canvas at ~30fps
    this._screenAcc = (this._screenAcc || 0) + dt;
    if (this._screenAcc > 1 / 30 && this.mode !== "hidden") { this._screenAcc = 0; this._drawScreen(t); }

    // ambient life
    if (!this.reduced) {
      this.plant.rotation.z = Math.sin(t * 0.7) * 0.01;
      const dp = this.dust.geometry.attributes.position;
      for (let i = 0; i < dp.count; i++) {
        dp.array[i * 3] = this.dustBase[i * 3] + Math.sin(t * 0.3 + i) * 0.02;
        dp.array[i * 3 + 1] = this.dustBase[i * 3 + 1] + Math.sin(t * 0.2 + i * 1.7) * 0.03;
      }
      dp.needsUpdate = true;
      this.steam.forEach(sp => {
        const k = (t * 0.22 + sp.userData.offset) % 1;
        sp.position.y = this.DESK_Y + 0.1 + k * 0.22;
        sp.position.x = 0.55 + Math.sin(k * 6 + sp.userData.offset * 9) * 0.02;
        sp.scale.setScalar(0.04 + k * 0.08);
        sp.material.opacity = Math.sin(k * Math.PI) * 0.12;
      });
    }

    this._updateHourglass(dt);
    this._updateProps(dt);
    this._stepEnv(dt);
    this._updateFx(dt);

    // camera
    if (this.fly) {
      const f = this.fly;
      f.t = Math.min(1, f.t + dt / f.dur);
      const e = easeInOut(f.t);
      const a = f.startPos.clone().lerp(f.mid, e), b = f.mid.clone().lerp(f.end.pos, e);
      this.camera.position.copy(a.lerp(b, e));
      const qe = f.out ? easeOut(f.t) : Math.pow(e, 0.8);
      this.camera.quaternion.copy(f.startQuat).slerp(f.end.quat, qe);
      if (f.onProgress) f.onProgress(f.t);
      if (f.t >= 1) {
        this.fly = null;
        this.mode = f.out ? "intro" : "inside";
        f.resolve();
      }
    } else if (this.mode === "intro") {
      const k = this.reduced ? 0 : 1 - Math.pow(0.05, dt);
      this.pointerSmooth.lerp(this.pointer, k);
      const off = new T.Vector3(this.pointerSmooth.x * 0.16, -this.pointerSmooth.y * 0.08 + Math.sin(t * 0.4) * 0.008, 0);
      this.camera.position.copy(this.introPos).add(off);
      this.camera.lookAt(this.introLook);
    }
  };

  DeskScene.prototype.render = function () {
    this.renderer.render(this.scene, this.camera);
  };

  window.DeskScene = DeskScene;
})();
