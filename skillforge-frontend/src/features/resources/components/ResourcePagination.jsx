import { memo, useMemo } from "react";
import {
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
} from "lucide-react";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";

import { Button } from "@/components/ui/button";

function ResourcePagination({
  page,
  totalPages,
  totalElements = 0,
  pageSize = 12,
  onPageChange,
  isLoading = false,
}) {
  if (totalPages <= 1) {
    return null;
  }

  const currentPage = page + 1;

  const startItem = totalElements === 0 ? 0 : page * pageSize + 1;

  const endItem =
    totalElements === 0 ? 0 : Math.min((page + 1) * pageSize, totalElements);

  const pages = useMemo(() => {
    const result = [];

    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, currentPage + 2);

    for (let i = start; i <= end; i++) {
      result.push(i);
    }

    return result;
  }, [currentPage, totalPages]);

  return (
    <div className="mt-8 space-y-4">
      <div className="text-center text-sm text-muted-foreground">
        Showing <span className="font-medium">{startItem}</span>–
        <span className="font-medium">{endItem}</span> of{" "}
        <span className="font-medium">{totalElements}</span> resources
      </div>

      <Pagination aria-busy={isLoading}>
        <PaginationContent className="flex-wrap justify-center gap-2">
          <PaginationItem>
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
          </PaginationItem>

          <PaginationItem>
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
          </PaginationItem>

          {pages.map((pageNumber) => (
            <PaginationItem key={pageNumber}>
              <Button
                type="button"
                variant={pageNumber === currentPage ? "default" : "outline"}
                aria-current={pageNumber === currentPage ? "page" : undefined}
                disabled={isLoading}
                onClick={() => onPageChange(pageNumber - 1)}
              >
                {pageNumber}
              </Button>
            </PaginationItem>
          ))}

          <PaginationItem>
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
          </PaginationItem>

          <PaginationItem>
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
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}

export default memo(ResourcePagination);
