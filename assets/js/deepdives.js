/* DEEP DIVES renderer */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const escAttr = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;");

  function codeBlock(code, lang) {
    return `<div class="code-wrap">
      <div class="code-bar"><span class="dot r"></span><span class="dot y"></span><span class="dot g"></span><span class="code-lang">${lang}</span><button class="copy-code" title="Copy code">copy</button></div>
      <pre class="code-block"><code class="language-${lang}">${esc(code)}</code></pre>
    </div>`;
  }

  function topicHTML(t) {
    const search = (t.title + " " + t.tagline + " " + t.sections.map((s) => s.h + " " + s.body).join(" ")).toLowerCase();
    const body = t.sections
      .map((s) => `<div class="dd-block">
        <h4>${s.h}</h4>
        <p>${s.body}</p>
        ${s.code ? codeBlock(s.code, s.lang || "java") : ""}
      </div>`)
      .join("");
    return `<section class="section dd-topic" id="${t.id}" data-search="${escAttr(search)}">
      <div class="dd-head">
        <span class="dd-icon">${t.icon}</span>
        <div><div class="dd-eyebrow">DEEP DIVE ${t.num}</div><h2>${t.title}</h2><p class="dd-tag">${t.tagline}</p></div>
      </div>
      <div class="dd-body">${body}</div>
    </section>`;
  }

  function buildNav() {
    $("#nav").innerHTML = window.DEEPDIVES.map(
      (t) => `<a href="#${t.id}" data-target="${t.id}">
        <span class="nav-emoji">${t.icon}</span>
        <span class="num">${t.num}</span>
        <span class="nav-label">${t.title}</span>
      </a>`
    ).join("");
  }

  function render() {
    $("#sections").innerHTML = window.DEEPDIVES.map(topicHTML).join("");
    const stats = [
      [window.DEEPDIVES.length, "Topics"],
      ["Origin→", "Internals"],
      ["Java", "Samples"],
      ["★", "In depth"],
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
