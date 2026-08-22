import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  if (!admin) throw new Error("No ADMIN user found.");

  const p = prisma as any;
  const categories = await p.postCategory.findMany();
  
  const getCat = (slug: string) => categories.find((c: any) => c.slug === slug)?.id;

  async function createPost(data: any) {
    const existing = await p.post.findUnique({ where: { slug: data.slug } });
    if (existing) { console.log(`  ⟳  skip: ${data.slug}`); return; }

    const tags = await p.postTag.findMany({ where: { slug: { in: data.tagSlugs } } });
    await p.post.create({
      data: {
        slug: data.slug, title: data.title, excerpt: data.excerpt,
        body: data.body, coverImage: data.coverImage,
        categoryId: data.categoryId, authorId: admin!.id,
        status: "PUBLISHED", publishedAt: new Date(),
        seoTitle: data.seoTitle, seoDesc: data.seoDesc, seoKeywords: data.seoKeywords,
        tags: { create: tags.map((t: any) => ({ tagId: t.id })) },
      },
    });
    console.log(`  ✓  created: ${data.slug}`);
  }

  const newPosts = [
    {
      slug: "top-5-safety-essentials-2024",
      title: "Top 5 Safety Essentials Every Welder Needs in 2024",
      excerpt: "Safety gear is constantly evolving. Here are the top 5 essential pieces of protective equipment that every modern welder should have in their kit.",
      coverImage: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=1200",
      categoryId: getCat("safety-compliance"),
      tagSlugs: ["welding-safety"],
      seoTitle: "Top Welding Safety Gear 2024 | HubWeld",
      seoDesc: "Discover the top 5 essential pieces of safety gear every welder needs to stay protected on the job in 2024.",
      seoKeywords: "welding safety, PPE, welding helmet, respirator, welding gloves",
      body: "<h2>Safety First</h2><p>Welding comes with inherent risks, but modern PPE has made it safer than ever. In 2024, the focus is on combining maximum protection with comfort. Essential gear includes auto-darkening helmets with true-color technology, PAPR (Powered Air Purifying Respirator) systems to protect against fumes, high-dexterity flame-resistant gloves, FR cotton or leather jackets, and steel-toe boots with metatarsal guards.</p>"
    },
    {
      slug: "sourcing-vintage-welder-parts",
      title: "How to Source Hard-to-Find Replacement Parts for Vintage Welders",
      excerpt: "Keeping that reliable vintage Miller or Lincoln machine running can be tough when OEM parts are discontinued. Here's how to track down what you need.",
      coverImage: "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=1200",
      categoryId: getCat("parts-sourcing"),
      tagSlugs: ["parts-sourcing"],
      seoTitle: "Source Vintage Welder Parts | HubWeld",
      seoDesc: "Guide on how to find replacement parts and components for vintage and discontinued welding machines.",
      seoKeywords: "vintage welder parts, discontinued welding parts, Miller parts, Lincoln parts",
      body: "<h2>Keeping the Classics Alive</h2><p>Many fabricators swear by their older transformer-based welding machines. When parts fail, finding replacements requires knowing where to look. Strategies include checking surplus industrial equipment marketplaces, joining specialized online forums, contacting dedicated refurbishers, and sometimes even cross-referencing components like contactors and rectifiers to find modern equivalents that fit.</p>"
    },
    {
      slug: "ar-vr-welding-training",
      title: "The Future of Welding: AR and VR Training Systems",
      excerpt: "Augmented and Virtual Reality are transforming how the next generation of welders learn their trade, reducing material costs and accelerating skill acquisition.",
      coverImage: "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=1200",
      categoryId: getCat("industry-news"),
      tagSlugs: ["automation"],
      seoTitle: "AR and VR Welding Training Systems | HubWeld",
      seoDesc: "How augmented reality and virtual reality are revolutionizing welding education and training.",
      seoKeywords: "AR welding, VR welding training, virtual reality welding, welding education",
      body: "<h2>Virtual Sparks</h2><p>Training a welder traditionally requires significant investment in metal, gas, and wire. AR and VR systems allow students to practice muscle memory, torch angle, and travel speed in a simulated environment. These systems provide instant feedback on performance metrics, allowing trainees to correct mistakes before they even strike a real arc. It's a game-changer for trade schools and large manufacturers.</p>"
    },
    {
      slug: "mastering-the-pipe-weld",
      title: "Mastering the Pipe Weld: A Step-by-Step Guide for Beginners",
      excerpt: "Pipe welding is considered one of the most challenging skills in the trade. This guide breaks down the 6G position and root pass techniques.",
      coverImage: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200",
      categoryId: getCat("welding-techniques"),
      tagSlugs: ["stick-welding", "tig-welding"],
      seoTitle: "Mastering Pipe Welding: Beginner's Guide | HubWeld",
      seoDesc: "Step-by-step guide to mastering pipe welding, focusing on joint prep, root passes, and the challenging 6G position.",
      seoKeywords: "pipe welding, 6G position, root pass, TIG pipe welding, stick pipe welding",
      body: "<h2>The Pinnacle of Welding Skill</h2><p>Pipe welding requires passing strict x-ray inspections. Success starts with perfect joint preparation: a consistent bevel, land, and root gap. The root pass, often done with TIG or a 6010 stick electrode, must penetrate fully without excessive reinforcement inside the pipe. The key is reading the keyhole and maintaining a consistent travel speed, especially as you transition around the bottom of the pipe in the 5G or 6G position.</p>"
    },
    {
      slug: "strategies-mobile-welding-business",
      title: "5 Strategies to Grow Your Mobile Welding Business",
      excerpt: "Running a mobile welding rig is a lucrative but competitive business. Learn how to attract better clients and secure recurring contracts.",
      coverImage: "https://images.unsplash.com/photo-1553413077-190dd305871c?w=1200",
      categoryId: getCat("business-distribution"),
      tagSlugs: ["distribution"],
      seoTitle: "Grow Your Mobile Welding Business | HubWeld",
      seoDesc: "Five proven strategies to expand your mobile welding business, attract higher-paying clients, and secure recurring maintenance contracts.",
      seoKeywords: "mobile welding business, welding contractor, grow welding business, welding marketing",
      body: "<h2>Taking Your Skills on the Road</h2><p>To succeed as a mobile welder, you need more than just a good truck and a multi-process machine. You need business strategy. 1. Niche down (e.g., focus on heavy equipment repair or sanitary stainless). 2. Build relationships with property management and construction firms for recurring maintenance. 3. Ensure your Google Business profile is optimized for local search. 4. Invest in proper insurance and certifications to bid on commercial jobs. 5. Leverage platforms like HubWeld to connect with local customers looking for immediate repairs.</p>"
    },
    {
      slug: "guide-to-tungsten-selection",
      title: "A Guide to Selecting the Right Tungsten for TIG Welding",
      excerpt: "Pure, thoriated, lanthanated, or ceriated? Choosing the correct tungsten electrode is crucial for arc stability and weld quality in TIG welding.",
      coverImage: "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=1200",
      categoryId: getCat("parts-sourcing"),
      tagSlugs: ["tig-welding"],
      seoTitle: "Tungsten Selection Guide for TIG Welding | HubWeld",
      seoDesc: "Learn how to choose the best tungsten electrode for your TIG welding application, from lanthanated to thoriated.",
      seoKeywords: "tungsten electrodes, TIG welding tungsten, lanthanated tungsten, thoriated tungsten, ceriated tungsten",
      body: "<h2>The Heart of the TIG Torch</h2><p>The type of tungsten you use depends entirely on the material you are welding and whether you are using AC or DC current. 2% Lanthanated (blue) has become the gold standard for both AC (aluminum) and DC (steel/stainless) because it holds a sharp point well and handles high amperage. Thoriated (red) is excellent for DC welding but is slightly radioactive. Pure tungsten (green) is strictly for older transformer AC machines, as it balls up easily.</p>"
    },
    {
      slug: "understanding-welding-fumes-lev",
      title: "Understanding Welding Fumes and Local Exhaust Ventilation (LEV)",
      excerpt: "Protecting yourself from hazardous welding fumes requires more than just a mask. Discover how Local Exhaust Ventilation systems protect shops.",
      coverImage: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200",
      categoryId: getCat("safety-compliance"),
      tagSlugs: ["welding-safety"],
      seoTitle: "Welding Fumes and LEV Systems Guide | HubWeld",
      seoDesc: "Understand the dangers of welding fumes and how to properly implement Local Exhaust Ventilation (LEV) to ensure a safe shop environment.",
      seoKeywords: "welding fumes, LEV, local exhaust ventilation, fume extraction, welding safety",
      body: "<h2>Clearing the Air</h2><p>Welding fumes contain dangerous metal oxides and gases, including hexavalent chromium, manganese, and ozone. While respirators protect the individual welder, Local Exhaust Ventilation (LEV) systems like fume extractors and downdraft tables capture the fumes at the source, protecting everyone in the shop. A proper LEV system should pull air away from the welder's breathing zone without disrupting the shielding gas at the weld pool.</p>"
    },
    {
      slug: "pros-cons-flux-cored-fcaw",
      title: "The Pros and Cons of Flux-Cored Arc Welding (FCAW)",
      excerpt: "FCAW is a powerhouse process for heavy fabrication, but it isn't perfect for every job. Here is a breakdown of its advantages and limitations.",
      coverImage: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=1200",
      categoryId: getCat("welding-techniques"),
      tagSlugs: ["mig-welding"],
      seoTitle: "Pros and Cons of Flux-Cored Welding (FCAW) | HubWeld",
      seoDesc: "An overview of Flux-Cored Arc Welding (FCAW), its benefits for heavy fabrication, and its drawbacks compared to solid wire MIG.",
      seoKeywords: "flux cored welding, FCAW, dual shield welding, FCAW pros and cons",
      body: "<h2>Heavy Metal Deposition</h2><p>Flux-Cored Arc Welding uses a tubular wire filled with flux. It comes in two flavors: self-shielded (no gas required, great for outdoor field work) and gas-shielded (dual-shield, incredible deposition rates for heavy structural steel). The pros: very high deposition rates, deep penetration, and ability to weld over mill scale. The cons: it produces heavy slag that must be chipped away, generates intense fumes, and is not suitable for thin sheet metal.</p>"
    },
    {
      slug: "distributors-using-ai",
      title: "How Distributors Are Using AI to Optimize Inventory",
      excerpt: "Artificial Intelligence isn't just a buzzword; it's actively helping welding suppliers predict demand, reduce overstock, and prevent stockouts.",
      coverImage: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200",
      categoryId: getCat("business-distribution"),
      tagSlugs: ["distribution", "supply-chain"],
      seoTitle: "AI in Welding Distribution Inventory Optimization | HubWeld",
      seoDesc: "Learn how welding equipment and consumable distributors are leveraging AI to forecast demand and manage inventory efficiently.",
      seoKeywords: "AI in distribution, welding supply chain, inventory optimization, demand forecasting",
      body: "<h2>Smart Supply Chains</h2><p>Predicting when a region will experience a surge in demand for 7018 electrodes or argon gas used to rely on gut feeling. Today, AI-driven inventory management systems analyze historical sales data, seasonal trends, and even macroeconomic indicators to forecast demand. This allows distributors to keep lean inventories without risking stockouts, ultimately reducing carrying costs and freeing up capital for expansion.</p>"
    },
    {
      slug: "welding-industry-demographics",
      title: "Welding Industry Demographics: Who Will Replace the Retiring Generation?",
      excerpt: "As the baby boomer generation retires from the trades, the welding industry faces a demographic cliff. How are we attracting new talent?",
      coverImage: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1200",
      categoryId: getCat("industry-news"),
      tagSlugs: ["distribution"],
      seoTitle: "Welding Industry Demographics & Welder Shortage | HubWeld",
      seoDesc: "Exploring the demographic shift in the welding industry and how the trade is working to attract younger generations to fill the talent gap.",
      seoKeywords: "welder shortage, welding demographics, trades shortage, future of welding",
      body: "<h2>Bridging the Gap</h2><p>With the average age of a welder hovering around 55, the industry is racing to attract Gen Z into the trades. Efforts include modernizing vocational programs, leveraging social media influencers who showcase the artistry and earning potential of welding, and promoting the integration of technology like robotics and CAD in fabrication. The message is clear: welding is a high-tech, high-paying career path, not just a dirty job.</p>"
    },
    {
      slug: "how-to-weld-cast-iron",
      title: "How to Weld Cast Iron Without Cracking It",
      excerpt: "Welding cast iron is notoriously difficult due to its high carbon content and brittleness. Follow these crucial steps for a successful repair.",
      coverImage: "https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?w=1200",
      categoryId: getCat("welding-techniques"),
      tagSlugs: ["stick-welding", "tig-welding"],
      seoTitle: "How to Weld Cast Iron: Techniques & Tips | HubWeld",
      seoDesc: "Learn the proper techniques for welding cast iron, including pre-heating, filler selection, and slow cooling to prevent cracking.",
      seoKeywords: "welding cast iron, cast iron repair, cast iron stick welding, nickel electrode",
      body: "<h2>Taming the Brittle Beast</h2><p>Cast iron cracks easily when welded because the rapid heating and cooling cycles cause immense internal stress. The secret to success is thermal management. First, thoroughly clean the part. Second, pre-heat the entire casting to 500-1200°F. Use a high-nickel filler rod (like Ni-Rod) via stick or TIG. Peen the weld immediately after each short pass to relieve stress, and finally, allow the part to cool as slowly as possible by burying it in sand or an insulated blanket.</p>"
    },
    {
      slug: "guide-to-ndt-welding",
      title: "A Guide to Nondestructive Testing (NDT) for Welding",
      excerpt: "From visual inspection to radiography, understand the different methods used to verify weld integrity without destroying the part.",
      coverImage: "https://images.unsplash.com/photo-1562654501-a0ccc0fc3fb1?w=1200",
      categoryId: getCat("safety-compliance"),
      tagSlugs: ["welding-safety", "industrial-equipment"],
      seoTitle: "Nondestructive Testing (NDT) Methods for Welding | HubWeld",
      seoDesc: "An overview of Nondestructive Testing (NDT) methods used in welding, including X-ray, ultrasonic, dye penetrant, and magnetic particle inspection.",
      seoKeywords: "nondestructive testing, NDT welding, weld inspection, radiography, ultrasonic testing",
      body: "<h2>Looking Beneath the Surface</h2><p>Nondestructive testing (NDT) is critical for structural, pipeline, and aerospace welding. Visual Testing (VT) is the first line of defense. Dye Penetrant Testing (PT) highlights surface cracks. Magnetic Particle Testing (MT) finds surface and slightly sub-surface flaws in ferromagnetic materials. For deep, internal volumetric inspection, Ultrasonic Testing (UT) and Radiographic Testing (RT or X-ray) are the standards, capable of finding hidden porosity, slag inclusions, and lack of fusion.</p>"
    }
  ];

  console.log("Seeding 12 more blog posts...");
  for (const post of newPosts) {
    if (post.categoryId) {
      await createPost(post);
    }
  }

  console.log("Done seeding blog posts!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
