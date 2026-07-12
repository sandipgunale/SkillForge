import { Badge } from "@/components/ui/badge";

export default function ResourceInfoCard({ resource }) {
  return (
    <div className="rounded-xl border bg-card p-6">
      <h2 className="mb-5 text-lg font-semibold">Resource Information</h2>

      <div className="space-y-4">
        <Info label="Topic" value={resource.topicName} />

        <Info label="Difficulty" value={resource.difficulty} />

        <Info label="Type" value={resource.type} />

        <Info label="Rating" value={resource.avgRating.toFixed(1)} />
      </div>

      {resource.tags?.length > 0 && (
        <div className="mt-6">
          <h3 className="mb-3 font-medium">Tags</h3>

          <div className="flex flex-wrap gap-2">
            {resource.tags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>

      <span className="font-medium">{value}</span>
    </div>
  );
}
