import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Award,
  BookOpen,
  Bookmark,
  CalendarDays,
  CircleDot,
  Command,
  Flame,
  Gauge,
  Hammer,
  HeartPulse,
  Library,
  Lightbulb,
  Mail,
  MonitorPlay,
  MousePointerClick,
  Quote,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Timer,
  TimerOff,
  Trophy,
  Workflow,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import CountUp from "@/components/common/CountUp";
import { ROUTES } from "@/constants/routes";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useMotionScope, useMagnetic, useReducedMotion } from "@/lib/motion-gsap";

import HeroContent from "../components/HeroContent";
import DashboardMock from "../components/DashboardMock";
import KnowledgeMap from "./KnowledgeMap";
import KnowledgeConstellation from "../../components/three/KnowledgeConstellation";
import Marquee from "./Marquee";

/* -------------------------------------------------------------------------- */
/*  Forge Fold sections — the landing as a normal full-screen website.        */
/*  Nine full-width, min-height 100svh sections; the ONLY transition between  */
/*  them is the fold (the section itself rotates around its right edge, the   */
/*  next one sits underneath). Real product copy throughout.                   */
/* -------------------------------------------------------------------------- */

/* ---- Shared typography ---------------------------------------------------- */

const T = {
  overline: "text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground",
  h2: "text-[clamp(2.5rem,5.2vw,4.75rem)] font-bold leading-[1.02] tracking-tight",
  h3: "text-lg font-bold tracking-tight sm:text-xl",
  body: "text-base leading-relaxed text-muted-foreground",
  small: "text-sm leading-relaxed",
  ember: "text-ember",
  card:
    "rounded-2xl border border-border bg-card/60 backdrop-blur-sm transition-colors",
  chip: "rounded-xl border border-border bg-card/60 px-3 py-2 backdrop-blur-sm",
};

/* ---- Section entrance ---------------------------------------------------- */
/* When a section becomes the active page (its anchor marker crosses the
   viewport top — the exact moment the fold hands over), its content plays
   one short entrance. Variants keep sections from all moving the same way:
   rise (default), clip (type reveals), scatter (fragments converge — the
   problem section's scattered knowledge pulling together), activate (units
   light in sequence — the forge loop starting up), forge (layers settle —
   the AI pipeline coming together). Deterministic from-states, once-only,
   and disabled under prefers-reduced-motion. */
function useSectionEntrance(anchorId, variant = "rise") {
  const rootRef = useRef(null);
  const reduced = useReducedMotion();

  useMotionScope(
    ({ gsap, select }) => {
      if (reduced) return undefined;

      const label = select("[data-entrance='label']");
      const head = select("[data-entrance='head']");
      const lead = select("[data-entrance='lead']");
      const content = select("[data-entrance='content']");
      const aside = select("[data-entrance='aside']");
      if (!head.length) return undefined;

      /* fromTo + immediateRender:false + paused:true — nothing is hidden or
         played at mount (a non-paused timeline autoplays the moment a tween
         is added — that would fire every entrance on page load). The
         from-states apply the instant the trigger calls play(), one
         invisible frame, so StrictMode remounts and reverted contexts can
         never leave content stuck hidden. */
      const tl = gsap.timeline({
        paused: true,
        defaults: { ease: "expo.out", immediateRender: false, clearProps: "opacity,transform" },
      });

      if (variant === "clip") {
        tl.fromTo(
          head,
          { opacity: 0, y: 44, clipPath: "inset(100% 0% 0% 0%)" },
          { opacity: 1, y: 0, clipPath: "inset(0% 0% 0% 0%)", duration: 0.9, ease: "expo.out" },
          0,
        );
      } else {
        tl.fromTo(
          head,
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, duration: 0.8, ease: "expo.out" },
          0,
        );
      }
      tl.fromTo(
        label,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.55, ease: "expo.out" },
        0.05,
      )
        .fromTo(
          lead,
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.7, ease: "expo.out" },
          0.12,
        )
        .fromTo(
          aside,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.8, ease: "expo.out" },
          0.18,
        );

      if (variant === "scatter") {
        const units = [
          ...select("[data-entrance='content'] > *"),
          ...select("[data-entrance='aside'] > *"),
        ];
        tl.fromTo(
          units,
          {
            opacity: 0.45,
            x: () => gsap.utils.random(-16, 16),
            y: () => gsap.utils.random(-12, 12),
            rotation: () => gsap.utils.random(-1.6, 1.6),
          },
          { opacity: 1, x: 0, y: 0, rotation: 0, duration: 0.7, stagger: 0.09, ease: "power3.out" },
          0.18,
        );
      } else if (variant === "activate") {
        const units = [
          ...select("[data-entrance='content'] > *"),
          ...select("[data-entrance='aside'] > *"),
        ];
        tl.fromTo(
          units,
          { opacity: 0, y: 26 },
          { opacity: 1, y: 0, duration: 0.6, stagger: 0.13 },
          0.2,
        );
      } else if (variant === "forge") {
        const units = [
          ...select("[data-entrance='content'] > *"),
          ...select("[data-entrance='aside'] > *"),
        ];
        tl.fromTo(
          units,
          { opacity: 0, scale: 0.96 },
          { opacity: 1, scale: 1, duration: 0.8, stagger: 0.09 },
          0.16,
        );
      } else {
        tl.fromTo(
          content,
          { opacity: 0, y: 28 },
          { opacity: 1, y: 0, duration: 0.8, ease: "expo.out" },
          0.18,
        );
      }

      const marker = document.querySelector(`[data-anchor="${anchorId}"]`);
      const stage = document.querySelector(".forge-fold");
      let played = false;

      /* Slot top for the trigger: the anchor marker (placed by the fold's
         measure) when it exists; for the last page there is no marker, so
         derive it from the stage — the fold's own geometry. */
      const slotTop = () => {
        if (marker && marker.style.top) return parseFloat(marker.style.top);
        if (!stage) return -1;
        const sheets = stage.querySelectorAll(".forge-page-sheet");
        const last = sheets[sheets.length - 1];
        if (!last) return -1;
        return stage.offsetHeight - last.offsetHeight;
      };

      /* Scroll-based trigger: the entrance fires as the page arrives (the
         marker crosses the viewport top, i.e. scrollY reaches its slot).
         Ground truth is the fold's own geometry, so it always matches the
         handover — and it re-reads the marker each time, so re-measures
         (resize/fonts) can never desync it. */
      const check = () => {
        if (played) return;
        const top = slotTop();
        if (top < 0) return;
        if (window.scrollY >= top - 9) {
          played = true;
          tl.play();
        }
      };
      window.addEventListener("scroll", check, { passive: true });
      /* Also catch an arrival that predates this mount (refresh mid-page):
         poll a few frames until the fold's measure has placed the markers. */
      let frames = 0;
      const poll = () => {
        frames += 1;
        check();
        if (frames < 30 && !played) requestAnimationFrame(poll);
      };
      requestAnimationFrame(poll);
      return () => {
        window.removeEventListener("scroll", check);
      };
    },
    [reduced, anchorId, variant],
    rootRef,
  );

  return rootRef;
}

function Chapter({ num, label, title, lead, children, aside, anchorId, variant = "rise" }) {
  const rootRef = useSectionEntrance(anchorId, variant);
  return (
    <div ref={rootRef} className="grid gap-12 lg:gap-16">
      {/* Statement-first: the headline owns the chapter — a display statement
          running ~80% of the viewport width, above the detail. Micro-label
          above, support + content + aside below. */}
      <div className="max-w-[92vw] lg:max-w-[80%]">
        <p data-entrance="label" className={T.overline}>
          {num} — {label}
        </p>
        <h2 data-entrance="head" className={`${T.h2} mt-5`}>{title}</h2>
      </div>
      <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr] lg:gap-16">
        <div>
          <p data-entrance="lead" className={T.body}>{lead}</p>
          <div data-entrance="content">{children}</div>
        </div>
        {aside ? <div data-entrance="aside" className="flex flex-col">{aside}</div> : null}
      </div>
    </div>
  );
}

/* ---- Content data (real product copy, previously the book pages) ---------- */

const PROBLEMS = [
  {
    icon: MonitorPlay,
    title: "The biggest classroom ever",
    body: "Every video ends with a recommendation that isn't yours — and five minutes later you're somewhere else.",
  },
  {
    icon: MousePointerClick,
    title: "Learning is fragmented",
    body: "A tutorial here, a blog post there, an outdated doc. No structure, no sequence, no idea where the next step is.",
  },
  {
    icon: TimerOff,
    title: "Completion is the exception",
    body: "Without feedback and visible progress, momentum dies. Most learners abandon long before the finish line.",
  },
];

const STEPS = [
  {
    icon: CircleDot,
    step: "01",
    title: "Focus",
    tagline: "The path is set — distractions fall away.",
    body: "A structured path built from the best existing resources: sequenced, filtered, and stripped of every distraction.",
  },
  {
    icon: Hammer,
    step: "02",
    title: "Practice",
    tagline: "Active recall, on demand.",
    body: "AI-generated quizzes adapted to your topic, difficulty, and schedule. Active recall beats passive watching, every time.",
  },
  {
    icon: RefreshCw,
    step: "03",
    title: "Feedback",
    tagline: "Right or wrong is only half the story.",
    body: "Instant AI evaluation of every answer — not just right or wrong, but why, with personalized feedback per question.",
  },
  {
    icon: Flame,
    step: "04",
    title: "Momentum",
    tagline: "Progress you can see, and keep.",
    body: "Badges, streaks, weekly digests, and a learning-health score that make progress visible and keep you coming back.",
  },
];

const FEATURES = [
  {
    icon: Library,
    title: "A living library",
    body: "Topics and tags organise a real catalog — searchable, categorized, and kept clean by administrators.",
  },
  {
    icon: Command,
    title: "Global search & command palette",
    body: "⌘K from anywhere: keyboard-first navigation across resources, quizzes, and pages. No mouse required.",
  },
  {
    icon: Bookmark,
    title: "Bookmarks & ratings",
    body: "Build your own curriculum. Save resources, rate them, and let quality signals rise to the top.",
  },
  {
    icon: Search,
    title: "Progress-aware pages",
    body: "Every resource remembers where you are — visited, reading, or mastered. Pick up exactly where you left off.",
  },
];

const METRICS = [
  {
    icon: Gauge,
    value: 98,
    suffix: "+",
    label: "Lighthouse performance",
    note: "Targeted on every release",
  },
  {
    icon: Timer,
    value: 1.5,
    decimals: 1,
    suffix: "s",
    label: "First Contentful Paint",
    note: "Route-level code splitting",
  },
  {
    icon: ShieldCheck,
    value: 240,
    suffix: "+",
    label: "Automated tests",
    note: "Unit, integration, and contract",
  },
  {
    icon: Lightbulb,
    value: 0,
    suffix: "",
    label: "Lint warnings shipped",
    note: "Zero-warning gate in CI",
  },
];

const PRACTICE_CYCLE = [
  {
    mark: "Question",
    title: "Set the forge",
    body: "Pick a topic (or a week of your path), difficulty, question types, and count.",
  },
  {
    mark: "Attempt",
    title: "Generated to a strict schema",
    body: "Gemini writes the quiz against a validated schema — malformed output is retried automatically.",
  },
  {
    mark: "Evaluation",
    title: "Every answer judged, with reasons",
    body: "Your submission is evaluated per question: not just right or wrong, but why — with personalized explanation.",
  },
  {
    mark: "Feedback",
    title: "The why follows the wrong",
    body: "Feedback becomes the next lesson — the same gaps keep surfacing until they close.",
  },
  {
    mark: "Improvement",
    title: "Fair, bounded, resumable",
    body: "A per-user daily quota keeps the experience predictable. Quizzes resume mid-session and expire cleanly server-side.",
  },
];

const LAYERS = [
  {
    icon: Workflow,
    name: "Presentation",
    accent: "text-ember",
    chip: "bg-ember/12",
    items: ["React 19 + Vite", "GSAP motion engine", "JWT auth, lazy routes"],
  },
  {
    icon: Library,
    name: "Application",
    accent: "text-aurora",
    chip: "bg-aurora/12",
    items: ["Spring Boot 3, clean modules", "Rate limits + circuit breakers", "PostgreSQL + Flyway migrations"],
  },
  {
    icon: ShieldCheck,
    name: "AI Subsystem",
    accent: "text-ember",
    chip: "bg-ember/12",
    items: ["Prompt guardrails, schema validation", "Provider failover + retries", "Token & cost analytics"],
  },
];

const PRINCIPLES = [
  { icon: ShieldCheck, text: "No hardcoded secrets. Ever." },
  { icon: Workflow, text: "Small files, composed over inherited." },
  { icon: RefreshCw, text: "Retries, failover, graceful degradation." },
  { icon: Sparkles, text: "Metrics on every layer, correlation IDs everywhere." },
];

const PATH_STEPS = [
  {
    weeks: "01–04",
    title: "Pick a skill and a level",
    body: "The AI drafts a 12-week roadmap: week-by-week goals, topics, and resources for exactly the level you chose.",
  },
  {
    weeks: "05–08",
    title: "Work the weeks",
    body: "Mark weeks complete, take week quizzes, and let the path re-shape itself around what you've proven.",
  },
  {
    weeks: "09–12",
    title: "Finish, and prove it",
    body: "When the final week is complete the path auto-completes — and the Pathfinder badge is yours.",
  },
];

const MOMENTUM = [
  {
    icon: HeartPulse,
    label: "Learning health",
    body: "A single score that reflects consistency, balance, and completion.",
  },
  {
    icon: Flame,
    label: "Streaks",
    body: "A small ember for every day you show up. Momentum becomes a habit.",
  },
  {
    icon: Trophy,
    label: "Badges & achievements",
    body: "Pathfinder, quiz streaks, perfect scores — earned, never given.",
  },
  {
    icon: Mail,
    label: "Weekly digests",
    body: "A short recap of what you forged and what's next. No noise.",
  },
];

const ROLES = [
  {
    icon: BookOpen,
    role: "For learners",
    headline: "Your path, your pace, your proof",
    points: [
      "One focused workspace replacing scattered tabs",
      "AI quizzes after every learning session",
      "Visible progress: health score, mastery, badges",
    ],
    accent: "bg-ember/12 text-ember",
  },
  {
    icon: Library,
    role: "For instructors",
    headline: "Publish to the platform, not the void",
    points: [
      "Curate resources that become structured curriculum",
      "Track how learners engage with your content",
      "Quizzes and paths built around your material",
    ],
    accent: "bg-aurora/12 text-aurora",
  },
  {
    icon: ShieldCheck,
    role: "For administrators",
    headline: "Run the platform with clarity",
    points: [
      "User management: roles, activation, search",
      "Platform-wide statistics at a glance",
      "Every action audited with request tracing",
    ],
    accent: "bg-success/12 text-success",
  },
];

const FAQS = [
  {
    question: "How is SkillForge different from YouTube?",
    answer:
      "We don't host courses — we structure what already exists: sequenced paths, no recommendations, AI practice and progress tracking.",
  },
  {
    question: "How does AI quiz generation work?",
    answer:
      "Pick topic, difficulty, types, and count. Gemini generates to a strict schema, validated and retried automatically, then your submission is evaluated per question.",
  },
  {
    question: "What if I don't finish a quiz?",
    answer:
      "Quizzes stay in progress with a server-side deadline. Returned after expiry, they abandon cleanly — mid-session refreshes resume exactly where you left off.",
  },
  {
    question: "Is AI usage limited?",
    answer:
      "A per-user daily question quota keeps the experience responsive. You'll see your remaining quota in the setup screen, and it resets daily.",
  },
  {
    question: "What are learning paths?",
    answer:
      "AI-generated 12-week roadmaps with week-by-week goals, topics, and resources. Complete the path and earn the Pathfinder badge.",
  },
  {
    question: "What does it cost?",
    answer:
      "Paths, bookmarks, analytics, achievements, and weekly digests are free. AI practice runs on a transparent daily quota while we calibrate fair pricing.",
  },
];

const TESTIMONIALS = [
  {
    quote:
      "I'd watched 200 hours of tutorials and finished nothing. SkillForge's path told me what to do next — and the quizzes proved I actually knew it.",
    name: "Ananya Rao",
    title: "Backend developer, self-taught",
    initials: "AR",
  },
  {
    quote:
      "The AI feedback is the difference. Getting a detailed 'why' on every quiz answer feels like having a mentor who always has time.",
    name: "Marcus Chen",
    title: "CS student",
    initials: "MC",
  },
  {
    quote:
      "As an instructor I finally see engagement data. It changed how I structure my material — and my students finish more of it.",
    name: "Elena Vasquez",
    title: "Systems design instructor",
    initials: "EV",
  },
];

/* ---- Section shells -------------------------------------------------------- */

function Section({ id, children, className = "" }) {
  return (
    <section id={id} className={`forge-section ${className}`}>
      <div className="forge-container">{children}</div>
    </section>
  );
}

/* ---- Scroll-scrubbed step sequence ---------------------------------------- */
/* As a section's page window opens (scrollY inside the first ~22% of the
   page), its steps light in sequence — scroll position IS the progress,
   so the sequence is reversible and fast-scroll safe. Ground truth is the
   fold's marker geometry (same as the entrances), so it always matches the
   handover. Direct style writes on refs only — no React state per frame. */
function useScrubReveal(anchorId) {
  const reduced = useReducedMotion();
  useEffect(() => {
    if (reduced) return undefined;
    const section = document.querySelector(`section[id="${anchorId}"]`);
    const stage = document.querySelector(".forge-fold");
    if (!section || !stage) return undefined;
    const steps = [...section.querySelectorAll("[data-scrub-step]")];
    const rail = section.querySelector("[data-scrub-rail] > span");
    if (!steps.length) return undefined;

    const apply = () => {
      const tops = [...document.querySelectorAll("[data-anchor]")]
        .map((m) => ({ id: m.dataset.anchor, top: parseFloat(m.style.top) || 0 }))
        .sort((a, b) => a.top - b.top);
      const idx = tops.findIndex((t) => t.id === anchorId);
      const top = idx >= 0 ? tops[idx].top : -1;
      if (top < 0) return;
      const nextTop = idx + 1 < tops.length ? tops[idx + 1].top : -1;
      const pageHeight = nextTop > top ? nextTop - top : stage.offsetHeight - top;
      const windowPx = Math.max(200, pageHeight * 0.22);
      const p = Math.min(1, Math.max(0, (window.scrollY - top) / windowPx));
      steps.forEach((step, i) => {
        const active = p > i / steps.length;
        if (step.style.opacity !== active) step.style.opacity = active ? "1" : "0.32";
        step.style.transform = active ? "translate3d(0,0,0)" : "translate3d(-12px,0,0)";
      });
      if (rail) rail.style.transform = `scaleX(${p.toFixed(3)})`;
    };

    apply();
    let raf = 0;
    const onScroll = () => {
      if (!raf) {
        raf = requestAnimationFrame(() => {
          raf = 0;
          apply();
        });
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    let frames = 0;
    const poll = () => {
      frames += 1;
      apply();
      if (frames < 30) requestAnimationFrame(poll);
    };
    requestAnimationFrame(poll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reduced, anchorId]);
}

/* ---- 1 · Hero -------------------------------------------------------------- */

function useNearViewport(ref, anchorId) {
  const [near, setNear] = useState(false);
  useEffect(() => {
    /* In the Forge Fold every sheet is pinned to the viewport top, so a
       section's own rect is ALWAYS "near". The anchor marker is static at
       the section's measured slot — use the fold's geometry directly. In
       the static (reduced-motion) layout there is no marker, so fall back
       to the section itself. */
    const marker =
      (anchorId && document.querySelector(`[data-anchor="${anchorId}"]`)) || null;
    if (!marker && !ref.current) {
      setNear(true);
      return undefined;
    }
    const stage = document.querySelector(".forge-fold");

    /* Fire when the marker is within ~500px below the viewport bottom —
       the classic "about to arrive" moment. Mirrors useSectionEntrance's
       geometry (marker style.top or derived last-page slot). */
    const slotTop = () => {
      if (marker && marker.style.top) return parseFloat(marker.style.top);
      if (!stage) return -1;
      const sheets = stage.querySelectorAll(".forge-page-sheet");
      const last = sheets[sheets.length - 1];
      if (!last) return -1;
      return stage.offsetHeight - last.offsetHeight;
    };
    const vh = () => window.innerHeight || 800;
    let fired = false;

    const check = () => {
      if (fired) return;
      const top = slotTop();
      if (top < 0) return;
      if (window.scrollY >= top - vh() - 500) {
        fired = true;
        setNear(true);
      }
    };
    window.addEventListener("scroll", check, { passive: true });
    let frames = 0;
    const poll = () => {
      frames += 1;
      check();
      if (frames < 30 && !fired) requestAnimationFrame(poll);
    };
    requestAnimationFrame(poll);
    return () => window.removeEventListener("scroll", check);
  }, [ref, anchorId]);
  return near;
}

function HeroSection({ cap }) {
  const rootRef = useRef(null);
  const reduced = useReducedMotion();

  useMotionScope(
    ({ gsap, select }) => {
      if (reduced) return;
      const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
      tl.from(select("[data-hero='badge']"), { opacity: 0, y: 16, duration: 0.55 }, 0)
        .from(select("[data-hero='title']"), { opacity: 0, y: 28, duration: 0.7 }, 0.08)
        .from(select("[data-hero='subtitle']"), { opacity: 0, y: 24, duration: 0.7 }, 0.18)
        .from(select("[data-hero='cta']"), { opacity: 0, y: 20, duration: 0.6 }, 0.28)
        .from(select("[data-hero='scroll']"), { opacity: 0, duration: 0.6 }, 1);

      /* Hero-scroll response: as the hero gives way to the fold, the cap
         recedes — it scales slightly down, sinks, and fades, so the
         transition feels authored rather than abrupt. Scroll-scrubbed:
         the user owns it. The copy drifts up and lets go at the same
         pace, so the whole first chapter exits as one gesture. */
      const capWrap = select("[data-cap-slot] > div");
      if (capWrap.length) {
        gsap.fromTo(
          capWrap,
          { scale: 1, opacity: 1, yPercent: 0 },
          {
            scale: 0.92,
            opacity: 0.45,
            yPercent: 10,
            ease: "none",
            scrollTrigger: {
              trigger: rootRef.current,
              start: "top top",
              end: "bottom 45%",
              scrub: 0.4,
            },
          },
        );
      }
      const copyWrap = select("[data-hero-copy]");
      if (copyWrap.length) {
        gsap.fromTo(
          copyWrap,
          { yPercent: 0, opacity: 1 },
          {
            yPercent: -8,
            opacity: 0.88,
            ease: "none",
            scrollTrigger: {
              trigger: rootRef.current,
              start: "top top",
              end: "bottom 45%",
              scrub: 0.4,
            },
          },
        );
      }

      /* Pointer parallax (desktop fine pointers only): two depth layers —
         the background scrims move 1x and the cap 4x (handled inside the
         3D scene). Small, slow, and damped. */
      if (!window.matchMedia("(pointer: fine)").matches) return undefined;
      const bgWrap = select("[data-parallax='bg']")[0];
      if (!bgWrap) return undefined;
      const bgX = gsap.quickTo(bgWrap, "x", { duration: 1.6, ease: "power2.out" });
      const bgY = gsap.quickTo(bgWrap, "y", { duration: 1.6, ease: "power2.out" });
      const onMove = (event) => {
        const nx = event.clientX / window.innerWidth - 0.5;
        const ny = event.clientY / window.innerHeight - 0.5;
        bgX(nx * -8);
        bgY(ny * -5);
      };
      window.addEventListener("pointermove", onMove, { passive: true });
      return () => window.removeEventListener("pointermove", onMove);
    },
    [reduced],
    rootRef,
  );

  return (
    <section ref={rootRef} id="top" className="relative min-h-svh overflow-hidden">
      {/* The giant graduation cap — only here, only on the hero. Decorative,
          never blocks input. On desktop it anchors to the right edge BELOW
          the statement (the statement block ends at ~59-67svh as the display
          type wraps wider), so the cap's mass never covers the H1, the CTAs,
          or the navbar. On mobile it stays centered behind the copy so the
          statement always stays readable. */}
      <div
        data-cap-slot
        aria-hidden="true"
        className="pointer-events-none absolute right-0 top-[68svh] z-0"
      >
        <div data-cap-scrub>
          <div className="aspect-square w-[98vw] sm:w-[82vw] lg:w-[56vw] 2xl:w-[64vw]">
            {cap}
          </div>
        </div>
      </div>

      {/* Readability scrims above the cap, below the copy */}
      <div
        data-parallax="bg"
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,color-mix(in_oklch,var(--ember)_10%,transparent)_0%,transparent_55%)]" />
        <div className="absolute inset-0 animate-aurora bg-[radial-gradient(ellipse_60%_50%_at_80%_20%,color-mix(in_oklch,var(--aurora)_10%,transparent)_0%,transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_52%_46%_at_60%_55%,color-mix(in_oklch,var(--background)_78%,transparent)_0%,transparent_72%)]" />
        <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-background to-transparent" />
      </div>

      <div className="relative z-20 flex min-h-svh flex-col items-center justify-center px-6 py-24 lg:items-start lg:px-16 lg:py-16">
        <div data-hero-copy className="flex w-full justify-center lg:justify-start">
          <HeroContent />
        </div>

        <a
          data-hero="scroll"
          href="#what-is"
          aria-label="Scroll to learn more"
          className="absolute bottom-6 right-8 hidden flex-col items-center gap-2 text-muted-foreground transition-colors hover:text-foreground md:flex"
        >
          <span className="text-[0.6875rem] font-medium uppercase tracking-[0.18em]">
            Scroll
          </span>
          <span className="flex h-9 w-6 items-start justify-center rounded-full border border-muted-foreground/30 p-1.5">
            <span className="size-1.5 animate-scroll-dot rounded-full bg-current" />
          </span>
        </a>
      </div>
    </section>
  );
}

/* ---- 2 · Problem ----------------------------------------------------------- */

function ProblemSection() {
  return (
    <Section id="what-is">
      <Chapter
        num="01"
        label="The problem"
        title="The world's best classroom. Also its most distracting one."
        lead="Great teachers are everywhere. Great learning environments are not. The raw material for any skill exists — what's missing is a workspace built around finishing."
        anchorId="what-is"
        variant="scatter"
        aside={
          <div>
            <p className={T.overline}>The answer in one screen</p>
            <h3 className={`${T.h3} mt-2`}>One focused workspace, zero tab soup</h3>
            <div className="mt-5">
              <DashboardMock />
            </div>
            <p className={`${T.body} mt-5`}>
              Paths, quizzes, health score, and proof of progress — everything
              a learner needs to actually finish lives in one place.
            </p>
            <p className={`${T.small} ${T.ember} mt-4 font-semibold`}>
              The forge exists so completion stops being the exception.
            </p>
          </div>
        }
      >
        <ul className="mt-8 space-y-3">
          {PROBLEMS.map(({ icon: Icon, title, body }) => (
            <li key={title} className={`${T.card} flex items-start gap-4 p-4`}>
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
                <Icon className="size-4" />
              </span>
              <span>
                <span className={`${T.small} block font-semibold text-foreground`}>
                  {title}
                </span>
                <span className={`${T.small} ${T.body} mt-1 block`}>{body}</span>
              </span>
            </li>
          ))}
        </ul>
      </Chapter>

      {/* Signature motif — the repeated typography that stitches the chapters
          together. Bleeds to the sheet edges, ghosted, never interactive. */}
      <Marquee className="absolute inset-x-0 bottom-2" />
    </Section>
  );
}

/* ---- 3 · Forge loop -------------------------------------------------------- */

function LoopSection() {
  return (
    <Section id="how-it-works">
      <Chapter
        num="02"
        label="The forge loop"
        title="People don't fail for lack of material. They fail because they lose the loop."
        lead="Focus → Practice → Feedback → Momentum. Repeat. The loop is the product — every feature exists to keep it turning."
        anchorId="how-it-works"
        variant="activate"
        aside={
          <div>
            <p className={T.overline}>The loop, continued</p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {STEPS.slice(2).map(({ icon: Icon, step, title, tagline, body }) => (
                <div key={step} className={`${T.card} p-4`}>
                  <div className="flex items-center justify-between">
                    <span className="flex size-9 items-center justify-center rounded-xl bg-ember/12 text-ember">
                      <Icon className="size-4" />
                    </span>
                    <span className="flex size-6 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                      {step}
                    </span>
                  </div>
                  <p className="mt-3 text-base font-bold">{title}</p>
                  <p className={`${T.small} ${T.ember} mt-0.5 font-semibold`}>{tagline}</p>
                  <p className={`${T.small} ${T.body} mt-1`}>{body}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between rounded-2xl border border-border bg-ember/8 px-5 py-3.5">
              {["Focus", "Practice", "Feedback", "Momentum"].map((label, index) => (
                <div key={label} className="flex items-center gap-2">
                  <span
                    className={`text-sm font-bold ${
                      index === 3 ? "text-ember" : "text-muted-foreground"
                    }`}
                  >
                    {label}
                  </span>
                  {index < 3 && (
                    <span aria-hidden="true" className="h-px w-3 bg-border sm:w-5" />
                  )}
                </div>
              ))}
            </div>
            <p className={`${T.small} ${T.body} mt-3 text-center`}>
              …then repeat. Momentum compounds.
            </p>
          </div>
        }
      >
        <ul className="mt-8 space-y-3">
          {STEPS.slice(0, 2).map(({ icon: Icon, step, title, tagline, body }) => (
            <li key={step} className={`${T.card} flex items-start gap-4 p-4`}>
              <div className="relative shrink-0">
                <span className="flex size-10 items-center justify-center rounded-xl bg-ember/12 text-ember">
                  <Icon className="size-4" />
                </span>
                <span className="absolute -right-2 -top-2 flex size-6 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {step}
                </span>
              </div>
              <div>
                <p className="text-base font-bold">{title}</p>
                <p className={`${T.small} ${T.ember} mt-0.5 font-semibold`}>{tagline}</p>
                <p className={`${T.small} ${T.body} mt-1`}>{body}</p>
              </div>
            </li>
          ))}
        </ul>
      </Chapter>
    </Section>
  );
}

/* ---- 4 · Workspace ---------------------------------------------------------- */

function WorkspaceSection() {
  return (
    <Section id="workspace">
      <Chapter
        num="03"
        label="The workspace"
        title="A workspace built around finishing"
        lead="Every surface exists for one job: keep the learner in flow. Search is instant, navigation is keyboard-first, and your library is yours."
        anchorId="workspace"
        aside={
          <div>
            <p className={T.overline}>The budget</p>
            <h3 className={`${T.h3} mt-2`}>
              Fast is a feature.{" "}
              <span className="text-gradient-ember">Here's the budget.</span>
            </h3>
            <p className={`${T.body} mt-2`}>
              Targets, not slogans — every release is measured against them.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              {METRICS.map(({ icon: Icon, value, suffix, decimals = 0, label, note }) => (
                <div key={label} className={`${T.card} p-4`}>
                  <div className="flex items-center justify-between">
                    <span className="flex size-8 items-center justify-center rounded-lg bg-ember/12 text-ember">
                      <Icon className="size-4" />
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      Target
                    </span>
                  </div>
                  <p className="mt-4 text-3xl font-bold tabular-nums tracking-tight">
                    <CountUp to={value} decimals={decimals} suffix={suffix} />
                  </p>
                  <p className="mt-0.5 text-base font-semibold">{label}</p>
                  <p className={`${T.small} ${T.body} mt-0.5`}>{note}</p>
                </div>
              ))}
            </div>
            <p className={`${T.small} ${T.ember} mt-4 font-semibold`}>
              Respect for the learner's hardware is part of the product.
            </p>
          </div>
        }
      >
        <ul className="mt-8 grid gap-3 sm:grid-cols-2">
          {FEATURES.map(({ icon: Icon, title, body }) => (
            <li key={title} className={`${T.card} flex flex-col gap-3 p-4`}>
              <span className="flex size-9 items-center justify-center rounded-xl bg-ember/12 text-ember">
                <Icon className="size-4" />
              </span>
              <span>
                <span className={`${T.small} block font-semibold text-foreground`}>
                  {title}
                </span>
                <span className={`${T.small} ${T.body} mt-1 block`}>{body}</span>
              </span>
            </li>
          ))}
        </ul>
      </Chapter>
    </Section>
  );
}

/* ---- 5 · The AI ------------------------------------------------------------- */

function AiSection() {
  useScrubReveal("architecture");
  return (
    <Section id="architecture">
      <Chapter
        num="04"
        label="The AI"
        title="Practice, forged on demand"
        lead="Not a chatbot bolted on — a guarded, validated, observable pipeline that turns any topic into active recall."
        anchorId="architecture"
        variant="forge"
        aside={
          <div>
            <p className={T.overline}>The engineering</p>
            <h3 className={`${T.h3} mt-2`}>
              Forged like it{" "}
              <span className="text-gradient-ember">has to survive contact.</span>
            </h3>
            <p className={`${T.body} mt-2`}>
              A production system engineered end-to-end: resilient AI, honest
              data, a frontend that respects your hardware.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {LAYERS.map(({ icon: Icon, name, accent, chip, items }) => (
                <div key={name} className={`${T.card} p-3.5`}>
                  <span className={`flex size-8 items-center justify-center rounded-lg ${chip} ${accent}`}>
                    <Icon className="size-4" />
                  </span>
                  <p className="mt-2.5 text-sm font-bold">{name}</p>
                  <ul className="mt-2 space-y-1.5">
                    {items.map((item) => (
                      <li key={item} className={`${T.small} ${T.body} leading-snug`}>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {PRINCIPLES.map(({ icon: Icon, text }) => (
                <div key={text} className={`${T.chip} flex items-center gap-2`}>
                  <Icon className="size-3.5 shrink-0 text-ember" />
                  <span className={`${T.small} ${T.body}`}>{text}</span>
                </div>
              ))}
            </div>
            <p className={`${T.small} ${T.ember} mt-3 font-semibold`}>
              <Sparkles className="mr-1 inline size-3" />
              Every layer ships with observability, health checks, and metrics.
            </p>
          </div>
        }
      >
        {/* The practice cycle — question, attempt, evaluation, feedback,
            improvement. Each step lights as the page's window opens (the
            scroll position IS the progress). */}
        <div
          data-scrub-rail
          aria-hidden="true"
          className="mt-8 h-px w-full overflow-hidden bg-border"
        >
          <span className="block h-full w-full origin-left bg-ember" style={{ transform: "scaleX(0)" }} />
        </div>
        <ol className="mt-6 space-y-3">
          {PRACTICE_CYCLE.map(({ mark, title, body }, index) => (
            <li
              key={title}
              data-scrub-step
              className={`${T.card} flex items-start gap-4 p-4`}
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-ember/12 text-sm font-bold text-ember">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="min-w-0">
                <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-ember">
                  {mark}
                </span>
                <span className={`${T.small} block font-semibold text-foreground`}>
                  {title}
                </span>
                <span className={`${T.small} ${T.body} mt-1 block`}>{body}</span>
              </span>
            </li>
          ))}
        </ol>
      </Chapter>
    </Section>
  );
}

/* ---- 6 · Roadmap + momentum ------------------------------------------------- */

function RoadmapSection() {
  useScrubReveal("experience");
  return (
    <Section id="experience">
      <Chapter
        num="05"
        label="The roadmap"
        title="Twelve weeks from starting to proven"
        lead="Instead of 'learn React someday', a week-by-week path with goals, resources, and quizzes — auto-completed when you finish, and it knows when you have."
        anchorId="experience"
        variant="activate"
        aside={
          <div>
            <p className={T.overline}>The momentum layer</p>
            <h3 className={`${T.h3} mt-2`}>Progress you can see, and keep</h3>
            <p className={`${T.body} mt-2`}>
              Nothing in SkillForge gamifies for its own sake. Each signal
              exists to make the next session slightly more likely.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              {MOMENTUM.map(({ icon: Icon, label, body }) => (
                <div key={label} className={`${T.card} p-4`}>
                  <span className="flex size-8 items-center justify-center rounded-lg bg-ember/12 text-ember">
                    <Icon className="size-4" />
                  </span>
                  <p className="mt-3 text-base font-bold">{label}</p>
                  <p className={`${T.small} ${T.body} mt-1`}>{body}</p>
                </div>
              ))}
            </div>
            <p className={`${T.small} ${T.ember} mt-4 flex items-center gap-1.5 font-semibold`}>
              <Award className="size-3.5" />
              Finish one session, and the next one starts warmer.
            </p>
          </div>
        }
      >
        {/* The path — a line that grows as the page's window opens, then the
            milestones light one by one. */}
        <div
          data-scrub-rail
          aria-hidden="true"
          className="mt-8 h-px w-full overflow-hidden bg-border"
        >
          <span className="block h-full w-full origin-left bg-ember" style={{ transform: "scaleX(0)" }} />
        </div>
        <ul className="mt-6 space-y-3">
          {PATH_STEPS.map(({ weeks, title, body }) => (
            <li key={title} data-scrub-step className={`${T.card} flex items-start gap-4 p-4`}>
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-aurora/15 text-aurora">
                <CalendarDays className="size-4" />
              </span>
              <span>
                <span className={`${T.small} block font-semibold text-foreground`}>
                  Week {weeks} — {title}
                </span>
                <span className={`${T.small} ${T.body} mt-1 block`}>{body}</span>
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-4 flex items-center gap-3 rounded-2xl border border-border bg-ember/8 px-5 py-4">
          <Award className="size-5 shrink-0 text-ember" />
          <p className={`${T.small} ${T.body}`}>
            <span className="font-semibold text-foreground">Pathfinder</span> —
            the badge awarded for completing a path start to finish.
          </p>
        </div>
      </Chapter>
    </Section>
  );
}

/* ---- 7 · Knowledge map ------------------------------------------------------- */

function KnowledgeSection() {
  const sectionRef = useRef(null);
  const near = useNearViewport(sectionRef, "knowledge");

  return (
    <section ref={sectionRef} id="knowledge" className="forge-section">
      <div className="forge-container">
        <Chapter
          num="06"
          label="The knowledge map"
          title="The catalog, alive"
          lead="Every topic in the library — live from the platform. Follow any node to the resources, quizzes, and paths built around it."
          anchorId="knowledge"
          aside={
            <div>
              <p className={T.overline}>One platform, three roles</p>
              <h3 className={`${T.h3} mt-2`}>
                Everyone who touches learning gets a workspace
              </h3>
              <ul className="mt-5 grid gap-3">
                {ROLES.map(({ icon: Icon, role, headline, points, accent }) => (
                  <li key={role} className={`${T.card} flex items-start gap-4 p-4`}>
                    <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${accent}`}>
                      <Icon className="size-4" />
                    </span>
                    <span className="min-w-0">
                      <span className={`${T.small} block font-semibold uppercase tracking-[0.14em] text-muted-foreground`}>
                        {role}
                      </span>
                      <span className="mt-0.5 block text-base font-bold">{headline}</span>
                      <ul className="mt-1.5 space-y-1">
                        {points.map((point) => (
                          <li key={point} className="flex items-start gap-2">
                            <span className="mt-1.5 size-1 shrink-0 rounded-full bg-ember" />
                            <span className={`${T.small} ${T.body} leading-snug`}>
                              {point}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          }
        >
          <div className="relative mt-8 h-[52svh] min-h-[24rem]">
            {/* 3D knowledge constellation — ambient backdrop, deferred until
                the section nears the viewport, never blocks the map. */}
            {near && (
              <KnowledgeConstellation className="absolute inset-0 h-full w-full opacity-50" />
            )}
            <div className="absolute inset-0">
              <KnowledgeMap />
            </div>
          </div>
          <p className={`${T.small} ${T.body} mt-3 text-center`}>
            Topics and tags keep the catalog navigable — governed by
            administrators, consumed by everyone.
          </p>
        </Chapter>
      </div>
    </section>
  );
}

/* ---- 8 · FAQ + voices --------------------------------------------------------- */

function FaqSection() {
  return (
    <Section id="faq">
      <Chapter
        num="07"
        label="Questions & voices"
        title="Questions, answered"
        lead="Everything you might want to know before you forge your first skill."
        anchorId="faq"
        aside={
          <div>
            <p className={T.overline}>Voices from the forge</p>
            <h3 className={`${T.h3} mt-2`}>
              What happens when learners keep the loop
            </h3>
            <ul className="mt-5 flex flex-col justify-center gap-3">
              {TESTIMONIALS.map(({ quote, name, title, initials }) => (
                <li key={name} className={`${T.card} p-4`}>
                  <Quote className="size-4 text-ember" aria-hidden="true" />
                  <blockquote className={`${T.small} mt-1.5 leading-relaxed`}>
                    {quote}
                  </blockquote>
                  <figcaption className="mt-3 flex items-center gap-2.5">
                    <Avatar className="size-8 border">
                      <AvatarFallback className="bg-ember/15 text-[10px] font-semibold text-ember">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <span>
                      <span className={`${T.small} block font-semibold`}>{name}</span>
                      <span className={`${T.small} ${T.body}`}>{title}</span>
                    </span>
                  </figcaption>
                </li>
              ))}
            </ul>
          </div>
        }
      >
        <Accordion type="multiple" className="mt-8 space-y-2">
          {FAQS.map(({ question, answer }) => (
            <AccordionItem
              key={question}
              value={question}
              className="rounded-xl border border-border bg-card/60 px-4 backdrop-blur-sm"
            >
              <AccordionTrigger className="py-3 text-left text-sm font-semibold">
                {question}
              </AccordionTrigger>
              <AccordionContent className={`${T.small} ${T.body}`}>
                {answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Chapter>
    </Section>
  );
}

/* ---- 9 · Final CTA ------------------------------------------------------------- */

function FinalSection() {
  const primaryCtaRef = useRef(null);
  useMagnetic(primaryCtaRef);
  const rootRef = useSectionEntrance("final", "clip");

  return (
    <Section id="final">
      <div
        ref={rootRef}
        className="flex min-h-[70svh] flex-col items-center justify-center text-center"
      >
        <p data-entrance="label" className={`${T.overline} ${T.ember}`}>The final chapter</p>
        <h2 data-entrance="head" className={`${T.h2} mt-5 max-w-[24ch]`}>
          Your next chapter{" "}
          <span className="text-gradient-ember">starts here.</span>
        </h2>
        <p data-entrance="lead" className={`${T.body} mt-5 max-w-[48ch]`}>
          Stop collecting tutorials. Start forging skills. Your first quiz is
          one minute away — your first badge is closer than you think.
        </p>
        <div data-entrance="content" className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
          <div ref={primaryCtaRef}>
            <Button
              asChild
              size="lg"
              className="group h-12 w-full rounded-full px-7 text-base shadow-lg shadow-ember/25 sm:w-auto"
            >
              <Link to={ROUTES.REGISTER}>
                Forge your first skill
                <ArrowRight className="ml-2 size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
              </Link>
            </Button>
          </div>
          <Button asChild variant="outline" size="lg" className="h-12 w-full rounded-full px-7 text-base sm:w-auto">
            <Link to={ROUTES.LOGIN}>I already have an account</Link>
          </Button>
        </div>
        <p className={`${T.small} ${T.body} mt-8`}>
          Forged with focus, practiced with intent.
        </p>
      </div>
    </Section>
  );
}

/* ---- Section registry -------------------------------------------------------- */

export const HeroSectionComponent = HeroSection;
export const ProblemSectionComponent = ProblemSection;
export const LoopSectionComponent = LoopSection;
export const WorkspaceSectionComponent = WorkspaceSection;
export const AiSectionComponent = AiSection;
export const RoadmapSectionComponent = RoadmapSection;
export const KnowledgeSectionComponent = KnowledgeSection;
export const FaqSectionComponent = FaqSection;
export const FinalSectionComponent = FinalSection;