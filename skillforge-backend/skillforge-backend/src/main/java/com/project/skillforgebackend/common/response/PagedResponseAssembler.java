package com.project.skillforgebackend.common.response;

import com.project.skillforgebackend.quiz.dto.PagedResponse;
import org.springframework.data.domain.Page;

import java.util.function.Function;

/**
 * Builds a {@link PagedResponse} from a Spring Data {@link Page}, mapping
 * each element through the given converter. Removes the repeated manual
 * page-metadata construction from services.
 */
public final class PagedResponseAssembler {

    private PagedResponseAssembler() {
    }

    public static <T, R> PagedResponse<R> assemble(
            Page<T> page,
            Function<T, R> mapper
    ) {
        return PagedResponse.<R>builder()
                .content(page.getContent()
                        .stream()
                        .map(mapper)
                        .toList())
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .first(page.isFirst())
                .last(page.isLast())
                .hasNext(page.hasNext())
                .hasPrevious(page.hasPrevious())
                .build();
    }
}
