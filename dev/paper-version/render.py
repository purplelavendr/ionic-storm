"""Renderers shared by the paper packet, the companion worksheet, and the answer key."""
from lib import *
import content as C
from content import s, tr

LET = 'ABCDEFGH'


def name_block(doc, lang, subtitle, with_name=True):
    t = doc.add_table(rows=1, cols=1); t.alignment = WD_TABLE_ALIGNMENT.CENTER; t.autofit = False; fix_table(t, [USABLE])
    c = t.rows[0].cells[0]; c.width = Inches(USABLE); shade(c, NAVY); borders(c, NAVY); cell_margins(c, 110, 110, 160, 160)
    p = c.paragraphs[0]; p.paragraph_format.space_after = Pt(0)
    r = p.add_run(s('title', lang)); r.bold = True; r.font.size = Pt(21); r.font.color.rgb = RGBColor(255, 255, 255)
    p2 = c.add_paragraph(); p2.paragraph_format.space_after = Pt(0)
    r2 = p2.add_run(subtitle); r2.font.size = Pt(10); r2.font.color.rgb = RGBColor(0x9F, 0xE5, 0xDD)
    spacer(doc, 6)
    if not with_name: return
    p = doc.add_paragraph(); p.paragraph_format.space_after = Pt(4)
    p.add_run('%s: ' % s('name', lang)).bold = True; p.add_run('_' * 34 + '    ')
    p.add_run('%s: ' % s('date', lang)).bold = True; p.add_run('_' * 14 + '    ')
    p.add_run('%s: ' % s('period', lang)).bold = True; p.add_run('_' * 6)


def plan_table(doc, lang, titles):
    D = C.DATA
    label(doc, s('plan', lang))
    t = make_table(doc, [0.5, 3.9, 0.55, 0.9, 1.25], s('cols_plan', lang))
    cum = 0
    for i, mins in enumerate(D['PACE']):
        cum += mins
        mark = '★' if i == 0 else ('✓' if i == len(D['PACE']) - 1 else str(i))
        add_row(t, [mark, titles[i], str(mins), '%d min' % cum, '☐'], fills=[SOFT if i % 2 else None] * 5, size=9.5)
    keep_table(t)
    spacer(doc, 4)


def part_titles(lang):
    D = C.DATA
    ts = [tr(sec['title'], lang) for sec in D['SECTIONS']]
    ts.append(s('check_title', lang))
    return ts


def badges_line(doc, sec, lang):
    kq = sec['kq']; ranged = '–' in kq or '-' in kq
    p = para(doc, '', after=2)
    r = p.add_run('%s %s' % (s('kq', lang) if ranged else s('kq1', lang), kq)); r.bold = True; r.font.size = Pt(9); r.font.color.rgb = RGBColor.from_string(TEAL)
    r = p.add_run('   ·   %s %s' % (s('targets', lang), sec['targets'])); r.font.size = Pt(9); r.font.color.rgb = RGBColor(0x5A, 0x64, 0x75)


def wordwall_line(doc, sec, lang):
    p = para(doc, '', after=3)
    r = p.add_run(s('wordwall', lang).upper() + '  '); r.bold = True; r.font.size = Pt(8); r.font.color.rgb = RGBColor(0x5A, 0x64, 0x75)
    r = p.add_run('  ·  '.join(tr(sec['words'], lang))); r.font.size = Pt(9.5); r.italic = True


def practice_block(doc, sec, lang, lines=(2, 3, 3), show_q=True):
    label(doc, s('practice', lang))
    for i, pr in enumerate(sec['practice']):
        p = para(doc, '', after=1, keep=True)
        tag = {'basic': s('basic', lang), 'medium': s('medium', lang), 'challenge': s('challenge', lang)}[pr['d']]
        r = p.add_run('%d. ' % (i + 1)); r.bold = True
        r = p.add_run('[%s]  ' % tag); r.font.size = Pt(8); r.font.color.rgb = RGBColor.from_string(TEAL)
        p.add_run(tr(pr['q'], lang))
        write_lines(doc, lines[i] if i < len(lines) else 3)
        spacer(doc, 3)


def render_tool(doc, spec, lang, key, part_label):
    """Render one paper mini-tool; append (label, answer) pairs to key list."""
    label(doc, '%s — %s' % (s('tryit', lang), spec['title'][1 if lang == 'es' else 0]))
    para(doc, spec['prompt'][1 if lang == 'es' else 0], size=9.5, italic=True, after=3, keep=True)
    pairs = []
    if spec['kind'] == 'bank':
        bank = spec['bank']; letters = spec['letters']; li = 1 if lang == 'es' else 0
        if letters == ['M', 'N']:
            bank_txt = '      '.join(b[li] for b in bank)
        else:
            bank_txt = '     '.join('%s. %s' % (letters[k], b[li]) for k, b in enumerate(bank))
        bt = make_table(doc, [USABLE], None)
        add_row(bt, [bank_txt], fills=[CREAM], size=9)
        spacer(doc, 3).paragraph_format.keep_with_next = True
        t = make_table(doc, [5.7, 1.4], ['Item' if lang == 'en' else 'Elemento', 'Letter' if lang == 'en' else 'Letra'])
        for lbl, ans in spec['rows']:
            if spec.get('mono'): add_row(t, [lambda p, l=lbl: C_formula(p, l), ''], height=0.3)
            else: add_row(t, [lbl, ''], height=0.3)
            pairs.append((lbl, '%s — %s' % (letters[ans], bank[ans][li])))
        keep_table(t); keep_table(bt)
        for c_ in bt.rows[0].cells:
            for p_ in c_.paragraphs: p_.paragraph_format.keep_with_next = True
    else:
        hdr = spec['headers'][1 if lang == 'es' else 0]
        t = make_table(doc, spec['widths'], hdr)
        for row in spec['rows']:
            cells, ans = list(row[:-1]), row[-1]
            built = []
            for k, v in enumerate(cells):
                if k == 0 and spec.get('formula_first'): built.append(lambda p, v=v: C_formula(p, v))
                else: built.append(v)
            add_row(t, built, height=spec.get('tall', 0.33))
            pairs.append((cells[0], ans))
        keep_table(t)
        if spec.get('bank_text'):
            para(doc, '%s: %s' % (s('bank', lang), spec['bank_text']), size=9, italic=True, after=2)
    spacer(doc, 5)
    key.append((part_label, spec['title'][0], pairs))


def C_formula(par, f):
    formula(par, f)


def render_part_paper(doc, idx, sec, lang, key, extra_html=True):
    D = C.DATA
    bar(doc, '%s %d · %s' % (s('part', lang), idx, tr(sec['title'], lang)), '%d %s' % (D['PACE'][idx], s('min', lang)))
    badges_line(doc, sec, lang); wordwall_line(doc, sec, lang)
    label(doc, s('mustknow', lang))
    for k in sec['know']:
        p = doc.add_paragraph(style='List Bullet'); p.paragraph_format.space_after = Pt(2)
        rich(p, tr(k, lang), size=10)
    if sec.get('extra') and extra_html:
        spacer(doc, 3); html_table(doc, tr(sec['extra'], lang))
    for spec in C.tools_for(sec['id'], lang):
        render_tool(doc, spec, lang, key, '%s %d' % (s('part', 'en'), idx))
    practice_block(doc, sec, lang)
    p = para(doc, '', after=6)
    r = p.add_run(s('revisit', lang) + ' '); r.bold = True; r.font.size = Pt(8.5); r.font.color.rgb = RGBColor(0x5A, 0x64, 0x75)
    r = p.add_run(tr(sec['revisit'], lang)); r.font.size = Pt(8.5); r.font.color.rgb = RGBColor(0x5A, 0x64, 0x75)
    spacer(doc, 6)


def render_cer(doc, lang, intro=None, idx=10):
    D = C.DATA
    bar(doc, '%s %d · %s' % (s('part', lang), idx, s('cer_title', lang)), '%d %s' % (D['PACE'][idx], s('min', lang)))
    para(doc, intro or (tr(D['SECTIONS'][idx]['customBody'], lang).split('</p>')[0].replace('<p>', '').replace('<strong>', '').replace('</strong>', '') + '.'), size=10, after=4)
    for i, cp in enumerate(D['CER_PROMPTS']):
        p = para(doc, '', after=2, keep=True)
        r = p.add_run('%d. ' % (i + 1)); r.bold = True
        r = p.add_run('(%s %s)  ' % (s('kq1', lang), cp['kq'])); r.font.size = Pt(8); r.font.color.rgb = RGBColor.from_string(TEAL)
        p.add_run(tr(cp['q'], lang))
        for key_, n in (('claim', 1), ('evidence', 2), ('reasoning', 2)):
            para(doc, s(key_, lang).upper(), size=7.5, bold=True, color=TEAL, after=0, keep=True)
            write_lines(doc, n, 13)
        if i < len(D['CER_PROMPTS']) - 1: spacer(doc, 2)
