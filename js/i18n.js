/* ==========================================================================
   Text helpers. The site is English only.
   - t("text", {vars}) fills {placeholders}.
   - content() returns the portfolio content.
   ========================================================================== */
(function () {
  function t(s, vars) {
    return vars ? s.replace(/\{(\w+)\}/g, (_, k) => (vars[k] !== undefined ? vars[k] : "")) : s;
  }
  const content = () => window.CONTENT;
  function applyStatic() {
    document.querySelectorAll("[data-role]").forEach(el => { el.textContent = content().profile.role; });
  }
  window.I18N = {
    t, content, applyStatic,
    lang: "en", rtl: false,
    set() {}, onChange() {}
  };
  document.documentElement.lang = "en"; document.documentElement.dir = "ltr";
  applyStatic();
})();
