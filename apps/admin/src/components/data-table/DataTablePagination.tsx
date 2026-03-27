import { Button } from "@roomi/ui"

interface DataTablePaginationProps {
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
}

export function DataTablePagination({ page, pageSize, total, onPageChange }: DataTablePaginationProps) {
  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="flex items-center justify-between px-2">
      <p className="text-sm text-muted-foreground">
        {total} total result{total !== 1 ? "s" : ""}
      </p>
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="sm" onClick={() => onPageChange(page - 1)} disabled={page <= 1}>
          Previous
        </Button>
        <span className="text-sm text-muted-foreground">
          Page {page} of {totalPages}
        </span>
        <Button variant="outline" size="sm" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages}>
          Next
        </Button>
      </div>
    </div>
  )
}
