/* ==========================================================================
   Time scene — the backdrop inside the laptop browser.
   A tunnel of clock dials. Each page is a moment in time marked by a brass
   astrolabe clock. Switching tabs travels through the tunnel: twisting one
   way into the past, the other way into the future.
   ========================================================================== */
(function () {
  const T = window.THREE;
  const TAU = Math.PI * 2;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const easeOut = t => 1 - Math.pow(1 - t, 3);
  const easeIn = t => t * t * t;
  const ROMAN = ["XII", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI"];

  // clock look per page (label comes from the browser's era for that page)
  const MARKERS = {
    home:       { tint: "#f2a541", metal: "#c9a25e" },
    education:  { tint: "#7cc7b4", metal: "#b7c4bd" },
    experience: { tint: "#e0a36a", metal: "#b87333" },
    projects:   { tint: "#7cc7b4", metal: "#c9a25e" },
    contact:    { tint: "#f6c98a", metal: "#d9c7a0" },
    resume:     { tint: "#f2a541", metal: "#b8945a" },
    blog:       { tint: "#c9a0dc", metal: "#b9a6c9" },
    notfound:   { tint: "#8a90a8", metal: "#6f7382" }
  };

  function tex(w, h, draw) {
    const c = document.createElement("canvas"); c.width = w; c.height = h;
    draw(c.getContext("2d"), w, h);
    const t = new T.CanvasTexture(c); t.encoding = T.sRGBEncoding; t.anisotropy = 4; return t;
  }
  const rgba = (hex, a) => { const n = parseInt(hex.slice(1), 16); return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`; };

  // a transparent clock-dial band: ticks, numerals, gear teeth
  function dialTexture(variant, color, size = 1024) {
    return tex(size, size, (g, w) => {
      g.scale(w / 1024, w / 1024); w = 1024;
      const c = w / 2, r1 = w * 0.49, r0 = w * 0.37;
      g.strokeStyle = rgba(color, 0.9); g.fillStyle = rgba(color, 0.9);
      g.lineWidth = 4; g.beginPath(); g.arc(c, c, r1, 0, TAU); g.stroke();
      g.lineWidth = 2; g.beginPath(); g.arc(c, c, r0, 0, TAU); g.stroke();
      for (let i = 0; i < 60; i++) {
        const a = (i / 60) * TAU, major = i % 5 === 0;
        const len = major ? 34 : 16;
        g.lineWidth = major ? 5 : 2;
        g.beginPath();
        g.moveTo(c + Math.cos(a) * (r1 - 8), c + Math.sin(a) * (r1 - 8));
        g.lineTo(c + Math.cos(a) * (r1 - 8 - len), c + Math.sin(a) * (r1 - 8 - len));
        g.stroke();
      }
      g.textAlign = "center"; g.textBaseline = "middle";
      g.font = `600 ${variant === 0 ? 46 : 34}px Georgia, 'Times New Roman', serif`;
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * TAU - Math.PI / 2;
        const rr = (r0 + r1) / 2 - 20;
        g.save(); g.translate(c + Math.cos(a) * rr, c + Math.sin(a) * rr); g.rotate(a + Math.PI / 2);
        g.fillText(variant === 0 ? ROMAN[i] : variant === 1 ? String(i * 5).padStart(2, "0") : "", 0, 0);
        g.restore();
      }
      if (variant === 2) { // gear teeth
        for (let i = 0; i < 72; i++) {
          g.save(); g.translate(c, c); g.rotate((i / 72) * TAU);
          g.fillRect(-7, -r1 - 2, 14, 18); g.restore();
        }
        g.setLineDash([10, 14]); g.lineWidth = 3; g.beginPath(); g.arc(c, c, r0 + 30, 0, TAU); g.stroke(); g.setLineDash([]);
      }
    });
  }

  function glowTexture(color) {
    return tex(256, 256, (g, w) => {
      const gr = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
      gr.addColorStop(0, rgba(color, 0.55)); gr.addColorStop(0.35, rgba(color, 0.16)); gr.addColorStop(1, rgba(color, 0));
      g.fillStyle = gr; g.fillRect(0, 0, w, w);
    });
  }

  function TimeScene(renderer, opts) {
    this.renderer = renderer;
    this.mobile = opts.mobile;
    this.reduced = opts.reducedMotion;
    this.S = this.mobile ? 512 : 1024; // texture size
    this.scene = new T.Scene();
    this.bg = new T.Color("#0a0e1a");
    this.scene.background = this.bg.clone();
    this.scene.fog = new T.Fog(this.bg.clone(), 30, 520);
    this.camera = new T.PerspectiveCamera(60, 1, 0.1, 2000);
    this.baseFov = 60;
    this.speed = 0.3; this.dir = 1;
    this.clock = 0;
    this.pointer = new T.Vector2(); this.pointerSmooth = new T.Vector2();
    this.scroll = 0; this.scrollSmooth = 0;
    this.nudge = 0;
    this.rm = { n: 0, t: 0, total: 0 };   // delivery roadmap progress, shared by every page's dial
    this.cache = {};
    this.labels = opts.labels || {};
    this.warp = null;
    this.tintPast = new T.Color("#e0a060");
    this.tintFuture = new T.Color("#7cc7b4");
    this.tintRest = new T.Color("#f2a541");

    // light at the end of the tunnel
    this.endGlow = new T.Sprite(new T.SpriteMaterial({ map: glowTexture("#ffffff"), color: this.tintRest.clone(), transparent: true, depthWrite: false, blending: T.AdditiveBlending, fog: false }));
    this.endGlow.position.set(0, 0, -900); this.endGlow.scale.setScalar(700);
    this.scene.add(this.endGlow);

    // lights for the brass clocks
    this.scene.add(new T.AmbientLight(0x505a80, 0.55));
    const key = new T.DirectionalLight(0xffe2b8, 1.3); key.position.set(-30, 25, 40); this.scene.add(key);
    const rim = new T.DirectionalLight(0x7cc7b4, 0.55); rim.position.set(40, -10, -20); this.scene.add(rim);

    // tunnel of dials
    const K = this.mobile ? 16 : 24;
    this.SPACING = 22; this.DEPTH = K * this.SPACING;
    const dialTex = [dialTexture(0, "#c9a25e", this.S), dialTexture(1, "#7cc7b4", this.S), dialTexture(2, "#f2a541", this.S)];
    this.rings = [];
    for (let i = 0; i < K; i++) {
      const R = 22 + (i % 3) * 3;
      const m = new T.Mesh(new T.PlaneGeometry(R * 2, R * 2), new T.MeshBasicMaterial({ map: dialTex[i % 3], transparent: true, opacity: 0.5, depthWrite: false, blending: T.AdditiveBlending }));
      m.position.z = -i * this.SPACING - 6;
      m.rotation.z = Math.random() * TAU;
      m.userData = { spin: (i % 2 ? 1 : -1) * (0.02 + Math.random() * 0.05), base: 0.42 + (i % 3) * 0.08 };
      this.scene.add(m); this.rings.push(m);
    }

    // time dust: points at rest, streaks while travelling
    const N = this.mobile ? 420 : 800;
    this.N = N;
    this.dust = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) this._spawn(i, true);
    const cols = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const r = Math.random();
      cols.set(r < 0.45 ? [0.95, 0.72, 0.4] : r < 0.7 ? [0.5, 0.82, 0.74] : [0.93, 0.9, 0.84], i * 3);
    }
    this.dustGroup = new T.Group(); this.scene.add(this.dustGroup);
    const pts = new T.BufferGeometry();
    this.ptsPos = new Float32Array(N * 3);
    pts.setAttribute("position", new T.BufferAttribute(this.ptsPos, 3));
    pts.setAttribute("color", new T.BufferAttribute(cols, 3));
    const dot = tex(64, 64, (g, w) => {
      const gr = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
      gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.3, "rgba(255,255,255,.45)"); gr.addColorStop(1, "rgba(255,255,255,0)");
      g.fillStyle = gr; g.fillRect(0, 0, w, w);
    });
    this.points = new T.Points(pts, new T.PointsMaterial({ size: (this.mobile ? 2.2 : 2.6) * Math.min(window.devicePixelRatio || 1, 2), map: dot, vertexColors: true, transparent: true, depthWrite: false, blending: T.AdditiveBlending, sizeAttenuation: false }));
    this.dustGroup.add(this.points);
    const lg = new T.BufferGeometry();
    this.linePos = new Float32Array(N * 6);
    const lcol = new Float32Array(N * 6);
    for (let i = 0; i < N; i++) lcol.set([cols[i * 3], cols[i * 3 + 1], cols[i * 3 + 2], 0, 0, 0], i * 6);
    lg.setAttribute("position", new T.BufferAttribute(this.linePos, 3));
    lg.setAttribute("color", new T.BufferAttribute(lcol, 3));
    this.lines = new T.LineSegments(lg, new T.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0, depthWrite: false, blending: T.AdditiveBlending }));
    this.dustGroup.add(this.lines);

    this.current = null;
    this.resize(window.innerWidth, window.innerHeight);
  }

  TimeScene.prototype._spawn = function (i, anywhere) {
    const a = Math.random() * TAU, r = 3 + Math.pow(Math.random(), 0.6) * 15;
    this.dust[i * 3] = Math.cos(a) * r;
    this.dust[i * 3 + 1] = Math.sin(a) * r;
    this.dust[i * 3 + 2] = anywhere ? -Math.random() * 520 : -520 + Math.random() * 30;
  };

  // ---------- era clocks ----------
  /* The Home centrepiece: a delivery roadmap dial. A ring of segments fills up step by step
     (spec → build → test → ship) around a face that names the current phase. */
  TimeScene.prototype._makeChain = function (key) {
    const cfg = MARKERS[key] || MARKERS.notfound, D = window.CONTENT.delivery;
    let year = this.labels[key] || "????";   // the page's year (or NOW / NEXT), shown on the face
    const total = D.phases.reduce((a, p) => a + p.blocks, 0);
    const phaseOf = i => { let k = 0; for (const p of D.phases) { k += p.blocks; if (i < k) return p; } return D.phases[D.phases.length - 1]; };
    const metal = new T.MeshStandardMaterial({ color: cfg.metal, metalness: 0.55, roughness: 0.32, emissive: cfg.metal, emissiveIntensity: 0.08 });
    const g = new T.Group(), body = new T.Group(); g.add(body);
    const glow = new T.Sprite(new T.SpriteMaterial({ map: glowTexture(cfg.tint), transparent: true, depthWrite: false, blending: T.AdditiveBlending }));
    glow.scale.setScalar(26); glow.position.z = -2; g.add(glow);
    const FR = 5.3;   // radius of the dial

    // the face: names the phase and counts the steps
    const cv = document.createElement("canvas"); cv.width = cv.height = this.S;
    const faceMap = new T.CanvasTexture(cv); faceMap.encoding = T.sRGBEncoding; faceMap.anisotropy = 4;
    const S = this.rm;
    if (!S.total) { S.total = total; S.n = this.reduced ? total - 4 : 4; }
    const RING = 0.863;   // the progress ring sits at this fraction of the dial radius
    const paint = () => {
      const c2 = cv.getContext("2d"), w = 1024, c = w / 2, n = S.n, done = n >= total;
      c2.setTransform(1, 0, 0, 1, 0, 0); c2.clearRect(0, 0, cv.width, cv.height); c2.scale(cv.width / w, cv.width / w);
      const bg = c2.createRadialGradient(c * 0.8, c * 0.7, 40, c, c, c);
      bg.addColorStop(0, "#1d2440"); bg.addColorStop(1, "#070a16");
      c2.fillStyle = bg; c2.beginPath(); c2.arc(c, c, c, 0, TAU); c2.fill();
      // progress ring, one segment per step
      for (let i = 0; i < total; i++) {
        const a0 = (i / total) * TAU - Math.PI / 2 + SEG_GAP, a1 = ((i + 1) / total) * TAU - Math.PI / 2 - SEG_GAP;
        c2.lineWidth = 34; c2.lineCap = "butt";
        c2.strokeStyle = i < n ? phaseOf(i).color : "rgba(201,162,94,.16)";
        c2.beginPath(); c2.arc(c, c, c * RING, a0, a1); c2.stroke();
      }
      const ph = phaseOf(Math.max(0, Math.min(total - 1, n - 1)));
      c2.textAlign = "center"; c2.textBaseline = "middle";
      c2.fillStyle = "rgba(234,230,218,.6)"; c2.font = "500 40px 'Instrument Sans', system-ui, sans-serif";
      c2.fillText(D.title.toUpperCase(), c, c - 225);
      c2.fillStyle = done ? "#f6c98a" : ph.color;
      c2.font = `700 ${done ? 84 : 128}px 'Unbounded', 'Instrument Sans', system-ui, sans-serif`;
      c2.fillText(done ? "DELIVERED" : ph.name.toUpperCase(), c, c - 110);
      c2.fillStyle = "rgba(234,230,218,.9)"; c2.font = "600 60px 'Instrument Sans', system-ui, sans-serif";
      c2.fillText(`${String(n).padStart(2, "0")} / ${String(total).padStart(2, "0")}`, c, c + 78);
      // the year sits where the clock used to show it
      c2.fillStyle = rgba(cfg.tint, 1);
      c2.font = `700 ${year.length > 4 ? 100 : 128}px 'Unbounded', 'Instrument Sans', system-ui, sans-serif`;
      c2.fillText(year, c, c + 220);
      faceMap.needsUpdate = true;
    };
    const SEG_GAP = 0.05;
    body.add(new T.Mesh(new T.CircleGeometry(FR, 96), new T.MeshBasicMaterial({ map: faceMap, toneMapped: false })));   // unlit, so it looks the same as on the laptop screen
    body.add(new T.Mesh(new T.TorusGeometry(FR + 0.15, 0.18, 16, 120), metal));

    // the step being worked on glows and pulses on top of its segment
    const pulse = new T.Mesh(new T.RingGeometry(0.1, 0.2, 8), new T.MeshBasicMaterial({ color: "#ffffff", transparent: true, opacity: 0, depthWrite: false, blending: T.AdditiveBlending, toneMapped: false }));
    pulse.position.z = 0.03; body.add(pulse);
    const placePulse = () => {
      const i = S.n - 1;
      pulse.visible = i >= 0 && S.n < total;
      if (!pulse.visible) return;
      const phi0 = (i / total) * TAU + SEG_GAP, phi1 = ((i + 1) / total) * TAU - SEG_GAP, r = FR * RING, hw = FR * 0.052;
      pulse.geometry.dispose();
      pulse.geometry = new T.RingGeometry(r - hw, r + hw, 24, 1, Math.PI / 2 - phi1, phi1 - phi0);
      pulse.material.color.set(phaseOf(i).color);
    };

    // a dashed orbit around the dial
    const dashed = tex(this.S, this.S, (c2, w) => {
      c2.scale(w / 1024, w / 1024); c2.strokeStyle = rgba(cfg.metal, 0.6); c2.lineWidth = 5; c2.setLineDash([14, 22]);
      c2.beginPath(); c2.arc(512, 512, 0.43 * 1024, 0, TAU); c2.stroke();
    });
    const dial = new T.Mesh(new T.PlaneGeometry(15.4, 15.4), new T.MeshBasicMaterial({ map: dashed, transparent: true, opacity: 0.8, depthWrite: false }));
    dial.position.z = -0.05; body.add(dial);

    // No hands and no orbit rings: the dial stays a flat circle facing the viewer, like the one on the laptop screen.
    // These empty pivots are only kept so the shared update loop needs no special case.
    const arm = new T.Group(), nonce = new T.Group(), arms = [new T.Group(), new T.Group()];

    const u = g.userData = { chain: true, hour: nonce, minute: arm, dial, arms, spin: 0, faceMap, cfg, label: year, glow, pop: 0, seen: S.n };
    u.setYear = label => { year = label; u.label = label; paint(); };
    u.tick = () => {
      if (u.seen !== S.n) { const up = S.n > u.seen; u.seen = S.n; paint(); placePulse(); if (up) u.pop = 1; }
      pulse.material.opacity = 0.3 + 0.25 * Math.sin(this.clock * 6);
    };
    paint(); placePulse();
    return g;
  };

  TimeScene.prototype._makeMarker = function (key) { return this._makeChain(key); };

  // repaint the year on a page's dial (the Experience dial follows the scroll)
  TimeScene.prototype._paint = function (m, label) {
    const u = m.userData;
    if (u.label === label) return false;
    u.setYear(label);
    return true;
  };
  /* Show another year on a page's dial. dir: -1 into the past, +1 into the future;
     the arm whirls that way and the dial pulses. */
  TimeScene.prototype.setLabel = function (key, label, dir) {
    const m = this._marker(key);
    if (!this._paint(m, label) || this.reduced || !dir) return;
    this.nudge = clamp(this.nudge - dir * 2.2, -7, 7);
    m.userData.pop = 1;
  };

  TimeScene.prototype._marker = function (key) {
    if (!this.cache[key]) this.cache[key] = this._makeMarker(key);
    return this.cache[key];
  };

  TimeScene.prototype._restPos = function () {
    const z = -34;
    const vh = 2 * Math.tan((this.baseFov * Math.PI) / 360) * Math.abs(z);
    const vw = vh * this.camera.aspect;
    if (this.camera.aspect > 1.15) return new T.Vector3(vw * 0.33, vh * 0.02, z);
    return new T.Vector3(vw * 0.4, vh * 0.34, z);
  };
  TimeScene.prototype._restScale = function () { return this.camera.aspect < 0.8 ? 0.5 : this.camera.aspect < 1.15 ? 0.7 : 1; };

  TimeScene.prototype.resize = function (w, h) {
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    if (this.current && !this.warp) { this.current.position.copy(this._restPos()); this.current.scale.setScalar(this._restScale()); }
  };

  // the language changed: redraw the era clocks with the new labels
  TimeScene.prototype.relabel = function (labels) {
    this.labels = labels || {};
    if (this.current && this.current.parent) this.scene.remove(this.current);
    this.cache = {};
    if (this.currentKey && !this.warp) this.show(this.currentKey);
  };

  TimeScene.prototype.setPointer = function (x, y) { this.pointer.set(x, y); };
  TimeScene.prototype.setScroll = function (p) { this.scroll = p; };

  TimeScene.prototype.show = function (key) {
    if (this.current) this.scene.remove(this.current);
    this.current = this._marker(key);
    this.currentKey = key;
    this.current.position.copy(this._restPos());
    this.current.scale.setScalar(this._restScale());
    this.scene.add(this.current);
  };

  /* Travel to another page's moment. dir: -1 into the past, +1 into the future.
     Returns { mid: Promise (swap content now), done: Promise } */
  TimeScene.prototype.warpTo = function (key, dir) {
    let midRes, doneRes;
    const mid = new Promise(r => (midRes = r));
    const done = new Promise(r => (doneRes = r));
    if (this.reduced || !this.current) { this.show(key); midRes(); doneRes(); return { mid, done }; }
    if (this.warp) {
      const w = this.warp; this.warp = null;
      if (w.old && w.old !== w.next) this.scene.remove(w.old);
      w.next.position.copy(this._restPos()); w.next.scale.setScalar(this._restScale());
      w.midRes(); w.doneRes(); this.current = w.next;
    }
    const old = this.current, next = this._marker(key), rest = this._restPos();
    if (next !== old) this._paint(next, this.labels[key] || "????");
    if (next !== old) {
      next.position.set(rest.x * 0.2, rest.y * 0.2, -600);
      next.scale.setScalar(this._restScale());
      this.scene.add(next);
    }
    this.dir = dir || 1;
    this.warp = { t: 0, dur: 1.6, old, next, oldStart: old.position.clone(), rest, midRes, doneRes, midFired: false };
    this.current = next; this.currentKey = key;
    return { mid, done };
  };

  TimeScene.prototype.update = function (dt) {
    this.clock += dt;
    const w = this.warp;
    let speed = 0.3, travel = 0;

    if (w) {
      w.t = Math.min(1, w.t + dt / w.dur);
      const t = w.t;
      travel = Math.sin(Math.PI * clamp(t * 1.04, 0, 1));
      const up = clamp(t / 0.36, 0, 1), down = clamp((t - 0.36) / 0.64, 0, 1);
      speed = 0.3 + 48 * (t < 0.36 ? easeIn(up) : 1 - easeOut(down));
      this.camera.fov = this.baseFov + 20 * travel;
      this.camera.rotation.z = this.dir * 0.35 * travel;
      if (w.old && w.old !== w.next) {
        const k = easeIn(clamp(t / 0.45, 0, 1));
        w.old.position.set(w.oldStart.x * (1 + k * 2), w.oldStart.y * (1 + k * 1.4), w.oldStart.z + k * 110);
        if (t > 0.45) this.scene.remove(w.old);
      }
      if (w.old !== w.next) {
        const k = easeOut(clamp((t - 0.3) / 0.7, 0, 1));
        w.next.position.set(w.rest.x * (0.2 + 0.8 * k), w.rest.y * (0.2 + 0.8 * k), -600 + (600 + w.rest.z) * k);
      }
      if (!w.midFired && t >= 0.42) { w.midFired = true; w.midRes(); }
      if (t >= 1) { this.camera.fov = this.baseFov; this.camera.rotation.z = 0; this.warp = null; w.doneRes(); }
      this.camera.updateProjectionMatrix();
    }
    if (!w) this.dir += (1 - this.dir) * Math.min(1, dt * 1.5); // hands settle back to clockwise
    this.speed += (speed - this.speed) * Math.min(1, dt * 12);
    const move = this.speed * dt * 60;

    // colour of time: warm sepia into the past, cool patina into the future
    const tint = this.tintRest.clone().lerp(this.dir < 0 ? this.tintPast : this.tintFuture, travel);
    this.endGlow.material.color.copy(tint);
    this.endGlow.scale.setScalar(700 + 500 * travel);
    this.scene.background.copy(this.bg).lerp(tint, 0.06 * travel);

    // tunnel rings rush past and twist with the direction of travel
    const twist = this.dir * this.speed * 0.035;
    this.rings.forEach((r, i) => {
      r.position.z += move;
      if (r.position.z > -2) r.position.z -= this.DEPTH;
      r.rotation.z += dt * (r.userData.spin + twist * (1 + (i % 3) * 0.35) * 60 * 0.02);
      const near = clamp((-r.position.z - 3) / 26, 0, 1);
      r.material.opacity = r.userData.base * near * (1 + 0.6 * travel);
    });

    // dust
    const d = this.dust, pp = this.ptsPos, lp = this.linePos, tail = 0.2 + this.speed * 2.2;
    for (let i = 0; i < this.N; i++) {
      let z = d[i * 3 + 2] + move;
      if (z > 2) { this._spawn(i, false); z = d[i * 3 + 2]; }
      d[i * 3 + 2] = z;
      const x = d[i * 3], y = d[i * 3 + 1];
      pp[i * 3] = x; pp[i * 3 + 1] = y; pp[i * 3 + 2] = z;
      lp[i * 6] = x; lp[i * 6 + 1] = y; lp[i * 6 + 2] = z;
      lp[i * 6 + 3] = x; lp[i * 6 + 4] = y; lp[i * 6 + 5] = z - tail;
    }
    this.points.geometry.attributes.position.needsUpdate = true;
    this.lines.geometry.attributes.position.needsUpdate = true;
    this.lines.material.opacity = clamp((this.speed - 1.5) / 10, 0, 1);
    this.points.material.opacity = 1 - 0.6 * this.lines.material.opacity;
    this.dustGroup.rotation.z += dt * (0.01 + twist * 0.6);

    // clocks tick; hands spin backwards into the past, forwards into the future
    [this.current, w && w.old].forEach(m => {
      if (!m || !m.parent) return;
      const u = m.userData;
      const spin = -(0.06 + this.dir * this.speed * 0.9) + (m === this.current ? this.nudge : 0);
      u.minute.rotation.z += dt * spin;
      u.hour.rotation.z += (dt * spin) / 12;
      u.dial.rotation.z += dt * (0.03 - this.dir * this.speed * 0.05);
      u.arms[0].rotation.z += dt * 0.25; u.arms[1].rotation.z -= dt * 0.18;
      if (u.chain) m.quaternion.copy(this.camera.quaternion);   // parallel to the screen, so the dial is always a true circle
      if (u.tick) u.tick();
      if (u.pop > 0.001) { u.pop *= Math.exp(-dt * 4); u.glow.scale.setScalar(26 * (1 + 0.3 * u.pop)); }
    });
    const rm = this.rm;   // one step per second, then a short pause on DELIVERED
    if (rm.total && !this.reduced) {
      rm.t += dt;
      if (rm.n < rm.total) { if (rm.t >= 1) { rm.t = 0; rm.n++; } }
      else if (rm.t >= 2.4) { rm.t = 0; rm.n = 0; }
    }
    this.nudge *= Math.exp(-dt * 3);
    if (this.current && !w) {
      this.scrollSmooth += (this.scroll - this.scrollSmooth) * Math.min(1, dt * 4);
      const r = this._restPos();
      this.current.position.set(r.x, r.y + this.scrollSmooth * 6, r.z);
      this.current.scale.setScalar(this._restScale());
    }
    if (!this.reduced) {
      this.pointerSmooth.lerp(this.pointer, Math.min(1, dt * 2));
      this.camera.position.x = this.pointerSmooth.x * 1.2;
      this.camera.position.y = -this.pointerSmooth.y * 0.8;
    }
  };

  TimeScene.prototype.render = function () { this.renderer.render(this.scene, this.camera); };
  TimeScene.prototype.isWarping = function () { return !!this.warp; };

  // build every clock ahead of time so the first jump never stutters
  TimeScene.prototype.prewarm = function (keys) {
    const queue = keys.filter(k => !this.cache[k]);
    const idle = window.requestIdleCallback || (fn => setTimeout(fn, 120));
    const step = () => {
      const k = queue.shift(); if (!k) return;
      const m = this._marker(k);
      if (m !== this.current && !this.warp) {
        m.position.set(0, 0, -1500); this.scene.add(m);
        this.renderer.compile(this.scene, this.camera);
        this.renderer.render(this.scene, this.camera);
        this.scene.remove(m);
      }
      idle(step);
    };
    idle(step);
  };

  window.TimeScene = TimeScene;
})();
