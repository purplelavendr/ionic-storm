// "Chapter 2 Review: Basic Building Materials" (registered as CONTENT activity id
// 'elements-review'). Same accordion + graded-quiz shape as matter-review.js:
// concept -> analogy -> practice with hints, ending in a graded "Check for
// Understanding" quiz. Only the quiz's score is saved via ctx.saveProgress.
//
// Supports an EN/ES language toggle (see LANG_KEY below). This only affects
// this activity's own display text -- grading is always based on the
// answer's positional index (QUESTIONS[i].correct), never on which
// language's text is shown, so translation can never affect correctness.
(function () {
  const QUESTIONS = [
    {
      id: 'q1', type: 'mc',
      prompt: { en: 'What is an element?', es: '¿Qué es un elemento?' },
      choices: [
        { en: 'A pure substance that cannot be broken down into simpler substances through chemical processes', es: 'Una sustancia pura que no se puede descomponer en sustancias más simples mediante procesos químicos' },
        { en: 'Any substance made of two or more materials mixed together', es: 'Cualquier sustancia hecha de dos o más materiales mezclados' },
        { en: 'A substance that is always a gas at room temperature', es: 'Una sustancia que siempre es un gas a temperatura ambiente' },
        { en: 'Any chemical formula with a subscript in it', es: 'Cualquier fórmula química que tenga un subíndice' }
      ],
      correct: 0,
      explanation: { en: 'An element is a unique substance that can’t be broken down further through chemical processes — the building materials of all matter.', es: 'Un elemento es una sustancia única que no se puede descomponer más mediante procesos químicos — los materiales de construcción de toda la materia.' }
    },
    {
      id: 'q2', type: 'mc',
      prompt: { en: 'What is a compound?', es: '¿Qué es un compuesto?' },
      choices: [
        { en: 'Another name for an element', es: 'Otro nombre para un elemento' },
        { en: 'A pure substance that is a chemical combination of two or more elements in a fixed ratio', es: 'Una sustancia pura que es una combinación química de dos o más elementos en una proporción fija' },
        { en: 'Any liquid mixture', es: 'Cualquier mezcla líquida' },
        { en: 'A substance with only one atom', es: 'Una sustancia con un solo átomo' }
      ],
      correct: 1,
      explanation: { en: 'A compound is two or more elements chemically combined in a fixed ratio, represented by a chemical formula.', es: 'Un compuesto es dos o más elementos combinados químicamente en una proporción fija, representado por una fórmula química.' }
    },
    {
      id: 'q3', type: 'mc',
      prompt: { en: 'Based on its formula alone, which of these is an element?', es: 'Basándote solo en su fórmula, ¿cuál de estos es un elemento?' },
      choices: ['H₂O', 'NaCl', 'Mn', 'CO₂'],
      correct: 2,
      explanation: { en: 'Mn (manganese) is a single chemical symbol — no other elements combined with it — so it’s an element, not a compound.', es: 'Mn (manganeso) es un solo símbolo químico — no tiene otros elementos combinados con él — así que es un elemento, no un compuesto.' }
    },
    {
      id: 'q4', type: 'mc',
      prompt: { en: 'How should a two-letter chemical symbol be written?', es: '¿Cómo se debe escribir un símbolo químico de dos letras?' },
      choices: [
        { en: 'Both letters uppercase', es: 'Ambas letras en mayúscula' },
        { en: 'Both letters lowercase', es: 'Ambas letras en minúscula' },
        { en: 'First letter uppercase, second letter lowercase', es: 'Primera letra en mayúscula, segunda letra en minúscula' },
        { en: 'First letter lowercase, second letter uppercase', es: 'Primera letra en minúscula, segunda letra en mayúscula' }
      ],
      correct: 2,
      explanation: { en: 'Chemical symbols always capitalize only the first letter — e.g. Zn, not ZN or zn.', es: 'Los símbolos químicos siempre tienen en mayúscula solo la primera letra — por ejemplo, Zn, no ZN ni zn.' }
    },
    {
      id: 'q5', type: 'mc',
      prompt: { en: 'What does the label (aq) mean on a chemical formula?', es: '¿Qué significa la etiqueta (aq) en una fórmula química?' },
      choices: [
        { en: 'The substance is a gas', es: 'La sustancia es un gas' },
        { en: 'The substance is dissolved in water', es: 'La sustancia está disuelta en agua' },
        { en: 'The substance is radioactive', es: 'La sustancia es radiactiva' },
        { en: 'The substance is a solid crystal', es: 'La sustancia es un cristal sólido' }
      ],
      correct: 1,
      explanation: { en: '(aq) stands for "aqueous" — the substance is dissolved in water.', es: '(aq) significa "acuoso" — la sustancia está disuelta en agua.' }
    },
    {
      id: 'q6', type: 'mc',
      prompt: { en: 'A bottle is labeled MgCl₂(aq). What should you expect to find inside?', es: 'Una botella está etiquetada MgCl₂(aq). ¿Qué deberías esperar encontrar adentro?' },
      choices: [
        { en: 'A clear, colorless gas', es: 'Un gas claro e incoloro' },
        { en: 'Dry crystals or powder, not dissolved in anything', es: 'Cristales secos o polvo, no disuelto en nada' },
        { en: 'The compound dissolved in water — a liquid solution', es: 'El compuesto disuelto en agua — una solución líquida' },
        { en: 'A solid block of magnesium metal', es: 'Un bloque sólido de metal de magnesio' }
      ],
      correct: 2,
      explanation: { en: 'The (aq) tells you it’s aqueous — dissolved in water — so you’d see a liquid solution, not dry crystals.', es: 'El (aq) te dice que es acuoso — disuelto en agua — así que verías una solución líquida, no cristales secos.' }
    },
    {
      id: 'q7', type: 'mc',
      prompt: { en: 'What is the Law of Conservation of Mass?', es: '¿Qué es la Ley de Conservación de la Masa?' },
      choices: [
        { en: 'Mass increases every time a chemical reaction happens', es: 'La masa aumenta cada vez que ocurre una reacción química' },
        { en: 'Mass cannot be created or destroyed in a chemical reaction', es: 'La masa no se puede crear ni destruir en una reacción química' },
        { en: 'Mass and volume are always equal', es: 'La masa y el volumen siempre son iguales' },
        { en: 'Only gases have mass during a reaction', es: 'Solo los gases tienen masa durante una reacción' }
      ],
      correct: 1,
      explanation: { en: 'The Law of Conservation of Mass states that matter (and its mass) cannot be created or destroyed in a chemical reaction — only rearranged.', es: 'La Ley de Conservación de la Masa establece que la materia (y su masa) no se puede crear ni destruir en una reacción química — solo se reorganiza.' }
    },
    {
      id: 'q8', type: 'mc',
      prompt: { en: 'In the copper cycle lab, copper changed color and form several times, but its mass at the end was about the same as at the start. What does this show?', es: 'En el laboratorio del ciclo del cobre, el cobre cambió de color y forma varias veces, pero su masa al final fue aproximadamente la misma que al principio. ¿Qué demuestra esto?' },
      choices: [
        { en: 'Copper was destroyed and a new element was created', es: 'El cobre fue destruido y se creó un nuevo elemento' },
        { en: 'Copper can combine and recombine into different compounds without being created or destroyed', es: 'El cobre puede combinarse y recombinarse en diferentes compuestos sin ser creado ni destruido' },
        { en: 'The scale was broken', es: 'La balanza estaba rota' },
        { en: 'Copper turned into gold', es: 'El cobre se convirtió en oro' }
      ],
      correct: 1,
      explanation: { en: 'Elements combine and recombine during chemical changes, but they are not created or destroyed — evidence for the law of conservation of mass.', es: 'Los elementos se combinan y recombinan durante los cambios químicos, pero no se crean ni se destruyen — evidencia de la ley de conservación de la masa.' }
    },
    {
      id: 'q9', type: 'mc',
      prompt: { en: 'KI(aq) is added to Pb(NO₃)₂(aq). The reaction produces KNO₃(aq) and a new solid. Which is most likely the solid product?', es: 'Se agrega KI(aq) a Pb(NO₃)₂(aq). La reacción produce KNO₃(aq) y un nuevo sólido. ¿Cuál es más probable que sea el producto sólido?' },
      choices: [
        { en: 'KI(aq), since it was one of the starting substances', es: 'KI(aq), ya que fue una de las sustancias iniciales' },
        { en: 'Pb(NO₃)₂(aq), since it was one of the starting substances', es: 'Pb(NO₃)₂(aq), ya que fue una de las sustancias iniciales' },
        { en: 'A new compound formed from the reactants, appearing as a solid — like PbI₂(s)', es: 'Un nuevo compuesto formado a partir de los reactivos, apareciendo como sólido — como PbI₂(s)' },
        { en: 'KNO₃(aq), since a reaction happened', es: 'KNO₃(aq), ya que ocurrió una reacción' }
      ],
      correct: 2,
      explanation: { en: 'A solid forming out of two dissolved (aq) solutions means a brand-new, insoluble compound formed — here, PbI₂(s). The reactants themselves are listed as (aq), not (s).', es: 'Que se forme un sólido a partir de dos soluciones disueltas (aq) significa que se formó un compuesto completamente nuevo e insoluble — aquí, PbI₂(s). Los reactivos mismos están listados como (aq), no como (s).' }
    },
    {
      id: 'q10', type: 'mc',
      prompt: { en: 'Mendeleev organized his periodic table based on which two properties?', es: '¿Mendeléyev organizó su tabla periódica basándose en qué dos propiedades?' },
      choices: [
        { en: 'Color and smell', es: 'El color y el olor' },
        { en: 'Reactivity and atomic mass', es: 'La reactividad y la masa atómica' },
        { en: 'Melting point and price', es: 'El punto de fusión y el precio' },
        { en: 'Alphabetical order', es: 'El orden alfabético' }
      ],
      correct: 1,
      explanation: { en: 'Mendeleev arranged elements by reactivity and atomic mass — an arrangement that even predicted undiscovered elements.', es: 'Mendeléyev organizó los elementos por reactividad y masa atómica — un arreglo que incluso predijo elementos aún no descubiertos.' }
    },
    {
      id: 'q11', type: 'mc',
      prompt: { en: 'What is atomic mass?', es: '¿Qué es la masa atómica?' },
      choices: [
        { en: 'The number of protons in an atom', es: 'El número de protones en un átomo' },
        { en: 'The mass of a single atom (or isotope) of an element', es: 'La masa de un solo átomo (o isótopo) de un elemento' },
        { en: 'The number of elements in a compound', es: 'El número de elementos en un compuesto' },
        { en: 'The temperature at which an element melts', es: 'La temperatura a la que se funde un elemento' }
      ],
      correct: 1,
      explanation: { en: 'Atomic mass is the mass of a single atom (or isotope) of an element, usually shown as a decimal on the periodic table.', es: 'La masa atómica es la masa de un solo átomo (o isótopo) de un elemento, generalmente mostrada como un decimal en la tabla periódica.' }
    },
    {
      id: 'q12', type: 'mc',
      prompt: { en: 'What is atomic number?', es: '¿Qué es el número atómico?' },
      choices: [
        { en: 'The number of protons in an atom’s nucleus', es: 'El número de protones en el núcleo de un átomo' },
        { en: 'The mass of the whole atom', es: 'La masa de todo el átomo' },
        { en: 'The number of compounds an element can form', es: 'El número de compuestos que un elemento puede formar' },
        { en: 'The group number on the periodic table', es: 'El número de grupo en la tabla periódica' }
      ],
      correct: 0,
      explanation: { en: 'Atomic number equals the number of protons in an atom’s nucleus — it’s what an element’s identity is based on.', es: 'El número atómico es igual al número de protones en el núcleo de un átomo — es en lo que se basa la identidad de un elemento.' }
    },
    {
      id: 'q13', type: 'mc',
      prompt: { en: 'A vertical column on the periodic table is called a:', es: 'Una columna vertical en la tabla periódica se llama:' },
      choices: [
        { en: 'Period', es: 'Un período' },
        { en: 'Group', es: 'Un grupo' },
        { en: 'Phase', es: 'Una fase' },
        { en: 'Family reunion', es: 'Una reunión familiar' }
      ],
      correct: 1,
      explanation: { en: 'A vertical column is a group — elements in the same group share similar properties.', es: 'Una columna vertical es un grupo — los elementos del mismo grupo comparten propiedades similares.' }
    },
    {
      id: 'q14', type: 'mc',
      prompt: { en: 'A horizontal row on the periodic table is called a:', es: 'Una fila horizontal en la tabla periódica se llama:' },
      choices: [
        { en: 'Group', es: 'Un grupo' },
        { en: 'Period', es: 'Un período' },
        { en: 'Series', es: 'Una serie' },
        { en: 'Column', es: 'Una columna' }
      ],
      correct: 1,
      explanation: { en: 'A horizontal row is a period.', es: 'Una fila horizontal es un período.' }
    },
    {
      id: 'q15', type: 'mc',
      prompt: { en: 'The elements in Group 7A are called the:', es: 'Los elementos del Grupo 7A se llaman:' },
      choices: [
        { en: 'Alkali metals', es: 'Metales alcalinos' },
        { en: 'Alkaline earth metals', es: 'Metales alcalinotérreos' },
        { en: 'Halogens', es: 'Halógenos' },
        { en: 'Noble gases', es: 'Gases nobles' }
      ],
      correct: 2,
      explanation: { en: 'Group 7A elements are the halogens.', es: 'Los elementos del Grupo 7A son los halógenos.' }
    },
    {
      id: 'q16', type: 'mc',
      prompt: { en: 'The elements in Group 8A are called the noble gases. Why "noble"?', es: 'Los elementos del Grupo 8A se llaman gases nobles. ¿Por qué "nobles"?' },
      choices: [
        { en: 'They are the heaviest elements', es: 'Son los elementos más pesados' },
        { en: 'They are not reactive', es: 'No son reactivos' },
        { en: 'They were discovered by royalty', es: 'Fueron descubiertos por la realeza' },
        { en: 'They are only found in outer space', es: 'Solo se encuentran en el espacio exterior' }
      ],
      correct: 1,
      explanation: { en: 'They’re called "noble" gases because they are not reactive — they don’t readily combine with other elements.', es: 'Se llaman gases "nobles" porque no son reactivos — no se combinan fácilmente con otros elementos.' }
    },
    {
      id: 'q17', type: 'mc',
      prompt: { en: 'Where are metalloids found on the periodic table?', es: '¿Dónde se encuentran los metaloides en la tabla periódica?' },
      choices: [
        { en: 'Scattered randomly throughout', es: 'Dispersos al azar por toda la tabla' },
        { en: 'Only in the two bottom rows (lanthanides and actinides)', es: 'Solo en las dos filas inferiores (lantánidos y actínidos)' },
        { en: 'Along the stair-step line, between the metals and nonmetals', es: 'A lo largo de la línea escalonada, entre los metales y los no metales' },
        { en: 'Only in Group 1A', es: 'Solo en el Grupo 1A' }
      ],
      correct: 2,
      explanation: { en: 'Metalloids sit along the stair-step line, with properties between metals and nonmetals.', es: 'Los metaloides se ubican a lo largo de la línea escalonada, con propiedades entre los metales y los no metales.' }
    }
  ];

  const STYLE_ID = 'el-lesson-styles';
  const FONT_LINK_ID = 'el-lesson-fonts';
  const SECTION_COUNT = 7; // sections 0-6 (6 content sections + the graded quiz)

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  // ---- Translation (EN/ES) ----
  // LANG_KEY is a shared literal string: matter-review.js uses the exact
  // same key (each file owns its own copy of this small helper block rather
  // than a shared module, matching this codebase's convention), so picking
  // a language in one review carries over to the other automatically.
  const LANG_KEY = 'ionicstorm_lang_v1';

  function getLang() {
    return localStorage.getItem(LANG_KEY) === 'es' ? 'es' : 'en';
  }
  function setLang(lang) {
    localStorage.setItem(LANG_KEY, lang === 'es' ? 'es' : 'en');
  }
  function tr(field, lang) {
    return (field && typeof field === 'object') ? (field[lang] || field.en) : field;
  }
  function t(key, lang, ...args) {
    const entry = STRINGS[key] || {};
    const val = entry[lang] || entry.en;
    return typeof val === 'function' ? val(...args) : val;
  }

  const DIFF_LABELS = {
    en: { basic: 'Basic', medium: 'Medium', challenge: 'Challenge' },
    es: { basic: 'Básico', medium: 'Medio', challenge: 'Desafío' }
  };

  const STRINGS = {
    headerLabel: { en: 'Chapter 2 · Basic Building Materials', es: 'Capítulo 2 · Materiales Básicos de Construcción' },
    headerMeta: { en: 'Self-Paced Review · ~40 Minutes · Good prep for Quiz A/B', es: 'Repaso a tu Propio Ritmo · ~40 Minutos · Buena preparación para el Quiz A/B' },
    langToggleAria: { en: 'Language', es: 'Idioma' },
    progress: { en: 'Progress', es: 'Progreso' },
    sectionCount: { en: (done, total) => `${done} / ${total} sections`, es: (done, total) => `${done} / ${total} secciones` },
    checkForUnderstanding: { en: 'Check for Understanding', es: 'Comprobación de Comprensión' },
    quizTimeGraded: { en: '15 min · graded', es: '15 min · calificado' },
    quizNote: {
      en: 'Unlike the sections above, this quiz <strong>saves your score</strong> and reports it to your teacher. You can retake it any time — your most recent attempt is what\'s saved.',
      es: 'A diferencia de las secciones anteriores, este quiz <strong>guarda tu puntaje</strong> y se lo reporta a tu maestro. Puedes volver a hacerlo en cualquier momento — se guarda tu intento más reciente.'
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
    retakeQuiz: { en: 'Retake Quiz', es: 'Repetir el Quiz' },
    summaryText: {
      en: 'Nice work! You can retake this any time — your most recent attempt is what\'s saved and sent to your teacher.',
      es: '¡Buen trabajo! Puedes repetirlo en cualquier momento — se guarda y se envía a tu maestro tu intento más reciente.'
    }
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
.el-lesson {
  --navy: #0d1b2a;
  --navy-mid: #1b2d42;
  --navy-light: #253a52;
  --teal: #2ec4b6;
  --teal-dim: #1a8c83;
  --amber: #f4a261;
  --cream: #f7f3ec;
  --cream-dark: #ede8df;
  --text: #1a1a2e;
  --text-muted: #5a6475;
  --note-bg: #fff8e7;
  --note-border: #f4a261;
  --correct-bg: #e8f8f5;
  --correct-border: #2ec4b6;
  font-family: 'Source Serif 4', Georgia, serif;
  color: var(--text);
  font-size: 17px;
  line-height: 1.7;
  background: var(--cream);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(27,24,48,0.08);
}
.el-lesson * { box-sizing: border-box; }
.el-lesson .el-header {
  background: var(--navy);
  color: var(--cream);
  padding: 2rem 1.75rem 1.6rem;
  position: relative;
  overflow: hidden;
}
.el-lesson .el-header::before {
  content: '';
  position: absolute;
  top: -60px; right: -60px;
  width: 220px; height: 220px;
  border-radius: 50%;
  border: 32px solid rgba(46,196,182,0.12);
}
.el-lesson .el-lang-toggle {
  position: absolute;
  top: 1.75rem;
  right: 1.75rem;
  z-index: 2;
  display: flex;
  gap: 0.3rem;
}
.el-lesson .el-lang-btn {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  padding: 0.3rem 0.6rem;
  border-radius: 6px;
  background: transparent;
  border: 1px solid rgba(247,243,236,0.35);
  color: rgba(247,243,236,0.65);
  cursor: pointer;
}
.el-lesson .el-lang-btn.active { background: var(--teal); border-color: var(--teal); color: var(--navy); }
.el-lesson .el-lang-btn:hover:not(.active) { border-color: var(--teal); color: var(--cream); }
.el-lesson .el-header-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.68rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--teal);
  margin-bottom: 0.5rem;
  position: relative;
}
.el-lesson .el-header h1 {
  font-family: 'Playfair Display', serif;
  font-size: 2rem;
  font-weight: 700;
  line-height: 1.2;
  margin: 0 0 0.4rem;
  position: relative;
}
.el-lesson .el-header-meta {
  font-size: 0.82rem;
  color: rgba(247,243,236,0.65);
  font-family: 'JetBrains Mono', monospace;
  position: relative;
}
.el-lesson .el-progress-wrap {
  background: var(--navy-mid);
  padding: 0.7rem 1.75rem;
  display: flex;
  align-items: center;
  gap: 0.9rem;
  position: sticky;
  top: 0;
  z-index: 10;
}
.el-lesson .el-progress-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.65rem;
  color: var(--teal);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  white-space: nowrap;
}
.el-lesson .el-progress-track {
  flex: 1;
  height: 4px;
  background: rgba(255,255,255,0.12);
  border-radius: 2px;
  overflow: hidden;
}
.el-lesson .el-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--teal), var(--amber));
  border-radius: 2px;
  transition: width 0.4s ease;
  width: 0%;
}
.el-lesson .el-progress-count {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.65rem;
  color: rgba(247,243,236,0.55);
  white-space: nowrap;
}
.el-lesson main {
  padding: 1.5rem 1.25rem 2.5rem;
}
.el-lesson .section-card {
  background: white;
  border-radius: 12px;
  margin-bottom: 1.1rem;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  overflow: hidden;
}
.el-lesson .section-header {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 1rem 1.2rem;
  cursor: pointer;
  user-select: none;
  border-bottom: 1px solid transparent;
}
.el-lesson .section-header:hover { background: #fafafa; }
.el-lesson .section-header.open { border-bottom-color: var(--cream-dark); }
.el-lesson .section-num {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.7rem;
  font-weight: 600;
  color: white;
  background: var(--navy);
  border-radius: 6px;
  padding: 0.22rem 0.5rem;
  flex-shrink: 0;
}
.el-lesson .section-card.done .section-num { background: var(--teal-dim); }
.el-lesson .section-title {
  font-family: 'Playfair Display', serif;
  font-size: 1.05rem;
  font-weight: 700;
  flex: 1;
}
.el-lesson .section-time {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.65rem;
  color: var(--text-muted);
}
.el-lesson .section-arrow {
  font-size: 0.9rem;
  color: var(--text-muted);
  transition: transform 0.25s;
  flex-shrink: 0;
}
.el-lesson .section-header.open .section-arrow { transform: rotate(180deg); }
.el-lesson .section-body { display: none; padding: 1.3rem; }
.el-lesson .section-body.open { display: block; animation: elFadeIn 0.25s ease; }
@keyframes elFadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
.el-lesson h2 {
  font-family: 'Playfair Display', serif;
  font-size: 1.25rem;
  color: var(--navy);
  margin: 0 0 0.6rem;
}
.el-lesson h3 {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--navy-mid);
  margin: 1.1rem 0 0.5rem;
}
.el-lesson p { margin: 0 0 0.85rem; }
.el-lesson p:last-child { margin-bottom: 0; }
.el-lesson .note-box {
  background: var(--note-bg);
  border-left: 4px solid var(--note-border);
  border-radius: 0 8px 8px 0;
  padding: 0.9rem 1.1rem;
  margin: 1.1rem 0;
  display: flex;
  gap: 0.7rem;
  font-size: 0.9rem;
}
.el-lesson .note-box .note-icon { font-size: 1.15rem; flex-shrink: 0; }
.el-lesson .concept-box {
  background: linear-gradient(135deg, var(--navy) 0%, var(--navy-mid) 100%);
  color: var(--cream);
  border-radius: 10px;
  padding: 1.2rem 1.4rem;
  margin: 1.1rem 0;
}
.el-lesson .concept-box .concept-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.62rem;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  color: var(--teal);
  margin-bottom: 0.4rem;
}
.el-lesson .concept-box p { color: rgba(247,243,236,0.92); margin-bottom: 0; }
.el-lesson .info-panel {
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 8px;
  padding: 0.9rem 1.1rem;
  margin: 1.1rem 0;
  font-size: 0.9rem;
}
.el-lesson .info-panel .panel-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.62rem;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: #0369a1;
  margin-bottom: 0.35rem;
}
.el-lesson table { width: 100%; border-collapse: collapse; margin: 0.9rem 0; font-size: 0.85rem; }
.el-lesson th {
  background: var(--navy);
  color: var(--cream);
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 0.55rem 0.75rem;
  text-align: left;
}
.el-lesson td { padding: 0.5rem 0.75rem; border-bottom: 1px solid var(--cream-dark); }
.el-lesson tr:nth-child(even) td { background: #fafafa; }
.el-lesson ul, .el-lesson ol { padding-left: 1.3rem; margin: 0 0 0.85rem; }
.el-lesson li { margin-bottom: 0.3rem; font-size: 0.93rem; }
.el-lesson .objectives-list { list-style: none; padding: 0; margin: 0.4rem 0; }
.el-lesson .objectives-list li {
  display: flex; align-items: flex-start; gap: 0.55rem;
  padding: 0.4rem 0; font-size: 0.92rem;
  border-bottom: 1px solid var(--cream-dark);
}
.el-lesson .objectives-list li:last-child { border-bottom: none; }
.el-lesson .obj-check { color: var(--teal); flex-shrink: 0; }
.el-lesson .practice-problem {
  border: 1.5px solid var(--cream-dark);
  border-radius: 10px;
  margin-bottom: 1.1rem;
  overflow: hidden;
}
.el-lesson .pp-header {
  display: flex; align-items: center; gap: 0.65rem;
  padding: 0.85rem 1.1rem;
  background: #fafafa;
  border-bottom: 1px solid var(--cream-dark);
}
.el-lesson .pp-num {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.7rem; font-weight: 700; color: white;
  background: var(--amber);
  border-radius: 6px; padding: 0.18rem 0.45rem; flex-shrink: 0;
}
.el-lesson .pp-difficulty {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.6rem; letter-spacing: 0.08em; text-transform: uppercase;
  margin-left: auto;
}
.el-lesson .diff-basic { color: #16a34a; }
.el-lesson .diff-medium { color: #d97706; }
.el-lesson .diff-challenge { color: #dc2626; }
.el-lesson .pp-body { padding: 0.95rem 1.1rem; }
.el-lesson .pp-body p { font-size: 0.92rem; }
.el-lesson .hint-btn, .el-lesson .reveal-btn, .el-lesson .mark-done-btn, .el-lesson .el-choice, .el-lesson .el-next-btn, .el-lesson .el-retake-btn {
  font-family: 'JetBrains Mono', monospace;
  cursor: pointer;
  border: none;
}
.el-lesson .hint-btn, .el-lesson .reveal-btn {
  border-radius: 6px;
  padding: 0.4rem 0.8rem;
  font-size: 0.68rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.el-lesson .hint-btn { background: #fef3c7; color: #92400e; border: 1px solid #fcd34d; margin-right: 0.5rem; }
.el-lesson .hint-btn:hover { background: #fde68a; }
.el-lesson .reveal-btn { background: var(--navy); color: white; }
.el-lesson .reveal-btn:hover { background: var(--navy-light); }
.el-lesson .hint-box, .el-lesson .answer-box {
  border-radius: 7px; padding: 0.75rem 0.95rem; margin-top: 0.7rem;
  font-size: 0.87rem; display: none;
}
.el-lesson .hint-box.open, .el-lesson .answer-box.open { display: block; animation: elFadeIn 0.2s ease; }
.el-lesson .hint-box { background: #fffbeb; border: 1px dashed #fcd34d; color: #78350f; }
.el-lesson .answer-box { background: var(--correct-bg); border: 1px solid var(--correct-border); color: #065f46; }
.el-lesson .answer-box .answer-label {
  font-family: 'JetBrains Mono', monospace; font-size: 0.62rem;
  text-transform: uppercase; letter-spacing: 0.1em; color: var(--teal-dim);
  margin-bottom: 0.35rem; font-weight: 700;
}
.el-lesson .mark-done-btn {
  display: block; width: 100%; margin-top: 1.2rem;
  background: var(--navy); color: var(--cream);
  border-radius: 8px; padding: 0.75rem 1rem;
  font-size: 0.75rem; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase;
  transition: background 0.2s;
}
.el-lesson .mark-done-btn:hover:not(:disabled) { background: var(--teal-dim); }
.el-lesson .mark-done-btn:disabled { background: var(--cream-dark); color: var(--text-muted); cursor: not-allowed; }
.el-lesson .quiz-note {
  background: var(--note-bg);
  border-left: 4px solid var(--note-border);
  border-radius: 0 8px 8px 0;
  padding: 0.9rem 1.1rem;
  margin-bottom: 1.1rem;
  font-size: 0.88rem;
}
.el-lesson .quiz-progress-bar {
  height: 6px; background: var(--cream-dark); border-radius: 999px; overflow: hidden; margin: 0.6rem 0 0.9rem;
}
.el-lesson .quiz-progress-fill {
  height: 100%; background: linear-gradient(90deg, var(--navy), var(--teal)); transition: width 0.2s ease;
}
.el-lesson .quiz-question-count {
  font-family: 'JetBrains Mono', monospace; font-size: 0.72rem; color: var(--text-muted);
}
.el-lesson .quiz-prompt {
  font-family: 'Playfair Display', serif;
  font-size: 1.1rem; font-weight: 700; color: var(--navy);
  margin: 0.5rem 0 1rem;
}
.el-lesson .el-choice {
  display: block; width: 100%; text-align: left;
  background: white; border: 1.5px solid var(--cream-dark);
  border-radius: 8px; padding: 0.7rem 0.9rem; margin-bottom: 0.6rem;
  font-size: 0.93rem; color: var(--text); font-family: 'Source Serif 4', serif;
  transition: border-color 0.15s, background 0.15s;
}
.el-lesson .el-choice:hover:not(:disabled) { border-color: var(--teal); background: #f3fdfc; }
.el-lesson .el-choice:disabled { cursor: default; }
.el-lesson .el-choice.selected-correct { border-color: var(--correct-border); background: var(--correct-bg); }
.el-lesson .el-choice.selected-incorrect { border-color: #dc2626; background: #fef2f2; }
.el-lesson .el-feedback {
  border-radius: 8px; padding: 0.75rem 1rem; margin-top: 0.4rem; font-size: 0.9rem; font-weight: 600;
}
.el-lesson .el-feedback.correct { background: var(--correct-bg); color: var(--teal-dim); }
.el-lesson .el-feedback.incorrect { background: #fef2f2; color: #b91c1c; }
.el-lesson .el-next-btn, .el-lesson .el-retake-btn {
  background: var(--navy); color: white; border-radius: 8px;
  padding: 0.65rem 1.2rem; font-size: 0.75rem; font-weight: 600;
  letter-spacing: 0.06em; text-transform: uppercase; margin-top: 1rem;
}
.el-lesson .el-next-btn:hover, .el-lesson .el-retake-btn:hover { background: var(--navy-light); }
.el-lesson .el-summary { text-align: center; padding: 1rem 0.5rem; }
.el-lesson .el-score {
  font-family: 'JetBrains Mono', monospace;
  font-size: 2.4rem; font-weight: 700; color: var(--navy); margin: 0.4rem 0;
}
.el-lesson .formula-chip {
  font-family: 'JetBrains Mono', monospace;
  font-weight: 700;
  background: var(--cream-dark);
  border-radius: 6px;
  padding: 0.1rem 0.4rem;
}
`;
    document.head.appendChild(style);
  }

  // ---- Static lesson content (sections 0-5, ungraded / session-only) ----
  //
  // Note: unlike matter-review.js's practiceProblem(), this one does NOT
  // escapeHtml() the prompt/hint/answer strings, since they need to contain
  // raw <span class="formula-chip"> HTML for chemical formulas. Keep new
  // Spanish practice-problem strings raw HTML too (chemical formulas
  // themselves are never translated, only the surrounding prose).

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
          <button type="button" class="hint-btn" data-hint-target="hint-${idSuffix}">${escapeHtml(t('hintShow', lang))}</button>
          <button type="button" class="reveal-btn" data-answer-target="ans-${idSuffix}">${escapeHtml(t('revealAnswer', lang))}</button>
          <div class="hint-box" id="hint-${idSuffix}">${hint}</div>
          <div class="answer-box" id="ans-${idSuffix}">
            <div class="answer-label">${escapeHtml(t('answerLabel', lang))}</div>
            ${answer}
          </div>
        </div>
      </div>`;
  }

  const STATIC_SECTIONS = [
    {
      title: { en: 'Before You Begin', es: 'Antes de Empezar' },
      time: { en: '2 min', es: '2 min' },
      bodyHtml: {
        en: `
        <p>This review pulls together <strong>Lessons 6–10</strong> — elements &amp; compounds, chemical phases, conservation of mass, and how the periodic table is organized — to get you ready for <strong>Chapter 2 Quiz A/B</strong>.</p>
        <p><strong>How this works:</strong></p>
        <ul>
          <li>Click a section header to open it and read through the content.</li>
          <li>Work through each practice problem yourself before clicking <em>Reveal Answer</em>.</li>
          <li>Click <strong>Mark Complete</strong> at the bottom of each section to move to the next.</li>
          <li>The last section is a <strong>graded Check for Understanding</strong> — that one saves your score for your teacher.</li>
        </ul>
        <p><strong>By the end of this review, you should be able to:</strong></p>
        <ul class="objectives-list">
          <li><span class="obj-check">◎</span> Tell elements apart from compounds using a chemical formula</li>
          <li><span class="obj-check">◎</span> Explain what (s), (l), (g), and (aq) mean on a formula</li>
          <li><span class="obj-check">◎</span> Use the law of conservation of mass to reason about a chemical reaction's products</li>
          <li><span class="obj-check">◎</span> Explain how the periodic table is organized, and what atomic number and atomic mass mean</li>
          <li><span class="obj-check">◎</span> Identify metals, nonmetals, metalloids, and key element families</li>
        </ul>`,
        es: `
        <p>Este repaso reúne las <strong>Lecciones 6 a 10</strong> — elementos y compuestos, fases químicas, la conservación de la masa, y cómo está organizada la tabla periódica — para prepararte para el <strong>Quiz A/B del Capítulo 2</strong>.</p>
        <p><strong>Cómo funciona esto:</strong></p>
        <ul>
          <li>Haz clic en el encabezado de una sección para abrirla y leer el contenido.</li>
          <li>Resuelve cada problema de práctica tú mismo antes de hacer clic en <em>Mostrar Respuesta</em>.</li>
          <li>Haz clic en <strong>Marcar como Completo</strong> al final de cada sección para pasar a la siguiente.</li>
          <li>La última sección es una <strong>Comprobación de Comprensión calificada</strong> — esa guarda tu puntaje para tu maestro.</li>
        </ul>
        <p><strong>Al terminar este repaso, deberías poder:</strong></p>
        <ul class="objectives-list">
          <li><span class="obj-check">◎</span> Distinguir elementos de compuestos usando una fórmula química</li>
          <li><span class="obj-check">◎</span> Explicar qué significan (s), (l), (g) y (aq) en una fórmula</li>
          <li><span class="obj-check">◎</span> Usar la ley de conservación de la masa para razonar sobre los productos de una reacción química</li>
          <li><span class="obj-check">◎</span> Explicar cómo está organizada la tabla periódica, y qué significan el número atómico y la masa atómica</li>
          <li><span class="obj-check">◎</span> Identificar metales, no metales, metaloides y las familias clave de elementos</li>
        </ul>`
      }
    },
    {
      title: { en: 'Elements, Compounds & Chemical Formulas', es: 'Elementos, Compuestos y Fórmulas Químicas' },
      time: { en: '7 min', es: '7 min' },
      bodyHtml: {
        en: `
        <h2>The Language of Chemistry</h2>
        <p>All matter in the universe is either an element, or made of some combination of elements.</p>
        <div class="concept-box">
          <div class="concept-label">Definition</div>
          <p><strong>Element</strong>: a unique substance that cannot be broken down into simpler substances through chemical processes. Elements are the building materials of all matter.</p>
        </div>
        <div class="concept-box">
          <div class="concept-label">Definition</div>
          <p><strong>Compound</strong>: a pure substance that is a chemical combination of two or more elements in a fixed ratio, written as a <em>chemical formula</em> — symbols and subscripts that show which elements are present and in what amounts.</p>
        </div>
        <div class="info-panel">
          <div class="panel-label">✍️ Symbol Rule</div>
          <p>A chemical symbol's first letter is always <strong>uppercase</strong>; a second letter (if there is one) is always <strong>lowercase</strong> — <span class="formula-chip">Zn</span> is zinc, but <span class="formula-chip">ZN</span> or <span class="formula-chip">zn</span> isn't a real symbol at all.</p>
        </div>
        <h3>Element or Compound?</h3>
        <p>A quick test: does the formula have <strong>more than one different element symbol</strong> in it? If yes, it's a compound. A single symbol (even with a subscript, like H₂) means it's still just one element.</p>
        <div class="note-box">
          <span class="note-icon">📝</span>
          <div class="note-text">On your guided notes, sort these into Element or Compound: <span class="formula-chip">ZnSO₄</span>, <span class="formula-chip">Mn</span>, <span class="formula-chip">Mg(NO₃)₂</span>, <span class="formula-chip">H₂</span>, <span class="formula-chip">KOH</span>, <span class="formula-chip">NH₃</span>, <span class="formula-chip">Na₃PO₄</span>.</div>
        </div>
        ${practiceProblem('en', 'e1', 'Is <span class="formula-chip">Mn</span> an element or a compound?', 'basic', 'Count the different element symbols in the formula.', 'Element — Mn (manganese) is a single symbol, no other elements combined with it.')}
        ${practiceProblem('en', 'e2', 'Is <span class="formula-chip">H₂</span> an element or a compound?', 'medium', 'The subscript tells you how many atoms — but how many <em>different</em> elements are shown?', 'Element — H₂ is two atoms of the same element (hydrogen gas), not a combination of different elements.')}
        ${practiceProblem('en', 'e3', 'Is <span class="formula-chip">ZnSO₄</span> an element or a compound?', 'medium', 'How many different element symbols appear in this formula?', 'Compound — it combines zinc (Zn), sulfur (S), and oxygen (O): three different elements in a fixed ratio.')}
        ${practiceProblem('en', 'e4', 'Is <span class="formula-chip">Na₃PO₄</span> an element or a compound?', 'challenge', 'Same test as always — how many different elements does it combine?', 'Compound — it combines sodium (Na), phosphorus (P), and oxygen (O).')}`,
        es: `
        <h2>El Lenguaje de la Química</h2>
        <p>Toda la materia del universo es un elemento, o está hecha de alguna combinación de elementos.</p>
        <div class="concept-box">
          <div class="concept-label">Definición</div>
          <p><strong>Elemento</strong>: una sustancia única que no se puede descomponer en sustancias más simples mediante procesos químicos. Los elementos son los materiales de construcción de toda la materia.</p>
        </div>
        <div class="concept-box">
          <div class="concept-label">Definición</div>
          <p><strong>Compuesto</strong>: una sustancia pura que es una combinación química de dos o más elementos en una proporción fija, escrita como una <em>fórmula química</em> — símbolos y subíndices que muestran qué elementos están presentes y en qué cantidades.</p>
        </div>
        <div class="info-panel">
          <div class="panel-label">✍️ Regla de los Símbolos</div>
          <p>La primera letra de un símbolo químico siempre es <strong>mayúscula</strong>; una segunda letra (si la hay) siempre es <strong>minúscula</strong> — <span class="formula-chip">Zn</span> es zinc, pero <span class="formula-chip">ZN</span> o <span class="formula-chip">zn</span> no son símbolos reales.</p>
        </div>
        <h3>¿Elemento o Compuesto?</h3>
        <p>Una prueba rápida: ¿la fórmula tiene <strong>más de un símbolo de elemento diferente</strong>? Si es así, es un compuesto. Un solo símbolo (incluso con un subíndice, como H₂) significa que sigue siendo solo un elemento.</p>
        <div class="note-box">
          <span class="note-icon">📝</span>
          <div class="note-text">En tus apuntes guiados, clasifica estos como Elemento o Compuesto: <span class="formula-chip">ZnSO₄</span>, <span class="formula-chip">Mn</span>, <span class="formula-chip">Mg(NO₃)₂</span>, <span class="formula-chip">H₂</span>, <span class="formula-chip">KOH</span>, <span class="formula-chip">NH₃</span>, <span class="formula-chip">Na₃PO₄</span>.</div>
        </div>
        ${practiceProblem('es', 'e1', '¿Es <span class="formula-chip">Mn</span> un elemento o un compuesto?', 'basic', 'Cuenta los diferentes símbolos de elementos en la fórmula.', 'Elemento — Mn (manganeso) es un solo símbolo, no tiene otros elementos combinados con él.')}
        ${practiceProblem('es', 'e2', '¿Es <span class="formula-chip">H₂</span> un elemento o un compuesto?', 'medium', 'El subíndice te dice cuántos átomos hay — pero ¿cuántos elementos <em>diferentes</em> se muestran?', 'Elemento — H₂ son dos átomos del mismo elemento (gas hidrógeno), no una combinación de elementos diferentes.')}
        ${practiceProblem('es', 'e3', '¿Es <span class="formula-chip">ZnSO₄</span> un elemento o un compuesto?', 'medium', '¿Cuántos símbolos de elementos diferentes aparecen en esta fórmula?', 'Compuesto — combina zinc (Zn), azufre (S) y oxígeno (O): tres elementos diferentes en una proporción fija.')}
        ${practiceProblem('es', 'e4', '¿Es <span class="formula-chip">Na₃PO₄</span> un elemento o un compuesto?', 'challenge', 'La misma prueba de siempre — ¿cuántos elementos diferentes combina?', 'Compuesto — combina sodio (Na), fósforo (P) y oxígeno (O).')}`
      }
    },
    {
      title: { en: 'Phases & Aqueous Solutions', es: 'Fases y Soluciones Acuosas' },
      time: { en: '6 min', es: '6 min' },
      bodyHtml: {
        en: `
        <h2>Reading the Phase Label</h2>
        <p>A chemical formula is often followed by a label in parentheses showing its <strong>phase</strong> — the physical form the substance is in.</p>
        <table>
          <thead><tr><th>Label</th><th>Meaning</th></tr></thead>
          <tbody>
            <tr><td>(s)</td><td>Solid</td></tr>
            <tr><td>(l)</td><td>Liquid</td></tr>
            <tr><td>(g)</td><td>Gas</td></tr>
            <tr><td>(aq)</td><td>Aqueous — dissolved in water</td></tr>
          </tbody>
        </table>
        <div class="concept-box">
          <div class="concept-label">Definition</div>
          <p><strong>Phase</strong>: the physical form a substance is in (solid, liquid, or gas), heavily influenced by temperature. <strong>Aqueous</strong> means dissolved in water.</p>
        </div>
        <div class="info-panel">
          <div class="panel-label">🔍 Same Formula, Different Bottle</div>
          <p><span class="formula-chip">Cu₂SO₄(s)</span> is a dry solid — you'd expect to see crystals or powder. <span class="formula-chip">Cu₂SO₄(aq)</span> is the same compound dissolved in water — you'd expect to see a clear liquid solution instead, with no visible solid at all.</p>
        </div>
        <div class="note-box">
          <span class="note-icon">📝</span>
          <div class="note-text">On your guided notes, write the formula for ice — solid water — using a phase label. Then note what all substances labeled (aq) have in common.</div>
        </div>
        ${practiceProblem('en', 'a1', 'A bottle is labeled <span class="formula-chip">Cu₂SO₄(aq)</span>. What should you expect to see inside?', 'basic', 'What does (aq) tell you about where the compound is?', 'A liquid solution — the compound is dissolved in water, so you\'d see a (blue) liquid, not dry crystals.')}
        ${practiceProblem('en', 'a2', 'What is the correct formula + phase label for ice?', 'medium', 'Water is H₂O — what phase is ice?', 'H₂O(s) — ice is solid water.')}
        ${practiceProblem('en', 'a3', 'What do all substances labeled (aq) have in common?', 'medium', 'Think about what the letters a-q stand for.', 'They are all dissolved in water (aqueous solutions).')}`,
        es: `
        <h2>Leyendo la Etiqueta de Fase</h2>
        <p>Una fórmula química a menudo va seguida de una etiqueta entre paréntesis que muestra su <strong>fase</strong> — la forma física en la que se encuentra la sustancia.</p>
        <table>
          <thead><tr><th>Etiqueta</th><th>Significado</th></tr></thead>
          <tbody>
            <tr><td>(s)</td><td>Sólido</td></tr>
            <tr><td>(l)</td><td>Líquido</td></tr>
            <tr><td>(g)</td><td>Gas</td></tr>
            <tr><td>(aq)</td><td>Acuoso — disuelto en agua</td></tr>
          </tbody>
        </table>
        <div class="concept-box">
          <div class="concept-label">Definición</div>
          <p><strong>Fase</strong>: la forma física en la que se encuentra una sustancia (sólido, líquido o gas), fuertemente influenciada por la temperatura. <strong>Acuoso</strong> significa disuelto en agua.</p>
        </div>
        <div class="info-panel">
          <div class="panel-label">🔍 Misma Fórmula, Diferente Botella</div>
          <p><span class="formula-chip">Cu₂SO₄(s)</span> es un sólido seco — esperarías ver cristales o polvo. <span class="formula-chip">Cu₂SO₄(aq)</span> es el mismo compuesto disuelto en agua — en cambio, esperarías ver una solución líquida clara, sin ningún sólido visible.</p>
        </div>
        <div class="note-box">
          <span class="note-icon">📝</span>
          <div class="note-text">En tus apuntes guiados, escribe la fórmula del hielo — agua sólida — usando una etiqueta de fase. Luego anota qué tienen en común todas las sustancias etiquetadas (aq).</div>
        </div>
        ${practiceProblem('es', 'a1', 'Una botella está etiquetada <span class="formula-chip">Cu₂SO₄(aq)</span>. ¿Qué deberías esperar ver adentro?', 'basic', '¿Qué te dice (aq) sobre dónde está el compuesto?', 'Una solución líquida — el compuesto está disuelto en agua, así que verías un líquido (azul), no cristales secos.')}
        ${practiceProblem('es', 'a2', '¿Cuál es la fórmula correcta más la etiqueta de fase para el hielo?', 'medium', 'El agua es H₂O — ¿qué fase es el hielo?', 'H₂O(s) — el hielo es agua sólida.')}
        ${practiceProblem('es', 'a3', '¿Qué tienen en común todas las sustancias etiquetadas (aq)?', 'medium', 'Piensa en qué representan las letras a-q.', 'Todas están disueltas en agua (soluciones acuosas).')}`
      }
    },
    {
      title: { en: 'Chemical Change & Conservation of Mass', es: 'Cambio Químico y Conservación de la Masa' },
      time: { en: '8 min', es: '8 min' },
      bodyHtml: {
        en: `
        <h2>What Happens When Matter Changes?</h2>
        <p>In the copper cycle lab, copper changed color and form several times — but it was never destroyed.</p>
        <div class="concept-box">
          <div class="concept-label">Law of Conservation of Mass</div>
          <p>Mass cannot be gained or lost in a chemical reaction — matter cannot be created or destroyed.</p>
        </div>
        <p>No matter what was done to the copper in the lab, it was never broken down any further — it just combined and recombined into different compounds. Measuring its mass at the beginning and the end of the experiment proved it was never destroyed.</p>
        <div class="info-panel">
          <div class="panel-label">🔍 Connecting Back</div>
          <p>This is more evidence for something from Chapter 1: a "golden" penny that's really zinc with a copper coating isn't actually gold — elements keep their identity through chemical changes; they don't transform into different elements.</p>
        </div>
        <h3>Identifying Reaction Products</h3>
        <p>When two dissolved (aq) solutions react and a solid forms, that solid is a <strong>brand-new compound</strong> that was created by the reaction — not one of the original ingredients.</p>
        <div class="note-box">
          <span class="note-icon">📝</span>
          <div class="note-text">On your guided notes, write: <em>"Law of conservation of mass: matter cannot be created or destroyed in a chemical reaction — only rearranged."</em></div>
        </div>
        ${practiceProblem('en', 'cc1', 'You start a lab with 5.0 g of copper. It goes through several reactions and color changes. About how much copper (by mass) should be left at the end?', 'basic', 'What does the law of conservation of mass say happens to the total mass?', 'About 5.0 g — mass isn\'t created or destroyed in a chemical reaction, so the copper is still there, just possibly in a different compound.')}
        ${practiceProblem('en', 'cc2', 'BaCl₂(aq) is added to Na₂SO₄(aq), producing NaCl(aq) and a white solid. Which is most likely the white solid?', 'medium', 'A solid forming from two dissolved solutions means a new, insoluble compound was created — which option is a genuinely new pairing of ions, not one of the starting ingredients?', 'BaSO₄(s) — it\'s a new compound formed from the reaction (barium + sulfate), and its (s) label matches "solid."')}
        ${practiceProblem('en', 'cc3', 'True or False: if a chemical reaction seems to make matter "disappear," it was actually destroyed.', 'challenge', 'Could the matter have just changed into something less visible, like a gas or a dissolved substance?', 'False — the law of conservation of mass says matter isn\'t destroyed. Anything that seems to disappear (like a gas escaping) is still there — just harder to see or measure.')}`,
        es: `
        <h2>¿Qué Pasa Cuando la Materia Cambia?</h2>
        <p>En el laboratorio del ciclo del cobre, el cobre cambió de color y forma varias veces — pero nunca fue destruido.</p>
        <div class="concept-box">
          <div class="concept-label">Ley de Conservación de la Masa</div>
          <p>La masa no se puede ganar ni perder en una reacción química — la materia no se puede crear ni destruir.</p>
        </div>
        <p>Sin importar lo que se le hizo al cobre en el laboratorio, nunca se descompuso más — solo se combinó y recombinó en diferentes compuestos. Medir su masa al principio y al final del experimento demostró que nunca fue destruido.</p>
        <div class="info-panel">
          <div class="panel-label">🔍 Conectando con lo Anterior</div>
          <p>Esta es más evidencia de algo del Capítulo 1: una moneda "de oro" que en realidad es zinc con un recubrimiento de cobre no es realmente oro — los elementos mantienen su identidad a través de los cambios químicos; no se transforman en elementos diferentes.</p>
        </div>
        <h3>Identificando los Productos de una Reacción</h3>
        <p>Cuando dos soluciones disueltas (aq) reaccionan y se forma un sólido, ese sólido es un <strong>compuesto completamente nuevo</strong> que se creó por la reacción — no uno de los ingredientes originales.</p>
        <div class="note-box">
          <span class="note-icon">📝</span>
          <div class="note-text">En tus apuntes guiados, escribe: <em>"Ley de conservación de la masa: la materia no se puede crear ni destruir en una reacción química — solo se reorganiza."</em></div>
        </div>
        ${practiceProblem('es', 'cc1', 'Comienzas un laboratorio con 5.0 g de cobre. Pasa por varias reacciones y cambios de color. ¿Aproximadamente cuánto cobre (en masa) debería quedar al final?', 'basic', '¿Qué dice la ley de conservación de la masa que le pasa a la masa total?', 'Aproximadamente 5.0 g — la masa no se crea ni se destruye en una reacción química, así que el cobre sigue ahí, solo que posiblemente en un compuesto diferente.')}
        ${practiceProblem('es', 'cc2', 'Se agrega BaCl₂(aq) a Na₂SO₄(aq), produciendo NaCl(aq) y un sólido blanco. ¿Cuál es más probable que sea el sólido blanco?', 'medium', 'Que se forme un sólido a partir de dos soluciones disueltas significa que se creó un compuesto nuevo e insoluble — ¿cuál opción es una combinación de iones genuinamente nueva, no uno de los ingredientes iniciales?', 'BaSO₄(s) — es un compuesto nuevo formado por la reacción (bario + sulfato), y su etiqueta (s) coincide con "sólido".')}
        ${practiceProblem('es', 'cc3', 'Verdadero o Falso: si una reacción química parece hacer que la materia "desaparezca", en realidad fue destruida.', 'challenge', '¿Podría la materia simplemente haberse convertido en algo menos visible, como un gas o una sustancia disuelta?', 'Falso — la ley de conservación de la masa dice que la materia no se destruye. Cualquier cosa que parezca desaparecer (como un gas que escapa) sigue ahí — solo es más difícil de ver o medir.')}`
      }
    },
    {
      title: { en: 'How the Periodic Table Is Organized', es: 'Cómo Está Organizada la Tabla Periódica' },
      time: { en: '8 min', es: '8 min' },
      bodyHtml: {
        en: `
        <h2>Mendeleev's Big Idea</h2>
        <div class="concept-box">
          <div class="concept-label">Definition</div>
          <p><strong>Atomic mass</strong>: the mass of a single atom (or isotope) of an element, expressed as a decimal number.</p>
        </div>
        <div class="concept-box">
          <div class="concept-label">Definition</div>
          <p><strong>Reactivity</strong>: whether an element chemically combines with other substances to form compounds, and how fast that reaction happens.</p>
        </div>
        <div class="info-panel">
          <div class="panel-label">🔍 Where It Started</div>
          <p>Mendeleev organized his periodic table based on reactivity and atomic mass. His arrangement was so consistent that it helped predict the existence and properties of elements that hadn't even been discovered yet.</p>
        </div>
        <p>Elements grouped together tend to share similar properties — including combining with other elements in the <strong>same ratio</strong>. That combining ratio is a strong clue for spotting elements in the same family.</p>
        <div class="note-box">
          <span class="note-icon">📝</span>
          <div class="note-text">On your guided notes, write: <em>"Mendeleev organized the periodic table by reactivity and atomic mass. Elements in the same group have similar properties."</em></div>
        </div>
        <table>
          <thead><tr><th>Element</th><th>Description</th><th>Reactivity</th><th>Chlorine Compound</th></tr></thead>
          <tbody>
            <tr><td>Cadmium (Cd)</td><td>Moderately soft, silvery, solid, metal</td><td>Reacts very slowly with water</td><td>CdCl₂(s)</td></tr>
            <tr><td>Zinc (Zn)</td><td>Moderately hard, silvery, solid, metal</td><td>Reacts very slowly with water</td><td>ZnCl₂(s)</td></tr>
            <tr><td>Iodine (I)</td><td>Purple, solid, nonmetal</td><td>Reacts slowly with metals</td><td>ICl(s)</td></tr>
            <tr><td>Mercury (Hg)</td><td>Silvery, liquid, metal</td><td>Does not react with water</td><td>HgCl₂(s)</td></tr>
          </tbody>
        </table>
        ${practiceProblem(
          'en', 'g1',
          'Using the table above, which two elements would you expect to be grouped together?',
          'medium',
          'Compare BOTH the physical description and the combining ratio with chlorine (the subscript).',
          'Cadmium and zinc — both are silvery solid metals with nearly identical reactivity, and both form a 1-to-2 ratio with chlorine (CdCl₂, ZnCl₂). Iodine is a nonmetal with different reactivity, and mercury is a liquid, so neither matches as closely.'
        )}
        <table>
          <thead><tr><th>Element</th><th>Description</th><th>Reactivity</th><th>Chlorine Compound</th></tr></thead>
          <tbody>
            <tr><td>Element J</td><td>Colorless, nonmetal, gas</td><td>Does not react with water</td><td>JCl₃(l)</td></tr>
            <tr><td>Element K</td><td>Yellow, nonmetal, gas</td><td>Reacts slowly with water</td><td>KCl(g)</td></tr>
            <tr><td>Element L</td><td>Gray-black, nonmetal, solid</td><td>Reacts slowly with water</td><td>LCl(s)</td></tr>
            <tr><td>Element M</td><td>Orange-brown, nonmetal, liquid</td><td>Reacts slowly with water</td><td>MCl(g)</td></tr>
          </tbody>
        </table>
        ${practiceProblem(
          'en', 'g2',
          'Using the table above, which THREE elements would you expect to be in the same group? Explain your thinking.',
          'challenge',
          'Look at the combining ratio with chlorine (the subscript) across all four — three should match, one shouldn\'t.',
          'K, L, and M — all three form a 1-to-1 ratio with chlorine (KCl, LCl, MCl) and share similar reactivity (react slowly with water), suggesting they belong to the same group. J is the odd one out: it forms JCl₃ (a different ratio) and doesn\'t react with water at all.'
        )}`,
        es: `
        <h2>La Gran Idea de Mendeléyev</h2>
        <div class="concept-box">
          <div class="concept-label">Definición</div>
          <p><strong>Masa atómica</strong>: la masa de un solo átomo (o isótopo) de un elemento, expresada como un número decimal.</p>
        </div>
        <div class="concept-box">
          <div class="concept-label">Definición</div>
          <p><strong>Reactividad</strong>: si un elemento se combina químicamente con otras sustancias para formar compuestos, y qué tan rápido ocurre esa reacción.</p>
        </div>
        <div class="info-panel">
          <div class="panel-label">🔍 Cómo Empezó</div>
          <p>Mendeléyev organizó su tabla periódica basándose en la reactividad y la masa atómica. Su arreglo fue tan consistente que ayudó a predecir la existencia y las propiedades de elementos que ni siquiera se habían descubierto todavía.</p>
        </div>
        <p>Los elementos agrupados juntos tienden a compartir propiedades similares — incluyendo combinarse con otros elementos en la <strong>misma proporción</strong>. Esa proporción de combinación es una pista importante para identificar elementos de la misma familia.</p>
        <div class="note-box">
          <span class="note-icon">📝</span>
          <div class="note-text">En tus apuntes guiados, escribe: <em>"Mendeléyev organizó la tabla periódica por reactividad y masa atómica. Los elementos del mismo grupo tienen propiedades similares."</em></div>
        </div>
        <table>
          <thead><tr><th>Elemento</th><th>Descripción</th><th>Reactividad</th><th>Compuesto de Cloro</th></tr></thead>
          <tbody>
            <tr><td>Cadmio (Cd)</td><td>Moderadamente blando, plateado, sólido, metal</td><td>Reacciona muy lentamente con el agua</td><td>CdCl₂(s)</td></tr>
            <tr><td>Zinc (Zn)</td><td>Moderadamente duro, plateado, sólido, metal</td><td>Reacciona muy lentamente con el agua</td><td>ZnCl₂(s)</td></tr>
            <tr><td>Yodo (I)</td><td>Violeta, sólido, no metal</td><td>Reacciona lentamente con los metales</td><td>ICl(s)</td></tr>
            <tr><td>Mercurio (Hg)</td><td>Plateado, líquido, metal</td><td>No reacciona con el agua</td><td>HgCl₂(s)</td></tr>
          </tbody>
        </table>
        ${practiceProblem(
          'es', 'g1',
          'Usando la tabla de arriba, ¿qué dos elementos esperarías que estuvieran agrupados juntos?',
          'medium',
          'Compara TANTO la descripción física como la proporción de combinación con el cloro (el subíndice).',
          'Cadmio y zinc — ambos son metales sólidos plateados con una reactividad casi idéntica, y ambos forman una proporción de 1 a 2 con el cloro (CdCl₂, ZnCl₂). El yodo es un no metal con una reactividad diferente, y el mercurio es líquido, así que ninguno de los dos coincide tan bien.'
        )}
        <table>
          <thead><tr><th>Elemento</th><th>Descripción</th><th>Reactividad</th><th>Compuesto de Cloro</th></tr></thead>
          <tbody>
            <tr><td>Elemento J</td><td>Incoloro, no metal, gas</td><td>No reacciona con el agua</td><td>JCl₃(l)</td></tr>
            <tr><td>Elemento K</td><td>Amarillo, no metal, gas</td><td>Reacciona lentamente con el agua</td><td>KCl(g)</td></tr>
            <tr><td>Elemento L</td><td>Gris oscuro, no metal, sólido</td><td>Reacciona lentamente con el agua</td><td>LCl(s)</td></tr>
            <tr><td>Elemento M</td><td>Naranja-marrón, no metal, líquido</td><td>Reacciona lentamente con el agua</td><td>MCl(g)</td></tr>
          </tbody>
        </table>
        ${practiceProblem(
          'es', 'g2',
          'Usando la tabla de arriba, ¿qué TRES elementos esperarías que estuvieran en el mismo grupo? Explica tu razonamiento.',
          'challenge',
          'Observa la proporción de combinación con el cloro (el subíndice) en los cuatro — tres deberían coincidir, uno no.',
          'K, L y M — los tres forman una proporción de 1 a 1 con el cloro (KCl, LCl, MCl) y comparten una reactividad similar (reaccionan lentamente con el agua), lo que sugiere que pertenecen al mismo grupo. J es el que no encaja: forma JCl₃ (una proporción diferente) y no reacciona con el agua en absoluto.'
        )}`
      }
    },
    {
      title: { en: 'Reading the Periodic Table', es: 'Leyendo la Tabla Periódica' },
      time: { en: '9 min', es: '9 min' },
      bodyHtml: {
        en: `
        <h2>What the Table Reveals</h2>
        <div class="concept-box">
          <div class="concept-label">Definition</div>
          <p><strong>Atomic number</strong>: the consecutive whole numbers associated with each element on the periodic table — equal to the number of protons in that element's nucleus.</p>
        </div>
        <table>
          <thead><tr><th>Term</th><th>What it means</th></tr></thead>
          <tbody>
            <tr><td>Group</td><td>A vertical column — elements in a group have similar properties</td></tr>
            <tr><td>Period</td><td>A horizontal row</td></tr>
            <tr><td>Main group elements</td><td>Groups 1A–8A</td></tr>
            <tr><td>Transition elements</td><td>Groups 1B–8B</td></tr>
            <tr><td>Alkali metals</td><td>Group 1A</td></tr>
            <tr><td>Alkaline earth metals</td><td>Group 2A</td></tr>
            <tr><td>Halogens</td><td>Group 7A</td></tr>
            <tr><td>Noble gases</td><td>Group 8A — called "noble" because they aren't reactive</td></tr>
            <tr><td>Lanthanides &amp; actinides</td><td>The two rows of 14 elements placed separately at the bottom</td></tr>
          </tbody>
        </table>
        <h3>Metals, Nonmetals & Metalloids</h3>
        <div class="info-panel">
          <div class="panel-label">📐 The Stair-Step Line</div>
          <p><strong>Metals</strong> (excellent conductors, shiny, malleable) are to the left of the stair-step line. <strong>Nonmetals</strong> (poor conductors, dull, brittle) are to the right. <strong>Metalloids</strong> sit right along the stair-step line, with properties in between.</p>
        </div>
        <div class="note-box">
          <span class="note-icon">📝</span>
          <div class="note-text">On your guided notes, sketch the stair-step line and label where metals, nonmetals, and metalloids sit relative to it. Then list the group numbers for alkali metals, alkaline earth metals, halogens, and noble gases.</div>
        </div>
        ${practiceProblem('en', 'r1', 'Is silicon (Si) a metal, nonmetal, or metalloid?', 'basic', 'Silicon sits right along the stair-step line.', 'Metalloid — silicon is one of the classic metalloids, right on the stair-step line.')}
        ${practiceProblem('en', 'r2', 'In what phase would you expect to find bromine (Br) at room temperature?', 'medium', 'Bromine is one of the few elements that is neither a solid nor a gas at room temperature.', 'Liquid — bromine is one of only two elements that are liquid at room temperature (along with mercury).')}
        ${practiceProblem('en', 'r3', 'Which family are the Group 1A elements, and are they generally very reactive or not very reactive?', 'medium', 'This is the leftmost column of the main group elements.', 'Alkali metals — they are highly reactive, especially with water.')}
        ${practiceProblem('en', 'r4', 'Would you expect argon (Ar) to react easily with other elements? Why or why not?', 'challenge', 'What group is argon in?', 'No — argon is a noble gas (Group 8A), and noble gases are "noble" specifically because they are not reactive.')}`,
        es: `
        <h2>Lo Que Revela la Tabla</h2>
        <div class="concept-box">
          <div class="concept-label">Definición</div>
          <p><strong>Número atómico</strong>: los números enteros consecutivos asociados con cada elemento en la tabla periódica — igual al número de protones en el núcleo de ese elemento.</p>
        </div>
        <table>
          <thead><tr><th>Término</th><th>Qué significa</th></tr></thead>
          <tbody>
            <tr><td>Grupo</td><td>Una columna vertical — los elementos de un grupo tienen propiedades similares</td></tr>
            <tr><td>Período</td><td>Una fila horizontal</td></tr>
            <tr><td>Elementos del grupo principal</td><td>Grupos 1A–8A</td></tr>
            <tr><td>Elementos de transición</td><td>Grupos 1B–8B</td></tr>
            <tr><td>Metales alcalinos</td><td>Grupo 1A</td></tr>
            <tr><td>Metales alcalinotérreos</td><td>Grupo 2A</td></tr>
            <tr><td>Halógenos</td><td>Grupo 7A</td></tr>
            <tr><td>Gases nobles</td><td>Grupo 8A — se llaman "nobles" porque no son reactivos</td></tr>
            <tr><td>Lantánidos y actínidos</td><td>Las dos filas de 14 elementos colocadas por separado en la parte inferior</td></tr>
          </tbody>
        </table>
        <h3>Metales, No Metales y Metaloides</h3>
        <div class="info-panel">
          <div class="panel-label">📐 La Línea Escalonada</div>
          <p>Los <strong>metales</strong> (excelentes conductores, brillantes, maleables) están a la izquierda de la línea escalonada. Los <strong>no metales</strong> (malos conductores, opacos, quebradizos) están a la derecha. Los <strong>metaloides</strong> se ubican justo sobre la línea escalonada, con propiedades intermedias.</p>
        </div>
        <div class="note-box">
          <span class="note-icon">📝</span>
          <div class="note-text">En tus apuntes guiados, dibuja la línea escalonada y marca dónde se ubican los metales, los no metales y los metaloides en relación con ella. Luego enumera los números de grupo de los metales alcalinos, los metales alcalinotérreos, los halógenos y los gases nobles.</div>
        </div>
        ${practiceProblem('es', 'r1', '¿Es el silicio (Si) un metal, un no metal o un metaloide?', 'basic', 'El silicio se ubica justo sobre la línea escalonada.', 'Metaloide — el silicio es uno de los metaloides clásicos, justo en la línea escalonada.')}
        ${practiceProblem('es', 'r2', '¿En qué fase esperarías encontrar el bromo (Br) a temperatura ambiente?', 'medium', 'El bromo es uno de los pocos elementos que no es ni sólido ni gas a temperatura ambiente.', 'Líquido — el bromo es uno de los únicos dos elementos que son líquidos a temperatura ambiente (junto con el mercurio).')}
        ${practiceProblem('es', 'r3', '¿A qué familia pertenecen los elementos del Grupo 1A, y son generalmente muy reactivos o poco reactivos?', 'medium', 'Esta es la columna más a la izquierda de los elementos del grupo principal.', 'Metales alcalinos — son muy reactivos, especialmente con el agua.')}
        ${practiceProblem('es', 'r4', '¿Esperarías que el argón (Ar) reaccione fácilmente con otros elementos? ¿Por qué sí o por qué no?', 'challenge', '¿En qué grupo está el argón?', 'No — el argón es un gas noble (Grupo 8A), y los gases nobles son "nobles" específicamente porque no son reactivos.')}`
      }
    }
  ];

  function render(host, ctx) {
    ensureStylesInjected();
    const lang = getLang();

    const sectionsHtml = STATIC_SECTIONS.map((sec, i) => `
      <div class="section-card" id="el-sec-${i}" data-section="${i}">
        <div class="section-header" data-toggle="${i}">
          <span class="section-num">${i === 0 ? '★' : String(i).padStart(2, '0')}</span>
          <span class="section-title">${escapeHtml(tr(sec.title, lang))}</span>
          <span class="section-time">${escapeHtml(tr(sec.time, lang))}</span>
          <span class="section-arrow">▼</span>
        </div>
        <div class="section-body">
          ${tr(sec.bodyHtml, lang)}
          <button type="button" class="mark-done-btn" data-mark-done="${i}">${escapeHtml(t('markSectionComplete', lang))}</button>
        </div>
      </div>
    `).join('');

    host.innerHTML = `
      <div class="el-lesson">
        <div class="el-header">
          <div class="el-lang-toggle" role="group" aria-label="${escapeHtml(t('langToggleAria', lang))}">
            <button type="button" class="el-lang-btn${lang === 'en' ? ' active' : ''}" data-lang="en">EN</button>
            <button type="button" class="el-lang-btn${lang === 'es' ? ' active' : ''}" data-lang="es">ES</button>
          </div>
          <div class="el-header-label">${escapeHtml(t('headerLabel', lang))}</div>
          <h1>${escapeHtml(ctx.activity.title)}</h1>
          <div class="el-header-meta">${escapeHtml(t('headerMeta', lang))}</div>
        </div>
        <div class="el-progress-wrap">
          <span class="el-progress-label">${escapeHtml(t('progress', lang))}</span>
          <div class="el-progress-track"><div class="el-progress-fill" id="el-progress-fill"></div></div>
          <span class="el-progress-count" id="el-progress-count">${escapeHtml(t('sectionCount', lang, 0, SECTION_COUNT))}</span>
        </div>
        <main>
          ${sectionsHtml}
          <div class="section-card" id="el-sec-${SECTION_COUNT - 1}" data-section="${SECTION_COUNT - 1}">
            <div class="section-header" data-toggle="${SECTION_COUNT - 1}">
              <span class="section-num">✓</span>
              <span class="section-title">${escapeHtml(t('checkForUnderstanding', lang))}</span>
              <span class="section-time">${escapeHtml(t('quizTimeGraded', lang))}</span>
              <span class="section-arrow">▼</span>
            </div>
            <div class="section-body">
              <div class="quiz-note">${t('quizNote', lang)}</div>
              <div id="el-quiz-mount"></div>
            </div>
          </div>
        </main>
      </div>
    `;

    const root = host.querySelector('.el-lesson');
    const quizIndex = SECTION_COUNT - 1;
    const completed = new Array(SECTION_COUNT).fill(false);

    function updateProgress() {
      const done = completed.filter(Boolean).length;
      const pct = Math.round((done / SECTION_COUNT) * 100);
      root.querySelector('#el-progress-fill').style.width = pct + '%';
      root.querySelector('#el-progress-count').textContent = t('sectionCount', lang, done, SECTION_COUNT);
    }

    function openSection(i, scroll) {
      const card = root.querySelector(`#el-sec-${i}`);
      if (!card) return;
      card.querySelector('.section-body').classList.add('open');
      card.querySelector('.section-header').classList.add('open');
      if (scroll) card.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function toggleSection(i) {
      const card = root.querySelector(`#el-sec-${i}`);
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
        if (completed[i]) return;
        completed[i] = true;
        root.querySelector(`#el-sec-${i}`).classList.add('done');
        btn.textContent = t('sectionComplete', lang);
        btn.disabled = true;
        updateProgress();
        setTimeout(() => openSection(i + 1, true), 250);
      });
    });

    root.querySelectorAll('[data-hint-target]').forEach(btn => {
      btn.addEventListener('click', () => {
        const box = root.querySelector('#' + btn.getAttribute('data-hint-target'));
        const open = box.classList.toggle('open');
        btn.textContent = open ? t('hintHide', lang) : t('hintShow', lang);
      });
    });
    root.querySelectorAll('[data-answer-target]').forEach(btn => {
      btn.addEventListener('click', () => {
        const box = root.querySelector('#' + btn.getAttribute('data-answer-target'));
        const open = box.classList.toggle('open');
        btn.textContent = open ? t('hideAnswer', lang) : t('revealAnswer', lang);
      });
    });

    root.querySelectorAll('[data-lang]').forEach(btn => {
      btn.addEventListener('click', () => {
        const newLang = btn.getAttribute('data-lang');
        if (newLang === lang) return;
        setLang(newLang);
        render(host, ctx); // full re-render; progress lives in ctx.getProgress(), untouched by language
      });
    });

    // Quiz (final section) — graded, saved via ctx.saveProgress.
    const quizMount = root.querySelector('#el-quiz-mount');
    renderQuiz(quizMount, ctx);

    const progress = ctx.getProgress();
    if (progress && (progress.status === 'in_progress' || progress.status === 'completed')) {
      if (progress.status === 'completed') completed[quizIndex] = true;
      openSection(quizIndex, false);
    } else {
      openSection(0, false);
    }
    updateProgress();
  }

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
    const lang = getLang();
    const q = QUESTIONS[index];
    const pct = Math.round((index / QUESTIONS.length) * 100);
    mount.innerHTML = `
      <div class="quiz-question-count">${escapeHtml(t('questionCount', lang, index + 1, QUESTIONS.length))}</div>
      <div class="quiz-progress-bar"><div class="quiz-progress-fill" style="width:${pct}%"></div></div>
      <p class="quiz-prompt">${escapeHtml(tr(q.prompt, lang))}</p>
      <div id="el-answer-area"></div>
      <div id="el-feedback-area"></div>
      <button type="button" class="el-next-btn" id="el-next-btn" style="display:none;">${escapeHtml(t('nextQuestion', lang))}</button>
    `;

    const answerArea = mount.querySelector('#el-answer-area');
    const feedbackArea = mount.querySelector('#el-feedback-area');
    const nextBtn = mount.querySelector('#el-next-btn');
    let submitted = false;

    answerArea.innerHTML = q.choices.map((choice, i) => `
      <button type="button" class="el-choice" data-choice="${i}">${escapeHtml(tr(choice, lang))}</button>
    `).join('');

    function submit(response, btnEl) {
      if (submitted) return;
      submitted = true;

      const correct = response === q.correct;
      answerArea.querySelectorAll('.el-choice').forEach(el => {
        el.disabled = true;
        const val = Number(el.getAttribute('data-choice'));
        if (val === q.correct) el.classList.add('selected-correct');
        else if (el === btnEl) el.classList.add('selected-incorrect');
      });

      feedbackArea.innerHTML = `
        <div class="el-feedback ${correct ? 'correct' : 'incorrect'}">
          ${correct ? escapeHtml(t('correctPrefix', lang)) : escapeHtml(t('incorrectPrefix', lang))} ${escapeHtml(tr(q.explanation, lang))}
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

    answerArea.querySelectorAll('.el-choice').forEach(btn => {
      btn.addEventListener('click', () => submit(Number(btn.getAttribute('data-choice')), btn));
    });

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
    const lang = getLang();
    const progress = ctx.getProgress();
    const score = progress ? progress.score : 0;
    const total = QUESTIONS.length;
    mount.innerHTML = `
      <div class="el-summary">
        <div class="el-score">${score} / ${total}</div>
        <p>${escapeHtml(t('summaryText', lang))}</p>
        <button type="button" class="el-retake-btn" id="el-retake-btn">${escapeHtml(t('retakeQuiz', lang))}</button>
      </div>
    `;
    mount.querySelector('#el-retake-btn').addEventListener('click', async () => {
      await ctx.saveProgress({ status: 'in_progress', score: 0, totalQuestions: total, answers: [] });
      renderQuiz(mount, ctx);
    });
  }

  window.Activities = window.Activities || {};
  window.Activities['elements-review'] = { render };
})();
