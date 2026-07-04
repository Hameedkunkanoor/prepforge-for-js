/* =====================================================================
   PROGRESS — a tiny localStorage-backed tracker shared across pages.
   Records per-problem status (solved / review / starred), attempt
   history, and a Leitner-style spaced-repetition schedule.
   Exposes window.Progress.
   ===================================================================== */
(function () {
  "use strict";
  const KEY = "pf-progress-v1";
  const DAY = 24 * 60 * 60 * 1000;
  // Leitner boxes → days until the card is due again.
  const INTERVALS = [1, 3, 7, 16, 35];

  function read() {
    try { return JSON.parse(localStorage.getItem(KEY)) || {}; }
    catch (e) { return {}; }
  }
  function write(o) { localStorage.setItem(KEY, JSON.stringify(o)); }
  function k(setId, id) { return setId + "/" + id; }

  const Progress = {
    /* raw record for one problem */
    get(setId, id) { return read()[k(setId, id)] || {}; },

    set(setId, id, patch) {
      const o = read();
      const key = k(setId, id);
      o[key] = Object.assign({}, o[key] || {}, patch);
      write(o);
      Progress._emit();
      return o[key];
    },

    /* mark an attempt result from the Submit grader */
    markAttempt(setId, id, passed) {
      const rec = this.get(setId, id);
      const now = Date.now();
      let box = rec.box || 0;
      if (passed) {
        box = Math.min(box + 1, INTERVALS.length - 1);
        return this.set(setId, id, {
          solved: true,
          review: false,
          box,
          due: now + INTERVALS[box] * DAY,
          lastResult: "pass",
          lastAt: now,
          attempts: (rec.attempts || 0) + 1,
        });
      }
      box = 0;
      return this.set(setId, id, {
        review: true,
        box,
        due: now + INTERVALS[0] * DAY,
        lastResult: "fail",
        lastAt: now,
        attempts: (rec.attempts || 0) + 1,
      });
    },

    markSolved(setId, id) { return this.set(setId, id, { solved: true, review: false }); },
    markReview(setId, id, on) { return this.set(setId, id, { review: on !== false }); },
    toggleStar(setId, id) {
      const rec = this.get(setId, id);
      return this.set(setId, id, { star: !rec.star });
    },
    clear(setId, id) {
      const o = read(); delete o[k(setId, id)]; write(o); this._emit();
    },

    /* short status token for badges: solved | review | star | "" */
    statusOf(setId, id) {
      const r = this.get(setId, id);
      if (r.solved) return "solved";
      if (r.review) return "review";
      return "";
    },

    /* aggregate counts, optionally scoped to a set */
    summary(setId) {
      const o = read();
      let solved = 0, review = 0, star = 0, total = 0, due = 0;
      const now = Date.now();
      for (const key in o) {
        if (setId && key.indexOf(setId + "/") !== 0) continue;
        const r = o[key]; total++;
        if (r.solved) solved++;
        if (r.review) review++;
        if (r.star) star++;
        if (r.due && r.due <= now && (r.solved || r.review)) due++;
      }
      return { solved, review, star, tracked: total, due };
    },

    /* problems due for spaced-repetition review, soonest first */
    dueList() {
      const o = read();
      const now = Date.now();
      const out = [];
      for (const key in o) {
        const r = o[key];
        if (r.due && r.due <= now) {
          const [setId, id] = key.split("/");
          out.push({ setId, id, due: r.due, box: r.box || 0, star: !!r.star });
        }
      }
      return out.sort((a, b) => a.due - b.due);
    },

    /* simple pub/sub so pages can live-update */
    _subs: [],
    onChange(fn) { this._subs.push(fn); },
    _emit() { this._subs.forEach((fn) => { try { fn(); } catch (e) {} }); },
  };

  window.Progress = Progress;
})();
