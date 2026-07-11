import { Inbox } from "lucide-react";

export default function EmptyState({ icon: Icon = Inbox, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-12">
      <Icon className="mb-4 h-10 w-10 text-muted-foreground" />

      <h3 className="text-lg font-semibold">{title}</h3>

      <p className="mt-2 max-w-sm text-center text-muted-foreground">
        {description}
      </p>
    </div>
  );
}
