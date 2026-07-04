package com.project.skillforgebackend.learningpath.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.project.skillforgebackend.ai.exception.AIServiceException;
import com.project.skillforgebackend.ai.service.AIService;
import com.project.skillforgebackend.common.exception.ResourceNotFoundException;
import com.project.skillforgebackend.learningpath.dto.CreateLearningPathRequest;
import com.project.skillforgebackend.learningpath.dto.LearningPathDto;
import com.project.skillforgebackend.learningpath.dto.UpdateLearningPathRequest;
import com.project.skillforgebackend.learningpath.entity.LearningPath;
import com.project.skillforgebackend.learningpath.enums.LearningPathStatus;
import com.project.skillforgebackend.learningpath.mapper.LearningPathMapper;
import com.project.skillforgebackend.learningpath.repository.LearningPathRepository;
import com.project.skillforgebackend.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.fasterxml.jackson.databind.ObjectMapper;

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

    public LearningPathDto createLearningPath(
            CreateLearningPathRequest request,
            User user
    ) {

        String roadmapJson = aiService.generateLearningPath(
                request.getTitle(),
                request.getGoal(),
                request.getSkillLevel().name(),
                request.getWeeklyHours(),
                request.getDurationWeeks()
        );

        JsonNode roadmap =
                parseAndValidateRoadmap(
                        roadmapJson,
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

        learningPath.setRoadmapJson(roadmap);
        LearningPath saved =
                learningPathRepository.save(learningPath);

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
                learningPathRepository
                        .findByIdAndUser(learningPathId, user)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Learning Path",
                                        learningPathId.toString()
                                )
                        );

        return learningPathMapper.toDto(learningPath);
    }

    public LearningPathDto updateLearningPath(
            UUID learningPathId,
            UpdateLearningPathRequest request,
            User user
    ) {

        LearningPath learningPath =
                learningPathRepository
                        .findByIdAndUser(
                                learningPathId,
                                user
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Learning Path",
                                        learningPathId.toString()
                                )
                        );

        /*
         * Update metadata
         */
        learningPath.setTitle(request.getTitle());
        learningPath.setGoal(request.getGoal());
        learningPath.setSkillLevel(request.getSkillLevel());
        learningPath.setWeeklyHours(request.getWeeklyHours());
        learningPath.setDurationWeeks(request.getDurationWeeks());

        /*
         * Regenerate roadmap using updated values
         */
        String roadmapJson =
                aiService.generateLearningPath(
                        request.getTitle(),
                        request.getGoal(),
                        request.getSkillLevel().name(),
                        request.getWeeklyHours(),
                        request.getDurationWeeks()
                );

        JsonNode roadmap =
                parseAndValidateRoadmap(
                        roadmapJson,
                        request.getDurationWeeks()
                );

        learningPath.setRoadmapJson(roadmap);

        LearningPath updated =
                learningPathRepository.save(learningPath);

        return learningPathMapper.toDto(updated);
    }


    public LearningPathDto updateStatus(
            UUID learningPathId,
            LearningPathStatus status,
            User user
    ) {

        LearningPath learningPath =
                learningPathRepository
                        .findByIdAndUser(learningPathId, user)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Learning Path",
                                        learningPathId.toString()
                                )
                        );

        learningPath.setStatus(status);

        if (status == LearningPathStatus.COMPLETED) {

            learningPath.setCompletedAt(LocalDateTime.now());

        } else {

            learningPath.setCompletedAt(null);

        }

        LearningPath updated =
                learningPathRepository.save(learningPath);

        return learningPathMapper.toDto(updated);
    }

    public void deleteLearningPath(
            UUID learningPathId,
            User user
    ) {

        LearningPath learningPath =
                learningPathRepository
                        .findByIdAndUser(learningPathId, user)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Learning Path",
                                        learningPathId.toString()
                                )
                        );

        learningPathRepository.delete(learningPath);
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
            validateField(roadmap, "durationWeeks");
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
}