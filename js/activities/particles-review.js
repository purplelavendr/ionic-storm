// "Chapter 3 Review: A World of Particles" (registered as CONTENT activity id
// 'particles-review'). Same accordion + graded-quiz shape as matter-review.js
// and elements-review.js: concept -> analogy -> practice with hints, ending
// in a graded "Check for Understanding" quiz. Only the quiz's score is
// saved via ctx.saveProgress.
//
// Supports an EN/ES language toggle (see LANG_KEY below). This only affects
// this activity's own display text -- grading is always based on the
// answer's positional index (QUESTIONS[i].correct), never on which
// language's text is shown, so translation can never affect correctness.
(function () {
  const QUESTIONS = [
    {
      id: 'q1', type: 'mc',
      prompt: { en: 'Why has the model of the atom changed over time?', es: '¿Por qué ha cambiado el modelo del átomo con el tiempo?' },
      choices: [
        { en: 'As scientists gathered new evidence, they revised the model to fit it', es: 'A medida que los científicos reunían nueva evidencia, revisaban el modelo para que encajara' },
        { en: 'It hasn’t changed — atoms have always been drawn the same way', es: 'No ha cambiado — los átomos siempre se han dibujado de la misma manera' },
        { en: 'Because atoms physically change shape over time', es: 'Porque los átomos cambian físicamente de forma con el tiempo' },
        { en: 'Scientists agreed to update the model every 100 years', es: 'Los científicos acordaron actualizar el modelo cada 100 años' }
      ],
      correct: 0,
      explanation: { en: 'Science is dynamic — when new evidence doesn’t fit the current model, scientists revise or replace the model to match the evidence.', es: 'La ciencia es dinámica — cuando nueva evidencia no encaja con el modelo actual, los científicos revisan o reemplazan el modelo para que coincida con la evidencia.' }
    },
    {
      id: 'q2', type: 'mc',
      prompt: { en: 'Who proposed that atoms were simply solid spheres?', es: '¿Quién propuso que los átomos eran simplemente esferas sólidas?' },
      choices: [
        { en: 'John Dalton', es: 'John Dalton' },
        { en: 'J.J. Thomson', es: 'J.J. Thomson' },
        { en: 'Ernest Rutherford', es: 'Ernest Rutherford' },
        { en: 'Niels Bohr', es: 'Niels Bohr' }
      ],
      correct: 0,
      explanation: { en: 'John Dalton proposed the solid sphere model in 1803.', es: 'John Dalton propuso el modelo de esfera sólida en 1803.' }
    },
    {
      id: 'q3', type: 'mc',
      prompt: { en: 'Which model pictured negatively charged electrons scattered through a positively charged "pudding"?', es: '¿Qué modelo representaba electrones con carga negativa dispersos en un "pudín" con carga positiva?' },
      choices: [
        { en: 'Solid sphere model', es: 'El modelo de esfera sólida' },
        { en: 'Plum pudding model', es: 'El modelo del pudín de pasas' },
        { en: 'Nuclear model', es: 'El modelo nuclear' },
        { en: 'Solar system model', es: 'El modelo del sistema solar' }
      ],
      correct: 1,
      explanation: { en: 'Thomson’s plum pudding model (1897) pictured electrons scattered through a positive "pudding."', es: 'El modelo del pudín de pasas de Thomson (1897) representaba electrones dispersos en un "pudín" positivo.' }
    },
    {
      id: 'q4', type: 'mc',
      prompt: { en: 'In Rutherford’s experiment, most tiny particles fired at atoms passed straight through, but a few bounced straight back. What did this suggest?', es: 'En el experimento de Rutherford, la mayoría de las partículas pequeñas disparadas hacia los átomos pasaban directo, pero algunas rebotaban hacia atrás. ¿Qué sugería esto?' },
      choices: [
        { en: 'Atoms are solid all the way through', es: 'Los átomos son sólidos por completo' },
        { en: 'Atoms have a small, dense, positively charged nucleus', es: 'Los átomos tienen un núcleo pequeño, denso y con carga positiva' },
        { en: 'Atoms have no charge at all', es: 'Los átomos no tienen ninguna carga' },
        { en: 'Electrons are heavier than protons', es: 'Los electrones son más pesados que los protones' }
      ],
      correct: 1,
      explanation: { en: 'Only a small, dense, concentrated positive nucleus could deflect particles straight back — most particles passing through showed atoms are mostly empty space.', es: 'Solo un núcleo positivo pequeño, denso y concentrado podía hacer rebotar partículas directamente hacia atrás — que la mayoría de las partículas pasara directo mostró que los átomos son en su mayoría espacio vacío.' }
    },
    {
      id: 'q5', type: 'mc',
      prompt: { en: 'Which model pictured electrons orbiting the nucleus at set distances, like planets orbiting the sun?', es: '¿Qué modelo representaba a los electrones orbitando el núcleo a distancias fijas, como planetas alrededor del sol?' },
      choices: [
        { en: 'Plum pudding model', es: 'El modelo del pudín de pasas' },
        { en: 'Nuclear model', es: 'El modelo nuclear' },
        { en: 'Solar system (Bohr) model', es: 'El modelo del sistema solar (de Bohr)' },
        { en: 'Solid sphere model', es: 'El modelo de esfera sólida' }
      ],
      correct: 2,
      explanation: { en: 'Bohr’s solar system model (1913) pictured electrons orbiting the nucleus at set distances.', es: 'El modelo del sistema solar de Bohr (1913) representaba a los electrones orbitando el núcleo a distancias fijas.' }
    },
    {
      id: 'q6', type: 'mc',
      prompt: { en: 'Who discovered the neutron?', es: '¿Quién descubrió el neutrón?' },
      choices: [
        { en: 'John Dalton', es: 'John Dalton' },
        { en: 'J.J. Thomson', es: 'J.J. Thomson' },
        { en: 'James Chadwick', es: 'James Chadwick' },
        { en: 'Ernest Rutherford', es: 'Ernest Rutherford' }
      ],
      correct: 2,
      explanation: { en: 'James Chadwick discovered the neutron in 1932.', es: 'James Chadwick descubrió el neutrón en 1932.' }
    },
    {
      id: 'q7', type: 'mc',
      prompt: { en: 'What is the charge of a proton?', es: '¿Cuál es la carga de un protón?' },
      choices: [
        { en: 'Positive', es: 'Positiva' },
        { en: 'Negative', es: 'Negativa' },
        { en: 'Neutral (no charge)', es: 'Neutra (sin carga)' },
        { en: 'It varies', es: 'Varía' }
      ],
      correct: 0,
      explanation: { en: 'Protons carry a positive charge.', es: 'Los protones tienen carga positiva.' }
    },
    {
      id: 'q8', type: 'mc',
      prompt: { en: 'Where are protons and neutrons located in an atom?', es: '¿Dónde se ubican los protones y los neutrones en un átomo?' },
      choices: [
        { en: 'Orbiting far from the nucleus', es: 'Orbitando lejos del núcleo' },
        { en: 'In the nucleus', es: 'En el núcleo' },
        { en: 'Evenly spread throughout the whole atom', es: 'Distribuidos uniformemente por todo el átomo' },
        { en: 'Outside the atom entirely', es: 'Fuera del átomo por completo' }
      ],
      correct: 1,
      explanation: { en: 'Protons and neutrons are packed together in the dense nucleus at the center of the atom.', es: 'Los protones y los neutrones están agrupados en el núcleo denso en el centro del átomo.' }
    },
    {
      id: 'q9', type: 'mc',
      prompt: { en: 'What is the charge of an electron?', es: '¿Cuál es la carga de un electrón?' },
      choices: [
        { en: 'Positive', es: 'Positiva' },
        { en: 'Negative', es: 'Negativa' },
        { en: 'Neutral', es: 'Neutra' },
        { en: 'It varies', es: 'Varía' }
      ],
      correct: 1,
      explanation: { en: 'Electrons carry a negative charge.', es: 'Los electrones tienen carga negativa.' }
    },
    {
      id: 'q10', type: 'mc',
      prompt: { en: 'An atom has 6 protons and 6 electrons. What is its overall charge?', es: 'Un átomo tiene 6 protones y 6 electrones. ¿Cuál es su carga total?' },
      choices: [
        { en: 'Positive', es: 'Positiva' },
        { en: 'Negative', es: 'Negativa' },
        { en: '0 (neutral)', es: '0 (neutra)' },
        { en: 'Cannot be determined', es: 'No se puede determinar' }
      ],
      correct: 2,
      explanation: { en: 'Equal numbers of positive and negative charges cancel out, giving an overall charge of 0.', es: 'Cantidades iguales de cargas positivas y negativas se cancelan entre sí, dando una carga total de 0.' }
    },
    {
      id: 'q11', type: 'mc',
      prompt: { en: 'What is the atomic number of an element?', es: '¿Qué es el número atómico de un elemento?' },
      choices: [
        { en: 'The number of neutrons', es: 'El número de neutrones' },
        { en: 'The number of protons in the nucleus', es: 'El número de protones en el núcleo' },
        { en: 'The total mass of the atom', es: 'La masa total del átomo' },
        { en: 'The number of electron shells', es: 'El número de capas de electrones' }
      ],
      correct: 1,
      explanation: { en: 'Atomic number is the number of protons in the nucleus of an atom.', es: 'El número atómico es el número de protones en el núcleo de un átomo.' }
    },
    {
      id: 'q12', type: 'mc',
      prompt: { en: 'The periodic table arranges elements in order by:', es: 'La tabla periódica organiza los elementos en orden según:' },
      choices: [
        { en: 'Alphabetical order', es: 'Orden alfabético' },
        { en: 'Atomic number', es: 'El número atómico' },
        { en: 'Average atomic mass exactly', es: 'Exactamente la masa atómica promedio' },
        { en: 'Discovery date', es: 'La fecha de descubrimiento' }
      ],
      correct: 1,
      explanation: { en: 'Elements are arranged by atomic number — each element has one more proton than the one before it.', es: 'Los elementos se organizan según el número atómico — cada elemento tiene un protón más que el anterior.' }
    },
    {
      id: 'q13', type: 'mc',
      prompt: { en: 'In a neutral atom, the number of electrons is:', es: 'En un átomo neutro, el número de electrones es:' },
      choices: [
        { en: 'Always 8', es: 'Siempre 8' },
        { en: 'Equal to the number of protons', es: 'Igual al número de protones' },
        { en: 'Equal to the number of neutrons', es: 'Igual al número de neutrones' },
        { en: 'Always greater than the number of protons', es: 'Siempre mayor que el número de protones' }
      ],
      correct: 1,
      explanation: { en: 'In a neutral atom, electrons and protons are always equal in number.', es: 'En un átomo neutro, los electrones y los protones siempre son iguales en número.' }
    },
    {
      id: 'q14', type: 'mc',
      prompt: { en: 'How do you estimate the number of neutrons in an atom?', es: '¿Cómo se estima el número de neutrones en un átomo?' },
      choices: [
        { en: 'Add the atomic number and average atomic mass', es: 'Sumar el número atómico y la masa atómica promedio' },
        { en: 'Subtract the atomic number from the average atomic mass (rounded)', es: 'Restar el número atómico de la masa atómica promedio (redondeada)' },
        { en: 'Multiply the number of protons by 2', es: 'Multiplicar el número de protones por 2' },
        { en: 'Divide the average atomic mass by 2', es: 'Dividir la masa atómica promedio entre 2' }
      ],
      correct: 1,
      explanation: { en: 'Neutrons ≈ average atomic mass (rounded to a whole number) − atomic number.', es: 'Neutrones ≈ masa atómica promedio (redondeada a un número entero) − número atómico.' }
    },
    {
      id: 'q15', type: 'mc',
      prompt: { en: 'What is the mass of a single atom (in amu) equal to?', es: '¿A qué es igual la masa de un solo átomo (en uma)?' },
      choices: [
        { en: 'The number of electrons only', es: 'Solo al número de electrones' },
        { en: 'The number of protons plus the number of neutrons', es: 'Al número de protones más el número de neutrones' },
        { en: 'The atomic number times 2', es: 'Al número atómico multiplicado por 2' },
        { en: 'The average atomic mass, exactly', es: 'Exactamente a la masa atómica promedio' }
      ],
      correct: 1,
      explanation: { en: 'A proton and a neutron each have a mass of about 1 amu, and electron mass is negligible, so atom mass = protons + neutrons.', es: 'Un protón y un neutrón tienen cada uno una masa de aproximadamente 1 uma, y la masa del electrón es insignificante, así que la masa del átomo = protones + neutrones.' }
    },
    {
      id: 'q16', type: 'mc',
      prompt: { en: 'A periodic table box for potassium shows the decimal number 39.10 below the symbol K. What is this number called?', es: 'Un recuadro de la tabla periódica para el potasio muestra el número decimal 39.10 debajo del símbolo K. ¿Cómo se llama este número?' },
      choices: [
        { en: 'Atomic number', es: 'Número atómico' },
        { en: 'Average atomic mass', es: 'Masa atómica promedio' },
        { en: 'Mass of a single atom', es: 'Masa de un solo átomo' },
        { en: 'Number of neutrons', es: 'Número de neutrones' }
      ],
      correct: 1,
      explanation: { en: 'A decimal number on the periodic table is the average atomic mass — a weighted average across all naturally occurring isotopes.', es: 'Un número decimal en la tabla periódica es la masa atómica promedio — un promedio ponderado de todos los isótopos naturales.' }
    },
    {
      id: 'q17', type: 'mc',
      prompt: { en: 'That same box shows the whole number 19 above the symbol K. This number is the atomic number, which is also equal to the number of ___ in each atom of potassium.', es: 'Ese mismo recuadro muestra el número entero 19 encima del símbolo K. Este número es el número atómico, que también es igual al número de ___ en cada átomo de potasio.' },
      choices: [
        { en: 'Neutrons', es: 'Neutrones' },
        { en: 'Electrons in an ion', es: 'Electrones en un ion' },
        { en: 'Protons', es: 'Protones' },
        { en: 'Isotopes', es: 'Isótopos' }
      ],
      correct: 2,
      explanation: { en: 'Atomic number always equals the number of protons in an atom of that element.', es: 'El número atómico siempre es igual al número de protones en un átomo de ese elemento.' }
    }
  ];

  const STYLE_ID = 'pt-lesson-styles';
  const FONT_LINK_ID = 'pt-lesson-fonts';
  const SECTION_COUNT = 7; // sections 0-6 (6 content sections + the graded quiz)

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  // ---- Translation (EN/ES) ----
  // LANG_KEY is a shared literal string: matter-review.js and
  // elements-review.js use the exact same key (each file owns its own copy
  // of this small helper block rather than a shared module, matching this
  // codebase's convention), so picking a language in one review carries
  // over to all the others automatically.
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
    headerLabel: { en: 'Chapter 3 · A World of Particles', es: 'Capítulo 3 · Un Mundo de Partículas' },
    headerMeta: { en: 'Self-Paced Review · ~35 Minutes · Good prep for Quiz A/B', es: 'Repaso a tu Propio Ritmo · ~35 Minutos · Buena preparación para el Quiz A/B' },
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
.pt-lesson {
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
.pt-lesson * { box-sizing: border-box; }
.pt-lesson .pt-header {
  background: var(--navy);
  color: var(--cream);
  padding: 2rem 1.75rem 1.6rem;
  position: relative;
  overflow: hidden;
}
.pt-lesson .pt-header::before {
  content: '';
  position: absolute;
  top: -60px; right: -60px;
  width: 220px; height: 220px;
  border-radius: 50%;
  border: 32px solid rgba(46,196,182,0.12);
}
.pt-lesson .pt-lang-toggle {
  position: absolute;
  top: 1.75rem;
  right: 1.75rem;
  z-index: 2;
  display: flex;
  gap: 0.3rem;
}
.pt-lesson .pt-lang-btn {
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
.pt-lesson .pt-lang-btn.active { background: var(--teal); border-color: var(--teal); color: var(--navy); }
.pt-lesson .pt-lang-btn:hover:not(.active) { border-color: var(--teal); color: var(--cream); }
.pt-lesson .pt-header-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.68rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--teal);
  margin-bottom: 0.5rem;
  position: relative;
}
.pt-lesson .pt-header h1 {
  font-family: 'Playfair Display', serif;
  font-size: 2rem;
  font-weight: 700;
  line-height: 1.2;
  margin: 0 0 0.4rem;
  position: relative;
}
.pt-lesson .pt-header-meta {
  font-size: 0.82rem;
  color: rgba(247,243,236,0.65);
  font-family: 'JetBrains Mono', monospace;
  position: relative;
}
.pt-lesson .pt-progress-wrap {
  background: var(--navy-mid);
  padding: 0.7rem 1.75rem;
  display: flex;
  align-items: center;
  gap: 0.9rem;
  position: sticky;
  top: 0;
  z-index: 10;
}
.pt-lesson .pt-progress-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.65rem;
  color: var(--teal);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  white-space: nowrap;
}
.pt-lesson .pt-progress-track {
  flex: 1;
  height: 4px;
  background: rgba(255,255,255,0.12);
  border-radius: 2px;
  overflow: hidden;
}
.pt-lesson .pt-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--teal), var(--amber));
  border-radius: 2px;
  transition: width 0.4s ease;
  width: 0%;
}
.pt-lesson .pt-progress-count {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.65rem;
  color: rgba(247,243,236,0.55);
  white-space: nowrap;
}
.pt-lesson main {
  padding: 1.5rem 1.25rem 2.5rem;
}
.pt-lesson .section-card {
  background: white;
  border-radius: 12px;
  margin-bottom: 1.1rem;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  overflow: hidden;
}
.pt-lesson .section-header {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 1rem 1.2rem;
  cursor: pointer;
  user-select: none;
  border-bottom: 1px solid transparent;
}
.pt-lesson .section-header:hover { background: #fafafa; }
.pt-lesson .section-header.open { border-bottom-color: var(--cream-dark); }
.pt-lesson .section-num {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.7rem;
  font-weight: 600;
  color: white;
  background: var(--navy);
  border-radius: 6px;
  padding: 0.22rem 0.5rem;
  flex-shrink: 0;
}
.pt-lesson .section-card.done .section-num { background: var(--teal-dim); }
.pt-lesson .section-title {
  font-family: 'Playfair Display', serif;
  font-size: 1.05rem;
  font-weight: 700;
  flex: 1;
}
.pt-lesson .section-time {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.65rem;
  color: var(--text-muted);
}
.pt-lesson .section-arrow {
  font-size: 0.9rem;
  color: var(--text-muted);
  transition: transform 0.25s;
  flex-shrink: 0;
}
.pt-lesson .section-header.open .section-arrow { transform: rotate(180deg); }
.pt-lesson .section-body { display: none; padding: 1.3rem; }
.pt-lesson .section-body.open { display: block; animation: ptFadeIn 0.25s ease; }
@keyframes ptFadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
.pt-lesson h2 {
  font-family: 'Playfair Display', serif;
  font-size: 1.25rem;
  color: var(--navy);
  margin: 0 0 0.6rem;
}
.pt-lesson h3 {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--navy-mid);
  margin: 1.1rem 0 0.5rem;
}
.pt-lesson p { margin: 0 0 0.85rem; }
.pt-lesson p:last-child { margin-bottom: 0; }
.pt-lesson .note-box {
  background: var(--note-bg);
  border-left: 4px solid var(--note-border);
  border-radius: 0 8px 8px 0;
  padding: 0.9rem 1.1rem;
  margin: 1.1rem 0;
  display: flex;
  gap: 0.7rem;
  font-size: 0.9rem;
}
.pt-lesson .note-box .note-icon { font-size: 1.15rem; flex-shrink: 0; }
.pt-lesson .concept-box {
  background: linear-gradient(135deg, var(--navy) 0%, var(--navy-mid) 100%);
  color: var(--cream);
  border-radius: 10px;
  padding: 1.2rem 1.4rem;
  margin: 1.1rem 0;
}
.pt-lesson .concept-box .concept-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.62rem;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  color: var(--teal);
  margin-bottom: 0.4rem;
}
.pt-lesson .concept-box p { color: rgba(247,243,236,0.92); margin-bottom: 0; }
.pt-lesson .info-panel {
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 8px;
  padding: 0.9rem 1.1rem;
  margin: 1.1rem 0;
  font-size: 0.9rem;
}
.pt-lesson .info-panel .panel-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.62rem;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: #0369a1;
  margin-bottom: 0.35rem;
}
.pt-lesson table { width: 100%; border-collapse: collapse; margin: 0.9rem 0; font-size: 0.85rem; }
.pt-lesson th {
  background: var(--navy);
  color: var(--cream);
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 0.55rem 0.75rem;
  text-align: left;
}
.pt-lesson td { padding: 0.5rem 0.75rem; border-bottom: 1px solid var(--cream-dark); }
.pt-lesson tr:nth-child(even) td { background: #fafafa; }
.pt-lesson ul, .pt-lesson ol { padding-left: 1.3rem; margin: 0 0 0.85rem; }
.pt-lesson li { margin-bottom: 0.3rem; font-size: 0.93rem; }
.pt-lesson .objectives-list { list-style: none; padding: 0; margin: 0.4rem 0; }
.pt-lesson .objectives-list li {
  display: flex; align-items: flex-start; gap: 0.55rem;
  padding: 0.4rem 0; font-size: 0.92rem;
  border-bottom: 1px solid var(--cream-dark);
}
.pt-lesson .objectives-list li:last-child { border-bottom: none; }
.pt-lesson .obj-check { color: var(--teal); flex-shrink: 0; }
.pt-lesson .practice-problem {
  border: 1.5px solid var(--cream-dark);
  border-radius: 10px;
  margin-bottom: 1.1rem;
  overflow: hidden;
}
.pt-lesson .pp-header {
  display: flex; align-items: center; gap: 0.65rem;
  padding: 0.85rem 1.1rem;
  background: #fafafa;
  border-bottom: 1px solid var(--cream-dark);
}
.pt-lesson .pp-num {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.7rem; font-weight: 700; color: white;
  background: var(--amber);
  border-radius: 6px; padding: 0.18rem 0.45rem; flex-shrink: 0;
}
.pt-lesson .pp-difficulty {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.6rem; letter-spacing: 0.08em; text-transform: uppercase;
  margin-left: auto;
}
.pt-lesson .diff-basic { color: #16a34a; }
.pt-lesson .diff-medium { color: #d97706; }
.pt-lesson .diff-challenge { color: #dc2626; }
.pt-lesson .pp-body { padding: 0.95rem 1.1rem; }
.pt-lesson .pp-body p { font-size: 0.92rem; }
.pt-lesson .hint-btn, .pt-lesson .reveal-btn, .pt-lesson .mark-done-btn, .pt-lesson .pt-choice, .pt-lesson .pt-next-btn, .pt-lesson .pt-retake-btn {
  font-family: 'JetBrains Mono', monospace;
  cursor: pointer;
  border: none;
}
.pt-lesson .hint-btn, .pt-lesson .reveal-btn {
  border-radius: 6px;
  padding: 0.4rem 0.8rem;
  font-size: 0.68rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.pt-lesson .hint-btn { background: #fef3c7; color: #92400e; border: 1px solid #fcd34d; margin-right: 0.5rem; }
.pt-lesson .hint-btn:hover { background: #fde68a; }
.pt-lesson .reveal-btn { background: var(--navy); color: white; }
.pt-lesson .reveal-btn:hover { background: var(--navy-light); }
.pt-lesson .hint-box, .pt-lesson .answer-box {
  border-radius: 7px; padding: 0.75rem 0.95rem; margin-top: 0.7rem;
  font-size: 0.87rem; display: none;
}
.pt-lesson .hint-box.open, .pt-lesson .answer-box.open { display: block; animation: ptFadeIn 0.2s ease; }
.pt-lesson .hint-box { background: #fffbeb; border: 1px dashed #fcd34d; color: #78350f; }
.pt-lesson .answer-box { background: var(--correct-bg); border: 1px solid var(--correct-border); color: #065f46; }
.pt-lesson .answer-box .answer-label {
  font-family: 'JetBrains Mono', monospace; font-size: 0.62rem;
  text-transform: uppercase; letter-spacing: 0.1em; color: var(--teal-dim);
  margin-bottom: 0.35rem; font-weight: 700;
}
.pt-lesson .mark-done-btn {
  display: block; width: 100%; margin-top: 1.2rem;
  background: var(--navy); color: var(--cream);
  border-radius: 8px; padding: 0.75rem 1rem;
  font-size: 0.75rem; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase;
  transition: background 0.2s;
}
.pt-lesson .mark-done-btn:hover:not(:disabled) { background: var(--teal-dim); }
.pt-lesson .mark-done-btn:disabled { background: var(--cream-dark); color: var(--text-muted); cursor: not-allowed; }
.pt-lesson .quiz-note {
  background: var(--note-bg);
  border-left: 4px solid var(--note-border);
  border-radius: 0 8px 8px 0;
  padding: 0.9rem 1.1rem;
  margin-bottom: 1.1rem;
  font-size: 0.88rem;
}
.pt-lesson .quiz-progress-bar {
  height: 6px; background: var(--cream-dark); border-radius: 999px; overflow: hidden; margin: 0.6rem 0 0.9rem;
}
.pt-lesson .quiz-progress-fill {
  height: 100%; background: linear-gradient(90deg, var(--navy), var(--teal)); transition: width 0.2s ease;
}
.pt-lesson .quiz-question-count {
  font-family: 'JetBrains Mono', monospace; font-size: 0.72rem; color: var(--text-muted);
}
.pt-lesson .quiz-prompt {
  font-family: 'Playfair Display', serif;
  font-size: 1.1rem; font-weight: 700; color: var(--navy);
  margin: 0.5rem 0 1rem;
}
.pt-lesson .pt-choice {
  display: block; width: 100%; text-align: left;
  background: white; border: 1.5px solid var(--cream-dark);
  border-radius: 8px; padding: 0.7rem 0.9rem; margin-bottom: 0.6rem;
  font-size: 0.93rem; color: var(--text); font-family: 'Source Serif 4', serif;
  transition: border-color 0.15s, background 0.15s;
}
.pt-lesson .pt-choice:hover:not(:disabled) { border-color: var(--teal); background: #f3fdfc; }
.pt-lesson .pt-choice:disabled { cursor: default; }
.pt-lesson .pt-choice.selected-correct { border-color: var(--correct-border); background: var(--correct-bg); }
.pt-lesson .pt-choice.selected-incorrect { border-color: #dc2626; background: #fef2f2; }
.pt-lesson .pt-feedback {
  border-radius: 8px; padding: 0.75rem 1rem; margin-top: 0.4rem; font-size: 0.9rem; font-weight: 600;
}
.pt-lesson .pt-feedback.correct { background: var(--correct-bg); color: var(--teal-dim); }
.pt-lesson .pt-feedback.incorrect { background: #fef2f2; color: #b91c1c; }
.pt-lesson .pt-next-btn, .pt-lesson .pt-retake-btn {
  background: var(--navy); color: white; border-radius: 8px;
  padding: 0.65rem 1.2rem; font-size: 0.75rem; font-weight: 600;
  letter-spacing: 0.06em; text-transform: uppercase; margin-top: 1rem;
}
.pt-lesson .pt-next-btn:hover, .pt-lesson .pt-retake-btn:hover { background: var(--navy-light); }
.pt-lesson .pt-summary { text-align: center; padding: 1rem 0.5rem; }
.pt-lesson .pt-score {
  font-family: 'JetBrains Mono', monospace;
  font-size: 2.4rem; font-weight: 700; color: var(--navy); margin: 0.4rem 0;
}
`;
    document.head.appendChild(style);
  }

  // ---- Static lesson content (sections 0-5, ungraded / session-only) ----

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
          <p><strong>${escapeHtml(prompt)}</strong></p>
          <button type="button" class="hint-btn" data-hint-target="hint-${idSuffix}">${escapeHtml(t('hintShow', lang))}</button>
          <button type="button" class="reveal-btn" data-answer-target="ans-${idSuffix}">${escapeHtml(t('revealAnswer', lang))}</button>
          <div class="hint-box" id="hint-${idSuffix}">${escapeHtml(hint)}</div>
          <div class="answer-box" id="ans-${idSuffix}">
            <div class="answer-label">${escapeHtml(t('answerLabel', lang))}</div>
            ${escapeHtml(answer)}
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
        <p>This review pulls together <strong>Lessons 11–12</strong> — the history of the atomic model, subatomic particles, atomic number, and atomic mass — to get you ready for <strong>Chapter 3 Quiz A/B</strong>.</p>
        <p><strong>How this works:</strong></p>
        <ul>
          <li>Click a section header to open it and read through the content.</li>
          <li>Work through each practice problem yourself before clicking <em>Reveal Answer</em>.</li>
          <li>Click <strong>Mark Complete</strong> at the bottom of each section to move to the next.</li>
          <li>The last section is a <strong>graded Check for Understanding</strong> — that one saves your score for your teacher.</li>
        </ul>
        <p><strong>By the end of this review, you should be able to:</strong></p>
        <ul class="objectives-list">
          <li><span class="obj-check">◎</span> Explain why the model of the atom has changed over time</li>
          <li><span class="obj-check">◎</span> Describe the historical models of the atom (Dalton, Thomson, Rutherford, Bohr) in order</li>
          <li><span class="obj-check">◎</span> Identify the charge, location, and role of protons, neutrons, and electrons</li>
          <li><span class="obj-check">◎</span> Explain what atomic number means, and use it to find the protons and electrons in a neutral atom</li>
          <li><span class="obj-check">◎</span> Calculate the number of neutrons and the mass of an atom using atomic number and average atomic mass</li>
        </ul>`,
        es: `
        <p>Este repaso reúne las <strong>Lecciones 11 a 12</strong> — la historia del modelo atómico, las partículas subatómicas, el número atómico y la masa atómica — para prepararte para el <strong>Quiz A/B del Capítulo 3</strong>.</p>
        <p><strong>Cómo funciona esto:</strong></p>
        <ul>
          <li>Haz clic en el encabezado de una sección para abrirla y leer el contenido.</li>
          <li>Resuelve cada problema de práctica tú mismo antes de hacer clic en <em>Mostrar Respuesta</em>.</li>
          <li>Haz clic en <strong>Marcar como Completo</strong> al final de cada sección para pasar a la siguiente.</li>
          <li>La última sección es una <strong>Comprobación de Comprensión calificada</strong> — esa guarda tu puntaje para tu maestro.</li>
        </ul>
        <p><strong>Al terminar este repaso, deberías poder:</strong></p>
        <ul class="objectives-list">
          <li><span class="obj-check">◎</span> Explicar por qué el modelo del átomo ha cambiado con el tiempo</li>
          <li><span class="obj-check">◎</span> Describir los modelos históricos del átomo (Dalton, Thomson, Rutherford, Bohr) en orden</li>
          <li><span class="obj-check">◎</span> Identificar la carga, la ubicación y el papel de los protones, los neutrones y los electrones</li>
          <li><span class="obj-check">◎</span> Explicar qué significa el número atómico, y usarlo para encontrar los protones y electrones de un átomo neutro</li>
          <li><span class="obj-check">◎</span> Calcular el número de neutrones y la masa de un átomo usando el número atómico y la masa atómica promedio</li>
        </ul>`
      }
    },
    {
      title: { en: 'The Atomic Model Through Time', es: 'El Modelo Atómico a Través del Tiempo' },
      time: { en: '6 min', es: '6 min' },
      bodyHtml: {
        en: `
        <h2>Building a Better Model</h2>
        <div class="concept-box">
          <div class="concept-label">Definition</div>
          <p><strong>Model</strong>: a simplified representation of something more complex, used to help understand a real object or process.</p>
        </div>
        <table>
          <thead><tr><th>Scientist</th><th>Year</th><th>Model</th></tr></thead>
          <tbody>
            <tr><td>Dalton</td><td>1803</td><td>Solid sphere — atoms are simple, solid balls with nothing inside</td></tr>
            <tr><td>Thomson</td><td>1897</td><td>Plum pudding — negatively charged electrons scattered through a positive "pudding"</td></tr>
            <tr><td>Rutherford</td><td>1911</td><td>Nuclear model — a small, dense, positively charged nucleus at the center</td></tr>
            <tr><td>Bohr</td><td>1913</td><td>Solar system model — electrons orbit the nucleus at set distances, like planets</td></tr>
          </tbody>
        </table>
        <div class="info-panel">
          <div class="panel-label">🔍 Why Models Change</div>
          <p>Science is dynamic: models get revised or replaced whenever new evidence doesn't fit the old model. That's exactly what happened with the atom — each new piece of evidence (Thomson's electron, Rutherford's nucleus, Bohr's orbits, and later Chadwick's neutron in 1932) forced scientists to build a better model.</p>
        </div>
        <div class="note-box">
          <span class="note-icon">📝</span>
          <div class="note-text">On your guided notes, write: <em>"A model is a simplified representation of something more complex. Scientific models change as new evidence is discovered."</em></div>
        </div>`,
        es: `
        <h2>Construyendo un Mejor Modelo</h2>
        <div class="concept-box">
          <div class="concept-label">Definición</div>
          <p><strong>Modelo</strong>: una representación simplificada de algo más complejo, que se usa para ayudar a entender un objeto o proceso real.</p>
        </div>
        <table>
          <thead><tr><th>Científico</th><th>Año</th><th>Modelo</th></tr></thead>
          <tbody>
            <tr><td>Dalton</td><td>1803</td><td>Esfera sólida — los átomos son simples bolas sólidas sin nada adentro</td></tr>
            <tr><td>Thomson</td><td>1897</td><td>Pudín de pasas — electrones con carga negativa dispersos en un "pudín" positivo</td></tr>
            <tr><td>Rutherford</td><td>1911</td><td>Modelo nuclear — un núcleo pequeño, denso y con carga positiva en el centro</td></tr>
            <tr><td>Bohr</td><td>1913</td><td>Modelo del sistema solar — los electrones orbitan el núcleo a distancias fijas, como planetas</td></tr>
          </tbody>
        </table>
        <div class="info-panel">
          <div class="panel-label">🔍 Por Qué Cambian los Modelos</div>
          <p>La ciencia es dinámica: los modelos se revisan o se reemplazan cuando aparece nueva evidencia que no encaja con el modelo anterior. Eso es exactamente lo que pasó con el átomo — cada nueva pieza de evidencia (el electrón de Thomson, el núcleo de Rutherford, las órbitas de Bohr, y más tarde el neutrón de Chadwick en 1932) obligó a los científicos a construir un mejor modelo.</p>
        </div>
        <div class="note-box">
          <span class="note-icon">📝</span>
          <div class="note-text">En tus apuntes guiados, escribe: <em>"Un modelo es una representación simplificada de algo más complejo. Los modelos científicos cambian cuando se descubre nueva evidencia."</em></div>
        </div>`
      }
    },
    {
      title: { en: 'Protons, Neutrons & Electrons', es: 'Protones, Neutrones y Electrones' },
      time: { en: '7 min', es: '7 min' },
      bodyHtml: {
        en: `
        <h2>The Three Subatomic Particles</h2>
        <div class="concept-box">
          <div class="concept-label">Definition</div>
          <p><strong>Nucleus</strong>: the dense, positively charged structure at the center of an atom, made up of protons and neutrons.</p>
        </div>
        <table>
          <thead><tr><th>Particle</th><th>Charge</th><th>Location</th></tr></thead>
          <tbody>
            <tr><td>Proton</td><td>+1 (positive)</td><td>Nucleus</td></tr>
            <tr><td>Neutron</td><td>0 (no charge)</td><td>Nucleus</td></tr>
            <tr><td>Electron</td><td>−1 (negative)</td><td>Moving around the nucleus</td></tr>
          </tbody>
        </table>
        <div class="note-box">
          <span class="note-icon">📝</span>
          <div class="note-text">On your guided notes, copy this table and memorize the charge and location of each particle.</div>
        </div>
        ${practiceProblem('en', 'sp1', 'A carbon atom has 6 protons and 6 electrons. What is the overall charge of the atom?', 'basic', 'Do the positive and negative charges balance out?', '0 (neutral) — 6 positive charges and 6 negative charges cancel out exactly.')}
        ${practiceProblem('en', 'sp2', 'Which subatomic particle has (essentially) no mass compared to protons and neutrons?', 'medium', 'Think about which particle is left out of atomic mass calculations.', 'The electron — its mass is so small it’s considered negligible, so atomic mass only counts protons and neutrons.')}
        ${practiceProblem('en', 'sp3', 'True or False: If you added one more proton to an atom, it would still be the same element.', 'challenge', 'What determines which element an atom is?', 'False — the number of protons determines an element’s identity. Changing the number of protons changes what element it is.')}`,
        es: `
        <h2>Las Tres Partículas Subatómicas</h2>
        <div class="concept-box">
          <div class="concept-label">Definición</div>
          <p><strong>Núcleo</strong>: la estructura densa y con carga positiva en el centro de un átomo, compuesta por protones y neutrones.</p>
        </div>
        <table>
          <thead><tr><th>Partícula</th><th>Carga</th><th>Ubicación</th></tr></thead>
          <tbody>
            <tr><td>Protón</td><td>+1 (positiva)</td><td>Núcleo</td></tr>
            <tr><td>Neutrón</td><td>0 (sin carga)</td><td>Núcleo</td></tr>
            <tr><td>Electrón</td><td>−1 (negativa)</td><td>Se mueve alrededor del núcleo</td></tr>
          </tbody>
        </table>
        <div class="note-box">
          <span class="note-icon">📝</span>
          <div class="note-text">En tus apuntes guiados, copia esta tabla y memoriza la carga y la ubicación de cada partícula.</div>
        </div>
        ${practiceProblem('es', 'sp1', 'Un átomo de carbono tiene 6 protones y 6 electrones. ¿Cuál es la carga total del átomo?', 'basic', '¿Se equilibran las cargas positivas y negativas?', '0 (neutro) — 6 cargas positivas y 6 cargas negativas se cancelan exactamente.')}
        ${practiceProblem('es', 'sp2', '¿Qué partícula subatómica tiene (prácticamente) ninguna masa comparada con los protones y neutrones?', 'medium', 'Piensa en qué partícula se deja fuera de los cálculos de masa atómica.', 'El electrón — su masa es tan pequeña que se considera insignificante, así que la masa atómica solo cuenta protones y neutrones.')}
        ${practiceProblem('es', 'sp3', 'Verdadero o Falso: Si le agregaras un protón más a un átomo, seguiría siendo el mismo elemento.', 'challenge', '¿Qué determina qué elemento es un átomo?', 'Falso — el número de protones determina la identidad de un elemento. Cambiar el número de protones cambia de qué elemento se trata.')}`
      }
    },
    {
      title: { en: 'Evaluating the Evidence', es: 'Evaluando la Evidencia' },
      time: { en: '8 min', es: '8 min' },
      bodyHtml: {
        en: `
        <p>Scientists don't just guess at models — they build them from evidence. Try reasoning through the same kind of evidence scientists used, one piece at a time.</p>
        ${practiceProblem('en', 'e1', 'Scientists found they could pull a negatively charged particle out of an atom using electricity. Does this better support the solid sphere model or a model with charged particles inside the atom?', 'medium', 'Does the solid sphere model have any parts that could be removed?', 'A model with charged particles inside (like the plum pudding model) — the solid sphere model has no separate parts at all, so nothing could be pulled out of it.')}
        ${practiceProblem('en', 'e2', 'Tiny particles fired at atoms mostly pass straight through, but a few bounce straight back. Does this better support a model where positive charge is spread evenly throughout the atom, or a model with a small, dense nucleus?', 'medium', 'Something has to be dense and concentrated to bounce a particle straight back.', 'A model with a small, dense nucleus — if positive charge were spread out evenly (like pudding), nothing would be concentrated enough to bounce particles straight back.')}
        ${practiceProblem('en', 'e3', 'Electrons that are farther from the center of an atom are easier to remove than electrons close to the center. Does this better support a model where electrons are scattered randomly throughout the atom, or a model where electrons orbit at set distances?', 'challenge', '"Farther from the center" only makes sense if electrons occupy specific distances.', 'A model where electrons orbit at set distances (like the solar system model) — "farther from the center" is only a meaningful idea if electrons sit at specific distances, not scattered randomly like in the plum pudding model.')}`,
        es: `
        <p>Los científicos no solo adivinan los modelos — los construyen a partir de evidencia. Intenta razonar con el mismo tipo de evidencia que usaron los científicos, una pieza a la vez.</p>
        ${practiceProblem('es', 'e1', 'Los científicos descubrieron que podían sacar una partícula con carga negativa de un átomo usando electricidad. ¿Esto apoya mejor el modelo de esfera sólida o un modelo con partículas cargadas dentro del átomo?', 'medium', '¿Tiene el modelo de esfera sólida alguna parte que se pudiera sacar?', 'Un modelo con partículas cargadas dentro (como el modelo del pudín de pasas) — el modelo de esfera sólida no tiene partes separadas en absoluto, así que no se podría sacar nada de él.')}
        ${practiceProblem('es', 'e2', 'Las partículas pequeñas disparadas hacia los átomos en su mayoría pasan directo, pero algunas rebotan hacia atrás. ¿Esto apoya mejor un modelo donde la carga positiva está distribuida uniformemente por todo el átomo, o un modelo con un núcleo pequeño y denso?', 'medium', 'Algo tiene que ser denso y concentrado para hacer rebotar una partícula directamente hacia atrás.', 'Un modelo con un núcleo pequeño y denso — si la carga positiva estuviera distribuida uniformemente (como un pudín), nada estaría lo suficientemente concentrado como para hacer rebotar partículas directamente hacia atrás.')}
        ${practiceProblem('es', 'e3', 'Los electrones que están más lejos del centro de un átomo son más fáciles de quitar que los electrones cercanos al centro. ¿Esto apoya mejor un modelo donde los electrones están dispersos al azar por todo el átomo, o un modelo donde los electrones orbitan a distancias fijas?', 'challenge', '"Más lejos del centro" solo tiene sentido si los electrones ocupan distancias específicas.', 'Un modelo donde los electrones orbitan a distancias fijas (como el modelo del sistema solar) — "más lejos del centro" solo es una idea con sentido si los electrones se ubican a distancias específicas, no dispersos al azar como en el modelo del pudín de pasas.')}`
      }
    },
    {
      title: { en: 'Atomic Number & Atomic Structure', es: 'Número Atómico y Estructura Atómica' },
      time: { en: '7 min', es: '7 min' },
      bodyHtml: {
        en: `
        <h2>What Makes an Element an Element</h2>
        <div class="concept-box">
          <div class="concept-label">Definition</div>
          <p><strong>Atomic number</strong>: the number of protons in the nucleus of an atom of an element.</p>
        </div>
        <div class="info-panel">
          <div class="panel-label">🔍 Reading the Periodic Table</div>
          <p>The periodic table lists elements in order by atomic number — each successive element has exactly one more proton than the one before it.</p>
        </div>
        <div class="note-box">
          <span class="note-icon">📝</span>
          <div class="note-text">On your guided notes, write: <em>"In a neutral atom, the number of electrons always equals the number of protons."</em></div>
        </div>
        ${practiceProblem('en', 'n1', 'An atom has an atomic number of 8. How many protons does it have?', 'basic', 'Atomic number IS the number of protons.', '8 protons — atomic number always equals the number of protons.')}
        ${practiceProblem('en', 'n2', 'A neutral atom has an atomic number of 11. How many electrons does it have?', 'medium', 'In a neutral atom, electrons and protons are equal.', '11 electrons — in a neutral atom, the number of electrons equals the number of protons (which equals the atomic number).')}
        ${practiceProblem('en', 'n3', 'If you could add one more proton to an atom of a given element, what would happen to its identity?', 'challenge', 'Atomic number is what defines which element an atom is.', 'It would become a different element entirely — atomic number (proton count) is what defines an element’s identity on the periodic table.')}`,
        es: `
        <h2>Lo Que Hace que un Elemento Sea un Elemento</h2>
        <div class="concept-box">
          <div class="concept-label">Definición</div>
          <p><strong>Número atómico</strong>: el número de protones en el núcleo de un átomo de un elemento.</p>
        </div>
        <div class="info-panel">
          <div class="panel-label">🔍 Leyendo la Tabla Periódica</div>
          <p>La tabla periódica enumera los elementos en orden según el número atómico — cada elemento sucesivo tiene exactamente un protón más que el anterior.</p>
        </div>
        <div class="note-box">
          <span class="note-icon">📝</span>
          <div class="note-text">En tus apuntes guiados, escribe: <em>"En un átomo neutro, el número de electrones siempre es igual al número de protones."</em></div>
        </div>
        ${practiceProblem('es', 'n1', 'Un átomo tiene un número atómico de 8. ¿Cuántos protones tiene?', 'basic', 'El número atómico ES el número de protones.', '8 protones — el número atómico siempre es igual al número de protones.')}
        ${practiceProblem('es', 'n2', 'Un átomo neutro tiene un número atómico de 11. ¿Cuántos electrones tiene?', 'medium', 'En un átomo neutro, los electrones y los protones son iguales en número.', '11 electrones — en un átomo neutro, el número de electrones es igual al número de protones (que es igual al número atómico).')}
        ${practiceProblem('es', 'n3', 'Si pudieras agregarle un protón más a un átomo de un elemento dado, ¿qué le pasaría a su identidad?', 'challenge', 'El número atómico es lo que define de qué elemento se trata un átomo.', 'Se convertiría en un elemento completamente diferente — el número atómico (la cantidad de protones) es lo que define la identidad de un elemento en la tabla periódica.')}`
      }
    },
    {
      title: { en: 'Atomic Mass & Counting Neutrons', es: 'Masa Atómica y Cómo Contar Neutrones' },
      time: { en: '8 min', es: '8 min' },
      bodyHtml: {
        en: `
        <h2>Two Different Numbers</h2>
        <div class="concept-box">
          <div class="concept-label">Definition</div>
          <p>The <strong>mass of a single atom</strong> (in amu) is the number of protons plus the number of neutrons. A proton has a mass of about 1 amu, and so does a neutron — an electron's mass is so small it's considered negligible.</p>
        </div>
        <div class="info-panel">
          <div class="panel-label">🔍 Two Different Numbers</div>
          <p><strong>Average atomic mass</strong> (the decimal number on the periodic table) is a weighted average across all of an element's naturally occurring isotopes. The <strong>mass of an atom</strong> (protons + neutrons) is always a whole number, for one specific atom. They're close, but not identical.</p>
        </div>
        <div class="concept-box">
          <div class="concept-label">How to Estimate Neutrons</div>
          <p>neutrons ≈ average atomic mass (rounded to the nearest whole number) − atomic number</p>
        </div>
        ${practiceProblem('en', 'm1', 'Fluorine has an atomic number of 9 and an average atomic mass of 19.00. About how many neutrons does a fluorine atom have?', 'basic', 'Subtract the atomic number from the (rounded) average atomic mass.', '10 neutrons — 19 (rounded average atomic mass) − 9 (atomic number) = 10.')}
        ${practiceProblem('en', 'm2', 'Using your answer above, what is the mass (in amu) of a fluorine atom with 9 protons and 10 neutrons?', 'medium', 'Mass of an atom = protons + neutrons.', '19 amu — 9 protons + 10 neutrons = 19.')}
        ${practiceProblem('en', 'm3', 'Chlorine has an atomic number of 17 and an average atomic mass of 35.45. Find its number of neutrons, then its mass as a single atom (in amu).', 'challenge', 'Round 35.45 to the nearest whole number first.', 'Neutrons: 35 (rounded) − 17 = 18. Mass of the atom: 17 + 18 = 35 amu.')}`,
        es: `
        <h2>Dos Números Diferentes</h2>
        <div class="concept-box">
          <div class="concept-label">Definición</div>
          <p>La <strong>masa de un solo átomo</strong> (en uma) es el número de protones más el número de neutrones. Un protón tiene una masa de aproximadamente 1 uma, y un neutrón también — la masa de un electrón es tan pequeña que se considera insignificante.</p>
        </div>
        <div class="info-panel">
          <div class="panel-label">🔍 Dos Números Diferentes</div>
          <p>La <strong>masa atómica promedio</strong> (el número decimal en la tabla periódica) es un promedio ponderado de todos los isótopos naturales de un elemento. La <strong>masa de un átomo</strong> (protones + neutrones) siempre es un número entero, para un átomo específico. Son parecidos, pero no idénticos.</p>
        </div>
        <div class="concept-box">
          <div class="concept-label">Cómo Estimar los Neutrones</div>
          <p>neutrones ≈ masa atómica promedio (redondeada al número entero más cercano) − número atómico</p>
        </div>
        ${practiceProblem('es', 'm1', 'El flúor tiene un número atómico de 9 y una masa atómica promedio de 19.00. ¿Aproximadamente cuántos neutrones tiene un átomo de flúor?', 'basic', 'Resta el número atómico de la masa atómica promedio (redondeada).', '10 neutrones — 19 (masa atómica promedio redondeada) − 9 (número atómico) = 10.')}
        ${practiceProblem('es', 'm2', 'Usando tu respuesta anterior, ¿cuál es la masa (en uma) de un átomo de flúor con 9 protones y 10 neutrones?', 'medium', 'Masa de un átomo = protones + neutrones.', '19 uma — 9 protones + 10 neutrones = 19.')}
        ${practiceProblem('es', 'm3', 'El cloro tiene un número atómico de 17 y una masa atómica promedio de 35.45. Encuentra su número de neutrones, y luego su masa como átomo individual (en uma).', 'challenge', 'Primero redondea 35.45 al número entero más cercano.', 'Neutrones: 35 (redondeado) − 17 = 18. Masa del átomo: 17 + 18 = 35 uma.')}`
      }
    }
  ];

  function render(host, ctx) {
    ensureStylesInjected();
    const lang = getLang();

    const sectionsHtml = STATIC_SECTIONS.map((sec, i) => `
      <div class="section-card" id="pt-sec-${i}" data-section="${i}">
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
      <div class="pt-lesson">
        <div class="pt-header">
          <div class="pt-lang-toggle" role="group" aria-label="${escapeHtml(t('langToggleAria', lang))}">
            <button type="button" class="pt-lang-btn${lang === 'en' ? ' active' : ''}" data-lang="en">EN</button>
            <button type="button" class="pt-lang-btn${lang === 'es' ? ' active' : ''}" data-lang="es">ES</button>
          </div>
          <div class="pt-header-label">${escapeHtml(t('headerLabel', lang))}</div>
          <h1>${escapeHtml(ctx.activity.title)}</h1>
          <div class="pt-header-meta">${escapeHtml(t('headerMeta', lang))}</div>
        </div>
        <div class="pt-progress-wrap">
          <span class="pt-progress-label">${escapeHtml(t('progress', lang))}</span>
          <div class="pt-progress-track"><div class="pt-progress-fill" id="pt-progress-fill"></div></div>
          <span class="pt-progress-count" id="pt-progress-count">${escapeHtml(t('sectionCount', lang, 0, SECTION_COUNT))}</span>
        </div>
        <main>
          ${sectionsHtml}
          <div class="section-card" id="pt-sec-${SECTION_COUNT - 1}" data-section="${SECTION_COUNT - 1}">
            <div class="section-header" data-toggle="${SECTION_COUNT - 1}">
              <span class="section-num">✓</span>
              <span class="section-title">${escapeHtml(t('checkForUnderstanding', lang))}</span>
              <span class="section-time">${escapeHtml(t('quizTimeGraded', lang))}</span>
              <span class="section-arrow">▼</span>
            </div>
            <div class="section-body">
              <div class="quiz-note">${t('quizNote', lang)}</div>
              <div id="pt-quiz-mount"></div>
            </div>
          </div>
        </main>
      </div>
    `;

    const root = host.querySelector('.pt-lesson');
    const quizIndex = SECTION_COUNT - 1;
    const completed = new Array(SECTION_COUNT).fill(false);

    function updateProgress() {
      const done = completed.filter(Boolean).length;
      const pct = Math.round((done / SECTION_COUNT) * 100);
      root.querySelector('#pt-progress-fill').style.width = pct + '%';
      root.querySelector('#pt-progress-count').textContent = t('sectionCount', lang, done, SECTION_COUNT);
    }

    function openSection(i, scroll) {
      const card = root.querySelector(`#pt-sec-${i}`);
      if (!card) return;
      card.querySelector('.section-body').classList.add('open');
      card.querySelector('.section-header').classList.add('open');
      if (scroll) card.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function toggleSection(i) {
      const card = root.querySelector(`#pt-sec-${i}`);
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
        root.querySelector(`#pt-sec-${i}`).classList.add('done');
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
    const quizMount = root.querySelector('#pt-quiz-mount');
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
      <div id="pt-answer-area"></div>
      <div id="pt-feedback-area"></div>
      <button type="button" class="pt-next-btn" id="pt-next-btn" style="display:none;">${escapeHtml(t('nextQuestion', lang))}</button>
    `;

    const answerArea = mount.querySelector('#pt-answer-area');
    const feedbackArea = mount.querySelector('#pt-feedback-area');
    const nextBtn = mount.querySelector('#pt-next-btn');
    let submitted = false;

    answerArea.innerHTML = q.choices.map((choice, i) => `
      <button type="button" class="pt-choice" data-choice="${i}">${escapeHtml(tr(choice, lang))}</button>
    `).join('');

    function submit(response, btnEl) {
      if (submitted) return;
      submitted = true;

      const correct = response === q.correct;
      answerArea.querySelectorAll('.pt-choice').forEach(el => {
        el.disabled = true;
        const val = Number(el.getAttribute('data-choice'));
        if (val === q.correct) el.classList.add('selected-correct');
        else if (el === btnEl) el.classList.add('selected-incorrect');
      });

      feedbackArea.innerHTML = `
        <div class="pt-feedback ${correct ? 'correct' : 'incorrect'}">
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

    answerArea.querySelectorAll('.pt-choice').forEach(btn => {
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
      <div class="pt-summary">
        <div class="pt-score">${score} / ${total}</div>
        <p>${escapeHtml(t('summaryText', lang))}</p>
        <button type="button" class="pt-retake-btn" id="pt-retake-btn">${escapeHtml(t('retakeQuiz', lang))}</button>
      </div>
    `;
    mount.querySelector('#pt-retake-btn').addEventListener('click', async () => {
      await ctx.saveProgress({ status: 'in_progress', score: 0, totalQuestions: total, answers: [] });
      renderQuiz(mount, ctx);
    });
  }

  window.Activities = window.Activities || {};
  window.Activities['particles-review'] = { render };
})();
