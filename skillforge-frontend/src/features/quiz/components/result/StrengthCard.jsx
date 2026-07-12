import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

export default function StrengthCard({ strengths }) {
  return (
    <Card className="border shadow-sm">
      <CardContent className="p-6">
        <h3 className="mb-4 text-lg font-semibold">Strengths</h3>

        <div className="space-y-3">
          {strengths.length === 0 ? (
            <p className="text-muted-foreground">No strengths available.</p>
          ) : (
            strengths.map((item) => (
              <div key={item} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />

                {item}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
