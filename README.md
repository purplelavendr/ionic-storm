# Ionic Storm — Chemistry Class Hub

A landing page for students to complete built-in reviews and linked simulations,
with progress saved so they can pick up where they left off, and reported back
to you in a Google Sheet.

Live site: [https://purplelavendr.github.io/ionic-storm/](https://purplelavendr.github.io/ionic-storm/)

## How it works

- A student opens the site, picks their **class period**, then picks their
  **name** from that period's roster (their browser remembers this after
  that, so it's normally a one-time thing per device).
- The dashboard lists units and activities with a status badge: **Not
  Started**, **In Progress**, or **Completed** (with score, for reviews).
- Progress saves automatically after every question/click — no "save" button
  needed, and a half-finished review picks back up at the right question,
  even on a different computer (as long as they pick the same period + name).
- Every save is also sent to a Google Sheet, which is your live gradebook /
  progress report. Just open the Sheet any time.

There's no login system — a student is identified by the roster entry they
pick. If a student doesn't see their name (a schedule change, a typo in the
roster, etc.), there's a "My name isn't listed" fallback that lets them type
it in — they still show up in that period's tab so you can catch the gap.

## One-time setup: the progress backend (Google Sheet)

This only needs to be done once, by you.

1. Go to [sheets.google.com](https://sheets.google.com) and create a new,
   blank spreadsheet. Name it something like "Ionic Storm — Progress".
2. In the menu, go to **Extensions > Apps Script**. A new tab opens with a
   code editor and a default `Code.gs` file.
3. Delete everything in that editor and paste in the entire contents of
   [`apps-script/Code.gs`](apps-script/Code.gs) from this project.
4. Click the **Save** icon (or Ctrl/Cmd+S).
5. Click **Deploy > New deployment**.
   - Click the gear icon next to "Select type" and choose **Web app**.
   - Description: anything (e.g. "Ionic Storm backend").
   - Execute as: **Me**.
   - Who has access: **Anyone**.
   - Click **Deploy**.
6. Google will ask you to authorize the script (it's yours, so this is
   expected) — click through the consent screens.
7. Copy the **Web app URL** it gives you. It looks like:
   `https://script.google.com/macros/s/AKfycb.../exec`
8. Send me that URL (or paste it into `js/config.js` yourself, as the
   `appsScriptUrl` value) — I'll wire it in and verify it end-to-end.

**If you ever redeploy** the script after editing it, use **Deploy > Manage
deployments > Edit (pencil icon) > New version** rather than creating a
brand-new deployment — that keeps the same URL so you don't have to update
`config.js` again.

## Managing class rosters

Each class period gets two sheet tabs:

- **`Roster - <Period>`** — the list of students in that period. You create
  this one. Row 1 can just say "Name"; list one student per row starting in
  row 2. The exact tab name is what shows up as a period choice on the site
  (e.g. a tab named `Roster - Period 3` shows students `Period 3` in the
  dropdown), so name it exactly how you want the period to read.
- **`Progress - <Period>`** — created automatically the first time a student
  in that period saves progress. One row per student per activity.

**To add a new class period:** create a new tab named `Roster - <Period>`
and list the students. It shows up on the site within a minute or two —
nothing else to configure.

**To update a roster** (add, drop, or fix a name): edit that period's
`Roster - <Period>` tab directly, like any spreadsheet. Takes effect
immediately for the next student who visits.

## Hosting (GitHub Pages)

Already set up — the site deploys automatically from the `main` branch to
[https://purplelavendr.github.io/ionic-storm/](https://purplelavendr.github.io/ionic-storm/)
a minute or two after any push.

## Adding new units, reviews, and simulations

Just tell me (Claude) what you want to add — e.g. "add a new unit on
chemical bonding with a review on ionic vs. covalent bonds" or "add a link
to this PhET simulation for gas laws" — and I'll:

- Add the unit/activity to `js/content.js`.
- For a new built-in review, write a new file under `js/activities/`
  (following the pattern in `atoms-review.js`) with your questions.
- For a linked simulation, just add an entry with its URL — no new file
  needed.
- Commit and push the update; GitHub Pages picks it up automatically within
  a minute or two.

You don't need to write any code yourself — just describe the content
(topics, questions and answers, or the link) and I'll build it.

## Known limitations (v1)

- No login — identity is just the roster entry picked, so two identical
  names in the same period's roster would share progress.
- Picking a period/name on first visit requires a live connection (it reads
  the roster from the Sheet). Once identified, answering questions and
  resuming activities still works offline and syncs when back online.
- The "report" is the Google Sheet itself; there's no in-site teacher
  dashboard yet. Open the Sheet, use filters/pivot tables as needed.
