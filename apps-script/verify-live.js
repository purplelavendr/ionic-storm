#!/usr/bin/env node
// Post-deploy check: fetches the LIVE Apps Script page and confirms that every
// inline <script> still parses and that every review activity listed in
// js/content.js is actually registered.
//
// Why this exists: Apps Script post-processes the served page (it strips
// comments, and its stripper is not template-literal aware), so a script can be
// valid in the repo and still arrive broken -- e.g. a `//` inside a backtick
// string (like an SVG xmlns="http://...") truncates the line. The activity then
// never registers and students see "This activity type is not yet supported."
//
// Usage: node apps-script/verify-live.js      (build.py --deploy runs it for you)
// Exit code 0 = healthy, 1 = a problem was found.

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const buildPy = fs.readFileSync(path.join(__dirname, 'build.py'), 'utf8');
const deploymentId = (buildPy.match(/DEPLOYMENT_ID\s*=\s*'([^']+)'/) || [])[1];
if (!deploymentId) { console.error('Could not read DEPLOYMENT_ID from build.py'); process.exit(1); }
const url = `https://script.google.com/macros/s/${deploymentId}/exec`;

// Review activity ids the live site is expected to serve (from the local content.js).
function expectedReviewIds() {
  const code = fs.readFileSync(path.join(ROOT, 'js/content.js'), 'utf8');
  const content = vm.runInNewContext(code + '\n;CONTENT');
  const ids = [];
  content.units.forEach(u => u.activities.forEach(a => { if (a.type === 'review') ids.push(a.id); }));
  return ids;
}

// The page embeds the app HTML as a JS string literal passed to goog.script.init(...).
function extractUserHtml(page) {
  const marker = 'goog.script.init("';
  const start = page.indexOf(marker);
  if (start < 0) throw new Error('goog.script.init(...) not found in the live page');
  let i = start + marker.length;
  const from = i;
  while (i < page.length) {
    if (page[i] === '\\') { i += 2; continue; }
    if (page[i] === '"') break;
    i++;
  }
  const payload = JSON.parse(vm.runInNewContext('"' + page.slice(from, i) + '"'));
  if (!payload.userHtml) throw new Error('live page has no userHtml');
  return payload.userHtml;
}

async function main() {
  const res = await fetch(url, { redirect: 'follow', cache: 'no-store' });
  if (!res.ok) throw new Error(`GET ${url} -> HTTP ${res.status}`);
  const html = extractUserHtml(await res.text());
  const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
  if (!scripts.length) throw new Error('no inline <script> blocks found in the live page');

  const problems = [];
  scripts.forEach((code, n) => {
    try { new vm.Script(code); } catch (e) {
      const firstLine = code.trim().split('\n')[0].slice(0, 80);
      problems.push(`script block #${n} has a syntax error: ${e.message}  (starts: ${firstLine})`);
    }
  });

  const joined = scripts.join('\n');
  expectedReviewIds().forEach(id => {
    if (!joined.includes(`Activities['${id}']`)) problems.push(`activity "${id}" is in content.js but is not registered in the live page`);
  });

  if (problems.length) {
    console.error(`\nLIVE CHECK FAILED (${url})`);
    problems.forEach(p => console.error('  - ' + p));
    console.error('\nA syntax error here usually means Apps Script mangled the script: look for `//` inside backtick strings.');
    process.exit(1);
  }
  console.log(`Live check OK: ${scripts.length} scripts parse, ${expectedReviewIds().length} review activities registered.`);
}

main().catch(e => { console.error('LIVE CHECK ERROR: ' + e.message); process.exit(1); });
