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
  const since = searchParams.get("since");

  if (!since) {
    return NextResponse.json(
      { error: "Query parameter 'since' is required." },
      { status: 400 }
    );
  }

  const updatedTickets = ticketStore.getUpdatesSince(since);

  return NextResponse.json({
    updated_tickets: updatedTickets,
    server_time: new Date().toISOString(),
  });
}
