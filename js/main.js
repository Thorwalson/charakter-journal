/* ==========================================================
   Charakter Journal – gemeinsames Skript
   Baut Kopf- und Fußzeile, füllt Downloads/Roadmap/Timeline
   aus config.js und kümmert sich um kleine Helfer.
   ========================================================== */
(function () {
  "use strict";
  var C = window.CJ || {};
  var L = C.links || {};

  var PAGES = [
    { href: "index.html",        label: "Start" },
    { href: "downloads.html",    label: "Downloads" },
    { href: "anleitung.html",    label: "Anleitung" },
    { href: "ki-geschichten.html", label: "KI-Geschichten" },
    { href: "roadmap.html",      label: "Roadmap" },
    { href: "timeline.html",     label: "Timeline" },
    { href: "community.html",    label: "Community" },
    { href: "unterstuetzen.html",label: "Unterstützen" }
  ];

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
  function buildHeader() {
    var host = document.getElementById("site-header");
    if (!host) return;
    var cur = current();
    var links = PAGES.map(function (p) {
      return '<a href="' + p.href + '"' + (p.href === cur ? ' aria-current="page"' : "") + ">" + p.label + "</a>";
    }).join("");
    host.className = "site-header";
    host.innerHTML =
      '<div class="wrap nav">' +
        '<a class="brand" href="index.html" aria-label="' + esc(C.name) + ' – Startseite">' +
          '<img src="assets/logo-small.png" alt="" width="44" height="44" ' +
          'onerror="this.outerHTML=\'<span class=&quot;logo-fallback&quot;>CJ</span>\'">' +
          "<span>Charakter <em>Journal</em></span>" +
        "</a>" +
        '<button class="nav-toggle" aria-label="Menü öffnen" aria-expanded="false" aria-controls="nav-links">☰</button>' +
        '<nav class="nav-links" id="nav-links" aria-label="Hauptnavigation">' + links + "</nav>" +
      "</div>";
    var btn = host.querySelector(".nav-toggle");
    var nav = host.querySelector(".nav-links");
    btn.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  /* ---------- Footer ---------- */
  function buildFooter() {
    var host = document.getElementById("site-footer");
    if (!host) return;
    host.className = "site-footer";
    host.innerHTML =
      '<div class="wrap footer-grid">' +
        "<div>" +
          "<strong>" + esc(C.name) + "</strong> – " + esc(C.tagline) +
          "<small>" + esc(C.name) + " ist ein inoffizielles Fan-Projekt und steht in keiner Verbindung zu Blizzard Entertainment, Inc. " +
          "World of Warcraft® ist eine eingetragene Marke von Blizzard Entertainment, Inc. Alle Rechte an Spiel, Namen und Inhalten liegen bei Blizzard.</small>" +
          "<small>© " + new Date().getFullYear() + " " + esc(C.name) + "</small>" +
        "</div>" +
        '<div class="footer-links">' +
          '<a href="impressum.html">Impressum</a>' +
          '<a href="datenschutz.html">Datenschutz</a>' +
          '<a href="community.html">Community</a>' +
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
        el.setAttribute("title", "Bald verfügbar");
        el.addEventListener("click", function (e) { e.preventDefault(); });
      }
    }
  }

  /* ---------- Downloads ---------- */
  var STATUS = {
    release: { label: "Release", cls: "" },
    beta:    { label: "Beta",    cls: "pre" },
    soon:    { label: "Bald",    cls: "pre" }
  };
  function renderDownloads() {
    var host = document.getElementById("downloads");
    if (!host || !C.versions) return;
    host.innerHTML = C.versions.map(function (v) {
      var st = STATUS[v.status] || STATUS.soon;
      var live = v.status !== "soon" && isLive(v.url);
      var older = (v.older || []).length
        ? '<div class="dl-older"><details><summary>Ältere Versionen</summary><div><ul>' +
          v.older.map(function (o) {
            return '<li><a href="' + esc(o.url) + '" target="_blank" rel="noopener noreferrer">v' + esc(o.v) + "</a>" +
                   (o.date ? ' <span class="muted">(' + esc(o.date) + ")</span>" : "") + "</li>";
          }).join("") +
          "</ul></div></details></div>"
        : "";
      return (
        '<article class="panel dl-card" id="' + esc(v.id) + '">' +
          '<div style="font-size:2rem" aria-hidden="true">' + esc(v.icon) + "</div>" +
          "<h3>" + esc(v.title) + '<span class="tag ' + st.cls + '">' + st.label + "</span></h3>" +
          '<p class="desc">' + esc(v.subtitle) + "</p>" +
          '<div class="dl-version">Version ' + esc(v.version) + "</div>" +
          '<div class="dl-meta">' + (v.date ? "Stand: " + esc(v.date) + " · " : "") + esc(v.note || "") + "</div>" +
          (live
            ? '<a class="btn" href="' + esc(v.url) + '" target="_blank" rel="noopener noreferrer">⬇ Herunterladen (.zip)</a>'
            : '<span class="btn is-disabled" aria-disabled="true">Bald verfügbar</span>') +
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
      var steps = (a.steps || []).map(function (st) { return "<li>" + esc(st) + "</li>"; }).join("");
      return (
        '<article class="panel ai-card">' +
          '<div class="ai-head"><span class="ai-icon" aria-hidden="true">' + esc(a.icon) + "</span>" +
            "<div><h3>" + esc(a.name) + '</h3><span class="muted">' + esc(a.provider) + "</span></div></div>" +
          "<p>" + esc(a.text) + "</p>" +
          '<ul class="ai-facts">' +
            "<li><strong>Kostenlos:</strong> " + esc(a.free) + "</li>" +
            "<li><strong>Chat merken:</strong> " + esc(a.pin) + "</li>" +
          "</ul>" +
          (steps ? "<details><summary>So merkst du dir den Chat</summary><div><ol>" + steps + "</ol>" +
            (a.note ? '<p class="muted" style="margin-top:.6rem">' + esc(a.note) + "</p>" : "") + "</div></details>" : "") +
          '<div class="btn-row" style="margin-top:auto">' +
            '<a class="btn" href="' + esc(a.url) + '" target="_blank" rel="noopener noreferrer">' + esc(a.name) + " öffnen ↗</a>" +
            (a.info ? '<a class="btn small ghost" href="' + esc(a.info) + '" target="_blank" rel="noopener noreferrer">Mehr dazu</a>' : "") +
          "</div>" +
        "</article>"
      );
    }).join("");
    var chk = document.querySelectorAll("[data-ai-checked]");
    for (var i = 0; i < chk.length; i++) chk[i].textContent = C.aisChecked || "";
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
            btn.textContent = "✔ Kopiert!";
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

  document.addEventListener("DOMContentLoaded", function () {
    buildHeader();
    buildFooter();
    renderDownloads();
    renderAIs();
    renderRoadmap();
    renderTimeline();
    applyText();
    applyLinks();
    setupCopy();
  });
})();
