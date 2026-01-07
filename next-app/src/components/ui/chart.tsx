"use client"

import * as React from "react"
import {
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line,
  BarChart as RechartsBarChart,
  Bar,
  AreaChart as RechartsAreaChart,
  Area,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts"

import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./card"

// Chart color palette - matches design tokens
export const chartColors = {
  primary: "hsl(270, 80%, 60%)",      // Purple
  secondary: "hsl(250, 70%, 55%)",    // Blue-purple
  success: "hsl(160, 60%, 50%)",      // Green
  warning: "hsl(45, 90%, 55%)",       // Yellow
  danger: "hsl(0, 70%, 55%)",         // Red
  info: "hsl(200, 70%, 55%)",         // Cyan
  muted: "hsl(0, 0%, 45%)",           // Gray
}

export const chartColorArray = [
  chartColors.primary,
  chartColors.secondary,
  chartColors.success,
  chartColors.warning,
  chartColors.info,
  chartColors.danger,
]

// Grid and axis styles
const gridStyle = {
  stroke: "hsl(0, 0%, 20%)",
  strokeDasharray: "3 3",
}

const axisStyle = {
  stroke: "hsl(0, 0%, 30%)",
  fontSize: 12,
  fontFamily: "var(--font-sans)",
  fill: "hsl(0, 0%, 65%)",
}

// Custom Tooltip Component
interface TooltipPayloadEntry {
  value: number
  name: string
  color?: string
}

interface CustomTooltipProps {
  active?: boolean
  payload?: TooltipPayloadEntry[]
  label?: string
  valueFormatter?: (value: number) => string
}

function CustomTooltip({
  active,
  payload,
  label,
  valueFormatter = (v) => v.toLocaleString("ja-JP")
}: CustomTooltipProps) {
  if (!active || !payload?.length) return null

  return (
    <div className="rounded-lg border border-white/10 bg-card/95 backdrop-blur-sm px-3 py-2 shadow-xl">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <div className="space-y-1">
        {payload.map((entry: TooltipPayloadEntry, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="size-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-xs text-muted-foreground">{entry.name}:</span>
            <span className="text-sm font-medium">
              {valueFormatter(entry.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// Chart Container
interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  description?: string
  height?: number
}

function ChartContainer({
  title,
  description,
  height = 300,
  className,
  children,
  ...props
}: ChartContainerProps) {
  return (
    <Card className={cn("", className)} {...props}>
      {(title || description) && (
        <CardHeader className="pb-2">
          {title && <CardTitle className="text-base">{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent className="pb-4">
        <div style={{ height }}>
          <ResponsiveContainer width="100%" height="100%">
            {children as React.ReactElement}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

// Line Chart
interface LineChartProps {
  data: Record<string, unknown>[]
  xKey: string
  yKeys: { key: string; name: string; color?: string }[]
  title?: string
  description?: string
  height?: number
  showGrid?: boolean
  showLegend?: boolean
  curved?: boolean
  valueFormatter?: (value: number) => string
  className?: string
}

function LineChart({
  data,
  xKey,
  yKeys,
  title,
  description,
  height = 300,
  showGrid = true,
  showLegend = true,
  curved = true,
  valueFormatter,
  className,
}: LineChartProps) {
  return (
    <ChartContainer title={title} description={description} height={height} className={className}>
      <RechartsLineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        {showGrid && <CartesianGrid {...gridStyle} vertical={false} />}
        <XAxis dataKey={xKey} {...axisStyle} tickLine={false} axisLine={false} />
        <YAxis {...axisStyle} tickLine={false} axisLine={false} />
        <Tooltip content={<CustomTooltip valueFormatter={valueFormatter} />} />
        {showLegend && (
          <Legend
            wrapperStyle={{ fontSize: 12, paddingTop: 16 }}
            formatter={(value) => <span className="text-muted-foreground">{value}</span>}
          />
        )}
        {yKeys.map((yKey, index) => (
          <Line
            key={yKey.key}
            type={curved ? "monotone" : "linear"}
            dataKey={yKey.key}
            name={yKey.name}
            stroke={yKey.color || chartColorArray[index % chartColorArray.length]}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
          />
        ))}
      </RechartsLineChart>
    </ChartContainer>
  )
}

// Bar Chart
interface BarChartProps {
  data: Record<string, unknown>[]
  xKey: string
  yKeys: { key: string; name: string; color?: string }[]
  title?: string
  description?: string
  height?: number
  showGrid?: boolean
  showLegend?: boolean
  stacked?: boolean
  horizontal?: boolean
  valueFormatter?: (value: number) => string
  className?: string
}

function BarChart({
  data,
  xKey,
  yKeys,
  title,
  description,
  height = 300,
  showGrid = true,
  showLegend = true,
  stacked = false,
  horizontal = false,
  valueFormatter,
  className,
}: BarChartProps) {
  const layout = horizontal ? "vertical" : "horizontal"

  return (
    <ChartContainer title={title} description={description} height={height} className={className}>
      <RechartsBarChart
        data={data}
        layout={layout}
        margin={{ top: 5, right: 20, left: horizontal ? 60 : 0, bottom: 5 }}
      >
        {showGrid && <CartesianGrid {...gridStyle} vertical={!horizontal} horizontal={horizontal} />}
        {horizontal ? (
          <>
            <XAxis type="number" {...axisStyle} tickLine={false} axisLine={false} />
            <YAxis dataKey={xKey} type="category" {...axisStyle} tickLine={false} axisLine={false} />
          </>
        ) : (
          <>
            <XAxis dataKey={xKey} {...axisStyle} tickLine={false} axisLine={false} />
            <YAxis {...axisStyle} tickLine={false} axisLine={false} />
          </>
        )}
        <Tooltip content={<CustomTooltip valueFormatter={valueFormatter} />} />
        {showLegend && (
          <Legend
            wrapperStyle={{ fontSize: 12, paddingTop: 16 }}
            formatter={(value) => <span className="text-muted-foreground">{value}</span>}
          />
        )}
        {yKeys.map((yKey, index) => (
          <Bar
            key={yKey.key}
            dataKey={yKey.key}
            name={yKey.name}
            fill={yKey.color || chartColorArray[index % chartColorArray.length]}
            fillOpacity={0.6}
            stroke="rgba(255,255,255,0.2)"
            strokeWidth={1}
            stackId={stacked ? "stack" : undefined}
            radius={0}
          />
        ))}
      </RechartsBarChart>
    </ChartContainer>
  )
}

// Area Chart
interface AreaChartProps {
  data: Record<string, unknown>[]
  xKey: string
  yKeys: { key: string; name: string; color?: string }[]
  title?: string
  description?: string
  height?: number
  showGrid?: boolean
  showLegend?: boolean
  stacked?: boolean
  gradient?: boolean
  valueFormatter?: (value: number) => string
  className?: string
}

function AreaChart({
  data,
  xKey,
  yKeys,
  title,
  description,
  height = 300,
  showGrid = true,
  showLegend = true,
  stacked = false,
  gradient = true,
  valueFormatter,
  className,
}: AreaChartProps) {
  return (
    <ChartContainer title={title} description={description} height={height} className={className}>
      <RechartsAreaChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <defs>
          {yKeys.map((yKey, index) => {
            const color = yKey.color || chartColorArray[index % chartColorArray.length]
            return (
              <linearGradient key={yKey.key} id={`gradient-${yKey.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            )
          })}
        </defs>
        {showGrid && <CartesianGrid {...gridStyle} vertical={false} />}
        <XAxis dataKey={xKey} {...axisStyle} tickLine={false} axisLine={false} />
        <YAxis {...axisStyle} tickLine={false} axisLine={false} />
        <Tooltip content={<CustomTooltip valueFormatter={valueFormatter} />} />
        {showLegend && (
          <Legend
            wrapperStyle={{ fontSize: 12, paddingTop: 16 }}
            formatter={(value) => <span className="text-muted-foreground">{value}</span>}
          />
        )}
        {yKeys.map((yKey, index) => {
          const color = yKey.color || chartColorArray[index % chartColorArray.length]
          return (
            <Area
              key={yKey.key}
              type="monotone"
              dataKey={yKey.key}
              name={yKey.name}
              stroke={color}
              strokeWidth={2}
              fill={gradient ? `url(#gradient-${yKey.key})` : color}
              fillOpacity={gradient ? 1 : 0.2}
              stackId={stacked ? "stack" : undefined}
            />
          )
        })}
      </RechartsAreaChart>
    </ChartContainer>
  )
}

// Donut/Pie Chart
interface DonutChartProps {
  data: { name: string; value: number; color?: string }[]
  title?: string
  description?: string
  height?: number
  showLegend?: boolean
  innerRadius?: number
  outerRadius?: number
  centerLabel?: string
  centerValue?: string
  valueFormatter?: (value: number) => string
  className?: string
}

function DonutChart({
  data,
  title,
  description,
  height = 300,
  showLegend = true,
  innerRadius = 60,
  outerRadius = 100,
  centerLabel,
  centerValue,
  valueFormatter = (v) => v.toLocaleString("ja-JP"),
  className,
}: DonutChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0)

  return (
    <ChartContainer title={title} description={description} height={height} className={className}>
      <RechartsPieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          paddingAngle={2}
          dataKey="value"
          nameKey="name"
          strokeWidth={0}
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.color || chartColorArray[index % chartColorArray.length]}
              fillOpacity={0.6}
              stroke="rgba(255,255,255,0.2)"
              strokeWidth={1}
            />
          ))}
        </Pie>
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null
            const item = payload[0]
            const percentage = ((item.value as number) / total * 100).toFixed(1)
            return (
              <div className="rounded-lg border border-white/10 bg-card/95 backdrop-blur-sm px-3 py-2 shadow-xl">
                <div className="flex items-center gap-2">
                  <div
                    className="size-2 rounded-full"
                    style={{ backgroundColor: item.payload.color || chartColorArray[0] }}
                  />
                  <span className="text-sm">{item.name}</span>
                </div>
                <p className="text-lg font-semibold mt-1">
                  {valueFormatter(item.value as number)} ({percentage}%)
                </p>
              </div>
            )
          }}
        />
        {showLegend && (
          <Legend
            layout="vertical"
            align="right"
            verticalAlign="middle"
            wrapperStyle={{ fontSize: 12 }}
            formatter={(value, entry) => {
              const item = data.find(d => d.name === value)
              const percentage = item ? ((item.value / total) * 100).toFixed(0) : 0
              return (
                <span className="text-muted-foreground">
                  {value} ({percentage}%)
                </span>
              )
            }}
          />
        )}
        {/* Center Label */}
        {(centerLabel || centerValue) && (
          <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
            {centerValue && (
              <tspan x="50%" dy="-0.5em" className="fill-foreground text-xl font-bold">
                {centerValue}
              </tspan>
            )}
            {centerLabel && (
              <tspan x="50%" dy={centerValue ? "1.5em" : "0"} className="fill-muted-foreground text-xs">
                {centerLabel}
              </tspan>
            )}
          </text>
        )}
      </RechartsPieChart>
    </ChartContainer>
  )
}

// Spark Line (mini chart for KPI cards)
interface SparkLineProps {
  data: number[]
  color?: string
  height?: number
  width?: number
  className?: string
}

function SparkLine({
  data,
  color = chartColors.primary,
  height = 40,
  width,
  className,
}: SparkLineProps) {
  const chartData = data.map((value, index) => ({ index, value }))

  return (
    <div className={cn("", className)} style={{ height, width }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsAreaChart data={chartData} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
          <defs>
            <linearGradient id="sparkGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.3} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={1.5}
            fill="url(#sparkGradient)"
          />
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export {
  ChartContainer,
  LineChart,
  BarChart,
  AreaChart,
  DonutChart,
  SparkLine,
  CustomTooltip,
}
