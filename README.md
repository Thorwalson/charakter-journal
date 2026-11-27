# Charakter Journal – Website

Fertige statische Website (nur HTML, CSS und JavaScript). Kein Server, keine Installation nötig.

## Was ändere ich wo?

| Ich will … | Datei |
|---|---|
| Links setzen (Discord, Ko-fi, GitHub …) | `js/config.js` → Bereich `links` |
| Download-Links und Versionen pflegen | `js/config.js` → Bereich `versions` |
| KI-Assistenten auf der Seite „KI-Geschichten“ pflegen | `js/config.js` → Bereich `ais` (Gratis-Angebote ändern sich oft, danach `aisChecked` aktualisieren) |
| Roadmap anpassen | `js/config.js` → Bereich `roadmap` (Reiter ist aktuell ausgeblendet, siehe `js/main.js` → `hidden:true`) |
| Timeline ergänzen | `js/config.js` → Bereich `timeline` (Reiter ist aktuell ausgeblendet, siehe `js/main.js` → `hidden:true`) |
| Schreibstile für „Chroniken von Azeroth“ anpassen | `js/config.js` → Bereich `writingStyles` |
| Supabase/Captcha einrichten (Kommentare & Chroniken) | siehe Abschnitt „Community: Kommentare & Chroniken von Azeroth einrichten“ unten |
| Texte ändern | die jeweilige `.html`-Datei |
| Farben ändern | `css/style.css` ganz oben (`:root`) |
| Logo austauschen | `assets/logo.png`, `assets/logo-small.png`, `assets/favicon.png` |
| Impressum / Datenschutz ausfüllen | `impressum.html`, `datenschutz.html` (Platzhalter in `[eckigen Klammern]`) |

## Vor dem Veröffentlichen

1. Impressum und Datenschutz ausfüllen (Platzhalter ersetzen, Hinweisboxen löschen).
2. Links in `js/config.js` eintragen. Nicht gesetzte Links werden automatisch als „Bald verfügbar“ angezeigt.
3. Optional: Schrift Cinzel einbauen (Anleitung oben in `css/style.css`).

## Online stellen (GitHub Pages)

1. Konto auf github.com anlegen.
2. Neues Repository erstellen (öffentlich), z. B. `charakter-journal`.
3. Alle Dateien aus diesem Ordner hochladen („Add file → Upload files“). Die Datei `index.html` muss ganz oben im Repository liegen.
4. Im Repository: Settings → Pages → Source: „Deploy from a branch“ → Branch `main` und Ordner `/ (root)` → Save.
5. Nach 1–2 Minuten ist die Seite erreichbar unter `https://DEIN-NAME.github.io/charakter-journal/`.

## Downloads bereitstellen (GitHub Releases)

1. Im Repository rechts auf „Releases“ → „Create a new release“.
2. Tag z. B. `v0.1.0`, ZIP-Dateien pro WoW-Version anhängen (z. B. `CharakterJournal-0.1.0-retail.zip`).
3. Rechtsklick auf die hochgeladene Datei → Link kopieren → in `js/config.js` bei der passenden Version unter `url` einfügen, `status` auf `"release"` stellen.

## Dashboard (Baukasten) – `admin.html`

Mit dem Dashboard pflegst du die Website ohne Code: Download-ZIPs per Drag & Drop, Roadmap (Karten verschieben), Timeline, Screenshots, Story-Galerie und Links. Aufruf: `https://DEIN-NAME.github.io/charakter-journal/admin.html`

1. Einmalig einen GitHub-Token erstellen (Schritt-für-Schritt-Anleitung steht im Dashboard unter „Verbinden“).
2. Im Dashboard Änderungen vornehmen, in der „Vorschau“ ansehen.
3. „Veröffentlichen“ klicken. Nach 1–2 Minuten ist die Website aktuell.

**Wichtig**
- Alles, was das Dashboard verwaltet (Versionen, Roadmap, Timeline, Screenshots, Galerie, Links, Name), wird in `js/content.js` gespeichert und **überschreibt** die Werte in `js/config.js`. Habt ihr das Dashboard einmal benutzt, ändert diese Bereiche bitte nur noch dort.
- Der Token ist wie ein Passwort. Niemals teilen, auf fremden PCs „Token vergessen“ klicken.
- Hochgeladene Dateien existieren erst nach „Veröffentlichen“ im Repository. Das Browser-Fenster vorher nicht neu laden.
- ZIP-Dateien bis ca. 90 MB funktionieren direkt. Größere bitte über GitHub Releases verteilen.
- Geschichten in der Story-Galerie erscheinen nur, wenn „Einverständnis des Verfassers“ angehakt ist.
- Die KI-Seite (`ais` in `js/config.js`) und die Seitentexte werden weiterhin von Hand in den Dateien gepflegt.

## Namen-Generator

- **Online:** `namen-generator.html` (im Menü unter „Namen“).
- **Offline-Download:** `downloads/CharakterJournal-Namensgenerator.html` ist eine einzelne Datei, die ohne Internet per Doppelklick im Browser läuft.
- **Namen ergänzen:** Alle Listen stehen in `js/namegen-data.js` (Wörter, durch Leerzeichen getrennt, Erklärung am Dateianfang). Neue Völker oder Klassen ergänzt du dort ebenfalls.
- **Nach jeder Änderung an den Namenslisten** die Offline-Datei neu bauen: `python3 tools/build_namegen_offline.py` (nur Python 3 nötig). Ohne diesen Schritt bleibt die Download-Version auf dem alten Stand.

## Community: Kommentare & „Chroniken von Azeroth“ einrichten (Supabase)

Die Kommentarspalte (auf `community.html`) und die Story-Bibliothek „Chroniken von Azeroth“ (`chroniken.html`) brauchen einen kleinen, kostenlosen Online-Speicher, damit Kommentare, Likes, eingereichte Geschichten und Bewertungen dauerhaft gespeichert werden – schließlich bleibt die Website selbst „rein statisch“. Dafür wird **Supabase** verwendet (eine kostenlose, gehostete Datenbank mit fertiger Programmierschnittstelle, kein eigener Server nötig).

**Ohne diese Einrichtung** funktionieren beide Seiten trotzdem (keine Fehler, kein kaputtes Layout) – es erscheint nur ein Hinweis „noch nicht eingerichtet“ statt der Formulare/Liste.

### 1. Supabase-Projekt anlegen (einmalig, ca. 5 Minuten)

<ol class="steps-list">
  <li>Kostenloses Konto auf <a href="https://supabase.com" target="_blank" rel="noopener">supabase.com</a> anlegen → „New Project“.</li>
  <li>Projektnamen vergeben (z. B. <code>charakter-journal</code>), Datenbank-Passwort generieren lassen und notieren, Region möglichst in Europa wählen → „Create new project“ (dauert 1–2 Minuten).</li>
  <li>Im Projekt links auf <strong>„SQL Editor“</strong> → „New query“.</li>
  <li>Den kompletten Inhalt der Datei <code>supabase/schema.sql</code> aus diesem Repository hineinkopieren und auf „Run“ klicken. Das legt alle nötigen Tabellen, Regeln (Row-Level-Security) und den Speicherplatz für Buchdateien/Cover an.</li>
  <li>Links auf <strong>„Project Settings“ → „API“</strong> gehen. Dort stehen zwei wichtige Werte:
    <ul style="margin:.4rem 0 0">
      <li><strong>Project URL</strong></li>
      <li><strong>anon public</strong>-Schlüssel (ein langer Text, beginnt meist mit <code>eyJ…</code>)</li>
    </ul>
  </li>
  <li>Beide Werte in <code>js/config.js</code> eintragen, im Bereich <code>supabase: { url: "…", anonKey: "…" }</code>.</li>
</ol>

<div class="notice">
  <strong>Wichtig:</strong> Auf derselben Seite („Project Settings“ → „API“) steht weiter unten noch ein zweiter Schlüssel, der <strong><code>service_role</code></strong>-Schlüssel. Dieser gehört <u>niemals</u> in <code>js/config.js</code> oder sonst irgendeine Datei der Website – er hebelt alle Sicherheitsregeln aus und gehört ausschließlich in das Dashboard (siehe unten), wo er nur im Browser der Admin-Person gespeichert wird.
</div>

### 2. Spam-Schutz (Captcha) einrichten – optional, aber empfohlen

Damit nicht automatisierte Bots Kommentare oder Geschichten einreichen, wird beim Absenden ein kleines, kostenloses Captcha („Cloudflare Turnstile“) angezeigt.

<ol class="steps-list">
  <li>Kostenloses Konto auf <a href="https://dash.cloudflare.com/sign-up" target="_blank" rel="noopener">dash.cloudflare.com</a> anlegen.</li>
  <li>Im Dashboard zu <strong>„Turnstile“</strong> wechseln → „Add widget“.</li>
  <li>Domain der Website eintragen, Widget-Typ <strong>„Managed“</strong> wählen → erstellen.</li>
  <li>Den angezeigten <strong>Site Key</strong> kopieren und in <code>js/config.js</code> bei <code>turnstileSiteKey</code> eintragen.</li>
</ol>

<p><strong>Hinweis zur Sicherheit:</strong> Da die Website keinen eigenen Server hat, wird das Captcha nur im Browser geprüft (clientseitig). Das hält normale Spam-Bots zuverlässig ab, ist aber kein Schutz gegen gezielte, technisch versierte Angriffe – für eine rein ehrenamtliche Community-Seite ist das ein angemessener Kompromiss. Falls später mehr Sicherheit nötig ist, lässt sich das mit einer kleinen Server-Funktion nachrüsten, die den Captcha-Code zusätzlich bei Cloudflare serverseitig bestätigt.</p>

### 3. Kommentare & Chroniken moderieren

Im Dashboard (<code>admin.html</code>) gibt es zwei neue Reiter: <strong>„💬 Kommentare“</strong> und <strong>„📚 Chroniken“</strong>.

<ol class="steps-list">
  <li>Beim ersten Öffnen eines der beiden Reiter nach Project URL und <strong><code>service_role</code></strong>-Schlüssel fragen lassen (siehe Schritt 1 oben, „Project Settings“ → „API“).</li>
  <li>Diese Zugangsdaten werden nur lokal im Browser der Admin-Person gespeichert (wie der GitHub-Token), niemals in einer Datei der Website.</li>
  <li>Im Reiter „Kommentare“: Kommentare hervorheben, ausblenden oder löschen, E-Mail-Adressen der Verfasser einsehen (nicht öffentlich sichtbar).</li>
  <li>Im Reiter „Chroniken“: eingereichte Geschichten freigeben (erst danach erscheinen sie in der Bibliothek), als „Empfehlung“ markieren oder löschen.</li>
</ol>

<div class="notice">
  <strong>Wichtig:</strong> Dieser <code>service_role</code>-Schlüssel ist wie ein General-Passwort für die Datenbank. Nur an vertraute Admin-Personen weitergeben, nicht auf fremden PCs eingeben, bei Verdacht auf Missbrauch in Supabase („Project Settings“ → „API“ → „Reset“) zurücksetzen.
</div>

## Namen-Generator für WoW Forever

Ein zweiter, eigenständiger Generator speziell für den privaten Server „WoW Forever“: nur die dort tatsächlich spielbaren Völker/Klassen-Kombinationen, plus **Beinamen** (Titel wie „der Drachentöter“ oder Spitznamen wie „Eisenfaust“, beides wählbar).

- **Online:** `namen-generator-wow-forever.html` (im Menü unter „Forever-Namen“).
- **Offline-Download:** `downloads/CharakterJournal-Namensgenerator-Forever.html` – eine einzelne Datei, läuft ohne Internet per Doppelklick im Browser.
- **Daten/Regeln bearbeiten:** alles steht in `js/namegen-data-forever.js` (Erklärung am Dateianfang):
  - Welches Volk welche Klasse spielen darf → Bereich „1) ALLOW-TABELLE“.
  - Titel und Spitznamen → Bereich „2) BEINAMEN“, einfach Wörter/Phrasen ergänzen.
  - Namens-„Klang“ der Himmelsgeborenen (Silben, Vor-/Nachnamen) → `D.cultures.skyborne` ganz oben in derselben Datei.
- **Nach jeder Änderung** die Offline-Datei neu bauen: `python3 tools/build_namegen_offline_forever.py`.
