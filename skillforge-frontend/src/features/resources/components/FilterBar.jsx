import { RotateCcw } from "lucide-react";

import SearchBar from "./SearchBar";
import TopicFilter from "./TopicFilter";
import DifficultyFilter from "./DifficultyFilter";
import TypeFilter from "./TypeFilter";

import { Button } from "@/components/ui/button";

export default function FilterBar({
  filters,
  topics = [],
  onFilterChange,
  onReset,
}) {
  const hasActiveFilters =
    Boolean(filters.search?.trim()) ||
    Boolean(filters.topicId) ||
    Boolean(filters.difficulty) ||
    Boolean(filters.type);

  return (
    <div className="space-y-4 rounded-xl border bg-card p-5">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <SearchBar
          value={filters.search}
          onChange={(value) => onFilterChange("search", value)}
        />

        <TopicFilter
          value={filters.topicId}
          topics={topics}
          onChange={(value) => onFilterChange("topicId", value)}
        />

        <DifficultyFilter
          value={filters.difficulty}
          onChange={(value) => onFilterChange("difficulty", value)}
        />

        <TypeFilter
          value={filters.type}
          onChange={(value) => onFilterChange("type", value)}
        />
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {hasActiveFilters
            ? "Filters are currently applied."
            : "Showing all available resources."}
        </p>

        <Button
          variant="outline"
          onClick={onReset}
          disabled={!hasActiveFilters}
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Clear Filters
        </Button>
      </div>
    </div>
  );
}
