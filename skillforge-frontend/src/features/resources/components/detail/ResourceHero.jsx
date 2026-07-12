import { Badge } from "@/components/ui/badge";
import Rating from "@/components/common/Rating";

export default function ResourceHero({ resource }) {
  return (
    <div className="space-y-4">
      <h1 className="text-4xl font-bold tracking-tight">{resource.title}</h1>

      <div className="flex flex-wrap items-center gap-3">
        <Badge>{resource.topicName}</Badge>

        <Badge variant="secondary">{resource.difficulty}</Badge>

        <Badge variant="outline">{resource.type}</Badge>

        <Rating value={resource.avgRating} />
      </div>
    </div>
  );
}
