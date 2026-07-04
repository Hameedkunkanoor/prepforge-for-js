/* DASHBOARD — reads window.Progress and renders solved / review / starred /
   spaced-repetition-due problems with links back into the Playground. */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const SETS = {
    blind: { label: "Blind 80", list: window.PROBLEMS || [] },
    microsoft: { label: "Microsoft", list: window.MS_PROBLEMS || [] },
    fresh: { label: "Fresh 20", list: window.FRESH_PROBLEMS || [] },
  };
  const totalProblems = Object.values(SETS).reduce((a, s) => a + s.list.length, 0);

  function lookup(setId, id) {
    const s = SETS[setId];
    if (!s) return null;
    const p = s.list.find((x) => x.id === id);
    return p ? { p, setLabel: s.label } : null;
  }
  function relDue(due) {
    const diff = due - Date.now();
    const d = Math.round(diff / (24 * 3600 * 1000));
    if (diff <= 0) return "due now";
    if (d <= 0) return "due today";
    if (d === 1) return "in 1 day";
    return "in " + d + " days";
  }

  function rowHTML(setId, id, extra) {
    const info = lookup(setId, id);
    if (!info) return "";
    const { p, setLabel } = info;
    const D = { Easy: "d-easy", Medium: "d-med", Hard: "d-hard" };
    return `<a class="dash-row" href="playground.html?set=${setId}&id=${id}">
      <span class="dr-num">${String(p.num).padStart(2, "0")}</span>
      <span class="dr-title">${esc(p.title)}</span>
      <span class="diff ${D[p.difficulty]}">${p.difficulty}</span>
      <span class="chip">${esc(p.category)}</span>
      <span class="dr-set">${setLabel}</span>
      ${extra || ""}
      <span class="dr-go">Solve →</span>
    </a>`;
  }

  function statCard(num, label, cls) {
    return `<div class="dash-card ${cls || ""}"><span class="dc-num">${num}</span><span class="dc-label">${label}</span></div>`;
  }

  function render() {
    const P = window.Progress;
    const sum = P.summary();
    const all = collectAll();
    const solved = all.filter((r) => r.rec.solved);
    const review = all.filter((r) => r.rec.review);
    const starred = all.filter((r) => r.rec.star);
    const due = P.dueList();

    const pct = Math.round((solved.length / totalProblems) * 100);

    $("#dash-stats").innerHTML = `
      ${statCard(`${solved.length}<span class="dc-of">/${totalProblems}</span>`, "Solved", "dc-solved")}
      ${statCard(due.length, "Due for review", "dc-due")}
      ${statCard(review.length, "Needs review", "dc-review")}
      ${statCard(starred.length, "Starred", "dc-star")}
      <div class="dash-progress">
        <div class="dp-track"><div class="dp-fill" style="width:${pct}%"></div></div>
        <span class="dp-label">${pct}% of ${totalProblems} problems solved</span>
      </div>`;

    let html = "";

    if (due.length) {
      html += section("↻ Due for review", "Spaced repetition brings these back so they stick.",
        due.map((d) => rowHTML(d.setId, d.id, `<span class="dr-due">${relDue(d.due)}</span>`)).join(""));
    }
    if (starred.length) {
      html += section("★ Starred", "Problems you flagged to revisit.",
        starred.map((r) => rowHTML(r.setId, r.id, `<span class="dr-star">★</span>`)).join(""));
    }
    if (review.length) {
      html += section("Needs another look", "Latest attempt didn't pass all tests.",
        review.map((r) => rowHTML(r.setId, r.id)).join(""));
    }
    if (solved.length) {
      html += section(`✓ Solved (${solved.length})`, "Great work — keep the streak going.",
        solved.slice().sort((a, b) => (b.rec.lastAt || 0) - (a.rec.lastAt || 0)).map((r) => rowHTML(r.setId, r.id)).join(""));
    }

    if (!html) {
      html = `<div class="dash-empty">
        <h3>No progress yet</h3>
        <p>Head to the <a href="playground.html">Playground</a>, solve a problem, and hit <b>✔ Submit</b>. Your solved, starred, and review items will show up here.</p>
        <a class="btn primary" href="playground.html?set=blind&id=p1">Start with Two Sum →</a>
      </div>`;
    }
    $("#dash-body").innerHTML = html;
  }

  function section(title, sub, rows) {
    return `<div class="dash-section">
      <div class="ds-head"><h2>${title}</h2><p>${sub}</p></div>
      <div class="dash-rows">${rows}</div>
    </div>`;
  }

  function collectAll() {
    // Progress has no public "all with keys" that maps set/id, so reconstruct.
    const raw = readRaw();
    const out = [];
    for (const key in raw) {
      const i = key.indexOf("/");
      out.push({ setId: key.slice(0, i), id: key.slice(i + 1), rec: raw[key] });
    }
    return out;
  }
  function readRaw() {
    try { return JSON.parse(localStorage.getItem("pf-progress-v1")) || {}; }
    catch (e) { return {}; }
  }

  function init() {
    if (!window.Progress) return;
    render();
    window.Progress.onChange(render);
    $("#dash-reset").addEventListener("click", () => {
      if (confirm("Reset ALL progress (solved, review, starred, spaced-repetition)? This cannot be undone.")) {
        localStorage.removeItem("pf-progress-v1");
        render();
      }
    });
    if (window.Shell) window.Shell.boot();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
