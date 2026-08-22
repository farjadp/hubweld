/**
 * Seed — content refresh (products + articles)
 *
 * Plain ESM JavaScript on purpose: this runs in the production container via
 * `node`, where tsx (a devDependency) is not installed. Idempotent — it skips
 * any slug that already exists, so it is safe to run on every boot.
 *
 * Run locally: node prisma/seed-content.mjs
 */
import pkg from "@prisma/client";
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

const U = (id, w = 800) => `https://images.unsplash.com/${id}?w=${w}&q=80`;

// ─── Products ────────────────────────────────────────────────────────
const products = [
  {
    slug: "arcforge-210-mig-stick-inverter",
    name: "ArcForge 210 MIG/Stick Inverter Welder",
    brand: "ArcForge",
    sku: "AF-210-MS",
    category: "mig-welders",
    priceCents: 124900,
    stock: 18,
    imageUrl: U("photo-1537462715879-360eeb61a0ad"),
    description:
      "Dual-process 210 A inverter welder with synergic MIG and hot-start stick. 120/240 V dual-voltage input, 60% duty cycle at 160 A, spool gun ready. Includes 10 ft MIG torch, electrode holder, gas hose and regulator.",
    featured: true,
  },
  {
    slug: "plasmapro-cut45-plasma-cutter",
    name: "PlasmaPro CUT-45 Plasma Cutter",
    brand: "PlasmaPro",
    sku: "PP-CUT45",
    category: "plasma-cutters",
    priceCents: 89900,
    stock: 12,
    imageUrl: U("photo-1504917595217-d4dc5ebe6122"),
    description:
      "45 A pilot-arc plasma cutter with a clean cut to 1/2 in and severance to 3/4 in on mild steel. Non-touch pilot arc handles painted and rusty plate; 2T/4T torch control and drag-cut shield included.",
    featured: true,
  },
  {
    slug: "er70s6-mig-wire-035-33lb",
    name: 'ER70S-6 MIG Wire 0.035" — 33 lb Spool',
    brand: "ForgeGrip",
    sku: "FG-70S6-035-33",
    category: "mig-wire",
    priceCents: 6450,
    stock: 140,
    imageUrl: U("photo-1587293852726-70cdb56c2866"),
    description:
      "Copper-coated ER70S-6 solid MIG wire with high silicon and manganese deoxidizers for cleaner welds on mill-scale plate. Consistent cast and helix for smooth feeding on long liners. AWS A5.18 certified, lot-traceable.",
    featured: false,
  },
  {
    slug: "autoshade-x110-welding-helmet",
    name: "AutoShade X110 Auto-Darkening Welding Helmet",
    brand: "AutoShade",
    sku: "AS-X110",
    category: "helmets",
    priceCents: 18900,
    stock: 45,
    imageUrl: U("photo-1504328345606-18bbc8c9d7d1"),
    description:
      "True-color 1/1/1/2 optics with four arc sensors, variable shade 5–13 and a 0.04 ms switching time. Grind and cut modes, solar-assist power, and a 110 × 90 mm viewing area. Meets ANSI Z87.1 and CSA Z94.3.",
    featured: true,
  },
  {
    slug: "heavyduty-ground-clamp-600a",
    name: "HeavyDuty 600 A Ground Clamp",
    brand: "Multimaster",
    sku: "MM-GC600",
    category: "clamps",
    priceCents: 4200,
    stock: 90,
    imageUrl: U("photo-1560574188-6a6774965120"),
    description:
      "Forged copper-alloy jaws with a machined contact pad for full-current transfer at 600 A. Accepts 4/0 cable with dual set screws; spring rated for 40,000 open-close cycles.",
    featured: false,
  },
  {
    slug: "tig-tungsten-2pct-lanthanated-332",
    name: 'TIG Tungsten 2% Lanthanated 3/32" — 10 pk',
    brand: "PrecisionArc",
    sku: "PA-WL20-332",
    category: "tungsten",
    priceCents: 2890,
    stock: 200,
    imageUrl: U("photo-1530124566582-a618bc2615dc"),
    description:
      "Blue-tip 2% lanthanated tungsten electrodes for AC and DC TIG. Easier arc starts and longer tip life than thoriated, with no radioactive dust at the grinder. Ground finish, 7 in length.",
    featured: false,
  },
  {
    slug: "flowmaster-argon-regulator-flowmeter",
    name: "FlowMaster Argon Regulator / Flowmeter Combo",
    brand: "FlowMaster",
    sku: "FM-AR60",
    category: "regulators",
    priceCents: 11900,
    stock: 38,
    imageUrl: U("photo-1615906655593-ad0386982a0f"),
    description:
      "CGA-580 inlet with a 0–60 SCFH argon/CO₂ mix flowmeter tube. Dual-scale gauge, brass body, 5 ft inert-gas hose included. Fits MIG and TIG shielding setups.",
    featured: false,
  },
  {
    slug: "cutmax-6in-cutoff-wheels-25pk",
    name: 'CutMax 6" × .045" Cut-Off Wheels — 25 pk',
    brand: "CutMax",
    sku: "CM-6045-25",
    category: "cutoff-wheels",
    priceCents: 5400,
    stock: 110,
    imageUrl: U("photo-1469289759076-d1484757abc3"),
    description:
      "Aluminum-oxide Type 1 cut-off wheels for steel and stainless. Thin .045 in kerf for fast, cool cuts with minimal burring; 7/8 in arbor fits standard angle grinders. Max 10,100 RPM.",
    featured: false,
  },
];

// ─── Articles ────────────────────────────────────────────────────────
const articles = [
  {
    slug: "welding-industry-outlook-2026",
    title: "Welding Industry Outlook 2026: The Skilled-Trades Shortage Meets Automation",
    excerpt: "Where the welding labor market, equipment demand, and automation actually stand in 2026 — and what it means for contractors, distributors, and shop owners.",
    category: "industry-news",
    date: "2026-01-14T08:00:00Z",
    cover: U("photo-1591955506264-3f5a6834570a", 1200),
    seoTitle: "Welding Industry Outlook 2026: Labor Shortage, Automation & Demand",
    seoDesc: "The 2026 welding industry in numbers: welder shortage projections, wage trends, automation adoption, and where equipment demand is heading. A practical outlook for shops and distributors.",
    seoKeywords: "welding industry outlook 2026, welder shortage 2026, welding automation trends, welding equipment demand, skilled trades shortage",
    views: 742,
    body: `
<p>The American Welding Society has been warning about a welder shortfall for a decade. In 2026 the gap is no longer a projection — it is a scheduling problem on real jobs. Fabrication shops quote longer lead times, field contractors turn down emergency calls, and wages for certified pipe and structural welders keep climbing faster than general construction pay.</p>
<h2>Three forces shaping 2026</h2>
<h3>1. The retirement cliff is here</h3>
<p>The median welder in North America is in their mid-50s. Retirements now outpace new certifications in most regions, and the shortfall is concentrated exactly where the stakes are highest: code work — structural steel, pressure piping, and anything requiring AWS or CWB qualification.</p>
<h3>2. Automation absorbs volume, not variety</h3>
<p>Robotic cells and cobots took real share of high-volume production welding in the last three years. What they did <strong>not</strong> take is repair, field, and short-run fabrication work — the jobs where fit-up varies, access is awkward, and judgment matters. That work still needs a certified human, and it pays accordingly.</p>
<h3>3. Procurement is moving online</h3>
<p>Industrial buyers who once phoned three distributors now search first. Consumables, abrasives, and even machines increasingly move through digital channels with visible stock and transparent pricing — the same shift MRO supply went through ten years ago.</p>
<h2>What it means in practice</h2>
<ul>
<li><strong>For shop owners:</strong> certified welders are a revenue constraint, not a cost line. Retention beats recruitment on price.</li>
<li><strong>For contractors and plants:</strong> qualifying a bench of vetted outside welders <em>before</em> the breakdown happens is now standard risk management.</li>
<li><strong>For distributors:</strong> stock visibility is the new storefront. If a buyer cannot see it, you do not have it.</li>
</ul>
<p>Platforms that connect certified welders with the work — and buyers with in-stock equipment — exist precisely because of these three forces. Post a job on the <a href="/jobs">HubWeld job board</a> or browse <a href="/shop">current equipment stock</a> to see the model working.</p>
`,
  },
  {
    slug: "mig-vs-tig-vs-stick-2026",
    title: "MIG vs TIG vs Stick in 2026: Choosing the Right Process for the Job",
    excerpt: "A working comparison of the three arc processes — deposition rates, position tolerance, cost per foot, and where each one actually wins.",
    category: "welding-techniques",
    date: "2026-02-20T08:00:00Z",
    cover: U("photo-1504328345606-18bbc8c9d7d1", 1200),
    seoTitle: "MIG vs TIG vs Stick Welding: Which Process to Use (2026 Guide)",
    seoDesc: "MIG, TIG, or Stick? Compare deposition rate, weld quality, position tolerance, and cost per foot to pick the right welding process for fabrication, field, and repair work.",
    seoKeywords: "MIG vs TIG vs stick, welding process comparison, GMAW GTAW SMAW, which welding process, welding process selection",
    views: 1184,
    body: `
<p>Every process argument in a shop eventually reduces to the same three questions: how fast does it deposit, how clean does it need to be, and where is the joint? Answer those and the process picks itself.</p>
<h2>The short version</h2>
<table><thead><tr><th>Factor</th><th>MIG (GMAW)</th><th>TIG (GTAW)</th><th>Stick (SMAW)</th></tr></thead><tbody>
<tr><td>Deposition</td><td>High</td><td>Low</td><td>Medium</td></tr>
<tr><td>Weld appearance</td><td>Good</td><td>Excellent</td><td>Fair</td></tr>
<tr><td>Wind / field tolerance</td><td>Poor (shielding gas)</td><td>Poor</td><td>Excellent</td></tr>
<tr><td>Thin material</td><td>Good</td><td>Excellent</td><td>Poor</td></tr>
<tr><td>Operator skill floor</td><td>Low</td><td>High</td><td>Medium</td></tr>
</tbody></table>
<h2>Where each one wins</h2>
<h3>MIG: production and general fabrication</h3>
<p>For mild steel from 20 gauge to 1/2 in under a roof, MIG is the default for a reason — the highest first-pass speed per dollar of any manual process. Pair ER70S-6 wire with C25 gas and most shop work is covered.</p>
<h3>TIG: when the weld is the product</h3>
<p>Stainless food-grade tube, aluminum, thin sheet, and anything a customer will look at. Slow, but nothing else gives that control over heat input and bead profile.</p>
<h3>Stick: outside, on repairs, on dirty steel</h3>
<p>Wind laughs at shielding gas. E7018 in a field kit still fixes more broken equipment than every other process combined, which is why <a href="/directory">mobile welders</a> carry an engine drive before anything else.</p>
<h2>The 2026 wrinkle: multi-process machines</h2>
<p>Modern inverters made the argument cheaper. A dual-voltage multi-process unit now covers MIG, stick, and DC TIG credibly for well under $1,500 — see what's <a href="/shop">in stock</a> — so the question is no longer which machine to buy, just which process to run on today's joint.</p>
`,
  },
  {
    slug: "how-to-read-a-wps",
    title: "How to Read a WPS: A Practical Guide for Contractors and Buyers",
    excerpt: "The Welding Procedure Specification is the contract between design intent and what happens at the arc. Here is how to read one without being a welding engineer.",
    category: "welding-techniques",
    date: "2026-03-18T08:00:00Z",
    cover: U("photo-1581094288338-2314dddb7ece", 1200),
    seoTitle: "How to Read a WPS (Welding Procedure Specification) — Practical Guide",
    seoDesc: "Learn to read a Welding Procedure Specification: essential variables, process and filler callouts, position, preheat, and how a WPS, PQR, and WPQ fit together.",
    seoKeywords: "how to read a WPS, welding procedure specification, WPS PQR WPQ, welding procedure qualification, AWS D1.1 WPS",
    views: 903,
    body: `
<p>When a buyer asks a shop "are you qualified to weld this?", the real answer lives in three documents. The <strong>WPS</strong> says how the joint must be welded. The <strong>PQR</strong> proves that recipe was tested and passed. The <strong>WPQ</strong> proves a specific welder can execute it. Miss any of the three and the weld may be fine — but it is not <em>acceptable</em>.</p>
<h2>The fields that matter</h2>
<h3>Process and filler</h3>
<p>The process callout (SMAW, GMAW, FCAW, GTAW) and the filler classification (E7018, ER70S-6, E71T-1) are the heart of the document. A substitution here — even a "better" wire — invalidates the procedure unless the WPS already allows it.</p>
<h3>Base metal and thickness range</h3>
<p>A WPS qualifies a <em>range</em>, not a single plate. Check that your material group and thickness fall inside it; qualification on 3/8 in plate does not automatically cover 2 in.</p>
<h3>Position</h3>
<p>1G/1F is flat, and flat-only qualification is the most common gap on real jobs. Overhead structural work needs 4G coverage on paper, not just a welder who can do it.</p>
<h3>Preheat, interpass, and heat input</h3>
<p>On thicker sections and higher-strength steels, these lines are the difference between a weld and a crack. If a contractor cannot tell you the required preheat for your joint, that is a signal.</p>
<h2>What buyers should actually ask for</h2>
<ul>
<li>The WPS number the job will run under — before work starts.</li>
<li>Welder qualification (WPQ) records for the people on your joint, in date.</li>
<li>Whether the code of record is AWS D1.1, CSA W59, ASME IX, or API 1104 — they do not interchange.</li>
</ul>
<p>This is exactly the information a well-scoped job posting should carry. When you <a href="/jobs/new">post a job on HubWeld</a>, specifying process, material, and code up front is what makes the bids you receive genuinely comparable.</p>
`,
  },
  {
    slug: "sourcing-obsolete-welding-parts-playbook",
    title: "Sourcing Obsolete Welding Parts: A Distributor's Playbook",
    excerpt: "Discontinued torch parts, legacy feeder boards, orphaned regulators — a systematic approach to finding parts the manufacturer stopped making.",
    category: "parts-sourcing",
    date: "2026-04-22T08:00:00Z",
    cover: U("photo-1587293852726-70cdb56c2866", 1200),
    seoTitle: "Sourcing Obsolete & Discontinued Welding Parts: Distributor Playbook",
    seoDesc: "A practical playbook for finding obsolete welding parts: cross-reference strategies, surplus networks, broker channels, and when retrofit beats hunting for NOS stock.",
    seoKeywords: "obsolete welding parts, discontinued welding parts, surplus welding stock, welding parts cross reference, NOS welding parts",
    views: 655,
    body: `
<p>Every plant maintenance manager knows the moment: a twenty-year-old wire feeder goes down, the OEM lists the drive board as discontinued, and the machine it feeds is bolted into a production line that cannot wait. The part exists — thousands were made — the problem is <em>finding</em> it.</p>
<h2>The four channels, in order</h2>
<h3>1. Cross-reference before you hunt</h3>
<p>Many "obsolete" parts were never unique. Torch consumables, drive rolls, and regulators frequently interchange across brands that shared an OEM. Twenty minutes with a cross-reference table beats two weeks of hunting for original stock.</p>
<h3>2. Surplus and new-old-stock networks</h3>
<p>Distributor back rooms hold decades of slow-moving inventory that never made it into any online catalog. This stock is invisible until someone lists it — which is precisely the gap marketplace platforms close. Surplus that is searchable sells; surplus in a box does not.</p>
<h3>3. Brokers for the truly rare</h3>
<p>Specialist brokers earn their margin on parts with no listed source: legacy control boards, orphaned European torch lines, military-spec connectors. Expect to pay for the search, not just the part.</p>
<h3>4. Retrofit as the honest fallback</h3>
<p>When the hunt exceeds the cost of a modern replacement subsystem, stop hunting. A new feeder that speaks to an old power source through a simple interface often beats a fourth month of downtime.</p>
<h2>For distributors holding surplus</h2>
<p>The other side of this story is opportunity. Discontinued stock on your shelf is someone's production line waiting to restart — at full margin, because availability <em>is</em> the product. Listing surplus where industrial buyers already search, like the <a href="/shop">HubWeld marketplace</a>, turns dead inventory into the highest-margin SKUs you own.</p>
`,
  },
  {
    slug: "welding-fume-rules-2026",
    title: "Welding Fume Rules in 2026: What OSHA and CSA Actually Require",
    excerpt: "Hexavalent chromium, manganese action levels, and local exhaust ventilation — the current state of fume compliance for shops in the US and Canada.",
    category: "safety-compliance",
    date: "2026-05-15T08:00:00Z",
    cover: U("photo-1516216628859-9bccecab13ca", 1200),
    seoTitle: "Welding Fume Regulations 2026: OSHA & CSA Compliance Guide",
    seoDesc: "What welding fume rules require in 2026: OSHA PELs for hexavalent chromium and manganese, CSA ventilation standards, LEV selection, and respirator requirements for shops.",
    seoKeywords: "welding fume regulations 2026, OSHA welding fume, hexavalent chromium welding, welding ventilation requirements, LEV welding, welding respirator requirements",
    views: 588,
    body: `
<p>Fume compliance stopped being paperwork the moment insurers started asking about it. In 2026, welding fume management is a standard line item in facility audits across the US and Canada — and the technical requirements have not gotten looser.</p>
<h2>The exposure limits that drive everything</h2>
<ul>
<li><strong>Hexavalent chromium (Cr VI)</strong> — generated welding stainless and some hardfacing alloys. OSHA's PEL of 5 µg/m³ (8-hr TWA) with an action level of 2.5 µg/m³ remains the tightest constraint in most shops that touch stainless.</li>
<li><strong>Manganese</strong> — present in nearly all steel filler metals. ACGIH's respirable TLV of 0.02 mg/m³ is the number occupational hygienists actually test against, and it is easy to exceed with FCAW indoors.</li>
<li><strong>General welding fume</strong> — the old "5 mg/m³ total fume" habit is not a safe harbor; component limits govern.</li>
</ul>
<h2>The control hierarchy, applied</h2>
<h3>Source capture first</h3>
<p>Local exhaust ventilation (LEV) — fume guns, extraction arms, downdraft tables — is the control regulators and insurers want to see before respirators. A capture arm positioned within one duct diameter of the arc removes the majority of fume before it reaches the breathing zone.</p>
<h3>Respirators as the layer, not the plan</h3>
<p>Where LEV cannot reach — field work, confined spaces, large weldments — PAPR helmets have become the default on stainless work. A respirator program means fit testing, medical evaluation, and documentation, not just buying masks.</p>
<h2>What a compliant shop can show</h2>
<ol>
<li>Air sampling results for the processes and alloys actually run.</li>
<li>Maintenance records for extraction equipment.</li>
<li>A written respiratory protection program where respirators are used.</li>
</ol>
<p>Certified shops increasingly treat fume compliance as a bid advantage. Buyers scoping sensitive work on <a href="/jobs">HubWeld</a> can — and should — ask bidders what fume controls they run.</p>
`,
  },
  {
    slug: "hiring-certified-welders-2026",
    title: "Hiring Certified Welders in a Tight 2026 Market: What Actually Works",
    excerpt: "Wages are table stakes. The shops keeping their benches full in 2026 compete on qualification support, schedule, and how fast they pay.",
    category: "business-distribution",
    date: "2026-06-05T08:00:00Z",
    cover: U("photo-1469289759076-d1484757abc3", 1200),
    seoTitle: "Hiring Certified Welders in 2026: Recruiting & Retention That Works",
    seoDesc: "How to hire certified welders in the 2026 labor market: realistic wage benchmarks, qualification sponsorship, contract-first hiring, and retention tactics that keep benches full.",
    seoKeywords: "hire certified welders, welder recruiting 2026, welder retention, welding labor shortage hiring, contract welders",
    views: 812,
    body: `
<p>Ask any fabrication shop owner what limits their revenue in 2026 and the answer is not machines, material, or orders. It is certified people. The shops that stay staffed have stopped treating hiring as an HR task and started treating it as a market position.</p>
<h2>What the market actually pays</h2>
<p>Certified structural welders in major North American metros now command $34–48/hr on staff, with code pipe welders and CWB-ticketed field hands well above that. Contract and emergency rates run 1.5–2× staff rates — which is precisely why a growing share of welders choose to stay independent.</p>
<h2>Four moves that fill benches</h2>
<h3>1. Sponsor the ticket</h3>
<p>Paying for a welder's AWS or CWB qualification — test fees, plate time, recertification — costs less than one month of an empty station. It also creates the loyalty wages alone do not.</p>
<h3>2. Hire contract-first</h3>
<p>The strongest welders in the market often will not take a staff job sight unseen. A paid contract engagement is a working interview both sides can trust, and platforms with review history — like <a href="/directory">a verified welder directory</a> — compress the vetting that used to take weeks.</p>
<h3>3. Pay fast</h3>
<p>Independent welders rank payment speed above rate more often than owners expect. Net-7 beats an extra two dollars an hour.</p>
<h3>4. Publish the work honestly</h3>
<p>Job posts that specify process, material, position, and code requirement up front attract qualified bids and repel mismatches. Vague posts get vague applicants.</p>
<h2>The structural shift</h2>
<p>The 2026 welder increasingly behaves like a professional practice: certifications maintained personally, reputation portable, work chosen. Shops that build systems for engaging that workforce — rather than waiting for it to apply — are the ones still quoting normal lead times. <a href="/jobs/new">Posting scoped work</a> where that workforce already looks is the shortest path.</p>
`,
  },
  {
    slug: "aws-d11-acceptance-criteria-explained",
    title: "AWS D1.1 Acceptance Criteria, Explained Simply",
    excerpt: "Undercut, porosity, profile — what the structural welding code actually allows, translated from code language into inspection practice.",
    category: "welding-techniques",
    date: "2026-06-24T08:00:00Z",
    cover: U("photo-1591955506264-3f5a6834570a", 1200),
    seoTitle: "AWS D1.1 Weld Acceptance Criteria Explained — Undercut, Porosity, Profile",
    seoDesc: "AWS D1.1 acceptance criteria in plain language: allowable undercut, porosity limits, weld profiles, and what visual inspection actually checks on structural steel.",
    seoKeywords: "AWS D1.1 acceptance criteria, weld acceptance criteria, allowable undercut D1.1, weld porosity limits, structural weld inspection",
    views: 771,
    body: `
<p>AWS D1.1 is written for engineers, but its acceptance criteria get applied by inspectors, foremen, and welders on live steel every day. Here is what the visual criteria actually mean at the weld, for statically loaded structures — the most common case.</p>
<h2>The big five, in plain terms</h2>
<h3>Cracks: zero, always</h3>
<p>No crack of any size, in weld or heat-affected zone, is ever acceptable. Everything else in the code is a tolerance; this is not.</p>
<h3>Undercut: depth-limited, not banned</h3>
<p>For material 1 in and thicker, undercut up to 1/16 in is generally permitted; thinner members and cyclically loaded work are tighter. A consistent shallow melt-line at a toe is often within code — a notch you can catch a fingernail in usually is not.</p>
<h3>Porosity: counted and sized</h3>
<p>Scattered surface porosity has diameter and spacing limits rather than a blanket prohibition. Piping porosity (holes that tunnel) is treated far more harshly than isolated spherical pores.</p>
<h3>Profile: the shape rules</h3>
<p>Convexity, excessive reinforcement, and abrupt toe angles concentrate stress. The code's profile figures reduce to one idea: the weld should flow into the base metal, not sit on it like a bead of caulk.</p>
<h3>Fusion and fill: complete means complete</h3>
<p>Underfilled craters, cold lap, and incomplete fusion at the root are rejects regardless of how good the cap looks.</p>
<h2>What this means for buyers</h2>
<p>"Welded to D1.1" is only meaningful with the inspection to prove it — at minimum, documented visual inspection by someone qualified to apply these criteria; beyond that, NDT as the engineer specifies. When scoping structural work, name the code and the inspection level in the job posting itself. Bids on <a href="/jobs">scoped structural jobs</a> that state acceptance criteria up front close faster and dispute less.</p>
`,
  },
  {
    slug: "mobile-welding-rates-2026",
    title: "Mobile Welding Rates in 2026: What Customers Actually Pay",
    excerpt: "Call-out fees, hourly rates, emergency premiums — real numbers for mobile welding across North America, and what drives the spread.",
    category: "business-distribution",
    date: "2026-07-10T08:00:00Z",
    cover: U("photo-1504307651254-35680f356dfd", 1200),
    seoTitle: "Mobile Welding Rates 2026: Hourly Costs, Call-Out Fees & Pricing Guide",
    seoDesc: "What mobile welding costs in 2026: typical hourly rates, call-out and truck fees, emergency premiums, and how job type, certification, and location move the price.",
    seoKeywords: "mobile welding rates 2026, mobile welder cost, welding hourly rate, emergency welding cost, on-site welding price",
    views: 1039,
    body: `
<p>Mobile welding pricing confuses buyers because two invoices for "an hour of welding" can differ by 3×. Both can be fair. The spread is structure, not gouging — here is the structure.</p>
<h2>The 2026 numbers</h2>
<table><thead><tr><th>Component</th><th>Typical range</th><th>Notes</th></tr></thead><tbody>
<tr><td>Base hourly rate</td><td>$95–165/hr</td><td>Rig, welder, and consumables included</td></tr>
<tr><td>Call-out / truck fee</td><td>$50–150</td><td>Flat; covers travel and setup</td></tr>
<tr><td>Emergency / after-hours</td><td>1.5–2× base</td><td>Nights, weekends, line-down calls</td></tr>
<tr><td>Certified code work</td><td>+$20–40/hr</td><td>Structural, pressure, food-grade</td></tr>
<tr><td>Minimums</td><td>2–4 hrs</td><td>Nearly universal</td></tr>
</tbody></table>
<h2>What moves the price</h2>
<h3>The rig, not just the welder</h3>
<p>A mobile rate carries a $60–120k truck: engine drive, gas, tooling, insurance. Comparing it to a shop hourly misreads what is being bought — the shop came to you.</p>
<h3>Certification and consequence</h3>
<p>A cracked equipment bracket and a structural mezzanine repair are different products. Code work requires the ticket, the procedure, and often the paper trail — and prices accordingly.</p>
<h3>Downtime economics</h3>
<p>Emergency premiums track the customer's cost of stopping, not the welder's cost of coming. A line losing $10k/hr makes a 2× premium trivially rational for both sides.</p>
<h2>Getting honest quotes</h2>
<p>The fastest way to a fair price is a scoped request: material, thickness, location, access, photos, and deadline. Vague requests price in uncertainty; scoped ones compete. <a href="/jobs/new">Posting the job with specifics</a> and letting qualified mobile welders bid turns an opaque phone quote into a comparable market price.</p>
`,
  },
  {
    slug: "duty-cycle-sizing-a-welder",
    title: "Duty Cycle Demystified: How to Size a Welder for Production Work",
    excerpt: "40% at 200 A means something specific. How to read duty-cycle ratings honestly and size a machine for the work instead of the spec sheet.",
    category: "welding-techniques",
    date: "2026-07-28T08:00:00Z",
    cover: U("photo-1537462715879-360eeb61a0ad", 1200),
    seoTitle: "Welder Duty Cycle Explained: How to Size a Welding Machine",
    seoDesc: "What duty cycle really means on a welder spec sheet, why ambient ratings differ, and how to size MIG and multiprocess machines for production and fab-shop workloads.",
    seoKeywords: "welder duty cycle explained, welding machine sizing, duty cycle 40% 200A, MIG welder duty cycle, choose welding machine amperage",
    views: 634,
    body: `
<p>Duty cycle is the most misread number on a welding spec sheet — and the most common reason a "200 amp" machine disappoints in a production setting. The definition is simple; the honesty of the workload estimate is what varies.</p>
<h2>The definition</h2>
<p><strong>Duty cycle is the percentage of a 10-minute window a machine can weld at a given output without overheating.</strong> "40% at 200 A" means four minutes of arc time at 200 A, then six minutes of cooling. Push past it and thermal protection shuts the arc off — mid-bead if necessary.</p>
<h2>The three traps</h2>
<h3>1. Ratings at different temperatures</h3>
<p>Reputable ratings follow standards at 40 °C ambient. Budget machines sometimes quote at 25 °C, which inflates the number roughly a class. Two "60% at 180 A" machines are not the same machine.</p>
<h3>2. Reading the maximum, not the working point</h3>
<p>The rating that matters is duty cycle at the amperage <em>you actually run</em>. A machine that does 30% at max output frequently does 100% at 140 A — perfect if 140 A is your day.</p>
<h3>3. Overestimating arc-on time</h3>
<p>Real fabrication rarely exceeds 30–50% arc-on time once fit-up, clamping, and repositioning are counted. Production cells with prepared parts run higher — that is when 60%+ ratings at working amperage stop being optional.</p>
<h2>A sizing rule that holds up</h2>
<ol>
<li>Find the amperage for your thickest routine joint (roughly 1 A per 0.001 in of steel for MIG).</li>
<li>Add 25% headroom.</li>
<li>Require a duty cycle at that amperage matching your honest arc-on estimate.</li>
</ol>
<p>Sized this way, a mid-range inverter covers most job-shop work comfortably — and the difference in price between adequate and oversized buys a lot of wire. Compare current machines and their rated working points in the <a href="/shop">equipment shop</a>.</p>
`,
  },
  {
    slug: "weld-inspection-101-ndt-methods",
    title: "Weld Inspection 101: Visual, PT, MT, UT — When Each NDT Method Pays",
    excerpt: "Most weld defects are caught by eye. For the rest, four NDT methods cover practically every industrial case — here is when each earns its cost.",
    category: "safety-compliance",
    date: "2026-08-14T08:00:00Z",
    cover: U("photo-1581092335397-9583eb92d232", 1200),
    seoTitle: "Weld Inspection & NDT Methods Guide: Visual, PT, MT, UT Compared",
    seoDesc: "A practical guide to weld inspection: what visual inspection catches, and when penetrant, magnetic particle, ultrasonic, and radiographic testing are worth specifying.",
    seoKeywords: "weld inspection methods, NDT welding, visual weld inspection, magnetic particle testing welds, ultrasonic weld testing, penetrant testing",
    views: 421,
    body: `
<p>Non-destructive testing has a reputation for being expensive, which leads buyers to either skip it entirely or specify everything. Both are wrong. Each method answers a specific question about a weld; matching the question to the method is what makes inspection an investment instead of overhead.</p>
<h2>Visual inspection: 80% of the value, always first</h2>
<p>A qualified visual inspection — proper lighting, gauges, access to both sides where possible — catches undercut, profile defects, surface porosity, craters, and misalignment. No other method should ever be specified before visual, because every other method assumes the weld already passed it.</p>
<h2>The four instrumented methods</h2>
<h3>Liquid penetrant (PT): surface cracks on anything</h3>
<p>Dye pulled into surface-breaking flaws by capillary action. Cheap, works on non-magnetic materials — stainless, aluminum — and needs minimal equipment. Finds only what reaches the surface.</p>
<h3>Magnetic particle (MT): surface and near-surface on steel</h3>
<p>Faster than PT on carbon steel and finds slightly subsurface indications. The workhorse for structural steel toes and repair verification. Magnetic materials only.</p>
<h3>Ultrasonic (UT): the interior, quantified</h3>
<p>Sound beams find lack of fusion, internal cracks, and slag with real depth information. Modern phased-array UT has taken most of the market that radiography used to hold — no radiation permits, immediate results, better on thick sections.</p>
<h3>Radiography (RT): the interior, pictured</h3>
<p>Still the reference for pipeline girth welds and some code work, and the record is a picture anyone can review. Slower, licensed, and increasingly the second choice where UT is accepted.</p>
<h2>Specifying without overspending</h2>
<ul>
<li>Static structural work: visual 100%, MT on a sampling of critical joints.</li>
<li>Cyclic or overhead-critical: add UT on tension splices.</li>
<li>Pressure boundary: whatever the code of record says — no negotiation.</li>
</ul>
<p>The inspection level belongs in the job scope, priced by bidders up front. Buyers on <a href="/jobs">HubWeld</a> who name the NDT requirement in the posting get bids that already include it — and welders with NDT-experienced portfolios are easy to find in the <a href="/directory">directory</a>.</p>
`,
  },
];

async function main() {
  // ── Products ──
  const suppliers = await prisma.user.findMany({ where: { role: "SUPPLIER" }, select: { id: true } });
  if (suppliers.length === 0) throw new Error("No suppliers found — run the base seed first.");
  const cats = await prisma.productCategory.findMany({ select: { id: true, slug: true } });
  const catBySlug = Object.fromEntries(cats.map((c) => [c.slug, c.id]));

  let pCreated = 0;
  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const exists = await prisma.product.findUnique({ where: { slug: p.slug } });
    if (exists) continue;
    const categoryId = catBySlug[p.category];
    if (!categoryId) { console.warn(`skip ${p.slug}: category ${p.category} missing`); continue; }
    await prisma.product.create({
      data: {
        slug: p.slug, name: p.name, brand: p.brand, sku: p.sku,
        description: p.description, priceCents: p.priceCents, stock: p.stock,
        imageUrl: p.imageUrl, status: "ACTIVE", featured: p.featured,
        categoryId, supplierId: suppliers[i % suppliers.length].id,
      },
    });
    pCreated++;
  }
  console.log(`products created: ${pCreated}`);

  // ── Articles ──
  const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  if (!admin) throw new Error("No admin user found — run the base seed first.");
  const postCats = await prisma.postCategory.findMany({ select: { id: true, slug: true } });
  const postCatBySlug = Object.fromEntries(postCats.map((c) => [c.slug, c.id]));

  let aCreated = 0;
  for (const a of articles) {
    const exists = await prisma.post.findUnique({ where: { slug: a.slug } });
    if (exists) continue;
    const categoryId = postCatBySlug[a.category] ?? postCats[0].id;
    const date = new Date(a.date);
    await prisma.post.create({
      data: {
        slug: a.slug, title: a.title, excerpt: a.excerpt, body: a.body.trim(),
        coverImage: a.cover, seoTitle: a.seoTitle, seoDesc: a.seoDesc,
        seoKeywords: a.seoKeywords, status: "PUBLISHED", views: a.views,
        authorId: admin.id, categoryId,
        publishedAt: date, createdAt: date, updatedAt: date,
      },
    });
    aCreated++;
  }
  console.log(`articles created: ${aCreated}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
