package com.project.skillforgebackend.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AILearningPathResponse {

    /**
     * Generated roadmap.
     */
    private Object roadmap;
}