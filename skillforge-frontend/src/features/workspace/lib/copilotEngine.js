/* ==========================================================================
   Copilot engine — the reasoning core of the AI Copilot.
   PURE: no React, no network. It turns (intent + the learner's real data)
   into a deterministic, honest answer: either a synthesized explanation
   grounded in the roadmap/analytics/quiz history, or a dispatch to a real
   guarded endpoint (quiz generation, resources, roadmap).

   There is deliberately NO free-form chat backend — everything the copilot
   says is either true of the user's own data or a link to a real action.
   ========================================================================== */

export const COPILOT_ACTIONS = {
  EXPLAIN: "explain",
  SUMMARIZE: "summarize",
  ANALYZE: "analyze",
  RECOMMEND: "recommend",
  FLASHCARDS: "flashcards",
  PRACTICE: "practice",
};

export function detectIntent(prompt) {
  const text = prompt.trim().toLowerCase();

  if (/flashcard|card|memoriz/.test(text)) return COPILOT_ACTIONS.FLASHCARDS;
  if (/weak|gap|struggl|improve|analy/.test(text))
    return COPILOT_ACTIONS.ANALYZE;
  if (/next|recommend|what should|focus/.test(text))
    return COPILOT_ACTIONS.RECOMMEND;
  if (/practice|quiz|question|test/.test(text))
    return COPILOT_ACTIONS.PRACTICE;
  if (/summar|brief|overview/.test(text)) return COPILOT_ACTIONS.SUMMARIZE;
  return COPILOT_ACTIONS.EXPLAIN;
}

export function buildAnswer({
  intent,
  topic,
  week,
  learningPath,
  analytics,
  quizHistory,
  highlights,
}) {
  switch (intent) {
    case COPILOT_ACTIONS.SUMMARIZE:
      return summarizeTopic({ topic, week, learningPath });

    case COPILOT_ACTIONS.ANALYZE:
      return analyzeProgress(analytics, quizHistory);

    case COPILOT_ACTIONS.RECOMMEND:
      return recommendNext({ week, learningPath, analytics });

    case COPILOT_ACTIONS.FLASHCARDS:
      return buildFlashcards({ topic, week });

    case COPILOT_ACTIONS.PRACTICE:
      return practiceDispatch({ topic, week, learningPath });

    case COPILOT_ACTIONS.EXPLAIN:
    default:
      return explainTopic({ topic, week, learningPath, highlights });
  }
}

function explainTopic({ topic, week, learningPath, highlights }) {
  const goals = week?.learningGoals ?? [];
  const resources = week?.resources ?? [];
  const highlighted = Object.keys(highlights ?? {}).some(
    (key) => week != null && topic != null && key.endsWith(`w${week.week}:${topic}`),
  );

  if (!topic) {
    return {
      title: "No topic selected",
      body: "Select a topic in the Knowledge Navigation to ground my explanation in your roadmap.",
      cta: null,
      onClick: null,
    };
  }

  const goalList = goals
    .slice(0, 3)
    .map((goal) => `- ${goal}`)
    .join("\n");

  const resourceList = resources
    .slice(0, 5)
    .map(
      (resource) => `- **${resource.title}** — ${resource.type.toLowerCase()}`,
    )
    .join("\n");

  return {
    title: `${topic} — what to learn`,
    body: [
      `This topic belongs to **Week ${week?.week ?? "—"}** of *${learningPath?.title ?? "your roadmap"}*.`,
      "",
      "**Why it matters**",
      goalList || "- (no goals recorded for this week)",
      "",
      "**Recommended material**",
      resourceList || "- (no resources attached yet)",
      "",
      highlighted ? "★ You've highlighted this topic — a good sign to drill it today." : "",
      "> Tip: read the material, then use **Practice this topic** — the quiz engine will generate questions with per-answer explanations.",
    ].join("\n"),
    cta: "Practice this topic",
    onClick: null,
    dispatch: COPILOT_ACTIONS.PRACTICE,
  };
}

function summarizeTopic({ topic, week, learningPath }) {
  if (!week) {
    return {
      title: "No week selected",
      body: "Pick a week on the left and I will summarize it from your roadmap.",
      cta: null,
      onClick: null,
    };
  }

  let topics = (week.topics ?? []).map((t) => `- ${t.name}`).join("\n");
  const resources = (week.resources ?? []).length;
  const spotlight = (week.topics ?? []).find((t) => t.name === topic) ?? null;

  if (spotlight) {
    topics = (
      `Spotlight: **${spotlight.name}** (${spotlight.difficulty}).\n` + topics
    );
  }

  return {
    title: `Week ${week.week} — ${week.title}`,
    body: [
      `**Goal of the week** — ${week.learningGoals?.[0] ?? "practice & consolidate"}.`,
      "",
      `**Topics covered (${(week.topics ?? []).length})**`,
      topics || "- none yet",
      "",
      `**Workload** — ${week.estimatedHours} hrs · ${resources} resources.`,
      "",
      `> Next milestone: ${learningPath?.goal ?? "complete the roadmap"}.`,
    ].join("\n"),
    cta: "Open this week's resources",
    onClick: null,
    dispatch: COPILOT_ACTIONS.EXPLAIN,
  };
}

function analyzeProgress(analytics, quizHistory) {
  const avg = analytics?.overallAverageScore ?? 0;
  const health = analytics?.learningHealthScore ?? 0;
  const minutes = analytics?.totalLearningMinutes ?? 0;

  const completed = (quizHistory?.content ?? []).filter(
    (quiz) => quiz.status === "COMPLETED" && quiz.maxScore > 0,
  );

  let weakest = null;
  for (const quiz of completed) {
    const pct = (quiz.score / quiz.maxScore) * 100;
    if (!weakest || pct < weakest.pct) {
      weakest = { topic: quiz.topicName ?? quiz.title, pct };
    }
  }

  const weakestLine = weakest
    ? `Weakest result so far: **${weakest.topic}** at ${Math.round(weakest.pct)}%.`
    : "No completed quizzes yet — finish one to unlock weakness analysis.";

  const studyHours = (minutes / 60).toFixed(1);

  return {
    title: "Progress read",
    body: [
      `**Consistency** — ${studyHours} hrs studied · health **${health}/100**.`,
      `**Accuracy** — ${Math.round(avg)}% average across quizzes.`,
      weakestLine,
      "",
      "> The fastest lever: 25 focused minutes on your weakest topic today.",
    ].join("\n"),
    cta: "See full analytics",
    onClick: null,
    dispatch: "analytics",
  };
}

function recommendNext({ learningPath, analytics }) {
  if (!learningPath) {
    return {
      title: "Start with a roadmap",
      body: "Create a learning path first — I will then recommend the next step from your progress.",
      cta: "Open learning paths",
      onClick: null,
      dispatch: "roadmap",
    };
  }

  const weeks = learningPath?.roadmapJson?.weeks ?? [];
  const current = weeks.find((w) => !w.completed);

  if (!current) {
    return {
      title: "Roadmap complete",
      body: "Every week is marked complete. Time to test it all with a final assessment.",
      cta: "Go to roadmap",
      onClick: null,
      dispatch: "roadmap",
    };
  }

  const topic = current.topics?.[0]?.name ?? "the next topic";

  return {
    title: `Next step: ${topic}`,
    body: [
      `Your current milestone is **Week ${current.week} — ${current.title}** (${current.estimatedHours} hrs).`,
      "",
      `Focus on **${topic}** first — it unlocks the rest of the week.`,
      "",
      `> Momentum tip: health is ${analytics?.learningHealthScore ?? "—"}/100. One short quiz on ${topic} builds the streak.`,
    ].join("\n"),
    cta: "Open week in canvas",
    onClick: null,
    dispatch: COPILOT_ACTIONS.EXPLAIN,
  };
}

function buildFlashcards({ topic, week }) {
  const goals = (week?.learningGoals ?? []).slice(0, 4);
  const resources = (week?.resources ?? []).slice(0, 3);

  if (goals.length === 0 && resources.length === 0) {
    return {
      title: "No cards to build",
      body: "This week has no recorded goals or resources yet — add material to the roadmap first.",
      cta: null,
      onClick: null,
    };
  }

  const cards = [
    ...goals.map((goal) => ({ q: "Goal to reach", a: goal })),
    ...resources.map((resource) => ({
      q: `Key material — ${resource.type.toLowerCase()}`,
      a: resource.title,
    })),
  ];

  const list = cards.map((card, i) => `- **Card ${i + 1}** · ${card.q} → ${card.a}`).join("\n");

  return {
    title: `Flashcards for ${topic ?? "this week"}`,
    body: [
      "Study these, then quiz yourself to verify recall.",
      "",
      list,
      "",
      "> Interleave: repeat cards 1→N, then N→1, then practice.",
    ].join("\n"),
    cta: "Practice to verify recall",
    onClick: null,
    dispatch: COPILOT_ACTIONS.PRACTICE,
  };
}

function practiceDispatch({ topic, week, learningPath }) {
  if (!learningPath) {
    return {
      title: "Practice needs a topic",
      body: "Open a learning path (or a resource) and I can dispatch a real generated quiz.",
      cta: "Browse resources",
      onClick: null,
      dispatch: "resources",
    };
  }

  return {
    title: "Practice dispatch",
    body: [
      `I will generate a **real quiz** for ${
        topic ? `*${topic}*` : "your current week"
      } using the guarded AI quiz engine — ${
        week ? `Week ${week.week} · ${week.title}` : "the whole roadmap"
      }.`,
      "",
      "The quiz comes with instant per-answer explanations and a session summary.",
    ].join("\n"),
    cta: "Generate quiz now",
    onClick: null,
    dispatch: "quiz",
  };
}