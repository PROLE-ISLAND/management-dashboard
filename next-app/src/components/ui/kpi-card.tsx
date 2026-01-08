import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "./card"

const kpiCardVariants = cva(
  "relative overflow-hidden transition-all duration-300",
  {
    variants: {
      variant: {
        default: "",
        glass: "bg-card/50 backdrop-blur-xl border-white/10",
        gradient: "bg-gradient-to-br from-primary/20 to-accent/10 border-primary/20",
        outline: "bg-transparent border-white/10",
      },
      trend: {
        up: "",
        down: "",
        neutral: "",
      },
    },
    defaultVariants: {
      variant: "default",
      trend: "neutral",
    },
  }
)

const trendColors = {
  up: "text-emerald-400",
  down: "text-red-400",
  neutral: "text-muted-foreground",
}

const trendBgColors = {
  up: "bg-emerald-400/10",
  down: "bg-red-400/10",
  neutral: "bg-muted/50",
}

// Inverted colors for cost metrics (increase = bad, decrease = good)
const invertedTrendColors = {
  up: "text-red-400",
  down: "text-blue-400",
  neutral: "text-muted-foreground",
}

const invertedTrendBgColors = {
  up: "bg-red-400/10",
  down: "bg-blue-400/10",
  neutral: "bg-muted/50",
}

interface KPICardProps
  extends React.ComponentProps<typeof Card>,
    VariantProps<typeof kpiCardVariants> {
  title: string
  value: string | number
  previousValue?: string | number
  change?: number
  changeLabel?: string
  prefix?: string
  suffix?: string
  loading?: boolean
  icon?: React.ReactNode
  sparkline?: number[]
  /** Invert trend colors (up=red, down=blue). Use for cost metrics where increase is negative. */
  invertTrend?: boolean
}

function KPICardSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn("animate-pulse", className)}>
      <CardHeader className="pb-2">
        <div className="h-4 w-24 bg-muted rounded" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="h-8 w-32 bg-muted rounded" />
          <div className="h-4 w-20 bg-muted/50 rounded" />
        </div>
      </CardContent>
    </Card>
  )
}

function KPICard({
  className,
  variant,
  trend: propTrend,
  title,
  value,
  previousValue,
  change,
  changeLabel,
  prefix = "",
  suffix = "",
  loading = false,
  icon,
  sparkline,
  invertTrend = false,
  ...props
}: KPICardProps) {
  if (loading) {
    return <KPICardSkeleton className={className} />
  }

  // Auto-determine trend from change if not explicitly set
  const trend = propTrend ?? (change !== undefined ? (change > 0 ? "up" : change < 0 ? "down" : "neutral") : "neutral")

  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus

  // Select color scheme based on invertTrend
  const colorScheme = invertTrend ? invertedTrendColors : trendColors
  const bgColorScheme = invertTrend ? invertedTrendBgColors : trendBgColors

  const formattedValue = typeof value === "number"
    ? value.toLocaleString("ja-JP")
    : value

  const formattedChange = change !== undefined
    ? `${change > 0 ? "+" : ""}${change.toFixed(1)}%`
    : null

  return (
    <Card
      data-slot="kpi-card"
      className={cn(kpiCardVariants({ variant, trend }), className)}
      {...props}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          {icon && (
            <div className="text-muted-foreground/50">
              {icon}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {/* Main Value */}
          <div className="flex items-baseline gap-1">
            {prefix && (
              <span className="text-lg font-medium text-muted-foreground">
                {prefix}
              </span>
            )}
            <span className="text-3xl font-bold tracking-tight">
              {formattedValue}
            </span>
            {suffix && (
              <span className="text-lg font-medium text-muted-foreground">
                {suffix}
              </span>
            )}
          </div>

          {/* Trend Badge */}
          {(formattedChange || changeLabel) && (
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                  bgColorScheme[trend],
                  colorScheme[trend]
                )}
              >
                <TrendIcon className="size-3" />
                {formattedChange}
              </div>
              {changeLabel && (
                <span className="text-xs text-muted-foreground">
                  {changeLabel}
                </span>
              )}
            </div>
          )}

          {/* Previous Value */}
          {previousValue !== undefined && (
            <p className="text-xs text-muted-foreground">
              前回: {prefix}{typeof previousValue === "number" ? previousValue.toLocaleString("ja-JP") : previousValue}{suffix}
            </p>
          )}

          {/* Mini Sparkline */}
          {sparkline && sparkline.length > 0 && (
            <div className="pt-2">
              <MiniSparkline data={sparkline} trend={trend} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function MiniSparkline({
  data,
  trend
}: {
  data: number[]
  trend: "up" | "down" | "neutral"
}) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1

  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * 100
      const y = 100 - ((v - min) / range) * 100
      return `${x},${y}`
    })
    .join(" ")

  const strokeColor = trend === "up"
    ? "stroke-emerald-400"
    : trend === "down"
    ? "stroke-red-400"
    : "stroke-muted-foreground"

  return (
    <svg
      viewBox="0 0 100 40"
      className="h-8 w-full"
      preserveAspectRatio="none"
    >
      <polyline
        points={points}
        fill="none"
        className={cn("transition-colors", strokeColor)}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export { KPICard, KPICardSkeleton, kpiCardVariants }
