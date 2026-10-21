#!/usr/bin/env python3
"""Generates the STUDENT build of the Unit 1 Review (js/activities/unit1-review.js)
from the teacher-capable source (dev/teacher-preview/unit1-review.teacher.js) by
cutting out the ?preview=1 click-through mode completely.

Edit the teacher source, then run:  python3 dev/teacher-preview/make-student.py
Only js/activities/unit1-review.js is ever built into the site or the Apps Script
bundle; the teacher copy is used only by dev/test-harness.html?a=unit1-review&preview=1.
"""
import re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / 'dev/teacher-preview/unit1-review.teacher.js'
OUT = ROOT / 'js/activities/unit1-review.js'

src = SRC.read_text(encoding='utf8')


def cut(pattern, repl):
    global src
    src, n = re.subn(pattern, repl, src, count=1, flags=re.S)
    if n != 1:
        sys.exit('make-student: could not find block to remove: ' + pattern[:70])


cut(r"\n/\* ---- teacher preview \(\?preview=1\) ---- \*/\n.*?\.u1r-lesson \.u1r-preview label \{[^}]*\}\n", "\n")
cut(r"  // Teacher preview: open with \?preview=1.*?STRINGS\.previewRestart = [^\n]*\n", "")
cut(r"    if \(PREVIEW\) \{ renderQuizQuestion\(mount, ctx, \[\], 0\); return; \}\n", "")
cut(r"    const previewBar = PREVIEW \? `.*?` : '';\n    mount\.innerHTML = previewBar \+ `", "    mount.innerHTML = `")
cut(r"if \(!PREVIEW\) \{ (session\.answers = answers; session\.status = 'in_progress'; persist\(\);) \}", r"\1")
cut(r"if \(!PREVIEW\) \{ (if \(!session\.status\) session\.status = 'in_progress'; persist\(\);) \}", r"\1")
cut(r"    function goTo\(i\) \{.*?    \} else \{\n      nextBtn\.addEventListener\('click', \(\) => renderQuiz\(mount, ctx\)\);\n    \}\n",
    "    nextBtn.addEventListener('click', () => renderQuiz(mount, ctx));\n")
if re.search(r'(?i)preview', src):
    sys.exit('make-student: preview remnants left in output')

header = "// GENERATED student build -- do not edit here. Edit the teacher source under dev/ and run its make-student.py.\n"
OUT.write_text(header + src, encoding='utf8')
print('wrote', OUT.relative_to(ROOT), '(%d lines)' % src.count('\n'))
