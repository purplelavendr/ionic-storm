"""Bilingual labels + paper versions of the mini-tools (fixed problems, computed answers)."""
import json, re
from math import gcd

DATA = None


def load(path):
    global DATA
    DATA = json.load(open(path))
    return DATA


def tr(x, lang):
    if isinstance(x, dict):
        return x.get(lang) or x.get('en')
    return x


# ---- UI strings (EN / ES) ----
S = {
    'title': ('Unit 1 Review: Alchemy', 'Repaso de la Unidad 1: Alquimia'),
    'paper_sub': ('Paper Version — 100-minute plan', 'Versión en Papel — plan de 100 minutos'),
    'comp_sub': ('Companion Worksheet — use with the online review', 'Hoja de Trabajo Complementaria — úsala con el repaso en línea'),
    'name': ('Name', 'Nombre'), 'date': ('Date', 'Fecha'), 'period': ('Period', 'Período'),
    'paper_dir': ('Work through the parts in order. Do the practice before you check an answer with your teacher or notes. On the test, a right answer with no reason earns about half credit — show your thinking. You may use a periodic table and the polyatomic-ion list.',
                  'Trabaja las partes en orden. Haz la práctica antes de revisar una respuesta con tu maestro o tus notas. En el examen, una respuesta correcta sin razón recibe como la mitad del crédito — muestra tu razonamiento. Puedes usar una tabla periódica y la lista de iones poliatómicos.'),
    'comp_dir': ('Keep this next to your screen. In each part, fill in the notes while you read, define the Word Wall terms, and write your answers to the practice problems here before you click Reveal Answer. Your notes and answers do not need to be perfect — they are for you.',
                 'Ten esto junto a tu pantalla. En cada parte, completa las notas mientras lees, define los términos del Muro de Palabras y escribe aquí tus respuestas a los problemas de práctica antes de hacer clic en Mostrar Respuesta. Tus notas y respuestas no tienen que ser perfectas — son para ti.'),
    'plan': ('Your 100-minute plan', 'Tu plan de 100 minutos'),
    'cols_plan': (['Part', 'What you do', 'Min', 'Done by', 'Done'], ['Parte', 'Qué haces', 'Min', 'Termina en', 'Listo']),
    'part': ('Part', 'Parte'), 'min': ('min', 'min'),
    'kq': ('Key Questions', 'Preguntas Clave'), 'kq1': ('Key Question', 'Pregunta Clave'), 'targets': ('Targets', 'Metas'),
    'wordwall': ('Word Wall', 'Muro de Palabras'),
    'mustknow': ('Must know', 'Debes saber'), 'tryit': ('Try it on paper', 'Pruébalo en papel'), 'practice': ('Practice', 'Práctica'),
    'revisit': ('Need more help?', '¿Necesitas más ayuda?'), 'challenge': ('★ Challenge (optional)', '★ Desafío (opcional)'),
    'basic': ('Basic', 'Básico'), 'medium': ('Medium', 'Medio'),
    'bank': ('Word bank', 'Banco de palabras'), 'write_letter': ('Write the letter.', 'Escribe la letra.'),
    'cer_title': ('Explain It Studio', 'Estudio de Explícalo'),
    'claim': ('Claim', 'Afirmación'), 'evidence': ('Evidence', 'Evidencia'), 'reasoning': ('Reasoning', 'Razonamiento'),
    'check_title': ('Graded Check', 'Comprobación Calificada'),
    'check_dir': ('Do this part on your own. You may use a periodic table and the polyatomic-ion list. Show your work. When a question says “explain,” give a reason, not just an answer.',
                  'Haz esta parte por tu cuenta. Puedes usar una tabla periódica y la lista de iones poliatómicos. Muestra tu trabajo. Cuando una pregunta dice “explica”, da una razón, no solo una respuesta.'),
    'score': ('Score', 'Puntaje'), 'circle1': ('Circle one.', 'Encierra una.'), 'checkall': ('Check every one that applies.', 'Marca todas las que apliquen.'),
    'secA': ('A · Words to Know', 'A · Palabras que Debes Saber'), 'secB': ('B · Show the Skill', 'B · Muestra la Destreza'),
    'secC': ('C · Fix the Mistake', 'C · Corrige el Error'), 'secD': ('D · Explain It — circle the strongest answer', 'D · Explícalo — encierra la respuesta más fuerte'),
    'pts': ('pt', 'pt'), 'ptsp': ('pts', 'pts'),
    'poly_ref': ('Polyatomic ions', 'Iones poliatómicos'),
    # companion
    'notes': ('Notes — fill in the blanks as you read “Must know”', 'Notas — completa los espacios mientras lees “Debes saber”'),
    'defs': ('Word Wall — write a short definition, example, or sketch', 'Muro de Palabras — escribe una definición corta, un ejemplo o un dibujo'),
    'defcols': (['Term', 'My definition, example, or sketch'], ['Término', 'Mi definición, ejemplo o dibujo']),
    'toollog': ('Mini-tool log — what did you get right? What tripped you up?', 'Registro de la mini-herramienta — ¿qué acertaste? ¿en qué te equivocaste?'),
    'myans': ('My answer', 'Mi respuesta'),
    'confidence': ('How sure am I now?  1 = lost   2 = getting there   3 = got it   4 = could teach it', '¿Qué tan seguro estoy ahora?  1 = perdido   2 = avanzando   3 = lo tengo   4 = podría enseñarlo'),
    'cer_note': ('Do at least three of these. Write your claim, evidence, and reasoning here, then click “Compare with the model” in the online review and check what yours included.', 'Haz al menos tres de estas. Escribe aquí tu afirmación, evidencia y razonamiento, luego haz clic en “Comparar con el modelo” en el repaso en línea y revisa lo que incluyó la tuya.'),
    'check_log': ('Graded Check log', 'Registro de la Comprobación Calificada'),
    'my_score': ('My score', 'Mi puntaje'), 'my_code': ('My completion code', 'Mi código de finalización'),
    'revisit_list': ('Key Questions I need to revisit', 'Preguntas Clave que necesito repasar'),
    'plan_next': ('My plan to study before the test:', 'Mi plan para estudiar antes del examen:'),
}


def s(key, lang):
    v = S[key]; return v[1] if lang == 'es' else v[0]


# ---- chemistry helpers ----
def count_atoms(f):
    stack = [{}]
    for m in re.finditer(r'([A-Z][a-z]?)(\d*)|(\()|(\))(\d*)', f):
        if m.group(1):
            c = stack[-1]; c[m.group(1)] = c.get(m.group(1), 0) + (int(m.group(2)) if m.group(2) else 1)
        elif m.group(3):
            stack.append({})
        else:
            inner = stack.pop(); k = int(m.group(5)) if m.group(5) else 1
            c = stack[-1]
            for e, n in inner.items(): c[e] = c.get(e, 0) + n * k
    return stack[0]


FILL = [(1, 's', 2), (2, 's', 2), (2, 'p', 6), (3, 's', 2), (3, 'p', 6), (4, 's', 2), (3, 'd', 10), (4, 'p', 6)]
SUPD = '⁰¹²³⁴⁵⁶⁷⁸⁹'


def config(z):
    out, left = [], z
    for n, l, cap in FILL:
        if left <= 0: break
        k = min(cap, left); out.append('%d%s%s' % (n, l, ''.join(SUPD[int(d)] for d in str(k)))); left -= k
    return ' '.join(out)


def shells(z):
    out, left = [], z
    for cap in (2, 8, 8):
        if left <= 0: break
        k = min(cap, left); out.append(k); left -= k
    return out


# ions used on paper: symbol -> (EN name, ES name, charge, polyatomic?)
CAT = {'Li': ('lithium', 'litio', 1), 'Na': ('sodium', 'sodio', 1), 'K': ('potassium', 'potasio', 1), 'Mg': ('magnesium', 'magnesio', 2),
       'Ca': ('calcium', 'calcio', 2), 'Ba': ('barium', 'bario', 2), 'Al': ('aluminum', 'aluminio', 3), 'NH4': ('ammonium', 'amonio', 1)}
AN = {'Br': ('bromide', 'bromuro', -1), 'S': ('sulfide', 'sulfuro', -2), 'P': ('phosphide', 'fosfuro', -3), 'N': ('nitride', 'nitruro', -3),
      'OH': ('hydroxide', 'hidróxido', -1), 'NO3': ('nitrate', 'nitrato', -1), 'CO3': ('carbonate', 'carbonato', -2),
      'SO4': ('sulfate', 'sulfato', -2), 'PO4': ('phosphate', 'fosfato', -3)}
POLY = {'NH4', 'OH', 'NO3', 'CO3', 'SO4', 'PO4'}
ELNAME = {'Mg': ('magnesium', 'magnesio'), 'Ca': ('calcium', 'calcio'), 'Na': ('sodium', 'sodio'), 'Al': ('aluminum', 'aluminio'),
          'Br': ('bromine', 'bromo'), 'S': ('sulfur', 'azufre'), 'P': ('phosphorus', 'fósforo'), 'N': ('nitrogen', 'nitrógeno')}


def ion_txt(sym, c):
    mag = abs(c); sup = '' if mag == 1 else SUPD[mag]
    sub = ''.join('₀₁₂₃₄₅₆₇₈₉'[int(d)] if d.isdigit() else d for d in sym)
    return sub + sup + ('⁻' if c < 0 else '⁺')


def make_formula(cat, an):
    c, a = CAT[cat][2], AN[an][2]
    L = abs(c) * abs(a) // gcd(abs(c), abs(a)); nc, na = L // abs(c), L // abs(a)
    def part(sym, n):
        if n == 1: return sym
        return ('(' + sym + ')' if sym in POLY else sym) + str(n)
    return part(cat, nc) + part(an, na)


def compound_name(cat, an, lang):
    return (AN[an][1] + ' de ' + CAT[cat][1]) if lang == 'es' else (CAT[cat][0] + ' ' + AN[an][0])


# ---- Paper versions of the mini-tools: specs the builder renders + the key reads ----
def E(i, lang):
    return lang == 'es' and i[1] or i[0]


def tools_for(part_id, lang):
    d = DATA; es = lang == 'es'
    if part_id == 'matter':
        items = d['MATTER_ITEMS'][:6]
        return [{'kind': 'bank', 'title': ('Matter or not matter?', '¿Materia o no es materia?'),
                 'prompt': ('Write M (matter) or N (not matter). Be ready to say the reason: mass? volume?', 'Escribe M (materia) o N (no es materia). Prepárate para decir la razón: ¿masa? ¿volumen?'),
                 'bank': [('M = matter', 'M = materia'), ('N = not matter', 'N = no es materia')], 'letters': ['M', 'N'],
                 'rows': [(tr(it['l'], lang), 0 if it['m'] else 1) for it in items], 'mono': False}]
    if part_id == 'formulas':
        fs = ['Al2(SO4)3', '(NH4)2CO3', 'Ca3(PO4)2']
        rows = []
        for f in fs:
            cnt = count_atoms(f); rows.append((f, '   '.join('%s ____' % e for e in cnt), '   '.join('%s %d' % (e, n) for e, n in cnt.items())))
        return [{'kind': 'grid', 'title': ('Decode the formula', 'Descifra la fórmula'),
                 'prompt': ('Count the atoms of each element. Parentheses multiply!', 'Cuenta los átomos de cada elemento. ¡Los paréntesis multiplican!'),
                 'headers': (['Formula', 'Atoms of each element'], ['Fórmula', 'Átomos de cada elemento']), 'widths': [2.0, 5.1], 'rows': rows, 'formula_first': True}]
    if part_id == 'ptable':
        fam = d['FAMILIES']; pick = [('Li', 0), ('Ba', 1), ('Ni', 2), ('Si', 3), ('I', 4), ('Ne', 5)]
        return [{'kind': 'bank', 'title': ('Name the family', 'Nombra la familia'),
                 'prompt': ('Use a periodic table. Write the letter of each element’s family.', 'Usa una tabla periódica. Escribe la letra de la familia de cada elemento.'),
                 'bank': [(f['en'], f['es']) for f in fam], 'letters': list('ABCDEF'), 'rows': [(sym, k) for sym, k in pick], 'mono': True}]
    if part_id == 'atoms':
        el = d['EL']; zs = [4, 10, 12, 16]; rows = []
        for z in zs:
            e = el[z]; rows.append((tr(e['n'], lang) + ' (' + e['s'] + ')', str(z), str(e['m']), '', '', '', 'p %d · e %d · n %d' % (z, z, e['m'] - z)))
        return [{'kind': 'grid', 'title': ('Build the atom', 'Arma el átomo'),
                 'prompt': ('Fill in protons, electrons, and neutrons for a neutral atom.', 'Completa protones, electrones y neutrones de un átomo neutro.'),
                 'headers': (['Element', 'Atomic number', 'Rounded mass', 'Protons', 'Electrons', 'Neutrons'], ['Elemento', 'Número atómico', 'Masa redondeada', 'Protones', 'Electrones', 'Neutrones']),
                 'widths': [1.9, 1.0, 1.0, 1.05, 1.05, 1.1], 'rows': rows}]
    if part_id == 'shells':
        fl = d['FLAMES']; order = [3, 0, 5, 1, 4, 2]
        flame = {'kind': 'bank', 'title': ('Flame colors', 'Colores de llama'),
                 'prompt': ('Match each flame color to the metal atom in the compound. Write the letter.', 'Relaciona cada color de llama con el átomo del metal del compuesto. Escribe la letra.'),
                 'bank': [(f['m']['en'], f['m']['es']) for f in fl], 'letters': list('ABCDEF'),
                 'rows': [(tr(fl[i]['cn'], lang), i) for i in order], 'mono': False}
        el = d['EL']; rows = []
        for z in (5, 10, 13):
            sh = shells(z); sh3 = sh + [0] * (3 - len(sh)); val = sh[-1]
            rows.append((tr(el[z]['n'], lang) + ' (' + el[z]['s'] + ', %d)' % z, '', '', '', '', '', '', ' · '.join(str(x) for x in sh3) + ' · val %d · core %d' % (val, z - val)))
        grid = {'kind': 'grid', 'title': ('Shell models', 'Modelos de capas'),
                'prompt': ('Fill in each shell, then the valence and core electrons. Sketch the model in the box on the right.', 'Llena cada capa y luego los electrones de valencia y del núcleo interno. Dibuja el modelo en el recuadro de la derecha.'),
                'headers': (['Element (Z)', 'Shell 1', 'Shell 2', 'Shell 3', 'Valence', 'Core', 'Sketch'], ['Elemento (Z)', 'Capa 1', 'Capa 2', 'Capa 3', 'Valencia', 'Núcleo', 'Dibujo']),
                'widths': [1.55, 0.6, 0.6, 0.6, 0.7, 0.55, 2.5], 'rows': rows, 'tall': 0.85, 'skip_answer_cols': 1}
        return [flame, grid]
    if part_id == 'ions':
        pairs = [('Mg', 'Br'), ('Ca', 'S'), ('Na', 'P'), ('Al', 'N')]; rows = []
        for c, a in pairs:
            rows.append((ELNAME[c][1 if es else 0] + ' + ' + ELNAME[a][1 if es else 0], '', '', '',
                         '%s  %s → %s' % (ion_txt(c, CAT[c][2]), ion_txt(a, AN[a][2]), make_formula(c, a))))
        return [{'kind': 'grid', 'title': ('Predict the formula', 'Predice la fórmula'),
                 'prompt': ('Write each ion with its charge, then the formula. Show that the charges add to zero.', 'Escribe cada ion con su carga y luego la fórmula. Muestra que las cargas suman cero.'),
                 'headers': (['Atoms', 'Cation', 'Anion', 'Formula'], ['Átomos', 'Catión', 'Anión', 'Fórmula']), 'widths': [2.6, 1.3, 1.3, 1.9], 'rows': rows}]
    if part_id == 'names':
        n2f = [('Mg', 'CO3'), ('Ba', 'PO4'), ('Li', 'SO4'), ('Al', 'NO3')]
        f2n = [('NH4', 'PO4'), ('Al', 'SO4'), ('K', 'OH')]
        a = {'kind': 'grid', 'title': ('Name → formula', 'Nombre → fórmula'), 'prompt': ('Write the formula. Use parentheses if you need more than one polyatomic ion.', 'Escribe la fórmula. Usa paréntesis si necesitas más de un ion poliatómico.'),
             'headers': (['Name', 'Formula'], ['Nombre', 'Fórmula']), 'widths': [3.8, 3.3], 'rows': [(compound_name(c, an, lang), '', make_formula(c, an)) for c, an in n2f], 'formula_answer': True}
        b = {'kind': 'grid', 'title': ('Formula → name', 'Fórmula → nombre'), 'prompt': ('Write the name of each compound.', 'Escribe el nombre de cada compuesto.'),
             'headers': (['Formula', 'Name'], ['Fórmula', 'Nombre']), 'widths': [3.0, 4.1], 'rows': [(make_formula(c, an), '', compound_name(c, an, lang)) for c, an in f2n], 'formula_first': True}
        return [a, b]
    if part_id == 'config':
        els = [(5, 'B'), (14, 'Si'), (19, 'K')]; rows = []
        for z, sym in els:
            nm = d['EL'][z]['n']; rows.append((tr(nm, lang) + ' (%s, %d)' % (sym, z), '', config(z)))
        rows.append(('1s² 2s² 2p⁶ 3s² 3p⁶', '', ('Identify the element: ' if not es else 'Identifica el elemento: ') + ('argon, Ar' if not es else 'argón, Ar')))
        return [{'kind': 'grid', 'title': ('Write the configuration', 'Escribe la configuración'),
                 'prompt': ('Write each electron configuration (use plain numbers for superscripts: 1s2 2s2 …). For the last row, name the element.', 'Escribe cada configuración electrónica (usa números simples para los superíndices: 1s2 2s2 …). En la última fila, nombra el elemento.'),
                 'headers': (['Element (Z)', 'My answer'], ['Elemento (Z)', 'Mi respuesta']), 'widths': [2.4, 4.7], 'rows': rows, 'plain_first': True}]
    if part_id == 'bonding':
        sub = {x['f']: x for x in d['SUBSTANCES']}; fl = ['LiF', 'Zn', 'C6H12O6', 'SiC']
        def yn(v): return '—' if v is None else (('sí' if es else 'yes') if v else 'no')
        rows = [(f, yn(sub[f]['dis']), yn(sub[f]['sol']), yn(sub[f]['aq']), '', d['BOND_TYPES'][sub[f]['c']]['es' if es else 'en']) for f in fl]
        bank = [(b['en'], b['es']) for b in d['BOND_TYPES']]
        return [{'kind': 'grid', 'title': ('Sort the substances', 'Clasifica las sustancias'),
                 'prompt': ('Use the data and the formula. Write the bonding type (ionic, metallic, molecular covalent, or network covalent).', 'Usa los datos y la fórmula. Escribe el tipo de enlace (iónico, metálico, covalente molecular o covalente de red).'),
                 'headers': (['Substance', 'Dissolves?', 'Conducts as solid?', 'Conducts dissolved?', 'Bonding type'], ['Sustancia', '¿Se disuelve?', '¿Conduce sólido?', '¿Conduce disuelto?', 'Tipo de enlace']),
                 'widths': [1.4, 1.1, 1.3, 1.4, 1.9], 'rows': rows, 'formula_first': True, 'bank_text': ' · '.join(x[1 if es else 0] for x in bank)}]
    return []
