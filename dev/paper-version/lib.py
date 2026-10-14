"""Shared python-docx helpers for the Unit 1 Review paper materials."""
import re
from html.parser import HTMLParser
from docx import Document
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.enum.text import WD_BREAK, WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Pt, Inches, RGBColor

NAVY = '0D1B2A'
TEAL = '1A8C83'
CREAM = 'F7F3EC'
SOFT = 'EDE8DF'
AMBER = 'FFF8E7'
FONT = 'Calibri'
USABLE = 7.1  # inches between 0.7" margins on Letter


def new_doc(footer_text=''):
    d = Document()
    s = d.sections[0]
    s.page_width, s.page_height = Inches(8.5), Inches(11)
    s.left_margin = s.right_margin = Inches(0.7)
    s.top_margin, s.bottom_margin = Inches(0.6), Inches(0.65)
    st = d.styles['Normal']
    st.font.name = FONT
    st.font.size = Pt(10.5)
    st.element.rPr.rFonts.set(qn('w:eastAsia'), FONT)
    st.paragraph_format.space_after = Pt(3)
    st.paragraph_format.space_before = Pt(0)
    if footer_text:
        fp = s.footer.paragraphs[0]
        fp.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r = fp.add_run(footer_text + '  ·  page ')
        r.font.size = Pt(8); r.font.color.rgb = RGBColor(0x6B, 0x72, 0x80)
        _page_field(fp)
    return d


def _page_field(par):
    run = par.add_run()
    run.font.size = Pt(8); run.font.color.rgb = RGBColor(0x6B, 0x72, 0x80)
    for kind, text in (('begin', None), (None, 'PAGE'), ('end', None)):
        if kind:
            el = OxmlElement('w:fldChar'); el.set(qn('w:fldCharType'), kind)
        else:
            el = OxmlElement('w:instrText'); el.set(qn('xml:space'), 'preserve'); el.text = text
        run._r.append(el)


def shade(cell, hex_fill):
    tcPr = cell._tc.get_or_add_tcPr()
    sh = OxmlElement('w:shd')
    sh.set(qn('w:val'), 'clear'); sh.set(qn('w:color'), 'auto'); sh.set(qn('w:fill'), hex_fill)
    tcPr.append(sh)


def borders(cell, color='B8B2A4', sz=4, sides=('top', 'left', 'bottom', 'right')):
    tcPr = cell._tc.get_or_add_tcPr()
    b = tcPr.find(qn('w:tcBorders'))
    if b is None:
        b = OxmlElement('w:tcBorders'); tcPr.append(b)
    for side in sides:
        el = OxmlElement('w:' + side)
        el.set(qn('w:val'), 'single'); el.set(qn('w:sz'), str(sz)); el.set(qn('w:space'), '0'); el.set(qn('w:color'), color)
        b.append(el)


def cell_margins(cell, top=40, bottom=40, left=80, right=80):
    tcPr = cell._tc.get_or_add_tcPr()
    m = OxmlElement('w:tcMar')
    for k, v in (('top', top), ('left', left), ('bottom', bottom), ('right', right)):
        el = OxmlElement('w:' + k); el.set(qn('w:w'), str(v)); el.set(qn('w:type'), 'dxa'); m.append(el)
    tcPr.append(m)


def no_split(row):
    trPr = row._tr.get_or_add_trPr()
    el = OxmlElement('w:cantSplit'); trPr.append(el)


def row_height(row, inches):
    trPr = row._tr.get_or_add_trPr()
    h = OxmlElement('w:trHeight'); h.set(qn('w:val'), str(int(inches * 1440))); h.set(qn('w:hRule'), 'atLeast'); trPr.append(h)



def fix_table(t, widths):
    """Fixed layout + explicit table/grid widths so Word, Pages and Google Docs agree.
    Children of w:tblPr must stay in schema order: tblStyle, tblW, jc, tblLayout, tblLook."""
    tbl = t._tbl; tblPr = tbl.tblPr
    for tag in ('w:tblW', 'w:tblLayout'):
        for el in tblPr.findall(qn(tag)): tblPr.remove(el)
    w = OxmlElement('w:tblW'); w.set(qn('w:w'), str(int(sum(widths) * 1440))); w.set(qn('w:type'), 'dxa')
    lay = OxmlElement('w:tblLayout'); lay.set(qn('w:type'), 'fixed')
    jc = tblPr.find(qn('w:jc')); look = tblPr.find(qn('w:tblLook'))
    if jc is not None: jc.addprevious(w)
    elif look is not None: look.addprevious(w)
    else: tblPr.append(w)
    if look is not None: look.addprevious(lay)
    else: tblPr.append(lay)
    for i, col in enumerate(t.columns):
        col.width = Inches(widths[i])


def keep_table(t):
    """Keep a table's rows on one page (every row except the last keeps with next)."""
    rows = t.rows
    for r in rows[:-1]:
        for c in r.cells:
            for p in c.paragraphs: p.paragraph_format.keep_with_next = True


def make_table(doc, widths, header=None, fill_header=NAVY):
    """Create a bordered table with fixed column widths (inches). Returns table."""
    t = doc.add_table(rows=0, cols=len(widths))
    t.alignment = WD_TABLE_ALIGNMENT.CENTER
    t.autofit = False
    t._widths = widths
    fix_table(t, widths)
    if header:
        r = t.add_row(); no_split(r)
        for i, h in enumerate(header):
            c = r.cells[i]; c.width = Inches(widths[i]); shade(c, fill_header); borders(c, fill_header); cell_margins(c)
            p = c.paragraphs[0]; p.paragraph_format.space_after = Pt(0)
            run = p.add_run(h); run.bold = True; run.font.size = Pt(8.5); run.font.color.rgb = RGBColor(255, 255, 255)
    return t


def add_row(t, cells, height=None, fills=None, bold_first=False, size=None):
    """cells: list of str (plain) or callables(paragraph)."""
    r = t.add_row(); no_split(r)
    if height: row_height(r, height)
    for i, content in enumerate(cells):
        c = r.cells[i]; c.width = Inches(t._widths[i]); borders(c); cell_margins(c)
        if fills and fills[i]: shade(c, fills[i])
        p = c.paragraphs[0]; p.paragraph_format.space_after = Pt(0)
        if callable(content): content(p)
        else:
            run = p.add_run(str(content))
            if bold_first and i == 0: run.bold = True
            if size: run.font.size = Pt(size)
    return r


def bar(doc, text, sub='', fill=NAVY, new_page=False):
    t = doc.add_table(rows=1, cols=1); t.alignment = WD_TABLE_ALIGNMENT.CENTER; t.autofit = False; fix_table(t, [USABLE])
    c = t.rows[0].cells[0]; c.width = Inches(USABLE); shade(c, fill); borders(c, fill); cell_margins(c, 70, 70, 120, 120)
    p = c.paragraphs[0]; p.paragraph_format.space_after = Pt(0); p.paragraph_format.keep_with_next = True
    if new_page: p.paragraph_format.page_break_before = True
    r = p.add_run(text); r.bold = True; r.font.size = Pt(12.5); r.font.color.rgb = RGBColor(255, 255, 255)
    if sub:
        r2 = p.add_run('   ' + sub); r2.font.size = Pt(8.5); r2.font.color.rgb = RGBColor(0x9F, 0xE5, 0xDD)
    spacer(doc, 3)
    return t


def spacer(doc, pts=4):
    p = doc.add_paragraph(); p.paragraph_format.space_after = Pt(0); p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.line_spacing = Pt(pts)
    return p


def label(doc, text, color=TEAL):
    p = doc.add_paragraph(); p.paragraph_format.space_before = Pt(5); p.paragraph_format.space_after = Pt(2)
    p.paragraph_format.keep_with_next = True
    r = p.add_run(text.upper()); r.bold = True; r.font.size = Pt(8.5); r.font.color.rgb = RGBColor.from_string(color)
    return p


def para(doc, text='', size=None, bold=False, italic=False, color=None, after=3, keep=False):
    p = doc.add_paragraph(); p.paragraph_format.space_after = Pt(after)
    if keep: p.paragraph_format.keep_with_next = True
    if text:
        r = p.add_run(text); r.bold = bold; r.italic = italic
        if size: r.font.size = Pt(size)
        if color: r.font.color.rgb = RGBColor.from_string(color)
    return p


def write_lines(doc, n, gap=17):
    """n ruled answer lines (bottom-bordered empty paragraphs)."""
    for _ in range(n):
        p = doc.add_paragraph(); p.paragraph_format.space_after = Pt(0); p.paragraph_format.line_spacing = Pt(gap)
        pPr = p._p.get_or_add_pPr(); b = OxmlElement('w:pBdr'); bt = OxmlElement('w:bottom')
        bt.set(qn('w:val'), 'single'); bt.set(qn('w:sz'), '4'); bt.set(qn('w:space'), '1'); bt.set(qn('w:color'), '9CA3AF')
        b.append(bt); pPr.append(b)


def page_break(doc):
    doc.add_paragraph().add_run().add_break(WD_BREAK.PAGE)


class _Rich(HTMLParser):
    """Writes inline HTML (strong/em/sub/sup/br) into a paragraph.
    cloze=True turns <strong> text into blanks and records the answers."""
    def __init__(self, par, size=None, cloze=False, color=None):
        super().__init__(convert_charrefs=True)
        self.par, self.size, self.cloze, self.color = par, size, cloze, color
        self.st = {'b': 0, 'i': 0, 'sub': 0, 'sup': 0}
        self.answers = []

    def handle_starttag(self, tag, attrs):
        if tag in ('strong', 'b'): self.st['b'] += 1
        elif tag in ('em', 'i'): self.st['i'] += 1
        elif tag in self.st: self.st[tag] += 1
        elif tag == 'br': self.par.add_run().add_break()

    def handle_endtag(self, tag):
        if tag in ('strong', 'b'): self.st['b'] -= 1
        elif tag in ('em', 'i'): self.st['i'] -= 1
        elif tag in self.st: self.st[tag] -= 1

    def handle_data(self, data):
        if not data: return
        if self.cloze and self.st['b'] > 0:
            self.answers.append(data.strip())
            data = '_' * max(8, min(22, int(len(data.strip()) * 1.2)))
            run = self.par.add_run(data)
        else:
            run = self.par.add_run(data)
            run.bold = self.st['b'] > 0
        run.italic = self.st['i'] > 0
        if self.st['sub']: run.font.subscript = True
        if self.st['sup']: run.font.superscript = True
        if self.size: run.font.size = Pt(self.size)
        if self.color: run.font.color.rgb = RGBColor.from_string(self.color)


def rich(par, html, size=None, cloze=False, color=None):
    r = _Rich(par, size, cloze, color); r.feed(html); r.close(); return r.answers


def formula(par, f, size=None, bold=False):
    """Write a plain formula like Al2(SO4)3 with subscripted digits."""
    for tok in re.findall(r'\d+|[^\d]+', f):
        run = par.add_run(tok); run.bold = bold
        if tok.isdigit(): run.font.subscript = True
        if size: run.font.size = Pt(size)


def html_table(doc, html, size=9):
    """Render the simple <table> HTML used in SECTIONS[*].extra."""
    tables = re.findall(r'<table>.*?</table>', html, flags=re.S)
    for tb in tables:
        head = re.findall(r'<th>(.*?)</th>', tb, flags=re.S)
        rows = [re.findall(r'<td>(.*?)</td>', r, flags=re.S) for r in re.findall(r'<tr>(.*?)</tr>', re.sub(r'<thead>.*?</thead>', '', tb, flags=re.S), flags=re.S)]
        rows = [r for r in rows if r]
        n = len(head); w = USABLE / n
        t = make_table(doc, [w] * n, [re.sub(r'<.*?>', '', h) for h in head])
        for r in rows:
            add_row(t, [(lambda html_: (lambda p: rich(p, html_, size=size)))(c) for c in r], fills=[None] * n)
        keep_table(t)
        spacer(doc, 4)


def checkbox(par):
    par.add_run('☐ ')


def new_page(doc):
    """Start the next block on a fresh page without ever creating a blank one
    (a tiny paragraph with pageBreakBefore, instead of a paragraph holding a break)."""
    p = doc.add_paragraph()
    p.paragraph_format.page_break_before = True
    p.paragraph_format.space_after = Pt(0); p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.line_spacing = Pt(2)
    r = p.add_run(' '); r.font.size = Pt(1)
    return p
