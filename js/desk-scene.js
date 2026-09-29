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
      g.fillStyle = "#3a3440"; g.fillRect(0, 0, w, h);
      const img = g.getImageData(0, 0, w, h);
      for (let i = 0; i < img.data.length; i += 4) {
        const n = (Math.random() - 0.5) * 14;
        img.data[i] += n; img.data[i + 1] += n; img.data[i + 2] += n;
      }
      g.putImageData(img, 0, 0);
    }, { repeat: [3, 2] });
  }

  function nightSkyTexture() {
    return canvasTex(1024, 768, (g, w, h) => {
      const bg = g.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, "#0a1030"); bg.addColorStop(0.7, "#1b1b4a"); bg.addColorStop(1, "#3b2a55");
      g.fillStyle = bg; g.fillRect(0, 0, w, h);
      // nebula haze
      [["rgba(120,80,190,.20)", 0.3, 0.35, 320], ["rgba(242,165,65,.10)", 0.75, 0.6, 260], ["rgba(111,211,224,.10)", 0.6, 0.2, 240]].forEach(([c, x, y, r]) => {
        const gr = g.createRadialGradient(x * w, y * h, 0, x * w, y * h, r);
        gr.addColorStop(0, c); gr.addColorStop(1, "rgba(0,0,0,0)");
        g.fillStyle = gr; g.fillRect(0, 0, w, h);
      });
      for (let i = 0; i < 700; i++) {
        const r = Math.random() < 0.94 ? Math.random() * 1.1 + 0.3 : Math.random() * 2 + 1.2;
        g.fillStyle = `rgba(255,${230 + Math.random() * 25},${200 + Math.random() * 55},${0.4 + Math.random() * 0.6})`;
        g.beginPath(); g.arc(Math.random() * w, Math.random() * h * 0.92, r, 0, TAU); g.fill();
      }
      // moon
      const mx = w * 0.78, my = h * 0.26, mr = 46;
      const glow = g.createRadialGradient(mx, my, mr * 0.6, mx, my, mr * 3);
      glow.addColorStop(0, "rgba(255,240,210,.35)"); glow.addColorStop(1, "rgba(255,240,210,0)");
      g.fillStyle = glow; g.fillRect(0, 0, w, h);
      g.fillStyle = "#f3ead6"; g.beginPath(); g.arc(mx, my, mr, 0, TAU); g.fill();
      g.fillStyle = "rgba(170,160,140,.35)";
      [[-12, -8, 10], [14, 10, 7], [4, -20, 5], [-16, 16, 6]].forEach(([dx, dy, r]) => { g.beginPath(); g.arc(mx + dx, my + dy, r, 0, TAU); g.fill(); });
      // distant hills / city line
      g.fillStyle = "#0c0a18";
      g.beginPath(); g.moveTo(0, h);
      for (let x = 0; x <= w; x += 16) g.lineTo(x, h * 0.86 - Math.sin(x * 0.006) * 30 - Math.sin(x * 0.02) * 8);
      g.lineTo(w, h); g.fill();
      for (let i = 0; i < 40; i++) {
        g.fillStyle = `rgba(255,${180 + Math.random() * 60},90,${0.5 + Math.random() * 0.5})`;
        g.fillRect(Math.random() * w, h * 0.9 + Math.random() * h * 0.08, 2, 2);
      }
    });
  }

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

    // --- lights
    s.add(new T.HemisphereLight(0x9aa8ff, 0x3a2414, 0.38));
    const moon = new T.DirectionalLight(0x8ea6ff, 0.45);
    moon.position.set(0.8, 2.6, -2.5);
    s.add(moon);

    // --- room
    const floor = new T.Mesh(new T.PlaneGeometry(12, 12), new T.MeshStandardMaterial({ color: "#0c0909", roughness: 1 }));
    floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; s.add(floor);

    const wallMat = new T.MeshStandardMaterial({ map: wallTexture(), roughness: 0.95 });
    const wall = new T.Mesh(new T.PlaneGeometry(8, 4), wallMat);
    wall.position.set(0, 2, -0.72); wall.receiveShadow = true; s.add(wall);

    // window on the wall
    const win = new T.Group();
    const skyMat = new T.MeshBasicMaterial({ map: nightSkyTexture(), toneMapped: false });
    const sky = new T.Mesh(new T.PlaneGeometry(1.2, 0.86), skyMat);
    win.add(sky);
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
    const bulb = new T.Mesh(new T.SphereGeometry(0.03, 20, 16), new T.MeshBasicMaterial({ color: "#ffd9a0", toneMapped: false }));
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
    const warmFill = new T.PointLight(0xff9a4a, 0.35, 2.2, 2); warmFill.position.copy(headWorld); s.add(warmFill);

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

    // --- books
    const books = new T.Group(); books.position.set(-0.52, DESK_Y, 0.25); books.rotation.y = 0.35; s.add(books);
    [["#2f4b7c", 0.24, 0.035, 0.17], ["#b8863b", 0.22, 0.03, 0.16], ["#6b2e3e", 0.235, 0.04, 0.165]].reduce((y, [c, w, h, d], i) => {
      const b = new T.Mesh(new T.BoxGeometry(w, h, d), new T.MeshStandardMaterial({ color: c, roughness: 0.8 }));
      b.position.set((i - 1) * 0.008, y + h / 2, 0); b.rotation.y = (i - 1) * 0.08; b.castShadow = true; b.receiveShadow = true; books.add(b);
      const pages = new T.Mesh(new T.BoxGeometry(w - 0.01, h - 0.008, d - 0.004), new T.MeshStandardMaterial({ color: "#efe7d4", roughness: 0.9 }));
      pages.position.copy(b.position); pages.position.x += 0.006; pages.rotation.copy(b.rotation); books.add(pages);
      return y + h;
    }, 0);

    // --- notebook + pen
    const note = new T.Mesh(new T.BoxGeometry(0.15, 0.008, 0.21), new T.MeshStandardMaterial({ color: "#1f3a3d", roughness: 0.85 }));
    note.position.set(0.36, DESK_Y + 0.004, 0.36); note.rotation.y = -0.25; note.castShadow = true; note.receiveShadow = true; s.add(note);
    const pen = new T.Mesh(new T.CylinderGeometry(0.004, 0.004, 0.14, 10), new T.MeshStandardMaterial({ color: "#f2a541", metalness: 0.4, roughness: 0.3 }));
    pen.rotation.z = Math.PI / 2; pen.rotation.y = 0.6; pen.position.set(0.37, DESK_Y + 0.013, 0.36); pen.castShadow = true; s.add(pen);

    // --- hourglass: the desk's hint at what is inside the laptop
    const hg = new T.Group(); hg.position.set(0.5, DESK_Y, -0.3); s.add(hg);
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
    this.hourglass = { spin, topSand, botSand, stream, t: 0 };

    // raycast targets
    this.raycaster = new T.Raycaster();
    this.hitTargets = [this.screen, bezel, lid];

    // camera framing
    this.introLook = new T.Vector3(0.02, DESK_Y + 0.17, -0.04);
    this.introPosBase = new T.Vector3(0.42, DESK_Y + 0.58, 1.38);
    this.introPos = this.introPosBase.clone();
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
    // time dial: a brass-rimmed clock whose minute hand runs backwards
    const px = w * 0.77, py = h * 0.58, pr = 150;
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
    g.fillStyle = "rgba(10,14,34,.92)"; g.fillRect(0, 0, w, 104);
    ["#ff6b5a", "#f2c14e", "#57c26a"].forEach((c, i) => { g.fillStyle = c; g.beginPath(); g.arc(34 + i * 30, 30, 9, 0, TAU); g.fill(); });
    const tabs = ["Home", "Education", "Experience", "Projects", "Contact", "Resume", "Blog"];
    let tx = 140;
    g.font = "500 20px 'Instrument Sans', system-ui, sans-serif";
    tabs.forEach((name, i) => {
      const tw = g.measureText(name).width + 44;
      if (i === 0) { g.fillStyle = "rgba(234,230,218,.12)"; g.beginPath(); (g.roundRect ? g.roundRect(tx, 10, tw, 40, 10) : g.rect(tx, 10, tw, 40)); g.fill(); }
      g.fillStyle = i === 0 ? "#eae6da" : "rgba(234,230,218,.55)";
      g.fillText(name, tx + 22, 37);
      tx += tw + 6;
    });
    g.fillStyle = "rgba(234,230,218,.08)";
    g.beginPath(); (g.roundRect ? g.roundRect(140, 60, w - 180, 34, 17) : g.rect(140, 60, w - 180, 34)); g.fill();
    g.fillStyle = "rgba(234,230,218,.7)"; g.font = "400 18px 'Instrument Sans', system-ui, sans-serif";
    g.fillText("devleb://home", 162, 83);

    // hero text
    g.fillStyle = "#eae6da";
    g.font = "600 76px 'Unbounded', 'Instrument Sans', system-ui, sans-serif";
    g.fillText(this.profileName, 86, 330);
    g.fillStyle = "#f2a541";
    g.font = "500 30px 'Instrument Sans', system-ui, sans-serif";
    g.fillText(this.role, 90, 385);
    g.fillStyle = "rgba(234,230,218,.7)";
    g.font = "400 24px 'Instrument Sans', system-ui, sans-serif";
    ["Backend / Blockchain / Intelligence & data", "BSc Computer Science"].forEach((l, i) => g.fillText(l, 90, 440 + i * 36));

    // call to action pulse
    const pulse = 0.5 + 0.5 * Math.sin(t * 3);
    const hover = this.hoverScreen ? 1 : 0;
    g.fillStyle = `rgba(242,165,65,${0.85 + 0.15 * hover})`;
    g.beginPath(); (g.roundRect ? g.roundRect(90, 560, 250, 64, 32) : g.rect(90, 560, 250, 64)); g.fill();
    g.strokeStyle = `rgba(242,165,65,${0.4 * (1 - pulse)})`; g.lineWidth = 3 + pulse * 10;
    g.beginPath(); (g.roundRect ? g.roundRect(90 - pulse * 8, 560 - pulse * 8, 250 + pulse * 16, 64 + pulse * 16, 40) : g.rect(90, 560, 250, 64)); g.stroke();
    g.fillStyle = "#1a0f06"; g.font = "600 24px 'Instrument Sans', system-ui, sans-serif";
    g.fillText("Step inside", 152, 600);

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

  // sand runs for 40 s, then the hourglass is lifted, flipped and set down again
  DeskScene.prototype._updateHourglass = function (dt) {
    const h = this.hourglass; h.t += dt;
    const PERIOD = 40, FLIP = 1.2;
    const n = Math.floor(h.t / PERIOD), p = h.t % PERIOD;
    const flipK = clamp(p / FLIP, 0, 1), k = clamp((p - FLIP) / (PERIOD - FLIP), 0, 1);
    h.spin.rotation.z = n === 0 ? 0 : Math.PI * (n - 1 + easeInOut(flipK));
    h.spin.position.y = 0.088 + (n === 0 ? 0 : Math.sin(Math.PI * flipK) * 0.03);
    const top = n % 2 === 0 ? 1 - k : k, bot = 1 - top;
    const th = Math.max(0.001, top * 0.055), bh = Math.max(0.001, bot * 0.05);
    h.topSand.scale.y = th; h.topSand.position.y = 0.006 + th / 2;
    h.botSand.scale.y = bh; h.botSand.position.y = -0.066 + bh / 2;
    h.stream.visible = flipK >= 1 && k > 0.001 && k < 0.999;
  };

  // ---------- public API ----------
  DeskScene.prototype.resize = function (w, h) {
    const aspect = w / h;
    this.camera.aspect = aspect;
    // pull back on narrow (portrait) screens so the laptop stays framed
    const k = aspect < 1 ? clamp(0.62 / aspect, 1, 1.6) : aspect < 1.3 ? 1.15 : 1;
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
      this._updateHourglass(dt);
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
