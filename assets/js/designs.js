/* DESIGNS renderer */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;");

  const li = (arr) => "<ul>" + arr.map((v) => `<li>${v}</li>`).join("") + "</ul>";

  function decisionsTable(arr) {
    return `<div class="decision-table">
      ${arr
        .map(
          (d) => `<div class="dt-row">
            <div class="dt-comp">${d.component}</div>
            <div class="dt-choice">${d.choice}</div>
            <div class="dt-why">${d.why}</div>
          </div>`
        )
        .join("")}
    </div>`;
  }

  function deepDives(arr) {
    return arr
      .map(
        (d) => `<div class="deepdive">
          <h4>${d.title}</h4>
          <p>${d.body}</p>
        </div>`
      )
      .join("");
  }

  function designHTML(d) {
    const search = (d.title + " " + d.tagline + " " + d.functional.join(" ") + " " + d.decisions.map((x) => x.component + " " + x.choice).join(" ")).toLowerCase();
    return `<section class="section design" id="${d.id}" data-search="${esc(search)}">
      <div class="design-head">
        <span class="design-icon">${d.icon}</span>
        <div>
          <div class="design-eyebrow">DESIGN ${d.num}</div>
          <h2>${d.title}</h2>
          <p class="design-tagline">${d.tagline}</p>
        </div>
      </div>

      <div class="req-grid">
        <div class="req-card req-fn"><h4>Functional</h4>${li(d.functional)}</div>
        <div class="req-card req-nfn"><h4>Non-functional</h4>${li(d.nonFunctional)}</div>
        <div class="req-card req-scale"><h4>Scale estimates</h4>${li(d.scale)}</div>
      </div>

      <h3 class="block-title">Architecture</h3>
      <div class="diagram-wrap big">
        <span class="diagram-label">architecture</span>
        <div class="mermaid" data-src="${esc(d.architecture.src)}"></div>
        ${d.architecture.note ? `<p class="diagram-note">${d.architecture.note}</p>` : ""}
      </div>

      <h3 class="block-title">Key decisions</h3>
      ${decisionsTable(d.decisions)}

      <h3 class="block-title">${d.flow.title}</h3>
      <div class="diagram-wrap big">
        <span class="diagram-label">request flow</span>
        <div class="mermaid" data-src="${esc(d.flow.src)}"></div>
        ${d.flow.note ? `<p class="diagram-note">${d.flow.note}</p>` : ""}
      </div>

      <h3 class="block-title">Deep dives</h3>
      <div class="deepdive-grid">${deepDives(d.deepDives)}</div>

      ${d.interview ? `<details class="interview">
        <summary><span class="iv-ic">🎤</span> How to present this in an interview <span class="iv-hint">click to expand</span></summary>
        <ol class="iv-steps">${d.interview.map((s) => `<li>${s}</li>`).join("")}</ol>
      </details>` : ""}

      <div class="callout tradeoff-callout">
        <span class="ci">⚖️</span>
        <div><strong>Tradeoffs to mention:</strong>${li(d.tradeoffs)}</div>
      </div>
    </section>`;
  }

  function buildNav() {
    $("#nav").innerHTML =
      `<a href="#calculator" data-target="calculator"><span class="nav-emoji">🧮</span><span class="num">★</span><span class="nav-label">Capacity Calculator</span></a>` +
      window.DESIGNS.map(
        (d) => `<a href="#${d.id}" data-target="${d.id}">
          <span class="nav-emoji">${d.icon}</span>
          <span class="num">${d.num}</span>
          <span class="nav-label">${d.title.split("(")[0].trim()}</span>
        </a>`
      ).join("");
  }

  function calculatorHTML() {
    return `<section class="section" id="calculator" style="--cat:var(--c-interview)">
      <div class="section-head"><span class="section-index">🧮</span><h2>Capacity Estimation Calculator</h2></div>
      <div class="section-divider"></div>
      <p class="section-intro">Plug in rough numbers to get the back-of-the-envelope estimates interviewers love. Everything updates live.</p>
      <div class="calc">
        <div class="calc-inputs">
          <label>Daily active users (DAU)<input type="number" id="c-dau" value="10000000" min="0"></label>
          <label>Requests per user / day<input type="number" id="c-rpu" value="20" min="0"></label>
          <label>Read : write ratio (reads per write)<input type="number" id="c-rw" value="100" min="0"></label>
          <label>Avg payload size (KB)<input type="number" id="c-size" value="2" min="0"></label>
          <label>Peak factor (× average)<input type="number" id="c-peak" value="3" min="1"></label>
          <label>Retention (years)<input type="number" id="c-years" value="5" min="0"></label>
        </div>
        <div class="calc-outputs" id="calc-out"></div>
      </div>
    </section>`;
  }

  function fmt(n) {
    if (!isFinite(n)) return "—";
    const u = [["T", 1e12], ["B", 1e9], ["M", 1e6], ["K", 1e3]];
    for (const [s, v] of u) if (Math.abs(n) >= v) return (n / v).toFixed(2) + s;
    return Math.round(n).toString();
  }
  function fmtBytes(b) {
    const u = ["B", "KB", "MB", "GB", "TB", "PB"];
    let i = 0;
    while (b >= 1024 && i < u.length - 1) { b /= 1024; i++; }
    return b.toFixed(2) + " " + u[i];
  }
  function runCalc() {
    const v = (id) => parseFloat(document.getElementById(id).value) || 0;
    const dau = v("c-dau"), rpu = v("c-rpu"), rw = v("c-rw"), sizeKB = v("c-size"), peak = v("c-peak"), years = v("c-years");
    const perDay = dau * rpu;
    const avgQps = perDay / 86400;
    const peakQps = avgQps * peak;
    const writeQps = avgQps / (rw + 1);
    const readQps = avgQps - writeQps;
    const writesPerDay = perDay / (rw + 1);
    const storageDay = writesPerDay * sizeKB * 1024;
    const storageTotal = storageDay * 365 * years;
    const bw = avgQps * sizeKB * 1024;
    const out = [
      ["Requests / day", fmt(perDay)],
      ["Average QPS", fmt(avgQps)],
      ["Peak QPS", fmt(peakQps)],
      ["Read QPS", fmt(readQps)],
      ["Write QPS", fmt(writeQps)],
      ["New writes / day", fmt(writesPerDay)],
      ["Storage / day", fmtBytes(storageDay)],
      [`Storage / ${years || 0} yr`, fmtBytes(storageTotal)],
      ["Avg bandwidth", fmtBytes(bw) + "/s"],
    ];
    document.getElementById("calc-out").innerHTML = out
      .map(([l, val]) => `<div class="calc-stat"><b>${val}</b><span>${l}</span></div>`)
      .join("");
  }
  function wireCalc() {
    ["c-dau", "c-rpu", "c-rw", "c-size", "c-peak", "c-years"].forEach((id) => {
      const el = document.getElementById(id);
      el && el.addEventListener("input", runCalc);
    });
    runCalc();
  }

  function render() {
    $("#sections").innerHTML = calculatorHTML() + window.DESIGNS.map(designHTML).join("");
    let diagrams = 0;
    window.DESIGNS.forEach(() => (diagrams += 2));
    const stats = [
      [window.DESIGNS.length, "Full designs"],
      [diagrams, "Diagrams"],
      ["E2E", "Architecture"],
      ["★", "Interview-ready"],
    ];
    const hs = $("#hero-stats");
    if (hs) hs.innerHTML = stats.map(([n, l]) => `<div class="stat"><b>${n}</b><span>${l}</span></div>`).join("");
  }

  function init() {
    buildNav();
    render();
    wireCalc();
    window.Shell.boot();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
