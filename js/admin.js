/* ==========================================================
   Charakter Journal – Dashboard (admin.html)
   Bearbeitet Inhalte im Baukasten-Prinzip und veröffentlicht sie
   über die GitHub-Schnittstelle direkt in euer Repository.
   ========================================================== */
(function () {
  "use strict";

  var C = window.CJ || {};
  var LIST_KEYS = ["versions", "roadmap", "timeline", "screenshots", "gallery"];
  var LINKS = [
    ["discord", "Discord-Einladungslink", "https://discord.gg/…"],
    ["github", "GitHub-Repository", "https://github.com/…"],
    ["githubIssues", "GitHub Issues (Fehler melden)", "https://github.com/…/issues"],
    ["discussions", "GitHub Discussions (Ideen)", "https://github.com/…/discussions"],
    ["kofi", "Ko-fi", "https://ko-fi.com/…"],
    ["paypal", "PayPal", "https://paypal.me/…"],
    ["curseforge", "CurseForge-Projektseite", ""],
    ["wago", "Wago-Projektseite", ""],
    ["storyForm", "Formular: Geschichte einsenden", ""],
    ["ideaForm", "Formular: Ideen einreichen", ""],
    ["email", "Kontakt-E-Mail", "name@beispiel.de"]
  ];
  var TABS = [
    ["start", "🔑", "Verbinden"],
    ["downloads", "⬇️", "Downloads"],
    ["roadmap", "🗺️", "Roadmap"],
    ["timeline", "⏳", "Timeline"],
    ["screenshots", "🖼️", "Screenshots"],
    ["gallery", "📖", "Story-Galerie"],
    ["links", "🔗", "Links & Allgemein"],
    ["preview", "👁️", "Vorschau"],
    ["publish", "🚀", "Veröffentlichen"]
  ];
  var MONTHS = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
  var MAX_FILE = 90 * 1024 * 1024;

  /* ---------- kleine Helfer ---------- */
  function $(s, r) { return (r || document).querySelector(s); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function clone(x) { return JSON.parse(JSON.stringify(x)); }
  function uid() { return "i" + Math.random().toString(36).slice(2, 9); }
  function isLive(u) { return !!u && u !== "#"; }
  function slug(s) {
    return String(s || "").toLowerCase().replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
      .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "datei";
  }
  function monthYear() { var d = new Date(); return MONTHS[d.getMonth()] + " " + d.getFullYear(); }
  function todayISO() {
    var d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }
  function deDate(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || "");
    return m ? m[3] + "." + m[2] + "." + m[1] : (iso || "");
  }
  function fmtSize(n) {
    if (n > 1048576) return (n / 1048576).toFixed(1) + " MB";
    return Math.max(1, Math.round(n / 1024)) + " KB";
  }
  function byId(list, id) {
    for (var i = 0; i < list.length; i++) if (list[i]._id === id) return list[i];
    return null;
  }
  function bump(v) {
    var m = /^(.*?)(\d+)$/.exec(String(v || "0.1.0"));
    return m ? m[1] + (parseInt(m[2], 10) + 1) : v;
  }
  function toast(msg, type) {
    var t = $("#toast");
    t.textContent = msg;
    t.className = "toast show " + (type || "");
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { t.className = "toast " + (type || ""); }, 4200);
  }

  /* ---------- Zustand ---------- */
  var S = { cfg: loadCfg(), data: null, files: {}, tab: "start", snapshot: "", connected: false, publishing: false, lastResult: "" };

  function loadCfg() {
    var c = { owner: "", repo: "", branch: "main", token: "", remember: true };
    try {
      var j = JSON.parse(localStorage.getItem("cj_admin_cfg") || "null");
      if (j) for (var k in j) c[k] = j[k];
    } catch (e) {}
    if (!c.owner && /\.github\.io$/.test(location.hostname)) {
      c.owner = location.hostname.split(".")[0];
      var p = location.pathname.split("/")[1];
      c.repo = p && !/\.html?$/.test(p) ? p : c.owner + ".github.io";
    }
    return c;
  }
  function saveCfg() {
    try {
      var c = clone(S.cfg);
      if (!c.remember) c.token = "";
      localStorage.setItem("cj_admin_cfg", JSON.stringify(c));
    } catch (e) {}
  }

  function initData(src) {
    var d = {};
    d.name = src.name || "Charakter Journal";
    d.tagline = src.tagline || "";
    d.currentVersion = src.currentVersion || "";
    d.links = clone(src.links || {});
    LINKS.forEach(function (l) { if (d.links[l[0]] == null) d.links[l[0]] = l[0] === "email" ? "" : "#"; });
    LIST_KEYS.forEach(function (k) {
      d[k] = clone(src[k] || []);
      d[k].forEach(function (it) { it._id = uid(); });
    });
    d.versions.forEach(function (v) { v.older = v.older || []; });
    S.data = d;
    S.snapshot = ser();
    window.CJ_DRAFT = d;
  }
  function ser() {
    return JSON.stringify(S.data, function (k, v) { return k.charAt(0) === "_" ? undefined : v; }, 2);
  }
  function isDirty() { return ser() !== S.snapshot; }
  function pendingFiles(json) {
    json = json || ser();
    return Object.keys(S.files).filter(function (p) { return !S.files[p].published && json.indexOf(p) >= 0; });
  }
  window.CJ_ASSET = function (p) { return S.files[p] ? S.files[p].url : p; };

  function addFile(path, blob) {
    if (S.files[path]) { try { URL.revokeObjectURL(S.files[path].url); } catch (e) {} }
    S.files[path] = { blob: blob, url: URL.createObjectURL(blob), size: blob.size, published: false };
  }

  /* ---------- Statusleiste & Vorschau ---------- */
  var previewTimer = null;
  function touch() {
    updateBar();
    if (S.tab === "preview") {
      clearTimeout(previewTimer);
      previewTimer = setTimeout(reloadPreview, 350);
    }
  }
  function reloadPreview() {
    var f = $("#pv-frame");
    if (f && f.contentWindow) { try { f.contentWindow.location.reload(); } catch (e) {} }
  }
  function updateBar() {
    var el = $("#bar-status");
    if (!el) return;
    var n = pendingFiles().length, dirty = isDirty();
    if (dirty || n) {
      el.className = "adm-status dirty";
      el.textContent = "● Noch nicht veröffentlicht" + (n ? " (" + n + " Datei" + (n > 1 ? "en" : "") + ")" : "");
    } else {
      el.className = "adm-status ok";
      el.textContent = "✔ Alles veröffentlicht";
    }
  }
  window.addEventListener("beforeunload", function (e) {
    if (S.data && (isDirty() || pendingFiles().length)) { e.preventDefault(); e.returnValue = ""; }
  });

  /* ---------- Bausteine ---------- */
  function head(t, p) { return '<div class="adm-head"><h1>' + esc(t) + '</h1><p class="muted">' + p + "</p></div>"; }
  function bindAttrs(b, i, f) {
    return ' data-b="' + b + '"' + (i == null ? "" : ' data-i="' + i + '"') + ' data-f="' + f + '"';
  }
  function getTarget(b, i) {
    if (b === "@") return S.data;
    return i == null ? S.data[b] : S.data[b][i];
  }
  function inp(b, i, f, label, o) {
    o = o || {};
    var val = getTarget(b, i)[f];
    return '<label class="fld"><span>' + esc(label) + '</span><input type="' + (o.type || "text") + '" value="' + esc(val) + '"' +
      bindAttrs(b, i, f) + (o.ph ? ' placeholder="' + esc(o.ph) + '"' : "") + ">" +
      (o.hint ? "<small>" + esc(o.hint) + "</small>" : "") + "</label>";
  }
  function sel(b, i, f, label, options) {
    var val = getTarget(b, i)[f];
    return '<label class="fld"><span>' + esc(label) + "</span><select" + bindAttrs(b, i, f) + ">" +
      options.map(function (o) { return '<option value="' + esc(o[0]) + '"' + (o[0] === val ? " selected" : "") + ">" + esc(o[1]) + "</option>"; }).join("") +
      "</select></label>";
  }
  function dfield(name, label, val, o) {
    o = o || {};
    if (o.area) {
      return '<label class="fld"><span>' + esc(label) + "</span><textarea name=\"" + name + '"' + (o.big ? ' class="big"' : "") +
        (o.ph ? ' placeholder="' + esc(o.ph) + '"' : "") + ">" + esc(val) + "</textarea>" + (o.hint ? "<small>" + esc(o.hint) + "</small>" : "") + "</label>";
    }
    if (o.options) {
      return '<label class="fld"><span>' + esc(label) + '</span><select name="' + name + '">' +
        o.options.map(function (x) { return '<option value="' + esc(x[0]) + '"' + (x[0] === val ? " selected" : "") + ">" + esc(x[1]) + "</option>"; }).join("") +
        "</select></label>";
    }
    return '<label class="fld"><span>' + esc(label) + '</span><input type="' + (o.type || "text") + '" name="' + name + '" value="' + esc(val) + '"' +
      (o.ph ? ' placeholder="' + esc(o.ph) + '"' : "") + ">" + (o.hint ? "<small>" + esc(o.hint) + "</small>" : "") + "</label>";
  }
  function val(d, name) {
    var el = d.querySelector('[name="' + name + '"]');
    if (!el) return "";
    return el.type === "checkbox" ? el.checked : el.value.trim();
  }

  function dlg(title, body, ok, onOk) {
    var d = document.createElement("dialog");
    d.className = "adm-dialog";
    d.innerHTML = '<div class="adm-dialog-in"><h2>' + esc(title) + '</h2><div>' + body + '</div><p class="adm-err" hidden></p>' +
      '<div class="btn-row" style="justify-content:flex-end;margin-top:1.1rem">' +
      '<button type="button" class="btn ghost small" data-x="cancel">Abbrechen</button>' +
      '<button type="button" class="btn small" data-x="ok">' + esc(ok) + "</button></div></div>";
    document.body.appendChild(d);
    d.addEventListener("click", function (e) {
      var x = e.target.getAttribute && e.target.getAttribute("data-x");
      if (x === "cancel") d.close();
      if (x === "ok") {
        var r;
        try { r = onOk(d); } catch (err) { r = err.message; }
        if (typeof r === "string") {
          var er = d.querySelector(".adm-err");
          er.textContent = r; er.hidden = false;
        } else { d.close(); }
      }
    });
    d.addEventListener("close", function () { d.remove(); });
    d.showModal();
    return d;
  }

  /* ---------- Tabs: Inhalte ---------- */
  function tabStart() {
    var c = S.cfg;
    return head("Mit GitHub verbinden", "Einmalig einrichten. Danach kannst du alle Änderungen mit einem Klick veröffentlichen.") +
      '<section class="panel adm-card"><h3>Verbindung</h3><div class="adm-grid">' +
      '<label class="fld"><span>GitHub-Benutzername</span><input type="text" id="cf-owner" value="' + esc(c.owner) + '" placeholder="dein-name"></label>' +
      '<label class="fld"><span>Repository</span><input type="text" id="cf-repo" value="' + esc(c.repo) + '" placeholder="charakter-journal"></label>' +
      '<label class="fld"><span>Branch</span><input type="text" id="cf-branch" value="' + esc(c.branch) + '" placeholder="main"></label>' +
      '<label class="fld"><span>Zugriffs-Token</span><input type="password" id="cf-token" value="' + esc(c.token) + '" placeholder="github_pat_…" autocomplete="off"></label></div>' +
      '<label class="chk"><input type="checkbox" id="cf-remember"' + (c.remember ? " checked" : "") + '><span>Token auf diesem Gerät merken <span class="muted">(nur auf deinem eigenen Computer ankreuzen)</span></span></label>' +
      '<div class="btn-row" style="margin-top:.8rem"><button type="button" class="btn" data-act="connect">Verbindung testen &amp; Stand laden</button>' +
      '<button type="button" class="btn ghost" data-act="forget-token">Token vergessen</button></div>' +
      '<p id="cf-msg" class="muted" style="margin-top:.8rem">' + (S.connected ? "✔ Verbunden mit " + esc(c.owner + "/" + c.repo) : "Noch nicht verbunden. Du kannst auch ohne Verbindung Änderungen vorbereiten und erst später verbinden und veröffentlichen.") + "</p></section>" +
      '<section class="panel adm-card"><h3>Token erstellen (einmalig, ca. 3 Minuten)</h3>' +
      '<p class="muted">Der Token ist wie ein Passwort nur für dieses eine Repository. Die Bezeichnungen auf GitHub können sich leicht ändern, der Weg bleibt aber ähnlich.</p>' +
      '<ol class="steps-list">' +
      "<li>Auf github.com einloggen → oben rechts Profilbild → <strong>Settings</strong>.</li>" +
      "<li>Ganz unten links <strong>Developer settings</strong> → <strong>Personal access tokens</strong> → <strong>Fine-grained tokens</strong> → <strong>Generate new token</strong>.</li>" +
      "<li>Name z. B. „Charakter Journal Dashboard“, Ablaufdatum z. B. 90 Tage.</li>" +
      "<li><strong>Repository access:</strong> „Only select repositories“ und euer Website-Repository wählen.</li>" +
      "<li><strong>Permissions → Repository permissions → Contents:</strong> „Read and write“.</li>" +
      "<li><strong>Generate token</strong>, Token kopieren und oben einfügen. Er wird nur einmal angezeigt.</li></ol>" +
      '<div class="notice"><strong>Sicherheit:</strong> Gib den Token niemals weiter und poste ihn nicht in Discord oder im Code. Er liegt nur in deinem Browser und wird ausschließlich an GitHub gesendet. Auf fremden oder öffentlichen Computern bitte „Token merken“ abwählen und danach „Token vergessen“ klicken. Läuft der Token ab, erstellst du einfach einen neuen.</div></section>' +
      '<section class="panel adm-card"><h3>So funktioniert es</h3><ul class="steps-list">' +
      "<li>Du bearbeitest Inhalte in den Bereichen links. Die <strong>Vorschau</strong> zeigt sofort, wie die Website danach aussieht.</li>" +
      "<li>Erst bei <strong>Veröffentlichen</strong> wird alles in einem Schritt zu GitHub gespeichert. Nach 1–2 Minuten ist die Website aktualisiert.</li>" +
      "<li><strong>Wichtig:</strong> Solange du nicht veröffentlichst, existieren Änderungen (und hochgeladene Dateien) nur in diesem Browser-Fenster. Lade die Seite nicht neu.</li></ul></section>";
  }

  function tabDownloads() {
    return head("Downloads", "Ziehe eine ZIP-Datei auf die jeweilige Karte, trage Version und Datum ein, fertig. Die bisherige Version wandert automatisch in „Ältere Versionen“.") +
      S.data.versions.map(function (v, i) {
        var st = v.status === "soon" ? "Bald verfügbar" : (v.status === "beta" ? "Beta" : "Release");
        var older = (v.older || []).map(function (o, j) {
          return "<li>v" + esc(o.v) + ' <span class="muted">' + esc(o.date || "") + '</span> <button type="button" class="lnk" data-act="del-older" data-i="' + i + '" data-j="' + j + '">entfernen</button></li>';
        }).join("");
        return '<section class="panel adm-card"><div class="adm-card-head"><h3>' + esc(v.icon) + " " + esc(v.title) + '</h3><span class="tag ' + (v.status === "release" ? "" : "pre") + '">' + st + "</span></div>" +
          '<p class="muted">Aktuell: <strong>Version ' + esc(v.version) + "</strong>" + (v.date ? " · " + esc(v.date) : "") +
          (isLive(v.url) && v.status !== "soon" ? " · <code>" + esc(v.url) + "</code>" : "") + "</p>" +
          '<label class="drop" data-drop="zip" data-i="' + i + '"><input type="file" accept=".zip" hidden><strong>ZIP-Datei hierher ziehen</strong><span>oder klicken zum Auswählen · neue Version für ' + esc(v.title) + "</span></label>" +
          '<details class="adm-more"><summary>Angaben von Hand ändern</summary><div class="adm-grid">' +
          inp("versions", i, "version", "Version") + inp("versions", i, "date", "Datum (Text)") +
          sel("versions", i, "status", "Status", [["soon", "Bald verfügbar"], ["beta", "Beta"], ["release", "Release"]]) +
          inp("versions", i, "subtitle", "Untertitel") + inp("versions", i, "note", "Hinweistext") +
          inp("versions", i, "url", "Download-Link", { hint: "Wird beim ZIP-Upload automatisch gesetzt." }) + "</div></details>" +
          (older ? '<details class="adm-more"><summary>Ältere Versionen (' + v.older.length + ')</summary><ul class="adm-list" style="margin-top:.6rem">' + older + "</ul></details>" : "") +
          "</section>";
      }).join("");
  }

  var RM_COLS = [["planned", "Geplant", "planned"], ["progress", "In Arbeit", "progress"], ["done", "Fertig", "done"]];
  function tabRoadmap() {
    return head("Roadmap", "Ziehe Karten zwischen den Spalten, um den Status zu ändern. Mit ✎ bearbeitest du eine Karte, mit „+ Eintrag“ legst du eine neue an.") +
      '<div class="kb">' + RM_COLS.map(function (c) {
        var items = S.data.roadmap.filter(function (r) { return r.status === c[0]; });
        return '<div class="kb-col" data-col="' + c[0] + '"><h3><span class="dot ' + c[2] + '"></span>' + c[1] + " (" + items.length + ")</h3>" +
          items.map(function (r) {
            return '<div class="kb-card" draggable="true" data-id="' + r._id + '"><strong>' + esc(r.title) + "</strong><p>" + esc(r.text) + "</p>" +
              (r.tag ? '<span class="tag">' + esc(r.tag) + "</span>" : "") +
              '<div class="kb-actions"><button type="button" class="icon-btn" data-act="rm-edit" data-id="' + r._id + '" title="Bearbeiten">✎</button>' +
              '<button type="button" class="icon-btn" data-act="rm-del" data-id="' + r._id + '" title="Löschen">🗑</button></div></div>';
          }).join("") +
          '<button type="button" class="btn small ghost" data-act="rm-new" data-st="' + c[0] + '">+ Eintrag</button></div>';
      }).join("") + "</div>";
  }

  var TL_STATES = [["done", "Erledigt (gold)"], ["next", "Als Nächstes (blau)"], ["future", "Später (leer)"]];
  function tabTimeline() {
    var list = S.data.timeline;
    return head("Timeline", "Neueste Einträge stehen oben. Mit den Pfeilen änderst du die Reihenfolge.") +
      '<div class="btn-row" style="margin-bottom:1rem"><button type="button" class="btn" data-act="tl-new">+ Neuer Eintrag</button></div>' +
      (list.length ? list.map(function (t, i) {
        return '<article class="panel item"><span class="pill">' + esc(t.state || "") + "</span><div><h3>" + esc(t.title) +
          '</h3><div class="muted">' + esc(t.date) + "</div><p>" + esc(t.text) + "</p></div>" +
          '<div class="row-actions">' +
          '<button type="button" class="icon-btn" data-act="up" data-list="timeline" data-id="' + t._id + '"' + (i === 0 ? " disabled" : "") + ' title="Nach oben">↑</button>' +
          '<button type="button" class="icon-btn" data-act="down" data-list="timeline" data-id="' + t._id + '"' + (i === list.length - 1 ? " disabled" : "") + ' title="Nach unten">↓</button>' +
          '<button type="button" class="icon-btn" data-act="tl-edit" data-id="' + t._id + '" title="Bearbeiten">✎</button>' +
          '<button type="button" class="icon-btn" data-act="tl-del" data-id="' + t._id + '" title="Löschen">🗑</button></div></article>';
      }).join("") : '<p class="muted">Noch keine Einträge.</p>');
  }

  function tabScreenshots() {
    var list = S.data.screenshots;
    return head("Screenshots", "Bilder werden automatisch verkleinert (max. 1600 px) und erscheinen als Bereich „Screenshots“ auf der Startseite. Zum Vergrößern kann man sie anklicken.") +
      '<label class="drop" data-drop="images"><input type="file" accept="image/*" multiple hidden><strong>Bilder hierher ziehen</strong><span>oder klicken zum Auswählen · mehrere gleichzeitig möglich</span></label>' +
      (list.length ? '<div class="shots-adm" style="margin-top:1.2rem">' + list.map(function (s, i) {
        return '<div class="panel"><img src="' + esc(window.CJ_ASSET(s.src)) + '" alt="">' +
          '<label class="fld"><span>Bildunterschrift</span><input type="text" value="' + esc(s.caption) + '"' + bindAttrs("screenshots", i, "caption") + ' placeholder="z. B. Das Journal im Spiel"></label>' +
          '<div class="row-actions">' +
          '<button type="button" class="icon-btn" data-act="up" data-list="screenshots" data-id="' + s._id + '"' + (i === 0 ? " disabled" : "") + ">←</button>" +
          '<button type="button" class="icon-btn" data-act="down" data-list="screenshots" data-id="' + s._id + '"' + (i === list.length - 1 ? " disabled" : "") + ">→</button>" +
          '<button type="button" class="icon-btn" data-act="shot-del" data-id="' + s._id + '" title="Löschen">🗑</button></div></div>';
      }).join("") + "</div>" : '<p class="muted" style="margin-top:1rem">Noch keine Screenshots. Solange keine Bilder da sind, wird der Bereich auf der Startseite ausgeblendet.</p>');
  }

  function tabGallery() {
    var list = S.data.gallery;
    return head("Story-Galerie", "Hier pflegst du die Geschichten der Community auf der Seite „Community“. <strong>Eine Geschichte wird nur angezeigt, wenn das Einverständnis des Verfassers angehakt ist</strong> und sie als veröffentlicht markiert ist.") +
      '<div class="btn-row" style="margin-bottom:1rem"><button type="button" class="btn" data-act="g-new">+ Neue Geschichte</button></div>' +
      (list.length ? list.map(function (g, i) {
        var live = g.published !== false && g.consent;
        return '<article class="panel item">' +
          (g.image ? '<img class="thumb-sm" src="' + esc(window.CJ_ASSET(g.image)) + '" alt="">' : '<span class="pill">kein Bild</span>') +
          "<div><h3>" + esc(g.title) + (live ? '<span class="badge-state">sichtbar</span>' : '<span class="badge-state warn">' + (g.consent ? "Entwurf" : "kein Einverständnis") + "</span>") + "</h3>" +
          '<div class="muted">' + esc([g.author ? "von " + g.author : "", g.character, g.levels ? "Level " + g.levels : ""].filter(Boolean).join(" · ")) + "</div>" +
          "<p>" + esc(String(g.text || "").replace(/\s+/g, " ").slice(0, 160)) + (String(g.text || "").length > 160 ? " …" : "") + "</p></div>" +
          '<div class="row-actions">' +
          '<button type="button" class="icon-btn" data-act="up" data-list="gallery" data-id="' + g._id + '"' + (i === 0 ? " disabled" : "") + ">↑</button>" +
          '<button type="button" class="icon-btn" data-act="down" data-list="gallery" data-id="' + g._id + '"' + (i === list.length - 1 ? " disabled" : "") + ">↓</button>" +
          '<button type="button" class="icon-btn" data-act="g-edit" data-id="' + g._id + '" title="Bearbeiten">✎</button>' +
          '<button type="button" class="icon-btn" data-act="g-del" data-id="' + g._id + '" title="Löschen">🗑</button></div></article>';
      }).join("") : '<p class="muted">Noch keine Geschichten. Sobald du eine mit Einverständnis hinzufügst, erscheint sie auf der Community-Seite.</p>');
  }

  function tabLinks() {
    return head("Links & Allgemein", "Leere oder „#“-Links werden auf der Website automatisch als „Bald verfügbar“ angezeigt.") +
      '<section class="panel adm-card"><h3>Allgemein</h3><div class="adm-grid">' +
      inp("@", null, "name", "Name des Addons") + inp("@", null, "tagline", "Leitspruch") + inp("@", null, "currentVersion", "Aktuelle Addon-Version") +
      '</div></section><section class="panel adm-card"><h3>Links</h3><div class="adm-grid">' +
      LINKS.map(function (l) { return inp("links", null, l[0], l[1], { ph: l[2] }); }).join("") + "</div></section>";
  }

  var PV_PAGES = [["index.html", "Startseite"], ["downloads.html", "Downloads"], ["roadmap.html", "Roadmap"], ["timeline.html", "Timeline"], ["community.html", "Community"], ["unterstuetzen.html", "Unterstützen"], ["ki-geschichten.html", "KI-Geschichten"], ["namen-generator.html", "Namen-Generator"]];
  function tabPreview() {
    return head("Vorschau", "So sieht die Website mit deinen aktuellen (noch unveröffentlichten) Änderungen aus.") +
      '<div class="btn-row" style="margin-bottom:1rem"><select id="pv-page" style="max-width:260px">' +
      PV_PAGES.map(function (p) { return '<option value="' + p[0] + '">' + p[1] + "</option>"; }).join("") +
      '</select><button type="button" class="btn small ghost" data-act="reload-preview">↻ Neu laden</button></div>' +
      '<iframe id="pv-frame" class="preview-frame" title="Vorschau" src="index.html?preview=1"></iframe>';
  }

  function tabPublish() {
    var json = ser(), files = pendingFiles(json), dirty = isDirty();
    var rows = files.map(function (p) { return "<tr><td><code>" + esc(p) + "</code></td><td>" + fmtSize(S.files[p].size) + "</td></tr>"; }).join("");
    var c = S.cfg;
    return head("Veröffentlichen", "Speichert alle Änderungen in einem Schritt in euer GitHub-Repository. Danach aktualisiert sich die Website in 1–2 Minuten.") +
      '<section class="panel adm-card"><h3>Das wird veröffentlicht</h3>' +
      "<p>Texte &amp; Struktur (Roadmap, Timeline, Links, Galerie …): " + (dirty ? '<span class="pill">geändert</span>' : '<span class="pill ok">keine Änderung</span>') + "</p>" +
      (files.length ? '<div class="table-wrap"><table><thead><tr><th>Neue Dateien</th><th>Größe</th></tr></thead><tbody>' + rows + "</tbody></table></div>" : '<p class="muted">Keine neuen Dateien.</p>') +
      '<label class="fld" style="margin-top:1rem"><span>Beschreibung der Änderung (optional)</span><input type="text" id="pub-msg" placeholder="z. B. Version 0.2.0 hochgeladen"></label>' +
      '<div class="btn-row"><button type="button" class="btn" data-act="publish"' + (S.publishing ? " disabled" : "") + ">🚀 Jetzt veröffentlichen</button>" +
      '<button type="button" class="btn ghost" data-act="dl-content">content.js herunterladen (Notfall)</button></div>' +
      (S.connected ? '<p class="muted" style="margin-top:.8rem">Ziel: ' + esc(c.owner + "/" + c.repo + " (" + c.branch + ")") + "</p>" :
        '<div class="notice" style="margin-top:1rem">Du bist noch nicht mit GitHub verbunden. <button type="button" class="lnk" data-tab="start">Jetzt verbinden</button></div>') +
      '<div class="log" id="pub-log">' + esc(S.lastResult) + "</div></section>";
  }

  var RENDER = { start: tabStart, downloads: tabDownloads, roadmap: tabRoadmap, timeline: tabTimeline, screenshots: tabScreenshots, gallery: tabGallery, links: tabLinks, preview: tabPreview, publish: tabPublish };

  function render() {
    var nav = $("#adm-nav");
    nav.innerHTML = TABS.map(function (t) {
      var cnt = "";
      if (S.data) {
        if (t[0] === "roadmap") cnt = S.data.roadmap.length;
        if (t[0] === "timeline") cnt = S.data.timeline.length;
        if (t[0] === "screenshots") cnt = S.data.screenshots.length;
        if (t[0] === "gallery") cnt = S.data.gallery.length;
      }
      return '<button type="button" data-tab="' + t[0] + '" class="' + (S.tab === t[0] ? "active" : "") + '"><span aria-hidden="true">' + t[1] + "</span> " + t[2] +
        (cnt !== "" ? '<span class="cnt">' + cnt + "</span>" : "") + "</button>";
    }).join("");
    $("#adm-main").innerHTML = RENDER[S.tab]();
    updateBar();
  }
  function go(tab) { S.tab = tab; render(); window.scrollTo(0, 0); }

  /* ---------- Dialoge ---------- */
  function rmDialog(item, status) {
    var isNew = !item;
    item = item || { status: status || "planned", title: "", text: "", tag: "" };
    dlg(isNew ? "Neuer Roadmap-Eintrag" : "Eintrag bearbeiten",
      dfield("title", "Titel", item.title) + dfield("text", "Beschreibung", item.text, { area: true }) +
      dfield("tag", "Etikett (optional)", item.tag, { ph: "z. B. Addon, Website, Community" }) +
      dfield("status", "Status", item.status, { options: RM_COLS.map(function (c) { return [c[0], c[1]]; }) }),
      "Speichern", function (d) {
        if (!val(d, "title")) return "Bitte einen Titel eingeben.";
        item.title = val(d, "title"); item.text = val(d, "text"); item.tag = val(d, "tag"); item.status = val(d, "status");
        if (isNew) { item._id = uid(); S.data.roadmap.push(item); }
        render(); touch();
      });
  }
  function tlDialog(item) {
    var isNew = !item;
    item = item || { date: monthYear(), state: "done", title: "", text: "" };
    dlg(isNew ? "Neuer Timeline-Eintrag" : "Eintrag bearbeiten",
      dfield("date", "Datum / Zeitraum", item.date, { ph: "z. B. Oktober 2026 oder Bald" }) +
      dfield("title", "Titel", item.title) + dfield("text", "Beschreibung", item.text, { area: true }) +
      dfield("state", "Darstellung", item.state, { options: TL_STATES }),
      "Speichern", function (d) {
        if (!val(d, "title")) return "Bitte einen Titel eingeben.";
        item.date = val(d, "date"); item.title = val(d, "title"); item.text = val(d, "text"); item.state = val(d, "state");
        if (isNew) { item._id = uid(); S.data.timeline.unshift(item); }
        render(); touch();
      });
  }
  function gDialog(item) {
    var isNew = !item;
    item = item || { title: "", author: "", character: "", levels: "", text: "", image: "", consent: false, consentNote: "", published: true };
    var d = dlg(isNew ? "Neue Geschichte" : "Geschichte bearbeiten",
      dfield("title", "Titel", item.title) +
      '<div class="adm-grid">' + dfield("author", "Verfasser / Pseudonym", item.author) + dfield("levels", "Levelabschnitt", item.levels, { ph: "z. B. 1–10" }) + "</div>" +
      dfield("character", "Charakter", item.character, { ph: "z. B. Thorwin, Zwerg, Krieger" }) +
      dfield("text", "Geschichte", item.text, { area: true, big: true, hint: "Absätze mit einer Leerzeile trennen." }) +
      '<label class="drop" data-drop="image1" data-path="' + esc(item.image || "") + '"><input type="file" accept="image/*" hidden>' +
      (item.image ? '<img class="thumb" src="' + esc(window.CJ_ASSET(item.image)) + '" alt="">' : "") +
      "<strong>" + (item.image ? "Bild ersetzen" : "Bild hinzufügen (optional)") + "</strong><span>Datei hierher ziehen oder klicken</span></label>" +
      '<label class="chk"><input type="checkbox" name="consent"' + (item.consent ? " checked" : "") + "><span><strong>Der Verfasser hat der Veröffentlichung auf der Website zugestimmt.</strong><br><span class=\"muted\">Ohne Einverständnis wird die Geschichte nicht angezeigt. Für ein verkauftes PDF oder Buch ist eine gesonderte schriftliche Zustimmung nötig.</span></span></label>" +
      dfield("consentNote", "Notiz zum Einverständnis (optional)", item.consentNote, { ph: "z. B. Discord-Nachricht vom 12.11.2026" }) +
      '<label class="chk"><input type="checkbox" name="published"' + (item.published !== false ? " checked" : "") + "><span>Auf der Website anzeigen</span></label>",
      "Speichern", function (dd) {
        if (!val(dd, "title")) return "Bitte einen Titel eingeben.";
        if (!val(dd, "text")) return "Bitte den Text der Geschichte eingeben.";
        item.title = val(dd, "title"); item.author = val(dd, "author"); item.levels = val(dd, "levels"); item.character = val(dd, "character");
        item.text = dd.querySelector('[name="text"]').value.trim();
        item.image = dd.querySelector('[data-drop="image1"]').dataset.path || "";
        item.consent = val(dd, "consent"); item.consentNote = val(dd, "consentNote"); item.published = val(dd, "published");
        if (isNew) { item._id = uid(); S.data.gallery.unshift(item); }
        render(); touch();
      });
    return d;
  }
  function versionDialog(i, file) {
    var v = S.data.versions[i];
    dlg("Neue Version: " + v.title,
      '<p class="muted">Datei: <strong>' + esc(file.name) + "</strong> (" + fmtSize(file.size) + ")</p>" +
      '<div class="adm-grid">' + dfield("ver", "Versionsnummer", v.status === "soon" ? v.version : bump(v.version)) + dfield("date", "Datum", todayISO(), { type: "date" }) + "</div>" +
      dfield("log", "Was ist neu? (optional)", "", { area: true, ph: "z. B. Quest-Tracking verbessert, Fehler bei Zonenwechsel behoben" }) +
      '<label class="chk"><input type="checkbox" name="tl" checked><span>Automatisch einen Eintrag in der Timeline erstellen</span></label>',
      "Übernehmen", function (d) {
        var ver = val(d, "ver").replace(/^v/i, "");
        if (!ver) return "Bitte eine Versionsnummer eingeben.";
        if (!/^[A-Za-z0-9._-]+$/.test(ver)) return "Die Versionsnummer darf nur Buchstaben, Zahlen, Punkt, Binde- und Unterstrich enthalten.";
        var date = deDate(val(d, "date"));
        if (v.status !== "soon" && isLive(v.url)) v.older.unshift({ v: v.version, url: v.url, date: v.date || "" });
        var path = "downloads/" + v.id + "/CharakterJournal-" + ver + "-" + v.id + ".zip";
        addFile(path, file);
        v.version = ver; v.date = date; v.url = path; v.status = "release";
        if (val(d, "tl")) {
          S.data.timeline.unshift({ _id: uid(), date: monthYear(), state: "done", title: "Version " + ver + " (" + v.title + ")", text: val(d, "log") || "Neue Version veröffentlicht." });
        }
        render(); touch();
        toast("Version " + ver + " für " + v.title + " vorbereitet. Zum Speichern „Veröffentlichen“ klicken.", "ok");
      });
  }

  /* ---------- Dateien verarbeiten ---------- */
  function processImage(file, maxW) {
    return new Promise(function (res, rej) {
      if (!/^image\//.test(file.type)) return rej(new Error("„" + file.name + "“ ist kein Bild."));
      if (/svg|gif/.test(file.type)) return res({ blob: file, ext: /svg/.test(file.type) ? "svg" : "gif" });
      var img = new Image(), u = URL.createObjectURL(file);
      img.onload = function () {
        var s = Math.min(1, maxW / img.width), c = document.createElement("canvas");
        c.width = Math.max(1, Math.round(img.width * s)); c.height = Math.max(1, Math.round(img.height * s));
        var x = c.getContext("2d"); x.fillStyle = "#fff"; x.fillRect(0, 0, c.width, c.height); x.drawImage(img, 0, 0, c.width, c.height);
        c.toBlob(function (b) { URL.revokeObjectURL(u); b ? res({ blob: b, ext: "jpg" }) : rej(new Error("Bild konnte nicht verarbeitet werden.")); }, "image/jpeg", 0.86);
      };
      img.onerror = function () { URL.revokeObjectURL(u); rej(new Error("„" + file.name + "“ konnte nicht gelesen werden.")); };
      img.src = u;
    });
  }
  function imgPath(folder, file, ext, n) {
    return folder + "/" + Date.now() + "-" + (n || 0) + "-" + slug(file.name.replace(/\.[^.]+$/, "")) + "." + ext;
  }

  async function onFiles(zone, files) {
    files = Array.prototype.slice.call(files || []);
    if (!files.length) return;
    var kind = zone.getAttribute("data-drop");
    try {
      if (kind === "zip") {
        var f = files[0];
        if (!/\.zip$/i.test(f.name)) throw new Error("Bitte eine ZIP-Datei verwenden (Endung .zip).");
        if (f.size > MAX_FILE) throw new Error("Die Datei ist größer als 90 MB und lässt sich so nicht hochladen. Nutzt dafür GitHub Releases und tragt den Link unter „Angaben von Hand ändern“ ein.");
        versionDialog(parseInt(zone.getAttribute("data-i"), 10), f);
      } else if (kind === "images") {
        var n = 0;
        for (var k = 0; k < files.length; k++) {
          var r = await processImage(files[k], 1600);
          var p = imgPath("assets/screenshots", files[k], r.ext, k);
          addFile(p, r.blob);
          S.data.screenshots.push({ _id: uid(), src: p, caption: "" });
          n++;
        }
        render(); touch();
        toast(n + " Bild" + (n > 1 ? "er" : "") + " hinzugefügt.", "ok");
      } else if (kind === "image1") {
        var r1 = await processImage(files[0], 1400);
        var p1 = imgPath("assets/stories", files[0], r1.ext, 0);
        addFile(p1, r1.blob);
        zone.dataset.path = p1;
        var im = zone.querySelector("img");
        if (!im) { im = document.createElement("img"); im.className = "thumb"; im.alt = ""; zone.insertBefore(im, zone.firstChild); }
        im.src = window.CJ_ASSET(p1);
        touch();
      }
    } catch (err) { toast(err.message, "err"); }
  }

  /* ---------- GitHub ---------- */
  async function gh(path, opt) {
    opt = opt || {};
    var cfg = S.cfg;
    var res = await fetch("https://api.github.com" + path, {
      method: opt.method || "GET",
      headers: {
        Authorization: "Bearer " + cfg.token, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28",
        "Content-Type": "application/json"
      },
      body: opt.body ? JSON.stringify(opt.body) : undefined
    });
    if (!res.ok) {
      var m = "";
      try { m = (await res.json()).message || ""; } catch (e) {}
      var err = new Error(res.status + (m ? " – " + m : ""));
      err.status = res.status;
      throw err;
    }
    return res.status === 204 ? null : res.json();
  }
  function readCfgForm() {
    var c = S.cfg;
    c.owner = ($("#cf-owner").value || "").trim();
    c.repo = ($("#cf-repo").value || "").trim();
    c.branch = ($("#cf-branch").value || "").trim() || "main";
    c.token = ($("#cf-token").value || "").trim();
    c.remember = $("#cf-remember").checked;
    saveCfg();
  }
  function friendly(err) {
    if (err.status === 401) return "Der Token wurde nicht akzeptiert (abgelaufen oder falsch kopiert). Erstelle bei Bedarf einen neuen.";
    if (err.status === 403) return "Zugriff verweigert. Prüfe, dass der Token die Berechtigung „Contents: Read and write“ hat. (" + err.message + ")";
    if (err.status === 404) return "Repository oder Branch nicht gefunden. Prüfe Benutzername, Repository-Name und Branch; bei Token mit Einschränkung muss das Repository ausgewählt sein.";
    if (err.status === 409 || err.status === 422) return "GitHub meldet einen Konflikt (" + err.message + "). Lade das Dashboard neu, verbinde dich erneut und versuche es noch einmal.";
    return err.message;
  }
  function decodeB64(b) {
    var bin = atob(String(b).replace(/\s/g, ""));
    var bytes = Uint8Array.from(bin, function (ch) { return ch.charCodeAt(0); });
    return new TextDecoder().decode(bytes);
  }
  function parseContent(text) {
    var a = text.indexOf("/*DATA*/"), b = text.lastIndexOf("/*END*/");
    if (a < 0 || b < 0) return null;
    return JSON.parse(text.slice(a + 8, b));
  }
  async function connect() {
    var msg = $("#cf-msg");
    readCfgForm();
    var c = S.cfg;
    if (!c.owner || !c.repo || !c.token) { msg.textContent = "Bitte Benutzername, Repository und Token ausfüllen."; return; }
    msg.textContent = "Verbinde …";
    try {
      var repo = await gh("/repos/" + c.owner + "/" + c.repo);
      if (repo.permissions && !repo.permissions.push) throw Object.assign(new Error("Der Token hat keine Schreibrechte"), { status: 403 });
      S.connected = true;
      var info = "✔ Verbunden mit " + c.owner + "/" + c.repo + ".";
      try {
        var f = await gh("/repos/" + c.owner + "/" + c.repo + "/contents/js/content.js?ref=" + encodeURIComponent(c.branch));
        var remote = parseContent(decodeB64(f.content));
        if (remote && Object.keys(remote).length) {
          if (!isDirty() && !pendingFiles().length) { initData(Object.assign({}, C, remote)); info += " Aktueller Stand aus GitHub geladen."; }
          else info += " Du hast ungespeicherte Änderungen, deshalb wurde der Stand aus GitHub nicht geladen.";
        } else { info += " Noch keine Dashboard-Inhalte im Repository, es gelten die Standardwerte."; }
      } catch (e) {
        if (e.status !== 404) throw e;
        info += " (js/content.js wurde im Repository nicht gefunden. Bitte die komplette Website hochladen.)";
      }
      render(); var m2 = $("#cf-msg"); if (m2) m2.textContent = info;
      toast("Verbunden.", "ok");
    } catch (err) {
      S.connected = false;
      msg.textContent = "✖ " + friendly(err);
    }
  }
  function b64(blob) {
    return new Promise(function (res, rej) {
      var fr = new FileReader();
      fr.onload = function () { res(String(fr.result).split(",")[1]); };
      fr.onerror = function () { rej(new Error("Datei konnte nicht gelesen werden")); };
      fr.readAsDataURL(blob);
    });
  }
  function buildContentJs(json) {
    return "/* Automatisch vom Dashboard (admin.html) erzeugt.\n   Nicht von Hand ändern: Das Dashboard überschreibt diese Datei beim Veröffentlichen. */\n" +
      "window.CJ_CONTENT = /*DATA*/" + json + "/*END*/;\n" +
      "(function(){var c=window.CJ_CONTENT,k;window.CJ=window.CJ||{};for(k in c){if(Object.prototype.hasOwnProperty.call(c,k)){window.CJ[k]=c[k];}}})();\n";
  }
  async function publish() {
    var logEl = $("#pub-log");
    var log = function (m) { S.lastResult += m + "\n"; if ($("#pub-log")) $("#pub-log").textContent = S.lastResult; };
    if (!S.connected) { toast("Bitte zuerst mit GitHub verbinden.", "err"); go("start"); return; }
    if (S.publishing) return;
    var json = ser(), files = pendingFiles(json);
    if (!isDirty() && !files.length) { toast("Es gibt nichts zu veröffentlichen.", ""); return; }
    var userMsg = ($("#pub-msg") && $("#pub-msg").value.trim()) || "";
    S.publishing = true; S.lastResult = ""; render();
    var c = S.cfg, base = "/repos/" + c.owner + "/" + c.repo;
    try {
      log("Verbinde mit GitHub …");
      var ref = await gh(base + "/git/ref/heads/" + encodeURIComponent(c.branch));
      var baseSha = ref.object.sha;
      var commit = await gh(base + "/git/commits/" + baseSha);
      var tree = [];
      log("Lade Inhalte hoch …");
      var bc = await gh(base + "/git/blobs", { method: "POST", body: { content: buildContentJs(json), encoding: "utf-8" } });
      tree.push({ path: "js/content.js", mode: "100644", type: "blob", sha: bc.sha });
      for (var i = 0; i < files.length; i++) {
        log("Lade hoch (" + (i + 1) + "/" + files.length + "): " + files[i]);
        var bf = await gh(base + "/git/blobs", { method: "POST", body: { content: await b64(S.files[files[i]].blob), encoding: "base64" } });
        tree.push({ path: files[i], mode: "100644", type: "blob", sha: bf.sha });
      }
      log("Erstelle Version …");
      var t = await gh(base + "/git/trees", { method: "POST", body: { base_tree: commit.tree.sha, tree: tree } });
      var nc = await gh(base + "/git/commits", { method: "POST", body: { message: "Dashboard: " + (userMsg || "Inhalte aktualisiert") + (files.length ? " (" + files.length + " Datei" + (files.length > 1 ? "en" : "") + ")" : ""), tree: t.sha, parents: [baseSha] } });
      await gh(base + "/git/refs/heads/" + encodeURIComponent(c.branch), { method: "PATCH", body: { sha: nc.sha } });
      files.forEach(function (p) { S.files[p].published = true; });
      S.snapshot = json;
      log("\n✔ Veröffentlicht! GitHub baut die Seite jetzt neu. Das dauert ca. 1–2 Minuten. Danach ggf. mit Strg + F5 neu laden.");
      toast("Veröffentlicht! In 1–2 Minuten ist die Website aktuell.", "ok");
    } catch (err) {
      log("\n✖ Fehler: " + friendly(err));
      toast("Veröffentlichen fehlgeschlagen.", "err");
    }
    S.publishing = false;
    render();
    if ($("#pub-log")) $("#pub-log").textContent = S.lastResult;
  }

  /* ---------- Ereignisse ---------- */
  function move(listName, id, dir) {
    var list = S.data[listName], idx = -1;
    for (var i = 0; i < list.length; i++) if (list[i]._id === id) idx = i;
    var to = idx + dir;
    if (idx < 0 || to < 0 || to >= list.length) return;
    var it = list.splice(idx, 1)[0];
    list.splice(to, 0, it);
  }
  function remove(listName, id) {
    var list = S.data[listName];
    for (var i = 0; i < list.length; i++) if (list[i]._id === id) { list.splice(i, 1); return; }
  }

  document.addEventListener("click", function (e) {
    var tabBtn = e.target.closest && e.target.closest("[data-tab]");
    if (tabBtn) { go(tabBtn.getAttribute("data-tab")); return; }
    var b = e.target.closest && e.target.closest("[data-act]");
    if (!b) return;
    var a = b.getAttribute("data-act"), id = b.getAttribute("data-id");
    switch (a) {
      case "goto-publish": go("publish"); break;
      case "connect": connect(); break;
      case "forget-token":
        S.cfg.token = ""; S.connected = false; saveCfg(); render();
        toast("Token auf diesem Gerät gelöscht.", "ok"); break;
      case "reload-preview": reloadPreview(); break;
      case "publish": publish(); break;
      case "dl-content": {
        var blob = new Blob([buildContentJs(ser())], { type: "text/javascript" });
        var link = document.createElement("a");
        link.href = URL.createObjectURL(blob); link.download = "content.js"; link.click();
        break;
      }
      case "rm-new": rmDialog(null, b.getAttribute("data-st")); break;
      case "rm-edit": rmDialog(byId(S.data.roadmap, id)); break;
      case "rm-del":
        if (confirm("Diesen Roadmap-Eintrag löschen?")) { remove("roadmap", id); render(); touch(); } break;
      case "tl-new": tlDialog(null); break;
      case "tl-edit": tlDialog(byId(S.data.timeline, id)); break;
      case "tl-del":
        if (confirm("Diesen Timeline-Eintrag löschen?")) { remove("timeline", id); render(); touch(); } break;
      case "shot-del":
        if (confirm("Dieses Bild entfernen?")) { remove("screenshots", id); render(); touch(); } break;
      case "g-new": gDialog(null); break;
      case "g-edit": gDialog(byId(S.data.gallery, id)); break;
      case "g-del":
        if (confirm("Diese Geschichte löschen?")) { remove("gallery", id); render(); touch(); } break;
      case "up": move(b.getAttribute("data-list"), id, -1); render(); touch(); break;
      case "down": move(b.getAttribute("data-list"), id, 1); render(); touch(); break;
      case "del-older": {
        var v = S.data.versions[parseInt(b.getAttribute("data-i"), 10)];
        v.older.splice(parseInt(b.getAttribute("data-j"), 10), 1);
        render(); touch(); break;
      }
    }
  });

  document.addEventListener("input", function (e) {
    var t = e.target;
    if (!t.dataset || !t.dataset.b) return;
    var tg = getTarget(t.dataset.b, t.dataset.i == null ? null : parseInt(t.dataset.i, 10));
    tg[t.dataset.f] = t.type === "checkbox" ? t.checked : t.value;
    touch();
  });
  document.addEventListener("change", function (e) {
    var t = e.target;
    if (t.id === "pv-page") { var f = $("#pv-frame"); if (f) f.src = t.value + "?preview=1"; return; }
    if (t.type === "file" && t.closest(".drop")) { onFiles(t.closest(".drop"), t.files); t.value = ""; return; }
    if (t.dataset && t.dataset.b && t.tagName === "SELECT") {
      var tg = getTarget(t.dataset.b, t.dataset.i == null ? null : parseInt(t.dataset.i, 10));
      tg[t.dataset.f] = t.value; touch(); render();
    }
  });

  /* Drag & Drop: Dateien */
  function hasFiles(e) { return e.dataTransfer && Array.prototype.indexOf.call(e.dataTransfer.types || [], "Files") >= 0; }
  window.addEventListener("dragover", function (e) {
    if (!hasFiles(e)) return;
    e.preventDefault();
    var z = e.target.closest && e.target.closest(".drop");
    document.querySelectorAll(".drop.over").forEach(function (x) { if (x !== z) x.classList.remove("over"); });
    if (z) z.classList.add("over");
  });
  window.addEventListener("dragleave", function (e) {
    var z = e.target.closest && e.target.closest(".drop");
    if (z && !z.contains(e.relatedTarget)) z.classList.remove("over");
  });
  window.addEventListener("drop", function (e) {
    if (!hasFiles(e)) return;
    e.preventDefault();
    var z = e.target.closest && e.target.closest(".drop");
    document.querySelectorAll(".drop.over").forEach(function (x) { x.classList.remove("over"); });
    if (z) onFiles(z, e.dataTransfer.files);
  });

  /* Drag & Drop: Roadmap-Karten */
  var dragId = null;
  document.addEventListener("dragstart", function (e) {
    var c = e.target.closest && e.target.closest(".kb-card");
    if (!c) return;
    dragId = c.getAttribute("data-id");
    c.classList.add("dragging");
    try { e.dataTransfer.setData("text/plain", dragId); e.dataTransfer.effectAllowed = "move"; } catch (x) {}
  });
  document.addEventListener("dragend", function () {
    dragId = null;
    document.querySelectorAll(".dragging,.kb-col.over").forEach(function (x) { x.classList.remove("dragging", "over"); });
  });
  document.addEventListener("dragover", function (e) {
    if (!dragId) return;
    var col = e.target.closest && e.target.closest(".kb-col");
    if (!col) return;
    e.preventDefault();
    document.querySelectorAll(".kb-col.over").forEach(function (x) { if (x !== col) x.classList.remove("over"); });
    col.classList.add("over");
  });
  document.addEventListener("drop", function (e) {
    if (!dragId) return;
    var col = e.target.closest && e.target.closest(".kb-col");
    if (!col) return;
    e.preventDefault();
    var item = byId(S.data.roadmap, dragId);
    if (!item) return;
    var targetCard = e.target.closest(".kb-card");
    var targetId = targetCard ? targetCard.getAttribute("data-id") : null;
    remove("roadmap", dragId);
    item.status = col.getAttribute("data-col");
    var idx = S.data.roadmap.length;
    if (targetId && targetId !== dragId) {
      for (var i = 0; i < S.data.roadmap.length; i++) if (S.data.roadmap[i]._id === targetId) idx = i;
    }
    S.data.roadmap.splice(idx, 0, item);
    dragId = null;
    render(); touch();
  });

  /* ---------- Start ---------- */
  initData(C);
  S.tab = "start";
  render();
})();
