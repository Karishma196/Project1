import DOMPurify from "isomorphic-dompurify";

export function sanitizeCustomerHtml(rawHtml: string | null | undefined): string {
  if (!rawHtml) return "";

  return DOMPurify.sanitize(rawHtml, {
    ALLOWED_TAGS: [
      "b",
      "i",
      "em",
      "strong",
      "u",
      "p",
      "br",
      "ul",
      "ol",
      "li",
      "code",
      "pre",
      "blockquote",
      "span",
      "a",
    ],
    ALLOWED_ATTR: ["href", "title", "target", "rel", "class", "dir"],
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):|[^a-z]|[a-z+.-]+(?:[^a-z+.-:]|$))/i,
    ADD_ATTR: ["target", "rel"],
  });
}

export function validateSafeUrl(url: string | null | undefined): {
  isSafe: boolean;
  sanitizedUrl: string | null;
  warning?: string;
} {
  if (!url) {
    return { isSafe: true, sanitizedUrl: null };
  }

  const trimmed = url.trim();

  // Explicitly disallow script and pseudo-protocols
  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith("javascript:") ||
    lower.startsWith("data:") ||
    lower.startsWith("vbscript:") ||
    lower.startsWith("file:")
  ) {
    return {
      isSafe: false,
      sanitizedUrl: null,
      warning: "Blocked unsafe attachment link (executable protocol detected).",
    };
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return { isSafe: true, sanitizedUrl: trimmed };
    }
    return {
      isSafe: false,
      sanitizedUrl: null,
      warning: `Blocked attachment link with unsupported protocol: ${parsed.protocol}`,
    };
  } catch {
    return {
      isSafe: false,
      sanitizedUrl: null,
      warning: "Invalid attachment URL structure.",
    };
  }
}
