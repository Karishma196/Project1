import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BulkActionBar } from "./BulkActionBar";
import { Provider } from "react-redux";
import { makeStore } from "@/store";

describe("BulkActionBar Component", () => {
  let store: ReturnType<typeof makeStore>;

  beforeEach(() => {
    store = makeStore();
    vi.restoreAllMocks();
  });

  it("does not render when no tickets are selected", () => {
    const { container } = render(
      <Provider store={store}>
        <BulkActionBar
          selectedIds={[]}
          onClearSelection={vi.fn()}
          onTicketsUpdated={vi.fn()}
        />
      </Provider>
    );

    expect(container.firstChild).toBeNull();
  });

  it("displays correct count of selected tickets", () => {
    render(
      <Provider store={store}>
        <BulkActionBar
          selectedIds={["T-3001", "T-3002", "T-3003"]}
          onClearSelection={vi.fn()}
          onTicketsUpdated={vi.fn()}
        />
      </Provider>
    );

    expect(screen.getByText("3 tickets selected")).toBeInTheDocument();
    expect(screen.getByText("Claim all")).toBeInTheDocument();
  });

  it("handles partial failure during bulk claiming", async () => {
    const onTicketsUpdatedMock = vi.fn();

    // Mock fetch: T-3001 succeeds, T-3002 fails with 409 conflict
    globalThis.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes("T-3001")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              external_id: "T-3001",
              assigned_to: "agent-1",
              status: "in_progress",
            }),
        });
      }
      return Promise.resolve({
        ok: false,
        status: 409,
        json: () => Promise.resolve({ error: "Conflict: Already claimed" }),
      });
    });

    render(
      <Provider store={store}>
        <BulkActionBar
          selectedIds={["T-3001", "T-3002"]}
          onClearSelection={vi.fn()}
          onTicketsUpdated={onTicketsUpdatedMock}
        />
      </Provider>
    );

    const claimBtn = screen.getByText("Claim all");
    fireEvent.click(claimBtn);

    await waitFor(() => {
      expect(screen.getByText("1 succeeded")).toBeInTheDocument();
      expect(screen.getByText(/1 failed/)).toBeInTheDocument();
    });

    // onTicketsUpdated called only with the 1 successful ticket
    expect(onTicketsUpdatedMock).toHaveBeenCalledWith([
      expect.objectContaining({ external_id: "T-3001" }),
    ]);
  });
});
