import { NextRequest, NextResponse } from "next/server";
import { ticketStore } from "@/lib/server/ticketStore";
import {
  applySimulatedLatency,
  checkSimulatedServerError,
} from "@/lib/server/chaos";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await applySimulatedLatency(req);
  const errorResponse = checkSimulatedServerError(req);
  if (errorResponse) return errorResponse;

  // Verify server-side secret key exists
  const serverKey = process.env.TRIAGE_API_KEY;
  if (!serverKey) {
    return NextResponse.json(
      { error: "Server configuration error: Missing TRIAGE_API_KEY." },
      { status: 500 }
    );
  }

  const { id } = await params;
  const result = ticketStore.retriageTicket(id);

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json(result.ticket);
}
