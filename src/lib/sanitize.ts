import sanitizeHtml from "sanitize-html";

/**
 * Clean the HTML body of an article before it is rendered.
 *
 * Post bodies are dropped into the page with dangerouslySetInnerHTML. Most of
 * that HTML now arrives from the OpenAI call — raw model output, pasted
 * wholesale into the editor — so "only an admin can post" is not the whole
 * story: the model writes the markup and the admin clicks save. An allowlist
 * is the only thing between that and a <script> on every reader's page.
 *
 * This runs on the server at render time rather than on save, so existing rows
 * (and anything an older editor stored) are covered too.
 */
const CONFIG: sanitizeHtml.IOptions = {
  allowedTags: [
    "h2", "h3", "h4", "h5", "h6",
    "p", "br", "hr", "div", "span",
    "strong", "b", "em", "i", "u", "s", "mark", "small", "sub", "sup",
    "ul", "ol", "li",
    "blockquote", "pre", "code",
    "a", "img", "figure", "figcaption",
    "table", "thead", "tbody", "tfoot", "tr", "th", "td", "caption", "colgroup", "col",
  ],
  allowedAttributes: {
    a: ["href", "name", "target", "rel", "title"],
    img: ["src", "alt", "title", "width", "height", "loading", "decoding", "class"],
    // The editor and the AI prompt both emit Tailwind classes on block elements.
    "*": ["class", "id", "style"],
    th: ["colspan", "rowspan", "scope"],
    td: ["colspan", "rowspan"],
    col: ["span"],
  },
  // No javascript:, no data: — only real links and real image sources.
  allowedSchemes: ["http", "https", "mailto", "tel"],
  allowedSchemesByTag: { img: ["http", "https"] },
  allowProtocolRelative: false,
  // Inline styles are kept, but only properties that cannot be used to
  // overlay or hide the rest of the page.
  allowedStyles: {
    "*": {
      "color": [/^[-#,.%()\s\w]+$/],
      "background-color": [/^[-#,.%()\s\w]+$/],
      "text-align": [/^(left|right|center|justify)$/],
      "font-weight": [/^(normal|bold|[1-9]00)$/],
      "font-style": [/^(normal|italic)$/],
      "text-decoration": [/^[-\s\w]+$/],
      "width": [/^\d+(\.\d+)?(px|%|rem|em)$/],
      "max-width": [/^\d+(\.\d+)?(px|%|rem|em)$/],
      "margin": [/^[-\d.a-z%\s]+$/],
      "padding": [/^[-\d.a-z%\s]+$/],
    },
  },
  // An external link opened from our page should not keep a handle on it.
  transformTags: {
    a: (tagName, attribs) => {
      const href = attribs.href ?? "";
      const external = /^https?:\/\//i.test(href);
      return {
        tagName,
        attribs: external ? { ...attribs, target: "_blank", rel: "noopener noreferrer nofollow" } : attribs,
      };
    },
    img: (tagName, attribs) => ({
      tagName,
      attribs: { loading: "lazy", decoding: "async", ...attribs },
    }),
  },
  // Drop the contents of anything removed, rather than leaving the text behind.
  nonTextTags: ["style", "script", "textarea", "option", "noscript", "iframe", "object", "embed"],
};

export function sanitizeArticleHtml(html: string): string {
  if (!html) return "";
  return sanitizeHtml(html, CONFIG);
}
