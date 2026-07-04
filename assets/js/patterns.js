/* PATTERNS renderer — a recognition cheat-sheet + expandable pattern cards. */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const P = window.PATTERNS || [];

  function cheatSheet() {
    const rows = P.map((p) => `
      <a class="cheat-row" href="#${p.id}">
        <span class="cheat-name" style="--pc:${p.color}">${p.name}</span>
        <span class="cheat-trig">${esc(p.triggers[0])}</span>
      </a>`).join("");
    return `<div class="cheat-card">
      <div class="cheat-head"><h2>Recognition cheat-sheet</h2><p>See a phrase on the left → reach for the pattern. Skim this before every practice set.</p></div>
      <div class="cheat-rows">${rows}</div>
    </div>`;
  }

  function card(p) {
    const triggers = p.triggers.map((t) => `<li>${esc(t)}</li>`).join("");
    const pitfalls = p.pitfalls.map((t) => `<li>${esc(t)}</li>`).join("");
    const examples = p.examples.map(([set, id, title]) =>
      `<a class="pat-ex" href="playground.html?set=${set}&id=${id}">▶ ${esc(title)}</a>`).join("");
    return `<article class="pat-card" id="${p.id}" style="--pc:${p.color}">
      <div class="pat-head">
        <h3>${p.name}</h3>
        <span class="pat-cx">${esc(p.complexity)}</span>
      </div>
      <p class="pat-tag">${esc(p.tagline)}</p>
      <div class="pat-grid">
        <div class="pat-block">
          <h4>Reach for it when you see</h4>
          <ul class="pat-triggers">${triggers}</ul>
          <h4>Why it works</h4>
          <p class="pat-use">${esc(p.use)}</p>
          <h4>Watch out for</h4>
          <ul class="pat-pitfalls">${pitfalls}</ul>
        </div>
        <div class="pat-block">
          <h4>Template</h4>
          <div class="code-wrap">
            <div class="code-bar"><span class="dot r"></span><span class="dot y"></span><span class="dot g"></span><span class="code-lang">python</span><button class="copy-code" title="Copy code">copy</button></div>
            <pre class="code-block"><code class="language-python">${esc(p.template)}</code></pre>
          </div>
          <h4>Practice it</h4>
          <div class="pat-exs">${examples}</div>
        </div>
      </div>
    </article>`;
  }

  function init() {
    const wrap = $("#pattern-list");
    if (!wrap) return;
    $("#pattern-cheats").innerHTML = cheatSheet();
    wrap.innerHTML = P.map(card).join("");
    if (window.Prism) window.Prism.highlightAll();
    if (window.Shell) window.Shell.boot();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
