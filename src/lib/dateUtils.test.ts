import { describe, it, expect } from "vitest";
import {
  parseTolerantDate,
  calculateDeadlineInfo,
  SLA_DURATIONS_MS,
} from "./dateUtils";

describe("Date and SLA Deadline Utilities", () => {
  describe("parseTolerantDate", () => {
    it("parses standard ISO 8601 strings", () => {
      const d = parseTolerantDate("2026-09-20T10:00:00Z");
      expect(d.getUTCFullYear()).toBe(2026);
      expect(d.getUTCMonth()).toBe(8); // 0-indexed September
      expect(d.getUTCDate()).toBe(20);
    });

    it("parses non-standard SQL timestamp format (e.g. T-2007)", () => {
      const d = parseTolerantDate("2026-09-20 11:30:00");
      expect(d.getUTCFullYear()).toBe(2026);
      expect(d.getUTCHours()).toBe(11);
      expect(d.getUTCMinutes()).toBe(30);
    });

    it("parses timestamp with timezone offset (e.g. T-2009 +05:30)", () => {
      const d = parseTolerantDate("2026-09-21T08:45:00+05:30");
      expect(d.toISOString()).toBe("2026-09-21T03:15:00.000Z");
    });
  });

  describe("calculateDeadlineInfo", () => {
    const baseNow = new Date("2026-09-20T12:00:00Z").getTime();

    it("identifies late tickets when deadline has passed", () => {
      // P0 has 1 hour duration. Created 2 hours ago -> 1 hour overdue
      const created2HoursAgo = new Date(baseNow - 2 * 3600 * 1000).toISOString();
      const info = calculateDeadlineInfo(created2HoursAgo, "P0", baseNow);

      expect(info.state).toBe("late");
      expect(info.remainingMs).toBeLessThan(0);
      expect(info.formattedCountdown).toContain("overdue");
    });

    it("identifies at-risk tickets when less than 20% time remains", () => {
      // P1 has 4 hours (240 min) duration. 20% of 4h is 48 mins.
      // If created 3h 30m ago, 30m remains (30/240 = 12.5% < 20%) -> at_risk
      const created3h30mAgo = new Date(baseNow - 3.5 * 3600 * 1000).toISOString();
      const info = calculateDeadlineInfo(created3h30mAgo, "P1", baseNow);

      expect(info.state).toBe("at_risk");
      expect(info.remainingMs).toBeGreaterThan(0);
      expect(info.formattedCountdown).toContain("30m");
    });

    it("identifies on-track tickets when more than 20% time remains", () => {
      // P2 has 24 hours. Created 2 hours ago -> 22 hours remain -> on_track
      const created2hAgo = new Date(baseNow - 2 * 3600 * 1000).toISOString();
      const info = calculateDeadlineInfo(created2hAgo, "P2", baseNow);

      expect(info.state).toBe("on_track");
      expect(info.formattedCountdown).toContain("22h");
    });

    it("handles future created_at dates gracefully (e.g. T-2008)", () => {
      const futureDate = "2027-01-01T00:00:00Z";
      const info = calculateDeadlineInfo(futureDate, "P3", baseNow);

      expect(info.state).toBe("future");
      expect(info.formattedCountdown).toContain("Starts in");
    });

    it("uses correct SLA durations for all priorities", () => {
      expect(SLA_DURATIONS_MS.P0).toBe(3600000); // 1h
      expect(SLA_DURATIONS_MS.P1).toBe(14400000); // 4h
      expect(SLA_DURATIONS_MS.P2).toBe(86400000); // 24h
      expect(SLA_DURATIONS_MS.P3).toBe(259200000); // 72h
    });
  });
});
