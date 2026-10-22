/**
 * Pull question/answer pairs out of an article's FAQ section for FAQPage
 * JSON-LD.
 *
 * The convention is `<h2 id="faq">…</h2>` followed by `<h3>question</h3>` and
 * one or more answer blocks, up to the next `<h2>` or the end of the body.
 * Articles without that heading return an empty list, so older posts are
 * unaffected. Answers are reduced to plain text: structured data must match
 * what the reader sees, not carry markup.
 */
export type FaqItem = { question: string; answer: string };

const text = (html: string) =>
  html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&rsquo;/g, "'")
    .replace(/\s+/g, " ")
    .trim();

export function extractFaq(body: string): FaqItem[] {
  const start = body.search(/<h2[^>]*\bid=["']faq["'][^>]*>/i);
  if (start === -1) return [];

  const afterHeading = body.slice(body.indexOf(">", start) + 1);
  const end = afterHeading.search(/<h2[\s>]/i);
  const section = end === -1 ? afterHeading : afterHeading.slice(0, end);

  const items: FaqItem[] = [];
  const parts = section.split(/<h3[^>]*>/i).slice(1);
  for (const part of parts) {
    const close = part.search(/<\/h3>/i);
    if (close === -1) continue;
    const question = text(part.slice(0, close));
    const answer = text(part.slice(close + 5));
    if (question && answer) items.push({ question, answer });
  }
  return items;
}
