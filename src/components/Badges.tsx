import { Priority, Status, CustomerPlan } from "@/types/ticket";

export function PriorityBadge({
  priority,
  aiPriority,
}: {
  priority: Priority | string;
  aiPriority?: Priority | string;
}) {
  const styles: Record<string, string> = {
    P0: "bg-red-100 text-red-800 border-red-200 font-bold",
    P1: "bg-amber-100 text-amber-800 border-amber-200 font-semibold",
    P2: "bg-blue-50 text-blue-700 border-blue-200",
    P3: "bg-neutral-100 text-neutral-700 border-neutral-200",
    P5: "bg-purple-50 text-purple-700 border-purple-200 line-through",
  };

  const styleClass = styles[priority] || "bg-neutral-100 text-neutral-700 border-neutral-200";

  return (
    <div className="inline-flex items-center gap-1">
      <span
        className={`inline-flex items-center rounded border px-1.5 py-0.5 text-2xs font-mono font-medium ${styleClass}`}
      >
        {priority}
      </span>
      {aiPriority && aiPriority !== priority && (
        <span
          className="text-3xs text-neutral-400"
          title={`AI originally suggested ${aiPriority}`}
        >
          (AI: {aiPriority})
        </span>
      )}
    </div>
  );
}

export function StatusBadge({ status }: { status: Status | string }) {
  const styles: Record<string, { bg: string; dot: string; label: string }> = {
    open: {
      bg: "bg-blue-50 text-blue-700 border-blue-200",
      dot: "bg-blue-500",
      label: "Open",
    },
    in_progress: {
      bg: "bg-amber-50 text-amber-800 border-amber-200",
      dot: "bg-amber-500",
      label: "In Progress",
    },
    resolved: {
      bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
      dot: "bg-emerald-500",
      label: "Resolved",
    },
    closed: {
      bg: "bg-neutral-100 text-neutral-600 border-neutral-200",
      dot: "bg-neutral-400",
      label: "Closed",
    },
  };

  const item = styles[status] || {
    bg: "bg-neutral-100 text-neutral-600 border-neutral-200",
    dot: "bg-neutral-400",
    label: status,
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-2xs font-medium ${item.bg}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${item.dot}`} />
      <span>{item.label}</span>
    </span>
  );
}

export function PlanBadge({ plan }: { plan: CustomerPlan | string }) {
  const styles: Record<string, string> = {
    enterprise: "bg-purple-50 text-purple-700 border-purple-200 font-semibold",
    platinum: "bg-indigo-50 text-indigo-700 border-indigo-200 font-semibold",
    pro: "bg-sky-50 text-sky-700 border-sky-200",
    free: "bg-neutral-50 text-neutral-600 border-neutral-200",
  };

  const styleClass = styles[plan.toLowerCase()] || "bg-neutral-50 text-neutral-600 border-neutral-200";

  return (
    <span
      className={`inline-flex items-center rounded border px-1.5 py-0.2 text-2xs uppercase tracking-wider ${styleClass}`}
    >
      {plan}
    </span>
  );
}

export function CategoryBadge({ category }: { category: string }) {
  const formatted = category.replace(/_/g, " ");
  return (
    <span className="inline-flex items-center text-xs text-neutral-600 capitalize">
      {formatted}
    </span>
  );
}
