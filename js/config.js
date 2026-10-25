/* ==========================================================
   Charakter Journal – ZENTRALE EINSTELLUNGEN
   ----------------------------------------------------------
   Hier pflegt ihr alles, was sich ändert. Die HTML-Seiten
   müsst ihr dafür NICHT anfassen:
     • LINKS      → Discord, GitHub, Spenden, Formulare
     • VERSIONS   → Downloads pro WoW-Version
     • ROADMAP    → was geplant / in Arbeit / fertig ist
     • TIMELINE   → Versionsverlauf mit Datum
   Nach jeder Änderung: Datei speichern und auf GitHub hochladen.
   ========================================================== */

window.CJ = {

  /* ---------- Allgemein ---------- */
  name: "Charakter Journal",          // Arbeitstitel – hier später einfach ändern
  tagline: "Deine Reise. Deine Legende.",
  currentVersion: "0.1.0",

  /* ---------- Links ----------
     Ersetzt die "#"-Platzhalter durch eure echten Adressen.
     Leere oder "#"-Links werden automatisch als "bald verfügbar" markiert. */
  links: {
    github:      "#",   // z. B. https://github.com/DEIN-NAME/charakter-journal
    githubIssues:"#",   // z. B. https://github.com/DEIN-NAME/charakter-journal/issues
    discussions: "#",   // z. B. https://github.com/DEIN-NAME/charakter-journal/discussions
    discord:     "https://discord.gg/2z7APn3wnQ",   // Einladungslink eures Discord-Servers
    kofi:        "#",   // z. B. https://ko-fi.com/DEIN-NAME
    paypal:      "#",   // z. B. https://paypal.me/DEIN-NAME
    curseforge:  "#",   // Projektseite auf CurseForge
    wago:        "#",   // Projektseite auf Wago Addons
    storyForm:   "#",   // Formular zum Einsenden von Geschichten (Tally / Google Forms)
    ideaForm:    "#",   // Formular für Ideen (optional, sonst Discussions)
    email:       ""     // Kontakt-E-Mail (optional)
  },

  /* ---------- Downloads ----------
     Pro WoW-Version ein Eintrag. "url" = Direktlink auf die ZIP-Datei,
     am einfachsten ein GitHub-Release-Asset.
     "status": "release" | "beta" | "soon"
     "older": Liste älterer Versionen [{ v: "0.0.9", url: "…", date: "2026-10-01" }] */
  versions: [
    {
      id: "retail",
      title: "Retail",
      subtitle: "Aktuelles World of Warcraft",
      icon: "🏰",
      version: "0.1.0",
      date: "",
      status: "soon",
      url: "#",
      note: "Die moderne Live-Version des Spiels.",
      older: []
    },
    {
      id: "classic",
      title: "Classic",
      subtitle: "Classic Era / Progression",
      icon: "⚔️",
      version: "0.1.0",
      date: "",
      status: "soon",
      url: "#",
      note: "Für die klassischen Realms.",
      older: []
    },
    {
      id: "hardcore",
      title: "Classic Hardcore",
      subtitle: "Ein Leben. Eine Geschichte.",
      icon: "💀",
      version: "0.1.0",
      date: "",
      status: "soon",
      url: "#",
      note: "Perfekt für Hardcore: jeder Schritt wird festgehalten, bis zum letzten.",
      older: []
    },
    {
      id: "forever",
      title: "WoW Forever",
      subtitle: "Die Forever-Realms",
      icon: "♾️",
      version: "0.1.0",
      date: "",
      status: "soon",
      url: "#",
      note: "Für die Forever-Version von WoW.",
      older: []
    }
  ],

  /* ---------- KI-Assistenten (Seite "KI-Geschichten") ----------
     Gratis-Angebote ändern sich oft! Prüft diese Angaben regelmäßig
     und passt "aisChecked" an, wenn ihr etwas aktualisiert habt. */
  aisChecked: "Oktober 2026",
  ais: [
    {
      name: "ChatGPT", provider: "OpenAI", icon: "💬",
      url: "https://chatgpt.com",
      text: "Der bekannteste KI-Chat, gut im Erzählen und Fortsetzen langer Geschichten.",
      free: "Kostenloser Tarif mit begrenzter Nutzung. Das Limit schwankt je nach Auslastung.",
      pin: "Anpinnen (Pin), bis zu 3 Chats gleichzeitig.",
      steps: [
        "Am Computer in der linken Seitenleiste mit der Maus über den Chat fahren.",
        "Auf die drei Punkte klicken und „Pin“ (Anpinnen) wählen.",
        "Am Handy: Chat lange gedrückt halten und „Pin“ wählen.",
        "Tipp: Den Chat gleich nach dem Charakter benennen, z. B. „Thorwin – Chronik“."
      ],
      note: "Es lassen sich nur 3 Chats gleichzeitig anpinnen. Wenn du mehrere Charaktere hast, benenne die Chats zusätzlich eindeutig."
    },
    {
      name: "Claude", provider: "Anthropic", icon: "✒️",
      url: "https://claude.ai",
      text: "Schreibt gern ausführlich und behält auch in langen Chats den Faden gut.",
      free: "Kostenlos nutzbar. Das Nutzungslimit gilt pro Sitzung und setzt sich alle 5 Stunden zurück.",
      pin: "Mit Stern markieren („Star“), der Chat erscheint dann unter „Starred“.",
      steps: [
        "In der linken Seitenleiste mit der Maus über den Chat fahren.",
        "Auf die drei Punkte klicken und „Star“ wählen.",
        "Der Chat steht nun in der Rubrik „Starred“, bequem zu finden.",
        "Tipp: Den Chat nach dem Charakter benennen."
      ],
      note: "Wird ein Chat sehr lang, weist die KI darauf hin, wenn das Kontextfenster überschritten wird. Siehe „Wenn der Chat zu lang wird“ unten.",
      info: "https://support.claude.com/en/articles/8602283-about-free-claude-usage"
    },
    {
      name: "Copilot", provider: "Microsoft", icon: "🪁",
      url: "https://copilot.microsoft.com",
      text: "Der KI-Assistent von Microsoft, direkt im Browser und als App nutzbar.",
      free: "Kostenlos nutzbar, mit Tageslimits. Ein Microsoft-Konto ist empfehlenswert.",
      pin: "Eine Pin-Funktion konnten wir nicht bestätigen. Benenne den Chat nach dem Charakter und setze ein Browser-Lesezeichen.",
      steps: [
        "Den Chat öffnen, in dem deine Geschichte läuft.",
        "Die Adresse als Lesezeichen im Browser speichern (Strg + D).",
        "Prüfe in der App, ob du Chats benennen oder anheften kannst.",
        "Speichere die fertigen Kapitel zusätzlich selbst (z. B. in Word)."
      ],
      note: "Verlass dich bei Copilot nicht allein auf den Chatverlauf. Sichere fertige Kapitel regelmäßig selbst."
    },
    {
      name: "Gemini", provider: "Google", icon: "🌟",
      url: "https://gemini.google.com",
      text: "Der KI-Assistent von Google. Praktisch, wenn du ohnehin ein Google-Konto hast.",
      free: "Kostenlos mit Google-Konto. Es gelten tägliche Nutzungslimits, die je nach Funktion unterschiedlich sind.",
      pin: "Anheften (Pin) möglich, aber nur wenn „Aktivität in Gemini-Apps“ eingeschaltet ist.",
      steps: [
        "Seitenleiste öffnen (bei Bedarf über das Menü).",
        "Mit der Maus über den Chat unter „Zuletzt“ fahren.",
        "Auf „Mehr“ (drei Punkte) klicken und „Anheften“ bzw. „Pin“ wählen.",
        "Gepinnte Chats stehen oben in der Liste „Zuletzt“."
      ],
      note: "Wichtig: Löschst du einen Chat aus der Liste, wird er auch aus der Gemini-Aktivität gelöscht, inklusive aller darin erstellten Inhalte.",
      info: "https://support.google.com/gemini/answer/13666746"
    },
    {
      name: "Le Chat", provider: "Mistral AI", icon: "🇪🇺",
      url: "https://chat.mistral.ai",
      text: "Der KI-Assistent des französischen Unternehmens Mistral AI. Gut, wenn dir ein europäischer Anbieter wichtig ist.",
      free: "Kostenlos nutzbar. Funktionen wie Websuche, Bilder oder Dokument-Upload haben tägliche Limits.",
      pin: "Eine Pin-Funktion konnten wir nicht bestätigen. Benenne den Chat nach dem Charakter und setze ein Browser-Lesezeichen.",
      steps: [
        "Den Chat öffnen, in dem deine Geschichte läuft.",
        "Die Adresse als Lesezeichen im Browser speichern (Strg + D).",
        "Prüfe in Le Chat, ob du Chats benennen oder markieren kannst.",
        "Melde dich an, damit dein Verlauf erhalten bleibt."
      ],
      note: "Ohne Anmeldung ist der Verlauf nicht zuverlässig. Für eine lange Geschichte also unbedingt einloggen.",
      info: "https://help.mistral.ai/en/articles/316384-what-are-the-features-and-limitations-of-le-chat-free"
    }
  ],

  /* ---------- Roadmap ----------
     status: "planned" (geplant) | "progress" (in Arbeit) | "done" (fertig)
     Reihenfolge innerhalb einer Spalte = Reihenfolge hier. */
  roadmap: [
    { status: "progress", title: "Tracking-Kern", text: "Level-Ups, Quests, Zonen, besiegte Gegner und eingesetzte Fähigkeiten werden mitgeschrieben.", tag: "Addon" },
    { status: "progress", title: "Attribut-Verlauf", text: "Wie sich Stärke, Ausdauer & Co. mit jedem Level entwickeln.", tag: "Addon" },
    { status: "progress", title: "Website & Anleitung", text: "Diese Seite mit Downloads, Anleitung, Roadmap und Community.", tag: "Website" },

    { status: "planned", title: "Export als Text", text: "Journal im Spiel als kopierbaren Text ausgeben.", tag: "Addon" },
    { status: "planned", title: "Word- & Excel-Export", text: "Direkt im Browser aus deinen Daten ein Dokument oder eine Tabelle erzeugen.", tag: "Website" },
    { status: "planned", title: "KI-Prompt-Generator", text: "Levelabschnitte (1–5, 6–10 …) als fertigen Prompt für ChatGPT, Claude, Gemini & Co.", tag: "Addon + Website" },
    { status: "planned", title: "Story-Galerie", text: "Geschichten der Community lesen, teilen und bewerten.", tag: "Community" },
    { status: "planned", title: "Gedruckte Chronik", text: "Deine Geschichte als gestaltetes PDF und später als echtes Buch.", tag: "Idee" },
    { status: "planned", title: "Bosse, Dungeons & Raids", text: "Legendäre Momente deiner Reise festhalten.", tag: "Addon" },
    { status: "planned", title: "Mehr Sprachen", text: "Deutsch und Englisch zuerst, weitere nach Bedarf.", tag: "Addon + Website" },

    { status: "done", title: "KI-Seite mit Gratis-Optionen", text: "Übersicht kostenloser KI-Assistenten und Prompt-Vorlagen für zusammenhängende Geschichten.", tag: "Website" },
    { status: "done", title: "Projektstart", text: "Idee, Name und Logo stehen.", tag: "Projekt" }
  ],

  /* ---------- Timeline ----------
     Neueste Einträge oben. state: "done" | "next" | "future"
     date: freier Text, z. B. "Oktober 2026" */
  timeline: [
    { date: "Bald",          state: "next",   title: "Erste öffentliche Beta", text: "Tracking-Kern und erster Export, zum Testen für alle." },
    { date: "In Arbeit",     state: "next",   title: "Version 0.1.0",          text: "Quests, Level, Zonen, Gegner und Fähigkeiten werden aufgezeichnet." },
    { date: "Oktober 2026",  state: "done",   title: "Website geht an den Start", text: "Downloads, Anleitung, Roadmap und Community-Bereich." },
    { date: "Oktober 2026",  state: "done",   title: "Der Funke",              text: "Die Idee: Jeder Charakter verdient eine Geschichte." }
  ]
};
