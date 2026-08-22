import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import OpenAI from "openai";
import http from "http";
import https from "https";
import { lookup } from "dns/promises";

export const runtime = "nodejs";

// ── SSRF guard ────────────────────────────────────────────────────────────
// The scraper fetches an arbitrary admin-supplied URL from inside the server,
// with TLS verification relaxed and redirects followed. Without this check a
// URL (or a redirect hop) could reach the cloud metadata endpoint or any
// service on the private network. Every hop is resolved and validated.
function isBlockedAddress(ip: string): boolean {
  const v4 = ip.replace(/^::ffff:/i, "");
  const m = v4.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
  if (m) {
    const [a, b] = [Number(m[1]), Number(m[2])];
    return (
      a === 0 ||                          // this network
      a === 10 ||                         // private
      a === 127 ||                        // loopback
      (a === 169 && b === 254) ||         // link-local, incl. cloud metadata
      (a === 172 && b >= 16 && b <= 31) || // private
      (a === 192 && b === 168) ||         // private
      (a === 100 && b >= 64 && b <= 127) ||// CGNAT
      a >= 224                            // multicast / reserved
    );
  }
  const v6 = ip.toLowerCase();
  return (
    v6 === "::" || v6 === "::1" ||        // unspecified / loopback
    /^f[cd]/.test(v6) ||                  // unique local fc00::/7
    /^fe[89ab]/.test(v6)                  // link-local fe80::/10
  );
}

async function assertPublicUrl(raw: string): Promise<URL> {
  let u: URL;
  try { u = new URL(raw); } catch { throw new Error("Invalid URL"); }
  if (u.protocol !== "http:" && u.protocol !== "https:") {
    throw new Error("Only http:// and https:// URLs are supported");
  }
  let address: string;
  try {
    ({ address } = await lookup(u.hostname));
  } catch {
    throw new Error(`Could not resolve ${u.hostname}`);
  }
  if (isBlockedAddress(address)) {
    throw new Error("That URL points to a private or internal address and cannot be fetched");
  }
  return u;
}

async function guard() {
  const s = await getServerSession(authOptions);
  return (s?.user as any)?.role === "ADMIN";
}

// Lazy initialization - only create client when needed
let openaiClient: OpenAI | null = null;
function getOpenAI() {
  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openaiClient;
}

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

// Realistic browser headers so sites don't reject us as a bot.
function browserHeaders(origin: string): Record<string, string> {
  return {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Cache-Control": "no-cache",
    "Pragma": "no-cache",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "none",
    "Upgrade-Insecure-Requests": "1",
    ...(origin ? { Referer: origin } : {}),
  };
}

type PageResult = { status: number; contentType: string; body: string };

// TLS-tolerant fetch via Node http/https. Used as a fallback when the native
// fetch throws on certificate problems (e.g. a site with a mismatched SSL cert).
async function nodeGet(url: string, headers: Record<string, string>, redirects = 0): Promise<PageResult> {
  if (redirects > 5) throw new Error("Too many redirects");
  // Validate this hop before opening the socket — a redirect is the easiest
  // way to walk an allowed public host into the private network.
  const u = await assertPublicUrl(url);
  return new Promise<PageResult>((resolve, reject) => {
    const mod = u.protocol === "http:" ? http : https;
    const req = mod.request(
      u,
      { method: "GET", headers, timeout: 15000, rejectUnauthorized: false },
      (res) => {
        const status = res.statusCode || 0;
        // Follow redirects
        if (status >= 300 && status < 400 && res.headers.location) {
          res.resume();
          const next = new URL(res.headers.location, u).toString();
          return resolve(nodeGet(next, headers, redirects + 1));
        }
        const chunks: Buffer[] = [];
        res.on("data", (c) => chunks.push(c as Buffer));
        res.on("end", () => resolve({
          status,
          contentType: String(res.headers["content-type"] || ""),
          body: Buffer.concat(chunks).toString("utf8"),
        }));
      }
    );
    req.on("error", reject);
    req.on("timeout", () => { req.destroy(new Error("Request timed out")); });
    req.end();
  });
}

async function fetchPage(url: string): Promise<PageResult> {
  // Throws before any request is made if the target resolves to a private
  // address. Redirect hops are re-validated individually below / in nodeGet.
  const first = await assertPublicUrl(url);
  const headers = browserHeaders(first.origin);

  // 1) Try the native fetch first (validates TLS). Redirects are handled
  //    manually so each hop passes the same guard.
  let current = first.toString();
  try {
    for (let hop = 0; hop <= 5; hop++) {
      const res = await fetch(current, { headers, redirect: "manual", signal: AbortSignal.timeout(15000) });
      const location = res.headers.get("location");
      if (res.status >= 300 && res.status < 400 && location) {
        const next = await assertPublicUrl(new URL(location, current).toString());
        current = next.toString();
        continue;
      }
      return { status: res.status, contentType: res.headers.get("content-type") || "", body: await res.text() };
    }
    throw new Error("Too many redirects");
  } catch (e: any) {
    // A guard rejection is a real answer, not a transport failure — do not
    // retry it through the TLS-tolerant path.
    if (/private or internal address|Only http|Invalid URL|Could not resolve|Too many redirects/.test(e?.message ?? "")) throw e;
    // 2) Fall back to a TLS-tolerant Node request (mismatched/self-signed certs).
    return nodeGet(current, headers);
  }
}

// ── URL scraper ───────────────────────────────────────────────────────────
async function scrapeUrl(url: string): Promise<string> {
  if (!url || !/^https?:\/\//i.test(url)) {
    throw new Error("Please enter a valid URL starting with http:// or https://");
  }

  const res = await fetchPage(url);

  if (res.status < 200 || res.status >= 300) {
    if (res.status === 403 || res.status === 401 || res.status === 429) {
      throw new Error(
        `The site blocked automated access (HTTP ${res.status}). ` +
        `Open the page, copy its text, and use the "Topic / Rewrite" → "Rewrite draft" mode instead.`
      );
    }
    throw new Error(`Failed to fetch URL: ${res.status}`);
  }

  if (res.contentType && !res.contentType.includes("html") && !res.contentType.includes("text")) {
    throw new Error(`Unsupported content type (${res.contentType}). Provide a normal web page URL.`);
  }

  // Strip tags, scripts, styles — keep text
  const text = res.body
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s{2,}/g, " ")
    .trim()
    .slice(0, 8000); // cap to avoid huge prompts

  if (text.length < 200) {
    throw new Error(
      "Couldn't extract enough readable text (the page may be JavaScript-rendered or protected). " +
      "Try the \"Topic / Rewrite\" → \"Rewrite draft\" mode with the text pasted in."
    );
  }
  return text;
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
    const completion = await getOpenAI().chat.completions.create({
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
