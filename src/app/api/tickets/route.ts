import { NextRequest, NextResponse } from "next/server";
import { ticketStore } from "@/lib/server/ticketStore";
import {
  applySimulatedLatency,
  checkSimulatedServerError,
} from "@/lib/server/chaos";

export async function GET(req: NextRequest) {
  await applySimulatedLatency(req);
  const errorResponse = checkSimulatedServerError(req);
  if (errorResponse) return errorResponse;

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "50", 10);

  const filters = {
    status: searchParams.get("status") || undefined,
    priority: searchParams.get("priority") || undefined,
    category: searchParams.get("category") || undefined,
    triage_decision: searchParams.get("triage_decision") || undefined,
    search: searchParams.get("search") || undefined,
  };

  const data = ticketStore.getTickets(filters, page, limit);
  return NextResponse.json(data);
}
