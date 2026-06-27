/* =====================================================================
   SHELL — shared UI engine for the Toolbox & Designs pages.
   Handles theming, language, Mermaid rendering, search, mobile nav,
   scroll spy, progress bar and reveal animations.
   A page builds its #sections + #nav markup, then calls Shell.boot().
   ===================================================================== */
window.Shell = (function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const css = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();

  const THEMES = [
    ["aurora", "Aurora"], ["sunset", "Sunset"], ["forest", "Forest"],
    ["ocean", "Ocean"], ["rose", "Rose"], ["mono", "Mono"],
  ];
  let mode = localStorage.getItem("hld-mode") || (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
  let theme = localStorage.getItem("hld-theme") || "aurora";

  /* ---------- Mermaid ---------- */
  function mermaidVars() {
    return {
      fontFamily: '"Inter", sans-serif',
      primaryColor: css("--surface-3"),
      primaryTextColor: css("--text"),
      primaryBorderColor: css("--accent"),
      lineColor: css("--accent-2"),
      secondaryColor: css("--surface-2"),
      tertiaryColor: css("--surface"),
      mainBkg: css("--surface-3"),
      nodeBorder: css("--accent"),
      clusterBkg: "transparent",
      clusterBorder: css("--border"),
      titleColor: css("--text"),
      edgeLabelBackground: css("--surface"),
      actorBkg: css("--surface-3"),
      actorBorder: css("--accent"),
      actorTextColor: css("--text"),
      signalColor: css("--text-soft"),
      signalTextColor: css("--text"),
      labelBoxBkgColor: css("--surface-3"),
      labelBoxBorderColor: css("--accent"),
      labelTextColor: css("--text"),
      noteBkgColor: css("--surface-2"),
      noteTextColor: css("--text"),
      noteBorderColor: css("--accent-2"),
    };
  }
  function initMermaid() {
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: "loose",
      theme: "base",
      themeVariables: mermaidVars(),
      flowchart: { curve: "basis", htmlLabels: true, padding: 14, nodeSpacing: 45, rankSpacing: 55 },
      sequence: { useMaxWidth: true, mirrorActors: false },
    });
  }
  let seq = 0;
  async function renderDiagrams(scope = document) {
    for (const el of $$(".mermaid[data-src]", scope)) {
      try {
        const { svg } = await mermaid.render("mmd-" + seq++, el.getAttribute("data-src"));
        el.innerHTML = svg;
      } catch (e) {
        el.innerHTML = '<div style="color:var(--text-dim);font-size:13px">diagram unavailable</div>';
        console.warn("Mermaid failed", e);
      }
    }
  }
  function rerenderAll() {
    initMermaid();
    $$(".mermaid[data-src]").forEach((el) => (el.innerHTML = ""));
    renderDiagrams();
  }

  /* ---------- Controls ---------- */
  function applyMode() {
    document.documentElement.setAttribute("data-mode", mode);
    localStorage.setItem("hld-mode", mode);
    const ico = $(".mode-ico"); if (ico) ico.textContent = mode === "dark" ? "🌙" : "☀️";
  }
  function buildControls() {
    const themeSel = $("#theme-select");
    if (themeSel) {
      themeSel.innerHTML = THEMES.map(([v, l]) => `<option value="${v}">${l}</option>`).join("");
      themeSel.value = theme;
      themeSel.addEventListener("change", () => {
        theme = themeSel.value;
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem("hld-theme", theme);
        rerenderAll();
      });
    }
    const langSel = $("#lang-select");
    if (langSel && window.I18N) {
      langSel.innerHTML = window.I18N.LANGS.map((l) => `<option value="${l.code}">${l.flag} ${l.label}</option>`).join("");
      langSel.value = window.I18N.get();
      langSel.addEventListener("change", () => { window.I18N.set(langSel.value); applyI18n(); });
    }
    const mt = $("#mode-toggle");
    if (mt) mt.addEventListener("click", () => { mode = mode === "dark" ? "light" : "dark"; applyMode(); rerenderAll(); });
  }
  function applyI18n() {
    if (!window.I18N) return;
    const T = window.I18N.t;
    $$("[data-i18n]").forEach((el) => (el.textContent = T(el.getAttribute("data-i18n"))));
    $$("[data-i18n-attr]").forEach((el) => {
      const [a, k] = el.getAttribute("data-i18n-attr").split(":");
      el.setAttribute(a, T(k));
    });
  }

  /* ---------- Search ---------- */
  function setupSearch() {
    const search = $("#search");
    if (!search) return;
    const run = () => {
      const q = (search.value || "").trim().toLowerCase();
      let any = false;
      $$(".section", $("#sections")).forEach((sec) => {
        let vis = 0;
        $$("[data-search]", sec).forEach((it) => {
          const m = !q || it.getAttribute("data-search").includes(q);
          it.classList.toggle("hidden", !m);
          if (m) vis++;
        });
        const sm = vis > 0;
        sec.classList.toggle("hidden", !sm);
        if (sm) any = true;
      });
      let empty = $("#search-empty");
      if (!any) {
        if (!empty) { empty = document.createElement("div"); empty.id = "search-empty"; empty.className = "search-empty"; $("#sections").appendChild(empty); }
        empty.textContent = (window.I18N && window.I18N.t("search.empty")) || "No matches.";
        empty.classList.remove("hidden");
      } else if (empty) empty.classList.add("hidden");
    };
    let deb;
    search.addEventListener("input", () => { clearTimeout(deb); deb = setTimeout(run, 120); });
    document.addEventListener("keydown", (e) => {
      if (e.key === "/" && document.activeElement !== search) { e.preventDefault(); search.focus(); }
      if (e.key === "Escape" && document.activeElement === search) { search.value = ""; run(); search.blur(); }
    });
  }

  /* ---------- Reveal + scroll ---------- */
  let revObs;
  function observeReveals() {
    if (revObs) revObs.disconnect();
    revObs = new IntersectionObserver(
      (es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); revObs.unobserve(e.target); } }),
      { rootMargin: "0px 0px -8% 0px", threshold: 0.04 }
    );
    $$(".reveal").forEach((el) => revObs.observe(el));
  }
  function setupScroll() {
    const links = $$("#nav a");
    const onScroll = () => {
      const st = window.scrollY;
      const h = document.documentElement.scrollHeight - window.innerHeight;
      const p = $("#scroll-progress"); if (p) p.style.width = (h > 0 ? (st / h) * 100 : 0) + "%";
      const tt = $("#to-top"); if (tt) tt.classList.toggle("show", st > 600);
      let cur = "";
      $$(".section").filter((s) => !s.classList.contains("hidden")).forEach((s) => { if (s.getBoundingClientRect().top <= 130) cur = s.id; });
      links.forEach((a) => a.classList.toggle("active", a.getAttribute("data-target") === cur));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }
  function setupUI() {
    const sidebar = $("#sidebar"), backdrop = $("#backdrop");
    const close = () => { sidebar && sidebar.classList.remove("open"); backdrop && backdrop.classList.remove("show"); };
    const mt = $("#menu-toggle");
    if (mt && sidebar) mt.addEventListener("click", () => { sidebar.classList.toggle("open"); backdrop && backdrop.classList.toggle("show"); });
    if (backdrop) backdrop.addEventListener("click", close);
    const nav = $("#nav"); if (nav) nav.addEventListener("click", (e) => { if (e.target.closest("a")) close(); });
    const tt = $("#to-top"); if (tt) tt.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
    const yr = $("#year"); if (yr) yr.textContent = new Date().getFullYear();
  }

  function boot() {
    if (window.I18N) window.I18N.set(window.I18N.get());
    document.documentElement.setAttribute("data-theme", theme);
    applyMode();
    initMermaid();
    buildControls();
    applyI18n();
    renderDiagrams();
    observeReveals();
    setupSearch();
    setupScroll();
    setupUI();
  }

  return { boot, renderDiagrams, rerenderAll };
})();
