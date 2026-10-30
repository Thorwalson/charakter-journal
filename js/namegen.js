/* ==========================================================
   Charakter Journal – Namen-Generator (Engine + Oberfläche)
   Benötigt: js/namegen-data.js (window.CJ_NAMES)
   Baut seine Oberfläche in das Element #namegen.
   ========================================================== */
(function () {
  "use strict";
  var D = window.CJ_NAMES;
  if (!D) return;

  /* ---------- Helfer ---------- */
  function rnd(n) { return Math.floor(Math.random() * n); }
  function pick(a) { return a[rnd(a.length)]; }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function squeeze(s) { return s.replace(/(.)\1{2,}/g, "$1$1"); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function find(list, id) {
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }
  function ascii(s) {
    return s.replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/Ä/g, "Ae").replace(/Ö/g, "Oe").replace(/Ü/g, "Ue").replace(/ß/g, "ss");
  }
  function lettersOnly(s) { return /^[A-Za-zÀ-ÿ]+$/.test(s); }

  /* ---------- Namen bilden ---------- */
  function isVowel(ch) { return "aeiouy".indexOf(ch) >= 0; }
  /* Silben verbinden, ohne dass zwei Vokale hart aufeinandertreffen (z. B. "ilea" + "elle") */
  function syllableName(parts) {
    var best = "";
    for (var t = 0; t < 14; t++) {
      var s = pick(parts.s), e = pick(parts.e);
      var mid = parts.m.length && Math.random() < 0.22 ? pick(parts.m) : "";
      var clash = (mid ? isVowel(s.charAt(s.length - 1)) && isVowel(mid.charAt(0)) || isVowel(mid.charAt(mid.length - 1)) && isVowel(e.charAt(0))
                       : isVowel(s.charAt(s.length - 1)) && isVowel(e.charAt(0)));
      best = squeeze(cap(s + mid + e));
      if (!clash) return best;
    }
    return best;
  }
  function compose(a, b) {
    var x = pick(a), y = pick(b), t = 0;
    while ((y === x || y.indexOf(x) === 0 || y.charAt(0) === x.charAt(x.length - 1)) && t++ < 12) y = pick(b);
    return squeeze(cap(x) + y);
  }

  function realName(race) { return find(D.races, race); }

  function firstName(race, gender) {
    var c = D.cultures[race.c];
    var g = gender;
    for (var t = 0; t < 40; t++) {
      var n;
      if (Math.random() < 0.3) n = pick(g === "f" ? c.cf : c.cm);
      else n = syllableName(g === "f" ? c.f : c.m);
      if (n.length >= 3 && n.length <= 12) return n;
    }
    return pick(g === "f" ? c.cf : c.cm);
  }

  function lastName(race, cls) {
    var c = D.cultures[race.c];
    var A = c.A.concat(race.xA || []), B = c.B.concat(race.xB || []);
    var r = Math.random();
    if (r < 0.3) return pick(c.cl);
    if (r < 0.65) {
      var mix = Math.random();
      if (mix < 0.4) return compose(cls.A, cls.B);
      if (mix < 0.7) return compose(cls.A, B);
      return compose(A, cls.B);
    }
    return compose(A, B);
  }

  function funnyFirst(race, cls) {
    var f = D.funny, own = f.byClass[cls.id];
    return Math.random() < 0.5 ? pick(own.first) : pick(f.first);
  }
  function funnyLast(race, cls) {
    var f = D.funny, r = Math.random();
    if (r < 0.4) return pick(f.byClass[cls.id].last);
    if (r < 0.7) return pick(f.byCulture[race.c]);
    return pick(f.last);
  }

  /* ---------- Erzeugen ---------- */
  function generate(o) {
    var out = [], seen = {}, tries = 0;
    var count = Math.max(1, Math.min(10, o.count || 5));
    while (out.length < count && tries++ < 600) {
      var race = o.race === "random" ? pick(D.races) : find(D.races, o.race);
      var cls = o.cls === "random" ? pick(D.classes) : find(D.classes, o.cls);
      var g = o.gender === "x" ? (Math.random() < 0.5 ? "m" : "f") : o.gender;
      var first = "", last = "";
      if (o.mode !== "last") first = o.funny ? funnyFirst(race, cls) : firstName(race, g);
      if (o.mode !== "first") last = o.funny ? funnyLast(race, cls) : lastName(race, cls);
      if (o.umlauts) { first = ascii(first); last = ascii(last); }
      var full = (first + " " + last).trim();
      var key = full.toLowerCase();
      if (seen[key]) continue;
      seen[key] = 1;
      out.push({
        first: first, last: last, full: full, gender: g, race: race, cls: cls,
        ingame: first ? (lettersOnly(first) && first.length >= 2 && first.length <= 12) : null
      });
    }
    return out;
  }

  /* ---------- Größe des Namenspools (nur Anzeige) ---------- */
  function poolSize(o) {
    var races = o.race === "random" ? D.races : [find(D.races, o.race)];
    var classes = o.cls === "random" ? D.classes : [find(D.classes, o.cls)];
    var cultures = {}, first = 0, last = 0;
    races.forEach(function (r) {
      var c = D.cultures[r.c];
      if (!o.funny) {
        var g = o.gender === "m" ? ["m"] : o.gender === "f" ? ["f"] : ["m", "f"];
        g.forEach(function (x) {
          var p = c[x];
          first += p.s.length * p.e.length * (1 + p.m.length) + (x === "m" ? c.cm.length : c.cf.length);
        });
        if (o.gender === "x") first = Math.round(first);
        var A = c.A.length + (r.xA || []).length, B = c.B.length + (r.xB || []).length;
        classes.forEach(function (k) {
          last += A * B + k.A.length * k.B.length + k.A.length * B + A * k.B.length + c.cl.length;
        });
      } else {
        classes.forEach(function (k) {
          var own = D.funny.byClass[k.id];
          first += D.funny.first.length + own.first.length;
          last += D.funny.last.length + own.last.length + D.funny.byCulture[r.c].length;
        });
      }
    });
    return { first: first, last: last };
  }
  function fmt(n) { return n.toLocaleString("de-DE"); }

  /* ---------- Oberfläche ---------- */
  var root = document.getElementById("namegen");
  var API = { generate: generate, poolSize: poolSize, data: D };
  window.CJ_NameGen = API;
  if (!root) return;

  var FAV_KEY = "cj_namegen_fav";
  function loadFav() { try { return JSON.parse(localStorage.getItem(FAV_KEY) || "[]") || []; } catch (e) { return []; } }
  function saveFav(list) { try { localStorage.setItem(FAV_KEY, JSON.stringify(list)); } catch (e) {} }

  var state = { cls: "random", race: "random", gender: "x", mode: "both", count: 5, funny: false, umlauts: false, results: [], fav: loadFav() };

  function raceOptions() {
    var groups = [["A", "Allianz"], ["H", "Horde"], ["N", "Neutral"]];
    return '<option value="random">🎲 Zufälliges Volk</option>' + groups.map(function (g) {
      return '<optgroup label="' + g[1] + '">' + D.races.filter(function (r) { return r.f === g[0]; }).map(function (r) {
        return '<option value="' + r.id + '">' + esc(r.de) + "</option>";
      }).join("") + "</optgroup>";
    }).join("");
  }
  function classOptions() {
    return '<option value="random">🎲 Zufällige Klasse</option>' + D.classes.map(function (c) {
      return '<option value="' + c.id + '">' + c.icon + " " + esc(c.de) + "</option>";
    }).join("");
  }
  function seg(name, items, cur) {
    return '<div class="seg" role="radiogroup" data-seg="' + name + '">' + items.map(function (i) {
      return '<button type="button" role="radio" aria-checked="' + (i[0] === cur) + '" class="' + (i[0] === cur ? "on" : "") + '" data-val="' + i[0] + '">' + i[1] + "</button>";
    }).join("") + "</div>";
  }

  root.innerHTML =
    '<section class="panel ng-form" aria-label="Einstellungen">' +
      '<div class="ng-grid">' +
        '<label class="fld"><span>Klasse</span><select id="ng-cls">' + classOptions() + "</select></label>" +
        '<label class="fld"><span>Volk</span><select id="ng-race">' + raceOptions() + "</select></label>" +
        '<div class="fld"><span>Geschlecht</span>' + seg("gender", [["m", "♂ Männlich"], ["f", "♀ Weiblich"], ["x", "Egal"]], state.gender) + "</div>" +
        '<div class="fld"><span>Was soll erzeugt werden?</span>' + seg("mode", [["first", "Vorname"], ["last", "Nachname"], ["both", "Vor- + Nachname"]], state.mode) + "</div>" +
        '<label class="fld"><span>Anzahl: <b id="ng-count-out">5</b></span><input type="range" id="ng-count" min="1" max="10" value="5"></label>' +
        '<div class="fld"><span>Stimmung</span>' +
          '<label class="switch"><input type="checkbox" id="ng-funny"><span class="track" aria-hidden="true"></span><span class="lbl">🤪 Lustige Namen</span></label>' +
          '<label class="chk small"><input type="checkbox" id="ng-uml"><span>Umlaute ersetzen (ä → ae)</span></label>' +
        "</div>" +
      "</div>" +
      '<div class="ng-actions"><button type="button" class="btn" id="ng-go">🎲 Namen erzeugen</button>' +
      '<button type="button" class="btn ghost" id="ng-copyall">Alle kopieren</button></div>' +
      '<p class="muted ng-pool" id="ng-pool"></p>' +
    "</section>" +
    '<section aria-live="polite"><div id="ng-results" class="ng-results"></div></section>' +
    '<section class="panel ng-favs" id="ng-favs-wrap"><div class="ng-favs-head"><h2>⭐ Gemerkte Namen</h2><button type="button" class="lnk" id="ng-fav-clear">Alle entfernen</button></div>' +
      '<div id="ng-favs"></div><p class="muted" style="margin:.6rem 0 0;font-size:.9rem">Wird nur in deinem Browser gespeichert.</p></section>' +
    '<div class="notice"><strong>Gut zu wissen:</strong> Im Spiel besteht ein Charaktername aus <strong>einem Wort mit 2–12 Buchstaben</strong> (ohne Zahlen und Leerzeichen). Der Vorname trägt dann ein ✔-Zeichen, wenn er das erfüllt. Der Nachname ist für deine Geschichte, deine Gilde oder dein Rollenspiel gedacht. Ob eine Klasse-Volk-Kombination im Spiel möglich ist, hängt von der WoW-Version ab. Der Generator lässt bewusst alle Kombinationen zu. Ob ein Name noch frei ist, erfährst du erst beim Erstellen im Spiel.</div>';

  var $ = function (s) { return root.querySelector(s); };

  function copy(text, btn) {
    function done() {
      if (!btn) return;
      var old = btn.textContent; btn.textContent = "✔";
      setTimeout(function () { btn.textContent = old; }, 1200);
    }
    function fallback() {
      var ta = document.createElement("textarea");
      ta.value = text; ta.style.cssText = "position:fixed;opacity:0";
      document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); done(); } catch (e) {}
      document.body.removeChild(ta);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, fallback);
    else fallback();
  }

  function isFav(full) { return state.fav.some(function (f) { return f.full === full; }); }

  function renderResults() {
    var box = $("#ng-results");
    box.innerHTML = state.results.map(function (r, i) {
      var meta = [r.race.de, r.cls.de, r.gender === "f" ? "♀" : "♂"].join(" · ");
      var badge = r.ingame === null ? "" : (r.ingame
        ? '<span class="ok" title="Als Charaktername im Spiel geeignet (2–12 Buchstaben)">✔ spieltauglich</span>'
        : '<span class="warn" title="Im Spiel nur 2–12 Buchstaben, keine Sonderzeichen">⚠ nicht spieltauglich</span>');
      var name = r.first && r.last ? esc(r.first) + ' <span class="ln">' + esc(r.last) + "</span>" : esc(r.full);
      return '<article class="ng-card" style="--cc:' + r.cls.color + '"><div class="ng-name">' + name + "</div>" +
        '<div class="ng-meta">' + esc(meta) + " " + badge + "</div>" +
        '<div class="ng-btns"><button type="button" class="icon-btn" data-copy="' + i + '" title="Kopieren" aria-label="Kopieren">📋</button>' +
        '<button type="button" class="icon-btn' + (isFav(r.full) ? " on" : "") + '" data-fav="' + i + '" title="Merken" aria-label="Merken">' + (isFav(r.full) ? "★" : "☆") + "</button></div></article>";
    }).join("");
  }
  function renderFavs() {
    var wrap = $("#ng-favs-wrap");
    wrap.hidden = !state.fav.length;
    $("#ng-favs").innerHTML = state.fav.map(function (f, i) {
      return '<div class="ng-fav"><span><strong>' + esc(f.full) + '</strong> <span class="muted">' + esc(f.meta) + '</span></span>' +
        '<span class="ng-btns"><button type="button" class="icon-btn" data-fcopy="' + i + '" aria-label="Kopieren">📋</button>' +
        '<button type="button" class="icon-btn" data-fdel="' + i + '" aria-label="Entfernen">✕</button></span></div>';
    }).join("");
  }
  function renderPool() {
    var p = poolSize(state);
    var txt = state.mode === "first" ? fmt(p.first) + " mögliche Vornamen"
      : state.mode === "last" ? fmt(p.last) + " mögliche Nachnamen"
      : fmt(p.first) + " Vornamen · " + fmt(p.last) + " Nachnamen";
    $("#ng-pool").textContent = "Namenspool für diese Auswahl: " + txt + (state.mode === "both" ? " (" + fmt(p.first * p.last) + " Kombinationen)" : "") + ".";
  }
  function run() {
    state.results = generate(state);
    renderResults(); renderPool();
  }

  /* ---------- Ereignisse ---------- */
  $("#ng-cls").addEventListener("change", function (e) { state.cls = e.target.value; run(); });
  $("#ng-race").addEventListener("change", function (e) { state.race = e.target.value; run(); });
  $("#ng-count").addEventListener("input", function (e) { state.count = parseInt(e.target.value, 10); $("#ng-count-out").textContent = state.count; run(); });
  $("#ng-funny").addEventListener("change", function (e) { state.funny = e.target.checked; run(); });
  $("#ng-uml").addEventListener("change", function (e) { state.umlauts = e.target.checked; run(); });
  $("#ng-go").addEventListener("click", run);
  $("#ng-copyall").addEventListener("click", function (e) {
    copy(state.results.map(function (r) { return r.full; }).join("\n"), e.currentTarget);
  });
  root.addEventListener("click", function (e) {
    var t = e.target.closest("button");
    if (!t) return;
    var seg = t.parentNode.getAttribute && t.parentNode.getAttribute("data-seg");
    if (seg) {
      state[seg] = t.getAttribute("data-val");
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
    if (t.id === "ng-fav-clear") { state.fav = []; saveFav(state.fav); renderResults(); renderFavs(); }
  });

  run(); renderFavs();
})();
