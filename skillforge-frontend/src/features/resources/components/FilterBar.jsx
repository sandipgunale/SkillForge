import SearchBar from "./SearchBar";
import TopicFilter from "./TopicFilter";
import DifficultyFilter from "./DifficultyFilter";

import { Button } from "@/components/ui/button";
import TypeFilter from "./TypeFilter";

export default function FilterBar({
  filters,
  updateFilter,
  resetFilters,
  topics,
}) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border bg-card p-4 lg:flex-row lg:items-center">
      <div className="flex-1">
        <SearchBar
          value={filters.search}
          onChange={(value) => updateFilter("search", value)}
        />
      </div>

      <TopicFilter
        value={filters.topicId}
        topics={topics}
        onChange={(value) => updateFilter("topicId", value)}
      />

      <DifficultyFilter
        value={filters.difficulty}
        onChange={(value) => updateFilter("difficulty", value)}
      />

      <TypeFilter
        value={filters.type}
        onChange={(value) => updateFilter("type", value)}
      />

      <Button variant="outline" onClick={resetFilters}>
        Clear
      </Button>
    </div>
  );
}
