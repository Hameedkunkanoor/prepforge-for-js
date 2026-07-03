/* PLAYGROUND — LeetCode-style editor + in-browser Python (Pyodide)
   with collections, IntelliSense toggle, and snippet inserter. */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const SETS = {
    blind: window.PROBLEMS || [],
    microsoft: window.MS_PROBLEMS || [],
    fresh: window.FRESH_PROBLEMS || [],
  };
  const params = new URLSearchParams(location.search);
  let setId = SETS[params.get("set")] ? params.get("set") : "blind";
  let PROBS = SETS[setId];
  let current = params.get("id") || (PROBS[0] && PROBS[0].id);

  let editor = null, pyodide = null, pyLoading = null;
  let intelliOn = localStorage.getItem("pg-intelli") !== "off";

  const HELPERS =
`class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val; self.next = next
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val; self.left = left; self.right = right
class Node:
    def __init__(self, val=0, neighbors=None):
        self.val = val; self.neighbors = neighbors or []
        self.next = None; self.random = None
def make_list(a):
    d = ListNode(); c = d
    for x in a: c.next = ListNode(x); c = c.next
    return d.next
def to_list(n):
    out = []
    while n: out.append(n.val); n = n.next
    return out
`;

  /* ---------- Snippets ---------- */
  const SNIPPETS = {
    "for loop": "for i in range(n):\n    ",
    "for-each": "for x in items:\n    ",
    "while loop": "while condition:\n    ",
    "if / else": "if cond:\n    pass\nelse:\n    pass\n",
    "function": "def func(args):\n    return ",
    "class": "class MyClass:\n    def __init__(self):\n        self.x = 0\n",
    "list": "arr = []",
    "dict": "d = {}",
    "set": "s = set()",
    "list comprehension": "[x for x in items if x]",
    "dict comprehension": "{k: v for k, v in items}",
    "enumerate": "for i, x in enumerate(items):\n    ",
    "zip": "for a, b in zip(list1, list2):\n    ",
    "try / except": "try:\n    pass\nexcept Exception as e:\n    print(e)\n",
    "counter": "from collections import Counter\ncnt = Counter(items)",
    "defaultdict": "from collections import defaultdict\ng = defaultdict(list)",
    "deque (queue)": "from collections import deque\nq = deque()\nq.append(x)\nq.popleft()",
    "heap (priority queue)": "import heapq\nh = []\nheapq.heappush(h, x)\nheapq.heappop(h)",
    "BFS": "from collections import deque\nq = deque([start])\nseen = {start}\nwhile q:\n    node = q.popleft()\n    for nb in neighbors(node):\n        if nb not in seen:\n            seen.add(nb)\n            q.append(nb)\n",
    "DFS (recursive)": "def dfs(node, seen):\n    if node in seen:\n        return\n    seen.add(node)\n    for nb in neighbors(node):\n        dfs(nb, seen)\n",
    "binary search": "lo, hi = 0, len(arr) - 1\nwhile lo <= hi:\n    mid = (lo + hi) // 2\n    if arr[mid] == target:\n        return mid\n    elif arr[mid] < target:\n        lo = mid + 1\n    else:\n        hi = mid - 1\n",
    "two pointers": "l, r = 0, len(arr) - 1\nwhile l < r:\n    l += 1\n    r -= 1\n",
  };
  const PY_WORDS = ["def","class","for","while","if","elif","else","return","in","range","len","enumerate","zip","print","import","from","True","False","None","and","or","not","lambda","try","except","finally","with","yield","break","continue","pass","int","str","list","dict","set","tuple","float","bool","sorted","reversed","map","filter","sum","min","max","abs","round","append","pop","insert","remove","keys","values","items","get","split","join","strip","lower","upper","replace","find","index","count","add","discard","deque","Counter","defaultdict","heapq","heappush","heappop"];

  function problem() { return PROBS.find((p) => p.id === current) || PROBS[0]; }
  function firstFuncName(code) { const m = code.match(/def\s+([a-zA-Z_]\w*)/) || code.match(/class\s+([a-zA-Z_]\w*)/); return m ? m[1] : "solution"; }
  function starter(p) { return `${p.code}\n\n# ----- Try it here (edit freely, then Run) -----\n# print(${firstFuncName(p.code)}(...))\n`; }

  /* ---------- Pickers ---------- */
  function buildCollections() {
    const c = $("#pg-collection");
    c.value = setId;
    c.addEventListener("change", () => {
      setId = c.value; PROBS = SETS[setId]; current = PROBS[0] && PROBS[0].id;
      history.replaceState(null, "", `?set=${setId}&id=${current}`);
      buildPicker(); loadProblem();
    });
  }
  function buildPicker() {
    const sel = $("#pg-select");
    sel.innerHTML = PROBS.map((p) => `<option value="${p.id}" ${p.id === current ? "selected" : ""}>${p.num}. ${p.title}</option>`).join("");
    sel.onchange = () => { current = sel.value; history.replaceState(null, "", `?set=${setId}&id=${current}`); loadProblem(); };
  }

  function renderDescription() {
    const p = problem();
    const D = { Easy: "d-easy", Medium: "d-med", Hard: "d-hard" };
    const link = p.link ? `<a class="lc-link" href="${p.link}" target="_blank" rel="noopener">Open on LeetCode ↗</a>` : "";
    $("#pg-desc").innerHTML = `
      <div class="pg-desc-head">
        <span class="pnum">${String(p.num).padStart(2, "0")}</span>
        <h2>${p.title}</h2>
        <span class="diff ${D[p.difficulty]}">${p.difficulty}</span>
        <span class="chip">${p.category}</span>
      </div>
      <p class="pg-statement">${p.statement}</p>
      <div class="problem-idea"><span class="lab">Approach</span>${p.idea}</div>
      <div class="cx"><span class="cx-time">⏱ ${p.time}</span><span class="cx-space">💾 ${p.space}</span></div>
      <details class="pg-ref"><summary>Reference solution</summary>
        <pre class="code-block"><code class="language-python">${esc(p.code)}</code></pre></details>
      <details class="pg-ref"><summary>Explanation & trace</summary>
        <p>${p.explanation}</p><ol class="trace-steps">${p.trace.map((t) => `<li>${esc(t)}</li>`).join("")}</ol></details>
      ${link}`;
    if (window.Prism) window.Prism.highlightAll();
  }

  /* ---------- Editor + IntelliSense ---------- */
  function pyHint(cm) {
    const cur = cm.getCursor();
    const token = cm.getTokenAt(cur);
    const start = /[\w$]/.test(token.string) ? token.start : cur.ch;
    const word = cm.getRange(window.CodeMirror.Pos(cur.line, start), cur).toLowerCase();
    const words = new Set(PY_WORDS);
    (cm.getValue().match(/[A-Za-z_]\w{1,}/g) || []).forEach((w) => words.add(w));
    let list = [...words].filter((w) => w.toLowerCase().startsWith(word) && w.toLowerCase() !== word).sort();
    if (!word) list = PY_WORDS.slice();
    return { list: list.slice(0, 40), from: window.CodeMirror.Pos(cur.line, start), to: cur };
  }
  function updateIntelliBtn() { const b = $("#intelli-btn"); b.textContent = "IntelliSense: " + (intelliOn ? "On" : "Off"); b.classList.toggle("on", intelliOn); }

  function initEditor() {
    editor = window.CodeMirror.fromTextArea($("#pg-code"), {
      mode: "python", lineNumbers: true, indentUnit: 4, tabSize: 4, indentWithTabs: false,
      theme: "material-darker", matchBrackets: true, autoCloseBrackets: true,
      extraKeys: {
        "Ctrl-Enter": run, "Cmd-Enter": run,
        "Ctrl-Space": (cm) => cm.showHint({ hint: pyHint, completeSingle: false }),
        Tab: (cm) => cm.replaceSelection("    "),
      },
    });
    editor.setSize("100%", "100%");
    editor.on("inputRead", (cm, change) => {
      if (!intelliOn) return;
      if (/[A-Za-z_]/.test(change.text[0])) cm.showHint({ hint: pyHint, completeSingle: false });
    });
  }

  function loadProblem() {
    renderDescription();
    const saved = localStorage.getItem("pg-code-" + setId + "-" + current);
    editor.setValue(saved || starter(problem()));
    document.title = problem().title + " · Playground · PrepForge";
  }

  /* ---------- Pyodide ---------- */
  function loadPy() {
    if (pyodide) return Promise.resolve(pyodide);
    if (pyLoading) return pyLoading;
    setStatus("Loading Python… (first run only)");
    pyLoading = window.loadPyodide().then((py) => { pyodide = py; py.runPython(HELPERS); setStatus("Python ready ✓"); return py; });
    return pyLoading;
  }
  function setStatus(t) { $("#pg-status").textContent = t; }
  function appendOut(t, cls) { const el = $("#pg-output"); const s = document.createElement("span"); if (cls) s.className = cls; s.textContent = t; el.appendChild(s); el.scrollTop = el.scrollHeight; }

  async function run() {
    const code = editor.getValue();
    localStorage.setItem("pg-code-" + setId + "-" + current, code);
    $("#pg-output").textContent = "";
    $("#run-btn").disabled = true;
    setStatus("Running…");
    const t0 = performance.now();
    try {
      const py = await loadPy();
      py.setStdout({ batched: (s) => appendOut(s + "\n") });
      py.setStderr({ batched: (s) => appendOut(s + "\n", "err") });
      const stdin = $("#pg-stdin").value;
      if (stdin) py.runPython(`import sys, io\nsys.stdin = io.StringIO(${JSON.stringify(stdin)})`);
      await py.runPythonAsync(code);
      setStatus(`Done in ${Math.round(performance.now() - t0)} ms ✓`);
      if (!$("#pg-output").textContent) appendOut("(no output — add print(...) to see results)\n", "muted");
    } catch (e) {
      appendOut(String(e.message || e), "err");
      setStatus("Error");
    } finally {
      $("#run-btn").disabled = false;
    }
  }

  function setupControls() {
    $("#run-btn").addEventListener("click", run);
    $("#reset-btn").addEventListener("click", () => { editor.setValue(starter(problem())); localStorage.removeItem("pg-code-" + setId + "-" + current); });
    $("#clear-out").addEventListener("click", () => { $("#pg-output").textContent = ""; });
    $("#intelli-btn").addEventListener("click", () => { intelliOn = !intelliOn; localStorage.setItem("pg-intelli", intelliOn ? "on" : "off"); updateIntelliBtn(); editor.focus(); });
    const snip = $("#snip-select");
    snip.innerHTML = '<option value="">+ Insert…</option>' + Object.keys(SNIPPETS).map((k) => `<option value="${k}">${k}</option>`).join("");
    snip.addEventListener("change", () => { const code = SNIPPETS[snip.value]; if (code) { editor.replaceSelection(code); editor.focus(); } snip.value = ""; });
    updateIntelliBtn();
  }

  function init() {
    if (!PROBS.length) { $("#pg-desc").textContent = "No problems loaded."; return; }
    buildCollections();
    buildPicker();
    initEditor();
    setupControls();
    loadProblem();
    if (window.Shell) window.Shell.boot();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
