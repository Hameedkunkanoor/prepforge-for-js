/* =====================================================================
   ENHANCE — shared cross-page features, loaded on every page.
   Adds: diagram zoom/pan, copy-link anchors, a global command palette
   (Ctrl/Cmd+K) that searches Concepts + Toolbox + Designs, a presenter
   / slide mode, and a print button. Injects its own toolbar buttons so
   no page markup needs editing.
   ===================================================================== */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const PAGE = location.pathname.split("/").pop() || "index.html";

  /* ---------------- Brand + grouped HLD/Coding menu ---------------- */
  const APP_NAME = "PrepForge";            // change here to rename the whole app
  const APP_TAG = "for JS";                // small subtitle next to the name
  const MENUS = [
    { label: "HLD", items: [["Concepts", "index.html"], ["Deep Dives", "deepdives.html"], ["Toolbox", "toolbox.html"], ["Designs", "designs.html"]] },
    { label: "Coding", items: [["Python", "python.html"], ["Problems", "problems.html"]] },
    { label: "Practice", href: "practice.html" },
  ];
  const SECTION = {
    "index.html": "Concepts", "": "Concepts", "toolbox.html": "Toolbox", "designs.html": "Designs",
    "python.html": "Python", "problems.html": "Problems", "practice.html": "Practice", "deepdives.html": "Deep Dives", "topic.html": "Deep Dive",
  };
  function buildTopNav() {
    const brandText = document.querySelector(".brand .brand-text");
    if (brandText) brandText.innerHTML = `<strong>${APP_NAME}</strong><em>${APP_TAG}</em>`;
    document.title = `${APP_NAME} ${APP_TAG} · ${SECTION[PAGE] || ""}`;

    const nav = document.querySelector(".page-nav");
    if (nav) {
      nav.innerHTML = MENUS.map((m) => {
        if (m.href) {
          const active = m.href === PAGE ? " active" : "";
          return `<a class="pn-link${active}" href="${m.href}">${m.label}</a>`;
        }
        const inMenu = m.items.some(([, href]) => href === PAGE || (href === "index.html" && PAGE === ""));
        const items = m.items
          .map(([label, href]) => {
            const cur = href === PAGE || (href === "index.html" && PAGE === "") ? " current" : "";
            return `<a href="${href}" class="pn-item${cur}">${label}</a>`;
          })
          .join("");
        return `<div class="navmenu${inMenu ? " active" : ""}">
          <button class="menu-btn" type="button">${m.label}<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2"/></svg></button>
          <div class="menu-panel">${items}</div>
        </div>`;
      }).join("");

      nav.querySelectorAll(".menu-btn").forEach((btn) =>
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          const mn = btn.parentElement;
          const open = mn.classList.contains("open");
          nav.querySelectorAll(".navmenu").forEach((x) => x.classList.remove("open"));
          if (!open) mn.classList.add("open");
        })
      );
      document.addEventListener("click", () => nav.querySelectorAll(".navmenu").forEach((x) => x.classList.remove("open")));
    }

    // footer brand text
    document.querySelectorAll(".site-foot .muted").forEach((el) => {
      el.innerHTML = el.innerHTML.replace(/HLD Masterclass/g, `${APP_NAME} ${APP_TAG}`);
    });
  }

  /* ---------------- Inject toolbar buttons ---------------- */
  function ic(svg) { return svg; }
  function injectButtons() {
    const controls = $(".topbar-controls");
    if (!controls) return;
    const mk = (id, title, label) => {
      const b = document.createElement("button");
      b.id = id; b.className = "icon-btn pill tool-btn"; b.title = title; b.setAttribute("aria-label", title);
      b.innerHTML = label;
      return b;
    };
    const palette = mk("cmdk-btn", "Search everything (Ctrl/Cmd+K)",
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>');
    const printB = mk("print-btn", "Print / save as PDF",
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9V3h12v6M6 18H4a2 2 0 01-2-2v-4a2 2 0 012-2h16a2 2 0 012 2v4a2 2 0 01-2 2h-2M6 14h12v7H6z"/></svg>');
    controls.insertBefore(palette, controls.firstChild);
    controls.appendChild(printB);
    // Presenter only where slide-able cards exist (Concepts)
    if (PAGE === "index.html" || PAGE === "") {
      const present = mk("present-btn", "Presenter mode (slides)",
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>');
      controls.appendChild(present);
      present.addEventListener("click", () => Presenter.open());
    }
    palette.addEventListener("click", () => Palette.open());
    printB.addEventListener("click", () => window.print());
  }

  /* ---------------- Diagram zoom / pan ---------------- */
  const Zoom = (function () {
    let overlay, stage, img, scale = 1, tx = 0, ty = 0, dragging = false, sx = 0, sy = 0;
    function build() {
      overlay = document.createElement("div");
      overlay.className = "zoom-overlay";
      overlay.innerHTML =
        '<div class="zoom-bar"><button data-z="in" title="Zoom in">+</button><button data-z="out" title="Zoom out">−</button><button data-z="reset" title="Reset">⟳</button><button data-z="close" title="Close (Esc)">✕</button></div><div class="zoom-stage"></div>';
      stage = overlay.querySelector(".zoom-stage");
      document.body.appendChild(overlay);
      overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });
      overlay.querySelector(".zoom-bar").addEventListener("click", (e) => {
        const z = e.target.getAttribute("data-z");
        if (z === "in") apply(scale * 1.25);
        else if (z === "out") apply(scale / 1.25);
        else if (z === "reset") { tx = ty = 0; apply(1); }
        else if (z === "close") close();
      });
      stage.addEventListener("wheel", (e) => { e.preventDefault(); apply(scale * (e.deltaY < 0 ? 1.1 : 0.9)); }, { passive: false });
      stage.addEventListener("pointerdown", (e) => { dragging = true; sx = e.clientX - tx; sy = e.clientY - ty; stage.setPointerCapture(e.pointerId); });
      stage.addEventListener("pointermove", (e) => { if (!dragging) return; tx = e.clientX - sx; ty = e.clientY - sy; render(); });
      stage.addEventListener("pointerup", () => (dragging = false));
    }
    function apply(s) { scale = Math.min(8, Math.max(0.3, s)); render(); }
    function render() { if (img) img.style.transform = `translate(${tx}px,${ty}px) scale(${scale})`; }
    function open(svgEl) {
      if (!overlay) build();
      stage.innerHTML = "";
      img = svgEl.cloneNode(true);
      img.removeAttribute("style");
      img.classList.add("zoom-svg");
      stage.appendChild(img);
      scale = 1; tx = 0; ty = 0; render();
      overlay.classList.add("show");
      document.body.style.overflow = "hidden";
    }
    function close() { overlay && overlay.classList.remove("show"); document.body.style.overflow = ""; }
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
    return { open, close };
  })();

  // Delegate: click a diagram to zoom (ignore if currently dragging text)
  document.addEventListener("click", (e) => {
    const wrap = e.target.closest(".diagram-wrap");
    if (!wrap) return;
    if (e.target.closest(".copy-link")) return;
    const svg = wrap.querySelector(".mermaid svg");
    if (svg) Zoom.open(svg);
  });

  // Delegate: copy a code block
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".copy-code");
    if (!btn) return;
    const code = btn.closest(".code-wrap")?.querySelector("code");
    if (!code) return;
    navigator.clipboard && navigator.clipboard.writeText(code.textContent);
    const old = btn.textContent;
    btn.textContent = "copied!";
    btn.classList.add("copied");
    setTimeout(() => { btn.textContent = old; btn.classList.remove("copied"); }, 1200);
  });

  /* ---------------- Copy-link anchors ---------------- */
  function decorateAnchors(root) {
    $$(".section[id], .card[id], .design[id]", root).forEach((el) => {
      if (el.querySelector(":scope > .copy-link")) return;
      const head = el.querySelector(".section-head, .card-top, .design-head");
      if (!head) return;
      const a = document.createElement("button");
      a.className = "copy-link"; a.title = "Copy link to this"; a.type = "button";
      a.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 007 0l3-3a5 5 0 00-7-7l-1 1M14 11a5 5 0 00-7 0l-3 3a5 5 0 007 7l1-1"/></svg>';
      a.addEventListener("click", (ev) => {
        ev.stopPropagation();
        const url = location.origin + location.pathname + "#" + el.id;
        navigator.clipboard && navigator.clipboard.writeText(url);
        history.replaceState(null, "", "#" + el.id);
        a.classList.add("copied");
        setTimeout(() => a.classList.remove("copied"), 1200);
      });
      head.style.position = head.style.position || "relative";
      el.insertBefore(a, el.firstChild);
    });
  }
  function watchContent() {
    const target = $("#sections");
    if (!target) return;
    const run = () => decorateAnchors(target);
    new MutationObserver(run).observe(target, { childList: true, subtree: true });
    run();
  }

  /* ---------------- Global command palette ---------------- */
  const Palette = (function () {
    let overlay, input, list, index = [], active = 0, filtered = [];
    function buildIndex() {
      const out = [];
      if (window.HLD_DATA)
        window.HLD_DATA.forEach((s) =>
          (s.topics || []).forEach((t) =>
            out.push({ title: t.title || t.name, sub: "Concept · " + s.title, page: "index.html", hash: t.id ? "t-" + t.id : s.id })
          )
        );
      if (window.HLD_GLOSSARY)
        window.HLD_GLOSSARY.forEach(([k, v]) => out.push({ title: k, sub: "Glossary · " + v, page: "index.html", hash: "glossary" }));
      if (window.TOOLBOX)
        window.TOOLBOX.groups.forEach((g) =>
          g.items.forEach((it) => out.push({ title: it.name, sub: "Tool · " + g.title, page: "toolbox.html", hash: g.id }))
        );
      if (window.DESIGNS)
        window.DESIGNS.forEach((d) => out.push({ title: d.title, sub: "Design · end-to-end", page: "designs.html", hash: d.id }));
      if (window.PYTHON)
        window.PYTHON.forEach((s) => out.push({ title: s.title, sub: "Python · primer", page: "python.html", hash: s.id }));
      if (window.PROBLEMS)
        window.PROBLEMS.forEach((p) => out.push({ title: p.num + ". " + p.title, sub: "Problem · " + p.difficulty + " · " + p.category, page: "problems.html", hash: p.id }));
      if (window.DEEPDIVES)
        window.DEEPDIVES.forEach((t) => out.push({ title: t.title, sub: "Deep dive · internals", page: "deepdives.html", hash: t.id }));
      return out;
    }
    function build() {
      overlay = document.createElement("div");
      overlay.className = "cmdk";
      overlay.innerHTML =
        '<div class="cmdk-box"><div class="cmdk-input"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg><input type="text" placeholder="Search concepts, tools, designs…" /><kbd>Esc</kbd></div><div class="cmdk-list"></div></div>';
      document.body.appendChild(overlay);
      input = overlay.querySelector("input");
      list = overlay.querySelector(".cmdk-list");
      overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });
      input.addEventListener("input", () => { active = 0; renderList(); });
      input.addEventListener("keydown", (e) => {
        if (e.key === "ArrowDown") { e.preventDefault(); active = Math.min(filtered.length - 1, active + 1); renderList(true); }
        else if (e.key === "ArrowUp") { e.preventDefault(); active = Math.max(0, active - 1); renderList(true); }
        else if (e.key === "Enter") { e.preventDefault(); go(filtered[active]); }
      });
    }
    function renderList(keep) {
      const q = input.value.trim().toLowerCase();
      filtered = (q ? index.filter((i) => (i.title + " " + i.sub).toLowerCase().includes(q)) : index).slice(0, 40);
      if (!keep) active = 0;
      list.innerHTML = filtered.length
        ? filtered.map((i, n) => `<a class="cmdk-item ${n === active ? "active" : ""}" data-n="${n}"><b>${i.title}</b><span>${i.sub}</span></a>`).join("")
        : '<div class="cmdk-empty">No matches</div>';
      $$(".cmdk-item", list).forEach((el) =>
        el.addEventListener("click", () => go(filtered[+el.getAttribute("data-n")]))
      );
      const act = list.querySelector(".cmdk-item.active");
      act && act.scrollIntoView({ block: "nearest" });
    }
    function go(item) {
      if (!item) return;
      close();
      if (item.page === PAGE || (item.page === "index.html" && PAGE === "")) {
        const el = document.getElementById(item.hash);
        if (el) { el.scrollIntoView({ behavior: "smooth" }); history.replaceState(null, "", "#" + item.hash); }
      } else {
        location.href = item.page + "#" + item.hash;
      }
    }
    function open() {
      if (!overlay) { build(); index = buildIndex(); }
      overlay.classList.add("show");
      input.value = ""; renderList();
      setTimeout(() => input.focus(), 30);
    }
    function close() { overlay && overlay.classList.remove("show"); }
    document.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); open(); }
      if (e.key === "Escape") close();
    });
    return { open, close };
  })();

  /* ---------------- Presenter / slide mode ---------------- */
  const Presenter = (function () {
    let overlay, stageEl, slides = [], idx = 0;
    function build() {
      overlay = document.createElement("div");
      overlay.className = "presenter";
      overlay.innerHTML =
        '<div class="present-top"><span class="present-count"></span><div class="present-actions"><button data-p="prev">←</button><button data-p="next">→</button><button data-p="close">✕</button></div></div><div class="present-stage"></div>';
      stageEl = overlay.querySelector(".present-stage");
      document.body.appendChild(overlay);
      overlay.querySelector(".present-top").addEventListener("click", (e) => {
        const p = e.target.getAttribute("data-p");
        if (p === "prev") move(-1); else if (p === "next") move(1); else if (p === "close") close();
      });
    }
    function collect() {
      slides = $$("#sections .card[id]").map((c) => ({ html: c.outerHTML, section: c.closest(".section")?.querySelector("h2")?.textContent || "" }));
    }
    async function show() {
      const s = slides[idx];
      overlay.querySelector(".present-count").textContent = `${idx + 1} / ${slides.length} · ${s.section}`;
      stageEl.innerHTML = `<div class="present-card">${s.html}</div>`;
      stageEl.querySelectorAll(".copy-link").forEach((x) => x.remove());
      if (window.Shell && window.Shell.renderDiagrams) await window.Shell.renderDiagrams(stageEl);
      else if (window.mermaid) {
        for (const el of stageEl.querySelectorAll(".mermaid[data-src]")) {
          try { const { svg } = await window.mermaid.render("pmmd-" + Math.random().toString(36).slice(2), el.getAttribute("data-src")); el.innerHTML = svg; } catch (_) {}
        }
      }
    }
    function move(d) { idx = Math.min(slides.length - 1, Math.max(0, idx + d)); show(); }
    function open() {
      if (!overlay) build();
      collect();
      if (!slides.length) return;
      idx = 0; overlay.classList.add("show"); document.body.style.overflow = "hidden"; show();
    }
    function close() { overlay && overlay.classList.remove("show"); document.body.style.overflow = ""; }
    document.addEventListener("keydown", (e) => {
      if (!overlay || !overlay.classList.contains("show")) return;
      if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); move(1); }
      else if (e.key === "ArrowLeft") move(-1);
      else if (e.key === "Escape") close();
    });
    return { open, close };
  })();

  /* ---------------- Init ---------------- */
  function init() {
    buildTopNav();
    injectButtons();
    watchContent();
    // open deep link target after content renders
    if (location.hash) setTimeout(() => { const el = document.getElementById(location.hash.slice(1)); el && el.scrollIntoView(); }, 800);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
