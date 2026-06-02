import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";

export const dynamic = "force-dynamic"; // Ensure it's not cached
export const maxDuration = 60; // Max duration for Vercel/Railway (if supported)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get("secret");

    if (secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OPENAI_API_KEY is missing" }, { status: 500 });
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // 1. Find an Admin user to be the author
    const admin = await prisma.user.findFirst({
      where: { role: "ADMIN" },
    });

    if (!admin) {
      return NextResponse.json({ error: "No admin user found to author the post" }, { status: 400 });
    }

    // 2. Find or create a default category
    let category = await prisma.postCategory.findFirst();
    if (!category) {
      category = await prisma.postCategory.create({
        data: {
          name: "Industry Insights",
          slug: "industry-insights",
          description: "Specialized articles and insights in the welding and industrial equipment sector",
        },
      });
    }

    // 3. Generate content with OpenAI
    const prompt = `
      You are an expert SEO content writer and industry specialist in Welding, Industrial Equipment, and B2B Marketplaces.
      Your task is to write a highly optimized article for GEO (Generative Engine Optimization) and SEO.
      The target language is English.

      Focus on one of these topics randomly:
      - Advanced welding techniques (TIG, MIG, Stick)
      - How to choose the right welding equipment
      - The future of freelance welding and finding contracts
      - B2B supply chain in the industrial sector
      - Safety protocols in structural welding

      Requirements for GEO & AIO (AI Optimization):
      - Use clear headings (h2, h3).
      - Include bullet points and numbered lists for readability.
      - Add a FAQ section at the end with direct answers (AI engines love this).
      - Include realistic statistics or industry standard facts.
      - Keep sentences concise and objective.

      Output MUST be a valid JSON object with the following schema:
      {
        "title": "The main H1 title of the article (English)",
        "seoTitle": "SEO optimized title under 60 chars (English)",
        "seoDesc": "SEO optimized meta description under 160 chars (English)",
        "seoKeywords": "comma, separated, keywords",
        "excerpt": "A short 2-sentence summary",
        "tags": ["Tag1", "Tag2", "Tag3"],
        "imagePrompt": "A highly detailed, photorealistic prompt for DALL-E 3 to generate the cover image for this article. Make it look professional and industrial.",
        "body": "The full article content in HTML format. DO NOT include the <h1> title in the body, start with <p> or <h2>. Include exactly one <img src='INLINE_IMAGE_PLACEHOLDER' alt='...' class='w-full rounded-2xl my-8 object-cover max-h-[400px]' /> somewhere in the middle of the article to act as an inline image."
      }
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // Or gpt-4o-mini
      messages: [
        { role: "system", content: "You are a specialized AI writer that outputs strict JSON." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const responseContent = completion.choices[0].message.content;
    if (!responseContent) {
      throw new Error("No content generated from OpenAI");
    }

    const data = JSON.parse(responseContent);

    // Fallback to high-quality Unsplash industrial/welding images since DALL-E isn't available on the account
    const unsplashImages = [
      "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1532009877282-3340270e0529?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1622340366624-a24fb2f87c10?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1612450531557-4b77fcc5c1ac?q=80&w=1200&auto=format&fit=crop"
    ];

    // Pick two random unique images
    const shuffled = unsplashImages.sort(() => 0.5 - Math.random());
    const coverImage = shuffled[0];
    const inlineImage = shuffled[1];

    // Replace placeholder with the inline image
    let finalBody = data.body;
    if (inlineImage) {
      finalBody = finalBody.replace("INLINE_IMAGE_PLACEHOLDER", inlineImage);
    } else {
      // If image generation failed, remove the placeholder img tag completely
      finalBody = finalBody.replace(/<img[^>]*INLINE_IMAGE_PLACEHOLDER[^>]*>/g, "");
    }

    // Process Tags
    const tagIds: string[] = [];
    if (Array.isArray(data.tags)) {
      for (const t of data.tags) {
        const slug = t.replace(/\s+/g, '-').toLowerCase();
        let tagRecord = await prisma.postTag.findUnique({ where: { slug } });
        if (!tagRecord) {
          tagRecord = await prisma.postTag.create({ data: { name: t, slug } });
        }
        tagIds.push(tagRecord.id);
      }
    }

    // Generate a unique slug based on timestamp to avoid collisions
    const slug = `${data.title.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '-').toLowerCase()}-${Date.now()}`;

    // 4. Save to Database
    const post = await prisma.post.create({
      data: {
        title: data.title,
        slug: encodeURIComponent(slug),
        body: finalBody,
        excerpt: data.excerpt,
        coverImage,
        seoTitle: data.seoTitle,
        seoDesc: data.seoDesc,
        seoKeywords: data.seoKeywords,
        status: "PUBLISHED",
        views: 0,
        authorId: admin.id,
        categoryId: category.id,
        publishedAt: new Date(),
        tags: {
          create: tagIds.map(id => ({
            tag: { connect: { id } }
          }))
        }
      },
    });

    return NextResponse.json({
      success: true,
      message: "Article generated successfully",
      post: {
        id: post.id,
        title: post.title,
        slug: post.slug,
      }
    });

  } catch (error: any) {
    console.error("Cron generation error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
