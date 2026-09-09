#!/usr/bin/env python3
"""Regenerates the apps-script/*.html files so the SAME Apps Script Web App
can also serve the whole frontend, from script.google.com, instead of only
being the JSON API for a separately-hosted (GitHub Pages) site.

Why this exists: some school network filters block/degrade github.io while
already trusting google.com / googleusercontent.com (Workspace depends on
those domains), so serving the whole app from the same Apps Script URL as
the backend can route around that kind of block entirely.

Run this after editing index.html, css/styles.css, or any js/*.js file:

    python3 apps-script/build.py --deploy

--deploy additionally pushes the regenerated files to the Apps Script
project and rolls out a new version of the LIVE deployment (same URL,
same DEPLOYMENT_ID below) via `clasp`, so an update goes out with one
command and no manual copy/paste. Omit --deploy to just regenerate the
files locally without touching the live site. `clasp login` (one-time)
must already be done. Code.gs is hand-maintained, not generated -- this
script never touches it, but --deploy still pushes it along with
everything else, so edit it directly when it needs to change.
"""
import subprocess
import sys
from pathlib import Path

DEPLOYMENT_ID = 'AKfycbwAFlUrS72L4b6bR5rNr-RVdFXzLiZ7dqhJ8QevUVuyr5fktTRBymZ8vQI2EfxsJ2fxbQ'

ROOT = Path(__file__).resolve().parent.parent
OUT = Path(__file__).resolve().parent

# Must match the <script src="..."> order in index.html.
JS_FILES = [
    ('ConfigJs.html', 'js/config.js'),
    ('ContentJs.html', 'js/content.js'),
    ('StorageJs.html', 'js/storage.js'),
    ('MatterReviewJs.html', 'js/activities/matter-review.js'),
    ('CrossMultiplyDensityJs.html', 'js/activities/cross-multiply-density.js'),
    ('AppJs.html', 'js/app.js'),
]

INDEX_TEMPLATE = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<base target="_top">
<title>Ionic Storm</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet">
<?!= include('Styles'); ?>
</head>
<body>
  <header class="site-header">
    <div class="header-inner">
      <h1 id="site-title">Ionic Storm</h1>
      <p id="site-subtitle" class="muted"></p>
    </div>
  </header>

  <main id="app"></main>

  <footer class="site-footer">
    <p>Ionic Storm &middot; Chemistry Class Hub</p>
  </footer>

  <?!= include('ConfigJs'); ?>
  <?!= include('ContentJs'); ?>
  <?!= include('StorageJs'); ?>
  <?!= include('MatterReviewJs'); ?>
  <?!= include('CrossMultiplyDensityJs'); ?>
  <?!= include('AppJs'); ?>
</body>
</html>
"""


def write(name, content):
    (OUT / name).write_text(content)
    print(f"wrote apps-script/{name} ({len(content)} bytes)")


def deploy():
    print("\nPushing to Apps Script...")
    subprocess.run(['clasp', 'push', '--force'], cwd=OUT, check=True)
    print("\nDeploying new version to the live URL...")
    subprocess.run(
        ['clasp', 'deploy', '--deploymentId', DEPLOYMENT_ID, '--description', 'build.py --deploy'],
        cwd=OUT, check=True
    )
    print("\nLive at the usual /exec URL.")


def main():
    styles = (ROOT / 'css/styles.css').read_text()
    write('Styles.html', f"<style>\n{styles}\n</style>")

    for out_name, src in JS_FILES:
        content = (ROOT / src).read_text()
        if '</script' in content.lower():
            raise SystemExit(f"{src} contains a literal '</script' -- would break when inlined, fix before bundling")
        write(out_name, f"<script>\n{content}\n</script>")

    write('Index.html', INDEX_TEMPLATE)

    if '--deploy' in sys.argv:
        deploy()


if __name__ == '__main__':
    main()
