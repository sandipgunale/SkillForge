import { BookOpen, FileText, PlayCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";

const icons = {
  VIDEO: PlayCircle,
  ARTICLE: FileText,
  PDF: BookOpen,
};

export default function ResourceHeader({ resource }) {
  const Icon = icons[resource.type] || BookOpen;

  return (
    <div className="flex items-start justify-between">
      <div className="rounded-xl bg-primary/10 p-3">
        <Icon className="h-6 w-6 text-primary" />
      </div>

      <Badge variant="secondary">{resource.difficulty}</Badge>
    </div>
  );
}
