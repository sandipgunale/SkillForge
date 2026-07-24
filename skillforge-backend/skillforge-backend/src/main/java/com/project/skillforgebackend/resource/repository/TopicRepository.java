package com.project.skillforgebackend.resource.repository;

import com.project.skillforgebackend.resource.entity.Topic;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TopicRepository extends JpaRepository<Topic, UUID> {

    List<Topic> findAllByOrderByDisplayOrderAsc();

    boolean existsBySlug(String slug);

}