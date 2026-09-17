/* =========================================================================
 * WorldEd — application (SPA router + views). ES5-style globals on window.S
 * so inline handlers can call them (file:// compatible, no bundler).
 * ========================================================================= */

"use strict";

(function () {
  var S = window.S = {};

  /* ------------------------------- helpers ------------------------------- */

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        if (k === "html") node.innerHTML = attrs[k];
        else if (k === "text") node.textContent = attrs[k];
        else if (k === "cls") node.className = attrs[k];
        else if (k === "on") Object.keys(attrs[k]).forEach(function (e) { node.addEventListener(e, attrs[k][e]); });
        else if (attrs[k] !== false && attrs[k] !== null && attrs[k] !== undefined) node.setAttribute(k, attrs[k]);
      });
    }
    if (children !== undefined && children !== null) {
      (Array.isArray(children) ? children : [children]).forEach(function (c) {
        if (c === null || c === undefined) return;
        node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
      });
    }
    return node;
  }

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function esc(s) {
    return String(s === undefined || s === null ? "" : s).replace(/[&<>"']/g, function (m) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m];
    });
  }

  function titleCase(s) {
    return String(s || "").replace(/\b\w/g, function (c) { return c.toUpperCase(); });
  }

  function relativeTime(iso) {
    var days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
    if (days <= 0) return "today";
    if (days === 1) return "yesterday";
    if (days < 7) return days + "d ago";
    if (days < 30) return Math.floor(days / 7) + "w ago";
    if (days < 365) return Math.floor(days / 30) + "mo ago";
    return Math.floor(days / 365) + "y ago";
  }

  function go(hash) {
    if (location.hash === hash || ("#" + hash) === location.hash) route();
    else location.hash = hash;
  }

  function scrollTop() { window.scrollTo(0, 0); }

  function parseRoute() {
    var h = (location.hash || "#/").replace(/^#/, "");
    var qIdx = h.indexOf("?"), path = h, query = {};
    if (qIdx !== -1) {
      path = h.slice(0, qIdx);
      h.slice(qIdx + 1).split("&").forEach(function (kv) {
        var i = kv.indexOf("=");
        if (i > 0) query[decodeURIComponent(kv.slice(0, i))] = decodeURIComponent(kv.slice(i + 1));
      });
    }
    var segs = path.split("/").filter(Boolean).map(function (s) { try { return decodeURIComponent(s); } catch (e) { return s; } });
    return { path: segs, query: query };
  }

  /* --------------------------------- icons -------------------------------- */

  var ICONS = {
    search: '<path d="m21 21-4.3-4.3"/><path d="M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14z"/>',
    map: '<path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3z"/><path d="M9 3v15"/><path d="M15 6v15"/>',
    globe: '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',
    university: '<path d="M12 3 2 8l10 5 10-5-10-5z"/><path d="M6 10v7a6 6 0 0 0 12 0v-7"/><path d="M2 20h20"/>',
    building: '<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01M16 6h.01M12 6h.01M8 10h.01M16 10h.01M12 10h.01M8 14h.01M16 14h.01M12 14h.01"/>',
    pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
    star: '<path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z"/>',
    cal: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    left: '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
    right: '<path d="m12 5 7 7-7 7"/><path d="M5 12h14"/>',
    external: '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
    alert: '<path d="m21.7 18-8-14a2 2 0 0 0-3.5 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.7-3z"/><path d="M12 9v4M12 17h.01"/>',
    flag: '<path d="M4 22V4c0-1 3-2 6-2s6 1 6 2-3 2-6 2-6 1-6 2"/><path d="M16 4c0 1-3 2-6 2s-6 1-6 2"/>',
    filter: '<path d="M22 3H2l8 9.5V19l4 2v-8.5z"/>',
    close: '<path d="M18 6 6 18M6 6l12 12"/>',
    chev: '<path d="m9 18 6-6-6-6"/>',
    book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
    video: '<rect x="2" y="5" width="14" height="14" rx="2"/><path d="m16 10.5 6-3v9l-6-3"/>',
    plus: '<path d="M5 12h14M12 5v14"/>',
    shield: '<path d="M20 13c0 5-3.5 7.5-7.7 9a.6.6 0 0 1-.6 0C7.5 20.5 4 18 4 13V6c0-.6.4-1 1-1 2 0 4.5-1 7-3 2.5 2 5 3 7 3 .6 0 1 .4 1 1z"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>',
    layers: '<path d="m12 2 10 6-10 6L2 8z"/><path d="m2 14 10 6 10-6"/><path d="m2 20 10 6 10-6"/>',
    play: '<path d="m6 3 14 9-14 9z"/>'
  };

  function I(name, size) {
    var p = ICONS[name] || ICONS.info;
    var sz = size || 16;
    return "<svg xmlns='http://www.w3.org/2000/svg' width='" + sz + "' height='" + sz + "' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'>" + p + "</svg>";
  }

  S.el = el; S.$ = $; S.$$ = $$; S.esc = esc; S.titleCase = titleCase; S.relativeTime = relativeTime; S.go = go; S.I = I;

  /* ------------------------------- theme ---------------------------------- */

  S.theme = {
    init: function () {
      var btn = $("#theme-toggle");
      if (!btn) return;
      var sync = function () {
        var dark = document.documentElement.classList.contains("dark");
        $("#icon-sun").classList.toggle("hidden", dark);
        $("#icon-moon").classList.toggle("hidden", !dark);
      };
      btn.addEventListener("click", function () {
        var dark = document.documentElement.classList.toggle("dark");
        try { localStorage.setItem("worlded.theme", dark ? "dark" : "light"); } catch (e) {}
        sync();
      });
      sync();
    }
  };

  /* ------------------------- shared search combobox ----------------------- */

  function attachSearch(input, dd, onPick, onEnterCustom) {
    var items = [], activeIdx = -1, timer = null, query = "";
    dd.classList.add("dropdown");

    function render() {
      if (!items.length) { dd.classList.remove("flex"); dd.classList.add("hidden"); return; }
      dd.classList.remove("hidden"); dd.classList.add("flex");
      dd.innerHTML = "";
      items.forEach(function (it, idx) {
        var row = el("div", {
          cls: "dropdown-option",
          role: "option",
          "aria-selected": idx === activeIdx ? "true" : "false",
          on: {
            click: function () { pick(idx); },
            mouseenter: function () { activeIdx = idx; rerenderActive(); }
          }
        });
        row.innerHTML = comboRow(it);
        dd.appendChild(row);
      });
    }

    function rerenderActive() {
      $$(".dropdown-option", dd).forEach(function (n, i) {
        n.setAttribute("aria-selected", i === activeIdx ? "true" : "false");
        if (i === activeIdx) n.scrollIntoView({ block: "nearest" });
      });
    }

    function comboRow(it) {
      var icon = it.kind === "uni" ? "university" : it.kind === "country" ? "globe" : "building";
      return "<span style='color:hsl(var(--muted-foreground))'>" + I(icon, 15) + "</span><span class='flex-1 min-w-0'><span class='block truncate'>" + esc(it.label) + "</span><span class='block text-xs text-muted-foreground truncate'>" + esc(it.sub || "") + "</span></span>";
    }

    function pick(idx) {
      if (!items[idx]) return;
      var it = items[idx];
      var val = input.value;
      input.blur();
      close();
      if (onPick) onPick(it, val);
    }

    function close() {
      open = false;
      dd.classList.add("hidden"); dd.classList.remove("flex");
      dd.innerHTML = "";
    }

    function runSuggest() {
      try {
        items = window.searchEngine ? searchEngine.suggest(query) : [];
      } catch (e) { items = []; }
      activeIdx = items.length ? 0 : -1;
      render();
    }

    input.addEventListener("input", function () {
      query = input.value.trim();
      clearTimeout(timer);
      if (query.length < 2) { items = []; close(); return; }
      timer = setTimeout(runSuggest, 90);
    });

    input.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown") { e.preventDefault(); activeIdx = Math.min(activeIdx + 1, items.length - 1); rerenderActive(); }
      else if (e.key === "ArrowUp") { e.preventDefault(); activeIdx = Math.max(activeIdx - 1, 0); rerenderActive(); }
      else if (e.key === "Enter") {
        e.preventDefault();
        if (items.length && activeIdx > -1) pick(activeIdx);
        else if (onEnterCustom) { onEnterCustom(input.value); close(); }
      }
      else if (e.key === "Escape") close();
    });

    input.addEventListener("focus", function () {
      if (items.length) open = true;
    });

    function outside(e) {
      if (input.contains(e.target) || dd.contains(e.target)) return;
      close();
    }
    document.addEventListener("click", outside);
  }

  /* ------------------------------ background ------------------------------- */

  S.bg = {
    slides: [],
    layers: [],
    timer: null,
    idx: 0,
    init: function (holder, slides) {
      if (!holder) return;
      this.slides = slides && slides.length ? slides : ["linear-gradient(135deg,#312e81,#0ea5e9)", "linear-gradient(135deg,#be185d,#f59e0b)", "linear-gradient(135deg,#065f46,#22d3ee)"];
      holder.innerHTML = "";
      this.layers = [];
      for (var i = 0; i < 2; i++) {
        var l = el("div", { cls: "bg-layer" + (i === 0 ? " active" : "") });
        l.style.background = this.slides[0];
        holder.appendChild(l);
        this.layers.push(l);
      }
      this.idx = 0;
      var self = this;
      if (this.timer) clearInterval(this.timer);
      this.timer = setInterval(function () { self.next(); }, 5500);
    },
    next: function () {
      this.idx = (this.idx + 1) % this.slides.length;
      var fadingIn = this.layers[this.idx % 2];
      var fadingOut = this.layers[1 - (this.idx % 2)];
      fadingIn.style.background = this.slides[this.idx];
      fadingOut.classList.remove("active");
      fadingIn.classList.add("active");
    }
  };

  /* ------------------------------ navigation ------------------------------- */

  S.state = { filters: {}, currentQuery: null };
  S._maps = [];
  S.killMaps = function () {
    S._maps.forEach(function (m) { if (m && m.remove) { try { m.remove(); } catch (e) {} } });
    S._maps = [];
  };

  function route() {
    var r = parseRoute();
    var app = $("#app");
    var path0 = r.path[0] || "";
    var topWrap = $("#top-search-wrap");
    if (topWrap) topWrap.classList.toggle("hidden", path0 === "");
    try {
      S.killMaps();
      if (path0 === "" || path0 === "home") renderHome(app, r);
      else if (path0 === "r") renderResults(app, r);
      else if (path0 === "uni") renderProfile(app, r);
      else if (path0 === "loc") renderGeo(app, r);
      else if (path0 === "map") renderMap(app, r);
      else if (path0 === "explore") renderExplore(app, r);
      else if (path0 === "discover") renderDiscover(app, r);
      else if (path0 === "admin") renderAdmin(app, r);
      else renderNotFound(app);
      scrollTop();
    } catch (err) {
      app.innerHTML = "";
      app.appendChild(errorCard("Renderer error", err && err.message ? err.message : String(err)));
    }
  }

  function errorCard(title, msg) {
    return el("div", { cls: "max-w-xl mx-auto p-8" }, [
      el("div", { cls: "card p-6 text-center" }, [
        el("h2", { cls: "text-xl font-semibold mb-2" }, title),
        el("p", { cls: "text-sm text-muted-foreground" }, msg)
      ])
    ]);
  }

  S._route = route;

  window.addEventListener("hashchange", route);

  function init() {
    S.theme.init();
    S.bg.boot = true;
    /* top search combobox */
    var topIn = $("#top-search"), topDd = $("#top-dropdown");
    if (topIn) attachSearch(topIn, topDd, function (it) {
      if (it.kind === "uni") go("/uni/" + it.id);
      else if (it.kind === "country") go("/loc/country/" + encodeURIComponent(it.iso));
      else if (it.kind === "city") go("/loc/city/" + encodeURIComponent(it.city) + "/" + it.country);
    }, function (v) { if (v.trim()) go("/r?q=" + encodeURIComponent(v.trim())); });
    route();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
/* --------------------------- shared small views -------------------------- */

  function flagOf(iso) {
    var c = COUNTRY_BY_ISO[iso];
    return (c && c.flag) || "🌐";
  }

  function countryName(iso) {
    var c = COUNTRY_BY_ISO[iso];
    return (c && c.name) || iso;
  }

  function typeBadges(inst) {
    return (inst.types || []).map(function (t) {
      return el("span", { cls: "badge badge-type", text: titleCase(t) });
    });
  }

  function fieldChips(inst, max) {
    max = max || 4;
    return (inst.fields || []).slice(0, max).map(function (f) {
      return el("span", { cls: "filter-chip", text: titleCase(f.replace(/-/g, " ")) });
    });
  }

  function instCard(inst) {
    var conf = typeof mockApi.confidenceFor === "function" ? mockApi.confidenceFor(inst) : { level: "High", factors: [] };
    var country = flagOf(inst.country);
    return el("div", { cls: "card card-hover result-card rise", on: { click: function () { go("/uni/" + inst.id); } } }, [
      el("img", { cls: "result-logo", src: mockApi.initialThumb(inst.name), alt: inst.name }),
      el("div", { cls: "flex-1 min-w-0" }, [
        el("div", { cls: "flex items-center gap-2 flex-wrap" }, [
          el("h3", { cls: "font-semibold text-base" }, inst.name),
          el("span", { cls: "badge", text: inst.short || "—" }),
          el("span", { cls: "badge " + (conf.level === "High" ? "badge-verified" : conf.level === "Low" ? "badge-pending" : "badge-academic"), text: (inst.discovered ? "Discovering…" : "Confidence " + conf.level) })
        ]),
        el("p", { cls: "text-sm text-muted-foreground mt-0.5" }, country + "  " + inst.city + (inst.region ? ", " + inst.region : "")),
        el("p", { cls: "text-sm mt-1 line-clamp-2" }, inst.desc || ""),
        el("div", { cls: "flex gap-1.5 flex-wrap items-center mt-2" }, typeBadges(inst)),
        el("div", { cls: "flex gap-1 flex-wrap items-center mt-1" }, fieldChips(inst))
      ]),
      el("span", { cls: "self-center hidden sm:block", style: "color:hsl(var(--muted-foreground))", html: I("right", 18) })
    ]);
  }

  function placeCard(p, kind) {
    return el("div", { cls: "card card-hover result-card rise", on: { click: function () {
      if (kind === "city") go("/loc/city/" + encodeURIComponent(p.name) + "/" + p.country);
      else go("/loc/country/" + p.iso);
    } } }, [
      el("span", { cls: "result-logo", html: I(kind === "city" ? "building" : "globe", 22) }),
      el("div", { cls: "flex-1 min-w-0" }, [
        el("h3", { cls: "font-semibold text-base" }, (kind === "city" ? flagOf(p.country) + " " : "") + esc(p.name)),
        el("p", { cls: "text-sm text-muted-foreground" }, kind === "city" ? (countryName(p.country) + " · " + p.count + " institutions") : (p.continent + " · " + countForCountry(p.iso) + " institutions"))
      ]),
      el("span", { cls: "self-center", style: "color:hsl(var(--muted-foreground))", html: I("right", 18) })
    ]);
  }

  function countForCountry(iso) {
    return INSTITUTIONS.filter(function (i) { return i.country === iso; }).length;
  }

  /* ----------------------------- pipeline anim ----------------------------- */

  function runPipeline(panel, layers, cb) {
    var steps = layers.map(function (l) {
      var n = el("div", { cls: "progress-step active" }, [
        el("span", { cls: "mark", text: "…" }),
        el("span", { text: l.label })
      ]);
      return n;
    });
    panel.innerHTML = "";
    panel.appendChild(el("div", { cls: "flex items-center justify-between mb-1" }, [
      el("h3", { cls: "text-sm font-semibold" }, "Research pipeline"),
      el("span", { cls: "badge badge-ai", text: "layers" })
    ]));
    var ul = el("div", {});
    steps.forEach(function (n) { ul.appendChild(n); });
    panel.appendChild(ul);
    var i = 0;
    (function tick() {
      if (i > 0) steps[i - 1].classList.remove("active"), steps[i - 1].classList.add("done"), steps[i - 1].querySelector(".mark").textContent = "✓";
      if (i === steps.length) { if (cb) cb(); return; }
      steps[i].classList.add("active");
      i++;
      setTimeout(tick, 130);
    })();
  }

  /* -------------------------------- rendering ------------------------------ */

  function renderHome(app, r) {
    void r;
    if (S.bg.timer) clearInterval(S.bg.timer);
    app.innerHTML = "";
    var holder = el("div", { cls: "bg-stage", "aria-hidden": "true" });
    var hero = el("div", { cls: "hero" }, holder);
    S.bg.init(holder, DEMO_PHOTOS);

    var content = el("div", { cls: "hero-content rise" });
    content.appendChild(el("div", { cls: "flex justify-center gap-2 mb-5 flex-wrap", html: Object.keys(SOURCE_META).slice(0, 6).map(function (k) { return "<span class='badge " + SOURCE_META[k].cls + "'>" + esc(SOURCE_META[k].label) + "</span>"; }).join("") + "" }));
    content.appendChild(el("h1", { cls: "text-3xl sm:text-5xl font-extrabold tracking-tight text-white drop-shadow", text: "Find any university or institution" }));
    content.appendChild(el("p", { cls: "mt-3 text-white/90 text-base sm:text-lg", text: "Universities, colleges, academies, medical schools and research institutes — with transparent sources, confidence and honest labels." }));

    var card = el("div", { cls: "search-card mt-6" });
    var wrap = el("div", { cls: "search-field" });
    var input = el("input", { cls: "input", type: "text", placeholder: "Try “MIT”, “medical university Kazakhstan” or “ 東京大学”…", autocomplete: "off", spellcheck: "false", "aria-label": "Search institutions" });
    var dd = el("div", { cls: "hidden", role: "listbox" });
    wrap.appendChild(input); wrap.appendChild(dd);
    attachSearch(input, dd, function (it) {
      if (it.kind === "uni") go("/uni/" + it.id);
      else if (it.kind === "country") go("/loc/country/" + it.iso);
      else if (it.kind === "city") go("/loc/city/" + encodeURIComponent(it.city) + "/" + it.country);
    }, function (v) { if (v.trim()) go("/r?q=" + encodeURIComponent(v.trim())); });
    card.appendChild(wrap);

    var chips = [
      "MIT", "东京大学", "MSU", "medical university Kazakhstan", "universities near Almaty", "universities in Oral", "Duke"
    ];
    var chipRow = el("div", { cls: "flex flex-wrap gap-2 justify-center mt-3" });
    chips.forEach(function (c) {
      chipRow.appendChild(el("button", { cls: "filter-chip bg-white/10 text-white border-white/20", type: "button", text: c, on: { click: function () { go("/r?q=" + encodeURIComponent(c)); } } }));
    });
    card.appendChild(chipRow);
    content.appendChild(card);

    content.appendChild(el("div", { cls: "mt-6 flex justify-center gap-3 flex-wrap text-white/90" }, [
      el("a", { cls: "btn btn-outline text-white border-white/30 hover:bg-white/10", href: "#/map", html: I("map", 16) + " World map" }),
      el("a", { cls: "btn btn-outline text-white border-white/30 hover:bg-white/10", href: "#/explore", html: I("globe", 16) + " World explorer" })
    ]));

    hero.appendChild(content);
    var overlay = el("div", { cls: "bg-overlay" });
    hero.appendChild(overlay);
    app.appendChild(hero);
  }

  /* -------------------------------- results -------------------------------- */

  function renderResults(app, r) {
    var q = (r.query.q || "").trim();
    var view = el("div", { cls: "view" });
    app.innerHTML = "";
    app.appendChild(view);
    if (!q) {
      view.appendChild(el("div", { cls: "card p-8 text-center" }, [
        el("h2", { cls: "text-lg font-semibold" }, "Enter a search query"),
        el("p", { cls: "text-sm text-muted-foreground mt-1" }, "Try “MIT”, “medical university Kazakhstan” or “universities in Oral”.")
      ]));
      return;
    }

    var res;
    try { res = searchEngine.search(q); S.state.lastResult = res; } catch (e) {
      view.appendChild(errorCard("Search failed", e.message));
      return;
    }

    var meta = el("div", { cls: "rise" });
    meta.appendChild(el("div", { cls: "flex items-center gap-2 flex-wrap" }, [
      el("span", { cls: "badge", text: "Query" }),
      el("strong", { text: q })
    ]));
    meta.appendChild(el("p", { cls: "text-sm text-muted-foreground mt-1" }, esc(res.intent && res.intent.label ? res.intent.label : "")));

    var panelWrap = el("div", { cls: "progress-panel" });
    var resultsBox = el("div", { cls: "hidden" });

    view.appendChild(meta);
    view.appendChild(panelWrap);
    view.appendChild(resultsBox);

    function done() {
      resultsBox.classList.remove("hidden");
      buildResults(resultsBox, res, q);
      panelWrap.classList.add("rise");
    }
    runPipeline(panelWrap, res.steps ? res.steps : SEARCH_LAYERS, done);
  }

  function buildResults(box, res, q) {
    box.innerHTML = "";
    var total = (res.institutions || []).length;
    var stats = el("p", { cls: "text-sm text-muted-foreground mb-3", html: esc(total) + " institutions · " + esc(res.cities.length) + " cities · " + esc(res.countries.length) + " countries matched" });
    box.appendChild(stats);

    /* ambiguity ------------------------------------------------ */
    if (res.ambiguous && res.ambiguous.length > 1) {
      var amb = el("div", { cls: "mb-4" });
      amb.appendChild(el("div", { cls: "conflict-box mb-3 flex items-start gap-2", html: I("alert", 16) + "<div><strong>“" + esc(q) + "” is ambiguous</strong> — multiple institutions share this abbreviation. Choose one:</div>" }));
      var grid = el("div", { cls: "grid-cards" });
      res.ambiguous.forEach(function (i) { grid.appendChild(instCard(i)); });
      amb.appendChild(grid);
      box.appendChild(amb);
    }

    /* locations (geo intent, or no institutions) --------------- */
    if ((res.cities.length || res.countries.length) && (!total || res.intent.type === "geo")) {
      var geoBox = el("div", { cls: "mb-4" });
      geoBox.appendChild(el("h2", { cls: "section-title" }, "Places"));
      var g = el("div", { cls: "grid-cards" });
      res.countries.forEach(function (c) { g.appendChild(placeCard(c, "country")); });
      res.cities.forEach(function (c) { g.appendChild(placeCard(c, "city")); });
      geoBox.appendChild(g);
      box.appendChild(geoBox);
    }

    /* discovered pending --------------------------------------- */
    if (res.discovered && res.discovered.length) {
      res.discovered.forEach(function (d) { box.appendChild(discoveredCard(d, q)); });
    }

/* institution list ------------------------------------------ */
    if (total) {
      var listWrap = el("div", { cls: "mt-2" });
      try {
        listWrap.appendChild(el("h2", { cls: "section-title" }, "Institutions"));
        listWrap.appendChild(filterBar(listWrap));
        var grid = el("div", { id: "w-instr-grid", cls: "grid gap-3" });
        listWrap.appendChild(grid);
        renderList(grid);
      } catch (err) {
        listWrap.appendChild(el("div", { cls: "card p-5 text-sm", text: "List error: " + (err && err.message ? err.message : String(err)) + " → " + (err && err.stack ? err.stack.split("\n")[1] || "" : "") }));
      }
      box.appendChild(listWrap);
    }

    if (!total && !res.discovered.length && !res.cities.length && !res.countries.length && !(res.ambiguous && res.ambiguous.length)) {
      box.appendChild(el("div", { cls: "card p-6 mt-2" }, [
        el("h2", { cls: "font-semibold" }, "No verified match yet"),
        el("p", { cls: "text-sm text-muted-foreground mt-1" }, "This query didn't match a verified institution. It may be a new institution — use the discovery flow to propose it, then an admin can mark it verified."),
        el("button", { cls: "btn btn-primary mt-3", type: "button", text: "Propose as new institution", on: { click: function () { go("/discover?q=" + encodeURIComponent(q)); } } })
      ]));
    }
  }

  function filterBar(listWrap) {
    var all = res_institutions();
    var f = S.state.filters = S.state.filters || {};
    var types = ["university", "institute", "college", "medical", "research", "academy", "school", "polytechnic"];
    var fields = ["medicine", "engineering", "computer-science", "science", "business", "law", "arts", "economics"];
    var bar = el("div", { cls: "flex flex-wrap items-center gap-2 mb-3" });

    function chip(label, key, val) {
      var on = f[key] === val;
      var b = el("button", { cls: "filter-chip", type: "button", text: titleCase(label), "aria-pressed": on ? "true" : "false", on: { click: function () {
        f[key] = f[key] === val ? "" : val;
        renderList($("#w-instr-grid"));
        b.setAttribute("aria-pressed", f[key] === val ? "true" : "false");
      } } });
      return b;
    }

    bar.appendChild(el("span", { cls: "text-xs font-semibold text-muted-foreground uppercase tracking-wide", text: "Type" }));
    types.forEach(function (t) { bar.appendChild(chip(t, "type", t)); });
    bar.appendChild(el("span", { cls: "text-xs font-semibold text-muted-foreground uppercase tracking-wide ml-2", text: "Field" }));
    fields.forEach(function (t) { bar.appendChild(chip(t.replace(/-/g, " "), "field", t)); });
    bar.appendChild(el("span", { cls: "text-xs font-semibold text-muted-foreground uppercase tracking-wide ml-2", text: "Sort" }));
    var sortSel = el("select", { cls: "input !w-auto text-sm", on: { change: function () { f.sort = sortSel.value; renderList($("#w-instr-grid")); } } });
    [["rel", "Relevance"], ["az", "Name A–Z"], ["founded", "Oldest first"]].forEach(function (o) {
      var opt = el("option", { value: o[0], text: o[1] });
      if (f.sort === o[0]) opt.setAttribute("selected", "selected");
      sortSel.appendChild(opt);
    });
    bar.appendChild(sortSel);
    return bar;
  }

  function res_institutions() {
    return (S.state.lastResult && S.state.lastResult.institutions) || [];
  }

  function renderList(grid) {
    try {
      renderListInner(grid);
    } catch (err) {
      grid.innerHTML = "";
      grid.appendChild(el("div", { cls: "card p-5 text-sm", text: "List error: " + (err && err.message ? err.message : String(err)) + " → " + (err && err.stack ? err.stack.split("\n")[1] || "" : "") }));
    }
  }

  function renderListInner(grid) {
    var f = S.state.filters || {};
    var list = res_institutions().slice();
    if (f.type) list = list.filter(function (i) { return i.types.indexOf(f.type) !== -1; });
    if (f.field) list = list.filter(function (i) { return i.fields.indexOf(f.field) !== -1; });
    if (f.sort === "az") list.sort(function (a, b) { return a.name < b.name ? -1 : 1; });
    else if (f.sort === "founded") list.sort(function (a, b) { return (a.founded || 0) - (b.founded || 0); });
    else list.sort(function (a, b) { return (b._score || 0) - (a._score || 0); });
    grid.innerHTML = "";
    if (!list.length) {
      grid.appendChild(el("div", { cls: "card p-6 text-sm text-muted-foreground" }, "No institutions match the active filters."));
      return;
    }
    list.forEach(function (i) { grid.appendChild(instCard(i)); });
  }

  function discoveredCard(d, q) {
    var c = el("div", { cls: "card p-6 mt-2 rise" });
    c.appendChild(el("div", { cls: "flex items-center gap-2 flex-wrap" }, [
      el("span", { cls: "badge badge-pending", html: I("flag", 12) + " Discovered" }),
      el("span", { cls: "badge", text: "Verification pending" })
    ]));
    c.appendChild(el("h2", { cls: "font-semibold text-lg mt-2" }, esc(d.name)));
    c.appendChild(el("p", { cls: "text-sm text-muted-foreground mt-1" }, esc(d.desc)));
    c.appendChild(el("p", { cls: "text-xs text-muted-foreground mt-2" }, "Proposed from query: " + esc(q || d.aliases[0]) + ". This is a simulated discovery — no real claims are made."));
    c.appendChild(el("div", { cls: "flex gap-2 mt-3" }, [
      el("a", { cls: "btn btn-primary", href: "#/discover" }, "Open discovery queue"),
      el("a", { cls: "btn btn-outline", href: "#/admin" }, "Admin panel")
    ]));
    return c;
  }

  /* ------------------------------ discover view ----------------------------- */

  function renderDiscover(app, r) {
    void r;
    var view = el("div", { cls: "view" });
    app.innerHTML = "";
    app.appendChild(view);
    view.appendChild(el("h1", { cls: "text-2xl font-bold", text: "New institution discovery" }));
    view.appendChild(el("p", { cls: "text-sm text-muted-foreground mt-1" }, "Candidates not yet present in the verified catalogue. They stay “Verification pending” until confirmed via official or government sources — following the platform's transparency rules."));
    var items = mockApi.pending();
    if (!items.length) {
      view.appendChild(el("div", { cls: "card p-6 mt-4 text-sm text-muted-foreground" }, "No pending candidates. Search for something that doesn't match, e.g. “small engineering institute in Kazakhstan”, to create one."));
      return;
    }
    var grid = el("div", { cls: "grid gap-3 mt-4" });
    items.forEach(function (d) {
      var card = el("div", { cls: "card p-4" });
      var st = d.status === "approved" ? "verified" : d.status === "rejected" ? "badge-pending" : "badge-pending";
      var stT = d.status === "approved" ? "Approved & verified" : d.status === "rejected" ? "Rejected" : "Verification pending";
      card.appendChild(el("div", { cls: "flex items-center gap-2 flex-wrap" }, [
        el("span", { cls: "badge " + st, text: stT }),
        el("span", { cls: "badge badge-type", text: (d.types || []).join(", ") })
      ]));
      card.appendChild(el("h3", { cls: "font-semibold mt-2" }, esc(d.name)));
      card.appendChild(el("p", { cls: "text-xs text-muted-foreground mt-1" }, "Proposed " + (d.discoveredAt || d.date) + " · " + (countryName(d.country)) + " · query: “" + esc(d.aliases && d.aliases[0] || "") + "”"));
      card.appendChild(el("div", { cls: "flex gap-2 mt-3" }, [
        el("button", { cls: "btn btn-sm btn-outline", type: "button", text: "Details", on: { click: function () { go("/uni/" + d.id); } } }),
        el("a", { cls: "btn btn-sm btn-outline", href: "#/admin" }, "Moderate")
      ]));
      grid.appendChild(card);
    });
    view.appendChild(grid);
  }

  function renderNotFound(app) {
    var view = el("div", { cls: "view" });
    view.appendChild(el("div", { cls: "card p-8 text-center" }, [
      el("h2", { cls: "text-lg font-semibold" }, "Page not found"),
      el("p", { cls: "text-sm text-muted-foreground mt-1" }, "That address doesn't exist in this demo."),
      el("a", { cls: "btn btn-primary mt-4 inline-flex", href: "#/" }, "Go home")
    ]));
    app.innerHTML = "";
    app.appendChild(view);
  }
/* ------------------------------- modal / toast ---------------------------- */

  function toast(msg) {
    var t = el("div", { cls: "card px-4 py-3 text-sm", style: "position:fixed;bottom:1rem;right:1rem;z-index:200;box-shadow:0 14px 40px -12px rgba(0,0,0,.5)", text: msg });
    document.body.appendChild(t);
    setTimeout(function () { t.remove(); }, 3600);
  }

  function openModal(title, bodyNode) {
    var backdrop = el("div", { cls: "modal-backdrop" });
    var modal = el("div", { cls: "modal" });
    var head = el("div", { cls: "flex items-center justify-between mb-3" });
    head.appendChild(el("h2", { cls: "text-lg font-semibold", text: title }));
    var closeBtn = el("button", { cls: "btn btn-ghost btn-icon", type: "button", html: I("close", 18), "aria-label": "Close" });
    head.appendChild(closeBtn);
    modal.appendChild(head);
    modal.appendChild(bodyNode);
    backdrop.appendChild(modal);
    function close() { backdrop.remove(); document.removeEventListener("keydown", onKey); }
    function onKey(e) { if (e.key === "Escape") close(); }
    closeBtn.addEventListener("click", close);
    backdrop.addEventListener("click", function (e) { if (e.target === backdrop) close(); });
    document.addEventListener("keydown", onKey);
    document.body.appendChild(backdrop);
    return close;
  }

  function stars(n) {
    return "★★★★★".slice(0, n) + "☆☆☆☆☆".slice(0, 5 - n);
  }

  /* -------------------------------- profile -------------------------------- */

  function renderProfile(app, r) {
    var id = r.path[1] || "";
    var inst = mockApi.institution(id);
    var pendingCmd = { cmd: null };
    if (!inst) {
      var pends = mockApi.pending().filter(function (p) { return p.id === id; });
      if (pends.length) { inst = pends[0]; pendingCmd.cmd = "pending"; }
    }
    if (!inst) { renderNotFound(app); return; }

    var view = el("div", { cls: "view" });
    app.innerHTML = "";
    app.appendChild(view);
    view.appendChild(el("a", { cls: "text-sm text-muted-foreground inline-flex items-center gap-1 mb-3", href: "#/", html: I("left", 14) + " Back to search" }));

    /* hero card */
    var hero = el("div", { cls: "card p-5 rise" });
    var conf = mockApi.confidenceFor(inst);
    var row1 = el("div", { cls: "flex flex-wrap gap-4 items-start" });
    row1.appendChild(el("img", { cls: "result-logo", src: mockApi.initialThumb(inst.name), alt: inst.name, style: "width:4rem;height:4rem;font-size:1.6rem" }));
    var idTxt = el("div", { cls: "flex-1 min-w-0" });
    idTxt.appendChild(el("div", { cls: "flex items-center gap-2 flex-wrap" }, [
      el("h1", { cls: "text-2xl font-bold tracking-tight", text: inst.name }),
      el("span", { cls: "badge", text: inst.short || "" }),
      inst.discovered ? el("span", { cls: "badge badge-pending", html: I("flag", 12) + " Verification pending" }) : null
    ]));
    idTxt.appendChild(el("p", { cls: "text-sm text-muted-foreground mt-1" }, flagOf(inst.country) + "  " + inst.city + (inst.region ? ", " + inst.region : "") + " · " + countryName(inst.country)));
    idTxt.appendChild(el("div", { cls: "flex gap-1.5 flex-wrap mt-2" }, typeBadges(inst)));
    row1.appendChild(idTxt);

    var confBadge = el("div", { cls: "text-right" });
    confBadge.appendChild(el("span", { cls: "badge " + (conf.level === "High" ? "badge-verified" : conf.level === "Low" ? "badge-pending" : "badge-academic"), text: "Confidence " + conf.level }));
    confBadge.appendChild(el("span", { cls: "confidence-foot block mt-1", text: "Qualitative — why, see below" }));
    row1.appendChild(confBadge);
    hero.appendChild(row1);

    var actions = el("div", { cls: "flex gap-2 flex-wrap mt-4" });
    if (inst.website) {
      actions.appendChild(el("a", { cls: "btn btn-primary btn-sm", href: inst.website, target: "_blank", rel: "noopener", html: I("external", 14) + " Official website" }));
    }
    actions.appendChild(el("button", { cls: "btn btn-outline btn-sm", type: "button", html: I("alert", 14) + " Report an issue", on: { click: function () { reportModal(inst); } } }));
    actions.appendChild(el("button", { cls: "btn btn-ghost btn-sm", type: "button", text: "Where on the map ↓", on: { click: function () { var m = $("#w-map"); if (m) m.scrollIntoView({ behavior: "smooth", block: "center" }); } } }));
    hero.appendChild(actions);
    if (inst.discovered) {
      hero.appendChild(el("p", { cls: "confidence-foot mt-3", text: "This is a discovery candidate (simulated). It is NOT verified — source cross-checks and administrator approval are required before it can be marked as a verified institution." }));
    }
    view.appendChild(hero);

    var cols = el("div", { cls: "grid lg:grid-cols-2 gap-5 mt-5 items-start" });
    var left = el("div", {}), right = el("div", {});

    /* facts */
    var factsCard = el("div", { cls: "card p-5" });
    factsCard.appendChild(el("h2", { cls: "section-title !mt-0", text: "Facts" }));
    var table = el("table", { cls: "facts-table" });
    var cn = COUNTRY_BY_ISO[inst.country];
    function factRow(label, val) {
      var tr = el("tr", {});
      tr.appendChild(el("td", { text: label }));
      tr.appendChild(el("td", {}, val === null || val === undefined || val === "" ? el("em", { cls: "text-muted-foreground", text: "pending verification" }) : val));
      table.appendChild(tr);
    }
    factRow("Founded", inst.founded ? (inst.founded + (inst.foundedSrc ? "  ·  " + esc(inst.foundedSrc) : "")) : null);
    factRow("Institution type", titleCase((inst.types || []).join(", ")));
    factRow("Country", (cn ? cn.flag + " " : "") + countryName(inst.country));
    factRow("City / Region", inst.city + (inst.region ? " / " + inst.region : ""));
    factRow("Address", inst.address);
    factRow("Fields of study", titleCase((inst.fields || []).join(", ")));
    factRow("Programs", (inst.programs || []).slice(0, 6).join(" · ") + ((inst.programs || []).length > 6 ? " …" : ""));
    factRow("Accreditation", (inst.accr || []).join(", "));
    if (inst.ext && inst.ext.wikidata) {
      var wd = el("a", { cls: "source-link", href: "https://www.wikidata.org/wiki/" + inst.ext.wikidata, target: "_blank", rel: "noopener", text: "Wikidata id " + inst.ext.wikidata });
      factRow("External identifiers", wd);
    }
    factsCard.appendChild(table);
    if (inst.website) factRowParent(factsCard, "Website", el("a", { cls: "source-link", href: inst.website, target: "_blank", rel: "noopener", html: esc(inst.website.replace(/^https?:\/\//, "")) + " " + I("external", 12) }));
    left.appendChild(factsCard);

    function factRowParent(parent, label, val) {
      var tr = el("tr", {});
      tr.appendChild(el("td", { text: label }));
      tr.appendChild(el("td", {}, val));
      table.appendChild(tr);
      void parent;
    }

    /* conflicts */
    if (inst.conflicts && inst.conflicts.length) {
      var cf = el("div", { cls: "card p-5 mt-5" });
      cf.appendChild(el("h2", { cls: "section-title !mt-0", text: "Conflicting information" }));
      inst.conflicts.forEach(function (c) {
        var box = el("div", { cls: "conflict-box mb-3" });
        box.appendChild(el("div", { cls: "flex items-center gap-2 mb-1", html: I("alert", 14) + "<strong>" + esc(c.fact) + "</strong>" }));
        box.appendChild(el("small", { cls: "text-muted-foreground", text: "Sources disagree. Both claims are shown rather than silently choosing one." }));
        [["a", c.a], ["b", c.b]].forEach(function (pair) {
          box.appendChild(el("p", { cls: "text-sm mt-1", html: "<strong>" + esc(pair[1].v) + "</strong> — " + esc(pair[1].s) }));
          void pair[0];
        });
        cf.appendChild(box);
      });
      left.appendChild(cf);
    }

    /* confidence explainer */
    var confCard = el("div", { cls: "card p-5 mt-5" });
    confCard.appendChild(el("h2", { cls: "section-title !mt-0", text: "Why this confidence?" }));
    var ul = el("ul", { cls: "list-disc pl-5 text-sm space-y-1" });
    conf.factors.forEach(function (f) { ul.appendChild(el("li", { text: f })); });
    confCard.appendChild(ul);
    confCard.appendChild(el("p", { cls: "confidence-foot mt-2", text: "Confidence is a qualitative explanation derived from visible factors — never an invented percentage." }));
    left.appendChild(confCard);

    /* sources */
    var srcCard = el("div", { cls: "card p-5 mt-5" });
    srcCard.appendChild(el("h2", { cls: "section-title !mt-0", text: "Sources" }));
    var srcList = el("div", { cls: "space-y-2" });
    mockApi.sourcesFor(inst).forEach(function (s) {
      var row = el("div", { cls: "flex items-center justify-between gap-3 flex-wrap" });
      var a = el("a", { cls: "source-link", href: s.url, target: "_blank", rel: "noopener", html: esc(s.label) + " " + I("external", 12) });
      row.appendChild(a);
      row.appendChild(el("span", { cls: "badge " + s.cls, text: s.type }));
      srcList.appendChild(row);
    });
    srcCard.appendChild(srcList);
    srcCard.appendChild(el("p", { cls: "confidence-foot mt-3", text: "Source types: " + Object.keys(SOURCE_META).map(function (k) { return SOURCE_META[k].label; }).join(", ") + ". In production each record keeps a stable URL, captured at index time." }));
    left.appendChild(srcCard);
    view.appendChild(left);

    /* map */
    var mapCard = el("div", { cls: "card p-3" });
    mapCard.appendChild(el("h2", { cls: "text-sm font-semibold mb-2", text: "Location" }));
    var mw = el("div", { cls: "map-wrap", style: "height:16rem" });
    var mp = el("div", { id: "w-map", cls: "map" });
    mw.appendChild(mp);
    mapCard.appendChild(mw);
    right.appendChild(mapCard);
    setTimeout(function () { leafletMap(mp, [inst], 13); }, 0);

    /* photos */
    var photoCard = el("div", { cls: "card p-3 mt-5" });
    photoCard.appendChild(el("div", { cls: "flex items-center justify-between" }, [
      el("h2", { cls: "text-sm font-semibold", text: "Photos" }),
      el("span", { cls: "badge badge-ai", text: "demo placeholders" })
    ]));
    var g = el("div", { cls: "grid-photos mt-2" });
    mockApi.photosFor(inst.id).forEach(function (bg) {
      g.appendChild(el("img", { src: "data:image/svg+xml," + encodeURIComponent("<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='#0f172a'/><stop offset='1' stop-color='#334155'/></linearGradient></defs><rect width='400' height='300' fill='url(#g)'/></svg>"), alt: inst.name + " photo placeholder" }));
      void bg;
    });
    photoCard.appendChild(g);
    right.appendChild(photoCard);

    /* videos */
    var vids = mockApi.videosFor(inst.id);
    if (vids.length) {
      var vidSec = el("div", { cls: "mt-5" });
      vidSec.appendChild(el("div", { cls: "flex items-center gap-2" }, [
        el("h2", { cls: "section-title !mt-0", text: "Videos" }),
        el("span", { cls: "badge badge-video", text: "video source" })
      ]));
      vidSec.appendChild(el("p", { cls: "text-xs text-muted-foreground mb-2", text: "Video results include the publishing channel and date so you can judge credibility. All items here are clearly marked demo." }));
      var vgrid = el("div", { cls: "grid-cards-3" });
      vids.forEach(function (v) {
        var tile = el("a", { cls: "video-tile", href: v.url, target: "_blank", rel: "noopener" });
        tile.appendChild(el("div", { cls: "video-thumb", html: I("play", 22) + "<span class='text-xs ml-1'>demo</span>" }));
        var body = el("div", { cls: "p-3 text-sm" });
        body.appendChild(el("strong", { cls: "block", text: v.title }));
        body.appendChild(el("span", { cls: "text-muted-foreground text-xs", text: v.channel + " · " + v.date }));
        tile.appendChild(body);
        vgrid.appendChild(tile);
      });
      vidSec.appendChild(vgrid);
      right.appendChild(vidSec);
    }

    view.appendChild(right);

    /* reviews -------------------------------------------------- */
    var revSec = el("div", { cls: "mt-8" });
    revSec.appendChild(el("div", { cls: "flex items-center gap-2" }, [
      el("h2", { cls: "section-title !mt-0", text: "Real comments" }),
      el("span", { cls: "badge badge-user", text: "user generated" })
    ]));
    revSec.appendChild(el("p", { cls: "text-xs text-muted-foreground mb-2", text: "Each post is labelled by origin (platform or in-browser). Seeded demo entries are marked “demo” and are not real claims." }));
    var revWrap = el("div", { cls: "card p-5" });
    var revList = el("div", { cls: "space-y-1" });
    function renderReviews() {
      revList.innerHTML = "";
      mockApi.reviews(inst.id).forEach(function (r) {
        var it = el("div", { cls: "review-item" });
        var head = el("div", { cls: "flex items-center gap-2 flex-wrap text-sm" });
        head.appendChild(el("strong", { text: esc(r.name || r.author || "Anonymous") }));
        head.appendChild(el("span", { cls: "badge " + (r.origin === "user" ? "badge-user" : "badge-external"), text: r.origin === "user" ? "in-browser post" : (r.origin || "external") }));
        if (r.demo) head.appendChild(el("span", { cls: "badge badge-ai", text: "demo" }));
        head.appendChild(el("span", { cls: "text-muted-foreground text-xs", text: relativeTime(r.date) }));
        it.appendChild(head);
        it.appendChild(el("div", { cls: "mt-1 text-sm", html: "" + r.rating + " " + stars(r.rating) + "" }));
        it.appendChild(el("p", { cls: "text-sm mt-1", text: r.text }));
        revList.appendChild(it);
      });
      if (!revList.children.length) {
        revList.appendChild(el("p", { cls: "text-sm text-muted-foreground", text: "No comments yet. Be the first to leave one." }));
      }
    }
    renderReviews();
    revWrap.appendChild(revList);

    var form = el("form", { cls: "comment-form flex-col sm:flex-row items-stretch mt-3", on: { submit: function (e) { e.preventDefault(); submitReview(form, inst, renderReviews); } } });
    form.appendChild(el("input", { cls: "input", name: "name", placeholder: "Your name", maxlength: "40" }));
    form.appendChild(el("select", { cls: "input sm:!w-28", name: "rating", html: "<option value='5'>★★★★★ 5</option><option value='4'>★★★★☆ 4</option><option value='3'>★★★☆☆ 3</option><option value='2'>★★☆☆☆ 2</option><option value='1'>★☆☆☆☆ 1</option>" }));
    form.appendChild(el("textarea", { cls: "input flex-1", name: "text", placeholder: "Share your experience (demo — only stored in this browser)", rows: "1" }));
    form.appendChild(el("button", { cls: "btn btn-primary", type: "submit", text: "Post" }));
    revWrap.appendChild(form);
    revSec.appendChild(revWrap);
    view.appendChild(revSec);

    void pendingCmd;
  }

  function submitReview(form, inst, cb) {
    var fd = new FormData(form);
    var text = (fd.get("text") || "").trim();
    if (!text) { toast("Write something first."); return; }
    mockApi.addReview(inst.id, { name: fd.get("name") || "Guest", rating: Number(fd.get("rating") || 5), text: text });
    form.reset();
    toast("Posted. (Demo — saved only in this browser.)");
    if (cb) cb();
  }

  function reportModal(inst) {
    var body = el("div", {});
    body.appendChild(el("p", { cls: "text-sm text-muted-foreground mb-3" }, "Reports go to the moderation queue used by administrators. This demo simulates the full flow."));
    var form = el("form", { cls: "space-y-3", on: { submit: function (e) {
      e.preventDefault();
      var fd = new FormData(form);
      mockApi.report(inst.id, fd.get("reason") || "other", fd.get("detail") || "");
      toast("Report submitted to the moderation queue.");
      close();
    } } });
    form.appendChild(el("select", { cls: "input", name: "reason", html: "<option value='inaccurate'>Inaccurate information</option><option value='missing'>Missing institution</option><option value='outdated'>Outdated information</option><option value='video'>Problem with a video</option><option value='other'>Other</option>" }));
    form.appendChild(el("textarea", { cls: "input", name: "detail", placeholder: "Details / why is this wrong?", rows: "3" }));
    form.appendChild(el("button", { cls: "btn btn-primary w-full", type: "submit", text: "Submit report" }));
    body.appendChild(form);
    var close = openModal("Report: " + inst.name, body);
  }

  /* --------------------------------- geo ---------------------------------- */

  function leafletMap(node, items, zoom) {
    if (!window.L) {
      node.innerHTML = "<div class='p-4 text-sm text-muted-foreground'>Map tiles unavailable in this build. Coordinates listed: " + items.map(function (i) { return i.name; }).join(", ") + "</div>";
      return null;
    }
    var map = L.map(node, { scrollWheelZoom: false });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, attribution: "&copy; OpenStreetMap contributors" }).addTo(map);
    var latlngs = [];
    items.forEach(function (i) {
      if (!i || !i.lat) return;
      var m = L.marker([i.lat, i.lng]).addTo(map);
      m.bindPopup(popupHtml(i));
      latlngs.push([i.lat, i.lng]);
    });
    if (latlngs.length === 1) map.setView(latlngs[0], zoom || 13);
    else if (latlngs.length > 1) map.fitBounds(L.latLngBounds(latlngs), { padding: [24, 24] });
    else map.setView([30, 10], 2);
    S._maps.push(map);
    return map;
  }

  function null_item() { return null; }

  function popupHtml(i) {
    return "<strong>" + esc(i.name) + "</strong><br/><span>" + esc(i.city || "") + (i.country ? ", " + esc(COUNTRY_BY_ISO[i.country] && COUNTRY_BY_ISO[i.country].name) : "") + "</span><br/><a href='#/uni/" + encodeURIComponent(i.id) + "' style='color:#2563eb'>View profile</a>";
  }

  function renderGeo(app, r) {
    var kind = r.path[1];
    var view = el("div", { cls: "view" });
    app.innerHTML = "";
    app.appendChild(view);

    if (kind === "city") {
      var cname = r.path[2] || "", ciso = r.path[3] || "";
      var city = null;
      mockApi.cities().forEach(function (c) { if (norm(c.name) === norm(cname) && c.country === ciso) city = c; });
      if (!city) { renderNotFound(app); return; }
      var insts = INSTITUTIONS.filter(function (i) { return i.city === city.name && i.country === city.country; });
      view.appendChild(el("a", { cls: "text-sm text-muted-foreground inline-flex items-center gap-1 mb-3", href: "#/", html: I("left", 14) + " Back" }));
      view.appendChild(el("div", { cls: "flex items-center gap-3 flex-wrap" }, [
        el("h1", { cls: "text-2xl font-bold", text: flagOf(city.country) + "  " + city.name }),
        el("span", { cls: "badge", text: countryName(city.country) }),
        el("span", { cls: "badge badge-type", text: city.count + " institutions" })
      ]));
      var mw = el("div", { cls: "map-wrap mt-4", style: "height:20rem" });
      mw.appendChild(el("div", { cls: "map" }));
      view.appendChild(mw);
      setTimeout(function () { leafletMap(mw.firstChild, insts, 13); }, 0);
      var list = el("div", { cls: "grid gap-3 mt-5" });
      insts.forEach(function (i) { list.appendChild(instCard(i)); });
      if (!insts.length) list.appendChild(el("p", { cls: "text-sm text-muted-foreground", text: "No institutions indexed for this city yet." }));
      view.appendChild(list);
      return;
    }

    if (kind === "country") {
      var iso = (r.path[2] || "").toUpperCase();
      var country = COUNTRY_BY_ISO[iso];
      if (!country) { renderNotFound(app); return; }
      var cinsts = INSTITUTIONS.filter(function (i) { return i.country === iso; });
      view.appendChild(el("a", { cls: "text-sm text-muted-foreground inline-flex items-center gap-1 mb-3", href: "#/", html: I("left", 14) + " Back" }));
      view.appendChild(el("div", { cls: "flex items-center gap-3 flex-wrap" }, [
        el("h1", { cls: "text-2xl font-bold", text: country.flag + "  " + country.name }),
        el("span", { cls: "badge", text: country.continent }),
        el("span", { cls: "badge badge-type", text: cinsts.length + " institutions" })
      ]));
      var mw2 = el("div", { cls: "map-wrap mt-4", style: "height:20rem" });
      mw2.appendChild(el("div", { cls: "map" }));
      view.appendChild(mw2);
      setTimeout(function () { leafletMap(mw2.firstChild, cinsts, 5); }, 0);
      var cities = {};
      cinsts.forEach(function (i) { var k = i.city; cities[k] = (cities[k] || 0) + 1; });
      view.appendChild(el("h2", { cls: "section-title", text: "Cities" }));
      var cg = el("div", { cls: "grid-cards-3" });
      Object.keys(cities).forEach(function (c) {
        var cc = el("div", { cls: "explore-group", on: { click: function () { go("/loc/city/" + encodeURIComponent(c) + "/" + iso); } } });
        cc.appendChild(el("h3", { text: c }));
        cc.appendChild(el("p", { cls: "text-xs text-muted-foreground", text: cities[c] + " institutions" }));
        cg.appendChild(cc);
      });
      view.appendChild(cg);
      view.appendChild(el("h2", { cls: "section-title", text: "Institutions" }));
      var cl = el("div", { cls: "grid gap-3" });
      cinsts.forEach(function (i) { cl.appendChild(instCard(i)); });
      view.appendChild(cl);
      return;
    }

    renderNotFound(app);
  }

  /* -------------------------------- world map ------------------------------ */

  function renderMap(app, r) {
    void r;
    var view = el("div", { cls: "view" });
    app.innerHTML = "";
    app.appendChild(view);
    view.appendChild(el("h1", { cls: "text-2xl font-bold", text: "World map" }));
    view.appendChild(el("p", { cls: "text-sm text-muted-foreground mt-1", text: "Every indexed institution as a map marker (" + INSTITUTIONS.length + "). Click a marker to open its profile." }));
    var wrap = el("div", { cls: "map-wrap map-lg mt-4" });
    wrap.appendChild(el("div", { cls: "map" }));
    view.appendChild(wrap);
    setTimeout(function () { leafletMap(wrap.firstChild, INSTITUTIONS, 2); }, 0);
    var legend = el("div", { cls: "card p-3 mt-4 text-xs text-muted-foreground" });
    legend.appendChild(el("span", { cls: "badge badge-ai mr-2", text: "demo" }));
    legend.appendChild(document.createTextNode("Marker previews include a link to each verified profile. Offline builds render without tiles."));
    view.appendChild(legend);
  }

  /* ------------------------------- explorer -------------------------------- */

  function exploreTree() {
    var tree = { _order: [] };
    COUNTRIES.forEach(function (c) {
      tgroup = tree[c.continent] = tree[c.continent] || { _order: [] };
      if (tree._order.indexOf(c.continent) === -1) tree._order.push(c.continent);
      tgroup._order.push(c.iso);
      tgroup[c.iso] = { c: c, cities: {} };
      (tgroup[c.iso]).count = 0;
    });
    INSTITUTIONS.forEach(function (i) {
      var cn2 = COUNTRY_BY_ISO[i.country];
      if (!cn2) return;
      var g = tree[cn2.continent][i.country];
      g.count++;
      var key = (i.city || "") + "|" + (i.region || "");
      g.cities[key] = g.cities[key] || { name: i.city, region: i.region, count: 0 };
      g.cities[key].count++;
    });
    return tree;
  }
  var tgroup = null;

  function normKey(s) {
    return norm(s).replace(/[^a-z0-9\u0400-\u04ff]+/g, "");
  }

  function renderExplore(app, r) {
    var segs = r.path.slice(1).map(function (s) { return norm(s); });
    var tree = exploreTree();
    var view = el("div", { cls: "view" });
    app.innerHTML = "";
    app.appendChild(view);

    function crumb(label, hash) {
      return hash ? el("a", { cls: "text-muted-foreground underline decoration-dotted underline-offset-4", text: label, href: hash }) : el("span", { cls: "text-muted-foreground", text: label });
    }
    var crumbs = el("div", { cls: "flex items-center gap-2 text-sm mb-3 flex-wrap" });
    crumbs.appendChild(crumb("Home", "#/"));
    crumbs.appendChild(el("span", { text: "›" }));
    crumbs.appendChild(crumb("Explore", "#/explore"));
    view.appendChild(crumbs);

    if (!segs.length) {
      view.appendChild(el("h1", { cls: "text-2xl font-bold", text: "World explorer" }));
      view.appendChild(el("p", { cls: "text-sm text-muted-foreground mt-1", text: "Drill down: continent → country → region → city → institution." }));
      var cont = el("div", { cls: "grid-cards mt-4" });
      tree._order.forEach(function (name) {
        var g = tree[name];
        var n = g._order.length;
        var cnt = INSTITUTIONS.filter(function (i) { return COUNTRY_BY_ISO[i.country] && COUNTRY_BY_ISO[i.country].continent === name; }).length;
        var card = el("div", { cls: "explore-group rise", on: { click: function () { go("/explore/" + encodeURIComponent(name.replace(/\s+/g, "-"))); } } });
        card.appendChild(el("h3", { text: name }));
        card.appendChild(el("p", { cls: "text-xs text-muted-foreground", text: n + " countries · " + cnt + " institutions" }));
        cont.appendChild(card);
      });
      view.appendChild(cont);
      return;
    }

    var continent = tree._order.filter(function (n) { return normKey(n) === normKey(segs[0]) || normKey(n).indexOf(normKey(segs[0])) !== -1; })[0];
    if (!continent) { renderNotFound(app); return; }
    var g0 = tree[continent];
    crumbs.appendChild(el("span", { text: "›" }));
    crumbs.appendChild(crumb(continent, "#/explore/" + encodeURIComponent(continent.replace(/\s+/g, "-"))));

    if (!segs[1]) {
      view.appendChild(el("h1", { cls: "text-2xl font-bold", text: continent }));
      var cp = el("div", { cls: "grid-cards mt-4" });
      g0._order.forEach(function (iso) {
        var cc = g0[iso];
        var card = el("div", { cls: "explore-group rise", on: { click: function () { go("/explore/" + encodeURIComponent(continent.replace(/\s+/g, "-")) + "/" + iso); } } });
        card.appendChild(el("h3", { text: cc.c.flag + "  " + cc.c.name }));
        card.appendChild(el("p", { cls: "text-xs text-muted-foreground", text: cc.count + " institutions · " + Object.keys(cc.cities).length + " cities" }));
        cp.appendChild(card);
      });
      view.appendChild(cp);
      return;
    }

    var iso = segs[1].toUpperCase();
    var cc2 = g0[iso];
    if (!cc2) { renderNotFound(app); return; }
    crumbs.appendChild(el("span", { text: "›" }));
    crumbs.appendChild(crumb(cc2.c.name, "#/explore/" + encodeURIComponent(continent.replace(/\s+/g, "-")) + "/" + iso));

    if (!segs[2]) {
      view.appendChild(el("h1", { cls: "text-2xl font-bold", text: cc2.c.flag + "  " + cc2.c.name }));
      view.appendChild(el("div", { cls: "flex gap-2 mt-2" }, [
        el("a", { cls: "btn btn-sm btn-outline", href: "#/loc/country/" + iso }, "Country page"),
        el("a", { cls: "btn btn-sm btn-outline", href: "#/map" }, "Open map")
      ]));
      view.appendChild(el("h2", { cls: "section-title", text: "Cities" }));
      var cityGrid = el("div", { cls: "grid-cards-3" });
      Object.keys(cc2.cities).forEach(function (key) {
        var city = cc2.cities[key];
        var card = el("div", { cls: "explore-group", on: { click: function () { go("/loc/city/" + encodeURIComponent(city.name) + "/" + iso); } } });
        card.appendChild(el("h3", { text: city.name }));
        card.appendChild(el("p", { cls: "text-xs text-muted-foreground", text: (city.region ? city.region + " · " : "") + city.count + " institutions" }));
        cityGrid.appendChild(card);
      });
      view.appendChild(cityGrid);
      return;
    }

    var regionTok = segs[2];
    var cities = Object.keys(cc2.cities).filter(function (k) {
      return norm(cc2.cities[k].region).indexOf(regionTok) !== -1 || norm(cc2.cities[k].name) === regionTok;
    }).map(function (k) { return cc2.cities[k]; });
    InputStreamTitle(view, cc2, cities);
    if (segs[3]) { /* city-level: route to loc */
      var w = cities.filter(function (c) { return norm(c.name) === segs[3]; })[0];
      if (w) { go("/loc/city/" + encodeURIComponent(w.name) + "/" + iso); return; }
    }
    view.appendChild(el("h2", { cls: "section-title", text: "Cities in region" }));
    var rg = el("div", { cls: "grid-cards-3" });
    cities.forEach(function (city) {
      var card = el("div", { cls: "explore-group", on: { click: function () { go("/loc/city/" + encodeURIComponent(city.name) + "/" + iso); } } });
      card.appendChild(el("h3", { text: city.name }));
      card.appendChild(el("p", { cls: "text-xs text-muted-foreground", text: city.count + " institutions" }));
      rg.appendChild(card);
    });
    view.appendChild(rg);
  }

  function InputStreamTitle(view, cc2, cities) {
    void view; void cc2; void cities;
    /* placeholder kept minimal */
  }

  /* --------------------------------- admin --------------------------------- */

  function renderAdmin(app, r) {
    void r;
    var view = el("div", { cls: "view" });
    app.innerHTML = "";
    app.appendChild(view);

    view.appendChild(el("h1", { cls: "text-2xl font-bold", text: "Admin" }));
    view.appendChild(el("p", { cls: "text-sm text-muted-foreground mt-1", html: esc("Moderation queue, discovery queue and source taxonomy. In production this panel is role-restricted; it is simulated here for illustration.") }));

    /* reports */
    view.appendChild(el("h2", { cls: "section-title", text: "Visitor reports" }));
    var reports = mockApi.reports().slice().reverse();
    var repBox = el("div", { cls: "grid gap-3" });
    if (!reports.length) repBox.appendChild(el("div", { cls: "card p-5 text-sm text-muted-foreground" }, "No open reports. Visitors can report issues from any institution profile."));
    reports.forEach(function (rep) {
      var card = el("div", { cls: "card p-4" });
      var inst = mockApi.institution(rep.instId);
      var head = el("div", { cls: "flex items-center gap-2 flex-wrap" });
      head.appendChild(el("span", { cls: "badge " + (rep.status === "open" ? "badge-conflict" : "badge-type"), text: rep.status === "open" ? "open" : rep.status }));
      head.appendChild(el("a", { cls: "font-semibold", href: "#/uni/" + rep.instId, text: inst ? inst.name : rep.instId }));
      head.appendChild(el("span", { cls: "text-xs text-muted-foreground", text: rep.date }));
      head.appendChild(el("span", { cls: "badge badge-user", text: rep.reason }));
      card.appendChild(head);
      if (rep.detail) card.appendChild(el("p", { cls: "text-sm mt-2", text: esc(rep.detail) }));
      if (rep.status === "open") {
        var btns = el("div", { cls: "flex gap-2 mt-3" });
        btns.appendChild(el("button", { cls: "btn btn-sm btn-primary", type: "button", text: "Mark resolved", on: { click: function () { mockApi.resolveReport(rep.id, "resolved"); renderAdmin(app, r); } } }));
        btns.appendChild(el("button", { cls: "btn btn-sm btn-outline", type: "button", text: "Dismiss", on: { click: function () { mockApi.resolveReport(rep.id, "dismissed"); renderAdmin(app, r); } } }));
        card.appendChild(btns);
      }
      repBox.appendChild(card);
    });
    view.appendChild(repBox);

    /* pending queue */
    view.appendChild(el("h2", { cls: "section-title", text: "Discovery queue" }));
    var pends = mockApi.pending().slice().reverse();
    var pendBox = el("div", { cls: "grid gap-3" });
    if (!pends.length) pendBox.appendChild(el("div", { cls: "card p-5 text-sm text-muted-foreground" }, "No pending candidates. Search for an unmatched institution name to create one."));
    pends.forEach(function (p) {
      var card = el("div", { cls: "card p-4" });
      var st = p.status === "approved" ? "badge-verified" : p.status === "rejected" ? "badge-pending" : "badge-pending";
      var head = el("div", { cls: "flex items-center gap-2 flex-wrap" });
      head.appendChild(el("span", { cls: "badge " + st, text: "verification " + (p.status || "pending") }));
      head.appendChild(el("strong", { text: esc(p.name) }));
      head.appendChild(el("span", { cls: "text-xs text-muted-foreground", text: "proposed " + (p.discoveredAt || p.date) }));
      card.appendChild(head);
      card.appendChild(el("p", { cls: "text-sm text-muted-foreground mt-1", text: (p.types || []).join(", ") + " · " + (p.city || "") + ", " + countryName(p.country) + " · " + ("query: “" + (p.aliases && p.aliases[0] || "") + "”") }));
      if (p.status === "pending") {
        var btns2 = el("div", { cls: "flex gap-2 mt-3" });
        btns2.appendChild(el("button", { cls: "btn btn-sm btn-primary", type: "button", text: "Approve → verified", on: { click: function () { mockApi.resolvePending(p.id, "approve"); renderAdmin(app, r); } } }));
        btns2.appendChild(el("button", { cls: "btn btn-sm btn-outline", type: "button", text: "Reject", on: { click: function () { mockApi.resolvePending(p.id, "reject"); renderAdmin(app, r); } } }));
        card.appendChild(btns2);
      }
      pendBox.appendChild(card);
    });
    view.appendChild(pendBox);

    /* source taxonomy */
    view.appendChild(el("h2", { cls: "section-title", text: "Source type taxonomy" }));
    var tax = el("div", { cls: "grid-cards-3" });
    Object.keys(SOURCE_META).forEach(function (k) {
      var t = SOURCE_META[k];
      var card = el("div", { cls: "explore-group" });
      card.appendChild(el("div", { cls: "flex items-center gap-2" }, [el("span", { cls: "badge " + t.cls, text: t.label })]));
      card.appendChild(el("p", { cls: "text-xs text-muted-foreground mt-1", text: sourceTaxDescr[k] || "" }));
      tax.appendChild(card);
    });
    view.appendChild(tax);

    view.appendChild(el("div", { cls: "card p-4 mt-6 text-xs text-muted-foreground" }, [
      el("strong", { cls: "block text-foreground", text: "Security note" }),
      el("p", { cls: "mt-1", text: "API keys and admin credentials must never appear in the browser. This demo keeps everything local and marks all simulated data honestly. A real deployment proxies providers server-side." })
    ]));
  }

  var sourceTaxDescr = {
    official: "First-party institutional website, captured with a stable URL.",
    gov: "Government or regulator record (accreditation, registry).",
    academic: "Academic encyclopedic cross-reference.",
    external: "Verified partner directory / aggregator match.",
    userGen: "Community or platform-sourced comment — clearly labelled.",
    video: "Video result with publishing channel and date.",
    ai: "AI-generated summary — never treated as a primary source."
  };
})();