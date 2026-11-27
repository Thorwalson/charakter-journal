/* ==========================================================
   Charakter Journal – Kommentare & Chroniken von Azeroth
   ----------------------------------------------------------
   Spricht direkt mit Supabase (siehe js/config.js → supabase).
   Ohne eingetragene Supabase-Zugangsdaten zeigt dieses Skript
   überall nur einen Hinweis "noch nicht eingerichtet" an, statt
   Fehler zu werfen – die Seiten bleiben also auch ohne Supabase
   benutzbar.
   ========================================================== */
(function () {
  "use strict";
  var C = window.CJ || {};
  var SB = C.supabase || {};
  var READY = !!(SB.url && SB.anonKey);

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function fmtDate(iso) {
    try {
      var d = new Date(iso);
      return d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" }) +
        " " + d.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
    } catch (e) { return ""; }
  }
  function isEmail(s) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s || "").trim()); }
  function visitorId() {
    try {
      var k = "cj_visitor";
      var v = localStorage.getItem(k);
      if (!v) { v = "v" + Date.now().toString(36) + Math.random().toString(36).slice(2, 10); localStorage.setItem(k, v); }
      return v;
    } catch (e) { return "anon"; }
  }

  /* ---------- Supabase REST (PostgREST + Storage) ---------- */
  function sb(path, opts) {
    opts = opts || {};
    var headers = {
      "apikey": SB.anonKey,
      "Authorization": "Bearer " + SB.anonKey,
      "Content-Type": "application/json"
    };
    if (opts.prefer) headers["Prefer"] = opts.prefer;
    return fetch(SB.url.replace(/\/+$/, "") + path, {
      method: opts.method || "GET",
      headers: headers,
      body: opts.body ? JSON.stringify(opts.body) : undefined
    }).then(function (res) {
      if (!res.ok) return res.text().then(function (t) { throw new Error(t || res.statusText); });
      var ct = res.headers.get("content-type") || "";
      return ct.indexOf("json") > -1 ? res.json() : res.text();
    });
  }
  function sbUpload(bucket, path, file) {
    return fetch(SB.url.replace(/\/+$/, "") + "/storage/v1/object/" + bucket + "/" + path, {
      method: "POST",
      headers: { "apikey": SB.anonKey, "Authorization": "Bearer " + SB.anonKey, "Content-Type": file.type || "application/octet-stream" },
      body: file
    }).then(function (res) {
      if (!res.ok) return res.text().then(function (t) { throw new Error(t || res.statusText); });
      return SB.url.replace(/\/+$/, "") + "/storage/v1/object/public/" + bucket + "/" + path;
    });
  }

  function notConfigured(host, what) {
    host.innerHTML = '<div class="panel center"><div style="font-size:2rem" aria-hidden="true">🛠️</div>' +
      "<h3>" + esc(what) + " ist noch nicht eingerichtet</h3>" +
      '<p class="muted" style="max-width:520px;margin-inline:auto">Dafür wird eine kostenlose Supabase-Datenbank angebunden. Siehe <code>supabase/schema.sql</code> und <code>js/config.js</code> (Bereich „Kommentare &amp; Chroniken“).</p></div>';
  }

  /* ---------- Captcha (Cloudflare Turnstile) ---------- */
  var turnstileLoading = null;
  function ensureTurnstile() {
    if (!C.turnstileSiteKey) return Promise.resolve(false);
    if (window.turnstile) return Promise.resolve(true);
    if (turnstileLoading) return turnstileLoading;
    turnstileLoading = new Promise(function (resolve) {
      var s = document.createElement("script");
      s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
      s.async = true; s.defer = true;
      s.onload = function () { resolve(true); };
      s.onerror = function () { resolve(false); };
      document.head.appendChild(s);
    });
    return turnstileLoading;
  }
  function renderCaptcha(host) {
    if (!C.turnstileSiteKey) { host.innerHTML = ""; return Promise.resolve(null); }
    host.innerHTML = '<div class="cf-turnstile" data-theme="dark" data-sitekey="' + esc(C.turnstileSiteKey) + '"></div>';
    return ensureTurnstile().then(function (ok) {
      if (ok && window.turnstile) window.turnstile.render(host.firstChild);
      return host;
    });
  }
  function captchaToken(host) {
    try {
      var el = host.querySelector("textarea[name='cf-turnstile-response']");
      return el ? el.value : "";
    } catch (e) { return ""; }
  }

  /* ================= Kommentare (community.html) ================= */
  function initComments() {
    wireCommentForm(document.getElementById("cj-comment-form"));
    var host = document.getElementById("cj-comments");
    if (!host) return;
    if (!READY) { notConfigured(host, "Die Kommentarspalte"); return; }
    host.innerHTML = '<div class="muted center" style="padding:1.2rem">Kommentare werden geladen …</div>';
    loadAndRenderComments(host);
  }

  function loadAndRenderComments(host) {
    sb("/rest/v1/comments_public?select=*&order=created_at.asc").then(function (rows) {
      renderComments(host, rows || []);
    }).catch(function (err) {
      host.innerHTML = '<p class="notice">Kommentare konnten nicht geladen werden (' + esc(err.message || "Fehler") + ").</p>";
    });
  }

  function renderComments(host, rows) {
    var byParent = {};
    rows.forEach(function (r) {
      var k = r.parent_id || "root";
      (byParent[k] = byParent[k] || []).push(r);
    });
    var roots = byParent.root || [];
    if (!roots.length) {
      host.innerHTML = '<p class="muted center" style="padding:1.2rem">Noch keine Kommentare. Sei der/die Erste!</p>';
      return;
    }
    function card(c, isReply) {
      var replies = byParent[c.id] || [];
      return '<article class="comment' + (c.highlighted ? " is-highlighted" : "") + (isReply ? " is-reply" : "") + '" data-id="' + c.id + '">' +
        (c.highlighted ? '<span class="comment-pin" title="Von der Redaktion hervorgehoben">📌 Hervorgehoben</span>' : "") +
        '<div class="comment-head"><strong>' + esc(c.name) + "</strong><time>" + esc(fmtDate(c.created_at)) + "</time></div>" +
        '<p class="comment-text">' + esc(c.message).replace(/\n/g, "<br>") + "</p>" +
        '<div class="comment-actions">' +
          '<button type="button" class="cjlike" data-id="' + c.id + '">👍 <span>' + (c.likes || 0) + "</span></button>" +
          (isReply ? "" : '<button type="button" class="cjreply" data-id="' + c.id + '" data-name="' + esc(c.name) + '">Antworten</button>') +
        "</div>" +
        (replies.length ? '<div class="comment-replies">' + replies.map(function (r) { return card(r, true); }).join("") + "</div>" : "") +
        "</article>";
    }
    host.innerHTML = roots.map(function (c) { return card(c, false); }).join("");

    host.querySelectorAll(".cjlike").forEach(function (btn) {
      btn.addEventListener("click", function () { likeComment(btn); });
    });
    host.querySelectorAll(".cjreply").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var form = document.getElementById("cj-comment-form");
        if (!form) return;
        form.querySelector("[name='parent_id']").value = btn.getAttribute("data-id");
        var hint = form.querySelector(".cj-reply-hint");
        if (hint) { hint.hidden = false; hint.querySelector("span").textContent = btn.getAttribute("data-name"); }
        form.scrollIntoView({ behavior: "smooth", block: "center" });
        form.querySelector("textarea[name='message']").focus();
      });
    });
    var cancelBtn = document.querySelector(".cj-reply-cancel");
    if (cancelBtn) cancelBtn.addEventListener("click", function () {
      var form = document.getElementById("cj-comment-form");
      form.querySelector("[name='parent_id']").value = "";
      form.querySelector(".cj-reply-hint").hidden = true;
    });
  }

  function likeComment(btn) {
    if (btn.disabled) return;
    btn.disabled = true;
    sb("/rest/v1/comment_likes", { method: "POST", body: { comment_id: btn.getAttribute("data-id"), visitor: visitorId() } })
      .then(function () {
        var span = btn.querySelector("span");
        span.textContent = String((parseInt(span.textContent, 10) || 0) + 1);
        btn.classList.add("is-liked");
      })
      .catch(function () { btn.disabled = false; });
  }

  function wireCommentForm(form) {
    if (!form) return;
    var capHost = form.querySelector(".cj-captcha");
    if (capHost) renderCaptcha(capHost);
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = form.querySelector("[name='name']").value.trim();
      var email = form.querySelector("[name='email']").value.trim();
      var message = form.querySelector("[name='message']").value.trim();
      var parent = form.querySelector("[name='parent_id']").value || null;
      var status = form.querySelector(".cj-form-status");
      if (!name || !email || !message) { status.textContent = "Bitte Name, E-Mail und Text ausfüllen."; return; }
      if (!isEmail(email)) { status.textContent = "Bitte eine gültige E-Mail-Adresse eingeben."; return; }
      if (C.turnstileSiteKey && !captchaToken(capHost)) { status.textContent = "Bitte das Captcha lösen."; return; }
      if (!READY) { status.textContent = "Kommentare sind noch nicht eingerichtet (Supabase fehlt in js/config.js)."; return; }
      status.textContent = "Wird gesendet …";
      sb("/rest/v1/comments", {
        method: "POST",
        body: { name: name, email: email, message: message, parent_id: parent }
      }).then(function () {
        status.textContent = "Danke! Dein Kommentar ist online.";
        form.reset();
        form.querySelector(".cj-reply-hint").hidden = true;
        if (window.turnstile && capHost) window.turnstile.reset();
        loadAndRenderComments(document.getElementById("cj-comments"));
      }).catch(function (err) {
        status.textContent = "Senden fehlgeschlagen: " + (err.message || "unbekannter Fehler");
      });
    });
  }

  /* ================= Chroniken von Azeroth (chroniken.html) ================= */
  var chroniclesCache = [];

  function initChronicles() {
    buildStyleFilter();
    wireSubmissionForm(document.getElementById("cj-chron-form"));

    var host = document.getElementById("cj-chronicles");
    if (!host) return;
    if (!READY) { notConfigured(host, "Die Chroniken-Bibliothek"); return; }

    var search = document.getElementById("cj-chron-search");
    var filter = document.getElementById("cj-chron-filter");
    if (search) search.addEventListener("input", renderChronicleGrid);
    if (filter) filter.addEventListener("change", renderChronicleGrid);

    host.innerHTML = '<div class="muted center" style="padding:1.2rem">Chroniken werden geladen …</div>';
    sb("/rest/v1/chronicles_public?select=*&order=featured.desc,created_at.desc").then(function (rows) {
      chroniclesCache = rows || [];
      renderChronicleGrid();
    }).catch(function (err) {
      host.innerHTML = '<p class="notice">Chroniken konnten nicht geladen werden (' + esc(err.message || "Fehler") + ").</p>";
    });
  }

  function buildStyleFilter() {
    var sel = document.getElementById("cj-chron-filter");
    if (!sel || sel.options.length > 1) return;
    (C.writingStyles || []).forEach(function (s) {
      var o = document.createElement("option"); o.value = s; o.textContent = s; sel.appendChild(o);
    });
  }

  function renderChronicleGrid() {
    var host = document.getElementById("cj-chronicles");
    if (!host) return;
    var q = (document.getElementById("cj-chron-search") || {}).value || "";
    q = q.trim().toLowerCase();
    var style = (document.getElementById("cj-chron-filter") || {}).value || "";
    var list = chroniclesCache.filter(function (c) {
      if (style && c.writing_style !== style) return false;
      if (!q) return true;
      var hay = (c.title + " " + c.author + " " + c.character_name + " " + (c.summary || "")).toLowerCase();
      return hay.indexOf(q) > -1;
    });
    if (!list.length) {
      host.innerHTML = '<div class="panel center" style="grid-column:1/-1"><div style="font-size:2.2rem" aria-hidden="true">📖</div><h3>Keine Chroniken gefunden</h3><p class="muted">Andere Suche oder Filter versuchen – oder die erste Chronik einreichen!</p></div>';
      return;
    }
    host.innerHTML = list.map(function (c) {
      var cover = c.cover_path ? '<img src="' + esc(c.cover_path) + '" alt="Buchcover: ' + esc(c.title) + '" loading="lazy">' :
        '<div class="chron-cover-fallback" aria-hidden="true">📘</div>';
      return '<article class="chron-card" data-id="' + c.id + '">' +
        '<div class="chron-cover">' + cover + (c.has_audio ? '<span class="chron-audio-badge" title="Mit Hörprobe">🔊</span>' : "") + "</div>" +
        '<div class="chron-body">' +
          "<h3>" + esc(c.title) + "</h3>" +
          '<div class="chron-meta">von <strong>' + esc(c.author) + "</strong> · " + esc(c.character_name) + "</div>" +
          '<span class="chron-style">' + esc(c.writing_style) + "</span>" +
          (c.summary ? '<p class="chron-summary">' + esc(c.summary) + "</p>" : "") +
          '<div class="chron-actions">' +
            (c.book_path ? '<a class="btn small" href="' + esc(c.book_path) + '" target="_blank" rel="noopener">📖 Lesen</a><a class="btn small ghost" href="' + esc(c.book_path) + '" download>⬇ Download</a>' : "") +
          "</div>" +
          '<div class="chron-vote">' +
            '<button type="button" class="cjvote up" data-id="' + c.id + '" data-v="1">👍 <span>' + (c.upvotes || 0) + "</span></button>" +
            '<button type="button" class="cjvote down" data-id="' + c.id + '" data-v="-1">👎 <span>' + (c.downvotes || 0) + "</span></button>" +
          "</div>" +
        "</div>" +
      "</article>";
    }).join("");

    host.querySelectorAll(".cjvote").forEach(function (btn) {
      btn.addEventListener("click", function () { voteChronicle(btn); });
    });
  }

  function voteChronicle(btn) {
    if (btn.disabled) return;
    var card = btn.closest(".chron-card");
    card.querySelectorAll(".cjvote").forEach(function (b) { b.disabled = true; });
    var id = btn.getAttribute("data-id"), v = parseInt(btn.getAttribute("data-v"), 10);
    sb("/rest/v1/chronicle_votes", {
      method: "POST",
      prefer: "resolution=merge-duplicates",
      body: { chronicle_id: id, visitor: visitorId(), value: v }
    }).then(function () {
      var span = btn.querySelector("span");
      span.textContent = String((parseInt(span.textContent, 10) || 0) + 1);
      btn.classList.add("is-voted");
    }).catch(function () {}).then(function () {
      card.querySelectorAll(".cjvote").forEach(function (b) { b.disabled = false; });
    });
  }

  function wireSubmissionForm(form) {
    if (!form) return;
    buildStyleFilter();
    var styleSel = form.querySelector("[name='writing_style']");
    if (styleSel && !styleSel.options.length) {
      (C.writingStyles || []).forEach(function (s) {
        var o = document.createElement("option"); o.value = s; o.textContent = s; styleSel.appendChild(o);
      });
    }
    var capHost = form.querySelector(".cj-captcha");
    if (capHost) renderCaptcha(capHost);

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var status = form.querySelector(".cj-form-status");
      var title = form.querySelector("[name='title']").value.trim();
      var author = form.querySelector("[name='author']").value.trim();
      var character = form.querySelector("[name='character_name']").value.trim();
      var style = form.querySelector("[name='writing_style']").value;
      var summary = form.querySelector("[name='summary']").value.trim();
      var email = form.querySelector("[name='submitter_email']").value.trim();
      var bookFile = form.querySelector("[name='book_file']").files[0];
      var coverFile = form.querySelector("[name='cover_file']").files[0];
      if (!title || !author || !character || !email || !bookFile) {
        status.textContent = "Bitte Titel, Pseudonym, Charaktername, E-Mail und die HTML-Buchdatei angeben."; return;
      }
      if (!isEmail(email)) { status.textContent = "Bitte eine gültige E-Mail-Adresse eingeben."; return; }
      if (C.turnstileSiteKey && !captchaToken(capHost)) { status.textContent = "Bitte das Captcha lösen."; return; }
      if (!READY) { status.textContent = "Einreichungen sind noch nicht eingerichtet (Supabase fehlt in js/config.js)."; return; }
      status.textContent = "Wird hochgeladen …";
      var stamp = Date.now().toString(36);
      var hasAudio = /aud-/.test("");
      bookFile.text().then(function (txt) { hasAudio = /<audio[\s>]/.test(txt); return null; }).catch(function () {}).then(function () {
        var tasks = [sbUpload("chronicles", stamp + "-buch.html", bookFile)];
        tasks.push(coverFile ? sbUpload("chronicles", stamp + "-cover" + (coverFile.name.match(/\.\w+$/) || [""])[0], coverFile) : Promise.resolve(""));
        return Promise.all(tasks);
      }).then(function (urls) {
        return sb("/rest/v1/chronicles", {
          method: "POST",
          body: {
            title: title, author: author, character_name: character, writing_style: style,
            summary: summary, submitter_email: email, book_path: urls[0], cover_path: urls[1] || "",
            has_audio: hasAudio
          }
        });
      }).then(function () {
        status.textContent = "Danke! Deine Chronik wird geprüft und erscheint nach Freigabe in der Bibliothek.";
        form.reset();
        if (window.turnstile && capHost) window.turnstile.reset();
      }).catch(function (err) {
        status.textContent = "Einsenden fehlgeschlagen: " + (err.message || "unbekannter Fehler");
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initComments();
    initChronicles();
  });
})();
