/* =========================================================================
 * WorldEd — search engine (logic only, no DOM)
 * -------------------------------------------------------------------------
 * Layer simulation (see SEARCH_LAYERS). In a production build each step maps
 * to a real backend call:
 *   inner  -> your internal DB        alias -> alias/abbrev resolver
 *   types  -> institution type map    verify-> source cross-checks
 *   geo    -> Places / geocoder       rank  -> confidence ranking
 * Everything here is synchronous & deterministic so the UI can render the
 * same "research pipeline" progress for every query.
 * ========================================================================= */

"use strict";

var SEARCH_LAYERS = [
  { id: "inner", label: "Searching internal database" },
  { id: "global", label: "Consulting global knowledge sources" },
  { id: "geo", label: "Resolving geographic terms" },
  { id: "alias", label: "Resolving aliases & abbreviations" },
  { id: "verify", label: "Cross-checking sources" },
  { id: "rank", label: "Ranking with confidence factors" }
];

var STOPWORDS = ["universities", "university", "institutes", "institute", "institutions", "institution", "in", "of", "the", "and", "for", "at", "near", "a", "an", "best", "top", "find", "list", "i", "looking", "want", "all", "s", "domain", "which", "what", "college", "colleges"];

var FIELD_ALIASES = {
  "medical": ["medicine", "medical", "medicina", "health", "med"],
  "engineering": ["engineering", "engg", "tech", "technical"],
  "computer-science": ["computer", "computing", "it", "software", "informatics", "cs", "data science", "cybersecurity"],
  "science": ["science", "sciences", "physics", "chemistry", "biology", "math", "mathematics", "natural"],
  "business": ["business", "management", "commerce", "finance", "economics", "biz"],
  "law": ["law", "legal"],
  "arts": ["arts", "humanities", "literature", "philosophy", "film", "culture", "design"],
  "agriculture": ["agriculture", "agricultural", "agri", "agronomy"],
  "economics": ["economics", "economic", "econ"],
  "journalism": ["journalism", "media", "news"],
  "social-sciences": ["social", "sociology", "politics", "political", "psychology", "communication", "international"]
};

function norm(s) {
  return String(s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function tokenize(s) {
  var n = norm(s);
  return n.split(/[^a-z0-9\u0400-\u04ff\u3040-\u30ff\u3400-\u9fff\uac00-\ud7af]+/).filter(Boolean);
}

var KEEP_RANGE = "[a-z0-9\u0400-\u04ff\u3040-\u30ff\u3400-\u9fff\uac00-\ud7af]";

var FUZZY_CACHE = {};
function levenshtein(a, b) {
  if (a === b) return 0;
  var key = a + "\u0001" + b;
  if (FUZZY_CACHE[key] !== undefined) return FUZZY_CACHE[key];
  var m = [], i, j;
  for (i = 0; i <= b.length; i++) m[i] = [i];
  for (j = 0; j <= a.length; j++) m[0][j] = j;
  for (i = 1; i <= b.length; i++) {
    for (j = 1; j <= a.length; j++) {
      m[i][j] = Math.min(m[i - 1][j] + 1, m[i][j - 1] + 1, m[i - 1][j - 1] + (b[i - 1] === a[j - 1] ? 0 : 1));
    }
  }
  return (FUZZY_CACHE[key] = m[b.length][a.length]);
}

function haversineKm(lat1, lon1, lat2, lon2) {
  var R = 6371, dLat = (lat2 - lat1) * Math.PI / 180, dLon = (lon2 - lon1) * Math.PI / 180;
  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function textOf(inst, countryName) {
  var parts = [inst.name, inst.short, inst.aliases.join(" "), inst.local ? Object.keys(inst.local).map(function (k) { return inst.local[k]; }).join(" ") : "", inst.city, inst.region, countryName, inst.types.join(" "), inst.fields.join(" "), inst.desc];
  return norm(parts.join(" "));
}

function abbrevIdsFor(normTok) {
  if (ABBREVIATIONS[normTok]) return ABBREVIATIONS[normTok].slice();
  var hits = [], token = tokenize(normTok)[0];
  INSTITUTIONS.forEach(function (i) {
    (i.abbrs || []).forEach(function (a) { if (norm(a) === normTok || norm(a) === token) hits.push(i.id); });
  });
  return hits;
}

function inferCountry(tokens) {
  var best = null;
  tokens.forEach(function (t) {
    var hits = COUNTRIES.filter(function (c) {
      return norm([c.name, c.local, c.aliases.join(" ")].join(" ")).indexOf(t) !== -1;
    });
    if (hits.length === 1) best = hits[0].iso;
  });
  return best;
}

function countryMatches(rawLower) {
  var out = [];
  var toks = tokenize(norm(rawLower)).filter(function (t) { return t.length > 1 && STOPWORDS.indexOf(t) === -1; });
  COUNTRIES.forEach(function (c) {
    var hay = norm([c.name, c.local, c.aliases.join(" ")].join(" "));
    var whole = hay.indexOf(norm(rawLower)) !== -1;
    var anyTok = toks.some(function (t) { return t.length > 1 && hay.indexOf(t) !== -1; });
    if (whole || anyTok) out.push(c);
  });
  return out;
}

function cityMatches(rawNorm) {
  var tokens = tokenize(rawNorm).filter(function (t) { return STOPWORDS.indexOf(t) === -1; });
  return mockApi.cities().filter(function (c) {
    return norm(c.name) === rawNorm || tokens.some(function (t) { return norm(c.name).indexOf(t) !== -1; });
  });
}

function fieldTokensFor(tokens) {
  var fields = {};
  tokens.forEach(function (t) {
    Object.keys(FIELD_ALIASES).forEach(function (f) {
      if (FIELD_ALIASES[f].indexOf(t) !== -1) fields[f] = true;
    });
  });
  return Object.keys(fields);
}

function scoreInstitution(inst, tokens, rawNorm, fullText, matchedTokens) {
  var score = 0, hits = 0, exact;
  tokens.forEach(function (t) {
    exact = norm(inst.name).split(/\s+/);
    if ((inst.abbrs || []).some(function (a) { return norm(a) === t; })) { score += 5; hits++; matchedTokens[t] = true; return; }
    if (norm(inst.short) === t) { score += 4; hits++; matchedTokens[t] = true; return; }
    if (fullText.indexOf(t) !== -1) { score += 2; hits++; matchedTokens[t] = true; return; }
    if (t.length > 3 && norm(inst.name).indexOf(t.substring(0, t.length - 1)) !== -1) { score += 1.5; hits++; matchedTokens[t] = true; }
  });
  if (!hits && tokens.length > 0) {
    var nameToks = norm(inst.name).split(/\s+/);
    var fuzzyBest = 0;
    tokens.forEach(function (t) {
      nameToks.forEach(function (nt) {
        if (Math.abs(t.length - nt.length) <= 2) {
          var d = levenshtein(t, nt);
          if (d <= Math.max(1, Math.floor(nt.length / 3))) { fuzzyBest = Math.max(fuzzyBest, 2 - d); matchedTokens[t] = true; }
        }
      });
    });
    if (fuzzyBest > 0) { score += fuzzyBest; hits = 1; }
  }
  return { score: score, hits: hits };
}

/* ------------------------- Near-by (Haversine) --------------------------- */

function nearFor(lat, lng, query) {
  var list = INSTITUTIONS.slice().sort(function (a, b) {
    return haversineKm(lat, lng, a.lat, a.lng) - haversineKm(lat, lng, b.lat, b.lng);
  });
  list.forEach(function (i) { i._distKm = Math.round(haversineKm(lat, lng, i.lat, i.lng)); });
  void query;
  return list;
}

function clamp(list, n) { return list.slice(0, n); }

/* --------------------------- Search entry point -------------------------- */

function searchEngine() {}

searchEngine.search = function (raw) {
  var rawNorm = norm(raw).trim();
  var tokens = tokenize(rawNorm);
  var meaningful = tokens.filter(function (t) { return STOPWORDS.indexOf(t) === -1 && t.length > 1; });
  var steps = SEARCH_LAYERS.map(function (l) { return { id: l.id, label: l.label, state: "done" }; });
  var intent = { type: "general", label: "General query" };

  if (!meaningful.length) {
    return { raw: raw, intent: { type: "empty", label: "" }, institutions: [], cities: [], countries: [], ambiguous: [], discovered: [], steps: steps, queryInfo: null };
  }

  /* 1. abbreviations ------------------------------------------------ */
  var ambiguous = [], abbrevHit = false;
  if (meaningful.length === 1 && (meaningful[0].length >= 2)) {
    var ids = abbrevIdsFor(meaningful[0]);
    if (ids.length) {
      abbrevHit = true;
      var found = ids.map(mockApi.institution).filter(Boolean);
      if (found.length > 1) {
        ambiguous = found;
        intent = { type: "abbrev", label: "Abbreviation matched multiple institutions — please choose" };
        return { raw: raw, intent: intent, institutions: [], cities: [], countries: [], ambiguous: ambiguous, discovered: [], steps: steps, queryInfo: { kind: "abbrev", ids: ids } };
      } else if (found.length === 1) {
        intent = { type: "uni", label: found[0].name };
        return { raw: raw, intent: intent, institutions: found, cities: [], countries: [], ambiguous: [], discovered: [], steps: steps, queryInfo: { kind: "abbrev", ids: ids } };
      }
    }
  }

  /* 2. geography --------------------------------------------------- */
  var countries = [], cities = [];
  if (!abbrevHit) {
    countries = countryMatches(rawNorm);
    var cTokens = tokenize(rawNorm).filter(function (t) { return t.length >= 2; });
    cities = cTokens.reduce(function (acc, t) {
      var m = cityMatches(norm(rawNorm).indexOf(t) >= 0 ? (t === rawNorm ? t : closestCityToken(rawNorm, t)) : t);
      m.forEach(function (c) { if (!acc.some(function (x) { return x.name === c.name && x.country === c.country; })) acc.push(c); });
      return acc;
    }, []);
    cities = cities.slice(0, 4);
  }

  /* 3. field detection ---------------------------------------------- */
  var fields = abbrevHit ? [] : fieldTokensFor(meaningful);
  var geoOnly = !abbrevHit && fields.length === 0 && countries.length + cities.length >= 1 && meaningful.every(function (t) {
    var isStop = STOPWORDS.indexOf(t) !== -1;
    var isGeo = norm(countries.map(function (c) { return c.name; }).join(" ")).indexOf(t) !== -1 || mockApi.cities().some(function (c) { return norm(c.name) === t; });
    return isStop || isGeo;
  });

  /* 4. institution scoring ------------------------------------------ */
  var fullTexts = {};
  INSTITUTIONS.forEach(function (i) { fullTexts[i.id] = textOf(i, (COUNTRY_BY_ISO[i.country] || {}).name || ""); });

  var matchedTokens = {};
  var scored = [];
  var tokenUnion = meaningful.slice();
  if (weakTokens(rawNorm)) {
    var extra = tokenize(rawNorm).filter(function (t) { return STOPWORDS.indexOf(t) === -1; });
    tokenUnion = extra.length ? extra : tokenUnion;
  }
  tokenUnion.forEach(function (t) { if (STOPWORDS.indexOf(t) === -1) matchedTokens[t] = false; });

  INSTITUTIONS.forEach(function (i) {
    var mt = {};
    var r = scoreInstitution(i, meaningful.length ? meaningful : tokenUnion, rawNorm, fullTexts[i.id], mt);
    scored.push({ inst: i, score: r.score, hits: r.hits, mt: mt });
  });

  /* similarity hint from phrase ("in X") */
  var phraseTokens = rawNorm.split(/\s+(in|at|near|of)\s+/);

  var institutions = scored
    .filter(function (r) { return r.score > 0; })
    .sort(function (a, b) { return b.score - a.score; })
    .map(function (r) { return r.inst; });

  if (geoOnly || (!institutions.length && cities.length)) {
    if (cities.length) {
      intent = { type: "geo", label: "Locations matching your query" };
    } else if (countries.length) {
      intent = { type: "geo", label: countries[0].name };
    }
  } else if (institutions.length) {
    intent = { type: institutions[0].id ? "uni" : "general", label: institutions[0].name };
  }

  /* combined geofilter: name + country/city token ------------------ */
  var inferredIso = countries.length === 1 ? countries[0].iso : (inferCountry(meaningful) || null);
  if (inferredIso && institutions.length) {
    var allowed = institutions.filter(function (i) { return i.country === inferredIso; });
    if (allowed.length) institutions = allowed;
  }
  if (cities.length === 1 && institutions.length > 1) {
    var ci = cities[0];
    var cityHits = institutions.filter(function (i) { return i.city === ci.name && i.country === ci.country; });
    if (cityHits.length) institutions = cityHits;
  }

  /* "near <city>" proximity ordering ------------------------------ */
  var nearTok = /(^|\s)near\s+([^\s]+)/.exec(rawNorm);
  if (nearTok && cities.length && institutions.length) {
    var nr = cities[0];
    institutions.sort(function (a, b) {
      return haversineKm(nr.lat, nr.lng, a.lat, a.lng) - haversineKm(nr.lat, nr.lng, b.lat, b.lng);
    });
    institutions.forEach(function (i) { i._distKm = Math.round(haversineKm(nr.lat, nr.lng, i.lat, i.lng)); });
    intent = { type: "geo", label: "Institutions near " + nr.name + (nr.country ? ", " + COUNTRY_BY_ISO[nr.country].name : "") + " — ordered by distance" };
  }

  institutions = clamp(institutions, 20);

  /* 5. discovered (unmatched plausible institution name) ------------- */
  var discovered = [];
  if (!institutions.length && !ambiguous.length && !cities.length && !countries.length && meaningful.length >= 2) {
    var cand = buildDiscovered(raw, meaningful, fields);
    if (cand) {
      discovered = [mockApi.savePending(cand)];
      intent = { type: "discover", label: "Discovered — verification pending" };
    }
  }

  /* phrase lookup pass-through for city+name queries */
  var queryInfo = {
    kind: abbrevHit ? "abbrev" : (geoOnly ? "geo" : "general"),
    countryIso: inferredIso || (countries.length === 1 ? countries[0].iso : null),
    city: cities.length === 1 ? cities[0] : null,
    fields: fields,
    near: nearTok ? { lat: cities.length ? cities[0].lat : null, lng: cities.length ? cities[0].lng : null } : null,
    phraseTokens: phraseTokens.filter(function (p) { return p && p.trim(); }),
    rawNorm: rawNorm
  };

  void matchedTokens;
  return {
    raw: raw,
    intent: intent,
    institutions: institutions,
    cities: cities.slice(0, 3),
    countries: countries,
    ambiguous: ambiguous,
    discovered: discovered,
    steps: steps,
    queryInfo: queryInfo
  };
};

function closestCityToken(rawNorm, t) {
  var words = norm(rawNorm).split(/\s+/);
  var idx = words.indexOf(t);
  if (idx === -1) return t;
  if (idx + 1 < words.length) return words[idx + 1].length > 2 ? words[idx + 1] : t;
  return t;
}

function weakTokens(raw) {
  return /^[a-z\u0400-\u04ff]{3,}$/i.test(raw) && tokenize(raw).length === 1;
}

/* ------------------- New institution discovery (mock) -------------------- */

function buildDiscovered(raw, tokens, fields) {
  var lower = norm(raw);
  var id = "d" + Date.now();
  var name = tokens.map(function (t) { return t.charAt(0).toUpperCase() + t.slice(1); }).join(" ").replace(" Of ", " of ");
  var guessCountry = guessCountryFromTokens(tokens);
  var city = guessCountry === "KZ" ? "Astana" : guessCountry === "UZ" ? "Tashkent" : guessCountry === "RU" ? "Moscow" : "Berkeley";
  var types = fields.indexOf("medical") !== -1 ? ["medical"] : ["institute"];
  if (/(institute|institut|academy|college|school|university|univ)/.test(lower)) {
    if (/academ/.test(lower)) types = ["academy"];
    else if (/college/.test(lower)) types = ["college"];
    else if (/medical|medic/.test(lower)) types = ["medical"];
    else if (/institute|institut|research/i.test(lower)) types = ["institute", "research"];
    else if (/school/.test(lower)) types = ["school"];
  }
  return {
    id: id,
    name: name,
    short: name.split(" ").slice(0, 3).map(function (w) { return w[0]; }).join(""),
    abbrs: [],
    aliases: [raw],
    local: {},
    types: types,
    fields: fields.length ? fields : ["engineering"],
    country: guessCountry,
    city: city,
    region: "",
    address: "",
    lat: guessCountry === "KZ" ? 51.16 : 40.4,
    lng: guessCountry === "KZ" ? 71.44 : 69.28,
    website: "",
    founded: null,
    desc: "Discovered candidate institution. Waiting for verification from official or government sources before it can be listed as verified.",
    programs: [],
    accr: [],
    ext: {},
    sources: {},
    foundedSrc: "",
    discovered: true,
    status: "pending"
  };
}

function guessCountryFromTokens(tokens) {
  var hay = tokens.join(" ");
  var map = { kz: "KZ", kazakh: "KZ", kazakhstan: "KZ", uz: "UZ", uzbek: "UZ", uzbekistan: "UZ", ru: "RU", russian: "RU", russia: "RU", usa: "US", us: "US", america: "US", britain: "GB", uk: "GB", japan: "JP", germany: "DE", china: "CN", india: "IN" };
  for (var k in map) if (hay.indexOf(k) !== -1) return map[k];
  return "KZ";
}

/* ------------------------------ Suggestions ------------------------------ */

searchEngine.suggest = function (q) {
  var qn = norm(q).trim();
  if (qn.length < 2) return [];
  var out = [];
  INSTITUTIONS.forEach(function (i) {
    var hay = norm(i.name + " " + (i.short || "") + " " + (i.aliases || []).join(" "));
    if (hay.indexOf(qn) !== -1 && out.length < 6) out.push({ kind: "uni", label: i.name + (i.short && i.short !== i.name ? " (" + i.short + ")" : ""), sub: i.city + ", " + (COUNTRY_BY_ISO[i.country].name), icon: "university", id: i.id });
  });
  if (out.length < 6) {
    var cn = countryMatches(qn);
    cn.forEach(function (c) {
      if (out.length < 8) out.push({ kind: "country", label: c.name, sub: "country", icon: "map-marker", iso: c.iso });
    });
  }
  if (out.length < 8) {
    var cys = cityMatches(qn);
    cys.forEach(function (c) {
      if (out.length < 8) out.push({ kind: "city", label: c.name + " (" + (COUNTRY_BY_ISO[c.country].name) + ")", sub: c.count + " institutions", icon: "building", city: c.name, country: c.country });
    });
  }
  return out.slice(0, 8);
};

searchEngine.near = nearFor;
searchEngine.haversine = haversineKm;
searchEngine.textOf = textOf;
searchEngine.norm = norm;
searchEngine.tokenize = tokenize;