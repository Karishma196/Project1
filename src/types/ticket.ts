export type Priority = "P0" | "P1" | "P2" | "P3";

export type Status = "open" | "in_progress" | "resolved" | "closed";

export type StandardCategory =
  | "account_access"
  | "billing"
  | "bug"
  | "feature_request"
  | "other";

export type CustomerPlan = "free" | "pro" | "enterprise" | "platinum";

export type TriageDecision = "auto_accept" | "manual_review" | "maybe";

export interface Agent {
  id: string;
  name: string;
}

export const VALID_AGENTS: Agent[] = [
  { id: "agent-1", name: "Priya" },
  { id: "agent-2", name: "Rahul" },
  { id: "agent-3", name: "Meera" },
];

export interface Ticket {
  external_id: string;
  customer_id: string;
  customer_plan: CustomerPlan | string;
  subject: string;
  body: string | null;
  attachment_url: string | null;
  created_at: string;
  status: Status;
  assigned_to: string | null;
  category: StandardCategory | string;
  priority: Priority | string;
  ai_priority?: Priority | string;
  summary: string | null;
  triage_decision: TriageDecision | string;
  review_reason: string | null;
  updated_at?: string;
}

export interface TicketFilters {
  status: string;
  priority: string;
  category: string;
  triage_decision: string;
  search: string;
}

export interface TicketsApiResponse {
  tickets: Ticket[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UpdatesApiResponse {
  updated_tickets: Ticket[];
  server_time: string;
}
