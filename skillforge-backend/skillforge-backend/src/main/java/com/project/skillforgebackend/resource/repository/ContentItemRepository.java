package com.project.skillforgebackend.resource.repository;

import com.project.skillforgebackend.resource.entity.ContentItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ContentItemRepository extends JpaRepository<ContentItem, UUID> {

    List<ContentItem> findAllByResourceIdOrderByOrderIndexAsc(UUID resourceId);

    List<ContentItem> findAllByResourceIdAndActiveTrueOrderByOrderIndexAsc(UUID resourceId);

    List<ContentItem> findAllByResourceId(UUID resourceId);
}
