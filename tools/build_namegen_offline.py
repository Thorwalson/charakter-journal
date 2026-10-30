#!/usr/bin/env python3
"""
Baut die Offline-Version des Namen-Generators als EINE einzelne HTML-Datei:
    downloads/CharakterJournal-Namensgenerator.html

Wann ausführen? Immer wenn du js/namegen-data.js (die Namenslisten),
js/namegen.js oder die Styles geändert hast.

    python3 tools/build_namegen_offline.py

(Benötigt nur Python 3, sonst nichts.)
"""
import base64, os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
rd = lambda p: open(os.path.join(ROOT, p), encoding="utf-8").read()

css = rd("css/style.css") + "\n" + rd("css/namegen.css")
css = re.sub(r"/\*.*?\*/", "", css, flags=re.S)          # Kommentare entfernen
css = css.replace("</style", "<\\/style")
data = rd("js/namegen-data.js").replace("</script", "<\\/script")
engine = rd("js/namegen.js").replace("</script", "<\\/script")
icon = base64.b64encode(open(os.path.join(ROOT, "assets/favicon.png"), "rb").read()).decode()

html = f"""<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>WoW-Namen-Generator – Charakter Journal (Offline-Version)</title>
<link rel="icon" type="image/png" href="data:image/png;base64,{icon}">
<style>
{css}
.offline-top {{ display:flex; align-items:center; gap:.8rem; padding:.7rem 1rem; border-bottom:1px solid var(--gold-lo); background:#0b0d14; }}
.offline-top img {{ width:36px; height:36px; }}
.offline-top strong {{ font-family:var(--display); color:var(--gold-hi); }}
</style>
</head>
<body>
<div class="offline-top"><img alt="" src="data:image/png;base64,{icon}"><strong>Charakter Journal · Namen-Generator</strong><span class="muted" style="margin-left:auto;font-size:.85rem">Offline-Version</span></div>
<main>
  <section class="page-hero wrap">
    <h1>Namen-Generator</h1>
    <div class="rule"></div>
    <p>Wähle Klasse und Volk, und der Generator würfelt dir passende Namen. Diese Datei funktioniert komplett ohne Internet.</p>
  </section>
  <section class="section" style="padding-top:1.5rem"><div class="wrap"><div id="namegen"><noscript>Bitte JavaScript aktivieren.</noscript></div></div></section>
</main>
<footer class="site-footer"><div class="wrap">
  <strong>Charakter Journal</strong> – Deine Reise. Deine Legende.
  <small>Inoffizielles Fan-Projekt, nicht mit Blizzard Entertainment, Inc. verbunden. World of Warcraft® ist eine eingetragene Marke von Blizzard Entertainment, Inc.</small>
</div></footer>
<script>
{data}
</script>
<script>
{engine}
</script>
</body>
</html>
"""
out = os.path.join(ROOT, "downloads", "CharakterJournal-Namensgenerator.html")
os.makedirs(os.path.dirname(out), exist_ok=True)
open(out, "w", encoding="utf-8").write(html)
print("Fertig:", out, f"({len(html)//1024} KB)")
