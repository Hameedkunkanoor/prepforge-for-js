/* TOOLBOX renderer */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;");

  const CAT_LABEL = {
    "--c-cache": "Caching", "--c-storage": "Storage", "--c-data": "Analytics",
    "--c-messaging": "Messaging", "--c-compute": "Compute", "--c-api": "API/Edge",
    "--c-consist": "Coordination", "--c-observe": "Observability",
    "--c-security": "Security", "--c-reliab": "CI/CD",
  };

  const ckIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M5 12l5 5L20 7"/></svg>';
  const xIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M6 6l12 12M18 6L6 18"/></svg>';

  function ulList(arr, cls, ic) {
    return `<ul class="${cls}">` + arr.map((v) => `<li><span class="li-ic">${ic}</span>${v}</li>`).join("") + "</ul>";
  }

  function toolHTML(t) {
    const search = (t.name + " " + t.role + " " + t.use.join(" ") + " " + (t.cloud || "")).toLowerCase();
    return `<article class="tool reveal" data-search="${esc(search)}">
      <h3>${t.name}</h3>
      <p class="tool-role">${t.role}</p>
      <div class="tool-cols">
        <div class="tool-col use">
          <h4>Use when</h4>
          ${ulList(t.use, "use-list", ckIcon)}
        </div>
        ${t.avoid ? `<div class="tool-col avoid"><h4>Avoid when</h4>${ulList(t.avoid, "avoid-list", xIcon)}</div>` : ""}
      </div>
      ${t.cloud ? `<div class="cloud-tag"><span>Managed</span>${t.cloud}</div>` : ""}
    </article>`;
  }

  function groupHTML(g) {
    return `<section class="section" id="${g.id}" style="--cat:var(${g.cat})">
      <div class="section-head"><span class="section-index">${g.num}</span><h2>${g.title}</h2></div>
      <div class="section-divider"></div>
      <p class="section-intro">${g.intro}</p>
      <div class="tool-grid">${g.items.map(toolHTML).join("")}</div>
    </section>`;
  }

  function decisionsHTML() {
    const cards = window.TOOLBOX.decisions
      .map(
        (d) => `<div class="decision reveal" data-search="${esc((d.title + " " + d.note).toLowerCase())}">
          <h3>${d.title}</h3>
          <div class="diagram-wrap"><div class="mermaid" data-src="${esc(d.src)}"></div></div>
          <p class="diagram-note">${d.note}</p>
        </div>`
      )
      .join("");
    return `<section class="section" id="decisions" style="--cat:var(--c-interview)">
      <div class="section-head"><span class="section-index">★</span><h2>Decision Guides</h2></div>
      <div class="section-divider"></div>
      <p class="section-intro">Pick the right tool fast. Follow the branch that matches your requirement.</p>
      <div class="decision-grid">${cards}</div>
    </section>`;
  }

  function comparisonsHTML() {
    const tables = window.TOOLBOX.comparisons
      .map((c) => {
        const head = c.headers.map((h, i) => `<th${i === 0 ? ' class="rh"' : ""}>${h}</th>`).join("");
        const body = c.rows
          .map((r) => "<tr>" + r.map((cell, i) => (i === 0 ? `<td class="rh">${cell}</td>` : `<td>${cell}</td>`)).join("") + "</tr>")
          .join("");
        return `<div class="cmp reveal" data-search="${esc((c.title + " " + c.headers.join(" ")).toLowerCase())}">
          <h3>${c.title}</h3>
          <div class="cmp-scroll"><table class="cmp-table"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>
        </div>`;
      })
      .join("");
    return `<section class="section" id="compare" style="--cat:var(--c-data)">
      <div class="section-head"><span class="section-index">⇄</span><h2>Head-to-Head Comparisons</h2></div>
      <div class="section-divider"></div>
      <p class="section-intro">The classic "X vs Y" tables interviewers expect you to know cold.</p>
      <div class="cmp-grid">${tables}</div>
    </section>`;
  }

  function buildNav() {
    const nav = $("#nav");
    nav.innerHTML =
      `<a href="#decisions" data-target="decisions"><span class="dot" style="--cat:var(--c-interview)"></span><span class="num">★</span><span class="nav-label">Decision Guides</span></a>` +
      `<a href="#compare" data-target="compare"><span class="dot" style="--cat:var(--c-data)"></span><span class="num">⇄</span><span class="nav-label">Comparisons</span></a>` +
      window.TOOLBOX.groups
        .map(
          (g) => `<a href="#${g.id}" data-target="${g.id}">
            <span class="dot" style="--cat:var(${g.cat})"></span>
            <span class="num">${g.num}</span>
            <span class="nav-label">${g.title}</span>
          </a>`
        )
        .join("");
  }

  function render() {
    $("#sections").innerHTML = decisionsHTML() + comparisonsHTML() + window.TOOLBOX.groups.map(groupHTML).join("");
    // hero stats
    let tools = 0;
    window.TOOLBOX.groups.forEach((g) => (tools += g.items.length));
    const stats = [
      [window.TOOLBOX.groups.length, "Categories"],
      [tools + "+", "Tools"],
      [window.TOOLBOX.decisions.length, "Decision guides"],
      ["AWS+", "Cloud-mapped"],
    ];
    const hs = $("#hero-stats");
    if (hs) hs.innerHTML = stats.map(([n, l]) => `<div class="stat reveal"><b>${n}</b><span>${l}</span></div>`).join("");
  }

  function init() {
    buildNav();
    render();
    window.Shell.boot();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
