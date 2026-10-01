"use client";

import { useState } from "react";
import { useAppSelector, useAppDispatch } from "@/store";
import { incrementMyTickets } from "@/store/metricsSlice";
import { Status, Ticket } from "@/types/ticket";
import { CheckSquare, X, Check, AlertCircle, Loader2 } from "lucide-react";

interface BulkActionBarProps {
  selectedIds: string[];
  onClearSelection: () => void;
  onTicketsUpdated: (updatedTickets: Ticket[]) => void;
}

interface ActionResult {
  id: string;
  success: boolean;
  error?: string;
}

export function BulkActionBar({
  selectedIds,
  onClearSelection,
  onTicketsUpdated,
}: BulkActionBarProps) {
  const dispatch = useAppDispatch();
  const { selectedAgentId } = useAppSelector((state) => state.agent);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<ActionResult[] | null>(null);

  if (selectedIds.length === 0) return null;

  const handleBulkClaim = async () => {
    setIsProcessing(true);
    setResults(null);
    const actionResults: ActionResult[] = [];
    const successfulTickets: Ticket[] = [];

    for (const id of selectedIds) {
      try {
        const res = await fetch(`/api/tickets/${id}/claim`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ agent_id: selectedAgentId }),
        });

        if (res.ok) {
          const updated = await res.json();
          successfulTickets.push(updated);
          actionResults.push({ id, success: true });
          dispatch(incrementMyTickets());
        } else {
          const err = await res.json().catch(() => ({}));
          actionResults.push({
            id,
            success: false,
            error: err.error || `HTTP ${res.status}`,
          });
        }
      } catch {
        actionResults.push({
          id,
          success: false,
          error: "Network error",
        });
      }
    }

    setIsProcessing(false);
    setResults(actionResults);
    if (successfulTickets.length > 0) {
      onTicketsUpdated(successfulTickets);
    }
  };

  const handleBulkStatus = async (nextStatus: Status) => {
    setIsProcessing(true);
    setResults(null);
    const actionResults: ActionResult[] = [];
    const successfulTickets: Ticket[] = [];

    for (const id of selectedIds) {
      try {
        const res = await fetch(`/api/tickets/${id}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: nextStatus }),
        });

        if (res.ok) {
          const updated = await res.json();
          successfulTickets.push(updated);
          actionResults.push({ id, success: true });
        } else {
          const err = await res.json().catch(() => ({}));
          actionResults.push({
            id,
            success: false,
            error: err.error || `HTTP ${res.status}`,
          });
        }
      } catch {
        actionResults.push({
          id,
          success: false,
          error: "Network error",
        });
      }
    }

    setIsProcessing(false);
    setResults(actionResults);
    if (successfulTickets.length > 0) {
      onTicketsUpdated(successfulTickets);
    }
  };

  const successCount = results ? results.filter((r) => r.success).length : 0;
  const failureCount = results ? results.filter((r) => !r.success).length : 0;

  return (
    <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 w-[92%] max-w-xl rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-2.5 text-white shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Selected count */}
        <div className="flex items-center gap-2 text-xs font-medium">
          <CheckSquare className="h-4 w-4 text-blue-400" />
          <span>{selectedIds.length} tickets selected</span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={handleBulkClaim}
            disabled={isProcessing}
            className="flex items-center gap-1 rounded bg-blue-600 px-2.5 py-1 font-medium text-white hover:bg-blue-500 disabled:opacity-50"
          >
            {isProcessing && <Loader2 className="h-3 w-3 animate-spin" />}
            <span>Claim all</span>
          </button>

          <select
            onChange={(e) => {
              if (e.target.value) {
                handleBulkStatus(e.target.value as Status);
                e.target.value = "";
              }
            }}
            defaultValue=""
            disabled={isProcessing}
            className="rounded border border-neutral-700 bg-neutral-800 px-2 py-1 text-xs text-white focus:outline-hidden"
          >
            <option value="" disabled>
              Set status...
            </option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>

          <button
            onClick={onClearSelection}
            disabled={isProcessing}
            className="p-1 text-neutral-400 hover:text-white"
            title="Cancel selection"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Partial Failure / Success Results Banner */}
      {results && (
        <div className="mt-2 border-t border-neutral-800 pt-2 text-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-emerald-400">
                <Check className="h-3 w-3" />
                {successCount} succeeded
              </span>
              {failureCount > 0 && (
                <span className="flex items-center gap-1 text-rose-400">
                  <AlertCircle className="h-3 w-3" />
                  {failureCount} failed (kept original state)
                </span>
              )}
            </div>
            <button
              onClick={() => setResults(null)}
              className="text-neutral-400 hover:text-white underline"
            >
              Dismiss
            </button>
          </div>
          {failureCount > 0 && (
            <div className="mt-1 max-h-20 overflow-y-auto space-y-0.5 text-neutral-400 font-mono text-3xs">
              {results
                .filter((r) => !r.success)
                .map((f) => (
                  <div key={f.id} className="text-rose-300">
                    {f.id}: {f.error}
                  </div>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
