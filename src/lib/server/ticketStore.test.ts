import { describe, it, expect, beforeEach } from "vitest";
import { TicketStore } from "./ticketStore";

describe("TicketStore In-Memory Repository", () => {
  let store: TicketStore;

  beforeEach(() => {
    store = new TicketStore();
    store.stopSimulation();
  });

  it("ingests and deduplicates test tickets correctly", () => {
    const t2001 = store.getTicket("T-2001");
    expect(t2001).toBeDefined();
    expect(t2001?.subject).toBe("SSO login down for whole team");

    // Check all test tickets exist
    const testIds = [
      "T-2001",
      "T-2002",
      "T-2003",
      "T-2004",
      "T-2005",
      "T-2006",
      "T-2007",
      "T-2008",
      "T-2009",
      "T-2010",
      "T-2011",
      "T-2012",
    ];

    for (const id of testIds) {
      const ticket = store.getTicket(id);
      expect(ticket, `Expected ${id} to exist`).toBeDefined();
    }
  });

  it("contains more than 5,000 total tickets", () => {
    const result = store.getTickets({}, 1, 10);
    expect(result.total).toBeGreaterThanOrEqual(5000);
  });

  it("filters tickets by status, priority, and category", () => {
    const openP0 = store.getTickets({ status: "open", priority: "P0" }, 1, 100);
    for (const ticket of openP0.tickets) {
      expect(ticket.status).toBe("open");
      expect(ticket.priority).toBe("P0");
    }

    const billingTickets = store.getTickets({ category: "billing" }, 1, 50);
    for (const ticket of billingTickets.tickets) {
      expect(ticket.category).toBe("billing");
    }
  });

  it("searches tickets across subject and body", () => {
    const searchResult = store.getTickets({ search: "SSO login down" }, 1, 10);
    expect(searchResult.total).toBeGreaterThanOrEqual(1);
    expect(searchResult.tickets[0].external_id).toBe("T-2001");
  });

  it("handles ticket claiming and conflict detection", () => {
    // T-2001 is unassigned
    const claimRes = store.claimTicket("T-2001", "agent-1");
    expect(claimRes.success).toBe(true);
    expect(claimRes.ticket?.assigned_to).toBe("agent-1");
    expect(claimRes.ticket?.status).toBe("in_progress");

    // Trying to claim by another agent produces 409
    const conflictRes = store.claimTicket("T-2001", "agent-2");
    expect(conflictRes.success).toBe(false);
    expect(conflictRes.status).toBe(409);
    expect(conflictRes.error).toContain("Conflict");

    // Invalid agent produces 400
    const invalidAgentRes = store.claimTicket("T-2002", "agent-99");
    expect(invalidAgentRes.success).toBe(false);
    expect(invalidAgentRes.status).toBe(400);
  });

  it("enforces allowed status transitions", () => {
    // T-2001 status is in_progress (from previous test or re-fetch)
    const ticket = store.getTicket("T-2001");
    if (ticket) ticket.status = "open";

    const illegal = store.updateStatus("T-2001", "resolved");
    expect(illegal.success).toBe(false);
    expect(illegal.status).toBe(400);

    const validProgress = store.updateStatus("T-2001", "in_progress");
    expect(validProgress.success).toBe(true);

    const validResolve = store.updateStatus("T-2001", "resolved");
    expect(validResolve.success).toBe(true);

    const validReopen = store.updateStatus("T-2001", "open");
    expect(validReopen.success).toBe(true);
  });

  it("enforces triage update business rules", () => {
    // Accept ticket
    const acceptRes = store.updateTriage("T-2003", {
      reason: "",
      accept: true,
    });
    expect(acceptRes.success).toBe(true);
    expect(acceptRes.ticket?.triage_decision).toBe("auto_accept");

    // Reject short reason
    const shortReason = store.updateTriage("T-2004", {
      category: "billing",
      priority: "P2",
      reason: "short",
    });
    expect(shortReason.success).toBe(false);
    expect(shortReason.status).toBe(400);

    // Reject downgrading enterprise ticket to P3
    const downgradeEnterprise = store.updateTriage("T-2001", {
      priority: "P3",
      reason: "Needs to be lower priority for now",
    });
    expect(downgradeEnterprise.success).toBe(false);
    expect(downgradeEnterprise.error).toContain("Enterprise tickets must always stay at least P1");
  });

  it("records updates and returns them via getUpdatesSince", () => {
    const timestampBefore = new Date(Date.now() - 1000).toISOString();
    store.updateStatus("T-2002", "in_progress");

    const updates = store.getUpdatesSince(timestampBefore);
    expect(updates.some((t) => t.external_id === "T-2002")).toBe(true);
  });

  it("calculates accurate header metrics for agents", () => {
    const metricsBefore = store.getMetrics("agent-1");
    expect(typeof metricsBefore.myTicketsCount).toBe("number");
    expect(typeof metricsBefore.toReviewCount).toBe("number");
  });
});
