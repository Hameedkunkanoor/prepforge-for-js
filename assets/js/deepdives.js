/* DEEP DIVES index — topics grouped by category, link to topic.html */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const escA = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;");

  function groups() {
    const m = {};
    (window.DEEPDIVES || []).forEach((t) => (m[t.cat] = m[t.cat] || [], m[t.cat].push(t)));
    return m;
  }
  function render() {
    const g = groups();
    $("#sections").innerHTML = Object.keys(g).map((cat) => `
      <section class="section" id="${cat.replace(/\s+/g, "-")}">
        <div class="section-head"><span class="section-index">${g[cat].length}</span><h2>${cat}</h2></div>
        <div class="section-divider"></div>
        <div class="dd-cards">${g[cat].map((t) => `
          <a class="dd-card reveal" href="topic.html?id=${t.id}" data-search="${escA((t.title + " " + t.tagline).toLowerCase())}">
            <span class="dd-card-ic">${t.icon}</span>
            <div><h3>${t.title}</h3><p>${t.tagline}</p><span class="dd-card-lvl">${t.level || ""} · ${t.chapters.length} chapters</span></div>
          </a>`).join("")}</div>
      </section>`).join("");
    const hs = $("#hero-stats");
    if (hs) hs.innerHTML = [[window.DEEPDIVES.length, "Topics"], [Object.keys(g).length, "Categories"], ["Full", "Pages"], ["★", "Mastery"]]
      .map(([n, l]) => `<div class="stat"><b>${n}</b><span>${l}</span></div>`).join("");
    $("#nav").innerHTML = Object.keys(g).map((c) => `<a href="#${c.replace(/\s+/g, "-")}" data-target="${c.replace(/\s+/g, "-")}"><span class="num">${g[c].length}</span><span class="nav-label">${c}</span></a>`).join("");
  }
  function init() { render(); window.Shell.boot(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
