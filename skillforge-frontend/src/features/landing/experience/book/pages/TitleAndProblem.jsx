import { Link } from "react-router-dom";
import { ArrowRight, MonitorPlay, MousePointerClick, TimerOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import BookPage from "../BookPage";
import ChapterOpener from "../ChapterOpener";
import DashboardMock from "../components/DashboardMock";
import { PAGE } from "../styles";

/* -------------------------------------------------------------------------- */
/*  Title + Chapter One — "The problem".                                      */
/*  Title page: the hero's promise, typed like a book's title page.           */
/*  Chapter One: the three problems that justify the forge (real landing      */
/*  copy) and the dashboard mock that resolves them.                          */
/* -------------------------------------------------------------------------- */

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

export function TitlePage({ number, total }) {
  return (
    <BookPage chapter="Title page" number={number} total={total} side="left">
      <div className="flex h-full flex-col items-center justify-center text-center">
        <p className={`${PAGE.overline} ${PAGE.ember}`}>A SkillForge original</p>

        <h2 className={`${PAGE.h2} mt-6 max-w-[14ch]`}>
          The internet is infinite.{" "}
          <span className="text-gradient-ember">Your focus is forged.</span>
        </h2>

        <p className={`${PAGE.body} ${PAGE.muted} mt-5 max-w-[46ch]`}>
          SkillForge hammers scattered videos, articles, and tutorials into one
          structured, distraction-free path — with AI quizzes, instant
          feedback, and momentum that keeps you finishing.
        </p>

        <div className="mt-9 flex flex-col items-center gap-3">
          <Button
            asChild
            size="lg"
            className="h-11 rounded-full px-6 text-sm shadow-lg shadow-ember/20"
          >
            <Link to={ROUTES.REGISTER}>
              Start learning free
              <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="h-11 rounded-full px-6 text-sm">
            <Link to={ROUTES.LOGIN}>Explore the dashboard</Link>
          </Button>
        </div>

        <p className={`${PAGE.small} ${PAGE.muted} mt-8`}>
          Turn the page — the story begins on the next leaf.
        </p>
      </div>
    </BookPage>
  );
}

export function ProblemLeft({ number, total }) {
  return (
    <BookPage chapter="Chapter One" number={number} total={total} side="left">
      <ChapterOpener
        number="I"
        chapter="The problem"
        title="The world's best classroom. Also its most distracting one."
        lead="Great teachers are everywhere. Great learning environments are not. The raw material for any skill exists — what's missing is a workspace built around finishing."
      >
        <ul className="space-y-3">
          {PROBLEMS.map(({ icon: Icon, title, body }) => (
            <li
              key={title}
              className="flex items-start gap-3 rounded-xl border border-[var(--book-rule)] bg-[color-mix(in_oklch,var(--book-page-text)_3%,transparent)] p-3"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                <Icon className="size-4" />
              </span>
              <span>
                <span className={`${PAGE.body} block font-semibold`}>{title}</span>
                <span className={`${PAGE.small} ${PAGE.muted} mt-0.5 block leading-relaxed`}>
                  {body}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </ChapterOpener>
    </BookPage>
  );
}

export function ProblemRight({ number, total }) {
  return (
    <BookPage chapter="Chapter One" number={number} total={total} side="left">
      <div className="flex h-full flex-col">
        <p className={`${PAGE.overline} ${PAGE.muted}`}>The answer in one screen</p>
        <h3 className={`${PAGE.h3} mt-2`}>One focused workspace, zero tab soup</h3>

        <div className="mt-4">
          <DashboardMock />
        </div>

        <p className={`${PAGE.body} ${PAGE.muted} mt-4`}>
          Paths, quizzes, health score, and proof of progress — everything a
          learner needs to actually finish lives in one place.
        </p>

        <p className={`${PAGE.small} ${PAGE.ember} mt-auto font-semibold`}>
          The forge exists so completion stops being the exception.
        </p>
      </div>
    </BookPage>
  );
}