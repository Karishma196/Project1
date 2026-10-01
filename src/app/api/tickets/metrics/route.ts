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
  const agentId = searchParams.get("agent_id") || "agent-1";

  const metrics = ticketStore.getMetrics(agentId);

  return NextResponse.json(metrics);
}
