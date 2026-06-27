/* =====================================================================
   APP — renders the course, wires theming, language, search & Mermaid.
   ===================================================================== */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const css = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

  /* ---- Category labels for the sidebar groups ---- */
  const CAT_LABEL = {
    "--c-network": "Delivery",
    "--c-api": "Entry",
    "--c-compute": "Compute",
    "--c-cache": "Caching",
    "--c-storage": "Storage",
    "--c-data": "Data mgmt",
    "--c-messaging": "Async",
    "--c-security": "Security",
    "--c-reliab": "Reliability",
    "--c-consist": "Consistency",
    "--c-scaling": "Scaling",
    "--c-observe": "Observability",
    "--c-patterns": "Patterns",
    "--c-interview": "Interview",
  };

  /* ---- Themes & persisted prefs ---- */
  const THEMES = [
    ["aurora", "Aurora"],
    ["sunset", "Sunset"],
    ["forest", "Forest"],
    ["ocean", "Ocean"],
    ["rose", "Rose"],
    ["mono", "Mono"],
  ];
  let mode = localStorage.getItem("hld-mode") || (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
  let theme = localStorage.getItem("hld-theme") || "aurora";

  /* ---- Learned-progress state ---- */
  let LEARNED = new Set();
  try { LEARNED = new Set(JSON.parse(localStorage.getItem("hld-learned") || "[]")); } catch (e) {}
  function saveLearned() { localStorage.setItem("hld-learned", JSON.stringify([...LEARNED])); }
  function totalTopics() {
    let n = 0;
    window.HLD_DATA.forEach((s) => s.topics.forEach((t) => { if (t.id) n++; }));
    return n;
  }

  /* ---------- Mermaid setup ---------- */
  function mermaidThemeVars() {
    const dark = mode === "dark";
    return {
      fontFamily: '"Inter", sans-serif',
      primaryColor: css("--surface-3") || (dark ? "#232a40" : "#eef1fb"),
      primaryTextColor: css("--text") || (dark ? "#eef1fb" : "#131730"),
      primaryBorderColor: css("--accent") || "#7c7bff",
      lineColor: css("--accent-2") || "#38e8ff",
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
      themeVariables: mermaidThemeVars(),
      flowchart: { curve: "basis", htmlLabels: true, padding: 12 },
      sequence: { useMaxWidth: true, mirrorActors: false },
    });
  }

  let renderSeq = 0;
  async function renderDiagrams(scope = document) {
    const nodes = $$(".mermaid[data-src]", scope);
    for (const el of nodes) {
      const id = "mmd-" + renderSeq++;
      try {
        const { svg } = await mermaid.render(id, el.getAttribute("data-src"));
        el.innerHTML = svg;
      } catch (e) {
        el.innerHTML = '<div style="color:var(--text-dim);font-size:13px">diagram unavailable</div>';
        // eslint-disable-next-line no-console
        console.warn("Mermaid render failed", e);
      }
    }
  }
  function rerenderAllDiagrams() {
    initMermaid();
    $$(".mermaid[data-src]").forEach((el) => (el.innerHTML = ""));
    renderDiagrams();
  }

  /* ---------- Templates ---------- */
  const icon = {
    problem: '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/></svg>',
    how: '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v3M12 18v3M3 12h3M18 12h3"/><circle cx="12" cy="12" r="4"/></svg>',
    used: '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12l5 5L20 7"/></svg>',
    tradeoff: '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v18M5 7l7-4 7 4M3 11l4 7M21 11l-4 7"/></svg>',
    examples: '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18"/></svg>',
  };

  function escapeAttr(s) { return String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;"); }
  function list(val) {
    if (Array.isArray(val)) return "<ul>" + val.map((v) => `<li>${v}</li>`).join("") + "</ul>";
    return `<p>${val}</p>`;
  }

  function cardHTML(t) {
    const T = window.I18N.t;
    const examples = (t.examples || []).map((e) => `<span class="ex">${e}</span>`).join("");
    const diagram = t.diagram
      ? `<div class="diagram-wrap">
           <span class="diagram-label">diagram</span>
           <div class="mermaid" data-src="${escapeAttr(t.diagram)}"></div>
           ${t.note ? `<p class="diagram-note">${t.note}</p>` : ""}
         </div>`
      : "";
    return `<article class="card reveal" id="t-${t.id}" data-search="${escapeAttr((t.title + " " + (t.tagline || "") + " " + (t.examples || []).join(" ")).toLowerCase())}">
      <div class="card-top">
        <div class="card-title"><h3>${t.title}</h3>${t.chip ? `<span class="chip">${t.chip}</span>` : ""}
          <button class="learn-btn ${LEARNED.has(t.id) ? "done" : ""}" data-learn="${t.id}" title="Mark as learned">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M5 12l5 5L20 7"/></svg>
            <span class="lb-text">${LEARNED.has(t.id) ? "Learned" : "Mark learned"}</span>
          </button>
        </div>
        ${t.tagline ? `<p class="tagline">${t.tagline}</p>` : ""}
      </div>
      <div class="card-body">
        <div class="facts">
          ${t.problem ? `<div class="fact"><h4>${icon.problem}${T("label.problem")}</h4><p>${t.problem}</p></div>` : ""}
          ${t.how ? `<div class="fact"><h4>${icon.how}${T("label.how")}</h4><p>${t.how}</p></div>` : ""}
          ${t.used ? `<div class="fact"><h4>${icon.used}${T("label.used")}</h4>${list(t.used)}</div>` : ""}
          ${t.tradeoff ? `<div class="fact tradeoff"><h4>${icon.tradeoff}${T("label.tradeoff")}</h4><p>${t.tradeoff}</p></div>` : ""}
          ${t.examples ? `<div class="fact"><h4>${icon.examples}${T("label.examples")}</h4><div class="examples">${examples}</div></div>` : ""}
        </div>
        ${diagram}
      </div>
    </article>`;
  }

  function noteHTML(n) {
    return `<div class="note reveal" data-search="${escapeAttr((n.title + " " + (n.meaning || "")).toLowerCase())}">
      <h3>${n.title}</h3>
      ${n.kv ? `<p class="kv">${n.kv}</p>` : ""}
      <p>${n.meaning || n.purpose || ""}</p>
    </div>`;
  }

  function sectionHTML(s) {
    const color = `--cat:var(${s.cat})`;
    let body;
    if (s.type === "notes") {
      body = `<div class="note-grid">${s.topics.map(noteHTML).join("")}</div>`;
    } else {
      body = `<div class="cards">${s.topics.map(cardHTML).join("")}</div>`;
    }
    return `<section class="section" id="${s.id}" style="${color}">
      <div class="section-head">
        <span class="section-index">${s.num}</span>
        <h2>${s.title}</h2>
      </div>
      <div class="section-divider"></div>
      <p class="section-intro">${s.intro}</p>
      ${body}
    </section>`;
  }

  function glossaryHTML() {
    const items = window.HLD_GLOSSARY.map(
      ([k, v]) => `<div class="note reveal" data-search="${escapeAttr((k + " " + v).toLowerCase())}">
        <h3>${k}</h3><p>${v}</p></div>`
    ).join("");
    return `<section class="section" id="glossary" style="--cat:var(--c-interview)">
      <div class="section-head"><span class="section-index">17</span><h2>One-Line Glossary</h2></div>
      <div class="section-divider"></div>
      <p class="section-intro">Rapid-fire definitions for last-minute revision. Each term in one breath.</p>
      <div class="note-grid">${items}</div>
    </section>`;
  }

  /* ---------- Build nav ---------- */
  function buildNav() {
    const nav = $("#nav");
    nav.innerHTML = window.HLD_DATA.map((s) => {
      const label = CAT_LABEL[s.cat] || "";
      return `<a href="#${s.id}" data-target="${s.id}">
        <span class="dot" style="--cat:var(${s.cat})"></span>
        <span class="num">${s.num}</span>
        <span class="nav-label">${s.title}</span>
      </a>`;
    }).join("") + `<a href="#glossary" data-target="glossary"><span class="dot" style="--cat:var(--c-interview)"></span><span class="num">17</span><span class="nav-label">Glossary</span></a>`;
  }

  /* ---------- Hero stats ---------- */
  function heroStats() {
    const T = window.I18N.t;
    const sections = window.HLD_DATA.length + 1;
    let topics = 0, diagrams = 0;
    window.HLD_DATA.forEach((s) => {
      topics += s.topics.length;
      s.topics.forEach((t) => { if (t.diagram) diagrams++; });
    });
    topics += window.HLD_GLOSSARY.length;
    const langs = window.I18N.LANGS.length;
    const stats = [
      [sections, T("stat.sections")],
      [topics + "+", T("stat.topics")],
      [diagrams + "+", T("stat.diagrams")],
      [langs, T("stat.langs")],
    ];
    $("#hero-stats").innerHTML = stats
      .map(([n, l]) => `<div class="stat reveal"><b>${n}</b><span>${l}</span></div>`)
      .join("");
  }

  /* ---------- Controls ---------- */
  function buildControls() {
    const langSel = $("#lang-select");
    langSel.innerHTML = window.I18N.LANGS.map(
      (l) => `<option value="${l.code}">${l.flag} ${l.label}</option>`
    ).join("");
    langSel.value = window.I18N.get();
    langSel.addEventListener("change", () => {
      window.I18N.set(langSel.value);
      applyI18n();
      render();
    });

    const themeSel = $("#theme-select");
    themeSel.innerHTML = THEMES.map(([v, l]) => `<option value="${v}">${l}</option>`).join("");
    themeSel.value = theme;
    themeSel.addEventListener("change", () => {
      theme = themeSel.value;
      document.documentElement.setAttribute("data-theme", theme);
      localStorage.setItem("hld-theme", theme);
      rerenderAllDiagrams();
    });

    $("#mode-toggle").addEventListener("click", () => {
      mode = mode === "dark" ? "light" : "dark";
      applyMode();
      rerenderAllDiagrams();
    });
  }

  function applyMode() {
    document.documentElement.setAttribute("data-mode", mode);
    localStorage.setItem("hld-mode", mode);
    $(".mode-ico").textContent = mode === "dark" ? "🌙" : "☀️";
  }

  /* ---------- i18n DOM application ---------- */
  function applyI18n() {
    const T = window.I18N.t;
    $$("[data-i18n]").forEach((el) => (el.textContent = T(el.getAttribute("data-i18n"))));
    $$("[data-i18n-attr]").forEach((el) => {
      const [attr, key] = el.getAttribute("data-i18n-attr").split(":");
      el.setAttribute(attr, T(key));
    });
  }

  /* ---------- Render content ---------- */
  function render() {
    const html = window.HLD_DATA.map(sectionHTML).join("") + glossaryHTML();
    $("#sections").innerHTML = html;
    heroStats();
    rerenderAllDiagrams();
    wrapTerms($("#sections"));
    observeReveals();
    applySearch();
    updateProgress();
  }

  /* ---------- Glossary tooltips ---------- */
  let TERM_MAP = null;
  function buildTermMap() {
    const m = new Map();
    (window.HLD_GLOSSARY || []).forEach(([k, v]) => m.set(k.toLowerCase(), { term: k, def: v }));
    return m;
  }
  function wrapTerms(scope) {
    if (!TERM_MAP) TERM_MAP = buildTermMap();
    const terms = [...TERM_MAP.values()].map((x) => x.term).sort((a, b) => b.length - a.length);
    if (!terms.length) return;
    const rx = new RegExp("\\b(" + terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|") + ")\\b", "i");
    $$(".tagline, .fact p", scope).forEach((el) => {
      let used = 0;
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
      const nodes = [];
      while (walker.nextNode()) nodes.push(walker.currentNode);
      nodes.forEach((node) => {
        if (used >= 2) return;
        const text = node.nodeValue;
        const match = rx.exec(text);
        if (!match) return;
        const entry = TERM_MAP.get(match[1].toLowerCase());
        if (!entry) return;
        const before = text.slice(0, match.index);
        const after = text.slice(match.index + match[1].length);
        const span = document.createElement("span");
        span.className = "term";
        span.textContent = match[1];
        span.setAttribute("title", entry.def);
        const frag = document.createDocumentFragment();
        if (before) frag.appendChild(document.createTextNode(before));
        frag.appendChild(span);
        if (after) frag.appendChild(document.createTextNode(after));
        node.parentNode.replaceChild(frag, node);
        used++;
      });
    });
  }

  /* ---------- Progress ---------- */
  function updateProgress() {
    const total = totalTopics();
    const done = [...LEARNED].filter((id) => document.getElementById("t-" + id)).length;
    const rc = $("#read-count"), tc = $("#total-count"), fill = $("#pr-fill");
    if (rc) rc.textContent = done;
    if (tc) tc.textContent = total;
    if (fill) fill.style.width = (total ? (done / total) * 100 : 0) + "%";
  }
  function setupProgress() {
    $("#sections").addEventListener("click", (e) => {
      const btn = e.target.closest(".learn-btn");
      if (!btn) return;
      const id = btn.getAttribute("data-learn");
      if (LEARNED.has(id)) { LEARNED.delete(id); btn.classList.remove("done"); btn.querySelector(".lb-text").textContent = "Mark learned"; }
      else { LEARNED.add(id); btn.classList.add("done"); btn.querySelector(".lb-text").textContent = "Learned"; }
      saveLearned();
      updateProgress();
    });
    const reset = $("#reset-progress");
    if (reset) reset.addEventListener("click", () => {
      LEARNED.clear(); saveLearned();
      $$(".learn-btn.done").forEach((b) => { b.classList.remove("done"); b.querySelector(".lb-text").textContent = "Mark learned"; });
      updateProgress();
    });
  }

  /* ---------- Search ---------- */
  function applySearch() {
    const q = ($("#search").value || "").trim().toLowerCase();
    const sections = $$(".section", $("#sections"));
    let anyVisible = false;
    sections.forEach((sec) => {
      const items = $$("[data-search]", sec);
      let visibleInSec = 0;
      items.forEach((it) => {
        const match = !q || it.getAttribute("data-search").includes(q);
        it.classList.toggle("hidden", !match);
        if (match) visibleInSec++;
      });
      const secMatch = visibleInSec > 0;
      sec.classList.toggle("hidden", !secMatch);
      if (secMatch) anyVisible = true;
    });
    let empty = $("#search-empty");
    if (!anyVisible) {
      if (!empty) {
        empty = document.createElement("div");
        empty.id = "search-empty";
        empty.className = "search-empty";
        $("#sections").appendChild(empty);
      }
      empty.textContent = window.I18N.t("search.empty");
      empty.classList.remove("hidden");
    } else if (empty) {
      empty.classList.add("hidden");
    }
  }

  /* ---------- Reveal on scroll ---------- */
  let revealObserver;
  function observeReveals() {
    if (revealObserver) revealObserver.disconnect();
    revealObserver = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); revealObserver.unobserve(e.target); } }),
      { rootMargin: "0px 0px -8% 0px", threshold: 0.04 }
    );
    $$(".reveal").forEach((el) => revealObserver.observe(el));
  }

  /* ---------- Scroll spy + progress + read count ---------- */
  function setupScroll() {
    const navLinks = $$("#nav a");
    const sectionEls = () => $$(".section").filter((s) => !s.classList.contains("hidden"));
    const onScroll = () => {
      const st = window.scrollY;
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      $("#scroll-progress").style.width = (docH > 0 ? (st / docH) * 100 : 0) + "%";
      $("#to-top").classList.toggle("show", st > 600);

      let current = "";
      sectionEls().forEach((s) => { if (s.getBoundingClientRect().top <= 120) current = s.id; });
      navLinks.forEach((a) => a.classList.toggle("active", a.getAttribute("data-target") === current));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Mobile nav + interactions ---------- */
  function setupUI() {
    const sidebar = $("#sidebar"), backdrop = $("#backdrop");
    const close = () => { sidebar.classList.remove("open"); backdrop.classList.remove("show"); };
    $("#menu-toggle").addEventListener("click", () => {
      sidebar.classList.toggle("open"); backdrop.classList.toggle("show");
    });
    backdrop.addEventListener("click", close);
    $("#nav").addEventListener("click", (e) => { if (e.target.closest("a")) close(); });

    $("#to-top").addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

    const search = $("#search");
    let deb;
    search.addEventListener("input", () => { clearTimeout(deb); deb = setTimeout(applySearch, 120); });
    document.addEventListener("keydown", (e) => {
      if (e.key === "/" && document.activeElement !== search) { e.preventDefault(); search.focus(); }
      if (e.key === "Escape" && document.activeElement === search) { search.value = ""; applySearch(); search.blur(); }
    });

    $("#year").textContent = new Date().getFullYear();
  }

  /* ---------- Init ---------- */
  function init() {
    window.I18N.set(window.I18N.get());
    document.documentElement.setAttribute("data-theme", theme);
    applyMode();
    initMermaid();

    buildNav();
    buildControls();
    applyI18n();
    render();
    setupScroll();
    setupUI();
    setupProgress();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
