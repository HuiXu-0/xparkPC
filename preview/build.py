"""Generate the GitHub Pages interface preview.

Reads the existing single-file frontend *without modifying it*, and writes a
copy that loads demo.js (in-memory sample data) before the app script runs.

Run:  python preview/build.py
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SRC = ROOT.parent / "SparkChat" / "frontend" / "index.html"
OUT = ROOT / "index.html"
TAG = '<script src="./demo.js"></script>'

html = SRC.read_text(encoding="utf-8")
if TAG not in html:
    html = html.replace("</head>", TAG + "\n</head>", 1)

OUT.write_text(html, encoding="utf-8")
print("preview:", OUT, len(html), "chars (source untouched:", SRC, ")")
