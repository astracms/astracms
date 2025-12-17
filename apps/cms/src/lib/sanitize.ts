/**
 * HTML Sanitization using DOMPurify
 * Prevents XSS attacks in user-generated and AI-generated content
 */
import DOMPurify from "dompurify";
import { JSDOM } from "jsdom";

// Create a DOMPurify instance for server-side use
const window = new JSDOM("").window;
const purify = DOMPurify(window);

/**
 * Sanitize HTML content to prevent XSS attacks
 * Uses DOMPurify with strict configuration for blog content
 */
export function sanitizeHtml(html: string): string {
  return purify.sanitize(html, {
    ALLOWED_TAGS: [
      // Text formatting
      "p",
      "br",
      "strong",
      "em",
      "u",
      "s",
      "mark",
      "small",
      "sub",
      "sup",
      // Headings
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      // Lists
      "ul",
      "ol",
      "li",
      // Content blocks
      "blockquote",
      "code",
      "pre",
      // Links and media
      "a",
      "img",
      // Tables
      "table",
      "thead",
      "tbody",
      "tr",
      "th",
      "td",
      // Divs and spans (for styling)
      "div",
      "span",
      // Horizontal rule
      "hr",
    ],
    ALLOWED_ATTR: [
      "href",
      "src",
      "alt",
      "title",
      "class",
      "id",
      "target",
      "rel",
      "width",
      "height",
    ],
    ALLOWED_URI_REGEXP:
      /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i,
    ALLOW_DATA_ATTR: false,
    ALLOW_UNKNOWN_PROTOCOLS: false,
    SAFE_FOR_TEMPLATES: true,
  });
}

/**
 * Sanitize text for use in AI prompts
 * Removes potential prompt injection patterns
 */
export function sanitizePromptInput(input: string): string {
  return (
    input
      // Remove quotes that could break prompt structure
      .replace(/["'`]/g, "")
      // Collapse multiple newlines
      .replace(/\n{3,}/g, "\n\n")
      // Remove common injection patterns
      .replace(/ignore\s+all\s+previous\s+instructions/gi, "")
      .replace(/system\s*:/gi, "")
      .replace(/assistant\s*:/gi, "")
      // Limit length to prevent token abuse
      .slice(0, 1000)
      .trim()
  );
}

/**
 * Sanitize and validate a slug
 */
export function sanitizeSlug(slug: string): string {
  return slug
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/'/g, "") // Remove apostrophes
    .replace(/[^\w\s-]/g, "") // Remove special chars
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Collapse multiple hyphens
    .replace(/^-+|-+$/g, "") // Remove leading/trailing hyphens
    .slice(0, 100); // Limit length
}
