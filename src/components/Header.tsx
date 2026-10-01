"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { setSelectedAgent, initializeAgent } from "@/store/agentSlice";
import { fetchMetrics } from "@/store/metricsSlice";
import { VALID_AGENTS } from "@/types/ticket";
import { Ticket, Sparkles, User, RefreshCw } from "lucide-react";

export function Header() {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { selectedAgentId } = useAppSelector((state) => state.agent);
  const { myTicketsCount, toReviewCount, loading } = useAppSelector(
    (state) => state.metrics
  );

  // Initialize saved agent on mount
  useEffect(() => {
    dispatch(initializeAgent());
  }, [dispatch]);

  // Fetch metrics when selected agent changes
  useEffect(() => {
    if (selectedAgentId) {
      dispatch(fetchMetrics(selectedAgentId));
    }
  }, [dispatch, selectedAgentId]);

  const handleAgentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(setSelectedAgent(e.target.value));
  };

  const handleManualRefresh = () => {
    if (selectedAgentId) {
      dispatch(fetchMetrics(selectedAgentId));
    }
  };

  const isTicketsActive = pathname === "/tickets" || pathname.startsWith("/tickets/");
  const isReviewActive = pathname === "/review";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-200 bg-white shadow-xs">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
        {/* Brand / Logo */}
        <div className="flex items-center gap-6">
          <Link
            href="/tickets"
            className="flex items-center gap-2 text-base font-semibold tracking-tight text-neutral-900 hover:text-neutral-700"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-neutral-900 text-white">
              <Ticket className="h-4 w-4" />
            </div>
            <span>SupportOps</span>
          </Link>

          {/* Navigation Links */}
          <nav className="flex items-center gap-1">
            <Link
              href="/tickets"
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                isTicketsActive
                  ? "bg-neutral-100 text-neutral-900"
                  : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
              }`}
            >
              <span>Tickets</span>
            </Link>

            <Link
              href="/review"
              prefetch={true}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                isReviewActive
                  ? "bg-neutral-100 text-neutral-900"
                  : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>AI Review</span>
            </Link>
          </nav>
        </div>

        {/* Right side: Counters and Agent Selector */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Metrics Badges */}
          <div className="flex items-center gap-2">
            <div
              className="flex items-center gap-1.5 rounded-md border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-xs"
              title="Tickets currently assigned to you and not closed"
            >
              <span className="text-neutral-500">My tickets:</span>
              <span className="font-semibold text-neutral-900">
                {myTicketsCount}
              </span>
            </div>

            <div
              className="flex items-center gap-1.5 rounded-md border border-amber-200 bg-amber-50/70 px-2.5 py-1 text-xs"
              title="Tickets flagged for manual AI review"
            >
              <span className="text-amber-700">To review:</span>
              <span className="font-semibold text-amber-900">
                {toReviewCount}
              </span>
            </div>

            <button
              onClick={handleManualRefresh}
              disabled={loading}
              className="rounded-md p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 disabled:opacity-50"
              title="Refresh metrics counters"
              aria-label="Refresh metrics counters"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
              />
            </button>
          </div>

          {/* Agent Switcher Dropdown */}
          <div className="flex items-center gap-1.5 border-l border-neutral-200 pl-2 sm:pl-3">
            <User className="h-3.5 w-3.5 text-neutral-400" />
            <label htmlFor="agent-selector" className="sr-only">
              Current Agent
            </label>
            <select
              id="agent-selector"
              value={selectedAgentId}
              onChange={handleAgentChange}
              className="h-8 rounded-md border border-neutral-300 bg-white px-2 text-xs font-medium text-neutral-800 shadow-2xs focus:border-neutral-900 focus:outline-hidden"
            >
              {VALID_AGENTS.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.name} ({agent.id})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </header>
  );
}
