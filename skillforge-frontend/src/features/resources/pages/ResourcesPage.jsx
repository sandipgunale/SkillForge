import PageContainer from "@/components/common/PageContainer";
import PageHeader from "@/components/common/PageHeader";
import ErrorState from "@/components/common/ErrorState";
import EmptyState from "@/components/common/EmptyState";

import FilterBar from "../components/FilterBar";
import ResourceGrid from "../components/ResourceGrid";

import { useResources } from "../hooks/useResources";
import { useTopics } from "../hooks/useTopics";
import { useResourceFilters } from "../hooks/useResourceFilters";

import ResourcePagination from "../components/ResourcePagination";

import ResourceGridSkeleton from "../components/loading/ResourceGridSkeleton";

export default function ResourcesPage() {
  const { filters, updateFilter, resetFilters } = useResourceFilters();

  const { data, isLoading, isError, refetch } = useResources(filters);

  const { data: topics = [] } = useTopics();

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

  const resources = data?.resources ?? [];

  return (
    <PageContainer>
      <PageHeader
        title="Resources"
        description="Explore curated learning resources."
      />

      <FilterBar
        filters={filters}
        updateFilter={updateFilter}
        resetFilters={resetFilters}
        topics={topics}
      />

      {resources.length === 0 ? (
        <EmptyState
          title="No resources found"
          description="Try changing your filters."
        />
      ) : (
        <ResourceGrid resources={resources} />
      )}
      <ResourcePagination
        page={data.page}
        totalPages={data.totalPages}
        onPageChange={(page) => updateFilter("page", page)}
      />
    </PageContainer>
  );
}
