/* PATTERN DRILLS — read a problem statement, identify the pattern.
   Trains the single most valuable interview skill: recognition speed. */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const DATA = {
    blind: window.PROBLEMS || [],
    microsoft: window.MS_PROBLEMS || [],
    fresh: window.FRESH_PROBLEMS || [],
  };

  // Master answer labels (match the Patterns page names).
  const LABELS = [
    "Two Pointers", "Sliding Window", "Fast & Slow Pointers", "Hash Map / Set",
    "Binary Search", "BFS (Breadth-First)", "DFS & Backtracking",
    "Dynamic Programming (1D)", "Dynamic Programming (2D / grid)", "Heap / Top-K",
    "Stack / Monotonic Stack", "Intervals", "Greedy", "Topological Sort",
    "Tree DFS", "Linked List Manipulation",
  ];
  const ANCHOR = {
    "Two Pointers": "two-pointers", "Sliding Window": "sliding-window",
    "Fast & Slow Pointers": "fast-slow", "Hash Map / Set": "hashing",
    "Binary Search": "binary-search", "BFS (Breadth-First)": "bfs",
    "DFS & Backtracking": "dfs-backtracking", "Dynamic Programming (1D)": "dp-1d",
    "Dynamic Programming (2D / grid)": "dp-2d", "Heap / Top-K": "heap",
    "Stack / Monotonic Stack": "monotonic-stack", "Intervals": "intervals",
    "Greedy": "greedy", "Topological Sort": "topo-sort", "Tree DFS": "tree-dfs",
    "Linked List Manipulation": "linked-list",
  };

  // Curated (set, id) → correct pattern + one-line reason. Only unambiguous cases.
  const ITEMS = [
    ["blind", "p1", "Hash Map / Set", "Look up each number's complement in O(1)."],
    ["blind", "p3", "Hash Map / Set", "A set lets you walk consecutive runs from their start."],
    ["blind", "p4", "Two Pointers", "Shrink from both ends, moving the shorter wall."],
    ["blind", "p5", "Two Pointers", "Track left/right maxima from both ends."],
    ["blind", "p6", "Sliding Window", "Grow/shrink a window of unique characters."],
    ["blind", "p7", "Sliding Window", "Variable window that must cover all of t."],
    ["blind", "p8", "Stack / Monotonic Stack", "A stack enforces last-open-first-closed nesting."],
    ["blind", "p9", "Linked List Manipulation", "Splice nodes with a dummy head."],
    ["blind", "p11", "Binary Search", "One half is always sorted — halve the search."],
    ["blind", "p12", "Binary Search", "Compare mid to the right end to find the pivot."],
    ["blind", "p14", "BFS (Breadth-First)", "Process the tree level by level with a queue."],
    ["blind", "p15", "Tree DFS", "Pass (low, high) bounds down each subtree."],
    ["blind", "p16", "Tree DFS", "Combine left/right heights on the way up."],
    ["blind", "p19", "Topological Sort", "Finishable iff the prerequisite graph is acyclic."],
    ["blind", "p20", "DFS & Backtracking", "Mark a cell, recurse, then un-mark."],
    ["blind", "p23", "Dynamic Programming (1D)", "dp[amount] from each coin choice."],
    ["blind", "p24", "Dynamic Programming (1D)", "Rob or skip — non-adjacent max."],
    ["blind", "p25", "Greedy", "Track the farthest reachable index."],
    ["blind", "p26", "Intervals", "Sort by start, merge overlaps."],
    ["blind", "p27", "Intervals", "Before / overlapping / after the new interval."],
    ["blind", "p28", "Dynamic Programming (2D / grid)", "Each cell = above + left."],
    ["blind", "p29", "Dynamic Programming (1D)", "ways(n) = ways(n-1) + ways(n-2)."],
    ["blind", "p32", "DFS & Backtracking", "Record each path; extend with later items."],
    ["blind", "p33", "DFS & Backtracking", "Try each unused element at every position."],
    ["blind", "p34", "Heap / Top-K", "A size-k heap keeps the k largest."],
    ["blind", "p35", "Heap / Top-K", "Pick k entries with the largest counts."],
    ["blind", "p54", "Binary Search", "Walk toward the higher neighbor."],
    ["blind", "p58", "Greedy", "Reset the start when the tank goes negative."],
    ["blind", "p62", "Greedy", "The most frequent task fixes the skeleton."],
    ["blind", "p65", "Dynamic Programming (2D / grid)", "dp over prefixes of both strings."],
    ["blind", "p67", "BFS (Breadth-First)", "Shortest word ladder = BFS."],
    ["blind", "p69", "Fast & Slow Pointers", "Values-as-pointers form a cycle; Floyd finds it."],
    ["blind", "p70", "Tree DFS", "Best path through a node = left + node + right."],
    ["blind", "p72", "Dynamic Programming (2D / grid)", "dp[i][j] = s[:i] matches p[:j]."],
    ["blind", "p74", "Stack / Monotonic Stack", "Increasing stack pops to compute areas."],
    ["blind", "p77", "Topological Sort", "Kahn's algorithm gives a valid order."],
    ["blind", "p79", "Dynamic Programming (1D)", "Track running max AND min product."],
    ["blind", "p80", "Stack / Monotonic Stack", "Stack of indices with a base marker."],
    ["microsoft", "m1", "Linked List Manipulation", "Flip each node's next pointer."],
    ["microsoft", "m4", "Hash Map / Set", "Compare character counts."],
    ["microsoft", "m12", "Two Pointers", "One pointer writes non-zeros, another scans."],
  ];

  function stmt(set, id) {
    const p = (DATA[set] || []).find((x) => x.id === id);
    return p || null;
  }

  let deck = [], idx = 0, score = 0, answered = false;
  const best = () => Number(localStorage.getItem("pf-drill-best") || 0);

  function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; }

  function buildDeck() {
    deck = shuffle(ITEMS.filter((it) => stmt(it[0], it[1])));
    idx = 0; score = 0;
  }

  function choicesFor(correct) {
    const others = shuffle(LABELS.filter((l) => l !== correct)).slice(0, 3);
    return shuffle([correct, ...others]);
  }

  function renderCard() {
    answered = false;
    const it = deck[idx];
    const p = stmt(it[0], it[1]);
    const correct = it[2];
    const opts = choicesFor(correct);
    const D = { Easy: "d-easy", Medium: "d-med", Hard: "d-hard" };
    $("#drill-card").innerHTML = `
      <div class="drill-meta">
        <span class="drill-count">Question ${idx + 1} / ${deck.length}</span>
        <span class="drill-score">Score ${score} · Best ${best()}</span>
      </div>
      <div class="drill-q">
        <span class="diff ${D[p.difficulty]}">${p.difficulty}</span>
        <p class="drill-stmt">${esc(p.statement)}</p>
      </div>
      <p class="drill-ask">Which pattern would you reach for?</p>
      <div class="drill-opts">
        ${opts.map((o) => `<button class="drill-opt" data-opt="${esc(o)}">${esc(o)}</button>`).join("")}
      </div>
      <div class="drill-feedback" id="drill-feedback"></div>
      <div class="drill-nav"><button id="drill-next" class="btn primary" disabled>Next →</button></div>`;
  }

  function answer(btn) {
    if (answered) return;
    answered = true;
    const it = deck[idx];
    const correct = it[2];
    const chosen = btn.getAttribute("data-opt");
    const ok = chosen === correct;
    if (ok) score++;
    document.querySelectorAll(".drill-opt").forEach((b) => {
      const v = b.getAttribute("data-opt");
      b.disabled = true;
      if (v === correct) b.classList.add("opt-correct");
      else if (v === chosen) b.classList.add("opt-wrong");
    });
    $("#drill-feedback").innerHTML = `
      <div class="dfb ${ok ? "dfb-ok" : "dfb-no"}">
        <b>${ok ? "✓ Correct" : "✗ Not quite"}</b> — it's <b>${esc(correct)}</b>. ${esc(it[3])}
        <a class="dfb-link" href="patterns.html#${ANCHOR[correct]}">See the pattern →</a>
        <a class="dfb-link" href="playground.html?set=${it[0]}&id=${it[1]}">Solve it →</a>
      </div>`;
    $("#drill-next").disabled = false;
    if (score > best()) localStorage.setItem("pf-drill-best", String(score));
  }

  function next() {
    idx++;
    if (idx >= deck.length) return finish();
    renderCard();
  }

  function finish() {
    const pct = Math.round((score / deck.length) * 100);
    $("#drill-card").innerHTML = `
      <div class="drill-done">
        <h2>${score} / ${deck.length} correct (${pct}%)</h2>
        <p>${pct >= 80 ? "Sharp pattern radar — you're interview-ready on recognition." : pct >= 55 ? "Solid. Review the ones you missed on the Patterns page." : "Keep drilling — skim the Patterns cheat-sheet, then run it again."}</p>
        <button id="drill-restart" class="btn primary">Run again</button>
        <a class="btn ghost" href="patterns.html">Open Patterns</a>
      </div>`;
    $("#drill-restart").addEventListener("click", start);
  }

  function start() { buildDeck(); renderCard(); }

  function init() {
    if (!$("#drill-card")) return;
    $("#drill-card").addEventListener("click", (e) => {
      const opt = e.target.closest(".drill-opt");
      if (opt) return answer(opt);
      if (e.target.id === "drill-next") return next();
    });
    start();
    if (window.Shell) window.Shell.boot();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
