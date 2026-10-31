/* ==========================================================
   Charakter Journal – Namens-Daten speziell für "WoW Forever"
   ----------------------------------------------------------
   Diese Datei baut auf js/namegen-data.js auf (muss vorher
   geladen werden) und ergänzt sie um:
     1. Die Namens-"Kultur" der Himmelsgeborenen (neues Volk)
     2. Welches Volk welche Klasse spielen darf (CJ_FOREVER.allow)
     3. Beinamen: Titel ("der/die ...") und Spitznamen ("...")

   SELBST ANPASSEN:
   - Völker/Klassen ändern sich? → Bereich "1) ALLOW-TABELLE" unten.
   - Neue Beinamen? → Bereich "2) BEINAMEN" unten, einfach in die
     Listen eintragen (durch Komma getrennt, in Anführungszeichen).
   Nach jeder Änderung: tools/build_namegen_offline_forever.py
   ausführen, damit auch die Offline-Datei aktuell bleibt.

   ========================================================== */
(function () {
  "use strict";
  var D = window.CJ_NAMES;
  if (!D) { console.warn("namegen-data-forever.js: js/namegen-data.js fehlt oder wurde nicht vorher geladen."); return; }
  function w(s) { return s.replace(/\s+/g, " ").trim().split(" "); }

  /* ---------- Neue Kultur: Himmelsgeborene (Skyborne) ---------- */
  D.cultures.skyborne = {
    m: { s: w("sol kae vyr thal io ren ael sky ora vael zeph cor drav lior nyx"), m: w("a e o i"),
         e: w("ion dor ael ar wyn ix oren ath elor ian") },
    f: { s: w("sola kae vy thia io sel ael sky ora vael zeph cora drave lior nyxa"), m: w("a e i o"),
         e: w("ia lia ael wyn ora issa ena elle ith") },
    A: w("sky cloud wind sun storm star dawn aether zephyr high"),
    B: w("wing soarer drifter crest gale herald breath flight rider song"),
    cm: w("Solarion Kaevan Vyrion Thalen Iorin Renarion Aelos Skyvar Oranthe Vaelorin Zephyrin Corvain Dravos Lioren Nyxaire Aurelian Thessian Ravalor"),
    cf: w("Solara Kaevya Vyrelle Thalia Iorelle Renalia Aelyssa Skyra Orania Vaelora Zephyrine Coralie Draveth Liorenna Nyxelle Aurelia Thessaly Ravelle"),
    cl: w("Skyward Cloudrunner Windherald Suncrest Stormborn Starweaver Dawnglide Aetherwing Zephyrtouch Highsoarer Cloudbreaker Windrider Skysong Stormcaller Drifthome")
  };

  /* Die zwei Himmelsgeborenen-Varianten als eigene "Völker" eintragen,
     damit sie im Generator wie jedes andere Volk auswählbar sind. */
  var extraRaces = [
    { id: "skyborne_order", de: "Himmelsgeborene (Hoher Orden)", f: "A", c: "skyborne",
      xA: w("light radiant holy sun golden"), xB: w("ward herald blessed crest vow") },
    { id: "skyborne_wind", de: "Himmelsgeborene (Windformer)", f: "H", c: "skyborne",
      xA: w("storm gale wild free rogue"), xB: w("breaker rider howler drifter fury") }
  ];
  extraRaces.forEach(function (r) {
    if (!D.races.some(function (x) { return x.id === r.id; })) D.races.push(r);
  });

  /* ============================================================
     1) ALLOW-TABELLE – welches Volk darf welche Klasse spielen
     Klassen-Kurznamen (wie in js/namegen-data.js): warrior, paladin,
     hunter, rogue, priest, mage, warlock, shaman, druid.
     ============================================================ */
  var allow = {
    human:         w("warrior paladin hunter rogue priest mage warlock"),
    dwarf:         w("warrior paladin hunter priest rogue shaman"),
    nightelf:      w("warrior hunter druid priest rogue"),
    gnome:         w("warrior rogue priest mage warlock"),
    orc:           w("warrior hunter shaman warlock rogue mage"),        // Magier: Besonderheit laut Vorgabe
    undead:        w("warrior rogue warlock priest mage paladin"),        // Paladin: Besonderheit laut Vorgabe
    tauren:        w("warrior hunter shaman druid"),
    troll:         w("warrior hunter shaman priest mage rogue warlock"),  // Hexenmeister: Besonderheit laut Vorgabe
    skyborne_order:w("warrior hunter rogue druid mage"),   // Hoher Orden (Allianz): + Magier
    skyborne_wind: w("warrior hunter rogue druid shaman")  // Windformer (Horde): + Schamane
  };
  var raceOrder = ["human", "dwarf", "nightelf", "gnome", "orc", "undead", "tauren", "troll", "skyborne_order", "skyborne_wind"];
  var assumed = {};

  /* ============================================================
     2) BEINAMEN
     ============================================================ */
  /* Titel: "titlesM[i]" und "titlesF[i]" gehören zusammen (gleicher Index). */
  var titlesM = w(`Unbezwingbare Furchtlose Standhafte Verfluchte Erwählte Namenlose Stille Getreue
    Unerschütterliche Verlorene Wilde Gerechte Grausame Weise Dunkle Helle Einsame Ewige Vergessene
    Geächtete Unbeugsame Rastlose Treue Kühne Schweigsame Zornige Sturmgeborene Leuchtende`).map(function (x) { return "der " + x; })
    .concat(w(`Schattenwandler Drachentöter Dämonenbezwinger Wolfsfreund Grabräuber Thronfolger
      Klingentänzer Flammenbändiger Sturmrufer Lichtbringer Seelensammler Erdenhüter Eisenwille
      Totenwächter Himmelsstürmer`).map(function (x) { return "der " + x; }));
  var titlesF = w(`Unbezwingbare Furchtlose Standhafte Verfluchte Erwählte Namenlose Stille Getreue
    Unerschütterliche Verlorene Wilde Gerechte Grausame Weise Dunkle Helle Einsame Ewige Vergessene
    Geächtete Unbeugsame Rastlose Treue Kühne Schweigsame Zornige Sturmgeborene Leuchtende`).map(function (x) { return "die " + x; })
    .concat(w(`Schattenwandlerin Drachentöterin Dämonenbezwingerin Wolfsfreundin Grabräuberin Thronfolgerin
      Klingentänzerin Flammenbändigerin Sturmruferin Lichtbringerin Seelensammlerin Erdenhüterin Eisenwille
      Totenwächterin Himmelsstürmerin`).map(function (x) { return "die " + x; }));

  var nicknames = w(`Wolfsherz Sturmklinge Eisenwille Nachtschatten Goldmähne Drachenblut Felsbrecher
    Windläufer Donnerhall Nebelgänger Flammentanz Schattenjäger Silberzunge Dornenkrone Rabenfeder
    Kaltblick Wahrheitssucher Trümmerfeld Grenzgänger Blutschwur Treueherz Nachtwache Sternenstaub
    Eisherz Loderflamm Wolkenbrecher Erdenstimme Lichtgänger Schwertlied Freiheitsklang Wildfährte
    Steinfaust Geisterhauch Klingenschrei Moorlicht`);
  var nickByClass = {
    warrior: w("Eisenfaust Schildbrecher Kriegsnarbe Stahlsturm Blutaxt Wutschrei"),
    paladin: w("Lichtschein Goldherz Glanzschild Segensruf Reinherz Dämmerlicht"),
    hunter:  w("Falkenauge Wildspur Pfeilregen Fährtenleser Wolfsbruder Stillerschuss"),
    rogue:   w("Schattenklinge Nachtmesser Leisetritt Dunkelgriff Lautlos Zwielicht"),
    priest:  w("Seelenlicht Gnadenruf Reinklang Lichtflüster Heilhand Sanftmut"),
    mage:    w("Funkenwirbel Frostglut Sternenfeuer Manaherz Runenblitz Glasauge"),
    warlock: w("Schattenpakt Seelenbrand Fluchbringer Dunkelruf Ascheherz Nachtbinder"),
    shaman:  w("Donnerfaust Erdenruf Geisterwind Flammenzunge Wellenreiter Totemherz"),
    druid:   w("Mondpfote Wurzelherz Nachtblüte Sturmfeder Rabenschwinge Wildwuchs")
  };

  window.CJ_FOREVER = {
    allow: allow,
    raceOrder: raceOrder,
    assumed: assumed,
    epithets: { titlesM: titlesM, titlesF: titlesF, nicknames: nicknames, nickByClass: nickByClass }
  };
})();
