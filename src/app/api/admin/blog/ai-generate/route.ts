import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import OpenAI from "openai";

async function guard() {
  const s = await getServerSession(authOptions);
  return (s?.user as any)?.role === "ADMIN";
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ── Prompt builder ──────────────────────────────────────────────────────────
function buildPrompt(opts: {
  mode: "topic" | "rewrite" | "url";
  input: string;           // topic text OR raw content from URL
  focus: string;           // SEO | AEO | GEO
  length: "short" | "medium" | "long";
  industry?: string;
}) {
  const wordTarget = opts.length === "short" ? 600 : opts.length === "medium" ? 1200 : 2000;

  const focusInstructions: Record<string, string> = {
    SEO: `Optimise for search engines: include the main keyword in the title, first paragraph, 2–3 H2 headings, and meta description. Add natural keyword variations throughout.`,
    AEO: `Optimise for AI/answer engines: structure the article with clear H2 questions and direct, concise answers. Include a FAQ section at the end with 4–6 Q&A pairs formatted as <h3> and <p> tags.`,
    GEO: `Optimise for geographic relevance: mention specific regions (USA, Canada, North America, and relevant industry hubs). Include location-specific use cases and service area references.`,
  };

  const modePrefix: Record<string, string> = {
    topic: `Write a brand-new professional blog article about the following topic`,
    rewrite: `Rewrite and significantly improve the following article draft`,
    url: `Rewrite the following scraped web content as a fresh, original blog article`,
  };

  return `You are an expert industrial welding content writer for HubWeld, a B2B platform for welding parts distribution, brokers, dealers, and system integrators.

${modePrefix[opts.mode]}: 

---
${opts.input}
---

REQUIREMENTS:
- Target word count: approximately ${wordTarget} words
- ${focusInstructions[opts.focus]}
- Write in professional but accessible English
- Use proper HTML tags: <h2>, <h3>, <p>, <ul>, <li>, <strong>, <blockquote>
- Add at least 2 image placeholders using: <img src="https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=900&q=80" alt="[descriptive alt text]" /> — choose contextually relevant Unsplash welding/industrial photos
- Do NOT include <html>, <body>, or <head> tags — only the article body HTML
- At the end, output a JSON block (wrapped in \`\`\`json ... \`\`\`) with these fields:
  {
    "suggestedTitle": "...",
    "seoTitle": "... (max 60 chars)",
    "seoDesc": "... (max 160 chars)",
    "seoKeywords": "keyword1, keyword2, keyword3, keyword4, keyword5",
    "suggestedSlug": "url-friendly-slug",
    "focusType": "${opts.focus}",
    "wordCount": <estimated number>,
    "readingMinutes": <estimated minutes>
  }`;
}

// ── URL scraper (simple fetch, no external lib needed) ────────────────────
async function scrapeUrl(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; HubWeld-Bot/1.0)" },
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) throw new Error(`Failed to fetch URL: ${res.status}`);
  const html = await res.text();
  // Strip tags, scripts, styles — keep text
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim()
    .slice(0, 8000); // cap to avoid huge prompts
}

// ── Main handler ─────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  if (!await guard()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "OPENAI_API_KEY is not configured in .env" }, { status: 500 });
  }

  const { mode, topic, content, url, focus, length } = await req.json();

  if (!mode || !focus || !length) {
    return NextResponse.json({ error: "mode, focus and length are required" }, { status: 400 });
  }

  let input = "";
  try {
    if (mode === "topic") {
      input = topic ?? "";
    } else if (mode === "rewrite") {
      input = content ?? "";
    } else if (mode === "url") {
      input = await scrapeUrl(url ?? "");
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "Failed to fetch URL" }, { status: 400 });
  }

  if (!input.trim()) {
    return NextResponse.json({ error: "No input content provided" }, { status: 400 });
  }

  const prompt = buildPrompt({ mode, input, focus, length });

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: length === "long" ? 4000 : length === "medium" ? 2500 : 1500,
    });

    const raw = completion.choices[0]?.message?.content ?? "";

    // Split body HTML and JSON meta
    const jsonMatch = raw.match(/```json\s*([\s\S]*?)```/);
    let meta: Record<string, any> = {};
    let body = raw;

    if (jsonMatch) {
      try { meta = JSON.parse(jsonMatch[1]); } catch {}
      body = raw.replace(/```json[\s\S]*?```/, "").trim();
    }

    return NextResponse.json({ body, meta, raw });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "OpenAI error" }, { status: 500 });
  }
}
