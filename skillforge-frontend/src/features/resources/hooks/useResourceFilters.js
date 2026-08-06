import { useCallback, useState } from "react";
import { useSearchParams } from "react-router-dom";

const DEFAULT_FILTERS = Object.freeze({
  page: 0,
  size: 12,
  topicId: "",
  difficulty: "",
  type: "",
  search: "",
});

export function useResourceFilters() {
  const [searchParams] = useSearchParams();

  const [filters, setFilters] = useState(() => {
    const urlSearch = searchParams.get("search") ?? "";

    const urlTopicId = searchParams.get("topicId") ?? "";

    return {
      ...DEFAULT_FILTERS,
      search: urlSearch,
      topicId: urlTopicId,
    };
  });

  const updateFilter = useCallback((key, value) => {
    if (!(key in DEFAULT_FILTERS)) {
      return;
    }

    setFilters((previous) => {
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

      return hasChanges ? { ...DEFAULT_FILTERS } : previous;
    });
  }, []);

  return {
    filters,
    updateFilter,
    resetFilters,
  };
}
