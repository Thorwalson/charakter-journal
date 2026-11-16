/* ==========================================================
   Charakter Journal – Namen-Generator für "WoW Forever"
   Nutzt die Engine aus js/namegen.js (window.CJ_NameGen) und
   die Daten aus js/namegen-data-forever.js (window.CJ_FOREVER).
   Reihenfolge der <script>-Tags ist wichtig, siehe HTML-Seite.
   Baut seine Oberfläche in das Element #namegen-forever.
   ========================================================== */
(function () {
  "use strict";
  var D = window.CJ_NAMES, NG = window.CJ_NameGen, FV = window.CJ_FOREVER;
  var root = document.getElementById("namegen-forever");
  if (!D || !NG || !FV || !root) return;
  var D_EN = NG.dataEN || null;

  function rnd(n) { return Math.floor(Math.random() * n); }
  function pick(a) { return a[rnd(a.length)]; }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  // Die Rassen-/Klassen-IDs sind über beide Sprachdatensätze hinweg identisch
  // (siehe namegen-data-en.js), daher funktioniert die Suche unabhängig von
  // der aktuell aktiven Sprache.
  function findRace(id) {
    var r = D.races.filter(function (x) { return x.id === id; })[0];
    if (r) return r;
    return D_EN ? D_EN.races.filter(function (x) { return x.id === id; })[0] || null : null;
  }
  function findClass(id) {
    var c = D.classes.filter(function (x) { return x.id === id; })[0];
    if (c) return c;
    return D_EN ? D_EN.classes.filter(function (x) { return x.id === id; })[0] || null : null;
  }
  function findRaceLang(id, lang) { return NG.dataFor(lang).races.filter(function (x) { return x.id === id; })[0] || findRace(id); }
  function findClassLang(id, lang) { return NG.dataFor(lang).classes.filter(function (x) { return x.id === id; })[0] || findClass(id); }

  var RACE_IDS = FV.raceOrder;
  var ALL_CLASS_IDS = (function () {
    var seen = {}, out = [];
    RACE_IDS.forEach(function (r) { FV.allow[r].forEach(function (c) { if (!seen[c]) { seen[c] = 1; out.push(c); } }); });
    return out;
  })();
  // "Himmelsgeborene"/Skyborne sind ein eigenes, rein deutsches Homebrew-Volk
  // dieses Servers (eigene Kultur in namegen-data-forever.js) und haben keine
  // englische Entsprechung – in der englischen Sprachoption daher ausblenden,
  // statt mit einer fehlenden Kultur abzustürzen.
  function raceIdsForLang(lang) {
    if (lang !== "en" || !D_EN) return RACE_IDS;
    return RACE_IDS.filter(function (id) { return D_EN.races.some(function (r) { return r.id === id; }); });
  }
  function classIdsForLang(lang) {
    var ids = raceIdsForLang(lang), seen = {}, out = [];
    ids.forEach(function (r) { FV.allow[r].forEach(function (c) { if (!seen[c]) { seen[c] = 1; out.push(c); } }); });
    return out;
  }

  /* ---------- Übersetzungen (nur eigene, Forever-spezifische Texte;
     alle sonstigen gemeinsamen Begriffe kommen über NG.uiStrings()) ---------- */
  var T_FV = {
    de: {
      race: "Volk", cls: "Klasse", gender: "Geschlecht", any: "Egal",
      whatToGen: "Was soll erzeugt werden?", first: "Vorname", last: "Nachname", both: "Vor- + Nachname",
      count: "Anzahl", epiLabel: "Beiname", epiOff: "Kein Beiname", epiTitle: "Titel", epiNick: "Spitzname", epiRandom: "Zufällig",
      mood: "Stimmung", funny: "🤪 Lustige Namen", umlauts: "Umlaute ersetzen (ä → ae)",
      go: "🎲 Namen erzeugen", copyAll: "Alle kopieren",
      randomRace: "Zufälliges Volk", randomCls: "Zufällige Klasse", randomClsFit: "Zufällige Klasse (passend)",
      legendRace: "Volk", legendFaction: "Fraktion", legendCls: "Spielbare Klassen",
      alliance: "Allianz", horde: "Horde",
      assumption: "Annahme", assumptionTip: "Keine genaue Angabe erhalten, eigene Annahme",
      legendSummary: "Welches Volk kann welche Klasse spielen?",
      legendNote: 'Einträge mit „Annahme" wurden nicht genau vorgegeben. Du kannst sie in <code>js/namegen-data-forever.js</code> selbst anpassen.',
      favTitle: "⭐ Gemerkte Namen", favClear: "Alle entfernen", favHint: "Wird nur in deinem Browser gespeichert.",
      noticeTitle: "Gut zu wissen:",
      noticeText: 'Dieser Generator berücksichtigt, welches Volk welche Klasse auf WoW Forever spielen darf. Ein <strong>Beiname</strong> ist ein Titel (z. B. „der Drachentöter") oder ein Spitzname in Anführungszeichen (z. B. „Eisenfaust"), für deine Geschichte und dein Rollenspiel gedacht, er ist <strong>kein</strong> Teil des eigentlichen Charakternamens im Spiel.',
      epiUnavailEn: "Beinamen sind nur auf Deutsch verfügbar.",
      playableClass: function (n) { return n + " spielbare Klasse" + (n === 1 ? "" : "n") + " für diese Auswahl"; },
      epiPoolTxt: function () { return " · " + FV.epithets.titlesM.length + " Titel · " + FV.epithets.nicknames.length + "+ Spitznamen"; },
      settings: "Einstellungen"
    },
    en: {
      race: "Race", cls: "Class", gender: "Gender", any: "Any",
      whatToGen: "What should be generated?", first: "First name", last: "Last name", both: "First + last name",
      count: "Count", epiLabel: "Epithet", epiOff: "No epithet", epiTitle: "Title", epiNick: "Nickname", epiRandom: "Random",
      mood: "Mood", funny: "🤪 Funny names", umlauts: "Replace umlauts (ä → ae)",
      go: "🎲 Generate names", copyAll: "Copy all",
      randomRace: "Random race", randomCls: "Random class", randomClsFit: "Random class (matching)",
      legendRace: "Race", legendFaction: "Faction", legendCls: "Playable classes",
      alliance: "Alliance", horde: "Horde",
      assumption: "Assumption", assumptionTip: "Not explicitly specified, our own assumption",
      legendSummary: "Which race can play which class?",
      legendNote: 'Entries marked "Assumption" were not explicitly specified. You can adjust them yourself in <code>js/namegen-data-forever.js</code>.',
      favTitle: "⭐ Saved names", favClear: "Remove all", favHint: "Only stored in your own browser.",
      noticeTitle: "Good to know:",
      noticeText: 'This generator takes into account which race may play which class on WoW Forever. An <strong>epithet</strong> is a title (e.g. "the Dragonslayer") or a nickname in quotes (e.g. "Ironfist"), meant for your story and roleplay — it is <strong>not</strong> part of the actual in-game character name.',
      epiUnavailEn: "Epithets are only available in German.",
      playableClass: function (n) { return n + " playable class" + (n === 1 ? "" : "es") + " for this selection"; },
      epiPoolTxt: function () { return " · " + FV.epithets.titlesM.length + " titles · " + FV.epithets.nicknames.length + "+ nicknames"; },
      settings: "Settings"
    }
  };

  var LANG_KEY = "cj_namegen_forever_lang";
  function loadLang() { try { var v = localStorage.getItem(LANG_KEY); return v === "en" ? "en" : "de"; } catch (e) { return "de"; } }
  function saveLang(l) { try { localStorage.setItem(LANG_KEY, l); } catch (e) {} }

  var state = { cls: "random", race: "random", gender: "x", mode: "both", count: 5, funny: false, umlauts: false, epi: "off", results: [], fav: loadFav(), lang: (D_EN ? loadLang() : "de") };
  function Tf(key) { return (T_FV[state.lang] || T_FV.de)[key]; }
  function Tg(key) { return NG.uiStrings(state.lang)[key] || key; }

  var FAV_KEY = "cj_namegen_forever_fav";
  function loadFav() { try { return JSON.parse(localStorage.getItem(FAV_KEY) || "[]") || []; } catch (e) { return []; } }
  function saveFav(list) { try { localStorage.setItem(FAV_KEY, JSON.stringify(list)); } catch (e) {} }

  /* ---------- Namen + Beiname erzeugen (respektiert Volk-Klassen-Regeln) ---------- */
  function pickRaceId() { return state.race === "random" ? pick(raceIdsForLang(state.lang)) : state.race; }
  function pickClassId(raceId) {
    var list = FV.allow[raceId];
    if (state.cls !== "random" && list.indexOf(state.cls) >= 0) return state.cls;
    return pick(list);
  }
  function epithetFor(style, classId, gender) {
    if (style === "random") style = Math.random() < 0.5 ? "title" : "nickname";
    if (style === "title") return { style: "title", text: gender === "f" ? pick(FV.epithets.titlesF) : pick(FV.epithets.titlesM) };
    var pool = FV.epithets.nicknames.concat(FV.epithets.nickByClass[classId] || []);
    return { style: "nickname", text: pick(pool) };
  }
  function applyEpithet(base, classId) {
    // Beinamen sind reines deutsches Wortspiel/Rollenspiel-Flair und werden
    // in der englischen Sprachoption komplett übersprungen.
    if (state.epi === "off" || base.lang === "en") return base.full;
    var ep = epithetFor(state.epi, classId, base.gender);
    base.epithet = ep;
    if (ep.style === "title") return (base.full || base.first || base.last) + " " + ep.text;
    // Spitzname-Stil: Vorname "Spitzname" Nachname
    if (base.first && base.last) return base.first + ' "' + ep.text + '" ' + base.last;
    if (base.first) return base.first + ' "' + ep.text + '"';
    return base.last + ' "' + ep.text + '"';
  }

  function generate() {
    var out = [], seen = {}, tries = 0, count = Math.max(1, Math.min(10, state.count));
    while (out.length < count && tries++ < 800) {
      var raceId = pickRaceId(), classId = pickClassId(raceId);
      var g = state.gender === "x" ? (Math.random() < 0.5 ? "m" : "f") : state.gender;
      var base = NG.generate({ race: raceId, cls: classId, gender: g, mode: state.mode, count: 1, funny: state.funny, umlauts: state.umlauts, lang: state.lang })[0];
      base.full = applyEpithet(base, classId);
      var key = base.full.toLowerCase();
      if (seen[key]) continue;
      seen[key] = 1;
      out.push(base);
    }
    return out;
  }

  /* ---------- Oberfläche ---------- */
  function raceItemsList(lang) {
    var groups = [["A", Tf("alliance")], ["H", Tf("horde")]];
    var items = [{ value: "random", label: Tf("randomRace"), iconHtml: '<span class="ng-cicon ng-cicon-emoji">🎲</span>' }];
    groups.forEach(function (g) {
      var list = raceIdsForLang(lang).filter(function (id) { return findRace(id).f === g[0]; });
      if (!list.length) return;
      items.push({ group: g[1], groupIconHtml: NG.factionIcon(g[0], "ng-ficon-dd") });
      list.forEach(function (id) { items.push({ value: id, label: NG.raceLabel(findRaceLang(id, lang)) }); });
    });
    return items;
  }
  function classItemsFor(raceId, lang) {
    var ids = raceId === "random" ? classIdsForLang(lang) : FV.allow[raceId];
    var label = raceId === "random" ? Tf("randomCls") : Tf("randomClsFit");
    var items = [{ value: "random", label: label, iconHtml: '<span class="ng-cicon ng-cicon-emoji">🎲</span>' }];
    ids.forEach(function (id) { var c = findClassLang(id, lang); items.push({ value: id, label: NG.clsLabel(c), iconHtml: NG.classIcon(c, "ng-cicon-dd") }); });
    return items;
  }
  function seg(name, items, cur) {
    return '<div class="seg" role="radiogroup" data-seg="' + name + '">' + items.map(function (i) {
      return '<button type="button" role="radio" aria-checked="' + (i[0] === cur) + '" class="' + (i[0] === cur ? "on" : "") + '" data-val="' + i[0] + '">' + i[1] + "</button>";
    }).join("") + "</div>";
  }
  function legend() {
    return '<div class="table-wrap"><table><thead><tr><th>' + Tf("legendRace") + '</th><th>' + Tf("legendFaction") + '</th><th>' + Tf("legendCls") + '</th></tr></thead><tbody>' +
      raceIdsForLang(state.lang).map(function (id) {
        var r = findRaceLang(id, state.lang), cls = FV.allow[id].map(function (c) { return NG.clsLabel(findClassLang(c, state.lang)); }).join(", ");
        return "<tr><td>" + esc(NG.raceLabel(r)) + (FV.assumed[id] ? ' <span class="tag pre" title="' + Tf("assumptionTip") + '">' + Tf("assumption") + "</span>" : "") +
          "</td><td>" + (r.f === "A" ? Tf("alliance") : Tf("horde")) + "</td><td>" + esc(cls) + "</td></tr>";
      }).join("") + "</tbody></table></div>";
  }

  var $ = function (s) { return root.querySelector(s); };

  function renderShell() {
    root.setAttribute("data-lang", state.lang);
    var langToggleHtml = D_EN ? '<div class="fld"><span>' + Tg("language") + '</span>' + seg("lang", [["de", "Deutsch"], ["en", "English"]], state.lang) + "</div>" : "";
    var epiHtml = state.lang === "en"
      ? '<div class="fld"><span>' + Tf("epiLabel") + '</span><p class="muted" style="margin:.3rem 0 0;font-size:.86rem">' + Tf("epiUnavailEn") + "</p></div>"
      : '<div class="fld"><span>' + Tf("epiLabel") + '</span>' + seg("epi", [["off", Tf("epiOff")], ["title", Tf("epiTitle")], ["nickname", Tf("epiNick")], ["random", Tf("epiRandom")]], state.epi) + "</div>";
    var moodHtml = state.lang === "de"
      ? '<div class="ng-grid" style="margin-top:.2rem">' +
          '<div class="fld"><span>' + Tf("mood") + '</span><label class="switch"><input type="checkbox" id="ngf-funny"' + (state.funny ? " checked" : "") + '><span class="track" aria-hidden="true"></span><span class="lbl">' + Tf("funny") + "</span></label></div>" +
          '<label class="chk small" style="align-self:end"><input type="checkbox" id="ngf-uml"' + (state.umlauts ? " checked" : "") + '><span>' + Tf("umlauts") + "</span></label>" +
        "</div>"
      : "";

    root.innerHTML =
      '<section class="panel ng-form" aria-label="' + Tf("settings") + '">' +
        '<div class="ng-grid">' +
          '<label class="fld"><span>' + Tf("race") + "</span>" + NG.ddHTML({ id: "ngf-race", value: state.race, items: raceItemsList(state.lang) }) + "</label>" +
          '<label class="fld"><span>' + Tf("cls") + "</span>" + NG.ddHTML({ id: "ngf-cls", value: state.cls, items: classItemsFor("random", state.lang) }) + "</label>" +
          '<div class="fld"><span>' + Tf("gender") + "</span>" + seg("gender", [["m", NG.genderIcon("m", "ng-gicon-seg") + " " + Tg("male")], ["f", NG.genderIcon("f", "ng-gicon-seg") + " " + Tg("female")], ["x", Tf("any")]], state.gender) + "</div>" +
          '<div class="fld"><span>' + Tf("whatToGen") + "</span>" + seg("mode", [["first", Tf("first")], ["last", Tf("last")], ["both", Tf("both")]], state.mode) + "</div>" +
          '<label class="fld"><span>' + Tf("count") + ': <b id="ngf-count-out">' + state.count + '</b></span><input type="range" id="ngf-count" min="1" max="10" value="' + state.count + '"></label>' +
          epiHtml +
          langToggleHtml +
        "</div>" +
        moodHtml +
        '<div class="ng-actions"><button type="button" class="btn" id="ngf-go">' + Tf("go") + '</button>' +
        '<button type="button" class="btn ghost" id="ngf-copyall">' + Tf("copyAll") + "</button></div>" +
        '<p class="muted ng-pool" id="ngf-pool"></p>' +
        '<details class="adm-more" style="margin-top:.8rem"><summary>' + Tf("legendSummary") + '</summary><div style="margin-top:.8rem">' + legend() +
        '<p class="muted" style="font-size:.86rem;margin-top:.6rem">' + Tf("legendNote") + "</p></div></details>" +
      "</section>" +
      '<section aria-live="polite"><div id="ngf-results" class="ng-results"></div></section>' +
      '<section class="panel ng-favs" id="ngf-favs-wrap"><div class="ng-favs-head"><h2>' + Tf("favTitle") + '</h2><button type="button" class="lnk" id="ngf-fav-clear">' + Tf("favClear") + "</button></div>" +
        '<div id="ngf-favs"></div><p class="muted" style="margin:.6rem 0 0;font-size:.9rem">' + Tf("favHint") + "</p></section>" +
      '<div class="notice"><strong>' + Tf("noticeTitle") + "</strong> " + Tf("noticeText") + "</div>";

    var countEl = $("#ngf-count"), funnyEl = $("#ngf-funny"), umlEl = $("#ngf-uml");
    if (countEl) countEl.addEventListener("input", function (e) { state.count = parseInt(e.target.value, 10); $("#ngf-count-out").textContent = state.count; run(); });
    if (funnyEl) funnyEl.addEventListener("change", function (e) { state.funny = e.target.checked; run(); });
    if (umlEl) umlEl.addEventListener("change", function (e) { state.umlauts = e.target.checked; run(); });
    $("#ngf-go").addEventListener("click", run);
    $("#ngf-copyall").addEventListener("click", function (e) { copy(state.results.map(function (r) { return r.full; }).join("\n"), e.currentTarget); });

    // Beim ersten Aufbau gibt es noch keine Ergebnisse: jetzt welche würfeln.
    // Bei einem späteren Sprachwechsel (Shell wird neu aufgebaut) bleiben
    // bereits erzeugte Karten unverändert bestehen (eigene Sprache pro Karte) –
    // nur die Oberfläche drumherum wechselt die Sprache.
    if (!state.results.length) { run(); } else { renderResults(); renderPool(); }
    renderFavs();
  }

  function copy(text, btn) {
    function done() { if (!btn) return; var o = btn.textContent; btn.textContent = "✔"; setTimeout(function () { btn.textContent = o; }, 1200); }
    function fallback() {
      var ta = document.createElement("textarea"); ta.value = text; ta.style.cssText = "position:fixed;opacity:0";
      document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); done(); } catch (e) {}
      document.body.removeChild(ta);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, fallback);
    else fallback();
  }
  function isFav(full) { return state.fav.some(function (f) { return f.full === full; }); }

  // Bei Forever steckt ein evtl. Beiname mit in "full" (first/last sind immer
  // der reine Charaktername ohne Beinamen) – die Karte zeigt deshalb "full"
  // als EINEN bearbeitbaren Textblock, statt Vor-/Nachname wie bei Retail.
  function cardMetaHtml(r) {
    var Tl = NG.uiStrings(r.lang || "de");
    var meta = NG.factionIcon(r.race.f, "ng-ficon-meta") + esc(NG.raceLabel(r.race)) + " · " + NG.classIcon(r.cls, "ng-cicon-meta") + esc(NG.clsLabel(r.cls)) + " · " + NG.genderIcon(r.gender, "ng-gicon-meta");
    var badge = r.ingame === null ? "" : (r.ingame
      ? '<span class="ok" title="' + Tl.playableTip + '">' + Tl.playable + "</span>"
      : '<span class="warn" title="' + Tl.notPlayableTip + '">' + Tl.notPlayable + "</span>");
    return meta + " " + badge;
  }
  // Bearbeiten-Ansicht: Volk-Dropdown (nur WoW-Forever-Völker) + dazu passende
  // Klassen (respektiert FV.allow) + Geschlecht-Umschalter. Fraktion ergibt
  // sich automatisch aus dem gewählten Volk. Die Dropdown-Optionen folgen der
  // Sprache, in der DIESE Karte erzeugt wurde (nicht dem aktuellen globalen
  // Schalter), damit ein späterer Sprachwechsel bestehende Karten nicht verfälscht.
  // "Zufällig"-Einträge ergeben für eine bereits erzeugte, konkrete Karte
  // keinen Sinn (und wären auch kein gültiger Auswahl-Wert) – daher raus.
  function stripRandom(items) { return items.filter(function (it) { return it.group || it.value !== "random"; }); }
  function cardMetaEditHtml(r, i) {
    var lang = NG.cardLang(r), Tl = NG.uiStrings(lang);
    return NG.ddHTML({ id: "card-race-" + i, value: r.race.id, items: stripRandom(raceItemsList(lang)) }) +
      NG.ddHTML({ id: "card-cls-" + i, value: r.cls.id, items: stripRandom(classItemsFor(r.race.id, lang)) }) +
      '<div class="ng-gseg" data-card-seg="gender">' +
        '<button type="button" class="' + (r.gender === "m" ? "on" : "") + '" data-val="m" aria-label="' + Tl.male + '" title="' + Tl.male + '">' + NG.genderIcon("m", "ng-gicon-seg") + "</button>" +
        '<button type="button" class="' + (r.gender === "f" ? "on" : "") + '" data-val="f" aria-label="' + Tl.female + '" title="' + Tl.female + '">' + NG.genderIcon("f", "ng-gicon-seg") + "</button>" +
      "</div>";
  }
  // Kleiner, immer sichtbarer Umschalter für das Kartendesign (Standard/Fraktion) –
  // zwei kompakte Icon-Buttons, rechts unter den übrigen Karten-Aktionen gestapelt.
  function cardStyleRowHtml(r) {
    var Tl = NG.uiStrings(NG.cardLang(r));
    // Neutrale Völker haben bewusst kein Wappen – ohne Fallback wäre der
    // Umschalter-Button sonst leer/unsichtbar.
    var facHtml = NG.factionIcon(r.race.f, "ng-ficon-btn") || "🛡️";
    var isFac = r.cardStyle === "faction";
    return '<div class="ng-style-col" data-card-seg="style">' +
      '<button type="button" class="icon-btn' + (!isFac ? " on" : "") + '" data-val="standard" title="' + Tl.styleStandardTip + '" aria-label="' + Tl.styleStandardTip + '">🎴</button>' +
      '<button type="button" class="icon-btn' + (isFac ? " on" : "") + '" data-val="faction" title="' + Tl.styleFactionTip + '" aria-label="' + Tl.styleFactionTip + '">' + facHtml + "</button>" +
    "</div>";
  }
  function refreshCardAfterFieldEdit(i) {
    var r = state.results[i], card = root.querySelector('.ng-card[data-idx="' + i + '"]');
    if (!r || !card) return;
    card.style.setProperty("--cc", r.cls.color);
    card.querySelector(".ng-meta").innerHTML = cardMetaHtml(r);
    NG.refreshCardStyleVisual(card, r);
    // Fraktions-Wappen im Standard/Fraktion-Umschalter neu setzen (kann sich
    // nach einem Volkswechsel in der Bearbeitung geändert haben).
    var styleCol = card.querySelector('[data-card-seg="style"]');
    if (styleCol) styleCol.outerHTML = cardStyleRowHtml(r);
    var favBtn = card.querySelector("[data-fav]");
    if (favBtn) { var on = isFav(r.full); favBtn.classList.toggle("on", on); favBtn.textContent = on ? "★" : "☆"; }
  }
  // Zeigt den Namen wie bei Retail: Vorname in Klassenfarbe, der Rest (Nachname,
  // evtl. mit Beiname) in Weiß. "full" beginnt (siehe applyEpithet oben) bei
  // Beinamen immer mit dem unveränderten Vornamen, daher reicht ein simples
  // Abschneiden der ersten Zeichen – robust für Titel- wie Spitzname-Stil.
  // Bewusst KEINE Klasse ".ng-fn" (die würde toggleCardEditing/readCardEditedName
  // fälschlich auf den getrennten Retail-Zweig schalten) – hier bleibt der
  // ganze Name EIN zusammenhängender, frei editierbarer Textblock.
  function cardNameHtml(r) {
    var first = r.first || "";
    if (first && r.full.indexOf(first) === 0) {
      var rest = r.full.slice(first.length);
      return esc(first) + (rest ? '<span class="ln" spellcheck="false">' + esc(rest) + "</span>" : "");
    }
    return esc(r.full);
  }
  function commitCardEdit(i, edited, card) {
    var r = state.results[i];
    if (!r) return;
    r.full = edited.full || r.full; // Spielbarkeits-Badge bleibt bewusst wie generiert (Beiname macht eine Neuberechnung unsinnig)
    card.querySelector(".ng-name").innerHTML = cardNameHtml(r);
    refreshCardAfterFieldEdit(i);
    wireCardBlur(card);
  }
  function wireCardBlur(card) {
    var nameEl = card.querySelector(".ng-name"), editBtn = card.querySelector("[data-edit]");
    nameEl.addEventListener("blur", function () {
      setTimeout(function () {
        if (!card.classList.contains("editing")) return;
        if (card.contains(document.activeElement)) return; // Klick auf Dropdown/Umschalter in derselben Karte: nicht schließen
        editBtn.click();
      }, 0);
    });
  }
  function renderResults() {
    $("#ngf-results").innerHTML = state.results.map(function (r, i) {
      var facLogo = NG.factionIconSrc(r.race.f);
      var cls = "ng-card ng-card-in" + (r.cardStyle === "faction" ? " ng-style-faction" : "") + " " + NG.factionClassFor(r.race.f);
      var Tl = NG.uiStrings(r.lang || "de");
      return '<article class="' + cls + '" data-idx="' + i + '" style="--cc:' + r.cls.color + ';--d:' + Math.min(i * 0.05, 0.4) + 's">' +
        (facLogo ? '<img class="ng-card-fac-logo" src="' + facLogo + '" alt="">' : "") +
        '<div class="ng-name">' + cardNameHtml(r) + "</div>" +
        '<div class="ng-meta">' + cardMetaHtml(r) + "</div>" +
        '<div class="ng-meta-edit">' + cardMetaEditHtml(r, i) + "</div>" +
        '<div class="ng-btns">' +
        '<button type="button" class="icon-btn" data-edit="' + i + '" title="' + Tl.editName + '" aria-label="' + Tl.editName + '">✏️</button>' +
        '<button type="button" class="icon-btn" data-dl="' + i + '" title="' + Tl.saveImg + '" aria-label="' + Tl.saveImg + '">💾</button>' +
        '<button type="button" class="icon-btn" data-copy="' + i + '" aria-label="' + Tl.copy + '">📋</button>' +
        '<button type="button" class="icon-btn' + (isFav(r.full) ? " on" : "") + '" data-fav="' + i + '" aria-label="' + Tl.save + '">' + (isFav(r.full) ? "★" : "☆") + "</button>" +
        cardStyleRowHtml(r) +
        "</div></article>";
    }).join("");
    Array.prototype.forEach.call($("#ngf-results").querySelectorAll(".ng-card"), wireCardBlur);
  }
  function renderFavs() {
    var wrap = $("#ngf-favs-wrap");
    wrap.hidden = !state.fav.length;
    $("#ngf-favs").innerHTML = state.fav.map(function (f, i) {
      return '<div class="ng-fav"><span><strong>' + esc(f.full) + '</strong> <span class="muted">' + esc(f.meta) + '</span></span>' +
        '<span class="ng-btns"><button type="button" class="icon-btn" data-fcopy="' + i + '" aria-label="' + Tg("copy") + '">📋</button>' +
        '<button type="button" class="icon-btn" data-fdel="' + i + '" aria-label="' + Tg("remove") + '">✕</button></span></div>';
    }).join("");
  }
  function renderPool() {
    var classesForPool = state.race === "random" ? classIdsForLang(state.lang) : FV.allow[state.race];
    var epiTxt = (state.epi === "off" || state.lang === "en") ? "" : Tf("epiPoolTxt")();
    $("#ngf-pool").textContent = Tf("playableClass")(classesForPool.length) + epiTxt + ".";
  }
  function run() { state.results = generate(); renderResults(); renderPool(); }

  NG.ddBind(root, function (ddId, val) {
    if (ddId === "ngf-race") {
      state.race = val;
      if (state.race !== "random" && FV.allow[state.race].indexOf(state.cls) < 0) state.cls = "random";
      var ddCls = $('[data-dd="ngf-cls"]');
      var frag = document.createElement("div");
      frag.innerHTML = NG.ddHTML({ id: "ngf-cls", value: state.cls, items: classItemsFor(state.race, state.lang) });
      ddCls.parentNode.replaceChild(frag.firstChild, ddCls);
      run(); return;
    }
    if (ddId === "ngf-cls") { state.cls = val; run(); return; }
    // Volk/Klasse direkt in einer Ergebniskarte geändert (Bearbeiten-Modus):
    // NICHT run() aufrufen, das würde alle Ergebnisse neu würfeln.
    if (ddId.indexOf("card-race-") === 0) {
      var ri = +ddId.slice(10), rr = state.results[ri];
      if (!rr) return;
      var rLang = NG.cardLang(rr);
      rr.race = findRaceLang(val, rLang) || rr.race;
      var allow = FV.allow[val] || [];
      if (allow.indexOf(rr.cls.id) < 0) rr.cls = findClassLang(allow[0], rLang) || rr.cls;
      refreshCardAfterFieldEdit(ri);
      var cardEl = root.querySelector('.ng-card[data-idx="' + ri + '"]');
      var ddClsCard = cardEl && cardEl.querySelector('[data-dd="card-cls-' + ri + '"]');
      if (ddClsCard) {
        var frag2 = document.createElement("div");
        frag2.innerHTML = NG.ddHTML({ id: "card-cls-" + ri, value: rr.cls.id, items: stripRandom(classItemsFor(val, rLang)) });
        ddClsCard.parentNode.replaceChild(frag2.firstChild, ddClsCard);
      }
      return;
    }
    if (ddId.indexOf("card-cls-") === 0) {
      var ci = +ddId.slice(9), cr = state.results[ci];
      if (cr) { cr.cls = findClassLang(val, NG.cardLang(cr)) || cr.cls; refreshCardAfterFieldEdit(ci); }
      return;
    }
  });

  root.addEventListener("click", function (e) {
    var t = e.target.closest("button");
    if (!t) return;
    var segName = t.parentNode.getAttribute && t.parentNode.getAttribute("data-seg");
    if (segName === "lang") {
      state.lang = t.getAttribute("data-val"); saveLang(state.lang);
      // Eine evtl. gewählte Himmelsgeborene-Variante existiert auf Englisch
      // nicht – bei Wechsel zu Englisch auf "Zufällig" zurücksetzen.
      if (state.lang === "en" && raceIdsForLang("en").indexOf(state.race) < 0) state.race = "random";
      if (state.lang === "en" && classIdsForLang("en").indexOf(state.cls) < 0) state.cls = "random";
      renderShell(); return;
    }
    if (segName) {
      state[segName] = t.getAttribute("data-val");
      Array.prototype.forEach.call(t.parentNode.children, function (b) {
        var on = b === t; b.classList.toggle("on", on); b.setAttribute("aria-checked", on);
      });
      run(); return;
    }
    // Geschlecht/Kartendesign direkt in einer Ergebniskarte geändert.
    var cardSeg = t.parentNode.getAttribute && t.parentNode.getAttribute("data-card-seg");
    if (cardSeg) {
      var segCard = t.closest(".ng-card"), segIdx = +segCard.getAttribute("data-idx");
      var segR = state.results[segIdx];
      if (!segR) return;
      if (cardSeg === "gender") segR.gender = t.getAttribute("data-val");
      else if (cardSeg === "style") segR.cardStyle = t.getAttribute("data-val");
      Array.prototype.forEach.call(t.parentNode.children, function (b) { b.classList.toggle("on", b === t); });
      refreshCardAfterFieldEdit(segIdx);
      return;
    }
    if (t.hasAttribute("data-edit")) {
      var editCard = t.closest(".ng-card");
      var nowEditing = NG.toggleCardEditing(editCard, t);
      if (!nowEditing) commitCardEdit(+t.getAttribute("data-edit"), NG.readCardEditedName(editCard), editCard);
      return;
    }
    if (t.hasAttribute("data-dl")) {
      var dlIdx = +t.getAttribute("data-dl"), dlCard = t.closest(".ng-card");
      if (dlCard.classList.contains("editing")) {
        NG.toggleCardEditing(dlCard, dlCard.querySelector("[data-edit]"));
        commitCardEdit(dlIdx, NG.readCardEditedName(dlCard), dlCard);
      }
      NG.downloadCardPNG(state.results[dlIdx]);
      return;
    }
    if (t.hasAttribute("data-copy")) { copy(state.results[+t.getAttribute("data-copy")].full, t); return; }
    if (t.hasAttribute("data-fav")) {
      var r = state.results[+t.getAttribute("data-fav")];
      if (isFav(r.full)) state.fav = state.fav.filter(function (f) { return f.full !== r.full; });
      else state.fav.unshift({ full: r.full, meta: NG.raceLabel(r.race) + " · " + NG.clsLabel(r.cls) });
      saveFav(state.fav); renderResults(); renderFavs(); return;
    }
    if (t.hasAttribute("data-fcopy")) { copy(state.fav[+t.getAttribute("data-fcopy")].full, t); return; }
    if (t.hasAttribute("data-fdel")) { state.fav.splice(+t.getAttribute("data-fdel"), 1); saveFav(state.fav); renderResults(); renderFavs(); return; }
    if (t.id === "ngf-fav-clear") { state.fav = []; saveFav(state.fav); renderResults(); renderFavs(); }
  });
  root.addEventListener("keydown", function (e) {
    if (e.key !== "Enter") return;
    var el = e.target.closest(".ng-name");
    if (!el || el.contentEditable !== "true") return;
    e.preventDefault();
    var editBtn = el.closest(".ng-card").querySelector("[data-edit]");
    if (editBtn) editBtn.click();
  });

  renderShell();
})();
