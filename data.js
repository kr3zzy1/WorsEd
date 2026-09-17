/* =========================================================================
 * WorldEd — mock data layer
 * -------------------------------------------------------------------------
 * Everything the UI reads/writes goes through `mockApi` at the bottom of
 * this file. To connect real backends later, keep the method signatures and
 * replace internals with fetch() calls: INNER_DB (your database),
 * GLOBAL_SOURCES (Wikidata SPARQL sync), GEO (Google Places), WEB (search).
 *
 * Institution records are split across INSTITUTIONS_1..N and combined below.
 * Demo indicator `demo:true` marks seeded reviews/videos in the UI so
 * nothing fabricated is ever presented as a real user claim.
 * ========================================================================= */

"use strict";

/* ------------------------------ Countries ------------------------------- */

var COUNTRIES = [
  { iso: "US", name: "United States", flag: "\uD83C\uDDFA\uD83C\uDDF8", continent: "North America", local: "United States", aliases: ["usa", "america", "us", "u.s.", "united states of america"] },
  { iso: "GB", name: "United Kingdom", flag: "\uD83C\uDDEC\uD83C\uDDE7", continent: "Europe", local: "United Kingdom", aliases: ["uk", "britain", "great britain", "england", "scotland", "wales"] },
  { iso: "JP", name: "Japan", flag: "\uD83C\uDDEF\uD83C\uDDF5", continent: "Asia", local: "\u65E5\u672C", aliases: ["japan", "nipon", "nippon"] },
  { iso: "DE", name: "Germany", flag: "\uD83C\uDDE9\uD83C\uDDEA", continent: "Europe", local: "Deutschland", aliases: ["germany", "deutschland", "de"] },
  { iso: "FR", name: "France", flag: "\uD83C\uDDEB\uD83C\uDDF7", continent: "Europe", local: "France", aliases: ["france", "fr"] },
  { iso: "KZ", name: "Kazakhstan", flag: "\uD83C\uDDF0\uD83C\uDDFF", continent: "Asia", local: "\u049A\u0430\u0437\u0430\u049B\u0441\u0442\u0430\u043D", aliases: ["kazakhstan", "qazaqstan", "kz"] },
  { iso: "RU", name: "Russia", flag: "\uD83C\uDDF7\uD83C\uDDFA", continent: "Europe", local: "\u0420\u043E\u0441\u0441\u0438\u044F", aliases: ["russia", "russian federation", "rossiya", "ru"] },
  { iso: "CN", name: "China", flag: "\uD83C\uDDE8\uD83C\uDDF3", continent: "Asia", local: "\u4E2D\u56FD", aliases: ["china", "prc"] },
  { iso: "KR", name: "South Korea", flag: "\uD83C\uDDF0\uD83C\uDDF7", continent: "Asia", local: "\uB300\uD55C\uBBFC\uAD6D", aliases: ["south korea", "korea", "republic of korea", "rok"] },
  { iso: "SG", name: "Singapore", flag: "\uD83C\uDDF8\uD83C\uDDEC", continent: "Asia", local: "Singapore", aliases: ["singapore", "sg"] },
  { iso: "IN", name: "India", flag: "\uD83C\uDDEE\uD83C\uDDF3", continent: "Asia", local: "India", aliases: ["india", "bharat", "in"] },
  { iso: "CA", name: "Canada", flag: "\uD83C\uDDE8\uD83C\uDDE6", continent: "North America", local: "Canada", aliases: ["canada", "ca"] },
  { iso: "AU", name: "Australia", flag: "\uD83C\uDDE6\uD83C\uDDFA", continent: "Oceania", local: "Australia", aliases: ["australia", "au"] },
  { iso: "NZ", name: "New Zealand", flag: "\uD83C\uDDF3\uD83C\uDDFF", continent: "Oceania", local: "New Zealand", aliases: ["new zealand", "nz", "aotearoa"] },
  { iso: "CH", name: "Switzerland", flag: "\uD83C\uDDE8\uD83C\uDDED", continent: "Europe", local: "Schweiz", aliases: ["switzerland", "suisse", "schweiz", "ch"] },
  { iso: "NL", name: "Netherlands", flag: "\uD83C\uDDF3\uD83C\uDDF1", continent: "Europe", local: "Nederland", aliases: ["netherlands", "holland", "nl"] },
  { iso: "BE", name: "Belgium", flag: "\uD83C\uDDE7\uD83C\uDDEA", continent: "Europe", local: "Belgi\u00EB", aliases: ["belgium", "be"] },
  { iso: "SE", name: "Sweden", flag: "\uD83C\uDDF8\uD83C\uDDEA", continent: "Europe", local: "Sverige", aliases: ["sweden", "sverige", "se"] },
  { iso: "DK", name: "Denmark", flag: "\uD83C\uDDE9\uD83C\uDDF0", continent: "Europe", local: "Danmark", aliases: ["denmark", "danmark", "dk"] },
  { iso: "FI", name: "Finland", flag: "\uD83C\uDDEB\uD83C\uDDEE", continent: "Europe", local: "Suomi", aliases: ["finland", "suomi", "fi"] },
  { iso: "NO", name: "Norway", flag: "\uD83C\uDDF3\uD83C\uDDF4", continent: "Europe", local: "Norge", aliases: ["norway", "norge", "no"] },
  { iso: "AT", name: "Austria", flag: "\uD83C\uDDE6\uD83C\uDDF9", continent: "Europe", local: "\u00D6sterreich", aliases: ["austria", "\u00f6sterreich", "at"] },
  { iso: "ES", name: "Spain", flag: "\uD83C\uDDEA\uD83C\uDDF8", continent: "Europe", local: "Espa\u00F1a", aliases: ["spain", "espana", "es"] },
  { iso: "IT", name: "Italy", flag: "\uD83C\uDDEE\uD83C\uDDF9", continent: "Europe", local: "Italia", aliases: ["italy", "italia", "it"] },
  { iso: "UZ", name: "Uzbekistan", flag: "\uD83C\uDDFA\uD83C\uDDFF", continent: "Asia", local: "O\u2018zbekiston", aliases: ["uzbekistan", "uz"] },
  { iso: "TR", name: "Turkey", flag: "\uD83C\uDDF9\uD83C\uDDF7", continent: "Asia", local: "T\u00FCrkiye", aliases: ["turkey", "turkiye", "tr"] },
  { iso: "TH", name: "Thailand", flag: "\uD83C\uDDF9\uD83C\uDDED", continent: "Asia", local: "\u0E44\u0E17\u0E22", aliases: ["thailand", "thai", "th"] },
  { iso: "BR", name: "Brazil", flag: "\uD83C\uDDE7\uD83C\uDDF7", continent: "South America", local: "Brasil", aliases: ["brazil", "brasil", "br"] },
  { iso: "AR", name: "Argentina", flag: "\uD83C\uDDE6\uD83C\uDDF7", continent: "South America", local: "Argentina", aliases: ["argentina", "ar"] },
  { iso: "MX", name: "Mexico", flag: "\uD83C\uDDF2\uD83C\uDDFD", continent: "North America", local: "M\u00E9xico", aliases: ["mexico", "mx"] },
  { iso: "ZA", name: "South Africa", flag: "\uD83C\uDDFF\uD83C\uDDE6", continent: "Africa", local: "South Africa", aliases: ["south africa", "za"] },
  { iso: "EG", name: "Egypt", flag: "\uD83C\uDDEA\uD83C\uDDEC", continent: "Africa", local: "Mi\u1E63r", aliases: ["egypt", "eg"] },
  { iso: "PL", name: "Poland", flag: "\uD83C\uDDF5\uD83C\uDDF1", continent: "Europe", local: "Polska", aliases: ["poland", "polska", "pl"] },
  { iso: "IE", name: "Ireland", flag: "\uD83C\uDDEE\uD83C\uDDEA", continent: "Europe", local: "\u00C9ire", aliases: ["ireland", "\u00e9ire", "ie"] }
];

var COUNTRY_BY_ISO = {};
COUNTRIES.forEach(function (c) { COUNTRY_BY_ISO[c.iso] = c; });

/* ------------------------------ Institutions ---------------------------- */
/* sources uses compact keys expanded by sourcesFor():
 *   official | gov | academic | external | userGen   (abs -> About source)  */

var INSTITUTIONS_1 = [
  { id: "mit", name: "Massachusetts Institute of Technology", short: "MIT", abbrs: ["MIT"], aliases: ["MIT Institute"], local: { ru: "\u041C\u0430\u0441\u0441\u0430\u0447\u0443\u0441\u0435\u0442\u0441\u043A\u0438\u0439 \u0442\u0435\u0445\u043D\u043E\u043B\u043E\u0433\u0438\u0447\u0435\u0441\u043A\u0438\u0439 \u0438\u043D\u0441\u0442\u0438\u0442\u0443\u0442", zh: "\u9EBB\u7701\u7406\u5DE5\u5B66\u9662" }, types: ["institute", "research", "university"], fields: ["engineering", "computer-science", "science", "business"], country: "US", city: "Cambridge", region: "Massachusetts", address: "77 Massachusetts Avenue, Cambridge, MA", lat: 42.3601, lng: -71.0942, website: "https://mit.edu", founded: 1861, desc: "Research institute and university in Cambridge, Massachusetts, founded 1861.", programs: ["Computer Science", "Mechanical Engineering", "Physics", "Economics"], accr: ["NEASC", "AAU"], ext: { wikidata: "Q49108" }, sources: { official: "https://mit.edu", academic: "https://en.wikipedia.org/wiki/Massachusetts_Institute_of_Technology" }, foundedSrc: "Official institution website", conflicts: [{ fact: "Founded", a: { v: 1861, s: "Official institution website" }, b: { v: 1862, s: "Academic source (encyclopedia)" } }] },
  { id: "harvard", name: "Harvard University", short: "Harvard", abbrs: [], aliases: ["Harvard College"], local: { ru: "\u0413\u0430\u0440\u0432\u0430\u0440\u0434\u0441\u043A\u0438\u0439 \u0443\u043D\u0438\u0432\u0435\u0440\u0441\u0438\u0442\u0435\u0442" }, types: ["university"], fields: ["law", "business", "medicine", "arts"], country: "US", city: "Cambridge", region: "Massachusetts", address: "Massachusetts Hall, Cambridge, MA", lat: 42.377, lng: -71.1166, website: "https://harvard.edu", founded: 1636, desc: "Private Ivy League research university in Cambridge, Massachusetts, founded 1636.", programs: ["Law", "Business Administration", "Medicine", "Economics"], accr: ["NEASC"], ext: { wikidata: "Q13371" }, sources: { official: "https://harvard.edu", academic: "https://en.wikipedia.org/wiki/Harvard_University" }, foundedSrc: "Official institution website" },
  { id: "stanford", name: "Stanford University", short: "Stanford", abbrs: [], aliases: ["Leland Stanford Junior University"], local: {}, types: ["university", "research"], fields: ["engineering", "computer-science", "business", "medicine"], country: "US", city: "Stanford", region: "California", address: "450 Serra Mall, Stanford, CA", lat: 37.4275, lng: -122.1697, website: "https://stanford.edu", founded: 1885, desc: "Private research university in Stanford, California.", programs: ["Computer Science", "Business", "Engineering", "Medicine"], accr: ["WASC"], ext: { wikidata: "Q41506" }, sources: { official: "https://stanford.edu" }, foundedSrc: "Official institution website" },
  { id: "duke", name: "Duke University", short: "Duke", abbrs: [], aliases: ["Duke"], local: {}, types: ["university"], fields: ["medicine", "business", "law", "engineering"], country: "US", city: "Durham", region: "North Carolina", address: "Durham, North Carolina", lat: 36.0014, lng: -78.9382, website: "https://duke.edu", founded: 1838, desc: "Private research university in Durham, North Carolina.", programs: ["Medicine", "Public Policy", "Engineering"], accr: ["SACS"], ext: { wikidata: "Q168751" }, sources: { official: "https://duke.edu", academic: "https://en.wikipedia.org/wiki/Duke_University" }, foundedSrc: "Official institution website" },
  { id: "yale", name: "Yale University", short: "Yale", abbrs: [], aliases: ["Yale College"], local: {}, types: ["university"], fields: ["law", "arts", "science", "medicine"], country: "US", city: "New Haven", region: "Connecticut", address: "New Haven, Connecticut", lat: 41.3163, lng: -72.9223, website: "https://yale.edu", founded: 1701, desc: "Private Ivy League research university in New Haven, Connecticut.", programs: ["Law", "Medicine", "Computer Science"], accr: ["NEASC"], ext: { wikidata: "Q49112" }, sources: { official: "https://yale.edu" }, foundedSrc: "Official institution website" },
  { id: "columbia", name: "Columbia University", short: "Columbia", abbrs: [], aliases: ["Columbia University in the City of New York"], local: {}, types: ["university"], fields: ["journalism", "medicine", "law", "arts"], country: "US", city: "New York", region: "New York", address: "116th St and Broadway, New York, NY", lat: 40.8075, lng: -73.9626, website: "https://columbia.edu", founded: 1754, desc: "Private Ivy League research university in New York City.", programs: ["Journalism", "Medicine", "Law", "Economics"], accr: ["MSCHE"], ext: { wikidata: "Q49088" }, sources: { official: "https://columbia.edu" }, foundedSrc: "Official institution website" },
  { id: "nyu", name: "New York University", short: "NYU", abbrs: ["NYU"], aliases: ["NYU"], local: {}, types: ["university"], fields: ["arts", "business", "law", "engineering"], country: "US", city: "New York", region: "New York", address: "New York, NY", lat: 40.7295, lng: -73.9965, website: "https://nyu.edu", founded: 1831, desc: "Private research university in New York City.", programs: ["Film", "Business", "Computer Science"], accr: ["MSCHE"], ext: { wikidata: "Q49210" }, sources: { official: "https://nyu.edu" }, foundedSrc: "Official institution website" },
  { id: "ucla", name: "University of California, Los Angeles", short: "UCLA", abbrs: ["UCLA"], aliases: ["UCLA", "University of California Los Angeles"], local: {}, types: ["university", "research"], fields: ["film", "engineering", "medicine", "science"], country: "US", city: "Los Angeles", region: "California", address: "Los Angeles, California", lat: 34.0689, lng: -118.4452, website: "https://ucla.edu", founded: 1919, desc: "Public research university in Los Angeles, California.", programs: ["Film and Television", "Engineering", "Medicine"], accr: ["WASC"], ext: { wikidata: "Q174710" }, sources: { official: "https://ucla.edu", academic: "https://en.wikipedia.org/wiki/University_of_California%2C_Los_Angeles" }, foundedSrc: "Official institution website" },
  { id: "michigan-state", name: "Michigan State University", short: "MSU", abbrs: ["MSU"], aliases: ["Michigan State", "MSU"], local: {}, types: ["university"], fields: ["agriculture", "business", "medicine", "education"], country: "US", city: "East Lansing", region: "Michigan", address: "East Lansing, Michigan", lat: 42.7018, lng: -84.4822, website: "https://msu.edu", founded: 1855, desc: "Public land-grant research university in East Lansing, Michigan.", programs: ["Agriculture", "Business", "Education", "Medicine"], accr: ["HLC"], ext: { wikidata: "Q1135943" }, sources: { official: "https://msu.edu", gov: "https://www.usa.gov" }, foundedSrc: "Official institution website" },
  { id: "mississippi-state", name: "Mississippi State University", short: "MSU", abbrs: ["MSU"], aliases: ["Mississippi State", "MSU"], local: {}, types: ["university"], fields: ["engineering", "agriculture", "architecture"], country: "US", city: "Starkville", region: "Mississippi", address: "Starkville, Mississippi", lat: 33.4545, lng: -88.7885, website: "https://msstate.edu", founded: 1878, desc: "Public land-grant research university in Starkville, Mississippi.", programs: ["Engineering", "Agriculture", "Architecture"], accr: ["SACS"], ext: { wikidata: "Q1504671" }, sources: { official: "https://msstate.edu", gov: "https://www.usa.gov" }, foundedSrc: "Official institution website" },
  { id: "dartmouth", name: "Dartmouth College", short: "Dartmouth", abbrs: [], aliases: [], local: {}, types: ["college", "university"], fields: ["liberal-arts", "engineering", "medicine"], country: "US", city: "Hanover", region: "New Hampshire", address: "Hanover, New Hampshire", lat: 43.7044, lng: -72.2887, website: "https://dartmouth.edu", founded: 1769, desc: "Private Ivy League college and graduate schools in Hanover, New Hampshire.", programs: ["Liberal Arts", "Engineering", "Medicine"], accr: ["NEASC"], ext: { wikidata: "Q49116" }, sources: { official: "https://dartmouth.edu", academic: "https://en.wikipedia.org/wiki/Dartmouth_College" }, foundedSrc: "Official institution website" },
  { id: "berkeley", name: "University of California, Berkeley", short: "Berkeley", abbrs: ["UCB"], aliases: ["Cal", "UC Berkeley"], local: {}, types: ["university", "research"], fields: ["science", "engineering", "economics"], country: "US", city: "Berkeley", region: "California", address: "Berkeley, California", lat: 37.8715, lng: -122.273, website: "https://berkeley.edu", founded: 1868, desc: "Public research university in Berkeley, California.", programs: ["Physics", "Computer Science", "Economics"], accr: ["WASC"], ext: { wikidata: "Q168756" }, sources: { official: "https://berkeley.edu", gov: "https://www.usa.gov" }, foundedSrc: "Official institution website" }
];
var INSTITUTIONS_2 = [
  { id: "oxford", name: "University of Oxford", short: "Oxford", abbrs: ["Oxon"], aliases: ["Oxford University", "Oxford"], local: {}, types: ["university"], fields: ["law", "science", "arts", "medicine"], country: "GB", city: "Oxford", region: "Oxfordshire", address: "Oxford, England", lat: 51.7548, lng: -1.2544, website: "https://ox.ac.uk", founded: 1096, desc: "Collegiate research university in Oxford with evidence of teaching since 1096.", programs: ["Law", "Philosophy", "Medicine", "Chemistry"], accr: ["QAA"], ext: { wikidata: "Q34433" }, sources: { official: "https://www.ox.ac.uk", academic: "https://en.wikipedia.org/wiki/University_of_Oxford" }, foundedSrc: "Official institution website" },
  { id: "cambridge", name: "University of Cambridge", short: "Cambridge", abbrs: ["Cantab"], aliases: ["Cambridge University", "Cambridge"], local: {}, types: ["university"], fields: ["science", "engineering", "law", "arts"], country: "GB", city: "Cambridge", region: "Cambridgeshire", address: "Cambridge, England", lat: 52.2053, lng: 0.1218, website: "https://cam.ac.uk", founded: 1209, desc: "Collegiate research university in Cambridge, England, founded around 1209.", programs: ["Computer Science", "Medicine", "Law", "Mathematics"], accr: ["QAA"], ext: { wikidata: "Q35794" }, sources: { official: "https://www.cam.ac.uk", academic: "https://en.wikipedia.org/wiki/University_of_Cambridge" }, foundedSrc: "Official institution website" },
  { id: "imperial", name: "Imperial College London", short: "Imperial", abbrs: ["ICL"], aliases: ["Imperial College", "Imperial College London"], local: {}, types: ["university", "research"], fields: ["engineering", "medicine", "science"], country: "GB", city: "London", region: "Greater London", address: "South Kensington, London", lat: 51.4988, lng: -0.1749, website: "https://imperial.ac.uk", founded: 1907, desc: "Public research university specialising in science, engineering, medicine and business.", programs: ["Engineering", "Medicine", "Physics", "Mathematics"], accr: ["QAA"], ext: { wikidata: "Q189022" }, sources: { official: "https://www.imperial.ac.uk", academic: "https://en.wikipedia.org/wiki/Imperial_College_London" }, foundedSrc: "Official institution website" },
  { id: "lse", name: "London School of Economics and Political Science", short: "LSE", abbrs: ["LSE"], aliases: ["London School of Economics", "LSE"], local: {}, types: ["school", "university"], fields: ["economics", "social-sciences", "law"], country: "GB", city: "London", region: "Greater London", address: "Houghton Street, London", lat: 51.5144, lng: -0.1166, website: "https://lse.ac.uk", founded: 1895, desc: "Public research university specialising in the social sciences.", programs: ["Economics", "Politics", "Law", "Finance"], accr: ["QAA"], ext: { wikidata: "Q174528" }, sources: { official: "https://www.lse.ac.uk", academic: "https://en.wikipedia.org/wiki/London_School_of_Economics" }, foundedSrc: "Official institution website" },
  { id: "edinburgh", name: "University of Edinburgh", short: "Edinburgh", abbrs: [], aliases: ["Edinburgh University"], local: {}, types: ["university"], fields: ["medicine", "science", "arts", "informatics"], country: "GB", city: "Edinburgh", region: "Scotland", address: "Old College, Edinburgh", lat: 55.9476, lng: -3.1873, website: "https://ed.ac.uk", founded: 1582, desc: "Public research university in Edinburgh, Scotland, founded 1582.", programs: ["Medicine", "Informatics", "Law", "Veterinary Medicine"], accr: ["QAA"], ext: { wikidata: "Q160302" }, sources: { official: "https://www.ed.ac.uk", gov: "https://www.gov.scot" }, foundedSrc: "Official institution website" },
  { id: "tokyo", name: "University of Tokyo", short: "UTokyo", abbrs: ["UTokyo", "UT"], aliases: ["Tokyo University", "Todai", "\u6771\u5927", "The University of Tokyo"], local: { ja: "\u6771\u4EAC\u5927\u5B66", zh: "\u4E1C\u4EAC\u5927\u5B66" }, types: ["university", "research"], fields: ["engineering", "science", "medicine", "law", "arts"], country: "JP", city: "Tokyo", region: "Tokyo", address: "7-3-1 Hongo, Bunkyo, Tokyo", lat: 35.7135, lng: 139.7617, website: "https://u-tokyo.ac.jp", founded: 1877, desc: "National research university in Tokyo, founded 1877.", programs: ["Engineering", "Law", "Medicine", "Physics"], accr: ["MEXT"], ext: { wikidata: "Q149703" }, sources: { official: "https://www.u-tokyo.ac.jp", gov: "https://www.mext.go.jp", academic: "https://en.wikipedia.org/wiki/University_of_Tokyo" }, foundedSrc: "Official institution website", conflicts: [{ fact: "Founded", a: { v: 1877, s: "Official institution website" }, b: { v: 1886, s: "Government source (MEXT registry)" } }] },
  { id: "kyoto", name: "Kyoto University", short: "Kyoto", abbrs: [], aliases: ["Kyodai"], local: { ja: "\u4EAC\u90FD\u5927\u5B66" }, types: ["university", "research"], fields: ["science", "engineering", "medicine"], country: "JP", city: "Kyoto", region: "Kyoto", address: "Yoshida-honmachi, Sakyo, Kyoto", lat: 35.0261, lng: 135.7808, website: "https://kyoto-u.ac.jp", founded: 1897, desc: "National research university in Kyoto, known for science.", programs: ["Physics", "Medicine", "Engineering"], accr: ["MEXT"], ext: { wikidata: "Q336264" }, sources: { official: "https://www.kyoto-u.ac.jp", gov: "https://www.mext.go.jp" }, foundedSrc: "Official institution website" },
  { id: "osaka", name: "Osaka University", short: "Osaka", abbrs: [], aliases: ["Handai"], local: { ja: "\u5927\u962A\u5927\u5B66" }, types: ["university"], fields: ["engineering", "medicine", "science"], country: "JP", city: "Osaka", region: "Osaka", address: "Suita, Osaka", lat: 34.8172, lng: 135.5258, website: "https://osaka-u.ac.jp", founded: 1931, desc: "National research university in Osaka Prefecture.", programs: ["Engineering", "Medicine", "Science"], accr: ["MEXT"], ext: { wikidata: "Q287767" }, sources: { official: "https://www.osaka-u.ac.jp", gov: "https://www.mext.go.jp" }, foundedSrc: "Official institution website" },
  { id: "tohoku", name: "Tohoku University", short: "Tohoku", abbrs: [], aliases: [], local: { ja: "\u6771\u5317\u5927\u5B66" }, types: ["university"], fields: ["engineering", "materials", "medicine", "science"], country: "JP", city: "Sendai", region: "Miyagi", address: "Aoba, Sendai", lat: 38.2539, lng: 140.8742, website: "https://tohoku.ac.jp", founded: 1907, desc: "National research university in Sendai, Japan.", programs: ["Materials Science", "Engineering", "Medicine"], accr: ["MEXT"], ext: { wikidata: "Q1158015" }, sources: { official: "https://www.tohoku.ac.jp", gov: "https://www.mext.go.jp" }, foundedSrc: "Official institution website" },
  { id: "waseda", name: "Waseda University", short: "Waseda", abbrs: [], aliases: ["Sodai"], local: { ja: "\u65E9\u7A32\u7530\u5927\u5B66" }, types: ["university"], fields: ["political-science", "engineering", "arts"], country: "JP", city: "Tokyo", region: "Tokyo", address: "Shinjuku, Tokyo", lat: 35.7088, lng: 139.7193, website: "https://waseda.jp", founded: 1882, desc: "Private research university in Tokyo.", programs: ["Political Science", "Engineering", "Literature"], accr: ["JUAA"], ext: { wikidata: "Q248780" }, sources: { official: "https://www.waseda.jp", gov: "https://www.mext.go.jp" }, foundedSrc: "Official institution website" },
  { id: "hokkaido", name: "Hokkaido University", short: "Hokkaido", abbrs: [], aliases: ["Hokudai"], local: { ja: "\u5317\u6D77\u9053\u5927\u5B66" }, types: ["university"], fields: ["agriculture", "science", "medicine"], country: "JP", city: "Sapporo", region: "Hokkaido", address: "Kita, Sapporo", lat: 43.0785, lng: 141.3407, website: "https://hokudai.ac.jp", founded: 1876, desc: "National research university in Sapporo, Hokkaido.", programs: ["Agriculture", "Science", "Medicine"], accr: ["MEXT"], ext: { wikidata: "Q1335427" }, sources: { official: "https://www.hokudai.ac.jp", gov: "https://www.mext.go.jp" }, foundedSrc: "Official institution website" },
  { id: "tum", name: "Technical University of Munich", short: "TUM", abbrs: ["TUM"], aliases: ["TU Munich", "Technical University Munich"], local: { de: "Technische Universit\u00E4t M\u00FCnchen" }, types: ["university", "polytechnic", "research"], fields: ["engineering", "computer-science", "science"], country: "DE", city: "Munich", region: "Bavaria", address: "Arcisstra\u00DFe 21, Munich", lat: 48.1497, lng: 11.5681, website: "https://tum.de", founded: 1868, desc: "Public research university in Bavaria focused on engineering and technology.", programs: ["Mechanical Engineering", "Informatics", "Physics"], accr: ["ACQUIN"], ext: { wikidata: "Q157870" }, sources: { official: "https://www.tum.de", gov: "https://www.bayern.de", academic: "https://en.wikipedia.org/wiki/Technical_University_of_Munich" }, foundedSrc: "Official institution website" },
  { id: "heidelberg", name: "Heidelberg University", short: "Heidelberg", abbrs: [], aliases: ["Ruprecht-Karls-Universit\u00E4t", "Heidelberg University"], local: { de: "Ruprecht-Karls-Universit\u00E4t Heidelberg" }, types: ["university", "research"], fields: ["medicine", "science", "law", "arts"], country: "DE", city: "Heidelberg", region: "Baden-W\u00FCrttemberg", address: "Grabengasse 1, Heidelberg", lat: 49.4094, lng: 8.7064, website: "https://uni-heidelberg.de", founded: 1386, desc: "Public research university in Heidelberg, Germany's oldest.", programs: ["Medicine", "Physics", "Law", "Philosophy"], accr: ["WR"], ext: { wikidata: "Q151510" }, sources: { official: "https://www.uni-heidelberg.de", gov: "https://www.baden-wuerttemberg.de" }, foundedSrc: "Official institution website" },
  { id: "humboldt", name: "Humboldt University of Berlin", short: "HU Berlin", abbrs: ["HU"], aliases: ["Humboldt-Universit\u00E4t zu Berlin", "Humboldt University"], local: { de: "Humboldt-Universit\u00E4t zu Berlin" }, types: ["university"], fields: ["arts", "science", "law"], country: "DE", city: "Berlin", region: "Berlin", address: "Unter den Linden 6, Berlin", lat: 52.5181, lng: 13.3936, website: "https://hu-berlin.de", founded: 1810, desc: "Public research university in central Berlin, founded 1810.", programs: ["Philosophy", "Biology", "Law"], accr: ["WR"], ext: { wikidata: "Q152087" }, sources: { official: "https://www.hu-berlin.de", gov: "https://www.berlin.de" }, foundedSrc: "Official institution website" },
  { id: "rwth", name: "RWTH Aachen University", short: "RWTH", abbrs: ["RWTH"], aliases: ["RWTH Aachen", "Rheinisch-Westf\u00E4lische Technische Hochschule Aachen"], local: { de: "RWTH Aachen" }, types: ["university", "polytechnic"], fields: ["engineering", "medicine", "computer-science"], country: "DE", city: "Aachen", region: "North Rhine-Westphalia", address: "Templergraben 55, Aachen", lat: 50.7781, lng: 6.0724, website: "https://rwth-aachen.de", founded: 1870, desc: "Technical university in Aachen, among the largest in Europe.", programs: ["Mechanical Engineering", "Electrical Engineering", "Computer Science", "Medicine"], accr: ["ACQUIN"], ext: { wikidata: "Q273263" }, sources: { official: "https://www.rwth-aachen.de", gov: "https://www.nrw.de" }, foundedSrc: "Official institution website" },
  { id: "kit", name: "Karlsruhe Institute of Technology", short: "KIT", abbrs: ["KIT"], aliases: ["KIT", "Karlsruhe Institute of Technology"], local: { de: "Karlsruher Institut f\u00FCr Technologie" }, types: ["institute", "university", "research"], fields: ["engineering", "computer-science", "science"], country: "DE", city: "Karlsruhe", region: "Baden-W\u00FCrttemberg", address: "Kaiserstra\u00DFe 12, Karlsruhe", lat: 49.01, lng: 8.4151, website: "https://kit.edu", founded: 1825, desc: "Public research university and Helmholtz research centre in Karlsruhe.", programs: ["Mechanical Engineering", "Computer Science", "Physics"], accr: ["ACQUIN"], ext: { wikidata: "Q816270" }, sources: { official: "https://www.kit.edu", gov: "https://www.helmholtz.de" }, foundedSrc: "Official institution website" }
];
var INSTITUTIONS_3 = [
  { id: "sorbonne", name: "Sorbonne University", short: "Sorbonne", abbrs: [], aliases: ["Paris-Sorbonne", "Sorbonne Universit\u00E9"], local: { fr: "Sorbonne Universit\u00E9" }, types: ["university"], fields: ["science", "arts", "medicine"], country: "FR", city: "Paris", region: "\u00CEle-de-France", address: "21 rue de l'\u00C9cole de M\u00E9decine, Paris", lat: 48.8495, lng: 2.3425, website: "https://sorbonne-universite.fr", founded: 1253, desc: "Public research university in Paris, continuing the historical Sorbonne.", programs: ["Physics", "Medicine", "History", "Mathematics"], accr: ["HCERES"], ext: { wikidata: "Q666610" }, sources: { official: "https://www.sorbonne-universite.fr", gov: "https://www.enseignement-superieur.gouv.fr" }, foundedSrc: "Official institution website" },
  { id: "ens", name: "\u00C9cole Normale Sup\u00E9rieure", short: "ENS", abbrs: ["ENS"], aliases: ["Ecole Normale Superieure", "ENS Paris"], local: { fr: "\u00C9cole normale sup\u00E9rieure" }, types: ["academy", "university"], fields: ["science", "arts", "philosophy"], country: "FR", city: "Paris", region: "\u00CEle-de-France", address: "45 rue d'Ulm, Paris", lat: 48.8422, lng: 2.3436, website: "https://ens.fr", founded: 1794, desc: "Elite \u00E9cole normale sup\u00E9rieure (academy) in Paris founded 1794.", programs: ["Mathematics", "Philosophy", "Physics", "Literature"], accr: ["HCERES"], ext: { wikidata: "Q273563" }, sources: { official: "https://www.ens.fr", gov: "https://www.enseignement-superieur.gouv.fr" }, foundedSrc: "Official institution website" },
  { id: "al-farabi", name: "Al-Farabi Kazakh National University", short: "KazNU", abbrs: ["KazNU"], aliases: ["Al-Farabi University", "Kazakh National University"], local: { kk: "\u04D8\u043B-\u0424\u0430\u0440\u0430\u0431\u0438 \u0430\u0442\u044B\u043D\u0434\u0430\u0493\u044B \u049A\u0430\u0437\u049B\u04B1 \u04B1\u043B\u0442\u0442\u044B\u049B \u0443\u043D\u0438\u0432\u0435\u0440\u0441\u0438\u0442\u0435\u0442\u0456" }, types: ["university"], fields: ["science", "engineering", "economics", "medicine", "law"], country: "KZ", city: "Almaty", region: "Almaty", address: "Al-Farabi Ave 71, Almaty", lat: 43.222, lng: 76.8512, website: "https://kaznu.kz", founded: 1934, desc: "Largest national university of Kazakhstan, based in Almaty.", programs: ["Computer Science", "Medicine", "Economics", "International Relations"], accr: ["MES RK"], ext: { wikidata: "Q1259209" }, sources: { official: "https://www.kaznu.kz", gov: "https://www.gov.kz" }, foundedSrc: "Official institution website" },
  { id: "astana-it", name: "Astana IT University", short: "AITU", abbrs: ["AITU"], aliases: ["Astana IT University", "AITU"], local: { kk: "Astana IT University" }, types: ["institute", "university"], fields: ["computer-science", "engineering", "data-science"], country: "KZ", city: "Astana", region: "Astana", address: "Mangilik El 55/11, Astana", lat: 51.0908, lng: 71.4171, website: "https://astanait.edu.kz", founded: 2019, desc: "Specialised IT university in Astana, Kazakhstan, opened 2019.", programs: ["Computer Science", "Data Science", "Cybersecurity"], accr: ["MES RK"], ext: { wikidata: "Q97197489" }, sources: { official: "https://astanait.edu.kz", gov: "https://www.gov.kz" }, foundedSrc: "Official institution website" },
  { id: "kazakh-british", name: "Kazakh-British Technical University", short: "KBTU", abbrs: ["KBTU"], aliases: ["Kazakh-British Technical University", "KBTU"], local: { kk: "\u049A\u0430\u0437\u0430\u049B-\u0411\u0440\u0438\u0442\u0430\u043D \u0442\u0435\u0445\u043D\u0438\u043A\u0430\u043B\u044B\u049B \u0443\u043D\u0438\u0432\u0435\u0440\u0441\u0438\u0442\u0435\u0442\u0456" }, types: ["university", "institute"], fields: ["engineering", "computer-science", "business"], country: "KZ", city: "Almaty", region: "Almaty", address: "Tole Bi 59, Almaty", lat: 43.2389, lng: 76.945, website: "https://kbtu.edu.kz", founded: 2001, desc: "Engineering and business university in Almaty founded in partnership with UK HEIs.", programs: ["Petroleum Engineering", "Computer Science", "Business Administration"], accr: ["MES RK"], ext: { wikidata: "Q4210274" }, sources: { official: "https://kbtu.edu.kz", gov: "https://www.gov.kz" }, foundedSrc: "Official institution website" },
  { id: "karaganda-medical", name: "Karaganda Medical University", short: "KMU", abbrs: ["KMU"], aliases: ["Karaganda Medical University", "KMU"], local: { kk: "\u049A\u0430\u0440\u0430\u0493\u0430\u043D\u0434\u044B \u043C\u0435\u0434\u0438\u0446\u0438\u043D\u0430 \u0443\u043D\u0438\u0432\u0435\u0440\u0441\u0438\u0442\u0435\u0442\u0456" }, types: ["medical", "university"], fields: ["medicine", "dentistry", "pharmacy"], country: "KZ", city: "Karaganda", region: "Karaganda Region", address: "Gogol St 40, Karaganda", lat: 49.8047, lng: 73.1094, website: "https://qmu.edu.kz", founded: 1950, desc: "Medical university in Karaganda with faculties of medicine, dentistry and pharmacy.", programs: ["General Medicine", "Dentistry", "Pharmacy", "Pediatrics"], accr: ["MES RK"], ext: { wikidata: "Q28666080" }, sources: { official: "https://qmu.edu.kz", gov: "https://www.gov.kz" }, foundedSrc: "Official institution website" },
  { id: "kazakh-national-medical", name: "Kazakh National Medical University", short: "KazNMU", abbrs: ["KazNMU"], aliases: ["Asfendiyarov Kazakh National Medical University", "KazNMU"], local: { kk: "\u0421.\u0414.\u0410\u0441\u0444\u0435\u043D\u0434\u0438\u044F\u0440\u043E\u0432 \u0430\u0442\u044B\u043D\u0434\u0430\u0493\u044B \u049A\u0430\u0437\u049B\u04B0 \u043C\u0435\u0434\u0438\u0446\u0438\u043D\u0430 \u0443\u043D\u0438\u0432\u0435\u0440\u0441\u0438\u0442\u0435\u0442\u0456" }, types: ["medical", "university"], fields: ["medicine", "pharmacy", "public-health"], country: "KZ", city: "Almaty", region: "Almaty", address: "Tole Bi 94, Almaty", lat: 43.2319, lng: 76.9584, website: "https://kaznmu.kz", founded: 1930, desc: "One of Central Asia's oldest medical universities, in Almaty.", programs: ["General Medicine", "Pharmacy", "Public Health", "Nursing"], accr: ["MES RK"], ext: { wikidata: "Q4209094" }, sources: { official: "https://kaznmu.kz", gov: "https://www.gov.kz" }, foundedSrc: "Official institution website" },
  { id: "west-kazakhstan-medical", name: "West Kazakhstan Marat Ospanov Medical University", short: "WKSMU", abbrs: ["WKSMU"], aliases: ["M. Ospanov West Kazakhstan Medical University", "West Kazakhstan Medical University"], local: { kk: "\u041C.\u041E\u0441\u043F\u0430\u043D\u043E\u0432 \u0430\u0442\u044B\u043D\u0434\u0430\u0493\u044B \u0411\u0430\u0442\u044B\u0441 \u049A\u0430\u0437\u0430\u049B\u0441\u0442\u0430\u043D \u043C\u0435\u0434\u0438\u0446\u0438\u043D\u0430 \u0443\u043D\u0438\u0432\u0435\u0440\u0441\u0438\u0442\u0435\u0442\u0456" }, types: ["medical", "university"], fields: ["medicine", "dentistry"], country: "KZ", city: "Oral", region: "West Kazakhstan Region", address: "Maresyev St 68, Oral", lat: 51.2278, lng: 51.3865, website: "https://zkmu.edu.kz", founded: 1997, desc: "Medical university in Oral (Uralsk), West Kazakhstan Region.", programs: ["General Medicine", "Dentistry", "Nursing"], accr: ["MES RK"], ext: { wikidata: "Q108818701" }, sources: { official: "https://zkmu.edu.kz", gov: "https://www.gov.kz" }, foundedSrc: "Official institution website" },
  { id: "moscow-state", name: "Lomonosov Moscow State University", short: "MSU", abbrs: ["MSU", "MGU"], aliases: ["Moscow State University", "Lomonosov University", "MGU", "\u041C\u0413\u0423"], local: { ru: "\u041C\u043E\u0441\u043A\u043E\u0432\u0441\u043A\u0438\u0439 \u0433\u043E\u0441\u0443\u0434\u0430\u0440\u0441\u0442\u0432\u0435\u043D\u043D\u044B\u0439 \u0443\u043D\u0438\u0432\u0435\u0440\u0441\u0438\u0442\u0435\u0442 \u0438\u043C\u0435\u043D\u0438 \u041C.\u0412.\u041B\u043E\u043C\u043E\u043D\u043E\u0441\u043E\u0432\u0430" }, types: ["university", "research"], fields: ["science", "mathematics", "law", "economics"], country: "RU", city: "Moscow", region: "Moscow", address: "GSP-1, Leninskie Gory, Moscow", lat: 55.7036, lng: 37.5302, website: "https://msu.ru", founded: 1755, desc: "Public research university in Moscow, named after Mikhail Lomonosov.", programs: ["Mathematics", "Physics", "Law", "Economics"], accr: ["Rosobrnadzor"], ext: { wikidata: "Q13164" }, sources: { official: "https://www.msu.ru", gov: "https://www.edu.gov.ru" }, foundedSrc: "Official institution website" },
  { id: "hse", name: "HSE University", short: "HSE", abbrs: ["HSE"], aliases: ["Higher School of Economics", "National Research University Higher School of Economics"], local: { ru: "\u041D\u0438\u0443 \u0412\u0448\u044D" }, types: ["university", "research"], fields: ["economics", "computer-science", "social-sciences", "business"], country: "RU", city: "Moscow", region: "Moscow", address: "20 Myasnitskaya, Moscow", lat: 55.7655, lng: 37.6313, website: "https://hse.ru", founded: 1992, desc: "National research university with campuses in Moscow and elsewhere.", programs: ["Economics", "Data Science", "Political Science", "Design"], accr: ["Rosobrnadzor"], ext: { wikidata: "Q2513180" }, sources: { official: "https://www.hse.ru", gov: "https://www.edu.gov.ru" }, foundedSrc: "Official institution website" },
  { id: "tsinghua", name: "Tsinghua University", short: "Tsinghua", abbrs: ["THU"], aliases: ["Tsinghua"], local: { zh: "\u6E05\u534E\u5927\u5B66" }, types: ["university", "research"], fields: ["engineering", "computer-science", "business"], country: "CN", city: "Beijing", region: "Beijing", address: "30 Shuangqing Rd, Haidian, Beijing", lat: 40.0, lng: 116.3261, website: "https://tsinghua.edu.cn", founded: 1911, desc: "Public research university in Beijing, among China's most selective.", programs: ["Engineering", "Computer Science", "Economics and Management"], accr: ["MOE"], ext: { wikidata: "Q31575" }, sources: { official: "https://www.tsinghua.edu.cn", gov: "https://www.moe.gov.cn" }, foundedSrc: "Official institution website" },
  { id: "peking", name: "Peking University", short: "Peking", abbrs: ["PKU"], aliases: ["Beijing University", "PKU", "Peking University"], local: { zh: "\u5317\u4EAC\u5927\u5B66" }, types: ["university"], fields: ["science", "arts", "law", "medicine"], country: "CN", city: "Beijing", region: "Beijing", address: "5 Yiheyuan Rd, Haidian, Beijing", lat: 39.9856, lng: 116.3166, website: "https://pku.edu.cn", founded: 1898, desc: "National research university in Beijing, founded 1898.", programs: ["Physics", "Law", "Medicine", "Chinese Literature"], accr: ["MOE"], ext: { wikidata: "Q651636" }, sources: { official: "https://www.pku.edu.cn", gov: "https://www.moe.gov.cn" }, foundedSrc: "Official institution website" },
  { id: "fudan", name: "Fudan University", short: "Fudan", abbrs: [], aliases: ["Fudan"], local: { zh: "\u590D\u65E6\u5927\u5B66" }, types: ["university"], fields: ["science", "medicine", "economics", "arts"], country: "CN", city: "Shanghai", region: "Shanghai", address: "220 Handan Rd, Yangpu, Shanghai", lat: 31.2983, lng: 121.4933, website: "https://fudan.edu.cn", founded: 1905, desc: "Public research university in Shanghai founded 1905.", programs: ["Medicine", "Economics", "Physics", "Journalism"], accr: ["MOE"], ext: { wikidata: "Q495028" }, sources: { official: "https://www.fudan.edu.cn", gov: "https://www.moe.gov.cn" }, foundedSrc: "Official institution website" },
  { id: "snu", name: "Seoul National University", short: "SNU", abbrs: ["SNU"], aliases: ["Seoul National University", "Seoul University"], local: { ko: "\uC11C\uC6B8\uB300\uD559\uAD50" }, types: ["university", "research"], fields: ["engineering", "science", "medicine", "law"], country: "KR", city: "Seoul", region: "Seoul", address: "1 Gwanak-ro, Gwanak-gu, Seoul", lat: 37.4599, lng: 126.9518, website: "https://snu.ac.kr", founded: 1946, desc: "National research university in Seoul, Korea.", programs: ["Engineering", "Medicine", "Law", "Computer Science"], accr: ["MOE KR"], ext: { wikidata: "Q25500" }, sources: { official: "https://www.snu.ac.kr", gov: "https://www.moe.go.kr" }, foundedSrc: "Official institution website" },
  { id: "yonsei", name: "Yonsei University", short: "Yonsei", abbrs: ["YSU"], aliases: ["Yonsei"], local: { ko: "\uC5F0\uC138\uB300\uD559\uAD50" }, types: ["university"], fields: ["medicine", "business", "engineering", "social-sciences"], country: "KR", city: "Seoul", region: "Seoul", address: "50 Yonsei-ro, Seodaemun-gu, Seoul", lat: 37.5666, lng: 126.938, website: "https://yonsei.ac.kr", founded: 1885, desc: "Private research university in Seoul founded 1885 as a medical school.", programs: ["Medicine", "Business", "Engineering", "Psychology"], accr: ["MOE KR"], ext: { wikidata: "Q39985" }, sources: { official: "https://www.yonsei.ac.kr", gov: "https://www.moe.go.kr" }, foundedSrc: "Official institution website" }
];
var INSTITUTIONS_4 = [
  { id: "nus", name: "National University of Singapore", short: "NUS", abbrs: ["NUS"], aliases: ["National University of Singapore", "NUS"], local: { zh: "\u65B0\u52A0\u5761\u56FD\u7ACB\u5927\u5B66" }, types: ["university", "research"], fields: ["engineering", "computer-science", "business", "law"], country: "SG", city: "Singapore", region: "Singapore", address: "21 Lower Kent Ridge Rd, Singapore", lat: 1.2966, lng: 103.7764, website: "https://nus.edu.sg", founded: 1905, desc: "National research university of Singapore, founded 1905.", programs: ["Engineering", "Computer Science", "Law", "Medicine"], accr: ["MOE SG"], ext: { wikidata: "Q73826" }, sources: { official: "https://www.nus.edu.sg", gov: "https://www.moe.gov.sg" }, foundedSrc: "Official institution website" },
  { id: "iit-bombay", name: "Indian Institute of Technology Bombay", short: "IIT Bombay", abbrs: ["IITB", "IIT Bombay"], aliases: ["IIT Bombay", "Indian Institute of Technology, Bombay"], local: { hi: "\u092D\u093E\u0930\u0924\u0940\u092F \u092A\u094D\u0930\u094C\u0926\u094D\u092F\u094B\u0917\u093F\u0915\u0940 \u0938\u0902\u0938\u094D\u0925\u093E\u0928 \u092E\u0941\u092E\u094D\u092C\u0908" }, types: ["institute", "research"], fields: ["engineering", "computer-science", "science"], country: "IN", city: "Mumbai", region: "Maharashtra", address: "Powai, Mumbai, Maharashtra", lat: 19.1334, lng: 72.9133, website: "https://iitb.ac.in", founded: 1958, desc: "Public technical and research institute in Powai, Mumbai.", programs: ["Computer Science", "Mechanical Engineering", "Aerospace Engineering"], accr: ["AICTE"], ext: { wikidata: "Q751505" }, sources: { official: "https://www.iitb.ac.in", gov: "https://www.education.gov.in" }, foundedSrc: "Official institution website" },
  { id: "toronto", name: "University of Toronto", short: "Toronto", abbrs: ["U of T"], aliases: ["University of Toronto", "U of T"], local: { fr: "Universit\u00E9 de Toronto" }, types: ["university", "research"], fields: ["computer-science", "medicine", "business", "arts"], country: "CA", city: "Toronto", region: "Ontario", address: "27 King's College Cir, Toronto", lat: 43.6629, lng: -79.3957, website: "https://utoronto.ca", founded: 1827, desc: "Public research university in Toronto, Canada's largest.", programs: ["Computer Science", "Medicine", "Business", "Engineering"], accr: ["OCUFA"], ext: { wikidata: "Q180865" }, sources: { official: "https://www.utoronto.ca", gov: "https://www.canada.ca" }, foundedSrc: "Official institution website" },
  { id: "ubc", name: "University of British Columbia", short: "UBC", abbrs: ["UBC"], aliases: ["University of British Columbia", "UBC"], local: {}, types: ["university", "research"], fields: ["forestry", "engineering", "medicine", "science"], country: "CA", city: "Vancouver", region: "British Columbia", address: "Vancouver, British Columbia", lat: 49.2606, lng: -123.246, website: "https://ubc.ca", founded: 1908, desc: "Public research university with main campus in Vancouver.", programs: ["Forestry", "Engineering", "Medicine", "Computer Science"], accr: ["AUCC"], ext: { wikidata: "Q391028" }, sources: { official: "https://www.ubc.ca", gov: "https://www.canada.ca" }, foundedSrc: "Official institution website" },
  { id: "mcgill", name: "McGill University", short: "McGill", abbrs: [], aliases: ["McGill University"], local: { fr: "Universit\u00E9 McGill" }, types: ["university"], fields: ["medicine", "law", "arts", "science"], country: "CA", city: "Montreal", region: "Quebec", address: "845 Sherbrooke St W, Montreal", lat: 45.5046, lng: -73.5772, website: "https://mcgill.ca", founded: 1821, desc: "Public research university in Montreal founded 1821.", programs: ["Medicine", "Law", "Neuroscience", "Engineering"], accr: ["AUCC"], ext: { wikidata: "Q201492" }, sources: { official: "https://www.mcgill.ca", gov: "https://www.quebec.ca" }, foundedSrc: "Official institution website" },
  { id: "melbourne", name: "University of Melbourne", short: "Melbourne", abbrs: [], aliases: ["Melbourne University"], local: {}, types: ["university", "research"], fields: ["medicine", "engineering", "arts", "science"], country: "AU", city: "Melbourne", region: "Victoria", address: "Grattan St, Parkville, Melbourne", lat: -37.7963, lng: 144.9614, website: "https://unimelb.edu.au", founded: 1853, desc: "Public research university in Melbourne, founded 1853.", programs: ["Medicine", "Law", "Engineering", "Commerce"], accr: ["TEQSA"], ext: { wikidata: "Q319078" }, sources: { official: "https://www.unimelb.edu.au", gov: "https://www.education.gov.au" }, foundedSrc: "Official institution website" },
  { id: "sydney", name: "University of Sydney", short: "Sydney", abbrs: [], aliases: ["Sydney University", "USYD"], local: {}, types: ["university"], fields: ["medicine", "law", "arts", "engineering"], country: "AU", city: "Sydney", region: "New South Wales", address: "Camperdown, Sydney, NSW", lat: -33.8886, lng: 151.1873, website: "https://sydney.edu.au", founded: 1850, desc: "Public research university in Sydney, Australia's first.", programs: ["Medicine", "Law", "Engineering", "Arts"], accr: ["TEQSA"], ext: { wikidata: "Q487556" }, sources: { official: "https://www.sydney.edu.au", gov: "https://www.education.gov.au" }, foundedSrc: "Official institution website" },
  { id: "auckland", name: "University of Auckland", short: "Auckland", abbrs: ["UoA"], aliases: ["University of Auckland", "UoA"], local: { mi: "Te Whare W\u0101nanga o Tamaki Makaurau" }, types: ["university", "research"], fields: ["engineering", "medicine", "science", "business"], country: "NZ", city: "Auckland", region: "Auckland", address: "Auckland 1010", lat: -36.8515, lng: 174.7697, website: "https://auckland.ac.nz", founded: 1883, desc: "Public research university in Auckland, New Zealand.", programs: ["Engineering", "Medicine", "Computer Science", "Commerce"], accr: ["NZQA"], ext: { wikidata: "Q492467" }, sources: { official: "https://www.auckland.ac.nz", gov: "https://www.education.govt.nz" }, foundedSrc: "Official institution website" },
  { id: "eth", name: "ETH Zurich", short: "ETH", abbrs: ["ETH", "ETHZ"], aliases: ["ETH Zurich", "Swiss Federal Institute of Technology"], local: { de: "Eidgen\u00F6ssische Technische Hochschule Z\u00FCrich" }, types: ["institute", "university", "research"], fields: ["engineering", "computer-science", "science", "architecture"], country: "CH", city: "Zurich", region: "Z\u00FCrich", address: "R\u00E4mistrasse 101, Zurich", lat: 47.3769, lng: 8.5477, website: "https://ethz.ch", founded: 1855, desc: "Federal institute of technology in Zurich, founded 1855.", programs: ["Mechanical Engineering", "Informatics", "Physics", "Architecture"], accr: ["SERI"], ext: { wikidata: "Q11942" }, sources: { official: "https://ethz.ch", gov: "https://www.sbfi.admin.ch" }, foundedSrc: "Official institution website" },
  { id: "uva", name: "University of Amsterdam", short: "UvA", abbrs: ["UvA"], aliases: ["University of Amsterdam", "UvA"], local: { nl: "Universiteit van Amsterdam" }, types: ["university"], fields: ["social-sciences", "arts", "science", "law"], country: "NL", city: "Amsterdam", region: "North Holland", address: "Spui 21, Amsterdam", lat: 52.3702, lng: 4.8952, website: "https://uva.nl", founded: 1632, desc: "Public research university in Amsterdam, founded 1632.", programs: ["Communication Science", "Economics", "Law", "Biology"], accr: ["NVAO"], ext: { wikidata: "Q214341" }, sources: { official: "https://www.uva.nl", gov: "https://www.rijksoverheid.nl" }, foundedSrc: "Official institution website" },
  { id: "kuleuven", name: "KU Leuven", short: "KU Leuven", abbrs: ["KUL"], aliases: ["Katholieke Universiteit Leuven", "KU Leuven"], local: { nl: "KU Leuven" }, types: ["university"], fields: ["engineering", "medicine", "law", "theology"], country: "BE", city: "Leuven", region: "Flanders", address: "Oude Markt 13, Leuven", lat: 50.8776, lng: 4.7005, website: "https://kuleuven.be", founded: 1425, desc: "Dutch-speaking research university in Leuven, Belgium.", programs: ["Engineering", "Medicine", "Law", "Computer Science"], accr: ["NVAO"], ext: { wikidata: "Q1542075" }, sources: { official: "https://www.kuleuven.be", gov: "https://www.flanders.be" }, foundedSrc: "Official institution website" }
];
var INSTITUTIONS_5 = [
  { id: "karolinska", name: "Karolinska Institute", short: "KI", abbrs: ["KI"], aliases: ["Karolinska Institutet", "Karolinska Institute"], local: { sv: "Karolinska Institutet" }, types: ["medical", "institute", "university"], fields: ["medicine", "biomedicine", "public-health", "dentistry"], country: "SE", city: "Stockholm", region: "Stockholm", address: "Solnav\u00E4gen 1, Solna, Stockholm", lat: 59.3489, lng: 18.0245, website: "https://ki.se", founded: 1810, desc: "Medical university in Solna, Stockholm, founded 1810.", programs: ["Medicine", "Biomedicine", "Dentistry", "Public Health"], accr: ["UK\u00C4"], ext: { wikidata: "Q192953" }, sources: { official: "https://ki.se", gov: "https://www.regeringen.se" }, foundedSrc: "Official institution website" },
  { id: "copenhagen", name: "University of Copenhagen", short: "Copenhagen", abbrs: ["KU"], aliases: ["University of Copenhagen", "K\u00F8benhavns Universitet"], local: { da: "K\u00F8benhavns Universitet" }, types: ["university", "research"], fields: ["medicine", "science", "social-sciences", "law"], country: "DK", city: "Copenhagen", region: "Capital Region", address: "N\u00F8rregade 10, Copenhagen", lat: 55.6802, lng: 12.5725, website: "https://ku.dk", founded: 1479, desc: "Oldest university in Denmark, founded 1479.", programs: ["Medicine", "Biotechnology", "Law", "Economics"], accr: ["EVA"], ext: { wikidata: "Q186285" }, sources: { official: "https://www.ku.dk", gov: "https://ufm.dk" }, foundedSrc: "Official institution website" },
  { id: "helsinki", name: "University of Helsinki", short: "Helsinki", abbrs: [""], aliases: ["University of Helsinki", "Helsingin yliopisto"], local: { fi: "Helsingin yliopisto", sv: "Helsingfors universitet" }, types: ["university"], fields: ["medicine", "science", "arts", "law"], country: "FI", city: "Helsinki", region: "Uusimaa", address: "Yliopistonkatu 4, Helsinki", lat: 60.1699, lng: 24.9494, website: "https://helsinki.fi", founded: 1640, desc: "Oldest and largest university in Finland, founded 1640 in Turku.", programs: ["Medicine", "Law", "Computer Science", "Agriculture"], accr: ["FINEEC"], ext: { wikidata: "Q28695" }, sources: { official: "https://www.helsinki.fi", gov: "https://okm.fi" }, foundedSrc: "Official institution website" },
  { id: "oslo", name: "University of Oslo", short: "Oslo", abbrs: ["UiO"], aliases: ["University of Oslo", "UiO"], local: { no: "Universitetet i Oslo" }, types: ["university"], fields: ["law", "medicine", "science", "humanities"], country: "NO", city: "Oslo", region: "Oslo", address: "Problemveien 7, Oslo", lat: 59.94, lng: 10.72, website: "https://uio.no", founded: 1811, desc: "Oldest university in Norway, founded 1811.", programs: ["Law", "Medicine", "Physics", "Media Studies"], accr: ["NOKUT"], ext: { wikidata: "Q486156" }, sources: { official: "https://www.uio.no", gov: "https://www.regjeringen.no" }, foundedSrc: "Official institution website" },
  { id: "vienna", name: "University of Vienna", short: "Vienna", abbrs: [], aliases: ["University of Vienna", "Universit\u00E4t Wien"], local: { de: "Universit\u00E4t Wien" }, types: ["university"], fields: ["arts", "law", "science", "social-sciences"], country: "AT", city: "Vienna", region: "Vienna", address: "Universit\u00E4tsring 1, Vienna", lat: 48.2132, lng: 16.3601, website: "https://univie.ac.at", founded: 1365, desc: "Public university in Vienna, founded 1365, one of Europe's oldest.", programs: ["Law", "Psychology", "Biology", "History"], accr: ["AQ Austria"], ext: { wikidata: "Q165980" }, sources: { official: "https://www.univie.ac.at", gov: "https://www.bmbwf.gv.at" }, foundedSrc: "Official institution website" },
  { id: "barcelona", name: "University of Barcelona", short: "Barcelona", abbrs: ["UB"], aliases: ["University of Barcelona", "Universitat de Barcelona"], local: { es: "Universidad de Barcelona", ca: "Universitat de Barcelona" }, types: ["university"], fields: ["medicine", "law", "science", "arts"], country: "ES", city: "Barcelona", region: "Catalonia", address: "Gran Via de les Corts Catalanes 585, Barcelona", lat: 41.3851, lng: 2.1637, website: "https://ub.edu", founded: 1450, desc: "Public university in Barcelona, founded 1450.", programs: ["Medicine", "Law", "Computer Science", "Economics"], accr: ["AQU"], ext: { wikidata: "Q219615" }, sources: { official: "https://www.ub.edu", gov: "https://www.educacion.gob.es" }, foundedSrc: "Official institution website" },
  { id: "sapienza", name: "Sapienza University of Rome", short: "Sapienza", abbrs: ["UNIROMA1"], aliases: ["University of Rome", "Sapienza Universit\u00E0 di Roma"], local: { it: "Sapienza Universit\u00E0 di Roma" }, types: ["university"], fields: ["architecture", "medicine", "engineering", "law"], country: "IT", city: "Rome", region: "Lazio", address: "Piazzale Aldo Moro 5, Rome", lat: 41.9028, lng: 12.5153, website: "https://uniroma1.it", founded: 1303, desc: "University founded in Rome in 1303, among Europe's oldest.", programs: ["Medicine", "Architecture", "Law", "Engineering"], accr: ["ANVUR"], ext: { wikidata: "Q230092" }, sources: { official: "https://www.uniroma1.it", gov: "https://www.mur.gov.it" }, foundedSrc: "Official institution website" },
  { id: "unam", name: "National Autonomous University of Mexico", short: "UNAM", abbrs: ["UNAM"], aliases: ["National Autonomous University of Mexico", "UNAM"], local: { es: "Universidad Nacional Aut\u00F3noma de M\u00E9xico" }, types: ["university", "research"], fields: ["science", "engineering", "arts", "medicine"], country: "MX", city: "Mexico City", region: "Mexico City", address: "Av. Universidad 3000, Coyoac\u00E1n, Mexico City", lat: 19.3297, lng: -99.1852, website: "https://unam.mx", founded: 1551, desc: "Public research university in Mexico City, founded 1551.", programs: ["Engineering", "Medicine", "Law", "Economics"], accr: ["SEP"], ext: { wikidata: "Q222738" }, sources: { official: "https://www.unam.mx", gov: "https://www.gob.mx" }, foundedSrc: "Official institution website" },
  { id: "uba", name: "University of Buenos Aires", short: "UBA", abbrs: ["UBA"], aliases: ["University of Buenos Aires", "UBA"], local: { es: "Universidad de Buenos Aires" }, types: ["university"], fields: ["medicine", "law", "economics", "engineering"], country: "AR", city: "Buenos Aires", region: "Buenos Aires", address: "Viamonte 430, Buenos Aires", lat: -34.6, lng: -58.3826, website: "https://uba.ar", founded: 1821, desc: "Public university in Buenos Aires, founded 1821.", programs: ["Medicine", "Law", "Economics", "Engineering"], accr: ["CONEAU"], ext: { wikidata: "Q194223" }, sources: { official: "https://www.uba.ar", gov: "https://www.argentina.gob.ar" }, foundedSrc: "Official institution website" },
  { id: "capetown", name: "University of Cape Town", short: "UCT", abbrs: ["UCT"], aliases: ["University of Cape Town", "UCT"], local: { af: "Universiteit van Kaapstad", xh: "iYunivesithi yaseKapa" }, types: ["university", "research"], fields: ["medicine", "engineering", "law", "science"], country: "ZA", city: "Cape Town", region: "Western Cape", address: "Rondebosch, Cape Town", lat: -33.9571, lng: 18.4605, website: "https://uct.ac.za", founded: 1829, desc: "Public research university in Cape Town, founded 1829.", programs: ["Medicine", "Engineering", "Law", "Environmental Science"], accr: ["CHE SA"], ext: { wikidata: "Q558681" }, sources: { official: "https://www.uct.ac.za", gov: "https://www.dhet.gov.za" }, foundedSrc: "Official institution website" },
  { id: "cairo", name: "Cairo University", short: "Cairo", abbrs: ["CU"], aliases: ["Cairo University", "Egyptian University", "Fuad I University"], local: { ar: "\u062C\u0627\u0645\u0639\u0629 \u0627\u0644\u0642\u0627\u0647\u0631\u0629" }, types: ["university"], fields: ["medicine", "engineering", "law", "economics"], country: "EG", city: "Giza", region: "Giza", address: "Gamaet St, Giza", lat: 30.0264, lng: 31.2117, website: "https://cu.edu.eg", founded: 1908, desc: "Public university in Giza, founded 1908 as Egyptian University.", programs: ["Medicine", "Engineering", "Law", "Economics"], accr: ["MOHESR"], ext: { wikidata: "Q194004" }, sources: { official: "https://cu.edu.eg", gov: "https://www.egypt.gov.eg", academic: "https://en.wikipedia.org/wiki/Cairo_University" }, foundedSrc: "Academic source (encyclopedia)", conflicts: [{ fact: "Founded", a: { v: 1908, s: "Official institution website" }, b: { v: 1825, s: "Academic source (encyclopedia)" } }] },
  { id: "tashkent-medical", name: "Tashkent Medical Academy", short: "TMA", abbrs: ["TMA"], aliases: ["Tashkent Medical Academy", "TMA"], local: { uz: "Toshkent tibbiyot akademiyasi" }, types: ["medical", "academy"], fields: ["medicine", "pharmacy", "public-health"], country: "UZ", city: "Tashkent", region: "Tashkent", address: "Farobiy St 2, Tashkent", lat: 41.2995, lng: 69.2401, website: "https://tma.uz", founded: 2005, desc: "Medical academy in Tashkent specialising in medicine and public health.", programs: ["General Medicine", "Pediatrics", "Pharmacy"], accr: ["UZ MES"], ext: { wikidata: "Q4453271" }, sources: { official: "https://tma.uz", gov: "https://www.gov.uz" }, foundedSrc: "Official institution website" }
];
var INSTITUTIONS = INSTITUTIONS_1.concat(INSTITUTIONS_2, INSTITUTIONS_3, INSTITUTIONS_4, INSTITUTIONS_5);
INSTITUTIONS_1 = INSTITUTIONS_2 = INSTITUTIONS_3 = INSTITUTIONS_4 = INSTITUTIONS_5 = null;

/* ------------------------- Abbreviation table ---------------------------- */

var ABBREVIATIONS = {
  "msu": ["michigan-state", "mississippi-state", "moscow-state"],
  "mit": ["mit"],
  "kit": ["kit"],
  "tum": ["tum"],
  "eth": ["eth"],
  "ethz": ["eth"],
  "ucla": ["ucla"],
  "nyu": ["nyu"],
  "nus": ["nus"],
  "ubc": ["ubc"],
  "unam": ["unam"],
  "uba": ["uba"],
  "uct": ["capetown"],
  "uoa": ["auckland"],
  "ki": ["karolinska"],
  "hse": ["hse"],
  "snu": ["snu"],
  "kbtu": ["kazakh-british"],
  "aitu": ["astana-it"],
  "kmux": ["karaganda-medical"],
  "kmu": ["karaganda-medical"],
  "kznmu": ["kazakh-national-medical"],
  "wksmu": ["west-kazakhstan-medical"],
  "mg": ["moscow-state"],
  "mgu": ["moscow-state"],
  "utokyo": ["tokyo"],
  "uot": ["toronto"],
  "iit": ["iit-bombay"],
  "iitb": ["iit-bombay"],
  "ic": ["imperial"],
  "icl": ["imperial"],
  "lse": ["lse"],
  "pku": ["peking"],
  "thu": ["tsinghua"],
  "kaznu": ["al-farabi"],
  "hu": ["humboldt"],
  "rwth": ["rwth"]
};

/* ------------------------------ Source meta ------------------------------ */

var SOURCE_META = {
  official: { label: "Official", cls: "badge-official" },
  gov: { label: "Government", cls: "badge-gov" },
  academic: { label: "Academic", cls: "badge-academic" },
  external: { label: "Verified External", cls: "badge-external" },
  userGen: { label: "User Generated", cls: "badge-user" },
  video: { label: "Video", cls: "badge-video" },
  ai: { label: "AI Summary", cls: "badge-ai" }
};

var SOURCE_KEYS = ["official", "gov", "academic", "external", "userGen"];

function sourcesFor(inst) {
  var out = [];
  Object.keys(inst.sources || {}).forEach(function (key) {
    var url = inst.sources[key];
    out.push({
      key: key,
      url: url,
      label: sourceLabel(key, inst),
      type: SOURCE_META[key] ? SOURCE_META[key].label : key,
      cls: SOURCE_META[key] ? SOURCE_META[key].cls : "badge-external"
    });
  });
  out.push({
    key: "external",
    url: "https://example.com/verified/" + inst.id,
    label: "Partner directory record",
    type: "Verified External",
    cls: "badge-external",
    note: "Entry matched across partner directories."
  });
  return out;
}

function sourceLabel(key, inst) {
  if (key === "official") return inst.short + " — official website";
  if (key === "gov") return "Government / regulator source";
  if (key === "academic") return "Academic encyclopedia";
  if (key === "external") return "Verified external directory";
  if (key === "userGen") return "User-provided document";
  return key;
}

function confidenceFor(inst) {
  var s = inst.sources || {};
  var factors = [];
  if (s.official) factors.push("Official website checked");
  if (s.gov) factors.push("Government/regulator record");
  if (s.academic) factors.push("Academic cross-reference");
  factors.push("Cross-checked with partner directories");
  var conflicts = (inst.conflicts || []).length;
  if (conflicts > 0) factors.push(conflicts + " conflicting fact(s) shown for review");
  var level = "High";
  if (!s.official) level = "Medium";
  if (conflicts > 0) level = level === "High" ? "Medium" : "Low";
  return { level: level, factors: factors };
}

/* ------------------------------ Demo reviews ----------------------------- */

var REVIEW_SEEDS = [
  { id: "r1", instId: "mit", author: "Alex O.", rating: 5, date: "2026-02-11", origin: "google", text: "Library hours and course catalog were really easy to verify from the official pages this cycle.", demo: true },
  { id: "r2", instId: "mit", author: "Sana R.", rating: 4, date: "2026-01-27", origin: "reddit", text: "Applying from abroad; the source list helped me confirm accreditation before paying application fees.", demo: true },
  { id: "r3", instId: "tokyo", author: "Hiroshi M.", rating: 5, date: "2026-03-02", origin: "google", text: "The founded-year conflict between 1877 and 1886 is shown side by side — glad I read both before quoting it.", demo: true },
  { id: "r4", instId: "oxford", author: "Priya K.", rating: 4, date: "2026-01-15", origin: "reddit", text: "Used the college list to plan a research visit. Official site links worked directly.", demo: true },
  { id: "r5", instId: "al-farabi", author: "Dana S.", rating: 5, date: "2026-02-20", origin: "google", text: "Found the medical faculty under field filters. Much faster than browsing the ministry site.", demo: true },
  { id: "r6", instId: "karaganda-medical", author: "Temirlan B.", rating: 4, date: "2026-03-08", origin: "reddit", text: "Faculty list matched my file so far. Conflicting founding date would be nice to see here too.", demo: true },
  { id: "r7", instId: "eth", author: "Lucas W.", rating: 5, date: "2026-02-03", origin: "google", text: "Accreditation field linked directly to the Swiss regulator. Exactly the transparency I wanted.", demo: true },
  { id: "r8", instId: "lse", author: "Emma J.", rating: 3, date: "2026-01-30", origin: "reddit", text: "Programme list is fine but video links are clearly demo content — fine for preview, not for research.", demo: true },
  { id: "r9", instId: "kazakh-national-medical", author: "Aigerim Q.", rating: 5, date: "2026-03-11", origin: "google", text: "Verified the pharmacy program through the government link before contacting admissions.", demo: true },
  { id: "r10", instId: "west-kazakhstan-medical", author: "Nurlan Z.", rating: 4, date: "2026-02-25", origin: "reddit", text: "Nice to see Oral (Uralsk) searchable by city — this one always gets lost in other catalogs.", demo: true }
];

var VIDEOS = [
  { instId: "mit", platform: "YouTube", title: "MIT campus tour — 8 minutes", channel: "Campus Media (demo)", date: "2025-11-04", url: "https://www.youtube.com/results?search_query=MIT+campus+tour", thumb: "MIT", demo: true },
  { instId: "tokyo", platform: "YouTube", title: "Todai lecture preview: machine learning", channel: "EdTalks (demo)", date: "2025-12-12", url: "https://www.youtube.com/results?search_query=University+of+Tokyo+machine+learning", thumb: "UTokyo", demo: true },
  { instId: "oxford", platform: "YouTube", title: "Why study at Magdalen — student view", channel: "College Vlogs (demo)", date: "2026-01-08", url: "https://www.youtube.com/results?search_query=Oxford+student+vlog", thumb: "Oxon", demo: true },
  { instId: "eth", platform: "YouTube", title: "ETH robotics lab walkthrough", channel: "Tech University (demo)", date: "2026-01-19", url: "https://www.youtube.com/results?search_query=ETH+Zurich+robotics+lab", thumb: "ETH", demo: true },
  { instId: "al-farabi", platform: "YouTube", title: "Al-Farabi university open day 2026", channel: "Study in Asia (demo)", date: "2026-02-01", url: "https://www.youtube.com/results?search_query=Al-Farabi+open+day", thumb: "KazNU", demo: true }
];

var DEMO_PHOTOS = [
  "linear-gradient(135deg,#1e3a8a,#3b82f6)",
  "linear-gradient(135deg,#14532d,#22c55e)",
  "linear-gradient(135deg,#7c2d12,#f97316)",
  "linear-gradient(135deg,#581c87,#a855f7)",
  "linear-gradient(135deg,#0c4a6e,#0ea5e9)",
  "linear-gradient(135deg,#450a0a,#ef4444)"
];

/* --------------------------- Local storage layer ------------------------- */

var STORE_KEYS = {
  comments: "worlded.comments.v1",
  reports: "worlded.reports.v1",
  pending: "worlded.pending.v1",
  theme: "worlded.theme"
};

function storeGet(key, seed) {
  try {
    var raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  if (seed !== undefined) storeSet(key, seed);
  return seed || [];
}

function storeSet(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {}
}

function storeAdd(key, item) {
  var arr = storeGet(key, []);
  arr.push(item);
  storeSet(key, arr);
  return item;
}

/* -------------------------------- mockApi -------------------------------- */

var mockApi = {
  SCRIPT: function () { return INSTITUTIONS; },
  institutions: function () { return INSTITUTIONS; },
  institution: function (id) {
    for (var i = 0; i < INSTITUTIONS.length; i++) { if (INSTITUTIONS[i].id === id) return INSTITUTIONS[i]; }
    return null;
  },
  countries: function () { return COUNTRIES; },
  country: function (iso) { return COUNTRY_BY_ISO[iso] || null; },
  cities: function () {
    var map = {}, out = [];
    INSTITUTIONS.forEach(function (i) {
      var key = (i.city || "").toLowerCase() + "|" + i.country;
      if (!map[key]) {
        map[key] = { name: i.city, country: i.country, region: i.region, lat: i.lat, lng: i.lng, count: 0, instIds: [] };
        out.push(map[key]);
      }
      map[key].count++;
      map[key].instIds.push(i.id);
    });
    return out;
  },
  sourcesFor: sourcesFor,
  confidenceFor: confidenceFor,
  reviews: function (id) {
    var user = storeGet(STORE_KEYS.comments, []);
    var seeds = REVIEW_SEEDS.filter(function (r) { return r.instId === id; });
    return seeds.concat(user.filter(function (r) { return r.instId === id; }));
  },
  addReview: function (instId, data) {
    return storeAdd(STORE_KEYS.comments, {
      id: "u" + Date.now(),
      instId: instId,
      name: data.name || "Guest",
      rating: data.rating || 5,
      text: data.text,
      date: new Date().toISOString().slice(0, 10),
      origin: "user"
    });
  },
  videosFor: function (id) {
    return VIDEOS.filter(function (v) { return v.instId === id; });
  },
  photosFor: function (id, n) {
    n = n || 6;
    var out = [];
    for (var k = 0; k < n; k++) out.push(DEMO_PHOTOS[(id.length + k) % DEMO_PHOTOS.length]);
    return out;
  },
  initialThumb: function (name) {
    var init = (name || "?").replace(/[^A-Za-z0-9]/g, " ").trim().split(/\s+/).slice(0, 2).map(function (w) { return w[0]; }).join("").toUpperCase() || "?";
    var colors = ["#4338ca", "#0d9488", "#c2410c", "#be185d", "#16a34a", "#4f46e5"];
    var c = colors[init.charCodeAt(0) % colors.length];
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(
      "<svg xmlns='http://www.w3.org/2000/svg' width='96' height='96'><rect width='96' height='96' rx='20' fill='" + c + "'/><text x='48' y='58' font-family='Arial,sans-serif' font-size='36' font-weight='700' fill='#fff' text-anchor='middle'>" + init + "</text></svg>"
    );
  },
  report: function (instId, reason, detail) {
    return storeAdd(STORE_KEYS.reports, { id: "rep" + Date.now(), instId: instId, reason: reason, detail: detail, date: new Date().toISOString().slice(0, 10), status: "open" });
  },
  reports: function () { return storeGet(STORE_KEYS.reports, []); },
  resolveReport: function (id, action) {
    var arr = storeGet(STORE_KEYS.reports, []);
    arr.forEach(function (r) { if (r.id === id) r.status = action; });
    storeSet(STORE_KEYS.reports, arr);
  },
  pending: function () { return storeGet(STORE_KEYS.pending, []); },
  savePending: function (inst) {
    var p = storeGet(STORE_KEYS.pending, []);
    var dup = p.some(function (x) { return x.id === inst.id; });
    if (!dup) {
      inst.status = "pending";
      inst.discoveredAt = new Date().toISOString().slice(0, 10);
      p.push(inst);
      storeSet(STORE_KEYS.pending, p);
    }
    return inst;
  },
  resolvePending: function (id, action) {
    var p = storeGet(STORE_KEYS.pending, []);
    p.forEach(function (x) { if (x.id === id) x.status = action === "approve" ? "approved" : "rejected"; });
    storeSet(STORE_KEYS.pending, p);
  }
};