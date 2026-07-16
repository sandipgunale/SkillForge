import { Card } from "@/components/ui/card";

export default function InsightItem({ icon, title, value }) {
  return (
    <Card className="flex items-center gap-4 p-4">
      <div className="text-primary">{icon}</div>

      <div>
        <p className="text-sm text-muted-foreground">{title}</p>

        <h3 className="text-lg font-semibold">{value}</h3>
      </div>
    </Card>
  );
}
