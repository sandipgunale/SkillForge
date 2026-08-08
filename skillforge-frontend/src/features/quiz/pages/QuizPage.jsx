import { useCallback, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";

import PageContainer from "@/components/common/PageContainer";
import ErrorState from "@/components/common/ErrorState";

import QuizHeader from "../components/QuizHeader";
import QuizProgress from "../components/QuizProgress";
import QuestionCard from "../components/QuestionCard";
import QuizNavigation from "../components/QuizNavigation";
import QuestionPalette from "../components/QuestionPalette";
import { QuizSkeleton } from "../components/loading/QuizSkeleton";

import { getQuizDurationSeconds } from "../constants/quiz.constants";

import { useQuizStore } from "../store/quizStore";
import { useSubmitQuiz } from "../hooks/useSubmitQuiz";
import { useQuiz } from "../hooks/useQuiz";
import { quizApi } from "../api/quiz.api";
import { DEFAULT_QUESTION_COUNT } from "../constants/quiz.constants";

export default function QuizPage() {
  const { quizId } = useParams();

  const {
    quiz,
    currentQuestion,
    answers,
    answerQuestion,
    setCurrentQuestion,
    setQuiz,
    hydrateAnswers,
    startTimer,
    quizEndsAt,
  } = useQuizStore();

  const submitQuiz = useSubmitQuiz();

  const {
    data: fetchedQuiz,
    isLoading,
    isError,
  } = useQuiz(quizId, !quiz || quiz.id !== quizId);

  /*
   * ----------------------------------
   * Sync Quiz
   * ----------------------------------
   */

  useEffect(() => {
    if (!fetchedQuiz) return;

    if (!quiz || quiz.id !== fetchedQuiz.id) {
      setQuiz(fetchedQuiz);

      const savedAnswers = {};

      for (const question of fetchedQuiz.questions ?? []) {
        if (question.userAnswer) {
          savedAnswers[question.id] = question.userAnswer;
        }
      }

      hydrateAnswers(savedAnswers);
    }
  }, [fetchedQuiz, quiz, setQuiz, hydrateAnswers]);

  /*
   * ----------------------------------
   * Start Timer
   * ----------------------------------
   */

  useEffect(() => {
    if (!quiz) return;

    if (quizEndsAt === null) {
      startTimer(
        getQuizDurationSeconds(
          quiz.questions?.length ?? DEFAULT_QUESTION_COUNT,
        ),
      );
    }
  }, [quiz, quizEndsAt, startTimer]);

  /*
   * ----------------------------------
   * Auto-save answers (resume support)
   * ----------------------------------
   */

  const saveTimerRef = useRef(null);
  const pendingSaveRef = useRef(null);

  useEffect(() => {
    if (!quiz || quiz.status !== "IN_PROGRESS") return;

    const entries = Object.entries(answers);

    if (!entries.length) return;

    const payload = {
      answers: entries.map(([questionId, answer]) => ({
        questionId,
        answer,
      })),
    };

    pendingSaveRef.current = payload;

    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = setTimeout(() => {
      pendingSaveRef.current = null;
      quizApi.saveAnswers(quiz.id, payload).catch(() => {
        // Silent: auto-save is best-effort; the submit payload
        // always carries the final answers.
      });
    }, 600);

    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, [answers, quiz]);

  useEffect(() => {
    return () => {
      const payload = pendingSaveRef.current;

      if (payload) {
        quizApi.saveAnswers(quiz.id, payload).catch(() => {});
      }
    };
  }, [quiz]);

  /*
   * ----------------------------------
   * Loading
   * ----------------------------------
   */

  const safeIndex = Math.min(
    currentQuestion,
    (quiz?.questions?.length ?? 1) - 1,
  );

  const question = quiz?.questions?.[safeIndex];

  const answeredCount = Object.keys(answers).length;

  /*
   * ----------------------------------
   * Navigation
   * ----------------------------------
   */

  const previous = useCallback(() => {
    setCurrentQuestion(safeIndex - 1);
  }, [safeIndex, setCurrentQuestion]);

  const next = useCallback(() => {
    setCurrentQuestion(safeIndex + 1);
  }, [safeIndex, setCurrentQuestion]);

  const jumpToQuestion = useCallback(
    (index) => {
      setCurrentQuestion(index);
    },
    [setCurrentQuestion],
  );

  const answer = useCallback(
    (value) => {
      if (question) {
        answerQuestion(question.id, value);
      }
    },
    [answerQuestion, question],
  );

  /*
   * ----------------------------------
   * Submit
   * ----------------------------------
   */

  const handleSubmit = useCallback(() => {
    if (submitQuiz.isPending || !quiz) {
      return;
    }

    const payload = Object.entries(answers).map(([questionId, answer]) => ({
      questionId,
      answer,
    }));

    submitQuiz.mutate({
      quizId: quiz.id,
      answers: payload,
    });
  }, [answers, quiz, submitQuiz]);

  /*
   * ----------------------------------
   * Timeout
   * ----------------------------------
   */

  const handleTimeout = useCallback(() => {
    toast.warning("Time is up! Submitting quiz...");

    handleSubmit();
  }, [handleSubmit]);

  if (isLoading) {
    return (
      <PageContainer>
        <QuizSkeleton />
      </PageContainer>
    );
  }

  /*
   * ----------------------------------
   * Error
   * ----------------------------------
   */

  if (isError) {
    return (
      <PageContainer>
        <ErrorState
          title="Quiz not found"
          description="Unable to load this quiz."
        />
      </PageContainer>
    );
  }

  if (!quiz) {
    return null;
  }

  if (!quiz.questions?.length) {
    return (
      <PageContainer>
        <ErrorState title="Quiz Empty" description="No questions available." />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <QuizHeader
        topic={quiz.topicName ?? quiz.learningPathTitle ?? "Quiz"}
        onTimeout={handleTimeout}
      />

      <QuizProgress current={safeIndex} total={quiz.questions.length} />

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <QuestionCard
            question={question}
            selectedAnswer={answers[question.id]}
            onAnswer={answer}
          />

          <QuizNavigation
            current={safeIndex}
            total={quiz.questions.length}
            answered={answeredCount}
            previous={previous}
            next={next}
            submit={handleSubmit}
            loading={submitQuiz.isPending}
          />
        </div>

        <QuestionPalette
          questions={quiz.questions}
          currentQuestion={safeIndex}
          answers={answers}
          onSelect={jumpToQuestion}
        />
      </div>
    </PageContainer>
  );
}
