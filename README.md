# Charakter Journal – Website

Fertige statische Website (nur HTML, CSS und JavaScript). Kein Server, keine Installation nötig.

## Was ändere ich wo?

| Ich will … | Datei |
|---|---|
| Links setzen (Discord, Ko-fi, GitHub …) | `js/config.js` → Bereich `links` |
| Download-Links und Versionen pflegen | `js/config.js` → Bereich `versions` |
| KI-Assistenten auf der Seite „KI-Geschichten“ pflegen | `js/config.js` → Bereich `ais` (Gratis-Angebote ändern sich oft, danach `aisChecked` aktualisieren) |
| Roadmap anpassen | `js/config.js` → Bereich `roadmap` |
| Timeline ergänzen | `js/config.js` → Bereich `timeline` |
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
