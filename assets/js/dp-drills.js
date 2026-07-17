/* DP DRILLS — read a DP problem statement, identify which DP mode it is.
   Builds the recognition reflex that makes DP interviews tractable. */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const MODES = window.DP_MODES || [];

  const LABELS = MODES.map((m) => m.name);
  const ITEMS = [];
  MODES.forEach((m) => m.problems.forEach((p) =>
    ITEMS.push({ statement: p.statement, mode: m.name, modeId: m.id, title: p.title, difficulty: p.difficulty })));

  let deck = [], idx = 0, score = 0, answered = false;
  const best = () => Number(localStorage.getItem("pf-dpdrill-best") || 0);
  function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; }

  function choices(correct) {
    const others = shuffle(LABELS.filter((l) => l !== correct)).slice(0, 3);
    return shuffle([correct, ...others]);
  }

  function render() {
    answered = false;
    const it = deck[idx];
    const opts = choices(it.mode);
    const D = { Easy: "d-easy", Medium: "d-med", Hard: "d-hard" };
    $("#dpq-card").innerHTML = `
      <div class="drill-meta">
        <span class="drill-count">Question ${idx + 1} / ${deck.length}</span>
        <span class="drill-score">Score ${score} · Best ${best()}</span>
      </div>
      <div class="drill-q">
        <span class="diff ${D[it.difficulty]}">${it.difficulty}</span>
        <p class="drill-stmt">${esc(it.statement)}</p>
      </div>
      <p class="drill-ask">Which DP mode is this?</p>
      <div class="drill-opts">
        ${opts.map((o) => `<button class="drill-opt" data-opt="${esc(o)}">${esc(o)}</button>`).join("")}
      </div>
      <div class="drill-feedback" id="dpq-feedback"></div>
      <div class="drill-nav"><button id="dpq-next" class="btn primary" disabled>Next →</button></div>`;
  }

  function answer(btn) {
    if (answered) return;
    answered = true;
    const it = deck[idx];
    const chosen = btn.getAttribute("data-opt");
    const ok = chosen === it.mode;
    if (ok) score++;
    document.querySelectorAll(".drill-opt").forEach((b) => {
      b.disabled = true;
      const v = b.getAttribute("data-opt");
      if (v === it.mode) b.classList.add("opt-correct");
      else if (v === chosen) b.classList.add("opt-wrong");
    });
    $("#dpq-feedback").innerHTML = `<div class="dfb ${ok ? "dfb-ok" : "dfb-no"}">
      <b>${ok ? "✓ Correct" : "✗ Not quite"}</b> — <b>${esc(it.title)}</b> is <b>${esc(it.mode)}</b>.
      <a class="dfb-link" href="dp-mode.html?id=${it.modeId}">Open the mode →</a></div>`;
    $("#dpq-next").disabled = false;
    if (score > best()) localStorage.setItem("pf-dpdrill-best", String(score));
  }

  function next() { idx++; if (idx >= deck.length) return finish(); render(); }

  function finish() {
    const pct = Math.round((score / deck.length) * 100);
    $("#dpq-card").innerHTML = `<div class="drill-done">
      <h2>${score} / ${deck.length} (${pct}%)</h2>
      <p>${pct >= 80 ? "Strong DP radar — you classify problems fast." : "Review the modes on the DP page, then run it again. Recognizing the mode is 80% of solving it."}</p>
      <button id="dpq-restart" class="btn primary">Run again</button>
      <a class="btn ghost" href="dp.html">Open DP section</a>
    </div>`;
    $("#dpq-restart").addEventListener("click", start);
  }

  function start() { deck = shuffle(ITEMS); idx = 0; score = 0; render(); }

  function init() {
    if (!$("#dpq-card") || !ITEMS.length) return;
    $("#dpq-card").addEventListener("click", (e) => {
      const opt = e.target.closest(".drill-opt");
      if (opt) return answer(opt);
      if (e.target.id === "dpq-next") return next();
    });
    start();
    if (window.Shell) window.Shell.boot();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
