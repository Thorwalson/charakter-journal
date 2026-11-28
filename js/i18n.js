/* ==========================================================
   Charakter Journal – Mehrsprachigkeit (i18n)
   ----------------------------------------------------------
   Deutsch ist die "Quellsprache": alle Texte stehen direkt im
   HTML. Für weitere Sprachen bekommt das zu übersetzende Element
   ein data-i18n="schluessel"-Attribut; die Übersetzung selbst
   steht in js/i18n-data.js (window.CJ_TRANSLATIONS.en = {...}).
   Für Attribute (placeholder, title, …) gibt es
   data-i18n-attr="attribut:schluessel;attribut2:schluessel2".

   Neue Sprache hinzufügen:
     1. In LANGS unten einen Eintrag ergänzen (Code, Flagge, Name).
     2. In js/i18n-data.js einen neuen Block window.CJ_TRANSLATIONS.xx = {...}
        anlegen (am einfachsten die komplette "en"-Sektion kopieren
        und übersetzen).
   Mehr ist nicht nötig – Dropdown, Speichern und Umschalten passiert
   automatisch.
   ========================================================== */
window.CJ_I18N = (function () {
  "use strict";

  var LANGS = [
    { code: "de", flag: "🇩🇪", label: "Deutsch" },
    { code: "en", flag: "🇬🇧", label: "English" }
  ];
  var STORE_KEY = "cj_lang";
  var SOURCE_LANG = "de"; // Sprache, in der die Texte direkt im HTML stehen

  function supported(code) {
    return LANGS.some(function (l) { return l.code === code; });
  }

  function detectDefault() {
    try {
      var saved = localStorage.getItem(STORE_KEY);
      if (saved && supported(saved)) return saved;
    } catch (e) {}
    try {
      var nav = String(navigator.language || navigator.userLanguage || "").toLowerCase().slice(0, 2);
      if (nav && supported(nav)) return nav;
    } catch (e) {}
    return SOURCE_LANG;
  }

  var current = detectDefault();

  function lang() { return current; }

  function dict(code) {
    var all = window.CJ_TRANSLATIONS || {};
    return all[code || current] || {};
  }

  /* Übersetzung für einen beliebigen Schlüssel holen (z. B. für dynamisch
     per JS erzeugte Texte, nicht nur data-i18n im HTML). */
  function t(key, fallback) {
    if (current === SOURCE_LANG) return fallback != null ? fallback : key;
    var d = dict();
    return Object.prototype.hasOwnProperty.call(d, key) ? d[key] : (fallback != null ? fallback : key);
  }

  /* Für Datensätze aus config.js: liefert item.i18n[lang][field], sonst
     item[field]. Beispiel: tr(versionEintrag, "title"). */
  function tr(item, field) {
    if (!item) return undefined;
    if (current !== SOURCE_LANG && item.i18n && item.i18n[current] && item.i18n[current][field] != null) {
      return item.i18n[current][field];
    }
    return item[field];
  }

  function applyAttrs(root, toSource) {
    var els = root.querySelectorAll("[data-i18n-attr]");
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      var spec = el.getAttribute("data-i18n-attr") || "";
      spec.split(";").forEach(function (pair) {
        var parts = pair.split(":");
        if (parts.length < 2) return;
        var attr = parts[0].trim(), key = parts[1].trim();
        if (!attr || !key) return;
        var origKey = "data-i18n-orig-" + attr;
        if (!el.hasAttribute(origKey)) el.setAttribute(origKey, el.getAttribute(attr) || "");
        if (toSource) {
          el.setAttribute(attr, el.getAttribute(origKey) || "");
        } else {
          var d = dict();
          if (Object.prototype.hasOwnProperty.call(d, key)) el.setAttribute(attr, d[key]);
        }
      });
    }
  }

  function apply(root) {
    root = root || document;
    var toSource = current === SOURCE_LANG;
    var els = root.querySelectorAll("[data-i18n]");
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      if (!el.hasAttribute("data-i18n-orig")) el.setAttribute("data-i18n-orig", el.innerHTML);
      if (toSource) {
        el.innerHTML = el.getAttribute("data-i18n-orig");
      } else {
        var key = el.getAttribute("data-i18n");
        var d = dict();
        if (Object.prototype.hasOwnProperty.call(d, key)) el.innerHTML = d[key];
      }
    }
    applyAttrs(root, toSource);
  }

  function setLang(code) {
    if (!supported(code) || code === current) return;
    current = code;
    try { localStorage.setItem(STORE_KEY, code); } catch (e) {}
    try { document.documentElement.lang = code; } catch (e) {}
    apply();
    try { document.dispatchEvent(new CustomEvent("cj:langchange", { detail: { lang: code } })); } catch (e) {}
  }

  try { document.documentElement.lang = current; } catch (e) {}

  return { LANGS: LANGS, SOURCE_LANG: SOURCE_LANG, lang: lang, setLang: setLang, t: t, tr: tr, apply: apply };
})();
