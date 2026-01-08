"use client"

import * as React from "react"
import { ChevronDown, ChevronRight, Plus, X, Pencil, Check, ChevronsDownUp, ArrowRightToLine, ArrowDownToLine } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { type DimensionType, type Budget, getDailyBudget, isBusinessDay, isJapaneseHoliday } from "@/types/database"

export type { DimensionType }

export interface DimensionConfig {
  id: DimensionType
  label: string
}

export const DIMENSION_OPTIONS: DimensionConfig[] = [
  { id: "jobScope", label: "職務範囲" },
  { id: "jobLevel", label: "業務レベル" },
  { id: "orderCategory", label: "発注科目" },
]

export interface OrderData {
  id: string
  date: string
  amount: number
  jobScope: string
  jobLevel: string
  orderCategories: string[]
}

export type ViewMode = "actual" | "budget" | "variance"
export type TimeGranularity = "daily" | "yearly"

export interface BudgetChangeParams {
  yearMonth: string
  dimensionType: DimensionType
  dimensionValue: string
  amount: number
}

interface AccountingTableProps {
  data: OrderData[]
  budgets: Budget[]
  centerDate: Date
  periodStart: Date
  periodEnd: Date
  periodLabel?: string
  onBudgetChange?: (params: BudgetChangeParams) => Promise<void>
  className?: string
}

// Generate date range
function generateDateRange(centerDate: Date, daysBeforeAfter: number = 45): Date[] {
  const dates: Date[] = []
  const start = new Date(centerDate)
  start.setDate(start.getDate() - daysBeforeAfter)

  for (let i = 0; i < daysBeforeAfter * 2 + 1; i++) {
    const date = new Date(start)
    date.setDate(start.getDate() + i)
    dates.push(date)
  }

  return dates
}

// Generate month range for yearly view (12 months of the selected year)
function generateMonthRange(year: number): { month: number; year: number; key: string }[] {
  const months: { month: number; year: number; key: string }[] = []
  for (let m = 0; m < 12; m++) {
    months.push({
      month: m,
      year,
      key: `${year}-${String(m + 1).padStart(2, "0")}`,
    })
  }
  return months
}

function formatDateKey(date: Date): string {
  return date.toISOString().split("T")[0]
}

function getDimensionValue(order: OrderData, dimension: DimensionType): string[] {
  switch (dimension) {
    case "jobScope":
      return [order.jobScope || "未設定"]
    case "jobLevel":
      return [order.jobLevel || "未設定"]
    case "orderCategory":
      return order.orderCategories.length > 0 ? order.orderCategories : ["未設定"]
    default:
      return ["未設定"]
  }
}

function buildHierarchyKey(values: string[]): string {
  return values.join(" > ")
}

interface RowData {
  key: string
  labels: string[]
  level: number
  isExpanded: boolean
  hasChildren: boolean
  isLeaf: boolean                         // True if this row is editable (no expanded children)
  dimensionType: DimensionType            // The dimension type for this row
  dimensionValue: string                  // The dimension value for this row
  amounts: Record<string, number>         // Actual amounts (daily)
  budgetAmounts: Record<string, number>   // Budget amounts (daily prorated)
  monthlyActuals: Record<string, number>  // Actual amounts (monthly, for yearly view)
  monthlyBudgets: Record<string, number>  // Budget amounts (monthly, for yearly view)
  total: number                            // Actual total for period
  budgetTotal: number                      // Budget total for period
  monthlyBudget: number                   // Monthly budget for editing (or sum of children)
}

// Cell position type for selection
interface CellPosition {
  rowIndex: number
  monthIndex: number
}

export function AccountingTable({ data, budgets, centerDate, periodStart, periodEnd, periodLabel, onBudgetChange, className }: AccountingTableProps) {
  const [dimensions, setDimensions] = React.useState<DimensionType[]>(["jobScope", "orderCategory"])
  const [expandedRows, setExpandedRows] = React.useState<Set<string>>(new Set())
  const [viewMode, setViewMode] = React.useState<ViewMode>("actual")
  const [timeGranularity, setTimeGranularity] = React.useState<TimeGranularity>("daily")
  const [editingCell, setEditingCell] = React.useState<string | null>(null)
  const [editValue, setEditValue] = React.useState<string>("")
  const [isSaving, setIsSaving] = React.useState(false)
  const scrollContainerRef = React.useRef<HTMLDivElement>(null)
  const todayRef = React.useRef<HTMLTableCellElement>(null)

  // Excel-like selection state
  const [selectionStart, setSelectionStart] = React.useState<CellPosition | null>(null)
  const [selectionEnd, setSelectionEnd] = React.useState<CellPosition | null>(null)
  const [isSelecting, setIsSelecting] = React.useState(false)
  const tableRef = React.useRef<HTMLTableElement>(null)

  const selectedYear = centerDate.getFullYear()
  const dates = React.useMemo(() => generateDateRange(centerDate, 45), [centerDate])
  const months = React.useMemo(() => generateMonthRange(selectedYear), [selectedYear])

  // Auto-expand all rows when dimensions change (show most granular by default)
  React.useEffect(() => {
    if (dimensions.length <= 1) {
      setExpandedRows(new Set())
      return
    }

    // Collect all expandable row keys
    const allKeys = new Set<string>()

    const collectExpandableKeys = (orders: OrderData[], dimIndex: number, parentLabels: string[] = []): void => {
      if (dimIndex >= dimensions.length - 1) return // Don't need to expand last level

      const dimension = dimensions[dimIndex]
      const values = new Set<string>()

      orders.forEach(order => {
        getDimensionValue(order, dimension).forEach(v => values.add(v))
      })

      values.forEach(value => {
        const currentLabels = [...parentLabels, value]
        const key = buildHierarchyKey(currentLabels)
        allKeys.add(key)

        // Recursively collect keys for children
        const matchingOrders = orders.filter(order =>
          getDimensionValue(order, dimension).includes(value)
        )
        collectExpandableKeys(matchingOrders, dimIndex + 1, currentLabels)
      })
    }

    collectExpandableKeys(data, 0)
    setExpandedRows(allKeys)
  }, [dimensions, data])

  // Check if date is within period
  const isInPeriod = React.useCallback((dateKey: string) => {
    const date = new Date(dateKey)
    return date >= periodStart && date <= periodEnd
  }, [periodStart, periodEnd])

  // Build budget lookup map: dimension_type -> dimension_value -> year_month -> daily budget
  const budgetMap = React.useMemo(() => {
    const map = new Map<string, Map<string, Map<string, number>>>()

    budgets.forEach(budget => {
      if (!map.has(budget.dimension_type)) {
        map.set(budget.dimension_type, new Map())
      }
      const typeMap = map.get(budget.dimension_type)!

      if (!typeMap.has(budget.dimension_value)) {
        typeMap.set(budget.dimension_value, new Map())
      }
      const valueMap = typeMap.get(budget.dimension_value)!

      // Calculate daily budget from monthly amount
      const [year, month] = budget.year_month.split("-").map(Number)
      const dailyBudget = getDailyBudget(budget.amount, year, month - 1)
      valueMap.set(budget.year_month, dailyBudget)
    })

    return map
  }, [budgets])

  // Get daily budget for a dimension value on a specific date
  const getDailyBudgetForDate = React.useCallback((
    dimensionType: DimensionType,
    dimensionValue: string,
    dateKey: string
  ): number => {
    const yearMonth = dateKey.substring(0, 7) // "2025-01-15" -> "2025-01"
    const typeMap = budgetMap.get(dimensionType)
    if (!typeMap) return 0
    const valueMap = typeMap.get(dimensionValue)
    if (!valueMap) return 0
    return valueMap.get(yearMonth) ?? 0
  }, [budgetMap])

  // Get year-month string for the selected period
  const selectedYearMonth = React.useMemo(() => {
    const year = periodStart.getFullYear()
    const month = String(periodStart.getMonth() + 1).padStart(2, "0")
    return `${year}-${month}`
  }, [periodStart])

  // Get monthly budget for a dimension value (for selected month)
  const getMonthlyBudget = React.useCallback((
    dimensionType: DimensionType,
    dimensionValue: string
  ): number => {
    const budget = budgets.find(
      b => b.dimension_type === dimensionType &&
           b.dimension_value === dimensionValue &&
           b.year_month === selectedYearMonth
    )
    return budget?.amount ?? 0
  }, [budgets, selectedYearMonth])

  // Get monthly budget for any year-month (for yearly view)
  const getMonthlyBudgetForYearMonth = React.useCallback((
    dimensionType: DimensionType,
    dimensionValue: string,
    yearMonth: string
  ): number => {
    const budget = budgets.find(
      b => b.dimension_type === dimensionType &&
           b.dimension_value === dimensionValue &&
           b.year_month === yearMonth
    )
    return budget?.amount ?? 0
  }, [budgets])

  // Handle starting edit
  const startEditing = (cellKey: string, currentValue: number) => {
    setEditingCell(cellKey)
    setEditValue(currentValue.toString())
  }

  // Handle saving budget (yearMonth optional - defaults to selected month)
  const saveBudget = async (dimensionType: DimensionType, dimensionValue: string, yearMonth?: string) => {
    if (!onBudgetChange) return

    const amount = parseInt(editValue, 10) || 0
    setIsSaving(true)

    try {
      await onBudgetChange({
        yearMonth: yearMonth ?? selectedYearMonth,
        dimensionType,
        dimensionValue,
        amount,
      })
    } catch (err) {
      console.error("Budget save error:", err)
      alert(`予算の保存に失敗しました: ${err instanceof Error ? err.message : "不明なエラー"}`)
    } finally {
      setIsSaving(false)
      setEditingCell(null)
    }
  }

  // Handle fill right - save the same value to current month and all subsequent months
  const saveBudgetFillRight = async (dimensionType: DimensionType, dimensionValue: string, startYearMonth: string) => {
    if (!onBudgetChange) return

    const amount = parseInt(editValue, 10) || 0
    setIsSaving(true)

    try {
      // Find the start month index
      const startIndex = months.findIndex(m => m.key === startYearMonth)
      if (startIndex === -1) return

      // Save to all months from start to end of year
      const savePromises = months.slice(startIndex).map(m =>
        onBudgetChange({
          yearMonth: m.key,
          dimensionType,
          dimensionValue,
          amount,
        })
      )

      await Promise.all(savePromises)
    } catch (err) {
      console.error("Budget fill right error:", err)
      alert(`予算の保存に失敗しました: ${err instanceof Error ? err.message : "不明なエラー"}`)
    } finally {
      setIsSaving(false)
      setEditingCell(null)
    }
  }

  // Build row data with hierarchy
  const rowsData = React.useMemo(() => {
    const rows: RowData[] = []
    const processedKeys = new Set<string>()

    const collectHierarchy = (orders: OrderData[], dimIndex: number, parentLabels: string[] = []): void => {
      if (dimIndex >= dimensions.length) return

      const dimension = dimensions[dimIndex]
      const valueMap = new Map<string, OrderData[]>()

      orders.forEach(order => {
        const values = getDimensionValue(order, dimension)
        values.forEach(value => {
          if (!valueMap.has(value)) {
            valueMap.set(value, [])
          }
          valueMap.get(value)!.push(order)
        })
      })

      const sortedValues = Array.from(valueMap.keys()).sort()

      sortedValues.forEach(value => {
        const currentLabels = [...parentLabels, value]
        const key = buildHierarchyKey(currentLabels)

        if (processedKeys.has(key)) return
        processedKeys.add(key)

        const matchingOrders = valueMap.get(value)!
        const hasChildren = dimIndex < dimensions.length - 1
        const isExpanded = expandedRows.has(key)
        // Leaf = no children OR not expanded (budget editable only on leaves)
        const isLeaf = !hasChildren || !isExpanded

        const amounts: Record<string, number> = {}
        const budgetAmounts: Record<string, number> = {}
        const monthlyActuals: Record<string, number> = {}
        const monthlyBudgets: Record<string, number> = {}

        dates.forEach(date => {
          const dateKey = formatDateKey(date)
          amounts[dateKey] = 0
          // Get daily budget for this dimension value (only on business days)
          // For leaf nodes, use actual budget; for parents, will be calculated later
          budgetAmounts[dateKey] = isBusinessDay(date)
            ? getDailyBudgetForDate(dimension, value, dateKey)
            : 0
        })

        // Initialize monthly actuals and budgets for yearly view
        months.forEach(m => {
          monthlyActuals[m.key] = 0
          monthlyBudgets[m.key] = getMonthlyBudgetForYearMonth(dimension, value, m.key)
        })

        matchingOrders.forEach(order => {
          const dateKey = order.date.split("T")[0]
          if (amounts[dateKey] !== undefined) {
            amounts[dateKey] += order.amount
          }
          // Also aggregate by month for yearly view
          const yearMonth = dateKey.substring(0, 7)
          if (monthlyActuals[yearMonth] !== undefined) {
            monthlyActuals[yearMonth] += order.amount
          }
        })

        // Only sum amounts within the selected period
        const total = Object.entries(amounts).reduce((sum, [dateKey, val]) => {
          return isInPeriod(dateKey) ? sum + val : sum
        }, 0)

        const budgetTotal = Object.entries(budgetAmounts).reduce((sum, [dateKey, val]) => {
          return isInPeriod(dateKey) ? sum + val : sum
        }, 0)

        const rowIndex = rows.length
        rows.push({
          key,
          labels: currentLabels,
          level: dimIndex,
          isExpanded,
          hasChildren,
          isLeaf,
          dimensionType: dimension,
          dimensionValue: value,
          amounts,
          budgetAmounts,
          monthlyActuals,
          monthlyBudgets,
          total,
          budgetTotal,
          monthlyBudget: getMonthlyBudget(dimension, value),
        })

        // If has children, always calculate children sums (for subtotal display even when collapsed)
        if (hasChildren) {
          const childStartIndex = rows.length

          // Temporarily collect child data to calculate sums
          // We'll remove them later if not expanded
          collectHierarchy(matchingOrders, dimIndex + 1, currentLabels)

          const childEndIndex = rows.length

          // Sum children's values for this parent (bottom-up)
          let childrenMonthlyBudgetSum = 0
          const childrenDailyBudgetSums: Record<string, number> = {}
          const childrenMonthlyActualSums: Record<string, number> = {}
          const childrenMonthlyBudgetSums: Record<string, number> = {}

          dates.forEach(date => {
            childrenDailyBudgetSums[formatDateKey(date)] = 0
          })
          months.forEach(m => {
            childrenMonthlyActualSums[m.key] = 0
            childrenMonthlyBudgetSums[m.key] = 0
          })

          // Only sum immediate children (same level + 1)
          for (let i = childStartIndex; i < childEndIndex; i++) {
            if (rows[i].level === dimIndex + 1) {
              childrenMonthlyBudgetSum += rows[i].monthlyBudget
              Object.entries(rows[i].budgetAmounts).forEach(([dateKey, amount]) => {
                childrenDailyBudgetSums[dateKey] += amount
              })
              // Sum monthly actuals and budgets for yearly view
              Object.entries(rows[i].monthlyActuals).forEach(([monthKey, amount]) => {
                childrenMonthlyActualSums[monthKey] += amount
              })
              Object.entries(rows[i].monthlyBudgets).forEach(([monthKey, amount]) => {
                childrenMonthlyBudgetSums[monthKey] += amount
              })
            }
          }

          // Update parent row with children's sums
          rows[rowIndex].monthlyBudget = childrenMonthlyBudgetSum
          rows[rowIndex].budgetAmounts = childrenDailyBudgetSums
          rows[rowIndex].monthlyActuals = childrenMonthlyActualSums
          rows[rowIndex].monthlyBudgets = childrenMonthlyBudgetSums
          rows[rowIndex].budgetTotal = Object.entries(childrenDailyBudgetSums).reduce(
            (sum, [dateKey, val]) => isInPeriod(dateKey) ? sum + val : sum,
            0
          )

          // If not expanded, remove the children rows (we only needed them for sum calculation)
          if (!isExpanded) {
            rows.splice(childStartIndex, childEndIndex - childStartIndex)
          }
        }
      })
    }

    collectHierarchy(data, 0)
    return rows
  }, [data, dimensions, dates, months, expandedRows, isInPeriod, getDailyBudgetForDate, getMonthlyBudget, getMonthlyBudgetForYearMonth])

  // Implement fill down function (needs rowsData)
  const saveBudgetFillDown = React.useCallback(async (currentRowKey: string, yearMonth: string) => {
    if (!onBudgetChange) return

    const amount = parseInt(editValue, 10) || 0
    setIsSaving(true)

    try {
      // Find current row index
      const currentIndex = rowsData.findIndex(r => r.key === currentRowKey)
      if (currentIndex === -1) return

      // Get all leaf rows from current index onwards
      const targetRows = rowsData.slice(currentIndex).filter(r => r.isLeaf)

      // Save to all target rows for this month
      const savePromises = targetRows.map(row =>
        onBudgetChange({
          yearMonth,
          dimensionType: row.dimensionType,
          dimensionValue: row.dimensionValue,
          amount,
        })
      )

      await Promise.all(savePromises)
    } catch (err) {
      console.error("Budget fill down error:", err)
      alert(`予算の保存に失敗しました: ${err instanceof Error ? err.message : "不明なエラー"}`)
    } finally {
      setIsSaving(false)
      setEditingCell(null)
    }
  }, [onBudgetChange, editValue, rowsData])

  // Get leaf rows only (for selection)
  const leafRows = React.useMemo(() => {
    return rowsData.filter(r => r.isLeaf)
  }, [rowsData])

  // Check if a cell is within selection range
  const isCellSelected = React.useCallback((rowIndex: number, monthIndex: number) => {
    if (!selectionStart) return false
    const end = selectionEnd || selectionStart

    const minRow = Math.min(selectionStart.rowIndex, end.rowIndex)
    const maxRow = Math.max(selectionStart.rowIndex, end.rowIndex)
    const minMonth = Math.min(selectionStart.monthIndex, end.monthIndex)
    const maxMonth = Math.max(selectionStart.monthIndex, end.monthIndex)

    return rowIndex >= minRow && rowIndex <= maxRow &&
           monthIndex >= minMonth && monthIndex <= maxMonth
  }, [selectionStart, selectionEnd])

  // Check if cell is the active cell (cursor position)
  const isActiveCell = React.useCallback((rowIndex: number, monthIndex: number) => {
    if (!selectionStart) return false
    return selectionStart.rowIndex === rowIndex && selectionStart.monthIndex === monthIndex
  }, [selectionStart])

  // Handle cell mouse down (start selection)
  const handleCellMouseDown = React.useCallback((rowIndex: number, monthIndex: number, e: React.MouseEvent) => {
    if (viewMode !== "budget" || timeGranularity !== "yearly") return
    e.preventDefault()
    setSelectionStart({ rowIndex, monthIndex })
    setSelectionEnd(null)
    setIsSelecting(true)
    setEditingCell(null)
  }, [viewMode, timeGranularity])

  // Handle cell mouse enter (extend selection)
  const handleCellMouseEnter = React.useCallback((rowIndex: number, monthIndex: number) => {
    if (!isSelecting) return
    setSelectionEnd({ rowIndex, monthIndex })
  }, [isSelecting])

  // Handle mouse up (end selection)
  React.useEffect(() => {
    const handleMouseUp = () => {
      setIsSelecting(false)
    }
    window.addEventListener("mouseup", handleMouseUp)
    return () => window.removeEventListener("mouseup", handleMouseUp)
  }, [])

  // Clear selection when clicking outside the table
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!selectionStart) return
      const target = e.target as HTMLElement
      // Check if click is inside the table or selection input bar
      if (tableRef.current?.contains(target)) return
      // Check if clicking on the selection input bar
      if (target.closest('[data-selection-bar]')) return
      // Clear selection
      setSelectionStart(null)
      setSelectionEnd(null)
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [selectionStart])

  // Clear selection when switching modes
  React.useEffect(() => {
    setSelectionStart(null)
    setSelectionEnd(null)
  }, [viewMode, timeGranularity])

  // Save to all selected cells
  const saveToSelectedCells = React.useCallback(async () => {
    if (!onBudgetChange || !selectionStart) return

    const end = selectionEnd || selectionStart
    const amount = parseInt(editValue, 10) || 0
    setIsSaving(true)

    try {
      const minRow = Math.min(selectionStart.rowIndex, end.rowIndex)
      const maxRow = Math.max(selectionStart.rowIndex, end.rowIndex)
      const minMonth = Math.min(selectionStart.monthIndex, end.monthIndex)
      const maxMonth = Math.max(selectionStart.monthIndex, end.monthIndex)

      const savePromises: Promise<void>[] = []

      for (let ri = minRow; ri <= maxRow; ri++) {
        const row = leafRows[ri]
        if (!row) continue

        for (let mi = minMonth; mi <= maxMonth; mi++) {
          const month = months[mi]
          if (!month) continue

          savePromises.push(
            onBudgetChange({
              yearMonth: month.key,
              dimensionType: row.dimensionType,
              dimensionValue: row.dimensionValue,
              amount,
            })
          )
        }
      }

      await Promise.all(savePromises)
    } catch (err) {
      console.error("Budget save error:", err)
      alert(`予算の保存に失敗しました: ${err instanceof Error ? err.message : "不明なエラー"}`)
    } finally {
      setIsSaving(false)
      setEditingCell(null)
      setSelectionStart(null)
      setSelectionEnd(null)
    }
  }, [onBudgetChange, editValue, selectionStart, selectionEnd, leafRows, months])

  // Get selection size text
  const getSelectionInfo = React.useCallback(() => {
    if (!selectionStart) return null
    const end = selectionEnd || selectionStart
    const rows = Math.abs(end.rowIndex - selectionStart.rowIndex) + 1
    const cols = Math.abs(end.monthIndex - selectionStart.monthIndex) + 1
    return { rows, cols, total: rows * cols }
  }, [selectionStart, selectionEnd])

  // Handle column header double-click (select entire column)
  const handleColumnDoubleClick = React.useCallback((monthIndex: number) => {
    if (viewMode !== "budget" || timeGranularity !== "yearly") return
    if (leafRows.length === 0) return

    // Select from first leaf row to last leaf row for this column
    setSelectionStart({ rowIndex: 0, monthIndex })
    setSelectionEnd({ rowIndex: leafRows.length - 1, monthIndex })
    setEditingCell(null)
  }, [viewMode, timeGranularity, leafRows.length])

  // Handle row header double-click (select entire row)
  const handleRowDoubleClick = React.useCallback((rowKey: string) => {
    if (viewMode !== "budget" || timeGranularity !== "yearly") return

    // Find the leaf row index
    const leafRowIndex = leafRows.findIndex(r => r.key === rowKey)
    if (leafRowIndex === -1) return

    // Select all months for this row
    setSelectionStart({ rowIndex: leafRowIndex, monthIndex: 0 })
    setSelectionEnd({ rowIndex: leafRowIndex, monthIndex: months.length - 1 })
    setEditingCell(null)
  }, [viewMode, timeGranularity, leafRows, months.length])

  // Calculate column totals (actual and budget) - sum top-level rows only (daily view)
  const { columnTotals, columnBudgetTotals } = React.useMemo(() => {
    const totals: Record<string, number> = {}
    const budgetTotals: Record<string, number> = {}

    dates.forEach(date => {
      const dateKey = formatDateKey(date)
      totals[dateKey] = 0
      budgetTotals[dateKey] = 0
    })

    // Sum from top-level rows only (they contain children sums when collapsed)
    rowsData.forEach(row => {
      if (row.level === 0) {
        Object.entries(row.amounts).forEach(([dateKey, amount]) => {
          totals[dateKey] += amount
        })
        Object.entries(row.budgetAmounts).forEach(([dateKey, amount]) => {
          budgetTotals[dateKey] += amount
        })
      }
    })

    return { columnTotals: totals, columnBudgetTotals: budgetTotals }
  }, [rowsData, dates])

  // Calculate yearly data (monthly aggregates for yearly view)
  const yearlyRowData = React.useMemo(() => {
    // Group actual amounts by dimension value and month
    const monthlyActuals = new Map<string, Map<string, Record<string, number>>>()

    // First, aggregate all orders by dimension and month
    data.forEach(order => {
      const dateKey = order.date.split("T")[0]
      const yearMonth = dateKey.substring(0, 7)

      dimensions.forEach(dim => {
        const values = getDimensionValue(order, dim)
        values.forEach(value => {
          if (!monthlyActuals.has(dim)) {
            monthlyActuals.set(dim, new Map())
          }
          const dimMap = monthlyActuals.get(dim)!
          if (!dimMap.has(value)) {
            const record: Record<string, number> = {}
            months.forEach(m => { record[m.key] = 0 })
            dimMap.set(value, record)
          }
          const valueRecord = dimMap.get(value)!
          if (valueRecord[yearMonth] !== undefined) {
            valueRecord[yearMonth] += order.amount
          }
        })
      })
    })

    return { monthlyActuals }
  }, [data, dimensions, months])

  // Calculate yearly column totals
  // Only sum top-level rows (level 0) to avoid double-counting when hierarchies are involved
  const { yearlyColumnTotals, yearlyColumnBudgetTotals } = React.useMemo(() => {
    const totals: Record<string, number> = {}
    const budgetTotals: Record<string, number> = {}

    months.forEach(m => {
      totals[m.key] = 0
      budgetTotals[m.key] = 0
    })

    // Sum from top-level rows only (they contain children sums when collapsed)
    rowsData.forEach(row => {
      if (row.level === 0) {
        months.forEach(m => {
          totals[m.key] += row.monthlyActuals[m.key] || 0
          budgetTotals[m.key] += row.monthlyBudgets[m.key] || 0
        })
      }
    })

    return { yearlyColumnTotals: totals, yearlyColumnBudgetTotals: budgetTotals }
  }, [rowsData, months])

  // Calculate yearly grand totals
  const yearlyGrandTotal = Object.values(yearlyColumnTotals).reduce((sum, val) => sum + val, 0)
  const yearlyGrandBudgetTotal = Object.values(yearlyColumnBudgetTotals).reduce((sum, val) => sum + val, 0)

  // Only sum column totals within the selected period
  const grandTotal = Object.entries(columnTotals).reduce((sum, [dateKey, val]) => {
    return isInPeriod(dateKey) ? sum + val : sum
  }, 0)

  const grandBudgetTotal = Object.entries(columnBudgetTotals).reduce((sum, [dateKey, val]) => {
    return isInPeriod(dateKey) ? sum + val : sum
  }, 0)

  // Sum of monthly budgets (for budget mode total display) - sum top-level rows only
  const grandMonthlyBudgetTotal = React.useMemo(() => {
    return rowsData
      .filter(row => row.level === 0)
      .reduce((sum, row) => sum + row.monthlyBudget, 0)
  }, [rowsData])

  // Get display value based on view mode
  const getDisplayValue = (actual: number, budget: number): number => {
    switch (viewMode) {
      case "actual": return actual
      case "budget": return budget
      case "variance": return actual - budget
    }
  }

  // Get cell style based on view mode and value
  const getVarianceStyle = (actual: number, budget: number): string => {
    if (viewMode !== "variance") return ""
    const variance = actual - budget
    if (variance > 0) return "text-red-600 dark:text-red-400"   // Over budget
    if (variance < 0) return "text-green-600 dark:text-green-400" // Under budget
    return ""
  }

  const toggleRow = (key: string) => {
    setExpandedRows(prev => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }

  const addDimension = (dimension: DimensionType) => {
    if (!dimensions.includes(dimension)) {
      setDimensions([...dimensions, dimension])
    }
  }

  const removeDimension = (index: number) => {
    if (dimensions.length > 1) {
      setDimensions(dimensions.filter((_, i) => i !== index))
      setExpandedRows(new Set())
    }
  }

  // Scroll to today
  const scrollToToday = React.useCallback(() => {
    if (todayRef.current && scrollContainerRef.current) {
      const container = scrollContainerRef.current
      const todayCell = todayRef.current
      const containerRect = container.getBoundingClientRect()
      const cellRect = todayCell.getBoundingClientRect()

      const scrollLeft = container.scrollLeft + (cellRect.left - containerRect.left) - (containerRect.width / 2) + (cellRect.width / 2)
      container.scrollTo({ left: scrollLeft, behavior: "smooth" })
    }
  }, [])

  // Scroll to today on mount and when centerDate changes
  React.useEffect(() => {
    const timer = setTimeout(scrollToToday, 100)
    return () => clearTimeout(timer)
  }, [scrollToToday, centerDate])

  const availableDimensions = DIMENSION_OPTIONS.filter(d => !dimensions.includes(d.id))
  const todayKey = formatDateKey(new Date())

  return (
    <div className={cn("space-y-4", className)}>
      {/* Controls Row */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Dimension Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">集計軸:</span>
        {dimensions.map((dim, index) => {
          const config = DIMENSION_OPTIONS.find(d => d.id === dim)
          return (
            <Badge key={dim} variant="secondary" className="pr-1">
              {index > 0 && <span className="text-muted-foreground">›</span>}
              {config?.label}
              {dimensions.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-4 hover:bg-destructive/20"
                  onClick={() => removeDimension(index)}
                >
                  <X className="size-3" />
                </Button>
              )}
            </Badge>
          )
        })}

        {availableDimensions.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-6 px-2 gap-1">
                <Plus className="size-3" />
                追加
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {availableDimensions.map(dim => (
                <DropdownMenuItem key={dim.id} onClick={() => addDimension(dim.id)}>
                  {dim.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Collapse All Button */}
        {expandedRows.size > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 gap-1 text-muted-foreground"
            onClick={() => setExpandedRows(new Set())}
          >
            <ChevronsDownUp className="size-3" />
            折りたたむ
          </Button>
        )}
        </div>

        <div className="flex flex-col items-end gap-2">
          {/* Time Granularity Toggle - prominent style */}
          <div className="flex rounded-lg border-2 border-primary/30 overflow-hidden">
              <button
                onClick={() => setTimeGranularity("daily")}
                className={cn(
                  "px-4 py-1.5 text-sm font-medium transition-colors",
                  timeGranularity === "daily"
                    ? "bg-primary text-primary-foreground"
                    : "bg-background hover:bg-muted text-muted-foreground"
                )}
              >
                日別
              </button>
              <button
                onClick={() => setTimeGranularity("yearly")}
                className={cn(
                  "px-4 py-1.5 text-sm font-medium transition-colors border-l border-primary/30",
                  timeGranularity === "yearly"
                    ? "bg-primary text-primary-foreground"
                    : "bg-background hover:bg-muted text-muted-foreground"
                )}
              >
                年間
              </button>
          </div>

          {/* View Mode Tabs */}
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
            <TabsList className="h-8">
              <TabsTrigger value="actual" className="text-xs px-3 h-6">実績</TabsTrigger>
              <TabsTrigger value="budget" className="text-xs px-3 h-6">予算</TabsTrigger>
              <TabsTrigger value="variance" className="text-xs px-3 h-6">乖離</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Selection Input Bar (Excel-like) - Fixed floating */}
      {viewMode === "budget" && timeGranularity === "yearly" && selectionStart && (
        <div
          data-selection-bar
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-3 bg-card border border-border rounded-xl shadow-lg"
        >
          <Badge variant="secondary" className="shrink-0">
            {(() => {
              const info = getSelectionInfo()
              if (!info) return "1セル"
              return `${info.rows}行 × ${info.cols}列`
            })()}
          </Badge>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">¥</span>
            <Input
              type="number"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  saveToSelectedCells()
                } else if (e.key === "Escape") {
                  setSelectionStart(null)
                  setSelectionEnd(null)
                }
              }}
              placeholder="予算額"
              className="h-8 w-32"
              autoFocus
            />
            <Button
              size="sm"
              onClick={saveToSelectedCells}
              disabled={isSaving || !editValue}
            >
              適用
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={() => {
                setSelectionStart(null)
                setSelectionEnd(null)
              }}
            >
              <X className="size-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Table with sticky columns */}
      <div className="rounded-lg border border-border overflow-hidden">
        <div
          ref={scrollContainerRef}
          className="overflow-x-auto"
          style={{ scrollBehavior: "smooth" }}
        >
          <table ref={tableRef} className="w-max border-collapse">
            <thead className="sticky top-0 z-20">
              <tr>
                {/* Sticky left header - solid background with fixed border line */}
                <th className="sticky left-0 z-30 bg-card px-4 py-3 text-left text-sm font-semibold min-w-[200px] after:content-[''] after:absolute after:right-0 after:top-0 after:bottom-0 after:w-[2px] after:bg-foreground/20 after:shadow-[2px_0_4px_-2px_rgba(0,0,0,0.15)]">
                  {dimensions.map((dim, i) => {
                    const config = DIMENSION_OPTIONS.find(d => d.id === dim)
                    return (
                      <span key={dim}>
                        {i > 0 && <span className="text-muted-foreground"> / </span>}
                        {config?.label}
                      </span>
                    )
                  })}
                </th>

                {/* Date headers (daily view) */}
                {timeGranularity === "daily" && dates.map(date => {
                  const dateKey = formatDateKey(date)
                  const isToday = dateKey === todayKey
                  const isWeekend = date.getDay() === 0 || date.getDay() === 6
                  const isHoliday = isJapaneseHoliday(date)
                  const isNonBusinessDay = isWeekend || isHoliday
                  const isFirstOfMonth = date.getDate() === 1
                  const days = ["日", "月", "火", "水", "木", "金", "土"]

                  return (
                    <th
                      key={dateKey}
                      ref={isToday ? todayRef : undefined}
                      className={cn(
                        "px-2 py-2 text-center text-xs font-medium min-w-[60px] border-r border-border bg-card",
                        isToday && "bg-primary text-primary-foreground font-bold",
                        isNonBusinessDay && !isToday && "bg-muted",
                        isHoliday && !isWeekend && !isToday && "bg-red-100 dark:bg-red-900/30",
                        isFirstOfMonth && "border-l-2 border-l-primary"
                      )}
                    >
                      <div className="flex flex-col">
                        {isFirstOfMonth && (
                          <span className={cn(
                            "text-[10px] font-semibold",
                            isToday ? "text-primary-foreground" : "text-primary"
                          )}>
                            {date.getMonth() + 1}月
                          </span>
                        )}
                        <span className={cn(
                          isHoliday && !isWeekend && !isToday && "text-red-600 dark:text-red-400"
                        )}>{date.getDate()}</span>
                        <span className={cn(
                          "text-[10px]",
                          isToday ? "text-primary-foreground" : (
                            isHoliday && !isWeekend ? "text-red-500" :
                            date.getDay() === 0 ? "text-red-500" :
                            date.getDay() === 6 ? "text-blue-500" : ""
                          )
                        )}>
                          {isHoliday && !isWeekend ? "祝" : days[date.getDay()]}
                        </span>
                      </div>
                    </th>
                  )
                })}

                {/* Month headers (yearly view) */}
                {timeGranularity === "yearly" && months.map((m, monthIndex) => {
                  const monthNames = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"]
                  const currentMonth = new Date().getMonth()
                  const currentYear = new Date().getFullYear()
                  const isCurrentMonth = m.month === currentMonth && m.year === currentYear
                  const canSelectColumn = viewMode === "budget" && onBudgetChange

                  return (
                    <th
                      key={m.key}
                      className={cn(
                        "px-3 py-2 text-center text-xs font-medium min-w-[80px] border-r border-border bg-card",
                        isCurrentMonth && "bg-primary text-primary-foreground font-bold",
                        canSelectColumn && "cursor-pointer hover:bg-accent"
                      )}
                      onDoubleClick={canSelectColumn ? () => handleColumnDoubleClick(monthIndex) : undefined}
                    >
                      {monthNames[m.month]}
                    </th>
                  )
                })}

                {/* Sticky right header - solid background with fixed border line */}
                <th className="sticky right-0 z-30 bg-card px-4 py-3 text-center text-sm font-semibold min-w-[130px] before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[2px] before:bg-foreground/20 before:shadow-[-2px_0_4px_-2px_rgba(0,0,0,0.15)]">
                  {timeGranularity === "yearly"
                    ? "年間合計"
                    : viewMode === "budget"
                      ? "月額予算"
                      : periodLabel
                        ? `${periodLabel}計`
                        : "期間合計"}
                </th>
              </tr>
            </thead>

            <tbody>
              {rowsData.map((row, rowIndex) => {
                const rowBg = rowIndex % 2 === 0 ? "bg-card" : "bg-muted/50"
                // Solid background for sticky columns (no transparency)
                const stickyRowBg = rowIndex % 2 === 0 ? "bg-card" : "bg-muted"
                return (
                  <tr
                    key={row.key}
                    className={cn("border-t border-border", rowBg)}
                  >
                    {/* Sticky left cell - solid background with fixed border line */}
                    {(() => {
                      const canSelectRow = viewMode === "budget" && timeGranularity === "yearly" && row.isLeaf && onBudgetChange
                      return (
                        <td
                          className={cn(
                            "sticky left-0 z-10 px-4 py-2.5 text-sm after:content-[''] after:absolute after:right-0 after:top-0 after:bottom-0 after:w-[2px] after:bg-foreground/20 after:shadow-[2px_0_4px_-2px_rgba(0,0,0,0.15)]",
                            stickyRowBg,
                            canSelectRow && "cursor-pointer"
                          )}
                          onDoubleClick={canSelectRow ? () => handleRowDoubleClick(row.key) : undefined}
                        >
                          <div
                            className="flex items-center gap-2"
                            style={{ paddingLeft: `${row.level * 16}px` }}
                          >
                            {row.hasChildren ? (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-5"
                                onClick={() => toggleRow(row.key)}
                              >
                                {row.isExpanded ? (
                                  <ChevronDown className="size-4" />
                                ) : (
                                  <ChevronRight className="size-4" />
                                )}
                              </Button>
                            ) : (
                              <span className="size-5" />
                            )}
                            <span className={cn(
                              "font-medium truncate max-w-[140px]",
                              row.level > 0 && "text-muted-foreground text-sm"
                            )}>
                              {row.labels[row.labels.length - 1]}
                            </span>
                          </div>
                        </td>
                      )
                    })()}

                    {/* Date cells (daily view) */}
                    {timeGranularity === "daily" && dates.map(date => {
                      const dateKey = formatDateKey(date)
                      const actual = row.amounts[dateKey] || 0
                      const budget = row.budgetAmounts[dateKey] || 0
                      const displayValue = getDisplayValue(actual, budget)
                      const isToday = dateKey === todayKey
                      const isWeekend = date.getDay() === 0 || date.getDay() === 6
                      const isHoliday = isJapaneseHoliday(date)
                      const isNonBusinessDay = isWeekend || isHoliday
                      const isFirstOfMonth = date.getDate() === 1

                      return (
                        <td
                          key={dateKey}
                          className={cn(
                            "px-2 py-2.5 text-right text-xs tabular-nums border-r border-border",
                            rowBg,
                            isNonBusinessDay && "bg-muted/70",
                            isHoliday && !isWeekend && "bg-red-50/70 dark:bg-red-900/20",
                            isToday && "bg-primary/20",
                            isFirstOfMonth && "border-l-2 border-l-primary/50",
                            displayValue !== 0 ? "text-foreground" : "text-muted-foreground/40",
                            getVarianceStyle(actual, budget)
                          )}
                        >
                          {displayValue !== 0
                            ? `${viewMode === "variance" && displayValue > 0 ? "+" : ""}¥${displayValue.toLocaleString()}`
                            : "-"}
                        </td>
                      )
                    })}

                    {/* Month cells (yearly view) */}
                    {timeGranularity === "yearly" && months.map((m, monthIndex) => {
                      // Use row.monthlyActuals and row.monthlyBudgets which already contain correct values
                      // (children sum for parents, own values for leaves)
                      const actual = row.monthlyActuals[m.key] || 0
                      const budget = row.monthlyBudgets[m.key] || 0
                      const displayValue = getDisplayValue(actual, budget)
                      const currentMonth = new Date().getMonth()
                      const currentYear = new Date().getFullYear()
                      const isCurrentMonth = m.month === currentMonth && m.year === currentYear

                      // Get leaf row index for selection
                      const leafRowIndex = leafRows.findIndex(r => r.key === row.key)
                      const canSelect = viewMode === "budget" && row.isLeaf && onBudgetChange && leafRowIndex !== -1
                      const isSelected = canSelect && isCellSelected(leafRowIndex, monthIndex)
                      const isActive = canSelect && isActiveCell(leafRowIndex, monthIndex)

                      return (
                        <td
                          key={m.key}
                          className={cn(
                            "px-3 py-2.5 text-right text-xs tabular-nums border-r border-border transition-colors",
                            rowBg,
                            isCurrentMonth && !isSelected && "bg-primary/10",
                            canSelect && "cursor-cell select-none",
                            isSelected && "bg-primary/30",
                            isActive && "ring-2 ring-primary ring-inset",
                            !isSelected && displayValue !== 0 ? "text-foreground" : "text-muted-foreground/40",
                            getVarianceStyle(actual, budget)
                          )}
                          onMouseDown={canSelect ? (e) => handleCellMouseDown(leafRowIndex, monthIndex, e) : undefined}
                          onMouseEnter={canSelect ? () => handleCellMouseEnter(leafRowIndex, monthIndex) : undefined}
                        >
                          {viewMode === "budget"
                            ? (budget > 0 ? `¥${budget.toLocaleString()}` : "-")
                            : (displayValue !== 0
                              ? `${viewMode === "variance" && displayValue > 0 ? "+" : ""}¥${displayValue.toLocaleString()}`
                              : "-")}
                        </td>
                      )
                    })}

                    {/* Sticky right cell - editable in budget mode (leaf only) */}
                    {(() => {
                      const cellKey = `budget-${row.key}`
                      const isEditing = editingCell === cellKey

                      // Calculate yearly totals for this row (using pre-computed values)
                      const yearlyActual = Object.values(row.monthlyActuals).reduce((sum, val) => sum + val, 0)
                      const yearlyBudget = Object.values(row.monthlyBudgets).reduce((sum, val) => sum + val, 0)

                      const displayTotal = timeGranularity === "yearly"
                        ? getDisplayValue(yearlyActual, yearlyBudget)
                        : getDisplayValue(row.total, row.budgetTotal)

                      // In budget mode, show monthly budget (only for daily view)
                      if (viewMode === "budget" && onBudgetChange && timeGranularity === "daily") {
                        // Leaf rows are editable
                        if (row.isLeaf) {
                          return (
                            <td className={cn(
                              "sticky right-0 z-10 px-2 py-1.5 text-right text-sm font-semibold tabular-nums before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[2px] before:bg-foreground/20 before:shadow-[-2px_0_4px_-2px_rgba(0,0,0,0.15)]",
                              stickyRowBg
                            )}>
                              {isEditing ? (
                                <div className="flex items-center gap-1">
                                  <span className="text-muted-foreground">¥</span>
                                  <Input
                                    type="number"
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        saveBudget(row.dimensionType, row.dimensionValue)
                                      } else if (e.key === "Escape") {
                                        setEditingCell(null)
                                      }
                                    }}
                                    className="h-7 w-24 text-right text-sm"
                                    autoFocus
                                    disabled={isSaving}
                                  />
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-6"
                                    onClick={() => saveBudget(row.dimensionType, row.dimensionValue)}
                                    disabled={isSaving}
                                  >
                                    <Check className="size-3" />
                                  </Button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => startEditing(cellKey, row.monthlyBudget)}
                                  className="flex items-center justify-end gap-1 w-full hover:bg-accent rounded px-2 py-1 -mx-2 -my-1 group"
                                >
                                  <span>{row.monthlyBudget > 0 ? `¥${row.monthlyBudget.toLocaleString()}` : "-"}</span>
                                  <Pencil className="size-3 opacity-0 group-hover:opacity-50" />
                                </button>
                              )}
                            </td>
                          )
                        }

                        // Parent rows show sum of children (read-only, with Σ indicator)
                        return (
                          <td className={cn(
                            "sticky right-0 z-10 px-4 py-2.5 text-right text-sm font-semibold tabular-nums before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[2px] before:bg-foreground/20 before:shadow-[-2px_0_4px_-2px_rgba(0,0,0,0.15)]",
                            stickyRowBg,
                            "text-muted-foreground"
                          )}>
                            <span className="text-xs mr-1">Σ</span>
                            {row.monthlyBudget > 0 ? `¥${row.monthlyBudget.toLocaleString()}` : "-"}
                          </td>
                        )
                      }

                      // Actual or variance mode - read-only
                      return (
                        <td className={cn(
                          "sticky right-0 z-10 px-4 py-2.5 text-right text-sm font-semibold tabular-nums before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[2px] before:bg-foreground/20 before:shadow-[-2px_0_4px_-2px_rgba(0,0,0,0.15)]",
                          stickyRowBg,
                          getVarianceStyle(row.total, row.budgetTotal)
                        )}>
                          {displayTotal !== 0
                            ? `${viewMode === "variance" && displayTotal > 0 ? "+" : ""}¥${displayTotal.toLocaleString()}`
                            : "-"}
                        </td>
                      )
                    })()}
                  </tr>
                )
              })}

              {/* Total Row - sticky bottom */}
              <tr className="border-t-2 border-border font-semibold sticky bottom-0 z-10">
                <td className="sticky left-0 z-20 bg-card px-4 py-3 text-sm after:content-[''] after:absolute after:right-0 after:top-0 after:bottom-0 after:w-[2px] after:bg-foreground/20 after:shadow-[2px_0_4px_-2px_rgba(0,0,0,0.15)]">
                  合計
                </td>

                {/* Date totals (daily view) */}
                {timeGranularity === "daily" && dates.map(date => {
                  const dateKey = formatDateKey(date)
                  const actual = columnTotals[dateKey] || 0
                  const budget = columnBudgetTotals[dateKey] || 0
                  const displayValue = getDisplayValue(actual, budget)
                  const isToday = dateKey === todayKey
                  const isWeekend = date.getDay() === 0 || date.getDay() === 6
                  const isHoliday = isJapaneseHoliday(date)
                  const isNonBusinessDay = isWeekend || isHoliday
                  const isFirstOfMonth = date.getDate() === 1

                  return (
                    <td
                      key={dateKey}
                      className={cn(
                        "px-2 py-3 text-right text-xs tabular-nums border-r border-border bg-card",
                        isNonBusinessDay && "bg-muted/50",
                        isHoliday && !isWeekend && "bg-red-50/50 dark:bg-red-900/20",
                        isToday && "bg-primary/30",
                        isFirstOfMonth && "border-l-2 border-l-primary/50",
                        getVarianceStyle(actual, budget)
                      )}
                    >
                      {displayValue !== 0
                        ? `${viewMode === "variance" && displayValue > 0 ? "+" : ""}¥${displayValue.toLocaleString()}`
                        : "-"}
                    </td>
                  )
                })}

                {/* Month totals (yearly view) */}
                {timeGranularity === "yearly" && months.map(m => {
                  const actual = yearlyColumnTotals[m.key] || 0
                  const budget = yearlyColumnBudgetTotals[m.key] || 0
                  const displayValue = getDisplayValue(actual, budget)
                  const currentMonth = new Date().getMonth()
                  const currentYear = new Date().getFullYear()
                  const isCurrentMonth = m.month === currentMonth && m.year === currentYear

                  return (
                    <td
                      key={m.key}
                      className={cn(
                        "px-3 py-3 text-right text-xs tabular-nums border-r border-border bg-card",
                        isCurrentMonth && "bg-primary/30",
                        getVarianceStyle(actual, budget)
                      )}
                    >
                      {displayValue !== 0
                        ? `${viewMode === "variance" && displayValue > 0 ? "+" : ""}¥${displayValue.toLocaleString()}`
                        : "-"}
                    </td>
                  )
                })}

                {/* Grand total cell */}
                {(() => {
                  // For yearly view, use yearly totals
                  // For daily view in budget mode, show sum of monthly budgets; otherwise use daily totals
                  const displayGrandTotal = timeGranularity === "yearly"
                    ? getDisplayValue(yearlyGrandTotal, yearlyGrandBudgetTotal)
                    : viewMode === "budget"
                      ? grandMonthlyBudgetTotal
                      : getDisplayValue(grandTotal, grandBudgetTotal)
                  return (
                    <td className={cn(
                      "sticky right-0 z-20 px-4 py-3 text-right text-sm font-bold tabular-nums before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[2px] before:bg-foreground/20 before:shadow-[-2px_0_4px_-2px_rgba(0,0,0,0.15)]",
                      viewMode === "variance"
                        ? displayGrandTotal > 0
                          ? "bg-red-600 text-white"
                          : displayGrandTotal < 0
                            ? "bg-green-600 text-white"
                            : "bg-primary text-primary-foreground"
                        : "bg-primary text-primary-foreground"
                    )}>
                      {viewMode === "variance" && displayGrandTotal > 0 ? "+" : ""}¥{displayGrandTotal.toLocaleString()}
                    </td>
                  )
                })()}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="size-3 rounded bg-primary" />
          <span>今日</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="size-3 rounded bg-muted border border-border" />
          <span>週末</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="size-3 rounded bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800" />
          <span>祝日</span>
        </div>
        <span>• 予算は営業日のみで日割り計算</span>
      </div>
    </div>
  )
}
