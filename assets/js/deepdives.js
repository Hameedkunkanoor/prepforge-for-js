/* DEEP DIVES index — topics grouped by category, link to topic.html */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const escA = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;");

  const CAT_ORDER = ["Fundamentals", "Networking & Delivery", "Data & Storage", "Scaling", "Distributed Systems", "Reliability", "Patterns", "Security"];
  const LVL = (t) => (/beginner/i.test(t.level || "") ? 0 : /intermediate/i.test(t.level || "") ? 1 : 2);

  function groups() {
    const m = {};
    (window.DEEPDIVES || []).forEach((t) => (m[t.cat] = m[t.cat] || [], m[t.cat].push(t)));
    Object.keys(m).forEach((c) => m[c].sort((a, b) => LVL(a) - LVL(b)));
    return m;
  }
  function orderedCats(g) {
    return [...CAT_ORDER.filter((c) => g[c]), ...Object.keys(g).filter((c) => !CAT_ORDER.includes(c))];
  }
  function render() {
    const g = groups();
    const cats = orderedCats(g);
    let n = 0;
    $("#sections").innerHTML = cats.map((cat) => `
      <section class="section" id="${cat.replace(/\s+/g, "-")}">
        <div class="section-head"><span class="section-index">${g[cat].length}</span><h2>${cat}</h2></div>
        <div class="section-divider"></div>
        <div class="dd-cards">${g[cat].map((t) => `
          <a class="dd-card reveal" href="topic.html?id=${t.id}" data-search="${escA((t.title + " " + t.tagline).toLowerCase())}">
            <span class="dd-card-num">${String(++n).padStart(2, "0")}</span>
            <span class="dd-card-ic">${t.icon}</span>
            <div><h3>${t.title}</h3><p>${t.tagline}</p><span class="dd-card-lvl">${t.level || ""} · ${t.chapters.length} chapters</span></div>
          </a>`).join("")}</div>
      </section>`).join("");
    const hs = $("#hero-stats");
    if (hs) hs.innerHTML = [[window.DEEPDIVES.length, "Topics"], [cats.length, "Categories"], ["Study", "Order"], ["★", "Mastery"]]
      .map(([n, l]) => `<div class="stat"><b>${n}</b><span>${l}</span></div>`).join("");
    $("#nav").innerHTML = cats.map((c) => `<a href="#${c.replace(/\s+/g, "-")}" data-target="${c.replace(/\s+/g, "-")}"><span class="num">${g[c].length}</span><span class="nav-label">${c}</span></a>`).join("");
  }
  function init() { render(); window.Shell.boot(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
