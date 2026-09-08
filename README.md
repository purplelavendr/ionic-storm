# Ionic Storm — Chemistry Class Hub

A landing page for students to complete built-in reviews and linked simulations,
with progress saved so they can pick up where they left off, and reported back
to you in a Google Sheet.

Live site: the Apps Script URL ending in `/exec` (the same one in
`js/config.js`) — this is the link to give students. A GitHub Pages
mirror also exists at
[https://purplelavendr.github.io/ionic-storm/](https://purplelavendr.github.io/ionic-storm/)
but isn't currently used, since some school network filters block
`github.io` while trusting Google's own domains. See "Hosting" below.

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

A student is identified by the roster entry they pick, plus their **student
ID number** as a lightweight password — this stops one student from
casually picking a classmate's name and messing with their progress. It is
not real security (a determined student could still find a way around it),
just a speed bump against casual mischief. If a student doesn't see their
name (a schedule change, a typo in the roster, etc.), there's a "My name
isn't listed" fallback that lets them type it in — they still show up in
that period's tab so you can catch the gap (their typed ID isn't checked
against anything, since there's no roster row to check it against).

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

## Why the site is served from script.google.com, not GitHub Pages

Some school network filters block or intermittently fail on `github.io`
while already trusting `google.com` / `googleusercontent.com`, since
Workspace (Sheets, Docs, Classroom) depends on those domains working. That
turned out to be exactly what was happening to this class, so the *same*
Apps Script Web App that already runs the progress backend also serves the
entire site directly (`doGet` in `Code.gs`) — one Google-trusted URL for
everything, backend and frontend both. GitHub Pages still exists as a
mirror (its code auto-updates on every push) but isn't the link in use.

The Apps Script HTML files (`Index`, `Styles`, `ConfigJs`, `ContentJs`,
`StorageJs`, `MatterReviewJs`, `AppJs`) are a generated
bundle of `index.html` + `css/styles.css` + every `js/*.js` file, built by
`apps-script/build.py`. **They do not auto-update** — pushing to GitHub has
no effect on them, since they're static files pasted into the Apps Script
editor. See "Adding new units, reviews, and simulations" below for how
updates now work.

## Managing class rosters

Each class period gets two sheet tabs:

- **`Roster - <Period>`** — the students in that period, with columns
  **Name** (A) and **StudentID** (B). You maintain this one. The exact tab
  name is what shows up as a period choice on the site (e.g. a tab named
  `Roster - Period 3` shows students `Period 3` in the dropdown), so name it
  exactly how you want the period to read.
- **`Progress - <Period>`** — created automatically the first time a student
  in that period saves progress. One row per student per activity.

**To add a new class period:** create a new tab named `Roster - <Period>`,
then fill in Name and StudentID for each student. Shows up on the site
within a minute or two — nothing else to configure.

**To update a roster** (add, drop, fix a name, fix an ID): edit that
period's `Roster - <Period>` tab directly, like any spreadsheet. Takes
effect immediately for the next student who visits.

**Leaving a StudentID cell blank** skips the password check for that one
student (they can type anything and get in) — handy while you're still
filling in ID numbers for a roster, so nobody's locked out mid-rollout.
Once redeployed, students can already sign in with an empty StudentID
column; add the real numbers whenever you get to them.

## Hosting

**Primary (in use): Apps Script.** The Web App URL ending in `/exec` serves
the whole site — this is the link students use. Updating it after a
content change means regenerating the bundle and pasting it into the Apps
Script editor (see below); there's no way around that manual step, since
Apps Script has no equivalent of "push to deploy."

**Mirror (not in use): GitHub Pages.** `main` still auto-deploys to
[https://purplelavendr.github.io/ionic-storm/](https://purplelavendr.github.io/ionic-storm/)
on every push, at no extra effort — it's just not the link being handed to
students right now. Worth keeping around in case a future network/filter
situation makes it useful again, or as a place to preview a change before
it goes out to the Apps Script link.

## Adding new units, reviews, and simulations

Just tell me (Claude) what you want to add — e.g. "add a new unit on
chemical bonding with a review on ionic vs. covalent bonds" or "add a link
to this PhET simulation for gas laws" — and I'll:

1. Add the unit/activity to `js/content.js`, and write a new file under
   `js/activities/` for a built-in review (a linked simulation just needs
   an entry with its URL, no new file).
2. Commit and push — this updates the GitHub Pages mirror automatically.
3. Run `python3 apps-script/build.py --deploy`, which regenerates the Apps
   Script bundle, pushes it to the Apps Script project, and rolls out a new
   version of the *live* deployment — same URL, nothing for you to paste.

You don't need to do anything or write any code yourself — just describe
the content (topics, questions and answers, or the link) and I'll build
and deploy it, live within a minute or two.

**How the deploy automation works** (`clasp`, Google's Apps Script CLI,
set up once): `apps-script/.clasp.json` points at the project's script ID;
authentication lives in `~/.clasprc.json` on this machine, outside the
repo, from `clasp login`. `apps-script/build.py --deploy` runs `clasp push`
(sync files to the project) then `clasp deploy --deploymentId <id>` (roll
the live deployment to a new version) — the deployment ID is hardcoded in
`build.py` so it always updates the same URL rather than creating a new
one. If this is ever set up on a different machine, `clasp login` needs to
be re-run there.

## Known limitations (v1)

- No real login — the student ID field is a speed bump against casual
  mischief, not real security (it's sent as plain text, so a determined
  student could find it in their browser's network tab). Two identical
  names in the same period's roster would also share progress.
- Picking a period/name on first visit requires a live connection (it reads
  the roster from the Sheet). Once identified, answering questions and
  resuming activities still works offline and syncs when back online.
- The backend is deployed to run "as Me," so **every student's request
  counts against your single Google account's quota**, including how many
  requests can run at the exact same instant (roughly the size of one full
  class). If a whole class opens the link within the same few seconds, some
  requests can get rejected outright. The site automatically retries a
  rejected request a few times before showing an error, and caches the
  period list and rosters locally so repeat page loads don't add to the
  load — this should absorb a normal class-opening burst, but if it keeps
  happening with larger classes, the real fix is a backend that scales
  per-request instead of per-account (e.g. Firebase) rather than tuning
  this further.
- The "report" is the Google Sheet itself; there's no in-site teacher
  dashboard yet. Open the Sheet, use filters/pivot tables as needed.
