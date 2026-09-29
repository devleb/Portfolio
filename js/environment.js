/* ==========================================================================
   Scene environment: the time of day and the weather for the desk.

   Time of day : the visitor's own clock (dawn, day, dusk, night), or a manual pick.
   Weather     : "Live" looks up the real weather with Open-Meteo (free, no key).
                 1. If the visitor already allowed location for this site, that is used.
                 2. Otherwise the main city of the visitor's time zone is used
                    (Asia/Beirut -> Beirut), so no permission is needed.
                 "My location" asks the browser for permission and uses the exact spot.
                 Coordinates are never stored. If a lookup fails the sky is clear,
                 and the panel says why. Weather data by Open-Meteo.com (CC BY 4.0).
   The line under the intro buttons shows what was detected.
   ========================================================================== */
(function () {
  const t = (s, v) => window.I18N.t(s, v);
  const PHASES = ["dawn", "day", "dusk", "night"];
  const WEATHERS = ["sunny", "cloudy", "rainy", "foggy", "snowy"];
  const LS_SCENE = "devleb.scene.v1", LS_WEATHER = "devleb.weather.v2";
  const CACHE_MS = 30 * 60 * 1000;

  const store = {
    get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const fail = (code, extra) => Object.assign(new Error(code), { code, extra });

  // ---------- time of day ----------
  const minutes = d => d.getHours() * 60 + d.getMinutes();
  const hm = str => { const m = /T(\d\d):(\d\d)/.exec(str || ""); return m ? +m[1] * 60 + +m[2] : null; };

  // sun = { rise, set } in minutes after midnight; defaults are 06:30 and 18:30
  function phaseFor(date, sun) {
    const rise = sun && sun.rise != null ? sun.rise : 390, set = sun && sun.set != null ? sun.set : 1110;
    const m = minutes(date);
    if (m >= rise - 60 && m < rise + 60) return "dawn";
    if (m >= rise + 60 && m < set - 90) return "day";
    if (m >= set - 90 && m < set + 60) return "dusk";
    return "night";
  }
  const timeText = () => new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

  // ---------- weather ----------
  // WMO weather codes used by Open-Meteo
  function weatherFromCode(c) {
    if (c === 0 || c === 1) return "sunny";
    if (c === 2 || c === 3) return "cloudy";
    if (c === 45 || c === 48) return "foggy";
    if ((c >= 51 && c <= 67) || (c >= 80 && c <= 82) || c >= 95) return "rainy";
    if ((c >= 71 && c <= 77) || c === 85 || c === 86) return "snowy";
    return "cloudy";
  }
  const wxLabel = (w, phase) => t(w === "sunny" && phase === "night" ? "Clear" : cap(w));
  const condWord = (w, phase) => t({ sunny: phase === "night" ? "clear" : "sunny", cloudy: "cloudy", rainy: "raining", foggy: "foggy", snowy: "snowing" }[w]);

  async function getJson(url, ms) {
    const ctl = new AbortController(), timer = setTimeout(() => ctl.abort(), ms || 7000);
    try {
      const r = await fetch(url, { signal: ctl.signal });
      if (!r.ok) throw fail("network");
      return await r.json();
    } catch (e) { throw e && e.code ? e : fail("network"); }
    finally { clearTimeout(timer); }
  }

  const getPosition = () => new Promise((res, rej) => {
    if (!navigator.geolocation) return rej(fail("nogeo"));
    navigator.geolocation.getCurrentPosition(
      p => res({ lat: +p.coords.latitude.toFixed(2), lon: +p.coords.longitude.toFixed(2) }),   // rounded: about 1 km
      () => rej(fail("declined")), { timeout: 8000, maximumAge: 3600000 });
  });
  async function silentPosition() {            // only if the visitor has already allowed it
    try {
      if (!navigator.geolocation || !navigator.permissions) return null;
      const p = await navigator.permissions.query({ name: "geolocation" });
      return p.state === "granted" ? await getPosition() : null;
    } catch (e) { return null; }
  }

  async function forecast(lat, lon) {
    const w = await getJson("https://api.open-meteo.com/v1/forecast?latitude=" + lat + "&longitude=" + lon +
      "&current=weather_code,temperature_2m&daily=sunrise,sunset&timezone=auto&forecast_days=1");
    if (!w || !w.current) throw fail("weather");
    return {
      weather: weatherFromCode(w.current.weather_code), temp: w.current.temperature_2m,
      sun: { rise: hm(w.daily && w.daily.sunrise && w.daily.sunrise[0]), set: hm(w.daily && w.daily.sunset && w.daily.sunset[0]) }
    };
  }

  async function fromTimeZone() {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    const city = tz.split("/").pop().replace(/_/g, " ");
    if (!tz.includes("/") || /^etc\//i.test(tz) || !city) throw fail("timezone", tz);
    const g = await getJson("https://geocoding-api.open-meteo.com/v1/search?name=" + encodeURIComponent(city) + "&count=10&language=en&format=json");
    const list = (g && g.results) || [];
    const loc = list.find(r => r.timezone === tz) || list[0];      // prefer the city that really is in this time zone
    if (!loc) throw fail("weather");
    const res = await forecast(loc.latitude, loc.longitude);
    return Object.assign(res, { city: loc.name, basis: "timezone" });
  }

  // opts.ask = true: ask for permission ("My location")
  async function liveWeather(opts) {
    const ask = !!(opts && opts.ask);
    if (!ask) {
      const c = store.get(LS_WEATHER);
      if (c && c.res && Date.now() - c.t < CACHE_MS) return c.res;
    }
    let pos = null, declined = false;
    if (ask) { try { pos = await getPosition(); } catch (e) { declined = true; } }
    else pos = await silentPosition();
    let res;
    if (pos) res = Object.assign(await forecast(pos.lat, pos.lon), { city: "", basis: "device" });
    else res = await fromTimeZone();
    res.declined = declined;
    store.set(LS_WEATHER, { t: Date.now(), res });
    return res;
  }

  // ---------- controls ----------
  const IC = {
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    moon: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
    cloud: '<path d="M7 18a4.5 4.5 0 0 1-.6-8.96A6 6 0 0 1 18 10.5 3.75 3.75 0 0 1 17.5 18z"/>',
    rain: '<path d="M7 15a4 4 0 0 1-.5-7.96A5.5 5.5 0 0 1 17 8.5 3.5 3.5 0 0 1 16.5 15z"/><path d="M8 18l-1 3M12 18l-1 3M16 18l-1 3"/>',
    snow: '<path d="M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9"/>',
    fog: '<path d="M4 8h16M6 12h12M4 16h16M8 20h8"/>'
  };
  const ico = n => `<svg class="ico" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${IC[n]}</svg>`;

  function init(desk) {
    if (!desk || document.getElementById("scene-ctl")) return;
    const saved = store.get(LS_SCENE) || {};
    const st = {
      time: PHASES.includes(saved.time) ? saved.time : "auto",
      weather: WEATHERS.includes(saved.weather) ? saved.weather : "live",
      precise: !!saved.precise,
      tilt: saved.tilt,
      live: null, liveState: "idle", reason: "", tz: ""              // liveState: idle | loading | ok | failed
    };
    const save = () => store.set(LS_SCENE, { time: st.time, weather: st.weather, precise: st.precise, tilt: st.tilt });

    // the detected-conditions line in the intro card
    const card = document.querySelector(".intro-card");
    let line = document.getElementById("env-line");
    if (card && !line) { line = document.createElement("p"); line.className = "env-line"; line.id = "env-line"; line.setAttribute("aria-live", "polite"); card.appendChild(line); }

    const ctl = document.createElement("div");
    ctl.className = "scene-ctl"; ctl.id = "scene-ctl";
    document.body.appendChild(ctl);

    const chip = (attr, val, label) => `<button type="button" class="chip" data-${attr}="${val}" aria-pressed="false">${esc(label)}</button>`;
    const buildPop = () => `
      <p class="sp-h">${esc(t("Time of day"))}</p>
      <div class="sp-row" role="group" aria-label="${esc(t("Time of day"))}">
        ${chip("time", "auto", t("Auto"))}${PHASES.map(p => chip("time", p, t(cap(p)))).join("")}
      </div>
      <p class="sp-h">${esc(t("Weather"))}</p>
      <div class="sp-row" role="group" aria-label="${esc(t("Weather"))}">
        ${chip("wx", "live", t("Live"))}${chip("wx", "here", t("My location"))}${WEATHERS.map(w => chip("wx", w, t(cap(w)))).join("")}
      </div>
      ${window.Tilt && window.Tilt.supported ? `
      <p class="sp-h">${esc(t("Motion"))}</p>
      <div class="sp-row" role="group" aria-label="${esc(t("Motion"))}">${chip("tilt", "on", t("Tilt"))}</div>` : ""}
      <p class="sp-note" id="sp-note" aria-live="polite"></p>`;

    const buildCtl = () => {
      const old = ctl.querySelector("#scene-pop");
      const open = !!old && !old.hidden;
      ctl.innerHTML = `
        <button type="button" class="scene-btn" id="scene-btn" aria-expanded="${open}" aria-controls="scene-pop" aria-haspopup="dialog">${ico("sun")}<span class="lbl"></span></button>
        <div class="scene-pop" id="scene-pop" role="dialog" aria-label="${esc(t("Time of day and weather"))}"${open ? "" : " hidden"}>${buildPop()}</div>`;
    };
    buildCtl();

    const $ = s => ctl.querySelector(s);

    const effective = () => {
      const sun = st.live && st.live.sun;
      return {
        phase: st.time === "auto" ? phaseFor(new Date(), sun) : st.time,
        weather: st.weather === "live" ? (st.live ? st.live.weather : "sunny") : st.weather
      };
    };

    const noteHtml = () => {
      const p = [esc(t(st.time === "auto" ? "Time follows your clock." : "Time set by you."))];
      if (st.weather !== "live") p.push(esc(t("Weather set by you. Pick Live to follow the real weather.")));
      else if (st.liveState === "loading") p.push(esc(t("Checking the weather…")));
      else if (st.liveState === "ok") {
        p.push(esc(t("Live weather for {city}: {temp}°C.", { city: st.live.city || t("your location"), temp: Math.round(st.live.temp) })));
        p.push(esc(t(st.live.basis === "device" ? "Based on your device's location. It is not stored." : "Based on your time zone's main city, not your exact location.")));
        p.push(`<a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer">${esc(t("Weather data by Open-Meteo.com"))}</a>`);
      } else if (st.liveState === "failed") {
        p.push(esc(st.reason === "timezone"
          ? t("Your time zone ({tz}) doesn't name a city. Try My location, or pick a weather.", { tz: st.tz })
          : t("Couldn't reach the weather service (some preview windows and blockers stop it). The sky is clear for now.")));
      }
      if (st.live && st.live.declined) p.push(esc(t("Location permission was declined, so your time zone's city is used.")));
      return p.join(" ");
    };

    const lineText = e => {
      const time = timeText();
      if (st.weather === "live") {
        if (st.liveState === "loading" || st.liveState === "idle") return t("Checking the weather…");
        if (st.liveState === "ok") {
          const v = { time, city: st.live.city, temp: Math.round(st.live.temp), cond: condWord(e.weather, e.phase) };
          return t(st.live.basis === "device" ? "It's {time} where you are: {temp}°C, {cond}." : "It's {time} in {city}: {temp}°C, {cond}.", v);
        }
        return t("It's {time} for you. Live weather isn't available here, so the sky is clear.", { time });
      }
      return t("It's {time}. Weather set to {w}.", { time, w: wxLabel(e.weather, e.phase) });
    };

    const render = () => {
      const e = effective();
      const icon = e.weather === "rainy" ? "rain" : e.weather === "snowy" ? "snow" : e.weather === "foggy" ? "fog" : e.weather === "cloudy" ? "cloud" : (e.phase === "night" ? "moon" : "sun");
      const label = `${t(cap(e.phase))} · ${wxLabel(e.weather, e.phase)}`;
      const b = $("#scene-btn");
      b.innerHTML = ico(icon) + `<span class="lbl">${esc(label)}</span>`;
      b.setAttribute("aria-label", t("Scene: {phase}, {weather}. Change time and weather.", { phase: t(cap(e.phase)), weather: wxLabel(e.weather, e.phase) }));
      ctl.querySelectorAll("[data-time]").forEach(c => c.setAttribute("aria-pressed", c.dataset.time === st.time));
      ctl.querySelectorAll("[data-wx]").forEach(c => {
        const v = c.dataset.wx;
        c.setAttribute("aria-pressed", v === "live" ? st.weather === "live" && !st.precise : v === "here" ? st.weather === "live" && st.precise : v === st.weather);
      });
      ctl.querySelectorAll("[data-tilt]").forEach(c => c.setAttribute("aria-pressed", !!(window.Tilt && window.Tilt.on)));
      $("#sp-note").innerHTML = noteHtml();
      if (line) line.textContent = lineText(e);
    };

    const apply = instant => {
      const e = effective();
      desk.setEnvironment(e.phase, e.weather, { instant: !!instant });
      render();
    };

    const loadLive = async ask => {
      st.liveState = "loading"; render();
      try { st.live = await liveWeather({ ask }); st.liveState = "ok"; st.reason = ""; }
      catch (err) { st.live = null; st.liveState = "failed"; st.reason = (err && err.code) || "network"; st.tz = (err && err.extra) || ""; }
      apply(false);
    };

    // ----- interaction (events are delegated, so the panel can be rebuilt freely)
    const setOpen = open => { $("#scene-pop").hidden = !open; $("#scene-btn").setAttribute("aria-expanded", open); };
    ctl.addEventListener("click", async e => {
      if (e.target.closest("#scene-btn")) { setOpen($("#scene-pop").hidden); return; }
      const tm = e.target.closest("[data-time]"), wx = e.target.closest("[data-wx]"), tl = e.target.closest("[data-tilt]");
      if (tm) { st.time = tm.dataset.time; save(); apply(false); }
      else if (wx) {
        const v = wx.dataset.wx;
        if (v === "live" || v === "here") {
          st.weather = "live"; st.precise = v === "here"; save();
          await loadLive(st.precise);
        } else { st.weather = v; save(); apply(false); }
      } else if (tl && window.Tilt) {
        if (window.Tilt.on) { window.Tilt.disable(); st.tilt = "off"; }
        else { st.tilt = (await window.Tilt.enable()) ? "on" : "off"; }
        save(); render();
      }
    });
    document.addEventListener("pointerdown", e => { if (!$("#scene-pop").hidden && !ctl.contains(e.target)) setOpen(false); });
    document.addEventListener("keydown", e => { if (e.key === "Escape" && !$("#scene-pop").hidden) { setOpen(false); $("#scene-btn").focus(); } });
    document.addEventListener("visibilitychange", () => { if (!document.hidden) { if (st.time === "auto") apply(false); else render(); } });

    // a language change rebuilds the labels

    // ----- tilt: Android starts it by itself; iPhone waits for a tap
    if (window.Tilt && window.Tilt.supported && (st.tilt === "on" || (st.tilt === undefined && !window.Tilt.needsPermission))) {
      window.Tilt.enable().then(ok => { if (ok) render(); });
    }

    // first look: instantly, so the desk never flashes the wrong sky
    apply(true);
    if (st.weather === "live") loadLive(false);
    setInterval(() => { if (st.time === "auto") apply(false); else render(); }, 60 * 1000);
  }

  window.SceneEnvironment = { init, phaseFor, weatherFromCode };
})();
