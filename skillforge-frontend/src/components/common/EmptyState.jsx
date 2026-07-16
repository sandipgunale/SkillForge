import { Inbox } from "lucide-react";

export default function EmptyState({ icon, title, description }) {
  return (
    <div className="flex h-72 flex-col items-center justify-center rounded-xl border border-dashed">
      <div className="mb-4 text-muted-foreground">
        {icon ?? <Inbox className="h-12 w-12" />}
      </div>

      <h3 className="text-lg font-semibold">{title}</h3>

      <p className="mt-2 max-w-sm text-center text-sm text-muted-foreground">
        {description}
      </p>
    </div>
  );
}
