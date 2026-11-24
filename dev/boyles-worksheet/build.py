#!/usr/bin/env python3
"""Builds the paper worksheet that goes with the Lesson 58P Boyle's Law Practice
activity (js/activities/boyles-law-practice.js), plus a teacher answer key.

    python3 dev/boyles-worksheet/build.py [OUT_DIR]

Default OUT_DIR: ~/Downloads/Boyle's Law Practice
Writes:  Lesson 58P Boyle's Law Practice Worksheet.docx
         Lesson 58P Boyle's Law Practice Worksheet - KEY.docx

Parts A-E follow the activity's sections in order and use the SAME numbers,
so students do the interactive part on screen and record it here. The key is
the same layout with answers filled in (teal italics). If you change numbers in
the activity, change them here too. Needs python-docx; reuses the paper-version
helpers in dev/paper-version/lib.py.
"""
import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / 'paper-version'))
from lib import (new_doc, make_table, add_row, bar, spacer, label, para, write_lines,
                 shade, borders, cell_margins, fix_table, keep_table, row_height,
                 NAVY, TEAL, SOFT, AMBER, USABLE)
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.shared import Pt, Inches, RGBColor

TITLE = "Lesson 58P · Boyle's Law Practice"
KEY_RGB = RGBColor(0x1A, 0x8C, 0x83)


def ans(par, text, key, blank='______'):
    """Write a blank, or the answer in teal italics on the key."""
    if key:
        r = par.add_run(text); r.italic = True; r.bold = True; r.font.color.rgb = KEY_RGB
    else:
        par.add_run(blank)


def key_lines(doc, key, text, n):
    """Ruled lines for students; the written answer on the key."""
    if key:
        p = para(doc, after=6); r = p.add_run(text); r.italic = True; r.font.color.rgb = KEY_RGB; r.font.size = Pt(10)
    else:
        write_lines(doc, n)


def cell_text(text, key_text=None, key=False, bold=False, size=9.5, center=False):
    def fill(p):
        if center: p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        if key and key_text is not None:
            r = p.add_run(key_text); r.italic = True; r.bold = True; r.font.color.rgb = KEY_RGB
        else:
            r = p.add_run(text); r.bold = bold
        r.font.size = Pt(size)
    return fill


def header(doc, key):
    t = doc.add_table(rows=1, cols=1); t.alignment = WD_TABLE_ALIGNMENT.CENTER; t.autofit = False; fix_table(t, [USABLE])
    c = t.rows[0].cells[0]; c.width = Inches(USABLE); shade(c, NAVY); borders(c, NAVY); cell_margins(c, 110, 110, 160, 160)
    p = c.paragraphs[0]; p.paragraph_format.space_after = Pt(0)
    r = p.add_run(TITLE + ('  —  TEACHER KEY' if key else '')); r.bold = True; r.font.size = Pt(19); r.font.color.rgb = RGBColor(255, 255, 255)
    p2 = c.add_paragraph(); p2.paragraph_format.space_after = Pt(0)
    r2 = p2.add_run('Unit 3: Atmosphere · Chapter 11: Pressing Matter · Use with the Ionic Storm activity')
    r2.font.size = Pt(10); r2.font.color.rgb = RGBColor(0x9F, 0xE5, 0xDD)
    spacer(doc, 6)
    p = doc.add_paragraph(); p.paragraph_format.space_after = Pt(4)
    p.add_run('Name: ').bold = True; p.add_run('_' * 34 + '    ')
    p.add_run('Date: ').bold = True; p.add_run('_' * 14 + '    ')
    p.add_run('Period: ').bold = True; p.add_run('_' * 6)
    para(doc, 'Open "Lesson 58P: Boyle\'s Law Practice" on Ionic Storm. Each Part below matches a section of the '
              'activity (look for the teal "Worksheet · Part" badge). Do the activity part first, then record it here. '
              'Show your work on every problem.', size=9.5, italic=True, after=4)


def targets(doc):
    label(doc, 'Today I can…  (circle 1–4 at the start and again at the end)')
    t = make_table(doc, [4.9, 1.1, 1.1], ['Learning target', 'Start', 'End'])
    for code, txt in (('58P.1', 'identify a Boyle\'s law problem: the temperature and the amount of gas stay the same.'),
                      ('58P.2', 'use P₁V₁ = P₂V₂ to find a new pressure or a new volume.'),
                      ('58P.3', 'check whether my answer makes sense: when the volume goes down, the pressure goes up.')):
        add_row(t, ['%s  I can %s' % (code, txt), '1  2  3  4', '1  2  3  4'], size=9.5)
    keep_table(t)
    spacer(doc, 4)


def help_box(doc):
    t = doc.add_table(rows=1, cols=1); t.alignment = WD_TABLE_ALIGNMENT.CENTER; t.autofit = False; fix_table(t, [USABLE])
    c = t.rows[0].cells[0]; c.width = Inches(USABLE); shade(c, AMBER); borders(c, 'F4A261', 8); cell_margins(c, 90, 90, 140, 140)
    p = c.paragraphs[0]; p.paragraph_format.space_after = Pt(2)
    r = p.add_run('HELP BOX   '); r.bold = True; r.font.size = Pt(9); r.font.color.rgb = RGBColor(0x92, 0x40, 0x0E)
    r = p.add_run("Boyle's law (temperature and amount of gas stay the same):   PV = k   →   P₁V₁ = P₂V₂"); r.bold = True; r.font.size = Pt(10.5)
    p = c.add_paragraph(); p.paragraph_format.space_after = Pt(2)
    r = p.add_run('Find P₂:  P₂ = P₁V₁ ÷ V₂          Find V₂:  V₂ = P₁V₁ ÷ P₂          1 atm = 14.7 lb/in²'); r.font.size = Pt(10)
    p = c.add_paragraph(); p.paragraph_format.space_after = Pt(0)
    r = p.add_run('Steps:  ① Fill in Before (P₁, V₁) and After (P₂, V₂), put ? on the unknown.  ② Check: same temperature?  '
                  '③ Multiply P₁ × V₁.  ④ Divide by the "after" value you know.  ⑤ Check: smaller volume → bigger pressure.')
    r.font.size = Pt(9.5)
    spacer(doc, 6)


# ------------------------------------------------------------------ Part A
SYRINGE_KEY = [(50, '1.00', '50'), (40, '1.25', '50'), (30, '1.67', '50.1'), (20, '2.50', '50'), (10, '5.00', '50')]


def part_a(doc, key):
    bar(doc, 'Part A · Squeeze the Syringe', 'activity section 01 · ~8 min')
    para(doc, 'The syringe is capped with 50 mL of air at 1.0 atm. Slide the plunger to five different volumes and press '
              '"Record this reading" each time. Copy the readings here.', size=10)
    t = make_table(doc, [0.8, 2.0, 2.0, 2.3], ['Trial', 'Volume V (mL)', 'Pressure P (atm)', 'P × V (atm·mL)'])
    for i in range(5):
        v, p, pv = SYRINGE_KEY[i]
        add_row(t, [str(i + 1), cell_text('', str(v), key, center=True), cell_text('', p, key, center=True),
                    cell_text('', pv, key, center=True)], height=0.3)
    keep_table(t)
    if key:
        para(doc, 'Sample data shown; any five volumes work. P = 50 ÷ V, and P × V ≈ 50 atm·mL every time.', size=9, italic=True, color=TEAL)
    spacer(doc, 4)

    label(doc, 'Sketch the graph (switch the activity graph between P vs. V and P vs. 1/V)')
    g = doc.add_table(rows=1, cols=2); g.alignment = WD_TABLE_ALIGNMENT.CENTER; g.autofit = False; fix_table(g, [3.55, 3.55])
    for ci, (title, k_txt) in enumerate((('P vs. V', 'Curve: steep at small V, flat at large V, never touches an axis.'),
                                         ('P vs. 1/V', 'Straight line through the origin (0, 0).'))):
        c = g.rows[0].cells[ci]; c.width = Inches(3.55); borders(c); cell_margins(c, 60, 60, 80, 80)
        p = c.paragraphs[0]; r = p.add_run(title); r.bold = True; r.font.size = Pt(9.5)
        p.paragraph_format.space_after = Pt(2)
        grid = c.add_table(rows=8, cols=10)
        for row in grid.rows:
            row_height(row, 0.2)
            for cell in row.cells:
                borders(cell, 'D6D0C4', 2)
        p = c.add_paragraph(); p.paragraph_format.space_after = Pt(0)
        if key:
            r = p.add_run(k_txt); r.italic = True; r.font.size = Pt(8.5); r.font.color.rgb = KEY_RGB
        else:
            r = p.add_run('x-axis: ________   y-axis: Pressure (atm)'); r.font.size = Pt(8.5)
    spacer(doc, 4)

    qs = [
        ('1.  What happens to the pressure as the volume of the trapped air decreases?',
         'The pressure increases. Half the volume → double the pressure.', 2),
        ('2.  What do you notice about the P × V column? What does that tell you?',
         'P × V is about 50 atm·mL every time — it is a constant (k). That is Boyle\'s law: PV = k.', 2),
        ('3.  Pressure and volume are inversely proportional. In your own words, what does "inversely proportional" mean?',
         'When one variable increases, the other decreases by the same factor, so their product stays the same.', 2),
        ('4.  Making Sense: Use the moving molecules to explain WHY the pressure goes up when the volume goes down.\n'
         '     Sentence starter: The number of molecules ___, but in a smaller space they ___.',
         'The number of molecules stays the same (and so does their speed), but in a smaller space they hit the walls '
         'more often, so the pressure is higher.', 3),
    ]
    for q, a, n in qs:
        para(doc, q, size=10, bold=True, after=2, keep=True)
        key_lines(doc, key, a, n)


# ------------------------------------------------------------------ Part B
PREDICT = [(8, 4), (3, 9), (20, 5), (6, 12), (15, 5), (2, 10), (40, 10), (4, 8)]


def part_b(doc, key):
    bar(doc, 'Part B · Predict First (no calculator)', 'activity section 02 · ~5 min', new_page=True)
    para(doc, 'The temperature stays the same in each change. Circle whether the pressure goes UP or DOWN, then write how '
              'many times bigger (×) or smaller (÷) it gets.', size=10)
    t = make_table(doc, [0.5, 2.0, 2.3, 2.3], ['', 'Change to the volume', 'Pressure: up or down?', 'How many times?'])
    for i, (a, b) in enumerate(PREDICT):
        up = b < a
        f = a // b if up else b // a
        add_row(t, ['%s.' % 'abcdefgh'[i], '%d L  →  %d L' % (a, b),
                    cell_text('up     /     down', 'UP' if up else 'DOWN', key, center=True),
                    cell_text('×  ______    or    ÷  ______', ('× %d' if up else '÷ %d') % f, key, center=True)],
                fills=[SOFT if i % 2 else None] * 4, height=0.3)
    keep_table(t)
    spacer(doc, 4)
    para(doc, '5.  Look at your answers. Write a rule for predicting the pressure change without a calculator.', size=10, bold=True, after=2, keep=True)
    key_lines(doc, key, 'If the volume gets n times smaller, the pressure gets n times bigger (and the reverse). '
                        'Find n by dividing the bigger volume by the smaller one.', 2)


# ------------------------------------------------------------------ Part C
PV_ROWS = [('1 (start)', '1.0', '24', None), ('2', '2.0', None, '12'), ('3', None, '6.0', '4.0'),
           ('4', '0.50', None, '48'), ('5', None, '3.0', '8.0'), ('6', '1.5', None, '16')]


def part_c(doc, key):
    bar(doc, 'Part C · PV Stays the Same', 'activity section 03 · ~5 min')
    para(doc, 'These are six sets of conditions for the SAME sample of gas at the SAME temperature. Fill in the missing '
              'pressures and volumes, then fill in the PV column for every row.', size=10)
    t = make_table(doc, [1.4, 1.9, 1.9, 1.9], ['Trial', 'P (atm)', 'V (L)', 'PV (atm·L)'])
    for i, (trial, P, V, miss) in enumerate(PV_ROWS):
        add_row(t, [trial,
                    cell_text(P or '', miss if P is None else None, key and P is None, center=True),
                    cell_text(V or '', miss if V is None else None, key and V is None, center=True),
                    cell_text('', '24', key, center=True)],
                fills=[SOFT if i % 2 else None] * 4, height=0.3)
    keep_table(t)
    spacer(doc, 4)
    para(doc, '6.  Why can you set P₁V₁ equal to P₂V₂ for any two rows of this table?', size=10, bold=True, after=2, keep=True)
    key_lines(doc, key, 'Because PV is the same number (24 atm·L) for every row of the same gas at the same temperature, '
                        'so the "before" product equals the "after" product.', 2)


# ------------------------------------------------------------------ Part D
PROBLEMS = [
    ('7.  (Guided in the activity) A balloon holds 4.0 L of air at 1.0 atm. A diver takes it underwater until its volume '
     'is 2.0 L. What is the pressure on the balloon now?',
     ('1.0 atm', '4.0 L'), ('?', '2.0 L'), 'P₂ = (1.0)(4.0) ÷ 2.0', '2.0 atm', 'Yes — the volume halved, so the pressure doubled.'),
    ('8.  A weather balloon holds 12 L of helium at 1.0 atm on the ground. High in the sky the pressure is only 0.40 atm. '
     'Assume the temperature stays the same. What is its new volume?',
     ('1.0 atm', '12 L'), ('0.40 atm', '?'), 'V₂ = (1.0)(12) ÷ 0.40', '30 L', 'Yes — lower pressure, so the volume grew.'),
    ('9.  A capped syringe holds 30 mL of air at 1.0 atm. You PULL the plunger out until the air takes up 45 mL. '
     'What is the new pressure?',
     ('1.0 atm', '30 mL'), ('?', '45 mL'), 'P₂ = (1.0)(30) ÷ 45', '0.67 atm', 'Yes — bigger volume, so lower pressure.'),
    ('10.  Ten meters underwater, a diver\'s lungs hold 6.0 L of air at 2.0 atm. If the diver held their breath and swam '
     'to the surface (1.0 atm), what volume would that air try to take up?',
     ('2.0 atm', '6.0 L'), ('1.0 atm', '?'), 'V₂ = (2.0)(6.0) ÷ 1.0', '12 L',
     'Yes — the pressure halved, so the volume doubled. (This is why divers must never hold their breath going up.)'),
    ('11.  A bike pump holds 0.50 L of air at 14.7 lb/in². You push the handle and squeeze the air into 0.15 L. '
     'What is the new pressure in lb/in²?',
     ('14.7 lb/in²', '0.50 L'), ('?', '0.15 L'), 'P₂ = (14.7)(0.50) ÷ 0.15', '49 lb/in²', 'Yes — much smaller volume, so much higher pressure.'),
]


def problem_block(doc, key, prompt, before, after, work, answer, sense):
    para(doc, prompt, size=10, bold=True, after=3, keep=True)
    t = doc.add_table(rows=1, cols=3); t.alignment = WD_TABLE_ALIGNMENT.CENTER; t.autofit = False
    widths = [1.55, 1.55, 4.0]; fix_table(t, widths)
    for ci, (head, vals, names) in enumerate((('BEFORE', before, ('P₁', 'V₁')), ('AFTER', after, ('P₂', 'V₂')))):
        c = t.rows[0].cells[ci]; c.width = Inches(widths[ci]); borders(c); cell_margins(c, 60, 60, 90, 90); shade(c, SOFT)
        p = c.paragraphs[0]; p.paragraph_format.space_after = Pt(2)
        r = p.add_run(head); r.bold = True; r.font.size = Pt(8.5); r.font.color.rgb = RGBColor.from_string(TEAL)
        for n, v in zip(names, vals):
            p = c.add_paragraph(); p.paragraph_format.space_after = Pt(3)
            p.add_run(n + ' = ').font.size = Pt(10)
            ans(p, v, key, '__________')
    c = t.rows[0].cells[2]; c.width = Inches(widths[2]); borders(c); cell_margins(c, 60, 60, 90, 90)
    p = c.paragraphs[0]; p.paragraph_format.space_after = Pt(2)
    r = p.add_run('Work:  '); r.bold = True; r.font.size = Pt(9.5)
    if key:
        ans(p, work, key)
    else:
        for _ in range(3):
            c.add_paragraph().paragraph_format.space_after = Pt(6)
    p = c.add_paragraph(); p.paragraph_format.space_after = Pt(2)
    r = p.add_run('Answer:  '); r.bold = True; r.font.size = Pt(9.5)
    ans(p, answer, key, '______________________')
    p = c.add_paragraph(); p.paragraph_format.space_after = Pt(0)
    r = p.add_run('Makes sense?  ☐ yes  ☐ no — because  '); r.font.size = Pt(9)
    ans(p, sense, key, '__________________________')
    for row in t.rows:
        for cell in row.cells:
            for pp in cell.paragraphs: pp.paragraph_format.keep_with_next = True
    spacer(doc, 8)


def part_d(doc, key):
    bar(doc, 'Part D · Solve It: Step by Step', 'activity section 04 · ~12 min', new_page=True)
    para(doc, 'Solve each problem in the activity, then write it here. Fill in BEFORE and AFTER, put ? on the unknown, '
              'show your work, and check that your answer makes sense. The temperature and amount of gas stay the same '
              'in every problem.', size=10)
    for pr in PROBLEMS:
        problem_block(doc, key, *pr)


# ------------------------------------------------------------------ Part E
SPOT = [
    ('A gas at 1.0 atm is squeezed from 8.0 L to 2.0 L. Find the new pressure.',
     ['P₁ = 1.0 atm   V₁ = 8.0 L   V₂ = 2.0 L', 'P₂ = P₁V₂ ÷ V₁ = (1.0)(2.0) ÷ 8.0', 'P₂ = 0.25 atm'],
     'Line 2 — the fraction is flipped. P₂ = P₁V₁ ÷ V₂ = (1.0)(8.0) ÷ 2.0 = 4.0 atm. Squeezing must RAISE the pressure.'),
    ('A gas takes up 3.0 L at 2.0 atm. The pressure drops to 0.50 atm. Find the new volume.',
     ['P₁V₁ = (2.0 atm)(3.0 L) = 6.0 atm·L', 'V₂ = 6.0 × 0.50', 'V₂ = 3.0 L'],
     'Line 2 — divide, don\'t multiply: V₂ = 6.0 ÷ 0.50 = 12 L. The pressure dropped to ¼, so the volume grows 4×.'),
    ('A sealed, rigid can holds 0.50 L of air at 1.0 atm and 20 °C. It is heated to 100 °C. Find the new pressure.',
     ['This is a Boyle\'s law problem.', 'P₁V₁ = P₂V₂ → (1.0)(0.50) = P₂(0.50)', 'P₂ = 1.0 atm, so the pressure does not change.'],
     'Line 1 — not a Boyle\'s law problem: the temperature changes. Heating the sealed can really does raise the pressure.'),
    ('A syringe of air at 1.0 atm is pushed from 500 mL to 250 mL. Find the new pressure and explain.',
     ['P₁ = 1.0 atm   V₁ = 500 mL   V₂ = 250 mL', 'P₁V₁ = (1.0)(500) = 500 atm·mL', 'P₂ = 500 ÷ 250 = 2.0 atm',
      'The volume got smaller, so the pressure went down.'],
     'Line 4 — the math is right but the explanation is backwards: smaller volume → pressure went UP (1.0 → 2.0 atm).'),
]


def part_e(doc, key):
    bar(doc, 'Part E · Spot the Mistake', 'activity section 05 · ~6 min', new_page=True)
    para(doc, 'Each worked solution has exactly ONE line with a mistake. Find it in the activity, then write which line is '
              'wrong and how to fix it.', size=10)
    for i, (prob, lines, fix) in enumerate(SPOT):
        para(doc, '%d.  %s' % (12 + i, prob), size=10, bold=True, after=2, keep=True)
        t = make_table(doc, [0.5, 6.6])
        for li, l in enumerate(lines):
            add_row(t, ['Line %d' % (li + 1), l], fills=[SOFT, None], size=9.5)
        keep_table(t)
        p = para(doc, after=2, keep=True); r = p.add_run('Wrong line: '); r.bold = True; r.font.size = Pt(9.5)
        ans(p, fix.split(' — ')[0], key, '________')
        r = p.add_run('    Fix it / explain:'); r.bold = True; r.font.size = Pt(9.5)
        fx = fix.split(' — ', 1)[1]
        key_lines(doc, key, fx[0].upper() + fx[1:], 2)
        spacer(doc, 4)


# ------------------------------------------------------------------ Exit ticket
def exit_ticket(doc, key):
    bar(doc, 'Check-In · Exit Ticket', 'after the graded check', fill=TEAL)
    para(doc, '16.  A gas takes up 2.5 L at 1.0 atm. It is compressed to 0.50 L at the same temperature. Find the new '
              'pressure, and explain in one sentence why your answer makes sense.', size=10, bold=True, after=2, keep=True)
    key_lines(doc, key, 'P₂ = (1.0)(2.5) ÷ 0.50 = 5.0 atm. It makes sense because the volume got 5 times smaller, '
                        'so the pressure got 5 times bigger.', 4)
    p = para(doc, after=4); r = p.add_run('Graded check score from Ionic Storm:  '); r.bold = True
    ans(p, '__ / 12', key, '______ / 12')
    r = p.add_run('        Completion code:  '); r.bold = True
    ans(p, '(student\'s code)', key, '______________')
    para(doc, 'Go back to the top of the worksheet and circle your END rating for targets 58P.1–58P.3.', size=9.5, italic=True)


def build(out_path, key):
    doc = new_doc(TITLE + (' — Key' if key else ''))
    header(doc, key)
    targets(doc)
    help_box(doc)
    part_a(doc, key)
    part_b(doc, key)
    part_c(doc, key)
    part_d(doc, key)
    part_e(doc, key)
    exit_ticket(doc, key)
    doc.save(out_path)


if __name__ == '__main__':
    out = Path(sys.argv[1]) if len(sys.argv) > 1 else Path.home() / 'Downloads' / "Boyle's Law Practice"
    out.mkdir(parents=True, exist_ok=True)
    ws = out / "Lesson 58P Boyle's Law Practice Worksheet.docx"
    ky = out / "Lesson 58P Boyle's Law Practice Worksheet - KEY.docx"
    build(ws, key=False)
    build(ky, key=True)
    print('wrote', ws)
    print('wrote', ky)
