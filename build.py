#!/usr/bin/env python3
"""Bundle the site into ONE self-contained HTML file (dist/index.html).

Images and the CV are embedded as data URIs; CSS and JS are inlined.
Only Three.js, pdf.js (from cdnjs) and Google Fonts load from the web.
Usage:  python3 build.py
"""
import base64, pathlib, re

ROOT = pathlib.Path(__file__).parent
OUT = ROOT / "dist" / "index.html"
MIME = {".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".pdf": "application/pdf", ".webp": "image/webp", ".svg": "image/svg+xml"}

def data_uri(rel):
    p = ROOT / rel
    return f"data:{MIME[p.suffix.lower()]};base64," + base64.b64encode(p.read_bytes()).decode()

html = (ROOT / "index.html").read_text(encoding="utf-8")

css = (ROOT / "css/style.css").read_text(encoding="utf-8")
html = html.replace('<link rel="stylesheet" href="css/style.css">', f"<style>\n{css}\n</style>")

def inline_js(m):
    src = m.group(1)
    code = (ROOT / src).read_text(encoding="utf-8")
    if src.endswith("content.js") or src.endswith("content.admin.js"):
        code = re.sub(r'"(assets/[^"]+\.(?:jpg|jpeg|png|pdf|webp|svg))"', lambda a: '"' + data_uri(a.group(1)) + '"', code)
    return "<script>\n" + code.replace("</script", "<\\/script") + "\n</script>"

html = re.sub(r'<script src="(js/[^"]+)"></script>', inline_js, html)
OUT.parent.mkdir(exist_ok=True)
OUT.write_text(html, encoding="utf-8")
print(f"Wrote {OUT} ({OUT.stat().st_size/1024:.0f} KB)")
