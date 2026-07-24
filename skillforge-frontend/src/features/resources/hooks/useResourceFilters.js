import { useCallback, useState } from "react";

const DEFAULT_FILTERS = Object.freeze({
  page: 0,
  size: 12,
  topicId: "",
  difficulty: "",
  type: "",
  search: "",
});

export function useResourceFilters() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const updateFilter = useCallback((key, value) => {
    setFilters((previous) => {
      // Avoid unnecessary state updates
      if (previous[key] === value) {
        return previous;
      }

      return {
        ...previous,
        [key]: value,
        page: key === "page" ? value : 0,
      };
    });
  }, []);

  const resetFilters = useCallback(() => {
    setFilters((previous) => {
      const hasChanges = Object.keys(DEFAULT_FILTERS).some(
        (key) => previous[key] !== DEFAULT_FILTERS[key]
      );

      return hasChanges ? DEFAULT_FILTERS : previous;
    });
  }, []);

  return {
    filters,
    updateFilter,
    resetFilters,
  };
}