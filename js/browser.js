/* ==========================================================================
   The browser inside the laptop: tabs, address bar, back / forward /
   reload, and every portfolio page with its interactive features.
   ========================================================================== */
(function () {
  // the portfolio content, always up to date
  const C = new Proxy({}, { get: (_, k) => window.I18N.content()[k] });
  const t = (s, v) => window.I18N.t(s, v);
  const joinList = a => (a.length < 2 ? a.join("") : a.slice(0, -1).join(", ") + " and " + a[a.length - 1]);
  const A = window.ASSETS;
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const ROUTES = [
    { key: "home", title: "Home", icon: "✋" },
    { key: "education", title: "Education", icon: "🎓" },
    { key: "experience", title: "Experience", icon: "💻" },
    { key: "projects", title: "Projects", icon: "📚" },
    { key: "contact", title: "Contact", icon: "💬" },
    { key: "resume", title: "Resume", icon: "📝" },
    { key: "blog", title: "Blog", icon: "♾️" }
  ];
  const ALIASES = {
    "": "home", index: "home", about: "home", me: "home",
    edu: "education", certificates: "education", certs: "education", degree: "education",
    work: "experience", "work&experience": "experience", jobs: "experience", career: "experience",
    project: "projects", portfolio: "projects", work_samples: "projects",
    contacts: "contact", email: "contact", social: "contact",
    cv: "resume", skills: "resume",
    blogs: "blog", articles: "blog", medium: "blog"
  };
  const SCHEME = "devleb://";

  // Every page is a moment in time. n is the year the counter travels to; label is the year shown on the dial.
  // Pages with an earlier year are reached by travelling back, later ones by travelling ahead.
  const YEAR = new Date().getFullYear();
  const ERA = {
    education:  { n: 2009, label: "2009" },
    experience: { n: YEAR - 0.5, label: String(YEAR) }, // opens on the latest role; the dial's year then follows the scroll
    projects:   { n: 2017, label: "2017" },
    resume:     { n: 2023, label: "2023" },
    home:       { n: YEAR, label: "NOW" },
    contact:    { n: YEAR + 1, label: "NEXT" },
    blog:       { n: YEAR + 40, label: "∞" },
    notfound:   { n: null, label: "????" }
  };
  // "2019 – 2023" → { from: 2019, to: 2023 }; "Present" is this year
  const roleYears = x => {
    const ys = (String(x.years).match(/\d{4}/g) || []).map(Number);
    const from = ys[0] || YEAR;
    return { from, to: /present|now|current/i.test(x.years) ? YEAR : ys[1] || from };
  };
  const slug = s => String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const pkey = p => p.key || slug(p.title);

  function resolveRoute(input) {
    let s = String(input || "").trim().toLowerCase();
    s = s.replace(/^devleb:\/\//, "").replace(/^https?:\/\/[^/]+/, "").replace(/^#?\/?/, "").replace(/\/+$/, "").split(/[?#]/)[0];
    if (ROUTES.some(r => r.key === s)) return s;
    if (ALIASES[s] !== undefined) return ALIASES[s];
    const partial = ROUTES.find(r => s.length >= 3 && r.key.startsWith(s));
    return partial ? partial.key : null;
  }

  // ---------- icons (simple stroke icons) ----------
  const P = {
    back: '<path d="M15 18l-6-6 6-6"/>',
    fwd: '<path d="M9 18l6-6-6-6"/>',
    reload: '<path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 4v7h-7"/>',
    desk: '<rect x="4" y="5" width="16" height="10" rx="1.5"/><path d="M2 19h20"/><path d="M9 15l-1 4M15 15l1 4"/>',
    lock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
    email: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
    linkedin: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M3 13h18"/>',
    github: '<path d="M8 8l-5 4 5 4"/><path d="M16 8l5 4-5 4"/><path d="M13.5 5l-3 14"/>',
    stackoverflow: '<path d="M4 15v5h16v-5"/><path d="M8 16h8"/><path d="M8.5 12.5l7.8 1.6"/><path d="M9.8 8.5l7 3.6"/><path d="M12.5 4.8l5.8 5.4"/>',
    x: '<path d="M4 4l16 16"/><path d="M20 4L4 20"/>',
    medium: '<path d="M4 20l4-1 11-11-3-3L5 16z"/><path d="M14 6l3 3"/>',
    download: '<path d="M12 4v11"/><path d="M7 10l5 5 5-5"/><path d="M5 20h14"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
    send: '<path d="M4 12l16-8-6 16-3-7z"/>',
    ext: '<path d="M14 4h6v6"/><path d="M20 4l-9 9"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
    search: '<circle cx="11" cy="11" r="6"/><path d="M20 20l-4.5-4.5"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    app: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18"/><path d="M9 13l-2 2 2 2M15 13l2 2-2 2"/>',
    db: '<ellipse cx="12" cy="5.5" rx="7" ry="2.5"/><path d="M5 5.5v13c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5v-13"/><path d="M5 12c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5"/>',
    async: '<path d="M4 7h11"/><path d="M12 4l3 3-3 3"/><path d="M20 17H9"/><path d="M12 14l-3 3 3 3"/>',
    infra: '<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/><path d="M12 12l8-4.5M12 12v9M12 12L4 7.5"/>',
    shield: '<path d="M12 3l7 3v5c0 4.6-3 8.3-7 10-4-1.7-7-5.4-7-10V6z"/><path d="M9 12l2 2 4-4"/>',
    node: '<rect x="4" y="4" width="16" height="6" rx="1.5"/><rect x="4" y="14" width="16" height="6" rx="1.5"/><path d="M8 7h.01M8 17h.01"/><path d="M12 10v4"/>',
    dapp: '<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/><path d="M12 8l4 2.3v4.4L12 17l-4-2.3v-4.4z"/>',
    builder: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18"/><path d="M8 13h5M8 16h3"/><path d="M17 12.5l.6 1.4 1.4.6-1.4.6-.6 1.4-.6-1.4-1.4-.6 1.4-.6z"/>',
    mobile: '<rect x="7" y="2.5" width="10" height="19" rx="2.2"/><path d="M11 18.5h2"/>'
  };
  const icon = (n, cls = "") => `<svg class="ico ${cls}" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${P[n] || ""}</svg>`;

  // ---------- helpers shared by pages ----------
  function toast(msg) {
    let t = document.getElementById("toast");
    if (!t) { t = document.createElement("div"); t.id = "toast"; t.className = "toast"; t.setAttribute("role", "status"); document.body.appendChild(t); }
    t.textContent = msg; t.classList.add("show");
    clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove("show"), 2600);
  }

  async function copyText(text) {
    try { await navigator.clipboard.writeText(text); toast(t("Copied {x}", { x: text })); return true; }
    catch (e) {
      const ta = document.createElement("textarea"); ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      let ok = false; try { ok = document.execCommand("copy"); } catch (e2) {}
      ta.remove();
      toast(ok ? t("Copied {x}", { x: text }) : t("Copy blocked here. The address is {x}", { x: text }));
      return ok;
    }
  }

  async function cvBytes() {
    if (A.cv.startsWith("data:")) {
      const b64 = A.cv.split(",")[1];
      const bin = atob(b64); const u = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
      return u;
    }
    const r = await fetch(A.cv);
    if (!r.ok) throw new Error("CV file not found at " + A.cv);
    return new Uint8Array(await r.arrayBuffer());
  }

  // claude.ai published pages save files through the downloads capability;
  // everywhere else a normal download link is used.
  let downloadsNS = null;
  if (window.claude && typeof window.claude.use === "function") {
    Promise.race([window.claude.use("downloads"), new Promise(r => setTimeout(() => r(null), 8000))])
      .then(ns => { downloadsNS = ns; }).catch(() => {});
  }
  async function downloadCV() {
    if (downloadsNS) {
      try {
        const bytes = await cvBytes();
        await downloadsNS.save({ filename: A.cvFileName, data: new Blob([bytes], { type: "application/pdf" }) });
        toast(t("CV saved"));
      } catch (e) {
        if (e && e.code === "declined") return;
        toast(t("The download didn't start here. Try the link on the published site."));
      }
      return;
    }
    const a = document.createElement("a");
    a.href = A.cv; a.download = A.cvFileName; a.rel = "noopener";
    document.body.appendChild(a); a.click(); a.remove();
  }

  function loadScript(src) {
    return new Promise((res, rej) => {
      if ([...document.scripts].some(s => s.src === src)) return res();
      const s = document.createElement("script"); s.src = src; s.onload = res; s.onerror = () => rej(new Error("Couldn't load " + src));
      document.head.appendChild(s);
    });
  }

  async function renderPdf(container) {
    const V = window.VENDOR;
    container.innerHTML = `<p class="muted">${esc(t("Loading the CV…"))}</p>`;
    try {
      await loadScript(V.pdfWorker); // runs on the main thread: no separate worker file needed
      await loadScript(V.pdf);
      const lib = window.pdfjsLib;
      const doc = await lib.getDocument({ data: await cvBytes() }).promise;
      container.innerHTML = "";
      const width = Math.min(container.clientWidth || 800, 900);
      for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const vp0 = page.getViewport({ scale: 1 });
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const vp = page.getViewport({ scale: (width / vp0.width) * dpr });
        const cv = document.createElement("canvas");
        cv.width = vp.width; cv.height = vp.height;
        cv.style.width = width + "px"; cv.style.maxWidth = "100%"; cv.style.height = "auto";
        cv.className = "pdf-page"; cv.setAttribute("aria-label", t("CV page {i}", { i }));
        container.appendChild(cv);
        await page.render({ canvasContext: cv.getContext("2d"), viewport: vp }).promise;
      }
    } catch (e) {
      container.innerHTML = `<p class="muted">${esc(t("The CV preview couldn't load ({msg}). Use Download CV instead.", { msg: e.message }))}</p>`;
    }
  }

  // ---------- technical leadership clock ----------
  function leadershipDial(cats) {
    const n = cats.length, cx = 200, R = 148;
    const ticks = Array.from({ length: 60 }, (_, i) => {
      const a = (i / 60) * Math.PI * 2, major = i % 5 === 0, r1 = 181, r2 = major ? 168 : 174;
      return `<line x1="${(cx + Math.cos(a) * r1).toFixed(1)}" y1="${(cx + Math.sin(a) * r1).toFixed(1)}" x2="${(cx + Math.cos(a) * r2).toFixed(1)}" y2="${(cx + Math.sin(a) * r2).toFixed(1)}" class="${major ? "tk-major" : "tk"}"/>`;
    }).join("");
    const nodes = cats.map((c, i) => {
      const a = ((-90 + (i * 360) / n) * Math.PI) / 180, x = cx + Math.cos(a) * R, y = cx + Math.sin(a) * R;
      return `<g class="lg-node" data-i="${i}" transform="translate(${x.toFixed(1)} ${y.toFixed(1)})">
        <title>${esc(c.cat)}</title>
        <circle class="lg-halo" r="36"/>
        <circle class="lg-dot" r="27"/>
        <svg x="-12" y="-12" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${P[c.icon] || ""}</svg>
      </g>`;
    }).join("");
    return `
    <svg class="lg-dial" viewBox="0 0 400 400" aria-hidden="true">
      <defs>
        <radialGradient id="lgFace" cx="42%" cy="38%" r="70%"><stop offset="0" stop-color="#1f2750"/><stop offset="1" stop-color="#080c1c"/></radialGradient>
        <linearGradient id="lgBrass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f6d9a0"/><stop offset=".5" stop-color="#c9a25e"/><stop offset="1" stop-color="#7a5a2a"/></linearGradient>
        <filter id="lgGlow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6"/></filter>
      </defs>
      <circle cx="200" cy="200" r="196" fill="url(#lgFace)"/>
      <circle cx="200" cy="200" r="192" fill="none" stroke="url(#lgBrass)" stroke-width="7"/>
      <circle class="lg-timer" cx="200" cy="200" r="186" pathLength="100"/>
      ${ticks}
      <circle class="lg-orbit" cx="200" cy="200" r="${R}"/>
      <g class="lg-hand"><line x1="200" y1="214" x2="200" y2="${200 - R + 34}"/><circle cx="200" cy="${200 - R + 34}" r="4"/></g>
      ${nodes}
      <circle cx="200" cy="200" r="60" class="lg-hub"/>
      <text x="200" y="206" class="lg-num-big">01</text>
      <text x="200" y="232" class="lg-of">${esc(t("of {n}", { n: String(n).padStart(2, "0") }))}</text>
    </svg>`;
  }

  // ---------- pages ----------
  const tags = arr => `<ul class="tags">${arr.map(t => `<li>${esc(t)}</li>`).join("")}</ul>`;
  // the applications of a project that is an ecosystem (Egety)
  const ecosystem = (p, compact) => p.apps && p.apps.length ? `
    <ul class="eco${compact ? " compact" : ""}">${p.apps.map(a => `
      <li><span class="eco-ico">${icon(a.icon)}</span><span class="eco-txt"><strong>${esc(a.name)}</strong><small>${esc(a.kind)}</small>${compact ? "" : `<span>${esc(a.text)}</span>`}</span></li>`).join("")}
    </ul>` : "";
  const projDates = p => { const d = [p.start, p.end].filter(Boolean); return d.length ? (d[0] === d[1] ? d[0] : d.join(" – ")) : ""; };
  const expName = id => {
    const x = C.experience.find(e => e.id === id);
    return x ? x.role : (C.independent && id === C.independent.id ? C.independent.title : "");
  };
  const roleBadge = p => p.exp && expName(p.exp)
    ? `<button type="button" class="role-badge" data-goto-exp="${esc(p.exp)}" aria-label="See this role on the Experience page: ${esc(expName(p.exp))}">${icon("clock")}${esc(expName(p.exp))}</button>`
    : "";

  const PAGES = {
    home() {
      const p = C.profile;
      const years = new Date().getFullYear() - p.since;
      return `
      <section class="hero">
        <div class="avatar-wrap"><img class="avatar" src="${A.profile}" alt="${esc(t("Portrait of {name}", { name: p.name }))}" width="180" height="180"><span class="orbit" aria-hidden="true"><i></i></span></div>
        <h1 class="display">${esc(p.name)}</h1>
        <p class="role">${esc(p.role)}</p>
        <p class="lede">${esc(p.intro)}</p>
        <div class="actions">
          <a class="btn primary" href="#/projects" data-nav="projects">${esc(t("See my projects"))}</a>
          <button class="btn" type="button" data-action="download-cv">${icon("download")}${esc(t("Download CV"))}</button>
          <a class="btn ghost" href="#/contact" data-nav="contact">${esc(t("Get in touch"))}</a>
        </div>
        <dl class="facts">
          <div><dt>${esc(t("In IT since"))}</dt><dd>${p.since} <span class="muted">(${esc(t("{n} years", { n: years }))})</span></dd></div>
          <div><dt>${esc(t("Based in"))}</dt><dd>${esc(p.location)}</dd></div>
          <div><dt>${esc(t("Degree"))}</dt><dd>${esc(t("BSc Computer Science"))}</dd></div>
        </dl>
      </section>
      <section class="panel">
        <h2>${esc(t("What I work on"))}</h2>
        <div class="focus">
          ${p.focus.map(f => `<article><h3>${esc(f.title)}</h3><p>${esc(f.text)}</p>${tags(f.tech)}</article>`).join("")}
        </div>
      </section>
      <section class="panel slim">
        <h2>${esc(t("Currently exploring"))}</h2>
        <p>${esc(p.exploring)}</p>
      </section>`;
    },

    education() {
      const e = C.education;
      return `
      <header class="page-head"><h1 class="display">${esc(t("Education"))}</h1><p class="lede">${esc(t("A computer science degree, then a steady run of certifications."))}</p></header>
      <div class="tabs-inline" role="tablist" aria-label="${esc(t("Education sections"))}">
        <button role="tab" id="t-degree" aria-controls="p-degree" aria-selected="true">📈 ${esc(t("Degree"))}</button>
        <button role="tab" id="t-certs" aria-controls="p-certs" aria-selected="false" tabindex="-1">🗃 ${esc(t("Certificates"))}</button>
      </div>
      <section class="panel" role="tabpanel" id="p-degree" aria-labelledby="t-degree">
        <p class="kicker">${esc(e.degree.years)}</p>
        <h2 class="big">${esc(e.degree.school)}</h2>
        <p class="subtitle">${esc(e.degree.title)}</p>
        <ul class="points">${e.degree.points.map(x => `<li>${esc(x)}</li>`).join("")}</ul>
      </section>
      <section class="panel" role="tabpanel" id="p-certs" aria-labelledby="t-certs" hidden>
        <ol class="cert-list">
          ${e.certificates.map(c => `
            <li>
              <div><h3>${esc(c.title)}</h3><p class="muted">${esc([c.issuer, c.date].filter(Boolean).join(", "))}</p></div>
              ${c.id ? `<button class="chip-btn" type="button" data-copy="${esc(c.id)}" aria-label="${esc(t("Copy credential ID {id}", { id: c.id }))}">${icon("copy")}<span dir="ltr">${esc(c.id)}</span></button>` : ""}
            </li>`).join("")}
        </ol>
      </section>`;
    },

    experience() {
      const projList = (list, heading) => list.length ? `
        ${heading ? `<h3>${esc(heading)}</h3>` : ""}
        <ul class="role-projects">${list.map(p => `
          <li>
            <button type="button" class="proj-link" data-goto-proj="${pkey(p)}" aria-label="${esc(t("Open project {name}", { name: p.title }))}"><span>${esc(p.title)}</span><small>${esc(projDates(p))}</small></button>
            <p>${esc(p.desc)}</p>
            ${ecosystem(p, true)}
            ${tags(p.tech.slice(0, 5))}
          </li>`).join("")}
        </ul>` : "";
      const of = id => C.projects.filter(p => p.exp === id);
      const ind = C.independent;
      return `
      <header class="page-head"><h1 class="display">${esc(t("Experience"))}</h1><p class="lede">${esc(t("From IT support to managing a blockchain team, with the projects behind each role."))}</p></header>
      <ol class="timeline">
        ${C.experience.map(x => { const yr = roleYears(x); return `
          <li id="exp-${esc(x.id)}" data-from="${yr.from}" data-to="${yr.to}">
            <p class="when">${esc(x.years)}</p>
            <div class="panel">
              <h2>${esc(x.role)}</h2>
              <p>${esc(x.text)}</p>
              <ul class="points">${x.points.map(p => `<li>${esc(p)}</li>`).join("")}</ul>
              ${projList(of(x.id), t("Projects in this role"))}
            </div>
          </li>`; }).join("")}
      </ol>
      ${ind && of(ind.id).length ? `
      <section class="panel" id="exp-${esc(ind.id)}">
        <h2>${esc(ind.title)}</h2>
        <p>${esc(ind.text)}</p>
        ${projList(of(ind.id), "")}
      </section>` : ""}`;
    },

    projects() {
      const all = [...new Set(C.projects.flatMap(p => p.tech))].sort((a, b) => a.localeCompare(b));
      const counts = Object.fromEntries(all.map(x => [x, C.projects.filter(p => p.tech.includes(x)).length]));
      return `
      <header class="page-head"><h1 class="display">${esc(t("Projects"))}</h1><p class="lede">${esc(t("Filter by technology or search by name. Tap a project to open it."))}</p></header>
      <section class="panel filters">
        <label class="search">${icon("search")}<span class="sr">${esc(t("Find a project"))}</span><input id="proj-q" type="search" placeholder="${esc(t("Find a project"))}" autocomplete="off"></label>
        <div class="chips" role="group" aria-label="${esc(t("Filter by technology"))}" id="tech-chips">
          ${all.map(x => `<button type="button" class="chip${counts[x] < 2 ? " rare" : ""}" data-tech="${esc(x)}" aria-pressed="false">${esc(x)} <span class="n">${counts[x]}</span></button>`).join("")}
          <button type="button" class="link-btn" id="tech-more" aria-expanded="false">${esc(t("Show all {n} technologies", { n: all.length }))}</button>
        </div>
        <div class="filter-foot"><p id="proj-count" aria-live="polite"></p><button type="button" class="link-btn" id="proj-clear">${esc(t("Clear filters"))}</button></div>
      </section>
      <div id="proj-grid" class="proj-grid"></div>`;
    },

    contact() {
      return `
      <header class="page-head"><h1 class="display">${esc(t("Contact"))}</h1><p class="lede">${esc(t("Open to projects, collaboration and a good technical conversation."))}</p></header>
      <section class="links">
        ${C.links.map(l => `
          <a class="link-row" href="${esc(l.url)}" ${l.url.startsWith("mailto:") ? "" : 'target="_blank" rel="noopener noreferrer"'}>
            <span class="link-ico">${icon(l.id)}</span>
            <span><strong>${esc(l.label)}</strong><small dir="ltr">${esc(l.sub)}</small></span>
            ${l.url.startsWith("mailto:") ? "" : icon("ext", "ext")}
          </a>`).join("")}
      </section>
      <section class="panel">
        <h2>${esc(t("Write a message"))}</h2>
        <p class="muted">${esc(t("This opens your email app with the message ready to send to {email}.", { email: C.profile.email }))}</p>
        <div class="form" id="contact-form">
          <label>${esc(t("Your name"))}<input id="cf-name" autocomplete="name" required></label>
          <label>${esc(t("Subject"))}<input id="cf-subject" required></label>
          <label class="full">${esc(t("Message"))}<textarea id="cf-msg" rows="5" required></textarea></label>
          <p class="form-error full" id="cf-err" role="alert"></p>
          <div class="actions full">
            <button class="btn primary" type="button" id="cf-send">${icon("send")}${esc(t("Open in email app"))}</button>
            <button class="btn ghost" type="button" data-copy="${esc(C.profile.email)}">${icon("copy")}${esc(t("Copy email address"))}</button>
          </div>
        </div>
      </section>`;
    },

    resume() {
      const cats = [...new Set(C.skills.map(s => s.group || s.cat))];
      return `
      <header class="page-head"><h1 class="display">${esc(t("Resume"))}</h1>
        <div class="actions">
          <button class="btn primary" type="button" data-action="download-cv">${icon("download")}${esc(t("Download CV"))}</button>
          <button class="btn" type="button" id="cv-toggle" aria-expanded="false" aria-controls="cv-view">${icon("eye")}${esc(t("View CV"))}</button>
        </div>
      </header>
      <section id="cv-view" class="panel cv-view" hidden></section>
      <div class="resume-grid">
        <div>
          <section class="panel"><h2>${esc(t("About me"))}</h2><p>${esc(C.profile.intro)}</p>
            <ul class="points"><li>${esc(t("Keeps up with new technology, especially in development and programming."))}</li><li>${esc(t("Interested in data analytics, AI and NLP."))}</li><li>${esc(t("Web scraping and automation."))}</li></ul></section>
          <section class="panel"><h2>${esc(t("Work experience"))}</h2>
            <ul class="rows">${C.experience.map(x => `<li><span class="muted">${esc(x.years)}</span><span>${esc(x.role)}</span></li>`).join("")}</ul></section>
          <section class="panel"><h2>${esc(t("Certificates"))}</h2>
            <ul class="rows">${C.education.certificates.map(c => `<li><span class="muted">${esc(c.date.split("–").pop().trim())}</span><span>${esc(c.title)}</span></li>`).join("")}</ul></section>
        </div>
        <aside>
          <section class="panel"><h2>${esc(t("Info"))}</h2>
            <dl class="info"><div><dt>${esc(t("Email"))}</dt><dd><a href="mailto:${esc(C.profile.email)}" dir="ltr">${esc(C.profile.email)}</a></dd></div><div><dt>${esc(t("Location"))}</dt><dd>${esc(C.profile.location)}</dd></div></dl></section>
          <section class="panel"><h2>${esc(t("Education"))}</h2>
            <p><strong>${esc(C.education.degree.school)}</strong><br><span class="muted">${esc(C.education.degree.years)}</span></p>
            <p>${esc(C.education.degree.title)}</p>
            <ul class="points">${C.education.degree.points.map(x => `<li>${esc(x)}</li>`).join("")}</ul></section>
          <section class="panel"><h2>${esc(t("Languages"))}</h2>
            <dl class="info">${C.languages.map(([l, v]) => `<div><dt>${esc(l)}</dt><dd>${esc(v)}</dd></div>`).join("")}</dl></section>
        </aside>
      </div>
      <section class="panel lg" id="leadership">
        <h2>${esc(t("Technical leadership"))}</h2>
        <p class="muted">${esc(t("Technical qualifications I bring to project management. Pick a category."))}</p>
        <div class="lg-wrap">
          ${leadershipDial(C.leadership)}
          <ol class="lg-list">
            ${C.leadership.map((c, i) => `
              <li class="lg-item${i === 0 ? " open" : ""}" data-i="${i}">
                <button type="button" class="lg-cat" id="lg-b-${i}" aria-expanded="${i === 0}" aria-controls="lg-p-${i}">
                  <span class="lg-num">${String(i + 1).padStart(2, "0")}</span>
                  <span class="lg-ico">${icon(c.icon)}</span>
                  <span class="lg-name">${esc(c.cat)}</span>
                  <span class="lg-count" aria-label="${esc(t("{n} qualifications", { n: c.items.length }))}">${c.items.length}</span>
                </button>
                <div class="lg-body" id="lg-p-${i}" role="region" aria-labelledby="lg-b-${i}">
                  <ul class="lg-items">${c.items.map(it => `
                    <li><span class="lg-line"><strong>${esc(it.name)}</strong>${it.status ? `<span class="lg-status">${esc(it.status)}</span>` : ""}</span>${it.tags ? `<span class="lg-tags">${it.tags.map(x => `<span>${esc(x)}</span>`).join("")}</span>` : ""}</li>`).join("")}
                  </ul>
                </div>
              </li>`).join("")}
          </ol>
        </div>
      </section>
      <section class="panel">
        <div class="skills-head"><h2>${esc(t("Skills"))}</h2>
          <div class="chips" role="group" aria-label="${esc(t("Filter skills by category"))}">
            <button type="button" class="chip" data-cat="all" aria-pressed="true">${esc(t("All"))}</button>
            ${cats.map(c => `<button type="button" class="chip" data-cat="${esc(c)}" aria-pressed="false">${esc(c)}</button>`).join("")}
          </div>
        </div>
        <div id="skills-chart" class="skills-chart"></div>
        <ul class="legend" aria-label="${esc(t("Level legend"))}"><li><i class="l5"></i>${esc(t("85% and above"))}</li><li><i class="l4"></i>${esc(t("75–84%"))}</li><li><i class="l3"></i>${esc(t("65–74%"))}</li><li><i class="l2"></i>${esc(t("below 65%"))}</li></ul>
        <div id="skill-tip" class="skill-tip" role="status" aria-live="polite"></div>
      </section>`;
    },

    blog() {
      return `
      <header class="page-head"><h1 class="display">${esc(t("Blog"))}</h1><p class="lede">${esc(t("Notes from learning in public."))}</p></header>
      ${C.blogs.map(b => `
        <article class="panel post">
          <img src="${A[b.img] || b.img}" alt="" loading="lazy">
          <div>
            <p class="kicker">${esc(b.date)}</p>
            <h2>${esc(b.title)}</h2>
            <p>${esc(b.excerpt)}</p>
            <a class="btn" href="${esc(b.url)}" target="_blank" rel="noopener noreferrer">${esc(t("Read on Medium"))} ${icon("ext")}</a>
          </div>
        </article>`).join("")}`;
    },

    notfound(path) {
      return `
      <header class="page-head"><h1 class="display">${esc(t("Lost in time"))}</h1>
        <p class="lede">${esc(t("{path} isn't a page on this site. Pick a destination:", { path: SCHEME + path }))}</p></header>
      <section class="panel"><ul class="dest">${ROUTES.map(r => `<li><a href="#/${r.key}" data-nav="${r.key}">${r.icon} ${esc(t(r.title))}</a></li>`).join("")}</ul></section>`;
    }
  };

  // ---------- page behaviour ----------
  const INIT = {
    education(root) {
      const tabs = [...root.querySelectorAll('[role="tab"]')];
      const select = tab => {
        tabs.forEach(t => {
          const on = t === tab;
          t.setAttribute("aria-selected", on); t.tabIndex = on ? 0 : -1;
          root.querySelector("#" + t.getAttribute("aria-controls")).hidden = !on;
        });
      };
      tabs.forEach((t, i) => {
        t.addEventListener("click", () => select(t));
        t.addEventListener("keydown", e => {
          if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
            const n = tabs[(i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length];
            select(n); n.focus(); e.preventDefault();
          }
        });
      });
    },

    projects(root) {
      const state = { q: "", tech: new Set() };
      const grid = root.querySelector("#proj-grid");
      const count = root.querySelector("#proj-count");
      const q = root.querySelector("#proj-q");
      const chips = [...root.querySelectorAll(".chip[data-tech]")];
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const countText = n => `${n} ${n === 1 ? "project" : "projects"}`;

      const draw = () => {
        const list = C.projects.filter(p =>
          (!state.tech.size || [...state.tech].every(x => p.tech.includes(x))) &&
          (!state.q || (p.title + " " + p.desc + " " + p.tech.join(" ")).toLowerCase().includes(state.q))
        );
        count.textContent = countText(list.length);
        chips.forEach(c => { const on = state.tech.has(c.dataset.tech); c.setAttribute("aria-pressed", on); c.classList.toggle("keep", on); });
        if (!list.length) {
          grid.innerHTML = `<div class="panel empty"><p>${esc(t("No projects match these filters."))}</p><button type="button" class="btn" data-clear>${esc(t("Clear filters"))}</button></div>`;
          return;
        }
        grid.innerHTML = list.map(p => {
          const key = pkey(p), parts = key.split("-");
          const initials = (parts.length > 1 ? parts.map(w => w[0]).join("") : key.slice(0, 3)).slice(0, 3).toUpperCase();
          const meta = [projDates(p), p.role].filter(Boolean);
          return `
          <article class="proj book" id="proj-${key}">
            <div class="book-tilt"><div class="book-body">
              <div class="pg pg-inside" id="pg-${key}" inert aria-hidden="true">
                <div class="pg-scroll">
                  <h2>${esc(p.title)}</h2>
                  ${meta.length ? `<p class="meta">${meta.map(m => `<span>${esc(m)}</span>`).join("")}</p>` : ""}
                  ${roleBadge(p)}
                  ${p.desc ? `<h3>${esc(t("Description"))}</h3><p>${esc(p.desc)}</p>` : ""}
                  ${p.apps && p.apps.length ? `<h3>${esc(t("Ecosystem"))}</h3>${ecosystem(p)}` : ""}
                  ${p.tasks && p.tasks.length ? `<h3>${esc(t("Tasks"))}</h3><ul class="points">${p.tasks.map(x => `<li>${esc(x)}</li>`).join("")}</ul>` : ""}
                  <div class="tag-row">${p.tech.map(x => `<button type="button" class="tag${state.tech.has(x) ? " on" : ""}" data-tech-add="${esc(x)}" aria-label="${esc(t("Filter by {name}", { name: x }))}">${esc(x)}</button>`).join("")}</div>
                </div>
                <button type="button" class="pg-close" aria-label="${esc(t("Close"))}">${icon("close")}</button>
              </div>
              <button type="button" class="pg pg-cover" aria-expanded="false" aria-controls="pg-${key}" aria-label="${esc(t("Open project {name}", { name: p.title }))}">
                <span class="cover${p.logo ? " has-logo" : ""}" style="--h:${p.hue}" aria-hidden="true">${p.logo && A[p.logo] ? `<img class="cover-logo" src="${A[p.logo]}" alt="">` : `<span>${esc(initials)}</span>`}</span>
                <span class="cover-info">
                  <span class="cv-title">${esc(p.title)}</span>
                  ${meta.length ? `<span class="cv-meta">${esc(meta.join(" \u00b7 "))}</span>` : ""}
                  <span class="cv-tags" aria-hidden="true">${p.tech.slice(0, 3).map(x => `<i>${esc(x)}</i>`).join("")}</span>
                  <span class="cv-open" aria-hidden="true">${esc(t("Open"))} <b>\u203a</b></span>
                </span>
              </button>
            </div></div>
          </article>`;
        }).join("");
      };

      // a project is a book: the cover swings open onto the details
      const setBook = (book, open, focus) => {
        const cover = book.querySelector(".pg-cover"), inside = book.querySelector(".pg-inside");
        book.classList.toggle("open", open);
        cover.setAttribute("aria-expanded", open);
        if (open) { inside.removeAttribute("inert"); inside.setAttribute("aria-hidden", "false"); cover.setAttribute("inert", ""); }
        else { inside.setAttribute("inert", ""); inside.setAttribute("aria-hidden", "true"); cover.removeAttribute("inert"); }
        if (focus) (open ? inside.querySelector(".pg-close") : cover).focus({ preventScroll: true });
      };

      const more = root.querySelector("#tech-more"), chipBox = root.querySelector("#tech-chips");
      more.addEventListener("click", () => {
        const open = !chipBox.classList.contains("show-all");
        chipBox.classList.toggle("show-all", open);
        more.setAttribute("aria-expanded", open);
        more.textContent = open ? t("Show fewer") : t("Show all {n} technologies", { n: chips.length });
      });
      q.addEventListener("input", () => { state.q = q.value.trim().toLowerCase(); draw(); });
      chips.forEach(c => c.addEventListener("click", () => { const x = c.dataset.tech; state.tech.has(x) ? state.tech.delete(x) : state.tech.add(x); draw(); }));
      const clear = () => { state.q = ""; q.value = ""; state.tech.clear(); draw(); };
      root.querySelector("#proj-clear").addEventListener("click", clear);
      grid.addEventListener("click", e => {
        const cover = e.target.closest(".pg-cover");
        if (cover) { setBook(cover.closest(".book"), true, true); return; }
        const close = e.target.closest(".pg-close");
        if (close) { setBook(close.closest(".book"), false, true); return; }
        const b = e.target.closest("[data-tech-add]");
        if (b) { const x = b.dataset.techAdd; state.tech.has(x) ? state.tech.delete(x) : state.tech.add(x); draw(); root.querySelector(".filters").scrollIntoView({ behavior: "smooth", block: "nearest" }); }
        if (e.target.closest("[data-clear]")) clear();
      });
      const onKey = e => {
        if (!grid.isConnected) { document.removeEventListener("keydown", onKey); return; }
        if (e.key !== "Escape") return;
        grid.querySelectorAll(".book.open").forEach(book => setBook(book, false, book.contains(document.activeElement)));
      };
      document.addEventListener("keydown", onKey);

      // the cards lean towards the pointer, with a soft glare (mouse only)
      if (!reduced && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
        const rest = book => { book.style.setProperty("--rx", "0deg"); book.style.setProperty("--ry", "0deg"); book.style.setProperty("--glow", "0"); };
        grid.addEventListener("pointermove", e => {
          const book = e.target.closest(".book");
          if (!book || book.classList.contains("open")) return;
          const r = book.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
          book.style.setProperty("--ry", ((px - 0.5) * 10).toFixed(2) + "deg");
          book.style.setProperty("--rx", ((0.5 - py) * 8).toFixed(2) + "deg");
          book.style.setProperty("--mx", (px * 100).toFixed(1) + "%");
          book.style.setProperty("--my", (py * 100).toFixed(1) + "%");
          book.style.setProperty("--glow", "1");
        });
        grid.addEventListener("pointerout", e => { const book = e.target.closest(".book"); if (book && !book.contains(e.relatedTarget)) rest(book); });
      }
      draw();
    },

    contact(root) {
      const $ = id => root.querySelector("#" + id);
      $("cf-send").addEventListener("click", () => {
        const name = $("cf-name").value.trim(), subject = $("cf-subject").value.trim(), msg = $("cf-msg").value.trim();
        const missing = [!name && t("your name"), !subject && t("a subject"), !msg && t("a message")].filter(Boolean);
        if (missing.length) { $("cf-err").textContent = t("Add {list} first.", { list: joinList(missing) }); return; }
        $("cf-err").textContent = "";
        const body = `${msg}\n\n— ${name}`;
        window.location.href = `mailto:${C.profile.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        toast(t("Opening your email app"));
      });
    },

    resume(root) {
      // --- technical leadership clock
      const lg = root.querySelector("#leadership");
      if (lg) {
        const items = [...lg.querySelectorAll(".lg-item")], nodes = [...lg.querySelectorAll(".lg-node")];
        const hand = lg.querySelector(".lg-hand"), big = lg.querySelector(".lg-num-big");
        const n = items.length, reducedLg = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        let cur = 0, angle = 0, auto = !reducedLg, timer = null, visible = false, hovering = false;
        const select = (i, user) => {
          if (user) { auto = false; lg.classList.remove("auto"); }
          let step = ((i - cur) % n + n) % n;       // the hand always moves forward, like time
          if (step === 0 && user) step = 0;
          angle += step * (360 / n);
          cur = i;
          hand.style.transform = `rotate(${angle}deg)`;
          big.textContent = String(i + 1).padStart(2, "0");
          items.forEach((it, k) => {
            const on = k === i;
            it.classList.toggle("open", on);
            it.querySelector(".lg-cat").setAttribute("aria-expanded", on);
          });
          nodes.forEach((nd, k) => nd.classList.toggle("on", k === i));
          if (auto) { lg.classList.remove("tick"); void lg.offsetWidth; lg.classList.add("tick"); }
        };
        items.forEach((it, i) => {
          const b = it.querySelector(".lg-cat");
          b.addEventListener("click", () => select(i, true));
          b.addEventListener("keydown", e => {
            if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
            const k = (i + (e.key === "ArrowDown" ? 1 : n - 1)) % n;
            items[k].querySelector(".lg-cat").focus(); select(k, true); e.preventDefault();
          });
        });
        nodes.forEach((nd, i) => nd.addEventListener("click", () => { select(i, true); items[i].querySelector(".lg-cat").focus({ preventScroll: true }); }));
        lg.addEventListener("pointerenter", () => { hovering = true; });
        lg.addEventListener("pointerleave", () => { hovering = false; });
        if (auto) {
          lg.classList.add("auto");
          const io = new IntersectionObserver(es => { visible = es[0].isIntersecting; if (visible && auto) select(cur, false); }, { threshold: 0.4 });
          io.observe(lg);
          timer = setInterval(() => {
            if (!lg.isConnected) { clearInterval(timer); io.disconnect(); return; }
            if (auto && visible && !hovering && !lg.contains(document.activeElement)) select((cur + 1) % n, false);
          }, 6000);
        }
        select(0, false);
      }

      const chart = root.querySelector("#skills-chart");
      const tip = root.querySelector("#skill-tip");
      const level = v => (v >= 85 ? 5 : v >= 75 ? 4 : v >= 65 ? 3 : 2);
      let cat = "all";
      const draw = () => {
        chart.innerHTML = C.skills.filter(s => cat === "all" || (s.group || s.cat) === cat).map(s => `
          <div class="skill-cat">
            <h3>${esc(s.cat)}</h3>
            <div class="bars">${s.items.map(([n, v]) => `
              <div class="bar" tabindex="0" role="img" aria-label="${esc(n)}: ${v}%" data-skill="${esc(n)}" data-v="${v}">
                <span class="bar-name">${esc(n)}</span>
                <span class="track"><span class="fill l${level(v)}" style="--v:${v}%"></span></span>
                <span class="bar-v">${v}%</span>
              </div>`).join("")}</div>
          </div>`).join("");
      };
      const show = el => {
        if (!el) { tip.classList.remove("show"); return; }
        tip.innerHTML = `<strong>${esc(t("Skill:"))}</strong> ${esc(el.dataset.skill)}<br><strong>${esc(t("Experience:"))}</strong> ${el.dataset.v}%`;
        const r = el.getBoundingClientRect(), pr = chart.parentElement.getBoundingClientRect();
        tip.style.left = Math.min(r.left - pr.left + 20, pr.width - 200) + "px";
        tip.style.top = r.top - pr.top - 56 + "px";
        tip.classList.add("show");
      };
      chart.addEventListener("pointerover", e => show(e.target.closest(".bar")));
      chart.addEventListener("pointerleave", () => show(null));
      chart.addEventListener("focusin", e => show(e.target.closest(".bar")));
      chart.addEventListener("focusout", () => show(null));
      chart.addEventListener("click", e => show(e.target.closest(".bar")));
      root.querySelectorAll(".chip[data-cat]").forEach(c => c.addEventListener("click", () => {
        cat = c.dataset.cat;
        root.querySelectorAll(".chip[data-cat]").forEach(x => x.setAttribute("aria-pressed", x === c));
        draw();
      }));
      draw();
      const tg = root.querySelector("#cv-toggle"), view = root.querySelector("#cv-view");
      tg.addEventListener("click", () => {
        const open = view.hidden;
        view.hidden = !open; tg.setAttribute("aria-expanded", open);
        tg.lastChild.textContent = t(open ? "Hide CV" : "View CV");
        if (open && !view.dataset.loaded) { view.dataset.loaded = "1"; renderPdf(view); }
        if (open) view.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  };

  // ======================================================================
  function Browser(root, hooks) {
    this.root = root;
    this.hooks = hooks;
    this.stack = [];
    this.idx = -1;
    this.current = null;
    this.busy = false;
    this.queued = null;
    this._build();
  }

  Browser.prototype._build = function () {
    this.root.innerHTML = `
      <header class="chrome">
        <div class="tabbar">
          <div class="lights">
            <button type="button" class="light red" data-desk data-i18n-label="Close the browser and return to the desk" aria-label="${esc(t("Close the browser and return to the desk"))}"></button>
            <span class="light yellow" aria-hidden="true"></span><span class="light green" aria-hidden="true"></span>
          </div>
          <nav class="tabs" role="tablist" data-i18n-label="Portfolio pages" aria-label="${esc(t("Portfolio pages"))}">
            ${ROUTES.map(r => `<a class="tab" role="tab" href="#/${r.key}" data-nav="${r.key}" id="tab-${r.key}" aria-selected="false" aria-controls="viewport"><span class="fav" aria-hidden="true">${r.icon}</span><span class="tab-title" data-i18n="${r.title}">${esc(t(r.title))}</span></a>`).join("")}
          </nav>
        </div>
        <div class="toolbar">
          <button type="button" class="tool" id="nav-back" data-i18n-label="Back" aria-label="${esc(t("Back"))}">${icon("back")}</button>
          <button type="button" class="tool" id="nav-fwd" data-i18n-label="Forward" aria-label="${esc(t("Forward"))}">${icon("fwd")}</button>
          <button type="button" class="tool" id="nav-reload" data-i18n-label="Reload page" aria-label="${esc(t("Reload page"))}">${icon("reload")}</button>
          <form class="address" id="address" role="search">
            ${icon("lock", "lock")}
            <label class="sr" for="addr" data-i18n="Address">${esc(t("Address"))}</label>
            <input id="addr" type="text" dir="ltr" spellcheck="false" autocomplete="off" autocapitalize="off" enterkeyhint="go">
          </form>
          <button type="button" class="tool desk-btn" data-desk data-i18n-label="Back to the desk" aria-label="${esc(t("Back to the desk"))}">${icon("desk")}<span data-i18n="Desk">${esc(t("Desk"))}</span></button>
        </div>
        <div class="progress" aria-hidden="true"></div>
      </header>
      <main class="viewport" id="viewport" tabindex="-1"><div class="page" id="page"></div></main>
      <div class="chrono" aria-hidden="true"><b class="chrono-year"></b><span class="chrono-dir"></span></div>`;

    this.viewport = this.root.querySelector("#viewport");
    this.page = this.root.querySelector("#page");
    this.addr = this.root.querySelector("#addr");
    this.progress = this.root.querySelector(".progress");
    this.chrono = this.root.querySelector(".chrono");

    this.root.addEventListener("click", e => {
      const nav = e.target.closest("[data-nav]");
      if (nav) { e.preventDefault(); this.go(nav.dataset.nav); return; }
      const ge = e.target.closest("[data-goto-exp]");
      if (ge) { e.preventDefault(); this.go("experience", { focus: "exp-" + ge.dataset.gotoExp }); return; }
      const gp = e.target.closest("[data-goto-proj]");
      if (gp) { e.preventDefault(); this.go("projects", { focus: "proj-" + gp.dataset.gotoProj }); return; }
      if (e.target.closest("[data-desk]")) { e.preventDefault(); this.hooks.onDesk(); return; }
      const cp = e.target.closest("[data-copy]");
      if (cp) { copyText(cp.dataset.copy); return; }
      if (e.target.closest('[data-action="download-cv"]')) downloadCV();
    });
    this.root.querySelector("#nav-back").addEventListener("click", () => this.back());
    this.root.querySelector("#nav-fwd").addEventListener("click", () => this.forward());
    this.root.querySelector("#nav-reload").addEventListener("click", () => this.reload());
    this.root.querySelector("#address").addEventListener("submit", e => {
      e.preventDefault();
      const raw = this.addr.value;
      const key = resolveRoute(raw);
      this.addr.blur();
      if (key) this.go(key);
      else this.go("notfound", { path: raw.replace(/^devleb:\/\//i, "").trim() || "?" });
    });
    this.addr.addEventListener("focus", () => this.addr.select());

    // arrow keys move between tabs
    const tabs = [...this.root.querySelectorAll(".tab")];
    tabs.forEach((t, i) => t.addEventListener("keydown", e => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      const n = tabs[(i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length];
      n.focus(); e.preventDefault();
    }));
    this.tabs = tabs;

    let ticking = false;
    this.viewport.addEventListener("scroll", () => {
      if (ticking) return; ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        const max = this.viewport.scrollHeight - this.viewport.clientHeight;
        const p = max > 0 ? this.viewport.scrollTop / max : 0;
        this.progress.style.transform = `scaleX(${p})`;
        this.hooks.onScroll && this.hooks.onScroll(p);
        if (this.shown && this.shown.key === "experience") this._expYear();
      });
    }, { passive: true });
  };

  Browser.prototype._syncChrome = function () {
    const key = this.current && this.current.key;
    this.tabs.forEach(t => {
      const on = t.dataset.nav === key;
      t.setAttribute("aria-selected", on);
      t.tabIndex = on ? 0 : -1;
      if (on) t.scrollIntoView({ block: "nearest", inline: "nearest" });
    });
    this.addr.value = SCHEME + (key === "notfound" ? this.current.path : key);
    this.root.querySelector("#nav-back").disabled = this.idx <= 0;
    this.root.querySelector("#nav-fwd").disabled = this.idx >= this.stack.length - 1;
    const r = ROUTES.find(r => r.key === key);
    document.title = (r ? t(r.title) : t("Not found")) + " — " + C.profile.name;
    try { history.replaceState(null, "", "#/" + (key === "notfound" ? this.current.path : key)); } catch (e) {}
  };

  Browser.prototype._render = function (entry) {
    this.page.innerHTML = entry.key === "notfound" ? PAGES.notfound(entry.path) : PAGES[entry.key]();
    this.page.dataset.page = entry.key;
    this.shown = entry;
    if (INIT[entry.key]) INIT[entry.key](this.page);
    this.viewport.scrollTop = 0;
    this.progress.style.transform = "scaleX(0)";
    this.hooks.onScroll && this.hooks.onScroll(0);
    if (entry.key === "experience") this._expYear(true);
  };

  /* Experience: the dial shows the year of the role being read.
     Reading down a role runs its years backwards (end year → start year). */
  Browser.prototype._expYear = function (force) {
    const items = [...this.page.querySelectorAll(".timeline > li[data-from]")];
    if (!items.length) return;
    const vp = this.viewport;
    // not laid out yet (the browser is still hidden): measure once it is on screen
    cancelAnimationFrame(this._expRetry);
    if (!vp.clientHeight) { this._expRetry = requestAnimationFrame(() => { if (this.shown && this.shown.key === "experience") this._expYear(true); }); return; }
    const line = vp.getBoundingClientRect().top + vp.clientHeight * 0.4;
    let year = +items[0].dataset.to, active = 0;
    for (let i = 0; i < items.length; i++) {
      const r = items[i].getBoundingClientRect();
      if (r.top > line) break;
      active = i;
      const k = Math.min(1, Math.max(0, (line - r.top) / Math.max(1, r.height)));
      year = +items[i].dataset.to + (+items[i].dataset.from - +items[i].dataset.to) * k;
    }
    // at the very bottom, land on the first year of the career
    if (vp.scrollTop >= vp.scrollHeight - vp.clientHeight - 2 && vp.scrollTop > 0) { active = items.length - 1; year = +items[active].dataset.from; }
    items.forEach((li, i) => li.classList.toggle("now", i === active));
    const y = Math.round(year);
    if (y === this._year && !force) return;
    const dir = this._year == null || force ? 0 : y < this._year ? -1 : 1;
    this._year = y;
    this.hooks.onYear && this.hooks.onYear("experience", String(y), dir);
  };

  // navigation with the time-travel transition
  Browser.prototype._transition = async function (entry, instant) {
    if (this.busy) { this.queued = [entry, instant]; return; }
    this.busy = true;
    const fromKey = this.shown ? this.shown.key : null;
    this.current = entry;
    this._syncChrome();
    const planetKey = entry.key;
    if (instant) {
      this.hooks.onShow && this.hooks.onShow(planetKey);
      this._render(entry);
      this.page.classList.remove("leaving"); this.page.classList.add("arrived");
    } else {
      const dir = this._direction(fromKey, entry.key);
      const w = this.hooks.onWarp(planetKey, dir);
      this._chrono(fromKey, entry.key, dir);
      this.root.classList.add("warping");
      this.page.classList.remove("arrived"); this.page.classList.add("leaving");
      await w.mid;
      this._render(entry);
      this.page.classList.remove("leaving");
      void this.page.offsetWidth;
      this.page.classList.add("arrived");
      await w.done;
      this.root.classList.remove("warping");
    }
    if (entry.focus || entry.action) setTimeout(() => { if (entry.focus) this._applyFocus(entry.focus); if (entry.action === "open-cv") this._openCv(); }, instant ? 180 : 90);
    this.busy = false;
    if (this.queued) { const q = this.queued; this.queued = null; this._transition(q[0], q[1]); }
  };

  Browser.prototype.go = function (key, opts = {}) {
    const entry = { key, path: opts.path, focus: opts.focus, action: opts.action };
    if (this.current && this.current.key === key && key !== "notfound" && !opts.force) {
      if (opts.focus || opts.action) { if (opts.focus) this._applyFocus(opts.focus); if (opts.action === "open-cv") this._openCv(); }
      else this.viewport.scrollTo({ top: 0, behavior: "smooth" });
      this._syncChrome();
      return;
    }
    this.stack = this.stack.slice(0, this.idx + 1);
    this.stack.push(entry);
    this.idx = this.stack.length - 1;
    this._transition(entry, opts.instant);
  };
  Browser.prototype.back = function () { if (this.idx > 0) { this.idx--; this._transition(this.stack[this.idx]); } };
  Browser.prototype.forward = function () { if (this.idx < this.stack.length - 1) { this.idx++; this._transition(this.stack[this.idx]); } };
  Browser.prototype.reload = function () {
    const b = this.root.querySelector("#nav-reload");
    b.classList.remove("spin"); void b.offsetWidth; b.classList.add("spin");
    if (this.current) this._transition(this.current);
  };

  // -1 = towards the past, +1 = towards the future
  Browser.prototype._direction = function (from, to) {
    const a = ERA[from] && ERA[from].n, b = ERA[to] && ERA[to].n;
    return a == null || b == null ? 1 : b < a ? -1 : 1;
  };

  // the year counter that rolls while we travel
  Browser.prototype._chrono = function (from, to, dir) {
    if (from === to || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = this.chrono, yr = el.querySelector(".chrono-year"), msg = el.querySelector(".chrono-dir");
    const a = ERA[from] && ERA[from].n, b = (ERA[to] || ERA.notfound).n, label = t((ERA[to] || ERA.notfound).label);
    msg.textContent = t(dir < 0 ? "Travelling back" : "Travelling ahead");
    clearTimeout(this._chronoT);
    el.classList.remove("settle"); el.classList.add("on");
    const dur = 720, t0 = performance.now();
    const step = now => {
      const k = Math.min(1, (now - t0) / dur);
      const e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
      yr.textContent = k >= 1 ? label : (a != null && b != null ? Math.round(a + (b - a) * e) : String(1000 + Math.floor(Math.random() * 9000)));
      if (k < 1) requestAnimationFrame(step);
      else this._chronoT = setTimeout(() => { el.classList.add("settle"); this._chronoT = setTimeout(() => el.classList.remove("on", "settle"), 520); }, 260);
    };
    requestAnimationFrame(step);
  };

  // scroll to a role or project and pulse it
  Browser.prototype._applyFocus = function (id) {
    const el = id && this.page.querySelector("#" + id);
    if (!el) return;
    const top = el.getBoundingClientRect().top - this.viewport.getBoundingClientRect().top + this.viewport.scrollTop - 14;
    this.viewport.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    const t = el.querySelector(".panel") || el;
    t.classList.remove("flash"); void t.offsetWidth; t.classList.add("flash");
    setTimeout(() => t.classList.remove("flash"), 1800);
    // a project opens its book
    if (el.classList.contains("book") && !el.classList.contains("open")) { const c = el.querySelector(".pg-cover"); if (c) c.click(); }
  };

  // open the CV viewer on the Resume page
  Browser.prototype._openCv = function () {
    const tg = this.page.querySelector("#cv-toggle");
    if (tg && tg.getAttribute("aria-expanded") !== "true") tg.click();
  };

  // the language changed: refresh the tabs, the toolbar and the page being shown
  Browser.prototype.relang = function () {
    const sc = this.viewport.scrollTop;
    window.I18N.applyStatic();
    if (this.current) { this._render(this.current); this.viewport.scrollTop = sc; this._syncChrome(); }
  };

  Browser.prototype.refreshYear = function () { if (this.shown && this.shown.key === "experience") this._expYear(true); };

  Browser.resolveRoute = resolveRoute;
  Browser.ROUTES = ROUTES;
  Browser.ERA = ERA;
  window.PortfolioBrowser = Browser;
})();
