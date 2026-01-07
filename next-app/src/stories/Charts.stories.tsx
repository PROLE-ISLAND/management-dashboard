import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import {
  LineChart,
  BarChart,
  AreaChart,
  DonutChart,
  SparkLine,
  chartColors,
} from "@/components/ui/chart"

// Sample data
const monthlyData = [
  { month: "1月", 売上: 4200000, 費用: 2400000, 利益: 1800000 },
  { month: "2月", 売上: 3800000, 費用: 2100000, 利益: 1700000 },
  { month: "3月", 売上: 5100000, 費用: 2800000, 利益: 2300000 },
  { month: "4月", 売上: 4700000, 費用: 2500000, 利益: 2200000 },
  { month: "5月", 売上: 5800000, 費用: 3000000, 利益: 2800000 },
  { month: "6月", 売上: 6200000, 費用: 3200000, 利益: 3000000 },
]

const weeklyData = [
  { day: "月", アクセス: 1200, CV: 45 },
  { day: "火", アクセス: 1400, CV: 52 },
  { day: "水", アクセス: 1100, CV: 38 },
  { day: "木", アクセス: 1600, CV: 61 },
  { day: "金", アクセス: 1800, CV: 72 },
  { day: "土", アクセス: 2200, CV: 89 },
  { day: "日", アクセス: 1900, CV: 78 },
]

const categoryData = [
  { category: "アパレル", 売上: 4500000 },
  { category: "雑貨", 売上: 2800000 },
  { category: "食品", 売上: 3200000 },
  { category: "美容", 売上: 1900000 },
  { category: "家電", 売上: 2100000 },
]

const pieData = [
  { name: "オーガニック", value: 45 },
  { name: "広告", value: 25 },
  { name: "SNS", value: 18 },
  { name: "直接", value: 12 },
]

const sparkData = [45, 52, 38, 65, 48, 72, 56, 63, 81, 78, 89, 95]

// ============================================
// LINE CHART STORIES
// ============================================

const lineMeta = {
  title: "Charts/LineChart",
  component: LineChart,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-[600px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof LineChart>

export default lineMeta
type LineStory = StoryObj<typeof lineMeta>

export const Default: LineStory = {
  args: {
    title: "月次売上推移",
    description: "過去6ヶ月の売上データ",
    data: monthlyData,
    xKey: "month",
    yKeys: [{ key: "売上", name: "売上" }],
    valueFormatter: (v) => `¥${(v / 10000).toFixed(0)}万`,
  },
}

export const MultiLine: LineStory = {
  args: {
    title: "収益分析",
    description: "売上・費用・利益の推移",
    data: monthlyData,
    xKey: "month",
    yKeys: [
      { key: "売上", name: "売上", color: chartColors.primary },
      { key: "費用", name: "費用", color: chartColors.danger },
      { key: "利益", name: "利益", color: chartColors.success },
    ],
    valueFormatter: (v) => `¥${(v / 10000).toFixed(0)}万`,
  },
}

export const StraightLine: LineStory = {
  args: {
    title: "週間アクセス数",
    data: weeklyData,
    xKey: "day",
    yKeys: [{ key: "アクセス", name: "アクセス数" }],
    curved: false,
  },
}

export const NoGrid: LineStory = {
  args: {
    title: "シンプルライン",
    data: weeklyData,
    xKey: "day",
    yKeys: [{ key: "CV", name: "コンバージョン" }],
    showGrid: false,
    showLegend: false,
  },
}

// ============================================
// BAR CHART STORIES
// ============================================

export const BarChartDefault: StoryObj<typeof BarChart> = {
  render: () => (
    <BarChart
      title="カテゴリ別売上"
      description="商品カテゴリごとの売上高"
      data={categoryData}
      xKey="category"
      yKeys={[{ key: "売上", name: "売上高" }]}
      valueFormatter={(v) => `¥${(v / 10000).toFixed(0)}万`}
    />
  ),
}

export const StackedBar: StoryObj<typeof BarChart> = {
  render: () => (
    <BarChart
      title="月次収益構成"
      description="売上と費用の内訳"
      data={monthlyData}
      xKey="month"
      yKeys={[
        { key: "利益", name: "利益", color: chartColors.success },
        { key: "費用", name: "費用", color: chartColors.muted },
      ]}
      stacked
      valueFormatter={(v) => `¥${(v / 10000).toFixed(0)}万`}
    />
  ),
}

export const HorizontalBar: StoryObj<typeof BarChart> = {
  render: () => (
    <BarChart
      title="カテゴリ別売上（横棒）"
      data={categoryData}
      xKey="category"
      yKeys={[{ key: "売上", name: "売上高" }]}
      horizontal
      showLegend={false}
      height={250}
      valueFormatter={(v) => `¥${(v / 10000).toFixed(0)}万`}
    />
  ),
}

export const GroupedBar: StoryObj<typeof BarChart> = {
  render: () => (
    <BarChart
      title="週間パフォーマンス"
      description="アクセス数とコンバージョン"
      data={weeklyData}
      xKey="day"
      yKeys={[
        { key: "アクセス", name: "アクセス", color: chartColors.primary },
        { key: "CV", name: "CV", color: chartColors.success },
      ]}
    />
  ),
}

// ============================================
// AREA CHART STORIES
// ============================================

export const AreaChartDefault: StoryObj<typeof AreaChart> = {
  render: () => (
    <AreaChart
      title="売上推移"
      description="グラデーション付きエリアチャート"
      data={monthlyData}
      xKey="month"
      yKeys={[{ key: "売上", name: "売上" }]}
      valueFormatter={(v) => `¥${(v / 10000).toFixed(0)}万`}
    />
  ),
}

export const StackedArea: StoryObj<typeof AreaChart> = {
  render: () => (
    <AreaChart
      title="累積収益"
      description="利益と費用の積み上げ"
      data={monthlyData}
      xKey="month"
      yKeys={[
        { key: "利益", name: "利益", color: chartColors.success },
        { key: "費用", name: "費用", color: chartColors.warning },
      ]}
      stacked
      valueFormatter={(v) => `¥${(v / 10000).toFixed(0)}万`}
    />
  ),
}

export const MultiArea: StoryObj<typeof AreaChart> = {
  render: () => (
    <AreaChart
      title="トラフィック比較"
      data={weeklyData}
      xKey="day"
      yKeys={[
        { key: "アクセス", name: "アクセス" },
        { key: "CV", name: "CV" },
      ]}
      showLegend
    />
  ),
}

// ============================================
// DONUT CHART STORIES
// ============================================

export const DonutChartDefault: StoryObj<typeof DonutChart> = {
  render: () => (
    <div className="w-[400px]">
      <DonutChart
        title="流入元構成"
        description="トラフィックソース別"
        data={pieData}
        valueFormatter={(v) => `${v}%`}
      />
    </div>
  ),
}

export const DonutWithCenter: StoryObj<typeof DonutChart> = {
  render: () => (
    <div className="w-[400px]">
      <DonutChart
        title="予算消化率"
        data={[
          { name: "消化済み", value: 68, color: chartColors.primary },
          { name: "残り", value: 32, color: "hsl(0, 0%, 25%)" },
        ]}
        centerValue="68%"
        centerLabel="消化率"
        showLegend={false}
      />
    </div>
  ),
}

export const PieChart: StoryObj<typeof DonutChart> = {
  render: () => (
    <div className="w-[400px]">
      <DonutChart
        title="売上構成比"
        data={categoryData.map((d, i) => ({
          name: d.category,
          value: d.売上,
        }))}
        innerRadius={0}
        outerRadius={100}
        valueFormatter={(v) => `¥${(v / 10000).toFixed(0)}万`}
      />
    </div>
  ),
}

// ============================================
// SPARKLINE STORIES
// ============================================

export const SparkLineDefault: StoryObj<typeof SparkLine> = {
  render: () => (
    <div className="p-4 bg-card rounded-lg border">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-muted-foreground">週間売上</span>
        <span className="text-lg font-semibold">¥89万</span>
      </div>
      <SparkLine data={sparkData} height={40} />
    </div>
  ),
  decorators: [
    (Story) => (
      <div className="w-[200px]">
        <Story />
      </div>
    ),
  ],
}

export const SparkLineColors: StoryObj<typeof SparkLine> = {
  render: () => (
    <div className="space-y-4">
      <div className="p-4 bg-card rounded-lg border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">売上</span>
          <span className="text-lg font-semibold text-emerald-400">+12%</span>
        </div>
        <SparkLine data={sparkData} color={chartColors.success} height={40} />
      </div>
      <div className="p-4 bg-card rounded-lg border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">離脱率</span>
          <span className="text-lg font-semibold text-red-400">-8%</span>
        </div>
        <SparkLine data={[89, 78, 81, 63, 56, 72, 48, 65, 38, 52, 45]} color={chartColors.danger} height={40} />
      </div>
    </div>
  ),
  decorators: [
    (Story) => (
      <div className="w-[200px]">
        <Story />
      </div>
    ),
  ],
}

// ============================================
// DASHBOARD EXAMPLE
// ============================================

export const DashboardExample: StoryObj<typeof LineChart> = {
  render: () => (
    <div className="space-y-6 w-[900px]">
      {/* Top row - KPI sparklines */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "売上", value: "¥12.4M", change: "+12%", data: sparkData, color: chartColors.success },
          { label: "注文数", value: "847", change: "+8%", data: [38, 42, 35, 48, 52, 45, 58, 62, 55, 68, 72], color: chartColors.primary },
          { label: "客単価", value: "¥14,650", change: "-2%", data: [68, 65, 62, 58, 55, 52, 55, 58, 52, 48, 45], color: chartColors.danger },
          { label: "CVR", value: "3.2%", change: "+0.3%", data: [2.8, 2.9, 3.0, 2.9, 3.1, 3.0, 3.2, 3.1, 3.2, 3.3, 3.2], color: chartColors.info },
        ].map((kpi) => (
          <div key={kpi.label} className="p-4 bg-card rounded-lg border">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">{kpi.label}</span>
              <span className={`text-xs ${kpi.change.startsWith("+") ? "text-emerald-400" : "text-red-400"}`}>
                {kpi.change}
              </span>
            </div>
            <p className="text-xl font-bold mb-2">{kpi.value}</p>
            <SparkLine data={kpi.data} color={kpi.color} height={32} />
          </div>
        ))}
      </div>

      {/* Main charts */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <LineChart
            title="売上推移"
            description="月次売上・費用・利益"
            data={monthlyData}
            xKey="month"
            yKeys={[
              { key: "売上", name: "売上", color: chartColors.primary },
              { key: "費用", name: "費用", color: chartColors.muted },
              { key: "利益", name: "利益", color: chartColors.success },
            ]}
            height={280}
            valueFormatter={(v) => `¥${(v / 10000).toFixed(0)}万`}
          />
        </div>
        <DonutChart
          title="流入元"
          data={pieData}
          height={280}
          centerValue="100%"
          centerLabel="トラフィック"
        />
      </div>

      {/* Bottom charts */}
      <div className="grid grid-cols-2 gap-4">
        <BarChart
          title="カテゴリ別売上"
          data={categoryData}
          xKey="category"
          yKeys={[{ key: "売上", name: "売上" }]}
          height={250}
          showLegend={false}
          valueFormatter={(v) => `¥${(v / 10000).toFixed(0)}万`}
        />
        <AreaChart
          title="週間アクセス"
          data={weeklyData}
          xKey="day"
          yKeys={[{ key: "アクセス", name: "アクセス" }]}
          height={250}
          showLegend={false}
        />
      </div>
    </div>
  ),
  parameters: {
    layout: "centered",
  },
  decorators: [],
}
