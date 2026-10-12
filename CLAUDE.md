# Ionic Storm — notes for Claude

## Every new graded review must show a completion code

Any new built-in review with a saved score (a `js/activities/*-review.js` file) must
show the student a completion code on its score/summary screen, so the teacher can
match it against the Sheet during class. Existing reviews before Chapter 4 are
intentionally left without it.

The code itself is automatic: `Storage.saveProgress` (js/storage.js) mints one when a
record is saved with `status: 'completed'` and no `code`, and the backend stores it in
the `CompletionCode` column. A new review only has to display it. Copy the pattern in
`renderQuizSummary` in js/activities/moving-electrons-review.js:

- If `ctx.getProgress().code` exists, show it (label + `.me-code` style box).
- If the record is completed but has no code, show a **Show my code** button that
  re-saves the same record (`ctx.saveProgress(Object.assign({}, progress))`) and re-renders.
- A retake must reset to `status: 'in_progress'` (no code) so each completion gets a new one.
- If the review has an EN/ES toggle, translate the two labels.

Deploying: `python3 apps-script/build.py --deploy` (see README). Don't deploy or push
unfinished work (e.g. unit1-review) — confirm with the user first.
