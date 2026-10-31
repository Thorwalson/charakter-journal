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

  function rnd(n) { return Math.floor(Math.random() * n); }
  function pick(a) { return a[rnd(a.length)]; }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function findRace(id) { for (var i = 0; i < D.races.length; i++) if (D.races[i].id === id) return D.races[i]; return null; }
  function findClass(id) { for (var i = 0; i < D.classes.length; i++) if (D.classes[i].id === id) return D.classes[i]; return null; }

  var RACE_IDS = FV.raceOrder;
  var ALL_CLASS_IDS = (function () {
    var seen = {}, out = [];
    RACE_IDS.forEach(function (r) { FV.allow[r].forEach(function (c) { if (!seen[c]) { seen[c] = 1; out.push(c); } }); });
    return out;
  })();

  var state = { cls: "random", race: "random", gender: "x", mode: "both", count: 5, funny: false, umlauts: false, epi: "off", results: [], fav: loadFav() };

  var FAV_KEY = "cj_namegen_forever_fav";
  function loadFav() { try { return JSON.parse(localStorage.getItem(FAV_KEY) || "[]") || []; } catch (e) { return []; } }
  function saveFav(list) { try { localStorage.setItem(FAV_KEY, JSON.stringify(list)); } catch (e) {} }

  /* ---------- Namen + Beiname erzeugen (respektiert Volk-Klassen-Regeln) ---------- */
  function pickRaceId() { return state.race === "random" ? pick(RACE_IDS) : state.race; }
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
    if (state.epi === "off") return base.full;
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
      var base = NG.generate({ race: raceId, cls: classId, gender: g, mode: state.mode, count: 1, funny: state.funny, umlauts: state.umlauts })[0];
      base.full = applyEpithet(base, classId);
      var key = base.full.toLowerCase();
      if (seen[key]) continue;
      seen[key] = 1;
      out.push(base);
    }
    return out;
  }

  /* ---------- Oberfläche ---------- */
  function raceOptions() {
    var groups = [["A", "Allianz"], ["H", "Horde"]];
    return '<option value="random">🎲 Zufälliges Volk</option>' + groups.map(function (g) {
      var list = RACE_IDS.filter(function (id) { return findRace(id).f === g[0]; });
      if (!list.length) return "";
      return '<optgroup label="' + g[1] + '">' + list.map(function (id) {
        var r = findRace(id);
        return '<option value="' + id + '">' + esc(r.de) + "</option>";
      }).join("") + "</optgroup>";
    }).join("");
  }
  function classOptionsFor(raceId) {
    var ids = raceId === "random" ? ALL_CLASS_IDS : FV.allow[raceId];
    var label = raceId === "random" ? "🎲 Zufällige Klasse" : "🎲 Zufällige Klasse (passend)";
    return '<option value="random">' + label + "</option>" + ids.map(function (id) {
      var c = findClass(id);
      return '<option value="' + id + '">' + c.icon + " " + esc(c.de) + "</option>";
    }).join("");
  }
  function seg(name, items, cur) {
    return '<div class="seg" role="radiogroup" data-seg="' + name + '">' + items.map(function (i) {
      return '<button type="button" role="radio" aria-checked="' + (i[0] === cur) + '" class="' + (i[0] === cur ? "on" : "") + '" data-val="' + i[0] + '">' + i[1] + "</button>";
    }).join("") + "</div>";
  }
  function legend() {
    return '<div class="table-wrap"><table><thead><tr><th>Volk</th><th>Fraktion</th><th>Spielbare Klassen</th></tr></thead><tbody>' +
      RACE_IDS.map(function (id) {
        var r = findRace(id), cls = FV.allow[id].map(function (c) { return findClass(c).de; }).join(", ");
        return "<tr><td>" + esc(r.de) + (FV.assumed[id] ? ' <span class="tag pre" title="Keine genaue Angabe erhalten, eigene Annahme">Annahme</span>' : "") +
          "</td><td>" + (r.f === "A" ? "Allianz" : "Horde") + "</td><td>" + esc(cls) + "</td></tr>";
      }).join("") + "</tbody></table></div>";
  }

  root.innerHTML =
    '<section class="panel ng-form" aria-label="Einstellungen">' +
      '<div class="ng-grid">' +
        '<label class="fld"><span>Volk</span><select id="ngf-race">' + raceOptions() + "</select></label>" +
        '<label class="fld"><span>Klasse</span><select id="ngf-cls">' + classOptionsFor("random") + "</select></label>" +
        '<div class="fld"><span>Geschlecht</span>' + seg("gender", [["m", "♂ Männlich"], ["f", "♀ Weiblich"], ["x", "Egal"]], state.gender) + "</div>" +
        '<div class="fld"><span>Was soll erzeugt werden?</span>' + seg("mode", [["first", "Vorname"], ["last", "Nachname"], ["both", "Vor- + Nachname"]], state.mode) + "</div>" +
        '<label class="fld"><span>Anzahl: <b id="ngf-count-out">5</b></span><input type="range" id="ngf-count" min="1" max="10" value="5"></label>' +
        '<div class="fld"><span>Beiname</span>' + seg("epi", [["off", "Kein Beiname"], ["title", "Titel"], ["nickname", "Spitzname"], ["random", "Zufällig"]], state.epi) + "</div>" +
      "</div>" +
      '<div class="ng-grid" style="margin-top:.2rem">' +
        '<div class="fld"><span>Stimmung</span><label class="switch"><input type="checkbox" id="ngf-funny"><span class="track" aria-hidden="true"></span><span class="lbl">🤪 Lustige Namen</span></label></div>' +
        '<label class="chk small" style="align-self:end"><input type="checkbox" id="ngf-uml"><span>Umlaute ersetzen (ä → ae)</span></label>' +
      "</div>" +
      '<div class="ng-actions"><button type="button" class="btn" id="ngf-go">🎲 Namen erzeugen</button>' +
      '<button type="button" class="btn ghost" id="ngf-copyall">Alle kopieren</button></div>' +
      '<p class="muted ng-pool" id="ngf-pool"></p>' +
      '<details class="adm-more" style="margin-top:.8rem"><summary>Welches Volk kann welche Klasse spielen?</summary><div style="margin-top:.8rem">' + legend() +
      '<p class="muted" style="font-size:.86rem;margin-top:.6rem">Einträge mit „Annahme“ wurden nicht genau vorgegeben. Du kannst sie in <code>js/namegen-data-forever.js</code> selbst anpassen.</p></div></details>' +
    "</section>" +
    '<section aria-live="polite"><div id="ngf-results" class="ng-results"></div></section>' +
    '<section class="panel ng-favs" id="ngf-favs-wrap"><div class="ng-favs-head"><h2>⭐ Gemerkte Namen</h2><button type="button" class="lnk" id="ngf-fav-clear">Alle entfernen</button></div>' +
      '<div id="ngf-favs"></div><p class="muted" style="margin:.6rem 0 0;font-size:.9rem">Wird nur in deinem Browser gespeichert.</p></section>' +
    '<div class="notice"><strong>Gut zu wissen:</strong> Dieser Generator berücksichtigt, welches Volk welche Klasse auf WoW Forever spielen darf. Ein <strong>Beiname</strong> ist ein Titel (z. B. „der Drachentöter“) oder ein Spitzname in Anführungszeichen (z. B. „Eisenfaust“), für deine Geschichte und dein Rollenspiel gedacht, er ist <strong>kein</strong> Teil des eigentlichen Charakternamens im Spiel.</div>';

  var $ = function (s) { return root.querySelector(s); };

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

  function renderResults() {
    $("#ngf-results").innerHTML = state.results.map(function (r, i) {
      var meta = [r.race.de, r.cls.de, r.gender === "f" ? "♀" : "♂"].join(" · ");
      var badge = r.ingame === null ? "" : (r.ingame
        ? '<span class="ok" title="Vorname als Charaktername geeignet (2–12 Buchstaben)">✔ spieltauglich</span>'
        : '<span class="warn" title="Im Spiel nur 2–12 Buchstaben, keine Sonderzeichen">⚠ nicht spieltauglich</span>');
      return '<article class="ng-card" style="--cc:' + r.cls.color + '"><div class="ng-name">' + esc(r.full) + "</div>" +
        '<div class="ng-meta">' + esc(meta) + " " + badge + "</div>" +
        '<div class="ng-btns"><button type="button" class="icon-btn" data-copy="' + i + '" aria-label="Kopieren">📋</button>' +
        '<button type="button" class="icon-btn' + (isFav(r.full) ? " on" : "") + '" data-fav="' + i + '" aria-label="Merken">' + (isFav(r.full) ? "★" : "☆") + "</button></div></article>";
    }).join("");
  }
  function renderFavs() {
    var wrap = $("#ngf-favs-wrap");
    wrap.hidden = !state.fav.length;
    $("#ngf-favs").innerHTML = state.fav.map(function (f, i) {
      return '<div class="ng-fav"><span><strong>' + esc(f.full) + '</strong> <span class="muted">' + esc(f.meta) + '</span></span>' +
        '<span class="ng-btns"><button type="button" class="icon-btn" data-fcopy="' + i + '" aria-label="Kopieren">📋</button>' +
        '<button type="button" class="icon-btn" data-fdel="' + i + '" aria-label="Entfernen">✕</button></span></div>';
    }).join("");
  }
  function renderPool() {
    var classesForPool = state.race === "random" ? ALL_CLASS_IDS : FV.allow[state.race];
    var epiTxt = state.epi === "off" ? "" : " · " + FV.epithets.titlesM.length + " Titel · " + FV.epithets.nicknames.length + "+ Spitznamen";
    $("#ngf-pool").textContent = classesForPool.length + " spielbare Klasse" + (classesForPool.length === 1 ? "" : "n") + " für diese Auswahl" + epiTxt + ".";
  }
  function run() { state.results = generate(); renderResults(); renderPool(); }

  $("#ngf-race").addEventListener("change", function (e) {
    state.race = e.target.value;
    var sel = $("#ngf-cls");
    sel.innerHTML = classOptionsFor(state.race);
    if (state.race !== "random" && FV.allow[state.race].indexOf(state.cls) < 0) state.cls = "random";
    sel.value = state.cls;
    run();
  });
  $("#ngf-cls").addEventListener("change", function (e) { state.cls = e.target.value; run(); });
  $("#ngf-count").addEventListener("input", function (e) { state.count = parseInt(e.target.value, 10); $("#ngf-count-out").textContent = state.count; run(); });
  $("#ngf-funny").addEventListener("change", function (e) { state.funny = e.target.checked; run(); });
  $("#ngf-uml").addEventListener("change", function (e) { state.umlauts = e.target.checked; run(); });
  $("#ngf-go").addEventListener("click", run);
  $("#ngf-copyall").addEventListener("click", function (e) { copy(state.results.map(function (r) { return r.full; }).join("\n"), e.currentTarget); });

  root.addEventListener("click", function (e) {
    var t = e.target.closest("button");
    if (!t) return;
    var segName = t.parentNode.getAttribute && t.parentNode.getAttribute("data-seg");
    if (segName) {
      state[segName] = t.getAttribute("data-val");
      Array.prototype.forEach.call(t.parentNode.children, function (b) {
        var on = b === t; b.classList.toggle("on", on); b.setAttribute("aria-checked", on);
      });
      run(); return;
    }
    if (t.hasAttribute("data-copy")) { copy(state.results[+t.getAttribute("data-copy")].full, t); return; }
    if (t.hasAttribute("data-fav")) {
      var r = state.results[+t.getAttribute("data-fav")];
      if (isFav(r.full)) state.fav = state.fav.filter(function (f) { return f.full !== r.full; });
      else state.fav.unshift({ full: r.full, meta: r.race.de + " · " + r.cls.de });
      saveFav(state.fav); renderResults(); renderFavs(); return;
    }
    if (t.hasAttribute("data-fcopy")) { copy(state.fav[+t.getAttribute("data-fcopy")].full, t); return; }
    if (t.hasAttribute("data-fdel")) { state.fav.splice(+t.getAttribute("data-fdel"), 1); saveFav(state.fav); renderResults(); renderFavs(); return; }
    if (t.id === "ngf-fav-clear") { state.fav = []; saveFav(state.fav); renderResults(); renderFavs(); }
  });

  run(); renderFavs();
})();
