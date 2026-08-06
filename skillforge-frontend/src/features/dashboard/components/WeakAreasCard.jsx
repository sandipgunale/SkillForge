import {
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  BookOpen,
} from "lucide-react";

import { CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import AppCard from "@/components/common/AppCard";

export default function WeakAreasCard({ weakAreas = [] }) {
  const hasWeakAreas = weakAreas.length > 0;

  return (
    <AppCard className="transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between">
          <CardTitle>Improvement Plan</CardTitle>

          {hasWeakAreas ? (
            <AlertTriangle className="h-5 w-5 text-warning" />
          ) : (
            <CheckCircle2 className="h-5 w-5 text-success" />
          )}
        </div>

        <p className="text-sm text-muted-foreground">
          Focus on these topics to improve your learning health and quiz
          performance.
        </p>
      </CardHeader>

      <CardContent>
        {!hasWeakAreas ? (
          <div className="flex flex-col items-center rounded-xl border border-dashed py-10 text-center">
            <CheckCircle2 className="mb-4 h-12 w-12 text-success" />

            <h3 className="text-lg font-semibold">Excellent Progress 🎉</h3>

            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              We couldn't identify any significant weak areas. Keep practising
              consistently to maintain your momentum.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {weakAreas.map((topic, index) => (
              <div
                key={topic}
                className="flex items-center justify-between rounded-xl border p-4 transition-all duration-300 hover:border-primary hover:bg-muted/40"
              >
                <div className="flex items-start gap-4">
                  <div className="rounded-lg bg-warning/10 p-3">
                    <BookOpen className="h-5 w-5 text-warning" />
                  </div>

                  <div>
                    <h3 className="font-semibold">{topic}</h3>

                    <p className="mt-1 text-sm text-muted-foreground">
                      Recommended for revision to strengthen your fundamentals.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {index === 0 && (
                    <span className="rounded-full bg-destructive/15 px-3 py-1 text-xs font-semibold text-destructive">
                      Highest Priority
                    </span>
                  )}

                  <Button size="sm" variant="outline" className="gap-2">
                    Practice
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            <div className="rounded-xl bg-primary/5 p-5">
              <h4 className="font-semibold">💡 AI Tip</h4>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Spend 20–30 minutes each day reviewing these topics. Regular,
                focused practice is more effective than long study sessions.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </AppCard>
  );
}
