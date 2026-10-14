#!/usr/bin/env python3
"""Builds the Unit 1 Review paper materials from the review's own data.

  node export.js data.json      # dumps SECTIONS / QUESTIONS / ... from unit1-review.js
  python3 build.py data.json OUT_DIR

Writes: paper version (EN, ES), companion worksheet (EN, ES), teacher answer key (EN).
"""
import sys, os
from lib import *
import content as C
from content import s, tr
from render import name_block, plan_table, part_titles, badges_line, wordwall_line, practice_block, render_part_paper, render_cer, render_tool
from check import render_check, key_doc_check, formula_or_text

LANGS = ('en', 'es')
SUF = {'en': 'EN', 'es': 'ES'}


def build_paper(lang, out, key=None):
    D = C.DATA; key = key if key is not None else []; check_rows = []
    doc = new_doc('%s — %s' % (s('title', lang), s('paper_sub', lang)))
    name_block(doc, lang, s('paper_sub', lang))
    para(doc, s('paper_dir', lang), size=9.5, italic=True, after=4)
    plan_table(doc, lang, part_titles(lang))
    for i in range(1, 10):
        render_part_paper(doc, i, D['SECTIONS'][i], lang, key)
    render_cer(doc, lang)
    render_check(doc, lang, check_rows)
    doc.save(out)
    return key, check_rows


def build_companion(lang, out, notes_key=None):
    D = C.DATA; notes_key = notes_key if notes_key is not None else []
    doc = new_doc('%s — %s' % (s('title', lang), s('comp_sub', lang)))
    name_block(doc, lang, s('comp_sub', lang))
    para(doc, s('comp_dir', lang), size=9.5, italic=True, after=4)
    plan_table(doc, lang, part_titles(lang))
    for i in range(1, 10):
        sec = D['SECTIONS'][i]
        bar(doc, '%s %d · %s' % (s('part', lang), i, tr(sec['title'], lang)), '%d %s' % (D['PACE'][i], s('min', lang)))
        badges_line(doc, sec, lang)
        label(doc, s('defs', lang))
        t = make_table(doc, [2.0, 5.1], s('defcols', lang))
        for w_ in tr(sec['words'], lang):
            add_row(t, [w_, ''], height=0.34, bold_first=True, size=9.5)
        spacer(doc, 4)
        label(doc, s('notes', lang))
        answers = []
        for k in sec['know']:
            p = doc.add_paragraph(style='List Bullet'); p.paragraph_format.space_after = Pt(5)
            answers += rich(p, tr(k, lang), size=10, cloze=True)
        notes_key.append((i, tr(sec['title'], 'en'), [rich_plain(tr(k, 'en')) for k in sec['know']]))
        write_lines(doc, 2)
        label(doc, s('toollog', lang)); write_lines(doc, 2)
        practice_block(doc, sec, lang)
        para(doc, s('confidence', lang), size=8.5, italic=True, after=2)
        p = para(doc, '', after=8); p.add_run('1      2      3      4').font.size = Pt(11)
    render_cer(doc, lang, intro=s('cer_note', lang))
    spacer(doc, 6)
    bar(doc, s('check_log', lang), '')
    t = make_table(doc, [3.55, 3.55], None)
    add_row(t, [lambda p: p.add_run('%s:   ______ / %d' % (s('my_score', lang), D['TOTAL_POINTS'])).__setattr__('bold', True),
                lambda p: p.add_run('%s:   ______________' % s('my_code', lang)).__setattr__('bold', True)], height=0.45, fills=[CREAM, CREAM])
    spacer(doc, 4)
    label(doc, s('revisit_list', lang)); write_lines(doc, 3)
    label(doc, s('plan_next', lang)); write_lines(doc, 3)
    doc.save(out)
    return notes_key


def rich_plain(html):
    """Plain text of a Must-know bullet with the key terms in [brackets]."""
    import re
    return re.sub(r'<[^>]+>', '', html.replace('<strong>', '[').replace('</strong>', ']'))


def build_key(out, tool_key, check_rows, notes_key):
    D = C.DATA
    doc = new_doc('Unit 1 Review — Teacher Answer Key')
    name_block(doc, 'en', 'Teacher answer key — paper version, companion worksheet, graded check', with_name=False)
    para(doc, 'Teacher only. The English and Spanish packets use the same numbering and answer letters, so this key serves both. Scoring for matching/table/number questions is partial credit: floor(points × right ÷ total). A correct choice with no reason on the Explain It Studio earns about half credit on the real test — look for claim, specific evidence, and a chemistry rule.', size=9.5, italic=True, after=4)
    para(doc, 'Key Question 17 (metals that can have more than one charge) is intentionally not in this review.', size=9, italic=True, after=6)
    bar(doc, 'Part-by-part answers', '')
    prac = {i: D['SECTIONS'][i] for i in range(1, 10)}
    by_part = {}
    for part_label, title, pairs in tool_key: by_part.setdefault(part_label, []).append((title, pairs))
    notes = {i: (t_, bl) for i, t_, bl in notes_key}
    for i in range(1, 10):
        sec = prac[i]
        para(doc, 'Part %d · %s' % (i, tr(sec['title'], 'en')), size=11, bold=True, color=TEAL, after=2, keep=True)
        for title, pairs in by_part.get('Part %d' % i, []):
            label(doc, 'Try it — ' + title)
            for lbl, ans in pairs:
                pp = para(doc, '', after=0); pp.paragraph_format.left_indent = Inches(0.25)
                pp.add_run('• ')
                if isinstance(lbl, str) and any(ch.isdigit() for ch in lbl) and ' ' not in lbl: formula(pp, lbl)
                else: pp.add_run(str(lbl))
                pp.add_run('  →  '); formula_or_text(pp, str(ans))
        label(doc, 'Practice')
        for n, pr in enumerate(sec['practice'], 1):
            pp = para(doc, '', after=2); pp.paragraph_format.left_indent = Inches(0.25)
            pp.add_run('%d. ' % n).bold = True; pp.add_run(tr(pr['a'], 'en'))
        label(doc, 'Companion worksheet — notes (answers in brackets)')
        for b in notes[i][1]:
            pp = para(doc, '', after=2); pp.paragraph_format.left_indent = Inches(0.25); pp.add_run('• ' + b).font.size = Pt(9)
        spacer(doc, 6)
    label(doc, 'Explain It Studio — model answers')
    for n, cp in enumerate(D['CER_PROMPTS'], 1):
        para(doc, '%d. %s' % (n, tr(cp['q'], 'en')), size=9.5, bold=True, after=1, keep=True)
        for k in ('claim', 'evidence', 'reasoning'):
            pp = para(doc, '', after=1); pp.paragraph_format.left_indent = Inches(0.25)
            pp.add_run(k.capitalize() + ': ').bold = True; pp.add_run(cp['model'][k]['en'])
        spacer(doc, 4)
    bar(doc, 'Graded check — answer key (%d points)' % D['TOTAL_POINTS'], '', new_page=True)
    key_doc_check(doc, check_rows)
    doc.save(out)


def main(data_path, out_dir):
    C.load(data_path); os.makedirs(out_dir, exist_ok=True)
    tool_key, check_rows, notes_key = None, None, None
    for lang in LANGS:
        tk, cr = build_paper(lang, os.path.join(out_dir, 'Unit1_Review_Paper_Version_%s.docx' % SUF[lang]))
        if lang == 'en': tool_key, check_rows = tk, cr
        nk = build_companion(lang, os.path.join(out_dir, 'Unit1_Review_Companion_Worksheet_%s.docx' % SUF[lang]))
        if lang == 'en': notes_key = nk
    build_key(os.path.join(out_dir, 'Unit1_Review_Teacher_Answer_Key.docx'), tool_key, check_rows, notes_key)
    print('wrote', sorted(os.listdir(out_dir)))


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
