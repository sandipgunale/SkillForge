package com.project.skillforgebackend.resource.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReorderContentItemsRequest {

    @NotNull(message = "Ordered content IDs are required.")
    @NotEmpty(message = "Ordered content IDs cannot be empty.")
    private List<UUID> orderedIds;
}
