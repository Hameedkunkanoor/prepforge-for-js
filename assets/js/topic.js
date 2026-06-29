/* TOPIC reader — one deep-dive topic per page (topic.html?id=...) */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const escA = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;");
  const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const id = new URLSearchParams(location.search).get("id");
  const list = window.DEEPDIVES || [];
  const i = list.findIndex((t) => t.id === id);
  const topic = list[i] || list[0];
  const prev = list[i - 1], next = list[i + 1];

  function chapterHTML(c) {
    const cid = "c-" + slug(c.h);
    const ps = (c.p || []).map((x) => `<p>${x}</p>`).join("");
    const bl = c.bullets ? `<ul class="ch-list">${c.bullets.map((b) => `<li>${b}</li>`).join("")}</ul>` : "";
    const code = c.code ? `<div class="code-wrap"><div class="code-bar"><span class="dot r"></span><span class="dot y"></span><span class="dot g"></span><span class="code-lang">${c.lang || "java"}</span><button class="copy-code">copy</button></div><pre class="code-block"><code class="language-${c.lang || "java"}">${esc(c.code)}</code></pre></div>` : "";
    const note = c.note ? `<div class="ch-note">${c.note}</div>` : "";
    return `<section class="chapter" id="${cid}"><h2>${c.h}</h2>${ps}${bl}${code}${note}</section>`;
  }

  function toc() {
    return topic.chapters.map((c) => `<a href="#c-${slug(c.h)}" data-target="c-${slug(c.h)}">${c.h}</a>`).join("");
  }

  function render() {
    $("#nav").innerHTML = toc();
    $("#topic-body").innerHTML =
      `<nav class="crumb"><a href="deepdives.html">Deep Dives</a> › <span>${topic.cat}</span></nav>
       <header class="topic-hero"><span class="topic-ic">${topic.icon}</span>
         <div><span class="lvl">${topic.level || ""}</span><h1>${topic.title}</h1><p>${topic.tagline}</p></div>
       </header>
       ${topic.chapters.map(chapterHTML).join("")}
       <div class="topic-nav">
         ${prev ? `<a class="tn prev" href="topic.html?id=${prev.id}">← ${prev.title}</a>` : "<span></span>"}
         ${next ? `<a class="tn next" href="topic.html?id=${next.id}">${next.title} →</a>` : "<span></span>"}
       </div>`;
    document.title = topic.title + " · PrepForge for JS";
    if (window.Prism) window.Prism.highlightAll();
  }

  function init() { render(); window.Shell.boot(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
