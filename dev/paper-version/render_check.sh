#!/bin/bash
# usage: render_check.sh <docx path> <outdir>   -> outdir/<name>.pdf + page jpgs + contact sheets
DOCX="$1"; OUTD="$2"; NAME=$(basename "$DOCX" .docx); mkdir -p "$OUTD"; PDF="$OUTD/$NAME.pdf"; rm -f "$PDF"
cat > /tmp/wordpdf2.scpt <<EOS
tell application "Microsoft Word"
  open POSIX file "$DOCX"
  set theDoc to active document
  save as theDoc file name "$PDF" file format format PDF
  close theDoc saving no
end tell
EOS
osascript /tmp/wordpdf2.scpt > /tmp/wordpdf2.out 2>&1 &
PID=$!; for i in $(seq 1 60); do sleep 1; if ! kill -0 $PID 2>/dev/null; then break; fi; done; kill $PID 2>/dev/null
[ -f "$PDF" ] || { echo "PDF failed: $(tail -2 /tmp/wordpdf2.out)"; exit 1; }
rm -f "$OUTD/$NAME"-*.jpg; pdftoppm -jpeg -r 55 "$PDF" "$OUTD/$NAME"
echo "$NAME: $(pdfinfo "$PDF" | grep Pages)"
