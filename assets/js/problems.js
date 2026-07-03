/* PROBLEMS renderer — 80 problems with category/difficulty filters + search */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const escAttr = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;");

  const DIFF_CLASS = { Easy: "d-easy", Medium: "d-med", Hard: "d-hard" };
  let activeDiff = "All";
  let activeCat = "All";
  let activeStatus = "All";

  let SOLVED = new Set();
  try { SOLVED = new Set(JSON.parse(localStorage.getItem("hld-solved") || "[]")); } catch (e) {}
  function saveSolved() { localStorage.setItem("hld-solved", JSON.stringify([...SOLVED])); }

  function categories() {
    const map = {};
    window.PROBLEMS.forEach((p) => (map[p.category] = (map[p.category] || 0) + 1));
    return Object.keys(map).sort().map((c) => [c, map[c]]);
  }

  function problemHTML(p) {
    const search = (p.num + " " + p.title + " " + p.category + " " + p.difficulty + " " + p.statement + " " + p.idea).toLowerCase();
    return `<article class="problem reveal${SOLVED.has(p.id) ? " solved" : ""}" id="${p.id}" data-cat="${escAttr(p.category)}" data-diff="${p.difficulty}" data-search="${escAttr(search)}">
      <div class="problem-head">
        <span class="pnum">${String(p.num).padStart(2, "0")}</span>
        <h3>${p.title}</h3>
        <span class="diff ${DIFF_CLASS[p.difficulty]}">${p.difficulty}</span>
        <span class="chip">${p.category}</span>
        <a class="lc-link" href="${p.link}" target="_blank" rel="noopener">LeetCode ↗</a>
        <a class="solve-link" href="playground.html?id=${p.id}">▶ Solve</a>
        <button class="solve-btn" data-solve="${p.id}" title="Mark solved">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6"><path d="M5 12l5 5L20 7"/></svg>
          <span class="sb-text">${SOLVED.has(p.id) ? "Solved" : "Mark solved"}</span>
        </button>
      </div>
      <p class="problem-statement">${p.statement}</p>
      <div class="problem-idea"><span class="lab">Approach</span>${p.idea}</div>
      <div class="code-wrap">
        <div class="code-bar"><span class="dot r"></span><span class="dot y"></span><span class="dot g"></span><span class="code-lang">python</span><button class="copy-code" title="Copy code">copy</button></div>
        <pre class="code-block"><code class="language-python">${esc(p.code)}</code></pre>
      </div>
      <div class="cx"><span class="cx-time">⏱ ${p.time}</span><span class="cx-space">💾 ${p.space}</span></div>
      <div class="explain"><span class="lab">Explanation</span><p>${p.explanation}</p></div>
      <details class="trace">
        <summary><span class="tr-ic">▸</span> Step-by-step trace</summary>
        <ol class="trace-steps">${p.trace.map((t) => `<li>${esc(t)}</li>`).join("")}</ol>
      </details>
    </article>`;
  }

  function buildNav() {
    const cats = categories();
    $("#nav").innerHTML =
      `<a href="#filterbar" data-target="filterbar"><span class="dot" style="--cat:var(--c-interview)"></span><span class="num">★</span><span class="nav-label">Filters</span></a>` +
      cats
        .map(
          ([c, n]) => `<a href="#cat-${c.replace(/\s+/g, "-")}" data-cat-nav="${escAttr(c)}">
            <span class="dot" style="--cat:var(--c-compute)"></span>
            <span class="num">${n}</span>
            <span class="nav-label">${c}</span>
          </a>`
        )
        .join("");
    $$("#nav a[data-cat-nav]").forEach((a) =>
      a.addEventListener("click", (e) => {
        e.preventDefault();
        const c = a.getAttribute("data-cat-nav");
        activeCat = c;
        $("#cat-select").value = c;
        applyFilters();
        const first = $$(`.problem[data-cat="${CSS.escape(c)}"]`).find((x) => !x.classList.contains("hidden"));
        first && first.scrollIntoView({ behavior: "smooth", block: "start" });
      })
    );
  }

  function filterbarHTML() {
    const cats = categories();
    return `<div id="filterbar" class="filterbar">
      <div class="fb-row">
        <div class="fb-diffs">
          ${["All", "Easy", "Medium", "Hard"].map((d) => `<button class="fb-diff ${d === "All" ? "active" : ""}" data-diff="${d}">${d}</button>`).join("")}
        </div>
        <select id="cat-select" class="fb-cat">
          <option value="All">All categories (${window.PROBLEMS.length})</option>
          ${cats.map(([c, n]) => `<option value="${escAttr(c)}">${c} (${n})</option>`).join("")}
        </select>
        <div class="fb-search">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 21l-4.3-4.3M11 19a8 8 0 100-16 8 8 0 000 16z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          <input id="psearch" type="search" placeholder="Search problems…" autocomplete="off" />
        </div>
        <span id="result-count" class="fb-count"></span>
      </div>
      <div class="fb-row fb-row2">
        <div class="fb-status">
          ${["All", "Unsolved", "Solved"].map((s) => `<button class="fb-stat ${s === "All" ? "active" : ""}" data-status="${s}">${s}</button>`).join("")}
        </div>
        <button id="random-btn" class="fb-action" title="Jump to a random problem">🎲 Random</button>
        <button id="practice-toggle" class="fb-action" title="Hide solutions so you can attempt first">🙈 Practice mode</button>
        <span id="solved-count" class="fb-count"></span>
      </div>
    </div>`;
  }

  function applyFilters() {
    const q = ($("#psearch").value || "").trim().toLowerCase();
    let visible = 0;
    $$(".problem").forEach((el) => {
      const okDiff = activeDiff === "All" || el.getAttribute("data-diff") === activeDiff;
      const okCat = activeCat === "All" || el.getAttribute("data-cat") === activeCat;
      const isSolved = SOLVED.has(el.id);
      const okStatus = activeStatus === "All" || (activeStatus === "Solved" ? isSolved : !isSolved);
      const okSearch = !q || el.getAttribute("data-search").includes(q);
      const show = okDiff && okCat && okStatus && okSearch;
      el.classList.toggle("hidden", !show);
      if (show) visible++;
    });
    const rc = $("#result-count");
    if (rc) rc.textContent = `${visible} / ${window.PROBLEMS.length} shown`;
    updateSolved();
    let empty = $("#problems-empty");
    if (!visible) {
      if (!empty) { empty = document.createElement("div"); empty.id = "problems-empty"; empty.className = "search-empty"; $("#sections").appendChild(empty); }
      empty.textContent = "No problems match these filters.";
      empty.classList.remove("hidden");
    } else if (empty) empty.classList.add("hidden");
  }

  function updateSolved() {
    const done = [...SOLVED].filter((id) => document.getElementById(id)).length;
    const sc = $("#solved-count");
    if (sc) sc.textContent = `${done} / ${window.PROBLEMS.length} solved`;
    const fill = $("#pr-fill"), rc = $("#read-count"), tc = $("#total-count");
    if (rc) rc.textContent = done;
    if (tc) tc.textContent = window.PROBLEMS.length;
    if (fill) fill.style.width = (done / window.PROBLEMS.length) * 100 + "%";
  }

  function randomProblem() {
    const vis = $$(".problem").filter((p) => !p.classList.contains("hidden"));
    if (!vis.length) return;
    const pick = vis[Math.floor(Math.random() * vis.length)];
    pick.scrollIntoView({ behavior: "smooth", block: "start" });
    pick.classList.add("flash");
    setTimeout(() => pick.classList.remove("flash"), 1500);
  }

  function wireFilters() {
    $$(".fb-diff").forEach((b) =>
      b.addEventListener("click", () => {
        $$(".fb-diff").forEach((x) => x.classList.remove("active"));
        b.classList.add("active");
        activeDiff = b.getAttribute("data-diff");
        applyFilters();
      })
    );
    $$(".fb-stat").forEach((b) =>
      b.addEventListener("click", () => {
        $$(".fb-stat").forEach((x) => x.classList.remove("active"));
        b.classList.add("active");
        activeStatus = b.getAttribute("data-status");
        applyFilters();
      })
    );
    $("#cat-select").addEventListener("change", (e) => { activeCat = e.target.value; applyFilters(); });
    let deb;
    $("#psearch").addEventListener("input", () => { clearTimeout(deb); deb = setTimeout(applyFilters, 120); });
    $("#random-btn").addEventListener("click", randomProblem);
    $("#practice-toggle").addEventListener("click", (e) => {
      const on = $(".problems-list").classList.toggle("practice-mode");
      e.currentTarget.classList.toggle("active", on);
      e.currentTarget.innerHTML = on ? "👁 Show solutions" : "🙈 Practice mode";
    });
    // solved toggle (delegated)
    $("#sections").addEventListener("click", (e) => {
      const btn = e.target.closest(".solve-btn");
      if (!btn) return;
      const id = btn.getAttribute("data-solve");
      const art = document.getElementById(id);
      if (SOLVED.has(id)) { SOLVED.delete(id); art.classList.remove("solved"); btn.querySelector(".sb-text").textContent = "Mark solved"; }
      else { SOLVED.add(id); art.classList.add("solved"); btn.querySelector(".sb-text").textContent = "Solved"; }
      saveSolved();
      applyFilters();
    });
  }

  function render() {
    $("#sections").innerHTML = filterbarHTML() + `<div class="problems-list">${window.PROBLEMS.map(problemHTML).join("")}</div>`;
    const stats = [
      [window.PROBLEMS.length, "Problems"],
      [categories().length, "Categories"],
      [window.PROBLEMS.filter((p) => p.difficulty === "Hard").length, "Hard"],
      ["Py", "Solutions"],
    ];
    const hs = $("#hero-stats");
    if (hs) hs.innerHTML = stats.map(([n, l]) => `<div class="stat"><b>${n}</b><span>${l}</span></div>`).join("");
    if (window.Prism) window.Prism.highlightAll();
  }

  function init() {
    buildNav();
    render();
    wireFilters();
    applyFilters();
    window.Shell.boot();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
