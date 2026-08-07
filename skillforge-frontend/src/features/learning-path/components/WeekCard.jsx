import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  getDifficultyVariant,
  getDifficultyLabel,
} from "@/lib/difficulty";

import {
  Clock,
  BookMarked,
  Target,
  CheckCircle2,
  Play,
  Book,
  Lock,
  Circle,
  Layers,
} from "lucide-react";

import WeekQuizAction from "./WeekQuizAction";

import { useUpdateWeekCompletion } from "../hooks/useUpdateWeekCompletion";

import { RESOURCE_ICONS } from "@/lib/resourceIcons";

function getStatusMeta({ week, locked, current }) {
  if (week.completed) {
    return {
      label: "Completed",
      chip: (
        <span className="flex items-center gap-1.5 text-sm font-medium text-success">
          <CheckCircle2 className="h-4 w-4" />
          Completed
        </span>
      ),
    };
  }

  if (current) {
    return {
      label: "Current",
      chip: (
        <span className="flex items-center gap-1.5 text-sm font-medium text-info">
          <Play className="h-4 w-4" />
          Current
        </span>
      ),
    };
  }

  if (locked) {
    return {
      label: "Locked",
      chip: (
        <span className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
          <Lock className="h-4 w-4" />
          Locked
        </span>
      ),
    };
  }

  return {
    label: "Upcoming",
    chip: (
      <span className="flex items-center gap-1.5 text-sm font-medium text-warning">
        <Circle className="h-4 w-4" />
        Upcoming
      </span>
    ),
  };
}

export default function WeekCard({
  learningPathId,
  week,
  locked,
  current,
  quiz,
}) {
  const updateWeek = useUpdateWeekCompletion();

  const { chip } = getStatusMeta({ week, locked, current });

  const handleCheckedChange = (checked) => {
    if (locked) return;

    updateWeek.mutate({
      learningPathId,
      weekNumber: week.week,
      completed: Boolean(checked),
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>{week.estimatedHours} hrs</span>
        </div>

        {chip}
      </div>

      <div>
        <div className="mb-2 flex items-center gap-2">
          <Layers className="h-5 w-5" />

          <h4 className="font-semibold">Topics</h4>
        </div>

        <div className="space-y-2">
          {(week.topics ?? []).map((topic) => (
            <div
              key={`${week.week}-${topic.name}`}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <span className="font-medium">{topic.name}</span>

              <Badge variant={getDifficultyVariant(topic.difficulty)}>
                {getDifficultyLabel(topic.difficulty)}
              </Badge>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center gap-2">
          <BookMarked className="h-5 w-5" />

          <h4 className="font-semibold">Resources</h4>
        </div>

        <div className="space-y-2">
          {(week.resources ?? []).map((resource, index) => {
            const Icon = RESOURCE_ICONS[resource.type] ?? Book;

            return (
              <div
                key={`${week.week}-resource-${index}`}
                className="flex items-start gap-2"
              >
                <Icon className="mt-0.5 h-4 w-4 text-muted-foreground" />

                <div className="flex flex-col">
                  <span className="text-sm font-medium">{resource.title}</span>

                  <span className="text-xs text-muted-foreground">
                    {resource.type}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center gap-2">
          <Target className="h-5 w-5" />

          <h4 className="font-semibold">Learning Goals</h4>
        </div>

        <div className="space-y-2">
          {(week.learningGoals ?? []).map((goal, index) => (
            <div
              key={`${week.week}-goal-${index}`}
              className="flex items-start gap-2"
            >
              <CheckCircle2 className="mt-1 h-4 w-4 text-success" />

              <p className="text-sm">{goal}</p>
            </div>
          ))}
        </div>
      </div>

      <WeekQuizAction
        learningPathId={learningPathId}
        week={week}
        locked={locked}
        quiz={quiz}
      />

      <label
        className={`flex items-center gap-2 rounded-lg border p-3 text-sm ${
          locked ? "cursor-not-allowed opacity-50" : "cursor-pointer"
        }`}
      >
        <Checkbox
          checked={week.completed}
          disabled={locked || updateWeek.isPending}
          aria-label={`Mark week ${week.week} as completed`}
          onCheckedChange={handleCheckedChange}
        />

        <span>{week.completed ? "Completed" : "Mark as completed"}</span>
      </label>
    </div>
  );
}
