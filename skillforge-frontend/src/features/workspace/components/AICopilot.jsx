import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowDown,
  ArrowUp,
  Bot,
  BrainCircuit,
  ClipboardList,
  Download,
  Pin,
  PinOff,
  RefreshCw,
  Route,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  WandSparkles,
} from "lucide-react";
import { gsap } from "gsap";

import { StreamedMarkdown } from "./Markdown";
import { useDashboard } from "@/features/dashboard/hooks/useDashboard";
import { useQuizHistory } from "@/features/quiz/hooks/useQuizHistory";
import { useWorkspaceStore } from "../store/workspaceStore";
import { buildAnswer, COPILOT_ACTIONS, detectIntent } from "../lib/copilotEngine";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import { GSAP_EASE, useMotionSafe, usePressPhysics } from "@/lib/motion-gsap";

/* ==========================================================================
   AI Copilot — the right panel of the Learning Workspace.
   Honest by design: every answer is synthesized from the learner's own
   roadmap / analytics / quiz history, or dispatches to a real guarded
   endpoint (quiz generation, resources, roadmap). No fake chat.
   ========================================================================== */

const CAPABILITIES = [
  { label: "Explain", intent: COPILOT_ACTIONS.EXPLAIN, icon: BrainCircuit },
  { label: "Summarize week", intent: COPILOT_ACTIONS.SUMMARIZE, icon: Sparkles },
  { label: "Weaknesses", intent: COPILOT_ACTIONS.ANALYZE, icon: Route },
  { label: "Flashcards", intent: COPILOT_ACTIONS.FLASHCARDS, icon: ClipboardList },
  { label: "Next step", intent: COPILOT_ACTIONS.RECOMMEND, icon: ArrowDown },
  { label: "Practice", intent: COPILOT_ACTIONS.PRACTICE, icon: WandSparkles },
];

const INTENT_PROMPTS = {
  [COPILOT_ACTIONS.EXPLAIN]: "Explain the selected topic",
  [COPILOT_ACTIONS.SUMMARIZE]: "Summarize my current week",
  [COPILOT_ACTIONS.ANALYZE]: "Analyze my weak areas",
  [COPILOT_ACTIONS.FLASHCARDS]: "Make flashcards for this topic",
  [COPILOT_ACTIONS.RECOMMEND]: "What should I learn next?",
  [COPILOT_ACTIONS.PRACTICE]: "Practice this topic",
};

function dispatchFor(reply, navigate, learningPath, selectedWeek) {
  if (reply.dispatch === "quiz" && learningPath) {
    navigate(ROUTES.QUIZ_SETUP, {
      state: {
        source: "LEARNING_PATH",
        learningPathId: learningPath.id,
        weekNumber: selectedWeek ?? 1,
      },
    });
    return true;
  }
  if (reply.dispatch === "roadmap") {
    navigate(
      learningPath
        ? ROUTES.learningPathDetail(learningPath.id)
        : ROUTES.LEARNING_PATH,
    );
    return true;
  }
  if (reply.dispatch === "resources") {
    navigate(ROUTES.RESOURCES);
    return true;
  }
  if (reply.dispatch === "analytics") {
    navigate(ROUTES.DASHBOARD);
    return true;
  }
  return false;
}

export default function AICopilot({ learningPath }) {
  const navigate = useNavigate();
  const { reduced } = useMotionSafe();
  const { data: analytics } = useDashboard();
  const { data: quizHistory } = useQuizHistory({ size: 50 });

  const selectedWeek = useWorkspaceStore((s) => s.selectedWeek);
  const selectedTopic = useWorkspaceStore((s) => s.selectedTopic);
  const highlights = useWorkspaceStore((s) => s.highlights);

  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [messages, setMessages] = useState([]);
  const [pinned, setPinned] = useState([]);
  const [feedback, setFeedback] = useState({});
  const threadRef = useRef(null);
  const sendRef = useRef(null);

  usePressPhysics(sendRef);
const weeks = useMemo(
    () => learningPath?.roadmapJson?.weeks ?? [],
    [learningPath],
  );

  const week = useMemo(
    () => weeks.find((w) => w.week === selectedWeek) ?? null,
    [weeks, selectedWeek],
  );

  const topic = useMemo(
    () => (week?.topics ?? []).find((t) => t.name === selectedTopic) ?? null,
    [week, selectedTopic],
  );

  useEffect(() => {
    if (reduced || !threadRef.current) return undefined;
    const latest = threadRef.current.querySelector("[data-chat]:last-child");
    if (!latest) return undefined;
    const tween = gsap.from(latest, {
      opacity: 0,
      y: 12,
      duration: 0.35,
      ease: GSAP_EASE.outExpo,
      clearProps: "opacity,transform",
    });
    return () => tween.revert();
  }, [messages.length, reduced]);

  const answer = (prompt, reply) => {
    setThinking(true);
    window.setTimeout(
      () => {
        setThinking(false);
        setMessages((prev) => [...prev, { prompt, reply }]);
      },
      reduced ? 0 : 650,
    );
  };

  const submit = (prompt = input) => {
    const text = prompt.trim();
    if (!text) return;

    setInput("");
    const intent = detectIntent(text);
    const reply = buildAnswer({
      intent,
      topic,
      week,
      learningPath,
      analytics,
      quizHistory,
      highlights,
    });
    answer(text, reply);
  };

  const regenerate = (index) => {
    const message = messages[index];
    if (!message) return;
    setThinking(true);
    const intent = detectIntent(message.prompt);
    const reply = buildAnswer({
      intent,
      topic,
      week,
      learningPath,
      analytics,
      quizHistory,
      highlights,
    });
    window.setTimeout(() => {
      setThinking(false);
      setMessages((prev) =>
        prev.map((m, i) => (i === index ? { ...m, reply } : m)),
      );
    }, reduced ? 0 : 600);
  };

  const togglePin = (index) => {
    const message = messages[index];
    if (!message) return;
    setPinned((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    );
  };

  const exportNotes = () => {
    if (messages.length === 0) return;
    const body = messages
      .map(
        (m) =>
          `## You\n${m.prompt}\n\n## Copilot — ${m.reply.title}\n${m.reply.body}`,
      )
      .join("\n\n---\n\n");
    const blob = new Blob(
      [`# AI Copilot session\n\n${body}\n`],
      { type: "text/markdown" },
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `copilot-session-${new Date().toISOString().slice(0, 10)}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const runDispatch = (reply) => dispatchFor(reply, navigate, learningPath, selectedWeek);

  const isEmpty = messages.length === 0 && !thinking;

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-2.5 border-b p-3.5">
        <span className="flex size-8 items-center justify-center rounded-lg bg-ember/15 text-ember">
          <Bot className="size-4" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-2 text-sm font-semibold">
            AI Copilot
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-ember opacity-60" />
              <span className="relative inline-flex size-1.5 rounded-full bg-ember" />
            </span>
          </p>
          <p className="text-2xs text-muted-foreground">Grounded in your data</p>
        </div>
        <button
          type="button"
          onClick={exportNotes}
          disabled={messages.length === 0}
          className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40"
          aria-label="Export conversation"
          title="Export conversation"
        >
          <Download className="size-4" />
        </button>
      </div>

      {/* Capabilities */}
      <div className="flex flex-wrap gap-1.5 border-b p-3">
        {CAPABILITIES.map((cap) => (
          <button
            key={cap.intent}
            type="button"
            onClick={() => submit(INTENT_PROMPTS[cap.intent])}
            className="flex items-center gap-1.5 rounded-full border bg-background px-2.5 py-1 text-2xs font-medium text-muted-foreground transition-colors hover:border-ember/40 hover:text-ember"
          >
            <cap.icon className="size-3" aria-hidden="true" />
            {cap.label}
          </button>
        ))}
      </div>

      {/* Pinned */}
      {pinned.length > 0 && (
        <div className="max-h-40 overflow-y-auto border-b bg-ember/5 p-3">
          <p className="mb-2 flex items-center gap-1.5 text-3xs font-semibold uppercase tracking-widest text-ember">
            <Pin className="size-3" aria-hidden="true" />
            Pinned answers
          </p>
          <div className="space-y-2">
            {pinned.map((index) => {
              const message = messages[index];
              if (!message) return null;
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() =>
                    threadRef.current
                      ?.querySelectorAll("[data-chat]")[index]
                      ?.scrollIntoView({ behavior: "smooth", block: "center" })
                  }
                  className="block w-full truncate rounded-lg bg-background px-2.5 py-1.5 text-left text-2xs text-muted-foreground transition-colors hover:text-foreground"
                >
                  {message.reply.title}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Thread */}
      <div ref={threadRef} className="flex-1 space-y-3 overflow-y-auto p-3" aria-live="polite">
        {isEmpty && (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
            <Sparkles className="size-7 text-ember/70" aria-hidden="true" />
            <div className="max-w-[220px] space-y-1.5">
              <p className="text-sm font-semibold">Ask anything about your learning</p>
              <p className="text-xs leading-relaxed text-muted-foreground">
                {topic
                  ? `I'm ready to explain ${topic} — or check a weakness, build flashcards, and dispatch a real quiz.`
                  : "Select a topic in the Knowledge Navigation and I will ground my answers in it."}
              </p>
            </div>
          </div>
        )}

        {messages.map((message, index) => (
          <div key={message.prompt} data-chat className="space-y-2">
            <p className="rounded-xl rounded-bl-sm bg-primary/10 px-3 py-2 text-xs font-medium">
              {message.prompt}
            </p>

            <div className="rounded-xl rounded-tr-sm border bg-background/60 p-3">
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <p className="text-xs font-semibold text-ember">
                  {message.reply.title}
                </p>
                <div className="flex items-center gap-0.5">
                  <button
                    type="button"
                    onClick={() => togglePin(index)}
                    className={cn(
                      "rounded p-1 transition-colors",
                      pinned.includes(index)
                        ? "text-ember"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                    aria-label={pinned.includes(index) ? "Unpin answer" : "Pin answer"}
                  >
                    {pinned.includes(index) ? (
                      <PinOff className="size-3.5" />
                    ) : (
                      <Pin className="size-3.5" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => regenerate(index)}
                    className="rounded p-1 text-muted-foreground transition-colors hover:text-foreground"
                    aria-label="Regenerate answer"
                  >
                    <RefreshCw className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFeedback((f) => ({ ...f, [index]: "up" }))
                    }
                    className={cn(
                      "rounded p-1 transition-colors",
                      feedback[index] === "up"
                        ? "text-success"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                    aria-label="Helpful"
                  >
                    <ThumbsUp className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFeedback((f) => ({ ...f, [index]: "down" }))
                    }
                    className={cn(
                      "rounded p-1 transition-colors",
                      feedback[index] === "down"
                        ? "text-destructive"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                    aria-label="Not helpful"
                  >
                    <ThumbsDown className="size-3.5" />
                  </button>
                </div>
              </div>

              <div className="ai-body">
                <StreamedMarkdown text={message.reply.body} reduced={reduced} />
              </div>

              {message.reply.cta && (
                <button
                  type="button"
                  onClick={() => runDispatch(message.reply)}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-ember/15 px-3 py-1.5 text-xs font-semibold text-ember transition-colors hover:bg-ember/25"
                >
                  <ArrowUp className="size-3 -rotate-45" aria-hidden="true" />
                  {message.reply.cta}
                </button>
              )}
            </div>
          </div>
        ))}

        {thinking && (
          <div className="flex items-center gap-2 rounded-xl border border-ember/20 bg-ember/5 px-3 py-2.5 text-xs font-medium text-ember">
            <Sparkles className="size-3.5 animate-pulse" aria-hidden="true" />
            Forging a response…
          </div>
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
        className="flex items-center gap-2 border-t p-3"
      >
        <WandSparkles className="size-4 shrink-0 text-ember" aria-hidden="true" />
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask your copilot…"
          aria-label="Ask the AI copilot"
          className="h-9 w-full rounded-xl bg-muted/50 px-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ember/40"
        />
        <button
          ref={sendRef}
          type="submit"
          disabled={!input.trim() || thinking}
          className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-ember text-primary-foreground transition-transform hover:scale-105 disabled:opacity-40 disabled:hover:scale-100"
          aria-label="Send"
        >
          <ArrowUp className="size-4" />
        </button>
      </form>
    </div>
  );
}