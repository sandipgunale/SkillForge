import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function AppCard({ children, className }) {
  return (
    <Card
      className={cn(
        "border shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
        className,
      )}
    >
      {children}
    </Card>
  );
}
