/* ==========================================================================
   Main controller — wires the desk, the tunnel backdrop and the browser.
   States: desk → entering → browser → exiting → desk
   ========================================================================== */
(function () {
  const C = window.CONTENT;
  const $ = s => document.querySelector(s);
  const body = document.body;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mobile = window.matchMedia("(pointer: coarse)").matches || Math.min(window.innerWidth, window.innerHeight) < 600;
  const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

  const veil = $("#veil");
  const intro = $("#intro");
  const loader = $("#loader");
  const browserEl = $("#browser");
  const canvas = $("#scene");

  let state = "desk";
  let renderer = null, desk = null, tunnel = null;

  function webglOK() {
    try {
      const c = document.createElement("canvas");
      return !!(window.WebGLRenderingContext && (c.getContext("webgl") || c.getContext("experimental-webgl")));
    } catch (e) { return false; }
  }
  const has3D = !!window.THREE && webglOK();

  // ---------- browser (always available) ----------
  const browser = new window.PortfolioBrowser(browserEl, {
    onWarp: (key, dir) => (tunnel ? tunnel.warpTo(key, dir) : { mid: Promise.resolve(), done: new Promise(r => setTimeout(r, reduced ? 0 : 350)) }),
    onShow: key => tunnel && tunnel.show(key),
    onDesk: () => exitToDesk(),
    onScroll: p => tunnel && tunnel.setScroll(p)
  });

  function routeFromHash() {
    const h = (location.hash || "").replace(/^#\/?/, "");
    return h ? window.PortfolioBrowser.resolveRoute(h) || "notfound" : null;
  }

  // ---------- 3D setup ----------
  if (has3D) {
    const T = window.THREE;
    renderer = new T.WebGLRenderer({ canvas, antialias: !mobile || window.devicePixelRatio < 2, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 2));
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    renderer.outputEncoding = T.sRGBEncoding;
    renderer.toneMapping = T.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = T.PCFSoftShadowMap;
    desk = new window.DeskScene(renderer, { mobile, reducedMotion: reduced, name: C.profile.name, role: C.profile.role });
    tunnel = new window.TimeScene(renderer, { mobile, reducedMotion: reduced, labels: Object.fromEntries(Object.entries(window.PortfolioBrowser.ERA).map(([k, v]) => [k, v.label])) });
  } else {
    body.classList.add("no-webgl");
  }

  // ---------- transitions ----------
  function showBrowser() {
    browserEl.hidden = false;
    browserEl.removeAttribute("aria-hidden");
    requestAnimationFrame(() => body.classList.add("in-browser"));
  }

  async function enterBrowser(opts = {}) {
    if (state !== "desk") return;
    const route = opts.route || (browser.current && browser.current.key) || "home";
    body.classList.add("leaving-desk");
    intro.setAttribute("aria-hidden", "true");
    if (desk && !opts.instant) {
      state = "entering";
      await desk.enter(t => { veil.style.opacity = smooth(0.72, 0.98, t); });
    }
    veil.style.opacity = 1;
    state = "browser";
    if (!browser.current) browser.go(route, { instant: true });
    else if (tunnel) tunnel.show(browser.current.key);
    showBrowser();
    if (tunnel && !tunnel._warmed) { tunnel._warmed = true; tunnel.prewarm(window.PortfolioBrowser.ROUTES.map(r => r.key)); }
    setTimeout(() => { veil.style.opacity = 0; }, 60);
    setTimeout(() => browser.viewport.focus({ preventScroll: true }), 400);
  }

  async function exitToDesk() {
    if (state !== "browser") return;
    if (!desk) return; // no 3D: stay in the browser
    body.classList.remove("in-browser");
    veil.style.transition = "opacity .25s ease";
    veil.style.opacity = 1;
    await new Promise(r => setTimeout(r, reduced ? 0 : 260));
    browserEl.hidden = true;
    browserEl.setAttribute("aria-hidden", "true");
    veil.style.transition = "";
    state = "exiting";
    await desk.exit(t => { veil.style.opacity = 1 - smooth(0.02, 0.3, t); });
    veil.style.opacity = 0;
    state = "desk";
    body.classList.remove("leaving-desk");
    intro.removeAttribute("aria-hidden");
    $("#enter-btn").focus({ preventScroll: true });
  }

  // ---------- loop ----------
  let last = performance.now();
  let frame = 0;
  function loop(now) {
    requestAnimationFrame(loop);
    if (document.hidden || !renderer) return;
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    frame++;
    if (state === "browser") {
      // idle phones render at half rate to save battery
      if (mobile && !tunnel.isWarping() && frame % 2) return;
      tunnel.update(mobile && !tunnel.isWarping() ? dt * 2 : dt);
      tunnel.render();
    } else {
      desk.update(dt);
      desk.render();
    }
  }

  // ---------- input ----------
  function ndc(e) { return { x: (e.clientX / window.innerWidth) * 2 - 1, y: -(e.clientY / window.innerHeight) * 2 + 1 }; }

  let hoverTick = 0;
  window.addEventListener("pointermove", e => {
    const p = ndc(e);
    if (desk) desk.setPointer(p.x, -p.y);
    if (tunnel) tunnel.setPointer(p.x, -p.y);
    if (state === "desk" && desk && e.pointerType === "mouse" && ++hoverTick % 3 === 0) {
      const hit = e.target === canvas && desk.hitScreen(p.x, p.y);
      desk.hoverScreen = hit;
      canvas.style.cursor = hit ? "pointer" : "";
    }
  }, { passive: true });

  canvas.addEventListener("click", e => {
    if (state !== "desk" || !desk) return;
    const p = ndc(e);
    if (desk.hitScreen(p.x, p.y)) enterBrowser();
  });

  window.addEventListener("wheel", e => { if (state === "desk" && e.deltaY > 25 && !loader.isConnected) enterBrowser(); }, { passive: true });
  let touchY = null;
  window.addEventListener("touchstart", e => { if (state === "desk") touchY = e.touches[0].clientY; }, { passive: true });
  window.addEventListener("touchend", e => {
    if (state === "desk" && touchY !== null && touchY - e.changedTouches[0].clientY > 70) enterBrowser();
    touchY = null;
  }, { passive: true });

  $("#enter-btn").addEventListener("click", () => enterBrowser());
  $("#skip-btn").addEventListener("click", () => enterBrowser({ instant: true }));

  window.addEventListener("hashchange", () => {
    const key = routeFromHash();
    if (!key) return;
    if (state === "browser") { if (!browser.current || browser.current.key !== key) browser.go(key); }
    else if (state === "desk") enterBrowser({ route: key });
  });

  window.addEventListener("resize", () => {
    if (!renderer) return;
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    desk.resize(window.innerWidth, window.innerHeight);
    tunnel.resize(window.innerWidth, window.innerHeight);
  });

  // ---------- start ----------
  function start() {
    const deep = routeFromHash();
    const finishLoading = () => {
      loader.classList.add("done");
      setTimeout(() => loader.remove(), 700);
    };
    if (!has3D) {
      finishLoading();
      state = "desk";
      enterBrowser({ instant: true, route: deep || "home" });
      return;
    }
    requestAnimationFrame(loop);
    if (deep) {
      // a shared link to a page goes straight to that page
      desk.lidAngle = desk.lidTarget = -0.26; desk.screenPower = 1;
      finishLoading();
      enterBrowser({ instant: true, route: deep });
      return;
    }
    setTimeout(() => {
      finishLoading();
      body.classList.add("intro-ready");
      desk.openLid();
    }, reduced ? 50 : 450);
  }

  const fontsReady = document.fonts && document.fonts.ready ? Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 2500))]) : Promise.resolve();
  fontsReady.then(start);
})();
