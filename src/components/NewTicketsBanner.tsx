"use client";

import { useAppSelector, useAppDispatch } from "@/store";
import { clearPendingNewTickets } from "@/store/liveUpdatesSlice";
import { Ticket } from "@/types/ticket";
import { ArrowUp } from "lucide-react";

interface NewTicketsBannerProps {
  onShowNewTickets: (newTickets: Ticket[]) => void;
}

export function NewTicketsBanner({ onShowNewTickets }: NewTicketsBannerProps) {
  const dispatch = useAppDispatch();
  const { pendingNewTickets } = useAppSelector((state) => state.liveUpdates);

  if (pendingNewTickets.length === 0) return null;

  const count = pendingNewTickets.length;
  const label = `${count} new ticket${count > 1 ? "s" : ""} — show`;

  const handleClick = () => {
    onShowNewTickets(pendingNewTickets);
    dispatch(clearPendingNewTickets());
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="sticky top-14 z-30 flex justify-center py-2">
      <button
        onClick={handleClick}
        className="flex items-center gap-2 rounded-full border border-blue-600 bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white shadow-md transition-all hover:bg-blue-700 active:scale-95"
      >
        <ArrowUp className="h-3.5 w-3.5" />
        <span>{label}</span>
      </button>
    </div>
  );
}
