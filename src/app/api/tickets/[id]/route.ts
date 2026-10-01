import { NextRequest, NextResponse } from "next/server";
import { ticketStore } from "@/lib/server/ticketStore";
import {
  applySimulatedLatency,
  checkSimulatedServerError,
} from "@/lib/server/chaos";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await applySimulatedLatency(req);
  const errorResponse = checkSimulatedServerError(req);
  if (errorResponse) return errorResponse;

  const { id } = await params;
  const ticket = ticketStore.getTicket(id);

  if (!ticket) {
    return NextResponse.json({ error: "Ticket not found." }, { status: 404 });
  }

  return NextResponse.json(ticket);
}
