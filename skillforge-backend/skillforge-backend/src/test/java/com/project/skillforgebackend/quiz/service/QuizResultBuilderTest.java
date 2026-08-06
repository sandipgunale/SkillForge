package com.project.skillforgebackend.quiz.service;

import com.project.skillforgebackend.quiz.dto.QuizResultDto;
import com.project.skillforgebackend.quiz.entity.Question;
import com.project.skillforgebackend.quiz.entity.Quiz;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class QuizResultBuilderTest {

    private final QuizResultBuilder builder = new QuizResultBuilder();

    private Question question(String content, String correct, String user) {
        return Question.builder()
                .id(UUID.randomUUID())
                .type(Question.QuestionType.MCQ)
                .content(content)
                .correctAnswer(correct)
                .userAnswer(user)
                .orderIndex(0)
                .build();
    }

    private Quiz quizWith(Question... questions) {
        Quiz quiz = Quiz.builder()
                .id(UUID.randomUUID())
                .totalQuestions(questions.length)
                .maxScore(questions.length)
                .build();

        List<Question> list = List.of(questions);
        list.forEach(q -> q.setQuiz(quiz));
        quiz.setQuestions(list);

        return quiz;
    }

    @Test
    void gradesCorrectAndIncorrectAnswers() {
        Quiz quiz = quizWith(
                question("Q1", "Option A", "Option A"),
                question("Q2", "Option B", "Option A"),
                question("Q3", "Option C", "Option C")
        );

        QuizResultDto result = builder.build(quiz, false);

        assertThat(result.isAiEvaluated()).isFalse();
        assertThat(result.getSummary().getScore()).isEqualTo(2);
        assertThat(result.getSummary().getMaxScore()).isEqualTo(3);
        assertThat(result.getSummary().getPercentage()).isEqualTo(66.67);
        assertThat(result.getAnalytics().getCorrectAnswers()).isEqualTo(2);
        assertThat(result.getAnalytics().getIncorrectAnswers()).isEqualTo(1);
        assertThat(result.getQuestions())
                .extracting("correct")
                .containsExactly(true, false, true);
    }

    @Test
    void comparisonIsCaseAndWhitespaceInsensitive() {
        Quiz quiz = quizWith(
                question("Q1", "  Option A ", "option a")
        );

        QuizResultDto result = builder.build(quiz, false);

        assertThat(result.getSummary().getScore()).isEqualTo(1);
    }

    @Test
    void unansweredQuestionIsIncorrect() {
        Quiz quiz = quizWith(
                question("Q1", "Option A", ""),
                question("Q2", "Option B", null)
        );

        QuizResultDto result = builder.build(quiz, false);

        assertThat(result.getAnalytics().getAnsweredQuestions()).isZero();
        assertThat(result.getSummary().getScore()).isZero();
    }

    @Test
    void reusesPersistedVerdictAndFeedback() {
        Question q1 = question("Q1", "Option A", "Option A");
        q1.setIsCorrect(true);
        q1.setAiFeedback("Persisted feedback");

        Quiz quiz = quizWith(q1);

        QuizResultDto result = builder.build(quiz, true);

        assertThat(result.isAiEvaluated()).isTrue();
        assertThat(result.getSummary().getScore()).isEqualTo(1);
        assertThat(result.getQuestions().get(0).getAiFeedback())
                .isEqualTo("Persisted feedback");
    }

    @Test
    void writesFeedbackForEveryQuestion() {
        Quiz quiz = quizWith(
                question("Q1", "Option A", "Option A"),
                question("Q2", "Option B", "Option A")
        );

        QuizResultDto result = builder.build(quiz, false);

        assertThat(result.getQuestions())
                .allSatisfy(q -> assertThat(q.getAiFeedback())
                        .isNotBlank());
        assertThat(quiz.getQuestions())
                .allSatisfy(q -> assertThat(q.getAiFeedback())
                        .isNotBlank());
        assertThat(quiz.getQuestions().get(0).getIsCorrect()).isTrue();
        assertThat(quiz.getQuestions().get(1).getIsCorrect()).isFalse();
    }

    @Test
    void insightTracksPerformanceBand() {
        Quiz perfect = quizWith(
                question("Q1", "A", "A"),
                question("Q2", "B", "B")
        );
        Quiz baseline = quizWith(
                question("Q1", "A", "B"),
                question("Q2", "B", "A")
        );

        QuizResultDto strong = builder.build(perfect, false);
        QuizResultDto weak = builder.build(baseline, false);

        assertThat(strong.getInsight().getStrengths()).isNotEmpty();
        assertThat(weak.getInsight().getWeaknesses()).isNotEmpty();
        assertThat(strong.getSummary().getPercentage())
                .isGreaterThan(weak.getSummary().getPercentage());
    }
}
