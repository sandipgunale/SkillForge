import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Award,
  BookOpen,
  Bookmark,
  CircleDot,
  Command,
  Flame,
  Hammer,
  HeartPulse,
  Library,
  Mail,
  Quote,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Trophy,
  Workflow,
} from "lucide-react";

import { Button } from "@/components/ui/button";
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
      <div
        className={`grid gap-12 lg:gap-16 ${
          aside ? "lg:grid-cols-[1.3fr_1fr]" : "max-w-[72ch]"
        }`}
      >
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

/* The forge assembly — the system's spine, demonstrated unit by unit as the
   chapter's window opens: resource → roadmap → practice → quiz → feedback →
   progress. Scroll position IS the assembly; it reads like a machine putting
   itself together. */
const FORGE_ASSEMBLY = [
  {
    icon: Library,
    title: "Resource",
    body: "A living library of real topics and resources — searchable, rated, and kept clean.",
  },
  {
    icon: Workflow,
    title: "Roadmap",
    body: "The AI drafts a 12-week path: week-by-week goals, topics, and resources for exactly your level.",
  },
  {
    icon: Hammer,
    title: "Practice",
    body: "Active recall on demand — AI quizzes adapted to your topic, difficulty, and schedule.",
  },
  {
    icon: CircleDot,
    title: "Quiz",
    body: "Generated to a strict schema, validated and retried automatically — every answer judged with reasons.",
  },
  {
    icon: RefreshCw,
    title: "Feedback",
    body: "Not just right or wrong, but why — feedback becomes the next lesson until the gaps close.",
  },
  {
    icon: Flame,
    title: "Progress",
    body: "Badges, streaks, health score, weekly digests — progress you can see, and keep.",
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
    num: "01",
    weeks: "01–04",
    title: "Pick a skill and a level",
    body: "The AI drafts a 12-week roadmap: week-by-week goals, topics, and resources for exactly the level you chose.",
  },
  {
    num: "02",
    weeks: "05–08",
    title: "Work the weeks",
    body: "Mark weeks complete, take week quizzes, and let the path re-shape itself around what you've proven.",
  },
  {
    num: "03",
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
    const nums = [...section.querySelectorAll("[data-scrub-num]")];
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
      nums.forEach((el) => {
        const to = Number(el.dataset.to || 0);
        const value = Math.round(to * p);
        const base = el.dataset.pad
          ? String(value).padStart(Number(el.dataset.pad), "0")
          : String(value);
        const text = base + (el.dataset.suffix || "");
        if (el.textContent !== text) el.textContent = text;
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

/* The noise — the infinite internet rendered as typographic fragments.
   Art-directed positions (deterministic, not random): a loose drift of
   content-kind labels. It lives ONLY in the Direction chapter, where the
   chapter's scrub drives it from sparse whisper → full chaos → abrupt
   silence (only the word DIRECTION remains). Pure decoration: aria-hidden,
   pointer-events none, hidden below lg. */
const NOISE_FRAGMENTS = [
  { label: "tutorial", x: 6, y: 12, dx: -80, dy: -55 },
  { label: "video", x: 18, y: 24, dx: 65, dy: -45 },
  { label: "article", x: 8, y: 40, dx: -60, dy: 65 },
  { label: "course", x: 15, y: 52, dx: 70, dy: 45 },
  { label: "docs", x: 42, y: 10, dx: -50, dy: -60 },
  { label: "slides", x: 30, y: 14, dx: -65, dy: -40 },
  { label: "forum", x: 58, y: 9, dx: 45, dy: -50 },
  { label: "repo", x: 72, y: 18, dx: 60, dy: 55 },
  { label: "notes", x: 86, y: 13, dx: 65, dy: -55 },
  { label: "podcast", x: 93, y: 32, dx: 55, dy: 50 },
  { label: "thread", x: 80, y: 44, dx: -60, dy: 60 },
  { label: "book", x: 64, y: 36, dx: -45, dy: -65 },
  { label: "cheatsheet", x: 50, y: 28, dx: -65, dy: 50 },
  { label: "workshop", x: 36, y: 44, dx: 50, dy: -55 },
];

function NoiseField() {
  return (
    <div
      data-noise-field
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-10 hidden overflow-hidden lg:block"
    >
      {NOISE_FRAGMENTS.map(({ label, x, y, dx, dy }) => (
        <span
          key={label}
          data-noise-frag
          data-dx={dx}
          data-dy={dy}
          className="absolute rounded-full border border-border/60 bg-card/40 px-3 py-1 text-[0.625rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground/70 backdrop-blur-sm"
          style={{ left: `${x}%`, top: `${y}%` }}
        >
          {label}
        </span>
      ))}
    </div>
  );
}

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

/* ---- 2 · Information --------------------------------------------------------- */
/* Visual silence: one statement, one quiet line, nothing else. The chapter
   after the hero is the moment of emptiness — almost an empty viewport, so
   the next chapter's noise lands harder. */

function ProblemSection() {
  return (
    <Section id="what-is">
      <Chapter
        num="01"
        label="Information"
        title="More information doesn't create more skill."
        lead="The world's best classroom. Also its most distracting one."
        anchorId="what-is"
      >
        <p className={`${T.small} ${T.body} mt-8`}>
          The raw material for any skill already exists. What's missing is
          direction.
        </p>
      </Chapter>
    </Section>
  );
}

/* ---- 3 · Direction ------------------------------------------------------------ */
/* The problem, dramatized. A single monumental word, DIRECTION — and around
   it, typographic fragments of the infinite internet. As the chapter's
   window opens the chaos builds: fragments drift in from off-axis, jitter,
   and cluster — then everything abruptly simplifies, scattering outward and
   dissolving until only the word remains. Silence → chaos → silence. The
   word never moves; the chaos does. Direct style writes on the fold's own
   marker geometry (same as useScrubReveal) — no ScrollTrigger, so the
   choreography always matches the page handover. */

/* Fragment scatter choreography: p (0→1 across the chapter's window) maps
   to two phases. Phase 1 — the chaos builds (sparse whisper → full field).
   Phase 2 — the abrupt simplification (everything scatters outward and
   dissolves). Deterministic per-fragment targets, index-staggered so the
   field feels alive rather than mechanical. */
function useScrubFragments(anchorId) {
  const reduced = useReducedMotion();
  useEffect(() => {
    if (reduced) return undefined;
    const section = document.querySelector(`section[id="${anchorId}"]`);
    const stage = document.querySelector(".forge-fold");
    if (!section || !stage) return undefined;
    const frags = [...section.querySelectorAll("[data-noise-frag]")];
    if (!frags.length) return undefined;

    const apply = () => {
      const tops = [...document.querySelectorAll("[data-anchor]")]
        .map((m) => ({ id: m.dataset.anchor, top: parseFloat(m.style.top) || 0 }))
        .sort((a, b) => a.top - b.top);
      const idx = tops.findIndex((t) => t.id === anchorId);
      const top = idx >= 0 ? tops[idx].top : -1;
      if (top < 0) return;
      const nextTop = idx + 1 < tops.length ? tops[idx + 1].top : -1;
      const pageHeight = nextTop > top ? nextTop - top : stage.offsetHeight - top;
      const windowPx = Math.max(200, pageHeight * 0.55);
      const p = Math.min(1, Math.max(0, (window.scrollY - top) / windowPx));
      frags.forEach((el, i) => {
        const pi = Math.min(1, Math.max(0, p - i * 0.02));
        const dx = Number(el.dataset.dx);
        const dy = Number(el.dataset.dy);
        const spin = ((i % 3) - 1) * 9;
        const opacity = pi < 0.5 ? 0.12 + (0.88 * pi) / 0.5 : 1 - (pi - 0.5) / 0.5;
        const q = pi < 0.5 ? pi / 0.5 : (pi - 0.5) / 0.5;
        const x = pi < 0.5 ? dx * 0.6 * (1 - q) : dx * q;
        const y = pi < 0.5 ? dy * 0.6 * (1 - q) : dy * q;
        const rotation = pi < 0.5 ? -12 + 19 * q : 7 + (spin - 7) * q;
        const transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) rotate(${rotation.toFixed(1)}deg)`;
        if (el.style.opacity !== String(opacity)) el.style.opacity = String(opacity);
        if (el.style.transform !== transform) el.style.transform = transform;
      });
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

function DirectionSection() {
  const rootRef = useSectionEntrance("direction", "rise");
  useScrubFragments("direction");

  return (
    <Section id="direction">
      <div
        ref={rootRef}
        className="relative flex min-h-svh flex-col items-center justify-center text-center lg:items-start lg:text-left"
      >
        <p data-entrance="label" className={T.overline}>
          02 — Direction
        </p>
        <h2
          data-entrance="head"
          className="mt-6 max-w-[92vw] text-[clamp(3.5rem,10vw,9rem)] font-bold leading-[0.92] tracking-tight lg:max-w-[80%]"
        >
          Direction<span className="text-ember">.</span>
        </h2>
        <p
          data-entrance="lead"
          className={`${T.body} mt-7 max-w-[52ch] text-lg sm:text-xl`}
        >
          Videos are everywhere. Articles are everywhere. Courses are
          everywhere.
        </p>
        <p data-entrance="content" className={`${T.small} ${T.ember} mt-3 font-semibold`}>
          But the learner still doesn't know: WHAT NEXT?
        </p>
        <NoiseField />
      </div>
    </Section>
  );
}

/* ---- 4 · The forge ----------------------------------------------------------- */

function LoopSection() {
  useScrubReveal("how-it-works");
  return (
    <Section id="how-it-works">
      <Chapter
        num="03"
        label="The forge"
        title="SkillForge forges the path."
        lead="The loop is the product: resource → roadmap → practice → quiz → feedback → progress. Every feature exists to keep it turning."
        anchorId="how-it-works"
        variant="activate"
        aside={
          <div>
            <p className={T.overline}>The surfaces</p>
            <h3 className={`${T.h3} mt-2`}>One focused workspace, zero tab soup</h3>
            <div className="mt-5 grid grid-cols-2 gap-3">
              {FEATURES.map(({ icon: Icon, title, body }) => (
                <div key={title} className={`${T.card} p-4`}>
                  <span className="flex size-8 items-center justify-center rounded-lg bg-ember/12 text-ember">
                    <Icon className="size-4" />
                  </span>
                  <p className="mt-3 text-base font-bold">{title}</p>
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
        {/* The machine assembles itself: the loop's six units light one by
            one as the page's window opens — scroll position IS the assembly,
            reversible and fast-scroll safe. */}
        <div
          data-scrub-rail
          aria-hidden="true"
          className="mt-8 h-px w-full overflow-hidden bg-border"
        >
          <span className="block h-full w-full origin-left bg-ember" style={{ transform: "scaleX(0)" }} />
        </div>
        <ol className="mt-6 space-y-3">
          {FORGE_ASSEMBLY.map(({ icon: Icon, title, body }, index) => (
            <li
              key={title}
              data-scrub-step
              className={`${T.card} flex items-start gap-4 p-4`}
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-ember/12 text-ember">
                <Icon className="size-4" />
              </span>
              <span className="min-w-0">
                <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-ember">
                  {String(index + 1).padStart(2, "0")} — {title}
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

/* ---- 5 · Practice ------------------------------------------------------------ */

function AiSection() {
  useScrubReveal("architecture");
  return (
    <Section id="architecture">
      <Chapter
        num="04"
        label="Practice"
        title="Watching is not practice."
        lead="You try. You get feedback. You try again. Practice is the only thing that changes skill — the AI exists to make it honest, fast, and fair."
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
            scroll position IS the progress), and the session readout above
            ticks with it: score, questions, mastery — progress you can see
            forming. */}
        <div className="mt-8 flex items-center justify-between border-b border-border pb-3">
          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            One session
          </p>
          <div className="flex items-center gap-4 text-xs font-semibold tabular-nums sm:gap-6">
            <span className="flex items-center gap-1.5">
              <span className="text-muted-foreground">Score</span>
              <span data-scrub-num data-to="100" data-suffix="%" className="text-ember">
                0%
              </span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-muted-foreground">Questions</span>
              <span className="text-ember">
                <span data-scrub-num data-to="5" className="text-ember">0</span>
                <span className="text-muted-foreground">/5</span>
              </span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-muted-foreground">Mastery</span>
              <span className="text-ember">
                <span aria-hidden="true">+</span>
                <span data-scrub-num data-to="12" data-pad="2">00</span>
              </span>
            </span>
          </div>
        </div>
        <div
          data-scrub-rail
          aria-hidden="true"
          className="mt-6 h-px w-full overflow-hidden bg-border"
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

/* ---- 6 · Your path ------------------------------------------------------------ */

function RoadmapSection() {
  useScrubReveal("experience");
  return (
    <Section id="experience">
      <Chapter
        num="05"
        label="Your path"
        title="Build your path."
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
            milestones light one by one. A horizontal path with large
            numbers: the twelve weeks read as one forward motion. */}
        <div
          data-scrub-rail
          aria-hidden="true"
          className="mt-8 h-px w-full overflow-hidden bg-border"
        >
          <span className="block h-full w-full origin-left bg-ember" style={{ transform: "scaleX(0)" }} />
        </div>
        <ol className="mt-6 grid gap-3 md:grid-cols-3">
          {PATH_STEPS.map(({ num, weeks, title, body }) => (
            <li key={num} data-scrub-step className={`${T.card} relative overflow-hidden p-5`}>
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -right-1 -top-3 select-none text-[4.5rem] font-bold leading-none tracking-tight text-foreground/[0.06]"
              >
                {num}
              </span>
              <div className="relative">
                <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-aurora">
                  Weeks {weeks}
                </span>
                <p className="mt-2 text-lg font-bold tracking-tight">{title}</p>
                <p className={`${T.small} ${T.body} mt-1.5`}>{body}</p>
              </div>
            </li>
          ))}
        </ol>

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

/* ---- 7 · Knowledge ------------------------------------------------------------- */

function KnowledgeSection() {
  const sectionRef = useRef(null);
  const near = useNearViewport(sectionRef, "knowledge");

  return (
    <section ref={sectionRef} id="knowledge" className="forge-section">
      <div className="forge-container">
        <Chapter
          num="06"
          label="Knowledge map"
          title="Connect your knowledge."
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

/* ---- 8 · Focus ---------------------------------------------------------------- */
/* The visual reset: a quiet statement, then four monumental words that light
   in sequence as the window opens — FOCUS. PRACTICE. BUILD. MASTER. — with
   the signature marquee marching beneath as the chapter's major motif. The
   FAQ stays below, functional and quiet. */

function FaqSection() {
  useScrubReveal("faq");
  return (
    <Section id="faq">
      <div className="pb-32">
        <Chapter
          num="07"
          label="Focus"
          title="Forge your focus."
          lead="Four words. One loop. Everything else is noise."
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
          <div
            data-scrub-rail
            aria-hidden="true"
            className="mt-8 h-px w-full overflow-hidden bg-border"
          >
            <span className="block h-full w-full origin-left bg-ember" style={{ transform: "scaleX(0)" }} />
          </div>
          <ol className="mt-6 space-y-4">
            {["Focus", "Practice", "Build", "Master"].map((word) => (
              <li
                key={word}
                data-scrub-step
                className="text-[clamp(2.25rem,6vw,4.5rem)] font-bold uppercase leading-[0.95] tracking-tight"
              >
                {word}
                <span className="text-ember">.</span>
              </li>
            ))}
          </ol>
          <Accordion type="multiple" className="mt-10 space-y-2">
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
      </div>

      {/* Signature motif — the repeated typography that closes the story.
          Bleeds to the sheet edges, ghosted, never interactive. */}
      <Marquee className="absolute inset-x-0 bottom-2" />
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
        <p data-entrance="label" className={`${T.overline} ${T.ember}`}>09 — The final chapter</p>
        <h2 data-entrance="head" className={`${T.h2} mt-5 max-w-[24ch]`}>
          Your focus is{" "}
          <span className="text-gradient-ember">forged.</span>
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
                Start forging
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
export const DirectionSectionComponent = DirectionSection;
export const LoopSectionComponent = LoopSection;
export const AiSectionComponent = AiSection;
export const RoadmapSectionComponent = RoadmapSection;
export const KnowledgeSectionComponent = KnowledgeSection;
export const FaqSectionComponent = FaqSection;
export const FinalSectionComponent = FinalSection;