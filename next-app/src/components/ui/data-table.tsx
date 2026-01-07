"use client"

import * as React from "react"
import { AgGridReact } from "ag-grid-react"
import type {
  ColDef,
  GridReadyEvent,
  CellValueChangedEvent,
  RowSelectedEvent,
  GridApi,
  SelectionChangedEvent,
} from "ag-grid-community"
import { AllCommunityModule, ModuleRegistry, themeQuartz } from "ag-grid-community"

import { cn } from "@/lib/utils"

// Register AG Grid modules
ModuleRegistry.registerModules([AllCommunityModule])

// Custom dark theme - Matches design system card styling
// Design system:
// - Card BG: oklch(0.13 0 0) = #1a1a1a
// - Border: white 8%
// - Primary: #8b5cf6
const darkTheme = themeQuartz.withParams({
  // Background - matches card
  backgroundColor: "#1a1a1a",
  foregroundColor: "#fafafa",

  // Border - matches design system
  borderColor: "rgba(255, 255, 255, 0.08)",
  borderRadius: 8,
  wrapperBorderRadius: 12,

  // Header styling
  headerBackgroundColor: "rgba(255, 255, 255, 0.04)",
  headerTextColor: "#a1a1aa",
  headerFontSize: 11,
  headerFontWeight: 600,
  headerVerticalPaddingScale: 1.2,

  // Chrome (toolbar/pagination area)
  chromeBackgroundColor: "rgba(255, 255, 255, 0.02)",

  // Row styling - Zebra striping
  rowHoverColor: "rgba(255, 255, 255, 0.06)",
  selectedRowBackgroundColor: "rgba(139, 92, 246, 0.15)",
  oddRowBackgroundColor: "rgba(255, 255, 255, 0.025)",
  rowBorder: true,
  rowVerticalPaddingScale: 1.1,

  // Cell styling
  cellTextColor: "#e4e4e7",
  cellHorizontalPadding: 16,

  // Accent colors - primary purple
  accentColor: "#8b5cf6",

  // Input styling (for editable cells)
  inputBackgroundColor: "rgba(255, 255, 255, 0.05)",
  inputBorder: true,

  // Spacing
  spacing: 8,
})

export interface DataTableProps<T> {
  data: T[]
  columns: ColDef<T>[]
  onCellValueChanged?: (event: CellValueChangedEvent<T>) => void
  onRowSelected?: (event: RowSelectedEvent<T>) => void
  onSelectionChanged?: (event: SelectionChangedEvent<T>) => void
  onGridReady?: (event: GridReadyEvent<T>) => void
  rowSelection?: "single" | "multiple"
  editable?: boolean
  pagination?: boolean
  pageSize?: number
  height?: number | string
  loading?: boolean
  className?: string
  suppressRowClickSelection?: boolean
  enableCellTextSelection?: boolean
  getRowId?: (params: { data: T }) => string
}

function DataTable<T>({
  data,
  columns,
  onCellValueChanged,
  onRowSelected,
  onSelectionChanged,
  onGridReady,
  rowSelection,
  editable = false,
  pagination = true,
  pageSize = 20,
  height = 500,
  loading = false,
  className,
  suppressRowClickSelection = false,
  enableCellTextSelection = true,
  getRowId,
}: DataTableProps<T>) {
  const gridRef = React.useRef<AgGridReact<T>>(null)
  const [gridApi, setGridApi] = React.useState<GridApi<T> | null>(null)

  const defaultColDef = React.useMemo<ColDef<T>>(
    () => ({
      sortable: true,
      filter: true,
      resizable: true,
      editable: editable,
      cellStyle: {
        display: "flex",
        alignItems: "center",
      },
    }),
    [editable]
  )

  const handleGridReady = React.useCallback(
    (event: GridReadyEvent<T>) => {
      setGridApi(event.api)
      event.api.sizeColumnsToFit()
      onGridReady?.(event)
    },
    [onGridReady]
  )

  // Auto-resize columns on window resize
  React.useEffect(() => {
    const handleResize = () => {
      if (gridApi) {
        gridApi.sizeColumnsToFit()
      }
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [gridApi])

  return (
    <div
      className={cn(
        "w-full rounded-xl border border-white/[0.08] overflow-hidden",
        "bg-card shadow-lg",
        className
      )}
      style={{ height }}
    >
      <AgGridReact<T>
        ref={gridRef}
        theme={darkTheme}
        rowData={data}
        columnDefs={columns}
        defaultColDef={defaultColDef}
        onGridReady={handleGridReady}
        onCellValueChanged={onCellValueChanged}
        onRowSelected={onRowSelected}
        onSelectionChanged={onSelectionChanged}
        rowSelection={rowSelection}
        pagination={pagination}
        paginationPageSize={pageSize}
        paginationPageSizeSelector={[10, 20, 50, 100]}
        suppressRowClickSelection={suppressRowClickSelection}
        enableCellTextSelection={enableCellTextSelection}
        animateRows={true}
        loading={loading}
        overlayLoadingTemplate='<div class="flex items-center gap-2 text-muted-foreground"><svg class="animate-spin size-4" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>Loading...</div>'
        overlayNoRowsTemplate='<div class="text-muted-foreground">データがありません</div>'
        getRowId={getRowId}
      />
    </div>
  )
}

// Editable cell renderer with styling
function EditableCell({
  value,
  onValueChange,
}: {
  value: string | number
  onValueChange: (newValue: string | number) => void
}) {
  const [editing, setEditing] = React.useState(false)
  const [editValue, setEditValue] = React.useState(value)
  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editing])

  const handleBlur = () => {
    setEditing(false)
    if (editValue !== value) {
      onValueChange(editValue)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleBlur()
    } else if (e.key === "Escape") {
      setEditValue(value)
      setEditing(false)
    }
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className="w-full bg-transparent border-none outline-none focus:ring-1 focus:ring-primary rounded px-1"
      />
    )
  }

  return (
    <div
      onClick={() => setEditing(true)}
      className="cursor-pointer hover:bg-white/5 px-1 rounded"
    >
      {value}
    </div>
  )
}

// Currency cell renderer
function CurrencyCell({ value }: { value: number }) {
  const formatted = new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
    maximumFractionDigits: 0,
  }).format(value)

  return <span className="font-mono">{formatted}</span>
}

// Percentage cell renderer
function PercentageCell({ value }: { value: number }) {
  const isPositive = value >= 0
  return (
    <span
      className={cn(
        "font-mono",
        isPositive ? "text-emerald-400" : "text-red-400"
      )}
    >
      {isPositive ? "+" : ""}
      {value.toFixed(1)}%
    </span>
  )
}

// Status badge cell renderer
function StatusCell({
  value,
  statusMap,
}: {
  value: string
  statusMap?: Record<string, { label: string; color: string }>
}) {
  const defaultMap: Record<string, { label: string; color: string }> = {
    active: { label: "有効", color: "bg-emerald-500/20 text-emerald-400" },
    inactive: { label: "無効", color: "bg-zinc-500/20 text-zinc-400" },
    pending: { label: "保留", color: "bg-yellow-500/20 text-yellow-400" },
    error: { label: "エラー", color: "bg-red-500/20 text-red-400" },
  }

  const map = statusMap || defaultMap
  const status = map[value] || { label: value, color: "bg-zinc-500/20 text-zinc-400" }

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
        status.color
      )}
    >
      {status.label}
    </span>
  )
}

export { DataTable, EditableCell, CurrencyCell, PercentageCell, StatusCell }
