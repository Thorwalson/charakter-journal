/* ==========================================================
   Charakter Journal – gemeinsames Skript
   Baut Kopf- und Fußzeile, füllt Downloads/Roadmap/Timeline
   aus config.js und kümmert sich um kleine Helfer.
   ========================================================== */
(function () {
  "use strict";
  var C = window.CJ || {};

  /* Vorschau-Modus: Das Dashboard zeigt die Seiten mit dem aktuellen Entwurf */
  var PREVIEW = false;
  try {
    if (window.parent !== window && /[?&]preview=1/.test(location.search) && window.parent.CJ_DRAFT) {
      PREVIEW = true;
      var D = window.parent.CJ_DRAFT;
      for (var pk in D) { if (Object.prototype.hasOwnProperty.call(D, pk)) C[pk] = D[pk]; }
    }
  } catch (e) {}
  function asset(p) {
    try { return PREVIEW && window.parent.CJ_ASSET ? window.parent.CJ_ASSET(p) : p; } catch (e) { return p; }
  }

  var L = C.links || {};
  var I18N = window.CJ_I18N;
  function T(key, de) { return I18N ? I18N.t(key, de) : de; }
  function TR(item, field) { return I18N ? I18N.tr(item, field) : (item || {})[field]; }

  function buildPages() {
    return [
      { href: "index.html",        label: T("nav.start", "Start") },
      { href: "downloads.html",    label: T("nav.downloads", "Downloads") },
      { href: "anleitung.html",    label: T("nav.anleitung", "Anleitung") },
      { href: "ki-geschichten.html", label: T("nav.ki", "KI-Geschichten") },
      { label: T("nav.tools", "Tools"), items: [
          { href: "namen-generator.html", label: T("nav.namegen", "Name-Gen") },
          { href: "export.html",          label: T("nav.export", "Journal-Export") },
          { href: "buch-designer.html",   label: T("nav.buchdesigner", "Buch-Designer") }
        ]
      },
      /* Roadmap & Timeline sind vorerst ausgeblendet (Seiten bleiben erhalten, nur nicht verlinkt) */
      { href: "roadmap.html",      label: "Roadmap",  hidden: true },
      { href: "timeline.html",     label: "Timeline",  hidden: true },
      { label: T("nav.community", "Community"), items: [
          { href: "community.html", label: T("nav.community", "Community") },
          { href: "chroniken.html", label: T("nav.chroniken", "Chroniken von Azeroth") }
        ]
      },
      { href: "unterstuetzen.html",label: T("nav.unterstuetzen", "Unterstützen") }
    ];
  }

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function isLive(url) { return !!url && url !== "#"; }
  function current() {
    var p = location.pathname.split("/").pop();
    return p === "" ? "index.html" : p;
  }

  /* ---------- Header ---------- */
  function navItemHtml(p, cur) {
    if (p.items) {
      var childActive = p.items.some(function (c) { return c.href === cur; });
      var sub = p.items.map(function (c) {
        if (c.soon || !c.href) {
          return '<span class="is-disabled" aria-disabled="true" title="Bald verfügbar">' + esc(c.label) + "</span>";
        }
        return '<a href="' + c.href + '"' + (c.href === cur ? ' aria-current="page"' : "") + ">" + esc(c.label) + "</a>";
      }).join("");
      return (
        '<div class="nav-drop' + (childActive ? " is-active" : "") + '">' +
          '<button type="button" class="nav-drop-btn" aria-haspopup="true" aria-expanded="false">' +
            esc(p.label) + '<span class="nav-drop-caret" aria-hidden="true">▾</span>' +
          "</button>" +
          '<div class="nav-drop-menu">' + sub + "</div>" +
        "</div>"
      );
    }
    return '<a href="' + p.href + '"' + (p.href === cur ? ' aria-current="page"' : "") + ">" + esc(p.label) + "</a>";
  }

  function langSwitchHtml() {
    if (!I18N) return "";
    var cur = I18N.lang();
    var curLang = I18N.LANGS.filter(function (l) { return l.code === cur; })[0] || I18N.LANGS[0];
    var others = I18N.LANGS.filter(function (l) { return l.code !== cur; }).map(function (l) {
      return '<button type="button" class="lang-opt" data-lang="' + esc(l.code) + '">' +
        '<span class="lang-flag" aria-hidden="true">' + l.flag + "</span>" + esc(l.label) + "</button>";
    }).join("");
    return (
      '<div class="nav-drop lang-switch">' +
        '<button type="button" class="nav-drop-btn lang-btn" aria-haspopup="true" aria-expanded="false" aria-label="' +
          esc(T("nav.language", "Sprache wählen")) + '">' +
          '<span class="lang-flag" aria-hidden="true">' + curLang.flag + "</span>" +
          '<span class="nav-drop-caret" aria-hidden="true">▾</span>' +
        "</button>" +
        '<div class="nav-drop-menu lang-menu">' + others + "</div>" +
      "</div>"
    );
  }

  function buildHeader() {
    var host = document.getElementById("site-header");
    if (!host) return;
    var cur = current();
    var PAGES = buildPages();
    var links = PAGES.filter(function (p) { return !p.hidden; }).map(function (p) { return navItemHtml(p, cur); }).join("");
    host.className = "site-header";
    host.innerHTML =
      '<div class="wrap nav">' +
        '<a class="brand" href="index.html" aria-label="' + esc(C.name) + ' – Startseite">' +
          '<img src="assets/logo-small.png" alt="" width="44" height="44" ' +
          'onerror="this.outerHTML=\'<span class=&quot;logo-fallback&quot;>CJ</span>\'">' +
          "<span>Charakter <em>Journal</em></span>" +
        "</a>" +
        '<button class="nav-toggle" aria-label="' + esc(T("nav.menuOpen", "Menü öffnen")) + '" aria-expanded="false" aria-controls="nav-links">☰</button>' +
        '<nav class="nav-links" id="nav-links" aria-label="' + esc(T("nav.main", "Hauptnavigation")) + '">' + links + "</nav>" +
        langSwitchHtml() +
      "</div>";
    var btn = host.querySelector(".nav-toggle");
    var nav = host.querySelector(".nav-links");
    btn.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });

    /* Dropdown(s): Klick zum Öffnen/Schließen, Klick außerhalb oder Escape schließt */
    var drops = host.querySelectorAll(".nav-drop");
    function closeAll(except) {
      for (var i = 0; i < drops.length; i++) {
        if (drops[i] === except) continue;
        drops[i].classList.remove("open");
        drops[i].querySelector(".nav-drop-btn").setAttribute("aria-expanded", "false");
      }
    }
    for (var i = 0; i < drops.length; i++) {
      (function (drop) {
        var dbtn = drop.querySelector(".nav-drop-btn");
        dbtn.addEventListener("click", function (e) {
          e.stopPropagation();
          var open = drop.classList.toggle("open");
          dbtn.setAttribute("aria-expanded", open ? "true" : "false");
          if (open) closeAll(drop);
        });
      })(drops[i]);
    }
    document.addEventListener("click", function () { closeAll(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeAll(); });

    /* Sprachwahl */
    var langHost = host.querySelector(".lang-switch");
    if (langHost && I18N) {
      langHost.addEventListener("click", function (e) {
        var opt = e.target.closest(".lang-opt");
        if (!opt) return;
        I18N.setLang(opt.getAttribute("data-lang"));
      });
    }
  }

  /* ---------- Footer ---------- */
  function buildFooter() {
    var host = document.getElementById("site-footer");
    if (!host) return;
    host.className = "site-footer";
    host.innerHTML =
      '<div class="wrap footer-grid">' +
        "<div>" +
          "<strong>" + esc(C.name) + "</strong> – " + esc(T("footer.tagline", C.tagline)) +
          "<small>" + esc(C.name) + " " + esc(T("footer.disclaimer",
            "ist ein inoffizielles Fan-Projekt und steht in keiner Verbindung zu Blizzard Entertainment, Inc. " +
            "World of Warcraft® ist eine eingetragene Marke von Blizzard Entertainment, Inc. Alle Rechte an Spiel, Namen und Inhalten liegen bei Blizzard.")) + "</small>" +
          "<small>© " + new Date().getFullYear() + " " + esc(C.name) + "</small>" +
        "</div>" +
        '<div class="footer-links">' +
          '<a href="impressum.html">' + esc(T("footer.impressum", "Impressum")) + "</a>" +
          '<a href="datenschutz.html">' + esc(T("footer.datenschutz", "Datenschutz")) + "</a>" +
          '<a href="community.html">' + esc(T("nav.community", "Community")) + "</a>" +
          '<a data-link="github" href="#">GitHub</a>' +
        "</div>" +
      "</div>";
  }

  /* ---------- Links aus config.js einsetzen ---------- */
  function applyLinks() {
    var nodes = document.querySelectorAll("[data-link]");
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      var key = el.getAttribute("data-link");
      var url = L[key];
      if (key === "email") url = url ? "mailto:" + url : "";
      if (isLive(url)) {
        el.setAttribute("href", url);
        if (url.indexOf("mailto:") !== 0) {
          el.setAttribute("target", "_blank");
          el.setAttribute("rel", "noopener noreferrer");
        }
        el.classList.remove("is-disabled");
        el.removeAttribute("aria-disabled");
        el.removeAttribute("title");
      } else {
        el.setAttribute("href", "#");
        el.classList.add("is-disabled");
        el.setAttribute("aria-disabled", "true");
        el.setAttribute("title", T("downloads.status.soonBtn", "Bald verfügbar"));
        el.addEventListener("click", function (e) { e.preventDefault(); });
      }
    }
  }

  /* ---------- Downloads ---------- */
  function statusLabels() {
    return {
      release: { label: T("downloads.status.release", "Release"), cls: "" },
      beta:    { label: T("downloads.status.beta", "Beta"),        cls: "pre" },
      soon:    { label: T("downloads.status.soon", "Bald"),        cls: "pre" }
    };
  }
  function renderDownloads() {
    var host = document.getElementById("downloads");
    if (!host || !C.versions) return;
    var STATUS = statusLabels();
    host.innerHTML = C.versions.map(function (v) {
      var st = STATUS[v.status] || STATUS.soon;
      var live = v.status !== "soon" && isLive(v.url);
      var older = (v.older || []).length
        ? '<div class="dl-older"><details><summary>' + esc(T("downloads.older", "Ältere Versionen")) + '</summary><div><ul>' +
          v.older.map(function (o) {
            return '<li><a href="' + esc(o.url) + '" target="_blank" rel="noopener noreferrer">v' + esc(o.v) + "</a>" +
                   (o.date ? ' <span class="muted">(' + esc(o.date) + ")</span>" : "") + "</li>";
          }).join("") +
          "</ul></div></details></div>"
        : "";
      return (
        '<article class="panel dl-card" id="' + esc(v.id) + '">' +
          '<div style="font-size:2rem" aria-hidden="true">' + esc(v.icon) + "</div>" +
          "<h3>" + esc(TR(v, "title")) + '<span class="tag ' + st.cls + '">' + st.label + "</span></h3>" +
          '<p class="desc">' + esc(TR(v, "subtitle")) + "</p>" +
          '<div class="dl-version">' + esc(T("downloads.version", "Version")) + " " + esc(v.version) + "</div>" +
          '<div class="dl-meta">' + (v.date ? esc(T("downloads.stand", "Stand")) + ": " + esc(v.date) + " · " : "") + esc(TR(v, "note") || "") + "</div>" +
          (live
            ? '<a class="btn" href="' + esc(v.url) + '" target="_blank" rel="noopener noreferrer">⬇ ' + esc(T("downloads.get", "Herunterladen (.zip)")) + "</a>"
            : '<span class="btn is-disabled" aria-disabled="true">' + esc(T("downloads.status.soonBtn", "Bald verfügbar")) + "</span>") +
          older +
        "</article>"
      );
    }).join("");
  }


  /* ---------- KI-Karten ---------- */
  function renderAIs() {
    var host = document.getElementById("ai-list");
    if (!host || !C.ais) return;
    host.innerHTML = C.ais.map(function (a) {
      var stepsList = TR(a, "steps") || a.steps || [];
      var steps = stepsList.map(function (st) { return "<li>" + esc(st) + "</li>"; }).join("");
      var note = TR(a, "note");
      return (
        '<article class="panel ai-card">' +
          '<div class="ai-head"><span class="ai-icon" aria-hidden="true">' + esc(a.icon) + "</span>" +
            "<div><h3>" + esc(a.name) + '</h3><span class="muted">' + esc(a.provider) + "</span></div></div>" +
          "<p>" + esc(TR(a, "text")) + "</p>" +
          '<ul class="ai-facts">' +
            "<li><strong>" + esc(T("ki.free", "Kostenlos")) + ":</strong> " + esc(TR(a, "free")) + "</li>" +
            "<li><strong>" + esc(T("ki.pin", "Chat merken")) + ":</strong> " + esc(TR(a, "pin")) + "</li>" +
          "</ul>" +
          (steps ? "<details><summary>" + esc(T("ki.stepsSummary", "So merkst du dir den Chat")) + "</summary><div><ol>" + steps + "</ol>" +
            (note ? '<p class="muted" style="margin-top:.6rem">' + esc(note) + "</p>" : "") + "</div></details>" : "") +
          '<div class="btn-row" style="margin-top:auto">' +
            '<a class="btn" href="' + esc(a.url) + '" target="_blank" rel="noopener noreferrer">' + esc(a.name) + " " + esc(T("ki.open", "öffnen")) + " ↗</a>" +
            (a.info ? '<a class="btn small ghost" href="' + esc(a.info) + '" target="_blank" rel="noopener noreferrer">' + esc(T("ki.more", "Mehr dazu")) + "</a>" : "") +
          "</div>" +
        "</article>"
      );
    }).join("");
    var chk = document.querySelectorAll("[data-ai-checked]");
    for (var i = 0; i < chk.length; i++) chk[i].textContent = C.aisChecked || "";
  }


  /* ---------- Screenshots ---------- */
  function renderScreenshots() {
    var host = document.getElementById("screenshots");
    var sec = document.getElementById("shots-section");
    if (!host || !C.screenshots || !C.screenshots.length) return;
    host.innerHTML = C.screenshots.map(function (s, i) {
      return '<figure class="shot"><button type="button" class="shot-btn" data-shot="' + i + '" aria-label="Screenshot vergrößern">' +
        '<img loading="lazy" src="' + esc(asset(s.src)) + '" alt="' + esc(s.alt || s.caption || "Screenshot") + '"></button>' +
        (s.caption ? "<figcaption>" + esc(s.caption) + "</figcaption>" : "") + "</figure>";
    }).join("");
    if (sec) sec.hidden = false;
  }

  function setupLightbox() {
    var box = null;
    document.addEventListener("click", function (e) {
      var b = e.target.closest ? e.target.closest("[data-shot]") : null;
      if (!b || !C.screenshots) return;
      var s = C.screenshots[parseInt(b.getAttribute("data-shot"), 10)];
      if (!s) return;
      if (!box) {
        box = document.createElement("dialog");
        box.className = "lightbox";
        box.innerHTML = '<button type="button" class="lb-close" aria-label="Schließen">✕</button><img alt=""><p class="lb-cap"></p>';
        document.body.appendChild(box);
        box.addEventListener("click", function () { box.close(); });
      }
      box.querySelector("img").src = asset(s.src);
      box.querySelector("img").alt = s.alt || s.caption || "Screenshot";
      box.querySelector(".lb-cap").textContent = s.caption || "";
      if (box.showModal) box.showModal();
    });
  }

  /* ---------- Story-Galerie ---------- */
  function renderGallery() {
    var host = document.getElementById("gallery");
    if (!host) return;
    var list = (C.gallery || []).filter(function (g) { return g.published !== false && g.consent; });
    var empty = document.getElementById("gallery-empty");
    if (!list.length) { if (empty) empty.hidden = false; return; }
    if (empty) empty.hidden = true;
    host.innerHTML = list.map(function (g) {
      var plain = String(g.text || "").replace(/\s+/g, " ").trim();
      var excerpt = plain.length > 220 ? plain.slice(0, 220).replace(/\s+\S*$/, "") + " …" : plain;
      var paras = String(g.text || "").split(/\n\s*\n/).map(function (p) {
        return "<p>" + esc(p.trim()).replace(/\n/g, "<br>") + "</p>";
      }).join("");
      var meta = [g.character, g.levels ? "Level " + g.levels : ""].filter(Boolean).join(" · ");
      return '<article class="panel parchment story">' +
        (g.image ? '<img class="story-img" loading="lazy" src="' + esc(asset(g.image)) + '" alt="' + esc(g.title || "Bild zur Geschichte") + '">' : "") +
        "<h3>" + esc(g.title) + "</h3>" +
        '<div class="story-meta">' + (g.author ? "von " + esc(g.author) : "") + (meta ? (g.author ? " · " : "") + esc(meta) : "") + "</div>" +
        '<p class="story-excerpt">' + esc(excerpt) + "</p>" +
        "<details><summary>Geschichte lesen</summary><div>" + paras + "</div></details>" +
        "</article>";
    }).join("");
  }

  /* ---------- Roadmap ---------- */
  function renderRoadmap() {
    var host = document.getElementById("roadmap");
    if (!host || !C.roadmap) return;
    var cols = [
      { key: "planned",  title: "Geplant",   dot: "planned" },
      { key: "progress", title: "In Arbeit", dot: "progress" },
      { key: "done",     title: "Fertig",    dot: "done" }
    ];
    host.innerHTML = cols.map(function (col) {
      var items = C.roadmap.filter(function (r) { return r.status === col.key; });
      var html = items.length
        ? items.map(function (r) {
            return '<div class="rm-item"><h3>' + esc(r.title) + "</h3><p>" + esc(r.text) + "</p>" +
                   (r.tag ? '<span class="tag">' + esc(r.tag) + "</span>" : "") + "</div>";
          }).join("")
        : '<p class="empty">Noch nichts hier.</p>';
      return '<section class="panel board-col" aria-labelledby="col-' + col.key + '">' +
        '<h2 id="col-' + col.key + '"><span class="dot ' + col.dot + '"></span>' + col.title +
        ' <span class="muted" style="font-size:.9rem">(' + items.length + ")</span></h2>" + html + "</section>";
    }).join("");
  }

  /* ---------- Timeline ---------- */
  function renderTimeline() {
    var host = document.getElementById("timeline");
    if (!host || !C.timeline) return;
    host.innerHTML = C.timeline.map(function (t) {
      return '<div class="tl-item ' + esc(t.state || "") + '"><div class="panel">' +
        '<div class="tl-date">' + esc(t.date) + "</div>" +
        "<h3>" + esc(t.title) + "</h3><p>" + esc(t.text) + "</p></div></div>";
    }).join("");
  }

  /* ---------- Kopieren-Buttons ---------- */
  function setupCopy() {
    var btns = document.querySelectorAll("[data-copy]");
    for (var i = 0; i < btns.length; i++) {
      (function (btn) {
        btn.addEventListener("click", function () {
          var target = document.getElementById(btn.getAttribute("data-copy"));
          if (!target) return;
          var text = target.innerText;
          var done = function () {
            var old = btn.textContent;
            btn.textContent = "✔ " + T("common.copied", "Kopiert!");
            setTimeout(function () { btn.textContent = old; }, 1800);
          };
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(done, fallback);
          } else { fallback(); }
          function fallback() {
            var ta = document.createElement("textarea");
            ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
            document.body.appendChild(ta); ta.select();
            try { document.execCommand("copy"); done(); } catch (e) {}
            document.body.removeChild(ta);
          }
        });
      })(btns[i]);
    }
  }

  /* ---------- Platzhalter-Texte ---------- */
  function applyText() {
    var map = { "[name]": C.name, "[version]": C.currentVersion };
    var nodes = document.querySelectorAll("[data-cj]");
    for (var i = 0; i < nodes.length; i++) {
      var k = nodes[i].getAttribute("data-cj");
      if (C[k] != null) nodes[i].textContent = C[k];
    }
  }

  function renderAll() {
    buildHeader();
    buildFooter();
    renderDownloads();
    renderAIs();
    renderRoadmap();
    renderTimeline();
    applyLinks();
  }

  document.addEventListener("DOMContentLoaded", function () {
    if (I18N) I18N.apply();
    renderAll();
    renderScreenshots();
    renderGallery();
    applyText();
    setupCopy();
    setupLightbox();
  });

  /* Sprache gewechselt: statische [data-i18n]-Texte sind von i18n.js
     schon aktualisiert, hier nur das per JS erzeugte neu aufbauen. */
  document.addEventListener("cj:langchange", function () {
    if (I18N) I18N.apply();
    renderAll();
  });
})();
