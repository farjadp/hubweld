/**
 * Seed — October 2026 article batch
 *
 * Reads prisma/content/2026-10/articles.json and one HTML body file per
 * article, and inserts any post whose slug does not exist yet. Plain ESM for
 * the same reason as seed-content.mjs: it runs in the production container
 * via `node`, on every boot, so it must be idempotent and never fatal.
 *
 * Run locally: node prisma/seed-articles-2026-10.mjs
 */
import pkg from "@prisma/client";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const { PrismaClient } = pkg;
const prisma = new PrismaClient();

const dir = join(dirname(fileURLToPath(import.meta.url)), "content", "2026-10");
const manifest = JSON.parse(readFileSync(join(dir, "articles.json"), "utf8"));

async function main() {
  const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  if (!admin) throw new Error("No admin user found — run the base seed first.");

  for (const c of manifest.categories) {
    await prisma.postCategory.upsert({
      where: { slug: c.slug },
      update: {},
      create: { slug: c.slug, name: c.name, description: c.description, sortOrder: c.sortOrder ?? 0 },
    });
  }
  // Articles also use categories created by earlier seeds (welding-techniques, …).
  const categories = await prisma.postCategory.findMany({ select: { id: true, slug: true } });
  const categoryIds = Object.fromEntries(categories.map((c) => [c.slug, c.id]));

  let created = 0;
  for (const a of manifest.articles) {
    const exists = await prisma.post.findUnique({ where: { slug: a.slug } });
    if (exists) continue;
    if (!categoryIds[a.category]) {
      console.log(`  skip ${a.slug}: no category "${a.category}"`);
      continue;
    }

    const tagIds = [];
    for (const t of a.tags) {
      const tag = await prisma.postTag.upsert({ where: { slug: t.slug }, update: {}, create: t });
      tagIds.push(tag.id);
    }

    const body = readFileSync(join(dir, `${a.slug}.html`), "utf8").trim();
    const date = new Date(a.publishedAt);
    await prisma.post.create({
      data: {
        slug: a.slug, title: a.title, excerpt: a.excerpt, body,
        coverImage: a.coverImage, seoTitle: a.seoTitle, seoDesc: a.seoDesc,
        seoKeywords: a.seoKeywords, status: "PUBLISHED",
        // Nested tag writes need relation inputs throughout, not raw ids.
        author: { connect: { id: admin.id } },
        category: { connect: { id: categoryIds[a.category] } },
        publishedAt: date, createdAt: date,
        tags: { create: tagIds.map((id) => ({ tag: { connect: { id } } })) },
      },
    });
    created++;
  }
  console.log(`October 2026 articles created: ${created}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
