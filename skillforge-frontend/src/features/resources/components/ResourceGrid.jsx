import { memo } from "react";

import ResourceCard from "./ResourceCard";

function ResourceGrid({ resources, progressMap }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {resources.map((resource) => (
        <ResourceCard
          key={resource.id}
          resource={resource}
          progress={progressMap?.[resource.id]}
        />
      ))}
    </div>
  );
}

export default memo(ResourceGrid);
