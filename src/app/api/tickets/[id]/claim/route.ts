import { NextRequest, NextResponse } from "next/server";
import { ticketStore } from "@/lib/server/ticketStore";
import {
  applySimulatedLatency,
  checkSimulatedServerError,
  checkSimulatedClaimConflict,
} from "@/lib/server/chaos";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await applySimulatedLatency(req);
  const errorResponse = checkSimulatedServerError(req);
  if (errorResponse) return errorResponse;

  const conflictResponse = checkSimulatedClaimConflict(req);
  if (conflictResponse) return conflictResponse;

  const { id } = await params;
  let body: { agent_id?: string } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!body.agent_id) {
    return NextResponse.json({ error: "Missing required agent_id." }, { status: 400 });
  }

  const result = ticketStore.claimTicket(id, body.agent_id);
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json(result.ticket);
}
