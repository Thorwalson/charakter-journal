/* ==========================================================
   Charakter Journal – Namen-Generator (Engine + Oberfläche)
   Benötigt: js/namegen-data.js (window.CJ_NAMES)
   Baut seine Oberfläche in das Element #namegen.
   ========================================================== */
(function () {
  "use strict";
  var D = window.CJ_NAMES;
  if (!D) return;
  var D_EN = window.CJ_NAMES_EN || null; // Englische Namensbank (optional, für die Sprachumschaltung)
  var ICONS = window.CJ_CLASS_ICONS || {}; // Bild-Icons fuer 9 von 13 Klassen, Rest faellt auf Emoji zurueck
  var FICONS = window.CJ_FACTION_ICONS || {}; // Fraktions-Wappen (Allianz/Horde), Neutral bewusst ohne
  var GICONS = window.CJ_GENDER_ICONS || {}; // ♀/♂-Bildchen statt Text-Symbole

  /* ---------- Sprache (Deutsch/Englisch) ----------
     Jede erzeugte Karte "merkt" sich ihre eigene Sprache (r.lang), damit ein
     späteres Umschalten der Oberfläche bestehende Ergebnisse nicht plötzlich
     verfälscht – nur neu erzeugte Namen nutzen die neue Sprache. */
  function dataFor(lang) { return (lang === "en" && D_EN) ? D_EN : D; }
  function raceLabel(r) { return (r && (r.de || r.en)) || ""; }
  function clsLabel(c) { return (c && (c.de || c.en)) || ""; }
  function cardLang(r) { return (r && r.race && r.race.en && !r.race.de) ? "en" : "de"; }

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

  /* ---------- Klassen-Icon (echtes Bild, falls vorhanden, sonst Emoji) ---------- */
  function classIcon(cls, mod) {
    var extra = mod ? " " + mod : "";
    var src = ICONS[cls.id];
    if (src) return '<span class="ng-cicon' + extra + '"><img src="' + src + '" alt="" loading="lazy"></span>';
    return '<span class="ng-cicon ng-cicon-emoji' + extra + '">' + cls.icon + "</span>";
  }

  /* ---------- Fraktions-Wappen (Allianz/Horde) und Geschlecht-Icons ---------- */
  // f: "A" (Allianz) | "H" (Horde) | "N" (Neutral, bewusst ohne Wappen)
  function factionIcon(f, mod) {
    var src = FICONS[f];
    if (!src) return "";
    return '<img class="ng-ficon' + (mod ? " " + mod : "") + '" src="' + src + '" alt="">';
  }
  // g: "m" | "f" (bei "x"/Egal wird kein Icon gebraucht)
  function genderIcon(g, mod) {
    var src = GICONS[g];
    if (!src) return "";
    return '<img class="ng-gicon' + (mod ? " " + mod : "") + '" src="' + src + '" alt="">';
  }
  function factionIconSrc(f) { return FICONS[f] || ""; }

  /* ---------- Kartendesign (Standard/Fraktion) ----------
     "Fraktion": Hintergrund dezent in der Fraktionsfarbe eingefärbt
     (Verlauf von rechts nach links), mit dem Fraktions-Wappen groß am
     rechten Rand; bei neutralen Völkern (kein Wappen vorhanden) nur ein
     warmer, neutraler Farbton ohne Logo. Gilt für Anzeige UND Download,
     weil beide dieselben Felder (r.cardStyle, r.race.f) auslesen. */
  function factionClassFor(f) { return "ng-fac-" + (f === "A" ? "a" : f === "H" ? "h" : "n"); }
  function refreshCardStyleVisual(card, r) {
    card.classList.remove("ng-fac-a", "ng-fac-h", "ng-fac-n");
    card.classList.add(factionClassFor(r.race.f));
    card.classList.toggle("ng-style-faction", r.cardStyle === "faction");
    var logo = card.querySelector(".ng-card-fac-logo");
    var src = factionIconSrc(r.race.f);
    if (src) {
      if (!logo) { logo = document.createElement("img"); logo.className = "ng-card-fac-logo"; logo.alt = ""; card.appendChild(logo); }
      if (logo.getAttribute("src") !== src) logo.setAttribute("src", src);
    } else if (logo) { logo.remove(); }
  }

  /* ---------- Namenskarten bearbeiten (gemeinsam für Retail & Forever) ----------
     Erkennt automatisch, ob eine Karte Vor-/Nachname getrennt anzeigt (zwei
     Felder ".ng-fn"/".ng-ln", Retail) oder als einen Textblock (".ng-name"
     selbst, WoW Forever – wegen des angehängten Beinamens). */
  function toggleCardEditing(card, editBtn) {
    var editing = card.classList.toggle("editing");
    var fn = card.querySelector(".ng-fn"), ln = card.querySelector(".ng-ln");
    var targets = fn ? [fn, ln] : [card.querySelector(".ng-name")];
    targets.forEach(function (el) { if (el) el.contentEditable = editing ? "true" : "false"; });
    if (editBtn) {
      var label = editing ? "Fertig" : "Namen bearbeiten";
      editBtn.textContent = editing ? "✓" : "✏️";
      editBtn.title = label;
      editBtn.setAttribute("aria-label", label);
    }
    if (editing) {
      var last = targets[targets.length - 1];
      if (last) {
        last.focus();
        try {
          var range = document.createRange(); range.selectNodeContents(last); range.collapse(false);
          var sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(range);
        } catch (e) { /* ignorieren, z. B. in sehr alten Browsern */ }
      }
    }
    return editing;
  }
  function readCardEditedName(card) {
    var fn = card.querySelector(".ng-fn"), ln = card.querySelector(".ng-ln");
    if (fn) {
      var first = (fn.textContent || "").trim(), last = (ln.textContent || "").trim();
      return { first: first, last: last, full: (first + " " + last).trim() };
    }
    var nameEl = card.querySelector(".ng-name");
    return { full: (nameEl.textContent || "").trim() };
  }

  /* ---------- Namenskarte als PNG speichern (ganz ohne externe Bibliothek,
     per <canvas> gezeichnet – funktioniert dadurch auch offline) ---------- */
  function roundRectPath(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
  function loadImgAsync(src) {
    return new Promise(function (resolve) {
      if (!src) { resolve(null); return; }
      var img = new Image();
      img.onload = function () { resolve(img); };
      img.onerror = function () { resolve(null); };
      img.src = src;
    });
  }
  function fitFontSize(ctx, text, maxWidth, size, minSize, fontSpec) {
    ctx.font = size + "px " + fontSpec;
    while (size > minSize && ctx.measureText(text).width > maxWidth) {
      size -= 2;
      ctx.font = size + "px " + fontSpec;
    }
    return size;
  }
  function drawMetaPart(ctx, t, x, y) { ctx.fillStyle = "#a9a38f"; ctx.fillText(t, x, y); return x + ctx.measureText(t).width + 14; }
  function drawDot(ctx, x, y) { ctx.fillStyle = "#a9a38f"; ctx.fillText("·", x, y); return x + ctx.measureText("·").width + 14; }

  function buildCardPNG(r) {
    var W = 1000, H = 360, pad = 40;
    return Promise.all([
      loadImgAsync(ICONS[r.cls.id]),
      loadImgAsync(FICONS[r.race.f]),
      loadImgAsync(GICONS[r.gender])
    ]).then(function (imgs) {
      var clsImg = imgs[0], facImg = imgs[1], genImg = imgs[2];
      var canvas = document.createElement("canvas");
      canvas.width = W; canvas.height = H;
      var ctx = canvas.getContext("2d");
      var serif = "'Trajan Pro','Palatino Linotype','Book Antiqua',Georgia,serif";
      var body = "Georgia,'Palatino Linotype','Book Antiqua',serif";
      var accent = r.cls.color || "#f3d27a";

      roundRectPath(ctx, 0, 0, W, H, 24);
      var grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, "#1d2130"); grad.addColorStop(1, "#11131c");
      ctx.fillStyle = grad; ctx.fill();

      // Fraktions-Design: Farbverlauf von rechts (Fraktionsfarbe) nach links
      // (normale Kartenfarbe), plus großes Wappen rechts, halbtransparent.
      // Neutrale Völker (kein Wappen) bekommen nur den warmen Gold-Ton.
      if (r.cardStyle === "faction") {
        var facColor = r.race.f === "H" ? "196,30,58" : r.race.f === "A" ? "29,99,181" : "184,140,46";
        ctx.save();
        roundRectPath(ctx, 0, 0, W, H, 24); ctx.clip();
        var fgrad = ctx.createLinearGradient(W, 0, W * 0.35, 0);
        fgrad.addColorStop(0, "rgba(" + facColor + ",.6)");
        fgrad.addColorStop(1, "rgba(" + facColor + ",0)");
        ctx.fillStyle = fgrad; ctx.fillRect(0, 0, W, H);
        if (facImg) {
          ctx.globalAlpha = 0.55;
          var logoH = H * 0.92, logoW = logoH * (facImg.width / facImg.height);
          ctx.drawImage(facImg, W - logoW + 24, (H - logoH) / 2, logoW, logoH);
          ctx.globalAlpha = 1;
        }
        ctx.restore();
      }

      ctx.save();
      roundRectPath(ctx, 0, 0, W, H, 24); ctx.clip();
      ctx.fillStyle = accent; ctx.fillRect(0, 0, 12, H);
      ctx.restore();

      roundRectPath(ctx, 2, 2, W - 4, H - 4, 22);
      ctx.lineWidth = 3; ctx.strokeStyle = "#8a6a22"; ctx.stroke();

      // Vorname in Klassenfarbe, der Rest (Nachname, bei Forever ggf. mit
      // Beiname) in Weiß – wie auf der Karte selbst. "full" beginnt (siehe
      // cardNameHtml in namegen.js/namegen-forever.js) bei vorhandenem
      // Vornamen immer exakt mit diesem, Titel- wie Spitzname-Stil inklusive.
      var nameMaxW = W - pad * 2 - 20, nameY = 158;
      var firstPart = r.first || "";
      var hasSplit = !!firstPart && r.full.indexOf(firstPart) === 0 && r.full.length > firstPart.length;
      if (hasSplit) {
        var restPart = r.full.slice(firstPart.length);
        var sizeFn = fitFontSize(ctx, r.full, nameMaxW, 66, 28, "700 1em " + serif);
        ctx.font = "700 " + sizeFn + "px " + serif;
        ctx.fillStyle = accent;
        ctx.fillText(firstPart, pad + 28, nameY);
        var fw = ctx.measureText(firstPart).width;
        ctx.fillStyle = "#ffffff";
        ctx.fillText(restPart, pad + 28 + fw, nameY);
      } else {
        var text = r.full;
        var size = fitFontSize(ctx, text, nameMaxW, 62, 26, "700 1em " + serif);
        ctx.font = "700 " + size + "px " + serif;
        ctx.fillStyle = accent;
        ctx.fillText(text, pad + 28, nameY);
      }

      var metaY = 232, x = pad + 28;
      ctx.font = "400 29px " + body;
      if (facImg) { ctx.drawImage(facImg, x, metaY - 27, 20, 27); x += 30; }
      x = drawMetaPart(ctx, raceLabel(r.race), x, metaY);
      x = drawDot(ctx, x, metaY);
      ctx.font = "400 29px " + body;
      if (clsImg) { ctx.drawImage(clsImg, x, metaY - 26, 26, 26); x += 34; } else { ctx.fillStyle = "#a9a38f"; ctx.fillText(r.cls.icon, x, metaY); x += 36; }
      x = drawMetaPart(ctx, clsLabel(r.cls), x, metaY);
      x = drawDot(ctx, x, metaY);
      if (genImg) ctx.drawImage(genImg, x, metaY - 25, 18, 25);

      if (r.ingame !== null) {
        var TlPng = T_ALL[r.lang] || T_ALL.de;
        ctx.font = "700 24px " + body;
        ctx.fillStyle = r.ingame ? "#8fd49b" : "#f0c27a";
        ctx.fillText(r.ingame ? TlPng.playable.replace(/<[^>]+>/g, "") : TlPng.notPlayable.replace(/<[^>]+>/g, ""), pad + 28, metaY + 44);
      }

      ctx.font = "600 19px " + body; ctx.fillStyle = "#8a6a22"; ctx.textAlign = "right";
      ctx.fillText("Charakter Journal · 8bithorizon.de", W - pad, H - 24);
      ctx.textAlign = "left";

      return canvas.toDataURL("image/png");
    });
  }
  function downloadCardPNG(r) {
    return buildCardPNG(r).then(function (dataUrl) {
      var safe = (r.full || r.first || r.last || "Charakter").replace(/[^\p{L}\p{N}]+/gu, "_").replace(/^_+|_+$/g, "") || "Charakter";
      var a = document.createElement("a");
      a.href = dataUrl;
      a.download = "CharakterJournal-" + safe + ".png";
      document.body.appendChild(a);
      a.click();
      a.remove();
    });
  }

  /* ---------- Eigenes, gestyltes Dropdown (statt <select>) ----------
     items: Array aus entweder { group: "Label" } (Gruppen-Überschrift,
     nicht auswählbar) oder { value, label, iconHtml } (Option).
     Wird auch vom WoW-Forever-Skript über window.CJ_NameGen.dd* genutzt,
     damit beide Generatoren exakt dieselbe Optik/Logik teilen. */
  function ddHTML(opts) {
    var items = opts.items, cur = null, i;
    for (i = 0; i < items.length; i++) { if (!items[i].group && items[i].value === opts.value) { cur = items[i]; break; } }
    if (!cur) { for (i = 0; i < items.length; i++) { if (!items[i].group) { cur = items[i]; break; } } }
    var curHtml = cur ? ((cur.iconHtml || "") + "<span>" + esc(cur.label) + "</span>") : "";
    var listHtml = items.map(function (it) {
      if (it.group) return '<li class="ng-dd-group" role="presentation">' + (it.groupIconHtml || "") + esc(it.group) + "</li>";
      var sel = !!(cur && it.value === cur.value);
      return '<li class="ng-dd-opt' + (sel ? " on" : "") + '" role="option" aria-selected="' + sel + '" data-val="' + esc(it.value) + '" tabindex="-1">' +
        (it.iconHtml || "") + "<span>" + esc(it.label) + "</span></li>";
    }).join("");
    return '<div class="ng-dd" data-dd="' + esc(opts.id) + '" data-value="' + esc(cur ? cur.value : "") + '">' +
      '<button type="button" class="ng-dd-btn" aria-haspopup="listbox" aria-expanded="false">' +
        '<span class="ng-dd-cur">' + curHtml + '</span><span class="ng-dd-caret" aria-hidden="true">▾</span>' +
      "</button>" +
      '<ul class="ng-dd-list" role="listbox" tabindex="-1" hidden>' + listHtml + "</ul>" +
    "</div>";
  }
  // Verdrahtet Klick/Tastatur für ALLE .ng-dd innerhalb von rootEl.
  // onChange(ddId, value) wird bei jeder Auswahl aufgerufen.
  function ddBind(rootEl, onChange) {
    // Manche Browser feuern nach dem Auswählen einer Option (sobald die Liste
    // synchron per "hidden" verschwindet) noch einen zweiten, echten Klick auf
    // genau diesen Button (der jetzt an derselben Bildschirmstelle liegt) –
    // dieser würde das Dropdown sofort wieder öffnen. Kurze, auf das
    // betroffene Dropdown begrenzte Sperrfrist direkt nach einer Auswahl
    // verhindert das, ohne andere Dropdowns zu blockieren.
    var suppressDd = null, suppressBtnUntil = 0;
    function allLists() { return rootEl.querySelectorAll(".ng-dd-list"); }
    function closeAll() {
      var all = allLists();
      for (var i = 0; i < all.length; i++) {
        all[i].hidden = true;
        var dd = all[i].closest(".ng-dd");
        var btn = dd && dd.querySelector(".ng-dd-btn");
        if (btn) btn.setAttribute("aria-expanded", "false");
      }
    }
    function openList(list, btn) {
      closeAll();
      list.hidden = false;
      list.classList.remove("flip-up");
      btn.setAttribute("aria-expanded", "true");
      // Reicht der Platz nach unten nicht (Karte weiter unten auf der Seite,
      // besonders am Handy), klappt die Liste stattdessen nach oben auf,
      // statt am unteren Rand abgeschnitten zu werden. Passt sie so immer
      // noch nicht komplett in den sichtbaren Bereich, zusätzlich dorthin
      // scrollen – und NACH Abschluss dieses Scrollens die Ausrichtung
      // sicherheitshalber erneut prüfen (z. B. falls kurz zuvor schon das
      // Fokussieren des Namensfelds selbst einen Scroll ausgelöst hatte und
      // sich die Lage dadurch nochmal verschoben hat).
      function position() {
        if (list.hidden) return;
        list.classList.remove("flip-up");
        var rect = list.getBoundingClientRect();
        var vh = window.innerHeight || document.documentElement.clientHeight;
        if (rect.bottom > vh) {
          var btnRect = btn.getBoundingClientRect();
          if (btnRect.top > vh - btnRect.bottom) list.classList.add("flip-up");
        }
        return list.getBoundingClientRect();
      }
      requestAnimationFrame(function () {
        var rect = position();
        var vh = window.innerHeight || document.documentElement.clientHeight;
        if (rect.top < 0 || rect.bottom > vh) {
          btn.scrollIntoView({ block: "center", behavior: "smooth" });
          setTimeout(position, 400);
        }
      });
    }
    function selectOption(dd, li) {
      var val = li.getAttribute("data-val");
      dd.setAttribute("data-value", val);
      dd.querySelector(".ng-dd-cur").innerHTML = li.innerHTML;
      var opts = dd.querySelectorAll(".ng-dd-opt");
      for (var i = 0; i < opts.length; i++) {
        var on = opts[i] === li;
        opts[i].classList.toggle("on", on);
        opts[i].setAttribute("aria-selected", on);
      }
      onChange(dd.getAttribute("data-dd"), val);
    }
    rootEl.addEventListener("click", function (e) {
      var btn = e.target.closest(".ng-dd-btn");
      if (btn) {
        var dd = btn.closest(".ng-dd");
        if (dd === suppressDd && Date.now() < suppressBtnUntil) return; // siehe Kommentar oben bei suppressDd
        var list = dd.querySelector(".ng-dd-list");
        if (list.hidden) openList(list, btn); else { list.hidden = true; btn.setAttribute("aria-expanded", "false"); }
        return;
      }
      var li = e.target.closest(".ng-dd-opt");
      if (li) {
        var dd2 = li.closest(".ng-dd"), list2 = dd2.querySelector(".ng-dd-list");
        selectOption(dd2, li);
        list2.hidden = true;
        dd2.querySelector(".ng-dd-btn").setAttribute("aria-expanded", "false");
        suppressDd = dd2; suppressBtnUntil = Date.now() + 350;
      }
    });
    rootEl.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { closeAll(); return; }
      var btn = e.target.closest(".ng-dd-btn");
      if (btn && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
        e.preventDefault();
        var dd = btn.closest(".ng-dd"), list = dd.querySelector(".ng-dd-list");
        openList(list, btn);
        var first = list.querySelector(".ng-dd-opt");
        if (first) first.focus();
        return;
      }
      var li = e.target.closest(".ng-dd-opt");
      if (!li) return;
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        var opts = Array.prototype.slice.call(li.closest(".ng-dd-list").querySelectorAll(".ng-dd-opt"));
        var idx = opts.indexOf(li);
        var next = e.key === "ArrowDown" ? opts[idx + 1] || opts[0] : opts[idx - 1] || opts[opts.length - 1];
        if (next) next.focus();
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        var dd2 = li.closest(".ng-dd");
        selectOption(dd2, li);
        li.closest(".ng-dd-list").hidden = true;
        suppressDd = dd2; suppressBtnUntil = Date.now() + 350;
        dd2.querySelector(".ng-dd-btn").focus();
      }
    });
    document.addEventListener("click", function (e) { if (!rootEl.contains(e.target)) closeAll(); });
  }

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

  function firstName(DD, race, gender) {
    var c = DD.cultures[race.c];
    var g = gender;
    for (var t = 0; t < 40; t++) {
      var n;
      if (Math.random() < 0.3) n = pick(g === "f" ? c.cf : c.cm);
      else n = syllableName(g === "f" ? c.f : c.m);
      if (n.length >= 3 && n.length <= 12) return n;
    }
    return pick(g === "f" ? c.cf : c.cm);
  }

  function lastName(DD, race, cls) {
    var c = DD.cultures[race.c];
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
    var DD = dataFor(o.lang); // "funny" (Spaßnamen) bleibt bewusst Deutsch (D), s.u.
    var lang = (DD === D_EN) ? "en" : "de";
    var out = [], seen = {}, tries = 0;
    var count = Math.max(1, Math.min(10, o.count || 5));
    while (out.length < count && tries++ < 600) {
      var race = o.race === "random" ? pick(DD.races) : find(DD.races, o.race);
      var cls = o.cls === "random" ? pick(DD.classes) : find(DD.classes, o.cls);
      var g = o.gender === "x" ? (Math.random() < 0.5 ? "m" : "f") : o.gender;
      var first = "", last = "";
      if (o.mode !== "last") first = o.funny ? funnyFirst(race, cls) : firstName(DD, race, g);
      if (o.mode !== "first") last = o.funny ? funnyLast(race, cls) : lastName(DD, race, cls);
      if (o.umlauts) { first = ascii(first); last = ascii(last); }
      var full = (first + " " + last).trim();
      var key = full.toLowerCase();
      if (seen[key]) continue;
      seen[key] = 1;
      out.push({
        first: first, last: last, full: full, gender: g, race: race, cls: cls, lang: lang,
        ingame: first ? (lettersOnly(first) && first.length >= 2 && first.length <= 12) : null,
        cardStyle: "standard" // "standard" | "faction" – Kartendesign, pro Karte umschaltbar
      });
    }
    return out;
  }

  /* ---------- Größe des Namenspools (nur Anzeige) ---------- */
  function poolSize(o) {
    var DD = dataFor(o.lang);
    var races = o.race === "random" ? DD.races : [find(DD.races, o.race)];
    var classes = o.cls === "random" ? DD.classes : [find(DD.classes, o.cls)];
    var cultures = {}, first = 0, last = 0;
    races.forEach(function (r) {
      var c = DD.cultures[r.c];
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

  /* ---------- Oberflächen-Texte (Deutsch/Englisch) ---------- */
  var T_ALL = {
    de: {
      settings: "Einstellungen", cls: "Klasse", race: "Volk", gender: "Geschlecht",
      male: "Männlich", female: "Weiblich", any: "Egal",
      whatToGen: "Was soll erzeugt werden?", first: "Vorname", last: "Nachname", both: "Vor- + Nachname",
      count: "Anzahl:", mood: "Stimmung", funny: "🤪 Lustige Namen", umlauts: "Umlaute ersetzen (ä → ae)",
      go: "🎲 Namen erzeugen", copyAll: "Alle kopieren",
      randomRace: "Zufälliges Volk", randomCls: "Zufällige Klasse",
      alliance: "Allianz", horde: "Horde", neutral: "Neutral",
      favs: "⭐ Gemerkte Namen", favClear: "Alle entfernen", favHint: "Wird nur in deinem Browser gespeichert.",
      noticeTitle: "Gut zu wissen:",
      noticeText: "Im Spiel besteht ein Charaktername aus einem Wort mit 2–12 Buchstaben (ohne Zahlen und Leerzeichen). Der Vorname trägt dann ein ✔-Zeichen, wenn er das erfüllt. Der Nachname ist für deine Geschichte, deine Gilde oder dein Rollenspiel gedacht. Ob eine Klasse-Volk-Kombination im Spiel möglich ist, hängt von der WoW-Version ab. Der Generator lässt bewusst alle Kombinationen zu. Ob ein Name noch frei ist, erfährst du erst beim Erstellen im Spiel.",
      possibleFirst: "mögliche Vornamen", possibleLast: "mögliche Nachnamen",
      firstNames: "Vornamen", lastNames: "Nachnamen", poolPrefix: "Namenspool für diese Auswahl: ", combos: "Kombinationen",
      playable: "✔ spieltauglich", notPlayable: "⚠ nicht spieltauglich",
      playableTip: "Als Charaktername im Spiel geeignet (2–12 Buchstaben)", notPlayableTip: "Im Spiel nur 2–12 Buchstaben, keine Sonderzeichen",
      editName: "Namen bearbeiten", saveImg: "Als Bild speichern", copy: "Kopieren", save: "Merken", remove: "Entfernen",
      styleStandard: "🎴 Standard", styleFaction: "Fraktion",
      styleStandardTip: "Standard-Design (ohne Fraktionsfarbe)", styleFactionTip: "Fraktions-Design (mit Wappen)",
      firstPh: "Vorname", lastPh: "Nachname", namePh: "Name eingeben…", language: "Sprache"
    },
    en: {
      settings: "Settings", cls: "Class", race: "Race", gender: "Gender",
      male: "Male", female: "Female", any: "Any",
      whatToGen: "What should be generated?", first: "First name", last: "Last name", both: "First + last name",
      count: "Count:", mood: "Mood", funny: "🤪 Funny names", umlauts: "Replace umlauts (ä → ae)",
      go: "🎲 Generate names", copyAll: "Copy all",
      randomRace: "Random race", randomCls: "Random class",
      alliance: "Alliance", horde: "Horde", neutral: "Neutral",
      favs: "⭐ Saved names", favClear: "Remove all", favHint: "Only saved in your browser.",
      noticeTitle: "Good to know:",
      noticeText: "In-game, a character name is a single word of 2–12 letters (no numbers or spaces). The first name gets a ✔ mark when it meets that rule. The last name is meant for your story, your guild or your roleplay. Whether a class-race combination is actually possible depends on the WoW version – the generator deliberately allows every combination. Whether a name is still free, you'll only find out when you create it in the game.",
      possibleFirst: "possible first names", possibleLast: "possible last names",
      firstNames: "first names", lastNames: "last names", poolPrefix: "Name pool for this selection: ", combos: "combinations",
      playable: "✔ playable", notPlayable: "⚠ not playable",
      playableTip: "Suitable as an in-game character name (2–12 letters)", notPlayableTip: "In-game only 2–12 letters, no special characters",
      editName: "Edit name", saveImg: "Save as image", copy: "Copy", save: "Save", remove: "Remove",
      styleStandard: "🎴 Standard", styleFaction: "Faction",
      styleStandardTip: "Standard design (no faction color)", styleFactionTip: "Faction design (with crest)",
      firstPh: "First name", lastPh: "Last name", namePh: "Enter name…", language: "Language"
    }
  };

  /* ---------- Oberfläche ---------- */
  var root = document.getElementById("namegen");
  var API = {
    generate: generate, poolSize: poolSize, data: D, dataEN: D_EN, dataFor: dataFor, ddHTML: ddHTML, ddBind: ddBind, classIcon: classIcon, icons: ICONS,
    factionIcon: factionIcon, genderIcon: genderIcon, factionIconSrc: factionIconSrc,
    factionClassFor: factionClassFor, refreshCardStyleVisual: refreshCardStyleVisual,
    raceLabel: raceLabel, clsLabel: clsLabel, cardLang: cardLang, uiStrings: function (lang) { return T_ALL[lang] || T_ALL.de; },
    toggleCardEditing: toggleCardEditing, readCardEditedName: readCardEditedName,
    buildCardPNG: buildCardPNG, downloadCardPNG: downloadCardPNG
  };
  window.CJ_NameGen = API;
  if (!root) return;

  var FAV_KEY = "cj_namegen_fav";
  function loadFav() { try { return JSON.parse(localStorage.getItem(FAV_KEY) || "[]") || []; } catch (e) { return []; } }
  function saveFav(list) { try { localStorage.setItem(FAV_KEY, JSON.stringify(list)); } catch (e) {} }

  var LANG_KEY = "cj_namegen_lang";
  function loadLang() { try { return localStorage.getItem(LANG_KEY) === "en" ? "en" : "de"; } catch (e) { return "de"; } }
  function saveLang(l) { try { localStorage.setItem(LANG_KEY, l); } catch (e) {} }

  var state = { cls: "random", race: "random", gender: "x", mode: "both", count: 5, funny: false, umlauts: false, lang: (D_EN ? loadLang() : "de"), results: [], fav: loadFav() };
  function T(key) { return (T_ALL[state.lang] || T_ALL.de)[key] || key; }

  function raceItems() {
    var DD = dataFor(state.lang);
    var groups = [["A", T("alliance")], ["H", T("horde")], ["N", T("neutral")]];
    var items = [{ value: "random", label: T("randomRace"), iconHtml: '<span class="ng-cicon ng-cicon-emoji">🎲</span>' }];
    groups.forEach(function (g) {
      var list = DD.races.filter(function (r) { return r.f === g[0]; });
      if (!list.length) return;
      items.push({ group: g[1], groupIconHtml: factionIcon(g[0], "ng-ficon-dd") });
      list.forEach(function (r) { items.push({ value: r.id, label: raceLabel(r) }); });
    });
    return items;
  }
  function classItems() {
    var DD = dataFor(state.lang);
    var items = [{ value: "random", label: T("randomCls"), iconHtml: '<span class="ng-cicon ng-cicon-emoji">🎲</span>' }];
    DD.classes.forEach(function (c) { items.push({ value: c.id, label: clsLabel(c), iconHtml: classIcon(c, "ng-cicon-dd") }); });
    return items;
  }
  function seg(name, items, cur) {
    return '<div class="seg" role="radiogroup" data-seg="' + name + '">' + items.map(function (i) {
      return '<button type="button" role="radio" aria-checked="' + (i[0] === cur) + '" class="' + (i[0] === cur ? "on" : "") + '" data-val="' + i[0] + '">' + i[1] + "</button>";
    }).join("") + "</div>";
  }

  var $ = function (s) { return root.querySelector(s); };

  // Baut die komplette statische Oberfläche neu auf – nötig, weil beim
  // Sprachwechsel nicht nur Ergebnisse, sondern auch Dropdown-Inhalte,
  // Beschriftungen und (DE-only) Stimmung-Optionen sich ändern.
  function renderShell() {
    root.setAttribute("data-lang", state.lang);
    var langToggleHtml = D_EN
      ? '<div class="fld"><span>' + T("language") + '</span>' + seg("lang", [["de", "Deutsch"], ["en", "English"]], state.lang) + "</div>"
      : "";
    var moodHtml = state.lang === "de"
      ? '<div class="fld"><span>' + T("mood") + '</span>' +
          '<label class="switch"><input type="checkbox" id="ng-funny"' + (state.funny ? " checked" : "") + '><span class="track" aria-hidden="true"></span><span class="lbl">' + T("funny") + '</span></label>' +
          '<label class="chk small"><input type="checkbox" id="ng-uml"' + (state.umlauts ? " checked" : "") + '><span>' + T("umlauts") + "</span></label>" +
        "</div>"
      : "";
    root.innerHTML =
      '<section class="panel ng-form" aria-label="' + T("settings") + '">' +
        '<div class="ng-grid">' +
          '<label class="fld"><span>' + T("cls") + "</span>" + ddHTML({ id: "ng-cls", value: state.cls, items: classItems() }) + "</label>" +
          '<label class="fld"><span>' + T("race") + "</span>" + ddHTML({ id: "ng-race", value: state.race, items: raceItems() }) + "</label>" +
          '<div class="fld"><span>' + T("gender") + "</span>" + seg("gender", [["m", genderIcon("m", "ng-gicon-seg") + " " + T("male")], ["f", genderIcon("f", "ng-gicon-seg") + " " + T("female")], ["x", T("any")]], state.gender) + "</div>" +
          '<div class="fld"><span>' + T("whatToGen") + "</span>" + seg("mode", [["first", T("first")], ["last", T("last")], ["both", T("both")]], state.mode) + "</div>" +
          '<label class="fld"><span>' + T("count") + ' <b id="ng-count-out">' + state.count + '</b></span><input type="range" id="ng-count" min="1" max="10" value="' + state.count + '"></label>' +
          moodHtml + langToggleHtml +
        "</div>" +
        '<div class="ng-actions"><button type="button" class="btn" id="ng-go">' + T("go") + "</button>" +
        '<button type="button" class="btn ghost" id="ng-copyall">' + T("copyAll") + "</button></div>" +
        '<p class="muted ng-pool" id="ng-pool"></p>' +
      "</section>" +
      '<section aria-live="polite"><div id="ng-results" class="ng-results"></div></section>' +
      '<section class="panel ng-favs" id="ng-favs-wrap"><div class="ng-favs-head"><h2>' + T("favs") + '</h2><button type="button" class="lnk" id="ng-fav-clear">' + T("favClear") + "</button></div>" +
        '<div id="ng-favs"></div><p class="muted" style="margin:.6rem 0 0;font-size:.9rem">' + T("favHint") + "</p></section>" +
      '<div class="notice"><strong>' + T("noticeTitle") + "</strong> " + T("noticeText") + "</div>";

    $("#ng-count").addEventListener("input", function (e) { state.count = parseInt(e.target.value, 10); $("#ng-count-out").textContent = state.count; run(); });
    var funnyEl = $("#ng-funny"); if (funnyEl) funnyEl.addEventListener("change", function (e) { state.funny = e.target.checked; run(); });
    var umlEl = $("#ng-uml"); if (umlEl) umlEl.addEventListener("change", function (e) { state.umlauts = e.target.checked; run(); });
    $("#ng-go").addEventListener("click", run);
    $("#ng-copyall").addEventListener("click", function (e) {
      copy(state.results.map(function (r) { return r.full; }).join("\n"), e.currentTarget);
    });
    // Beim ersten Aufbau gibt es noch keine Ergebnisse: jetzt welche würfeln.
    // Bei einem späteren Sprachwechsel (Shell wird neu aufgebaut) bleiben
    // bereits erzeugte Karten unverändert bestehen (eigene Sprache pro Karte,
    // siehe cardLang) – nur die Oberfläche drumherum wechselt die Sprache.
    if (!state.results.length) { run(); } else { renderResults(); renderPool(); }
    renderFavs();
  }

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

  // Baut den Namens-Teil einer Karte: wenn beide Teile (Vor- UND Nachname)
  // vorhanden sind, Vorname in Klassenfarbe + Nachname in Weiß (wie bisher);
  // ansonsten alles einfarbig. Immer als zwei <span> ausgegeben (auch wenn
  // einer leer ist), damit man beim Bearbeiten in beide Felder tippen kann.
  function cardNameHtml(r) {
    var hasBoth = !!(r.first && r.last);
    return '<span class="ng-fn" spellcheck="false">' + esc(r.first || "") + '</span>' +
      '<span class="ng-ln' + (hasBoth ? " ln" : "") + '" spellcheck="false">' + esc(r.last || "") + "</span>";
  }
  // Rassen-/Klassen-Dropdowns in der Karte: immer in der Sprache, in der die
  // Karte selbst erzeugt wurde (cardLang), unabhängig vom aktuellen globalen
  // Sprachschalter – ein späterer Wechsel verfälscht bestehende Karten nicht.
  function raceItemsLang(lang) {
    var DD = dataFor(lang), Tl = T_ALL[lang] || T_ALL.de;
    var groups = [["A", Tl.alliance], ["H", Tl.horde], ["N", Tl.neutral]];
    var items = [{ value: "random", label: Tl.randomRace, iconHtml: '<span class="ng-cicon ng-cicon-emoji">🎲</span>' }];
    groups.forEach(function (g) {
      var list = DD.races.filter(function (r) { return r.f === g[0]; });
      if (!list.length) return;
      items.push({ group: g[1], groupIconHtml: factionIcon(g[0], "ng-ficon-dd") });
      list.forEach(function (r) { items.push({ value: r.id, label: raceLabel(r) }); });
    });
    return items;
  }
  function classItemsLang(lang) {
    var DD = dataFor(lang), Tl = T_ALL[lang] || T_ALL.de;
    var items = [{ value: "random", label: Tl.randomCls, iconHtml: '<span class="ng-cicon ng-cicon-emoji">🎲</span>' }];
    DD.classes.forEach(function (c) { items.push({ value: c.id, label: clsLabel(c), iconHtml: classIcon(c, "ng-cicon-dd") }); });
    return items;
  }
  function cardMetaHtml(r) {
    var Tl = T_ALL[r.lang] || T_ALL.de;
    var meta = factionIcon(r.race.f, "ng-ficon-meta") + esc(raceLabel(r.race)) + " · " + classIcon(r.cls, "ng-cicon-meta") + esc(clsLabel(r.cls)) + " · " + genderIcon(r.gender, "ng-gicon-meta");
    var badge = r.ingame === null ? "" : (r.ingame
      ? '<span class="ok" title="' + Tl.playableTip + '">' + Tl.playable + "</span>"
      : '<span class="warn" title="' + Tl.notPlayableTip + '">' + Tl.notPlayable + "</span>");
    return meta + " " + badge;
  }
  // Bearbeiten-Ansicht der Meta-Zeile: echte Dropdowns (Volk, Klasse) wie im
  // Generator selbst + ein kleines Geschlecht-Umschalter. Die Fraktion ergibt
  // sich automatisch aus dem gewählten Volk (keine eigene Auswahl nötig).
  // "Zufällig"-Einträge ergeben für eine bereits erzeugte, konkrete Karte
  // keinen Sinn (und wären auch kein gültiger Auswahl-Wert) – daher raus.
  function stripRandom(items) { return items.filter(function (it) { return it.group || it.value !== "random"; }); }
  function cardMetaEditHtml(r, i) {
    var lang = cardLang(r), Tl = T_ALL[lang] || T_ALL.de;
    return ddHTML({ id: "card-race-" + i, value: r.race.id, items: stripRandom(raceItemsLang(lang)) }) +
      ddHTML({ id: "card-cls-" + i, value: r.cls.id, items: stripRandom(classItemsLang(lang)) }) +
      '<div class="ng-gseg" data-card-seg="gender">' +
        '<button type="button" class="' + (r.gender === "m" ? "on" : "") + '" data-val="m" aria-label="' + Tl.male + '" title="' + Tl.male + '">' + genderIcon("m", "ng-gicon-seg") + "</button>" +
        '<button type="button" class="' + (r.gender === "f" ? "on" : "") + '" data-val="f" aria-label="' + Tl.female + '" title="' + Tl.female + '">' + genderIcon("f", "ng-gicon-seg") + "</button>" +
      "</div>";
  }
  // Kleiner, immer sichtbarer Umschalter für das Kartendesign (Standard/Fraktion) –
  // zwei kompakte Icon-Buttons, rechts unter den übrigen Karten-Aktionen gestapelt.
  function cardStyleRowHtml(r) {
    var Tl = T_ALL[cardLang(r)] || T_ALL.de;
    // Neutrale Völker haben bewusst kein Wappen (siehe FICONS) – ohne Fallback
    // wäre der Umschalter-Button sonst leer/unsichtbar.
    var facHtml = factionIcon(r.race.f, "ng-ficon-btn") || "🛡️";
    var isFac = r.cardStyle === "faction";
    return '<div class="ng-style-col" data-card-seg="style">' +
      '<button type="button" class="icon-btn' + (!isFac ? " on" : "") + '" data-val="standard" title="' + Tl.styleStandardTip + '" aria-label="' + Tl.styleStandardTip + '">🎴</button>' +
      '<button type="button" class="icon-btn' + (isFac ? " on" : "") + '" data-val="faction" title="' + Tl.styleFactionTip + '" aria-label="' + Tl.styleFactionTip + '">' + facHtml + "</button>" +
    "</div>";
  }
  // Aktualisiert Kartenfarbe, Meta-Zeile, Fraktions-Optik und Favoriten-Stern
  // nach einer Volk-/Klassen-/Geschlecht-/Design-Änderung (ohne Neu-Rendern).
  function refreshCardAfterFieldEdit(i) {
    var r = state.results[i], card = root.querySelector('.ng-card[data-idx="' + i + '"]');
    if (!r || !card) return;
    card.style.setProperty("--cc", r.cls.color);
    card.querySelector(".ng-meta").innerHTML = cardMetaHtml(r);
    refreshCardStyleVisual(card, r);
    // Fraktions-Wappen im Standard/Fraktion-Umschalter neu setzen (kann sich
    // nach einem Volkswechsel in der Bearbeitung geändert haben).
    var styleCol = card.querySelector('[data-card-seg="style"]');
    if (styleCol) styleCol.outerHTML = cardStyleRowHtml(r);
    var favBtn = card.querySelector("[data-fav]");
    if (favBtn) { var on = isFav(r.full); favBtn.classList.toggle("on", on); favBtn.textContent = on ? "★" : "☆"; }
  }
  // Übernimmt eine Bearbeitung ins Daten-Modell und aktualisiert nur die
  // betroffene Karte (kein komplettes Neu-Rendern, das würde den Fokus killen).
  function commitCardEdit(i, edited, card) {
    var r = state.results[i];
    if (!r) return;
    r.first = edited.first || ""; r.last = edited.last || "";
    r.full = (r.first + " " + r.last).trim() || r.full;
    r.ingame = r.first ? (lettersOnly(r.first) && r.first.length >= 2 && r.first.length <= 12) : null;
    card.querySelector(".ng-name").innerHTML = cardNameHtml(r);
    refreshCardAfterFieldEdit(i);
    wireCardBlur(card);
  }
  // Schließt eine Karte automatisch aus dem Bearbeiten-Modus, sobald man mit
  // der Maus/Tab komplett aus der Karte heraus wechselt (nicht beim Klick auf
  // eine Dropdown/Umschalter innerhalb derselben Karte).
  function wireCardBlur(card) {
    var fn = card.querySelector(".ng-fn"), ln = card.querySelector(".ng-ln");
    var editBtn = card.querySelector("[data-edit]");
    function onBlur() {
      setTimeout(function () {
        if (!card.classList.contains("editing")) return;
        if (card.contains(document.activeElement)) return;
        editBtn.click();
      }, 0);
    }
    if (fn) fn.addEventListener("blur", onBlur);
    if (ln) ln.addEventListener("blur", onBlur);
  }

  function renderResults() {
    var box = $("#ng-results");
    box.innerHTML = state.results.map(function (r, i) {
      var facLogo = factionIconSrc(r.race.f);
      var cls = "ng-card ng-card-in" + (r.cardStyle === "faction" ? " ng-style-faction" : "") + " " + factionClassFor(r.race.f);
      return '<article class="' + cls + '" data-idx="' + i + '" style="--cc:' + r.cls.color + ';--d:' + Math.min(i * 0.05, 0.4) + 's">' +
        (facLogo ? '<img class="ng-card-fac-logo" src="' + facLogo + '" alt="">' : "") +
        '<div class="ng-name">' + cardNameHtml(r) + "</div>" +
        '<div class="ng-meta">' + cardMetaHtml(r) + "</div>" +
        '<div class="ng-meta-edit">' + cardMetaEditHtml(r, i) + "</div>" +
        '<div class="ng-btns">' +
        '<button type="button" class="icon-btn" data-edit="' + i + '" title="' + T("editName") + '" aria-label="' + T("editName") + '">✏️</button>' +
        '<button type="button" class="icon-btn" data-dl="' + i + '" title="' + T("saveImg") + '" aria-label="' + T("saveImg") + '">💾</button>' +
        '<button type="button" class="icon-btn" data-copy="' + i + '" title="' + T("copy") + '" aria-label="' + T("copy") + '">📋</button>' +
        '<button type="button" class="icon-btn' + (isFav(r.full) ? " on" : "") + '" data-fav="' + i + '" title="' + T("save") + '" aria-label="' + T("save") + '">' + (isFav(r.full) ? "★" : "☆") + "</button>" +
        cardStyleRowHtml(r) +
        "</div></article>";
    }).join("");
    Array.prototype.forEach.call(box.querySelectorAll(".ng-card"), wireCardBlur);
  }
  function renderFavs() {
    var wrap = $("#ng-favs-wrap");
    wrap.hidden = !state.fav.length;
    $("#ng-favs").innerHTML = state.fav.map(function (f, i) {
      return '<div class="ng-fav"><span><strong>' + esc(f.full) + '</strong> <span class="muted">' + esc(f.meta) + '</span></span>' +
        '<span class="ng-btns"><button type="button" class="icon-btn" data-fcopy="' + i + '" aria-label="' + T("copy") + '">📋</button>' +
        '<button type="button" class="icon-btn" data-fdel="' + i + '" aria-label="' + T("remove") + '">✕</button></span></div>';
    }).join("");
  }
  function renderPool() {
    var p = poolSize(state);
    var txt = state.mode === "first" ? fmt(p.first) + " " + T("possibleFirst")
      : state.mode === "last" ? fmt(p.last) + " " + T("possibleLast")
      : fmt(p.first) + " " + T("firstNames") + " · " + fmt(p.last) + " " + T("lastNames");
    $("#ng-pool").textContent = T("poolPrefix") + txt + (state.mode === "both" ? " (" + fmt(p.first * p.last) + " " + T("combos") + ")" : "") + ".";
  }
  function run() {
    state.results = generate(state);
    renderResults(); renderPool();
  }

  /* ---------- Ereignisse ---------- */
  ddBind(root, function (ddId, val) {
    if (ddId === "ng-cls") { state.cls = val; run(); return; }
    if (ddId === "ng-race") { state.race = val; run(); return; }
    // Volk/Klasse direkt in einer Ergebniskarte geändert (Bearbeiten-Modus):
    // NICHT run() aufrufen, das würde alle Ergebnisse neu würfeln.
    if (ddId.indexOf("card-race-") === 0) {
      var ri = +ddId.slice(10), rr = state.results[ri];
      if (rr) { rr.race = find(dataFor(cardLang(rr)).races, val) || rr.race; refreshCardAfterFieldEdit(ri); }
      return;
    }
    if (ddId.indexOf("card-cls-") === 0) {
      var ci = +ddId.slice(9), cr = state.results[ci];
      if (cr) { cr.cls = find(dataFor(cardLang(cr)).classes, val) || cr.cls; refreshCardAfterFieldEdit(ci); }
      return;
    }
  });
  root.addEventListener("click", function (e) {
    var t = e.target.closest("button");
    if (!t) return;
    var seg = t.parentNode.getAttribute && t.parentNode.getAttribute("data-seg");
    if (seg === "lang") {
      state.lang = t.getAttribute("data-val"); saveLang(state.lang); renderShell(); return;
    }
    if (seg) {
      state[seg] = t.getAttribute("data-val");
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
      var nowEditing = toggleCardEditing(editCard, t);
      if (!nowEditing) commitCardEdit(+t.getAttribute("data-edit"), readCardEditedName(editCard), editCard);
      return;
    }
    if (t.hasAttribute("data-dl")) {
      var dlIdx = +t.getAttribute("data-dl"), dlCard = t.closest(".ng-card");
      if (dlCard.classList.contains("editing")) {
        toggleCardEditing(dlCard, dlCard.querySelector("[data-edit]"));
        commitCardEdit(dlIdx, readCardEditedName(dlCard), dlCard);
      }
      downloadCardPNG(state.results[dlIdx]);
      return;
    }
    if (t.hasAttribute("data-copy")) { copy(state.results[+t.getAttribute("data-copy")].full, t); return; }
    if (t.hasAttribute("data-fav")) {
      var r = state.results[+t.getAttribute("data-fav")];
      if (isFav(r.full)) state.fav = state.fav.filter(function (f) { return f.full !== r.full; });
      else state.fav.unshift({ full: r.full, meta: raceLabel(r.race) + " · " + clsLabel(r.cls) });
      saveFav(state.fav); renderResults(); renderFavs(); return;
    }
    if (t.hasAttribute("data-fcopy")) { copy(state.fav[+t.getAttribute("data-fcopy")].full, t); return; }
    if (t.hasAttribute("data-fdel")) { state.fav.splice(+t.getAttribute("data-fdel"), 1); saveFav(state.fav); renderResults(); renderFavs(); return; }
    if (t.id === "ng-fav-clear") { state.fav = []; saveFav(state.fav); renderResults(); renderFavs(); }
  });
  root.addEventListener("keydown", function (e) {
    if (e.key !== "Enter") return;
    var el = e.target.closest(".ng-fn, .ng-ln, .ng-name");
    if (!el || el.contentEditable !== "true") return;
    e.preventDefault();
    var editBtn = el.closest(".ng-card").querySelector("[data-edit]");
    if (editBtn) editBtn.click();
  });

  renderShell();
})();
