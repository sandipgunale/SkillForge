import { useParams } from "react-router-dom";

import PageContainer from "@/components/common/PageContainer";
import ErrorState from "@/components/common/ErrorState";

import { useResource } from "../hooks/useResource";
import ResourceDetailSkeleton from "../components/loading/ResourceDetailSkeleton";

import ResourceHero from "../components/detail/ResourceHero";
import ResourceContentSections from "../components/detail/ResourceContentSections";
import ResourceDescription from "../components/detail/ResourceDescription";
import ResourceInfoCard from "../components/detail/ResourceInfoCard";
import ResourceActionCard from "../components/detail/ResourceActionCard";
import RelatedResources from "../components/detail/RelatedResources";
import CourseExperience from "../components/detail/CourseExperience";

export default function ResourceDetailPage() {
  const { resourceId } = useParams();

  const { data: resource, isLoading, isError, refetch } = useResource(resourceId);

  if (isLoading) {
    return (
      <PageContainer>
        <ResourceDetailSkeleton />
      </PageContainer>
    );
  }

  if (isError) return <ErrorState onRetry={refetch} />;

  const isCourse = resource.type === "COURSE";

  if (isCourse) {
    return (
      <PageContainer>
        <ResourceHero resource={resource} />
        <CourseExperience resource={resource} />
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <RelatedResources resource={resource} />
          </div>
          <div className="space-y-6">
            <ResourceActionCard resource={resource} />
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <ResourceHero resource={resource} />

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <ResourceContentSections resource={resource} resourceId={resourceId} />
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
