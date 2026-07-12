import { cn } from "@/lib/utils";

export default function OptionItem({ label, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full rounded-lg border p-4 text-left transition-all",
        selected ? "border-primary bg-primary/10" : "hover:bg-muted",
      )}
    >
      {label}
    </button>
  );
}
