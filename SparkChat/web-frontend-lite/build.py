"""Build the single-file frontend served by SparkChat.exe.

Inputs (all in this folder):
  base.css    - original prototype stylesheet, kept verbatim
  extra.css   - styles added for the real backend integration
  shell.html  - page skeleton (body fragment)
  app.js      - application logic (no build step, plain ES2020)

Output:
  ../frontend/index.html   - self-contained page, no extra static requests
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parent
OUT = ROOT.parent / "frontend" / "index.html"

css = (ROOT / "base.css").read_text(encoding="utf-8").strip()
css += "\n" + (ROOT / "extra.css").read_text(encoding="utf-8").strip()
shell = (ROOT / "shell.html").read_text(encoding="utf-8").strip()
js = (ROOT / "app.js").read_text(encoding="utf-8").strip()

head = """<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Spark Chat · 端侧大模型工作台</title>
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='8' fill='%237460e8'/%3E%3Cpath d='M16 5l3 8 8 3-8 3-3 8-3-8-8-3 8-3z' fill='%23fff'/%3E%3C/svg%3E">
<script>try{if(localStorage.getItem('spark-theme')==='dark')document.documentElement.classList.add('dark')}catch(e){}</script>
<style>
"""
html = head + css + "\n</style>\n</head>\n<body>\n" + shell + "\n<script>\n" + js + "\n</script>\n</body>\n</html>\n"

OUT.parent.mkdir(parents=True, exist_ok=True)
OUT.write_text(html, encoding="utf-8")
print("built", OUT, len(html), "chars")
