import { describe, it, expect } from "vitest";
import { sanitizeCustomerHtml, validateSafeUrl } from "./sanitize";

describe("Sanitization & Security Utilities", () => {
  describe("sanitizeCustomerHtml", () => {
    it("neutralizes stored XSS payloads from ticket T-2002", () => {
      const malicious =
        '<img src=x onerror="alert(\'hacked\')"> I was charged twice. <a href="https://example.com/invoice">Invoice</a>';
      const clean = sanitizeCustomerHtml(malicious);

      expect(clean).not.toContain("<img");
      expect(clean).not.toContain("onerror");
      expect(clean).not.toContain("alert");
      expect(clean).toContain("I was charged twice.");
      expect(clean).toContain('<a href="https://example.com/invoice"');
    });

    it("strips script tags completely", () => {
      const input = "<script>stealCookies()</script>Hello World";
      const clean = sanitizeCustomerHtml(input);

      expect(clean).not.toContain("<script");
      expect(clean).toBe("Hello World");
    });

    it("preserves safe HTML formatting tags", () => {
      const input = "<p><strong>Bold statement</strong> and <em>italic note</em></p>";
      const clean = sanitizeCustomerHtml(input);

      expect(clean).toBe("<p><strong>Bold statement</strong> and <em>italic note</em></p>");
    });

    it("strips malicious javascript href in anchor tags", () => {
      const input = '<a href="javascript:alert(1)">Click here</a>';
      const clean = sanitizeCustomerHtml(input);

      expect(clean).not.toContain("javascript:");
    });
  });

  describe("validateSafeUrl", () => {
    it("blocks javascript: protocol from ticket T-2003", () => {
      const result = validateSafeUrl("javascript:alert(document.cookie)");
      expect(result.isSafe).toBe(false);
      expect(result.sanitizedUrl).toBeNull();
      expect(result.warning).toContain("Blocked unsafe attachment link");
    });

    it("blocks data: and vbscript: URIs", () => {
      expect(validateSafeUrl("data:text/html,<script>alert(1)</script>").isSafe).toBe(false);
      expect(validateSafeUrl("vbscript:msgbox('hi')").isSafe).toBe(false);
    });

    it("accepts valid https URLs from ticket T-2010", () => {
      const validUrl = "https://files.example.com/screenshots/export-bug.png";
      const result = validateSafeUrl(validUrl);
      expect(result.isSafe).toBe(true);
      expect(result.sanitizedUrl).toBe(validUrl);
    });

    it("handles null and empty values gracefully", () => {
      expect(validateSafeUrl(null).isSafe).toBe(true);
      expect(validateSafeUrl("").isSafe).toBe(true);
    });
  });
});
