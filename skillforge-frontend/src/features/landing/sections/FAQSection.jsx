import { useRef } from "react";

import SectionHeading from "../components/SectionHeading";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useMotionScope, useReducedMotion } from "@/lib/motion-gsap";

const FAQS = [
  {
    question: "How is SkillForge different from YouTube or a course platform?",
    answer:
      "We don't host courses. We structure what already exists. SkillForge sequences the best resources into a path, removes recommendations and sidebars, and adds AI practice and progress tracking — so you spend your time learning, not foraging.",
  },
  {
    question: "How does the AI quiz generation work?",
    answer:
      "Pick a topic (or a week of your learning path), difficulty, question types, and count. Gemini generates the quiz to a strict schema, validated and retried automatically, then evaluates your submission with per-question feedback.",
  },
  {
    question: "What happens if I don't finish a quiz?",
    answer:
      "Quizzes stay in progress with a server-side deadline based on question count. If you return after expiry, the quiz is abandoned cleanly and you can generate a fresh one. Mid-session refreshes resume from your exact question and remaining time.",
  },
  {
    question: "Is my usage of the AI limited?",
    answer:
      "There's a per-user daily question quota so the experience stays responsive and predictable. You'll see your remaining quota in the setup screen, and it resets daily.",
  },
  {
    question: "What are learning paths?",
    answer:
      "AI-generated 12-week roadmaps with week-by-week goals, topics, and resources for a skill level you choose. Mark weeks complete, take week quizzes, and the path auto-completes when you finish — earning you the Pathfinder badge.",
  },
  {
    question: "What does it cost?",
    answer:
      "The core experience — paths, bookmarks, analytics, achievements, and weekly digests — is free. AI practice runs on a transparent daily quota while we calibrate fair pricing.",
  },
];

export default function FAQSection() {
  const rootRef = useRef(null);
  const reduced = useReducedMotion();

  useMotionScope(
    ({ gsap, select }) => {
      if (reduced) return;
      gsap.from(select("[data-faq='item']"), {
        opacity: 0,
        y: 22,
        duration: 0.55,
        stagger: 0.08,
        ease: "power2.out",
        scrollTrigger: { trigger: rootRef.current, start: "top 76%", once: true },
      });
    },
    [reduced],
    rootRef,
  );

  return (
    <section id="faq" ref={rootRef} className="relative py-24 lg:py-32">
      <div className="mx-auto max-w-screen-2xl px-6 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr]">
          <SectionHeading
            align="left"
            eyebrow="FAQ"
            title="Questions, answered"
            description="Everything you might want to know before you forge your first skill."
          />

          <div>
            <Accordion className="w-full rounded-3xl border bg-card px-6">
              {FAQS.map(({ question, answer }) => (
                <div key={question} data-faq="item">
                  <AccordionItem value={question}>
                    <AccordionTrigger className="text-base">
                      {question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {answer}
                    </AccordionContent>
                  </AccordionItem>
                </div>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </section>
  );
}
