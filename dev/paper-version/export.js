const fs = require('fs'), vm = require('vm');
const src = fs.readFileSync(process.argv[2], 'utf8');
const patched = src.replace("window.Activities['unit1-review'] = { render };",
  "globalThis.__EXPORT = { QUESTIONS, SECTIONS, CER_PROMPTS, PACE, TOTAL_POINTS, KQ_PART, EL, MATTER_ITEMS, FAMILIES, FAMILY_POOL, FLAMES, SUBSTANCES, BOND_TYPES };");
if (patched === src) throw new Error('registration line not found');
const ctx = { window: {}, location: { search: '' }, localStorage: { getItem() { return null; }, setItem() {} }, document: {}, console };
ctx.globalThis = ctx; vm.createContext(ctx); vm.runInContext(patched, ctx);
fs.writeFileSync(process.argv[3], JSON.stringify(ctx.__EXPORT, null, 1));
const e = ctx.__EXPORT; console.log('questions', e.QUESTIONS.length, 'points', e.TOTAL_POINTS, 'sections', e.SECTIONS.length, 'cer', e.CER_PROMPTS.length);
