/* MOCK INTERVIEW — a timed session that drops you into the real Playground
   (via iframe) with a countdown, question flow, and an end summary. */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const DATA = {
    blind: { label: "Blind 80", list: window.PROBLEMS || [] },
    microsoft: { label: "Microsoft", list: window.MS_PROBLEMS || [] },
    fresh: { label: "Fresh 20", list: window.FRESH_PROBLEMS || [] },
  };

  let session = null, timer = null;

  function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; }

  function pool(setKey, diff) {
    let items = [];
    if (setKey === "any") items = Object.entries(DATA).flatMap(([k, v]) => v.list.map((p) => ({ set: k, p })));
    else items = (DATA[setKey].list || []).map((p) => ({ set: setKey, p }));
    if (diff !== "Any") items = items.filter((x) => x.p.difficulty === diff);
    return items;
  }

  function renderSetup() {
    clearInterval(timer);
    document.body.classList.remove("mock-active");
    $("#mock-root").innerHTML = `
      <div class="mock-setup">
        <h2>Set up your mock</h2>
        <div class="ms-field">
          <label>Problem set</label>
          <div class="ms-opts" data-group="set">
            <button class="ms-opt active" data-v="microsoft">Microsoft</button>
            <button class="ms-opt" data-v="blind">Blind 80</button>
            <button class="ms-opt" data-v="fresh">Fresh 20</button>
            <button class="ms-opt" data-v="any">Any</button>
          </div>
        </div>
        <div class="ms-field">
          <label>Difficulty</label>
          <div class="ms-opts" data-group="diff">
            <button class="ms-opt active" data-v="Any">Any</button>
            <button class="ms-opt" data-v="Easy">Easy</button>
            <button class="ms-opt" data-v="Medium">Medium</button>
            <button class="ms-opt" data-v="Hard">Hard</button>
          </div>
        </div>
        <div class="ms-field">
          <label>Minutes per question</label>
          <div class="ms-opts" data-group="mins">
            <button class="ms-opt" data-v="20">20</button>
            <button class="ms-opt active" data-v="35">35</button>
            <button class="ms-opt" data-v="45">45</button>
          </div>
        </div>
        <div class="ms-field">
          <label>Questions</label>
          <div class="ms-opts" data-group="count">
            <button class="ms-opt active" data-v="1">1</button>
            <button class="ms-opt" data-v="2">2</button>
            <button class="ms-opt" data-v="3">3</button>
          </div>
        </div>
        <p class="ms-note">Interview discipline: state your approach and complexity out loud before coding, and don't open Hints until you're truly stuck.</p>
        <button id="mock-start" class="btn primary lg">Start mock →</button>
        <p id="mock-warn" class="ms-warn"></p>
      </div>`;

    $("#mock-root").querySelectorAll(".ms-opts").forEach((grp) => {
      grp.addEventListener("click", (e) => {
        const b = e.target.closest(".ms-opt"); if (!b) return;
        grp.querySelectorAll(".ms-opt").forEach((x) => x.classList.toggle("active", x === b));
      });
    });
    $("#mock-start").addEventListener("click", start);
  }

  function pick(grp) { return $(`.ms-opts[data-group="${grp}"] .ms-opt.active`).getAttribute("data-v"); }

  function start() {
    const setKey = pick("set"), diff = pick("diff"), mins = +pick("mins"), count = +pick("count");
    let items = shuffle(pool(setKey, diff));
    if (!items.length) { $("#mock-warn").textContent = "No problems match that filter — try Any difficulty."; return; }
    items = items.slice(0, count);
    session = { items, mins, i: 0, solved: 0, results: [] };
    runQuestion();
  }

  function runQuestion() {
    const { items, mins, i } = session;
    const { set, p } = items[i];
    session.remaining = mins * 60;
    session.paused = false;
    document.body.classList.add("mock-active");
    $("#mock-root").innerHTML = `
      <div class="mock-run">
        <div class="mock-bar">
          <span class="mb-q">Q${i + 1} / ${items.length}</span>
          <span class="mb-title">${esc(p.title)} · <span class="diff ${diffClass(p.difficulty)}">${p.difficulty}</span></span>
          <span class="mb-timer" id="mb-timer">--:--</span>
          <button class="mb-btn" id="mb-pause">Pause</button>
          <button class="mb-btn" id="mb-solved">✓ I solved it</button>
          <button class="mb-btn" id="mb-skip">Skip / Next</button>
          <button class="mb-btn danger" id="mb-end">End</button>
        </div>
        <iframe class="mock-frame" id="mock-frame" src="playground.html?set=${set}&id=${p.id}&mock=1" title="Coding editor"></iframe>
      </div>`;
    $("#mb-pause").addEventListener("click", togglePause);
    $("#mb-solved").addEventListener("click", () => nextQuestion(true));
    $("#mb-skip").addEventListener("click", () => nextQuestion(false));
    $("#mb-end").addEventListener("click", finish);
    tick(true);
    clearInterval(timer);
    timer = setInterval(tick, 1000);
  }

  function tick(first) {
    if (!session) return;
    if (!session.paused && !first) session.remaining--;
    const t = $("#mb-timer"); if (!t) return;
    const r = Math.max(0, session.remaining);
    const m = String((r / 60) | 0).padStart(2, "0");
    const s = String(r % 60).padStart(2, "0");
    t.textContent = `${m}:${s}`;
    t.classList.toggle("warn", r <= 300 && r > 60);
    t.classList.toggle("crit", r <= 60);
    if (r <= 0 && !session.timeUp) { session.timeUp = true; timesUp(); }
  }

  function togglePause() {
    session.paused = !session.paused;
    $("#mb-pause").textContent = session.paused ? "Resume" : "Pause";
  }

  function timesUp() {
    const f = $("#mock-frame");
    const over = document.createElement("div");
    over.className = "mock-timesup";
    over.innerHTML = `<div class="mt-box"><h3>⏰ Time's up</h3><p>In a real loop you'd wrap up now. Finish your thought, then move on.</p>
      <button class="btn primary" id="mt-next">Next / Finish</button>
      <button class="btn ghost" id="mt-more">+5 more minutes</button></div>`;
    $(".mock-run").appendChild(over);
    $("#mt-next").addEventListener("click", () => nextQuestion(false));
    $("#mt-more").addEventListener("click", () => { session.remaining = 300; session.timeUp = false; over.remove(); });
  }

  function nextQuestion(solved) {
    if (!session) return;
    session.results.push({ item: session.items[session.i], solved });
    if (solved) session.solved++;
    session.i++;
    if (session.i >= session.items.length) return finish();
    runQuestion();
  }

  function finish() {
    clearInterval(timer);
    document.body.classList.remove("mock-active");
    // capture the last in-progress question if not recorded
    if (session && session.results.length < session.i + 1 && session.i < session.items.length) {
      session.results.push({ item: session.items[session.i], solved: false });
    }
    const solved = session ? session.solved : 0;
    const total = session ? session.items.length : 0;
    const rows = (session ? session.results : []).map((r) =>
      `<a class="mock-res-row" href="playground.html?set=${r.item.set}&id=${r.item.p.id}">
         <span class="${r.solved ? "mr-ok" : "mr-no"}">${r.solved ? "✓" : "•"}</span>
         <span>${esc(r.item.p.title)}</span>
         <span class="diff ${diffClass(r.item.p.difficulty)}">${r.item.p.difficulty}</span>
         <span class="mr-go">Review →</span>
       </a>`).join("");
    $("#mock-root").innerHTML = `
      <div class="mock-summary">
        <h2>Mock complete</h2>
        <p class="mock-score">${solved} / ${total} solved in time</p>
        <div class="mock-res">${rows}</div>
        <div class="mock-tips">
          <h4>Debrief like an interviewer would</h4>
          <ul>
            <li>Did you state the approach and Big-O <b>before</b> coding?</li>
            <li>Did you name the <a href="patterns.html">pattern</a> quickly?</li>
            <li>Did you test edge cases (empty, single, duplicates)?</li>
            <li>Anything you skipped → it's now in your <a href="dashboard.html">review list</a>.</li>
          </ul>
        </div>
        <button id="mock-again" class="btn primary">New mock</button>
      </div>`;
    $("#mock-again").addEventListener("click", renderSetup);
    session = null;
  }

  function diffClass(d) { return { Easy: "d-easy", Medium: "d-med", Hard: "d-hard" }[d] || ""; }

  function init() {
    if (!$("#mock-root")) return;
    renderSetup();
    if (window.Shell) window.Shell.boot();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
