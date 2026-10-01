"use client";

import { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { addPendingNewTickets, setLastPollTimestamp } from "@/store/liveUpdatesSlice";
import { fetchMetrics } from "@/store/metricsSlice";
import { Ticket, UpdatesApiResponse } from "@/types/ticket";

// Custom event name for dispatching in-place updates of existing tickets
export const TICKET_UPDATED_EVENT = "supportops:ticket_updated";

export function LiveUpdatesManager() {
  const dispatch = useAppDispatch();
  const { selectedAgentId } = useAppSelector((state) => state.agent);
  const lastPollTimeRef = useRef<string>(new Date(Date.now() - 5000).toISOString());
  const isPollingRef = useRef(false);

  useEffect(() => {
    // Polling interval: 7 seconds
    const interval = setInterval(async () => {
      if (isPollingRef.current) return;
      isPollingRef.current = true;

      try {
        const since = lastPollTimeRef.current;
        const res = await fetch(
          `/api/tickets/updates?since=${encodeURIComponent(since)}`
        );

        if (res.ok) {
          const data: UpdatesApiResponse = await res.json();
          lastPollTimeRef.current = data.server_time;
          dispatch(setLastPollTimestamp(data.server_time));

          if (data.updated_tickets && data.updated_tickets.length > 0) {
            const newlyCreated: Ticket[] = [];
            const modifiedExisting: Ticket[] = [];

            for (const ticket of data.updated_tickets) {
              const createdMs = new Date(ticket.created_at).getTime();
              const sinceMs = new Date(since).getTime();

              if (createdMs >= sinceMs) {
                newlyCreated.push(ticket);
              } else {
                modifiedExisting.push(ticket);
              }
            }

            // Buffer newly created tickets for the "N new tickets — show" banner
            if (newlyCreated.length > 0) {
              dispatch(addPendingNewTickets(newlyCreated));
            }

            // Dispatch event for existing tickets updated in-place (claims, status moves)
            if (modifiedExisting.length > 0 && typeof window !== "undefined") {
              window.dispatchEvent(
                new CustomEvent(TICKET_UPDATED_EVENT, {
                  detail: modifiedExisting,
                })
              );
            }

            // Keep header counters strictly in sync with server state
            if (selectedAgentId) {
              dispatch(fetchMetrics(selectedAgentId));
            }
          }
        }
      } catch {
        // Silently tolerate background poll network errors
      } finally {
        isPollingRef.current = false;
      }
    }, 7000);

    return () => clearInterval(interval);
  }, [dispatch, selectedAgentId]);

  return null;
}
