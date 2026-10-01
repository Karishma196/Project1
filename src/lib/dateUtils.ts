export function parseTolerantDate(dateStr: string): Date {
  if (!dateStr) return new Date();

  // If format is "YYYY-MM-DD HH:MM:SS" without T or Z (like test ticket T-2007)
  let normalized = dateStr.trim();
  if (/^\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}$/.test(normalized)) {
    normalized = normalized.replace(" ", "T") + "Z";
  }

  const d = new Date(normalized);
  if (isNaN(d.getTime())) {
    return new Date();
  }
  return d;
}

export const SLA_DURATIONS_MS: Record<string, number> = {
  P0: 1 * 60 * 60 * 1000, // 1 hour
  P1: 4 * 60 * 60 * 1000, // 4 hours
  P2: 24 * 60 * 60 * 1000, // 24 hours
  P3: 72 * 60 * 60 * 1000, // 72 hours
};

export type DeadlineState = "late" | "at_risk" | "on_track" | "future";

export interface DeadlineInfo {
  state: DeadlineState;
  remainingMs: number;
  totalDurationMs: number;
  formattedCountdown: string;
}

export function calculateDeadlineInfo(
  createdAtStr: string,
  priority: string,
  nowMs: number = Date.now()
): DeadlineInfo {
  const createdDate = parseTolerantDate(createdAtStr);
  const createdMs = createdDate.getTime();
  const totalDurationMs = SLA_DURATIONS_MS[priority] || SLA_DURATIONS_MS.P2;
  const deadlineMs = createdMs + totalDurationMs;

  // Check if created_at is in the future (e.g. T-2008 created in 2027)
  if (createdMs > nowMs) {
    const untilStartMs = createdMs - nowMs;
    const hours = Math.floor(untilStartMs / (1000 * 60 * 60));
    return {
      state: "future",
      remainingMs: totalDurationMs,
      totalDurationMs,
      formattedCountdown: `Starts in ${hours > 24 ? `${Math.floor(hours / 24)}d` : `${hours}h`}`,
    };
  }

  const remainingMs = deadlineMs - nowMs;

  if (remainingMs <= 0) {
    const overdueMs = Math.abs(remainingMs);
    const mins = Math.floor(overdueMs / 60000);
    const hours = Math.floor(mins / 60);
    const formatted =
      hours > 0
        ? `${hours}h ${mins % 60}m overdue`
        : `${mins}m overdue`;

    return {
      state: "late",
      remainingMs,
      totalDurationMs,
      formattedCountdown: formatted,
    };
  }

  // At risk if less than 20% of total duration left
  const fractionLeft = remainingMs / totalDurationMs;
  const isAtRisk = fractionLeft < 0.2;

  const totalSecs = Math.floor(remainingMs / 1000);
  const hours = Math.floor(totalSecs / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);
  const secs = totalSecs % 60;

  let formatted = "";
  if (hours > 0) {
    formatted = `${hours}h ${mins}m ${secs}s`;
  } else if (mins > 0) {
    formatted = `${mins}m ${secs}s`;
  } else {
    formatted = `${secs}s`;
  }

  return {
    state: isAtRisk ? "at_risk" : "on_track",
    remainingMs,
    totalDurationMs,
    formattedCountdown: formatted,
  };
}

export function formatRelativeTime(dateStr: string): string {
  const d = parseTolerantDate(dateStr);
  const diffSecs = Math.floor((Date.now() - d.getTime()) / 1000);

  if (diffSecs < 0) {
    return "in the future";
  }
  if (diffSecs < 60) {
    return "just now";
  }
  const mins = Math.floor(diffSecs / 60);
  if (mins < 60) {
    return `${mins}m ago`;
  }
  const hours = Math.floor(mins / 60);
  if (hours < 24) {
    return `${hours}h ago`;
  }
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
