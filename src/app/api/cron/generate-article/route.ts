import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
        "body": "The full article content in HTML format. DO NOT include the <h1> title in the body, start with <p> or <h2>."
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

    // Generate a unique slug based on timestamp to avoid collisions
    const slug = `${data.title.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}`;

    // 4. Save to Database
    const post = await prisma.post.create({
      data: {
        title: data.title,
        slug: encodeURIComponent(slug),
        body: data.body,
        excerpt: data.excerpt,
        seoTitle: data.seoTitle,
        seoDesc: data.seoDesc,
        seoKeywords: data.seoKeywords,
        status: "PUBLISHED",
        authorId: admin.id,
        categoryId: category.id,
        publishedAt: new Date(),
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
