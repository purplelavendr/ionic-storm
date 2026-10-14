"""Graded check on paper (+ key rows) and the companion worksheet pieces."""
from lib import *
import content as C
from content import s, tr
from render import LET, name_block, plan_table, part_titles, badges_line, wordwall_line, practice_block, render_cer


def lbl_runs(par, lbl, lang):
    if isinstance(lbl, str): formula(par, lbl, bold=True)
    else: par.add_run(tr(lbl, lang))


def opt_txt(o, lang):
    return o if isinstance(o, str) else tr(o, lang)


def poly_reference(doc, lang):
    items = [('OH⁻', 'hydroxide', 'hidróxido'), ('NO₃⁻', 'nitrate', 'nitrato'), ('CO₃²⁻', 'carbonate', 'carbonato'),
             ('SO₄²⁻', 'sulfate', 'sulfato'), ('PO₄³⁻', 'phosphate', 'fosfato'), ('NH₄⁺', 'ammonium', 'amonio')]
    t = make_table(doc, [USABLE / 6] * 6, None)
    add_row(t, ['%s  %s' % (a, c if lang == 'es' else b) for a, b, c in items], fills=[CREAM] * 6, size=8.5)
    para(doc, s('poly_ref', lang), size=7.5, italic=True, after=4)


def render_check(doc, lang, key):
    D = C.DATA; Q = D['QUESTIONS']; li = 1 if lang == 'es' else 0
    bar(doc, s('check_title', lang), '%d %s' % (D['PACE'][-1], s('min', lang)), new_page=True)
    t = make_table(doc, [5.2, 1.9], None)
    add_row(t, [lambda p: p.add_run(s('check_dir', lang)).__setattr__('italic', False), lambda p: (p.add_run('%s:  ____ / %d' % (s('score', lang), D['TOTAL_POINTS'])).__setattr__('bold', True))], fills=[CREAM, AMBER], size=9)
    spacer(doc, 4); poly_reference(doc, lang)
    cur = None
    for n, q in enumerate(Q, 1):
        if q['sec'] != cur:
            cur = q['sec']; p = para(doc, s('sec' + cur, lang).upper(), size=9, bold=True, color=TEAL, after=3, keep=True)
            p.paragraph_format.space_before = Pt(8)
        pts = q.get('max', 1)
        p = para(doc, '', after=2, keep=True)
        r = p.add_run('%d.  ' % n); r.bold = True
        r = p.add_run('(%d %s)  ' % (pts, s('pts' if pts == 1 else 'ptsp', lang))); r.font.size = Pt(8); r.font.color.rgb = RGBColor.from_string(TEAL)
        p.add_run(tr(q['prompt'], lang)).bold = True
        ans = None
        if q['type'] == 'mc':
            para(doc, s('circle1', lang), size=8, italic=True, after=1, keep=True)
            for k, c in enumerate(q['choices']):
                pp = para(doc, '', after=1); pp.paragraph_format.left_indent = Inches(0.3); pp.paragraph_format.first_line_indent = Inches(-0.25)
                pp.add_run('%s.  ' % LET[k]).bold = True; pp.add_run(opt_txt(c, lang))
            ans = '%s. %s' % (LET[q['correct']], opt_txt(q['choices'][q['correct']], 'en'))
        elif q['type'] == 'multi':
            para(doc, s('checkall', lang), size=8, italic=True, after=1, keep=True)
            for k, c in enumerate(q['choices']):
                pp = para(doc, '', after=1); pp.paragraph_format.left_indent = Inches(0.3)
                pp.add_run('☐  ' + opt_txt(c, lang))
            ans = '; '.join(opt_txt(q['choices'][k], 'en') for k in q['correct'])
        elif q['type'] == 'rows':
            shared = [r for r in q['rows'] if 'opts' not in r]
            pairs = []
            if shared:
                bt = make_table(doc, [USABLE], None)
                add_row(bt, ['     '.join('%s. %s' % (LET[k], opt_txt(o, lang)) for k, o in enumerate(q['opts']))], fills=[CREAM], size=9)
                spacer(doc, 3).paragraph_format.keep_with_next = True
                tb = make_table(doc, [5.7, 1.4], None)
                for r in q['rows']:
                    add_row(tb, [lambda pp, l=r['l']: lbl_runs(pp, l, lang), ''], height=0.3)
                    pairs.append('%s → %s. %s' % (opt_txt(r['l'], 'en'), LET[r['a']], opt_txt(q['opts'][r['a']], 'en')))
                keep_table(tb); keep_table(bt)
                for c_ in bt.rows[0].cells:
                    for p_ in c_.paragraphs: p_.paragraph_format.keep_with_next = True
                para(doc, s('write_letter', lang), size=8, italic=True, after=2)
            else:
                tb = make_table(doc, [2.2, 4.9], None)
                for r in q['rows']:
                    def cell(pp, o=r['opts']):
                        for k, x in enumerate(o):
                            if k: pp.add_run().add_break()
                            pp.add_run('%s.  ' % LET[k]).bold = True; pp.add_run(opt_txt(x, lang))
                    add_row(tb, [lambda pp, l=r['l']: lbl_runs(pp, l, lang), cell], fills=[SOFT, None])
                    pairs.append('%s → %s. %s' % (opt_txt(r['l'], 'en'), LET[r['a']], opt_txt(r['opts'][r['a']], 'en')))
                keep_table(tb)
                para(doc, s('circle1', lang), size=8, italic=True, after=2)
            ans = pairs
        else:
            tb = make_table(doc, [3.6, 1.6], None)
            for f in q['fields']:
                add_row(tb, [lambda pp, l=f['l']: lbl_runs(pp, l, lang), ''], height=0.3)
            keep_table(tb)
            ans = ['%s = %s' % (opt_txt(f['l'], 'en'), f['a']) for f in q['fields']]
        spacer(doc, 6)
        key.append((n, q, ans))


# ---------- answer key ----------
def key_doc_check(doc, rows):
    D = C.DATA
    for n, q, ans in rows:
        p = para(doc, '', after=1, keep=True)
        r = p.add_run('%d. ' % n); r.bold = True
        r = p.add_run('[%s · %d pt · KQ %s]  ' % (q['type'], q.get('max', 1), ', '.join(str(k) for k in q['kq']) or '—')); r.font.size = Pt(8); r.font.color.rgb = RGBColor.from_string(TEAL)
        if isinstance(ans, list):
            p.add_run('')
            for a in ans:
                pp = para(doc, '', after=0); pp.paragraph_format.left_indent = Inches(0.3)
                pp.add_run('• '); formula_or_text(pp, a)
        else:
            p.add_run(ans).bold = True
        e = para(doc, '', after=5); e.paragraph_format.left_indent = Inches(0.3)
        r = e.add_run(tr(q['explanation'], 'en')); r.italic = True; r.font.size = Pt(8.5); r.font.color.rgb = RGBColor(0x5A, 0x64, 0x75)


def formula_or_text(par, text):
    # subscript digits that follow a letter or ')' inside short formula-like tokens; plain text otherwise
    import re
    for tok in re.split(r'(\b[A-Z][A-Za-z]*\d+[A-Za-z0-9()]*\b)', text):
        if re.fullmatch(r'[A-Z][A-Za-z]*\d+[A-Za-z0-9()]*', tok or ''):
            formula(par, tok)
        elif tok:
            par.add_run(tok)
