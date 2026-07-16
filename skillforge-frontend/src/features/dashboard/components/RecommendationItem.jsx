import { AlertTriangle, ArrowUpCircle, CheckCircle2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";

const PRIORITY_CONFIG = {
  HIGH: {
    icon: AlertTriangle,
    badge: "destructive",
    color: "text-red-500",
  },
  MEDIUM: {
    icon: ArrowUpCircle,
    badge: "secondary",
    color: "text-yellow-500",
  },
  LOW: {
    icon: CheckCircle2,
    badge: "outline",
    color: "text-green-500",
  },
};

export default function RecommendationItem({ recommendation }) {
  const config =
    PRIORITY_CONFIG[recommendation.priority] ?? PRIORITY_CONFIG.MEDIUM;

  const Icon = config.icon;

  return (
    <div className="flex items-start justify-between rounded-lg border p-4 transition hover:bg-muted/40">
      <div className="flex gap-3">
        <Icon className={`mt-1 h-5 w-5 ${config.color}`} />

        <div>
          <h4 className="font-medium">{recommendation.title}</h4>

          <p className="mt-1 text-sm text-muted-foreground">
            {recommendation.reason}
          </p>
        </div>
      </div>

      <Badge variant={config.badge}>{recommendation.priority}</Badge>
    </div>
  );
}
