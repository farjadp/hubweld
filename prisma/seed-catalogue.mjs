/**
 * Seed — 200-product welding catalogue
 *
 * Source of the product FACTS (brand, model, SKU, category, price, variant
 * sizes): the public Shopify catalogue of canadaweldingsupply.ca, taken in
 * best-selling order. Facts about a product are not copyrightable, and the
 * endpoint used is permitted by that site's robots.txt.
 *
 * Deliberately NOT copied: their written marketing descriptions and their
 * product photography. Every description below is generated from the spec
 * facts, and images are generic category photographs.
 *
 * Prices are the source figures in Canadian dollars. See the note in
 * src/lib/money.ts about the store's display currency.
 *
 * Plain ESM so it runs with bare `node` in the production image.
 * Idempotent: skips any slug that already exists.
 *
 * Run: node prisma/seed-catalogue.mjs
 */
import pkg from "@prisma/client";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const { PrismaClient } = pkg;
const prisma = new PrismaClient();
const HERE = dirname(fileURLToPath(import.meta.url));

const U = (id) => `https://images.unsplash.com/${id}?w=800&q=80`;

// ── Categories: existing slugs plus a few this catalogue needs ───────────
const NEW_CATEGORIES = [
  { slug: "helmet-parts", name: "Helmet Parts & Lenses", parent: "safety", sortOrder: 5 },
  { slug: "workwear", name: "Workwear & Protection", parent: "safety", sortOrder: 6 },
  { slug: "tig-torch-parts", name: "TIG Torch Parts", parent: "tools-accessories", sortOrder: 4 },
  { slug: "cables-connectors", name: "Cables & Connectors", parent: "tools-accessories", sortOrder: 5 },
];

const TYPE_TO_CATEGORY = {
  "TIG Accessory": "tig-torch-parts", "TIG Torch": "tig-torch-parts",
  "TIG Torch Alumina Cup": "tig-torch-parts", "TIG Torch Collet": "tig-torch-parts",
  "TIG Torch Collet Body": "tig-torch-parts", "TIG Torch Parts": "tig-torch-parts",
  "TIG Torch Back Cap": "tig-torch-parts", "TIG Torch Cable": "tig-torch-parts",
  "Gas Lens Collet Body": "tig-torch-parts", "TIG Power Adapter": "tig-torch-parts",
  "TIG Foot Control": "tig-torch-parts",
  "Welding Helmet Parts": "helmet-parts", "Welding Helmet Lenses": "helmet-parts",
  "ADF Filter": "helmet-parts", "Welding Filter Plate": "helmet-parts",
  "3M Speedglas Consumables": "helmet-parts", "3M Adflo Consumables": "helmet-parts",
  "Face Shield Window": "helmet-parts",
  "Optrel PAPR Accessories and Consumables": "helmet-parts",
  "3M PAPR Accessories and Consumables": "helmet-parts",
  "Welding Helmets": "helmets",
  "Tungsten Electrodes": "tungsten", "Tungsten Grinder": "tungsten",
  "Carbon Steel SMAW": "stick-electrodes", "Stainless Steel SMAW": "stick-electrodes",
  "Specialty SMAW": "stick-electrodes",
  "TIG Gloves": "gloves", "Welding Gloves": "gloves", "MIG/Stick Gloves": "gloves", "Gloves": "gloves",
  "Cutting Discs": "cutoff-wheels", "Flap Discs": "flap-discs",
  "Abrasives": "abrasives", "Wire Brush": "abrasives",
  "Welding Jacket": "jackets", "Welding Caps": "workwear", "Welding Sleeves": "workwear",
  "Hard Hat": "workwear", "Eye and Face Protection": "workwear", "Face Shield": "workwear",
  "PPE": "workwear", "Curtain/Screen/Blanket": "workwear",
  "Respirators": "respirators", "3M Respirator Filters": "respirators",
  "PAPR Respirator Systems": "respirators",
  "Flux Core Wire": "mig-wire", "MIG Wire": "mig-wire",
  "Aluminum MIG Wire": "mig-wire", "Stainless Steel MIG Wire": "mig-wire",
  "MIG Consumables": "tips-nozzles", "MIG Contact Tips": "tips-nozzles",
  "Cutting Tips": "tips-nozzles", "Plasma Consumable": "tips-nozzles",
  "Stainless Steel TIG Rod": "tig-rods", "Carbon Steel TIG Rod": "tig-rods",
  "Aluminum TIG Rod": "tig-rods", "Specialty TIG Rod": "tig-rods",
  "Brazing Alloy": "tig-rods", "Gas Welding Rod": "tig-rods",
  "Cable Connector": "cables-connectors", "Welding Cable": "cables-connectors",
  "Cable Lead Reel": "cables-connectors", "Electrode Holder": "cables-connectors",
  "Ground Clamp": "cables-connectors", "Extension Cord": "cables-connectors",
  "Adapter": "cables-connectors",
  "Regulators": "regulators",
  "Argon Hose": "hoses", "Oxy - Fuel Hose": "hoses", "Welding Gas": "hoses",
  "Oxy - Acetylene": "hoses",
  "Magnetic Fixture Tool": "clamps",
};
const FALLBACK_CATEGORY = "tools-accessories";

const CATEGORY_IMAGE = {
  helmets: "photo-1504328345606-18bbc8c9d7d1",
  "helmet-parts": "photo-1504328345606-18bbc8c9d7d1",
  jackets: "photo-1516216628859-9bccecab13ca",
  workwear: "photo-1516216628859-9bccecab13ca",
  gloves: "photo-1516216628859-9bccecab13ca",
  respirators: "photo-1516216628859-9bccecab13ca",
  "mig-wire": "photo-1587293852726-70cdb56c2866",
  "tig-rods": "photo-1587293852726-70cdb56c2866",
  "stick-electrodes": "photo-1587293852726-70cdb56c2866",
  tungsten: "photo-1530124566582-a618bc2615dc",
  "tig-torch-parts": "photo-1530124566582-a618bc2615dc",
  "tips-nozzles": "photo-1530124566582-a618bc2615dc",
  "tools-accessories": "photo-1560574188-6a6774965120",
  clamps: "photo-1560574188-6a6774965120",
  "cables-connectors": "photo-1504307651254-35680f356dfd",
  regulators: "photo-1615906655593-ad0386982a0f",
  hoses: "photo-1615906655593-ad0386982a0f",
  abrasives: "photo-1469289759076-d1484757abc3",
  "cutoff-wheels": "photo-1504917595217-d4dc5ebe6122",
  "flap-discs": "photo-1504917595217-d4dc5ebe6122",
};
const DEFAULT_IMAGE = "photo-1537462715879-360eeb61a0ad";

// ── Original descriptions, written from the spec facts ───────────────────
const LEAD = {
  "mig-wire": (b) => `Solid MIG wire from ${b}, wound for consistent feeding through long liners.`,
  "tig-rods": (b) => `${b} TIG filler rod, ground and cleaned for clean arc starts.`,
  "stick-electrodes": (b) => `${b} covered electrode for shielded metal arc welding.`,
  tungsten: (b) => `${b} tungsten electrode, ground finish, for AC and DC TIG.`,
  helmets: (b) => `Auto-darkening welding helmet from ${b}.`,
  "helmet-parts": (b) => `Genuine ${b} replacement part — the consumable side of helmet ownership.`,
  gloves: (b) => `${b} welding glove, cut and stitched for arc work.`,
  jackets: (b) => `${b} flame-resistant welding jacket for shop and field use.`,
  workwear: (b) => `${b} protective workwear for the welding environment.`,
  respirators: (b) => `${b} respiratory protection for welding fume and particulate.`,
  "tig-torch-parts": (b) => `${b} TIG torch component — the wear parts that decide arc quality.`,
  "tips-nozzles": (b) => `${b} front-end consumable for consistent current transfer and gas coverage.`,
  "cables-connectors": (b) => `${b} welding power delivery component, rated for full-current transfer.`,
  regulators: (b) => `${b} gas regulator for accurate, repeatable shielding flow.`,
  hoses: (b) => `${b} gas delivery line for welding and cutting.`,
  abrasives: (b) => `${b} abrasive for weld preparation and cleanup.`,
  "cutoff-wheels": (b) => `${b} cut-off wheel for fast, cool cuts with minimal burring.`,
  "flap-discs": (b) => `${b} flap disc for blending and finishing in one step.`,
  clamps: (b) => `${b} fixturing tool for holding work square through the tack.`,
  "tools-accessories": (b) => `${b} shop accessory for welding and fabrication work.`,
};

function buildDescription(p, categorySlug, variants) {
  const brand = p.vendor || "HubWeld";
  const lead = (LEAD[categorySlug] || LEAD["tools-accessories"])(brand);
  const parts = [lead];

  const GENERIC = new Set(["title", "option", "options", "variant"]);
  const optionNames = (p.options || [])
    .map((o) => o.name)
    .filter((n) => n && !GENERIC.has(n.trim().toLowerCase()));
  const sizes = [...new Set(variants.map((v) => v.title).filter((t) => t && t !== "Default Title"))];

  if (sizes.length > 1) {
    const shown = sizes.slice(0, 6).join(", ");
    parts.push(
      `Available in ${sizes.length} configurations${optionNames.length ? ` by ${optionNames.join(" and ").toLowerCase()}` : ""}: ${shown}${sizes.length > 6 ? ", and more" : ""}.`
    );
  } else if (sizes.length === 1) {
    parts.push(`Supplied as ${sizes[0]}.`);
  }

  const prices = variants.map((v) => Number(v.price)).filter((n) => Number.isFinite(n) && n > 0);
  if (prices.length > 1) {
    const lo = Math.min(...prices), hi = Math.max(...prices);
    if (hi > lo) parts.push(`Pricing runs from $${lo.toFixed(2)} to $${hi.toFixed(2)} depending on configuration.`);
  }
  if (p.product_type) parts.push(`Listed under ${p.product_type}.`);

  return parts.join(" ");
}

function buildSpecs(p, variants) {
  const sizes = [...new Set(variants.map((v) => v.title).filter((t) => t && t !== "Default Title"))];
  return JSON.stringify({
    brand: p.vendor || "",
    type: p.product_type || "",
    configurations: sizes.length || 1,
    ...(sizes.length ? { options: sizes.slice(0, 12) } : {}),
    ...(p.options || []).reduce((acc, o) => {
      if (o.name && o.name !== "Title") acc[o.name.toLowerCase()] = (o.values || []).slice(0, 10).join(", ");
      return acc;
    }, {}),
  });
}

// Deterministic pseudo-stock so re-runs and environments agree.
function stockFor(id, available) {
  if (!available) return 0;
  const h = String(id).split("").reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
  return 8 + (h % 132);
}

async function main() {
  const raw = JSON.parse(readFileSync(join(HERE, "catalogue-source.json"), "utf8"));

  const suppliers = await prisma.user.findMany({ where: { role: "SUPPLIER" }, select: { id: true } });
  if (suppliers.length === 0) throw new Error("No suppliers found — run the base seed first.");

  // Ensure the new subcategories exist.
  for (const c of NEW_CATEGORIES) {
    const exists = await prisma.productCategory.findUnique({ where: { slug: c.slug } });
    if (exists) continue;
    const parent = await prisma.productCategory.findUnique({ where: { slug: c.parent } });
    await prisma.productCategory.create({
      data: { slug: c.slug, name: c.name, sortOrder: c.sortOrder, parentId: parent?.id ?? null },
    });
    console.log(`category created: ${c.slug}`);
  }

  const cats = await prisma.productCategory.findMany({ select: { id: true, slug: true } });
  const catId = Object.fromEntries(cats.map((c) => [c.slug, c.id]));

  let created = 0, skipped = 0, i = 0;
  for (const p of raw) {
    const slug = p.handle;
    if (!slug) { skipped++; continue; }
    if (await prisma.product.findUnique({ where: { slug } })) { skipped++; continue; }

    const categorySlug = TYPE_TO_CATEGORY[p.product_type] || FALLBACK_CATEGORY;
    const categoryId = catId[categorySlug] || catId[FALLBACK_CATEGORY];
    if (!categoryId) { skipped++; continue; }

    const variants = p.variants || [];
    const v0 = variants[0] || {};
    const priceCents = Math.round(Number(v0.price || 0) * 100);
    if (!priceCents) { skipped++; continue; }

    await prisma.product.create({
      data: {
        slug,
        name: p.title.slice(0, 200),
        brand: p.vendor || "",
        sku: v0.sku || "",
        description: buildDescription(p, categorySlug, variants),
        specsJson: buildSpecs(p, variants),
        priceCents,
        stock: stockFor(p.id, variants.some((v) => v.available)),
        imageUrl: U(CATEGORY_IMAGE[categorySlug] || DEFAULT_IMAGE),
        status: "ACTIVE",
        featured: i < 8,
        categoryId,
        supplierId: suppliers[i % suppliers.length].id,
      },
    });
    created++; i++;
  }
  console.log(`catalogue products created: ${created} (skipped ${skipped})`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
