import { memo } from "react";
import {
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";

function ResourcePagination({
  page,
  totalPages,
  totalElements = 0,
  pageSize = 12,
  onPageChange,
  isLoading = false,
  label = "resources",
}) {
  if (totalPages <= 1) {
    return null;
  }

  const currentPage = page + 1;

  const startItem = totalElements === 0 ? 0 : page * pageSize + 1;

  const endItem =
    totalElements === 0 ? 0 : Math.min((page + 1) * pageSize, totalElements);

  const pages = [];

  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, currentPage + 2);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return (
    <div className="mt-8 space-y-4">
      <div className="text-center text-sm text-muted-foreground">
        Showing <span className="font-medium">{startItem}</span>–
        <span className="font-medium">{endItem}</span> of{" "}
        <span className="font-medium">{totalElements}</span> {label}
      </div>

      <nav
        aria-label="Resource pagination"
        aria-busy={isLoading}
        className="flex flex-wrap items-center justify-center gap-2"
      >
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="First page"
            disabled={page === 0 || isLoading}
            onClick={() => onPageChange(0)}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Previous page"
            disabled={page === 0 || isLoading}
            onClick={() => onPageChange(page - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {pages.map((pageNumber) => (
            <Button
              key={pageNumber}
              type="button"
              variant={pageNumber === currentPage ? "default" : "outline"}
              aria-current={pageNumber === currentPage ? "page" : undefined}
              disabled={isLoading}
              onClick={() => onPageChange(pageNumber - 1)}
            >
              {pageNumber}
            </Button>
          ))}

          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Next page"
            disabled={page === totalPages - 1 || isLoading}
            onClick={() => onPageChange(page + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Last page"
            disabled={page === totalPages - 1 || isLoading}
            onClick={() => onPageChange(totalPages - 1)}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
      </nav>
    </div>
  );
}

export default memo(ResourcePagination);
