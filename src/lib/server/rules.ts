import { Priority, Status, VALID_AGENTS, CustomerPlan } from "@/types/ticket";

export const ALLOWED_STATUS_TRANSITIONS: Record<Status, Status[]> = {
  open: ["in_progress"],
  in_progress: ["resolved", "open"],
  resolved: ["open", "closed"],
  closed: ["open"],
};

export function isValidAgent(agentId: string): boolean {
  return VALID_AGENTS.some((agent) => agent.id === agentId);
}

export function validateStatusTransition(
  currentStatus: Status,
  nextStatus: Status
): { valid: boolean; error?: string } {
  if (currentStatus === nextStatus) {
    return { valid: true };
  }

  const allowed = ALLOWED_STATUS_TRANSITIONS[currentStatus] || [];
  if (!allowed.includes(nextStatus)) {
    return {
      valid: false,
      error: `Invalid status transition from "${currentStatus}" to "${nextStatus}". Allowed transitions: ${allowed.join(", ") || "none"}.`,
    };
  }

  return { valid: true };
}

export function validateEnterprisePriority(
  plan: CustomerPlan | string,
  priority: Priority | string
): { valid: boolean; error?: string } {
  if (plan === "enterprise" && (priority === "P2" || priority === "P3" || priority === "P4" || priority === "P5")) {
    return {
      valid: false,
      error: "Enterprise tickets must always stay at least P1.",
    };
  }
  return { valid: true };
}

export function validateTriageUpdate(params: {
  plan: CustomerPlan | string;
  newPriority?: Priority | string;
  reason?: string;
}): { valid: boolean; error?: string } {
  if (!params.reason || params.reason.trim().length < 10) {
    return {
      valid: false,
      error: "A written reason of at least 10 characters is required.",
    };
  }

  if (params.newPriority) {
    const enterpriseCheck = validateEnterprisePriority(params.plan, params.newPriority);
    if (!enterpriseCheck.valid) {
      return enterpriseCheck;
    }
  }

  return { valid: true };
}
