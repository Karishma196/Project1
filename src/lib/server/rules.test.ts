import { describe, it, expect } from "vitest";
import {
  validateStatusTransition,
  validateEnterprisePriority,
  validateTriageUpdate,
  isValidAgent,
} from "./rules";

describe("Business Rules Validation Engine", () => {
  describe("validateStatusTransition", () => {
    it("allows open -> in_progress", () => {
      const result = validateStatusTransition("open", "in_progress");
      expect(result.valid).toBe(true);
    });

    it("allows in_progress -> resolved", () => {
      const result = validateStatusTransition("in_progress", "resolved");
      expect(result.valid).toBe(true);
    });

    it("allows in_progress -> open", () => {
      const result = validateStatusTransition("in_progress", "open");
      expect(result.valid).toBe(true);
    });

    it("allows resolved -> open and resolved -> closed", () => {
      expect(validateStatusTransition("resolved", "open").valid).toBe(true);
      expect(validateStatusTransition("resolved", "closed").valid).toBe(true);
    });

    it("allows closed -> open", () => {
      expect(validateStatusTransition("closed", "open").valid).toBe(true);
    });

    it("refuses open -> resolved directly", () => {
      const result = validateStatusTransition("open", "resolved");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("Invalid status transition");
    });

    it("refuses open -> closed directly", () => {
      const result = validateStatusTransition("open", "closed");
      expect(result.valid).toBe(false);
    });
  });

  describe("validateEnterprisePriority", () => {
    it("allows P0 and P1 for enterprise plan", () => {
      expect(validateEnterprisePriority("enterprise", "P0").valid).toBe(true);
      expect(validateEnterprisePriority("enterprise", "P1").valid).toBe(true);
    });

    it("refuses P2, P3, P5 for enterprise plan", () => {
      expect(validateEnterprisePriority("enterprise", "P2").valid).toBe(false);
      expect(validateEnterprisePriority("enterprise", "P3").valid).toBe(false);
      expect(validateEnterprisePriority("enterprise", "P5").valid).toBe(false);
    });

    it("allows P2 and P3 for free and pro plans", () => {
      expect(validateEnterprisePriority("free", "P3").valid).toBe(true);
      expect(validateEnterprisePriority("pro", "P2").valid).toBe(true);
    });
  });

  describe("validateTriageUpdate", () => {
    it("requires written reason of at least 10 characters", () => {
      const short = validateTriageUpdate({
        plan: "pro",
        newPriority: "P1",
        reason: "too short",
      });
      expect(short.valid).toBe(false);
      expect(short.error).toContain("at least 10 characters");

      const valid = validateTriageUpdate({
        plan: "pro",
        newPriority: "P1",
        reason: "Valid reason with more than 10 characters",
      });
      expect(valid.valid).toBe(true);
    });

    it("rejects downgrading enterprise ticket even with valid reason", () => {
      const enterpriseCheck = validateTriageUpdate({
        plan: "enterprise",
        newPriority: "P3",
        reason: "Customer agreed to lower priority for this issue",
      });
      expect(enterpriseCheck.valid).toBe(false);
      expect(enterpriseCheck.error).toContain("stay at least P1");
    });
  });

  describe("isValidAgent", () => {
    it("validates recognized agents", () => {
      expect(isValidAgent("agent-1")).toBe(true);
      expect(isValidAgent("agent-2")).toBe(true);
      expect(isValidAgent("agent-3")).toBe(true);
    });

    it("rejects unrecognized agents like agent-99", () => {
      expect(isValidAgent("agent-99")).toBe(false);
      expect(isValidAgent("unknown-user")).toBe(false);
    });
  });
});
