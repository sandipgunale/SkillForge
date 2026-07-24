package com.project.skillforgebackend.resource.repository;

import com.project.skillforgebackend.resource.entity.Tag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TagRepository extends JpaRepository<Tag, UUID> {

    Optional<Tag> findBySlug(String slug);

    boolean existsBySlug(String slug);

    boolean existsByNameIgnoreCase(String name);

    List<Tag> findAllByIdIn(Collection<UUID> ids);
    List<Tag> findAllByOrderByNameAsc();

}