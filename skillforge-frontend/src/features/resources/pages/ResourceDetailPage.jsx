import { useParams } from "react-router-dom";

import PageContainer from "@/components/common/PageContainer";
import ErrorState from "@/components/common/ErrorState";

import { useResource } from "../hooks/useResource";
import ResourceDetailSkeleton from "../components/loading/ResourceDetailSkeleton";

import ResourceHero from "../components/detail/ResourceHero";
import ResourceViewer from "../components/detail/ResourceViewer";
import ResourceDescription from "../components/detail/ResourceDescription";
import ResourceInfoCard from "../components/detail/ResourceInfoCard";
import ResourceActionCard from "../components/detail/ResourceActionCard";
import RelatedResources from "../components/detail/RelatedResources";

export default function ResourceDetailPage() {
  const { id } = useParams();

  const { data: resource, isLoading, isError, refetch } = useResource(id);

  if (isLoading) {
    return (
      <PageContainer>
        <ResourceDetailSkeleton />
      </PageContainer>
    );
  }

  if (isError) return <ErrorState onRetry={refetch} />;

  return (
    <PageContainer>
      <ResourceHero resource={resource} />

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <ResourceViewer resource={resource} />
          <ResourceDescription resource={resource} />

          <RelatedResources resource={resource} />
        </div>

        <div className="space-y-6">
          <ResourceInfoCard resource={resource} />

          <ResourceActionCard resource={resource} />
        </div>
      </div>
    </PageContainer>
  );
}
