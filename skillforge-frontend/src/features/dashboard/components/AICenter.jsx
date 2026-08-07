import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowUp,
  Bot,
  BrainCircuit,
  ClipboardList,
  LineChart,
  Route,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import { gsap } from "gsap";

import Typewriter from "@/components/common/Typewriter";
import { ROUTES } from "@/constants/routes";
import { GSAP_EASE, useMotionSafe } from "@/lib/motion-gsap";
import { formatStudyTime } from "@/lib/format";

/* ==========================================================================
   AI Command Center — the conductor of Mission Control.
   Not a chatbot: it dispatches to real surfaces (roadmap, quiz, resources)
   and, for analysis requests, synthesizes answers from the live dashboard
   data passed in as `analytics`. Every reply is honest and deterministic.
   ========================================================================== */

function buildChips() {
  return [
    {
      label: "Generate roadmap",
      hint: "AI plans your next steps",
      prompt: "Generate a learning roadmap for my level",
      icon: Route,
      key: "roadmap",
    },
    {
      label: "Generate a quiz",
      hint: "Sharpen a topic",
      prompt: "Give me a quiz to prepare for my next test",
      icon: ClipboardList,
      key: "quiz",
    },
    {
      label: "Analyze my progress",
      hint: "Honest read on momentum",
      prompt: "Analyze my learning progress",
      icon: LineChart,
      key: "analyze",
    },
    {
      label: "Next focus topic",
      hint: "Based on weak areas",
      prompt: "What should I focus on next?",
      icon: BrainCircuit,
      key: "focus",
    },
  ];
}

function buildReply(input, analytics, navigate) {
  const text = input.trim().toLowerCase();

  if (text.includes("quiz")) {
    return {
      icon: ClipboardList,
      title: "Quiz dispatch ready",
      body: "I can generate a quiz on any topic you are practicing. Pick a quiz setup, choose a topic, and practice where it counts.",
      cta: "Open quiz setup",
      onClick: () => navigate(ROUTES.QUIZ_SETUP),
    };
  }

  if (text.includes("roadmap") || text.includes("path")) {
    return {
      icon: Route,
      title: "Roadmaker ready",
      body: "Learning Paths turns your goals into a week-by-week plan. Pick a topic and the path will forge a route for you.",
      cta: "Open learning paths",
      onClick: () => navigate(ROUTES.LEARNING_PATH),
    };
  }

  if (text.includes("focus") || text.includes("next") || text.includes("weak")) {
    const weak = analytics.weakAreas?.[0];
    return {
      icon: BrainCircuit,
      title: "Recommended next move",
      body: weak
        ? `${weak.skill ?? ""} ${weak.topic ?? ""} is your loosest area right now. Sharpen it with a focused resource and quiz session.`
        : "Your coverage looks balanced. Pick the topic you enjoy most and go deeper — mastery compounds.",
      cta: "Browse resources",
      onClick: () => navigate(ROUTES.RESOURCES),
    };
  }

  return {
    icon: LineChart,
    title: "Progress read",
    body: `You have studied ${formatStudyTime(
      analytics.totalLearningMinutes,
    )} across ${analytics.totalTopicsStarted ?? 0} topics, averaging ${
      analytics.overallAverageScore ?? 0
    }% on quizzes. Learning health is ${
      analytics.learningHealthScore ?? 0
    }/100 — ${
      analytics.learningHealthScore >= 70
        ? "the ember is lit, keep the loop tight."
        : "one focused session a day raises it fast."
    }`,
    cta: "See full analytics",
    onClick: () =>
      document
        .getElementById("learning-analytics")
        ?.scrollIntoView({ behavior: "smooth" }),
  };
}

export default function AICenter({ analytics }) {
  const navigate = useNavigate();
  const { reduced } = useMotionSafe();

  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [messages, setMessages] = useState([]);
  const chipsRef = useRef(null);
  const threadRef = useRef(null);
  const chips = useMemo(() => buildChips(navigate), [navigate]);

  useEffect(() => {
    if (reduced || !chipsRef.current) return undefined;
    const tween = gsap.timeline({ ease: GSAP_EASE.outExpo });
    tween.from(chipsRef.current.querySelectorAll("[data-chip]"), {
      opacity: 0,
      y: 14,
      stagger: 0.07,
      duration: 0.5,
      clearProps: "opacity,transform",
    });
    return () => tween.revert();
  }, [reduced]);

  const submit = (prompt = input) => {
    const message = prompt.trim();
    if (!message) return;

    setInput("");
    setThinking(true);

    const reply = buildReply(message, analytics, navigate);

    window.setTimeout(
      () => {
        setThinking(false);
        setMessages((prev) => [...prev, { prompt: message, reply }]);
        requestAnimationFrame(() => {
          if (reduced || !threadRef.current) return;
          const latest = threadRef.current.querySelector(".ai-reply:last-child");
          if (!latest) return;
          gsap.from(latest, {
            opacity: 0,
            y: 14,
            duration: 0.4,
            ease: GSAP_EASE.outExpo,
          });
        });
      },
      reduced ? 0 : 900,
    );
  };

  return (
    <section
      aria-label="AI Command Center"
      className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-ember/10 via-background to-aurora/10 p-1.5"
    >
      <div className="rounded-[1.4rem] bg-background/85 p-5 backdrop-blur-xl sm:p-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-ember/15 text-ember">
              <Bot className="size-5" aria-hidden="true" />
            </span>
            <div>
              <p className="flex items-center gap-2 text-sm font-semibold">
                AI Command Center
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-ember opacity-60" />
                  <span className="relative inline-flex size-2 rounded-full bg-ember" />
                </span>
              </p>
              <p className="text-xs text-muted-foreground">
                Dispatch to your study surfaces — roadmap, quiz, progress.
              </p>
            </div>
          </div>
          <span className="hidden rounded-full border border-border bg-muted/40 px-2.5 py-1 text-3xs font-semibold uppercase tracking-widest text-muted-foreground sm:block">
            AI online
          </span>
        </div>

        {/* Suggestions */}
        <div ref={chipsRef} className="mt-5 flex flex-wrap gap-2">
          {chips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              data-chip
              onClick={() => submit(chip.prompt)}
              className="flex items-center gap-2 rounded-full border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-ember/40 hover:text-ember"
            >
              <chip.icon className="size-3.5" aria-hidden="true" />
              {chip.label}
            </button>
          ))}
        </div>

        {/* Input */}
        <form
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
          className="mt-4 flex items-center gap-3 rounded-2xl border bg-muted/40 px-3 py-2 focus-within:border-ember/50"
        >
          <WandSparkles className="size-4 shrink-0 text-ember" aria-hidden="true" />
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask for a roadmap, quiz, or progress read…"
            aria-label="Ask the AI Command Center"
            className="h-9 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <button
            type="submit"
            disabled={!input.trim() || thinking}
            className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-ember text-primary-foreground transition-transform hover:scale-105 disabled:opacity-40 disabled:hover:scale-100"
            aria-label="Dispatch command"
          >
            <ArrowUp className="size-4" />
          </button>
        </form>

        {/* Thread */}
        <div ref={threadRef} className="mt-4 space-y-3" aria-live="polite">
          {messages.map((message) => (
            <article
              key={message.prompt}
              className="ai-reply rounded-2xl border border-border/80 bg-background/60 p-4"
            >
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                You · {message.prompt}
              </p>
              <div className="mt-3 flex gap-3">
                <message.reply.icon
                  className="mt-0.5 size-6 shrink-0 text-ember"
                  aria-hidden="true"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{message.reply.title}</p>
                  <Typewriter text={message.reply.body} reduced={reduced} />
                  {message.reply.onClick && message.reply.cta && (
                    <button
                      type="button"
                      onClick={message.reply.onClick}
                      className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-ember/15 px-3 py-1.5 text-xs font-semibold text-ember transition-colors hover:bg-ember/25"
                    >
                      <ArrowUp className="size-3 -rotate-45" aria-hidden="true" />
                      {message.reply.cta}
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}

          {thinking && (
            <div className="flex items-center gap-2 rounded-2xl border border-ember/20 bg-ember/5 px-4 py-3 text-xs font-medium text-ember">
              <Sparkles className="size-3.5 animate-pulse" aria-hidden="true" />
              Forging a response…
            </div>
          )}
        </div>
      </div>
    </section>
  );
}