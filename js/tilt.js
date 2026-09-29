/* ==========================================================================
   Phone tilt: the desk shifts a little as the phone is tilted.
   Android turns it on by itself. iPhones need a tap (Motion > Tilt in the Scene
   panel) because iOS asks for permission first.
   ========================================================================== */
(function () {
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const coarse = window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
  const reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasEvent = "DeviceOrientationEvent" in window;
  const needsPermission = hasEvent && typeof window.DeviceOrientationEvent.requestPermission === "function";

  let on = false, sink = null, sawData = false;

  function handler(e) {
    if (e.gamma == null || e.beta == null || !sink) return;
    sawData = true;
    const angle = (screen.orientation && screen.orientation.angle) || 0;
    let x = e.gamma, y = e.beta - 50;                 // holding a phone upright is about 50 degrees
    if (angle === 90) { x = e.beta - 50; y = -e.gamma; }
    else if (angle === 270 || angle === -90) { x = -(e.beta - 50); y = e.gamma; }
    sink(clamp(x / 22, -1, 1), clamp(y / 22, -1, 1));
  }

  async function enable() {
    if (on || !hasEvent) return on;
    if (needsPermission) {
      try { if ((await window.DeviceOrientationEvent.requestPermission()) !== "granted") return false; }
      catch (e) { return false; }
    }
    window.addEventListener("deviceorientation", handler, true);
    on = true;
    return true;
  }

  function disable() {
    if (!on) return;
    window.removeEventListener("deviceorientation", handler, true);
    on = false;
    if (sink) sink(0, 0);
  }

  window.Tilt = {
    supported: coarse && hasEvent && !reduced,
    needsPermission,
    setSink(fn) { sink = fn; },
    enable, disable,
    get on() { return on; },
    get sawData() { return sawData; }
  };
})();
