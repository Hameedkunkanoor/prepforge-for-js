/* BIG-O QUIZ — read a snippet, pick its time complexity. Builds the
   habit of analyzing cost, which interviewers always probe. */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const OPTIONS = ["O(1)", "O(log n)", "O(n)", "O(n log n)", "O(n²)", "O(n³)", "O(2ⁿ)", "O(n!)"];

  const Q = [
    { code: "for x in nums:\n    total += x", a: "O(n)", why: "One pass over n elements." },
    { code: "for i in range(n):\n    for j in range(n):\n        grid[i][j] = 0", a: "O(n²)", why: "Nested loops, each n → n·n." },
    { code: "lo, hi = 0, len(a) - 1\nwhile lo <= hi:\n    mid = (lo + hi) // 2\n    if a[mid] == t: return mid\n    elif a[mid] < t: lo = mid + 1\n    else: hi = mid - 1", a: "O(log n)", why: "The search space halves every step." },
    { code: "for x in a:\n    seen.add(x)\nfor x in b:\n    if x in seen:\n        out.append(x)", a: "O(n)", why: "Two separate O(n) passes → still linear." },
    { code: "i = 1\nwhile i < n:\n    work()\n    i *= 2", a: "O(log n)", why: "i doubles, so it hits n after log₂n steps." },
    { code: "def fib(n):\n    if n < 2: return n\n    return fib(n-1) + fib(n-2)", a: "O(2ⁿ)", why: "Each call branches into two — exponential without memoization." },
    { code: "a.sort()\nfor x in a:\n    print(x)", a: "O(n log n)", why: "Sort dominates the linear scan." },
    { code: "for x in nums:\n    if target - x in seen:  # hash set\n        return True\n    seen.add(x)", a: "O(n)", why: "n iterations × O(1) hash lookups." },
    { code: "for i in range(n):\n    for j in range(n):\n        for k in range(n):\n            f(i, j, k)", a: "O(n³)", why: "Three nested n-loops." },
    { code: "x = a * b + c\nreturn x % 7", a: "O(1)", why: "Fixed number of operations, independent of input size." },
    { code: "for i in range(n):\n    for j in range(i, n):\n        pair(i, j)", a: "O(n²)", why: "n + (n-1) + ... + 1 ≈ n²/2 → O(n²)." },
    { code: "def merge_sort(a):\n    if len(a) <= 1: return a\n    m = len(a)//2\n    l = merge_sort(a[:m]); r = merge_sort(a[m:])\n    return merge(l, r)   # merge is O(n)", a: "O(n log n)", why: "log n levels of splitting × O(n) merge per level." },
    { code: "def perms(a, path):\n    if not a: out.append(path); return\n    for i in range(len(a)):\n        perms(a[:i]+a[i+1:], path+[a[i]])", a: "O(n!)", why: "n choices, then n-1, then n-2 … = n! permutations." },
    { code: "import heapq\nh = []\nfor x in nums:\n    heapq.heappush(h, x)", a: "O(n log n)", why: "n pushes, each O(log n)." },
    { code: "for i in range(n):\n    for j in range(100):\n        step(i, j)", a: "O(n)", why: "The inner loop is a constant 100 → drops out." },
    { code: "l, r = 0, len(a) - 1\nwhile l < r:\n    if a[l] + a[r] == t: return True\n    elif a[l] + a[r] < t: l += 1\n    else: r -= 1", a: "O(n)", why: "Two pointers meet after at most n steps." },
    { code: "s = set(nums)\nreturn len(s)", a: "O(n)", why: "Building the set scans all n elements once." },
    { code: "for i in range(n):\n    x = binary_search(a, i)   # O(log n)", a: "O(n log n)", why: "n iterations × O(log n) search each." },
  ];

  let deck = [], idx = 0, score = 0, answered = false;
  const best = () => Number(localStorage.getItem("pf-bigo-best") || 0);
  function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; }

  function choices(correct) {
    const others = shuffle(OPTIONS.filter((o) => o !== correct)).slice(0, 3);
    return shuffle([correct, ...others]);
  }

  function render() {
    answered = false;
    const q = deck[idx];
    const opts = choices(q.a);
    $("#quiz-card").innerHTML = `
      <div class="drill-meta">
        <span class="drill-count">Question ${idx + 1} / ${deck.length}</span>
        <span class="drill-score">Score ${score} · Best ${best()}</span>
      </div>
      <p class="drill-ask">What is the time complexity?</p>
      <div class="code-wrap">
        <div class="code-bar"><span class="dot r"></span><span class="dot y"></span><span class="dot g"></span><span class="code-lang">python</span></div>
        <pre class="code-block"><code class="language-python">${esc(q.code)}</code></pre>
      </div>
      <div class="drill-opts bigo-opts">
        ${opts.map((o) => `<button class="drill-opt" data-opt="${esc(o)}">${esc(o)}</button>`).join("")}
      </div>
      <div class="drill-feedback" id="quiz-feedback"></div>
      <div class="drill-nav"><button id="quiz-next" class="btn primary" disabled>Next →</button></div>`;
    if (window.Prism) window.Prism.highlightAll();
  }

  function answer(btn) {
    if (answered) return;
    answered = true;
    const q = deck[idx];
    const chosen = btn.getAttribute("data-opt");
    const ok = chosen === q.a;
    if (ok) score++;
    document.querySelectorAll(".drill-opt").forEach((b) => {
      b.disabled = true;
      const v = b.getAttribute("data-opt");
      if (v === q.a) b.classList.add("opt-correct");
      else if (v === chosen) b.classList.add("opt-wrong");
    });
    $("#quiz-feedback").innerHTML = `<div class="dfb ${ok ? "dfb-ok" : "dfb-no"}"><b>${ok ? "✓ Correct" : "✗ Not quite"}</b> — it's <b>${esc(q.a)}</b>. ${esc(q.why)}</div>`;
    $("#quiz-next").disabled = false;
    if (score > best()) localStorage.setItem("pf-bigo-best", String(score));
  }

  function next() { idx++; if (idx >= deck.length) return finish(); render(); }

  function finish() {
    const pct = Math.round((score / deck.length) * 100);
    $("#quiz-card").innerHTML = `<div class="drill-done">
      <h2>${score} / ${deck.length} (${pct}%)</h2>
      <p>${pct >= 80 ? "Complexity analysis is second nature — great." : "Review: nested loops multiply, sequential loops add, halving is log, doubling recursion is exponential."}</p>
      <button id="quiz-restart" class="btn primary">Run again</button>
    </div>`;
    $("#quiz-restart").addEventListener("click", start);
  }

  function start() { deck = shuffle(Q); idx = 0; score = 0; render(); }

  function init() {
    if (!$("#quiz-card")) return;
    $("#quiz-card").addEventListener("click", (e) => {
      const opt = e.target.closest(".drill-opt");
      if (opt) return answer(opt);
      if (e.target.id === "quiz-next") return next();
    });
    start();
    if (window.Shell) window.Shell.boot();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
