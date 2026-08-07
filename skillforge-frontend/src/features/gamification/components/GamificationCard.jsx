import { TrophyIcon, StarIcon, ArrowRightIcon } from "lucide-react";
import { Link } from "react-router-dom";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { ROUTES } from "@/constants/routes";

import { useGamification } from "../hooks/useGamification";
import { levelLabel } from "../constants/levels";

export default function GamificationCard() {
  const { data, isLoading } = useGamification();

  if (isLoading || !data) {
    return null;
  }

  const badges = data.badges ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrophyIcon />
          Achievements
          {badges.length > 0 && (
            <Badge variant="secondary">
              {levelLabel(data.level)}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-sm">
          <StarIcon className="text-warning" />
          <span className="font-semibold">{data.points}</span>
          <span className="text-muted-foreground">points earned</span>
        </div>

        {badges.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Complete quizzes, save resources and rate content to earn
            your first badge.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {badges.map((badge) => (
              <div
                key={badge.code}
                className="flex items-start gap-2 rounded-lg border p-3"
              >
                <TrophyIcon className="mt-0.5 size-5 shrink-0 text-warning" />

                <div className="min-w-0">
                  <p className="text-sm font-medium">{badge.name}</p>

                  <p className="text-xs text-muted-foreground">
                    {badge.description}
                  </p>

                  <p className="mt-1 text-2xs text-muted-foreground">
                    {new Date(badge.awardedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        <Link
          to={ROUTES.ACHIEVEMENTS}
          className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          View all achievements
          <ArrowRightIcon className="size-4" />
        </Link>
      </CardContent>
    </Card>
  );
}
