// "Lesson 25: You Light Up My Life — Classifying Substances" virtual lab (registered as
// CONTENT activity id 'conductivity-lab'). Replaces the hands-on conductivity/solubility
// lab: students build the conductivity tester, watch the teacher-style sports-drink demo,
// predict, then test ten substances at a virtual bench (touch the probes, add water,
// watch it dissolve or not, test the solution), record their own data, sort it into the
// four solubility/conductivity categories, discover the metal / nonmetal pattern behind
// it, test their rule on four new substances, and finish with a graded check.
//
// Chapter 5 learning targets this covers (Lesson 25):
//   1. Classify substances into four categories by solubility and conductivity.
//   2. Explain the difference between soluble and insoluble.
//   3. Begin to describe the atomic makeup of substances from whether they dissolve
//      and/or conduct (metal atoms only / nonmetal atoms only / metal + nonmetal).
// An optional "zoom in" particle preview points ahead to Lesson 26 (bonding models).
//
// Persistence: the Sheet only keeps score/status/answers, so the lab's own state
// (predictions, recorded data, sorts, ...) lives in answers[0] ({questionId:'_lab', state}).
// Graded check answers follow it. Only the check's score counts toward the grade.
//
// Supports the shared EN/ES toggle (LANG_KEY). Grading is by positional index, never
// by displayed text, so language can't affect correctness.
(function () {
  const STYLE_ID = 'cl-lesson-styles';
  const FONT_LINK_ID = 'el-lesson-fonts'; // shared Google Fonts <link>, same family as every other lesson
  const LANG_KEY = 'ionicstorm_lang_v1';  // shared literal: keeps language in sync across activities
  const SECTION_COUNT = 9; // sections 0-7 (lab sections) + 8 (graded check)
  const QUIZ_INDEX = SECTION_COUNT - 1;

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }
  function getLang() {
    try { return localStorage.getItem(LANG_KEY) === 'es' ? 'es' : 'en'; } catch (e) { return 'en'; }
  }
  function setLang(lang) {
    try { localStorage.setItem(LANG_KEY, lang === 'es' ? 'es' : 'en'); } catch (e) { /* ignore */ }
  }
  const L = (en, es) => ({ en, es });
  function tr(field, lang) {
    return (field && typeof field === 'object') ? (field[lang] || field.en) : field;
  }
  // Inline translator: const _ = T(lang); _('English', 'Español')
  function T(lang) { return (en, es) => (lang === 'es' && es != null) ? es : en; }
  function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

  // ---------------------------------------------------------------- chemistry data
  // c  = lights the bulb as the pure substance      d  = dissolves in water
  // cd = lights the bulb once dissolved (null when it doesn't dissolve)
  // mk = atomic makeup: 'M' only metal atoms, 'N' only nonmetal atoms, 'MN' metal + nonmetal
  const SUBS = [
    { id: 'water', f: 'H<sub>2</sub>O', s: 'l', name: L('distilled water', 'agua destilada'), c: 0, d: 1, cd: 0, mk: 'N',
      look: { kind: 'liquid', tint: '#dbeefa' },
      obs: L('Distilled water mixed with distilled water is still just one clear liquid.', 'El agua destilada mezclada con agua destilada sigue siendo un solo líquido transparente.') },
    { id: 'al', f: 'Al', s: 's', name: L('aluminum foil', 'papel de aluminio'), c: 1, d: 0, cd: null, mk: 'M',
      look: { kind: 'foil', fill: '#c3cad3', stroke: '#8b95a1', n: 14 },
      obs: L('After stirring, the foil pieces sink and stay as foil. The water stays clear.', 'Después de agitar, los pedazos de papel se hunden y siguen siendo papel. El agua sigue transparente.') },
    { id: 'sucrose', f: 'C<sub>12</sub>H<sub>22</sub>O<sub>11</sub>', s: 's', name: L('sucrose (sugar)', 'sacarosa (azúcar)'), c: 0, d: 1, cd: 0, mk: 'N',
      look: { kind: 'crystal', fill: '#fdfdfb', stroke: '#5b6675', n: 26, tint: '#dbeefa' },
      obs: L('After stirring, the crystals disappear. The liquid is clear.', 'Después de agitar, los cristales desaparecen. El líquido es transparente.') },
    { id: 'nacl', f: 'NaCl', s: 's', name: L('sodium chloride (salt)', 'cloruro de sodio (sal)'), c: 0, d: 1, cd: 1, mk: 'MN',
      look: { kind: 'crystal', fill: '#fbfbfb', stroke: '#5b6675', n: 28, tint: '#dbeefa' },
      obs: L('After stirring, the white crystals disappear. The liquid is clear.', 'Después de agitar, los cristales blancos desaparecen. El líquido es transparente.') },
    { id: 'sio2', f: 'SiO<sub>2</sub>', s: 's', name: L('silicon dioxide (sand)', 'dióxido de silicio (arena)'), c: 0, d: 0, cd: null, mk: 'N',
      look: { kind: 'grain', fill: '#d9bf8c', stroke: '#b89a63', n: 46 },
      obs: L('After stirring, the sand settles to the bottom. Nothing disappears.', 'Después de agitar, la arena se asienta en el fondo. No desaparece nada.') },
    { id: 'paraffin', f: 'C<sub>20</sub>H<sub>42</sub>', s: 's', name: L('paraffin (wax)', 'parafina (cera)'), c: 0, d: 0, cd: null, mk: 'N',
      look: { kind: 'pellet', fill: '#f6efe0', stroke: '#8a7d5e', n: 14, float: true },
      obs: L('After stirring, the wax pellets float on top. Nothing disappears.', 'Después de agitar, los gránulos de cera flotan arriba. No desaparece nada.') },
    { id: 'ethanol', f: 'C<sub>2</sub>H<sub>6</sub>O', s: 'l', name: L('ethanol', 'etanol'), c: 0, d: 1, cd: 0, mk: 'N',
      look: { kind: 'liquid', tint: '#e8f1f6' },
      obs: L('After stirring, the two clear liquids mix into one clear liquid.', 'Después de agitar, los dos líquidos transparentes se mezclan en un solo líquido transparente.') },
    { id: 'cu', f: 'Cu', s: 's', name: L('copper', 'cobre'), c: 1, d: 0, cd: null, mk: 'M',
      look: { kind: 'metal', fill: '#c9783a', stroke: '#8f4f22', n: 14 },
      obs: L('After stirring, the copper pieces sink and stay as copper. The water stays clear.', 'Después de agitar, los pedazos de cobre se hunden y siguen siendo cobre. El agua sigue transparente.') },
    { id: 'cacl2', f: 'CaCl<sub>2</sub>', s: 's', name: L('calcium chloride', 'cloruro de calcio'), c: 0, d: 1, cd: 1, mk: 'MN',
      look: { kind: 'grain', fill: '#f5f5f2', stroke: '#5b6675', n: 40, tint: '#dbeefa' },
      obs: L('After stirring, the white granules disappear. The liquid is clear.', 'Después de agitar, los gránulos blancos desaparecen. El líquido es transparente.') },
    { id: 'cuso4', f: 'CuSO<sub>4</sub>', s: 's', name: L('copper (II) sulfate', 'sulfato de cobre (II)'), c: 0, d: 1, cd: 1, mk: 'MN',
      look: { kind: 'crystal', fill: '#3d86c9', stroke: '#2a5f95', n: 24, tint: '#8cc6ee' },
      obs: L('After stirring, the blue crystals disappear and the whole liquid turns light blue.', 'Después de agitar, los cristales azules desaparecen y todo el líquido se vuelve azul claro.') }
  ];

  // Teacher-demo substance (Section 2) — the powdered sports drink.
  const SPORTS = {
    id: 'sports', f: '', s: 's', name: L('powdered sports drink', 'bebida deportiva en polvo'), c: 0, d: 1, cd: 1, mk: 'MN',
    look: { kind: 'grain', fill: '#f59e0b', stroke: '#d97706', n: 40, tint: '#fbc674' },
    obs: L('After stirring, the orange powder disappears and the water turns orange.', 'Después de agitar, el polvo naranja desaparece y el agua se vuelve naranja.')
  };

  // Section 7: test-your-rule substances (none of these appear on the worksheet).
  const MYST = [
    { id: 'fe', f: 'Fe', s: 's', name: L('iron nail', 'clavo de hierro'), c: 1, d: 0, cd: null, mk: 'M',
      look: { kind: 'metal', fill: '#7b8794', stroke: '#4b5563', n: 12 },
      obs: L('After stirring, the iron pieces sink and stay as iron. The water stays clear.', 'Después de agitar, los pedazos de hierro se hunden y siguen siendo hierro. El agua sigue transparente.') },
    { id: 'kcl', f: 'KCl', s: 's', name: L('potassium chloride', 'cloruro de potasio'), c: 0, d: 1, cd: 1, mk: 'MN',
      look: { kind: 'crystal', fill: '#fafafa', stroke: '#5b6675', n: 26, tint: '#dbeefa' },
      obs: L('After stirring, the white crystals disappear. The liquid is clear.', 'Después de agitar, los cristales blancos desaparecen. El líquido es transparente.') },
    { id: 'glucose', f: 'C<sub>6</sub>H<sub>12</sub>O<sub>6</sub>', s: 's', name: L('glucose', 'glucosa'), c: 0, d: 1, cd: 0, mk: 'N',
      look: { kind: 'crystal', fill: '#fdfcf8', stroke: '#5b6675', n: 24, tint: '#dbeefa' },
      obs: L('After stirring, the crystals disappear. The liquid is clear.', 'Después de agitar, los cristales desaparecen. El líquido es transparente.') },
    { id: 'na2so4', f: 'Na<sub>2</sub>SO<sub>4</sub>', s: 's', name: L('sodium sulfate', 'sulfato de sodio'), c: 0, d: 1, cd: 1, mk: 'MN',
      look: { kind: 'grain', fill: '#f8f8f6', stroke: '#5b6675', n: 40, tint: '#dbeefa' },
      obs: L('After stirring, the white granules disappear. The liquid is clear.', 'Después de agitar, los gránulos blancos desaparecen. El líquido es transparente.') }
  ];

  const ELEMENTS = [
    { sym: 'H', t: 'N' }, { sym: 'C', t: 'N' }, { sym: 'O', t: 'N' }, { sym: 'S', t: 'N' }, { sym: 'Cl', t: 'N' }, { sym: 'Si', t: 'X' },
    { sym: 'Na', t: 'M' }, { sym: 'Ca', t: 'M' }, { sym: 'Al', t: 'M' }, { sym: 'Cu', t: 'M' }
  ];

  const YN = { Y: L('Yes', 'Sí'), N: L('No', 'No'), NA: L('N/A', 'N/A') };

  function stateTag(sub) { return '(' + sub.s + ')'; }
  function subLabel(sub, lang) {
    return `${sub.f ? sub.f + ' ' : ''}<span class="cl-st">${sub.f ? stateTag(sub) : ''}</span> <span class="cl-nm">${escapeHtml(tr(sub.name, lang))}</span>`;
  }
  function truthC(sub) { return sub.c ? 'Y' : 'N'; }
  function truthD(sub) { return sub.d ? 'Y' : 'N'; }
  function truthS(sub) { return sub.d ? (sub.cd ? 'Y' : 'N') : null; } // null => 'N' or 'NA' both fine

  // ---------------------------------------------------------------- styles
  function ensureStylesInjected() {
    if (!document.getElementById(FONT_LINK_ID)) {
      const link = document.createElement('link');
      link.id = FONT_LINK_ID;
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=Source+Serif+4:wght@300;400;600&family=JetBrains+Mono:wght@400;600&display=swap';
      document.head.appendChild(link);
    }
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
.cl-lesson {
  --navy: #0d1b2a; --navy-mid: #1b2d42; --navy-light: #253a52;
  --teal: #2ec4b6; --teal-dim: #1a8c83; --amber: #f4a261;
  --cream: #f7f3ec; --cream-dark: #ede8df;
  --text: #1a1a2e; --text-muted: #5a6475;
  --note-bg: #fff8e7; --note-border: #f4a261;
  --correct-bg: #e8f8f5; --correct-border: #2ec4b6;
  font-family: 'Source Serif 4', Georgia, serif;
  color: var(--text); font-size: 17px; line-height: 1.7;
  background: var(--cream); border-radius: 16px; overflow: hidden;
  box-shadow: 0 1px 3px rgba(27,24,48,0.08);
}
.cl-lesson * { box-sizing: border-box; }
.cl-lesson .cl-header { background: var(--navy); color: var(--cream); padding: 2rem 1.75rem 1.6rem; position: relative; overflow: hidden; }
.cl-lesson .cl-header::before { content: ''; position: absolute; top: -60px; right: -60px; width: 220px; height: 220px; border-radius: 50%; border: 32px solid rgba(46,196,182,0.12); }
.cl-lesson .cl-lang-toggle { position: absolute; top: 1.75rem; right: 1.75rem; z-index: 2; display: flex; gap: 0.3rem; }
.cl-lesson .cl-lang-btn { font-family: 'JetBrains Mono', monospace; font-size: 0.68rem; font-weight: 600; letter-spacing: 0.06em; padding: 0.3rem 0.6rem; border-radius: 6px; background: transparent; border: 1px solid rgba(247,243,236,0.35); color: rgba(247,243,236,0.65); cursor: pointer; }
.cl-lesson .cl-lang-btn.active { background: var(--teal); border-color: var(--teal); color: var(--navy); }
.cl-lesson .cl-lang-btn:hover:not(.active) { border-color: var(--teal); color: var(--cream); }
.cl-lesson .cl-header-label { font-family: 'JetBrains Mono', monospace; font-size: 0.68rem; letter-spacing: 0.2em; text-transform: uppercase; color: var(--teal); margin-bottom: 0.5rem; position: relative; }
.cl-lesson .cl-header h1 { font-family: 'Playfair Display', serif; font-size: 2rem; font-weight: 700; line-height: 1.2; margin: 0 0 0.4rem; position: relative; }
.cl-lesson .cl-header-meta { font-size: 0.82rem; color: rgba(247,243,236,0.65); font-family: 'JetBrains Mono', monospace; position: relative; }
.cl-lesson .cl-progress-wrap { background: var(--navy-mid); padding: 0.7rem 1.75rem; display: flex; align-items: center; gap: 0.9rem; position: sticky; top: 0; z-index: 10; }
.cl-lesson .cl-progress-label { font-family: 'JetBrains Mono', monospace; font-size: 0.65rem; color: var(--teal); text-transform: uppercase; letter-spacing: 0.1em; white-space: nowrap; }
.cl-lesson .cl-progress-track { flex: 1; height: 4px; background: rgba(255,255,255,0.12); border-radius: 2px; overflow: hidden; }
.cl-lesson .cl-progress-fill { height: 100%; background: linear-gradient(90deg, var(--teal), var(--amber)); border-radius: 2px; transition: width 0.4s ease; width: 0%; }
.cl-lesson .cl-progress-count { font-family: 'JetBrains Mono', monospace; font-size: 0.65rem; color: rgba(247,243,236,0.55); white-space: nowrap; }
.cl-lesson main { padding: 1.5rem 1.25rem 2.5rem; }
.cl-lesson .section-card { background: white; border-radius: 12px; margin-bottom: 1.1rem; box-shadow: 0 2px 12px rgba(0,0,0,0.06); overflow: hidden; }
.cl-lesson .section-header { display: flex; align-items: center; gap: 0.85rem; padding: 1rem 1.2rem; cursor: pointer; user-select: none; border-bottom: 1px solid transparent; }
.cl-lesson .section-header:hover { background: #fafafa; }
.cl-lesson .section-header.open { border-bottom-color: var(--cream-dark); }
.cl-lesson .section-num { font-family: 'JetBrains Mono', monospace; font-size: 0.7rem; font-weight: 600; color: white; background: var(--navy); border-radius: 6px; padding: 0.22rem 0.5rem; flex-shrink: 0; }
.cl-lesson .section-card.done .section-num { background: var(--teal-dim); }
.cl-lesson .section-title { font-family: 'Playfair Display', serif; font-size: 1.05rem; font-weight: 700; flex: 1; }
.cl-lesson .section-time { font-family: 'JetBrains Mono', monospace; font-size: 0.65rem; color: var(--text-muted); }
.cl-lesson .section-arrow { font-size: 0.9rem; color: var(--text-muted); transition: transform 0.25s; flex-shrink: 0; }
.cl-lesson .section-header.open .section-arrow { transform: rotate(180deg); }
.cl-lesson .section-body { display: none; padding: 1.3rem; }
.cl-lesson .section-body.open { display: block; animation: clFadeIn 0.25s ease; }
@keyframes clFadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
.cl-lesson h2 { font-family: 'Playfair Display', serif; font-size: 1.25rem; color: var(--navy); margin: 0 0 0.6rem; }
.cl-lesson h3 { font-size: 0.95rem; font-weight: 600; color: var(--navy-mid); margin: 1.1rem 0 0.5rem; }
.cl-lesson p { margin: 0 0 0.85rem; }
.cl-lesson p:last-child { margin-bottom: 0; }
.cl-lesson .note-box { background: var(--note-bg); border-left: 4px solid var(--note-border); border-radius: 0 8px 8px 0; padding: 0.9rem 1.1rem; margin: 1.1rem 0; display: flex; gap: 0.7rem; font-size: 0.9rem; }
.cl-lesson .note-box .note-icon { font-size: 1.15rem; flex-shrink: 0; }
.cl-lesson .concept-box { background: linear-gradient(135deg, var(--navy) 0%, var(--navy-mid) 100%); color: var(--cream); border-radius: 10px; padding: 1.2rem 1.4rem; margin: 1.1rem 0; }
.cl-lesson .concept-box .concept-label { font-family: 'JetBrains Mono', monospace; font-size: 0.62rem; text-transform: uppercase; letter-spacing: 0.16em; color: var(--teal); margin-bottom: 0.4rem; }
.cl-lesson .concept-box p { color: rgba(247,243,236,0.92); margin-bottom: 0; }
.cl-lesson .info-panel { background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 0.9rem 1.1rem; margin: 1.1rem 0; font-size: 0.9rem; }
.cl-lesson .info-panel .panel-label { font-family: 'JetBrains Mono', monospace; font-size: 0.62rem; text-transform: uppercase; letter-spacing: 0.14em; color: #0369a1; margin-bottom: 0.35rem; }
.cl-lesson table { width: 100%; border-collapse: collapse; margin: 0.9rem 0; font-size: 0.85rem; }
.cl-lesson th { background: var(--navy); color: var(--cream); font-family: 'JetBrains Mono', monospace; font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.08em; padding: 0.55rem 0.75rem; text-align: left; }
.cl-lesson td { padding: 0.5rem 0.75rem; border-bottom: 1px solid var(--cream-dark); }
.cl-lesson tr:nth-child(even) td { background: #fafafa; }
.cl-lesson ul, .cl-lesson ol { padding-left: 1.3rem; margin: 0 0 0.85rem; }
.cl-lesson li { margin-bottom: 0.3rem; font-size: 0.93rem; }
.cl-lesson .objectives-list { list-style: none; padding: 0; margin: 0.4rem 0; }
.cl-lesson .objectives-list li { display: flex; align-items: flex-start; gap: 0.55rem; padding: 0.4rem 0; font-size: 0.92rem; border-bottom: 1px solid var(--cream-dark); }
.cl-lesson .objectives-list li:last-child { border-bottom: none; }
.cl-lesson .obj-check { color: var(--teal); flex-shrink: 0; }
.cl-lesson .practice-problem { border: 1.5px solid var(--cream-dark); border-radius: 10px; margin-bottom: 1.1rem; overflow: hidden; }
.cl-lesson .pp-header { display: flex; align-items: center; gap: 0.65rem; padding: 0.85rem 1.1rem; background: #fafafa; border-bottom: 1px solid var(--cream-dark); }
.cl-lesson .pp-num { font-family: 'JetBrains Mono', monospace; font-size: 0.7rem; font-weight: 700; color: white; background: var(--amber); border-radius: 6px; padding: 0.18rem 0.45rem; flex-shrink: 0; }
.cl-lesson .pp-difficulty { font-family: 'JetBrains Mono', monospace; font-size: 0.6rem; letter-spacing: 0.08em; text-transform: uppercase; margin-left: auto; }
.cl-lesson .diff-basic { color: #16a34a; }
.cl-lesson .diff-medium { color: #d97706; }
.cl-lesson .diff-challenge { color: #dc2626; }
.cl-lesson .pp-body { padding: 0.95rem 1.1rem; }
.cl-lesson .pp-body p { font-size: 0.92rem; }
.cl-lesson .hint-btn, .cl-lesson .reveal-btn, .cl-lesson .mark-done-btn, .cl-lesson .cl-choice, .cl-lesson .cl-next-btn, .cl-lesson .cl-retake-btn, .cl-lesson .cl-flame-btn, .cl-lesson .cl-builder-btn {
  font-family: 'JetBrains Mono', monospace; cursor: pointer; border: none;
}
.cl-lesson .hint-btn, .cl-lesson .reveal-btn { border-radius: 6px; padding: 0.4rem 0.8rem; font-size: 0.68rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; }
.cl-lesson .hint-btn { background: #fef3c7; color: #92400e; border: 1px solid #fcd34d; margin-right: 0.5rem; }
.cl-lesson .hint-btn:hover { background: #fde68a; }
.cl-lesson .reveal-btn { background: var(--navy); color: white; }
.cl-lesson .reveal-btn:hover { background: var(--navy-light); }
.cl-lesson .hint-box, .cl-lesson .answer-box { border-radius: 7px; padding: 0.75rem 0.95rem; margin-top: 0.7rem; font-size: 0.87rem; display: none; }
.cl-lesson .hint-box.open, .cl-lesson .answer-box.open { display: block; animation: clFadeIn 0.2s ease; }
.cl-lesson .hint-box { background: #fffbeb; border: 1px dashed #fcd34d; color: #78350f; }
.cl-lesson .answer-box { background: var(--correct-bg); border: 1px solid var(--correct-border); color: #065f46; }
.cl-lesson .answer-box .answer-label { font-family: 'JetBrains Mono', monospace; font-size: 0.62rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--teal-dim); margin-bottom: 0.35rem; font-weight: 700; }
.cl-lesson .mark-done-btn { display: block; width: 100%; margin-top: 1.2rem; background: var(--navy); color: var(--cream); border-radius: 8px; padding: 0.75rem 1rem; font-size: 0.75rem; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; transition: background 0.2s; }
.cl-lesson .mark-done-btn:hover:not(:disabled) { background: var(--teal-dim); }
.cl-lesson .mark-done-btn:disabled { background: var(--cream-dark); color: var(--text-muted); cursor: not-allowed; }
.cl-lesson .quiz-note { background: var(--note-bg); border-left: 4px solid var(--note-border); border-radius: 0 8px 8px 0; padding: 0.9rem 1.1rem; margin-bottom: 1.1rem; font-size: 0.88rem; }
.cl-lesson .quiz-progress-bar { height: 6px; background: var(--cream-dark); border-radius: 999px; overflow: hidden; margin: 0.6rem 0 0.9rem; }
.cl-lesson .quiz-progress-fill { height: 100%; background: linear-gradient(90deg, var(--navy), var(--teal)); transition: width 0.2s ease; }
.cl-lesson .quiz-question-count { font-family: 'JetBrains Mono', monospace; font-size: 0.72rem; color: var(--text-muted); }
.cl-lesson .quiz-prompt { font-family: 'Playfair Display', serif; font-size: 1.1rem; font-weight: 700; color: var(--navy); margin: 0.5rem 0 1rem; }
.cl-lesson .cl-choice { display: block; width: 100%; text-align: left; background: white; border: 1.5px solid var(--cream-dark); border-radius: 8px; padding: 0.7rem 0.9rem; margin-bottom: 0.6rem; font-size: 0.93rem; color: var(--text); font-family: 'Source Serif 4', serif; transition: border-color 0.15s, background 0.15s; }
.cl-lesson .cl-choice:hover:not(:disabled) { border-color: var(--teal); background: #f3fdfc; }
.cl-lesson .cl-choice:disabled { cursor: default; }
.cl-lesson .cl-choice.selected-correct { border-color: var(--correct-border); background: var(--correct-bg); }
.cl-lesson .cl-choice.selected-incorrect { border-color: #dc2626; background: #fef2f2; }
.cl-lesson .cl-feedback { border-radius: 8px; padding: 0.75rem 1rem; margin-top: 0.4rem; font-size: 0.9rem; font-weight: 600; }
.cl-lesson .cl-feedback.correct { background: var(--correct-bg); color: var(--teal-dim); }
.cl-lesson .cl-feedback.incorrect { background: #fef2f2; color: #b91c1c; }
.cl-lesson .cl-next-btn, .cl-lesson .cl-retake-btn { background: var(--navy); color: white; border-radius: 8px; padding: 0.65rem 1.2rem; font-size: 0.75rem; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; margin-top: 1rem; }
.cl-lesson .cl-next-btn:hover, .cl-lesson .cl-retake-btn:hover { background: var(--navy-light); }
.cl-lesson .cl-summary { text-align: center; padding: 1rem 0.5rem; }
.cl-summary .cl-code-label { margin: 0.6rem 0 0.2rem; font-weight: 600; }
.cl-summary .cl-code { display: inline-block; font-family: 'JetBrains Mono', monospace; font-size: 2rem; font-weight: 700; letter-spacing: 0.15em; color: var(--navy); border: 2px dashed var(--navy); border-radius: 10px; padding: 0.3rem 1rem; margin-bottom: 0.8rem; user-select: all; }
.cl-lesson .cl-score { font-family: 'JetBrains Mono', monospace; font-size: 2.4rem; font-weight: 700; color: var(--navy); margin: 0.4rem 0; }


/* ---- Lab-specific ---- */
.cl-lesson .cl-lock { background: var(--cream-dark); border-radius: 10px; padding: 1.1rem 1.2rem; text-align: center; font-size: 0.92rem; color: var(--text-muted); }
.cl-lesson .cl-gate-hint { font-size: 0.78rem; color: var(--text-muted); font-style: italic; text-align: center; margin: 0.5rem 0 0; min-height: 1.1em; }
.cl-lesson .cl-btn { font-family: 'JetBrains Mono', monospace; cursor: pointer; border: none; background: var(--navy); color: white; border-radius: 8px; padding: 0.55rem 1rem; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; }
.cl-lesson .cl-btn:hover:not(:disabled) { background: var(--navy-light); }
.cl-lesson .cl-btn:disabled { background: var(--cream-dark); color: var(--text-muted); cursor: not-allowed; }
.cl-lesson .cl-btn.secondary { background: white; color: var(--navy); border: 1.5px solid var(--navy-light); }
.cl-lesson .cl-btn.on { background: var(--teal-dim); }
.cl-lesson .cl-btn.pulse { animation: clPulseBtn 0.9s ease-in-out 3; box-shadow: 0 0 0 0 rgba(244,162,97,0.7); }
@keyframes clPulseBtn { 0% { box-shadow: 0 0 0 0 rgba(244,162,97,0.8); } 100% { box-shadow: 0 0 0 12px rgba(244,162,97,0); } }
.cl-lesson .cl-row { display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center; }
.cl-lesson .cl-q { background: #fafafa; border: 1.5px solid var(--cream-dark); border-radius: 10px; padding: 0.8rem 1rem; margin: 0.7rem 0; }
.cl-lesson .cl-q p { margin-bottom: 0.5rem; font-size: 0.92rem; }
.cl-lesson .cl-opt { font-family: 'Source Serif 4', serif; cursor: pointer; background: white; border: 1.5px solid var(--cream-dark); border-radius: 8px; padding: 0.45rem 0.8rem; font-size: 0.9rem; color: var(--text); }
.cl-lesson .cl-opt:hover { border-color: var(--teal); }
.cl-lesson .cl-opt.sel { border-color: var(--navy); background: var(--navy); color: white; }
.cl-lesson textarea.cl-text { width: 100%; font-family: 'Source Serif 4', serif; font-size: 0.92rem; border: 1.5px solid var(--cream-dark); border-radius: 8px; padding: 0.6rem 0.8rem; min-height: 4.2rem; resize: vertical; background: white; color: var(--text); }
.cl-lesson textarea.cl-text:focus { outline: none; border-color: var(--teal); }

/* bench */
.cl-lesson .cl-bench { background: var(--cream-dark); border-radius: 12px; padding: 0.9rem; margin: 1rem 0; }
.cl-lesson .cl-bench-title { font-family: 'JetBrains Mono', monospace; font-size: 0.78rem; color: var(--navy-mid); margin-bottom: 0.5rem; display: flex; justify-content: space-between; flex-wrap: wrap; gap: 0.4rem; }
.cl-lesson .cl-bench-title b { font-size: 0.95rem; color: var(--navy); }
.cl-lesson .cl-bench-svg { width: 100%; height: auto; display: block; background: #fdfaf3; border-radius: 10px; border: 1px solid #e4dccb; touch-action: manipulation; }
.cl-lesson .cl-bench-actions { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.7rem; }
.cl-lesson .cl-bulbread { font-family: 'JetBrains Mono', monospace; font-size: 0.78rem; margin-top: 0.6rem; color: var(--navy-mid); min-height: 1.2em; }
.cl-lesson .cl-bulbread.on { color: #b45309; font-weight: 700; }
.cl-lesson .cl-log { font-size: 0.88rem; min-height: 2.6em; margin-top: 0.4rem; color: var(--text); }
.cl-lesson .cl-log.warn { color: #b45309; font-weight: 600; }
.cl-lesson .cl-bulb-glow { opacity: 0; transition: opacity 0.25s ease; }
.cl-lesson .cl-bench-svg.lit .cl-bulb-glow { opacity: var(--glow, 0.95); }
.cl-lesson .cl-bench-svg.lit .cl-bulb-glass { fill: #fff3a8; }
.cl-lesson .cl-flow { display: none; fill: none; stroke: #f59e0b; stroke-width: 3; stroke-linecap: round; stroke-dasharray: 2 12; animation: clFlow 0.45s linear infinite; }
.cl-lesson .cl-bench-svg.lit .cl-flow { display: inline; }
@keyframes clFlow { to { stroke-dashoffset: -14; } }
.cl-lesson .cl-p { transition: opacity 1.8s ease, transform 1.8s ease; transform-box: fill-box; transform-origin: center; }
.cl-lesson .cl-p.dis { opacity: 0; transform: scale(0.15) translateY(-8px); }
.cl-lesson .cl-water { transform-box: fill-box; transform-origin: bottom; transition: transform 1.1s ease, fill 2.6s ease; }
.cl-lesson .cl-water.rise-start { transform: scaleY(0.01); }
.cl-lesson .cl-joint { fill: rgba(46,196,182,0.25); stroke: #2ec4b6; stroke-width: 2.5; cursor: pointer; animation: clPulseJoint 1.1s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
@keyframes clPulseJoint { 0%,100% { transform: scale(1); } 50% { transform: scale(1.35); } }
.cl-lesson .cl-drop { opacity: 0; transition: opacity 0.3s; }
.cl-lesson .cl-drop.wet { opacity: 1; }
.cl-lesson .cl-wiggle { animation: clShake 0.5s ease; }
@keyframes clShake { 0%,100% { transform: translateX(0); } 20% { transform: translateX(-4px); } 40% { transform: translateX(4px); } 60% { transform: translateX(-3px); } 80% { transform: translateX(3px); } }

/* stations + data table */
.cl-lesson .cl-stations { display: flex; flex-wrap: wrap; gap: 0.4rem; margin: 0.5rem 0 0.2rem; }
.cl-lesson .cl-station { font-family: 'JetBrains Mono', monospace; cursor: pointer; background: white; border: 1.5px solid var(--cream-dark); border-radius: 8px; padding: 0.4rem 0.65rem; font-size: 0.78rem; color: var(--text); }
.cl-lesson .cl-station:hover { border-color: var(--teal); }
.cl-lesson .cl-station.sel { border-color: var(--navy); background: var(--navy); color: white; }
.cl-lesson .cl-station.done::after { content: ' ✓'; color: var(--teal); font-weight: 700; }
.cl-lesson .cl-tablewrap { overflow-x: auto; margin: 0.8rem 0; }
.cl-lesson .cl-data { min-width: 640px; }
.cl-lesson .cl-data th { text-align: center; }
.cl-lesson .cl-data th.grp { background: var(--navy-mid); }
.cl-lesson .cl-data td { text-align: center; padding: 0.35rem 0.4rem; }
.cl-lesson .cl-data td.sub { text-align: left; font-size: 0.82rem; cursor: pointer; }
.cl-lesson .cl-data td.sub .cl-st { color: var(--text-muted); font-size: 0.75rem; }
.cl-lesson .cl-data td.sub .cl-nm { display: block; color: var(--text-muted); font-size: 0.72rem; }
.cl-lesson .cl-data tr.cur td { background: #eef9f7; }
.cl-lesson .cl-yn { font-family: 'JetBrains Mono', monospace; cursor: pointer; border: 1.5px solid var(--cream-dark); background: white; color: var(--text-muted); border-radius: 6px; padding: 0.22rem 0.45rem; font-size: 0.72rem; margin: 0 1px; }
.cl-lesson .cl-yn:hover:not(:disabled) { border-color: var(--teal); color: var(--navy); }
.cl-lesson .cl-yn:disabled { opacity: 0.45; cursor: not-allowed; }
.cl-lesson .cl-yn.sel { background: var(--navy); border-color: var(--navy); color: white; opacity: 1; }
.cl-lesson .cl-yn.good { background: var(--teal-dim); border-color: var(--teal-dim); color: white; opacity: 1; }
.cl-lesson .cl-data td.match { background: #e8f8f5; }
.cl-lesson .cl-data td.miss { background: #fff1e6; }
.cl-lesson .cl-fixed { font-family: 'JetBrains Mono', monospace; font-size: 0.75rem; color: var(--text-muted); }
.cl-lesson .cl-tip { font-size: 0.82rem; color: var(--text-muted); font-style: italic; margin: 0.3rem 0; }
.cl-lesson .cl-flash { background: #fff1e6; border-left: 4px solid var(--amber); border-radius: 0 8px 8px 0; padding: 0.55rem 0.9rem; font-size: 0.86rem; margin: 0.5rem 0; min-height: 1.2em; }
.cl-lesson .cl-flash:empty { display: none; }
.cl-lesson .cl-result { background: var(--correct-bg); border: 1px solid var(--correct-border); border-radius: 10px; padding: 0.8rem 1rem; margin: 0.8rem 0; font-size: 0.9rem; }

.cl-lesson .cl-write { background: #fff8e1; border: 2.5px solid var(--amber); border-radius: 12px; padding: 0.9rem 1.1rem; margin: 1rem 0; font-size: 0.95rem; }
.cl-lesson .cl-write-tag { display: inline-block; font-family: 'JetBrains Mono', monospace; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; background: var(--amber); color: #3b2200; border-radius: 6px; padding: 0.2rem 0.55rem; margin-bottom: 0.55rem; }
.cl-lesson .cl-write p { margin: 0 0 0.5rem; }
.cl-lesson .cl-write ol, .cl-lesson .cl-write ul { margin: 0.2rem 0 0.2rem; }
.cl-lesson .cl-write li { font-size: 0.95rem; margin-bottom: 0.45rem; }
.cl-lesson .cl-ack { display: flex; gap: 0.6rem; align-items: flex-start; background: white; border: 2px solid var(--navy-light); border-radius: 10px; padding: 0.7rem 0.9rem; margin: 0.8rem 0; cursor: pointer; font-weight: 600; font-size: 0.93rem; }
.cl-lesson .cl-ack input { width: 1.3rem; height: 1.3rem; margin-top: 0.1rem; flex-shrink: 0; accent-color: var(--teal-dim); }
.cl-lesson ul.cl-check { list-style: none; padding: 0; margin: 0.2rem 0 0; }
.cl-lesson ul.cl-check li { font-size: 0.92rem; padding: 0.2rem 0.3rem; border-radius: 6px; }
.cl-lesson ul.cl-check li.next { background: #fff1c2; font-weight: 600; }
.cl-lesson ul.cl-check li.ok { color: var(--teal-dim); }

/* sorters */
.cl-lesson .cl-tray { display: flex; flex-wrap: wrap; gap: 0.45rem; background: #fafafa; border: 1.5px dashed var(--cream-dark); border-radius: 10px; padding: 0.6rem; min-height: 3rem; margin: 0.6rem 0; }
.cl-lesson .cl-chip { font-family: 'JetBrains Mono', monospace; cursor: grab; background: white; border: 1.5px solid var(--navy-light); border-radius: 8px; padding: 0.3rem 0.6rem; font-size: 0.8rem; color: var(--text); text-align: left; }
.cl-lesson .cl-chip small { display: block; font-size: 0.62rem; color: var(--text-muted); }
.cl-lesson .cl-chip.sel { background: var(--navy); color: white; border-color: var(--navy); }
.cl-lesson .cl-chip.sel small { color: rgba(255,255,255,0.75); }
.cl-lesson .cl-chip.placed { cursor: default; border-color: var(--teal-dim); background: #f3fdfc; }
.cl-lesson .cl-bins { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.6rem; }
.cl-lesson .cl-bins.three { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.cl-lesson .cl-bin { background: white; border: 2px solid var(--cream-dark); border-radius: 10px; padding: 0.55rem 0.6rem; min-height: 6.2rem; cursor: pointer; text-align: left; font-family: 'Source Serif 4', serif; color: var(--text); display: block; width: 100%; }
.cl-lesson .cl-bin:hover, .cl-lesson .cl-bin.over { border-color: var(--teal); background: #f3fdfc; }
.cl-lesson .cl-bin h4 { margin: 0 0 0.1rem; font-family: 'Playfair Display', serif; font-size: 0.92rem; color: var(--navy); }
.cl-lesson .cl-bin .sub { font-size: 0.72rem; color: var(--text-muted); margin-bottom: 0.4rem; font-family: 'JetBrains Mono', monospace; }
.cl-lesson .cl-bin .items { display: flex; flex-wrap: wrap; gap: 0.3rem; }
.cl-lesson .cl-bin.reveal h4 .term { color: var(--teal-dim); }
.cl-lesson .cl-refbar { display: flex; flex-wrap: wrap; gap: 0.35rem; align-items: center; font-family: 'JetBrains Mono', monospace; font-size: 0.72rem; margin: 0.4rem 0; }
.cl-lesson .cl-el { border-radius: 6px; padding: 0.15rem 0.45rem; font-weight: 700; border: 1.5px solid; }
.cl-lesson .cl-el.M { background: #e6f0fb; border-color: #3b7cc4; color: #1f4f8c; }
.cl-lesson .cl-el.N { background: #fff3e2; border-color: #d98a3c; color: #a9611a; }
.cl-lesson .cl-el.X { background: #eceff5; border-color: #8a94a8; color: #4b5568; }
.cl-lesson .cl-pat td, .cl-lesson .cl-pat th { text-align: left; }
.cl-lesson .cl-rule { background: #fafafa; border: 1.5px solid var(--cream-dark); border-radius: 10px; padding: 0.9rem 1rem; margin: 0.7rem 0; font-size: 0.95rem; line-height: 2.1; }
.cl-lesson .cl-rule select { font-family: 'Source Serif 4', serif; font-size: 0.9rem; padding: 0.2rem 0.3rem; border: 1.5px solid var(--navy-light); border-radius: 6px; background: white; max-width: 100%; }
.cl-lesson .cl-rule select.ok { border-color: var(--teal-dim); background: #e8f8f5; }
.cl-lesson .cl-rule select.bad { border-color: #dc2626; background: #fef2f2; }
.cl-lesson canvas.cl-zoom { width: 100%; max-width: 560px; height: auto; display: block; margin: 0.6rem auto; background: #fdfaf3; border: 1px solid #e4dccb; border-radius: 10px; }
.cl-lesson .cl-readout { font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; text-align: center; color: var(--navy-mid); }
.cl-lesson .cl-reason { margin-top: 0.8rem; }
.cl-lesson .cl-reason label { font-size: 0.85rem; font-weight: 600; display: block; margin-bottom: 0.3rem; }
@media (max-width: 560px) {
  .cl-lesson .cl-bins.three { grid-template-columns: 1fr; }
  .cl-lesson .cl-header h1 { font-size: 1.5rem; }
}
`;
    document.head.appendChild(style);
  }

  // ---------------------------------------------------------------- bench engine
  const BENCH_BEAKERS = [{ cx: 430 }, { cx: 590 }];
  const ANCH_BULB = { x: 248, y: 108 };
  const ANCH_BATT = { x: 48, y: 184 };
  const REST1 = { x: 312, y: 132 };
  const REST2 = { x: 322, y: 180 };
  const TOGETHER1 = { x: 338, y: 150 };
  const TOGETHER2 = { x: 346, y: 150 };
  function touchPt(cx, side, y) { return { x: cx + (side === 1 ? -22 : 22), y: y || 168 }; }
  function wireFromBulb(t) { return `M${ANCH_BULB.x},${ANCH_BULB.y} C${ANCH_BULB.x + 50},${ANCH_BULB.y + 6} ${t.x},${t.y - 90} ${t.x},${t.y}`; }
  function wireFromBatt(t) { return `M${ANCH_BATT.x},${ANCH_BATT.y} C${ANCH_BATT.x},${ANCH_BATT.y + 70} ${t.x - 20},${t.y - 100} ${t.x},${t.y}`; }
  const WIRE1 = `M82,184 C82,140 150,112 212,108`; // battery (+) -> bulb

  // Seeded pseudo-random so a beaker re-renders identically.
  function rng(seedStr) {
    let h = 2166136261;
    for (let i = 0; i < seedStr.length; i++) { h ^= seedStr.charCodeAt(i); h = Math.imul(h, 16777619); }
    return function () { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return ((h >>> 0) % 10000) / 10000; };
  }

  function particleMarkup(sub, phase) {
    const look = sub.look;
    if (!look || look.kind === 'liquid') return '';
    const r = rng(sub.id);
    const dissolves = !!sub.d;
    let out = '';
    for (let i = 0; i < look.n; i++) {
      const x = -40 + r() * 80;
      let y;
      if (look.float && phase !== 'dry') y = 42 + r() * 5;
      else y = 118 - 4 - Math.pow(r(), 1.6) * 20;
      const rot = Math.round(r() * 180);
      const delay = (r() * 1.0).toFixed(2);
      let shape;
      switch (look.kind) {
        case 'crystal':
          shape = `<rect x="${(x - 3.2).toFixed(1)}" y="${(y - 3.2).toFixed(1)}" width="6.4" height="6.4" transform="rotate(${rot})"`; break;
        case 'grain':
          shape = `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(2.6 + r() * 1.3).toFixed(1)}"`; break;
        case 'pellet':
          shape = `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="5" ry="3.6"`; break;
        case 'metal':
          shape = `<rect x="${(x - 5).toFixed(1)}" y="${(y - 2).toFixed(1)}" width="10" height="4" rx="2" transform="rotate(${rot})"`; break;
        case 'foil': {
          const pts = [];
          for (let k = 0; k < 7; k++) {
            const a = (k / 7) * Math.PI * 2;
            const rad = 3.5 + r() * 4;
            pts.push((x + Math.cos(a) * rad).toFixed(1) + ',' + (y + Math.sin(a) * rad * 0.7).toFixed(1));
          }
          shape = `<polygon points="${pts.join(' ')}"`; break;
        }
        default: shape = `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2.5"`;
      }
      const cls = 'cl-p' + (dissolves && phase === 'wet-anim' ? ' dis-pending' : '');
      out += `${shape} class="${cls}" style="transition-delay:${delay}s" fill="${look.fill}" stroke="${look.stroke}" stroke-width="1.2"/>`;
    }
    return out;
  }

  // phase: 'dry' | 'wet-anim' | 'wet'
  function beakerContents(sub, phase) {
    const look = sub.look || {};
    const isLiquid = look.kind === 'liquid';
    const solTint = look.tint || '#dbeefa';
    let liquid = '';
    if (isLiquid && phase === 'dry') {
      liquid = `<rect class="cl-water" x="-50" y="64" width="100" height="54" fill="${look.tint}" opacity="0.85"/>`;
    } else if (phase === 'wet' || phase === 'wet-anim') {
      const fill = (sub.d ? solTint : '#dbeefa');
      const startFill = (sub.d && phase === 'wet-anim') ? '#dbeefa' : fill;
      liquid = `<rect class="cl-water${phase === 'wet-anim' ? ' rise-start' : ''}" data-final="${fill}" x="-50" y="46" width="100" height="72" fill="${startFill}" opacity="0.85"/>`;
    }
    let parts = '';
    if (!isLiquid) {
      if (phase === 'wet' && sub.d) parts = ''; // fully dissolved
      else parts = particleMarkup(sub, phase);
    }
    return liquid + parts;
  }

  function benchSvg(o) {
    const uid = o.uid;
    const j = o.joints || [1, 1, 1, 1];
    const beakers = o.beakers || [];
    const beakerSvg = beakers.map((b, i) => `
      <g transform="translate(${b.cx},170)">
        <g class="cl-contents" data-beaker="${i}"></g>
        <path d="M-55,-4 L-52,122 Q-52,126 -48,126 L48,126 Q52,126 52,122 L55,-4" fill="rgba(180,215,235,0.18)" stroke="#8aa4b5" stroke-width="2.5"/>
        <path d="M-55,-4 L-62,-10" stroke="#8aa4b5" stroke-width="2.5" fill="none"/>
        <text x="0" y="148" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="13" fill="#4a5568">${escapeHtml(b.label)}</text>
      </g>`).join('');
    const joints = o.assembly ? [
      { x: 65, y: 183 }, { x: 150, y: 119 }, { x: 262, y: 112 }, { x: 130, y: 232 }
    ].map((p, i) => `<circle class="cl-joint" data-joint="${i}" cx="${p.x}" cy="${p.y}" r="11" ${j[i] ? 'style="display:none"' : ''}/>`).join('') : '';
    return `<svg class="cl-bench-svg" viewBox="0 0 700 340" role="img" aria-label="${escapeHtml(o.aria || 'Conductivity tester')}">
      <defs>
        <radialGradient id="glow-${uid}" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#fff7b0" stop-opacity="1"/><stop offset="100%" stop-color="#fbbf24" stop-opacity="0"/></radialGradient>
      </defs>
      <rect x="0" y="296" width="700" height="44" fill="#e4dccb"/>
      <!-- battery -->
      <rect x="30" y="190" width="70" height="106" rx="6" fill="#2b2f3a"/>
      <rect x="30" y="190" width="70" height="26" rx="6" fill="#4b5563"/>
      <text x="65" y="262" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="16" font-weight="700" fill="#f4a261">9 V</text>
      <rect x="44" y="176" width="9" height="16" rx="2" fill="#9ca3af"/><rect x="77" y="176" width="9" height="16" rx="2" fill="#9ca3af"/>
      <text x="48.5" y="170" text-anchor="middle" font-size="14" font-weight="700" fill="#2563eb">−</text>
      <text x="81.5" y="170" text-anchor="middle" font-size="14" font-weight="700" fill="#dc2626">+</text>
      <!-- snap connector (joint 0) -->
      <g class="cl-snap" style="${j[0] ? '' : 'display:none'}"><rect x="40" y="172" width="50" height="9" rx="3" fill="#d1d5db" stroke="#6b7280"/></g>
      <!-- bulb -->
      <circle class="cl-bulb-glow" cx="230" cy="70" r="62" fill="url(#glow-${uid})"/>
      <circle class="cl-bulb-glass" cx="230" cy="70" r="26" fill="#eef2f6" stroke="#6b7280" stroke-width="2"/>
      <path d="M218,96 L218,80 L224,64 L230,78 L236,64 L242,80 L242,96" fill="none" stroke="#92400e" stroke-width="2"/>
      <rect x="214" y="96" width="32" height="14" rx="3" fill="#9ca3af" stroke="#6b7280"/>
      <!-- wires -->
      <path class="cl-w1" d="${WIRE1}" fill="none" stroke="#2d3748" stroke-width="4" stroke-linecap="round" style="${j[1] ? '' : 'display:none'}"/>
      <path class="cl-w2" d="" fill="none" stroke="#e11d48" stroke-width="4" stroke-linecap="round" style="${j[2] ? '' : 'display:none'}"/>
      <path class="cl-w3" d="" fill="none" stroke="#2563eb" stroke-width="4" stroke-linecap="round" style="${j[3] ? '' : 'display:none'}"/>
      <path class="cl-flow cl-f1" d="${WIRE1}" style="${j[1] ? '' : 'display:none'}"/>
      <path class="cl-flow cl-f2" d="" style="${j[2] ? '' : 'display:none'}"/>
      <path class="cl-flow cl-f3" d="" style="${j[3] ? '' : 'display:none'}"/>
      ${beakerSvg}
      <!-- probe tips -->
      <g class="cl-tip1" style="${j[2] ? '' : 'display:none'}"><line x1="0" y1="-26" x2="0" y2="0" stroke="#d97706" stroke-width="3.5" stroke-linecap="round"/><circle r="4.5" fill="#d97706" stroke="#92400e"/><circle class="cl-drop" r="6.5" cx="0" cy="-1" fill="#7dd3fc"/></g>
      <g class="cl-tip2" style="${j[3] ? '' : 'display:none'}"><line x1="0" y1="-26" x2="0" y2="0" stroke="#d97706" stroke-width="3.5" stroke-linecap="round"/><circle r="4.5" fill="#d97706" stroke="#92400e"/><circle class="cl-drop" r="6.5" cx="0" cy="-1" fill="#7dd3fc"/></g>
      ${joints}
    </svg>`;
  }

  // Wires the interactive parts of a bench SVG together. Returns a controller.
  function benchController(root, lang) {
    const svg = root.querySelector('svg');
    const q = s => svg.querySelector(s);
    const tips = { p1: Object.assign({}, REST1), p2: Object.assign({}, REST2) };
    function draw() {
      const d2 = wireFromBulb(tips.p1), d3 = wireFromBatt(tips.p2);
      q('.cl-w2').setAttribute('d', d2); q('.cl-f2').setAttribute('d', d2);
      q('.cl-w3').setAttribute('d', d3); q('.cl-f3').setAttribute('d', d3);
      q('.cl-tip1').setAttribute('transform', `translate(${tips.p1.x},${tips.p1.y})`);
      q('.cl-tip2').setAttribute('transform', `translate(${tips.p2.x},${tips.p2.y})`);
    }
    function tween(t1, t2, ms) {
      return new Promise(resolve => {
        const s1 = Object.assign({}, tips.p1), s2 = Object.assign({}, tips.p2);
        const t0 = performance.now();
        function step(now) {
          const k = Math.min(1, (now - t0) / ms);
          const e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
          tips.p1.x = s1.x + (t1.x - s1.x) * e; tips.p1.y = s1.y + (t1.y - s1.y) * e;
          tips.p2.x = s2.x + (t2.x - s2.x) * e; tips.p2.y = s2.y + (t2.y - s2.y) * e;
          draw();
          if (k < 1 && svg.isConnected) requestAnimationFrame(step); else resolve();
        }
        requestAnimationFrame(step);
      });
    }
    function setLit(on, level) {
      svg.style.setProperty('--glow', String(level == null ? 0.95 : level));
      svg.classList.toggle('lit', !!on);
    }
    function setWet(wet) {
      svg.querySelectorAll('.cl-drop').forEach(d => d.classList.toggle('wet', !!wet));
    }
    function setBeaker(i, sub, phase) {
      const g = svg.querySelector(`.cl-contents[data-beaker="${i}"]`);
      if (!g) return;
      g.innerHTML = beakerContents(sub, phase);
      if (phase === 'wet-anim') {
        const water = g.querySelector('.cl-water');
        // next frames: let the water rise, then start dissolving.
        requestAnimationFrame(() => requestAnimationFrame(() => {
          if (water) {
            water.classList.remove('rise-start');
            const fin = water.getAttribute('data-final');
            if (fin) setTimeout(() => water.setAttribute('fill', fin), 1200);
          }
          if (sub.d) setTimeout(() => g.querySelectorAll('.cl-p').forEach(p => p.classList.add('dis')), 900); // only substances that dissolve fade away
        }));
      }
    }
    draw();
    return { svg, tips, draw, tween, setLit, setWet, setBeaker };
  }

  // The full interactive station used by the demo, the lab, and the mystery substances.
  // st = { a, w, b } (0/1 flags, persisted by the caller via onChange)
  // shared = { wet: bool } — whether the probes are still wet from the last solution test.
  function createBench(mount, cfg) {
    const { sub, st, lang, shared, onChange } = cfg;
    const _ = T(lang);
    const uid = 'b' + Math.random().toString(36).slice(2, 8);
    mount.innerHTML = `
      <div class="cl-bench">
        <div class="cl-bench-title"><b>${subLabel(sub, lang)}</b><span>${escapeHtml(_('Station bench', 'Mesa de trabajo'))}</span></div>
        ${benchSvg({
          uid, beakers: [
            { cx: BENCH_BEAKERS[0].cx, label: _('A · pure substance', 'A · sustancia pura') },
            { cx: BENCH_BEAKERS[1].cx, label: _('B · for water', 'B · para agua') }],
          aria: _('Conductivity tester next to two beakers', 'Probador de conductividad junto a dos vasos')
        })}
        <div class="cl-bulbread" aria-live="polite"></div>
        <div class="cl-bench-actions">
          <button type="button" class="cl-btn" data-act="testA">${escapeHtml(_('① Touch probes to Beaker A', '① Tocar con las puntas el vaso A'))}</button>
          <button type="button" class="cl-btn" data-act="water">${escapeHtml(_('② Add 50 mL water to Beaker B', '② Agregar 50 mL de agua al vaso B'))}</button>
          <button type="button" class="cl-btn" data-act="testB">${escapeHtml(_('③ Touch probes to Beaker B', '③ Tocar con las puntas el vaso B'))}</button>
          <button type="button" class="cl-btn secondary" data-act="reset">${escapeHtml(_('↺ Reset this station', '↺ Reiniciar esta estación'))}</button>
          <button type="button" class="cl-btn secondary" data-act="wipe">${escapeHtml(_('🧽 Rinse & dry probes', '🧽 Enjuagar y secar las puntas'))}</button>
        </div>
        <div class="cl-log" aria-live="polite"></div>
      </div>`;
    const ctl = benchController(mount, lang);
    const bulbRead = mount.querySelector('.cl-bulbread');
    const log = mount.querySelector('.cl-log');
    const btn = a => mount.querySelector(`[data-act="${a}"]`);
    let busy = false;

    function say(msg, warn) { log.textContent = msg; log.classList.toggle('warn', !!warn); }
    function setBusy(b) { busy = b; mount.querySelectorAll('.cl-btn').forEach(x => { x.disabled = b; }); if (!b) refreshButtons(); }
    function refreshButtons() {
      btn('water').disabled = !!st.w;
      btn('testB').disabled = !st.w;
    }
    function reading(on) {
      bulbRead.textContent = on ? _('💡 Bulb: glowing', '💡 Foco: encendido') : _('💡 Bulb: not glowing', '💡 Foco: no se enciende');
      bulbRead.classList.toggle('on', !!on);
    }

    async function touch(which) {
      const cx = BENCH_BEAKERS[which].cx;
      setBusy(true);
      const depth = (which === 0 && sub.look && sub.look.kind !== 'liquid') ? 284 : 252; // down onto the solid, or into the liquid
      await ctl.tween(touchPt(cx, 1, 150), touchPt(cx, 2, 150), 450); // line up above the beaker first
      await ctl.tween(touchPt(cx, 1, depth), touchPt(cx, 2, depth), 650);
      const on = which === 0 ? !!sub.c : !!sub.cd;
      const level = (which === 0 && sub.c) ? 1 : 0.8;
      ctl.setLit(on, level);
      reading(on);
      await sleep(1700);
      ctl.setLit(false);
      bulbRead.classList.remove('on');
      bulbRead.textContent = _('Last test — ', 'Última prueba — ') + (on ? _('bulb glowed', 'el foco se encendió') : _('bulb stayed dark', 'el foco no se encendió'));
      await ctl.tween(touchPt(cx, 1, 150), touchPt(cx, 2, 150), 400);
      await ctl.tween(REST1, REST2, 500);
      if (which === 1) { shared.wet = true; ctl.setWet(true); }
      setBusy(false);
    }

    btn('testA').addEventListener('click', async () => {
      if (busy) return;
      if (shared.wet) {
        say(_('The probe tips are still wet from the last solution. Rinse and dry them first, or the next result won\'t be trustworthy.', 'Las puntas todavía están mojadas de la solución anterior. Enjuágalas y sécalas primero, o el siguiente resultado no será confiable.'), true);
        btn('wipe').classList.remove('pulse'); void btn('wipe').offsetWidth; btn('wipe').classList.add('pulse');
        return;
      }
      say(_('Probes touching the substance in Beaker A…', 'Las puntas tocan la sustancia en el vaso A…'));
      await touch(0);
      st.a = 1; say(_('Beaker A tested. You can test it again, or move on to Beaker B.', 'Vaso A probado. Puedes probarlo otra vez, o pasar al vaso B.')); onChange();
    });
    btn('water').addEventListener('click', async () => {
      if (busy || st.w) return;
      setBusy(true);
      say(_('Pouring 50 mL of distilled water into Beaker B and stirring…', 'Vertiendo 50 mL de agua destilada en el vaso B y agitando…'));
      ctl.setBeaker(1, sub, 'wet-anim');
      await sleep(sub.d && sub.look.kind !== 'liquid' ? 3800 : 2400);
      st.w = 1;
      say(tr(sub.obs, lang));
      setBusy(false);
      onChange();
    });
    btn('testB').addEventListener('click', async () => {
      if (busy) return;
      if (!st.w) { say(_('Add water to Beaker B first.', 'Primero agrega agua al vaso B.'), true); return; }
      if (!sub.d) {
        say(_('Nothing dissolved, so there is no solution to test. Record what you saw in the table.', 'No se disolvió nada, así que no hay solución que probar. Anota lo que viste en la tabla.'), true);
        return;
      }
      if (shared.wet) {
        say(_('The probe tips are still wet. Rinse and dry them first.', 'Las puntas todavía están mojadas. Enjuágalas y sécalas primero.'), true);
        btn('wipe').classList.remove('pulse'); void btn('wipe').offsetWidth; btn('wipe').classList.add('pulse');
        return;
      }
      say(_('Probes dipped into Beaker B…', 'Las puntas dentro del vaso B…'));
      await touch(1);
      st.b = 1; say(_('Solution tested. Probes are wet now — rinse and dry them before the next test.', 'Solución probada. Las puntas están mojadas — enjuágalas y sécalas antes de la siguiente prueba.')); onChange();
    });
    btn('wipe').addEventListener('click', async () => {
      if (busy) return;
      setBusy(true);
      for (let i = 0; i < 3; i++) {
        await ctl.tween({ x: REST1.x + 8, y: REST1.y - 6 }, { x: REST2.x + 8, y: REST2.y - 6 }, 130);
        await ctl.tween({ x: REST1.x - 8, y: REST1.y + 6 }, { x: REST2.x - 8, y: REST2.y + 6 }, 130);
      }
      await ctl.tween(REST1, REST2, 150);
      shared.wet = false; ctl.setWet(false);
      say(_('Probes rinsed and dried. Ready.', 'Puntas enjuagadas y secas. Listo.'));
      setBusy(false);
    });

    btn('reset').addEventListener('click', () => {
      if (busy) return;
      if (!window.confirm(_('Reset this station? Both beakers go back to fresh and dry, and you will need to repeat the steps for this substance.', '¿Reiniciar esta estación? Ambos vasos vuelven a estar nuevos y secos, y tendrás que repetir los pasos para esta sustancia.'))) return;
      st.a = 0; st.w = 0; st.b = 0;
      ctl.setLit(false);
      ctl.setBeaker(0, sub, 'dry'); ctl.setBeaker(1, sub, 'dry');
      bulbRead.textContent = ''; bulbRead.classList.remove('on');
      say(_('Station reset: fresh, dry beakers. Start again with step ①.', 'Estación reiniciada: vasos nuevos y secos. Empieza de nuevo con el paso ①.'));
      refreshButtons(); onChange();
    });

    // restore saved state
    ctl.setBeaker(0, sub, 'dry');
    ctl.setBeaker(1, sub, st.w ? 'wet' : 'dry');
    ctl.setWet(shared.wet);
    reading(false); bulbRead.textContent = '';
    if (st.w) say(tr(sub.obs, lang));
    refreshButtons();
    return { destroy() {} };
  }

  // ---------------------------------------------------------------- stations + packet instructions
  // Students record on paper in their own packet, so nothing is typed in here:
  // the sim shows the bench and tells them exactly what to write, and where.
  // store = { ack:0|1, prog:{id:{a,w,b}}, cur:0 }
  function ensureStore(store) { store.prog = store.prog || {}; store.cur = store.cur || 0; store.ack = store.ack || 0; return store; }
  function stationDone(sub, store) { const p = store.prog[sub.id] || {}; return !!(p.a && p.w && (p.b || !sub.d)); }
  function allStationsDone(subs, store) { return subs.every(s => stationDone(s, store)); }

  function writeBox(tag, html) {
    return `<div class="cl-write"><div class="cl-write-tag">✏️ ${escapeHtml(tag)}</div>${html}</div>`;
  }

  // "I did this in my packet" confirmation. cfg: { lang, label, checked, onToggle }
  function mountAck(mount, cfg) {
    mount.innerHTML = `<label class="cl-ack"><input type="checkbox"${cfg.checked ? ' checked' : ''}> <span>${escapeHtml(cfg.label)}</span></label>`;
    mount.querySelector('input').addEventListener('change', e => cfg.onToggle(e.target.checked));
  }

  // Predict-in-your-packet step: shows the substances read-only, then an ack checkbox.
  function mountPackList(mount, subs, store, cfg) {
    const { lang } = cfg;
    mount.innerHTML = `${cfg.writeHtml}
      <div class="cl-tray" style="cursor:default">${subs.map(s => `<span class="cl-chip" style="cursor:default">${s.f || ''}<small>${escapeHtml(tr(s.name, lang))} ${s.f ? stateTag(s) : ''}</small></span>`).join('')}</div>
      <div data-ack></div>`;
    mountAck(mount.querySelector('[data-ack]'), { lang, label: cfg.ackLabel, checked: !!store.ack, onToggle: v => { store.ack = v ? 1 : 0; cfg.onChange(); } });
  }

  function mountLab(mount, subs, store, cfg) {
    const { lang, shared, onChange } = cfg;
    const _ = T(lang);
    mount.innerHTML = `
      ${writeBox(_('At EVERY station — do these in order, and write in your packet after each step', 'En CADA estación — haz esto en orden y escribe en tu paquete después de cada paso'), `
        <ol class="cl-steps-strong">
          <li><strong>${escapeHtml(_('Touch the probes to Beaker A', 'Toca el vaso A con las puntas'))}</strong> ${escapeHtml(_('(the pure substance). Watch the bulb. Then write Yes or No under', '(la sustancia pura). Mira el foco. Luego escribe Sí o No en'))} <u>${escapeHtml(_('Test Results › Conduct?', 'Resultados › ¿Conduce?'))}</u>.</li>
          <li><strong>${escapeHtml(_('Add water to Beaker B', 'Agrega agua al vaso B'))}</strong> ${escapeHtml(_('and read what happens. Write Yes or No under', 'y lee lo que pasa. Escribe Sí o No en'))} <u>${escapeHtml(_('Test Results › Dissolve?', 'Resultados › ¿Se disuelve?'))}</u>.</li>
          <li><strong>${escapeHtml(_('If it dissolved:', 'Si se disolvió:'))}</strong> ${escapeHtml(_('rinse and dry the probes, touch Beaker B, then write Yes or No under', 'enjuaga y seca las puntas, toca el vaso B y escribe Sí o No en'))} <u>${escapeHtml(_('Conduct when dissolved?', '¿Conduce disuelta?'))}</u>. <strong>${escapeHtml(_('If nothing dissolved:', 'Si nada se disolvió:'))}</strong> ${escapeHtml(_('write N/A.', 'escribe N/A.'))}</li>
          <li>${escapeHtml(_('Rinse and dry the probes after every solution test, before moving on.', 'Enjuaga y seca las puntas después de cada prueba de solución, antes de continuar.'))}</li>
        </ol>`)}
      <div class="cl-stations"></div>
      <div class="cl-benchmount"></div>
      <div class="cl-checklist"></div>
      <div class="cl-sum"></div>`;
    const stationsEl = mount.querySelector('.cl-stations');
    const benchMount = mount.querySelector('.cl-benchmount');
    const checkEl = mount.querySelector('.cl-checklist');
    const sumEl = mount.querySelector('.cl-sum');

    function paintStations() {
      stationsEl.innerHTML = subs.map((s, i) => `<button type="button" class="cl-station${i === store.cur ? ' sel' : ''}${stationDone(s, store) ? ' done' : ''}" data-st="${i}">${i + 1}. ${s.f || escapeHtml(tr(s.name, lang))}</button>`).join('');
    }
    function paintChecklist() {
      const sub = subs[store.cur];
      const p = store.prog[sub.id] || {};
      const lines = [
        [p.a, _('Beaker A tested', 'Vaso A probado'), _('Touch the probes to Beaker A', 'Toca el vaso A con las puntas'), _('Write Yes/No under Conduct?', 'Escribe Sí/No en ¿Conduce?')],
        [p.w, _('Water added to Beaker B', 'Agua agregada al vaso B'), _('Add water to Beaker B and read what happens', 'Agrega agua al vaso B y lee lo que pasa'), _('Write Yes/No under Dissolve?', 'Escribe Sí/No en ¿Se disuelve?')],
        p.w
          ? [sub.d ? p.b : 1, sub.d ? _('Solution tested', 'Solución probada') : _('Nothing dissolved — no solution to test', 'Nada se disolvió — no hay solución que probar'),
            sub.d ? _('Rinse/dry probes, then touch Beaker B', 'Enjuaga y seca las puntas y toca el vaso B') : '',
            sub.d ? _('Write Yes/No under Conduct when dissolved?', 'Escribe Sí/No en ¿Conduce disuelta?') : _('Write N/A under Conduct when dissolved?', 'Escribe N/A en ¿Conduce disuelta?')]
          : [0, '', _('If it dissolved: rinse/dry probes, then touch Beaker B', 'Si se disolvió: enjuaga y seca las puntas y toca el vaso B'),
            _('Write Yes/No under Conduct when dissolved? (N/A if nothing dissolved)', 'Escribe Sí/No en ¿Conduce disuelta? (N/A si nada se disolvió)')]
      ];
      let next = lines.findIndex(l => !l[0]);
      checkEl.innerHTML = `<div class="cl-write"><div class="cl-write-tag">📝 ${escapeHtml(_('Packet check for this station', 'Revisión del paquete para esta estación'))}: ${subLabel(sub, lang)}</div>
        <ul class="cl-check">${lines.map((l, i) => `<li class="${l[0] ? 'ok' : (i === next ? 'next' : '')}">${l[0] ? '✅' : (i === next ? '👉' : '⬜')} ${escapeHtml(l[0] ? l[1] : l[2])} — <strong>${escapeHtml(l[3])}</strong></li>`).join('')}</ul></div>`;
    }
    function paintSummary() {
      sumEl.innerHTML = allStationsDone(subs, store)
        ? `<div class="cl-result"><strong>${escapeHtml(cfg.doneTitle || _('✓ Every station tested!', '✓ ¡Todas las estaciones probadas!'))}</strong> ${escapeHtml(cfg.doneText || _('Before you continue, look over your packet: every box in the Test Results columns should be filled in for every substance. Fill in any blanks now by going back to that station.', 'Antes de continuar, revisa tu paquete: todas las casillas de las columnas de Resultados deben estar llenas para cada sustancia. Llena cualquier espacio en blanco volviendo a esa estación.'))}</div>` : '';
    }
    function paintBench() {
      const sub = subs[store.cur];
      const st = store.prog[sub.id] = store.prog[sub.id] || { a: 0, w: 0, b: 0 };
      createBench(benchMount, { sub, st, lang, shared, onChange: () => { paintStations(); paintChecklist(); paintSummary(); onChange(); } });
    }
    function select(i) { store.cur = i; paintStations(); paintBench(); paintChecklist(); onChange(); }
    stationsEl.addEventListener('click', e => { const b = e.target.closest('[data-st]'); if (b) select(Number(b.getAttribute('data-st'))); });
    paintStations(); paintBench(); paintChecklist(); paintSummary();
  }

  // ---------------------------------------------------------------- click-or-drag sorter
  // cfg: { lang, items:[{id, html, bin}], bins:[{id, title, sub}], placed:{id:bin}, three, onChange, onWrong, hint(item,binId), onDone, revealTerms }
  function mountSorter(mount, cfg) {
    const { lang, items, bins, placed } = cfg;
    const _ = T(lang);
    let sel = null;
    mount.innerHTML = `<div class="cl-tray" data-tray></div><div class="cl-flash" data-fl></div><div class="cl-bins${cfg.three ? ' three' : ''}" data-bins></div>`;
    const tray = mount.querySelector('[data-tray]');
    const binsEl = mount.querySelector('[data-bins]');
    const fl = mount.querySelector('[data-fl]');

    function chip(it, isPlaced) {
      return `<button type="button" class="cl-chip${isPlaced ? ' placed' : ''}${sel === it.id ? ' sel' : ''}" data-chip="${it.id}" ${isPlaced ? 'disabled' : 'draggable="true"'}>${it.html}</button>`;
    }
    function paint() {
      const unplaced = items.filter(it => !placed[it.id]);
      tray.innerHTML = unplaced.length ? unplaced.map(it => chip(it, false)).join('') : `<span class="cl-tip">${escapeHtml(_('All sorted! ✓', '¡Todo clasificado! ✓'))}</span>`;
      binsEl.innerHTML = bins.map(b => `
        <div class="cl-bin${cfg.revealTerms ? ' reveal' : ''}" role="button" tabindex="0" data-bin="${b.id}">
          <h4>${b.title}</h4><div class="sub">${b.sub || ''}</div>
          <div class="items">${items.filter(it => placed[it.id] === b.id).map(it => chip(it, true)).join('')}</div>
        </div>`).join('');
    }
    function attempt(id, binId) {
      const it = items.find(x => x.id === id);
      if (!it || placed[id]) return;
      if (it.bin === binId) {
        placed[id] = binId; sel = null; fl.textContent = '';
        paint(); cfg.onChange();
        if (items.every(x => placed[x.id]) && cfg.onDone) cfg.onDone();
      } else {
        if (cfg.onWrong) cfg.onWrong();
        fl.textContent = cfg.hint ? cfg.hint(it, binId) : _('Not quite — check your data and try another box.', 'No exactamente — revisa tus datos y prueba otra caja.');
        sel = null; paint();
      }
    }
    mount.addEventListener('click', e => {
      const c = e.target.closest('[data-chip]');
      if (c && !c.disabled) { const id = c.getAttribute('data-chip'); sel = sel === id ? null : id; paint(); return; }
      const b = e.target.closest('[data-bin]');
      if (b && sel) attempt(sel, b.getAttribute('data-bin'));
    });
    mount.addEventListener('keydown', e => {
      const b = e.target.closest && e.target.closest('[data-bin]');
      if (b && e.target === b && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); b.click(); }
    });
    mount.addEventListener('dragstart', e => {
      const c = e.target.closest('[data-chip]');
      if (c && e.dataTransfer) { e.dataTransfer.setData('text/plain', c.getAttribute('data-chip')); e.dataTransfer.effectAllowed = 'move'; }
    });
    mount.addEventListener('dragover', e => { const b = e.target.closest('[data-bin]'); if (b) { e.preventDefault(); b.classList.add('over'); } });
    mount.addEventListener('dragleave', e => { const b = e.target.closest('[data-bin]'); if (b) b.classList.remove('over'); });
    mount.addEventListener('drop', e => {
      const b = e.target.closest('[data-bin]');
      if (!b) return;
      e.preventDefault(); b.classList.remove('over');
      const id = e.dataTransfer && e.dataTransfer.getData('text/plain');
      if (id) attempt(id, b.getAttribute('data-bin'));
    });
    paint();
    return { repaint: paint };
  }

  // ---------------------------------------------------------------- zoom-in particle preview (Lesson 26 preview)
  function mountZoom(mount, lang) {
    const _ = T(lang);
    const SCENES = [
      { id: 'cu', label: _('Copper (solid)', 'Cobre (sólido)'), wet: false, free: true,
        note: _('Metal atoms hold on to their nucleus and inner electrons, but their outer electrons are free to roam through the whole piece. Turn the battery on: those loose electrons all drift the same way — that flow IS the electric current.', 'Los átomos de metal conservan su núcleo y electrones internos, pero sus electrones externos pueden moverse libremente por toda la pieza. Enciende la batería: esos electrones sueltos fluyen en la misma dirección — ese flujo ES la corriente eléctrica.') },
      { id: 'nacl-dry', label: _('Salt (dry solid)', 'Sal (sólido seco)'), wet: false, free: false,
        note: _('In solid salt the charged particles (ions) are locked in place, so no charge can flow. The bulb stays dark.', 'En la sal sólida las partículas con carga (iones) están fijas en su lugar, así que no puede fluir carga. El foco no se enciende.') },
      { id: 'nacl-wet', label: _('Salt in water', 'Sal en agua'), wet: true, free: true,
        note: _('When salt dissolves, the ions break free and move through the water. Turn the battery on: positive ions drift one way, negative ions the other — moving charges, so the bulb lights.', 'Cuando la sal se disuelve, los iones se liberan y se mueven por el agua. Enciende la batería: los iones positivos van en un sentido y los negativos en el otro — cargas en movimiento, así que el foco se enciende.') },
      { id: 'sugar-wet', label: _('Sugar in water', 'Azúcar en agua'), wet: true, free: false,
        note: _('Sugar dissolves into separate molecules, but molecules are neutral — they have no charge to carry. Nothing flows, so the bulb stays dark.', 'El azúcar se disuelve en moléculas separadas, pero las moléculas son neutras — no tienen carga que transportar. No fluye nada, así que el foco no se enciende.') },
      { id: 'sand-wet', label: _('Sand in water', 'Arena en agua'), wet: true, free: false,
        note: _('Sand doesn\'t dissolve: its atoms stay locked together and nothing is free to move. The bulb stays dark.', 'La arena no se disuelve: sus átomos permanecen unidos y nada puede moverse libremente. El foco no se enciende.') }
    ];
    mount.innerHTML = `
      <div class="cl-row" data-scenes></div>
      <canvas class="cl-zoom" width="560" height="240" aria-label="${escapeHtml(_('Particle view', 'Vista de partículas'))}"></canvas>
      <div class="cl-row" style="justify-content:center"><button type="button" class="cl-btn secondary" data-batt></button></div>
      <p class="cl-readout" data-read></p>
      <p class="cl-tip" data-note style="text-align:center"></p>`;
    const sc = mount.querySelector('[data-scenes]');
    const cv = mount.querySelector('canvas');
    const ctx2 = cv.getContext('2d');
    const battBtn = mount.querySelector('[data-batt]');
    const readEl = mount.querySelector('[data-read]');
    const noteEl = mount.querySelector('[data-note]');
    let cur = 0, volt = false, parts = [];
    const W = 560, H = 240, X0 = 34, X1 = W - 34;

    function build() {
      const s = SCENES[cur];
      parts = [];
      const r = rng('zoom' + s.id);
      const add = o => parts.push(Object.assign({ vx: 0, vy: 0, ph: r() * 6.28 }, o));
      if (s.id === 'cu') {
        for (let i = 0; i < 6; i++) for (let j = 0; j < 4; j++) add({ x: 100 + i * 70, y: 40 + j * 52, hx: 100 + i * 70, hy: 40 + j * 52, q: 0, mob: false, kind: 'core', r: 15 });
        for (let i = 0; i < 26; i++) add({ x: X0 + r() * (X1 - X0), y: 20 + r() * 200, q: -1, mob: true, kind: 'e', r: 4.5 });
      } else if (s.id === 'nacl-dry' || s.id === 'nacl-wet') {
        for (let i = 0; i < 8; i++) for (let j = 0; j < 4; j++) {
          const pos = (i + j) % 2 === 0;
          const x = 90 + i * 55, y = 45 + j * 50;
          add({ x, y, hx: x, hy: y, q: pos ? 1 : -1, mob: s.free, kind: 'ion', r: pos ? 11 : 14 });
          if (s.free) { const p = parts[parts.length - 1]; p.x = X0 + r() * (X1 - X0); p.y = 20 + r() * 200; }
        }
      } else if (s.id === 'sugar-wet') {
        for (let i = 0; i < 14; i++) add({ x: X0 + r() * (X1 - X0), y: 20 + r() * 200, q: 0, mob: true, kind: 'mol', r: 11 });
      } else {
        for (let i = 0; i < 8; i++) for (let j = 0; j < 4; j++) add({ x: 90 + i * 55, y: 45 + j * 50, hx: 90 + i * 55, hy: 45 + j * 50, q: 0, mob: false, kind: 'net', r: 12 });
      }
    }
    function frame(t) {
      if (!cv.isConnected) return;
      const s = SCENES[cur];
      ctx2.clearRect(0, 0, W, H);
      if (s.wet) { ctx2.fillStyle = 'rgba(160,210,240,0.35)'; ctx2.fillRect(X0, 6, X1 - X0, H - 12); }
      // plates
      ctx2.fillStyle = volt ? '#2563eb' : '#cbd5e1'; ctx2.fillRect(8, 20, 14, H - 40);
      ctx2.fillStyle = volt ? '#dc2626' : '#cbd5e1'; ctx2.fillRect(W - 22, 20, 14, H - 40);
      ctx2.font = '700 14px JetBrains Mono, monospace'; ctx2.textAlign = 'center'; ctx2.textBaseline = 'middle';
      ctx2.fillStyle = volt ? '#fff' : '#94a3b8'; ctx2.fillText('−', 15, H / 2); ctx2.fillText('+', W - 15, H / 2);
      parts.forEach(p => {
        if (p.mob) {
          p.vx += (Math.random() - 0.5) * 0.3; p.vy += (Math.random() - 0.5) * 0.3;
          if (volt && p.q) p.vx += -p.q * 0.07;
          p.vx *= 0.93; p.vy *= 0.93;
          const cap = 2.4; p.vx = Math.max(-cap, Math.min(cap, p.vx)); p.vy = Math.max(-cap, Math.min(cap, p.vy));
          p.x += p.vx; p.y += p.vy;
          if (p.x < X0 + p.r) { p.x = X0 + p.r; p.vx = Math.abs(p.vx); }
          if (p.x > X1 - p.r) { p.x = X1 - p.r; p.vx = -Math.abs(p.vx); }
          if (p.y < 8 + p.r) { p.y = 8 + p.r; p.vy = Math.abs(p.vy); }
          if (p.y > H - 8 - p.r) { p.y = H - 8 - p.r; p.vy = -Math.abs(p.vy); }
        } else {
          p.x = p.hx + Math.sin(t / 300 + p.ph) * 1.6; p.y = p.hy + Math.cos(t / 330 + p.ph) * 1.6;
        }
        ctx2.beginPath();
        if (p.kind === 'mol') {
          ctx2.fillStyle = '#9ca3af'; ctx2.arc(p.x, p.y, p.r * 0.6, 0, 6.28); ctx2.fill();
          ctx2.beginPath(); ctx2.arc(p.x - 8, p.y + 5, p.r * 0.38, 0, 6.28); ctx2.fill();
          ctx2.beginPath(); ctx2.arc(p.x + 8, p.y + 5, p.r * 0.38, 0, 6.28); ctx2.fill();
          return;
        }
        let fill = '#9ca3af', txt = '';
        if (p.kind === 'core') { fill = '#ef4444'; txt = '+'; }
        else if (p.kind === 'e') { fill = '#2ec4b6'; txt = ''; }
        else if (p.kind === 'ion') { fill = p.q > 0 ? '#ef4444' : '#3b82f6'; txt = p.q > 0 ? '+' : '−'; }
        else if (p.kind === 'net') { fill = '#d9bf8c'; }
        ctx2.fillStyle = fill; ctx2.arc(p.x, p.y, p.r, 0, 6.28); ctx2.fill();
        if (txt) { ctx2.fillStyle = '#fff'; ctx2.font = `700 ${Math.round(p.r * 1.1)}px JetBrains Mono, monospace`; ctx2.fillText(txt, p.x, p.y + 1); }
      });
      requestAnimationFrame(frame);
    }
    function paintUi() {
      const s = SCENES[cur];
      sc.innerHTML = SCENES.map((x, i) => `<button type="button" class="cl-station${i === cur ? ' sel' : ''}" data-sc="${i}">${escapeHtml(x.label)}</button>`).join('');
      battBtn.textContent = volt ? _('🔋 Battery: ON (click to turn off)', '🔋 Batería: ENCENDIDA (clic para apagar)') : _('🔋 Battery: OFF (click to turn on)', '🔋 Batería: APAGADA (clic para encender)');
      battBtn.classList.toggle('on', volt);
      readEl.textContent = _('Free-moving charged particles: ', 'Partículas con carga que se mueven libremente: ') + (s.free ? _('YES', 'SÍ') : _('NO', 'NO')) +
        (volt ? '  ·  ' + _('Bulb: ', 'Foco: ') + (s.free ? _('💡 glowing', '💡 encendido') : _('dark', 'apagado')) : '');
      noteEl.textContent = s.note;
    }
    sc.addEventListener('click', e => { const b = e.target.closest('[data-sc]'); if (b) { cur = Number(b.getAttribute('data-sc')); build(); paintUi(); } });
    battBtn.addEventListener('click', () => { volt = !volt; paintUi(); });
    build(); paintUi(); requestAnimationFrame(frame);
  }

  // ---------------------------------------------------------------- graded check
  const QUESTIONS = [
    { id: 'q_soluble',
      prompt: L('What is the difference between a soluble and an insoluble substance?', '¿Cuál es la diferencia entre una sustancia soluble y una insoluble?'),
      choices: [L('Soluble substances conduct electricity; insoluble substances do not', 'Las sustancias solubles conducen electricidad; las insolubles no'), L('Soluble substances can dissolve in another substance, like water; insoluble substances cannot', 'Las sustancias solubles se pueden disolver en otra sustancia, como el agua; las insolubles no'), L('Soluble substances are always liquids; insoluble substances are always solids', 'Las sustancias solubles siempre son líquidas; las insolubles siempre son sólidas'), L('There is no difference — the words mean the same thing', 'No hay diferencia — las palabras significan lo mismo')],
      correct: 1,
      explanation: L('Soluble = capable of being dissolved in another substance. Insoluble = incapable of being dissolved.', 'Soluble = capaz de disolverse en otra sustancia. Insoluble = incapaz de disolverse.') },
    { id: 'q_gold',
      prompt: L('A gold ring (made only of gold atoms) is dropped into water. Which category fits it?', 'Un anillo de oro (hecho solo de átomos de oro) cae en agua. ¿Qué categoría le corresponde?'),
      choices: [L('Dissolves; conducts once dissolved', 'Se disuelve; conduce una vez disuelto'), L('Does not dissolve; conducts electricity', 'No se disuelve; conduce electricidad'), L('Does not dissolve; does not conduct', 'No se disuelve; no conduce'), L('Dissolves; does not conduct', 'Se disuelve; no conduce')],
      correct: 1,
      explanation: L('Gold is a metal — like Al and Cu it is insoluble and conducts.', 'El oro es un metal — como el Al y el Cu es insoluble y conduce.') },
    { id: 'q_unknown_ionic',
      prompt: L('A mystery solid does not light the bulb. When you add it to water it disappears, and the solution DOES light the bulb. What kinds of atoms is it most likely made of?', 'Un sólido misterioso no enciende el foco. Al agregarlo al agua desaparece, y la solución SÍ enciende el foco. ¿De qué tipos de átomos es más probable que esté hecho?'),
      choices: [L('Only metal atoms', 'Solo átomos de metal'), L('Only nonmetal atoms', 'Solo átomos de no metales'), L('Metal atoms together with nonmetal atoms', 'Átomos de metal junto con átomos de no metales'), L('Carbon, hydrogen, and oxygen only', 'Solo carbono, hidrógeno y oxígeno')],
      correct: 2,
      explanation: L('Dissolves and then conducts: the pattern for metal + nonmetal compounds, like NaCl.', 'Se disuelve y luego conduce: el patrón de los compuestos de metal + no metal, como el NaCl.') },
    { id: 'q_unknown_insoluble',
      prompt: L('Another mystery solid does not light the bulb, and it does not dissolve in water. What kinds of atoms is it most likely made of?', 'Otro sólido misterioso no enciende el foco y no se disuelve en agua. ¿De qué tipos de átomos es más probable que esté hecho?'),
      choices: [L('Only metal atoms', 'Solo átomos de metal'), L('Metal atoms together with nonmetal atoms', 'Átomos de metal junto con átomos de no metales'), L('Only nonmetal atoms', 'Solo átomos de no metales'), L('It could be any kind of atoms', 'Podría ser cualquier tipo de átomos')],
      correct: 2,
      explanation: L('Metals would light the bulb, and metal + nonmetal compounds dissolve. Like sand and wax, it is probably made of only nonmetal atoms.', 'Los metales encenderían el foco, y los compuestos de metal + no metal se disuelven. Como la arena y la cera, probablemente esté hecho solo de átomos de no metales.') },
    { id: 'q_which_dissolved',
      prompt: L('Which of these will light the bulb once it is dissolved in water?', '¿Cuál de estas encenderá el foco una vez disuelta en agua?'),
      choices: [L('C₂H₆O (ethanol)', 'C₂H₆O (etanol)'), L('C₁₂H₂₂O₁₁ (sugar)', 'C₁₂H₂₂O₁₁ (azúcar)'), L('C₃H₈O (isopropanol)', 'C₃H₈O (isopropanol)'), L('KBr (potassium bromide)', 'KBr (bromuro de potasio)')],
      correct: 3,
      explanation: L('K is a metal and Br is a nonmetal. The other three are made of only nonmetal atoms.', 'K es un metal y Br es un no metal. Las otras tres están hechas solo de átomos de no metales.') },
    { id: 'q_which_dry',
      prompt: L('Which of these will light the bulb as a DRY solid, before any water is added?', '¿Cuál de estas encenderá el foco como sólido SECO, antes de agregar agua?'),
      choices: [L('NaCl (salt)', 'NaCl (sal)'), L('Zn (zinc metal)', 'Zn (zinc metálico)'), L('CaCl₂ (calcium chloride)', 'CaCl₂ (cloruro de calcio)'), L('SiO₂ (sand)', 'SiO₂ (arena)')],
      correct: 1,
      explanation: L('Only the metal conducts as a solid. Metal + nonmetal compounds like NaCl and CaCl₂ only conduct once dissolved.', 'Solo el metal conduce como sólido. Los compuestos de metal + no metal como el NaCl y el CaCl₂ solo conducen una vez disueltos.') },
    { id: 'q_rinse',
      prompt: L('Why must you rinse and dry the probes after testing a solution?', '¿Por qué debes enjuagar y secar las puntas después de probar una solución?'),
      choices: [L('To keep the battery from running out', 'Para que la batería no se agote'), L('So leftover solution doesn\'t make the next substance look like it conducts when it doesn\'t', 'Para que la solución sobrante no haga parecer que la siguiente sustancia conduce cuando no es así'), L('Because water makes the bulb brighter', 'Porque el agua hace que el foco brille más'), L('It doesn\'t matter — it\'s just neatness', 'No importa — es solo orden')],
      correct: 1,
      explanation: L('A conducting solution left on the probes would complete the circuit and give a false result — good lab technique protects your data.', 'Una solución conductora que quede en las puntas completaría el circuito y daría un resultado falso — una buena técnica de laboratorio protege tus datos.') }
  ];

  // ---------------------------------------------------------------- state
  function defaultState() {
    return {
      v: 2, goggles: 0, joints: [0, 0, 0, 0], tested: 0,
      demo: { ack: 0, a: 0, w: 0, b: 0 },
      main: { ack: 0, prog: {}, cur: 0 },
      sort: {}, sortErr: 0, anaA: 0, atoms: {}, atomErr: 0, anaB: 0,
      myst: { ack: 0, prog: {}, cur: 0 },
      done: new Array(SECTION_COUNT).fill(0)
    };
  }
  function loadState(progress) {
    const d = defaultState();
    const first = progress && progress.answers && progress.answers[0];
    if (first && first.questionId === '_lab' && first.state && first.state.v === 2) {
      const s = first.state;
      Object.keys(d).forEach(k => {
        if (s[k] === undefined) return;
        const isObj = d[k] && typeof d[k] === 'object' && !Array.isArray(d[k]);
        d[k] = isObj ? Object.assign(d[k], s[k]) : s[k];
      });
    }
    ensureStore(d.main); ensureStore(d.myst);
    if (!Array.isArray(d.done) || d.done.length !== SECTION_COUNT) d.done = new Array(SECTION_COUNT).fill(0);
    return d;
  }

  // ---------------------------------------------------------------- main render
  function render(host, ctx) {
    ensureStylesInjected();
    const lang = getLang();
    const _ = T(lang);
    const progress0 = ctx.getProgress();
    const S = loadState(progress0);
    let Q = ((progress0 && progress0.answers) || []).filter(a => a && a.questionId !== '_lab');
    const shared = { wet: false };
    const mounted = new Array(SECTION_COUNT).fill(false);
    let saveTimer = null;

    function buildRecord() {
      const cur = ctx.getProgress() || {};
      const rec = {
        status: (cur.status === 'completed' && Q.length >= QUESTIONS.length) ? 'completed' : 'in_progress',
        score: Q.filter(a => a.correct).length,
        totalQuestions: QUESTIONS.length,
        answers: [{ questionId: '_lab', state: S }].concat(Q)
      };
      if (rec.status === 'completed' && cur.code) rec.code = cur.code;
      return rec;
    }
    function save(now) {
      clearTimeout(saveTimer);
      const run = () => { saveTimer = null; ctx.saveProgress(buildRecord()); };
      if (now) run(); else saveTimer = setTimeout(run, 450);
    }
    function flushSave() { if (saveTimer) save(true); }

    const gates = [
      () => !!S.goggles,
      () => S.joints.every(Boolean) && !!S.tested,
      () => !!(S.demo.ack && S.demo.a && S.demo.w && S.demo.b),
      () => !!S.main.ack,
      () => allStationsDone(SUBS, S.main),
      () => Object.keys(S.sort).length === SUBS.length,
      () => !!S.anaA && Object.keys(S.atoms).length === SUBS.length && !!S.anaB,
      () => !!S.myst.ack && allStationsDone(MYST, S.myst)
    ];
    const gateHints = [
      _('Put on your goggles to continue.', 'Ponte las gafas para continuar.'),
      _('Make all four connections, then touch the probes together to test your tester.', 'Haz las cuatro conexiones y luego junta las puntas para probar tu probador.'),
      _('Write your 3 predictions in your packet, check the box, then run all three steps of the demo.', 'Escribe tus 3 predicciones en tu paquete, marca la casilla y luego completa los tres pasos de la demostración.'),
      _('Write all your predictions in your packet, then check the box.', 'Escribe todas tus predicciones en tu paquete y luego marca la casilla.'),
      _('Test all ten stations (and write each result in your packet).', 'Prueba las diez estaciones (y escribe cada resultado en tu paquete).'),
      _('Sort every substance into one of the four boxes.', 'Clasifica cada sustancia en una de las cuatro cajas.'),
      _('Answer Q1–Q4 in your packet, sort all ten by atom type, then write Q5–Q6 and check the boxes.', 'Responde P1–P4 en tu paquete, clasifica las diez por tipo de átomo y luego escribe P5–P6 y marca las casillas.'),
      _('Write your predictions in your packet, check the box, then test all four new substances.', 'Escribe tus predicciones en tu paquete, marca la casilla y luego prueba las cuatro sustancias nuevas.')
    ];
    function prereq(i) { return i === 0 || gates[i - 1](); }

    // ---- narrative HTML for each section (interactive bits are mounted lazily)
    const P = (en, es) => escapeHtml(_(en, es));
    const SECTIONS = [
      { title: _('Mission Briefing', 'Informe de la Misión'), time: _('3 min', '3 min'), num: '★',
        html: `
        <h2>${P('You Light Up My Life: Classifying Substances', 'You Light Up My Life: Clasificando sustancias')}</h2>
        <div class="cl-write"><div class="cl-write-tag">✏️ ${P('How this lab works', 'Cómo funciona este laboratorio')}</div>
          <p><strong>${P('This virtual lab replaces the hands-on lab. You do the testing here, and you record everything in your PACKET — the Lesson 25 lab worksheet.', 'Este laboratorio virtual reemplaza el laboratorio práctico. Haces las pruebas aquí y anotas todo en tu PAQUETE — la hoja de trabajo del laboratorio de la Lección 25.')}</strong></p>
          <p>${P('Keep your packet open next to this screen. Whenever you see an orange box like this one, it tells you exactly what to write and where. Write your name, date, and period on your packet now.', 'Mantén tu paquete abierto junto a esta pantalla. Cuando veas una caja naranja como esta, te dice exactamente qué escribir y dónde. Escribe ahora tu nombre, fecha y período en tu paquete.')}</p></div>
        <p><strong>${P('Purpose:', 'Propósito:')}</strong> ${P('collect evidence about some properties of substances, then look for patterns in the results.', 'reunir evidencia sobre algunas propiedades de las sustancias y buscar patrones en los resultados.')}</p>
        <p><strong>${P('Guiding question:', 'Pregunta guía:')}</strong> ${P('How can substances be sorted into general categories?', '¿Cómo se pueden clasificar las sustancias en categorías generales?')}</p>
        <h3>🎯 ${P('Learning targets', 'Objetivos de aprendizaje')}</h3>
        <ul class="objectives-list">
          <li><span class="obj-check">✓</span><span>${P('I can classify substances into four categories based on solubility and conductivity.', 'Puedo clasificar sustancias en cuatro categorías según su solubilidad y conductividad.')}</span></li>
          <li><span class="obj-check">✓</span><span>${P('I can explain the difference between the terms soluble and insoluble.', 'Puedo explicar la diferencia entre los términos soluble e insoluble.')}</span></li>
          <li><span class="obj-check">✓</span><span>${P('I can begin to describe the atomic makeup of substances based on whether they dissolve and/or conduct electricity.', 'Puedo empezar a describir la composición atómica de las sustancias según si se disuelven y/o conducen electricidad.')}</span></li>
        </ul>
        <div class="note-box"><span class="note-icon">⚠️</span><span><strong>${P('Safety:', 'Seguridad:')}</strong> ${P('In a real lab, safety goggles are worn at all times. In this virtual lab, you still need to suit up before you start.', 'En un laboratorio real, las gafas de seguridad se usan siempre. En este laboratorio virtual, igual tienes que ponértelas antes de empezar.')}</span></div>
        <div class="cl-mount" data-mount="0"></div>` },
      { title: _('Build Your Conductivity Tester', 'Construye tu Probador de Conductividad'), time: _('3 min', '3 min'), num: '01',
        html: `
        <p>${P('Conductivity describes how well a substance lets electricity flow through it. Your tester is a simple circuit: a 9-volt battery, a bulb, and two wires with stripped ends (the probes). Electricity can only flow if the circuit is complete — so the bulb is your detector.', 'La conductividad describe qué tan bien una sustancia deja pasar la electricidad. Tu probador es un circuito simple: una batería de 9 voltios, un foco y dos cables con extremos pelados (las puntas). La electricidad solo fluye si el circuito está completo — por eso el foco es tu detector.')}</p>
        <div class="cl-mount" data-mount="1"></div>` },
      { title: _('Demo: Sports Drink Powder', 'Demostración: Bebida Deportiva en Polvo'), time: _('3 min', '3 min'), num: '02',
        html: `
        <p>${P('Before the full lab, watch one substance closely. Powdered sports drink is a mix of water-loving ingredients. You will test it just like every station: ① touch the probes to the dry powder, ② add water and watch, ③ test the solution.', 'Antes del laboratorio completo, observa una sustancia con atención. La bebida deportiva en polvo es una mezcla de ingredientes que aman el agua. La probarás como en cada estación: ① toca el polvo seco con las puntas, ② agrega agua y observa, ③ prueba la solución.')}</p>
        <div class="cl-mount" data-mount="2"></div>` },
      { title: _('Make Your Predictions', 'Haz tus Predicciones'), time: _('3 min', '3 min'), num: '03',
        html: `
        <p>${P('Use what you already know. There are no wrong predictions — only evidence to compare them against.', 'Usa lo que ya sabes. No hay predicciones incorrectas — solo evidencia con la cual compararlas.')}</p>
        <div class="cl-mount" data-mount="3"></div>` },
      { title: _('The Lab: Ten Stations', 'El Laboratorio: Diez Estaciones'), time: _('12 min', '12 min'), num: '04',
        html: `
        <p>${P('Time to collect data. You choose the order of the stations, but do every one. The bench only shows you what happens — YOU are the one who records it, in your packet.', 'Es hora de reunir datos. Tú eliges el orden de las estaciones, pero haz todas. La mesa solo te muestra lo que pasa — TÚ eres quien lo anota, en tu paquete.')}</p>
        <div class="cl-mount" data-mount="4"></div>` },
      { title: _('Sort It Out', 'A Clasificar'), time: _('3 min', '3 min'), num: '05',
        html: `
        <p>${P('Every substance you tested fits one of four categories, depending on whether it dissolves in water and whether it conducts electricity. Use the Test Results in your packet to sort all ten. Click a substance, then click a box — or drag it there.', 'Cada sustancia que probaste encaja en una de cuatro categorías, según si se disuelve en agua y si conduce electricidad. Usa los Resultados de tu paquete para clasificar las diez. Haz clic en una sustancia y luego en una caja — o arrástrala.')}</p>
        <div class="cl-mount" data-mount="5"></div>` },
      { title: _('Analysis & the Atoms Behind the Pattern', 'Análisis y los Átomos Detrás del Patrón'), time: _('8 min', '8 min'), num: '06',
        html: `
        <p>${P('Now you look for patterns in YOUR data. Your packet\'s Analysis questions come first; the sort below helps you check your thinking.', 'Ahora buscas patrones en TUS datos. Primero van las preguntas de Análisis de tu paquete; la clasificación de abajo te ayuda a verificar tu razonamiento.')}</p>
        <div class="cl-mount" data-mount="6"></div>` },
      { title: _('Test Your Rule', 'Prueba tu Regla'), time: _('5 min', '5 min'), num: '07',
        html: `
        <p>${P('A good scientific rule predicts things you haven\'t tested yet. Here are four new substances. Look at each formula, use your rule to predict, then test them and see if your rule holds.', 'Una buena regla científica predice cosas que aún no has probado. Aquí hay cuatro sustancias nuevas. Mira cada fórmula, usa tu regla para predecir y luego pruébalas para ver si tu regla funciona.')}</p>
        <div class="cl-mount" data-mount="7"></div>` }
    ];

    const sectionsHtml = SECTIONS.map((sec, i) => `
      <div class="section-card" id="cl-sec-${i}" data-section="${i}">
        <div class="section-header" data-toggle="${i}">
          <span class="section-num">${sec.num}</span>
          <span class="section-title">${escapeHtml(sec.title)}</span>
          <span class="section-time">${escapeHtml(sec.time)}</span>
          <span class="section-arrow">▼</span>
        </div>
        <div class="section-body">
          ${sec.html}
          <button type="button" class="mark-done-btn" data-continue="${i}" disabled>${escapeHtml(_('Continue →', 'Continuar →'))}</button>
          <p class="cl-gate-hint" data-gatehint="${i}"></p>
        </div>
      </div>`).join('');

    host.innerHTML = `
      <div class="cl-lesson">
        <div class="cl-header">
          <div class="cl-lang-toggle" role="group" aria-label="${escapeHtml(_('Language', 'Idioma'))}">
            <button type="button" class="cl-lang-btn${lang === 'en' ? ' active' : ''}" data-lang="en">EN</button>
            <button type="button" class="cl-lang-btn${lang === 'es' ? ' active' : ''}" data-lang="es">ES</button>
          </div>
          <div class="cl-header-label">${escapeHtml(_('Chapter 5 · Building with Matter · Lesson 25', 'Capítulo 5 · Construyendo con la Materia · Lección 25'))}</div>
          <h1>${escapeHtml(ctx.activity.title)}</h1>
          <div class="cl-header-meta">${escapeHtml(_('Virtual Lab · ~40 Minutes · Test here, record in your packet', 'Laboratorio Virtual · ~40 Minutos · Prueba aquí, anota en tu paquete'))}</div>
        </div>
        <div class="cl-progress-wrap">
          <span class="cl-progress-label">${escapeHtml(_('Progress', 'Progreso'))}</span>
          <div class="cl-progress-track"><div class="cl-progress-fill" id="cl-progress-fill"></div></div>
          <span class="cl-progress-count" id="cl-progress-count"></span>
        </div>
        <main>
          ${sectionsHtml}
          <div class="section-card" id="cl-sec-${QUIZ_INDEX}" data-section="${QUIZ_INDEX}">
            <div class="section-header" data-toggle="${QUIZ_INDEX}">
              <span class="section-num">✓</span>
              <span class="section-title">${escapeHtml(_('Check for Understanding', 'Comprobación de Comprensión'))}</span>
              <span class="section-time">${escapeHtml(_('5 min · graded', '5 min · calificado'))}</span>
              <span class="section-arrow">▼</span>
            </div>
            <div class="section-body">
              <div class="quiz-note">${_('Your packet holds your lab data and analysis. This short check is different: it <strong>saves your score</strong> and reports it to your teacher, and it asks you to apply what you found to NEW substances. You can retake it any time; your most recent attempt is what\'s saved.', 'Tu paquete contiene tus datos y análisis del laboratorio. Esta breve comprobación es diferente: <strong>guarda tu puntaje</strong> y se lo reporta a tu maestro, y te pide aplicar lo que encontraste a sustancias NUEVAS. Puedes repetirla en cualquier momento; se guarda tu intento más reciente.')}</div>
              <div class="cl-mount" data-mount="${QUIZ_INDEX}"></div>
            </div>
          </div>
        </main>
      </div>`;
    const root = host.querySelector('.cl-lesson');
    const mountEl = i => root.querySelector(`[data-mount="${i}"]`);

    // ---- progress / gate UI
    function doneCount() { return S.done.filter(Boolean).length + (Q.length >= QUESTIONS.length ? 1 : 0); }
    function updateUI() {
      const n = doneCount();
      root.querySelector('#cl-progress-fill').style.width = Math.round((n / SECTION_COUNT) * 100) + '%';
      root.querySelector('#cl-progress-count').textContent = _(`${n} / ${SECTION_COUNT} sections`, `${n} / ${SECTION_COUNT} secciones`);
      SECTIONS.forEach((sec, i) => {
        const btn = root.querySelector(`[data-continue="${i}"]`);
        const hint = root.querySelector(`[data-gatehint="${i}"]`);
        const ok = gates[i]();
        root.querySelector(`#cl-sec-${i}`).classList.toggle('done', !!S.done[i]);
        if (S.done[i]) { btn.textContent = _('✓ Section complete', '✓ Sección completa'); btn.disabled = true; hint.textContent = ''; return; }
        btn.textContent = _('Continue →', 'Continuar →');
        btn.disabled = !ok;
        hint.textContent = ok ? '' : gateHints[i];
      });
      root.querySelector(`#cl-sec-${QUIZ_INDEX}`).classList.toggle('done', Q.length >= QUESTIONS.length);
    }
    function onLabChange(now) { updateUI(); save(now === true); }

    // ---- section open / lazy mount
    function ensureMounted(i) {
      const m = mountEl(i);
      if (!m) return;
      if (!prereq(i)) {
        mounted[i] = false;
        m.innerHTML = `<div class="cl-lock">🔒 ${escapeHtml(_('Finish the previous section first — you need its results for this one.', 'Termina primero la sección anterior — necesitas sus resultados para esta.'))}<br><button type="button" class="cl-btn secondary" style="margin-top:0.6rem" data-goto="${i - 1}">${escapeHtml(_('Go to previous section', 'Ir a la sección anterior'))}</button></div>`;
        return;
      }
      if (mounted[i]) return;
      mounted[i] = true;
      MOUNTS[i](m);
    }
    function openSection(i, scroll) {
      const card = root.querySelector(`#cl-sec-${i}`);
      if (!card) return;
      card.querySelector('.section-body').classList.add('open');
      card.querySelector('.section-header').classList.add('open');
      ensureMounted(i);
      if (scroll) card.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    root.querySelectorAll('[data-toggle]').forEach(el => {
      el.addEventListener('click', () => {
        const i = Number(el.getAttribute('data-toggle'));
        const card = root.querySelector(`#cl-sec-${i}`);
        const body = card.querySelector('.section-body');
        const open = body.classList.contains('open');
        body.classList.toggle('open', !open); el.classList.toggle('open', !open);
        if (!open) ensureMounted(i);
      });
    });
    root.addEventListener('click', e => {
      const g = e.target.closest('[data-goto]');
      if (g) { openSection(Number(g.getAttribute('data-goto')), true); return; }
      const c = e.target.closest('[data-continue]');
      if (c && !c.disabled) {
        const i = Number(c.getAttribute('data-continue'));
        S.done[i] = 1; updateUI(); save(true);
        setTimeout(() => openSection(i + 1, true), 250);
      }
    });
    root.querySelectorAll('[data-lang]').forEach(btn => {
      btn.addEventListener('click', () => {
        const nl = btn.getAttribute('data-lang');
        if (nl === lang) return;
        flushSave(); setLang(nl); render(host, ctx);
      });
    });

    // ---------------------------------------------------------------- section mounts
    function mount0(m) {
      function paint() {
        m.innerHTML = `
          <h3>${P('Suit up', 'Prepárate')}</h3>
          <div class="cl-row"><button type="button" class="cl-btn${S.goggles ? ' on' : ''}" data-goggles>${escapeHtml(S.goggles ? _('🥽 Goggles ON — you\'re ready', '🥽 Gafas puestas — estás listo') : _('🥽 Put on safety goggles', '🥽 Ponerme las gafas de seguridad'))}</button></div>
          <h3>${P('ChemCatalyst — think and talk', 'ChemCatalyst — piensa y conversa')}</h3>
          <div class="cl-q"><p>${P('1. If you dropped a spoonful of salt, NaCl, into a glass of water, what would happen?', '1. Si dejaras caer una cucharada de sal, NaCl, en un vaso con agua, ¿qué pasaría?')}</p>
            <p>${P('2. If you dropped a gold ring into a glass of water, what would happen?', '2. Si dejaras caer un anillo de oro en un vaso con agua, ¿qué pasaría?')}</p>
            <p>${P('3. What do you think is different about the atoms of these two substances? Why do you suppose the gold atoms do not break apart?', '3. ¿Qué crees que es diferente en los átomos de estas dos sustancias? ¿Por qué crees que los átomos de oro no se separan?')}</p>
            <p class="cl-tip">${P('Discuss with your partner or answer where your teacher directs. Nothing to enter on this screen.', 'Conversa con tu compañero o responde donde tu maestro te indique. No hay nada que ingresar en esta pantalla.')}</p></div>
          <div class="concept-box"><div class="concept-label">${P('Key words', 'Palabras clave')}</div>
            <p><strong>${P('dissolve', 'disolver')}</strong> — ${P('to disperse evenly into another substance (like a solid spreading out through a liquid).', 'dispersarse de manera uniforme en otra sustancia (como un sólido que se esparce en un líquido).')}<br>
            <strong>${P('conductivity', 'conductividad')}</strong> — ${P('how well a substance lets electricity flow through it.', 'qué tan bien una sustancia deja pasar la electricidad.')}</p></div>`;
        m.querySelector('[data-goggles]').addEventListener('click', () => { S.goggles = S.goggles ? 0 : 1; paint(); onLabChange(); });
      }
      paint();
    }

    function mount1(m) {
      const uid = 'asm' + Math.random().toString(36).slice(2, 6);
      const STEPS = [
        _('Snap the 9-volt connector onto the battery.', 'Conecta el broche de 9 voltios a la batería.'),
        _('Connect the battery\'s + terminal to the bulb.', 'Conecta el terminal + de la batería al foco.'),
        _('Connect the bulb to the first probe wire (red).', 'Conecta el foco al primer cable de punta (rojo).'),
        _('Connect the second probe wire (blue) to the battery\'s − terminal.', 'Conecta el segundo cable de punta (azul) al terminal − de la batería.')
      ];
      m.innerHTML = `
        <p class="cl-tip">${escapeHtml(_('Click each pulsing green circle to make that connection (any order).', 'Haz clic en cada círculo verde que pulsa para hacer esa conexión (en cualquier orden).'))}</p>
        <ol data-steps></ol>
        <div class="cl-bench">${benchSvg({ uid, assembly: true, joints: S.joints, beakers: [], aria: _('Conductivity tester assembly', 'Armado del probador de conductividad') })}
          <div class="cl-bulbread" aria-live="polite"></div>
          <div class="cl-bench-actions"><button type="button" class="cl-btn" data-touch disabled>${escapeHtml(_('Touch the probe ends together', 'Juntar las puntas'))}</button><button type="button" class="cl-btn secondary" data-apart disabled>${escapeHtml(_('Pull them apart', 'Separarlas'))}</button></div>
          <div class="cl-log" data-log></div></div>
        <div class="concept-box"><div class="concept-label">${escapeHtml(_('How it works', 'Cómo funciona'))}</div>
          <p>${escapeHtml(_('The bulb lights only when electricity can flow all the way around the circuit. When you touch the two probes to a substance, the substance becomes part of the circuit. If it lets electricity through, the bulb lights. If it doesn\'t, the circuit stays open and the bulb stays dark.', 'El foco solo se enciende cuando la electricidad puede fluir por todo el circuito. Cuando tocas una sustancia con las dos puntas, la sustancia se vuelve parte del circuito. Si deja pasar la electricidad, el foco se enciende. Si no, el circuito sigue abierto y el foco se queda apagado.'))}</p></div>`;
      const ctl = benchController(m, lang);
      const svg = ctl.svg;
      const bulbRead = m.querySelector('.cl-bulbread');
      const logEl = m.querySelector('[data-log]');
      const touchBtn = m.querySelector('[data-touch]'), apartBtn = m.querySelector('[data-apart]');
      const SHOW = [['.cl-snap'], ['.cl-w1', '.cl-f1'], ['.cl-w2', '.cl-f2', '.cl-tip1'], ['.cl-w3', '.cl-f3', '.cl-tip2']];
      function applyJoints() {
        SHOW.forEach((sels, i) => {
          sels.forEach(s => { const el = svg.querySelector(s); if (el) el.style.display = S.joints[i] ? '' : 'none'; });
          const jc = svg.querySelector(`[data-joint="${i}"]`); if (jc) jc.style.display = S.joints[i] ? 'none' : '';
        });
        m.querySelector('[data-steps]').innerHTML = STEPS.map((s, i) => `<li>${S.joints[i] ? '✅ ' : '⬜ '}${escapeHtml(s)}</li>`).join('');
        const all = S.joints.every(Boolean);
        touchBtn.disabled = !all; apartBtn.disabled = !all;
        ctl.draw();
      }
      svg.addEventListener('click', e => {
        const j = e.target.closest('[data-joint]');
        if (!j) return;
        S.joints[Number(j.getAttribute('data-joint'))] = 1;
        applyJoints(); onLabChange();
        if (S.joints.every(Boolean)) logEl.textContent = _('Circuit built! Now test it: touch the two probe ends together.', '¡Circuito armado! Ahora pruébalo: junta las dos puntas.');
      });
      touchBtn.addEventListener('click', async () => {
        touchBtn.disabled = apartBtn.disabled = true;
        await ctl.tween(TOGETHER1, TOGETHER2, 600);
        ctl.setLit(true, 1);
        bulbRead.textContent = _('💡 Bulb: glowing', '💡 Foco: encendido'); bulbRead.classList.add('on');
        logEl.textContent = _('The probes touching each other complete the circuit — electricity flows through the wires and lights the bulb. Your tester works!', 'Las puntas al tocarse completan el circuito — la electricidad fluye por los cables y enciende el foco. ¡Tu probador funciona!');
        S.tested = 1; touchBtn.disabled = apartBtn.disabled = false; onLabChange(); save(true);
      });
      apartBtn.addEventListener('click', async () => {
        touchBtn.disabled = apartBtn.disabled = true;
        ctl.setLit(false);
        bulbRead.textContent = _('💡 Bulb: not glowing', '💡 Foco: no se enciende'); bulbRead.classList.remove('on');
        await ctl.tween(REST1, REST2, 500);
        logEl.textContent = _('Probes apart = open circuit = no flow = dark bulb. That\'s what you\'ll look for with each substance.', 'Puntas separadas = circuito abierto = no hay flujo = foco apagado. Eso es lo que buscarás con cada sustancia.');
        touchBtn.disabled = apartBtn.disabled = false;
      });
      applyJoints();
    }

    function mount2(m) {
      m.innerHTML = `<div data-dw></div><div data-da></div><div data-db></div><div data-dr></div>`;
      const db = m.querySelector('[data-db]'), dr = m.querySelector('[data-dr]');
      m.querySelector('[data-dw]').innerHTML = writeBox(_('Predict first — in your packet', 'Predice primero — en tu paquete'), `
        <p><strong>${P('Before you touch anything, write 3 predictions in the margin of your packet:', 'Antes de tocar nada, escribe 3 predicciones en el margen de tu paquete:')}</strong></p>
        <ol><li>${P('Will the DRY powder light the bulb? (Yes / No)', '¿El polvo SECO encenderá el foco? (Sí / No)')}</li>
        <li>${P('Will the powder dissolve in water? (Yes / No)', '¿El polvo se disolverá en agua? (Sí / No)')}</li>
        <li>${P('Will the powder dissolved in water light the bulb? (Yes / No)', '¿El polvo disuelto en agua encenderá el foco? (Sí / No)')}</li></ol>`);
      let started = false;
      function startBench() {
        if (started || !S.demo.ack) return;
        started = true;
        createBench(db, { sub: SPORTS, st: S.demo, lang, shared, onChange: () => { paintResult(); onLabChange(); } });
      }
      function paintResult() {
        const d = S.demo;
        dr.innerHTML = (d.a && d.w && d.b) ? `<div class="cl-result"><p><strong>${P('Check your predictions:', 'Revisa tus predicciones:')}</strong> ${P('compare what you wrote with what you saw.', 'compara lo que escribiste con lo que viste.')}</p><p style="margin:0"><strong>${P('Notice:', 'Observa:')}</strong> ${P('the dry powder did NOT light the bulb, but once dissolved the solution DID. Dissolving changed something. Hold that thought — you\'ll need it.', 'el polvo seco NO encendió el foco, pero una vez disuelto la solución SÍ. Disolver cambió algo. Ten presente esa idea — la necesitarás.')}</p></div>` : '';
      }
      mountAck(m.querySelector('[data-da]'), { lang, label: _('I wrote my 3 predictions in my packet.', 'Escribí mis 3 predicciones en mi paquete.'), checked: !!S.demo.ack, onToggle: v => { S.demo.ack = v ? 1 : 0; if (v) startBench(); onLabChange(); } });
      startBench(); paintResult();
    }

    function mount3(m) {
      mountPackList(m, SUBS, S.main, { lang, onChange: onLabChange,
        ackLabel: _('I wrote a prediction for all ten substances in my packet.', 'Escribí una predicción para las diez sustancias en mi paquete.'),
        writeHtml: writeBox(_('Fill in the Predictions columns of your packet', 'Llena las columnas de Predicciones de tu paquete'), `
          <p><strong>${P('For EACH of the ten substances below, write Yes or No in BOTH Predictions columns:', 'Para CADA una de las diez sustancias de abajo, escribe Sí o No en AMBAS columnas de Predicciones:')}</strong></p>
          <ul><li><u>${P('Conduct?', '¿Conduce?')}</u> — ${P('will the pure substance light the bulb?', '¿la sustancia pura encenderá el foco?')}</li>
          <li><u>${P('Dissolve?', '¿Se disuelve?')}</u> — ${P('will it dissolve in water?', '¿se disolverá en agua?')}</li></ul>
          <p>${P('The Dissolve? box for distilled water is already filled in on your packet (yes). Do this BEFORE testing, and do not change a prediction afterward.', 'La casilla ¿Se disuelve? del agua destilada ya está llena en tu paquete (sí). Hazlo ANTES de probar y no cambies ninguna predicción después.')}</p>`) });
    }
    function mount4(m) {
      mountLab(m, SUBS, S.main, { lang, shared, onChange: onLabChange });
    }

    function binOf(sub) { return sub.d ? (sub.cd ? 'SC' : 'SN') : (sub.c ? 'IC' : 'IN'); }
    function itemHtml(sub) { return `${sub.f || ''}<small>${escapeHtml(tr(sub.name, lang))}</small>`; }
    function mount5(m) {
      m.innerHTML = `<div data-sorter></div><div data-reveal></div>`;
      function reveal() {
        m.querySelector('[data-reveal]').innerHTML = `
          <div class="concept-box"><div class="concept-label">${P('Two new words', 'Dos palabras nuevas')}</div>
            <p><strong>${P('Soluble', 'Soluble')}</strong> — ${P('capable of being dissolved in another substance. (Right-hand column.)', 'capaz de disolverse en otra sustancia. (Columna derecha.)')}<br>
            <strong>${P('Insoluble', 'Insoluble')}</strong> — ${P('incapable of being dissolved in another substance. (Left-hand column.)', 'incapaz de disolverse en otra sustancia. (Columna izquierda.)')}</p></div>
          ${writeBox(_('In your packet — Analysis Q2', 'En tu paquete — Análisis P2'), `<p>${P('Look at the two right-hand boxes (the soluble substances). Copy them into the table in Question 2: the ones that CONDUCT when dissolved go in the left column, the ones that DON\'T go in the right column.', 'Mira las dos cajas de la derecha (las sustancias solubles). Cópialas en la tabla de la Pregunta 2: las que CONDUCEN al disolverse van en la columna izquierda, las que NO conducen van en la columna derecha.')}</p>`)}
          <div class="note-box"><span class="note-icon">💭</span><span>${P('Look at the two conducting boxes. Metals conduct as solids. The others only conduct after they dissolve. Hmm — why might that be? Keep reading.', 'Mira las dos cajas que conducen. Los metales conducen como sólidos. Los demás solo conducen después de disolverse. Mmm — ¿por qué será? Sigue leyendo.')}</span></div>`;
      }
      const bins = [
        { id: 'IC', title: _('Insoluble', 'Insoluble') + ' · ' + _('Conducts', 'Conduce'), sub: _('does not dissolve · lights bulb', 'no se disuelve · enciende el foco') },
        { id: 'SC', title: _('Soluble', 'Soluble') + ' · ' + _('Conducts', 'Conduce'), sub: _('dissolves · solution lights bulb', 'se disuelve · la solución enciende el foco') },
        { id: 'IN', title: _('Insoluble', 'Insoluble') + ' · ' + _('No conduction', 'No conduce'), sub: _('does not dissolve · bulb stays dark', 'no se disuelve · foco apagado') },
        { id: 'SN', title: _('Soluble', 'Soluble') + ' · ' + _('No conduction', 'No conduce'), sub: _('dissolves · solution keeps bulb dark', 'se disuelve · la solución deja el foco apagado') }
      ];
      mountSorter(m.querySelector('[data-sorter]'), {
        lang, items: SUBS.map(s => ({ id: s.id, html: itemHtml(s), bin: binOf(s) })), bins, placed: S.sort,
        onChange: () => onLabChange(),
        onWrong: () => { S.sortErr++; },
        hint: it => _('Not quite. Check the Test Results in your packet for this one: did it dissolve in water? Did it light the bulb (as a solid, or once dissolved)?', 'No exactamente. Revisa los Resultados en tu paquete para esta: ¿se disolvió en agua? ¿Encendió el foco (como sólido, o una vez disuelta)?'),
        onDone: reveal
      });
      if (gates[5]()) reveal();
    }

    function mount6(m) {
      m.innerHTML = `<div data-a1></div><div data-ack1></div><div data-after1></div>`;
      const after1 = m.querySelector('[data-after1]');
      m.querySelector('[data-a1]').innerHTML = writeBox(_('In your packet — Analysis Questions 1–4', 'En tu paquete — Preguntas de Análisis 1–4'), `
        <p><strong>${P('Answer these four questions in your packet NOW, using your data and the formulas of the substances:', 'Responde estas cuatro preguntas en tu paquete AHORA, usando tus datos y las fórmulas de las sustancias:')}</strong></p>
        <ol><li>${P('Which substances conduct electricity but do not dissolve in water? What else do they have in common?', '¿Qué sustancias conducen electricidad pero no se disuelven en agua? ¿Qué más tienen en común?')}</li>
        <li>${P('Finish the table of soluble substances, if you haven\'t already (you started it in the last section).', 'Termina la tabla de sustancias solubles, si aún no lo has hecho (la empezaste en la sección anterior).')}</li>
        <li>${P('What do the substances that conduct once dissolved have in common?', '¿Qué tienen en común las sustancias que conducen al disolverse?')}</li>
        <li>${P('What do the substances that do NOT conduct once dissolved have in common? (Don\'t include water.)', '¿Qué tienen en común las sustancias que NO conducen al disolverse? (No incluyas el agua.)')}</li></ol>
        <p>${P('Hint: look at the atoms in each formula. Are they metals or nonmetals?', 'Pista: mira los átomos de cada fórmula. ¿Son metales o no metales?')}</p>`);
      function stage2() {
        after1.innerHTML = `
        <div class="cl-refbar"><strong>${P('Element reference:', 'Referencia de elementos:')}</strong>
          ${ELEMENTS.map(e => `<span class="cl-el ${e.t}">${e.sym}</span>`).join('')}
          <span class="cl-tip" style="margin:0">${P('blue = metal · orange = nonmetal · gray = metalloid (silicon — treat it as a nonmetal here)', 'azul = metal · naranja = no metal · gris = metaloide (silicio — trátalo como no metal aquí)')}</span></div>
        <p>${P('Now sort the ten substances by the kinds of atoms in their formulas. Then compare the pattern you find with your answers to Q1–Q4 and fix anything in your packet that needs fixing.', 'Ahora clasifica las diez sustancias por los tipos de átomos de sus fórmulas. Luego compara el patrón que encuentres con tus respuestas a P1–P4 y corrige lo que necesites en tu paquete.')}</p>
        <div data-sorter></div><div data-pattern></div><div data-q56></div><div data-zoomwrap></div>`;
        const bins = [
          { id: 'M', title: _('Only metal atoms', 'Solo átomos de metal'), sub: _('every atom is a metal', 'todos los átomos son metales') },
          { id: 'N', title: _('Only nonmetal atoms', 'Solo átomos de no metales'), sub: _('every atom is a nonmetal', 'todos los átomos son no metales') },
          { id: 'MN', title: _('Metal + nonmetal atoms', 'Átomos de metal + no metal'), sub: _('both kinds together', 'ambos tipos juntos') }
        ];
        const patternHtml = () => {
          const f = mk => SUBS.filter(s => s.mk === mk).map(s => s.f || '').join(', ');
          return `<h3>${P('The pattern', 'El patrón')}</h3><div class="cl-tablewrap"><table class="cl-data cl-pat" style="min-width:520px"><thead><tr>
            <th>${P('Atoms in the substance', 'Átomos en la sustancia')}</th><th>${P('Examples you tested', 'Ejemplos que probaste')}</th><th>${P('Dissolve?', '¿Se disuelve?')}</th><th>${P('Conduct?', '¿Conduce?')}</th></tr></thead><tbody>
            <tr><td>${P('Only metal', 'Solo metal')}</td><td>${f('M')}</td><td>${P('No', 'No')}</td><td>${P('Yes — as solids', 'Sí — como sólidos')}</td></tr>
            <tr><td>${P('Only nonmetal', 'Solo no metal')}</td><td>${f('N')}</td><td>${P('Some do, some don\'t', 'Algunas sí, otras no')}</td><td>${P('Never — even when dissolved', 'Nunca — ni disueltas')}</td></tr>
            <tr><td>${P('Metal + nonmetal', 'Metal + no metal')}</td><td>${f('MN')}</td><td>${P('Yes', 'Sí')}</td><td>${P('Not as solids — but YES once dissolved', 'No como sólidos — pero SÍ una vez disueltas')}</td></tr>
            </tbody></table></div>`;
        };
        function afterSort() {
          after1.querySelector('[data-pattern]').innerHTML = patternHtml();
          const q56 = after1.querySelector('[data-q56]');
          q56.innerHTML = writeBox(_('In your packet — Analysis Questions 5 and 6', 'En tu paquete — Preguntas de Análisis 5 y 6'), `
            <p><strong>${P('Write a statement for each, in your own words:', 'Escribe un enunciado para cada una, con tus propias palabras:')}</strong></p>
            <ol start="5"><li>${P('A statement about the substances that DO light up the bulb. (Think: which atoms? Did they need to be dissolved?)', 'Un enunciado sobre las sustancias que SÍ encienden el foco. (Piensa: ¿qué átomos? ¿Necesitaron estar disueltas?)')}</li>
            <li>${P('A statement about the substances that do NOT light up the bulb. (Think: which atoms? What if they are metal + nonmetal but not dissolved?)', 'Un enunciado sobre las sustancias que NO encienden el foco. (Piensa: ¿qué átomos? ¿Y si son metal + no metal pero no están disueltas?)')}</li></ol>` ) + '<div data-ack2></div>';
          mountAck(q56.querySelector('[data-ack2]'), { lang, label: _('I wrote my statements for Questions 5 and 6 in my packet.', 'Escribí mis enunciados de las Preguntas 5 y 6 en mi paquete.'), checked: !!S.anaB, onToggle: v => { S.anaB = v ? 1 : 0; onLabChange(); } });
          const zw = after1.querySelector('[data-zoomwrap]');
          zw.innerHTML = `<div class="concept-box"><div class="concept-label">${P('Why does the pattern work?', '¿Por qué funciona el patrón?')}</div>
            <p>${P('Conducting electricity means charged particles are free to move. Metals have loose electrons. Metal–nonmetal compounds have charged particles (ions) that are stuck in place as a solid but break free when dissolved. Nonmetal-only substances have no loose charges at all. You\'ll study exactly how in Lesson 26.', 'Conducir electricidad significa que hay partículas con carga libres para moverse. Los metales tienen electrones sueltos. Los compuestos de metal y no metal tienen partículas con carga (iones) que están fijas como sólido pero se liberan al disolverse. Las sustancias de solo no metales no tienen cargas sueltas. Estudiarás exactamente cómo en la Lección 26.')}</p></div>
            <div class="cl-row"><button type="button" class="cl-btn secondary" data-zoomtoggle>${P('🔬 Optional: zoom in on the particles (preview of Lesson 26)', '🔬 Opcional: acércate a las partículas (adelanto de la Lección 26)')}</button></div><div data-zoom></div>`;
          zw.querySelector('[data-zoomtoggle]').addEventListener('click', () => {
            const z = zw.querySelector('[data-zoom]');
            if (z.innerHTML) { z.innerHTML = ''; return; }
            mountZoom(z, lang);
          });
          onLabChange();
        }
        mountSorter(after1.querySelector('[data-sorter]'), {
          lang, three: true, items: SUBS.map(s => ({ id: s.id, html: itemHtml(s), bin: s.mk })), bins, placed: S.atoms,
          onChange: () => onLabChange(),
          onWrong: () => { S.atomErr++; },
          hint: it => _('Not quite. Look up each element in the reference bar: which are metals (blue) and which are nonmetals (orange)?', 'No exactamente. Busca cada elemento en la barra de referencia: ¿cuáles son metales (azul) y cuáles no metales (naranja)?'),
          onDone: afterSort
        });
        if (Object.keys(S.atoms).length === SUBS.length) afterSort();
      }
      mountAck(m.querySelector('[data-ack1]'), { lang, label: _('I answered Questions 1–4 in my packet.', 'Respondí las Preguntas 1–4 en mi paquete.'), checked: !!S.anaA, onToggle: v => { S.anaA = v ? 1 : 0; if (v) stage2(); onLabChange(); } });
      if (S.anaA) stage2();
    }

    function mount7(m) {
      m.innerHTML = `<div data-pl></div><div data-ml></div><div data-after></div>`;
      const ml = m.querySelector('[data-ml]'), after = m.querySelector('[data-after]');
      function afterLab() {
        after.innerHTML = allStationsDone(MYST, S.myst) ? writeBox(_('In your packet — Questions 7–9', 'En tu paquete — Preguntas 7–9'), `
          <ol start="7"><li>${P('Predict whether isopropanol, C₃H₈O(l), will conduct electricity. State your reasoning.', 'Predice si el isopropanol, C₃H₈O(l), conducirá electricidad. Explica tu razonamiento.')}</li>
          <li><strong>${P('Making Sense:', 'Dándole sentido:')}</strong> ${P('The sports drink dissolved in water and was a good conductor. What conclusions can you make about the sports drink?', 'La bebida deportiva se disolvió en agua y fue buena conductora. ¿Qué conclusiones puedes sacar sobre la bebida deportiva?')}</li>
          <li><strong>${P('If you finish early:', 'Si terminas temprano:')}</strong> ${P('If it is dangerous to take a bath with a blow dryer, what must also be true about the water in the bathtub?', 'Si es peligroso bañarse con una secadora de cabello, ¿qué más debe ser cierto sobre el agua de la bañera?')}</li></ol>`) : '';
      }
      function startLab() {
        ml.innerHTML = `<h3>${P('Test them', 'Pruébalas')}</h3><div data-lab></div>`;
        mountLab(ml.querySelector('[data-lab]'), MYST, S.myst, { lang, shared, doneTitle: _('✓ All four substances tested!', '✓ ¡Las cuatro sustancias probadas!'), doneText: _('Now compare what you saw with the predictions you wrote. Did your rule hold up? If any prediction was wrong, think about why — then do Questions 7–9 below in your packet.', 'Ahora compara lo que viste con las predicciones que escribiste. ¿Funcionó tu regla? Si alguna predicción fue incorrecta, piensa por qué — y luego haz las Preguntas 7–9 de abajo en tu paquete.'), onChange: () => { afterLab(); onLabChange(); } });
        afterLab();
      }
      mountPackList(m.querySelector('[data-pl]'), MYST, S.myst, { lang, onChange: () => { if (S.myst.ack && !ml.innerHTML) startLab(); onLabChange(); },
        ackLabel: _('I wrote my predictions for all four substances in my packet.', 'Escribí mis predicciones para las cuatro sustancias en mi paquete.'),
        writeHtml: writeBox(_('Predict first — in your packet', 'Predice primero — en tu paquete'), `
          <p><strong>${P('Look at each formula and use your rule. In the margin of your packet (or on scrap paper), write for each substance:', 'Mira cada fórmula y usa tu regla. En el margen de tu paquete (o en papel aparte), escribe para cada sustancia:')}</strong></p>
          <ul><li>${P('Will it conduct as a dry solid? (Yes / No)', '¿Conducirá como sólido seco? (Sí / No)')}</li><li>${P('Will it dissolve? (Yes / No)', '¿Se disolverá? (Sí / No)')}</li><li>${P('Will it conduct when dissolved? (Yes / No / N/A)', '¿Conducirá al disolverse? (Sí / No / N/A)')}</li></ul>`) });
      if (S.myst.ack) startLab();
    }

    // ---- graded check
    function renderQuiz(m) {
      if (Q.length >= QUESTIONS.length && ctx.getProgress() && ctx.getProgress().status === 'completed') { renderSummary(m); return; }
      if (Q.length >= QUESTIONS.length) { finishQuiz(m); return; }
      renderQuestion(m, Q.length);
    }
    function renderQuestion(m, index) {
      const q = QUESTIONS[index];
      const pct = Math.round((index / QUESTIONS.length) * 100);
      m.innerHTML = `
        <div class="quiz-question-count">${escapeHtml(_(`Question ${index + 1} of ${QUESTIONS.length}`, `Pregunta ${index + 1} de ${QUESTIONS.length}`))}</div>
        <div class="quiz-progress-bar"><div class="quiz-progress-fill" style="width:${pct}%"></div></div>
        <p class="quiz-prompt">${escapeHtml(tr(q.prompt, lang))}</p>
        <div data-answers>${q.choices.map((c, i) => `<button type="button" class="cl-choice" data-choice="${i}">${escapeHtml(tr(c, lang))}</button>`).join('')}</div>
        <div data-fb></div><div data-reason></div>
        <button type="button" class="cl-next-btn" data-next style="display:none">${escapeHtml(_('Next Question', 'Siguiente Pregunta'))}</button>`;
      const fb = m.querySelector('[data-fb]'), nextBtn = m.querySelector('[data-next]'), reasonEl = m.querySelector('[data-reason]');
      let submitted = false;
      m.querySelectorAll('[data-choice]').forEach(btn => btn.addEventListener('click', () => {
        if (submitted) return;
        submitted = true;
        const resp = Number(btn.getAttribute('data-choice'));
        const correct = resp === q.correct;
        m.querySelectorAll('[data-choice]').forEach(el => {
          el.disabled = true;
          const v = Number(el.getAttribute('data-choice'));
          if (v === q.correct) el.classList.add('selected-correct'); else if (el === btn) el.classList.add('selected-incorrect');
        });
        fb.innerHTML = `<div class="cl-feedback ${correct ? 'correct' : 'incorrect'}">${correct ? escapeHtml(_('✓ Correct!', '✓ ¡Correcto!')) : escapeHtml(_('✗ Not quite.', '✗ No exactamente.'))} ${escapeHtml(tr(q.explanation, lang))}</div>`;
        const entry = { questionId: q.id, response: resp, correct };
        Q = Q.concat([entry]);
        save(true);
        nextBtn.style.display = 'inline-block';
        nextBtn.addEventListener('click', () => renderQuiz(m), { once: true });
      }));
    }
    async function finishQuiz(m) {
      await ctx.saveProgress(Object.assign(buildRecord(), { status: 'completed' }));
      updateUI();
      renderSummary(m);
    }
    function renderSummary(m) {
      const progress = ctx.getProgress();
      const score = Q.filter(a => a.correct).length;
      const code = progress && progress.code ? progress.code : '';
      m.innerHTML = `
        <div class="cl-summary">
          <div class="cl-score">${score} / ${QUESTIONS.length}</div>
          ${code ? `<p class="cl-code-label">${escapeHtml(_('Your completion code', 'Tu código de finalización'))}</p><div class="cl-code">${escapeHtml(code)}</div>`
                 : `<p><button type="button" class="cl-retake-btn" data-showcode>${escapeHtml(_('Show my code', 'Mostrar mi código'))}</button></p>`}
          <p>${escapeHtml(_('Nice work! You can retake the check any time — your most recent attempt is what\'s saved and sent to your teacher.', '¡Buen trabajo! Puedes repetir la comprobación en cualquier momento — se guarda y se envía a tu maestro tu intento más reciente.'))}</p>
          <div class="note-box" style="text-align:left"><span class="note-icon">➡️</span><span>${escapeHtml(_('Next up — Lesson 26: you\'ll find out HOW atoms are connected to each other, and why that explains these patterns.', 'Lo que sigue — Lección 26: descubrirás CÓMO están conectados los átomos entre sí, y por qué eso explica estos patrones.'))}</span></div>
          <button type="button" class="cl-retake-btn" data-retake>${escapeHtml(_('Retake the check', 'Repetir la comprobación'))}</button>
        </div>`;
      const showBtn = m.querySelector('[data-showcode]');
      if (showBtn) showBtn.addEventListener('click', async () => {
        showBtn.disabled = true;
        await ctx.saveProgress(Object.assign({}, buildRecord(), { status: 'completed' }));
        renderSummary(m);
      });
      m.querySelector('[data-retake]').addEventListener('click', async () => {
        Q = [];
        await ctx.saveProgress({ status: 'in_progress', score: 0, totalQuestions: QUESTIONS.length, answers: [{ questionId: '_lab', state: S }] });
        updateUI(); renderQuiz(m);
      });
    }
    function mount8(m) { renderQuiz(m); }

    const MOUNTS = [mount0, mount1, mount2, mount3, mount4, mount5, mount6, mount7, mount8];

    // ---- initial view: resume at the right place
    updateUI();
    let startAt = 0;
    for (let i = 0; i < SECTIONS.length; i++) { if (!S.done[i]) { startAt = i; break; } startAt = i + 1; }
    openSection(Math.min(startAt, QUIZ_INDEX), false);
    if (Q.length >= QUESTIONS.length) updateUI();
  }

  window.Activities = window.Activities || {};
  window.Activities['conductivity-lab'] = { render };
})();
