import { Link } from "react-router-dom";

import AppCard from "@/components/common/AppCard";
import EmptyState from "@/components/common/EmptyState";

import { useRelatedResources } from "../../hooks/useRelatedResources";

export default function RelatedResources({ resource }) {
  const { data = [], isLoading } = useRelatedResources(
    resource.topicId,
    resource.id,
  );

  if (isLoading) {
    return <p>Loading related resources...</p>;
  }

  if (!data.length) {
    return (
      <EmptyState
        title="No related resources"
        description="Explore more topics."
      />
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Related Resources</h2>

      <div className="grid gap-4 md:grid-cols-2">
        {data.map((item) => (
          <AppCard key={item.id} className="p-5">
            <h3 className="font-semibold">{item.title}</h3>

            <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
              {item.description}
            </p>

            <Link
              className="mt-4 inline-block text-primary"
              to={`/resources/${item.id}`}
            >
              View →
            </Link>
          </AppCard>
        ))}
      </div>
    </div>
  );
}
