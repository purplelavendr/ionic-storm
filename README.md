# Ionic Storm — Chemistry Class Hub

A landing page for students to complete built-in reviews and linked simulations,
with progress saved so they can pick up where they left off, and reported back
to you in a Google Sheet.

Live site (once GitHub Pages is on): `https://<your-github-username>.github.io/ionic-storm/`

## How it works

- A student opens the site, types their name and class period once (their
  browser remembers it after that).
- The dashboard lists units and activities with a status badge: **Not
  Started**, **In Progress**, or **Completed** (with score, for reviews).
- Progress saves automatically after every question/click — no "save" button
  needed, and a half-finished review picks back up at the right question,
  even on a different computer (as long as they type the same name + period).
- Every save is also sent to a Google Sheet, which is your live gradebook /
  progress report. Just open the Sheet any time.

There's no login system — a student is identified purely by the name +
period they type. Two students with the *exact* same name in the *exact*
same period would be treated as one person, so it's worth telling students
to use "First Last" consistently. This is a deliberate tradeoff to avoid
needing accounts.

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

Two sheet tabs will be created automatically the first time the site is
used: **Students** (roster, first/last seen) and **Progress** (one row per
student per activity — status, score, and a snapshot of their answers).

**If you ever redeploy** the script after editing it, use **Deploy > Manage
deployments > Edit (pencil icon) > New version** rather than creating a
brand-new deployment — that keeps the same URL so you don't have to update
`config.js` again.

## One-time setup: hosting (GitHub Pages)

1. Create a free account at [github.com](https://github.com) if you don't
   have one.
2. Create a new **public** repository named `ionic-storm` (no README/license
   needed — this project already has one).
3. Tell me once it exists and I'll push this project to it.
4. In the repo, go to **Settings > Pages**. Under "Build and deployment",
   set Source to **Deploy from a branch**, branch `main`, folder `/ (root)`.
   Save.
5. GitHub gives you a URL like `https://<username>.github.io/ionic-storm/` —
   that's the link to share with students (a QR code pointed at it works
   great for a classroom).

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

- No login — identity is just name + period, so duplicate names within the
  same period would share progress.
- The "report" is the Google Sheet itself; there's no in-site teacher
  dashboard yet. Open the Sheet, use filters/pivot tables as needed.
- If a student is fully offline, their answers still save to their browser
  and sync automatically next time they're online and reopen the site.
