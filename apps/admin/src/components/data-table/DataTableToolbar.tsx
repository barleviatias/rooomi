import { Input } from "@roomi/ui"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@roomi/ui"
import { Button } from "@roomi/ui"

interface FilterOption {
  label: string
  value: string
}

interface FilterConfig {
  key: string
  label: string
  options: FilterOption[]
}

interface DataTableToolbarProps {
  searchValue: string
  onSearchChange: (value: string) => void
  searchPlaceholder?: string
  filters?: FilterConfig[]
  filterValues?: Record<string, string>
  onFilterChange?: (key: string, value: string) => void
  onReset?: () => void
}

export function DataTableToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  filters = [],
  filterValues = {},
  onFilterChange,
  onReset,
}: DataTableToolbarProps) {
  const hasActiveFilters = searchValue || Object.values(filterValues).some((v) => v && v !== "all")

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <Input
        placeholder={searchPlaceholder}
        value={searchValue}
        onChange={(e) => onSearchChange(e.target.value)}
        className="max-w-xs"
      />
      {filters.map((filter) => (
        <Select
          key={filter.key}
          value={filterValues[filter.key] || "all"}
          onValueChange={(v) => onFilterChange?.(filter.key, v)}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder={filter.label} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All {filter.label}</SelectItem>
            {filter.options.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}
      {hasActiveFilters && onReset && (
        <Button variant="ghost" size="sm" onClick={onReset}>
          Reset
        </Button>
      )}
    </div>
  )
}
