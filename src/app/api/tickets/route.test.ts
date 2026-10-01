import { describe, it, expect, beforeEach } from "vitest";
import { GET as getTickets } from "./route";
import { POST as claimTicket } from "./[id]/claim/route";
import { PATCH as updateTriage } from "./[id]/triage/route";
import { NextRequest } from "next/server";
import { ticketStore } from "@/lib/server/ticketStore";

describe("API Route Handlers Integration", () => {
  beforeEach(() => {
    ticketStore.reset();
  });

  it("GET /api/tickets returns paginated filtered tickets with bypass header", async () => {
    const req = new NextRequest("http://localhost:3000/api/tickets?status=open&priority=P0", {
      headers: { "x-bypass-chaos": "1" },
    });

    const res = await getTickets(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.tickets).toBeDefined();
    expect(Array.isArray(data.tickets)).toBe(true);
    expect(data.total).toBeGreaterThanOrEqual(1);

    for (const ticket of data.tickets) {
      expect(ticket.status).toBe("open");
      expect(ticket.priority).toBe("P0");
    }
  });

  it("POST /api/tickets/:id/claim returns 409 when claimed by another agent", async () => {
    // First claim succeeds
    const req1 = new NextRequest("http://localhost:3000/api/tickets/T-2001/claim", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-bypass-chaos": "1",
      },
      body: JSON.stringify({ agent_id: "agent-1" }),
    });

    const res1 = await claimTicket(req1, {
      params: Promise.resolve({ id: "T-2001" }),
    });
    expect(res1.status).toBe(200);

    // Second claim by agent-2 fails with 409 Conflict
    const req2 = new NextRequest("http://localhost:3000/api/tickets/T-2001/claim", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-bypass-chaos": "1",
      },
      body: JSON.stringify({ agent_id: "agent-2" }),
    });

    const res2 = await claimTicket(req2, {
      params: Promise.resolve({ id: "T-2001" }),
    });
    expect(res2.status).toBe(409);
    const err = await res2.json();
    expect(err.error).toContain("Conflict");
  });

  it("PATCH /api/tickets/:id/triage rejects enterprise ticket downgrade to P2/P3", async () => {
    const req = new NextRequest("http://localhost:3000/api/tickets/T-2001/triage", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-bypass-chaos": "1",
      },
      body: JSON.stringify({
        priority: "P3",
        reason: "Downgrading priority because user was unresponsive",
      }),
    });

    const res = await updateTriage(req, {
      params: Promise.resolve({ id: "T-2001" }),
    });
    expect(res.status).toBe(400);

    const err = await res.json();
    expect(err.error).toContain("Enterprise tickets must always stay at least P1");
  });
});
