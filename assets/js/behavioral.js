/* BEHAVIORAL — Microsoft-focused behavioral prep: values, the STAR method,
   a question bank, and an interactive STAR answer builder (saved locally). */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const VALUES = [
    ["Growth mindset", "Show you learn from failure and feedback, and get better fast. Microsoft prizes 'learn-it-all' over 'know-it-all'."],
    ["Customer obsession", "Frame decisions around user/customer impact, not just technical elegance."],
    ["One Microsoft / collaboration", "Demonstrate working across teams, sharing credit, and resolving disagreement constructively."],
    ["Diversity & inclusion", "Show you make space for other voices and perspectives."],
    ["Making a difference / impact", "Quantify the outcome — what changed because of you?"],
  ];

  const STAR = [
    ["Situation", "Set the scene briefly — the context and stakes. 1–2 sentences."],
    ["Task", "Your specific responsibility or the problem you owned."],
    ["Action", "What YOU did (say 'I', not 'we'). The bulk of the answer — decisions, trade-offs, how you influenced others."],
    ["Result", "The outcome, quantified if possible, plus what you learned."],
  ];

  const QUESTIONS = [
    ["Growth mindset & learning", [
      "Tell me about a time you failed. What did you learn?",
      "Describe a time you received difficult feedback and how you responded.",
      "Tell me about a time you had to learn something new quickly.",
      "Describe a mistake you made and how you handled it.",
    ]],
    ["Collaboration & conflict", [
      "Tell me about a disagreement with a teammate and how you resolved it.",
      "Describe working with a difficult stakeholder or coworker.",
      "Tell me about a time you influenced a decision without formal authority.",
      "Describe a time you gave someone critical feedback.",
    ]],
    ["Ownership & impact", [
      "Tell me about your most impactful project.",
      "Describe a time you went above and beyond what was required.",
      "Tell me about a time you took ownership of a problem no one else would.",
      "Describe a time you improved a process or system.",
    ]],
    ["Ambiguity & prioritization", [
      "Tell me about a time you worked with unclear or changing requirements.",
      "Describe how you handled competing deadlines or priorities.",
      "Tell me about a decision you made without complete information.",
      "Describe a time you had to say no or push back.",
    ]],
    ["Leadership & mentorship", [
      "Tell me about a time you led a project or initiative.",
      "Describe a time you mentored or helped a teammate grow.",
      "Tell me about a time you motivated a team through a hard stretch.",
    ]],
    ["Motivation", [
      "Why Microsoft?",
      "What are you looking for in your next role?",
      "Tell me about yourself.",
    ]],
  ];

  const KEY = "pf-star-answers";
  function readAll() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
  function writeAll(o) { localStorage.setItem(KEY, JSON.stringify(o)); }

  function renderStatic() {
    $("#bh-values").innerHTML = VALUES.map(([t, d]) =>
      `<div class="bh-value"><h4>${esc(t)}</h4><p>${esc(d)}</p></div>`).join("");

    $("#bh-star").innerHTML = STAR.map(([t, d], i) =>
      `<div class="bh-star-step"><span class="bh-star-let">${t[0]}</span><div><h4>${esc(t)}</h4><p>${esc(d)}</p></div></div>`).join("");

    const allQ = [];
    $("#bh-bank").innerHTML = QUESTIONS.map(([theme, qs]) => {
      const items = qs.map((q) => { allQ.push(q); return `<li><button class="bh-q" data-q="${esc(q)}">${esc(q)}</button></li>`; }).join("");
      return `<div class="bh-theme"><h3>${esc(theme)}</h3><ul>${items}</ul></div>`;
    }).join("");

    const sel = $("#bh-select");
    sel.innerHTML = allQ.map((q) => `<option value="${esc(q)}">${esc(q)}</option>`).join("");
  }

  function loadBuilder(q) {
    const data = readAll()[q] || {};
    $("#bh-select").value = q;
    STAR.forEach(([label]) => { $("#star-" + label.toLowerCase()).value = data[label] || ""; });
    updatePreview();
  }

  function collect() {
    const q = $("#bh-select").value;
    const rec = {};
    STAR.forEach(([label]) => { rec[label] = $("#star-" + label.toLowerCase()).value.trim(); });
    return { q, rec };
  }

  function save() {
    const { q, rec } = collect();
    const all = readAll(); all[q] = rec; writeAll(all);
    const btn = $("#bh-save"); btn.textContent = "Saved ✓"; setTimeout(() => (btn.textContent = "Save answer"), 1200);
  }

  function updatePreview() {
    const { rec } = collect();
    const parts = STAR.map(([label]) => rec[label] ? `<p><b>${label[0]}:</b> ${esc(rec[label])}</p>` : "").join("");
    const filled = STAR.filter(([l]) => rec[l]).length;
    $("#bh-preview").innerHTML = parts || `<p class="bh-empty">Fill in the four parts above and your answer assembles here.</p>`;
    $("#bh-meter").textContent = `${filled}/4 parts`;
  }

  function builder() {
    $("#bh-builder").innerHTML = `
      <div class="bh-build-head">
        <label>Practice question</label>
        <select id="bh-select" class="bh-sel"></select>
      </div>
      <div class="bh-fields">
        ${STAR.map(([label, hint]) => `
          <div class="bh-field">
            <label>${label} <span>${esc(hint)}</span></label>
            <textarea id="star-${label.toLowerCase()}" rows="${label === "Action" ? 4 : 2}" placeholder="${esc(label)}…"></textarea>
          </div>`).join("")}
      </div>
      <div class="bh-build-bar">
        <button id="bh-save" class="btn primary">Save answer</button>
        <button id="bh-copy" class="btn ghost">Copy</button>
        <span id="bh-meter" class="bh-meter">0/4 parts</span>
      </div>
      <div class="bh-preview-wrap"><h4>Your STAR answer</h4><div id="bh-preview" class="bh-preview"></div></div>`;
  }

  function init() {
    if (!$("#bh-builder")) return;
    builder();
    renderStatic();
    const first = QUESTIONS[0][1][0];
    loadBuilder(first);

    $("#bh-builder").addEventListener("input", updatePreview);
    $("#bh-select").addEventListener("change", (e) => loadBuilder(e.target.value));
    $("#bh-save").addEventListener("click", save);
    $("#bh-copy").addEventListener("click", () => {
      const { rec } = collect();
      const text = STAR.map(([l]) => rec[l] ? `${l}: ${rec[l]}` : "").filter(Boolean).join("\n\n");
      navigator.clipboard && navigator.clipboard.writeText(text);
      const b = $("#bh-copy"); b.textContent = "Copied ✓"; setTimeout(() => (b.textContent = "Copy"), 1200);
    });
    $("#bh-bank").addEventListener("click", (e) => {
      const b = e.target.closest(".bh-q");
      if (b) { loadBuilder(b.getAttribute("data-q")); document.querySelector("#bh-builder").scrollIntoView({ behavior: "smooth", block: "start" }); }
    });
    if (window.Shell) window.Shell.boot();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
