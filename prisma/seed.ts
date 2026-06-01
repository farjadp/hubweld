import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const pwd = await bcrypt.hash("password123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@hubweld.com" },
    update: {},
    create: { email: "admin@hubweld.com", name: "HubWeld Admin", passwordHash: pwd, role: "ADMIN" },
  });

  const customer = await prisma.user.upsert({
    where: { email: "customer@hubweld.com" },
    update: {},
    create: { email: "customer@hubweld.com", name: "Acme Manufacturing", passwordHash: pwd, role: "CUSTOMER", city: "Toronto" },
  });

  const welder = await prisma.user.upsert({
    where: { email: "welder@hubweld.com" },
    update: {},
    create: {
      email: "welder@hubweld.com",
      name: "Marco Rossi",
      passwordHash: pwd,
      role: "WELDER",
      city: "Toronto",
      welderProfile: {
        create: {
          bio: "12 years of certified TIG and stainless welding for food processing and fabrication shops.",
          skills: "TIG,MIG,Stainless,Aluminum",
          certifications: "CWB, AWS D1.1",
          serviceArea: "Toronto, GTA",
          hourlyRate: 85,
          yearsExp: 12,
          approved: true,
        },
      },
    },
  });

  await prisma.job.create({
    data: {
      customerId: customer.id,
      title: "Stainless steel guard rail repair",
      description: "Crack on stainless rail in food-grade area. Need certified TIG welder, weekend ok.",
      city: "Toronto",
      category: "repair",
      budget: 600,
    },
  });

  // ===== B2B Marketplace seed =====
  const categories = [
    { slug: "welding-machines", name: "Welding Machines", sort: 1, children: [
      { slug: "mig-welders", name: "MIG Welders" },
      { slug: "tig-welders", name: "TIG Welders" },
      { slug: "stick-welders", name: "Stick Welders" },
      { slug: "multi-process", name: "Multi-Process" },
      { slug: "plasma-cutters", name: "Plasma Cutters" },
      { slug: "engine-drives", name: "Engine-Driven Welders" },
    ]},
    { slug: "consumables", name: "Consumables", sort: 2, children: [
      { slug: "mig-wire", name: "MIG Wire" },
      { slug: "tig-rods", name: "TIG Rods" },
      { slug: "stick-electrodes", name: "Stick Electrodes" },
      { slug: "tungsten", name: "Tungsten Electrodes" },
    ]},
    { slug: "gas-regulators", name: "Gas & Regulators", sort: 3, children: [
      { slug: "regulators", name: "Regulators" },
      { slug: "flowmeters", name: "Flowmeters" },
      { slug: "hoses", name: "Hoses & Fittings" },
    ]},
    { slug: "safety", name: "Safety Gear", sort: 4, children: [
      { slug: "helmets", name: "Welding Helmets" },
      { slug: "gloves", name: "Gloves" },
      { slug: "jackets", name: "Jackets & Aprons" },
      { slug: "respirators", name: "Respirators" },
    ]},
    { slug: "tools-accessories", name: "Tools & Accessories", sort: 5, children: [
      { slug: "clamps", name: "Clamps & Magnets" },
      { slug: "torches", name: "Torches & Parts" },
      { slug: "tips-nozzles", name: "Tips & Nozzles" },
    ]},
    { slug: "abrasives", name: "Abrasives & Grinding", sort: 6, children: [
      { slug: "grinding-wheels", name: "Grinding Wheels" },
      { slug: "cutoff-wheels", name: "Cut-Off Wheels" },
      { slug: "flap-discs", name: "Flap Discs" },
    ]},
  ];

  const catIdBySlug: Record<string, string> = {};
  for (const top of categories) {
    const t = await prisma.productCategory.upsert({
      where: { slug: top.slug },
      update: { name: top.name, sortOrder: top.sort },
      create: { slug: top.slug, name: top.name, sortOrder: top.sort },
    });
    catIdBySlug[top.slug] = t.id;
    let i = 0;
    for (const child of top.children) {
      i++;
      const c = await prisma.productCategory.upsert({
        where: { slug: child.slug },
        update: { name: child.name, parentId: t.id, sortOrder: i },
        create: { slug: child.slug, name: child.name, parentId: t.id, sortOrder: i },
      });
      catIdBySlug[child.slug] = c.id;
    }
  }

  // Demo supplier
  const supplier = await prisma.user.upsert({
    where: { email: "supplier@hubweld.com" },
    update: {},
    create: {
      email: "supplier@hubweld.com",
      name: "NorthArc Supply Co.",
      passwordHash: pwd,
      role: "SUPPLIER",
      city: "Hamilton",
      supplierProfile: {
        create: {
          businessName: "NorthArc Supply Co.",
          description: "Industrial welding equipment and consumables distributor serving North America since 2008.",
          website: "https://example.com",
          approved: true,
        },
      },
    },
  });

  const supplier2 = await prisma.user.upsert({
    where: { email: "supplier2@hubweld.com" },
    update: {},
    create: {
      email: "supplier2@hubweld.com",
      name: "Forge & Flux Industrial",
      passwordHash: pwd,
      role: "SUPPLIER",
      city: "Buffalo",
      supplierProfile: {
        create: {
          businessName: "Forge & Flux Industrial",
          description: "Safety gear, abrasives, and shop supplies. Volume discounts on case orders.",
          approved: true,
        },
      },
    },
  });

  const products: Array<{
    slug: string; name: string; cat: string; brand: string; price: number;
    stock: number; img: string; desc: string; supplierId: string; featured?: boolean;
  }> = [
    { slug: "mig-250-inverter", name: "ArcStream 250 MIG Inverter Welder", cat: "mig-welders", brand: "ArcStream", price: 119900, stock: 14, img: "https://images.unsplash.com/photo-1581094288338-2314dddb7ece?w=800", desc: "208/240V industrial MIG inverter with synergic control, 30–250A output, suitable for shop and on-site fabrication.", supplierId: supplier.id, featured: true },
    { slug: "tig-200-ac-dc", name: "PrecisionArc 200 AC/DC TIG Welder", cat: "tig-welders", brand: "PrecisionArc", price: 159900, stock: 8, img: "https://images.unsplash.com/photo-1605557625149-1ad8b9a4cb40?w=800", desc: "Inverter AC/DC TIG with pulse and HF start, ideal for aluminum and stainless work.", supplierId: supplier.id, featured: true },
    { slug: "stick-180-portable", name: "ArcStream 180 Portable Stick Welder", cat: "stick-welders", brand: "ArcStream", price: 64900, stock: 22, img: "https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?w=800", desc: "Lightweight 180A stick welder with hot start and arc-force control.", supplierId: supplier.id },
    { slug: "multiprocess-220", name: "Multimaster 220 Multi-Process Welder", cat: "multi-process", brand: "Multimaster", price: 184900, stock: 6, img: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800", desc: "MIG/TIG/Stick in one unit. Dual voltage, synergic control, spool gun ready.", supplierId: supplier.id, featured: true },
    { slug: "plasma-45-cnc", name: "PlazCut 45 CNC-Ready Plasma Cutter", cat: "plasma-cutters", brand: "PlazCut", price: 139900, stock: 5, img: "https://images.unsplash.com/photo-1574610409580-58f1d8b78cdc?w=800", desc: "45A plasma cutter with CNC port, 5/8\" cutting capacity, drag-cut tip included.", supplierId: supplier.id },
    { slug: "mig-wire-er70s-6-33lb", name: 'ER70S-6 MIG Wire 0.035" — 33 lb Spool', cat: "mig-wire", brand: "WeldCore", price: 8900, stock: 80, img: "https://images.unsplash.com/photo-1581092335397-9583eb92d232?w=800", desc: "Premium copper-coated solid MIG wire for mild steel. 33 lb spool, 0.035\" (0.9 mm).", supplierId: supplier.id },
    { slug: "tig-rod-er308l-10lb", name: 'ER308L TIG Rod 3/32" — 10 lb Box', cat: "tig-rods", brand: "WeldCore", price: 7600, stock: 60, img: "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=800", desc: "Stainless TIG filler rod for 304/304L joints. 10 lb box, 36\" lengths.", supplierId: supplier.id },
    { slug: "stick-7018-50lb", name: "E7018 Stick Electrodes 1/8\" — 50 lb", cat: "stick-electrodes", brand: "WeldCore", price: 16800, stock: 35, img: "https://images.unsplash.com/photo-1517414204108-c9aa3a8eb1c5?w=800", desc: "Low-hydrogen 7018 electrodes, vac-pak sealed, for structural and pressure work.", supplierId: supplier.id },
    { slug: "tungsten-2-lanthanated", name: "2% Lanthanated Tungsten 3/32\" — 10 pk", cat: "tungsten", brand: "PrecisionArc", price: 4200, stock: 90, img: "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=800", desc: "Long-life lanthanated tungsten for AC and DC TIG, 10-pack.", supplierId: supplier.id },
    { slug: "argon-regulator-dual", name: "Dual-Stage Argon Regulator with Flowmeter", cat: "regulators", brand: "FlowMax", price: 11900, stock: 25, img: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800", desc: "Heavy-duty dual-stage regulator with 0–60 CFH flow gauge, CGA-580 inlet.", supplierId: supplier.id },
    { slug: "auto-helmet-pro", name: "ShadeShift Pro Auto-Darkening Welding Helmet", cat: "helmets", brand: "ShadeShift", price: 24900, stock: 40, img: "https://images.unsplash.com/photo-1581094271901-8022df4466f9?w=800", desc: "Variable shade 5–13, true color, 4-sensor solar/battery, grind mode.", supplierId: supplier2.id, featured: true },
    { slug: "tig-gloves-goatskin", name: "Goatskin TIG Welding Gloves — Pair", cat: "gloves", brand: "ForgeGrip", price: 2900, stock: 120, img: "https://images.unsplash.com/photo-1604335399105-a0c585fd81a1?w=800", desc: "Soft goatskin TIG gloves with Kevlar stitching, sizes M–XXL.", supplierId: supplier2.id },
    { slug: "mig-stick-jacket", name: "FR Cotton Welding Jacket — 30\"", cat: "jackets", brand: "ForgeGrip", price: 6900, stock: 50, img: "https://images.unsplash.com/photo-1604335398980-ededcadcc35a?w=800", desc: "Flame-resistant cotton jacket, snap front, multiple pockets.", supplierId: supplier2.id },
    { slug: "half-mask-respirator", name: "Half-Mask Welding Respirator with P100 Cartridges", cat: "respirators", brand: "AirGuard", price: 8900, stock: 60, img: "https://images.unsplash.com/photo-1583912267550-d44c9b5b1e6f?w=800", desc: "NIOSH-approved half-mask with P100 filters for welding fume.", supplierId: supplier2.id },
    { slug: "ground-clamp-500a", name: "500A Heavy-Duty Ground Clamp", cat: "clamps", brand: "Multimaster", price: 3400, stock: 75, img: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800", desc: "Copper-plated ground clamp rated 500A for stick and MIG welders.", supplierId: supplier.id },
    { slug: "tig-torch-wp17-25ft", name: 'WP-17 Air-Cooled TIG Torch — 25 ft', cat: "torches", brand: "PrecisionArc", price: 12900, stock: 18, img: "https://images.unsplash.com/photo-1605557625149-1ad8b9a4cb40?w=800", desc: "WP-17 style TIG torch with 25 ft cable and accessory kit.", supplierId: supplier.id },
    { slug: "mig-tips-035-25pk", name: 'MIG Contact Tips 0.035" — 25 pk', cat: "tips-nozzles", brand: "WeldCore", price: 1800, stock: 200, img: "https://images.unsplash.com/photo-1581092335397-9583eb92d232?w=800", desc: 'Standard M6 MIG contact tips for 0.035" wire. Tweco-style.', supplierId: supplier.id },
    { slug: "grinding-wheel-45-25pk", name: '4-1/2" Grinding Wheel 1/4" — 25 pk', cat: "grinding-wheels", brand: "ForgeGrip", price: 4900, stock: 80, img: "https://images.unsplash.com/photo-1605557625149-1ad8b9a4cb40?w=800", desc: 'Type 27 metal grinding wheels, 4-1/2" x 1/4" x 7/8", case of 25.', supplierId: supplier2.id },
    { slug: "cutoff-wheel-45-50pk", name: '4-1/2" Cut-Off Wheel 0.045" — 50 pk', cat: "cutoff-wheels", brand: "ForgeGrip", price: 5900, stock: 90, img: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800", desc: 'Thin cut-off wheels for steel and stainless, 50-pack value bulk.', supplierId: supplier2.id },
    { slug: "flap-disc-40g-10pk", name: '4-1/2" Flap Disc 40-Grit — 10 pk', cat: "flap-discs", brand: "ForgeGrip", price: 3200, stock: 110, img: "https://images.unsplash.com/photo-1517414204108-c9aa3a8eb1c5?w=800", desc: "Zirconia flap discs for aggressive metal removal, 10-pack.", supplierId: supplier2.id },
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: { priceCents: p.price, stock: p.stock, imageUrl: p.img },
      create: {
        slug: p.slug, name: p.name, brand: p.brand, priceCents: p.price, stock: p.stock,
        imageUrl: p.img, description: p.desc, categoryId: catIdBySlug[p.cat],
        supplierId: p.supplierId, featured: p.featured ?? false,
        sku: p.slug.toUpperCase(),
      },
    });
  }

  console.log("Seeded:", {
    admin: admin.email, customer: customer.email, welder: welder.email,
    suppliers: [supplier.email, supplier2.email],
    products: products.length,
  });
}

main().finally(() => prisma.$disconnect());
