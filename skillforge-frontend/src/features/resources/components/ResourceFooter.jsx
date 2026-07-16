import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Rating from "@/components/common/Rating";

export default function ResourceFooter({ resource }) {
  return (
    <>
      <div className="flex items-center justify-between">
        <Rating value={resource.avgRating} />

        <Badge>{resource.topicName}</Badge>
      </div>

      <Button className="w-full">
        <Link to={`/resources/${resource.id}`}>View Details</Link>
      </Button>
    </>
  );
}
