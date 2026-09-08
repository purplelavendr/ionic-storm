// "Cross-Multiplying & Dividing with Density" (registered as CONTENT activity id
// 'cross-multiply-density'). Same accordion + graded-quiz shape as matter-review.js,
// plus a drag-and-drop "Guided Practice" section that walks students through solving
// a proportion step by step: (1) build the cross-multiplication by dragging the right
// numbers into the right spots, (2) solve for the unknown by dividing, (3) attach the
// correct unit. D = m/V is treated as the proportion m/V = D/1, so the same engine
// covers solving for mass, volume, or density, plus same-substance scaling problems
// (m1/V1 = m2/V2) and a pure-math example -- every "form" of the same technique.
(function () {
  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function roundNice(n) {
    return Math.round(n * 100) / 100;
  }

  function formatNum(n) {
    if (typeof n !== 'number') return String(n);
    if (Number.isInteger(n)) return String(n);
    return String(parseFloat(n.toFixed(2)));
  }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // ---- Small visual building blocks for the concept section's algebra walkthroughs ----
  // A real fraction bar (not "m/V" inline text) and a labeled arrow between equation
  // states, so students see each rearrangement happen rather than reading it as prose.
  function eqvFrac(num, den, hlNum, hlDen) {
    return `<span class="eqv-frac"><span class="eqv-num${hlNum ? ' eqv-hl' : ''}">${num}</span><span class="eqv-bar"></span><span class="eqv-den${hlDen ? ' eqv-hl' : ''}">${den}</span></span>`;
  }
  function eqvArrow(label) {
    return `<div class="eqv-arrow"><span class="eqv-arrow-glyph">↓</span><span class="eqv-arrow-label">${escapeHtml(label)}</span></div>`;
  }
  function eqvHl(text) {
    return `<span class="eqv-hl">${escapeHtml(text)}</span>`;
  }

  // ---- D = M/V, rearranged with real algebra (no memorized triangle) ----
  // Every guided problem starts with the same equation, D = M/V. Whichever
  // letter is unknown, isolating it takes one of these three algebra moves:
  //   D is already alone            -> just divide:                D = M ÷ V
  //   V is in the denominator       -> multiply both sides by V,
  //                                    then divide both sides by D: V = M ÷ D
  //   M is alone once multiplied    -> multiply both sides by V:    M = D × V
  // `operands` gives the two known values in the order they're used, and the
  // student rebuilds this exact isolated form by dragging those same two
  // number tiles into it -- so the drag itself performs the rearrangement.
  const REARRANGE = {
    D: { operands: ['M', 'V'], op: '÷', shortLabel: 'already isolated — divide', note: 'D is already alone on one side of D = M/V — no rearranging needed. Just divide the two values you know.' },
    V: { operands: ['M', 'D'], op: '÷', shortLabel: '× V, then ÷ D', note: 'V is in the denominator. Multiply both sides by V, then divide both sides by D — that isolates V = M ÷ D.' },
    M: { operands: ['D', 'V'], op: '×', shortLabel: '× V on both sides', note: 'Multiply both sides by V to clear the fraction — that isolates M = D × V.' }
  };

  function computeAnswerDistractors(op1, op2, op, correct) {
    const candidates = [
      op === '×' ? op1 / op2 : op1 * op2,
      op2 / op1,
      correct + op1,
      correct - op1
    ].map(roundNice).filter(n => Number.isFinite(n) && n > 0 && Math.abs(n - correct) > 0.001);
    const unique = [...new Set(candidates)];
    while (unique.length < 2) unique.push(roundNice(correct + (unique.length + 1) * 7.5));
    return shuffle(unique).slice(0, 2);
  }

  let uidSeq = 0;
  function defineDensityProblem(cfg) {
    const rearrange = REARRANGE[cfg.unknown];
    const [op1Key, op2Key] = rearrange.operands;
    const op1 = cfg.given[op1Key].value, op2 = cfg.given[op2Key].value;
    const answer = roundNice(rearrange.op === '×' ? op1 * op2 : op1 / op2);

    const knownKeys = ['D', 'M', 'V'].filter(k => k !== cfg.unknown);
    const step1Tiles = knownKeys.map(k => ({
      id: 'tile-' + (++uidSeq), value: cfg.given[k].value, unit: cfg.given[k].unit, target: k
    }));
    if (cfg.distractor) {
      step1Tiles.push({ id: 'tile-' + (++uidSeq), value: cfg.distractor.value, unit: cfg.distractor.unit, target: null });
    }
    const step2Tiles = [op1Key, op2Key].map(k => ({
      id: 'tile-' + (++uidSeq), value: cfg.given[k].value, unit: cfg.given[k].unit, target: k
    }));

    return Object.assign({}, cfg, { rearrange, op1Key, op2Key, op1, op2, answer, step1Tiles, step2Tiles });
  }

  const GUIDED_PROBLEMS = [
    defineDensityProblem({
      id: 'gd1',
      word: 'A 10 cm³ sample of a mineral has a mass of 32 g. What is its density?',
      given: {
        D: null,
        M: { value: 32, unit: 'g' },
        V: { value: 10, unit: 'cm³' }
      },
      unknown: 'D',
      distractor: { value: 320, unit: 'g' },
      finalUnit: 'g/cm³',
      unitOptions: ['g/cm³', 'g', 'cm³'],
      recap: 'D = M ÷ V = 32 g ÷ 10 cm³ = 3.2 g/cm³'
    }),
    defineDensityProblem({
      id: 'gd2',
      word: 'A liquid has a density of 0.8 g/mL. What volume would 100 g of the liquid occupy?',
      given: {
        D: { value: 0.8, unit: 'g/mL' },
        M: { value: 100, unit: 'g' },
        V: null
      },
      unknown: 'V',
      distractor: { value: 8, unit: 'g/mL' },
      finalUnit: 'mL',
      unitOptions: ['mL', 'g', 'g/mL'],
      recap: 'V = M ÷ D = 100 g ÷ 0.8 g/mL = 125 mL'
    }),
    defineDensityProblem({
      id: 'gd3',
      word: 'A block of aluminum has a density of 2.7 g/cm³ and a volume of 45 cm³. What is its mass?',
      given: {
        D: { value: 2.7, unit: 'g/cm³' },
        M: null,
        V: { value: 45, unit: 'cm³' }
      },
      unknown: 'M',
      distractor: { value: 27, unit: 'g/cm³' },
      finalUnit: 'g',
      unitOptions: ['g', 'cm³', 'g/cm³'],
      recap: 'M = D × V = 2.7 g/cm³ × 45 cm³ = 121.5 g'
    })
  ];

  // ---- Bonus: cross-multiplying a plain proportion (no word problem to set up) ----
  // The proportion a/b = c/d is given as-is; the student only cross multiplies
  // (a x d = b x c) and solves for whichever letter is missing -- once as a
  // numerator, once as a denominator -- so there's no unit-attaching step.
  function defineProportionProblem(cfg) {
    const { a, b, c, d, unknownKey, variable } = cfg;
    const v = k => ({ a, b, c, d }[k]);
    let coefficientKey, coefficient, product;
    if (unknownKey === 'a') { coefficientKey = 'd'; coefficient = v('d'); product = v('b') * v('c'); }
    else if (unknownKey === 'd') { coefficientKey = 'a'; coefficient = v('a'); product = v('b') * v('c'); }
    else if (unknownKey === 'b') { coefficientKey = 'c'; coefficient = v('c'); product = v('a') * v('d'); }
    else { coefficientKey = 'b'; coefficient = v('b'); product = v('a') * v('d'); }
    const answer = roundNice(product / coefficient);

    const dragKeys = ['a', 'b', 'c', 'd'].filter(k => k !== unknownKey);
    const tiles = dragKeys.map(k => ({ id: 'tile-' + (++uidSeq), value: v(k), unit: '', target: k }));

    return Object.assign({}, cfg, { coefficientKey, coefficient, product, answer, tiles });
  }

  const PROPORTION_PROBLEMS = [
    defineProportionProblem({
      id: 'px1',
      a: 4, b: 9, c: null, d: 27,
      unknownKey: 'c',
      variable: 'x',
      label: 'Solve for a numerator',
      recap: '4 × 27 = 9 × x → x = 108 ÷ 9 = 12'
    }),
    defineProportionProblem({
      id: 'px2',
      a: 8, b: 12, c: 20, d: null,
      unknownKey: 'd',
      variable: 'y',
      label: 'Solve for a denominator',
      recap: '8 × y = 12 × 20 → y = 240 ÷ 8 = 30'
    }),
    defineProportionProblem({
      id: 'px3',
      a: null, b: 6, c: 15, d: 18,
      unknownKey: 'a',
      variable: 'n',
      label: 'Solve for a numerator',
      recap: 'n × 18 = 6 × 15 → n = 90 ÷ 18 = 5'
    })
  ];

  const QUESTIONS = [
    {
      id: 'q1', type: 'mc',
      prompt: 'To solve the proportion 5/8 = x/40 for x, what do you do first?',
      choices: ['Add 5 and 8', 'Cross multiply: 5 × 40 and 8 × x', 'Divide 5 by 8', 'Multiply 8 × 40'],
      correct: 1,
      explanation: 'Cross multiplying turns the proportion into a plain equation: 5 × 40 = 8 × x.'
    },
    {
      id: 'q2', type: 'num',
      prompt: 'Solve for x: 5/8 = x/40',
      correct: 25,
      explanation: 'Cross multiply: 5 × 40 = 8 × x → 200 = 8x → x = 200 ÷ 8 = 25.'
    },
    {
      id: 'q3', type: 'num',
      prompt: 'A metal has a density of 8.9 g/cm³. What is the mass of 12 cm³ of the metal?',
      correct: 106.8,
      explanation: 'm = D × V = 8.9 × 12 = 106.8 g.'
    },
    {
      id: 'q4', type: 'num',
      prompt: 'A liquid has a mass of 200 g and a density of 1.25 g/mL. What is its volume?',
      correct: 160,
      explanation: 'V = m ÷ D = 200 ÷ 1.25 = 160 mL.'
    },
    {
      id: 'q5', type: 'num',
      prompt: 'A sample has a mass of 63 g and a volume of 9 cm³. What is its density?',
      correct: 7,
      explanation: 'D = m ÷ V = 63 ÷ 9 = 7 g/cm³.'
    },
    {
      id: 'q6', type: 'num',
      prompt: '25 mL of a solution has a mass of 30 g. What mass would 60 mL of the same solution have? (Round to the nearest tenth.)',
      correct: 72,
      explanation: 'Set up 30/25 = x/60. Cross multiply: 30 × 60 = 25 × x → 1800 = 25x → x = 72 g.'
    },
    {
      id: 'q7', type: 'num',
      prompt: 'A 12 cm³ piece of a certain wood has a mass of 8.4 g. What volume of the same wood would have a mass of 21 g?',
      correct: 30,
      explanation: 'Set up 8.4/12 = 21/x. Cross multiply: 8.4 × x = 12 × 21 = 252 → x = 252 ÷ 8.4 = 30 cm³.'
    },
    {
      id: 'q8', type: 'mc',
      prompt: 'When you cross multiply a/b = c/d, which equation do you get?',
      choices: ['a + d = b + c', 'a × d = b × c', 'a × b = c × d', 'a ÷ d = b ÷ c'],
      correct: 1,
      explanation: 'Cross multiplying a/b = c/d always gives a × d = b × c.'
    },
    {
      id: 'q9', type: 'mc',
      prompt: 'Density is calculated using which formula?',
      choices: ['D = m + V', 'D = m/V', 'D = V/m', 'D = m × V'],
      correct: 1,
      explanation: 'Density is mass divided by volume: D = m/V.'
    },
    {
      id: 'q10', type: 'num',
      prompt: 'Solve for x: x/8 = 15/24',
      correct: 5,
      explanation: 'Cross multiply: x × 24 = 8 × 15 → 24x = 120 → x = 120 ÷ 24 = 5.'
    },
    {
      id: 'q11', type: 'num',
      prompt: 'Solve for x: 14/x = 21/9',
      correct: 6,
      explanation: 'Cross multiply: 14 × 9 = 21 × x → 126 = 21x → x = 126 ÷ 21 = 6.'
    }
  ];

  const STYLE_ID = 'dx-lesson-styles';
  const FONT_LINK_ID = 'dx-lesson-fonts';
  const SECTION_META = [
    { title: 'Before You Begin', time: '2 min' },
    { title: 'The Density Formula & Cross-Multiplying', time: '6 min' },
    { title: 'Guided Practice: Drag It Into Place', time: '16 min' },
    { title: 'Practice Set: Solve It Yourself', time: '9 min' },
    { title: 'Check for Understanding', time: '11 min · graded' }
  ];
  const SECTION_COUNT = SECTION_META.length;

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
.dx-lesson {
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
.dx-lesson * { box-sizing: border-box; }
.dx-lesson .dx-header { background: var(--navy); color: var(--cream); padding: 2rem 1.75rem 1.6rem; position: relative; overflow: hidden; }
.dx-lesson .dx-header::before { content: ''; position: absolute; top: -60px; right: -60px; width: 220px; height: 220px; border-radius: 50%; border: 32px solid rgba(46,196,182,0.12); }
.dx-lesson .dx-header-label { font-family: 'JetBrains Mono', monospace; font-size: 0.68rem; letter-spacing: 0.2em; text-transform: uppercase; color: var(--teal); margin-bottom: 0.5rem; position: relative; }
.dx-lesson .dx-header h1 { font-family: 'Playfair Display', serif; font-size: 1.9rem; font-weight: 700; line-height: 1.2; margin: 0 0 0.4rem; position: relative; }
.dx-lesson .dx-header-meta { font-size: 0.82rem; color: rgba(247,243,236,0.65); font-family: 'JetBrains Mono', monospace; position: relative; }
.dx-lesson .dx-progress-wrap { background: var(--navy-mid); padding: 0.7rem 1.75rem; display: flex; align-items: center; gap: 0.9rem; position: sticky; top: 0; z-index: 10; }
.dx-lesson .dx-progress-label { font-family: 'JetBrains Mono', monospace; font-size: 0.65rem; color: var(--teal); text-transform: uppercase; letter-spacing: 0.1em; white-space: nowrap; }
.dx-lesson .dx-progress-track { flex: 1; height: 4px; background: rgba(255,255,255,0.12); border-radius: 2px; overflow: hidden; }
.dx-lesson .dx-progress-fill { height: 100%; background: linear-gradient(90deg, var(--teal), var(--amber)); border-radius: 2px; transition: width 0.4s ease; width: 0%; }
.dx-lesson .dx-progress-count { font-family: 'JetBrains Mono', monospace; font-size: 0.65rem; color: rgba(247,243,236,0.55); white-space: nowrap; }
.dx-lesson main { padding: 1.5rem 1.25rem 2.5rem; }
.dx-lesson .section-card { background: white; border-radius: 12px; margin-bottom: 1.1rem; box-shadow: 0 2px 12px rgba(0,0,0,0.06); overflow: hidden; }
.dx-lesson .section-header { display: flex; align-items: center; gap: 0.85rem; padding: 1rem 1.2rem; cursor: pointer; user-select: none; border-bottom: 1px solid transparent; }
.dx-lesson .section-header:hover { background: #fafafa; }
.dx-lesson .section-header.open { border-bottom-color: var(--cream-dark); }
.dx-lesson .section-num { font-family: 'JetBrains Mono', monospace; font-size: 0.7rem; font-weight: 600; color: white; background: var(--navy); border-radius: 6px; padding: 0.22rem 0.5rem; flex-shrink: 0; }
.dx-lesson .section-card.done .section-num { background: var(--teal-dim); }
.dx-lesson .section-title { font-family: 'Playfair Display', serif; font-size: 1.05rem; font-weight: 700; flex: 1; }
.dx-lesson .section-time { font-family: 'JetBrains Mono', monospace; font-size: 0.65rem; color: var(--text-muted); }
.dx-lesson .section-arrow { font-size: 0.9rem; color: var(--text-muted); transition: transform 0.25s; flex-shrink: 0; }
.dx-lesson .section-header.open .section-arrow { transform: rotate(180deg); }
.dx-lesson .section-body { display: none; padding: 1.3rem; }
.dx-lesson .section-body.open { display: block; animation: dxFadeIn 0.25s ease; }
@keyframes dxFadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
.dx-lesson h2 { font-family: 'Playfair Display', serif; font-size: 1.25rem; color: var(--navy); margin: 0 0 0.6rem; }
.dx-lesson h3 { font-size: 0.95rem; font-weight: 600; color: var(--navy-mid); margin: 1.1rem 0 0.5rem; }
.dx-lesson p { margin: 0 0 0.85rem; }
.dx-lesson p:last-child { margin-bottom: 0; }
.dx-lesson .note-box { background: var(--note-bg); border-left: 4px solid var(--note-border); border-radius: 0 8px 8px 0; padding: 0.9rem 1.1rem; margin: 1.1rem 0; display: flex; gap: 0.7rem; font-size: 0.9rem; }
.dx-lesson .note-box .note-icon { font-size: 1.15rem; flex-shrink: 0; }
.dx-lesson .concept-box { background: linear-gradient(135deg, var(--navy) 0%, var(--navy-mid) 100%); color: var(--cream); border-radius: 10px; padding: 1.2rem 1.4rem; margin: 1.1rem 0; }
.dx-lesson .concept-box .concept-label { font-family: 'JetBrains Mono', monospace; font-size: 0.62rem; text-transform: uppercase; letter-spacing: 0.16em; color: var(--teal); margin-bottom: 0.4rem; }
.dx-lesson .concept-box p { color: rgba(247,243,236,0.92); margin-bottom: 0; }
.dx-lesson .worked-example { background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 0.9rem 1.1rem; margin: 1.1rem 0; font-size: 0.9rem; font-family: 'JetBrains Mono', monospace; }
.dx-lesson .worked-example .we-label { font-family: 'JetBrains Mono', monospace; font-size: 0.62rem; text-transform: uppercase; letter-spacing: 0.14em; color: #0369a1; margin-bottom: 0.5rem; font-family: 'Source Serif 4', serif; }
.dx-lesson .worked-example .we-line { margin: 0.3rem 0; }
.dx-lesson .worked-example .we-context { font-family: 'Source Serif 4', serif; font-size: 0.9rem; color: var(--text); margin-bottom: 0.8rem; }
.dx-lesson .eqv-flow { display: flex; flex-direction: column; align-items: center; gap: 0.15rem; margin: 0.3rem 0; }
.dx-lesson .eqv-row { display: flex; align-items: center; justify-content: center; gap: 0.4em; font-family: 'JetBrains Mono', monospace; font-size: 1.05rem; font-weight: 700; color: var(--navy); flex-wrap: wrap; text-align: center; }
.dx-lesson .eqv-eq, .dx-lesson .eqv-op { color: var(--text-muted); font-weight: 700; }
.dx-lesson .eqv-frac { display: inline-flex; flex-direction: column; align-items: center; vertical-align: middle; line-height: 1.3; }
.dx-lesson .eqv-frac .eqv-num, .dx-lesson .eqv-frac .eqv-den { padding: 0 0.25em; }
.dx-lesson .eqv-frac .eqv-bar { width: 100%; height: 2px; background: var(--navy); margin: 1px 0; }
.dx-lesson .eqv-hl { background: #fef3c7; border: 1.5px solid var(--amber); border-radius: 6px; padding: 0.02em 0.32em; color: #92400e; }
.dx-lesson .eqv-arrow { display: flex; flex-direction: column; align-items: center; color: var(--teal-dim); margin: 0.2rem 0; }
.dx-lesson .eqv-arrow-glyph { font-size: 1.1rem; line-height: 1; }
.dx-lesson .eqv-arrow-label { font-family: 'JetBrains Mono', monospace; font-size: 0.62rem; text-transform: uppercase; letter-spacing: 0.05em; background: var(--cream-dark); color: var(--navy-mid); padding: 0.15em 0.55em; border-radius: 999px; margin-top: 0.1rem; white-space: nowrap; }
.dx-lesson .objectives-list { list-style: none; padding: 0; margin: 0.4rem 0; }
.dx-lesson .objectives-list li { display: flex; align-items: flex-start; gap: 0.55rem; padding: 0.4rem 0; font-size: 0.92rem; border-bottom: 1px solid var(--cream-dark); }
.dx-lesson .objectives-list li:last-child { border-bottom: none; }
.dx-lesson .obj-check { color: var(--teal); flex-shrink: 0; }
.dx-lesson table { width: 100%; border-collapse: collapse; margin: 0.9rem 0; font-size: 0.85rem; }
.dx-lesson th { background: var(--navy); color: var(--cream); font-family: 'JetBrains Mono', monospace; font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.08em; padding: 0.55rem 0.75rem; text-align: left; }
.dx-lesson td { padding: 0.5rem 0.75rem; border-bottom: 1px solid var(--cream-dark); }
.dx-lesson tr:nth-child(even) td { background: #fafafa; }
.dx-lesson .practice-problem { border: 1.5px solid var(--cream-dark); border-radius: 10px; margin-bottom: 1.1rem; overflow: hidden; }
.dx-lesson .pp-header { display: flex; align-items: center; gap: 0.65rem; padding: 0.85rem 1.1rem; background: #fafafa; border-bottom: 1px solid var(--cream-dark); }
.dx-lesson .pp-num { font-family: 'JetBrains Mono', monospace; font-size: 0.7rem; font-weight: 700; color: white; background: var(--amber); border-radius: 6px; padding: 0.18rem 0.45rem; flex-shrink: 0; }
.dx-lesson .pp-body { padding: 0.95rem 1.1rem; }
.dx-lesson .pp-body p { font-size: 0.92rem; }
.dx-lesson .hint-btn, .dx-lesson .reveal-btn, .dx-lesson .mark-done-btn, .dx-lesson .dx-choice, .dx-lesson .dx-next-btn, .dx-lesson .dx-retake-btn, .dx-lesson .check-btn {
  font-family: 'JetBrains Mono', monospace; cursor: pointer; border: none;
}
.dx-lesson .hint-btn, .dx-lesson .reveal-btn { border-radius: 6px; padding: 0.4rem 0.8rem; font-size: 0.68rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; }
.dx-lesson .hint-btn { background: #fef3c7; color: #92400e; border: 1px solid #fcd34d; margin-right: 0.5rem; }
.dx-lesson .hint-btn:hover { background: #fde68a; }
.dx-lesson .reveal-btn { background: var(--navy); color: white; }
.dx-lesson .reveal-btn:hover { background: var(--navy-light); }
.dx-lesson .hint-box, .dx-lesson .answer-box { border-radius: 7px; padding: 0.75rem 0.95rem; margin-top: 0.7rem; font-size: 0.87rem; display: none; }
.dx-lesson .hint-box.open, .dx-lesson .answer-box.open { display: block; animation: dxFadeIn 0.2s ease; }
.dx-lesson .hint-box { background: #fffbeb; border: 1px dashed #fcd34d; color: #78350f; }
.dx-lesson .answer-box { background: var(--correct-bg); border: 1px solid var(--correct-border); color: #065f46; }
.dx-lesson .answer-box .answer-label { font-family: 'JetBrains Mono', monospace; font-size: 0.62rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--teal-dim); margin-bottom: 0.35rem; font-weight: 700; }
.dx-lesson .mark-done-btn { display: block; width: 100%; margin-top: 1.2rem; background: var(--navy); color: var(--cream); border-radius: 8px; padding: 0.75rem 1rem; font-size: 0.75rem; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; transition: background 0.2s; }
.dx-lesson .mark-done-btn:hover:not(:disabled) { background: var(--teal-dim); }
.dx-lesson .mark-done-btn:disabled { background: var(--cream-dark); color: var(--text-muted); cursor: not-allowed; }
.dx-lesson .quiz-note { background: var(--note-bg); border-left: 4px solid var(--note-border); border-radius: 0 8px 8px 0; padding: 0.9rem 1.1rem; margin-bottom: 1.1rem; font-size: 0.88rem; }
.dx-lesson .quiz-progress-bar { height: 6px; background: var(--cream-dark); border-radius: 999px; overflow: hidden; margin: 0.6rem 0 0.9rem; }
.dx-lesson .quiz-progress-fill { height: 100%; background: linear-gradient(90deg, var(--navy), var(--teal)); transition: width 0.2s ease; }
.dx-lesson .quiz-question-count { font-family: 'JetBrains Mono', monospace; font-size: 0.72rem; color: var(--text-muted); }
.dx-lesson .quiz-prompt { font-family: 'Playfair Display', serif; font-size: 1.1rem; font-weight: 700; color: var(--navy); margin: 0.5rem 0 1rem; }
.dx-lesson .dx-choice { display: block; width: 100%; text-align: left; background: white; border: 1.5px solid var(--cream-dark); border-radius: 8px; padding: 0.7rem 0.9rem; margin-bottom: 0.6rem; font-size: 0.93rem; color: var(--text); font-family: 'Source Serif 4', serif; transition: border-color 0.15s, background 0.15s; }
.dx-lesson .dx-choice:hover:not(:disabled) { border-color: var(--teal); background: #f3fdfc; }
.dx-lesson .dx-choice:disabled { cursor: default; }
.dx-lesson .dx-choice.selected-correct { border-color: var(--correct-border); background: var(--correct-bg); }
.dx-lesson .dx-choice.selected-incorrect { border-color: #dc2626; background: #fef2f2; }
.dx-lesson .num-input { display: block; width: 160px; margin: 0.4rem 0 0.8rem; padding: 0.55rem 0.7rem; border: 1.5px solid var(--cream-dark); border-radius: 8px; font-size: 0.95rem; font-family: 'JetBrains Mono', monospace; }
.dx-lesson .num-input:focus { outline: none; border-color: var(--teal); }
.dx-lesson .dx-feedback { border-radius: 8px; padding: 0.75rem 1rem; margin-top: 0.4rem; font-size: 0.9rem; font-weight: 600; }
.dx-lesson .dx-feedback.correct { background: var(--correct-bg); color: var(--teal-dim); }
.dx-lesson .dx-feedback.incorrect { background: #fef2f2; color: #b91c1c; }
.dx-lesson .dx-next-btn, .dx-lesson .dx-retake-btn { background: var(--navy); color: white; border-radius: 8px; padding: 0.65rem 1.2rem; font-size: 0.75rem; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; margin-top: 1rem; }
.dx-lesson .dx-next-btn:hover, .dx-lesson .dx-retake-btn:hover { background: var(--navy-light); }
.dx-lesson .dx-summary { text-align: center; padding: 1rem 0.5rem; }
.dx-lesson .dx-score { font-family: 'JetBrains Mono', monospace; font-size: 2.4rem; font-weight: 700; color: var(--navy); margin: 0.4rem 0; }

/* ---- Guided drag-and-drop ---- */
.dx-lesson .dx-guided-progress { display: flex; align-items: center; gap: 0.7rem; margin-bottom: 1rem; font-family: 'JetBrains Mono', monospace; font-size: 0.7rem; color: var(--text-muted); }
.dx-lesson .gp-card { border: 1.5px solid var(--cream-dark); border-radius: 10px; margin-bottom: 1.2rem; overflow: hidden; }
.dx-lesson .gp-card.solved { border-color: var(--correct-border); }
.dx-lesson .gp-header { display: flex; align-items: center; gap: 0.6rem; padding: 0.8rem 1.1rem; background: #fafafa; border-bottom: 1px solid var(--cream-dark); }
.dx-lesson .gp-num { font-family: 'JetBrains Mono', monospace; font-size: 0.7rem; font-weight: 700; color: white; background: var(--amber); border-radius: 6px; padding: 0.18rem 0.5rem; }
.dx-lesson .gp-badge { margin-left: auto; font-family: 'JetBrains Mono', monospace; font-size: 0.6rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--teal-dim); }
.dx-lesson .gp-word { padding: 0.9rem 1.1rem 0; font-size: 0.94rem; }
.dx-lesson .gp-given { padding: 1rem 1.1rem 0; }
.dx-lesson .step-note { background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 0.6rem 0.85rem; margin: 0 0 0.9rem; font-size: 0.85rem; }
.dx-lesson .dx-step { padding: 0.9rem 1.1rem 1.1rem; }
.dx-lesson .dx-step.dx-step-hidden { display: none; }
.dx-lesson .step-label { font-family: 'JetBrains Mono', monospace; font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--navy-mid); margin-bottom: 0.7rem; font-weight: 700; }
.dx-lesson .eq-row { display: flex; align-items: center; justify-content: center; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1rem; }
.dx-lesson .eq-op, .dx-lesson .eq-eq { font-family: 'JetBrains Mono', monospace; font-size: 1.1rem; font-weight: 700; color: var(--text-muted); }
.dx-lesson .eq-slot { min-width: 76px; min-height: 52px; display: inline-flex; align-items: center; justify-content: center; border-radius: 8px; padding: 0.3rem 0.6rem; font-family: 'JetBrains Mono', monospace; font-weight: 700; font-size: 0.95rem; }
.dx-lesson .eq-slot[data-filled="false"] { border: 2px dashed #cbd5e1; background: #f8fafc; color: var(--text-muted); }
.dx-lesson .eq-slot[data-filled="true"] { border: 2px solid var(--navy-mid); background: white; }
.dx-lesson .eq-slot.fixed { border: 2px solid var(--cream-dark); background: var(--cream-dark); color: var(--navy-mid); }
.dx-lesson .eq-slot.unknown { border: 2px solid var(--amber); background: #fff3e6; color: #b45309; }
.dx-lesson .eq-slot.slot-correct { border-color: var(--correct-border); background: var(--correct-bg); }
.dx-lesson .eq-slot.slot-incorrect { border-color: #dc2626; background: #fef2f2; animation: dxShake 0.3s; }
@keyframes dxShake { 0%,100%{transform:translateX(0);} 25%{transform:translateX(-4px);} 75%{transform:translateX(4px);} }
.dx-lesson .slot-placeholder { color: #94a3b8; font-size: 0.85rem; }
.dx-lesson .tile-tray { display: flex; flex-wrap: wrap; gap: 0.6rem; padding: 0.8rem; background: #f8fafc; border-radius: 8px; margin-bottom: 0.9rem; min-height: 56px; }
.dx-lesson .tile { touch-action: none; user-select: none; display: inline-flex; align-items: center; gap: 0.3rem; background: white; border: 2px solid var(--navy-mid); border-radius: 8px; padding: 0.5rem 0.7rem; font-family: 'JetBrains Mono', monospace; font-weight: 700; font-size: 0.9rem; cursor: grab; box-shadow: 0 2px 4px rgba(0,0,0,0.06); }
.dx-lesson .tile .tile-unit { font-weight: 500; font-size: 0.78rem; color: var(--text-muted); }
.dx-lesson .tile.selected { border-color: var(--teal); box-shadow: 0 0 0 3px rgba(46,196,182,0.25); }
.dx-lesson .tile.placed { cursor: pointer; box-shadow: none; border-width: 0; padding: 0; background: transparent; }
.dx-lesson .tile.disabled-locked { opacity: 0.35; cursor: default; pointer-events: none; }
.dx-lesson .tile.tile-ghost { opacity: 0.3; }
.dx-lesson .tile-drag-clone { position: fixed; pointer-events: none; z-index: 999; opacity: 0.92; transform: translate(-50%, -50%) scale(1.05); box-shadow: 0 8px 20px rgba(0,0,0,0.25); }
.dx-lesson .check-btn { background: var(--navy); color: white; border-radius: 8px; padding: 0.6rem 1.1rem; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; }
.dx-lesson .check-btn:hover:not(:disabled) { background: var(--navy-light); }
.dx-lesson .check-btn:disabled { background: var(--cream-dark); color: var(--text-muted); cursor: default; }
.dx-lesson .step-feedback { margin-top: 0.7rem; font-size: 0.85rem; font-weight: 600; min-height: 1.2em; }
.dx-lesson .step-feedback.ok { color: var(--teal-dim); }
.dx-lesson .step-feedback.bad { color: #b91c1c; }
.dx-lesson .step-eq-display { font-family: 'JetBrains Mono', monospace; font-size: 0.95rem; background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 0.7rem 0.9rem; margin-bottom: 0.9rem; text-align: center; }
.dx-lesson .gp-recap { background: var(--correct-bg); border-left: 4px solid var(--correct-border); border-radius: 0 8px 8px 0; padding: 0.9rem 1.1rem; margin: 0 1.1rem 1.1rem; font-family: 'JetBrains Mono', monospace; font-size: 0.88rem; color: #065f46; }
`;
    document.head.appendChild(style);
  }

  // ---- Shared drag/tap engine (event-delegated once per activity mount) ----
  function isDroppableSlot(el) {
    return !!(el && el.matches('.eq-slot[data-slot]') && !el.classList.contains('fixed') && !el.classList.contains('unknown'));
  }

  function makeTileEl(tile) {
    const el = document.createElement('div');
    el.className = 'tile';
    el.dataset.tileId = tile.id;
    el.dataset.target = tile.target == null ? '' : tile.target;
    el.tabIndex = 0;
    el.innerHTML = `<span class="tile-val">${escapeHtml(formatNum(tile.value))}</span>${tile.unit ? `<span class="tile-unit">${escapeHtml(tile.unit)}</span>` : ''}`;
    return el;
  }

  function placeTile(tileEl, slotEl) {
    if (slotEl.dataset.filled === 'true') return;
    slotEl.dataset.filled = 'true';
    slotEl.innerHTML = '';
    tileEl.classList.add('placed');
    slotEl.appendChild(tileEl);
  }

  function returnTileFromSlot(slotEl, trayEl) {
    const tileEl = slotEl.querySelector('.tile');
    slotEl.dataset.filled = 'false';
    slotEl.innerHTML = '<span class="slot-placeholder">?</span>';
    if (tileEl && trayEl) {
      tileEl.classList.remove('placed', 'selected');
      trayEl.appendChild(tileEl);
    }
  }

  function setFeedback(stepEl, msg, ok) {
    const fb = stepEl.querySelector('.step-feedback');
    if (!fb) return;
    fb.textContent = msg;
    fb.className = 'step-feedback ' + (ok ? 'ok' : 'bad');
  }

  function setupDragEngine(root) {
    let selectedTile = null;
    function clearSelection() {
      if (selectedTile) selectedTile.classList.remove('selected');
      selectedTile = null;
    }

    root.addEventListener('pointerdown', (e) => {
      const solvedStep = e.target.closest('.dx-step');
      if (solvedStep && solvedStep.classList.contains('step-solved')) return;

      const tileEl = e.target.closest('.tile');
      const isActionableTile = tileEl && !tileEl.classList.contains('placed') && !tileEl.classList.contains('disabled-locked');
      const slotEl = e.target.closest('.eq-slot');

      if (isActionableTile) {
        e.preventDefault();
        const startX = e.clientX, startY = e.clientY;
        let dragging = false, clone = null;
        const onMove = (ev) => {
          const dx = ev.clientX - startX, dy = ev.clientY - startY;
          if (!dragging && Math.hypot(dx, dy) > 6) {
            dragging = true;
            clone = tileEl.cloneNode(true);
            clone.classList.add('tile-drag-clone');
            document.body.appendChild(clone);
            tileEl.classList.add('tile-ghost');
          }
          if (dragging && clone) {
            clone.style.left = ev.clientX + 'px';
            clone.style.top = ev.clientY + 'px';
          }
        };
        const onUp = (ev) => {
          document.removeEventListener('pointermove', onMove);
          document.removeEventListener('pointerup', onUp);
          if (dragging) {
            tileEl.classList.remove('tile-ghost');
            if (clone) clone.remove();
            const under = document.elementFromPoint(ev.clientX, ev.clientY);
            const targetSlot = under && under.closest('.eq-slot');
            if (isDroppableSlot(targetSlot) && targetSlot.dataset.filled !== 'true') {
              clearSelection();
              placeTile(tileEl, targetSlot);
            }
          } else if (selectedTile === tileEl) {
            clearSelection();
          } else {
            clearSelection();
            selectedTile = tileEl;
            tileEl.classList.add('selected');
          }
        };
        document.addEventListener('pointermove', onMove);
        document.addEventListener('pointerup', onUp, { once: true });
      } else if (isDroppableSlot(slotEl)) {
        if (slotEl.dataset.filled === 'true') {
          const stepEl = slotEl.closest('.dx-step');
          const tray = stepEl && stepEl.querySelector('.tile-tray');
          returnTileFromSlot(slotEl, tray);
        } else if (selectedTile) {
          placeTile(selectedTile, slotEl);
          clearSelection();
        }
      }
    });
  }

  // Wires a tray + check button inside a step container; every step (build the
  // cross-multiplication, solve for x, attach the unit) uses this same logic --
  // it just checks that whichever `.eq-slot[data-slot]` boxes exist hold the tile
  // whose `data-target` matches that slot's key.
  function wireStep(stepEl, tiles, onSuccess) {
    const tray = stepEl.querySelector('.tile-tray');
    shuffle(tiles).forEach(t => tray.appendChild(makeTileEl(t)));
    const checkBtn = stepEl.querySelector('.check-btn');
    checkBtn.addEventListener('click', () => {
      const slotEls = [...stepEl.querySelectorAll('.eq-slot[data-slot]')].filter(isDroppableSlot);
      if (slotEls.some(s => s.dataset.filled !== 'true')) {
        setFeedback(stepEl, `Fill in the box${slotEls.length > 1 ? 'es' : ''} first.`, false);
        return;
      }
      const correct = slotEls.every(s => {
        const t = s.querySelector('.tile');
        return t && t.dataset.target === s.dataset.slot;
      });
      if (correct) {
        slotEls.forEach(s => s.classList.add('slot-correct'));
        checkBtn.disabled = true;
        stepEl.classList.add('step-solved');
        setFeedback(stepEl, '✓ Correct!', true);
        onSuccess();
      } else {
        slotEls.forEach(s => {
          const t = s.querySelector('.tile');
          if (!(t && t.dataset.target === s.dataset.slot)) s.classList.add('slot-incorrect');
        });
        setFeedback(stepEl, 'Not quite — check which number goes where, then try again.', false);
        setTimeout(() => {
          slotEls.forEach(s => { s.classList.remove('slot-incorrect'); returnTileFromSlot(s, tray); });
        }, 900);
      }
    });
  }

  function densitySlotHtml(varName, problem) {
    if (varName === problem.unknown) return `<div class="eq-slot unknown" data-slot="${varName}"><span>x</span></div>`;
    return `<div class="eq-slot" data-slot="${varName}" data-filled="false"><span class="slot-placeholder">?</span></div>`;
  }

  function renderGuidedCard(problem, index) {
    return `
      <div class="gp-card" id="gp-${problem.id}" data-gp="${problem.id}">
        <div class="gp-header"><span class="gp-num">${index + 1}</span><span class="gp-badge">Solve for ${problem.unknown}</span></div>
        <p class="gp-word">${escapeHtml(problem.word)}</p>
        <div class="dx-step" data-role="step1">
          <div class="step-label">Step 1 — Fill in D = M / V</div>
          <div class="eqv-row">
            ${densitySlotHtml('D', problem)}<span class="eqv-eq">=</span><span class="eqv-frac">${densitySlotHtml('M', problem)}<span class="eqv-bar"></span>${densitySlotHtml('V', problem)}</span>
          </div>
          <div class="tile-tray"></div>
          <button type="button" class="check-btn">Check Step 1</button>
          <div class="step-feedback"></div>
        </div>
        <div class="dx-step dx-step-hidden" data-role="step2"></div>
        <div class="dx-step dx-step-hidden" data-role="step3"></div>
        <div class="dx-step dx-step-hidden" data-role="step4"></div>
        <div class="gp-recap" hidden></div>
      </div>
    `;
  }

  function initGuidedCard(cardEl, problem, onSolved) {
    const step1El = cardEl.querySelector('[data-role="step1"]');
    const step2El = cardEl.querySelector('[data-role="step2"]');
    const step3El = cardEl.querySelector('[data-role="step3"]');
    const step4El = cardEl.querySelector('[data-role="step4"]');
    const recapEl = cardEl.querySelector('.gp-recap');
    const { rearrange, op1Key, op2Key, op1, op2, answer } = problem;
    const op1Slot = `<div class="eq-slot" data-slot="${op1Key}" data-filled="false"><span class="slot-placeholder">?</span></div>`;
    const op2Slot = `<div class="eq-slot" data-slot="${op2Key}" data-filled="false"><span class="slot-placeholder">?</span></div>`;

    wireStep(step1El, problem.step1Tiles.slice(), () => {
      step2El.innerHTML = `
        <div class="step-label">Step 2 — Rearrange with algebra</div>
        ${eqvArrow(rearrange.shortLabel)}
        <p class="step-note">${escapeHtml(rearrange.note)}</p>
        <div class="eqv-row">${problem.unknown} <span class="eqv-eq">=</span> ${
          rearrange.op === '×'
            ? `${op1Slot}<span class="eqv-op">×</span>${op2Slot}`
            : `<span class="eqv-frac">${op1Slot}<span class="eqv-bar"></span>${op2Slot}</span>`
        }</div>
        <div class="tile-tray"></div>
        <button type="button" class="check-btn">Check Step 2</button>
        <div class="step-feedback"></div>
      `;
      step2El.classList.remove('dx-step-hidden');

      wireStep(step2El, problem.step2Tiles.slice(), () => {
        step3El.innerHTML = `
          <div class="step-label">Step 3 — Do the math</div>
          <div class="eqv-row">${problem.unknown} <span class="eqv-eq">=</span> ${formatNum(op1)} <span class="eqv-op">${rearrange.op}</span> ${formatNum(op2)}</div>
          ${eqvArrow('compute')}
          <div class="eq-row">${problem.unknown} = <div class="eq-slot" data-slot="answer" data-filled="false"><span class="slot-placeholder">?</span></div></div>
          <div class="tile-tray"></div>
          <button type="button" class="check-btn">Check Step 3</button>
          <div class="step-feedback"></div>
        `;
        step3El.classList.remove('dx-step-hidden');

        const distractors = computeAnswerDistractors(op1, op2, rearrange.op, answer);
        const answerTiles = [{ id: 'ans-' + problem.id, value: answer, unit: '', target: 'answer' }]
          .concat(distractors.map((d, i) => ({ id: 'ans-' + problem.id + '-d' + i, value: d, unit: '', target: null })));

        wireStep(step3El, answerTiles, () => {
          step4El.innerHTML = `
            <div class="step-label">Step 4 — Attach the correct unit</div>
            <div class="eqv-row">${problem.unknown} <span class="eqv-eq">=</span> ${formatNum(answer)}</div>
            ${eqvArrow('attach the unit')}
            <div class="eq-row"><div class="eq-slot" data-slot="unit" data-filled="false"><span class="slot-placeholder">?</span></div></div>
            <div class="tile-tray"></div>
            <button type="button" class="check-btn">Check Step 4</button>
            <div class="step-feedback"></div>
          `;
          step4El.classList.remove('dx-step-hidden');
          const unitTiles = shuffle(problem.unitOptions).map((u, i) => ({
            id: 'unit-' + problem.id + '-' + i, value: u, unit: '', target: u === problem.finalUnit ? 'unit' : null
          }));
          wireStep(step4El, unitTiles, () => {
            cardEl.classList.add('solved');
            recapEl.hidden = false;
            recapEl.textContent = '✓ Solved! ' + problem.recap;
            onSolved();
          });
        });
      });
    });
  }

  // ---- Bonus proportion cards: given proportion, cross multiply, solve ----
  function proportionSlotHtml(key, problem) {
    if (key === problem.unknownKey) return `<div class="eq-slot unknown" data-slot="${key}"><span>${escapeHtml(problem.variable)}</span></div>`;
    return `<div class="eq-slot" data-slot="${key}" data-filled="false"><span class="slot-placeholder">?</span></div>`;
  }

  function proportionGivenDisplay(problem) {
    const val = k => k === problem.unknownKey ? problem.variable : formatNum(problem[k]);
    return `<div class="eqv-row">${eqvFrac(val('a'), val('b'))} <span class="eqv-eq">=</span> ${eqvFrac(val('c'), val('d'))}</div>`;
  }

  function renderProportionCard(problem, index) {
    return `
      <div class="gp-card" id="gp-${problem.id}" data-gp="${problem.id}">
        <div class="gp-header"><span class="gp-num">${String.fromCharCode(65 + index)}</span><span class="gp-badge">${escapeHtml(problem.label)}</span></div>
        <div class="gp-given">${proportionGivenDisplay(problem)}</div>
        <div class="dx-step" data-role="step1">
          <div class="step-label">Step 1 — Cross multiply</div>
          ${eqvArrow('cross multiply')}
          <div class="eq-row">
            ${proportionSlotHtml('a', problem)}<span class="eq-op">×</span>${proportionSlotHtml('d', problem)}
            <span class="eq-eq">=</span>
            ${proportionSlotHtml('b', problem)}<span class="eq-op">×</span>${proportionSlotHtml('c', problem)}
          </div>
          <div class="tile-tray"></div>
          <button type="button" class="check-btn">Check Step 1</button>
          <div class="step-feedback"></div>
        </div>
        <div class="dx-step dx-step-hidden" data-role="step2"></div>
        <div class="gp-recap" hidden></div>
      </div>
    `;
  }

  function initProportionCard(cardEl, problem, onSolved) {
    const step1El = cardEl.querySelector('[data-role="step1"]');
    const step2El = cardEl.querySelector('[data-role="step2"]');
    const recapEl = cardEl.querySelector('.gp-recap');
    const { coefficient, product, answer, variable } = problem;

    wireStep(step1El, problem.tiles.slice(), () => {
      step2El.innerHTML = `
        <div class="step-label">Step 2 — Solve for ${escapeHtml(variable)}</div>
        ${eqvArrow('÷ ' + formatNum(coefficient) + ' on both sides')}
        <div class="eqv-row">${formatNum(coefficient)} <span class="eqv-op">×</span> ${escapeHtml(variable)} <span class="eqv-eq">=</span> ${formatNum(product)}</div>
        <div class="eq-row">${escapeHtml(variable)} = <div class="eq-slot" data-slot="answer" data-filled="false"><span class="slot-placeholder">?</span></div></div>
        <div class="tile-tray"></div>
        <button type="button" class="check-btn">Check Step 2</button>
        <div class="step-feedback"></div>
      `;
      step2El.classList.remove('dx-step-hidden');

      const distractors = computeAnswerDistractors(product, coefficient, '÷', answer);
      const answerTiles = [{ id: 'ans-' + problem.id, value: answer, unit: '', target: 'answer' }]
        .concat(distractors.map((d, i) => ({ id: 'ans-' + problem.id + '-d' + i, value: d, unit: '', target: null })));

      wireStep(step2El, answerTiles, () => {
        cardEl.classList.add('solved');
        recapEl.hidden = false;
        recapEl.textContent = '✓ Solved! ' + problem.recap;
        onSolved();
      });
    });
  }

  function renderGuidedSection(mount, onAllSolved) {
    const totalProblems = GUIDED_PROBLEMS.length + PROPORTION_PROBLEMS.length;
    mount.innerHTML = `
      <p>Every problem below starts from the same equation, <strong>D = M/V</strong>. Drag a number tile into a box (or tap a tile, then tap the box) to place it — tap a filled box to send the tile back. Work through each step in order: fill in the formula, rearrange it with algebra, do the math, then attach the unit.</p>
      <div class="dx-guided-progress"><span id="gp-progress-label">0 / ${totalProblems} problems solved</span></div>
      ${GUIDED_PROBLEMS.map(renderGuidedCard).join('')}
      <h3>Bonus: Cross-Multiplying a Proportion</h3>
      <p>These proportions are already set up for you — just cross multiply and solve for the missing letter.</p>
      ${PROPORTION_PROBLEMS.map(renderProportionCard).join('')}
    `;
    let solvedCount = 0;
    const progressLabel = mount.querySelector('#gp-progress-label');
    const allCards = GUIDED_PROBLEMS.map(problem => ({ problem, init: initGuidedCard }))
      .concat(PROPORTION_PROBLEMS.map(problem => ({ problem, init: initProportionCard })));
    allCards.forEach(({ problem, init }) => {
      const cardEl = mount.querySelector('#gp-' + problem.id);
      init(cardEl, problem, () => {
        solvedCount++;
        progressLabel.textContent = `${solvedCount} / ${totalProblems} problems solved`;
        if (solvedCount === totalProblems) onAllSolved();
      });
    });
  }

  // ---- Static practice-set (ungraded, hint/reveal) ----
  function practiceProblem(idSuffix, prompt, hint, answer) {
    return `
      <div class="practice-problem">
        <div class="pp-header"><span class="pp-num">Q</span></div>
        <div class="pp-body">
          <p><strong>${escapeHtml(prompt)}</strong></p>
          <button type="button" class="hint-btn" data-hint-target="pshint-${idSuffix}">💡 Hint</button>
          <button type="button" class="reveal-btn" data-answer-target="psans-${idSuffix}">Reveal Answer</button>
          <div class="hint-box" id="pshint-${idSuffix}">${escapeHtml(hint)}</div>
          <div class="answer-box" id="psans-${idSuffix}">
            <div class="answer-label">✓ Answer</div>
            ${escapeHtml(answer)}
          </div>
        </div>
      </div>`;
  }

  function practiceSetHtml() {
    return `
      <p>Try each one on paper first, then reveal the answer to check your work.</p>
      ${practiceProblem('p1', 'In the proportion 3/8 = x/24, what is x?', 'Cross multiply: 3 × 24 = 8 × x.', 'Cross multiply: 3 × 24 = 8 × x → 72 = 8x → x = 9.')}
      ${practiceProblem('p2', 'Gold has a density of 19.3 g/cm³. What is the mass of 15 cm³ of gold?', 'm = D × V.', 'm = D × V = 19.3 × 15 = 289.5 g.')}
      ${practiceProblem('p3', 'A liquid has a mass of 120 g and a density of 0.8 g/mL. What is its volume?', 'V = m ÷ D.', 'V = m ÷ D = 120 ÷ 0.8 = 150 mL.')}
      ${practiceProblem('p4', 'A rock has a mass of 45 g and a volume of 18 cm³. What is its density?', 'D = m ÷ V.', 'D = m ÷ V = 45 ÷ 18 = 2.5 g/cm³.')}
      ${practiceProblem('p5', '40 mL of a liquid has a mass of 52 g. What mass would 65 mL of the same liquid have?', 'Set up 52/40 = x/65, then cross multiply.', '52/40 = x/65 → 52 × 65 = 40 × x → 3380 = 40x → x = 84.5 g.')}
      ${practiceProblem('p6', 'A 9 cm³ sample of a metal has a mass of 71.1 g. What volume of the same metal would have a mass of 118.5 g?', 'Set up 71.1/9 = 118.5/x, then cross multiply.', '71.1/9 = 118.5/x → 71.1 × x = 9 × 118.5 = 1066.5 → x = 15 cm³.')}
      ${practiceProblem('p7', 'In the proportion 12/x = 8/6, what is x?', 'Cross multiply: 12 × 6 = 8 × x.', 'Cross multiply: 12 × 6 = 8 × x → 72 = 8x → x = 9.')}
      ${practiceProblem('p8', 'A liquid has a mass of 68.4 g and a volume of 36 mL. What is its density?', 'D = m ÷ V.', 'D = m ÷ V = 68.4 ÷ 36 = 1.9 g/mL.')}
    `;
  }

  function beforeYouBeginHtml(activity) {
    return `
      <p>This review pairs with your density unit: <strong>D = m/V</strong>. It focuses on the algebra skill that unlocks every density problem — cross-multiplying and dividing to solve for whichever piece is missing.</p>
      <p><strong>How this works:</strong></p>
      <ul>
        <li>Click a section header to open it and read through the content.</li>
        <li>The <strong>Guided Practice</strong> section is a drag-and-drop, step-by-step solver — three density problems in order from easiest (solving for D) to hardest (solving for M), plus three bonus problems cross-multiplying a plain proportion.</li>
        <li>Click <strong>Mark Complete</strong> at the bottom of each section to move to the next.</li>
        <li>The last section is a <strong>graded Check for Understanding</strong> — that one saves your score for your teacher.</li>
      </ul>
      <p><strong>By the end of this review, you should be able to:</strong></p>
      <ul class="objectives-list">
        <li><span class="obj-check">◎</span> Rearrange D = m/V using algebra (multiplying and dividing both sides) to solve for mass, volume, or density — not a memorized shortcut</li>
        <li><span class="obj-check">◎</span> Set up a proportion and cross multiply to solve for an unknown</li>
        <li><span class="obj-check">◎</span> Use a proportion to scale a density problem between two samples of the same substance</li>
        <li><span class="obj-check">◎</span> Decide when to multiply and when to divide when isolating a variable</li>
      </ul>`;
  }

  function conceptHtml() {
    return `
      <h2>The Density Formula</h2>
      <p>Density connects three quantities: <strong>D</strong> (density), <strong>m</strong> (mass), and <strong>V</strong> (volume), with <strong>D = m/V</strong>.</p>
      <div class="concept-box">
        <div class="concept-label">Formula</div>
        <p>D = m/V</p>
      </div>
      <p>To solve for mass or volume instead of density, you rearrange this equation with algebra — the same two moves every time: <strong>multiply both sides</strong> by whatever's in the denominator, and <strong>divide both sides</strong> to isolate the letter you want. There's no separate trick to memorize for each one.</p>
      <div class="worked-example">
        <div class="we-label">Solving for D — already alone, no rearranging needed</div>
        <div class="eqv-flow">
          <div class="eqv-row">D <span class="eqv-eq">=</span> ${eqvFrac('m', 'V')}</div>
          ${eqvArrow('already isolated — just divide')}
          <div class="eqv-row">D <span class="eqv-eq">=</span> m <span class="eqv-op">÷</span> V</div>
        </div>
      </div>
      <div class="worked-example">
        <div class="we-label">Solving for m</div>
        <div class="eqv-flow">
          <div class="eqv-row">D <span class="eqv-eq">=</span> ${eqvFrac('m', 'V', false, true)}</div>
          ${eqvArrow('× V on both sides')}
          <div class="eqv-row">D <span class="eqv-op">×</span> ${eqvHl('V')} <span class="eqv-eq">=</span> m</div>
        </div>
      </div>
      <div class="worked-example">
        <div class="we-label">Solving for V</div>
        <div class="eqv-flow">
          <div class="eqv-row">D <span class="eqv-eq">=</span> ${eqvFrac('m', 'V', false, true)}</div>
          ${eqvArrow('× V on both sides')}
          <div class="eqv-row">${eqvHl('D')} <span class="eqv-op">×</span> V <span class="eqv-eq">=</span> m</div>
          ${eqvArrow('÷ D on both sides')}
          <div class="eqv-row">V <span class="eqv-eq">=</span> ${eqvFrac('m', 'D', false, true)}</div>
        </div>
      </div>
      <div class="note-box">
        <span class="note-icon">📝</span>
        <div class="note-text">On your guided notes, write out all three rearrangements above, showing the multiply/divide step each time — not just the final formula.</div>
      </div>
      <h2>Cross-Multiplying a Proportion</h2>
      <div class="concept-box">
        <div class="concept-label">Rule</div>
        <p>For any proportion <strong>a/b = c/d</strong>, cross multiplying gives <strong>a × d = b × c</strong>. Then divide to isolate whichever letter is unknown.</p>
      </div>
      <div class="worked-example">
        <div class="we-label">Worked example</div>
        <div class="eqv-flow">
          <div class="eqv-row">${eqvFrac('3', '5')} <span class="eqv-eq">=</span> ${eqvFrac('x', '20')}</div>
          ${eqvArrow('cross multiply')}
          <div class="eqv-row">3 <span class="eqv-op">×</span> 20 <span class="eqv-eq">=</span> 5 <span class="eqv-op">×</span> x</div>
          ${eqvArrow('simplify')}
          <div class="eqv-row">60 <span class="eqv-eq">=</span> 5x</div>
          ${eqvArrow('÷ 5 on both sides')}
          <div class="eqv-row">x <span class="eqv-eq">=</span> 12</div>
        </div>
      </div>
      <p>This same cross-multiplying idea shows up when comparing two samples of the same substance, since they share the same density: <strong>m₁/V₁ = m₂/V₂</strong>.</p>
      <div class="worked-example">
        <div class="we-label">Density example — two samples of the same metal</div>
        <p class="we-context">20 cm³ has a mass of 54 g. What mass would 35 cm³ have?</p>
        <div class="eqv-flow">
          <div class="eqv-row">${eqvFrac('54', '20')} <span class="eqv-eq">=</span> ${eqvFrac('x', '35')}</div>
          ${eqvArrow('cross multiply')}
          <div class="eqv-row">54 <span class="eqv-op">×</span> 35 <span class="eqv-eq">=</span> 20 <span class="eqv-op">×</span> x</div>
          ${eqvArrow('÷ 20 on both sides')}
          <div class="eqv-row">x <span class="eqv-eq">=</span> 94.5 g</div>
        </div>
      </div>`;
  }

  // ---- Graded quiz (same shape as atoms-review.js / matter-review.js) ----
  function renderQuiz(mount, ctx) {
    const progress = ctx.getProgress();
    if (progress && progress.status === 'completed') {
      renderQuizSummary(mount, ctx);
      return;
    }
    const answers = (progress && progress.answers) || [];
    const index = answers.length;
    if (index >= QUESTIONS.length) {
      finishQuiz(mount, ctx, answers);
      return;
    }
    renderQuizQuestion(mount, ctx, answers, index);
  }

  function renderQuizQuestion(mount, ctx, answersSoFar, index) {
    const q = QUESTIONS[index];
    const pct = Math.round((index / QUESTIONS.length) * 100);
    mount.innerHTML = `
      <div class="quiz-question-count">Question ${index + 1} of ${QUESTIONS.length}</div>
      <div class="quiz-progress-bar"><div class="quiz-progress-fill" style="width:${pct}%"></div></div>
      <p class="quiz-prompt">${escapeHtml(q.prompt)}</p>
      <div id="dx-answer-area"></div>
      <div id="dx-feedback-area"></div>
      <button type="button" class="dx-next-btn" id="dx-next-btn" style="display:none;">Next Question</button>
    `;

    const answerArea = mount.querySelector('#dx-answer-area');
    const feedbackArea = mount.querySelector('#dx-feedback-area');
    const nextBtn = mount.querySelector('#dx-next-btn');
    let submitted = false;

    if (q.type === 'mc') {
      answerArea.innerHTML = q.choices.map((choice, i) => `
        <button type="button" class="dx-choice" data-choice="${i}">${escapeHtml(choice)}</button>
      `).join('');
    } else {
      answerArea.innerHTML = `
        <input type="number" step="any" id="dx-num-answer" class="num-input" placeholder="Your answer">
        <button type="button" class="reveal-btn" id="dx-submit-num">Submit Answer</button>
      `;
    }

    function submit(response, btnEl) {
      if (submitted) return;
      if (response === null || Number.isNaN(response)) return;
      submitted = true;

      const correct = q.type === 'mc' ? response === q.correct : Math.abs(response - q.correct) < 0.01;
      if (q.type === 'mc') {
        answerArea.querySelectorAll('.dx-choice').forEach(el => {
          el.disabled = true;
          const val = Number(el.getAttribute('data-choice'));
          if (val === q.correct) el.classList.add('selected-correct');
          else if (el === btnEl) el.classList.add('selected-incorrect');
        });
      } else {
        answerArea.querySelectorAll('input, button').forEach(el => el.disabled = true);
      }

      feedbackArea.innerHTML = `
        <div class="dx-feedback ${correct ? 'correct' : 'incorrect'}">
          ${correct ? '✓ Correct!' : '✗ Not quite.'} ${escapeHtml(q.explanation)}
        </div>
      `;
      nextBtn.style.display = 'inline-block';

      const answers = answersSoFar.concat([{ questionId: q.id, response, correct }]);
      const record = {
        status: 'in_progress',
        score: answers.filter(a => a.correct).length,
        totalQuestions: QUESTIONS.length,
        answers
      };
      ctx.saveProgress(record);
    }

    if (q.type === 'mc') {
      answerArea.querySelectorAll('.dx-choice').forEach(btn => {
        btn.addEventListener('click', () => submit(Number(btn.getAttribute('data-choice')), btn));
      });
    } else {
      const numInput = answerArea.querySelector('#dx-num-answer');
      answerArea.querySelector('#dx-submit-num').addEventListener('click', () => {
        const val = numInput.value;
        submit(val === '' ? null : Number(val));
      });
      numInput.addEventListener('keydown', e => {
        if (e.key === 'Enter') { e.preventDefault(); const val = numInput.value; submit(val === '' ? null : Number(val)); }
      });
    }

    nextBtn.addEventListener('click', () => renderQuiz(mount, ctx));
  }

  async function finishQuiz(mount, ctx, answers) {
    const record = {
      status: 'completed',
      score: answers.filter(a => a.correct).length,
      totalQuestions: QUESTIONS.length,
      answers
    };
    await ctx.saveProgress(record);
    renderQuizSummary(mount, ctx);
  }

  function renderQuizSummary(mount, ctx) {
    const progress = ctx.getProgress();
    const score = progress ? progress.score : 0;
    const total = QUESTIONS.length;
    mount.innerHTML = `
      <div class="dx-summary">
        <div class="dx-score">${score} / ${total}</div>
        <p>Nice work! You can retake this any time — your most recent attempt is what's saved and sent to your teacher.</p>
        <button type="button" class="dx-retake-btn" id="dx-retake-btn">Retake Quiz</button>
      </div>
    `;
    mount.querySelector('#dx-retake-btn').addEventListener('click', async () => {
      await ctx.saveProgress({ status: 'in_progress', score: 0, totalQuestions: total, answers: [] });
      renderQuiz(mount, ctx);
    });
  }

  // ---- Top-level render (accordion shell, same pattern as matter-review.js) ----
  function render(host, ctx) {
    ensureStylesInjected();

    const bodies = [
      beforeYouBeginHtml(ctx.activity),
      conceptHtml(),
      `<div id="dx-guided-mount"></div>`,
      practiceSetHtml(),
      `<div class="quiz-note">Unlike the sections above, this quiz <strong>saves your score</strong> and reports it to your teacher. You can retake it any time — your most recent attempt is what's saved.</div><div id="dx-quiz-mount"></div>`
    ];

    const sectionsHtml = SECTION_META.map((meta, i) => `
      <div class="section-card" id="dx-sec-${i}" data-section="${i}">
        <div class="section-header" data-toggle="${i}">
          <span class="section-num">${i === 0 ? '★' : String(i).padStart(2, '0')}</span>
          <span class="section-title">${escapeHtml(meta.title)}</span>
          <span class="section-time">${escapeHtml(meta.time)}</span>
          <span class="section-arrow">▼</span>
        </div>
        <div class="section-body">
          ${bodies[i]}
          ${i < SECTION_COUNT - 1 ? `<button type="button" class="mark-done-btn" data-mark-done="${i}"${i === 2 ? ' disabled' : ''}>✓ Mark Section Complete</button>` : ''}
        </div>
      </div>
    `).join('');

    host.innerHTML = `
      <div class="dx-lesson">
        <div class="dx-header">
          <div class="dx-header-label">Density &amp; Algebra Skills</div>
          <h1>${escapeHtml(ctx.activity.title)}</h1>
          <div class="dx-header-meta">Self-Paced Review · ~25 Minutes · Drag-and-drop guided practice</div>
        </div>
        <div class="dx-progress-wrap">
          <span class="dx-progress-label">Progress</span>
          <div class="dx-progress-track"><div class="dx-progress-fill" id="dx-progress-fill"></div></div>
          <span class="dx-progress-count" id="dx-progress-count">0 / ${SECTION_COUNT} sections</span>
        </div>
        <main>${sectionsHtml}</main>
      </div>
    `;

    const root = host.querySelector('.dx-lesson');
    setupDragEngine(root);
    const completed = new Array(SECTION_COUNT).fill(false);

    function updateProgress() {
      const done = completed.filter(Boolean).length;
      const pct = Math.round((done / SECTION_COUNT) * 100);
      root.querySelector('#dx-progress-fill').style.width = pct + '%';
      root.querySelector('#dx-progress-count').textContent = `${done} / ${SECTION_COUNT} sections`;
    }

    function openSection(i, scroll) {
      const card = root.querySelector(`#dx-sec-${i}`);
      if (!card) return;
      card.querySelector('.section-body').classList.add('open');
      card.querySelector('.section-header').classList.add('open');
      if (scroll) card.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function toggleSection(i) {
      const card = root.querySelector(`#dx-sec-${i}`);
      const body = card.querySelector('.section-body');
      const header = card.querySelector('.section-header');
      const isOpen = body.classList.contains('open');
      body.classList.toggle('open', !isOpen);
      header.classList.toggle('open', !isOpen);
    }

    root.querySelectorAll('[data-toggle]').forEach(el => {
      el.addEventListener('click', () => toggleSection(Number(el.getAttribute('data-toggle'))));
    });

    root.querySelectorAll('[data-mark-done]').forEach(btn => {
      btn.addEventListener('click', () => {
        const i = Number(btn.getAttribute('data-mark-done'));
        if (completed[i] || btn.disabled) return;
        completed[i] = true;
        root.querySelector(`#dx-sec-${i}`).classList.add('done');
        btn.textContent = '✓ Section Complete';
        btn.disabled = true;
        updateProgress();
        setTimeout(() => openSection(i + 1, true), 250);
      });
    });

    root.querySelectorAll('[data-hint-target]').forEach(btn => {
      btn.addEventListener('click', () => {
        const box = root.querySelector('#' + btn.getAttribute('data-hint-target'));
        const open = box.classList.toggle('open');
        btn.textContent = open ? '▲ Hide Hint' : '💡 Hint';
      });
    });
    root.querySelectorAll('[data-answer-target]').forEach(btn => {
      btn.addEventListener('click', () => {
        const box = root.querySelector('#' + btn.getAttribute('data-answer-target'));
        const open = box.classList.toggle('open');
        btn.textContent = open ? 'Hide Answer' : 'Reveal Answer';
      });
    });

    renderGuidedSection(root.querySelector('#dx-guided-mount'), () => {
      const markBtn = root.querySelector('[data-mark-done="2"]');
      if (markBtn) markBtn.disabled = false;
    });

    const quizMount = root.querySelector('#dx-quiz-mount');
    renderQuiz(quizMount, ctx);

    const progress = ctx.getProgress();
    if (progress && (progress.status === 'in_progress' || progress.status === 'completed')) {
      if (progress.status === 'completed') completed[SECTION_COUNT - 1] = true;
      openSection(SECTION_COUNT - 1, false);
    } else {
      openSection(0, false);
    }
    updateProgress();
  }

  window.Activities = window.Activities || {};
  window.Activities['cross-multiply-density'] = { render };
})();
