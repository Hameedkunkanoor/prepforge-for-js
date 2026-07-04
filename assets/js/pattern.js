/* PATTERN reader — renders one pattern end-to-end with an interactive
   visual (array stepper / grid / bars / histogram / mermaid), recognition
   heuristics, template, variations, pitfalls, a worked trace, and practice. */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const escA = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;");
  const DIFF = { Easy: "d-easy", Medium: "d-med", Hard: "d-hard" };

  const DETAIL = window.PATTERN_DETAIL || {};
  // Keep the same order as the Patterns overview page when available.
  const ORDER = (window.PATTERNS || []).map((p) => p.id).filter((id) => DETAIL[id]);
  const IDS = ORDER.length ? ORDER : Object.keys(DETAIL);

  const params = new URLSearchParams(location.search);
  let id = DETAIL[params.get("id")] ? params.get("id") : IDS[0];

  let arrayState = null; // {frames, cells, win, idx, root}

  /* ---------- visual renderers ---------- */
  function vizHTML(v) {
    if (!v) return "";
    if (v.type === "array") return `<div class="viz viz-array" id="pat-viz"></div>`;
    if (v.type === "grid") return gridHTML(v);
    if (v.type === "bars") return barsHTML(v);
    if (v.type === "hist") return histHTML(v);
    if (v.type === "mermaid") return `<figure class="viz viz-mermaid"><div class="mermaid" data-src="${escA(v.code)}"></div><figcaption>${esc(v.caption || "")}</figcaption></figure>`;
    return "";
  }

  function gridHTML(v) {
    const head = `<tr>${v.cols.map((c) => `<th>${esc(c)}</th>`).join("")}</tr>`;
    const body = v.rows.map((row, ri) => `<tr>${row.map((cell, ci) => {
      const isHead = ci === 0;
      const hl = v.hl && v.hl[0] === ri && v.hl[1] === ci ? " g-hl" : "";
      return `<${isHead ? "th" : "td"} class="g-cell${hl}">${esc(cell)}</${isHead ? "th" : "td"}>`;
    }).join("")}</tr>`).join("");
    return `<figure class="viz viz-grid"><table class="grid-tbl"><thead>${head}</thead><tbody>${body}</tbody></table>
      ${v.note ? `<p class="viz-note">${esc(v.note)}</p>` : ""}<figcaption>${esc(v.caption || "")}</figcaption></figure>`;
  }

  function barsHTML(v) {
    const max = v.max || Math.max(...v.rows.map((r) => r.end)) + 1;
    const rows = v.rows.map((r) => {
      const left = (r.start / max) * 100;
      const width = ((r.end - r.start) / max) * 100;
      return `<div class="bar-row"><span class="bar-label">${esc(r.label || "")}</span>
        <div class="bar-track"><div class="bar-span ${r.cls || ""}" style="left:${left}%;width:${width}%">${r.start}–${r.end}</div></div></div>`;
    }).join("");
    const ticks = Array.from({ length: max + 1 }, (_, i) => `<span style="left:${(i / max) * 100}%">${i}</span>`).join("");
    return `<figure class="viz viz-bars">${rows}<div class="bar-axis">${ticks}</div><figcaption>${esc(v.caption || "")}</figcaption></figure>`;
  }

  function histHTML(v) {
    const max = Math.max(...v.bars.map((b) => b.h));
    const bars = v.bars.map((b) => `<div class="hist-col"><div class="hist-bar ${b.cls || ""}" style="height:${(b.h / max) * 100}%"><span>${b.h}</span></div></div>`).join("");
    return `<figure class="viz viz-hist"><div class="hist-wrap">${bars}</div><figcaption>${esc(v.caption || "")}</figcaption></figure>`;
  }

  function initArrayViz(v) {
    const root = $("#pat-viz");
    if (!root) return;
    arrayState = { frames: v.frames, cells: v.cells, idx: 0, root, caption: v.caption };
    root.innerHTML = `
      <div class="va-board">
        <div class="va-row">${v.cells.map((c, i) => `<div class="va-cell" data-i="${i}"><span class="va-val">${esc(c)}</span><span class="va-idx">${i}</span></div>`).join("")}</div>
        <div class="va-markers">${v.cells.map((_, i) => `<div class="va-mk" data-i="${i}"></div>`).join("")}</div>
      </div>
      <div class="va-note" id="va-note"></div>
      <div class="va-ctrl">
        <button class="va-btn" id="va-prev">◀ Prev</button>
        <span class="va-count" id="va-count"></span>
        <button class="va-btn" id="va-next">Next ▶</button>
        <span class="va-cap">${esc(v.caption || "")}</span>
      </div>`;
    $("#va-prev").addEventListener("click", () => stepArray(-1));
    $("#va-next").addEventListener("click", () => stepArray(1));
    renderArrayFrame();
  }

  function stepArray(d) {
    arrayState.idx = Math.max(0, Math.min(arrayState.frames.length - 1, arrayState.idx + d));
    renderArrayFrame();
  }

  function renderArrayFrame() {
    const s = arrayState;
    const f = s.frames[s.idx];
    // cells + window highlight
    s.root.querySelectorAll(".va-cell").forEach((cell) => {
      const i = +cell.getAttribute("data-i");
      const inWin = f.win && i >= f.win[0] && i <= f.win[1];
      cell.classList.toggle("in-win", !!inWin);
      cell.classList.toggle("active", Object.values(f.marks || {}).includes(i));
    });
    // markers under each cell
    s.root.querySelectorAll(".va-mk").forEach((mk) => {
      const i = +mk.getAttribute("data-i");
      const labels = Object.entries(f.marks || {}).filter(([, idx]) => idx === i).map(([k]) => k);
      mk.innerHTML = labels.map((l) => `<span class="va-ptr">${esc(l)}</span>`).join("");
    });
    $("#va-note").innerHTML = f.note || "";
    $("#va-count").textContent = `Step ${s.idx + 1} / ${s.frames.length}`;
    $("#va-prev").disabled = s.idx === 0;
    $("#va-next").disabled = s.idx === s.frames.length - 1;
  }

  /* ---------- page ---------- */
  function chips(list) { return list.map((t) => `<li>${t}</li>`).join(""); }

  function render() {
    const d = DETAIL[id];
    document.title = d.name + " · Patterns · PrepForge";
    const i = IDS.indexOf(id);
    const prev = IDS[i - 1], next = IDS[i + 1];

    const problems = d.problems.map((p) =>
      `<a class="pr-solve" href="playground.html?set=${p.set}&id=${p.id}">
        <span class="diff ${DIFF[p.difficulty]}">${p.difficulty}</span>
        <span class="pr-name">${esc(p.title)}</span><span class="pr-go">▶ Solve</span></a>`).join("");

    const variations = d.variations.map((v) => `<div class="pv-item"><b>${esc(v.name)}</b><span>${esc(v.note)}</span></div>`).join("");

    $("#pattern-root").innerHTML = `
      <a class="pat-back" href="patterns.html">← All patterns</a>

      <header class="pat-hero" style="--pc:${d.color}">
        <h1>${esc(d.name)}</h1>
        <p class="pat-hero-tag">${esc(d.tagline)}</p>
        <span class="pat-hero-cx">${esc(d.complexity)}</span>
      </header>

      <section class="pat-sec">
        <h2>The idea</h2>
        <p class="pat-idea">${d.idea}</p>
        ${vizHTML(d.viz)}
      </section>

      <section class="pat-sec pat-recognize" style="--pc:${d.color}">
        <h2>How to recognize it</h2>
        <div class="pat-rec-grid">
          <div class="pat-rec-col">
            <h4>Reach for it when you see</h4>
            <ul class="pat-list good">${chips(d.recognize.triggers.map(esc))}</ul>
          </div>
          <div class="pat-rec-col">
            <h4>Red flags (probably not this)</h4>
            <ul class="pat-list bad">${chips(d.recognize.redFlags.map(esc))}</ul>
          </div>
        </div>
        <div class="pat-heuristic"><span class="lab">How to find it</span>${esc(d.recognize.howToFind)}</div>
      </section>

      <section class="pat-sec">
        <h2>How it works</h2>
        <ol class="pat-steps">${d.steps.map((s) => `<li>${s}</li>`).join("")}</ol>
      </section>

      <section class="pat-sec">
        <h2>The template</h2>
        <div class="code-wrap">
          <div class="code-bar"><span class="dot r"></span><span class="dot y"></span><span class="dot g"></span><span class="code-lang">python</span><button class="copy-code" title="Copy code">copy</button></div>
          <pre class="code-block"><code class="language-python">${esc(d.template)}</code></pre>
        </div>
      </section>

      <section class="pat-sec">
        <h2>When to use vs avoid</h2>
        <div class="pat-rec-grid">
          <div class="pat-rec-col"><h4>Use it for</h4><ul class="pat-list good">${chips(d.whenUse.map(esc))}</ul></div>
          <div class="pat-rec-col"><h4>Avoid when</h4><ul class="pat-list bad">${chips(d.whenAvoid.map(esc))}</ul></div>
        </div>
      </section>

      <section class="pat-sec">
        <h2>Variations</h2>
        <div class="pat-variations">${variations}</div>
      </section>

      <section class="pat-sec">
        <h2>Common pitfalls</h2>
        <ul class="pat-list warn">${d.pitfalls.map((p) => `<li>${p}</li>`).join("")}</ul>
      </section>

      <section class="pat-sec pat-worked">
        <h2>Worked example — ${esc(d.worked.title)}</h2>
        <ol class="trace-steps">${d.worked.trace.map((t) => `<li>${esc(t)}</li>`).join("")}</ol>
        <a class="btn primary" href="playground.html?set=${d.worked.problem.set}&id=${d.worked.problem.id}">${esc(d.worked.problem.label)} →</a>
      </section>

      <section class="pat-sec">
        <h2>Practice this pattern</h2>
        <div class="pat-problems">${problems}</div>
      </section>

      <nav class="pat-nav">
        ${prev ? `<a class="pat-nav-l" href="pattern.html?id=${prev}">← ${esc(DETAIL[prev].name)}</a>` : "<span></span>"}
        ${next ? `<a class="pat-nav-r" href="pattern.html?id=${next}">${esc(DETAIL[next].name)} →</a>` : "<span></span>"}
      </nav>`;

    if (d.viz && d.viz.type === "array") initArrayViz(d.viz);
    if (window.Prism) window.Prism.highlightAll();
  }

  function init() {
    if (!$("#pattern-root") || !Object.keys(DETAIL).length) return;
    render();
    if (window.Shell) window.Shell.boot();       // renders mermaid + theme controls
    else if (window.mermaid) { try { window.mermaid.run(); } catch (e) {} }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
