package com.project.skillforgebackend.resource.service;

import com.project.skillforgebackend.common.exception.ResourceNotFoundException;
import com.project.skillforgebackend.resource.dto.CourseProgressDto;
import com.project.skillforgebackend.resource.entity.ContentItem;
import com.project.skillforgebackend.resource.entity.LessonCompletion;
import com.project.skillforgebackend.resource.entity.Resource;
import com.project.skillforgebackend.resource.repository.ContentItemRepository;
import com.project.skillforgebackend.resource.repository.LessonCompletionRepository;
import com.project.skillforgebackend.resource.repository.ResourceRepository;
import com.project.skillforgebackend.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class LessonCompletionService {

    private final LessonCompletionRepository lessonCompletionRepository;
    private final ResourceRepository resourceRepository;
    private final ContentItemRepository contentItemRepository;

    private Resource getCourse(UUID courseId) {
        Resource resource = resourceRepository.findByIdAndActiveTrue(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Resource", courseId));
        if (resource.getType() != Resource.ResourceType.COURSE) {
            throw new IllegalStateException("Resource is not a course.");
        }
        return resource;
    }

    @Transactional
    public void markComplete(User user, UUID courseId, UUID lessonId, boolean completed) {
        getCourse(courseId);
        ContentItem lesson = contentItemRepository.findById(lessonId)
                .orElseThrow(() -> new ResourceNotFoundException("ContentItem", lessonId));
        if (!lesson.getResource().getId().equals(courseId)) {
            throw new IllegalArgumentException("Lesson does not belong to this course.");
        }
        LessonCompletion completion = lessonCompletionRepository
                .findByUserIdAndLessonId(user.getId(), lessonId)
                .orElseGet(() -> LessonCompletion.builder()
                        .user(user)
                        .lesson(lesson)
                        .build());
        completion.setCompleted(completed);
        completion.setCompletedAt(completed ? LocalDateTime.now() : null);
        lessonCompletionRepository.save(completion);
    }

    @Transactional(readOnly = true)
    public CourseProgressDto getProgress(User user, UUID courseId) {
        getCourse(courseId);
        List<ContentItem> lessons =
                contentItemRepository.findAllByResourceIdAndActiveTrueOrderByOrderIndexAsc(courseId);

        Map<String, Boolean> completionMap = new HashMap<>();
        List<UUID> lessonIds = lessons.stream().map(ContentItem::getId).toList();
        if (!lessonIds.isEmpty()) {
            lessonCompletionRepository.findByUserIdAndLessonIdIn(user.getId(), lessonIds)
                    .forEach(c -> completionMap.put(c.getLesson().getId().toString(), c.isCompleted()));
        }

        int total = lessons.size();
        int totalRequired = (int) lessons.stream().filter(ContentItem::isRequired).count();
        int completedRequired = (int) lessons.stream()
                .filter(ContentItem::isRequired)
                .filter(l -> Boolean.TRUE.equals(completionMap.get(l.getId().toString())))
                .count();
        int percentage = totalRequired == 0 ? (total == 0 ? 0 : 100) : (completedRequired * 100 / totalRequired);

        return CourseProgressDto.builder()
                .courseId(courseId.toString())
                .totalLessons(total)
                .totalRequiredLessons(totalRequired)
                .completedRequiredLessons(completedRequired)
                .completionPercentage(percentage)
                .lessonCompletion(completionMap)
                .build();
    }

    @Transactional(readOnly = true)
    public Map<String, CourseProgressDto> getProgressForCourses(User user, List<UUID> courseIds) {
        List<Resource> courses;
        if (courseIds == null || courseIds.isEmpty()) {
            List<UUID> started = lessonCompletionRepository.findDistinctCourseIdsByUserId(user.getId());
            if (started.isEmpty()) return Map.of();
            courses = resourceRepository.findAllById(started);
        } else {
            courses = resourceRepository.findAllById(courseIds);
        }
        courses = courses.stream()
                .filter(resource -> resource.getType() == Resource.ResourceType.COURSE)
                .toList();

        Map<String, CourseProgressDto> result = new HashMap<>();
        for (Resource course : courses) {
            result.put(course.getId().toString(), getProgress(user, course.getId()));
        }
        return result;
    }
}
