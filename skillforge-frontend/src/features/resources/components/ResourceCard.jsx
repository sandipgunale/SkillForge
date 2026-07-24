import { memo } from "react";
import { BookOpen, Clock, FileText, PlayCircle, Star } from "lucide-react";
import { Link } from "react-router-dom";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function ResourceCard({ resource }) {
  const getTypeIcon = () => {
    switch (resource.type) {
      case "VIDEO":
        return <PlayCircle className="h-4 w-4" />;

      case "DOCS":
        return <FileText className="h-4 w-4" />;

      case "BOOK":
        return <BookOpen className="h-4 w-4" />;

      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  const getDifficultyVariant = () => {
    switch (resource.difficulty) {
      case "BEGINNER":
        return "secondary";

      case "INTERMEDIATE":
        return "default";

      case "ADVANCED":
        return "destructive";

      default:
        return "outline";
    }
  };

  return (
    <Card className="flex h-full flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <CardContent className="flex flex-1 flex-col gap-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <Badge className="flex items-center gap-1">
            {getTypeIcon()}
            {resource.type}
          </Badge>

          <Badge variant={getDifficultyVariant()}>{resource.difficulty}</Badge>
        </div>

        <div>
          <h3 className="line-clamp-2 text-lg font-semibold">
            {resource.title}
          </h3>

          <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
            {resource.description || "No description available."}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">{resource.topicName}</Badge>

          {resource.tags?.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="mt-auto flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />

            <span>{(resource.avgRating ?? 0).toFixed(1)}</span>

            <span>({resource.ratingCount})</span>
          </div>

          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />

            <span>{resource.estimatedMinutes} min</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="border-t p-5">
        <Button asChild className="w-full">
          <Link to={`/resources/${resource.id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export default memo(ResourceCard);
