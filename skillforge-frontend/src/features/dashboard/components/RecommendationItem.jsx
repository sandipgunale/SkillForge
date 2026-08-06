import { AlertTriangle, ArrowUpCircle, CheckCircle2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";

const PRIORITY = {
  HIGH: {
    icon: AlertTriangle,
    badge: "destructive",
    label: "High Priority",
    color: "text-destructive",
  },

  MEDIUM: {
    icon: ArrowUpCircle,
    badge: "secondary",
    label: "Recommended",
    color: "text-warning",
  },

  LOW: {
    icon: CheckCircle2,
    badge: "outline",
    label: "Optional",
    color: "text-success",
  },
};

export default function RecommendationItem({ recommendation }) {
  const config = PRIORITY[recommendation.priority] ?? PRIORITY.MEDIUM;

  const Icon = config.icon;

  return (
    <div className="rounded-xl border p-5 transition-all duration-300 hover:border-primary hover:bg-muted/40">
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-4">
          <div className="mt-1 rounded-lg bg-primary/10 p-2">
            <Icon className={`h-5 w-5 ${config.color}`} />
          </div>

          <div>
            <h3 className="font-semibold">{recommendation.title}</h3>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {recommendation.reason}
            </p>
          </div>
        </div>

        <Badge variant={config.badge}>{config.label}</Badge>
      </div>
    </div>
  );
}
