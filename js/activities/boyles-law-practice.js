// "Lesson 58P: Boyle's Law Practice" (registered as CONTENT activity id
// 'boyles-law-practice'). Chapter 11 · Pressing Matter. Built from Lesson 58
// (Feeling Under Pressure: syringe + bathroom-scale lab, inverse proportion,
// PV = k) and the Lesson 58P practice day (predict first, PV stays the same,
// P1V1 = P2V2, check that the answer makes sense).
//
// Same accordion + graded-quiz shape as the Chapter 10 review. Interactive
// widgets are ungraded; only the quiz saves a score (via ctx.saveProgress) and
// shows a completion code. EN/ES toggle shares LANG_KEY with every other
// activity. Grading is always by positional index (QUESTIONS[i].correct).
// The companion paper worksheet is built by dev/boyles-worksheet/build.py and
// follows these sections in order (Parts A-E + exit ticket).
(function () {
  const STYLE_ID = 'bl-lesson-styles';
  const FONT_LINK_ID = 'el-lesson-fonts'; // shared Google Fonts <link>
  const LANG_KEY = 'ionicstorm_lang_v1';
  const SECTION_COUNT = 7; // intro + 5 content sections + graded quiz at index 6

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }
  function getLang() {
    try { return localStorage.getItem(LANG_KEY) === 'es' ? 'es' : 'en'; } catch (e) { return 'en'; }
  }
  function setLang(lang) {
    try { localStorage.setItem(LANG_KEY, lang === 'es' ? 'es' : 'en'); } catch (e) { /* private mode */ }
  }
  function tr(field, lang) {
    return (field && typeof field === 'object') ? (field[lang] || field.en) : field;
  }
  function t(key, lang, ...args) {
    const entry = STRINGS[key] || {};
    const val = entry[lang] || entry.en;
    return typeof val === 'function' ? val(...args) : val;
  }
  function fmt(n, d) {
    const p = Math.pow(10, d === undefined ? 2 : d);
    return String(Math.round(n * p) / p);
  }
  function parseNum(s) {
    let v = String(s).trim().replace(/\s/g, '');
    if (/^-?\d{1,3}(,\d{3})+(\.\d+)?$/.test(v)) v = v.replace(/,/g, '');
    else v = v.replace(',', '.');
    v = v.replace('−', '-');
    const n = parseFloat(v);
    return isNaN(n) || !/^-?\d*\.?\d+$/.test(v) ? NaN : n;
  }
  // Show a number the way it is written in class: 1.0, 0.50, 0.40, 24, 14.7.
  function dispNum(n) { return n < 1 ? n.toFixed(2) : (Number.isInteger(n) && n < 10 ? n.toFixed(1) : String(n)); }
  const closeTo = (a, b, rel, abs) => Math.abs(a - b) <= Math.max(abs || 0, Math.abs(b) * (rel || 0));

  const DIFF_LABELS = {
    en: { basic: 'Basic', medium: 'Medium', challenge: 'Challenge' },
    es: { basic: 'Básico', medium: 'Medio', challenge: 'Desafío' }
  };

  const STRINGS = {
    headerLabel: { en: 'Chapter 11 · Pressing Matter', es: 'Capítulo 11 · Materia Bajo Presión' },
    headerMeta: { en: 'Practice · ~40 Minutes · Use with the Boyle\'s Law Practice worksheet', es: 'Práctica · ~40 Minutos · Úsalo con la hoja de trabajo de Práctica de la Ley de Boyle' },
    langToggleAria: { en: 'Language', es: 'Idioma' },
    progress: { en: 'Progress', es: 'Progreso' },
    sectionCount: { en: (d, n) => `${d} / ${n} sections`, es: (d, n) => `${d} / ${n} secciones` },
    checkForUnderstanding: { en: 'Check for Understanding', es: 'Comprobación de Comprensión' },
    quizTimeGraded: { en: '12 min · graded', es: '12 min · calificado' },
    quizNote: {
      en: 'Unlike the sections above, this check <strong>saves your score</strong> and reports it to your teacher. You can retake it any time — your most recent attempt is what\'s saved. Calculators are fine.',
      es: 'A diferencia de las secciones anteriores, esta comprobación <strong>guarda tu puntaje</strong> y se lo reporta a tu maestro. Puedes repetirla en cualquier momento — se guarda tu intento más reciente. Puedes usar calculadora.'
    },
    markSectionComplete: { en: '✓ Mark Section Complete', es: '✓ Marcar Sección como Completa' },
    sectionComplete: { en: '✓ Section Complete', es: '✓ Sección Completa' },
    hintShow: { en: '💡 Hint', es: '💡 Pista' },
    hintHide: { en: '▲ Hide Hint', es: '▲ Ocultar Pista' },
    revealAnswer: { en: 'Reveal Answer', es: 'Mostrar Respuesta' },
    hideAnswer: { en: 'Hide Answer', es: 'Ocultar Respuesta' },
    answerLabel: { en: '✓ Answer', es: '✓ Respuesta' },
    questionCount: { en: (n, total) => `Question ${n} of ${total}`, es: (n, total) => `Pregunta ${n} de ${total}` },
    nextQuestion: { en: 'Next Question', es: 'Siguiente Pregunta' },
    correctPrefix: { en: '✓ Correct!', es: '✓ ¡Correcto!' },
    incorrectPrefix: { en: '✗ Not quite.', es: '✗ No exactamente.' },
    retakeQuiz: { en: 'Retake Check', es: 'Repetir la Comprobación' },
    showMyCode: { en: 'Show my code', es: 'Mostrar mi código' },
    completionCode: { en: 'Your completion code — show this to your teacher:', es: 'Tu código de finalización — muéstraselo a tu maestro:' },
    summaryText: {
      en: 'Nice work! You can retake this any time — your most recent attempt is what\'s saved and sent to your teacher.',
      es: '¡Buen trabajo! Puedes repetirlo en cualquier momento — se guarda y se envía a tu maestro tu intento más reciente.'
    },
    guidedModeLabel: { en: 'Guided Example', es: 'Ejemplo Guiado' },
    independentModeLabel: { en: 'Your Turn — Independent', es: 'Tu Turno — Independiente' },
    worksheetBadge: { en: (p) => `Worksheet · Part ${p}`, es: (p) => `Hoja de trabajo · Parte ${p}` },
    finishFirst: {
      en: (d, n, what) => `🔒 Finish the activity above first: ${what} (${d} / ${n})`,
      es: (d, n, what) => `🔒 Primero termina la actividad de arriba: ${what} (${d} / ${n})`
    },
    lockedNote: { en: (name) => `🔒 Locked. Finish "${name}" and click Mark Section Complete to unlock this section.`, es: (name) => `🔒 Bloqueado. Termina "${name}" y haz clic en Marcar Sección como Completa para desbloquear esta sección.` }
  };

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
.bl-lesson {
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
.bl-lesson * { box-sizing: border-box; }
.bl-lesson .bl-header { background: var(--navy); color: var(--cream); padding: 2rem 1.75rem 1.6rem; position: relative; overflow: hidden; }
.bl-lesson .bl-header::before { content: ''; position: absolute; top: -60px; right: -60px; width: 220px; height: 220px; border-radius: 50%; border: 32px solid rgba(46,196,182,0.12); }
.bl-lesson .bl-lang-toggle { position: absolute; top: 1.75rem; right: 1.75rem; z-index: 2; display: flex; gap: 0.3rem; }
.bl-lesson .bl-lang-btn { font-family: 'JetBrains Mono', monospace; font-size: 0.68rem; font-weight: 600; letter-spacing: 0.06em; padding: 0.3rem 0.6rem; border-radius: 6px; background: transparent; border: 1px solid rgba(247,243,236,0.35); color: rgba(247,243,236,0.65); cursor: pointer; }
.bl-lesson .bl-lang-btn.active { background: var(--teal); border-color: var(--teal); color: var(--navy); }
.bl-lesson .bl-header-label { font-family: 'JetBrains Mono', monospace; font-size: 0.68rem; letter-spacing: 0.2em; text-transform: uppercase; color: var(--teal); margin-bottom: 0.5rem; position: relative; padding-right: 5.5rem; }
.bl-lesson .bl-header h1 { font-family: 'Playfair Display', serif; font-size: 2rem; font-weight: 700; line-height: 1.2; margin: 0 0 0.4rem; position: relative; }
.bl-lesson .bl-header-meta { font-size: 0.82rem; color: rgba(247,243,236,0.65); font-family: 'JetBrains Mono', monospace; position: relative; }
.bl-lesson .bl-progress-wrap { background: var(--navy-mid); padding: 0.7rem 1.75rem; display: flex; align-items: center; gap: 0.9rem; position: sticky; top: 0; z-index: 10; }
.bl-lesson .bl-progress-label { font-family: 'JetBrains Mono', monospace; font-size: 0.65rem; color: var(--teal); text-transform: uppercase; letter-spacing: 0.1em; white-space: nowrap; }
.bl-lesson .bl-progress-track { flex: 1; height: 4px; background: rgba(255,255,255,0.12); border-radius: 2px; overflow: hidden; }
.bl-lesson .bl-progress-fill { height: 100%; background: linear-gradient(90deg, var(--teal), var(--amber)); border-radius: 2px; transition: width 0.4s ease; width: 0%; }
.bl-lesson .bl-progress-count { font-family: 'JetBrains Mono', monospace; font-size: 0.65rem; color: rgba(247,243,236,0.55); white-space: nowrap; }
.bl-lesson main { padding: 1.5rem 1.25rem 2.5rem; }
.bl-lesson .section-card { background: white; border-radius: 12px; margin-bottom: 1.1rem; box-shadow: 0 2px 12px rgba(0,0,0,0.06); overflow: hidden; }
.bl-lesson .section-header { display: flex; align-items: center; gap: 0.85rem; padding: 1rem 1.2rem; cursor: pointer; user-select: none; border-bottom: 1px solid transparent; }
.bl-lesson .section-header:hover { background: #fafafa; }
.bl-lesson .section-header.open { border-bottom-color: var(--cream-dark); }
.bl-lesson .section-num { font-family: 'JetBrains Mono', monospace; font-size: 0.7rem; font-weight: 600; color: white; background: var(--navy); border-radius: 6px; padding: 0.22rem 0.5rem; flex-shrink: 0; }
.bl-lesson .section-card.done .section-num { background: var(--teal-dim); }
.bl-lesson .section-title { font-family: 'Playfair Display', serif; font-size: 1.05rem; font-weight: 700; flex: 1; }
.bl-lesson .section-time { font-family: 'JetBrains Mono', monospace; font-size: 0.65rem; color: var(--text-muted); }
.bl-lesson .section-arrow { font-size: 0.9rem; color: var(--text-muted); transition: transform 0.25s; flex-shrink: 0; }
.bl-lesson .section-header.open .section-arrow { transform: rotate(180deg); }
.bl-lesson .section-card.locked .section-header { cursor: not-allowed; opacity: 0.55; }
.bl-lesson .section-card.locked .section-header:hover { background: transparent; }
.bl-lesson .bl-lock-note { display: none; margin: 0 1.2rem 0.9rem; padding: 0.55rem 0.8rem; border-radius: 8px; background: #fff7ed; border: 1px dashed #f59e0b; color: #92400e; font-size: 0.85rem; font-weight: 600; }
.bl-lesson .bl-lock-note.show { display: block; }
.bl-lesson .section-body { display: none; padding: 1.3rem; }
.bl-lesson .section-body.open { display: block; animation: blFadeIn 0.25s ease; }
@keyframes blFadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
.bl-lesson h2 { font-family: 'Playfair Display', serif; font-size: 1.25rem; color: var(--navy); margin: 0 0 0.6rem; }
.bl-lesson p { margin: 0 0 0.85rem; }
.bl-lesson .note-box { background: var(--note-bg); border-left: 4px solid var(--note-border); border-radius: 0 8px 8px 0; padding: 0.9rem 1.1rem; margin: 1.1rem 0; display: flex; gap: 0.7rem; font-size: 0.9rem; }
.bl-lesson .note-box .note-icon { font-size: 1.15rem; flex-shrink: 0; }
.bl-lesson .concept-box { background: linear-gradient(135deg, var(--navy) 0%, var(--navy-mid) 100%); color: var(--cream); border-radius: 10px; padding: 1.2rem 1.4rem; margin: 1.1rem 0; }
.bl-lesson .concept-box .concept-label { font-family: 'JetBrains Mono', monospace; font-size: 0.62rem; text-transform: uppercase; letter-spacing: 0.16em; color: var(--teal); margin-bottom: 0.4rem; }
.bl-lesson .concept-box p { color: rgba(247,243,236,0.92); margin-bottom: 0; }
.bl-lesson .info-panel { background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 0.9rem 1.1rem; margin: 1.1rem 0; font-size: 0.9rem; }
.bl-lesson .info-panel .panel-label { font-family: 'JetBrains Mono', monospace; font-size: 0.62rem; text-transform: uppercase; letter-spacing: 0.14em; color: #0369a1; margin-bottom: 0.35rem; }
.bl-lesson table { width: 100%; border-collapse: collapse; margin: 0.9rem 0; font-size: 0.85rem; }
.bl-lesson th { background: var(--navy); color: var(--cream); font-family: 'JetBrains Mono', monospace; font-size: 0.62rem; text-transform: uppercase; letter-spacing: 0.08em; padding: 0.5rem 0.6rem; text-align: left; }
.bl-lesson td { padding: 0.45rem 0.6rem; border-bottom: 1px solid var(--cream-dark); }
.bl-lesson ul { padding-left: 1.3rem; margin: 0 0 0.85rem; }
.bl-lesson li { margin-bottom: 0.3rem; font-size: 0.93rem; }
.bl-lesson .objectives-list { list-style: none; padding: 0; margin: 0.4rem 0; }
.bl-lesson .objectives-list li { display: flex; align-items: flex-start; gap: 0.55rem; padding: 0.4rem 0; font-size: 0.92rem; border-bottom: 1px solid var(--cream-dark); }
.bl-lesson .obj-check { color: var(--teal); flex-shrink: 0; }
.bl-lesson .practice-problem { border: 1.5px solid var(--cream-dark); border-radius: 10px; margin-bottom: 1.1rem; overflow: hidden; }
.bl-lesson .pp-header { display: flex; align-items: center; gap: 0.65rem; padding: 0.85rem 1.1rem; background: #fafafa; border-bottom: 1px solid var(--cream-dark); }
.bl-lesson .pp-num { font-family: 'JetBrains Mono', monospace; font-size: 0.7rem; font-weight: 700; color: white; background: var(--amber); border-radius: 6px; padding: 0.18rem 0.45rem; }
.bl-lesson .pp-difficulty { font-family: 'JetBrains Mono', monospace; font-size: 0.6rem; letter-spacing: 0.08em; text-transform: uppercase; margin-left: auto; }
.bl-lesson .diff-basic { color: #16a34a; } .bl-lesson .diff-medium { color: #d97706; } .bl-lesson .diff-challenge { color: #dc2626; }
.bl-lesson .pp-body { padding: 0.95rem 1.1rem; }
.bl-lesson .pp-body p { font-size: 0.92rem; }
.bl-lesson .hint-btn, .bl-lesson .reveal-btn, .bl-lesson .mark-done-btn, .bl-lesson .bl-choice, .bl-lesson .bl-next-btn, .bl-lesson .bl-retake-btn { font-family: 'JetBrains Mono', monospace; cursor: pointer; border: none; }
.bl-lesson .hint-btn, .bl-lesson .reveal-btn { border-radius: 6px; padding: 0.4rem 0.8rem; font-size: 0.68rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; }
.bl-lesson .hint-btn { background: #fef3c7; color: #92400e; border: 1px solid #fcd34d; margin-right: 0.5rem; }
.bl-lesson .reveal-btn { background: var(--navy); color: white; }
.bl-lesson .hint-box, .bl-lesson .answer-box { border-radius: 7px; padding: 0.75rem 0.95rem; margin-top: 0.7rem; font-size: 0.87rem; display: none; }
.bl-lesson .hint-box.open, .bl-lesson .answer-box.open { display: block; }
.bl-lesson .hint-box { background: #fffbeb; border: 1px dashed #fcd34d; color: #78350f; }
.bl-lesson .answer-box { background: var(--correct-bg); border: 1px solid var(--correct-border); color: #065f46; }
.bl-lesson .answer-box .answer-label { font-family: 'JetBrains Mono', monospace; font-size: 0.62rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--teal-dim); margin-bottom: 0.35rem; font-weight: 700; }
.bl-lesson .mark-done-btn { display: block; width: 100%; margin-top: 1.2rem; background: var(--navy); color: var(--cream); border-radius: 8px; padding: 0.75rem 1rem; font-size: 0.75rem; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; }
.bl-lesson .mark-done-btn:hover:not(:disabled) { background: var(--teal-dim); }
.bl-lesson .mark-done-btn:disabled { background: var(--cream-dark); color: var(--text-muted); cursor: not-allowed; }
.bl-lesson .quiz-note { background: var(--note-bg); border-left: 4px solid var(--note-border); border-radius: 0 8px 8px 0; padding: 0.9rem 1.1rem; margin-bottom: 1.1rem; font-size: 0.88rem; }
.bl-lesson .quiz-progress-bar { height: 6px; background: var(--cream-dark); border-radius: 999px; overflow: hidden; margin: 0.6rem 0 0.9rem; }
.bl-lesson .quiz-progress-fill { height: 100%; background: linear-gradient(90deg, var(--navy), var(--teal)); }
.bl-lesson .quiz-question-count { font-family: 'JetBrains Mono', monospace; font-size: 0.72rem; color: var(--text-muted); }
.bl-lesson .quiz-prompt { font-family: 'Playfair Display', serif; font-size: 1.1rem; font-weight: 700; color: var(--navy); margin: 0.5rem 0 1rem; }
.bl-lesson .bl-choice { display: block; width: 100%; text-align: left; background: white; border: 1.5px solid var(--cream-dark); border-radius: 8px; padding: 0.7rem 0.9rem; margin-bottom: 0.6rem; font-size: 0.93rem; color: var(--text); font-family: 'Source Serif 4', serif; }
.bl-lesson .bl-choice:hover:not(:disabled) { border-color: var(--teal); background: #f3fdfc; }
.bl-lesson .bl-choice:disabled { cursor: default; }
.bl-lesson .bl-choice.selected-correct { border-color: var(--correct-border); background: var(--correct-bg); }
.bl-lesson .bl-choice.selected-incorrect { border-color: #dc2626; background: #fef2f2; }
.bl-lesson .bl-feedback { border-radius: 8px; padding: 0.75rem 1rem; margin-top: 0.4rem; font-size: 0.9rem; font-weight: 600; }
.bl-lesson .bl-feedback.correct { background: var(--correct-bg); color: var(--teal-dim); }
.bl-lesson .bl-feedback.incorrect { background: #fef2f2; color: #b91c1c; }
.bl-lesson .bl-next-btn, .bl-lesson .bl-retake-btn { background: var(--navy); color: white; border-radius: 8px; padding: 0.65rem 1.2rem; font-size: 0.75rem; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; margin-top: 1rem; }
.bl-lesson .bl-summary { text-align: center; padding: 1rem 0.5rem; }
.bl-summary .bl-code-label { margin: 0.6rem 0 0.2rem; font-weight: 600; }
.bl-summary .bl-code { display: inline-block; font-family: 'JetBrains Mono', monospace; font-size: 2rem; font-weight: 700; letter-spacing: 0.15em; color: var(--navy); border: 2px dashed var(--navy); border-radius: 10px; padding: 0.3rem 1rem; margin-bottom: 0.8rem; user-select: all; }
.bl-lesson .bl-score { font-family: 'JetBrains Mono', monospace; font-size: 2.4rem; font-weight: 700; color: var(--navy); margin: 0.4rem 0; }

.bl-lesson .bl-widget { background: var(--cream-dark); border-radius: 12px; padding: 1.1rem; margin: 1rem 0; }
.bl-lesson .bl-lead { margin: 0 0 0.5rem; }
.bl-lesson .bl-choices { display: flex; flex-wrap: wrap; gap: 0.45rem; margin: 0.3rem 0 0.9rem; }
.bl-lesson .bl-opt { background: white; border: 1.5px solid var(--cream-dark); border-radius: 8px; padding: 0.45rem 0.75rem; font-size: 0.8rem; font-family: 'JetBrains Mono', monospace; cursor: pointer; color: var(--text); }
.bl-lesson .bl-opt:hover:not(:disabled) { border-color: var(--teal); }
.bl-lesson .bl-opt.selected { border-color: var(--navy); background: var(--navy); color: white; }
.bl-lesson .bl-opt.right { border-color: var(--correct-border); background: var(--correct-bg); }
.bl-lesson .bl-opt.wrong { border-color: #dc2626; background: #fef2f2; }
.bl-lesson .bl-opt:disabled { cursor: default; }
.bl-lesson .bl-btn { font-family: 'JetBrains Mono', monospace; cursor: pointer; border: none; background: var(--navy); color: white; border-radius: 8px; padding: 0.5rem 0.9rem; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; }
.bl-lesson .bl-btn:hover:not(:disabled) { background: var(--navy-light); }
.bl-lesson .bl-btn:disabled { background: #d6d0c4; color: var(--text-muted); cursor: not-allowed; }
.bl-lesson .bl-btn.secondary { background: white; color: var(--navy); border: 1.5px solid var(--navy-light); }
.bl-lesson .bl-stage { display: flex; flex-wrap: wrap; gap: 1rem; align-items: flex-start; justify-content: center; }
.bl-lesson .bl-svg { max-width: 100%; height: auto; }
.bl-lesson .bl-canvas { background: #0d1b2a; border-radius: 10px; max-width: 100%; height: auto; display: block; margin: 0 auto; }
.bl-lesson input[type=range] { width: 100%; accent-color: var(--teal-dim); }
.bl-lesson .bl-formula { font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; background: white; border: 1.5px solid var(--cream-dark); border-radius: 8px; padding: 0.55rem 0.7rem; line-height: 1.6; margin-top: 0.6rem; white-space: pre-line; }
.bl-lesson .bl-formula-label { font-family: 'JetBrains Mono', monospace; font-size: 0.6rem; text-transform: uppercase; letter-spacing: 0.12em; color: var(--teal-dim); font-weight: 700; margin-bottom: 0.2rem; white-space: normal; }
.bl-lesson .bl-insight { margin-top: 0.7rem; font-size: 0.88rem; font-weight: 600; color: var(--teal-dim); min-height: 1.3em; }
.bl-lesson .bl-table { width: 100%; max-width: 460px; margin: 0.7rem auto 0; font-size: 0.8rem; font-family: 'JetBrains Mono', monospace; background: white; }
.bl-lesson .bl-mode-badge { display: inline-block; font-family: 'JetBrains Mono', monospace; font-size: 0.62rem; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 700; padding: 0.3rem 0.65rem; border-radius: 999px; background: white; color: var(--navy-mid); margin-bottom: 0.5rem; }
.bl-lesson .bl-mode-badge.guided { background: var(--amber); color: white; }
.bl-lesson .bl-ws-badge { display: inline-block; font-family: 'JetBrains Mono', monospace; font-size: 0.62rem; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 700; padding: 0.3rem 0.7rem; border-radius: 999px; background: var(--teal); color: var(--navy); margin-bottom: 0.6rem; }
.bl-lesson .bl-step { background: white; border: 1.5px solid var(--cream-dark); border-radius: 10px; padding: 0.7rem 0.9rem; margin: 0.6rem 0; }
.bl-lesson .bl-step.locked { opacity: 0.45; pointer-events: none; }
.bl-lesson .bl-step.done { border-color: var(--correct-border); background: var(--correct-bg); }
.bl-lesson .bl-step-title { font-weight: 600; font-size: 0.9rem; margin-bottom: 0.4rem; }
.bl-lesson .bl-fields { display: flex; flex-wrap: wrap; gap: 0.6rem; align-items: center; margin-bottom: 0.5rem; }
.bl-lesson .bl-field { display: flex; align-items: center; gap: 0.35rem; font-family: 'JetBrains Mono', monospace; font-size: 0.85rem; }
.bl-lesson .bl-field input, .bl-lesson .bl-cell-input { font-family: 'JetBrains Mono', monospace; font-size: 0.95rem; padding: 0.3rem 0.45rem; width: 6rem; border: 1.5px solid var(--navy-light); border-radius: 6px; background: white; color: var(--text); }
.bl-lesson .bl-mc { display: flex; flex-direction: column; gap: 0.4rem; margin-bottom: 0.5rem; }
.bl-lesson .bl-mc button { text-align: left; font-family: 'JetBrains Mono', monospace; font-size: 0.85rem; background: white; border: 1.5px solid var(--cream-dark); border-radius: 8px; padding: 0.5rem 0.7rem; cursor: pointer; color: var(--text); }
.bl-lesson .bl-mc button:hover:not(:disabled) { border-color: var(--teal); }
.bl-lesson .bl-mc button.right { border-color: var(--correct-border); background: var(--correct-bg); }
.bl-lesson .bl-mc button.wrong { border-color: #dc2626; background: #fef2f2; }
.bl-lesson .bl-hint { font-size: 0.82rem; background: #fffbeb; border: 1px dashed #fcd34d; color: #78350f; border-radius: 7px; padding: 0.5rem 0.7rem; margin: 0.4rem 0; display: none; }
.bl-lesson .bl-hint.open { display: block; }
.bl-lesson .bl-msg { font-size: 0.84rem; font-weight: 600; min-height: 1.2em; margin-top: 0.3rem; }
.bl-lesson .bl-msg.ok { color: var(--teal-dim); }
.bl-lesson .bl-msg.bad { color: #b91c1c; }
.bl-lesson .bl-solved { background: var(--correct-bg); border: 1.5px solid var(--correct-border); border-radius: 10px; padding: 0.7rem 0.9rem; margin-top: 0.6rem; font-weight: 600; color: var(--teal-dim); }
.bl-lesson .bl-plain { font-weight: 400; color: var(--text); }
.bl-lesson .bl-card { background: white; border-radius: 10px; padding: 0.9rem 1rem; }
.bl-lesson .bl-big { font-family: 'JetBrains Mono', monospace; font-size: 1.35rem; font-weight: 700; color: var(--navy); text-align: center; margin: 0.3rem 0 0.7rem; }
.bl-lesson .bl-work { background: white; border: 1.5px solid var(--cream-dark); border-radius: 10px; padding: 0.4rem; margin: 0.5rem 0; }
.bl-lesson .bl-line { display: block; width: 100%; text-align: left; font-family: 'JetBrains Mono', monospace; font-size: 0.85rem; background: transparent; border: 1.5px solid transparent; border-radius: 6px; padding: 0.45rem 0.6rem; cursor: pointer; color: var(--text); }
.bl-lesson .bl-line:hover:not(:disabled) { background: #f3fdfc; border-color: var(--teal); }
.bl-lesson .bl-line.error { background: #fef2f2; border-color: #dc2626; }
.bl-lesson .bl-line.picked-wrong { background: #fff7ed; border-color: #f59e0b; }
.bl-lesson .bl-line:disabled { cursor: default; }
.bl-lesson td.bl-ok { color: var(--teal-dim); font-weight: 700; }
@media (max-width: 560px) {
  .bl-lesson .bl-header { padding: 1.6rem 1rem 1.3rem; }
  .bl-lesson .bl-header h1 { font-size: 1.5rem; }
  .bl-lesson main { padding: 1rem 0.6rem 2rem; }
  .bl-lesson .section-body { padding: 1rem 0.8rem; }
  .bl-lesson .bl-widget { padding: 0.8rem; }
}
`;
    document.head.appendChild(style);
  }

  function practiceProblem(lang, idSuffix, prompt, difficulty, hint, answer) {
    const diffClass = { basic: 'diff-basic', medium: 'diff-medium', challenge: 'diff-challenge' }[difficulty] || 'diff-basic';
    const diffLabel = (DIFF_LABELS[lang] || DIFF_LABELS.en)[difficulty] || difficulty;
    return `
      <div class="practice-problem">
        <div class="pp-header">
          <span class="pp-num">Q</span>
          <span class="pp-difficulty ${diffClass}">● ${escapeHtml(diffLabel)}</span>
        </div>
        <div class="pp-body">
          <p><strong>${prompt}</strong></p>
          <button type="button" class="hint-btn" data-hint-target="bl-hint-${idSuffix}">${escapeHtml(t('hintShow', lang))}</button>
          <button type="button" class="reveal-btn" data-answer-target="bl-ans-${idSuffix}">${escapeHtml(t('revealAnswer', lang))}</button>
          <div class="hint-box" id="bl-hint-${idSuffix}">${hint}</div>
          <div class="answer-box" id="bl-ans-${idSuffix}">
            <div class="answer-label">${escapeHtml(t('answerLabel', lang))}</div>
            ${answer}
          </div>
        </div>
      </div>`;
  }

  // ======================================================================
  // Widget A (Lesson 58 recap): sealed syringe. Slide the plunger; the same
  // number of molecules bounce in a smaller or larger space. Wall hits per
  // second rise as the volume shrinks. Starts at 50 mL and 1.0 atm
  // (14.7 lb/in2), so PV = 50 atm·mL. Record readings into a table to see
  // that PV stays the same; switch the graph to P vs 1/V to see a line.
  // ======================================================================
  const SYR_K = 50;   // atm·mL
  const PSI = 14.7;   // lb/in2 per atm
  const SYR_TXT = {
    en: {
      vol: 'Volume of trapped air', record: 'Record this reading', clear: 'Clear table',
      axisPV: 'Graph: P vs. V', axisInv: 'Graph: P vs. 1/V',
      readLabel: 'Reading',
      read: (v, p, psi) => `V = ${v} mL\nP = ${p} atm  (= ${psi} lb/in²)\nP × V = ${p} × ${v} = ${SYR_K} atm·mL`,
      hits: (n) => `Wall hits per second ≈ ${n}`,
      th: ['V (mL)', 'P (atm)', 'P × V (atm·mL)'],
      tryMore: 'Record at least three different volumes to look for a pattern.',
      pattern: 'P × V comes out to about 50 atm·mL every time (tiny differences are just rounding) — a constant! That is Boyle\'s law: PV = k. When V goes down, P goes up by the same factor.',
      insightPV: 'The P vs. V graph is a curve, not a line. It gets steep at small volumes and flat at large volumes, and it never touches either axis. That is an inverse proportion.',
      insightInv: 'P vs. 1/V is a straight line through the origin. So P is directly proportional to 1/V — another way of saying P = k/V.',
      xPV: 'Volume (mL)', xInv: '1/V (1/mL)', y: 'Pressure (atm)',
      caption: 'Same molecules · same temperature · different volume'
    },
    es: {
      vol: 'Volumen del aire atrapado', record: 'Registrar esta lectura', clear: 'Borrar tabla',
      axisPV: 'Gráfica: P vs. V', axisInv: 'Gráfica: P vs. 1/V',
      readLabel: 'Lectura',
      read: (v, p, psi) => `V = ${v} mL\nP = ${p} atm  (= ${psi} lb/in²)\nP × V = ${p} × ${v} = ${SYR_K} atm·mL`,
      hits: (n) => `Choques con las paredes por segundo ≈ ${n}`,
      th: ['V (mL)', 'P (atm)', 'P × V (atm·mL)'],
      tryMore: 'Registra al menos tres volúmenes diferentes para buscar un patrón.',
      pattern: 'P × V da cerca de 50 atm·mL cada vez (las pequeñas diferencias son solo redondeo) — ¡una constante! Esa es la ley de Boyle: PV = k. Cuando V baja, P sube por el mismo factor.',
      insightPV: 'La gráfica de P vs. V es una curva, no una línea. Es empinada con volúmenes pequeños y plana con volúmenes grandes, y nunca toca ningún eje. Eso es una proporción inversa.',
      insightInv: 'P vs. 1/V es una línea recta que pasa por el origen. Así que P es directamente proporcional a 1/V — otra forma de decir P = k/V.',
      xPV: 'Volumen (mL)', xInv: '1/V (1/mL)', y: 'Presión (atm)',
      caption: 'Mismas moléculas · misma temperatura · distinto volumen'
    }
  };

  function renderSyringeWidget(mount, lang, report) {
    report = report || function () {};
    const X = SYR_TXT[lang];
    let V = 50, axis = 0;
    const rows = [];
    mount.innerHTML = `
      <div class="bl-widget">
        <canvas class="bl-canvas" data-cv width="460" height="150"></canvas>
        <p style="text-align:center;font-size:0.78rem;color:var(--text-muted);margin:0.3rem 0 0.6rem;font-family:'JetBrains Mono',monospace;">${escapeHtml(X.caption)} · <span data-hits></span></p>
        <label style="font-size:0.85rem;">${escapeHtml(X.vol)}: <strong data-vval></strong></label>
        <input type="range" data-v min="10" max="50" step="1" value="50">
        <div class="bl-stage" style="margin-top:0.6rem;">
          <div data-graph></div>
          <div style="flex:1 1 220px;min-width:210px;">
            <div class="bl-formula"><div class="bl-formula-label">${escapeHtml(X.readLabel)}</div><span data-read></span></div>
            <div class="bl-choices" style="margin-top:0.6rem;">
              <button type="button" class="bl-opt selected" data-axis="0">${escapeHtml(X.axisPV)}</button>
              <button type="button" class="bl-opt" data-axis="1">${escapeHtml(X.axisInv)}</button>
            </div>
            <p style="margin:0;"><button type="button" class="bl-btn" data-rec>${escapeHtml(X.record)}</button> <button type="button" class="bl-btn secondary" data-clr>${escapeHtml(X.clear)}</button></p>
          </div>
        </div>
        <table class="bl-table"><thead><tr>${X.th.map(h => `<th>${escapeHtml(h)}</th>`).join('')}</tr></thead><tbody data-rows></tbody></table>
        <div class="bl-insight" data-pattern></div>
        <div class="bl-insight" data-insight></div>
      </div>`;
    const $ = (s) => mount.querySelector(s);
    const cv = $('[data-cv]'), g = cv.getContext('2d');
    const X0 = 40, XF = 420, Y0 = 38, Y1 = 112, R = 3.2;
    const xp = () => X0 + (V / 50) * (XF - X0);
    const mols = [];
    for (let i = 0; i < 30; i++) {
      const a = Math.random() * Math.PI * 2, s = 2.2;
      mols.push({ x: X0 + 10 + Math.random() * (XF - X0 - 20), y: Y0 + 6 + Math.random() * (Y1 - Y0 - 12), vx: Math.cos(a) * s, vy: Math.sin(a) * s });
    }
    let hitsThisSec = 0, hitsShown = 0, lastT = performance.now();

    function drawSyringe() {
      g.clearRect(0, 0, cv.width, cv.height);
      const px = xp();
      // nozzle + cap
      g.fillStyle = '#f4a261'; g.fillRect(14, 66, 26, 18);
      g.fillStyle = '#9aa5b5'; g.fillRect(8, 64, 8, 22);
      // barrel
      g.strokeStyle = '#cfd8e3'; g.lineWidth = 2.5; g.strokeRect(X0, Y0 - 3, XF - X0 + 6, Y1 - Y0 + 6);
      // trapped gas
      g.fillStyle = 'rgba(46,196,182,0.13)'; g.fillRect(X0, Y0, px - X0, Y1 - Y0);
      // tick marks
      g.fillStyle = '#9aa5b5'; g.font = '10px JetBrains Mono, monospace'; g.textAlign = 'center';
      for (let m = 10; m <= 50; m += 10) {
        const x = X0 + (m / 50) * (XF - X0);
        g.fillRect(x - 0.5, Y1 + 3, 1, 7);
        g.fillText(m + ' mL', x, Y1 + 21);
      }
      // plunger
      g.fillStyle = '#e8384f'; g.fillRect(px, Y0 - 2, 7, Y1 - Y0 + 4);
      g.fillStyle = '#9aa5b5'; g.fillRect(px + 7, 70, 455 - px - 7, 10);
      g.fillRect(448, 46, 8, 58);
      // molecules
      g.fillStyle = '#ffd166';
      mols.forEach(m => { g.beginPath(); g.arc(m.x, m.y, R, 0, Math.PI * 2); g.fill(); });
    }
    function step() {
      const px = xp();
      mols.forEach(m => {
        if (m.x > px - R) m.x = X0 + R + Math.random() * (px - X0 - 2 * R);
        m.x += m.vx; m.y += m.vy;
        if (m.x < X0 + R) { m.x = X0 + R; m.vx = Math.abs(m.vx); hitsThisSec++; }
        if (m.x > px - R) { m.x = px - R; m.vx = -Math.abs(m.vx); hitsThisSec++; }
        if (m.y < Y0 + R) { m.y = Y0 + R; m.vy = Math.abs(m.vy); hitsThisSec++; }
        if (m.y > Y1 - R) { m.y = Y1 - R; m.vy = -Math.abs(m.vy); hitsThisSec++; }
      });
      const now = performance.now();
      if (now - lastT >= 1000) {
        hitsShown = hitsShown ? Math.round(hitsShown * 0.4 + hitsThisSec * 0.6) : hitsThisSec;
        hitsThisSec = 0; lastT = now;
        $('[data-hits]').textContent = X.hits(hitsShown);
      }
    }
    function frame() {
      if (!cv.isConnected) return; // section re-rendered or left the page
      step(); drawSyringe();
      requestAnimationFrame(frame);
    }

    function graphSvg() {
      const Wd = 320, Ht = 240, ml = 42, mr = 12, mt = 12, mb = 36;
      const pw = Wd - ml - mr, ph = Ht - mt - mb;
      const x1 = axis === 0 ? 55 : 0.11, y1 = 5.5;
      const sx = (v) => ml + v / x1 * pw, sy = (v) => mt + ph - v / y1 * ph;
      const font = `font-family="JetBrains Mono, monospace" font-size="9.5" fill="#5a6475"`;
      let s = `<svg viewBox="0 0 ${Wd} ${Ht}" class="bl-svg" width="320" role="img">`;
      const xt = axis === 0 ? [0, 10, 20, 30, 40, 50] : [0, 0.02, 0.04, 0.06, 0.08, 0.1];
      xt.forEach(v => { s += `<line x1="${sx(v)}" y1="${mt}" x2="${sx(v)}" y2="${mt + ph}" stroke="#e5e0d6"/><text x="${sx(v)}" y="${mt + ph + 13}" text-anchor="middle" ${font}>${v}</text>`; });
      [0, 1, 2, 3, 4, 5].forEach(v => { s += `<line x1="${ml}" y1="${sy(v)}" x2="${ml + pw}" y2="${sy(v)}" stroke="#e5e0d6"/><text x="${ml - 5}" y="${sy(v) + 3}" text-anchor="end" ${font}>${v}</text>`; });
      s += `<line x1="${ml}" y1="${mt}" x2="${ml}" y2="${mt + ph}" stroke="#253a52" stroke-width="1.6"/><line x1="${ml}" y1="${mt + ph}" x2="${ml + pw}" y2="${mt + ph}" stroke="#253a52" stroke-width="1.6"/>`;
      s += `<text x="${ml + pw / 2}" y="${Ht - 4}" text-anchor="middle" ${font}>${escapeHtml(axis === 0 ? X.xPV : X.xInv)}</text><text x="10" y="${mt + ph / 2}" transform="rotate(-90 10 ${mt + ph / 2})" text-anchor="middle" ${font}>${escapeHtml(X.y)}</text>`;
      if (axis === 0) {
        let d = '';
        for (let v = 9.2; v <= 55; v += 0.5) d += (d ? ' L ' : 'M ') + sx(v).toFixed(1) + ' ' + sy(SYR_K / v).toFixed(1);
        s += `<path d="${d}" fill="none" stroke="#1a8c83" stroke-width="3"/>`;
      } else {
        s += `<line x1="${sx(0)}" y1="${sy(0)}" x2="${sx(0.108)}" y2="${sy(SYR_K * 0.108)}" stroke="#1a8c83" stroke-width="3"/><text x="${sx(0) + 6}" y="${sy(0) - 6}" ${font}>(0, 0)</text>`;
      }
      rows.forEach(r => {
        const xv = axis === 0 ? r : 1 / r;
        s += `<circle cx="${sx(xv)}" cy="${sy(SYR_K / r)}" r="4" fill="#f4a261" stroke="#253a52" stroke-width="1"/>`;
      });
      const xv = axis === 0 ? V : 1 / V;
      s += `<circle cx="${sx(xv)}" cy="${sy(SYR_K / V)}" r="6" fill="#e8384f" stroke="#fff" stroke-width="2"/>`;
      return s + '</svg>';
    }
    function redraw() {
      const P = SYR_K / V;
      $('[data-vval]').textContent = `${V} mL`;
      $('[data-read]').textContent = X.read(V, P.toFixed(2), (P * PSI).toFixed(1));
      $('[data-graph]').innerHTML = graphSvg();
      $('[data-rows]').innerHTML = rows.map(r => `<tr><td>${r}</td><td>${(SYR_K / r).toFixed(2)}</td><td class="bl-ok">${fmt(r * Number((SYR_K / r).toFixed(2)), 1)}</td></tr>`).join('');
      $('[data-pattern]').textContent = rows.length >= 3 ? X.pattern : (rows.length ? X.tryMore : '');
      $('[data-insight]').textContent = axis === 0 ? X.insightPV : X.insightInv;
    }
    $('[data-v]').addEventListener('input', (e) => { V = Number(e.target.value); redraw(); });
    $('[data-rec]').addEventListener('click', () => { if (rows.indexOf(V) === -1) { rows.push(V); rows.sort((a, b) => b - a); } redraw(); report(V); });
    $('[data-clr]').addEventListener('click', () => { rows.length = 0; redraw(); });
    mount.querySelectorAll('[data-axis]').forEach(b => b.addEventListener('click', () => {
      axis = Number(b.getAttribute('data-axis'));
      mount.querySelectorAll('[data-axis]').forEach(x => x.classList.toggle('selected', x === b));
      redraw();
    }));
    redraw();
    $('[data-hits]').textContent = X.hits('…');
    requestAnimationFrame(frame);
  }

  // ======================================================================
  // Widget B (Part B): predict first, no calculator. Volume changes by a
  // whole-number factor; pick the pressure change (direction + factor).
  // ======================================================================
  const PREDICT_ITEMS = [
    { v1: 8, v2: 4 }, { v1: 3, v2: 9 }, { v1: 20, v2: 5 }, { v1: 6, v2: 12 },
    { v1: 15, v2: 5 }, { v1: 2, v2: 10 }, { v1: 40, v2: 10 }, { v1: 4, v2: 8 }
  ];
  const PREDICT_OPTS = ['×2', '×3', '×4', '×5', '÷2', '÷3', '÷4', '÷5'];
  const PREDICT_TXT = {
    en: {
      item: (n, total) => `Change ${n} of ${total}`, score: (s, n) => `First-try score: ${s} / ${n}`,
      prompt: (a, b) => `The volume of a gas changes from ${a} L to ${b} L. The temperature stays the same. What happens to the pressure?`,
      up: 'pressure goes UP', down: 'pressure goes DOWN',
      right: (dir, f) => `✓ Yes! The volume ${dir} by a factor of ${f}, so the pressure does the opposite by the same factor.`,
      shrank: 'shrank', grew: 'grew',
      wrongDir: (dir) => `Check the direction. The volume ${dir} — pressure and volume are inversely proportional, so the pressure moves the OPPOSITE way.`,
      wrongFactor: (a, b) => `Right direction, wrong factor. Compare the volumes: ${a} L and ${b} L. How many times bigger is one than the other?`,
      next: 'Next →', again: 'Start over', done: 'All done! Fill in Part B of your worksheet from these.'
    },
    es: {
      item: (n, total) => `Cambio ${n} de ${total}`, score: (s, n) => `Puntaje al primer intento: ${s} / ${n}`,
      prompt: (a, b) => `El volumen de un gas cambia de ${a} L a ${b} L. La temperatura no cambia. ¿Qué le pasa a la presión?`,
      up: 'la presión SUBE', down: 'la presión BAJA',
      right: (dir, f) => `✓ ¡Sí! El volumen ${dir} por un factor de ${f}, así que la presión hace lo contrario por el mismo factor.`,
      shrank: 'disminuyó', grew: 'aumentó',
      wrongDir: (dir) => `Revisa la dirección. El volumen ${dir} — la presión y el volumen son inversamente proporcionales, así que la presión se mueve en dirección CONTRARIA.`,
      wrongFactor: (a, b) => `Dirección correcta, factor incorrecto. Compara los volúmenes: ${a} L y ${b} L. ¿Cuántas veces más grande es uno que el otro?`,
      next: 'Siguiente →', again: 'Empezar de nuevo', done: '¡Terminaste! Completa la Parte B de tu hoja de trabajo con estos.'
    }
  };

  function renderPredictWidget(mount, lang, report) {
    report = report || function () {};
    const X = PREDICT_TXT[lang];
    let idx = 0, score = 0;
    function show() {
      const it = PREDICT_ITEMS[idx];
      const shrink = it.v2 < it.v1;
      const factor = shrink ? it.v1 / it.v2 : it.v2 / it.v1;
      const answer = (shrink ? '×' : '÷') + factor;
      let firstTry = true;
      mount.innerHTML = `
        <div class="bl-widget">
          <div class="bl-mode-badge">${escapeHtml(X.item(idx + 1, PREDICT_ITEMS.length))}</div>
          <div class="bl-card">
            <p style="margin:0 0 0.3rem;">${escapeHtml(X.prompt(it.v1, it.v2))}</p>
            <div class="bl-big">${it.v1} L → ${it.v2} L</div>
            <p style="margin:0 0 0.2rem;font-size:0.85rem;"><strong>↑ ${escapeHtml(X.up)}</strong></p>
            <div class="bl-choices">${PREDICT_OPTS.slice(0, 4).map(o => `<button type="button" class="bl-opt" data-o="${o}">↑ ${o}</button>`).join('')}</div>
            <p style="margin:0 0 0.2rem;font-size:0.85rem;"><strong>↓ ${escapeHtml(X.down)}</strong></p>
            <div class="bl-choices">${PREDICT_OPTS.slice(4).map(o => `<button type="button" class="bl-opt" data-o="${o}">↓ ${o}</button>`).join('')}</div>
            <div class="bl-msg" data-msg></div>
            <p data-nextwrap style="display:none;margin:0.6rem 0 0;"><button type="button" class="bl-btn" data-next></button></p>
          </div>
          <p class="bl-insight" data-score style="text-align:right;">${escapeHtml(X.score(score, PREDICT_ITEMS.length))}</p>
        </div>`;
      const msg = mount.querySelector('[data-msg]');
      mount.querySelectorAll('[data-o]').forEach(b => b.addEventListener('click', () => {
        const o = b.getAttribute('data-o');
        if (o === answer) {
          if (firstTry) score++;
          report(idx);
          b.classList.add('right');
          mount.querySelectorAll('[data-o]').forEach(x => { x.disabled = true; });
          msg.className = 'bl-msg ok'; msg.textContent = X.right(shrink ? X.shrank : X.grew, factor);
          mount.querySelector('[data-score]').textContent = X.score(score, PREDICT_ITEMS.length);
          const last = idx + 1 >= PREDICT_ITEMS.length;
          const nb = mount.querySelector('[data-next]');
          nb.textContent = last ? X.again : X.next;
          if (last) msg.textContent += ' ' + X.done;
          mount.querySelector('[data-nextwrap]').style.display = 'block';
          nb.addEventListener('click', () => { if (last) { idx = 0; score = 0; } else idx++; show(); });
          return;
        }
        firstTry = false;
        b.classList.add('wrong'); b.disabled = true;
        msg.className = 'bl-msg bad';
        msg.textContent = (o[0] === answer[0]) ? X.wrongFactor(it.v1, it.v2) : X.wrongDir(shrink ? X.shrank : X.grew);
      }));
    }
    show();
  }

  // ======================================================================
  // Widget C (Part C): PV stays the same. One sample of gas, one
  // temperature; fill in the missing P or V in each row. PV fills in when
  // the row is right.
  // ======================================================================
  const PV_K = 24;
  const PV_ROWS = [
    { P: 1.0, V: 24, given: true },
    { P: 2.0, V: 12, ask: 'V' },
    { P: 4.0, V: 6.0, ask: 'P' },
    { P: 0.50, V: 48, ask: 'V' },
    { P: 8.0, V: 3.0, ask: 'P' },
    { P: 1.5, V: 16, ask: 'V' }
  ];
  const PV_TXT = {
    en: {
      lead: 'The same sample of gas at the same temperature. Row 1 is the starting point. Fill in each missing value, then press Check.',
      th: ['Trial', 'P (atm)', 'V (L)', 'PV (atm·L)', ''],
      check: 'Check', start: 'start',
      right: '✓', needNum: 'Type a number first.',
      wrongMult: 'That went the wrong way. When one goes up, the other goes DOWN — divide PV by the value you know.',
      wrongGeneric: 'Not quite. Find PV from row 1, then divide it by the value you know.',
      allDone: 'Every row has PV = 24 atm·L. Because PV is the same for every row, you can use P₁V₁ = P₂V₂ to connect ANY two rows.'
    },
    es: {
      lead: 'La misma muestra de gas a la misma temperatura. La fila 1 es el punto de partida. Completa cada valor que falta y presiona Revisar.',
      th: ['Prueba', 'P (atm)', 'V (L)', 'PV (atm·L)', ''],
      check: 'Revisar', start: 'inicio',
      right: '✓', needNum: 'Escribe un número primero.',
      wrongMult: 'Eso fue en la dirección equivocada. Cuando uno sube, el otro BAJA — divide PV entre el valor que conoces.',
      wrongGeneric: 'No exactamente. Encuentra PV con la fila 1 y luego divídelo entre el valor que conoces.',
      allDone: 'Cada fila tiene PV = 24 atm·L. Como PV es igual en todas las filas, puedes usar P₁V₁ = P₂V₂ para conectar CUALQUIER par de filas.'
    }
  };

  function renderPvTable(mount, lang, report) {
    report = report || function () {};
    const X = PV_TXT[lang];
    const done = PV_ROWS.map(r => !!r.given);
    mount.innerHTML = `
      <div class="bl-widget">
        <p class="bl-lead">${escapeHtml(X.lead)}</p>
        <div style="overflow-x:auto;"><table class="bl-table" style="max-width:none;">
          <thead><tr>${X.th.map(h => `<th>${escapeHtml(h)}</th>`).join('')}</tr></thead>
          <tbody>${PV_ROWS.map((r, i) => {
            const cell = (k) => (r.ask === k) ? `<input class="bl-cell-input" type="text" inputmode="decimal" data-in="${i}" autocomplete="off" style="width:4.6rem;">` : dispNum(r[k]);
            return `<tr data-row="${i}"><td>${i + 1}${r.given ? ` (${escapeHtml(X.start)})` : ''}</td><td>${cell('P')}</td><td>${cell('V')}</td><td data-pv class="${r.given ? 'bl-ok' : ''}">${r.given ? PV_K : ''}</td><td>${r.given ? '' : `<button type="button" class="bl-btn" data-chk="${i}">${escapeHtml(X.check)}</button>`}</td></tr>`;
          }).join('')}</tbody>
        </table></div>
        <div class="bl-msg" data-msg></div>
      </div>`;
    const msg = mount.querySelector('[data-msg]');
    function check(i) {
      const r = PV_ROWS[i];
      const inp = mount.querySelector(`[data-in="${i}"]`);
      const v = parseNum(inp.value);
      if (isNaN(v)) { msg.className = 'bl-msg bad'; msg.textContent = X.needNum; return; }
      const exp = r[r.ask], known = r.ask === 'V' ? r.P : r.V;
      if (closeTo(v, exp, 0.02)) {
        done[i] = true;
        report(i);
        inp.disabled = true;
        const row = mount.querySelector(`[data-row="${i}"]`);
        row.querySelector('[data-pv]').textContent = PV_K + ' ✓';
        row.querySelector('[data-pv]').className = 'bl-ok';
        row.querySelector('[data-chk]').disabled = true;
        msg.className = 'bl-msg ok';
        msg.textContent = done.every(Boolean) ? X.allDone : X.right;
        return;
      }
      msg.className = 'bl-msg bad';
      msg.textContent = closeTo(v, PV_K * known, 0.02) ? X.wrongMult : X.wrongGeneric;
    }
    mount.querySelectorAll('[data-chk]').forEach(b => b.addEventListener('click', () => check(Number(b.getAttribute('data-chk')))));
    mount.querySelectorAll('[data-in]').forEach(inp => inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') check(Number(inp.getAttribute('data-in'))); }));
  }

  // ======================================================================
  // Widget D (Part D): step-by-step P1V1 = P2V2 solver. Problem 1 guided
  // (hints shown); the rest independent. Specific feedback for the classic
  // traps: flipping the fraction, multiplying instead of dividing, and
  // stopping at PV.
  // ======================================================================
  const BOYLE_PROBLEMS = [
    { id: 'b1', find: 'P2', P1: 1.0, V1: 4.0, V2: 2.0, pu: 'atm', vu: 'L', correctIdx: 0,
      prompt: { en: 'A balloon holds 4.0 L of air at 1.0 atm. A diver takes it underwater until its volume is 2.0 L. What is the pressure on the balloon now?', es: 'Un globo contiene 4.0 L de aire a 1.0 atm. Un buzo lo lleva bajo el agua hasta que su volumen es 2.0 L. ¿Cuál es la presión sobre el globo ahora?' } },
    { id: 'b2', find: 'V2', P1: 1.0, V1: 12, P2: 0.40, pu: 'atm', vu: 'L', correctIdx: 2,
      prompt: { en: 'A weather balloon holds 12 L of helium at 1.0 atm on the ground. High in the sky the pressure is only 0.40 atm. Assume the temperature stays the same. What is its new volume?', es: 'Un globo meteorológico contiene 12 L de helio a 1.0 atm en el suelo. En lo alto del cielo la presión es solo 0.40 atm. Supón que la temperatura no cambia. ¿Cuál es su nuevo volumen?' } },
    { id: 'b3', find: 'P2', P1: 1.0, V1: 30, V2: 45, pu: 'atm', vu: 'mL', correctIdx: 1,
      prompt: { en: 'A capped syringe holds 30 mL of air at 1.0 atm. You PULL the plunger out until the air takes up 45 mL. What is the new pressure?', es: 'Una jeringa tapada contiene 30 mL de aire a 1.0 atm. JALAS el émbolo hasta que el aire ocupa 45 mL. ¿Cuál es la nueva presión?' } },
    { id: 'b4', find: 'V2', P1: 2.0, V1: 6.0, P2: 1.0, pu: 'atm', vu: 'L', correctIdx: 0,
      prompt: { en: 'Ten meters underwater, a diver\'s lungs hold 6.0 L of air at 2.0 atm. If the diver held their breath and swam up to the surface (1.0 atm), what volume would that air try to take up?', es: 'A diez metros bajo el agua, los pulmones de un buzo contienen 6.0 L de aire a 2.0 atm. Si el buzo aguantara la respiración y nadara a la superficie (1.0 atm), ¿qué volumen intentaría ocupar ese aire?' } },
    { id: 'b5', find: 'P2', P1: 14.7, V1: 0.50, V2: 0.15, pu: 'lb/in²', vu: 'L', correctIdx: 2,
      prompt: { en: 'A bike pump holds 0.50 L of air at 14.7 lb/in². You push the handle and squeeze the air into 0.15 L. What is the new pressure in lb/in²?', es: 'Una bomba de bicicleta contiene 0.50 L de aire a 14.7 lb/in². Empujas la manija y comprimes el aire a 0.15 L. ¿Cuál es la nueva presión en lb/in²?' } }
  ];

  const SOLVER_TXT = {
    en: {
      pick: 'Pick a problem:', probLabel: (n) => `Problem ${n}`,
      titles: {
        known: 'Step 1 · Fill in what you know (Before and After)',
        same: 'Step 2 · Is this a Boyle\'s law problem? What stays the same?',
        k: 'Step 3 · Multiply the "before" values: P₁ × V₁',
        setup: 'Step 4 · Choose the equation that gets the unknown alone',
        solveP: (u) => `Step 5 · Solve for P₂ (in ${u})`,
        solveV: (u) => `Step 5 · Solve for V₂ (in ${u})`,
        sense: 'Step 6 · Does your answer make sense?'
      },
      hints: {
        known: 'Before = the starting numbers (P₁, V₁). After = the new numbers. The one you are looking for is the "?" — it is not typed here.',
        same: 'Boyle\'s law only works when the temperature and the amount of gas do not change.',
        k: 'P₁ × V₁ is the "k" for this sample of gas. Keep it — it will be the same after the change.',
        setup: 'Start with P₁V₁ = P₂V₂. Divide both sides by the value you KNOW on the right side.',
        solve: 'Divide P₁V₁ by the "after" value you know.',
        sense: 'Smaller volume → bigger pressure. Lower pressure → bigger volume.'
      },
      field: { P1: 'P₁ =', V1: 'V₁ =', P2: 'P₂ =', V2: 'V₂ =', k: 'P₁V₁ =' },
      sameChoices: ['The temperature and the amount of gas', 'The pressure and the volume', 'The volume and the temperature'],
      sameWrong: 'Not that one — in a Boyle\'s law problem the pressure AND the volume both change. What is held constant?',
      setupChoices: {
        P2: ['P₂ = P₁V₁ ÷ V₂', 'P₂ = P₁V₂ ÷ V₁', 'P₂ = P₁V₁ × V₂'],
        V2: ['V₂ = P₁V₁ ÷ P₂', 'V₂ = P₂V₁ ÷ P₁', 'V₂ = P₁V₁ × P₂']
      },
      setupWrong: 'Not that one. In P₁V₁ = P₂V₂, the unknown is multiplied by a known "after" value — so divide P₁V₁ by that known value.',
      senseQ: { P2down: 'The volume got SMALLER. So the pressure should…', P2up: 'The volume got BIGGER. So the pressure should…', V2down: 'The pressure went DOWN. So the volume should…', V2up: 'The pressure went UP. So the volume should…' },
      senseChoices: { P2: ['go up', 'go down', 'stay the same'], V2: ['get bigger', 'get smaller', 'stay the same'] },
      senseWrong: 'Think inverse: when one goes up, the other goes down.',
      check: 'Check', showHint: '💡 Show hint', hideHint: '▲ Hide hint', next: 'Next problem →', again: 'Back to Problem 1',
      right: '✓ Correct!', needNum: 'Type a number in every box first.',
      wrongGeneric: 'Not quite — check your arithmetic (rounding to 2 or 3 digits is fine).',
      swapped: 'Looks like the numbers are in the wrong boxes. P is a pressure (atm or lb/in²); V is a volume (L or mL). 1 = before, 2 = after.',
      flipped: 'It looks like the fraction is upside down (P₁V₂ ÷ V₁). Multiply the BEFORE values together, then divide by the AFTER value you know.',
      multiplied: 'Check the operation: you multiplied by the after value. You need to DIVIDE P₁V₁ by it.',
      justK: 'That is P₁V₁ — you are almost there. Now divide it by the "after" value you know.',
      kWrong: 'P₁V₁ means P₁ times V₁ — multiply the two BEFORE numbers.',
      solved: (u, ans, line) => `✓ Solved! ${line} = ${ans} ${u}.`
    },
    es: {
      pick: 'Elige un problema:', probLabel: (n) => `Problema ${n}`,
      titles: {
        known: 'Paso 1 · Escribe lo que sabes (Antes y Después)',
        same: 'Paso 2 · ¿Es un problema de la ley de Boyle? ¿Qué se mantiene igual?',
        k: 'Paso 3 · Multiplica los valores de "antes": P₁ × V₁',
        setup: 'Paso 4 · Elige la ecuación que deja sola la incógnita',
        solveP: (u) => `Paso 5 · Despeja P₂ (en ${u})`,
        solveV: (u) => `Paso 5 · Despeja V₂ (en ${u})`,
        sense: 'Paso 6 · ¿Tiene sentido tu respuesta?'
      },
      hints: {
        known: 'Antes = los números iniciales (P₁, V₁). Después = los números nuevos. El que buscas es el "?" — no se escribe aquí.',
        same: 'La ley de Boyle solo funciona cuando la temperatura y la cantidad de gas no cambian.',
        k: 'P₁ × V₁ es la "k" de esta muestra de gas. Guárdala — será la misma después del cambio.',
        setup: 'Empieza con P₁V₁ = P₂V₂. Divide ambos lados entre el valor que CONOCES del lado derecho.',
        solve: 'Divide P₁V₁ entre el valor de "después" que conoces.',
        sense: 'Menor volumen → mayor presión. Menor presión → mayor volumen.'
      },
      field: { P1: 'P₁ =', V1: 'V₁ =', P2: 'P₂ =', V2: 'V₂ =', k: 'P₁V₁ =' },
      sameChoices: ['La temperatura y la cantidad de gas', 'La presión y el volumen', 'El volumen y la temperatura'],
      sameWrong: 'Esa no — en un problema de la ley de Boyle la presión Y el volumen cambian. ¿Qué se mantiene constante?',
      setupChoices: {
        P2: ['P₂ = P₁V₁ ÷ V₂', 'P₂ = P₁V₂ ÷ V₁', 'P₂ = P₁V₁ × V₂'],
        V2: ['V₂ = P₁V₁ ÷ P₂', 'V₂ = P₂V₁ ÷ P₁', 'V₂ = P₁V₁ × P₂']
      },
      setupWrong: 'Esa no. En P₁V₁ = P₂V₂, la incógnita está multiplicada por un valor de "después" conocido — así que divide P₁V₁ entre ese valor.',
      senseQ: { P2down: 'El volumen se hizo MÁS PEQUEÑO. Entonces la presión debe…', P2up: 'El volumen se hizo MÁS GRANDE. Entonces la presión debe…', V2down: 'La presión BAJÓ. Entonces el volumen debe…', V2up: 'La presión SUBIÓ. Entonces el volumen debe…' },
      senseChoices: { P2: ['subir', 'bajar', 'quedar igual'], V2: ['hacerse más grande', 'hacerse más pequeño', 'quedar igual'] },
      senseWrong: 'Piensa en lo inverso: cuando uno sube, el otro baja.',
      check: 'Revisar', showHint: '💡 Ver pista', hideHint: '▲ Ocultar pista', next: 'Siguiente problema →', again: 'Volver al Problema 1',
      right: '✓ ¡Correcto!', needNum: 'Escribe un número en cada casilla primero.',
      wrongGeneric: 'No exactamente — revisa tus cálculos (redondear a 2 o 3 cifras está bien).',
      swapped: 'Parece que los números están en las casillas equivocadas. P es una presión (atm o lb/in²); V es un volumen (L o mL). 1 = antes, 2 = después.',
      flipped: 'Parece que la fracción está al revés (P₁V₂ ÷ V₁). Multiplica los valores de ANTES y luego divide entre el valor de DESPUÉS que conoces.',
      multiplied: 'Revisa la operación: multiplicaste por el valor de después. Necesitas DIVIDIR P₁V₁ entre él.',
      justK: 'Eso es P₁V₁ — ya casi. Ahora divídelo entre el valor de "después" que conoces.',
      kWrong: 'P₁V₁ significa P₁ por V₁ — multiplica los dos números de ANTES.',
      solved: (u, ans, line) => `✓ ¡Resuelto! ${line} = ${ans} ${u}.`
    }
  };

  function boyleSolution(p) {
    const k = p.P1 * p.V1;
    if (p.find === 'P2') return { k, ans: k / p.V2, flipped: p.P1 * p.V2 / p.V1, multiplied: k * p.V2, knownAfter: p.V2, up: p.V2 < p.V1 };
    return { k, ans: k / p.P2, flipped: p.P2 * p.V1 / p.P1, multiplied: k * p.P2, knownAfter: p.P2, up: p.P2 < p.P1 };
  }
  function rotate(choices, correctIdx) {
    const good = choices[0], others = choices.slice(1);
    return others.slice(0, correctIdx).concat([good], others.slice(correctIdx));
  }

  function renderBoyleSolver(mount, lang, report) {
    report = report || function () {};
    const X = SOLVER_TXT[lang];
    mount.innerHTML = `
      <div class="bl-widget">
        <p class="bl-lead"><strong>${escapeHtml(X.pick)}</strong></p>
        <div class="bl-choices">${BOYLE_PROBLEMS.map((p, i) => `<button type="button" class="bl-opt${i === 0 ? ' selected' : ''}" data-prob="${i}">${escapeHtml(X.probLabel(i + 1))}</button>`).join('')}</div>
        <div data-stage></div>
      </div>`;
    const stage = mount.querySelector('[data-stage]');

    function mountProblem(pi) {
      const p = BOYLE_PROBLEMS[pi], sol = boyleSolution(p), guided = pi === 0;
      const isP = p.find === 'P2';
      const afterId = isP ? 'V2' : 'P2';
      const steps = [];
      steps.push({
        title: X.titles.known, hint: X.hints.known, type: 'num',
        fields: [{ id: 'P1', label: X.field.P1, unit: p.pu }, { id: 'V1', label: X.field.V1, unit: p.vu }, { id: afterId, label: X.field[afterId], unit: isP ? p.vu : p.pu }],
        check(v) {
          const exp = [p.P1, p.V1, p[afterId]];
          if (exp.every((e, i) => closeTo(v[i], e, 0.001, 0.0001))) return { ok: true };
          const sorted = (a) => a.slice().sort((x, y) => x - y).join(',');
          if (sorted(v) === sorted(exp)) return { ok: false, msg: X.swapped };
          return { ok: false, msg: X.wrongGeneric };
        }
      });
      steps.push({ title: X.titles.same, hint: X.hints.same, type: 'mc', choices: rotate(X.sameChoices, (pi + 1) % 3), correct: (pi + 1) % 3, wrong: X.sameWrong });
      steps.push({
        title: X.titles.k, hint: X.hints.k, type: 'num',
        fields: [{ id: 'k', label: X.field.k, unit: `${p.pu}·${p.vu}` }],
        check(v) { return closeTo(v[0], sol.k, 0.01) ? { ok: true } : { ok: false, msg: X.kWrong }; }
      });
      steps.push({ title: X.titles.setup, hint: X.hints.setup, type: 'mc', choices: rotate(X.setupChoices[p.find], p.correctIdx), correct: p.correctIdx, wrong: X.setupWrong });
      const ansUnit = isP ? p.pu : p.vu;
      steps.push({
        title: isP ? X.titles.solveP(ansUnit) : X.titles.solveV(ansUnit), hint: X.hints.solve, type: 'num',
        fields: [{ id: 'ans', label: X.field[p.find], unit: ansUnit }],
        check(v) {
          if (closeTo(v[0], sol.ans, 0.012)) return { ok: true };
          if (closeTo(v[0], sol.flipped, 0.012)) return { ok: false, msg: X.flipped };
          if (closeTo(v[0], sol.multiplied, 0.012)) return { ok: false, msg: X.multiplied };
          if (closeTo(v[0], sol.k, 0.01)) return { ok: false, msg: X.justK };
          return { ok: false, msg: X.wrongGeneric };
        }
      });
      // up = the unknown gets bigger. For P2: V shrank -> P up. For V2: P dropped -> V up.
      const senseKey = isP ? (sol.up ? 'P2down' : 'P2up') : (sol.up ? 'V2down' : 'V2up');
      steps.push({ title: X.titles.sense, hint: X.hints.sense, type: 'mc', lead: X.senseQ[senseKey], choices: X.senseChoices[p.find].slice(), correct: sol.up ? 0 : 1, wrong: X.senseWrong });

      stage.innerHTML = `
        <div class="bl-mode-badge${guided ? ' guided' : ''}">${escapeHtml(t(guided ? 'guidedModeLabel' : 'independentModeLabel', lang))}</div>
        <p style="margin:0.2rem 0 0.4rem;"><strong>${escapeHtml(tr(p.prompt, lang))}</strong></p>
        <div data-steps></div>
        <div data-end></div>`;
      const host = stage.querySelector('[data-steps]');
      host.innerHTML = steps.map((s, i) => `
        <div class="bl-step${i === 0 ? '' : ' locked'}" data-step="${i}">
          <div class="bl-step-title">${escapeHtml(s.title)}</div>
          ${s.lead ? `<p style="margin:0 0 0.4rem;font-size:0.88rem;">${escapeHtml(s.lead)}</p>` : ''}
          ${s.type === 'num'
            ? `<div class="bl-fields">${s.fields.map(f => `<label class="bl-field">${escapeHtml(f.label)} <input type="text" inputmode="decimal" data-f="${f.id}" autocomplete="off"> ${escapeHtml(f.unit)}</label>`).join('')}</div>`
            : `<div class="bl-mc">${s.choices.map((c, ci) => `<button type="button" data-c="${ci}">${escapeHtml(c)}</button>`).join('')}</div>`}
          <div class="bl-hint${guided ? ' open' : ''}" data-hint>${escapeHtml(s.hint)}</div>
          <div>${s.type === 'num' ? `<button type="button" class="bl-btn" data-check>${escapeHtml(X.check)}</button> ` : ''}${guided ? '' : `<button type="button" class="bl-btn secondary" data-hbtn>${escapeHtml(X.showHint)}</button>`}</div>
          <div class="bl-msg" data-msg></div>
        </div>`).join('');

      function finishStep(i) {
        const card = host.querySelector(`[data-step="${i}"]`);
        card.classList.add('done');
        card.querySelector('[data-msg]').className = 'bl-msg ok';
        card.querySelector('[data-msg]').textContent = X.right;
        card.querySelectorAll('input,button[data-c],[data-check]').forEach(e => { e.disabled = true; });
        if (i + 1 < steps.length) { host.querySelector(`[data-step="${i + 1}"]`).classList.remove('locked'); return; }
        report(pi);
        mount.querySelector(`[data-prob="${pi}"]`).textContent = X.probLabel(pi + 1) + ' ✓';
        const D = dispNum;
        const line = isP ? `P₂ = (${D(p.P1)})(${D(p.V1)}) ÷ ${D(p.V2)}` : `V₂ = (${D(p.P1)})(${D(p.V1)}) ÷ ${D(p.P2)}`;
        const end = stage.querySelector('[data-end]');
        end.innerHTML = `<div class="bl-solved">${escapeHtml(X.solved(ansUnit, D(Number(fmt(sol.ans, 2))), line))}</div><p style="margin-top:0.6rem;"><button type="button" class="bl-btn" data-nextprob>${escapeHtml(pi + 1 < BOYLE_PROBLEMS.length ? X.next : X.again)}</button></p>`;
        end.querySelector('[data-nextprob]').addEventListener('click', () => pickProblem((pi + 1) % BOYLE_PROBLEMS.length));
      }

      steps.forEach((s, i) => {
        const card = host.querySelector(`[data-step="${i}"]`);
        const msg = card.querySelector('[data-msg]');
        const hbtn = card.querySelector('[data-hbtn]');
        if (hbtn) hbtn.addEventListener('click', () => {
          const open = card.querySelector('[data-hint]').classList.toggle('open');
          hbtn.textContent = open ? X.hideHint : X.showHint;
        });
        if (s.type === 'num') {
          const run = () => {
            const vals = s.fields.map(f => parseNum(card.querySelector(`[data-f="${f.id}"]`).value));
            if (vals.some(isNaN)) { msg.className = 'bl-msg bad'; msg.textContent = X.needNum; return; }
            const res = s.check(vals);
            if (res.ok) finishStep(i); else { msg.className = 'bl-msg bad'; msg.textContent = res.msg; }
          };
          card.querySelector('[data-check]').addEventListener('click', run);
          card.querySelectorAll('input').forEach(inp => inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') run(); }));
        } else {
          card.querySelectorAll('[data-c]').forEach(b => b.addEventListener('click', () => {
            const ci = Number(b.getAttribute('data-c'));
            if (ci === s.correct) { b.classList.add('right'); finishStep(i); }
            else { b.classList.add('wrong'); b.disabled = true; msg.className = 'bl-msg bad'; msg.textContent = s.wrong; }
          }));
        }
      });
    }

    function pickProblem(i) {
      mount.querySelectorAll('[data-prob]').forEach(b => b.classList.toggle('selected', Number(b.getAttribute('data-prob')) === i));
      mountProblem(i);
    }
    mount.querySelectorAll('[data-prob]').forEach(b => b.addEventListener('click', () => pickProblem(Number(b.getAttribute('data-prob')))));
    mountProblem(0);
  }

  // ======================================================================
  // Widget E (Part E): spot the mistake in a worked Boyle's law solution.
  // ======================================================================
  const SPOT_ITEMS = [
    { lines: ['P₁ = 1.0 atm   V₁ = 8.0 L   V₂ = 2.0 L', 'P₂ = P₁V₂ ÷ V₁ = (1.0)(2.0) ÷ 8.0', 'P₂ = 0.25 atm'], err: 1,
      problem: { en: 'A gas at 1.0 atm is squeezed from 8.0 L to 2.0 L. Find the new pressure.', es: 'Un gas a 1.0 atm se comprime de 8.0 L a 2.0 L. Encuentra la nueva presión.' },
      why: { en: 'The fraction is flipped. P₂ = P₁V₁ ÷ V₂ = (1.0)(8.0) ÷ 2.0 = 4.0 atm. Red flag: the gas was SQUEEZED, so the pressure must go UP — 0.25 atm went down.', es: 'La fracción está al revés. P₂ = P₁V₁ ÷ V₂ = (1.0)(8.0) ÷ 2.0 = 4.0 atm. Señal de alerta: el gas se COMPRIMIÓ, así que la presión debe SUBIR — 0.25 atm bajó.' } },
    { lines: ['P₁V₁ = (2.0 atm)(3.0 L) = 6.0 atm·L', 'V₂ = 6.0 × 0.50', 'V₂ = 3.0 L'], err: 1,
      problem: { en: 'A gas takes up 3.0 L at 2.0 atm. The pressure drops to 0.50 atm. Find the new volume.', es: 'Un gas ocupa 3.0 L a 2.0 atm. La presión baja a 0.50 atm. Encuentra el nuevo volumen.' },
      why: { en: 'P₁V₁ = P₂V₂, so V₂ = P₁V₁ ÷ P₂ — divide, don\'t multiply. V₂ = 6.0 ÷ 0.50 = 12 L. Check: the pressure dropped to ¼, so the volume should grow 4 times (3.0 → 12 L).', es: 'P₁V₁ = P₂V₂, así que V₂ = P₁V₁ ÷ P₂ — se divide, no se multiplica. V₂ = 6.0 ÷ 0.50 = 12 L. Verificación: la presión bajó a ¼, así que el volumen debe crecer 4 veces (3.0 → 12 L).' } },
    { lines: ['This is a Boyle\'s law problem.', 'P₁V₁ = P₂V₂ → (1.0)(0.50) = P₂(0.50)', 'P₂ = 1.0 atm, so the pressure does not change.'], err: 0,
      problem: { en: 'A sealed, rigid can holds 0.50 L of air at 1.0 atm and 20 °C. The can is heated to 100 °C. Find the new pressure.', es: 'Una lata sellada y rígida contiene 0.50 L de aire a 1.0 atm y 20 °C. La lata se calienta a 100 °C. Encuentra la nueva presión.' },
      why: { en: 'Boyle\'s law only works when the TEMPERATURE stays the same. Here the temperature changes and the volume stays the same, so Boyle\'s law does not apply — heating the can really does raise the pressure. (You will learn the pressure–temperature law next.)', es: 'La ley de Boyle solo funciona cuando la TEMPERATURA no cambia. Aquí la temperatura cambia y el volumen no, así que la ley de Boyle no se aplica — calentar la lata sí aumenta la presión. (Aprenderás la ley de presión y temperatura después.)' } },
    { lines: ['P₁ = 1.0 atm   V₁ = 500 mL   V₂ = 250 mL', 'P₁V₁ = (1.0)(500) = 500 atm·mL', 'P₂ = 500 ÷ 250 = 2.0 atm', 'The volume got smaller, so the pressure went down.'], err: 3,
      problem: { en: 'A syringe of air at 1.0 atm is pushed from 500 mL to 250 mL. Find the new pressure and explain.', es: 'Una jeringa con aire a 1.0 atm se empuja de 500 mL a 250 mL. Encuentra la nueva presión y explica.' },
      why: { en: 'The math is right (2.0 atm), but the explanation is backwards. The volume got smaller, so the pressure went UP — from 1.0 to 2.0 atm. The same molecules hit the walls more often in a smaller space.', es: 'El cálculo está bien (2.0 atm), pero la explicación está al revés. El volumen se hizo más pequeño, así que la presión SUBIÓ — de 1.0 a 2.0 atm. Las mismas moléculas chocan con las paredes más seguido en un espacio más pequeño.' } }
  ];
  const SPOT_TXT = {
    en: { pick: 'Click the line that contains the mistake:', item: (n, total) => `Mistake ${n} of ${total}`, right: '✓ You found it!', wrong: 'Not that line — look again.', next: 'Next →', again: 'Start over', problem: 'Problem' },
    es: { pick: 'Haz clic en la línea que contiene el error:', item: (n, total) => `Error ${n} de ${total}`, right: '✓ ¡Lo encontraste!', wrong: 'Esa no es la línea — mira otra vez.', next: 'Siguiente →', again: 'Empezar de nuevo', problem: 'Problema' }
  };

  function renderSpotMistake(mount, lang, report) {
    report = report || function () {};
    const X = SPOT_TXT[lang];
    let idx = 0;
    function show() {
      const it = SPOT_ITEMS[idx];
      mount.innerHTML = `
        <div class="bl-widget">
          <div class="bl-mode-badge">${escapeHtml(X.item(idx + 1, SPOT_ITEMS.length))}</div>
          <p style="margin:0.2rem 0;"><strong>${escapeHtml(X.problem)}:</strong> ${escapeHtml(tr(it.problem, lang))}</p>
          <p class="bl-lead">${escapeHtml(X.pick)}</p>
          <div class="bl-work">${it.lines.map((l, i) => `<button type="button" class="bl-line" data-line="${i}">${escapeHtml(l)}</button>`).join('')}</div>
          <div class="bl-msg" data-msg></div>
          <div data-why></div>
          <p data-nextwrap style="display:none;margin-top:0.6rem;"><button type="button" class="bl-btn" data-next></button></p>
        </div>`;
      const msg = mount.querySelector('[data-msg]');
      mount.querySelectorAll('[data-line]').forEach(b => b.addEventListener('click', () => {
        const i = Number(b.getAttribute('data-line'));
        if (i !== it.err) { b.classList.add('picked-wrong'); b.disabled = true; msg.className = 'bl-msg bad'; msg.textContent = X.wrong; return; }
        mount.querySelectorAll('[data-line]').forEach(x => { x.disabled = true; });
        report(idx);
        b.classList.remove('picked-wrong'); b.classList.add('error');
        msg.className = 'bl-msg ok'; msg.textContent = X.right;
        mount.querySelector('[data-why]').innerHTML = `<div class="bl-solved bl-plain">${escapeHtml(tr(it.why, lang))}</div>`;
        mount.querySelector('[data-nextwrap]').style.display = 'block';
        const nb = mount.querySelector('[data-next]');
        nb.textContent = idx + 1 < SPOT_ITEMS.length ? X.next : X.again;
        nb.addEventListener('click', () => { idx = (idx + 1) % SPOT_ITEMS.length; show(); });
      }));
    }
    show();
  }

  // ======================================================================
  // Graded check: 12 multiple-choice questions. Numbers differ from the
  // packet's Lesson 58/58P problems and from the worksheet.
  // ======================================================================
  const QUESTIONS = [
    { id: 'q1',
      prompt: { en: 'Which statement is Boyle\'s law?', es: '¿Qué enunciado es la ley de Boyle?' },
      choices: [
        { en: 'The volume of a gas is directly proportional to its Kelvin temperature at constant pressure.', es: 'El volumen de un gas es directamente proporcional a su temperatura Kelvin a presión constante.' },
        { en: 'The pressure of a given amount of gas is inversely proportional to its volume if the temperature does not change.', es: 'La presión de una cantidad dada de gas es inversamente proporcional a su volumen si la temperatura no cambia.' },
        { en: 'The pressure of a gas is directly proportional to its volume.', es: 'La presión de un gas es directamente proporcional a su volumen.' },
        { en: 'The density of a gas stays the same when it is compressed.', es: 'La densidad de un gas no cambia cuando se comprime.' }
      ], correct: 1,
      explanation: { en: 'Boyle\'s law: PV = k for a fixed amount of gas at constant temperature. Choice A is Charles\'s law from Chapter 10.', es: 'Ley de Boyle: PV = k para una cantidad fija de gas a temperatura constante. La opción A es la ley de Charles del Capítulo 10.' } },
    { id: 'q2',
      prompt: { en: 'Two variables are inversely proportional when…', es: 'Dos variables son inversamente proporcionales cuando…' },
      choices: [
        { en: 'one increases when the other decreases, and their product stays the same', es: 'una aumenta cuando la otra disminuye, y su producto se mantiene igual' },
        { en: 'both increase together at the same rate', es: 'ambas aumentan juntas al mismo ritmo' },
        { en: 'their graph is a straight line through (0, 0)', es: 'su gráfica es una línea recta que pasa por (0, 0)' },
        { en: 'one of them never changes', es: 'una de ellas nunca cambia' }
      ], correct: 0,
      explanation: { en: 'Inverse: one goes up, the other goes down, and P × V stays constant. A straight line through (0, 0) is a DIRECT proportion.', es: 'Inversa: una sube, la otra baja, y P × V se mantiene constante. Una línea recta que pasa por (0, 0) es una proporción DIRECTA.' } },
    { id: 'q3',
      prompt: { en: 'What does a graph of pressure vs. volume look like for a gas at constant temperature?', es: '¿Cómo se ve una gráfica de presión vs. volumen para un gas a temperatura constante?' },
      choices: [
        { en: 'A straight line going up through the origin', es: 'Una línea recta que sube y pasa por el origen' },
        { en: 'A flat horizontal line', es: 'Una línea horizontal plana' },
        { en: 'A curve that is steep at small volumes, flattens out at large volumes, and never touches the axes', es: 'Una curva empinada con volúmenes pequeños, que se aplana con volúmenes grandes y nunca toca los ejes' },
        { en: 'A straight line going down that hits zero pressure at 50 mL', es: 'Una línea recta que baja y llega a presión cero en 50 mL' }
      ], correct: 2,
      explanation: { en: 'P = k/V makes a curve (a hyperbola). Pressure never reaches zero and volume never reaches zero.', es: 'P = k/V forma una curva (una hipérbola). La presión nunca llega a cero y el volumen nunca llega a cero.' } },
    { id: 'q4',
      prompt: { en: 'Why does the pressure inside a sealed syringe go up when you push the plunger in?', es: '¿Por qué sube la presión dentro de una jeringa sellada cuando empujas el émbolo?' },
      choices: [
        { en: 'More air molecules are created inside the syringe.', es: 'Se crean más moléculas de aire dentro de la jeringa.' },
        { en: 'The molecules get bigger.', es: 'Las moléculas se hacen más grandes.' },
        { en: 'The molecules slow down and stick to the walls.', es: 'Las moléculas se hacen más lentas y se pegan a las paredes.' },
        { en: 'The same molecules are in a smaller space, so they hit the walls more often.', es: 'Las mismas moléculas están en un espacio más pequeño, así que chocan con las paredes más seguido.' }
      ], correct: 3,
      explanation: { en: 'The number of molecules and their speed (temperature) stay the same. Less room means more collisions with the walls each second — more pressure.', es: 'El número de moléculas y su rapidez (temperatura) no cambian. Menos espacio significa más choques con las paredes cada segundo — más presión.' } },
    { id: 'q5',
      prompt: { en: 'The volume of a gas is cut to one-third of what it was. The temperature stays the same. The pressure…', es: 'El volumen de un gas se reduce a un tercio de lo que era. La temperatura no cambia. La presión…' },
      choices: [
        { en: 'triples', es: 'se triplica' },
        { en: 'drops to one-third', es: 'baja a un tercio' },
        { en: 'stays the same', es: 'se mantiene igual' },
        { en: 'doubles', es: 'se duplica' }
      ], correct: 0,
      explanation: { en: 'Inverse proportion: volume ÷ 3 → pressure × 3.', es: 'Proporción inversa: volumen ÷ 3 → presión × 3.' } },
    { id: 'q6',
      prompt: { en: 'A gas takes up 5.0 L at 1.0 atm. It is compressed to 1.0 L at the same temperature. What is the new pressure?', es: 'Un gas ocupa 5.0 L a 1.0 atm. Se comprime a 1.0 L a la misma temperatura. ¿Cuál es la nueva presión?' },
      choices: [
        { en: '0.20 atm', es: '0.20 atm' },
        { en: '1.0 atm', es: '1.0 atm' },
        { en: '5.0 atm', es: '5.0 atm' },
        { en: '25 atm', es: '25 atm' }
      ], correct: 2,
      explanation: { en: 'P₂ = P₁V₁ ÷ V₂ = (1.0)(5.0) ÷ 1.0 = 5.0 atm. Smaller volume → bigger pressure. (0.20 atm is the flipped fraction.)', es: 'P₂ = P₁V₁ ÷ V₂ = (1.0)(5.0) ÷ 1.0 = 5.0 atm. Menor volumen → mayor presión. (0.20 atm es la fracción al revés.)' } },
    { id: 'q7',
      prompt: { en: 'A gas takes up 3.0 L at 3.0 atm. The pressure is lowered to 1.0 atm at the same temperature. What is the new volume?', es: 'Un gas ocupa 3.0 L a 3.0 atm. La presión baja a 1.0 atm a la misma temperatura. ¿Cuál es el nuevo volumen?' },
      choices: [
        { en: '1.0 L', es: '1.0 L' },
        { en: '3.0 L', es: '3.0 L' },
        { en: '6.0 L', es: '6.0 L' },
        { en: '9.0 L', es: '9.0 L' }
      ], correct: 3,
      explanation: { en: 'V₂ = P₁V₁ ÷ P₂ = (3.0)(3.0) ÷ 1.0 = 9.0 L. Pressure ÷ 3 → volume × 3.', es: 'V₂ = P₁V₁ ÷ P₂ = (3.0)(3.0) ÷ 1.0 = 9.0 L. Presión ÷ 3 → volumen × 3.' } },
    { id: 'q8',
      prompt: { en: 'A capped syringe holds 20 mL of air at 1.0 atm. The plunger is pulled out to 80 mL. What is the new pressure?', es: 'Una jeringa tapada contiene 20 mL de aire a 1.0 atm. Se jala el émbolo hasta 80 mL. ¿Cuál es la nueva presión?' },
      choices: [
        { en: '4.0 atm', es: '4.0 atm' },
        { en: '0.25 atm', es: '0.25 atm' },
        { en: '1600 atm', es: '1600 atm' },
        { en: '0.50 atm', es: '0.50 atm' }
      ], correct: 1,
      explanation: { en: 'P₂ = (1.0)(20) ÷ 80 = 0.25 atm. The volume grew 4 times, so the pressure dropped to ¼.', es: 'P₂ = (1.0)(20) ÷ 80 = 0.25 atm. El volumen creció 4 veces, así que la presión bajó a ¼.' } },
    { id: 'q9',
      prompt: { en: 'Which situation can be solved with Boyle\'s law?', es: '¿Qué situación se puede resolver con la ley de Boyle?' },
      choices: [
        { en: 'A balloon is put in the freezer and shrinks.', es: 'Un globo se pone en el congelador y se encoge.' },
        { en: 'A sealed can is heated on a stove.', es: 'Una lata sellada se calienta en la estufa.' },
        { en: 'A sealed syringe at room temperature is slowly squeezed.', es: 'Una jeringa sellada a temperatura ambiente se aprieta lentamente.' },
        { en: 'More air is pumped into a basketball.', es: 'Se bombea más aire a un balón de baloncesto.' }
      ], correct: 2,
      explanation: { en: 'Boyle\'s law needs the temperature AND the amount of gas to stay the same while P and V change. The freezer and stove change temperature; pumping adds gas.', es: 'La ley de Boyle necesita que la temperatura Y la cantidad de gas no cambien mientras P y V cambian. El congelador y la estufa cambian la temperatura; bombear agrega gas.' } },
    { id: 'q10',
      prompt: { en: 'One sample of gas at one temperature: at 1.0 atm it takes up 18 L. At 6.0 atm, what volume will it take up?', es: 'Una muestra de gas a una temperatura: a 1.0 atm ocupa 18 L. A 6.0 atm, ¿qué volumen ocupará?' },
      choices: [
        { en: '108 L', es: '108 L' },
        { en: '3.0 L', es: '3.0 L' },
        { en: '12 L', es: '12 L' },
        { en: '0.33 L', es: '0.33 L' }
      ], correct: 1,
      explanation: { en: 'PV = (1.0)(18) = 18 atm·L for every condition. V = 18 ÷ 6.0 = 3.0 L.', es: 'PV = (1.0)(18) = 18 atm·L en todas las condiciones. V = 18 ÷ 6.0 = 3.0 L.' } },
    { id: 'q11',
      prompt: { en: 'A balloon holds 9.0 L of gas at 1.0 atm. It is taken underwater until its volume is 3.0 L. What is the pressure on the balloon now?', es: 'Un globo contiene 9.0 L de gas a 1.0 atm. Se lleva bajo el agua hasta que su volumen es 3.0 L. ¿Cuál es la presión sobre el globo ahora?' },
      choices: [
        { en: '0.33 atm', es: '0.33 atm' },
        { en: '27 atm', es: '27 atm' },
        { en: '6.0 atm', es: '6.0 atm' },
        { en: '3.0 atm', es: '3.0 atm' }
      ], correct: 3,
      explanation: { en: 'P₂ = (1.0)(9.0) ÷ 3.0 = 3.0 atm. Deeper water pushes harder, which is why the balloon shrinks.', es: 'P₂ = (1.0)(9.0) ÷ 3.0 = 3.0 atm. El agua más profunda empuja más fuerte, por eso el globo se encoge.' } },
    { id: 'q12',
      prompt: { en: 'A sealed bag of chips is driven up a mountain and puffs up. Which explanation is best?', es: 'Una bolsa sellada de papitas se lleva en carro a una montaña y se infla. ¿Cuál es la mejor explicación?' },
      choices: [
        { en: 'The air pressure outside the bag is lower up high, so the gas inside expands until the pressures match.', es: 'La presión del aire fuera de la bolsa es menor en lo alto, así que el gas de adentro se expande hasta que las presiones se igualan.' },
        { en: 'The chips release new gas at high altitude.', es: 'Las papitas liberan gas nuevo a gran altura.' },
        { en: 'The air pressure outside the bag is higher up high, so it pushes the bag out.', es: 'La presión del aire fuera de la bolsa es mayor en lo alto, así que empuja la bolsa hacia afuera.' },
        { en: 'Gas molecules get bigger at high altitude.', es: 'Las moléculas de gas se hacen más grandes a gran altura.' }
      ], correct: 0,
      explanation: { en: 'Same amount of gas, lower outside pressure → bigger volume (Boyle\'s law).', es: 'La misma cantidad de gas, menor presión afuera → mayor volumen (ley de Boyle).' } }
  ];

  const STATIC_SECTIONS = [
    // ---------------------------------------------------------------- 0
    {
      title: { en: 'Before You Begin', es: 'Antes de Empezar' },
      time: { en: '2 min', es: '2 min' },
      bodyHtml: {
        en: `
        <p>This activity practices <strong>Boyle\'s law</strong> from Lesson 58 (<em>Feeling Under Pressure</em>) — the syringe-and-scale lab — and gets you ready to solve problems with <strong>P₁V₁ = P₂V₂</strong>.</p>
        <div class="note-box"><span class="note-icon">📄</span><div class="note-text">Keep your <strong>Boyle\'s Law Practice worksheet</strong> next to you. Each section here matches a Part on the worksheet (look for the teal badge). Do the interactive part first, then record your answers on paper.</div></div>
        <p><strong>By the end, you should be able to:</strong></p>
        <ul class="objectives-list">
          <li><span class="obj-check">◎</span> Explain how gas pressure and gas volume are related (58.1)</li>
          <li><span class="obj-check">◎</span> Define an inversely proportional relationship (58.2)</li>
          <li><span class="obj-check">◎</span> State Boyle\'s law (58.3)</li>
          <li><span class="obj-check">◎</span> Identify a Boyle\'s law problem: the temperature and the amount of gas stay the same (58P.1)</li>
          <li><span class="obj-check">◎</span> Use P₁V₁ = P₂V₂ to find a new pressure or a new volume (58P.2)</li>
          <li><span class="obj-check">◎</span> Check whether an answer makes sense: smaller volume → bigger pressure (58P.3)</li>
        </ul>
        <p>The last section is a <strong>graded Check for Understanding</strong> — it saves your score and gives you a completion code to show your teacher.</p>`,
        es: `
        <p>Esta actividad practica la <strong>ley de Boyle</strong> de la Lección 58 (<em>Bajo Presión</em>) — el laboratorio de la jeringa y la báscula — y te prepara para resolver problemas con <strong>P₁V₁ = P₂V₂</strong>.</p>
        <div class="note-box"><span class="note-icon">📄</span><div class="note-text">Ten a la mano tu <strong>hoja de trabajo de Práctica de la Ley de Boyle</strong>. Cada sección aquí corresponde a una Parte de la hoja (busca la etiqueta turquesa). Haz primero la parte interactiva y luego anota tus respuestas en papel.</div></div>
        <p><strong>Al terminar, deberías poder:</strong></p>
        <ul class="objectives-list">
          <li><span class="obj-check">◎</span> Explicar cómo se relacionan la presión y el volumen de un gas (58.1)</li>
          <li><span class="obj-check">◎</span> Definir una relación inversamente proporcional (58.2)</li>
          <li><span class="obj-check">◎</span> Enunciar la ley de Boyle (58.3)</li>
          <li><span class="obj-check">◎</span> Identificar un problema de la ley de Boyle: la temperatura y la cantidad de gas no cambian (58P.1)</li>
          <li><span class="obj-check">◎</span> Usar P₁V₁ = P₂V₂ para encontrar una nueva presión o un nuevo volumen (58P.2)</li>
          <li><span class="obj-check">◎</span> Verificar si una respuesta tiene sentido: menor volumen → mayor presión (58P.3)</li>
        </ul>
        <p>La última sección es una <strong>Comprobación de Comprensión calificada</strong> — guarda tu puntaje y te da un código de finalización para mostrarle a tu maestro.</p>`
      }
    },
    // ---------------------------------------------------------------- 1 (Part A)
    {
      title: { en: 'Squeeze the Syringe', es: 'Aprieta la Jeringa' },
      time: { en: '8 min', es: '8 min' },
      bodyHtml: {
        en: `
        <span class="bl-ws-badge">${escapeHtml(t('worksheetBadge', 'en', 'A'))}</span>
        <h2>Remember the Syringe Lab?</h2>
        <p>In Lesson 58 you covered the tip of a syringe and pushed the plunger. It got harder and harder to push. This syringe is capped at 50 mL of air at 1.0 atm (14.7 lb/in²). Slide the plunger, watch the molecules, and <strong>record at least five readings</strong> — copy them into the Part A table on your worksheet.</p>
        <div id="bl-syringe-mount"></div>
        <div class="concept-box">
          <div class="concept-label">Boyle\'s Law</div>
          <p>The pressure of a given amount of gas is <strong>inversely proportional</strong> to its volume, if the temperature and amount of gas do not change. <strong>PV = k</strong>, or <strong>P = k / V</strong>.</p>
        </div>
        ${practiceProblem('en', 'a1', 'In the simulator, the air is squeezed from 50 mL to 25 mL. Without looking, what is the new pressure? What is P × V?', 'basic', 'Half the volume → ? the pressure.', 'Half the volume → double the pressure: 2.0 atm. P × V = 2.0 × 25 = 50 atm·mL, the same as at the start.')}`,
        es: `
        <span class="bl-ws-badge">${escapeHtml(t('worksheetBadge', 'es', 'A'))}</span>
        <h2>¿Recuerdas el Laboratorio de la Jeringa?</h2>
        <p>En la Lección 58 tapaste la punta de una jeringa y empujaste el émbolo. Cada vez era más difícil empujarlo. Esta jeringa está tapada con 50 mL de aire a 1.0 atm (14.7 lb/in²). Desliza el émbolo, observa las moléculas y <strong>registra al menos cinco lecturas</strong> — cópialas en la tabla de la Parte A de tu hoja de trabajo.</p>
        <div id="bl-syringe-mount"></div>
        <div class="concept-box">
          <div class="concept-label">Ley de Boyle</div>
          <p>La presión de una cantidad dada de gas es <strong>inversamente proporcional</strong> a su volumen, si la temperatura y la cantidad de gas no cambian. <strong>PV = k</strong>, o <strong>P = k / V</strong>.</p>
        </div>
        ${practiceProblem('es', 'a1', 'En el simulador, el aire se comprime de 50 mL a 25 mL. Sin mirar, ¿cuál es la nueva presión? ¿Cuánto es P × V?', 'basic', 'La mitad del volumen → ¿? la presión.', 'La mitad del volumen → el doble de presión: 2.0 atm. P × V = 2.0 × 25 = 50 atm·mL, igual que al inicio.')}`
      }
    },
    // ---------------------------------------------------------------- 2 (Part B)
    {
      title: { en: 'Predict First (No Calculator)', es: 'Predice Primero (Sin Calculadora)' },
      time: { en: '5 min', es: '5 min' },
      bodyHtml: {
        en: `
        <span class="bl-ws-badge">${escapeHtml(t('worksheetBadge', 'en', 'B'))}</span>
        <h2>Which Way, and How Many Times?</h2>
        <p>Before you calculate anything, you should be able to say <strong>which way</strong> the pressure moves and <strong>by how much</strong>. Compare the two volumes: if the volume gets 3 times smaller, the pressure gets 3 times bigger.</p>
        <div id="bl-predict-mount"></div>`,
        es: `
        <span class="bl-ws-badge">${escapeHtml(t('worksheetBadge', 'es', 'B'))}</span>
        <h2>¿Hacia Dónde, y Cuántas Veces?</h2>
        <p>Antes de calcular algo, deberías poder decir <strong>hacia dónde</strong> se mueve la presión y <strong>cuánto</strong>. Compara los dos volúmenes: si el volumen se hace 3 veces más pequeño, la presión se hace 3 veces más grande.</p>
        <div id="bl-predict-mount"></div>`
      }
    },
    // ---------------------------------------------------------------- 3 (Part C)
    {
      title: { en: 'PV Stays the Same', es: 'PV Se Mantiene Igual' },
      time: { en: '5 min', es: '5 min' },
      bodyHtml: {
        en: `
        <span class="bl-ws-badge">${escapeHtml(t('worksheetBadge', 'en', 'C'))}</span>
        <h2>One Gas, Many Conditions</h2>
        <p>For one sample of gas at one temperature, <strong>P × V is the same number every time</strong>. That is why you can set the "before" product equal to the "after" product.</p>
        <div id="bl-pv-mount"></div>
        <div class="concept-box">
          <div class="concept-label">The Working Equation</div>
          <p><strong>P₁V₁ = P₂V₂</strong> &nbsp;→&nbsp; find P₂: <strong>P₂ = P₁V₁ ÷ V₂</strong> &nbsp;·&nbsp; find V₂: <strong>V₂ = P₁V₁ ÷ P₂</strong></p>
        </div>`,
        es: `
        <span class="bl-ws-badge">${escapeHtml(t('worksheetBadge', 'es', 'C'))}</span>
        <h2>Un Gas, Muchas Condiciones</h2>
        <p>Para una muestra de gas a una temperatura, <strong>P × V es el mismo número cada vez</strong>. Por eso puedes igualar el producto de "antes" con el producto de "después".</p>
        <div id="bl-pv-mount"></div>
        <div class="concept-box">
          <div class="concept-label">La Ecuación de Trabajo</div>
          <p><strong>P₁V₁ = P₂V₂</strong> &nbsp;→&nbsp; para P₂: <strong>P₂ = P₁V₁ ÷ V₂</strong> &nbsp;·&nbsp; para V₂: <strong>V₂ = P₁V₁ ÷ P₂</strong></p>
        </div>`
      }
    },
    // ---------------------------------------------------------------- 4 (Part D)
    {
      title: { en: 'Solve It: Step by Step', es: 'Resuélvelo: Paso a Paso' },
      time: { en: '12 min', es: '12 min' },
      bodyHtml: {
        en: `
        <span class="bl-ws-badge">${escapeHtml(t('worksheetBadge', 'en', 'D'))}</span>
        <h2>The Recipe</h2>
        <div class="info-panel">
          <div class="panel-label">🔍 Worked Example</div>
          <p>A gas takes up 6.0 L at 1.0 atm and is squeezed to 3.0 L. <strong>1.</strong> Before: P₁ = 1.0 atm, V₁ = 6.0 L. After: P₂ = ?, V₂ = 3.0 L. <strong>2.</strong> Same temperature, same gas → Boyle\'s law. <strong>3.</strong> P₁V₁ = (1.0)(6.0) = 6.0 atm·L. <strong>4.</strong> P₂ = P₁V₁ ÷ V₂. <strong>5.</strong> P₂ = 6.0 ÷ 3.0 = 2.0 atm. <strong>6.</strong> Smaller volume → bigger pressure ✓</p>
        </div>
        <p>Problem 1 is guided. Problems 2–5 are on your own — write each one in the Before / After boxes in Part D of your worksheet and show your work.</p>
        <div id="bl-solver-mount"></div>`,
        es: `
        <span class="bl-ws-badge">${escapeHtml(t('worksheetBadge', 'es', 'D'))}</span>
        <h2>La Receta</h2>
        <div class="info-panel">
          <div class="panel-label">🔍 Ejemplo Resuelto</div>
          <p>Un gas ocupa 6.0 L a 1.0 atm y se comprime a 3.0 L. <strong>1.</strong> Antes: P₁ = 1.0 atm, V₁ = 6.0 L. Después: P₂ = ?, V₂ = 3.0 L. <strong>2.</strong> Misma temperatura, mismo gas → ley de Boyle. <strong>3.</strong> P₁V₁ = (1.0)(6.0) = 6.0 atm·L. <strong>4.</strong> P₂ = P₁V₁ ÷ V₂. <strong>5.</strong> P₂ = 6.0 ÷ 3.0 = 2.0 atm. <strong>6.</strong> Menor volumen → mayor presión ✓</p>
        </div>
        <p>El Problema 1 es guiado. Los Problemas 2–5 son por tu cuenta — escribe cada uno en las casillas Antes / Después de la Parte D de tu hoja de trabajo y muestra tu trabajo.</p>
        <div id="bl-solver-mount"></div>`
      }
    },
    // ---------------------------------------------------------------- 5 (Part E)
    {
      title: { en: 'Spot the Mistake', es: 'Encuentra el Error' },
      time: { en: '6 min', es: '6 min' },
      bodyHtml: {
        en: `
        <span class="bl-ws-badge">${escapeHtml(t('worksheetBadge', 'en', 'E'))}</span>
        <h2>The Classic Traps</h2>
        <ul>
          <li><strong>Flipping the fraction</strong> — writing P₁V₂ ÷ V₁ instead of P₁V₁ ÷ V₂.</li>
          <li><strong>Multiplying instead of dividing</strong> by the "after" value.</li>
          <li><strong>Using Boyle\'s law when the temperature changes.</strong></li>
          <li><strong>Getting the direction backwards</strong> when explaining.</li>
        </ul>
        <p>Each solution below has exactly one line with a mistake. Click it, read why, then explain it in your own words in Part E.</p>
        <div id="bl-spot-mount"></div>`,
        es: `
        <span class="bl-ws-badge">${escapeHtml(t('worksheetBadge', 'es', 'E'))}</span>
        <h2>Las Trampas Clásicas</h2>
        <ul>
          <li><strong>Voltear la fracción</strong> — escribir P₁V₂ ÷ V₁ en vez de P₁V₁ ÷ V₂.</li>
          <li><strong>Multiplicar en vez de dividir</strong> entre el valor de "después".</li>
          <li><strong>Usar la ley de Boyle cuando la temperatura cambia.</strong></li>
          <li><strong>Explicar la dirección al revés.</strong></li>
        </ul>
        <p>Cada solución de abajo tiene exactamente una línea con un error. Haz clic en ella, lee por qué y luego explícalo con tus propias palabras en la Parte E.</p>
        <div id="bl-spot-mount"></div>`
      }
    }
  ];

  function render(host, ctx) {
    ensureStylesInjected();
    const lang = getLang();

    const sectionsHtml = STATIC_SECTIONS.map((sec, i) => `
      <div class="section-card" id="bl-sec-${i}">
        <div class="section-header" data-toggle="${i}">
          <span class="section-num">${i === 0 ? '★' : String(i).padStart(2, '0')}</span>
          <span class="section-title">${escapeHtml(tr(sec.title, lang))}</span>
          <span class="section-time">${escapeHtml(tr(sec.time, lang))}</span>
          <span class="section-arrow">▼</span>
        </div>
        <div class="bl-lock-note"></div>
        <div class="section-body">
          ${tr(sec.bodyHtml, lang)}
          <button type="button" class="mark-done-btn" data-mark-done="${i}">${escapeHtml(t('markSectionComplete', lang))}</button>
        </div>
      </div>`).join('');

    host.innerHTML = `
      <div class="bl-lesson">
        <div class="bl-header">
          <div class="bl-lang-toggle" role="group" aria-label="${escapeHtml(t('langToggleAria', lang))}">
            <button type="button" class="bl-lang-btn${lang === 'en' ? ' active' : ''}" data-lang="en">EN</button>
            <button type="button" class="bl-lang-btn${lang === 'es' ? ' active' : ''}" data-lang="es">ES</button>
          </div>
          <div class="bl-header-label">${escapeHtml(t('headerLabel', lang))}</div>
          <h1>${escapeHtml(ctx.activity.title)}</h1>
          <div class="bl-header-meta">${escapeHtml(t('headerMeta', lang))}</div>
        </div>
        <div class="bl-progress-wrap">
          <span class="bl-progress-label">${escapeHtml(t('progress', lang))}</span>
          <div class="bl-progress-track"><div class="bl-progress-fill" id="bl-progress-fill"></div></div>
          <span class="bl-progress-count" id="bl-progress-count">${escapeHtml(t('sectionCount', lang, 0, SECTION_COUNT))}</span>
        </div>
        <main>
          ${sectionsHtml}
          <div class="section-card" id="bl-sec-${SECTION_COUNT - 1}">
            <div class="section-header" data-toggle="${SECTION_COUNT - 1}">
              <span class="section-num">✓</span>
              <span class="section-title">${escapeHtml(t('checkForUnderstanding', lang))}</span>
              <span class="section-time">${escapeHtml(t('quizTimeGraded', lang))}</span>
              <span class="section-arrow">▼</span>
            </div>
            <div class="bl-lock-note"></div>
            <div class="section-body">
              <div class="quiz-note">${t('quizNote', lang)}</div>
              <div id="bl-quiz-mount"></div>
            </div>
          </div>
        </main>
      </div>`;

    const root = host.querySelector('.bl-lesson');
    const quizIndex = SECTION_COUNT - 1;
    const sectionTitle = (i) => i === quizIndex ? t('checkForUnderstanding', lang) : tr(STATIC_SECTIONS[i].title, lang);

    // Sections unlock in order: section i opens only after section i-1 is
    // marked complete. Which sections are done is remembered in this browser
    // per student (the progress record only holds quiz data). A student who
    // has already started or finished the graded check has every section
    // unlocked, so a new device never locks them out of their own work.
    const progress = ctx.getProgress();
    const quizStarted = !!(progress && (progress.status === 'in_progress' || progress.status === 'completed'));
    const completed = loadSectionsDone(ctx);
    if (quizStarted) for (let i = 0; i < quizIndex; i++) completed[i] = true;
    if (progress && progress.status === 'completed') completed[quizIndex] = true;
    const isUnlocked = (i) => i === 0 || completed[i - 1];
    const pkey = sectionsKey(ctx);
    const widgetProg = WIDGET_PROGRESS[pkey] = WIDGET_PROGRESS[pkey] || {};
    const doneCount = (i) => Math.min((widgetProg[i] || []).length, SECTION_REQS[i] ? SECTION_REQS[i].total : 0);

    function updateProgress() {
      const done = completed.filter(Boolean).length;
      root.querySelector('#bl-progress-fill').style.width = Math.round((done / SECTION_COUNT) * 100) + '%';
      root.querySelector('#bl-progress-count').textContent = t('sectionCount', lang, done, SECTION_COUNT);
    }
    function applyLocks() {
      for (let i = 0; i < SECTION_COUNT; i++) {
        const card = root.querySelector(`#bl-sec-${i}`);
        const locked = !isUnlocked(i);
        card.classList.toggle('locked', locked);
        card.classList.toggle('done', !!completed[i] && i !== quizIndex);
        card.querySelector('.section-header').setAttribute('aria-disabled', locked ? 'true' : 'false');
        if (locked) {
          card.querySelector('.section-body').classList.remove('open');
          card.querySelector('.section-header').classList.remove('open');
        } else {
          card.querySelector('.bl-lock-note').classList.remove('show');
        }
        const btn = card.querySelector('[data-mark-done]');
        if (!btn) continue;
        if (completed[i]) { btn.textContent = t('sectionComplete', lang); btn.disabled = true; continue; }
        const req = SECTION_REQS[i];
        const d = req ? doneCount(i) : 0;
        if (req && d < req.total) {
          btn.textContent = t('finishFirst', lang, d, req.total, tr(req.what, lang));
          btn.disabled = true;
        } else {
          btn.textContent = t('markSectionComplete', lang);
          btn.disabled = false;
        }
      }
    }
    function openSection(i, scroll) {
      const card = root.querySelector(`#bl-sec-${i}`);
      if (!card || !isUnlocked(i)) return;
      card.querySelector('.section-body').classList.add('open');
      card.querySelector('.section-header').classList.add('open');
      if (scroll) card.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    root.querySelectorAll('[data-toggle]').forEach(el => el.addEventListener('click', () => {
      const i = Number(el.getAttribute('data-toggle'));
      const card = root.querySelector(`#bl-sec-${i}`);
      if (!isUnlocked(i)) {
        const note = card.querySelector('.bl-lock-note');
        note.textContent = t('lockedNote', lang, sectionTitle(i - 1));
        note.classList.add('show');
        return;
      }
      const open = !card.querySelector('.section-body').classList.contains('open');
      card.querySelector('.section-body').classList.toggle('open', open);
      card.querySelector('.section-header').classList.toggle('open', open);
    }));
    root.querySelectorAll('[data-mark-done]').forEach(btn => btn.addEventListener('click', () => {
      const i = Number(btn.getAttribute('data-mark-done'));
      if (completed[i]) return;
      if (SECTION_REQS[i] && doneCount(i) < SECTION_REQS[i].total) return;
      completed[i] = true;
      saveSectionsDone(ctx, completed);
      applyLocks();
      updateProgress();
      setTimeout(() => openSection(i + 1, true), 250);
    }));
    root.querySelectorAll('[data-hint-target]').forEach(btn => btn.addEventListener('click', () => {
      const open = root.querySelector('#' + btn.getAttribute('data-hint-target')).classList.toggle('open');
      btn.textContent = open ? t('hintHide', lang) : t('hintShow', lang);
    }));
    root.querySelectorAll('[data-answer-target]').forEach(btn => btn.addEventListener('click', () => {
      const open = root.querySelector('#' + btn.getAttribute('data-answer-target')).classList.toggle('open');
      btn.textContent = open ? t('hideAnswer', lang) : t('revealAnswer', lang);
    }));
    root.querySelectorAll('[data-lang]').forEach(btn => btn.addEventListener('click', () => {
      const newLang = btn.getAttribute('data-lang');
      if (newLang === lang) return;
      setLang(newLang);
      render(host, ctx); // progress lives in ctx.getProgress(), untouched by language
    }));

    Object.keys(SECTION_REQS).forEach(k => {
      const i = Number(k), req = SECTION_REQS[i];
      const m = root.querySelector(req.sel);
      if (!m) return;
      // Each widget reports the item it just finished (a volume, a problem
      // number...). Counting distinct items means progress only moves forward
      // ("Clear table" doesn't undo it) and survives a language switch.
      req.fn()(m, lang, (item) => {
        const list = widgetProg[i] = widgetProg[i] || [];
        if (list.indexOf(item) !== -1) return;
        list.push(item);
        applyLocks();
      });
    });

    renderQuiz(root.querySelector('#bl-quiz-mount'), ctx);

    applyLocks();
    if (quizStarted) {
      openSection(quizIndex, false);
    } else {
      // Pick up where they left off: the first section not yet marked complete.
      const next = completed.findIndex(d => !d);
      openSection(next === -1 ? 0 : next, false);
    }
    updateProgress();
  }

  // What a student must finish in each section before Mark Section Complete
  // works. Section 0 (intro) has no requirement. Counts come from the widgets.
  const SECTION_REQS = {
    1: { sel: '#bl-syringe-mount', fn: () => renderSyringeWidget, total: 5, what: { en: 'record 5 different readings', es: 'registra 5 lecturas diferentes' } },
    2: { sel: '#bl-predict-mount', fn: () => renderPredictWidget, total: 8, what: { en: 'answer all 8 changes', es: 'responde los 8 cambios' } },
    3: { sel: '#bl-pv-mount', fn: () => renderPvTable, total: 5, what: { en: 'complete all 5 rows', es: 'completa las 5 filas' } },
    4: { sel: '#bl-solver-mount', fn: () => renderBoyleSolver, total: 5, what: { en: 'solve all 5 problems', es: 'resuelve los 5 problemas' } },
    5: { sel: '#bl-spot-mount', fn: () => renderSpotMistake, total: 4, what: { en: 'find all 4 mistakes', es: 'encuentra los 4 errores' } }
  };
  // Widget progress for the current page visit, kept across a language
  // switch (which re-renders everything). Not saved: a reload mid-section
  // means redoing that section's activity.
  const WIDGET_PROGRESS = {};

  const SECTIONS_KEY = 'ionicstorm_sections_v1';
  function sectionsKey(ctx) {
    const st = ctx.student || {};
    return [ctx.activity.id, st.name || '', st.period || ''].join('|').toLowerCase();
  }
  function loadSectionsDone(ctx) {
    const done = new Array(SECTION_COUNT).fill(false);
    try {
      const saved = (JSON.parse(localStorage.getItem(SECTIONS_KEY) || '{}'))[sectionsKey(ctx)] || [];
      saved.forEach(i => { if (i >= 0 && i < SECTION_COUNT - 1) done[i] = true; });
    } catch (e) { /* storage unavailable: start locked, still usable */ }
    return done;
  }
  function saveSectionsDone(ctx, completed) {
    try {
      const all = JSON.parse(localStorage.getItem(SECTIONS_KEY) || '{}');
      all[sectionsKey(ctx)] = completed.map((d, i) => d ? i : -1).filter(i => i >= 0 && i < SECTION_COUNT - 1);
      localStorage.setItem(SECTIONS_KEY, JSON.stringify(all));
    } catch (e) { /* not fatal */ }
  }

  function renderQuiz(mount, ctx) {
    const progress = ctx.getProgress();
    if (progress && progress.status === 'completed') { renderQuizSummary(mount, ctx); return; }
    const answers = (progress && progress.answers) || [];
    if (answers.length >= QUESTIONS.length) { finishQuiz(mount, ctx, answers); return; }
    renderQuizQuestion(mount, ctx, answers, answers.length);
  }

  function renderQuizQuestion(mount, ctx, answersSoFar, index) {
    const lang = getLang();
    const q = QUESTIONS[index];
    mount.innerHTML = `
      <div class="quiz-question-count">${escapeHtml(t('questionCount', lang, index + 1, QUESTIONS.length))}</div>
      <div class="quiz-progress-bar"><div class="quiz-progress-fill" style="width:${Math.round((index / QUESTIONS.length) * 100)}%"></div></div>
      <p class="quiz-prompt">${escapeHtml(tr(q.prompt, lang))}</p>
      <div data-answers>${q.choices.map((c, i) => `<button type="button" class="bl-choice" data-choice="${i}">${escapeHtml(tr(c, lang))}</button>`).join('')}</div>
      <div data-feedback></div>
      <button type="button" class="bl-next-btn" data-next style="display:none;">${escapeHtml(t('nextQuestion', lang))}</button>`;
    const area = mount.querySelector('[data-answers]');
    const nextBtn = mount.querySelector('[data-next]');
    let submitted = false;
    area.querySelectorAll('.bl-choice').forEach(btn => btn.addEventListener('click', () => {
      if (submitted) return;
      submitted = true;
      const response = Number(btn.getAttribute('data-choice'));
      const correct = response === q.correct;
      area.querySelectorAll('.bl-choice').forEach(el => {
        el.disabled = true;
        const val = Number(el.getAttribute('data-choice'));
        if (val === q.correct) el.classList.add('selected-correct');
        else if (el === btn) el.classList.add('selected-incorrect');
      });
      mount.querySelector('[data-feedback]').innerHTML = `<div class="bl-feedback ${correct ? 'correct' : 'incorrect'}">${escapeHtml(t(correct ? 'correctPrefix' : 'incorrectPrefix', lang))} ${escapeHtml(tr(q.explanation, lang))}</div>`;
      nextBtn.style.display = 'inline-block';
      const answers = answersSoFar.concat([{ questionId: q.id, response, correct }]);
      ctx.saveProgress({ status: 'in_progress', score: answers.filter(a => a.correct).length, totalQuestions: QUESTIONS.length, answers });
    }));
    nextBtn.addEventListener('click', () => renderQuiz(mount, ctx));
  }

  async function finishQuiz(mount, ctx, answers) {
    await ctx.saveProgress({ status: 'completed', score: answers.filter(a => a.correct).length, totalQuestions: QUESTIONS.length, answers });
    renderQuizSummary(mount, ctx);
  }

  function renderQuizSummary(mount, ctx) {
    const lang = getLang();
    const progress = ctx.getProgress();
    const score = progress ? progress.score : 0;
    const code = progress && progress.code ? progress.code : '';
    const total = QUESTIONS.length;
    mount.innerHTML = `
      <div class="bl-summary">
        <div class="bl-score">${score} / ${total}</div>
        ${code
          ? `<p class="bl-code-label">${escapeHtml(t('completionCode', lang))}</p><div class="bl-code">${escapeHtml(code)}</div>`
          : `<p><button type="button" class="bl-retake-btn" data-showcode>${escapeHtml(t('showMyCode', lang))}</button></p>`}
        <p>${escapeHtml(t('summaryText', lang))}</p>
        <button type="button" class="bl-retake-btn" data-retake>${escapeHtml(t('retakeQuiz', lang))}</button>
      </div>`;
    const showCodeBtn = mount.querySelector('[data-showcode]');
    if (showCodeBtn) showCodeBtn.addEventListener('click', async () => {
      showCodeBtn.disabled = true;
      await ctx.saveProgress(Object.assign({}, progress)); // re-saving a completed record mints a code
      renderQuizSummary(mount, ctx);
    });
    mount.querySelector('[data-retake]').addEventListener('click', async () => {
      await ctx.saveProgress({ status: 'in_progress', score: 0, totalQuestions: total, answers: [] });
      renderQuiz(mount, ctx);
    });
  }

  window.Activities = window.Activities || {};
  window.Activities['boyles-law-practice'] = { render };
})();
