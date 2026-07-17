/* DP mode reader — renders one DP mode: intuition + visual, the solving
   recipe for the class, and each problem with a collapsible step-by-step
   solution (state / transition / base / answer, code, walkthrough, trace). */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const escA = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;");
  const DIFF = { Easy: "d-easy", Medium: "d-med", Hard: "d-hard" };

  const MODES = window.DP_MODES || [];
  const byId = {}; MODES.forEach((m) => (byId[m.id] = m));
  const IDS = MODES.map((m) => m.id);

  const params = new URLSearchParams(location.search);
  let id = byId[params.get("id")] ? params.get("id") : IDS[0];
  let arr = null;

  // DP modes that map onto an existing Pattern reader page.
  const RELATED = { linear: "dp-1d", grid: "dp-2d" };

  /* ---------- visuals (array stepper / grid / mermaid) ---------- */
  function vizHTML(v) {
    if (!v) return "";
    if (v.type === "array") return `<div class="viz viz-array" id="dp-viz"></div>`;
    if (v.type === "grid") return gridHTML(v);
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
  function initArrayViz(v) {
    const root = $("#dp-viz"); if (!root) return;
    arr = { frames: v.frames, idx: 0, root };
    root.innerHTML = `
      <div class="va-board">
        <div class="va-row">${v.cells.map((c, i) => `<div class="va-cell" data-i="${i}"><span class="va-val">${esc(c)}</span><span class="va-idx">${i}</span></div>`).join("")}</div>
        <div class="va-markers">${v.cells.map((_, i) => `<div class="va-mk" data-i="${i}"></div>`).join("")}</div>
      </div>
      <div class="va-note" id="dpva-note"></div>
      <div class="va-ctrl">
        <button class="va-btn" id="dpva-prev">◀ Prev</button>
        <span class="va-count" id="dpva-count"></span>
        <button class="va-btn" id="dpva-next">Next ▶</button>
        <span class="va-cap">${esc(v.caption || "")}</span>
      </div>`;
    $("#dpva-prev").addEventListener("click", () => stepArr(-1));
    $("#dpva-next").addEventListener("click", () => stepArr(1));
    renderArr();
  }
  function stepArr(d) { arr.idx = Math.max(0, Math.min(arr.frames.length - 1, arr.idx + d)); renderArr(); }
  function renderArr() {
    const f = arr.frames[arr.idx];
    arr.root.querySelectorAll(".va-cell").forEach((cell) => {
      const i = +cell.getAttribute("data-i");
      cell.classList.toggle("in-win", !!(f.win && i >= f.win[0] && i <= f.win[1]));
      cell.classList.toggle("active", Object.values(f.marks || {}).includes(i));
    });
    arr.root.querySelectorAll(".va-mk").forEach((mk) => {
      const i = +mk.getAttribute("data-i");
      const labels = Object.entries(f.marks || {}).filter(([, idx]) => idx === i).map(([k]) => k);
      mk.innerHTML = labels.map((l) => `<span class="va-ptr">${esc(l)}</span>`).join("");
    });
    $("#dpva-note").innerHTML = f.note || "";
    $("#dpva-count").textContent = `Step ${arr.idx + 1} / ${arr.frames.length}`;
    $("#dpva-prev").disabled = arr.idx === 0;
    $("#dpva-next").disabled = arr.idx === arr.frames.length - 1;
  }

  /* ---------- problem card ---------- */
  function problemCard(p, n, dpNum) {
    const link = `<a class="btn ghost sm" href="playground.html?set=dp&id=dp${dpNum}">▶ Solve &amp; auto-grade in Playground</a>`;
    const extras = (window.DP_EXTRAS && window.DP_EXTRAS[dpNum]) || [];
    const extrasHTML = extras.length ? `
      <h4 class="dp-extra-h">Other ways to write it</h4>
      ${extras.map((e) => `
        <div class="dp-extra">
          <div class="dp-extra-lab">${esc(e.label)}</div>
          <p class="dp-extra-note">${e.note}</p>
          ${e.code ? `<div class="code-wrap"><div class="code-bar"><span class="dot r"></span><span class="dot y"></span><span class="dot g"></span><span class="code-lang">python</span><button class="copy-code" title="Copy code">copy</button></div><pre class="code-block"><code class="language-python">${esc(e.code)}</code></pre></div>` : ""}
        </div>`).join("")}` : "";
    return `<article class="dp-prob">
      <div class="dp-prob-head">
        <span class="dp-prob-n">${n}</span>
        <h3>${esc(p.title)}</h3>
        <span class="diff ${DIFF[p.difficulty]}">${p.difficulty}</span>
      </div>
      <p class="dp-prob-stmt">${esc(p.statement)}</p>
      <div class="dp-hint"><span class="lab">Nudge</span>${esc(p.hint)}</div>
      <details class="dp-sol">
        <summary>Show the step-by-step solution</summary>
        <div class="dp-frame">
          <div class="dpf-row"><span class="dpf-k">State</span><span class="dpf-v">${esc(p.state)}</span></div>
          <div class="dpf-row"><span class="dpf-k">Transition</span><span class="dpf-v">${esc(p.transition)}</span></div>
          <div class="dpf-row"><span class="dpf-k">Base case</span><span class="dpf-v">${esc(p.base)}</span></div>
          <div class="dpf-row"><span class="dpf-k">Answer</span><span class="dpf-v">${esc(p.answer)}</span></div>
          <div class="dpf-row"><span class="dpf-k">Complexity</span><span class="dpf-v">⏱ ${esc(p.time)} · 💾 ${esc(p.space)}</span></div>
        </div>
        <div class="code-wrap">
          <div class="code-bar"><span class="dot r"></span><span class="dot y"></span><span class="dot g"></span><span class="code-lang">python</span><button class="copy-code" title="Copy code">copy</button></div>
          <pre class="code-block"><code class="language-python">${esc(p.code)}</code></pre>
        </div>
        <div class="dp-walk"><span class="lab">Why it works</span><p>${p.walk}</p></div>
        <h4 class="dp-trace-h">Trace</h4>
        <ol class="trace-steps">${p.trace.map((t) => `<li>${esc(t)}</li>`).join("")}</ol>
        ${extrasHTML}
        ${link}
      </details>
    </article>`;
  }

  function render() {
    const m = byId[id];
    document.title = m.name + " · DP · PrepForge";
    const i = IDS.indexOf(id);
    const prev = IDS[i - 1], next = IDS[i + 1];
    // global problem offset so each card links to its runnable set=dp entry
    let offset = 0;
    for (let k = 0; k < i; k++) offset += byId[IDS[k]].problems.length;

    $("#dp-root").innerHTML = `
      <a class="pat-back" href="dp.html">← All DP modes</a>
      <header class="pat-hero" style="--pc:${m.color}">
        <span class="dp-kicker">DP mode ${i + 1} / ${IDS.length}</span>
        <h1>${esc(m.name)}</h1>
        <p class="pat-hero-tag">${esc(m.tagline)}</p>
      </header>

      <section class="pat-sec">
        <h2>The idea</h2>
        <p class="pat-idea">${m.intuition}</p>
        ${vizHTML(m.viz)}
      </section>

      <section class="pat-sec pat-recognize" style="--pc:${m.color}">
        <h2>How to recognize it</h2>
        <ul class="pat-list good">${m.recognize.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
      </section>

      <section class="pat-sec">
        <h2>How to solve this class, step by step</h2>
        <ol class="pat-steps">${m.approach.map((s) => `<li>${s}</li>`).join("")}</ol>
        ${RELATED[id] ? `<p class="dp-related">Related pattern page: <a href="pattern.html?id=${RELATED[id]}">open the ${esc(m.name)} pattern explainer →</a></p>` : ""}
      </section>

      <section class="pat-sec">
        <div class="dp-prob-bar">
          <h2>Worked problems</h2>
          <button id="dp-toggle-all" class="btn ghost sm" type="button">Expand all</button>
        </div>
        <p class="dp-try">Read the statement, try the <b>nudge</b>, plan your <i>state → transition → base → answer</i>, then reveal the solution.</p>
        ${m.problems.map((p, k) => problemCard(p, k + 1, offset + k + 1)).join("")}
      </section>

      <nav class="pat-nav">
        ${prev ? `<a class="pat-nav-l" href="dp-mode.html?id=${prev}">← ${esc(byId[prev].name)}</a>` : "<span></span>"}
        ${next ? `<a class="pat-nav-r" href="dp-mode.html?id=${next}">${esc(byId[next].name)} →</a>` : "<span></span>"}
      </nav>`;

    if (m.viz && m.viz.type === "array") initArrayViz(m.viz);
    if (window.Prism) window.Prism.highlightAll();

    const toggle = $("#dp-toggle-all");
    if (toggle) toggle.addEventListener("click", () => {
      const sols = Array.from(document.querySelectorAll(".dp-sol"));
      const anyClosed = sols.some((d) => !d.open);
      sols.forEach((d) => (d.open = anyClosed));
      toggle.textContent = anyClosed ? "Collapse all" : "Expand all";
      if (anyClosed && window.Prism) window.Prism.highlightAll();
    });
  }

  function init() {
    if (!$("#dp-root") || !MODES.length) return;
    render();
    if (window.Shell) window.Shell.boot();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
