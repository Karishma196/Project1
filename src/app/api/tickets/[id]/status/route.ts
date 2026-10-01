import { NextRequest, NextResponse } from "next/server";
import { ticketStore } from "@/lib/server/ticketStore";
import {
  applySimulatedLatency,
  checkSimulatedServerError,
} from "@/lib/server/chaos";
import { Status } from "@/types/ticket";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await applySimulatedLatency(req);
  const errorResponse = checkSimulatedServerError(req);
  if (errorResponse) return errorResponse;

  const { id } = await params;
  let body: { status?: Status } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!body.status) {
    return NextResponse.json({ error: "Missing required status field." }, { status: 400 });
  }

  const result = ticketStore.updateStatus(id, body.status);
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json(result.ticket);
}
