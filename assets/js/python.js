/* PYTHON primer renderer */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const escAttr = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;");

  function itemHTML(it) {
    return `<article class="pyitem reveal" data-search="${escAttr((it.title + " " + it.body).toLowerCase())}">
      <div class="pyitem-text">
        <h3>${it.title}</h3>
        <p>${it.body}</p>
      </div>
      <div class="code-wrap">
        <div class="code-bar"><span class="dot r"></span><span class="dot y"></span><span class="dot g"></span><span class="code-lang">python</span><button class="copy-code" title="Copy code">copy</button></div>
        <pre class="code-block"><code class="language-python">${esc(it.code)}</code></pre>
      </div>
    </article>`;
  }

  function sectionHTML(s) {
    return `<section class="section" id="${s.id}" style="--cat:var(${s.cat})">
      <div class="section-head"><span class="section-index">${s.num}</span><h2>${s.title}</h2></div>
      <div class="section-divider"></div>
      <p class="section-intro">${s.intro}</p>
      <div class="pyitems">${s.items.map(itemHTML).join("")}</div>
    </section>`;
  }

  function buildNav() {
    $("#nav").innerHTML = window.PYTHON.map(
      (s) => `<a href="#${s.id}" data-target="${s.id}">
        <span class="dot" style="--cat:var(${s.cat})"></span>
        <span class="num">${s.num}</span>
        <span class="nav-label">${s.title}</span>
      </a>`
    ).join("");
  }

  function render() {
    $("#sections").innerHTML = window.PYTHON.map(sectionHTML).join("");
    let items = 0;
    window.PYTHON.forEach((s) => (items += s.items.length));
    const stats = [
      [window.PYTHON.length, "Topics"],
      [items, "Snippets"],
      ["CP", "Ready"],
      ["3.x", "Python"],
    ];
    const hs = $("#hero-stats");
    if (hs) hs.innerHTML = stats.map(([n, l]) => `<div class="stat"><b>${n}</b><span>${l}</span></div>`).join("");
    if (window.Prism) window.Prism.highlightAll();
  }

  function init() {
    buildNav();
    render();
    window.Shell.boot();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
