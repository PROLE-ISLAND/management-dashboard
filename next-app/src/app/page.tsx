"use client"

import { useEffect, useState, useMemo } from "react"
import { supabase } from "@/lib/supabase"
import { NotionOrder, FlattenedOrder, flattenOrder, Budget } from "@/types/database"
import { KPICard } from "@/components/ui/kpi-card"
import { AccountingTable, OrderData, BudgetChangeParams } from "@/components/accounting-table"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Banknote,
  Users,
  Clock,
  TrendingUp,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Calendar,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { AppShell } from "@/components/app-shell"

// Get month range
function getMonthRange(date: Date): { start: Date; end: Date } {
  const start = new Date(date.getFullYear(), date.getMonth(), 1)
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0)
  return { start, end }
}

// Format date for comparison
function formatDateKey(date: Date): string {
  return date.toISOString().split("T")[0]
}

// Check if date is in range
function isInRange(dateStr: string, start: Date, end: Date): boolean {
  const date = new Date(dateStr)
  return date >= start && date <= end
}

export default function Dashboard() {
  const [orders, setOrders] = useState<FlattenedOrder[]>([])
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState(new Date())

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      // Fetch orders and budgets in parallel
      const [ordersResult, budgetsResult] = await Promise.all([
        supabase
          .from("notion_orders")
          .select("*")
          .order("notion_created_at", { ascending: false }),
        supabase
          .from("budgets")
          .select("*")
      ])

      if (ordersResult.error) throw ordersResult.error

      const flattened = (ordersResult.data as NotionOrder[]).map(flattenOrder)
      setOrders(flattened)

      // Budgets table may not exist yet, so handle gracefully
      if (budgetsResult.data) {
        setBudgets(budgetsResult.data as Budget[])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "データの取得に失敗しました")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Get current month range
  const { start: monthStart, end: monthEnd } = useMemo(
    () => getMonthRange(selectedDate),
    [selectedDate]
  )

  // Filter orders with valid due dates
  const ordersWithDueDate = useMemo(() => {
    return orders.filter(order => {
      // Check if dueDate is a valid date string
      if (!order.dueDate || order.dueDate === "-") return false
      const date = new Date(order.dueDate)
      return !isNaN(date.getTime())
    })
  }, [orders])

  // Filter orders for selected month (for KPIs)
  const monthlyOrders = useMemo(() => {
    return ordersWithDueDate.filter(order => isInRange(order.dueDate, monthStart, monthEnd))
  }, [ordersWithDueDate, monthStart, monthEnd])

  // Transform all orders to accounting table data
  const orderData: OrderData[] = useMemo(() => {
    return ordersWithDueDate.map(order => ({
      id: order.id,
      date: order.dueDate,
      amount: order.totalPayment,
      jobScope: order.jobScope,
      jobLevel: order.jobLevel,
      orderCategories: order.orderCategories,
    }))
  }, [ordersWithDueDate])

  // Calculate KPIs for selected month
  const totalOrders = monthlyOrders.length
  const totalPayment = monthlyOrders.reduce((sum, o) => sum + o.totalPayment, 0)
  const totalHours = monthlyOrders.reduce((sum, o) => sum + o.hours, 0)
  const avgHourlyRate =
    monthlyOrders.length > 0
      ? Math.round(
          monthlyOrders.reduce((sum, o) => sum + o.hourlyRate, 0) / monthlyOrders.length
        )
      : 0

  // Navigation
  const goToPrevMonth = () => {
    setSelectedDate(prev => {
      const newDate = new Date(prev)
      newDate.setMonth(newDate.getMonth() - 1)
      return newDate
    })
  }

  const goToNextMonth = () => {
    setSelectedDate(prev => {
      const newDate = new Date(prev)
      newDate.setMonth(newDate.getMonth() + 1)
      return newDate
    })
  }

  const goToToday = () => {
    setSelectedDate(new Date())
  }

  // Handle budget change (upsert using select + insert/update)
  const handleBudgetChange = async (params: BudgetChangeParams) => {
    const { yearMonth, dimensionType, dimensionValue, amount } = params

    try {
      // Use type assertion for untyped budgets table
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const budgetsTable = supabase.from("budgets") as any

      // Check if budget exists
      const { data: existing, error: selectError } = await budgetsTable
        .select("id")
        .eq("year_month", yearMonth)
        .eq("dimension_type", dimensionType)
        .eq("dimension_value", dimensionValue)
        .maybeSingle()

      if (selectError) {
        console.error("Select error:", selectError)
        throw new Error(`テーブル確認エラー: ${selectError.message}`)
      }

      if (existing) {
        // Update existing
        const { error: updateError } = await budgetsTable
          .update({ amount })
          .eq("id", existing.id)

        if (updateError) {
          console.error("Update error:", updateError)
          throw new Error(`更新エラー: ${updateError.message}`)
        }
      } else {
        // Insert new
        const { error: insertError } = await budgetsTable
          .insert({
            year_month: yearMonth,
            dimension_type: dimensionType,
            dimension_value: dimensionValue,
            amount,
          })

        if (insertError) {
          console.error("Insert error:", insertError)
          throw new Error(`挿入エラー: ${insertError.message}`)
        }
      }

      // Refresh budgets
      const { data: newBudgets } = await supabase.from("budgets").select("*")
      if (newBudgets) {
        setBudgets(newBudgets as Budget[])
      }
    } catch (err) {
      console.error("Budget change failed:", err)
      throw err
    }
  }

  // Format month label
  const monthLabel = `${selectedDate.getFullYear()}年${selectedDate.getMonth() + 1}月`
  const isCurrentMonth =
    selectedDate.getFullYear() === new Date().getFullYear() &&
    selectedDate.getMonth() === new Date().getMonth()

  if (loading) {
    return (
      <AppShell title="経営ダッシュボード" subtitle="発注管理・会計データの可視化">
        <div className="flex h-full items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Spinner size="lg" />
            <p className="text-muted-foreground">データを読み込み中...</p>
          </div>
        </div>
      </AppShell>
    )
  }

  if (error) {
    return (
      <AppShell title="経営ダッシュボード" subtitle="発注管理・会計データの可視化">
        <div className="flex h-full items-center justify-center">
          <Card className="w-[400px]">
            <CardHeader>
              <CardTitle className="text-destructive">エラー</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={fetchData}>再試行</Button>
            </CardContent>
          </Card>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell title="経営ダッシュボード" subtitle="発注管理・会計データの可視化">
      <div className="p-6 space-y-6">
        {/* Period Selector - Dashboard Level */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Month Navigation */}
            <div className="flex items-center gap-2 bg-card border border-border rounded-lg p-1">
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={goToPrevMonth}
              >
                <ChevronLeft className="size-4" />
              </Button>
              <div className="px-4 py-1 min-w-[140px] text-center">
                <span className="text-lg font-bold">{monthLabel}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={goToNextMonth}
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>

            {/* Today Button */}
            {!isCurrentMonth && (
              <Button
                variant="outline"
                size="sm"
                onClick={goToToday}
                className="gap-2"
              >
                <Calendar className="size-4" />
                今月へ
              </Button>
            )}
          </div>

          {/* Refresh */}
          <div className="flex items-center gap-4">
            <p className="text-sm text-muted-foreground">
              最終更新: {new Date().toLocaleString("ja-JP")}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchData}
              className="gap-2"
            >
              <RefreshCw className="size-4" />
              更新
            </Button>
          </div>
        </div>

        {/* KPI Cards - Filtered by Selected Month */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-sm font-medium text-muted-foreground">
              {monthLabel}のサマリー
            </h2>
            {isCurrentMonth && (
              <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                今月
              </span>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard
              title="発注数"
              value={totalOrders}
              suffix="件"
              icon={<Users className="size-4" />}
            />
            <KPICard
              title="支給額"
              value={totalPayment}
              prefix="¥"
              icon={<Banknote className="size-4" />}
            />
            <KPICard
              title="稼働時間"
              value={totalHours}
              suffix="h"
              icon={<Clock className="size-4" />}
            />
            <KPICard
              title="平均時給"
              value={avgHourlyRate}
              prefix="¥"
              icon={<TrendingUp className="size-4" />}
            />
          </div>
        </section>

        {/* Main Accounting Table */}
        <section>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">科目別支出表（納期ベース）</CardTitle>
              <CardDescription>
                納期日別の支出を科目ごとに表示 • 集計軸の追加でドリルダウン可能
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AccountingTable
                data={orderData}
                budgets={budgets}
                centerDate={selectedDate}
                periodStart={monthStart}
                periodEnd={monthEnd}
                periodLabel={monthLabel}
                onBudgetChange={handleBudgetChange}
              />
            </CardContent>
          </Card>
        </section>
      </div>
    </AppShell>
  )
}
