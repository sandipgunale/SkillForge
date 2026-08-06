package com.project.skillforgebackend.learningpath.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.project.skillforgebackend.ai.cache.AiResponseCache;
import com.project.skillforgebackend.ai.exception.AIServiceException;
import com.project.skillforgebackend.ai.service.AIService;
import com.project.skillforgebackend.common.audit.BusinessAuditEvent;
import com.project.skillforgebackend.common.exception.ResourceNotFoundException;
import com.project.skillforgebackend.gamification.service.GamificationService;
import com.project.skillforgebackend.learningpath.dto.CreateLearningPathRequest;
import com.project.skillforgebackend.learningpath.dto.LearningPathDto;
import com.project.skillforgebackend.learningpath.dto.UpdateLearningPathRequest;
import com.project.skillforgebackend.learningpath.entity.LearningPath;
import com.project.skillforgebackend.learningpath.enums.LearningPathStatus;
import com.project.skillforgebackend.learningpath.mapper.LearningPathMapper;
import com.project.skillforgebackend.learningpath.repository.LearningPathRepository;
import com.project.skillforgebackend.quiz.repository.QuizRepository;
import com.project.skillforgebackend.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class LearningPathService {

    private final LearningPathRepository learningPathRepository;
    private final LearningPathMapper learningPathMapper;
    private final AIService aiService;
    private final ObjectMapper objectMapper;
    private final GamificationService gamificationService;
    private final QuizRepository quizRepository;
    private final ApplicationEventPublisher eventPublisher;
    private final AiResponseCache aiResponseCache;

    @CacheEvict(cacheNames = "dashboard", key = "#user.id")
    public LearningPathDto createLearningPath(
            CreateLearningPathRequest request,
            User user
    ) {

        JsonNode roadmap =
                generateRoadmap(
                        request.getTitle(),
                        request.getGoal(),
                        request.getSkillLevel().name(),
                        request.getWeeklyHours(),
                        request.getDurationWeeks()
                );


        LearningPath learningPath =
                LearningPath.builder()
                        .user(user)
                        .title(request.getTitle())
                        .goal(request.getGoal())
                        .skillLevel(request.getSkillLevel())
                        .weeklyHours(request.getWeeklyHours())
                        .durationWeeks(request.getDurationWeeks())
                        .roadmapJson(roadmap)
                        .status(LearningPathStatus.ACTIVE)
                        .build();

        LearningPath saved =
                learningPathRepository.save(learningPath);

        eventPublisher.publishEvent(new BusinessAuditEvent(
                BusinessAuditEvent.Type.LEARNING_PATH_CREATED,
                user.getId(),
                "learningPath",
                saved.getId().toString(),
                saved.getTitle()
        ));

        return learningPathMapper.toDto(saved);
    }

    @Transactional(readOnly = true)
    public List<LearningPathDto> getLearningPaths(
            User user
    ) {

        return learningPathRepository
                .findByUserOrderByCreatedAtDesc(user)
                .stream()
                .map(learningPathMapper::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public LearningPathDto getLearningPath(
            UUID learningPathId,
            User user
    ) {

        LearningPath learningPath =
                findLearningPath(
                        learningPathId,
                        user
                );

        return learningPathMapper.toDto(learningPath);
    }

    public LearningPathDto updateLearningPath(
            UUID learningPathId,
            UpdateLearningPathRequest request,
            User user
    ) {

        LearningPath learningPath =
                findLearningPath(
                        learningPathId,
                        user
                );

        /*
         * Update metadata
         */
        updateMetadata(
                learningPath,
                request
        );

        /*
         * Regenerate roadmap using updated values
         */
        JsonNode roadmap =
                generateRoadmap(
                        request.getTitle(),
                        request.getGoal(),
                        request.getSkillLevel().name(),
                        request.getWeeklyHours(),
                        request.getDurationWeeks()
                );


        LearningPath updated =
                learningPathRepository.save(learningPath);

        eventPublisher.publishEvent(new BusinessAuditEvent(
                BusinessAuditEvent.Type.LEARNING_PATH_UPDATED,
                user.getId(),
                "learningPath",
                learningPathId.toString(),
                null
        ));

        return learningPathMapper.toDto(updated);
    }


    @CacheEvict(cacheNames = "dashboard", key = "#user.id")
    public LearningPathDto updateStatus(
            UUID learningPathId,
            LearningPathStatus status,
            User user
    ) {

        LearningPath learningPath =
                findLearningPath(
                        learningPathId,
                        user
                );

        learningPath.setStatus(status);

        if (status == LearningPathStatus.COMPLETED) {

            learningPath.setCompletedAt(LocalDateTime.now());

            gamificationService.checkAndAwardBadges(user);

        } else {

            learningPath.setCompletedAt(null);

        }

        LearningPath updated =
                learningPathRepository.save(learningPath);

        eventPublisher.publishEvent(new BusinessAuditEvent(
                status == LearningPathStatus.COMPLETED
                        ? BusinessAuditEvent.Type.LEARNING_PATH_COMPLETED
                        : BusinessAuditEvent.Type.LEARNING_PATH_UPDATED,
                user.getId(),
                "learningPath",
                learningPathId.toString(),
                status.name()
        ));

        return learningPathMapper.toDto(updated);
    }

    @CacheEvict(cacheNames = "dashboard", key = "#user.id")
    public void deleteLearningPath(
            UUID learningPathId,
            User user
    ) {

        LearningPath learningPath =
                findLearningPath(
                        learningPathId,
                        user
                );

        quizRepository.deleteByLearningPath(learningPath);

        learningPathRepository.delete(learningPath);

        aiResponseCache.evictLearningPaths();

        eventPublisher.publishEvent(new BusinessAuditEvent(
                BusinessAuditEvent.Type.LEARNING_PATH_DELETED,
                user.getId(),
                "learningPath",
                learningPathId.toString(),
                null
        ));
    }

    private LearningPath findLearningPath(
            UUID learningPathId,
            User user
    ) {

        return learningPathRepository
                .findByIdAndUser(
                        learningPathId,
                        user
                )
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Learning Path",
                                learningPathId
                        )
                );

    }

    /**
     * Parses and validates the AI-generated learning roadmap.
     */
    private JsonNode parseAndValidateRoadmap(
            String roadmapJson,
            int expectedWeeks
    ) {

        try {

            JsonNode roadmap = objectMapper.readTree(roadmapJson);

            /*
             * Validate root fields
             */
            validateField(roadmap, "title");
            validateField(roadmap, "goal");

            if (!roadmap.has("durationWeeks") || roadmap.get("durationWeeks").isNull()) {
                ((ObjectNode) roadmap).put("durationWeeks", expectedWeeks);
            }

            validateField(roadmap, "weeks");

            /*
             * Validate duration
             */
            int duration =
                    roadmap.get("durationWeeks").asInt();

            if (duration != expectedWeeks) {

                throw new AIServiceException(
                        "AI returned durationWeeks="
                                + duration
                                + " but expected "
                                + expectedWeeks
                                + "."
                );

            }

            /*
             * Validate weeks array
             */
            JsonNode weeks =
                    roadmap.get("weeks");

            if (!weeks.isArray()) {

                throw new AIServiceException(
                        "'weeks' must be an array."
                );

            }

            if (weeks.size() != expectedWeeks) {

                throw new AIServiceException(
                        "AI generated "
                                + weeks.size()
                                + " weeks instead of "
                                + expectedWeeks
                                + "."
                );

            }

            /*
             * Validate every week
             */
            for (JsonNode week : weeks) {

                validateField(week, "week");
                validateField(week, "title");
                validateField(week, "estimatedHours");
                validateField(week, "completed");
                validateField(week, "topics");
                validateField(week, "resources");
                validateField(week, "learningGoals");

                if (!week.get("topics").isArray()) {

                    throw new AIServiceException(
                            "'topics' must be an array."
                    );

                }

                if (!week.get("resources").isArray()) {

                    throw new AIServiceException(
                            "'resources' must be an array."
                    );

                }

                if (!week.get("learningGoals").isArray()) {

                    throw new AIServiceException(
                            "'learningGoals' must be an array."
                    );

                }

            }

            return roadmap;

        } catch (JsonProcessingException ex) {

            throw new AIServiceException(
                    "Failed to parse AI generated roadmap.",
                    ex
            );

        }

    }


    /**
     * Validates that a JSON field exists and is not null.
     */
    private void validateField(
            JsonNode node,
            String field
    ) {

        if (!node.has(field) || node.get(field).isNull()) {

            throw new AIServiceException(
                    "AI response is missing required field: "
                            + field
            );

        }

    }

    private JsonNode generateRoadmap(
            String title,
            String goal,
            String skillLevel,
            Integer weeklyHours,
            Integer durationWeeks
    ) {

        String roadmapJson =
                aiService.generateLearningPath(
                        title,
                        goal,
                        skillLevel,
                        weeklyHours,
                        durationWeeks
                );

        return parseAndValidateRoadmap(
                roadmapJson,
                durationWeeks
        );

    }

    private void updateMetadata(
            LearningPath learningPath,
            UpdateLearningPathRequest request
    ) {

        learningPath.setTitle(request.getTitle());
        learningPath.setGoal(request.getGoal());
        learningPath.setSkillLevel(request.getSkillLevel());
        learningPath.setWeeklyHours(request.getWeeklyHours());
        learningPath.setDurationWeeks(request.getDurationWeeks());

    }


}