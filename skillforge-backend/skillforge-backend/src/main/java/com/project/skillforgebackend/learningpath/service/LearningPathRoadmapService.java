package com.project.skillforgebackend.learningpath.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.project.skillforgebackend.common.audit.BusinessAuditEvent;
import com.project.skillforgebackend.common.exception.ResourceNotFoundException;
import com.project.skillforgebackend.learningpath.dto.LearningPathDto;
import com.project.skillforgebackend.learningpath.dto.UpdateWeekCompletionRequest;
import com.project.skillforgebackend.learningpath.entity.LearningPath;
import com.project.skillforgebackend.learningpath.enums.LearningPathStatus;
import com.project.skillforgebackend.learningpath.mapper.LearningPathMapper;
import com.project.skillforgebackend.learningpath.repository.LearningPathRepository;
import com.project.skillforgebackend.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Mutation of the AI-generated roadmap JSON: toggles week completion and
 * derives the overall path status from the completed weeks. Keeps the
 * roadmap-surgery out of the main learning-path lifecycle service.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class LearningPathRoadmapService {

    private final LearningPathRepository learningPathRepository;
    private final LearningPathMapper learningPathMapper;
    private final ApplicationEventPublisher eventPublisher;

    @CacheEvict(cacheNames = "dashboard", key = "#user.id")
    public LearningPathDto updateWeekCompletion(
            UUID learningPathId,
            Integer weekNumber,
            UpdateWeekCompletionRequest request,
            User user
    ) {

        LearningPath learningPath =
                findLearningPath(
                        learningPathId,
                        user
                );

        ObjectNode roadmap =
                (ObjectNode) learningPath.getRoadmapJson();

        ArrayNode weeks =
                (ArrayNode) roadmap.get("weeks");

        boolean weekFound = false;

        for (JsonNode weekNode : weeks) {

            ObjectNode week = (ObjectNode) weekNode;

            if (week.get("week").asInt() == weekNumber) {

                week.put(
                        "completed",
                        request.getCompleted()
                );

                weekFound = true;
                break;
            }
        }

        if (!weekFound) {

            throw new ResourceNotFoundException(
                    "Week",
                    weekNumber
            );

        }

        updateLearningPathStatus(learningPath);

        LearningPath updated =
                learningPathRepository.save(learningPath);

        eventPublisher.publishEvent(new BusinessAuditEvent(
                learningPath.getStatus() == LearningPathStatus.COMPLETED
                        ? BusinessAuditEvent.Type.LEARNING_PATH_COMPLETED
                        : BusinessAuditEvent.Type.LEARNING_PATH_UPDATED,
                user.getId(),
                "learningPath",
                learningPathId.toString(),
                "week " + weekNumber
                        + " completed="
                        + request.getCompleted()
        ));

        return learningPathMapper.toDto(updated);

    }

    private void updateLearningPathStatus(
            LearningPath learningPath
    ) {

        ObjectNode roadmap =
                (ObjectNode) learningPath.getRoadmapJson();

        ArrayNode weeks =
                (ArrayNode) roadmap.get("weeks");

        boolean allCompleted = true;

        for (JsonNode weekNode : weeks) {

            if (!weekNode.get("completed").asBoolean()) {

                allCompleted = false;
                break;

            }

        }

        if (allCompleted) {

            learningPath.setStatus(
                    LearningPathStatus.COMPLETED
            );

            learningPath.setCompletedAt(
                    LocalDateTime.now()
            );

        } else {

            learningPath.setStatus(
                    LearningPathStatus.ACTIVE
            );

            learningPath.setCompletedAt(null);

        }

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

}
