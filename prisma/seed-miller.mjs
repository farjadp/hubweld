/**
 * Seed — Miller Electric range
 *
 * Source: the public Shopify catalogue of weld-ready.ca's Miller Electric
 * collection, read through an endpoint their robots.txt explicitly allows.
 * (That file forbids automated *checkout*, which this does not do.)
 *
 * Unlike the first catalogue import, the descriptions here are Miller's own
 * manufacturer spec copy — the syndicated feature-and-spec text dealers
 * republish — rather than a retailer's original marketing prose, so it is
 * carried across. It is stripped to plain text: the reseller's embedded
 * images, their store links, and any of their own storefront lines are
 * removed.
 *
 * Photography is self-hosted under public/images/products/<handle>.webp, not
 * hot-linked, so the store never depends on someone else's bandwidth.
 *
 * Prices are the source figures in Canadian dollars.
 *
 * DE-DUPLICATION — the point of this import. A product is skipped when it
 * matches anything already in the store, or an earlier row in this batch, on:
 *   1. slug
 *   2. manufacturer part number, with the reseller prefix stripped, so
 *      ITW-T-M023 and MIL-T-M023 are recognised as the same Miller part
 *   3. normalised product name
 *
 * Plain ESM so it runs with bare `node` in the production image.
 * Idempotent: safe to run on every boot.
 *
 * Run: node prisma/seed-miller.mjs
 */
import pkg from "@prisma/client";
import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const { PrismaClient } = pkg;
const prisma = new PrismaClient();
const HERE = dirname(fileURLToPath(import.meta.url));
const PHOTO_DIR = join(HERE, "..", "public", "images", "products");

const U = (id) => `https://images.unsplash.com/${id}?w=800&q=80`;
const hasPhoto = (slug) => existsSync(join(PHOTO_DIR, `${slug}.webp`));

// ── Categories this range needs on top of the existing tree ──────────────
const NEW_CATEGORIES = [
  { slug: "mig-guns", name: "MIG Guns & Torches", parent: "tools-accessories", sortOrder: 6 },
  { slug: "wire-feeders", name: "Wire Feeders", parent: "welding-machines", sortOrder: 7 },
  { slug: "drive-rolls", name: "Drive Rolls & Liners", parent: "tools-accessories", sortOrder: 7 },
  { slug: "plasma-consumables", name: "Plasma Consumables", parent: "consumables", sortOrder: 5 },
  { slug: "coolers-carts", name: "Coolers & Carts", parent: "tools-accessories", sortOrder: 8 },
  { slug: "remote-controls", name: "Remote & Foot Controls", parent: "tools-accessories", sortOrder: 9 },
];

const TYPE_TO_CATEGORY = {
  // machines
  "MIG Welder": "mig-welders", "MIG Welding Machine": "mig-welders",
  "TIG Welder": "tig-welders",
  "Multi Process Welder": "multi-process", "Multiprocess Welding Machine": "multi-process",
  "Plasma Cutting Machine": "plasma-cutters", "Plasma Cutter": "plasma-cutters",
  "Engine Driven Welder Generators": "engine-drives", "Welder / Generator": "engine-drives",
  "Training Equipment": "welding-machines",
  // guns, torches, feeders
  "MIG Gun": "mig-guns", "MIG Guns": "mig-guns", "MIG Torch": "mig-guns",
  "Push-Pull Gun": "mig-guns", "Push Pull Gun": "mig-guns", "Spool Gun": "mig-guns",
  "Plasma Cutting Torch": "mig-guns",
  "MIG Wire Feeder": "wire-feeders", "MIG Wire Feeder Parts": "wire-feeders",
  "Drive Roll Kits": "drive-rolls", "MIG Liner": "drive-rolls",
  // consumables
  "MIG Consumables": "tips-nozzles", "MIG Contact Tips": "tips-nozzles",
  "MIG Nozzle": "tips-nozzles", "Diffuser": "tips-nozzles",
  "Plasma Consumables": "plasma-consumables", "Plasma Consumable": "plasma-consumables",
  "Plasma Shield": "plasma-consumables",
  // TIG
  "TIG Accessory": "tig-torch-parts", "TIG Torch Accessory": "tig-torch-parts",
  // safety
  "Welding Helmet": "helmets", "Welding Helmets": "helmets",
  "Welding Helmet Accessories": "helmet-parts",
  "Welding Helmet Replacement Components": "helmet-parts",
  "Outside Lens": "helmet-parts", "Inside Lens": "helmet-parts",
  "Inside Cover Lense": "helmet-parts", "Grinding Shields": "helmet-parts",
  "Hard Hat Adapter": "helmet-parts",
  "Respirator": "respirators", "PAPR Filter": "respirators",
  "PAPR Respirator Systems": "respirators", "Filter": "respirators",
  "Welding Jacket": "jackets", "Welding Gloves": "gloves",
  "Welding Cap": "workwear", "Sleeves": "workwear",
  // power & controls
  "Control Plug": "cables-connectors", "Amperage Control": "remote-controls",
  "Foot Pedal": "remote-controls", "Battery": "cables-connectors",
  // ancillaries
  "Coolant System": "coolers-carts", "Cooling System": "coolers-carts",
  "Water Cooler": "coolers-carts", "Cart": "coolers-carts",
  "Welding Cart": "coolers-carts", "Machine Cart": "coolers-carts",
  Regulators: "regulators", "Regulator Parts": "regulators",
  "Replacement Parts": "tools-accessories", "Repair Kit": "tools-accessories",
};
const FALLBACK_CATEGORY = "tools-accessories";

const CATEGORY_IMAGE = {
  "mig-welders": "photo-1537462715879-360eeb61a0ad",
  "tig-welders": "photo-1537462715879-360eeb61a0ad",
  "multi-process": "photo-1537462715879-360eeb61a0ad",
  "plasma-cutters": "photo-1504917595217-d4dc5ebe6122",
  "engine-drives": "photo-1504307651254-35680f356dfd",
  "welding-machines": "photo-1537462715879-360eeb61a0ad",
  "mig-guns": "photo-1530124566582-a618bc2615dc",
  "wire-feeders": "photo-1530124566582-a618bc2615dc",
  "drive-rolls": "photo-1560574188-6a6774965120",
  "tips-nozzles": "photo-1530124566582-a618bc2615dc",
  "plasma-consumables": "photo-1504917595217-d4dc5ebe6122",
  "tig-torch-parts": "photo-1530124566582-a618bc2615dc",
  helmets: "photo-1504328345606-18bbc8c9d7d1",
  "helmet-parts": "photo-1504328345606-18bbc8c9d7d1",
  respirators: "photo-1516216628859-9bccecab13ca",
  jackets: "photo-1516216628859-9bccecab13ca",
  gloves: "photo-1516216628859-9bccecab13ca",
  workwear: "photo-1516216628859-9bccecab13ca",
  "cables-connectors": "photo-1504307651254-35680f356dfd",
  "remote-controls": "photo-1560574188-6a6774965120",
  "coolers-carts": "photo-1469289759076-d1484757abc3",
  regulators: "photo-1615906655593-ad0386982a0f",
  "tools-accessories": "photo-1560574188-6a6774965120",
};
const DEFAULT_IMAGE = "photo-1537462715879-360eeb61a0ad";

// ── De-duplication keys ──────────────────────────────────────────────────
const VENDOR_PREFIX = /^(ITW|MIL|MILLER|CKW|BLU|ESA|GUL|PW|WM|LIN|3M)[-_ ]/i;

function partNumber(sku) {
  if (!sku) return null;
  let s = String(sku).trim();
  s = s.replace(/\s*\(.*?\)\s*$/, "");   // trailing "(10/Pack)"
  s = s.replace(VENDOR_PREFIX, "");      // reseller's own prefix
  s = s.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  return s || null;
}

function normalizeName(s) {
  return (s || "")
    .toLowerCase()
    .replace(/[®™©]/g, "")
    .replace(/\b(style|genuine|oem|pack)\b/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function stockFor(id, available) {
  if (!available) return 0;
  const h = String(id).split("").reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 11);
  return 3 + (h % 40);
}

function buildSpecs(p) {
  const sizes = [...new Set(p.variants.map((v) => v.title).filter((t) => t && t !== "Default Title"))];
  return JSON.stringify({
    brand: p.vendor,
    type: p.product_type || "",
    configurations: sizes.length || 1,
    ...(sizes.length ? { options: sizes.slice(0, 12) } : {}),
  });
}

async function main() {
  const raw = JSON.parse(readFileSync(join(HERE, "catalogue-miller.json"), "utf8"));

  const suppliers = await prisma.user.findMany({ where: { role: "SUPPLIER" }, select: { id: true } });
  if (suppliers.length === 0) throw new Error("No suppliers found — run the base seed first.");

  for (const c of NEW_CATEGORIES) {
    if (await prisma.productCategory.findUnique({ where: { slug: c.slug } })) continue;
    const parent = await prisma.productCategory.findUnique({ where: { slug: c.parent } });
    await prisma.productCategory.create({
      data: { slug: c.slug, name: c.name, sortOrder: c.sortOrder, parentId: parent?.id ?? null },
    });
    console.log(`category created: ${c.slug}`);
  }

  const cats = await prisma.productCategory.findMany({ select: { id: true, slug: true } });
  const catId = Object.fromEntries(cats.map((c) => [c.slug, c.id]));

  // Everything already in the store, keyed three ways.
  const existing = await prisma.product.findMany({ select: { slug: true, name: true, sku: true } });
  const seenSlug = new Set(existing.map((p) => p.slug));
  const seenPart = new Set(existing.map((p) => partNumber(p.sku)).filter(Boolean));
  const seenName = new Set(existing.map((p) => normalizeName(p.name)));

  let created = 0;
  const skipped = [];

  for (let i = 0; i < raw.length; i++) {
    const p = raw[i];
    const v0 = p.variants[0];
    const part = partNumber(v0.sku);
    const name = normalizeName(p.title);

    if (seenSlug.has(p.handle)) { skipped.push([p.title, "slug already present"]); continue; }
    if (part && seenPart.has(part)) { skipped.push([p.title, `part ${part} already present`]); continue; }
    if (seenName.has(name)) { skipped.push([p.title, "same product name already present"]); continue; }

    const categorySlug = TYPE_TO_CATEGORY[p.product_type] || FALLBACK_CATEGORY;
    const categoryId = catId[categorySlug] || catId[FALLBACK_CATEGORY];
    if (!categoryId) { skipped.push([p.title, "no category"]); continue; }

    const priceCents = Math.round(Number(v0.price) * 100);
    if (!priceCents) { skipped.push([p.title, "no price"]); continue; }

    await prisma.product.create({
      data: {
        slug: p.handle,
        name: p.title.slice(0, 200),
        brand: p.vendor,
        sku: v0.sku || "",
        description: p.description || `${p.vendor} ${p.product_type || "product"}.`,
        specsJson: buildSpecs(p),
        priceCents,
        stock: stockFor(p.handle, p.variants.some((v) => v.available)),
        imageUrl: hasPhoto(p.handle)
          ? `/images/products/${p.handle}.webp`
          : U(CATEGORY_IMAGE[categorySlug] || DEFAULT_IMAGE),
        status: "ACTIVE",
        featured: false,
        categoryId,
        supplierId: suppliers[i % suppliers.length].id,
      },
    });

    // Guard the rest of this batch against its own duplicates too.
    seenSlug.add(p.handle);
    seenName.add(name);
    if (part) seenPart.add(part);
    created++;
  }

  console.log(`Miller products created: ${created}, skipped as duplicates: ${skipped.length}`);
  for (const [t, why] of skipped.slice(0, 15)) console.log(`  skip: ${t.slice(0, 60)} — ${why}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
