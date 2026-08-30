package com.project.skillforgebackend.quiz.controller;

import com.project.skillforgebackend.auth.principal.AuthenticatedPrincipal;
import com.project.skillforgebackend.auth.principal.CurrentUser;
import com.project.skillforgebackend.common.response.ApiResponse;
import com.project.skillforgebackend.common.security.RateLimiter;
import com.project.skillforgebackend.quiz.dto.*;
import com.project.skillforgebackend.quiz.entity.Quiz;
import com.project.skillforgebackend.quiz.entity.QuizSource;
import com.project.skillforgebackend.quiz.service.QuizGenerationService;
import com.project.skillforgebackend.quiz.service.QuizQueryService;
import com.project.skillforgebackend.quiz.service.QuizSubmissionService;
import com.project.skillforgebackend.resource.entity.Resource;
import com.project.skillforgebackend.user.entity.User;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/quizzes")
public class QuizController {

    private static final java.util.Set<String> SORTABLE_FIELDS =
            java.util.Set.of("completedAt", "createdAt", "score", "status", "difficulty");

    private final QuizGenerationService quizGenerationService;
    private final QuizSubmissionService quizSubmissionService;
    private final QuizQueryService quizQueryService;
    private final CurrentUser currentUser;
    private final RateLimiter aiRateLimiter;

    public QuizController(QuizGenerationService quizGenerationService,
                          QuizSubmissionService quizSubmissionService,
                          QuizQueryService quizQueryService,
                          CurrentUser currentUser,
                          @Qualifier("aiRateLimiter") RateLimiter aiRateLimiter) {
        this.quizGenerationService = quizGenerationService;
        this.quizSubmissionService = quizSubmissionService;
        this.quizQueryService = quizQueryService;
        this.currentUser = currentUser;
        this.aiRateLimiter = aiRateLimiter;
    }

    /**
     * Generate a new quiz.
     */
    @PostMapping
    public ResponseEntity<ApiResponse<QuizDto>> generateQuiz(
            @AuthenticationPrincipal AuthenticatedPrincipal principal,
            @Valid @RequestBody QuizRequest request,
            HttpServletRequest servletRequest
    ) {
        aiRateLimiter.check(aiRateLimiter.key(clientIp(servletRequest), "quiz-generation"));

        User user = currentUser.require(principal);
        QuizDto quiz = quizGenerationService.generateQuiz(user, request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(
                        ApiResponse.success(
                                "Quiz generated successfully.",
                                quiz
                        )
                );
    }

    /**
     * Submit quiz answers.
     */
    @PostMapping("/{quizId}/submit")
    public ResponseEntity<ApiResponse<QuizResultDto>> submitQuiz(
            @AuthenticationPrincipal AuthenticatedPrincipal principal,
            @PathVariable UUID quizId,
            @Valid @RequestBody SubmitAnswersRequest request,
            HttpServletRequest servletRequest
    ) {
        aiRateLimiter.check(aiRateLimiter.key(clientIp(servletRequest), "quiz-evaluation"));

        User user = currentUser.require(principal);

        QuizResultDto result =
                quizSubmissionService.submitAnswers(
                        user,
                        quizId,
                        request
                );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Quiz submitted successfully.",
                        result
                )
        );
    }

    /**
     * Save partial answers for an in-progress quiz (resume support).
     */
    @PutMapping("/{quizId}/answers")
    public ResponseEntity<ApiResponse<Void>> saveAnswers(
            @AuthenticationPrincipal AuthenticatedPrincipal principal,
            @PathVariable UUID quizId,
            @Valid @RequestBody SubmitAnswersRequest request
    ) {
        User user = currentUser.require(principal);

        quizSubmissionService.saveAnswers(user, quizId, request);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Quiz answers saved successfully.",
                        null
                )
        );
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<QuizDto>> getActiveQuiz(
            @AuthenticationPrincipal AuthenticatedPrincipal principal
    ) {
        User user = currentUser.require(principal);
        QuizDto quiz = quizQueryService.getActiveQuiz(user);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Active quiz fetched successfully.",
                        quiz
                )
        );
    }

    /**
     * Latest quiz the current user generated for a course lesson (or null).
     */
    @GetMapping("/by-lesson")
    public ResponseEntity<ApiResponse<QuizDto>> getQuizByLesson(
            @AuthenticationPrincipal AuthenticatedPrincipal principal,
            @RequestParam UUID lessonId
    ) {
        User user = currentUser.require(principal);
        QuizDto quiz = quizQueryService.getQuizByLesson(user, lessonId).orElse(null);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Lesson quiz fetched successfully.",
                        quiz
                )
        );
    }

    @GetMapping("/{quizId}")
    public ResponseEntity<ApiResponse<QuizDto>> getQuiz(
            @AuthenticationPrincipal AuthenticatedPrincipal principal,
            @PathVariable UUID quizId
    ) {
        User user = currentUser.require(principal);
        QuizDto quiz = quizQueryService.getQuiz(user, quizId);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Quiz fetched successfully.",
                        quiz
                )
        );
    }

    @GetMapping("/{quizId}/result")
    public ResponseEntity<ApiResponse<QuizResultDto>> getQuizResult(
            @AuthenticationPrincipal AuthenticatedPrincipal principal,
            @PathVariable UUID quizId
    ) {
        User user = currentUser.require(principal);

        QuizResultDto result = quizQueryService.getQuizResult(user, quizId);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Quiz result fetched successfully.",
                        result
                )
        );
    }

    /**
     * User quiz history.
     */
    @GetMapping("/history")
    public ResponseEntity<ApiResponse<PagedResponse<QuizDto>>> getHistory(

            @AuthenticationPrincipal AuthenticatedPrincipal principal,

            @RequestParam(required = false)
            QuizSource source,

            @RequestParam(required = false)
            Resource.Difficulty difficulty,

            @RequestParam(required = false)
            Quiz.QuizStatus status,

            @RequestParam(defaultValue = "0")
            int page,

            @RequestParam(defaultValue = "10")
            int size,

            @RequestParam(defaultValue = "completedAt,desc")
            String sort

    ) {
        User user = currentUser.require(principal);

        String[] sortParts = sort.split(",");
        String sortField = sortParts[0].trim();

        if (!SORTABLE_FIELDS.contains(sortField)) {
            throw new IllegalArgumentException(
                    "Invalid sort field '" + sortField + "'"
            );
        }

        Sort.Direction sortDirection = sortParts.length > 1
                && "asc".equalsIgnoreCase(sortParts[1].trim())
                ? Sort.Direction.ASC
                : Sort.Direction.DESC;

        Pageable pageable = PageRequest.of(
                Math.max(0, page),
                Math.min(Math.max(1, size), 50),
                Sort.by(sortDirection, sortField)
        );

        PagedResponse<QuizDto> history =
                quizQueryService.getHistory(
                        user,
                        source,
                        difficulty,
                        status,
                        pageable
                );

        return ResponseEntity.ok(

                ApiResponse.success(
                        "Quiz history fetched successfully.",
                        history
                )

        );

    }

    private String clientIp(HttpServletRequest request) {
        // Mirrors AuthController: remote address is the real client IP behind
        // the fronting proxy (server.forward-headers-strategy=framework).
        return request.getRemoteAddr();
    }

}
