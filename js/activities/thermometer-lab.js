// "Lesson 52: Hot Enough — Thermometers" virtual lab (registered as CONTENT activity id
// 'thermometer-lab'). Replaces only the hands-on PROCEDURE of the lab, which is hard to
// build and hard to get clean data from. Students answer the worksheet questions on paper.
//
//   Part 1 (liquid thermometer): put an ethylene glycol vial-and-straw thermometer in five
//   conditions, wait for the liquid to stop moving, and mark the level. A ruler beside the
//   straw gives each mark's height. Temperatures are deliberately NOT shown: students build
//   their own scale from the ice-water and boiling-water marks (worksheet question 3).
//   The "Build your own scale" box under the thermometer lets them pick a number for each
//   of those two marks; the lab then draws that scale beside the straw (ten equal steps
//   between the marks) so they can read their other marks off it. It never states a
//   reading for them.
//
//   Part 2 (gas thermometer): invert a 10 mL graduated cylinder in ~80 °C water for a
//   minute, move it to room-temperature water, then add ice, reading the trapped air volume
//   each time. Volumes follow Charles's law (idealized: no water-vapor correction).
//
// Not graded: there are no questions and no score. The activity is "completed" once all five
// marks and all three readings are recorded, and it then shows a completion code so the
// teacher can confirm a student ran the whole procedure.
//
// Persistence: the Sheet only keeps score/status/answers, so the lab's data lives in
// answers[0] ({questionId:'_lab', state}). state.env holds that student's bench conditions
// (they vary slightly per student, like real lab stations) so resumed data stays consistent.
//
// Supports the shared EN/ES toggle (LANG_KEY).
(function () {
  const STYLE_ID = 'tl-lesson-styles';
  const FONT_LINK_ID = 'el-lesson-fonts'; // shared Google Fonts <link>, same family as every other lesson
  const LANG_KEY = 'ionicstorm_lang_v1';  // shared literal: keeps language in sync across activities
  const NS = 'http://www.w3.org/2000/svg';

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }
  function getLang() {
    try { return localStorage.getItem(LANG_KEY) === 'es' ? 'es' : 'en'; } catch (e) { return 'en'; }
  }
  function setLang(lang) {
    try { localStorage.setItem(LANG_KEY, lang === 'es' ? 'es' : 'en'); } catch (e) { /* ignore */ }
  }
  // Inline translator: const _ = T(lang); _('English', 'Español')
  function T(lang) { return (en, es) => (lang === 'es' && es != null) ? es : en; }
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function svgEl(tag, attrs, text) {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (text != null) e.textContent = text;
    return e;
  }

  // ---------------------------------------------------------------- lab model
  const ZERO = 350, PX = 18;                 // Part 1: ruler zero = top of stopper; 18 px per cm
  const TOP = 252, PXML = 24, FULL = 10, HOT = 80; // Part 2: closed end of cylinder; 24 px per mL
  const COND_IDS = ['room', 'hand', 'ice', 'salt', 'boil'];
  const REC_IDS = ['hot', 'room', 'ice'];
  function levelCm(T) { return 3.0 + 0.12 * T; } // ice water ~3 cm, boiling 15 cm

  function newEnv() {
    return { room: rnd(21, 23.5), hand: rnd(29.5, 32.5), salt: rnd(-7, -4.5), ice: rnd(1, 3) };
  }
  function newScale() { return { lo: '', hi: '', unit: '', show: true }; }
  function newState() { return { env: newEnv(), marks: {}, rec: {}, tab: 1, scale: newScale() }; }
  function loadState(progress) {
    const a = progress && progress.answers && progress.answers[0];
    const s = a && a.questionId === '_lab' && a.state;
    if (!s || !s.env || typeof s.env.room !== 'number') return newState();
    return { env: s.env, marks: s.marks || {}, rec: s.rec || {}, tab: s.tab === 2 ? 2 : 1, scale: Object.assign(newScale(), s.scale || {}) };
  }

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
.tl-lesson {
  --navy: #0d1b2a; --navy-mid: #1b2d42; --navy-light: #253a52;
  --teal: #2ec4b6; --teal-dim: #1a8c83; --amber: #f4a261;
  --cream: #f7f3ec; --cream-dark: #ede8df;
  --text: #1a1a2e; --text-muted: #5a6475;
  --glass: #5f7f88; --glassfill: rgba(120,170,185,0.14);
  --liquid: #2f9e4f; --water: rgba(70,150,215,0.26); --dye: rgba(214,60,105,0.32);
  --icefill: rgba(255,255,255,0.8); --marker: #1c1740; --skin: #e3ae8c; --skinline: #b98263;
  --ruler: #f5e7b0; --plate: #4f5d68; --rubber: #2a3238;
  --ok: #14715f; --wait: #9a5a06;
  font-family: 'Source Serif 4', Georgia, serif;
  color: var(--text); font-size: 17px; line-height: 1.6;
  background: var(--cream); border-radius: 16px; overflow: hidden;
  box-shadow: 0 1px 3px rgba(27,24,48,0.08);
}
.tl-lesson * { box-sizing: border-box; }
.tl-lesson .tl-off { display: none !important; }
.tl-lesson .tl-header { background: var(--navy); color: var(--cream); padding: 2rem 1.75rem 1.6rem; position: relative; overflow: hidden; }
.tl-lesson .tl-header::before { content: ''; position: absolute; top: -60px; right: -60px; width: 220px; height: 220px; border-radius: 50%; border: 32px solid rgba(46,196,182,0.12); }
.tl-lesson .tl-lang-toggle { position: absolute; top: 1.75rem; right: 1.75rem; z-index: 2; display: flex; gap: 0.3rem; }
.tl-lesson .tl-lang-btn { font-family: 'JetBrains Mono', monospace; font-size: 0.68rem; font-weight: 600; letter-spacing: 0.06em; padding: 0.3rem 0.6rem; border-radius: 6px; background: transparent; border: 1px solid rgba(247,243,236,0.35); color: rgba(247,243,236,0.65); cursor: pointer; }
.tl-lesson .tl-lang-btn.active { background: var(--teal); border-color: var(--teal); color: var(--navy); }
.tl-lesson .tl-lang-btn:hover:not(.active) { border-color: var(--teal); color: var(--cream); }
.tl-lesson .tl-header-label { font-family: 'JetBrains Mono', monospace; font-size: 0.68rem; letter-spacing: 0.2em; text-transform: uppercase; color: var(--teal); margin-bottom: 0.5rem; position: relative; padding-right: 6rem; }
.tl-lesson .tl-header h1 { font-family: 'Playfair Display', serif; font-size: 2rem; font-weight: 700; line-height: 1.2; margin: 0 0 0.4rem; position: relative; }
.tl-lesson .tl-header-meta { font-size: 0.82rem; color: rgba(247,243,236,0.65); font-family: 'JetBrains Mono', monospace; position: relative; }
.tl-lesson .tl-main { padding: 1.5rem 1.25rem 2.5rem; display: flex; flex-direction: column; gap: 1.25rem; }
.tl-lesson .tl-purpose { margin: 0; color: var(--text-muted); }
.tl-lesson .tl-tabs { display: flex; gap: 0.5rem; flex-wrap: wrap; }
.tl-lesson .tl-tab { font-family: 'JetBrains Mono', monospace; font-size: 0.75rem; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; padding: 0.6rem 1rem; border-radius: 999px; border: 1.5px solid var(--navy-light); background: white; color: var(--navy); cursor: pointer; }
.tl-lesson .tl-tab.active { background: var(--navy); color: white; }
.tl-lesson .tl-lab { display: grid; grid-template-columns: minmax(0, 300px) minmax(0, 1fr); gap: 1.25rem; align-items: start; }
@media (max-width: 680px) { .tl-lesson .tl-lab { grid-template-columns: minmax(0, 1fr); } }
.tl-lesson .tl-bench { background: white; border: 1px solid var(--cream-dark); border-radius: 12px; padding: 0.6rem; display: flex; flex-direction: column; gap: 0.5rem; }
.tl-lesson .tl-bench svg { display: block; width: 100%; height: auto; max-width: 360px; margin: 0 auto; }
.tl-lesson .tl-status { font-weight: 600; font-size: 0.92rem; line-height: 1.35; text-align: center; padding: 0.5rem 0.6rem; border-radius: 8px; background: var(--cream); min-height: 3.2rem; display: flex; align-items: center; justify-content: center; color: var(--text-muted); }
.tl-lesson .tl-status.ok { color: var(--ok); }
.tl-lesson .tl-status.wait { color: var(--wait); }
.tl-lesson .tl-side { display: flex; flex-direction: column; gap: 1.1rem; min-width: 0; }
.tl-lesson .tl-block { display: flex; flex-direction: column; gap: 0.55rem; }
.tl-lesson h2 { font-family: 'Playfair Display', serif; font-size: 1.3rem; line-height: 1.25; margin: 0; }
.tl-lesson h3 { font-family: 'JetBrains Mono', monospace; font-size: 0.68rem; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; color: var(--teal-dim); margin: 0; }
.tl-lesson ol.tl-steps { margin: 0; padding-left: 1.3rem; display: flex; flex-direction: column; gap: 0.4rem; font-size: 0.97rem; }
.tl-lesson ol.tl-steps li.now { font-weight: 600; }
.tl-lesson ol.tl-steps li.done { color: var(--text-muted); }
.tl-lesson .tl-choices { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 0.5rem; }
.tl-lesson .tl-choice { text-align: left; font-family: inherit; font-size: 0.95rem; font-weight: 600; padding: 0.55rem 0.7rem; border-radius: 10px; border: 1.5px solid var(--cream-dark); background: white; color: var(--text); cursor: pointer; display: flex; flex-direction: column; gap: 0.1rem; line-height: 1.3; }
.tl-lesson .tl-choice small { font-weight: 400; font-size: 0.8rem; color: var(--text-muted); }
.tl-lesson .tl-choice.active { border-color: var(--teal-dim); background: #e8f8f5; }
.tl-lesson .tl-row { display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center; }
.tl-lesson .tl-btn { font-family: 'JetBrains Mono', monospace; cursor: pointer; border: 1.5px solid var(--navy); background: var(--navy); color: white; border-radius: 8px; padding: 0.6rem 1rem; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; }
.tl-lesson .tl-btn:hover:not(:disabled) { background: var(--navy-light); }
.tl-lesson .tl-btn:disabled { background: var(--cream-dark); border-color: var(--cream-dark); color: var(--text-muted); cursor: not-allowed; }
.tl-lesson .tl-btn.secondary { background: white; color: var(--navy); border-color: var(--navy-light); }
.tl-lesson .tl-btn.secondary:hover:not(:disabled) { background: var(--cream); }
.tl-lesson .tl-btn.small { padding: 0.3rem 0.6rem; font-size: 0.62rem; }
.tl-lesson button:focus-visible { outline: 3px solid var(--teal); outline-offset: 2px; }
.tl-lesson .tl-tablebox { overflow-x: auto; border: 1px solid var(--cream-dark); border-radius: 10px; background: white; }
.tl-lesson table { border-collapse: collapse; width: 100%; font-size: 0.95rem; }
.tl-lesson th, .tl-lesson td { padding: 0.5rem 0.7rem; text-align: left; border-bottom: 1px solid var(--cream-dark); }
.tl-lesson th { font-family: 'JetBrains Mono', monospace; font-size: 0.64rem; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: var(--text-muted); }
.tl-lesson tr:last-child td { border-bottom: 0; }
.tl-lesson td.num { font-family: 'JetBrains Mono', monospace; font-weight: 600; white-space: nowrap; }
.tl-lesson td.empty { color: var(--text-muted); }
.tl-lesson .tl-note { font-size: 0.86rem; color: var(--text-muted); margin: 0; }
.tl-lesson .tl-clock { font-family: 'JetBrains Mono', monospace; font-weight: 600; color: var(--text); }
.tl-lesson .tl-done { background: white; border: 1px solid var(--cream-dark); border-radius: 12px; padding: 1rem 1.1rem; display: flex; flex-direction: column; gap: 0.5rem; align-items: flex-start; }
.tl-lesson .tl-done.complete { border-color: var(--teal); background: #e8f8f5; align-items: center; text-align: center; }
.tl-lesson .tl-done p { margin: 0; }
.tl-lesson .tl-count { font-family: 'JetBrains Mono', monospace; font-size: 0.82rem; font-weight: 600; }
.tl-lesson .tl-code-label { font-weight: 600; }
.tl-lesson .tl-code { display: inline-block; font-family: 'JetBrains Mono', monospace; font-size: 2rem; font-weight: 700; letter-spacing: 0.15em; color: var(--navy); border: 2px dashed var(--navy); border-radius: 10px; padding: 0.3rem 1rem; user-select: all; }
.tl-lesson .tl-scale { border-top: 1px solid var(--cream-dark); padding: 0.7rem 0.3rem 0.3rem; display: flex; flex-direction: column; gap: 0.55rem; }
.tl-lesson .tl-scale p { margin: 0; }
.tl-lesson .tl-field { display: flex; align-items: center; justify-content: space-between; gap: 0.6rem; font-size: 0.9rem; font-weight: 600; line-height: 1.3; }
.tl-lesson .tl-field input { width: 5.2rem; flex: none; font-family: 'JetBrains Mono', monospace; font-size: 0.95rem; padding: 0.4rem 0.5rem; border: 1.5px solid var(--navy-light); border-radius: 8px; background: white; color: var(--text); color-scheme: light; }
.tl-lesson .tl-field input:focus { outline: 3px solid var(--teal); outline-offset: 1px; }
.tl-lesson .tl-field input:disabled { background: var(--cream); border-color: var(--cream-dark); }
.tl-lesson .tl-seg { display: flex; gap: 0.35rem; flex-wrap: wrap; }
.tl-lesson .tl-seg .tl-btn.small { padding: 0.4rem 0.7rem; font-size: 0.64rem; }
.tl-lesson .tl-scale-hint { font-size: 0.86rem; font-weight: 600; color: var(--wait); }
.tl-lesson .tl-scale-hint.ok { color: var(--ok); }
.tl-lesson .g-stroke { fill: none; stroke: var(--glass); stroke-width: 2.5; stroke-linecap: round; stroke-linejoin: round; }
.tl-lesson .g-fill { fill: var(--glassfill); stroke: var(--glass); stroke-width: 2.5; stroke-linejoin: round; }
.tl-lesson svg .t { font-family: 'JetBrains Mono', monospace; fill: var(--text); }
.tl-lesson svg .tm { font-family: 'JetBrains Mono', monospace; fill: var(--text-muted); }
.tl-lesson svg .tk { font-family: 'Source Serif 4', Georgia, serif; fill: var(--text); }
.tl-lesson .tl-bub { fill: none; stroke: var(--glass); stroke-width: 1.5; animation: tlRise 1.5s linear infinite; }
@keyframes tlRise { 0% { transform: translateY(0); opacity: 0; } 15% { opacity: 1; } 100% { transform: translateY(-104px); opacity: 0; } }
.tl-lesson .tl-cyl { transition: transform 0.6s ease; }
@media (prefers-reduced-motion: reduce) { .tl-lesson .tl-bub { animation: none; transform: translateY(-50px); } .tl-lesson .tl-cyl { transition: none; } }
`;
    document.head.appendChild(style);
  }

  // ---------------------------------------------------------------- static apparatus drawings
  const ICE = 'fill="var(--icefill)" stroke="var(--glass)" stroke-width="1.5"';
  const P1_SVG = `
<svg viewBox="0 0 360 540" role="img" data-id="p1-svg">
  <g data-id="p1-handback" class="tl-off"><rect x="126" y="388" width="130" height="92" rx="30" fill="var(--skin)" stroke="var(--skinline)" stroke-width="2"/></g>
  <g data-id="p1-beaker" class="tl-off">
    <rect x="97" y="388" width="166" height="113" fill="var(--water)"/>
    <g data-id="p1-plate" class="tl-off">
      <rect x="70" y="504" width="220" height="26" rx="6" fill="var(--plate)"/>
      <rect x="82" y="500" width="196" height="6" rx="2" fill="var(--rubber)"/>
    </g>
  </g>
  <g data-id="p1-ruler"></g>
  <g data-id="p1-scale" class="tl-off"></g>
  <rect x="139" y="384" width="70" height="94" rx="10" class="g-fill"/>
  <rect x="142" y="394" width="64" height="81" rx="7" fill="var(--liquid)" opacity=".8"/>
  <rect x="160" y="366" width="28" height="20" class="g-fill"/>
  <rect x="168" y="44" width="12" height="412" rx="2" class="g-fill"/>
  <rect data-id="p1-liq" x="170" y="300" width="8" height="155" fill="var(--liquid)"/>
  <path d="M156 350 H192 L188 372 H160 Z" fill="var(--rubber)"/>
  <g data-id="p1-beakerfront" class="tl-off">
    <g data-id="p1-ice" class="tl-off">
      <rect x="103" y="378" width="24" height="24" rx="5" ${ICE} transform="rotate(-12 115 390)"/>
      <rect x="228" y="380" width="24" height="24" rx="5" ${ICE} transform="rotate(14 240 392)"/>
      <rect x="108" y="412" width="22" height="22" rx="5" ${ICE} transform="rotate(20 119 423)"/>
      <rect x="222" y="414" width="24" height="24" rx="5" ${ICE} transform="rotate(-18 234 426)"/>
      <rect x="214" y="446" width="20" height="20" rx="4" ${ICE} transform="rotate(8 224 456)"/>
    </g>
    <g data-id="p1-salt" class="tl-off" fill="var(--icefill)" stroke="var(--glass)" stroke-width="1">
      <rect x="106" y="493" width="5" height="5"/><rect x="118" y="495" width="4" height="4"/><rect x="128" y="492" width="5" height="5"/>
      <rect x="216" y="494" width="5" height="5"/><rect x="230" y="492" width="4" height="4"/><rect x="242" y="495" width="5" height="5"/>
      <rect x="112" y="486" width="4" height="4"/><rect x="236" y="486" width="4" height="4"/><rect x="222" y="487" width="4" height="4"/>
    </g>
    <g data-id="p1-boil" class="tl-off">
      <circle class="tl-bub" cx="110" cy="494" r="5" style="animation-delay:0s"/>
      <circle class="tl-bub" cx="126" cy="496" r="3.5" style="animation-delay:.5s"/>
      <circle class="tl-bub" cx="222" cy="495" r="4.5" style="animation-delay:.25s"/>
      <circle class="tl-bub" cx="244" cy="494" r="3.5" style="animation-delay:.9s"/>
      <circle class="tl-bub" cx="234" cy="496" r="5.5" style="animation-delay:1.2s"/>
      <circle class="tl-bub" cx="116" cy="495" r="4" style="animation-delay:1.05s"/>
    </g>
    <path d="M96 362 V494 Q96 502 104 502 H256 Q264 502 264 494 V362" class="g-stroke"/>
    <path d="M90 362 H100 M260 362 H270" class="g-stroke"/>
  </g>
  <g data-id="p1-handfront" class="tl-off" fill="var(--skin)" stroke="var(--skinline)" stroke-width="2">
    <rect x="150" y="394" width="100" height="18" rx="9"/>
    <rect x="146" y="415" width="106" height="18" rx="9"/>
    <rect x="148" y="436" width="104" height="18" rx="9"/>
    <rect x="154" y="457" width="94" height="17" rx="8.5"/>
  </g>
  <g data-id="p1-marks"></g>
  <text data-id="p1-envlabel" class="tm" x="180" y="24" text-anchor="middle" font-size="12" font-weight="600"></text>
</svg>`;

  const P2_SVG = `
<svg viewBox="0 0 360 540" role="img" data-id="p2-svg">
  <rect data-id="p2-water" x="71" y="372" width="218" height="129" fill="var(--dye)"/>
  <g data-id="p2-plate">
    <rect x="50" y="504" width="260" height="26" rx="6" fill="var(--plate)"/>
    <rect x="62" y="500" width="236" height="6" rx="2" fill="var(--rubber)"/>
  </g>
  <g data-id="p2-ice" class="tl-off">
    <rect x="82" y="362" width="26" height="26" rx="5" ${ICE} transform="rotate(-12 95 375)"/>
    <rect x="114" y="366" width="24" height="24" rx="5" ${ICE} transform="rotate(16 126 378)"/>
    <rect x="222" y="364" width="26" height="26" rx="5" ${ICE} transform="rotate(10 235 377)"/>
    <rect x="254" y="366" width="24" height="24" rx="5" ${ICE} transform="rotate(-20 266 378)"/>
    <rect x="92" y="396" width="22" height="22" rx="5" ${ICE} transform="rotate(24 103 407)"/>
    <rect x="244" y="398" width="22" height="22" rx="5" ${ICE} transform="rotate(-8 255 409)"/>
  </g>
  <g data-id="p2-cyl" class="tl-cyl">
    <rect x="165" y="252" width="30" height="240" fill="white"/>
    <rect data-id="p2-inner" x="165" y="492" width="30" height="0" fill="var(--water)"/>
    <g data-id="p2-grads"></g>
    <path d="M164 492 V252 H196 V492" class="g-stroke"/>
    <path d="M148 240 H212 L206 252 H154 Z" class="g-fill"/>
    <path d="M197 300 H330 M197 308 H330 M160 296 V312 M200 296 V312" stroke="var(--plate)" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <path data-id="p2-meniscus" d="M165 492 H195" stroke="var(--teal-dim)" stroke-width="2" class="tl-off"/>
  </g>
  <g data-id="p2-bubbles" class="tl-off">
    <circle class="tl-bub" cx="204" cy="486" r="4" style="animation-delay:0s"/>
    <circle class="tl-bub" cx="210" cy="488" r="3" style="animation-delay:.45s"/>
    <circle class="tl-bub" cx="154" cy="487" r="3.5" style="animation-delay:.8s"/>
    <circle class="tl-bub" cx="206" cy="486" r="5" style="animation-delay:1.1s"/>
  </g>
  <path d="M70 330 V494 Q70 502 78 502 H282 Q290 502 290 494 V330" class="g-stroke"/>
  <path d="M64 330 H74 M286 330 H296" class="g-stroke"/>
  <text data-id="p2-envlabel" class="tm" x="180" y="24" text-anchor="middle" font-size="12" font-weight="600"></text>
</svg>`;

  // ---------------------------------------------------------------- render
  function render(host, ctx) {
    ensureStylesInjected();
    const lang = getLang();
    const _ = T(lang);
    let S = loadState(ctx.getProgress());
    let saveTimer = null;

    const CONDS = {
      room: { label: _('Room temperature', 'Temperatura ambiente'), hint: _('Standing on the bench', 'Sobre la mesa'), mark: _('room', 'ambiente') },
      hand: { label: _('Warmed by your hand', 'Calentado con tu mano'), hint: _('Hold the vial in your palm', 'Sostén el frasco en tu palma'), mark: _('hand', 'mano') },
      ice: { label: _('Ice water', 'Agua con hielo'), hint: _('Beaker of ice and water', 'Vaso con hielo y agua'), mark: _('ice water', 'agua con hielo') },
      salt: { label: _('Salted ice water', 'Agua con hielo y sal'), hint: _('200 mL ice water + 1 tbsp salt', '200 mL de agua con hielo + 1 cda. de sal'), mark: _('salted ice', 'hielo con sal') },
      boil: { label: _('Boiling water', 'Agua hirviendo'), hint: _('On the hot plate, off the bottom', 'En la placa caliente, sin tocar el fondo'), mark: _('boiling', 'hirviendo') }
    };
    const SIT = {
      hot: _('Hot water (about 80 °C)', 'Agua caliente (unos 80 °C)'),
      room: _('Room-temperature water', 'Agua a temperatura ambiente'),
      ice: _('Ice water', 'Agua con hielo')
    };
    function condTemp(id) { return id === 'room' ? S.env.room : id === 'hand' ? S.env.hand : id === 'ice' ? 0.3 : id === 'salt' ? S.env.salt : 100; }

    // ---- saving
    function marksDone() { return COND_IDS.filter(k => S.marks[k] != null).length; }
    function recsDone() { return REC_IDS.filter(k => S.rec[k] != null).length; }
    function allDone() { return marksDone() === COND_IDS.length && recsDone() === REC_IDS.length; }
    function buildRecord() {
      const cur = ctx.getProgress() || {};
      const rec = {
        status: (allDone() || cur.status === 'completed') ? 'completed' : 'in_progress',
        score: null,
        totalQuestions: null,
        answers: [{ questionId: '_lab', state: S }]
      };
      if (rec.status === 'completed' && cur.code) rec.code = cur.code;
      return rec;
    }
    function save(now) {
      clearTimeout(saveTimer);
      const run = () => { saveTimer = null; return ctx.saveProgress(buildRecord()); };
      if (now) return run();
      saveTimer = setTimeout(run, 450);
      return null;
    }
    function flushSave() { if (saveTimer) save(true); }
    // Called after any data change: the change that finishes the lab saves at once so the code can show.
    function dataChanged() {
      const cur = ctx.getProgress() || {};
      if (allDone() && cur.status !== 'completed') {
        const p = save(true);
        renderDone();
        if (p && p.then) p.then(renderDone);
      } else {
        save(false);
        renderDone();
      }
    }

    // ---- shell
    host.innerHTML = `
      <div class="tl-lesson">
        <div class="tl-header">
          <div class="tl-lang-toggle" role="group" aria-label="${escapeHtml(_('Language', 'Idioma'))}">
            <button type="button" class="tl-lang-btn${lang === 'en' ? ' active' : ''}" data-lang="en">EN</button>
            <button type="button" class="tl-lang-btn${lang === 'es' ? ' active' : ''}" data-lang="es">ES</button>
          </div>
          <div class="tl-header-label">${escapeHtml(_('Chapter 10 · Physically Changing Matter · Lesson 52', 'Capítulo 10 · Cambios Físicos de la Materia · Lección 52'))}</div>
          <h1>${escapeHtml(ctx.activity.title)}</h1>
          <div class="tl-header-meta">${escapeHtml(_('Virtual Lab · ~25 Minutes · Do the procedure here, answer on your worksheet', 'Laboratorio Virtual · ~25 Minutos · Haz el procedimiento aquí, responde en tu hoja'))}</div>
        </div>
        <div class="tl-main">
          <p class="tl-purpose">${escapeHtml(_('Purpose: to examine how the volumes of a liquid and a gas change in response to temperature. Run both parts here, then answer the questions on your worksheet.', 'Propósito: examinar cómo cambian los volúmenes de un líquido y de un gas en respuesta a la temperatura. Haz las dos partes aquí y luego responde las preguntas en tu hoja de trabajo.'))}</p>
          <div class="tl-tabs" role="tablist">
            <button type="button" class="tl-tab" role="tab" data-tab="1">${escapeHtml(_('Part 1: Liquid thermometer', 'Parte 1: Termómetro de líquido'))}</button>
            <button type="button" class="tl-tab" role="tab" data-tab="2">${escapeHtml(_('Part 2: Gas thermometer', 'Parte 2: Termómetro de gas'))}</button>
          </div>

          <section class="tl-lab" data-part="1">
            <div class="tl-bench">
              ${P1_SVG}
              <div class="tl-status" data-id="p1-status" aria-live="polite"></div>
              <div class="tl-scale">
                <h3>${escapeHtml(_('Build your own scale', 'Crea tu propia escala'))}</h3>
                <p class="tl-note">${escapeHtml(_('Choose a number for your ice water mark and a number for your boiling water mark. The lab divides the space between them into ten equal steps.', 'Elige un número para tu marca de agua con hielo y un número para tu marca de agua hirviendo. El laboratorio divide el espacio entre ellas en diez pasos iguales.'))}</p>
                <label class="tl-field"><span>${escapeHtml(_('Boiling water mark =', 'Marca de agua hirviendo ='))}</span><input type="number" step="any" inputmode="decimal" data-id="sc-hi"></label>
                <label class="tl-field"><span>${escapeHtml(_('Ice water mark =', 'Marca de agua con hielo ='))}</span><input type="number" step="any" inputmode="decimal" data-id="sc-lo"></label>
                <label class="tl-field"><span>${escapeHtml(_('Name your degrees (optional)', 'Nombra tus grados (opcional)'))}</span><input type="text" maxlength="4" data-id="sc-unit" placeholder="°?"></label>
                <p class="tl-scale-hint" data-id="sc-hint" aria-live="polite"></p>
                <div class="tl-seg" role="group" aria-label="${escapeHtml(_('Show beside the straw', 'Mostrar junto al popote'))}">
                  <button type="button" class="tl-btn small" data-id="sc-show-scale">${escapeHtml(_('My scale', 'Mi escala'))}</button>
                  <button type="button" class="tl-btn small" data-id="sc-show-ruler">${escapeHtml(_('Ruler (cm)', 'Regla (cm)'))}</button>
                </div>
              </div>
            </div>
            <div class="tl-side">
              <div class="tl-block">
                <h2>${escapeHtml(_('Mark the liquid level in five conditions', 'Marca el nivel del líquido en cinco condiciones'))}</h2>
                <ol class="tl-steps">
                  <li>${escapeHtml(_('Choose a condition to put the ethylene glycol thermometer in.', 'Elige una condición para poner el termómetro de etilenglicol.'))}</li>
                  <li>${escapeHtml(_('Watch the liquid in the straw. Wait until it stops moving.', 'Observa el líquido en el popote. Espera hasta que deje de moverse.'))}</li>
                  <li>${escapeHtml(_('Mark the level with the marker. Repeat for all five conditions.', 'Marca el nivel con el marcador. Repite para las cinco condiciones.'))}</li>
                </ol>
              </div>
              <div class="tl-block">
                <h3>${escapeHtml(_('Put the thermometer in', 'Pon el termómetro en'))}</h3>
                <div class="tl-choices" data-id="p1-choices">
                  ${COND_IDS.map(k => `<button type="button" class="tl-choice" data-cond="${k}"><span>${escapeHtml(CONDS[k].label)}</span><small>${escapeHtml(CONDS[k].hint)}</small></button>`).join('')}
                </div>
              </div>
              <div class="tl-row">
                <button type="button" class="tl-btn" data-id="p1-mark">${escapeHtml(_('Mark the level', 'Marcar el nivel'))}</button>
                <button type="button" class="tl-btn secondary" data-id="p1-clear">${escapeHtml(_('Wipe off all marks', 'Borrar todas las marcas'))}</button>
              </div>
              <div class="tl-block">
                <h3>${escapeHtml(_('Your marks', 'Tus marcas'))}</h3>
                <div class="tl-tablebox"><table>
                  <thead><tr><th>${escapeHtml(_('Condition', 'Condición'))}</th><th>${escapeHtml(_('Height on ruler', 'Altura en la regla'))}</th><th></th></tr></thead>
                  <tbody data-id="p1-rows"></tbody>
                </table></div>
                <p class="tl-note">${escapeHtml(_('Heights are measured from the top of the stopper. A mark made while the liquid is still moving will be off, just like in the real lab. Mark it again to replace it.', 'Las alturas se miden desde la parte de arriba del tapón. Una marca hecha mientras el líquido todavía se mueve saldrá mal, igual que en el laboratorio real. Márcala otra vez para reemplazarla.'))}</p>
              </div>
            </div>
          </section>

          <section class="tl-lab" data-part="2">
            <div class="tl-bench">
              ${P2_SVG}
              <div class="tl-status" data-id="p2-status" aria-live="polite"></div>
            </div>
            <div class="tl-side">
              <div class="tl-block">
                <h2>${escapeHtml(_('Trap a sample of air and change its temperature', 'Atrapa una muestra de aire y cambia su temperatura'))}</h2>
                <ol class="tl-steps" data-id="p2-steps">
                  <li>${escapeHtml(_('The beaker holds 200 mL of water with two drops of food coloring, heated to about 80 °C. Turn the dry 10 mL graduated cylinder upside down and lower it until its mouth almost touches the bottom.', 'El vaso tiene 200 mL de agua con dos gotas de colorante, calentada a unos 80 °C. Voltea la probeta seca de 10 mL boca abajo y bájala hasta que la boca casi toque el fondo.'))}</li>
                  <li>${escapeHtml(_('Hold it in the hot water for at least one minute. Watch the mouth of the cylinder.', 'Mantenla en el agua caliente por lo menos un minuto. Observa la boca de la probeta.'))}</li>
                  <li>${escapeHtml(_('Quickly move the cylinder to the beaker of room-temperature water. Keep the mouth near the bottom.', 'Mueve rápido la probeta al vaso con agua a temperatura ambiente. Mantén la boca cerca del fondo.'))}</li>
                  <li>${escapeHtml(_('Leave the cylinder where it is and add ice to the water.', 'Deja la probeta donde está y agrega hielo al agua.'))}</li>
                </ol>
              </div>
              <div class="tl-block">
                <h3>${escapeHtml(_('Do the next step', 'Haz el siguiente paso'))}</h3>
                <div class="tl-row">
                  <button type="button" class="tl-btn" data-id="p2-lower">${escapeHtml(_('Lower into hot water', 'Bajar al agua caliente'))}</button>
                  <button type="button" class="tl-btn" data-id="p2-move">${escapeHtml(_('Move to room-temperature water', 'Mover al agua a temperatura ambiente'))}</button>
                  <button type="button" class="tl-btn" data-id="p2-addice">${escapeHtml(_('Add ice', 'Agregar hielo'))}</button>
                </div>
                <p class="tl-note">${escapeHtml(_('Time in hot water:', 'Tiempo en el agua caliente:'))} <span class="tl-clock" data-id="p2-clock">0:00</span> ${escapeHtml(_('(the clock runs 10 times faster than real time)', '(el reloj corre 10 veces más rápido que el tiempo real)'))}</p>
              </div>
              <div class="tl-row">
                <button type="button" class="tl-btn" data-id="p2-record">${escapeHtml(_('Record the reading', 'Anotar la lectura'))}</button>
                <button type="button" class="tl-btn secondary" data-id="p2-reset">${escapeHtml(_('Start Part 2 over', 'Empezar la Parte 2 de nuevo'))}</button>
              </div>
              <div class="tl-block">
                <h3>${escapeHtml(_('Your readings', 'Tus lecturas'))}</h3>
                <div class="tl-tablebox"><table>
                  <thead><tr><th>${escapeHtml(_('Situation', 'Situación'))}</th><th>${escapeHtml(_('Air in the cylinder', 'Aire en la probeta'))}</th></tr></thead>
                  <tbody data-id="p2-rows"></tbody>
                </table></div>
                <p class="tl-note">${escapeHtml(_('The scale on the upside-down cylinder starts at the closed end, so the number at the water line is the volume of trapped air.', 'La escala de la probeta boca abajo empieza en el extremo cerrado, así que el número en la línea del agua es el volumen del aire atrapado.'))}</p>
              </div>
            </div>
          </section>

          <div class="tl-done" data-id="done"></div>
        </div>
      </div>`;

    const root = host.querySelector('.tl-lesson');
    const q = id => root.querySelector('[data-id="' + id + '"]');
    const show = (id, on) => q(id).classList.toggle('tl-off', !on);

    q('p1-svg').setAttribute('aria-label', _('A glass vial of green ethylene glycol with a stopper and a clear straw. A ruler stands beside the straw.', 'Un frasco de vidrio con etilenglicol verde, un tapón y un popote transparente. Hay una regla junto al popote.'));
    q('p2-svg').setAttribute('aria-label', _('A 10 mL graduated cylinder held upside down over a beaker of water.', 'Una probeta de 10 mL sostenida boca abajo sobre un vaso con agua.'));

    // ---- language + tabs
    root.querySelectorAll('[data-lang]').forEach(btn => {
      btn.addEventListener('click', () => {
        const nl = btn.getAttribute('data-lang');
        if (nl === lang) return;
        flushSave(); clearInterval(timer); setLang(nl); render(host, ctx);
      });
    });
    function selectTab(n) {
      S.tab = n;
      root.querySelectorAll('[data-tab]').forEach(b => {
        const on = Number(b.getAttribute('data-tab')) === n;
        b.classList.toggle('active', on); b.setAttribute('aria-selected', on);
      });
      root.querySelectorAll('[data-part]').forEach(s => s.classList.toggle('tl-off', Number(s.getAttribute('data-part')) !== n));
    }
    root.querySelectorAll('[data-tab]').forEach(b => b.addEventListener('click', () => selectTab(Number(b.getAttribute('data-tab')))));

    // ================= PART 1 =================
    const p1 = { cur: 'room', T: S.env.room };
    (function drawRuler() {
      const g = q('p1-ruler');
      g.appendChild(svgEl('rect', { x: 116, y: ZERO - 16 * PX - 14, width: 36, height: 16 * PX + 20, rx: 3, fill: 'var(--ruler)', stroke: 'var(--glass)', 'stroke-width': 1 }));
      for (let i = 0; i <= 32; i++) {
        const y = ZERO - i * PX / 2, big = i % 2 === 0;
        g.appendChild(svgEl('line', { x1: big ? 141 : 146, x2: 152, y1: y, y2: y, stroke: 'var(--text)', 'stroke-width': big ? 1.4 : 0.8 }));
        if (big) g.appendChild(svgEl('text', { x: 137, y: y + 3.5, 'text-anchor': 'end', 'font-size': 9.5, 'class': 't', 'font-weight': 600 }, String(i / 2)));
      }
      g.appendChild(svgEl('text', { x: 134, y: ZERO - 16 * PX - 18, 'text-anchor': 'middle', 'font-size': 10, 'class': 'tm' }, 'cm'));
    })();
    function renderEnv() {
      const c = p1.cur;
      root.querySelectorAll('[data-cond]').forEach(b => {
        const on = b.getAttribute('data-cond') === c;
        b.classList.toggle('active', on); b.setAttribute('aria-pressed', on);
      });
      const beaker = c === 'ice' || c === 'salt' || c === 'boil';
      show('p1-handback', c === 'hand'); show('p1-handfront', c === 'hand');
      show('p1-beaker', beaker); show('p1-beakerfront', beaker);
      show('p1-ice', c === 'ice' || c === 'salt'); show('p1-salt', c === 'salt');
      show('p1-boil', c === 'boil'); show('p1-plate', c === 'boil');
      q('p1-envlabel').textContent = CONDS[c].label;
    }
    // ---- build-your-own scale: two numbers on two marks, drawn as a paper strip in place of the ruler
    function scaleNum(v) { const n = parseFloat(v); return (v === '' || v == null || !isFinite(n)) ? null : n; }
    function fmtScale(v) {
      const r = Math.round(v * 100) / 100;
      const str = String(r);
      return str.length > 6 ? r.toFixed(1) : str;
    }
    function renderScale(syncInputs) {
      if (syncInputs) { q('sc-lo').value = S.scale.lo; q('sc-hi').value = S.scale.hi; q('sc-unit').value = S.scale.unit; }
      const haveMarks = S.marks.ice != null && S.marks.boil != null;
      const lo = scaleNum(S.scale.lo), hi = scaleNum(S.scale.hi);
      const valid = haveMarks && lo != null && hi != null && lo !== hi;
      const hint = q('sc-hint');
      hint.className = 'tl-scale-hint' + (valid ? ' ok' : '');
      hint.textContent = !haveMarks ? _('First mark the ice water level and the boiling water level.', 'Primero marca el nivel del agua con hielo y el del agua hirviendo.')
        : (lo == null || hi == null) ? _('Type a number for each of the two marks.', 'Escribe un número para cada una de las dos marcas.')
        : lo === hi ? _('The two numbers must be different.', 'Los dos números deben ser diferentes.')
        : _('Your scale is drawn beside the straw. Use it to read your other marks.', 'Tu escala está dibujada junto al popote. Úsala para leer tus otras marcas.');
      q('sc-lo').disabled = !haveMarks; q('sc-hi').disabled = !haveMarks; q('sc-unit').disabled = !haveMarks;
      const showScale = valid && S.scale.show;
      q('sc-show-scale').disabled = !valid; q('sc-show-ruler').disabled = !valid;
      q('sc-show-scale').classList.toggle('secondary', !showScale);
      q('sc-show-ruler').classList.toggle('secondary', showScale || !valid);
      q('sc-show-scale').setAttribute('aria-pressed', showScale);
      q('sc-show-ruler').setAttribute('aria-pressed', valid && !showScale);
      show('p1-ruler', !showScale); show('p1-scale', showScale);
      const g = q('p1-scale'); g.textContent = '';
      if (!showScale) return;
      const top = ZERO - 16 * PX - 14, bottom = ZERO + 6;
      g.appendChild(svgEl('rect', { x: 98, y: top, width: 54, height: bottom - top, rx: 3, fill: 'white', stroke: 'var(--glass)', 'stroke-width': 1 }));
      const yLo = ZERO - S.marks.ice * PX, yHi = ZERO - S.marks.boil * PX;
      const stepY = (yHi - yLo) / 10, stepV = (hi - lo) / 10;
      if (Math.abs(stepY) < 2) return; // marks too close together to draw a scale
      for (let i = -40; i <= 80; i++) {            // half-steps: even i = labeled step, odd i = small tick
        const y = yLo + (i / 2) * stepY;
        if (y < top + 12 || y > ZERO) continue;
        const big = i % 2 === 0;
        g.appendChild(svgEl('line', { x1: big ? 140 : 146, x2: 152, y1: y, y2: y, stroke: 'var(--text)', 'stroke-width': big ? 1.4 : 0.8 }));
        if (big) {
          const anchor = (i === 0 || i === 20);
          const label = svgEl('text', { x: 137, y: y + 3.5, 'text-anchor': 'end', 'font-size': 9.5, 'class': 't', 'font-weight': anchor ? 700 : 500 }, fmtScale(lo + (i / 2) * stepV));
          if (anchor) label.style.fill = 'var(--teal-dim)';
          g.appendChild(label);
        }
      }
      g.appendChild(svgEl('text', { x: 125, y: top - 4, 'text-anchor': 'middle', 'font-size': 10, 'class': 'tm' }, S.scale.unit || _('my scale', 'mi escala')));
    }
    function renderMarks() {
      renderScale(false);
      const g = q('p1-marks'); g.textContent = '';
      const list = COND_IDS.filter(k => S.marks[k] != null).map(k => ({ k, y: ZERO - S.marks[k] * PX }));
      list.sort((a, b) => a.y - b.y);
      let prev = -1e9;
      list.forEach(m => {
        const ly = Math.max(m.y, prev + 15); prev = ly;
        g.appendChild(svgEl('line', { x1: 163, x2: 185, y1: m.y, y2: m.y, stroke: 'var(--marker)', 'stroke-width': 2.5, 'stroke-linecap': 'round' }));
        g.appendChild(svgEl('polyline', { points: '187,' + m.y + ' 198,' + ly + ' 203,' + ly, fill: 'none', stroke: 'var(--text-muted)', 'stroke-width': 1 }));
        g.appendChild(svgEl('text', { x: 206, y: ly + 4, 'font-size': 12.5, 'font-weight': 600, 'class': 'tk' }, CONDS[m.k].mark));
      });
      const tb = q('p1-rows'); tb.textContent = '';
      let any = false;
      COND_IDS.forEach(k => {
        if (S.marks[k] == null) return; any = true;
        const row = document.createElement('tr');
        const a = document.createElement('td'); a.textContent = CONDS[k].label;
        const b = document.createElement('td'); b.className = 'num'; b.textContent = S.marks[k].toFixed(1) + ' cm';
        const d = document.createElement('td');
        const x = document.createElement('button'); x.type = 'button'; x.className = 'tl-btn secondary small';
        x.textContent = _('Wipe off', 'Borrar');
        x.setAttribute('aria-label', _('Wipe off the mark for: ', 'Borrar la marca de: ') + CONDS[k].label);
        x.addEventListener('click', () => { delete S.marks[k]; renderMarks(); dataChanged(); });
        d.appendChild(x);
        row.appendChild(a); row.appendChild(b); row.appendChild(d); tb.appendChild(row);
      });
      if (!any) {
        const row = document.createElement('tr'); const td = document.createElement('td');
        td.colSpan = 3; td.className = 'empty';
        td.textContent = _('No marks yet. Choose a condition, wait for the liquid to stop, then mark it.', 'Todavía no hay marcas. Elige una condición, espera a que el líquido se detenga y márcalo.');
        row.appendChild(td); tb.appendChild(row);
      }
    }
    root.querySelectorAll('[data-cond]').forEach(b => b.addEventListener('click', () => { p1.cur = b.getAttribute('data-cond'); renderEnv(); }));
    q('p1-mark').addEventListener('click', () => {
      S.marks[p1.cur] = Math.round((levelCm(p1.T) + rnd(-0.03, 0.03)) * 100) / 100;
      renderMarks(); dataChanged();
    });
    q('p1-clear').addEventListener('click', () => { S.marks = {}; renderMarks(); dataChanged(); });
    ['lo', 'hi', 'unit'].forEach(k => q('sc-' + k).addEventListener('input', e => {
      S.scale[k] = e.target.value; if (k !== 'unit') S.scale.show = true;
      renderScale(false); save(false);
    }));
    q('sc-show-scale').addEventListener('click', () => { S.scale.show = true; renderScale(false); save(false); });
    q('sc-show-ruler').addEventListener('click', () => { S.scale.show = false; renderScale(false); save(false); });

    function stepP1(dt) {
      const target = condTemp(p1.cur);
      p1.T += (target - p1.T) * (1 - Math.exp(-dt / 2.0));
      const y = ZERO - levelCm(p1.T) * PX;
      q('p1-liq').setAttribute('y', y); q('p1-liq').setAttribute('height', 455 - y);
      const d = target - p1.T, s = q('p1-status');
      let text, cls;
      if (Math.abs(d) < 0.35) { text = _('The liquid has stopped moving. Mark the level.', 'El líquido dejó de moverse. Marca el nivel.'); cls = 'tl-status ok'; }
      else if (d > 0) { text = _('The liquid is rising in the straw…', 'El líquido está subiendo en el popote…'); cls = 'tl-status wait'; }
      else { text = _('The liquid is dropping in the straw…', 'El líquido está bajando en el popote…'); cls = 'tl-status wait'; }
      if (s.textContent !== text) s.textContent = text;
      if (s.className !== cls) s.className = cls;
    }

    // ================= PART 2 =================
    let p2;
    (function drawGrads() {
      const g = q('p2-grads');
      for (let i = 1; i <= 50; i++) {
        const y = TOP + i * PXML / 5, big = i % 5 === 0;
        g.appendChild(svgEl('line', { x1: 165, x2: big ? 181 : 173, y1: y, y2: y, stroke: 'var(--text)', 'stroke-width': big ? 1.3 : 0.7 }));
        if (big) g.appendChild(svgEl('text', { x: 158, y: y + 3.5, 'text-anchor': 'end', 'font-size': 9.5, 'font-weight': 600, 'class': 't' }, String(i / 5)));
      }
      g.appendChild(svgEl('text', { x: 158, y: TOP - 18, 'text-anchor': 'end', 'font-size': 10, 'class': 'tm' }, 'mL'));
    })();
    function resetP2(clearReadings) {
      p2 = { stage: 'ready', Tair: S.env.room, Tmax: S.env.room, bath: HOT, sim: 0, busy: false, V: FULL };
      q('p2-cyl').style.transform = 'translateY(-200px)';
      if (clearReadings) S.rec = {};
      renderP2(); renderRecs();
    }
    function renderP2() {
      const st = p2.stage, hot = st === 'ready' || st === 'hot';
      q('p2-water').setAttribute('fill', hot ? 'var(--dye)' : 'var(--water)');
      show('p2-plate', hot); show('p2-ice', st === 'ice');
      q('p2-envlabel').textContent = hot ? _('Hot water, about 80 °C', 'Agua caliente, unos 80 °C')
        : st === 'room' ? _('Room-temperature water', 'Agua a temperatura ambiente')
        : _('Room-temperature water with ice added', 'Agua a temperatura ambiente con hielo');
      q('p2-lower').disabled = st !== 'ready' || p2.busy;
      q('p2-move').disabled = st !== 'hot' || p2.busy;
      q('p2-addice').disabled = st !== 'room' || p2.busy;
      q('p2-record').disabled = st === 'ready' || p2.busy;
      let idx = { ready: 0, hot: 1, room: 3, ice: 4 }[st];
      if (st === 'hot' && p2.sim >= 60) idx = 2;
      const lis = q('p2-steps').children;
      for (let i = 0; i < lis.length; i++) lis[i].className = i < idx ? 'done' : i === idx ? 'now' : '';
    }
    function renderRecs() {
      const tb = q('p2-rows'); tb.textContent = '';
      let any = false;
      REC_IDS.forEach(k => {
        if (S.rec[k] == null) return; any = true;
        const row = document.createElement('tr');
        const a = document.createElement('td'); a.textContent = SIT[k];
        const b = document.createElement('td'); b.className = 'num'; b.textContent = S.rec[k].toFixed(1) + ' mL';
        row.appendChild(a); row.appendChild(b); tb.appendChild(row);
      });
      if (!any) {
        const row = document.createElement('tr'); const td = document.createElement('td');
        td.colSpan = 2; td.className = 'empty';
        td.textContent = _('No readings yet. Record one in each of the three situations.', 'Todavía no hay lecturas. Anota una en cada una de las tres situaciones.');
        row.appendChild(td); tb.appendChild(row);
      }
    }
    q('p2-lower').addEventListener('click', () => {
      const run = p2;
      p2.busy = true; renderP2(); q('p2-cyl').style.transform = 'translateY(0)';
      setTimeout(() => { if (p2 !== run || !root.isConnected) return; p2.stage = 'hot'; p2.busy = false; renderP2(); }, 650);
    });
    q('p2-move').addEventListener('click', () => {
      const run = p2;
      p2.busy = true; renderP2(); q('p2-cyl').style.transform = 'translateY(-200px)';
      setTimeout(() => {
        if (p2 !== run || !root.isConnected) return;
        p2.stage = 'room'; p2.bath = S.env.room; renderP2(); q('p2-cyl').style.transform = 'translateY(0)';
        setTimeout(() => { if (p2 !== run || !root.isConnected) return; p2.busy = false; renderP2(); }, 650);
      }, 650);
    });
    q('p2-addice').addEventListener('click', () => { p2.stage = 'ice'; renderP2(); });
    q('p2-record').addEventListener('click', () => {
      S.rec[p2.stage] = Math.min(FULL, Math.round((p2.V + rnd(-0.04, 0.04)) * 10) / 10);
      renderRecs(); dataChanged();
    });
    q('p2-reset').addEventListener('click', () => { resetP2(true); dataChanged(); });

    function stepP2(dt) {
      const st = p2.stage, s = q('p2-status');
      const target = st === 'hot' ? HOT : st === 'ice' ? S.env.ice : S.env.room;
      if (st === 'ice') p2.bath += (S.env.ice - p2.bath) * (1 - Math.exp(-dt / 1.5));
      let bubbling = false;
      if (st !== 'ready' && !p2.busy) {
        p2.Tair += (p2.bath - p2.Tair) * (1 - Math.exp(-dt / 1.6));
        if (st === 'hot') {
          const was = p2.sim; p2.sim += dt * 10;
          if (p2.Tair > p2.Tmax) p2.Tmax = p2.Tair; // warm air expands and bubbles out, so the cylinder stays full
          bubbling = HOT - p2.Tair > 1.5;
          if (was < 60 && p2.sim >= 60) renderP2();
        }
      }
      p2.V = Math.min(FULL, FULL * (p2.Tair + 273.15) / (p2.Tmax + 273.15));
      const submerged = st !== 'ready' && !p2.busy;
      const wy = TOP + p2.V * PXML;
      q('p2-inner').setAttribute('y', wy); q('p2-inner').setAttribute('height', submerged ? Math.max(0, 492 - wy) : 0);
      const men = q('p2-meniscus'); men.setAttribute('d', 'M165 ' + wy + ' H195');
      men.classList.toggle('tl-off', !submerged || p2.V > FULL - 0.05);
      show('p2-bubbles', bubbling);
      const t = Math.floor(p2.sim);
      const clock = Math.floor(t / 60) + ':' + ('0' + (t % 60)).slice(-2);
      if (q('p2-clock').textContent !== clock) q('p2-clock').textContent = clock;
      let text, cls = 'tl-status wait';
      if (st === 'ready') { text = _('The cylinder is dry and full of room air.', 'La probeta está seca y llena de aire del salón.'); cls = 'tl-status'; }
      else if (p2.busy) { text = _('Moving the cylinder…', 'Moviendo la probeta…'); }
      else if (st === 'hot') {
        if (bubbling) text = _('Bubbles of air are escaping from the mouth.', 'Burbujas de aire se escapan por la boca.');
        else if (p2.sim < 60) text = _('Keep holding. Air fills the cylinder to 10.0 mL.', 'Sigue sosteniéndola. El aire llena la probeta hasta 10.0 mL.');
        else { text = _('One minute is up. Air fills the cylinder: 10.0 mL.', 'Ya pasó un minuto. El aire llena la probeta: 10.0 mL.'); cls = 'tl-status ok'; }
      } else {
        const steady = Math.abs(target - p2.Tair) < 0.4;
        if (p2.V > FULL - 0.05) { text = _('No water has entered the cylinder.', 'No ha entrado agua a la probeta.'); cls = 'tl-status ok'; }
        else if (steady) { text = _('The water line is steady at ', 'La línea del agua está estable en ') + p2.V.toFixed(1) + ' mL.'; cls = 'tl-status ok'; }
        else text = _('Water is rising inside the cylinder…', 'El agua está subiendo dentro de la probeta…');
      }
      if (s.textContent !== text) s.textContent = text;
      if (s.className !== cls) s.className = cls;
    }

    // ================= completion =================
    function renderDone() {
      const box = q('done');
      const progress = ctx.getProgress();
      const completed = !!(progress && progress.status === 'completed');
      const counts = `<p class="tl-count">${escapeHtml(_('Marks', 'Marcas'))}: ${marksDone()} / ${COND_IDS.length} · ${escapeHtml(_('Readings', 'Lecturas'))}: ${recsDone()} / ${REC_IDS.length}</p>`;
      if (!completed) {
        box.className = 'tl-done';
        box.innerHTML = `<h3>${escapeHtml(_('Lab progress', 'Progreso del laboratorio'))}</h3>${counts}
          <p class="tl-note">${escapeHtml(_('Make all five marks in Part 1 and record all three readings in Part 2 to finish the lab and get your completion code. Copy your data onto your worksheet.', 'Haz las cinco marcas en la Parte 1 y anota las tres lecturas en la Parte 2 para terminar el laboratorio y recibir tu código de finalización. Copia tus datos en tu hoja de trabajo.'))}</p>`;
        return;
      }
      const code = progress.code || '';
      box.className = 'tl-done complete';
      box.innerHTML = `<h3>${escapeHtml(_('Lab procedure complete', 'Procedimiento del laboratorio completo'))}</h3>${counts}
        ${code ? `<p class="tl-code-label">${escapeHtml(_('Your completion code', 'Tu código de finalización'))}</p><div class="tl-code">${escapeHtml(code)}</div>`
               : `<p><button type="button" class="tl-btn" data-showcode>${escapeHtml(_('Show my code', 'Mostrar mi código'))}</button></p>`}
        <p class="tl-note">${escapeHtml(_('Copy your marks and readings onto your worksheet, then answer the questions there.', 'Copia tus marcas y lecturas en tu hoja de trabajo y luego responde las preguntas ahí.'))}</p>
        <button type="button" class="tl-btn secondary" data-redo>${escapeHtml(_('Redo the whole lab', 'Repetir todo el laboratorio'))}</button>`;
      const showBtn = box.querySelector('[data-showcode]');
      if (showBtn) showBtn.addEventListener('click', async () => {
        showBtn.disabled = true;
        await ctx.saveProgress(Object.assign({}, buildRecord(), { status: 'completed' }));
        renderDone();
      });
      const redo = box.querySelector('[data-redo]');
      redo.addEventListener('click', async () => {
        // Two clicks instead of confirm(): a redo erases the data and retires the current code.
        if (!redo.hasAttribute('data-armed')) {
          redo.setAttribute('data-armed', '1');
          redo.textContent = _('Erase my data and start over?', '¿Borrar mis datos y empezar de nuevo?');
          return;
        }
        clearTimeout(saveTimer); saveTimer = null;
        const tab = S.tab;
        S = newState(); S.tab = tab;
        p1.cur = 'room'; p1.T = S.env.room;
        renderEnv(); renderMarks(); renderScale(true); resetP2(false);
        const p = ctx.saveProgress({ status: 'in_progress', score: null, totalQuestions: null, answers: [{ questionId: '_lab', state: S }] });
        renderDone();
        await p;
      });
    }

    // ---- start
    selectTab(S.tab);
    renderEnv(); renderMarks(); renderScale(true); resetP2(false); renderDone();
    let last = performance.now();
    // A timer (not requestAnimationFrame) so the lab keeps running even when the tab is not being painted.
    const timer = setInterval(() => {
      if (!root.isConnected) { clearInterval(timer); flushSave(); return; }
      const now = performance.now();
      const dt = Math.min(30, Math.max(0, (now - last) / 1000)); last = now;
      stepP1(dt); stepP2(dt);
    }, 33);
    stepP1(0); stepP2(0);
  }

  window.Activities = window.Activities || {};
  window.Activities['thermometer-lab'] = { render };
})();
