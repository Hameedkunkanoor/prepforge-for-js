/* PLAYGROUND — LeetCode-style editor + in-browser Python (Pyodide) */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const PROBS = window.PROBLEMS || [];
  let current = new URLSearchParams(location.search).get("id") || (PROBS[0] && PROBS[0].id);
  let editor = null;
  let pyodide = null;
  let pyLoading = null;

  const HELPERS =
`# --- helpers available to your code ---
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val; self.next = next
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val; self.left = left; self.right = right
class Node:
    def __init__(self, val=0, neighbors=None):
        self.val = val; self.neighbors = neighbors or []
def make_list(a):
    d = ListNode(); c = d
    for x in a: c.next = ListNode(x); c = c.next
    return d.next
def to_list(n):
    out = []
    while n: out.append(n.val); n = n.next
    return out
`;

  function problem() { return PROBS.find((p) => p.id === current) || PROBS[0]; }

  function starter(p) {
    return `${p.code}\n\n# ----- Try it here (edit freely, then Run) -----\n# Example:\n# print(${firstFuncName(p.code)}(...))\n`;
  }
  function firstFuncName(code) {
    const m = code.match(/def\s+([a-zA-Z_]\w*)/) || code.match(/class\s+([a-zA-Z_]\w*)/);
    return m ? m[1] : "solution";
  }

  /* ---------- Problem picker + description ---------- */
  function buildPicker() {
    const sel = $("#pg-select");
    sel.innerHTML = PROBS.map((p) => `<option value="${p.id}" ${p.id === current ? "selected" : ""}>${p.num}. ${p.title}</option>`).join("");
    sel.addEventListener("change", () => { current = sel.value; history.replaceState(null, "", "?id=" + current); loadProblem(); });
  }
  function renderDescription() {
    const p = problem();
    const D = { Easy: "d-easy", Medium: "d-med", Hard: "d-hard" };
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
      <a class="lc-link" href="${p.link}" target="_blank" rel="noopener">Open on LeetCode ↗</a>`;
    if (window.Prism) window.Prism.highlightAll();
  }

  /* ---------- Editor ---------- */
  function initEditor() {
    const ta = $("#pg-code");
    editor = window.CodeMirror.fromTextArea(ta, {
      mode: "python", lineNumbers: true, indentUnit: 4, tabSize: 4, indentWithTabs: false,
      theme: "material-darker", matchBrackets: true, autoCloseBrackets: true,
      extraKeys: { "Ctrl-Enter": run, "Cmd-Enter": run, Tab: (cm) => cm.replaceSelection("    ") },
    });
    editor.setSize("100%", "100%");
  }
  function loadProblem() {
    renderDescription();
    if (editor) editor.setValue(starter(problem()));
    const key = "pg-code-" + current;
    const saved = localStorage.getItem(key);
    if (saved && editor) editor.setValue(saved);
    document.title = problem().title + " · Playground · PrepForge";
  }

  /* ---------- Pyodide ---------- */
  function loadPy() {
    if (pyodide) return Promise.resolve(pyodide);
    if (pyLoading) return pyLoading;
    setStatus("Loading Python runtime… (first run only, ~5s)");
    pyLoading = window.loadPyodide().then((py) => { pyodide = py; py.runPython(HELPERS); setStatus("Python ready ✓"); return py; });
    return pyLoading;
  }

  function setStatus(t) { $("#pg-status").textContent = t; }
  function appendOut(t, cls) {
    const el = $("#pg-output");
    const span = document.createElement("span");
    if (cls) span.className = cls;
    span.textContent = t;
    el.appendChild(span);
    el.scrollTop = el.scrollHeight;
  }

  async function run() {
    const code = editor.getValue();
    localStorage.setItem("pg-code-" + current, code);
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
      const ms = Math.round(performance.now() - t0);
      setStatus(`Done in ${ms} ms ✓`);
      if (!$("#pg-output").textContent) appendOut("(no output — add print(...) to see results)\n", "muted");
    } catch (e) {
      appendOut(String(e.message || e), "err");
      setStatus("Error");
    } finally {
      $("#run-btn").disabled = false;
    }
  }

  function setupButtons() {
    $("#run-btn").addEventListener("click", run);
    $("#reset-btn").addEventListener("click", () => { editor.setValue(starter(problem())); localStorage.removeItem("pg-code-" + current); });
    $("#clear-out").addEventListener("click", () => { $("#pg-output").textContent = ""; });
    const yr = $("#year"); if (yr) yr.textContent = new Date().getFullYear();
  }

  function init() {
    if (!PROBS.length) { $("#pg-desc").textContent = "No problems loaded."; return; }
    buildPicker();
    initEditor();
    setupButtons();
    loadProblem();
    if (window.Shell) window.Shell.boot();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
