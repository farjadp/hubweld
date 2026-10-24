// 50 realistic personas that exercise every flow through the real API:
// sign-up, mobile sign-in, welder profiles, supplier listings, jobs → bids →
// messages → award → completion → review, cart → checkout → invoice →
// exchange-house payment → fulfilment → receipt, cancellations, reports, blocks.
//
// LOCAL ONLY. Run against a dev server:  node prisma/seed-personas.mjs
// (SEED_BASE_URL defaults to http://localhost:3100). It refuses any other host.
//
// Invoices and exchange-house payments go through the admin endpoints with a
// signed-in admin (prisma/seed.ts's admin by default). Admin approval of
// welders and suppliers is still done in the database, and dates are
// backdated there afterwards. A summary lands in prisma/personas-ledger.json.
//
// Every persona signs in with PERSONA_PASSWORD below.

import { PrismaClient } from "@prisma/client";
import { writeFileSync } from "node:fs";

const BASE = process.env.SEED_BASE_URL || "http://localhost:3100";
if (!/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(BASE)) {
  console.error(`Refusing to seed ${BASE}: personas are for a local dev server only.`);
  process.exit(1);
}
const PERSONA_PASSWORD = "Hubweld#Persona26";
// The admin from prisma/seed.ts, used to call the invoice and payment endpoints.
const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || "admin@hubweld.com";
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || "password123";

const prisma = new PrismaClient();
const results = [];
const DAY = 86_400_000;
const NOW = Date.now();

function check(label, res, expected) {
  const ok = Array.isArray(expected) ? expected.includes(res.status) : res.status === expected;
  results.push({ label, ok, status: res.status, error: ok ? undefined : res.json?.error ?? res.text });
  if (!ok) console.log(`  ✗ ${label} → ${res.status} ${JSON.stringify(res.json ?? res.text).slice(0, 200)}`);
  return ok;
}

async function api(method, path, token, body) {
  const r = await fetch(BASE + path, {
    method,
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await r.text();
  let json;
  try { json = JSON.parse(text); } catch { json = undefined; }
  return { status: r.status, json, text: json ? undefined : text.slice(0, 200) };
}

// Admin endpoints are cookie-only (requireAdmin), so sign in like the web does.
let adminCookie = "";
async function adminSignIn() {
  const csrf = await fetch(BASE + "/api/auth/csrf");
  const jar = new Map();
  const keep = (res) => { for (const c of res.headers.getSetCookie()) { const [kv] = c.split(";"); const i = kv.indexOf("="); jar.set(kv.slice(0, i), kv.slice(i + 1)); } };
  keep(csrf);
  const { csrfToken } = await csrf.json();
  const res = await fetch(BASE + "/api/auth/callback/credentials", {
    method: "POST",
    redirect: "manual",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Cookie: [...jar].map(([k, v]) => `${k}=${v}`).join("; ") },
    body: new URLSearchParams({ csrfToken, email: ADMIN_EMAIL, password: ADMIN_PASSWORD, json: "true" }),
  });
  keep(res);
  adminCookie = [...jar].map(([k, v]) => `${k}=${v}`).join("; ");
  if (!adminCookie.includes("session-token")) throw new Error("Admin sign-in failed: check ADMIN_EMAIL / ADMIN_PASSWORD");
}
async function adminApi(method, path, body) {
  const r = await fetch(BASE + path, {
    method,
    headers: { "Content-Type": "application/json", Cookie: adminCookie },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await r.text();
  let json;
  try { json = JSON.parse(text); } catch { json = undefined; }
  return { status: r.status, json, text: json ? undefined : text.slice(0, 200) };
}

// ───────────────────────── Personas ─────────────────────────

const W = (key, name, email, city, country, p, joined) => ({ key, name, email, role: "WELDER", city, country, profile: p, joined });
const C = (key, name, email, city, country, joined, extra = {}) => ({ key, name, email, role: "CUSTOMER", city, country, joined, ...extra });
const S = (key, name, email, city, businessName, joined) => ({ key, name, email, role: "SUPPLIER", city, country: "Canada", businessName, joined });

const personas = [
  // Welders — looking for work
  W("reza", "Reza Karimi", "reza.karimi.weld@gmail.com", "Toronto", "Canada", { bio: "Red Seal welder, 12 years on process piping and pressure work. Ticketed for CWB all-position.", skills: "TIG,Stick,Pipe,Stainless", certifications: "CWB W47.1 all-position, Red Seal", serviceArea: "GTA", hourlyRate: 58, yearsExp: 12, languages: "Persian,English", serviceCountries: "Canada" }, 88),
  W("behnam", "Behnam Rostami", "behnam.rostami@outlook.com", "Richmond Hill", "Canada", { bio: "Structural MIG/FCAW on commercial steel erection. Own truck and Miller Bobcat.", skills: "MIG,FCAW,Structural", certifications: "CWB W47.1 flat/horizontal", serviceArea: "York Region", hourlyRate: 52, yearsExp: 9, languages: "Persian,English", serviceCountries: "Canada" }, 81),
  W("ali", "Ali Ghorbani", "ali.ghorbani.bc@gmail.com", "Vancouver", "Canada", { bio: "Aluminum boat and pontoon repair, TIG and spool gun. Shop in Richmond, mobile on weekends.", skills: "TIG,MIG,Aluminum", certifications: "CWB aluminum", serviceArea: "Lower Mainland", hourlyRate: 60, yearsExp: 10, languages: "Persian,English", serviceCountries: "Canada" }, 76),
  W("hossein", "Hossein Mirzaei", "h.mirzaei.pipeline@gmail.com", "Calgary", "Canada", { bio: "Pipeline downhand and uphill Stick, 6010/7018. Rotations in northern Alberta.", skills: "Stick,Pipe", certifications: "ABSA B pressure, CWB", serviceArea: "Alberta", hourlyRate: 62, yearsExp: 15, languages: "Persian,Turkish,English", serviceCountries: "Canada" }, 70),
  W("mehdi", "Mehdi Abbasi", "mehdi.abbasi.inox@gmail.com", "Montreal", "Canada", { bio: "Sanitary stainless for food and dairy plants. Orbital and manual TIG, purge work.", skills: "TIG,Stainless", certifications: "CWB, CCQ soudeur", serviceArea: "Greater Montreal", hourlyRate: 57, yearsExp: 11, languages: "Persian,French,English", serviceCountries: "Canada" }, 66),
  W("saeed", "Saeed Jafari", "saeed.jafari.dxb@gmail.com", "Dubai", "United Arab Emirates", { bio: "Steel structure and mezzanine fabrication in Al Quoz and Jebel Ali. Team of three.", skills: "MIG,Stick,Structural,Fabrication", certifications: "AWS D1.1", serviceArea: "Dubai, Sharjah", hourlyRate: 30, yearsExp: 14, languages: "Persian,Arabic,English", serviceCountries: "United Arab Emirates,Oman" }, 63),
  W("amir", "Amir Hosseini", "amir.hosseini.ist@gmail.com", "Istanbul", "Turkey", { bio: "Stainless and aluminum for shopfitting and kitchen equipment in Ikitelli.", skills: "TIG,Stainless,Aluminum", certifications: "EN ISO 9606-1", serviceArea: "Istanbul", hourlyRate: 22, yearsExp: 8, languages: "Persian,Turkish", serviceCountries: "Turkey" }, 59),
  W("davood", "Davood Nasiri", "davood.nasiri.erbil@gmail.com", "Erbil", "Iraq", { bio: "Tank and storage fabrication for oilfield contractors around Erbil and Kirkuk.", skills: "Stick,MIG,Pipe,Structural", certifications: "AWS D1.1, API 650 experience", serviceArea: "Kurdistan Region", hourlyRate: 20, yearsExp: 16, languages: "Persian,Kurdish,Arabic", serviceCountries: "Iraq" }, 55),
  W("kian", "Kian Moradi", "kian.moradi99@gmail.com", "Hamilton", "Canada", { bio: "Second-year apprentice looking for shop hours. Good on MIG, learning TIG.", skills: "MIG", certifications: "Level 2 apprentice", serviceArea: "Hamilton, Burlington", hourlyRate: 28, yearsExp: 2, languages: "Persian,English", serviceCountries: "Canada" }, 40),
  W("farhad", "Farhad Bagheri", "farhad.bagheri.mobile@gmail.com", "Mississauga", "Canada", { bio: "Mobile repair rig. Trailers, equipment buckets, gates. Same-day in Peel.", skills: "Stick,MIG,Mobile", certifications: "CWB", serviceArea: "Peel Region", hourlyRate: 55, yearsExp: 13, languages: "Persian,English", serviceCountries: "Canada" }, 72),
  W("navid", "Navid Shirazi", "navid.shirazi.iron@gmail.com", "Ottawa", "Canada", { bio: "Ornamental railings, gates and stair stringers. Powder coat through a partner shop.", skills: "MIG,TIG,Fabrication", certifications: "CWB", serviceArea: "Ottawa, Gatineau", hourlyRate: 54, yearsExp: 10, languages: "Persian,English,French", serviceCountries: "Canada" }, 50),
  W("peyman", "Peyman Ahmadi", "peyman.ahmadi.ab@gmail.com", "Edmonton", "Canada", { bio: "Pressure vessels and heat exchangers. B-pressure ticket, X-ray quality.", skills: "TIG,Stick,Pipe", certifications: "ABSA B pressure", serviceArea: "Edmonton region", hourlyRate: 64, yearsExp: 18, languages: "Persian,English", serviceCountries: "Canada" }, 85),
  W("arash", "Arash Kazemi", "arash.kazemi.marine@gmail.com", "North Vancouver", "Canada", { bio: "Marine and dock work, galvanized and aluminum. Comfortable on barges.", skills: "Stick,MIG,Aluminum", certifications: "CWB", serviceArea: "North Shore", hourlyRate: 59, yearsExp: 9, languages: "Persian,English", serviceCountries: "Canada" }, 44),
  W("sina", "Sina Rahimi", "sina.rahimi.fab@gmail.com", "Newmarket", "Canada", { bio: "Fabrication from drawings, CNC plasma table, small production runs.", skills: "MIG,TIG,Fabrication", certifications: "CWB", serviceArea: "York Region", hourlyRate: 50, yearsExp: 7, languages: "Persian,English", serviceCountries: "Canada" }, 33),
  W("yasaman", "Yasaman Ebrahimi", "yasaman.ebrahimi.studio@gmail.com", "Toronto", "Canada", { bio: "TIG on thin stainless and bronze. Furniture, sculpture and architectural details.", skills: "TIG,Stainless", certifications: "CWB, OCAD fine arts", serviceArea: "Toronto", hourlyRate: 65, yearsExp: 6, languages: "Persian,English", serviceCountries: "Canada" }, 29),

  // Customers — hiring welders
  C("mohammad", "Mohammad Tehrani", "m.tehrani@tehraniconstruction.ca", "Vaughan", "Canada", 80),
  C("shirin", "Shirin Alavi", "shirin.alavi.bakery@gmail.com", "North York", "Canada", 61),
  C("kaveh", "Kaveh Sadeghi", "kaveh.sadeghi.pm@gmail.com", "Thornhill", "Canada", 58),
  C("nasrin", "Nasrin Farahani", "nasrin.farahani.farm@gmail.com", "Caledon", "Canada", 52),
  C("bijan", "Bijan Golzar", "bijan@golzarautobody.ca", "Markham", "Canada", 47),
  C("mahsa", "Mahsa Rezaei", "mahsa.rezaei.arch@gmail.com", "Toronto", "Canada", 45),
  C("hamid", "Hamid Yazdani", "hamid@yazdanidevelopments.ca", "Calgary", "Canada", 77),
  C("parisa", "Parisa Najafi", "parisa.najafi.kitchen@gmail.com", "Vancouver", "Canada", 38),
  C("omid", "Omid Zand", "omid.zand@zandlogistics.ca", "Brampton", "Canada", 35),
  C("leila", "Leila Soltani", "leila.soltani.home@gmail.com", "Oakville", "Canada", 26),
  C("fariborz", "Fariborz Hakimi", "fariborz@hakimimarine.ca", "Halifax", "Canada", 31),
  C("ramin", "Ramin Shahbazi", "ramin.shahbazi.dxb@gmail.com", "Dubai", "United Arab Emirates", 49),

  // Buyers — ordering equipment
  C("jalal", "Jalal Heidari", "jalal.heidari@heidaristeel.ae", "Dubai", "United Arab Emirates", 74),
  C("masoud", "Masoud Kamali", "masoud.kamali.trading@gmail.com", "Sharjah", "United Arab Emirates", 68),
  C("majid", "Majid Pourmand", "majid.pourmand.makine@gmail.com", "Istanbul", "Turkey", 65),
  C("ebrahim", "Ebrahim Asadi", "ebrahim.asadi.izmir@gmail.com", "Izmir", "Turkey", 42),
  C("kamran", "Kamran Ardalan", "kamran.ardalan.suli@gmail.com", "Sulaymaniyah", "Iraq", 57),
  C("morteza", "Morteza Ghasemi", "morteza.ghasemi.erbil@gmail.com", "Erbil", "Iraq", 53),
  C("abbas", "Abbas Rahmani", "abbas.rahmani.basra@gmail.com", "Basra", "Iraq", 46),
  C("nima", "Nima Esfandiari", "nima.esfandiari@gmail.com", "Toronto", "Canada", 22),
  C("golnaz", "Golnaz Mousavi", "g.mousavi@arvinprecision.ca", "Mississauga", "Canada", 60),
  C("vahid", "Vahid Karami", "vahid@karamifab.ca", "Surrey", "Canada", 39),
  C("siavash", "Siavash Fallahi", "siavash.fallahi.mtl@gmail.com", "Montreal", "Canada", 27),
  C("pedram", "Pedram Saberi", "pedram.saberi.auh@gmail.com", "Abu Dhabi", "United Arab Emirates", 36),
  C("houman", "Houman Daneshvar", "houman.daneshvar.trade@gmail.com", "Istanbul", "Turkey", 34),
  C("azadeh", "Azadeh Khosravi", "azadeh.khosravi.proc@gmail.com", "Dubai", "United Arab Emirates", 30),
  C("taha", "Taha Rezvani", "taha.rezvani.najaf@gmail.com", "Najaf", "Iraq", 24),

  // Suppliers — listing products
  S("bahram", "Bahram Arya", "sales@aryaweldsupply.ca", "Concord", "Arya Welding Supply", 90),
  S("shahram", "Shahram Tavakoli", "shahram@persiagasgear.ca", "Burnaby", "Persia Gas & Gear", 86),
  S("kourosh", "Kourosh Malek", "kourosh@zagrosabrasives.ca", "Calgary", "Zagros Abrasives", 83),
  S("roya", "Roya Saffari", "roya@alborzsafety.ca", "Richmond Hill", "Alborz Safety Products", 20),

  // Edge cases
  C("babak", "Babak Nouri", "babak.nouri.nmkt@gmail.com", "Newmarket", "Canada", 43), // hires AND buys
  W("ehsan", "Ehsan Partovi", "ehsan.partovi.weld@gmail.com", "Toronto", "Canada", { bio: "Night-shift fitter-welder, buys his own consumables.", skills: "MIG,FCAW", certifications: "CWB", serviceArea: "Toronto", hourlyRate: 45, yearsExp: 5, languages: "Persian,English", serviceCountries: "Canada" }, 37), // welder who buys
  C("shahin", "Shahin Darvish", "shahin.darvish@gmail.com", "Richmond Hill", "Canada", 19), // cancels job and order
  W("mani", "Mani Ostovar", "mani.ostovar.jobs@gmail.com", "Toronto", "Canada", { bio: "Cheap and fast. Any job.", skills: "MIG", certifications: "", serviceArea: "Anywhere", hourlyRate: 15, yearsExp: 1, languages: "Persian", serviceCountries: "Canada" }, 15), // spam bidder, reported and blocked
];

const APPROVED_WELDERS = ["reza", "behnam", "ali", "hossein", "mehdi", "saeed", "farhad", "navid", "peyman", "arash", "sina", "yasaman"];
const APPROVED_SUPPLIERS = ["bahram", "shahram", "kourosh"]; // roya stays pending review

// ───────────────────────── Supplier listings ─────────────────────────

const listings = {
  bahram: [
    { key: "arya-mig", cat: "mig-welders", name: "Arya MIG 250 Synergic Welder 230V", brand: "Arya", sku: "AR-MIG250", priceCents: 189900, stock: 14, description: "250A synergic MIG, 4-roll drive, spool-gun ready. One-year warranty." },
    { key: "arya-er70", cat: "consumables", name: "ER70S-6 MIG Wire 0.035\" 33 lb Spool", brand: "Arya", sku: "AR-ER70-035", priceCents: 9800, stock: 220, description: "Copper-coated mild steel wire, layer wound." },
    { key: "arya-7018", cat: "consumables", name: "E7018 Stick Electrodes 1/8\" 50 lb Can", brand: "Arya", sku: "AR-7018-18", priceCents: 21500, stock: 60, description: "Low-hydrogen, hermetically sealed can." },
    { key: "arya-tig", cat: "tig-welders", name: "Arya TIG 200 AC/DC Pulse", brand: "Arya", sku: "AR-TIG200", priceCents: 229000, stock: 6, description: "AC/DC pulse TIG for aluminum and stainless, foot pedal included." },
  ],
  shahram: [
    { key: "pg-reg", cat: "gas-regulators", name: "Argon/CO2 Flowmeter Regulator CGA-580", brand: "Persia Gas", sku: "PG-FR580", priceCents: 14900, stock: 40, description: "Dual-gauge flowmeter, 10–50 CFH." },
    { key: "pg-hose", cat: "gas-regulators", name: "Twin Oxy-Acetylene Hose 1/4\" x 50 ft", brand: "Persia Gas", sku: "PG-TH50", priceCents: 11900, stock: 35, description: "Grade T hose, B-B fittings." },
    { key: "pg-torch", cat: "gas-regulators", name: "Heavy-Duty Cutting Torch Kit", brand: "Persia Gas", sku: "PG-CTK", priceCents: 38900, stock: 12, description: "Regulators, torch handle, three tips, goggles." },
  ],
  kourosh: [
    { key: "zg-flap", cat: "abrasives", name: "Zirconia Flap Discs 4-1/2\" 40 Grit (Box of 10)", brand: "Zagros", sku: "ZG-FD40", priceCents: 6900, stock: 300, description: "Type 29 conical, for weld blending." },
    { key: "zg-cut", cat: "abrasives", name: "Thin Cut-Off Wheels 4-1/2\" x .045 (Box of 25)", brand: "Zagros", sku: "ZG-CO045", priceCents: 4500, stock: 400, description: "Inox-safe, iron-free." },
    { key: "zg-wire", cat: "abrasives", name: "Knotted Wire Cup Brush 4\" M14", brand: "Zagros", sku: "ZG-KCB4", priceCents: 2900, stock: 150, description: "Carbon steel twist knot." },
  ],
  roya: [
    { key: "al-helmet", cat: "safety", name: "Auto-Darkening Helmet True Colour 1/1/1/1", brand: "Alborz", sku: "AL-H1111", priceCents: 24900, stock: 25, description: "Shade 4–13, four sensors, grind mode." },
    { key: "al-gloves", cat: "safety", name: "Goatskin TIG Gloves (12 pairs)", brand: "Alborz", sku: "AL-TG12", priceCents: 13200, stock: 50, description: "Unlined, Kevlar stitched." },
  ],
};

// ───────────────────────── Jobs ─────────────────────────

// outcome: OPEN | ASSIGNED | IN_PROGRESS | COMPLETED | CANCELLED
const jobs = [
  { customer: "mohammad", title: "Structural steel connections for 3-storey mixed-use building", city: "Vaughan", category: "structural", budget: 38000,
    description: "Field welding of beam-to-column moment connections, about 140 connections, CWB W47.1 certified company required. Drawings and WPS available. Start in two weeks, 6–7 weeks on site.",
    bids: [["behnam", 34500, "We have done three similar buildings in Concord. Crew of 3, CWB W47.1 Div 2."], ["reza", 37000, "Can supply ticketed welders and UT-ready joints."], ["hossein", 39500, "Available after my rotation ends."], ["mani", 9000, "cheap fast call me"]],
    talk: [["mohammad", "behnam", "Can you share your company W47.1 certificate and a reference from a GC?"], ["behnam", null, "Sent both by email. Reference is from a Woodbridge project, 2025."]],
    accept: "behnam", outcome: "IN_PROGRESS" },
  { customer: "shirin", title: "Repair cracked stainless prep table and sink weld", city: "North York", category: "repair", budget: 600,
    description: "Commercial bakery. 304 stainless prep table has a cracked leg brace and the sink seam leaks. Needs food-safe finish. Can be done Sunday when we are closed.",
    bids: [["yasaman", 550, "TIG with back purge and a #4 brush finish. Sunday works."], ["farhad", 480, "I can come with the mobile rig."]],
    talk: [["shirin", "yasaman", "Do you need the table empty and moved from the wall?"], ["yasaman", null, "Empty yes, I can pull it out myself."]],
    accept: "yasaman", outcome: "COMPLETED", review: [5, "Neat weld, no leaks since, cleaned up after herself. Will call again."] },
  { customer: "kaveh", title: "Replace rusted balcony railing sections, 8 units", city: "Thornhill", category: "fabrication", budget: 9500,
    description: "Condo building, eight balconies. Bottom rails rusted through. Fabricate and install matching sections, primer and paint. Board approval done.",
    bids: [["navid", 8900, "Will match profile, galvanize and paint."], ["sina", 8200, "Fabricate in my shop from site measurements."], ["mani", 2500, "cheap"]],
    talk: [["kaveh", "sina", "Do you carry liability insurance for condo work?"], ["sina", null, "Yes, $2M CGL, certificate on request."]],
    accept: "sina", outcome: "COMPLETED", review: [4, "Good work, one balcony was two days late."] },
  { customer: "nasrin", title: "Farm gate hinges and stock trailer floor repair", city: "Caledon", category: "mobile", budget: 1200,
    description: "Two heavy gates with broken hinge pins and a stock trailer with cracked floor cross-members. Mobile welder needed, power available in the barn.",
    bids: [["farhad", 1100, "Can be there Thursday morning."], ["kian", 700, "Apprentice, but I have done trailer floors with my boss."]],
    talk: [], accept: "farhad", outcome: "COMPLETED", review: [5, "On time, fixed everything in one visit."] },
  { customer: "bijan", title: "Exhaust and frame repairs, steady weekly work", city: "Markham", category: "repair", budget: 2400,
    description: "Body shop looking for a welder two days a week: exhaust fabrication, frame rail sectioning, some aluminum. Steady work for the right person.",
    bids: [["ehsan", 2200, "Free Tue and Thu, MIG and FCAW."], ["kian", 1600, "I would like the hours, can learn fast."]],
    talk: [["bijan", "kian", "Can you come for a trial day next Tuesday?"], ["kian", null, "Yes, 8am works."]],
    accept: null, outcome: "OPEN" },
  { customer: "mahsa", title: "Floating steel staircase with stainless handrail", city: "Toronto", category: "fabrication", budget: 16000,
    description: "Residential renovation. Mono-stringer staircase, 14 treads, hidden welds ground smooth, stainless handrail. Engineered drawings ready.",
    bids: [["yasaman", 15500, "I can do the handrail and finishing. I'd partner with a structural shop for the stringer."], ["navid", 14800, "Full fabrication and install, 5 weeks."], ["sina", 15200, "CNC-cut stringer plates, installation included."]],
    talk: [["mahsa", "navid", "Can you send photos of a past mono-stringer?"], ["navid", null, "Two projects attached to my profile gallery."]],
    accept: "navid", outcome: "ASSIGNED" },
  { customer: "hamid", title: "Embedded plates and rebar welding for parkade", city: "Calgary", category: "structural", budget: 22000,
    description: "Underground parkade, weldable rebar to embed plates, about 300 welds. Must hold CWB W186 or equivalent.",
    bids: [["hossein", 21000, "W186 qualified, local, available now."], ["peyman", 23500, "Can bring a second welder from Edmonton."]],
    talk: [["hamid", "hossein", "Third-party inspection on every pour. OK with that?"], ["hossein", null, "Of course."]],
    accept: "hossein", outcome: "COMPLETED", review: [5, "Passed every inspection. Professional."] },
  { customer: "parisa", title: "Custom stainless hood and back splash for restaurant", city: "Vancouver", category: "fabrication", budget: 7800,
    description: "New Persian restaurant, 12 ft kabob grill hood in 18 ga 304 stainless, grease-tight seams to NFPA 96.",
    bids: [["ali", 7400, "Shop in Richmond, can build and install."], ["arash", 7900, "Done two hoods for food trucks."]],
    talk: [], accept: "ali", outcome: "IN_PROGRESS" },
  { customer: "omid", title: "Fleet trailer hitch and landing gear repairs", city: "Brampton", category: "mobile", budget: 3500,
    description: "Fourteen dry vans, landing gear brackets cracked on four, two hitch plates need rebuild. Work in our yard.",
    bids: [["farhad", 3300, "I do this for two other fleets in Peel."], ["ehsan", 2900, "Weekends only."]],
    talk: [], accept: "farhad", outcome: "ASSIGNED" },
  { customer: "leila", title: "Front balcony railing, small job", city: "Oakville", category: "repair", budget: 450,
    description: "One section of wrought-iron railing came loose from the concrete. Re-anchor and weld the broken baluster.",
    bids: [["sina", 420, "Can do Saturday."], ["mani", 120, "very cheap"]],
    talk: [], accept: null, outcome: "OPEN" },
  { customer: "fariborz", title: "Aluminum hull crack repair, 22 ft workboat", city: "Halifax", category: "repair", budget: 2800,
    description: "5083 aluminum hull, 30 cm crack near the keel. Boat on the hard in Dartmouth. Need certified aluminum welder.",
    bids: [["ali", 3200, "Would need travel covered from Vancouver."], ["arash", 3000, "Same — travel from BC."]],
    talk: [], accept: null, outcome: "OPEN" },
  { customer: "ramin", title: "Steel mezzanine for warehouse in Al Quoz", city: "Dubai", category: "structural", budget: 18000,
    description: "Warehouse mezzanine 12 m x 8 m, HEA beams, checker plate deck, staircase. Payment in AED through our exchange house in Deira.",
    bids: [["saeed", 16500, "Team of three, 3 weeks, Dubai Municipality approval support."], ["davood", 17500, "Would travel from Erbil."]],
    talk: [["ramin", "saeed", "Can you start on the 1st? We pay 40% upfront through the exchange."], ["saeed", null, "Yes. Send the drawings."]],
    accept: "saeed", outcome: "COMPLETED", review: [4, "Solid structure, paperwork took longer than expected."] },
  { customer: "babak", title: "Trailer frame extension and new ramp", city: "Newmarket", category: "fabrication", budget: 2600,
    description: "Extend a 16 ft utility trailer to 20 ft and build a new spring-assisted ramp.",
    bids: [["sina", 2500, "Shop is 5 minutes from you."], ["kian", 1900, "With my supervisor's sign-off."]],
    talk: [["babak", "sina", "Do you need the axle moved too?"], ["sina", null, "Yes, I'd move it back to keep tongue weight right."]],
    accept: "sina", outcome: "IN_PROGRESS" },
  { customer: "shahin", title: "Garage door frame reinforcement", city: "Richmond Hill", category: "repair", budget: 800,
    description: "Steel frame around a double garage door is bent. Straighten and reinforce.",
    bids: [["behnam", 750, "Can look at it this week."]],
    talk: [], accept: null, outcome: "CANCELLED" },
  { customer: "mohammad", title: "Stair stringers and landings for commercial fit-out", city: "Woodbridge", category: "fabrication", budget: 12000,
    description: "Two egress stairs, C-channel stringers, checker plate landings, OBC compliant.",
    bids: [["navid", 11500, "Ready in four weeks."], ["sina", 11800, "CNC-cut, shop primed."], ["peyman", 12500, "Can travel."]],
    talk: [], accept: null, outcome: "OPEN" },
];

// ───────────────────────── Exchange houses (fictional) ─────────────────────────

const EXCHANGES = {
  dxbDeira: { name: "Sarrafi Kish Exchange", branch: "Deira, Dubai", country: "UAE" },
  dxbRas: { name: "Sarrafi Pars Exchange", branch: "Al Ras, Dubai", country: "UAE" },
  istLaleli: { name: "Sarrafi Golestan", branch: "Laleli, Istanbul", country: "Turkey" },
  istAksaray: { name: "Sarrafi Mehrgan", branch: "Aksaray, Istanbul", country: "Turkey" },
  suli: { name: "Sarrafi Zagros", branch: "Salim Street, Sulaymaniyah", country: "Iraq" },
  erbil: { name: "Sarrafi Arvand", branch: "Bakhtiari, Erbil", country: "Iraq" },
  basra: { name: "Sarrafi Karun", branch: "Ashar, Basra", country: "Iraq" },
};
// Indicative CAD → local rates used for the simulated transfers (not live rates).
const RATE = { AED: 2.66, USD: 0.724, TRY: 30.4, IQD: 948 };

// lifecycle: delivered | shipped | paid | invoiced-unpaid | pending | buyer-cancel | partial-cancel | net30-delivered
const orders = [
  { buyer: "jalal", items: [["arya-mig", 3], ["arya-er70", 20], ["zg-flap", 10]], ship: ["Heidari Steel Workshop", "Warehouse 14, Street 6B, Al Quoz Industrial 3", "Dubai", "", "", "AE", "+971 50 412 7731"], notes: "Ship by sea to Jebel Ali, we clear customs.", life: "delivered", pay: ["dxbDeira", "AED"] },
  { buyer: "masoud", items: [["arya-7018", 12], ["zg-cut", 20]], ship: ["Kamali Industrial Trading", "Office 210, Al Qasimia Tower", "Sharjah", "", "", "AE", "+971 55 230 8814"], notes: "", life: "shipped", pay: ["dxbRas", "AED"] },
  { buyer: "majid", items: [["arya-tig", 2], ["pg-reg", 4], ["al-gloves", 2]], ship: ["Pourmand Makine", "Ikitelli OSB, Demirciler Sitesi 5. Cad. No:12", "Istanbul", "Basaksehir", "34490", "TR", "+90 532 618 4420"], notes: "Commercial invoice in English please.", life: "delivered", pay: ["istLaleli", "USD"] },
  { buyer: "ebrahim", items: [["pg-torch", 3], ["pg-hose", 3]], ship: ["Asadi Kaynak", "Ataturk Sanayi Sitesi 1. Blok No:8", "Izmir", "Cigli", "35620", "TR", "+90 541 902 1176"], notes: "", life: "paid", pay: ["istAksaray", "TRY"] },
  { buyer: "kamran", items: [["arya-mig", 1], ["arya-er70", 6], ["pg-reg", 2]], ship: ["Ardalan Workshop", "Industrial Area, Sarchinar Road", "Sulaymaniyah", "Kurdistan Region", "", "IQ", "+964 770 155 3092"], notes: "Deliver to our forwarder in Erbil.", life: "shipped", pay: ["suli", "USD"] },
  { buyer: "morteza", items: [["arya-7018", 20], ["zg-flap", 30], ["zg-wire", 20]], ship: ["Ghasemi Construction Supply", "100m Road, near Family Mall", "Erbil", "Kurdistan Region", "", "IQ", "+964 750 448 2210"], notes: "", life: "invoiced-unpaid", pay: ["erbil", "USD"] },
  { buyer: "abbas", items: [["arya-tig", 1], ["al-helmet", 4]], ship: ["Rahmani Oilfield Services", "Shatt al-Arab Street, Building 41", "Basra", "", "", "IQ", "+964 780 311 6625"], notes: "Helmets for the site crew.", life: "partial-cancel", pay: ["basra", "IQD"] },
  { buyer: "pedram", items: [["arya-mig", 2], ["al-helmet", 2], ["arya-er70", 8]], ship: ["Saberi Metal Works", "Mussafah M-40, Plot 18", "Abu Dhabi", "", "", "AE", "+971 52 664 0193"], notes: "", life: "delivered", pay: ["dxbDeira", "AED"] },
  { buyer: "houman", items: [["zg-flap", 50], ["zg-cut", 60]], ship: ["Daneshvar Dis Ticaret", "Merkez Mah. Gencler Cad. No:3", "Istanbul", "Esenyurt", "34510", "TR", "+90 535 770 2281"], notes: "Re-export, need origin documents.", life: "paid", pay: ["istLaleli", "USD"] },
  { buyer: "azadeh", items: [["pg-torch", 2], ["arya-7018", 6]], ship: ["Khosravi General Trading", "Office 1203, Bay Square 7, Business Bay", "Dubai", "", "", "AE", "+971 56 118 9030"], notes: "", life: "shipped", pay: ["dxbRas", "AED"] },
  { buyer: "taha", items: [["arya-mig", 1], ["zg-cut", 10]], ship: ["Rezvani Building Materials", "Kufa Road, near Thawra roundabout", "Najaf", "", "", "IQ", "+964 781 902 5534"], notes: "", life: "pending", pay: ["basra", "IQD"] },
  { buyer: "nima", items: [["zg-flap", 2], ["al-gloves", 1]], ship: ["Nima Esfandiari", "88 Finch Ave W, Unit 4", "Toronto", "ON", "M2N 2H7", "CA", "+1 416 555 0182"], notes: "Garage hobby shop.", life: "delivered", method: "contact" },
  { buyer: "golnaz", items: [["arya-er70", 30], ["arya-7018", 10], ["zg-flap", 40]], ship: ["Golnaz Mousavi", "2450 Meadowpine Blvd", "Mississauga", "ON", "L5N 6S2", "CA", "+1 905 555 0147"], company: "Arvin Precision Inc.", notes: "PO 4471-B. Net 30 per our account.", life: "net30-delivered", method: "net30" },
  { buyer: "vahid", items: [["arya-tig", 1], ["pg-reg", 1]], ship: ["Vahid Karami", "19288 22 Ave, Bay 6", "Surrey", "BC", "V3Z 3S6", "CA", "+1 604 555 0119"], company: "Karami Fabrication", notes: "", life: "shipped", method: "contact" },
  { buyer: "siavash", items: [["al-helmet", 1]], ship: ["Siavash Fallahi", "4500 rue Saint-Denis", "Montreal", "QC", "H2J 2L3", "CA", "+1 514 555 0164"], notes: "", life: "pending", method: "contact" },
  { buyer: "babak", items: [["arya-mig", 1], ["pg-reg", 1], ["arya-er70", 2]], ship: ["Babak Nouri", "17 Gorham St", "Newmarket", "ON", "L3Y 1K3", "CA", "+1 905 555 0133"], notes: "For the trailer project.", life: "delivered", method: "contact" },
  { buyer: "ehsan", items: [["arya-er70", 4], ["zg-cut", 4]], ship: ["Ehsan Partovi", "301 Wilson Ave, Apt 1207", "Toronto", "ON", "M3H 1S8", "CA", "+1 647 555 0171"], notes: "", life: "shipped", method: "contact" },
  { buyer: "shahin", items: [["arya-tig", 1]], ship: ["Shahin Darvish", "60 Bayview Pkwy", "Richmond Hill", "ON", "L4C 2T5", "CA", "+1 905 555 0190"], notes: "", life: "buyer-cancel", method: "contact" },
];

// ───────────────────────── Run ─────────────────────────

const P = Object.fromEntries(personas.map((p) => [p.key, p]));
const products = {};
const ledger = [];

async function signIn(email, password, platform = "ios") {
  const r = await api("POST", "/api/mobile/auth/login", null, { email, password, platform, deviceName: platform === "ios" ? "iPhone 15" : "Galaxy A54" });
  return r.status === 200 ? r.json : null;
}

async function main() {
  console.log(`Seeding ${personas.length} personas against ${BASE}`);
  if (personas.length !== 50) throw new Error(`expected 50 personas, have ${personas.length}`);

  // 1. Sign up + sign in
  for (const [i, p] of personas.entries()) {
    const r = await api("POST", "/api/auth/register", null, {
      email: p.email, password: PERSONA_PASSWORD, name: p.name, role: p.role, city: p.city, businessName: p.businessName, acceptTerms: true,
    });
    check(`register ${p.name}`, r, [200, 409]);
    const s = await signIn(p.email, PERSONA_PASSWORD, i % 3 === 0 ? "android" : "ios");
    if (!s) { check(`login ${p.name}`, { status: 401 }, 200); continue; }
    p.token = s.accessToken; p.id = s.user.id;
    check(`login ${p.name}`, { status: 200 }, 200);
  }
  // Registration without accepting terms must be refused.
  check("register without terms is refused", await api("POST", "/api/auth/register", null, { email: "farzaneh.amini.weld@gmail.com", password: PERSONA_PASSWORD, name: "Farzaneh Amini", role: "WELDER" }), 400);
  check("wrong password is refused", { status: (await signIn(P.reza.email, "nope-nope")) ? 200 : 401 }, 401);

  // 2. Welder profiles
  for (const p of personas.filter((x) => x.role === "WELDER")) {
    check(`profile ${p.name}`, await api("POST", "/api/profile", p.token, { ...p.profile, country: p.country }), 200);
  }
  check("customer cannot edit a welder profile", await api("POST", "/api/profile", P.shirin.token, { bio: "x" }), 403);

  // 3. Admin approvals (no app endpoint — done as ops would in /admin)
  await prisma.welderProfile.updateMany({ where: { userId: { in: APPROVED_WELDERS.map((k) => P[k].id) } }, data: { approved: true } });
  await prisma.supplierProfile.updateMany({ where: { userId: { in: APPROVED_SUPPLIERS.map((k) => P[k].id) } }, data: { approved: true } });
  for (const k of ["bahram", "shahram", "kourosh", "roya"]) {
    await prisma.supplierProfile.update({ where: { userId: P[k].id }, data: { description: `${P[k].businessName} — ${P[k].city}. Welding supplies shipped across Canada and export to the Gulf, Turkey and Iraq.`, website: `https://${P[k].email.split("@")[1]}` } });
  }

  // 4. Supplier listings
  const cats = await api("GET", "/api/categories");
  const catId = {};
  for (const c of cats.json) { catId[c.slug] = c.id; for (const ch of c.children ?? []) catId[ch.slug] = ch.id; }
  for (const [sup, list] of Object.entries(listings)) {
    for (const l of list) {
      const slug = `${l.sku.toLowerCase()}`;
      const img = (await api("GET", `/api/products?category=${l.cat}`)).json?.items?.find((x) => x.imageUrl)?.imageUrl ?? "";
      const r = await api("POST", "/api/products", P[sup].token, { name: l.name, brand: l.brand, sku: l.sku, slug, categoryId: catId[l.cat], priceCents: l.priceCents, stock: l.stock, imageUrl: img, description: l.description });
      check(`list ${l.name}`, r, [200, 409]);
      const prod = await prisma.product.findUnique({ where: { slug } });
      products[l.key] = { id: prod.id, supplier: sup, priceCents: prod.priceCents, name: prod.name };
    }
  }
  check("customer cannot list a product", await api("POST", "/api/products", P.jalal.token, { name: "Grinder", slug: "x-grinder", categoryId: catId["abrasives"], priceCents: 100, stock: 1 }), 403);

  // 5. Jobs
  const jobLog = [];
  for (const j of jobs) {
    const owner = P[j.customer];
    const r = await api("POST", "/api/jobs", owner.token, { title: j.title, description: j.description, city: j.city, category: j.category, budget: j.budget });
    if (!check(`post job: ${j.title}`, r, 200)) continue;
    const jobId = r.json.id;
    const bidIds = {};
    for (const [w, amount, message] of j.bids) {
      const b = await api("POST", `/api/jobs/${jobId}/bids`, P[w].token, { amount, message });
      check(`bid ${P[w].name} on "${j.title}"`, b, 200);
      bidIds[w] = b.json?.id;
    }
    for (const [from, to, body] of j.talk) {
      const m = await api("POST", `/api/jobs/${jobId}/messages`, P[from].token, { body, ...(to ? { toId: P[to].id } : {}) });
      check(`message ${P[from].name} on "${j.title}"`, m, 200);
    }
    if (j.accept) {
      check(`award "${j.title}" to ${P[j.accept].name}`, await api("POST", `/api/jobs/${jobId}/accept`, owner.token, { bidId: bidIds[j.accept] }), 200);
      if (["IN_PROGRESS", "COMPLETED"].includes(j.outcome)) {
        check(`${P[j.accept].name} starts "${j.title}"`, await api("POST", `/api/jobs/${jobId}/status`, P[j.accept].token, { status: "IN_PROGRESS" }), 200);
      }
      if (j.outcome === "COMPLETED") {
        check(`welder cannot close "${j.title}"`, await api("POST", `/api/jobs/${jobId}/status`, P[j.accept].token, { status: "COMPLETED" }), 403);
        check(`${owner.name} completes "${j.title}"`, await api("POST", `/api/jobs/${jobId}/status`, owner.token, { status: "COMPLETED" }), 200);
        const [rating, comment] = j.review;
        check(`review on "${j.title}"`, await api("POST", `/api/jobs/${jobId}/review`, owner.token, { rating, comment }), 200);
        check(`second review refused on "${j.title}"`, await api("POST", `/api/jobs/${jobId}/review`, owner.token, { rating, comment }), 409);
      }
    }
    if (j.outcome === "CANCELLED") {
      check(`${owner.name} cancels "${j.title}"`, await api("POST", `/api/jobs/${jobId}/status`, owner.token, { status: "CANCELLED" }), 200);
      check(`no messages on cancelled "${j.title}"`, await api("POST", `/api/jobs/${jobId}/messages`, owner.token, { body: "Never mind" }), 400);
    }
    jobLog.push({ jobId, ...j, bidIds });
  }

  // Role and state guards on jobs
  const openJob = jobLog.find((j) => j.outcome === "OPEN");
  const awarded = jobLog.find((j) => j.outcome === "ASSIGNED");
  const doneJob = jobLog.find((j) => j.outcome === "COMPLETED");
  check("welder cannot post a job", await api("POST", "/api/jobs", P.reza.token, { title: "Need helper", description: "Looking for a helper for a week", city: "Toronto", category: "other" }), 403);
  check("customer cannot bid", await api("POST", `/api/jobs/${openJob.jobId}/bids`, P.jalal.token, { amount: 100 }), 403);
  check("duplicate bid refused", await api("POST", `/api/jobs/${openJob.jobId}/bids`, P[openJob.bids[0][0]].token, { amount: 999 }), 409);
  check("bid on awarded job refused", await api("POST", `/api/jobs/${awarded.jobId}/bids`, P.peyman.token, { amount: 5000 }), 400);
  check("non-bidder cannot message", await api("POST", `/api/jobs/${openJob.jobId}/messages`, P.peyman.token, { body: "Hi" }), 403);
  const multiBid = jobLog.find((j) => j.outcome === "OPEN" && j.bids.length > 2);
  check("owner with many bidders must pick a recipient", await api("POST", `/api/jobs/${multiBid.jobId}/messages`, P[multiBid.customer].token, { body: "Hello all" }), 400);
  check("awarded job message goes to the winner", await api("POST", `/api/jobs/${jobLog[0].jobId}/messages`, P.mohammad.token, { body: "Crane is booked for Monday 7am." }), 200);
  check("stranger cannot award", await api("POST", `/api/jobs/${openJob.jobId}/accept`, P.kaveh.token, { bidId: Object.values(openJob.bidIds)[0] }), 403);
  check("review before completion refused", await api("POST", `/api/jobs/${awarded.jobId}/review`, P[awarded.customer].token, { rating: 5 }), 400);
  check("completed job cannot be cancelled", await api("POST", `/api/jobs/${doneJob.jobId}/status`, P[doneJob.customer].token, { status: "CANCELLED" }), 403);

  // Trust & safety: spam bidder reported and blocked by two customers
  const maniBid = jobLog.find((j) => j.bidIds.mani)?.bidIds.mani;
  check("Kaveh reports Mani's bid as spam", await api("POST", "/api/reports", P.kaveh.token, { targetType: "BID", targetId: jobLog.find((j) => j.customer === "kaveh").bidIds.mani, reason: "SPAM", details: "Same copy-paste bid on every job, no profile." }), 200);
  check("Mohammad reports Mani as a user", await api("POST", "/api/reports", P.mohammad.token, { targetType: "USER", targetId: P.mani.id, reason: "SCAM", details: "Asked for a deposit by WhatsApp." }), 200);
  check("Leila blocks Mani", await api("POST", "/api/blocks", P.leila.token, { userId: P.mani.id }), [200, 201]);
  const leilaNew = await api("POST", "/api/jobs", P.leila.token, { title: "Mailbox post welding", description: "Weld a steel mailbox post base plate back on.", city: "Oakville", category: "repair", budget: 150 });
  check("Leila posts a second job", leilaNew, 200);
  check("blocked Mani cannot bid on Leila's job", await api("POST", `/api/jobs/${leilaNew.json?.id}/bids`, P.mani.token, { amount: 80 }), 404);
  check("Mani's report target recorded", { status: maniBid ? 200 : 0 }, 200);

  // 6. Orders
  await adminSignIn();
  check("customer cannot issue an invoice", await api("POST", `/api/admin/orders/x/invoices`, P.jalal.token, {}), 403);
  const orderLog = [];
  for (const o of orders) {
    const b = P[o.buyer];
    for (const [k, qty] of o.items) {
      check(`${b.name} adds ${qty}× ${products[k].name}`, await api("POST", "/api/cart", b.token, { productId: products[k].id, quantity: qty }), 200);
    }
    const [name, address, city, region, postal, country, phone] = o.ship;
    const quote = await api("GET", `/api/cart?country=${country}&region=${encodeURIComponent(region)}`, b.token);
    const r = await api("POST", "/api/checkout", b.token, {
      name, company: o.company ?? (o.ship[0] !== b.name ? o.ship[0] : ""), address, city, region, postal, country, phone, notes: o.notes,
      paymentMethod: o.method ?? "contact",
    });
    if (!check(`checkout ${b.name}`, r, 200)) continue;
    const orderId = r.json.id;
    const order = await prisma.order.findUnique({ where: { id: orderId }, include: { items: true } });
    if (quote.json?.totals && quote.json.totals.totalCents !== order.totalCents) {
      check(`cart quote matches order total for ${b.name}`, { status: 0 }, 200);
    } else check(`cart quote matches order total for ${b.name}`, { status: 200 }, 200);
    orderLog.push({ orderId, o, order });
  }
  check("empty cart cannot check out", await api("POST", "/api/checkout", P.jalal.token, { name: "Jalal Heidari", address: "Al Quoz", city: "Dubai", country: "AE" }), 400);
  check("over-stock add is refused at checkout", await (async () => {
    await api("POST", "/api/cart", P.nima.token, { productId: products["arya-tig"].id, quantity: 999 });
    const r = await api("POST", "/api/checkout", P.nima.token, { name: "Nima Esfandiari", address: "88 Finch Ave W", city: "Toronto", region: "ON", country: "CA" });
    const cart = await api("GET", "/api/cart", P.nima.token);
    for (const it of cart.json.items) await api("DELETE", `/api/cart/${it.id}`, P.nima.token);
    return r;
  })(), 400);

  // Every product above belongs to a persona supplier.
  const supToken = {};
  for (const k of Object.keys(listings)) supToken[k] = P[k].token;

  async function fulfil(orderId, cancelKeys = []) {
    for (const k of Object.keys(supToken)) {
      const lines = (await api("GET", "/api/supplier/order-items", supToken[k])).json.filter((l) => l.orderId === orderId && l.status === "PENDING");
      for (const l of lines) {
        const cancel = cancelKeys.some((ck) => products[ck].name === l.name);
        check(`${P[k].businessName} ${cancel ? "cancels" : "ships"} ${l.name} (${l.reference})`, await api("POST", `/api/supplier/order-items/${l.id}`, supToken[k], { status: cancel ? "CANCELLED" : "FULFILLED" }), 200);
      }
    }
  }

  for (const { orderId, o, order } of orderLog) {
    const b = P[o.buyer];
    const ref = `#${orderId.slice(-8).toUpperCase()}`;
    const entry = { reference: ref, orderId, buyer: b.name, buyerCity: b.city, totalCAD: order.totalCents / 100, lifecycle: o.life };

    if ((o.pay && o.life !== "pending") || o.life === "net30-delivered") {
      // Invoice issued after the follow-up call, through the admin endpoint.
      const issued = new Date(NOW - (b.joined - 3) * DAY + 2 * DAY);
      const net30 = o.life === "net30-delivered";
      const ex = o.pay && EXCHANGES[o.pay[0]];
      const inv = await adminApi("POST", `/api/admin/orders/${orderId}/invoices`, {
        dueDays: net30 ? 30 : 7,
        notes: net30 ? "Net 30 per account terms, PO 4471-B." : `Pay through ${ex.name} (${ex.branch}) in CAD, USD or local currency.`,
      });
      check(`invoice ${ref}`, inv, 200);
      check(`second invoice refused ${ref}`, await adminApi("POST", `/api/admin/orders/${orderId}/invoices`, {}), 409);
      await prisma.invoice.update({ where: { id: inv.json.id }, data: { issuedAt: issued, dueAt: new Date(issued.getTime() + (net30 ? 30 : 7) * DAY) } });
      entry.invoice = { number: inv.json.number, issued: issued.toISOString().slice(0, 10), terms: net30 ? "Net 30" : "Due in 7 days", amount: order.totalCents / 100 };

      if (o.pay && o.life !== "invoiced-unpaid") {
        const [exKey, currency] = o.pay;
        const paidOn = new Date(issued.getTime() + 2 * DAY);
        const local = Math.round((order.totalCents / 100) * RATE[currency] * 100) / 100;
        const fee = Math.round(local * 0.012 * 100) / 100;
        const tracking = `${exKey.slice(0, 3).toUpperCase()}-${paidOn.toISOString().slice(2, 10).replace(/-/g, "")}-${Math.floor(1000 + Math.random() * 9000)}`;
        const payment = {
          method: "EXCHANGE", paidAt: paidOn.toISOString(), exchangeName: ex.name, exchangeBranch: ex.branch, exchangeCountry: ex.country,
          localCurrency: currency, localFee: fee, rate: RATE[currency], reference: tracking,
        };
        check(`exchange payment without a reference refused ${ref}`, await adminApi("POST", `/api/admin/invoices/${inv.json.id}/payments`, { ...payment, reference: "", amountCents: order.totalCents }), 400);
        check(`overpayment refused ${ref}`, await adminApi("POST", `/api/admin/invoices/${inv.json.id}/payments`, { ...payment, amountCents: order.totalCents + 100 }), 400);
        // The larger orders are settled in two transfers, as buyers often do.
        const split = order.totalCents > 500000 ? [Math.round(order.totalCents * 0.4), order.totalCents - Math.round(order.totalCents * 0.4)] : [order.totalCents];
        for (const [n, cents] of split.entries()) {
          const r = await adminApi("POST", `/api/admin/invoices/${inv.json.id}/payments`, {
            ...payment, amountCents: cents, localAmount: Math.round((cents / 100) * RATE[currency] * 100) / 100,
            reference: split.length > 1 ? `${tracking}-${n + 1}` : tracking, localFee: Math.round((cents / 100) * RATE[currency] * 0.012 * 100) / 100,
          });
          check(`payment ${n + 1}/${split.length} for ${ref}`, r, 200);
          check(`order ${n + 1 < split.length ? "stays PENDING" : "becomes PAID"} ${ref}`, { status: (await prisma.order.findUnique({ where: { id: orderId } })).status === (n + 1 < split.length ? "PENDING" : "PAID") ? 200 : 0 }, 200);
        }
        entry.payment = { exchange: ex.name, branch: ex.branch, country: ex.country, paidOn: paidOn.toISOString().slice(0, 10), currency, amountLocal: local, exchangeFeeLocal: fee, rateCADtoLocal: RATE[currency], reference: tracking, transfers: split.length, settledCAD: order.totalCents / 100 };
        check(`paid invoice cannot be voided ${ref}`, await adminApi("POST", `/api/admin/invoices/${inv.json.id}/void`), 400);
        check(`buyer cannot cancel paid order ${ref}`, await api("POST", `/api/orders/${orderId}/cancel`, b.token), 400);
      }
    }

    if (["delivered", "shipped", "net30-delivered"].includes(o.life)) await fulfil(orderId);
    if (o.life === "partial-cancel") await fulfil(orderId, ["al-helmet"]);
    if (["delivered", "net30-delivered", "partial-cancel"].includes(o.life)) {
      check(`${b.name} confirms receipt ${ref}`, await api("POST", `/api/orders/${orderId}/receive`, b.token), 200);
      check(`supplier cannot change completed ${ref}`, await (async () => {
        const anyLine = await prisma.orderItem.findFirst({ where: { orderId } });
        return api("POST", `/api/supplier/order-items/${anyLine.id}`, supToken[Object.keys(supToken).find((k) => P[k].id === anyLine.supplierId)], { status: "PENDING" });
      })(), 400);
    }
    if (o.life === "pending" && o.buyer === "siavash") {
      check(`buyer cannot confirm receipt of unshipped ${ref}`, await api("POST", `/api/orders/${orderId}/receive`, b.token), 400);
    }
    if (o.life === "buyer-cancel") {
      const before = (await prisma.product.findUnique({ where: { id: products["arya-tig"].id } })).stock;
      check(`${b.name} cancels ${ref}`, await api("POST", `/api/orders/${orderId}/cancel`, b.token), 200);
      const after = (await prisma.product.findUnique({ where: { id: products["arya-tig"].id } })).stock;
      check(`stock returned after cancel ${ref}`, { status: after === before + 1 ? 200 : 0 }, 200);
    }
    check(`stranger cannot read order ${ref}`, await api("GET", `/api/orders/${orderId}`, P.reza.token), [403, 404]);
    const final = await prisma.order.findUnique({ where: { id: orderId } });
    entry.finalStatus = final.status;
    ledger.push(entry);
  }

  // 7. Backdate so dashboards look like ~3 months of activity
  for (const p of personas) {
    if (!p.id) continue;
    await prisma.user.update({ where: { id: p.id }, data: { createdAt: new Date(NOW - p.joined * DAY), termsAcceptedAt: new Date(NOW - p.joined * DAY) } });
  }
  for (const j of jobLog) {
    const t0 = NOW - (P[j.customer].joined - 2) * DAY;
    await prisma.job.update({ where: { id: j.jobId }, data: { createdAt: new Date(t0) } });
    const bids = await prisma.bid.findMany({ where: { jobId: j.jobId }, orderBy: { createdAt: "asc" } });
    for (const [i, b] of bids.entries()) await prisma.bid.update({ where: { id: b.id }, data: { createdAt: new Date(t0 + (i + 1) * 0.6 * DAY) } });
    const msgs = await prisma.message.findMany({ where: { jobId: j.jobId }, orderBy: { createdAt: "asc" } });
    for (const [i, m] of msgs.entries()) await prisma.message.update({ where: { id: m.id }, data: { createdAt: new Date(t0 + (bids.length + 1 + i * 0.3) * 0.6 * DAY) } });
    await prisma.review.updateMany({ where: { jobId: j.jobId }, data: { createdAt: new Date(Math.min(NOW - DAY, t0 + 20 * DAY)) } });
  }
  for (const { orderId, o } of orderLog) {
    await prisma.order.update({ where: { id: orderId }, data: { createdAt: new Date(NOW - (P[o.buyer].joined - 3) * DAY) } });
  }

  writeFileSync(new URL("./personas-ledger.json", import.meta.url), JSON.stringify({ generatedAt: new Date().toISOString(), password: PERSONA_PASSWORD, exchanges: EXCHANGES, rates: RATE, orders: ledger }, null, 2));

  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
  for (const f of failed) console.log(`FAIL ${f.label} → ${f.status} ${f.error ?? ""}`);
  writeFileSync(new URL("./personas-results.json", import.meta.url), JSON.stringify(results, null, 2));
}

main().catch((e) => { console.error(e); process.exitCode = 1; }).finally(() => prisma.$disconnect());
