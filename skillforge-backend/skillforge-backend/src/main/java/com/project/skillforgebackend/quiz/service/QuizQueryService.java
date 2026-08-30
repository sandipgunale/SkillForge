package com.project.skillforgebackend.quiz.service;

import com.project.skillforgebackend.ai.exception.AIServiceException;
import com.project.skillforgebackend.ai.service.AIService;
import com.project.skillforgebackend.common.exception.ResourceNotFoundException;
import com.project.skillforgebackend.common.response.PagedResponseAssembler;
import com.project.skillforgebackend.quiz.dto.PagedResponse;
import com.project.skillforgebackend.quiz.dto.QuizDto;
import com.project.skillforgebackend.quiz.dto.QuizResultDto;
import com.project.skillforgebackend.quiz.entity.Quiz;
import com.project.skillforgebackend.quiz.entity.QuizSource;
import com.project.skillforgebackend.quiz.mapper.QuizMapper;
import com.project.skillforgebackend.quiz.repository.QuizRepository;
import com.project.skillforgebackend.quiz.specification.QuizSpecification;
import com.project.skillforgebackend.resource.entity.Resource;
import com.project.skillforgebackend.user.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

/**
 * Read side of the quiz lifecycle: fetching a quiz, resuming the active
 * session and building results. Mutations that happen while reading
 * (expired quizzes are abandoned) run in a write transaction so the state
 * change is actually flushed.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class QuizQueryService {

    private final QuizRepository quizRepository;
    private final AIService aiService;
    private final QuizMapper quizMapper;
    private final QuizResultBuilder quizResultBuilder;

    @Transactional
    public QuizDto getQuiz(User user, UUID quizId) {

        Quiz quiz = quizRepository
                .findByIdAndUser(quizId, user)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Quiz",
                                quizId
                        ));

        abandonIfExpired(quiz);

        return quizMapper.toDto(quiz);
    }

    /**
     * Resume the user's most recent in-progress quiz that hasn't expired,
     * or throw 404 if there is none.
     */
    @Transactional
    public QuizDto getActiveQuiz(User user) {

        Quiz quiz = quizRepository
                .findTopByUserAndStatusOrderByStartedAtDesc(
                        user,
                        Quiz.QuizStatus.IN_PROGRESS
                )
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Quiz in progress",
                                null
                        ));

        abandonIfExpired(quiz);

        return quizMapper.toDto(quiz);
    }

    @Transactional
    public QuizResultDto getQuizResult(
            User user,
            UUID quizId
    ) {

        Quiz quiz = quizRepository
                .findByIdAndUser(quizId, user)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Quiz",
                                quizId
                        ));

        if (quiz.getStatus() != Quiz.QuizStatus.COMPLETED) {

            abandonIfExpired(quiz);

            throw new IllegalStateException(
                    "Quiz has not been completed yet."
            );
        }

        return evaluateWithFallback(quiz);
    }

    /**
     * Evaluates via Gemini, falling back to deterministic offline grading
     * (correct answers are stored with the quiz) whenever the AI service
     * is unreachable, so a Gemini outage can never block finishing a quiz.
     */
    private QuizResultDto evaluateWithFallback(Quiz quiz) {

        try {

            return aiService.evaluateQuiz(quiz);

        } catch (AIServiceException ex) {

            log.warn(
                    "Gemini unavailable; grading quiz {} offline. Reason: {}",
                    quiz.getId(),
                    ex.getMessage()
            );

            return quizResultBuilder.build(quiz, false);
        }
    }

    /**
     * Latest quiz the user generated for a specific course lesson, if any.
     * Returns empty when the user has not yet created a practice quiz for it.
     */
    public Optional<QuizDto> getQuizByLesson(User user, UUID lessonId) {
        return quizRepository
                .findTopByUserAndLesson_IdOrderByStartedAtDesc(user, lessonId)
                .map(quizMapper::toDto);
    }

    public PagedResponse<QuizDto> getHistory(
            User user,
            QuizSource source,

            Resource.Difficulty difficulty,

            Quiz.QuizStatus status,

            Pageable pageable

    ) {

        Specification<Quiz> specification =

                QuizSpecification.hasUser(user)
                        .and(QuizSpecification.hasSource(source))
                        .and(QuizSpecification.hasDifficulty(difficulty))
                        .and(QuizSpecification.hasStatus(status));

        Page<Quiz> page =

                quizRepository.findAll(
                        specification,
                        pageable
                );

        return PagedResponseAssembler.assemble(page, quizMapper::toDto);

    }

    private void abandonIfExpired(Quiz quiz) {
        if (quiz.getStatus() == Quiz.QuizStatus.IN_PROGRESS
                && quiz.isExpired()) {

            quiz.setStatus(Quiz.QuizStatus.ABANDONED);
            quizRepository.save(quiz);

            log.info(
                    "Quiz {} abandoned because it expired at {}",
                    quiz.getId(),
                    quiz.getExpiresAt()
            );
        }
    }
}
