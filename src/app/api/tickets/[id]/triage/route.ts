import { NextRequest, NextResponse } from "next/server";
import { ticketStore } from "@/lib/server/ticketStore";
import {
  applySimulatedLatency,
  checkSimulatedServerError,
} from "@/lib/server/chaos";
import { Priority, StandardCategory } from "@/types/ticket";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await applySimulatedLatency(req);
  const errorResponse = checkSimulatedServerError(req);
  if (errorResponse) return errorResponse;

  const { id } = await params;
  let body: {
    category?: StandardCategory | string;
    priority?: Priority | string;
    reason?: string;
    accept?: boolean;
  } = {};

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const result = ticketStore.updateTriage(id, {
    category: body.category,
    priority: body.priority,
    reason: body.reason || "",
    accept: body.accept,
  });

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json(result.ticket);
}
