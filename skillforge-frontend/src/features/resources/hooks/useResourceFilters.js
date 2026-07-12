import { useState } from "react";

export function useResourceFilters() {
  const [filters, setFilters] = useState({
    page: 0,
    size: 12,

    topicId: "",
    difficulty: "",
    type: "",
    search: "",
  });

  const updateFilter = (key, value) => {
    setFilters((previous) => ({
      ...previous,

      page: key === "page" ? value : 0,

      [key]: value,
    }));
  };

  const resetFilters = () => {
    setFilters({
      page: 0,
      size: 12,

      topicId: "",
      difficulty: "",
      type: "",
      search: "",
    });
  };

  return {
    filters,
    updateFilter,
    resetFilters,
  };
}