import { Quote } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import BookPage from "../BookPage";
import ChapterOpener from "../ChapterOpener";
import { PAGE } from "../styles";

/* -------------------------------------------------------------------------- */
/*  Chapter Seven — "Questions & voices".                                     */
/*  Left: the real product FAQ (quota, expiry, AI generation, paths, cost).   */
/*  Right: voices from the community — real testimonials already shipping.    */
/* -------------------------------------------------------------------------- */

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

export function FaqLeft({ number, total }) {
  return (
    <BookPage chapter="Chapter Seven" number={number} total={total} side="left">
      <ChapterOpener
        number="VII"
        chapter="Questions & voices"
        title="Questions, answered"
        lead="Everything you might want to know before you forge your first skill."
      >
        <Accordion type="multiple" className="space-y-2">
          {FAQS.map(({ question, answer }) => (
            <AccordionItem
              key={question}
              value={question}
              className="rounded-lg border border-[var(--book-rule)] bg-[color-mix(in_oklch,var(--book-page-text)_3%,transparent)] px-3"
            >
              <AccordionTrigger className="py-2 text-left text-[clamp(0.72rem,1.7vh,0.85rem)] font-semibold">
                {question}
              </AccordionTrigger>
              <AccordionContent className={`${PAGE.small} text-[var(--book-page-muted)]`}>
                {answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </ChapterOpener>
    </BookPage>
  );
}

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

export function VoicesRight({ number, total }) {
  return (
    <BookPage chapter="Chapter Seven" number={number} total={total} side="left">
      <div className="flex h-full flex-col">
        <p className={`${PAGE.overline} ${PAGE.muted}`}>Voices from the forge</p>
        <h3 className={`${PAGE.h3} mt-2`}>What happens when learners keep the loop</h3>

        <ul className="mt-4 flex flex-1 flex-col justify-center gap-3">
          {TESTIMONIALS.map(({ quote, name, title, initials }) => (
            <li
              key={name}
              className="rounded-xl border border-[var(--book-rule)] bg-[color-mix(in_oklch,var(--book-page-text)_3%,transparent)] p-3.5"
            >
              <Quote className="size-4 text-ember" aria-hidden="true" />
              <blockquote className={`${PAGE.small} mt-1.5 leading-relaxed`}>
                {quote}
              </blockquote>
              <figcaption className="mt-3 flex items-center gap-2.5">
                <Avatar className="size-8 border">
                  <AvatarFallback className="bg-ember/15 text-[10px] font-semibold text-ember">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span>
                  <span className={`${PAGE.small} block font-semibold`}>{name}</span>
                  <span className={`${PAGE.small} ${PAGE.muted}`}>{title}</span>
                </span>
              </figcaption>
            </li>
          ))}
        </ul>
      </div>
    </BookPage>
  );
}