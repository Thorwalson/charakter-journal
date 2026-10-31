#!/usr/bin/env python3
"""
Baut die Offline-Version des WoW-Forever-Namen-Generators als EINE
einzelne HTML-Datei: downloads/CharakterJournal-Namensgenerator-Forever.html

Wann ausführen? Immer wenn du js/namegen-data.js, js/namegen-data-forever.js,
js/namegen.js, js/namegen-forever.js oder die Styles geändert hast.

    python3 tools/build_namegen_offline_forever.py

(Benötigt nur Python 3, sonst nichts.)
"""
import base64, os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
rd = lambda p: open(os.path.join(ROOT, p), encoding="utf-8").read()

css = rd("css/style.css") + "\n" + rd("css/namegen.css")
css = re.sub(r"/\*.*?\*/", "", css, flags=re.S)
css = css.replace("</style", "<\\/style")

def js(path):
    return rd(path).replace("</script", "<\\/script")

scripts = [js("js/namegen-data.js"), js("js/namegen.js"), js("js/namegen-data-forever.js"), js("js/namegen-forever.js")]
logo = base64.b64encode(open(os.path.join(ROOT, "assets/logo.png"), "rb").read()).decode()
icon = base64.b64encode(open(os.path.join(ROOT, "assets/favicon.png"), "rb").read()).decode()

html = f"""<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>WoW-Forever-Namen-Generator – Charakter Journal (Offline-Version)</title>
<link rel="icon" type="image/png" href="data:image/png;base64,{icon}">
<style>
{css}
.offline-top {{ display:flex; align-items:center; gap:.8rem; padding:.7rem 1rem; border-bottom:1px solid var(--gold-lo); background:#0b0d14; }}
.offline-top img {{ width:36px; height:36px; }}
.offline-top strong {{ font-family:var(--display); color:var(--gold-hi); }}
</style>
</head>
<body>
<div class="offline-top"><img alt="" src="data:image/png;base64,{icon}"><strong>Charakter Journal · Namen-Generator für WoW Forever</strong><span class="muted" style="margin-left:auto;font-size:.85rem">Offline-Version</span></div>
<main>
  <section class="hero" style="padding-bottom:0">
    <div class="wrap hero-grid">
      <div class="hero-text">
        <span class="badge">Für WoW Forever</span>
        <h1>Namen-Generator<br><span>für WoW Forever</span></h1>
        <p class="lead">Passend zu den echten Völkern und Klassen von WoW Forever, mit den richtigen Volk-Klassen-Regeln. Dazu <strong>Beinamen</strong>: ein Titel wie „der Drachentöter“ oder ein Spitzname wie „Eisenfaust“. Diese Datei funktioniert komplett ohne Internet.</p>
      </div>
      <div class="hero-logo"><img alt="" src="data:image/png;base64,{logo}" width="320" height="320"></div>
    </div>
  </section>
  <section class="section" style="padding-top:1.5rem"><div class="wrap"><div id="namegen-forever"><noscript>Bitte JavaScript aktivieren.</noscript></div></div></section>
</main>
<footer class="site-footer"><div class="wrap">
  <strong>Charakter Journal</strong> – Deine Reise. Deine Legende.
  <small>Inoffizielles Fan-Projekt. Die Völker-, Klassen- und Beinamen-Angaben für WoW Forever stammen vom Projektteam selbst und können sich ändern.</small>
</div></footer>
<script>
{scripts[0]}
</script>
<script>
{scripts[1]}
</script>
<script>
{scripts[2]}
</script>
<script>
{scripts[3]}
</script>
</body>
</html>
"""
out = os.path.join(ROOT, "downloads", "CharakterJournal-Namensgenerator-Forever.html")
os.makedirs(os.path.dirname(out), exist_ok=True)
open(out, "w", encoding="utf-8").write(html)
print("Fertig:", out, f"({len(html)//1024} KB)")
