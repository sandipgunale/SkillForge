import { Badge } from "@/components/ui/badge";

const STATUS_VARIANTS = {
  ACTIVE: "default",
  COMPLETED: "secondary",
  PAUSED: "outline",
};

export default function StatusBadge({ status }) {
  return <Badge variant={STATUS_VARIANTS[status] ?? "outline"}>{status}</Badge>;
}
