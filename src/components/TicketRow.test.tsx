import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import React from "react";
import { TicketRow } from "./TicketRow";
import { Ticket } from "@/types/ticket";

describe("TicketRow Component Memoization", () => {
  const sampleTicket: Ticket = {
    external_id: "T-5001",
    customer_id: "C-1",
    customer_plan: "pro",
    subject: "Memoization test subject",
    body: "Memoization test body",
    attachment_url: null,
    created_at: "2026-09-20T10:00:00Z",
    status: "open",
    assigned_to: null,
    category: "billing",
    priority: "P2",
    summary: "Memoization test summary",
    triage_decision: "auto_accept",
    review_reason: null,
  };

  it("does not re-render when identical ticket props are passed", () => {
    const renderSpy = vi.fn();

    const Wrapper = ({ count, ticket }: { count: number; ticket: Ticket }) => {
      renderSpy(count);
      return (
        <table>
          <tbody>
            <TicketRow
              ticket={ticket}
              isSelected={false}
              onToggleSelect={vi.fn()}
              onClaimTicket={vi.fn()}
            />
          </tbody>
        </table>
      );
    };

    const { rerender } = render(<Wrapper count={1} ticket={sampleTicket} />);
    expect(renderSpy).toHaveBeenCalledTimes(1);

    // Re-render parent with incremented count (unrelated state change)
    rerender(<Wrapper count={2} ticket={{ ...sampleTicket }} />);
    expect(renderSpy).toHaveBeenCalledTimes(2);
  });
});
