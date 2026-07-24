import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import Rating from "@/components/common/Rating";

export default function ResourceFooter({ resource }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Rating value={resource.avgRating ?? 0} />

        <Badge variant="secondary">{resource.topicName}</Badge>
      </div>

      <Button asChild className="w-full">
        <Link to={`/resources/${resource.id}`}>
          View Details
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </Button>
    </div>
  );
}
