/* PRACTICE — flashcards + quiz, generated from the course data. */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };

  /* ---------- Build source material ---------- */
  function buildCards() {
    const cards = [];
    (window.HLD_GLOSSARY || []).forEach(([k, v]) => cards.push({ front: k, back: v, tag: "Glossary" }));
    (window.HLD_DATA || []).forEach((s) =>
      (s.topics || []).forEach((t) => {
        if (t.tagline && (t.title || t.name)) cards.push({ front: t.title || t.name, back: t.tagline, tag: s.title });
      })
    );
    (window.DESIGNS || []).forEach((d) => cards.push({ front: d.title, back: d.tagline, tag: "System Design" }));
    return cards;
  }
  function buildQuiz(n) {
    const pool = (window.HLD_GLOSSARY || []).map(([k, v]) => ({ term: k, def: v }));
    if (pool.length < 4) return [];
    const picks = shuffle(pool).slice(0, n);
    return picks.map((p) => {
      const distract = shuffle(pool.filter((x) => x.term !== p.term)).slice(0, 3).map((x) => x.term);
      const options = shuffle([p.term, ...distract]);
      return { q: `Which component is described as: “${p.def}”?`, answer: p.term, options };
    });
  }

  /* ---------- Flashcards ---------- */
  let deck = [], di = 0;
  function renderCard() {
    const c = deck[di];
    $("#fc-tag").textContent = c.tag;
    $("#fc-front").textContent = c.front;
    $("#fc-back").textContent = c.back;
    $("#fc-pos").textContent = `${di + 1} / ${deck.length}`;
    $("#flashcard").classList.remove("flipped");
  }
  function setupFlashcards() {
    deck = shuffle(buildCards());
    $("#flashcard").addEventListener("click", () => $("#flashcard").classList.toggle("flipped"));
    $("#fc-next").addEventListener("click", (e) => { e.stopPropagation(); di = (di + 1) % deck.length; renderCard(); });
    $("#fc-prev").addEventListener("click", (e) => { e.stopPropagation(); di = (di - 1 + deck.length) % deck.length; renderCard(); });
    $("#fc-shuffle").addEventListener("click", () => { deck = shuffle(deck); di = 0; renderCard(); });
    document.addEventListener("keydown", (e) => {
      if (!$("#tab-cards").classList.contains("active")) return;
      if (e.key === "ArrowRight") { di = (di + 1) % deck.length; renderCard(); }
      else if (e.key === "ArrowLeft") { di = (di - 1 + deck.length) % deck.length; renderCard(); }
      else if (e.key === " ") { e.preventDefault(); $("#flashcard").classList.toggle("flipped"); }
    });
    renderCard();
  }

  /* ---------- Quiz ---------- */
  let quiz = [], qi = 0, score = 0, answered = false;
  function renderQuestion() {
    answered = false;
    const item = quiz[qi];
    $("#quiz-progress").textContent = `Question ${qi + 1} / ${quiz.length}`;
    $("#quiz-score").textContent = `Score: ${score}`;
    $("#quiz-q").textContent = item.q;
    $("#quiz-options").innerHTML = item.options
      .map((o) => `<button class="quiz-opt" data-opt="${o.replace(/"/g, "&quot;")}">${o}</button>`)
      .join("");
    $("#quiz-next").classList.add("hidden");
    $("#quiz-feedback").textContent = "";
  }
  function choose(btn) {
    if (answered) return;
    answered = true;
    const item = quiz[qi];
    const picked = btn.getAttribute("data-opt");
    $$(".quiz-opt").forEach((b) => {
      const v = b.getAttribute("data-opt");
      if (v === item.answer) b.classList.add("correct");
      else if (b === btn) b.classList.add("wrong");
      b.disabled = true;
    });
    if (picked === item.answer) { score++; $("#quiz-feedback").innerHTML = '<span class="ok">✓ Correct!</span>'; }
    else { $("#quiz-feedback").innerHTML = `<span class="no">✗ Answer: <b>${item.answer}</b></span>`; }
    $("#quiz-score").textContent = `Score: ${score}`;
    $("#quiz-next").classList.remove("hidden");
    $("#quiz-next").textContent = qi === quiz.length - 1 ? "See results" : "Next →";
  }
  function nextQuestion() {
    if (qi < quiz.length - 1) { qi++; renderQuestion(); }
    else showResults();
  }
  function showResults() {
    const pct = Math.round((score / quiz.length) * 100);
    const msg = pct >= 80 ? "Excellent! 🎉" : pct >= 50 ? "Good — keep going 💪" : "Review and retry 📚";
    $("#quiz-card").innerHTML = `<div class="quiz-results">
      <div class="qr-score">${score}<small>/ ${quiz.length}</small></div>
      <div class="qr-pct">${pct}%</div>
      <p>${msg}</p>
      <button id="quiz-restart" class="btn primary">Try again</button>
    </div>`;
    $("#quiz-restart").addEventListener("click", startQuiz);
  }
  function startQuiz() {
    quiz = buildQuiz(10); qi = 0; score = 0;
    $("#quiz-card").innerHTML = `
      <div class="quiz-top"><span id="quiz-progress"></span><span id="quiz-score"></span></div>
      <h3 id="quiz-q"></h3>
      <div id="quiz-options" class="quiz-options"></div>
      <p id="quiz-feedback" class="quiz-feedback"></p>
      <button id="quiz-next" class="btn primary hidden">Next →</button>`;
    $("#quiz-options").addEventListener("click", (e) => { const b = e.target.closest(".quiz-opt"); if (b) choose(b); });
    $("#quiz-next").addEventListener("click", nextQuestion);
    renderQuestion();
  }

  /* ---------- Tabs ---------- */
  function setupTabs() {
    $$(".ptab").forEach((t) =>
      t.addEventListener("click", () => {
        $$(".ptab").forEach((x) => x.classList.remove("active"));
        t.classList.add("active");
        const target = t.getAttribute("data-tab");
        $$(".ptab-panel").forEach((p) => p.classList.toggle("active", p.id === target));
      })
    );
  }

  function init() {
    setupTabs();
    setupFlashcards();
    startQuiz();
    window.Shell.boot();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
