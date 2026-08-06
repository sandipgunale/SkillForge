import { useCallback, useMemo } from "react";

import PageContainer from "@/components/common/PageContainer";
import PageHeader from "@/components/common/PageHeader";
import ErrorState from "@/components/common/ErrorState";
import EmptyState from "@/components/common/EmptyState";

import FilterBar from "../components/FilterBar";
import ResourceGrid from "../components/ResourceGrid";
import ResourcePagination from "../components/ResourcePagination";
import ResourceGridSkeleton from "../components/loading/ResourceGridSkeleton";

import { useResources } from "../hooks/useResources";
import { useTopics } from "../hooks/useTopics";
import { useResourceFilters } from "../hooks/useResourceFilters";

import { useDebounce } from "@/hooks/useDebounce";

export default function ResourcesPage() {
  const { filters, updateFilter, resetFilters } = useResourceFilters();

  const debouncedSearch = useDebounce(filters.search, 500);

  const queryFilters = useMemo(
    () => ({
      ...filters,
      search: debouncedSearch,
    }),
    [filters, debouncedSearch],
  );

  const { data, isLoading, isFetching, isError, refetch } =
    useResources(queryFilters);

  const { data: topics = [], isLoading: topicsLoading } = useTopics();

  const handlePageChange = useCallback(
    (page) => {
      updateFilter("page", page);
    },
    [updateFilter],
  );

  if (isLoading) {
    return (
      <PageContainer>
        <PageHeader
          title="Resources"
          description="Explore curated learning resources."
        />

        <ResourceGridSkeleton />
      </PageContainer>
    );
  }

  if (isError) {
    return <ErrorState onRetry={refetch} />;
  }

  const {
    resources = [],
    page = 0,
    totalPages = 0,
    totalElements = 0,
    size = 12,
  } = data ?? {};

  return (
    <PageContainer>
      <PageHeader
        title="Resources"
        description="Explore curated learning resources."
      />

      <section className="mb-8">
        <FilterBar
          filters={filters}
          topics={topics}
          topicsLoading={topicsLoading}
          isSearching={isFetching}
          onFilterChange={updateFilter}
          onReset={resetFilters}
        />
      </section>

      <section>
        {resources.length === 0 ? (
          <EmptyState
            title="No resources found"
            description="Try changing your filters."
          />
        ) : (
          <ResourceGrid resources={resources} />
        )}
      </section>

      <ResourcePagination
        page={page}
        totalPages={totalPages}
        totalElements={totalElements}
        pageSize={size}
        isLoading={isFetching}
        onPageChange={handlePageChange}
      />
    </PageContainer>
  );
}
