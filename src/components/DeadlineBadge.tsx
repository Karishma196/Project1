"use client";

import { useState, useEffect } from "react";
import { calculateDeadlineInfo, DeadlineState } from "@/lib/dateUtils";
import { Clock, AlertTriangle, CheckCircle2, Calendar } from "lucide-react";

interface DeadlineBadgeProps {
  createdAt: string;
  priority: string;
}

export function DeadlineBadge({ createdAt, priority }: DeadlineBadgeProps) {
  const [deadline, setDeadline] = useState(() =>
    calculateDeadlineInfo(createdAt, priority)
  );

  useEffect(() => {
    // Update every second to keep the countdown live
    const interval = setInterval(() => {
      setDeadline(calculateDeadlineInfo(createdAt, priority));
    }, 1000);

    return () => clearInterval(interval);
  }, [createdAt, priority]);

  const config: Record<
    DeadlineState,
    { badgeClass: string; icon: React.ReactNode; label: string }
  > = {
    late: {
      badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
      icon: <AlertTriangle className="h-3 w-3 shrink-0 text-rose-600" />,
      label: "Late",
    },
    at_risk: {
      badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
      icon: <Clock className="h-3 w-3 shrink-0 text-amber-600" />,
      label: "At Risk",
    },
    on_track: {
      badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: <CheckCircle2 className="h-3 w-3 shrink-0 text-emerald-600" />,
      label: "On Track",
    },
    future: {
      badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
      icon: <Calendar className="h-3 w-3 shrink-0 text-blue-600" />,
      label: "Scheduled",
    },
  };

  const current = config[deadline.state];

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-2xs font-medium tracking-tight ${current.badgeClass}`}
      title={`${current.label} SLA: ${deadline.formattedCountdown}`}
    >
      {current.icon}
      <span className="font-semibold">{current.label}:</span>
      <span className="font-mono">{deadline.formattedCountdown}</span>
    </div>
  );
}
