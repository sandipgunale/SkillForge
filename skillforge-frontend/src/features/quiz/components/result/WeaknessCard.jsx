import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

export default function WeaknessCard({ weaknesses }) {
  return (
    <Card className="border shadow-sm">
      <CardContent className="p-6">
        <h3 className="mb-4 text-lg font-semibold">Areas to Improve</h3>

        <div className="space-y-3">
          {weaknesses.length === 0 ? (
            <p className="text-muted-foreground">No weaknesses detected.</p>
          ) : (
            weaknesses.map((item) => (
              <div key={item} className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-500" />

                {item}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
