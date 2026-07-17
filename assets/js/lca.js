/* LCA — interactive Lowest Common Ancestor explainer.
   Renders a BST as SVG, lets you pick two nodes, and animates two methods:
   (1) the BST ordering walk, and (2) the general root-to-node paths. */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  /* ----- the tree (a classic BST) -----
            6
          /   \
         2     8
        / \   / \
       0   4 7   9
          / \
         3   5
  */
  const TREE = n(6,
    n(2, n(0), n(4, n(3), n(5))),
    n(8, n(7), n(9)));
  function n(val, left, right) { return { val, left: left || null, right: right || null }; }

  // Layout: x by in-order index, y by depth.
  const GAPX = 74, GAPY = 92, PAD = 44;
  const nodes = {};        // val -> node meta {val,x,y,left,right,parent}
  let inorder = 0, maxDepth = 0;
  (function layout(node, depth, parent) {
    if (!node) return;
    layout(node.left, depth + 1, node.val);
    const meta = { val: node.val, x: inorder * GAPX + PAD, y: depth * GAPY + PAD, left: node.left && node.left.val, right: node.right && node.right.val, parent };
    nodes[node.val] = meta; inorder++; maxDepth = Math.max(maxDepth, depth);
    layout(node.right, depth + 1, node.val);
  })(TREE, 0, null);
  const W = inorder * GAPX + PAD, H = maxDepth * GAPY + PAD + 40;
  const VALUES = Object.keys(nodes).map(Number).sort((a, b) => a - b);

  let p = 3, q = 5, mode = "bst";   // mode: "bst" | "path"
  let steps = [], step = 0, playing = null;

  /* ---------- algorithms produce step lists ---------- */
  function pathTo(target) {
    const path = [];
    let cur = TREE;
    while (cur) {
      path.push(cur.val);
      if (target === cur.val) break;
      cur = target < cur.val ? cur.left : cur.right;
    }
    return path;
  }

  function buildBstSteps() {
    const out = [];
    let cur = TREE.val;
    const visited = [];
    while (cur != null) {
      visited.push(cur);
      if (p < cur && q < cur) {
        out.push({ cur, visited: visited.slice(), note: `Both <b>${p}</b> and <b>${q}</b> are smaller than <b>${cur}</b> → the LCA must be in the <b>left</b> subtree. Go left.` });
        cur = nodes[cur].left;
      } else if (p > cur && q > cur) {
        out.push({ cur, visited: visited.slice(), note: `Both <b>${p}</b> and <b>${q}</b> are greater than <b>${cur}</b> → go <b>right</b>.` });
        cur = nodes[cur].right;
      } else {
        out.push({ cur, visited: visited.slice(), lca: cur, note: `<b>${p}</b> and <b>${q}</b> split around <b>${cur}</b> (one ≤ it, one ≥ it) — so <b>${cur}</b> is the Lowest Common Ancestor. ✓` });
        break;
      }
    }
    return out;
  }

  function buildPathSteps() {
    const pp = pathTo(p), pq = pathTo(q);
    let i = 0; while (i < pp.length && i < pq.length && pp[i] === pq[i]) i++;
    const lca = pp[i - 1];
    return [
      { paths: { p: pp }, note: `Trace the path from the root to <b>${p}</b>: ${pp.join(" → ")}.` },
      { paths: { p: pp, q: pq }, note: `Now the path to <b>${q}</b>: ${pq.join(" → ")}.` },
      { paths: { p: pp, q: pq }, common: pp.slice(0, i), lca, note: `They share the prefix <b>${pp.slice(0, i).join(" → ")}</b>. The <b>last</b> shared node is <b>${lca}</b> → that's the LCA. ✓` },
    ];
  }

  function rebuild() { steps = mode === "bst" ? buildBstSteps() : buildPathSteps(); step = 0; renderFrame(); }

  /* ---------- SVG rendering ---------- */
  function svgTree() {
    let edges = "", circles = "";
    VALUES.forEach((v) => {
      const m = nodes[v];
      [m.left, m.right].forEach((c) => {
        if (c != null) { const cm = nodes[c]; edges += `<line class="lca-edge" id="edge-${v}-${c}" x1="${m.x}" y1="${m.y}" x2="${cm.x}" y2="${cm.y}" />`; }
      });
    });
    VALUES.forEach((v) => {
      const m = nodes[v];
      circles += `<g class="lca-node" data-val="${v}" transform="translate(${m.x},${m.y})">
        <circle r="21" class="ln-circle" />
        <text class="ln-text" dy="6" text-anchor="middle">${v}</text>
        <text class="ln-tag" dy="-30" text-anchor="middle"></text>
      </g>`;
    });
    return `<svg viewBox="0 0 ${W} ${H}" class="lca-svg" preserveAspectRatio="xMidYMid meet">${edges}${circles}</svg>`;
  }

  /* ---------- frame state -> classes ---------- */
  function renderFrame() {
    const svg = $("#lca-svg-wrap");
    if (!svg) return;
    // reset
    svg.querySelectorAll(".lca-node").forEach((g) => (g.className.baseVal = "lca-node"));
    svg.querySelectorAll(".lca-edge").forEach((e) => (e.className.baseVal = "lca-edge"));
    svg.querySelectorAll(".ln-tag").forEach((t) => (t.textContent = ""));

    // always mark p and q
    tag(p, "p", "p"); tag(q, "q", "q");

    const f = steps[step] || {};
    if (mode === "bst") {
      (f.visited || []).forEach((v, i) => {
        addClass(v, "n-path");
        if (i > 0) edge((f.visited[i - 1]), v);
      });
      if (f.cur != null && f.lca == null) addClass(f.cur, "n-cur");
      if (f.lca != null) { addClass(f.lca, "n-lca"); tag(f.lca, "LCA", "lca"); }
    } else {
      if (f.paths && f.paths.p) pathEdges(f.paths.p, "e-p"), f.paths.p.forEach((v) => addClass(v, "n-pathp"));
      if (f.paths && f.paths.q) pathEdges(f.paths.q, "e-q"), f.paths.q.forEach((v) => addClass(v, "n-pathq"));
      if (f.common) f.common.forEach((v) => addClass(v, "n-common"));
      if (f.lca != null) { addClass(f.lca, "n-lca"); tag(f.lca, "LCA", "lca"); }
    }

    $("#lca-note").innerHTML = f.note || "Choose two nodes, then press ▶ Play.";
    $("#lca-count").textContent = `Step ${Math.min(step + 1, steps.length)} / ${steps.length}`;
    $("#lca-prev").disabled = step === 0;
    $("#lca-next").disabled = step >= steps.length - 1;

    function addClass(v, c) { const g = svg.querySelector(`.lca-node[data-val="${v}"]`); if (g) g.className.baseVal += " " + c; }
    function tag(v, text, cls) { const g = svg.querySelector(`.lca-node[data-val="${v}"]`); if (g) { g.className.baseVal += " n-" + cls; g.querySelector(".ln-tag").textContent = text; } }
    function edge(a, b) { const e = svg.querySelector(`#edge-${a}-${b}`) || svg.querySelector(`#edge-${b}-${a}`); if (e) e.className.baseVal += " e-on"; }
    function pathEdges(path, cls) { for (let i = 1; i < path.length; i++) { const e = svg.querySelector(`#edge-${path[i - 1]}-${path[i]}`); if (e) e.className.baseVal += " " + cls; } }
  }

  /* ---------- controls ---------- */
  function next() { if (step < steps.length - 1) { step++; renderFrame(); } else stop(); }
  function prev() { if (step > 0) { step--; renderFrame(); } }
  function stop() { if (playing) { clearInterval(playing); playing = null; $("#lca-play").textContent = "▶ Play"; } }
  function play() {
    if (playing) return stop();
    if (step >= steps.length - 1) { step = 0; renderFrame(); }
    $("#lca-play").textContent = "❚❚ Pause";
    playing = setInterval(() => { if (step >= steps.length - 1) return stop(); step++; renderFrame(); }, 1200);
  }

  function code() {
    return `# LCA in a Binary Search Tree — walk down using the ordering
def lowestCommonAncestor(root, p, q):
    node = root
    while node:
        if p.val < node.val and q.val < node.val:
            node = node.left       # both smaller → go left
        elif p.val > node.val and q.val > node.val:
            node = node.right      # both greater → go right
        else:
            return node            # they split here → LCA
# Time O(h)  ·  Space O(1)

# LCA in a general Binary Tree — recurse and bubble up
def lowestCommonAncestorBT(root, p, q):
    if not root or root is p or root is q:
        return root
    left  = lowestCommonAncestorBT(root.left, p, q)
    right = lowestCommonAncestorBT(root.right, p, q)
    if left and right:             # p and q found on different sides
        return root                # → this node is the LCA
    return left or right           # both on one side (or none)
# Time O(n)  ·  Space O(h)`;
  }

  function render() {
    $("#lca-app").innerHTML = `
      <section class="lca-controls">
        <div class="lca-picker">
          <label>Node p <select id="lca-p"></select></label>
          <label>Node q <select id="lca-q"></select></label>
        </div>
        <div class="lca-modes">
          <button class="lca-mode active" data-mode="bst">BST ordering walk</button>
          <button class="lca-mode" data-mode="path">Two paths (any tree)</button>
        </div>
      </section>

      <div class="lca-stage">
        <div id="lca-svg-wrap">${svgTree()}</div>
        <p class="lca-hint">Tip: click any two circles to set <b>p</b> and <b>q</b>.</p>
      </div>

      <div class="lca-note" id="lca-note"></div>
      <div class="lca-ctrl">
        <button class="va-btn" id="lca-prev">◀ Prev</button>
        <button class="va-btn primary" id="lca-play">▶ Play</button>
        <button class="va-btn" id="lca-next">Next ▶</button>
        <span class="va-count" id="lca-count"></span>
        <button class="va-btn" id="lca-reset">↺ Restart</button>
      </div>

      <div class="lca-legend">
        <span><i class="lg lg-p"></i> p</span>
        <span><i class="lg lg-q"></i> q</span>
        <span><i class="lg lg-cur"></i> current</span>
        <span><i class="lg lg-path"></i> visited</span>
        <span><i class="lg lg-lca"></i> LCA</span>
      </div>

      <section class="lca-explain">
        <div class="lca-card">
          <h3>Why the BST walk works</h3>
          <p>In a Binary Search Tree, everything in the left subtree is smaller than a node and everything in the right is larger. So starting at the root:</p>
          <ul>
            <li>If <b>both</b> targets are smaller than the current node, the LCA can only be to the <b>left</b>.</li>
            <li>If <b>both</b> are larger, it's to the <b>right</b>.</li>
            <li>The first time they <b>split</b> — one on each side, or one equals the node — you're standing on the LCA.</li>
          </ul>
          <p class="lca-cx">⏱ <b>O(h)</b> time (height of the tree) · 💾 <b>O(1)</b> space — no recursion needed.</p>
        </div>
        <div class="lca-card">
          <h3>General binary tree (no ordering)</h3>
          <p>Without the BST property you can't compare values, so you recurse: ask each subtree "did you find p or q?" If p turns up on the <b>left</b> and q on the <b>right</b> of a node, that node is their LCA. If both are found on one side, the LCA is deeper down that side.</p>
          <p class="lca-cx">⏱ <b>O(n)</b> time · 💾 <b>O(h)</b> recursion stack.</p>
        </div>
      </section>

      <section class="lca-code">
        <h3>The code</h3>
        <div class="code-wrap">
          <div class="code-bar"><span class="dot r"></span><span class="dot y"></span><span class="dot g"></span><span class="code-lang">python</span><button class="copy-code" title="Copy code">copy</button></div>
          <pre class="code-block"><code class="language-python">${esc(code())}</code></pre>
        </div>
      </section>

      <section class="lca-pit">
        <h3>Watch out for</h3>
        <ul class="pat-list warn">
          <li>A node can be its own ancestor — if p is an ancestor of q, the LCA is p.</li>
          <li>In the BST version, use the node's value comparisons, not object identity.</li>
          <li>Don't overshoot: the moment the targets split, stop — going further gives a deeper (wrong) node.</li>
        </ul>
        <a class="btn primary" href="playground.html?set=microsoft&id=m9">▶ Solve “Lowest Common Ancestor of a BST” →</a>
        <a class="btn ghost" href="pattern.html?id=tree-dfs">Learn the Tree DFS pattern →</a>
      </section>`;

    const selP = $("#lca-p"), selQ = $("#lca-q");
    selP.innerHTML = VALUES.map((v) => `<option value="${v}">${v}</option>`).join("");
    selQ.innerHTML = VALUES.map((v) => `<option value="${v}">${v}</option>`).join("");
    selP.value = p; selQ.value = q;
    selP.addEventListener("change", () => { p = +selP.value; stop(); rebuild(); });
    selQ.addEventListener("change", () => { q = +selQ.value; stop(); rebuild(); });

    $("#lca-app").querySelectorAll(".lca-mode").forEach((b) =>
      b.addEventListener("click", () => {
        $("#lca-app").querySelectorAll(".lca-mode").forEach((x) => x.classList.toggle("active", x === b));
        mode = b.getAttribute("data-mode"); stop(); rebuild();
      }));

    $("#lca-prev").addEventListener("click", () => { stop(); prev(); });
    $("#lca-next").addEventListener("click", () => { stop(); next(); });
    $("#lca-play").addEventListener("click", play);
    $("#lca-reset").addEventListener("click", () => { stop(); step = 0; renderFrame(); });

    // click nodes to pick p then q
    let pickP = true;
    $("#lca-svg-wrap").addEventListener("click", (e) => {
      const g = e.target.closest(".lca-node"); if (!g) return;
      const v = +g.getAttribute("data-val");
      if (pickP) { p = v; } else { q = v; }
      pickP = !pickP;
      selP.value = p; selQ.value = q;
      stop(); rebuild();
    });

    rebuild();
    if (window.Prism) window.Prism.highlightAll();
  }

  function init() {
    if (!$("#lca-app")) return;
    render();
    if (window.Shell) window.Shell.boot();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
