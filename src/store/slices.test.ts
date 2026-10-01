import { describe, it, expect } from "vitest";
import agentReducer, { setSelectedAgent } from "./agentSlice";
import metricsReducer, {
  setMetrics,
  incrementMyTickets,
  decrementMyTickets,
  decrementToReview,
} from "./metricsSlice";
import filterReducer, {
  setFilter,
  setAllFilters,
  resetFilters,
} from "./filterSlice";
import liveUpdatesReducer, {
  addPendingNewTickets,
  clearPendingNewTickets,
  setLastPollTimestamp,
} from "./liveUpdatesSlice";
import { Ticket } from "@/types/ticket";

describe("Redux Slices", () => {
  describe("agentSlice", () => {
    it("updates selected agent correctly", () => {
      const state = agentReducer(
        { selectedAgentId: "agent-1", agents: [] },
        setSelectedAgent("agent-2")
      );
      expect(state.selectedAgentId).toBe("agent-2");
    });
  });

  describe("metricsSlice", () => {
    it("sets metrics directly", () => {
      const state = metricsReducer(
        { myTicketsCount: 0, toReviewCount: 0, loading: false, error: null },
        setMetrics({ myTicketsCount: 15, toReviewCount: 7 })
      );
      expect(state.myTicketsCount).toBe(15);
      expect(state.toReviewCount).toBe(7);
    });

    it("increments and decrements counts without going below zero", () => {
      let state = metricsReducer(
        { myTicketsCount: 5, toReviewCount: 2, loading: false, error: null },
        incrementMyTickets()
      );
      expect(state.myTicketsCount).toBe(6);

      state = metricsReducer(state, decrementMyTickets());
      expect(state.myTicketsCount).toBe(5);

      state = metricsReducer(state, decrementToReview());
      expect(state.toReviewCount).toBe(1);

      // Decrement below 0 stays 0
      state = metricsReducer(state, decrementToReview());
      state = metricsReducer(state, decrementToReview());
      expect(state.toReviewCount).toBe(0);
    });
  });

  describe("filterSlice", () => {
    it("updates individual filters", () => {
      let state = filterReducer(undefined, { type: "@@INIT" });
      expect(state.status).toBe("all");

      state = filterReducer(state, setFilter({ key: "status", value: "open" }));
      expect(state.status).toBe("open");

      state = filterReducer(state, setFilter({ key: "priority", value: "P0" }));
      expect(state.priority).toBe("P0");
    });

    it("sets all filters in bulk and resets to default", () => {
      let state = filterReducer(
        undefined,
        setAllFilters({
          status: "in_progress",
          category: "bug",
          search: "login error",
        })
      );
      expect(state.status).toBe("in_progress");
      expect(state.category).toBe("bug");
      expect(state.search).toBe("login error");

      state = filterReducer(state, resetFilters());
      expect(state.status).toBe("all");
      expect(state.search).toBe("");
    });
  });

  describe("liveUpdatesSlice", () => {
    it("buffers new incoming tickets and avoids duplicates", () => {
      const mockTicket: Ticket = {
        external_id: "T-9999",
        customer_id: "C-1",
        customer_plan: "pro",
        subject: "New issue",
        body: "Test body",
        attachment_url: null,
        created_at: new Date().toISOString(),
        status: "open",
        assigned_to: null,
        category: "bug",
        priority: "P1",
        summary: "New issue summary",
        triage_decision: "auto_accept",
        review_reason: null,
      };

      let state = liveUpdatesReducer(
        undefined,
        addPendingNewTickets([mockTicket])
      );
      expect(state.pendingNewTickets.length).toBe(1);

      // Duplicate addition
      state = liveUpdatesReducer(state, addPendingNewTickets([mockTicket]));
      expect(state.pendingNewTickets.length).toBe(1);

      state = liveUpdatesReducer(state, clearPendingNewTickets());
      expect(state.pendingNewTickets.length).toBe(0);
    });

    it("updates poll timestamp", () => {
      const ts = "2026-10-01T12:00:00Z";
      const state = liveUpdatesReducer(undefined, setLastPollTimestamp(ts));
      expect(state.lastPollTimestamp).toBe(ts);
    });
  });
});
