package com.project.skillforgebackend.resource.repository;

import com.project.skillforgebackend.resource.entity.CourseSection;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CourseSectionRepository extends JpaRepository<CourseSection, UUID> {

    List<CourseSection> findAllByResourceIdOrderByOrderIndexAsc(UUID resourceId);

    List<CourseSection> findAllByResourceIdAndActiveTrueOrderByOrderIndexAsc(UUID resourceId);

    List<CourseSection> findAllByResourceId(UUID resourceId);
}
