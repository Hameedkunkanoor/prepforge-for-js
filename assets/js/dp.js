/* DP hub — the universal DP recipe, recognition signs, and cards for each
   of the 9 modes (linking into the per-mode reader). */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const escA = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;");
  const MODES = window.DP_MODES || [];

  const RECIPE = [
    ["Define the state", "Put the answer into words: \"dp[i] = the best/number of… for the first i items (or ending at i).\" A crisp state is 80% of the battle."],
    ["Find the transition", "How does one state build on smaller ones? Enumerate the choices at this step and combine earlier dp values."],
    ["Set the base cases", "The smallest inputs you can answer directly — empty string, first element, capacity 0."],
    ["Decide the fill order", "Fill sub-answers before the answers that use them (bottom-up), or recurse with memoization (top-down)."],
    ["Read off the answer", "Which cell holds the final result — dp[n], dp[m][n], or a global max you tracked?"],
  ];

  const SIGNS = [
    "You're asked for a count of ways, or a min/max over a sequence of choices.",
    "A greedy choice gives wrong answers on some input.",
    "The brute-force recursion re-solves the same subproblem many times (overlapping subproblems).",
    "The optimal answer is built from optimal answers to smaller pieces (optimal substructure).",
  ];

  function recipe() {
    const steps = RECIPE.map((s, i) =>
      `<div class="dp-step"><span class="dp-step-n">${i + 1}</span><div><h4>${esc(s[0])}</h4><p>${esc(s[1])}</p></div></div>`).join("");
    const flow = `graph LR
  A["1 · State"] --> B["2 · Transition"]
  B --> C["3 · Base cases"]
  C --> D["4 · Fill order"]
  D --> E["5 · Answer"]`;
    return `<div class="dp-recipe-card">
      <h2 class="dp-h2">The DP recipe (works on every problem)</h2>
      <figure class="viz viz-mermaid"><div class="mermaid" data-src="${escA(flow)}"></div></figure>
      <div class="dp-steps">${steps}</div>
      <div class="dp-td">
        <div><b>Bottom-up (tabulation)</b> — fill an array/table from the base cases up. Fast, iterative, easy to reason about space.</div>
        <div><b>Top-down (memoization)</b> — write the natural recursion and cache results. Closer to the definition; great when the state space is sparse.</div>
      </div>
    </div>`;
  }

  function recognize() {
    return `<div class="dp-recognize-card">
      <h2 class="dp-h2">How to know it's a DP problem</h2>
      <ul class="pat-list good">${SIGNS.map((s) => `<li>${esc(s)}</li>`).join("")}</ul>
      <p class="dp-tip">Tip: if you can phrase a clean recursive relation but it recomputes overlapping pieces, add memoization — you're already doing DP.</p>
    </div>`;
  }

  function modeCards() {
    const cards = MODES.map((m) => {
      const diffs = m.problems.map((p) => p.difficulty);
      const counts = { Easy: 0, Medium: 0, Hard: 0 };
      diffs.forEach((d) => counts[d]++);
      const badges = ["Easy", "Medium", "Hard"].filter((d) => counts[d]).map((d) =>
        `<span class="diff ${d === "Easy" ? "d-easy" : d === "Medium" ? "d-med" : "d-hard"}">${counts[d]} ${d}</span>`).join("");
      return `<a class="dp-mode-card" href="dp-mode.html?id=${m.id}" style="--pc:${m.color}">
        <h3>${esc(m.name)}</h3>
        <p>${esc(m.tagline)}</p>
        <div class="dp-mode-foot"><span class="dp-count">${m.problems.length} problems</span>${badges}</div>
        <span class="dp-mode-go">Learn end-to-end →</span>
      </a>`;
    }).join("");
    const total = MODES.reduce((a, m) => a + m.problems.length, 0);
    return `<h2 class="dp-h2">The 9 DP modes · ${total} worked problems</h2><div class="dp-mode-grid">${cards}</div>
      <div class="dp-cta">
        <div>
          <h3>Ready to practice?</h3>
          <p>Every one of the ${total} problems is runnable and auto-graded in the Playground, and feeds your review queue. Or train recognition first.</p>
        </div>
        <div class="dp-cta-btns">
          <a class="btn primary" href="dp-drills.html">🎯 DP recognition drill</a>
          <a class="btn ghost" href="playground.html?set=dp&id=dp1">▶ Solve in Playground</a>
        </div>
      </div>`;
  }

  function init() {
    if (!$("#dp-modes")) return;
    $("#dp-recipe").innerHTML = recipe();
    $("#dp-recognize").innerHTML = recognize();
    $("#dp-modes").innerHTML = modeCards();
    if (window.Shell) window.Shell.boot();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
