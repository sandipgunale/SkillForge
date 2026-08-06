import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, FileText, Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { useQuery } from "@tanstack/react-query";

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

import { resourcesService } from "@/features/resources/api/resourcesService";
import { ROUTES } from "@/constants/routes";
import { useDebounce } from "@/hooks/useDebounce";

const MIN_QUERY_LENGTH = 2;

export default function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const debouncedQuery = useDebounce(query.trim(), 300);

  const { data, isFetching, isError } = useQuery({
    queryKey: ["global-search", debouncedQuery],
    queryFn: () =>
      resourcesService.getResources({ search: debouncedQuery, page: 0, size: 6 }),
    enabled: debouncedQuery.length >= MIN_QUERY_LENGTH,
    staleTime: 1000 * 30,
    gcTime: 1000 * 60 * 5,
    retry: 1,
  });

  const results = data?.resources ?? [];

  const showPanel =
    open && debouncedQuery.length >= MIN_QUERY_LENGTH;

  const goToResource = (resourceId) => {
    setOpen(false);
    setQuery("");
    navigate(ROUTES.RESOURCE_DETAIL.replace(":resourceId", resourceId));
  };

  const close = () => setOpen(false);

  return (
    <div
      className="relative w-full max-w-lg"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          close();
        }
      }}
    >
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

      <Input
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            close();
          }
        }}
        placeholder="Search resources..."
        className="h-9 rounded-full bg-muted/60 pl-9 pr-8"
        role="combobox"
        aria-expanded={showPanel}
        aria-controls="global-search-results"
        aria-label="Search resources"
      />

      {query && (
        <button
          type="button"
          onClick={() => {
            setQuery("");
            close();
          }}
          aria-label="Clear search"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-muted-foreground hover:text-foreground"
        >
          <X className="size-3.5" />
        </button>
      )}

      <AnimatePresence>
        {showPanel && (
          <motion.div
            id="global-search-results"
            role="listbox"
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-x-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border bg-popover p-1.5 elevate-float"
          >
          {isFetching ? (
            <div className="space-y-2 p-2">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-12 w-full rounded-xl" />
              ))}
            </div>
          ) : isError ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              Search is unavailable right now.
            </p>
          ) : results.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              No resources match{" "}
              <span className="font-medium text-foreground">
                &quot;{debouncedQuery}&quot;
              </span>
              .
            </p>
          ) : (
            <>
              <ul>
                {results.map((resource) => (
                  <li key={resource.id} role="option">
                    <button
                      type="button"
                      onClick={() => goToResource(resource.id)}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-muted"
                    >
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                        <FileText className="size-4" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {resource.title}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {resource.topicName || "Resource"}
                        </p>
                      </div>

                      {resource.difficulty && (
                        <Badge variant="secondary" className="shrink-0 capitalize">
                          {resource.difficulty.toLowerCase()}
                        </Badge>
                      )}
                    </button>
                  </li>
                ))}
              </ul>

              <div className="border-t px-2 py-1.5">
                <button
                  type="button"
                  onClick={() => {
                    close();
                    navigate(
                      `${ROUTES.RESOURCES}?search=${encodeURIComponent(
                        debouncedQuery,
                      )}`,
                    );
                  }}
                  className="flex w-full items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-primary hover:bg-muted"
                >
                  View all results
                  <ArrowRight className="size-3.5" />
                </button>
              </div>
            </>
          )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
