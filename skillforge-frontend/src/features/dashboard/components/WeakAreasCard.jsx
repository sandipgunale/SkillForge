import { AlertTriangle, CheckCircle2 } from "lucide-react";

import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import AppCard from "@/components/common/AppCard";

export default function WeakAreasCard({ weakAreas }) {
  const hasWeakAreas = weakAreas.length > 0;

  return (
    <AppCard className="transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <CardHeader>
        <CardTitle>Weak Areas</CardTitle>
      </CardHeader>

      <CardContent>
        {!hasWeakAreas ? (
          <div className="flex flex-col items-center justify-center gap-4 py-8">
            <CheckCircle2 size={48} className="text-green-600" />

            <div className="text-center">
              <h3 className="font-semibold">Great Job!</h3>

              <p className="text-sm text-muted-foreground">
                No weak areas detected.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {weakAreas.map((area) => (
              <Badge key={area} variant="destructive" className="mr-2">
                <AlertTriangle className="mr-1 h-3 w-3" />

                {area}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </AppCard>
  );
}
