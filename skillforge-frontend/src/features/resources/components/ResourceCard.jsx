import AppCard from "@/components/common/AppCard";

import ResourceHeader from "./ResourceHeader";
import ResourceBody from "./ResourceBody";
import ResourceFooter from "./ResourceFooter";
import ResourceTags from "./ResourceTags";

export default function ResourceCard({ resource }) {
  return (
    <AppCard className="group overflow-hidden">
      <div className="space-y-5 p-5">
        <ResourceHeader resource={resource} />

        <ResourceBody resource={resource} />

        <ResourceTags tags={resource.tags} />

        <ResourceFooter resource={resource} />
      </div>
    </AppCard>
  );
}
