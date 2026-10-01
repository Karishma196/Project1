"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store";
import { setAllFilters, resetFilters } from "@/store/filterSlice";
import { Search, RotateCcw, Filter } from "lucide-react";

export function TicketFiltersBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const currentFilters = useAppSelector((state) => state.filters);
  const [, startTransition] = useTransition();

  // Local state for search input to decouple keypresses from URL/Redux updates
  const [searchInput, setSearchInput] = useState(
    searchParams.get("search") || currentFilters.search || ""
  );

  // Sync from URL search params into Redux on initial mount or back/forward navigation
  useEffect(() => {
    const status = searchParams.get("status") || "all";
    const priority = searchParams.get("priority") || "all";
    const category = searchParams.get("category") || "all";
    const decision = searchParams.get("triage_decision") || "all";
    const search = searchParams.get("search") || "";

    dispatch(
      setAllFilters({
        status,
        priority,
        category,
        triage_decision: decision,
        search,
      })
    );
    setSearchInput(search);
  }, [searchParams, dispatch]);

  // Synchronize state changes to URL
  const updateUrl = (updated: {
    status?: string;
    priority?: string;
    category?: string;
    triage_decision?: string;
    search?: string;
  }) => {
    const params = new URLSearchParams(searchParams.toString());

    const next = {
      status: updated.status ?? currentFilters.status,
      priority: updated.priority ?? currentFilters.priority,
      category: updated.category ?? currentFilters.category,
      triage_decision: updated.triage_decision ?? currentFilters.triage_decision,
      search: updated.search ?? currentFilters.search,
    };

    if (next.status && next.status !== "all") params.set("status", next.status);
    else params.delete("status");

    if (next.priority && next.priority !== "all") params.set("priority", next.priority);
    else params.delete("priority");

    if (next.category && next.category !== "all") params.set("category", next.category);
    else params.delete("category");

    if (next.triage_decision && next.triage_decision !== "all")
      params.set("triage_decision", next.triage_decision);
    else params.delete("triage_decision");

    if (next.search && next.search.trim()) params.set("search", next.search.trim());
    else params.delete("search");

    // Reset pagination to page 1 on filter/search change
    params.delete("page");

    dispatch(setAllFilters(next));

    startTransition(() => {
      router.replace(`?${params.toString()}`, { scroll: false });
    });
  };

  // Debounce search input: 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== currentFilters.search) {
        updateUrl({ search: searchInput });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSelectChange = (
    key: "status" | "priority" | "category" | "triage_decision",
    value: string
  ) => {
    updateUrl({ [key]: value });
  };

  const handleReset = () => {
    setSearchInput("");
    dispatch(resetFilters());
    startTransition(() => {
      router.replace(window.location.pathname, { scroll: false });
    });
  };

  const hasActiveFilters =
    currentFilters.status !== "all" ||
    currentFilters.priority !== "all" ||
    currentFilters.category !== "all" ||
    currentFilters.triage_decision !== "all" ||
    Boolean(currentFilters.search);

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-neutral-200 bg-white p-3 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-2">
        {/* Search Input with Debounce */}
        <div className="relative min-w-[220px] flex-1 max-w-md">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search tickets by subject, body, or ID..."
            className="h-8.5 w-full rounded-md border border-neutral-300 bg-white pl-8 pr-3 text-xs text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-hidden"
          />
        </div>

        {/* Reset Button */}
        {hasActiveFilters && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
            title="Reset all filters"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset filters</span>
          </button>
        )}
      </div>

      {/* Filter Selects */}
      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-neutral-100 text-xs">
        <div className="flex items-center gap-1 text-neutral-500 mr-1 font-medium">
          <Filter className="h-3 w-3" />
          <span>Filters:</span>
        </div>

        {/* Status */}
        <select
          value={currentFilters.status}
          onChange={(e) => handleSelectChange("status", e.target.value)}
          aria-label="Filter by Status"
          className="h-7.5 rounded-md border border-neutral-200 bg-neutral-50/70 px-2 text-xs text-neutral-700 hover:bg-neutral-100 focus:border-neutral-900 focus:outline-hidden"
        >
          <option value="all">Status: All</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>

        {/* Priority */}
        <select
          value={currentFilters.priority}
          onChange={(e) => handleSelectChange("priority", e.target.value)}
          aria-label="Filter by Priority"
          className="h-7.5 rounded-md border border-neutral-200 bg-neutral-50/70 px-2 text-xs text-neutral-700 hover:bg-neutral-100 focus:border-neutral-900 focus:outline-hidden"
        >
          <option value="all">Priority: All</option>
          <option value="P0">P0 (Critical)</option>
          <option value="P1">P1 (High)</option>
          <option value="P2">P2 (Medium)</option>
          <option value="P3">P3 (Low)</option>
        </select>

        {/* Category */}
        <select
          value={currentFilters.category}
          onChange={(e) => handleSelectChange("category", e.target.value)}
          aria-label="Filter by Category"
          className="h-7.5 rounded-md border border-neutral-200 bg-neutral-50/70 px-2 text-xs text-neutral-700 hover:bg-neutral-100 focus:border-neutral-900 focus:outline-hidden"
        >
          <option value="all">Category: All</option>
          <option value="account_access">Account Access</option>
          <option value="billing">Billing</option>
          <option value="bug">Bug</option>
          <option value="feature_request">Feature Request</option>
          <option value="other">Other</option>
        </select>

        {/* AI Decision */}
        <select
          value={currentFilters.triage_decision}
          onChange={(e) => handleSelectChange("triage_decision", e.target.value)}
          aria-label="Filter by AI Decision"
          className="h-7.5 rounded-md border border-neutral-200 bg-neutral-50/70 px-2 text-xs text-neutral-700 hover:bg-neutral-100 focus:border-neutral-900 focus:outline-hidden"
        >
          <option value="all">AI Triage: All</option>
          <option value="auto_accept">Auto Accepted</option>
          <option value="manual_review">Needs Review</option>
        </select>
      </div>
    </div>
  );
}
