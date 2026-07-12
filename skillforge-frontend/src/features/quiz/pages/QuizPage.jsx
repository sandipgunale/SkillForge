import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";

import PageContainer from "@/components/common/PageContainer";
import ErrorState from "@/components/common/ErrorState";

import QuizHeader from "../components/QuizHeader";
import QuizProgress from "../components/QuizProgress";
import QuestionCard from "../components/QuestionCard";
import QuizNavigation from "../components/QuizNavigation";
import QuestionPalette from "../components/QuestionPalette";

import { useQuizStore } from "../store/quizStore";
import { useSubmitQuiz } from "../hooks/useSubmitQuiz";

const QUIZ_DURATION = 600;

export default function QuizPage() {
  const { quizId } = useParams();

  const { quiz, currentQuestion, answers, answerQuestion, setCurrentQuestion } =
    useQuizStore();

  const startTimer = useQuizStore((state) => state.startTimer);
  const remainingTime = useQuizStore((state) => state.remainingTime);

  const submitQuiz = useSubmitQuiz();

  useEffect(() => {
    if (quiz && remainingTime === 0) {
      startTimer(QUIZ_DURATION);
    }
  }, [quiz, remainingTime, startTimer]);

  // IMPORTANT:
  // Never access quiz.questions before this check.
  if (!quiz || quiz.id !== quizId) {
    return (
      <PageContainer>
        <ErrorState
          title="Quiz not found"
          description="Generate a new quiz to continue."
        />
      </PageContainer>
    );
  }

  const answered = Object.keys(answers).length;
  const question = quiz.questions[currentQuestion];

  const handleSubmit = () => {
    if (submitQuiz.isPending) return;

    const payload = Object.entries(answers).map(([questionId, answer]) => ({
      questionId,
      answer,
    }));

    if (payload.length === 0) {
      toast.error("Please answer at least one question.");
      return;
    }

    submitQuiz.mutate({
      quizId: quiz.id,
      answers: payload,
    });
  };

  const handleTimeout = () => {
    if (submitQuiz.isPending) return;

    toast.warning("Time is up! Submitting quiz...");
    handleSubmit();
  };

  return (
    <PageContainer>
      <QuizHeader topic={quiz.topic} onTimeout={handleTimeout} />

      <QuizProgress current={currentQuestion} total={quiz.questions.length} />

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <QuestionCard
            question={question}
            selectedAnswer={answers[question.id]}
            onAnswer={(answer) => answerQuestion(question.id, answer)}
          />

          <QuizNavigation
            current={currentQuestion}
            total={quiz.questions.length}
            answered={answered}
            previous={() => setCurrentQuestion(currentQuestion - 1)}
            next={() => setCurrentQuestion(currentQuestion + 1)}
            submit={handleSubmit}
            loading={submitQuiz.isPending}
          />
        </div>

        <QuestionPalette
          questions={quiz.questions}
          currentQuestion={currentQuestion}
          answers={answers}
          onSelect={setCurrentQuestion}
        />
      </div>
    </PageContainer>
  );
}
