package com.project.skillforgebackend.quiz.controller;

import com.project.skillforgebackend.common.response.ApiResponse;
import com.project.skillforgebackend.quiz.dto.*;
import com.project.skillforgebackend.quiz.entity.Quiz;
import com.project.skillforgebackend.quiz.entity.QuizSource;
import com.project.skillforgebackend.quiz.service.QuizService;
import com.project.skillforgebackend.resource.entity.Resource;
import com.project.skillforgebackend.user.entity.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
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
@RequiredArgsConstructor
public class QuizController {

    private static final java.util.Set<String> SORTABLE_FIELDS =
            java.util.Set.of("completedAt", "createdAt", "score", "status", "difficulty");

    private final QuizService quizService;

    /**
     * Generate a new quiz.
     */
    @PostMapping
    public ResponseEntity<ApiResponse<QuizDto>> generateQuiz(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody QuizRequest request
    ) {

        QuizDto quiz = quizService.generateQuiz(user, request);

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
            @AuthenticationPrincipal User user,
            @PathVariable UUID quizId,
            @Valid @RequestBody SubmitAnswersRequest request
    ) {

        QuizResultDto result =
                quizService.submitAnswers(
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

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<QuizDto>> getActiveQuiz(
            @AuthenticationPrincipal User user
    ) {
        QuizDto quiz = quizService.getActiveQuiz(user);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Active quiz fetched successfully.",
                        quiz
                )
        );
    }

    @GetMapping("/{quizId}")
    public ResponseEntity<ApiResponse<QuizDto>> getQuiz(
            @AuthenticationPrincipal User user,
            @PathVariable UUID quizId
    ) {
        QuizDto quiz = quizService.getQuiz(user, quizId);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Quiz fetched successfully.",
                        quiz
                )
        );
    }

    @GetMapping("/{quizId}/result")
    public ResponseEntity<ApiResponse<QuizResultDto>> getQuizResult(
            @AuthenticationPrincipal User user,
            @PathVariable UUID quizId
    ) {

        QuizResultDto result = quizService.getQuizResult(user, quizId);

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

            @AuthenticationPrincipal User user,

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
                quizService.getHistory(
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

}