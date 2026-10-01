import { NextRequest, NextResponse } from "next/server";

export function shouldBypassChaos(req?: NextRequest): boolean {
  if (process.env.DISABLE_CHAOS === "true" || process.env.NODE_ENV === "test") {
    return true;
  }
  if (req && (req.headers.get("x-bypass-chaos") === "1" || req.headers.get("x-test-bypass") === "1")) {
    return true;
  }
  return false;
}

export async function applySimulatedLatency(req?: NextRequest): Promise<void> {
  if (shouldBypassChaos(req)) {
    return;
  }
  // Random delay between 300ms and 1500ms
  const delayMs = Math.floor(Math.random() * 1200) + 300;
  await new Promise((resolve) => setTimeout(resolve, delayMs));
}

export function checkSimulatedServerError(req?: NextRequest): NextResponse | null {
  if (shouldBypassChaos(req)) {
    return null;
  }
  // About 1 in 10 requests fails with 500 error (10%)
  if (Math.random() < 0.1) {
    return NextResponse.json(
      { error: "Internal Server Error (Simulated transient failure)" },
      { status: 500 }
    );
  }
  return null;
}

export function checkSimulatedClaimConflict(req?: NextRequest): NextResponse | null {
  if (shouldBypassChaos(req)) {
    return null;
  }
  // About 1 in 4 claim attempts fails with 409 (25%)
  if (Math.random() < 0.25) {
    return NextResponse.json(
      { error: "Conflict: Another agent claimed this ticket first." },
      { status: 409 }
    );
  }
  return null;
}
