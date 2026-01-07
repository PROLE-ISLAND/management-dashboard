import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { DollarSign, Users, TrendingUp, Package, Activity, Percent } from "lucide-react"

import { KPICard } from "@/components/ui/kpi-card"

const meta = {
  title: "Dashboard/KPICard",
  component: KPICard,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "glass", "gradient", "outline"],
    },
    trend: {
      control: "select",
      options: ["up", "down", "neutral"],
    },
    loading: {
      control: "boolean",
    },
  },
  decorators: [
    (Story) => (
      <div className="w-[320px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof KPICard>

export default meta
type Story = StoryObj<typeof meta>

// Default state
export const Default: Story = {
  args: {
    title: "総売上",
    value: 12450000,
    prefix: "¥",
    change: 12.5,
    changeLabel: "前月比",
    icon: <DollarSign className="size-4" />,
  },
}

// Loading state
export const Loading: Story = {
  args: {
    title: "総売上",
    value: 0,
    loading: true,
  },
}

// Trend Up
export const TrendUp: Story = {
  args: {
    title: "月間アクティブユーザー",
    value: 2847,
    suffix: "人",
    change: 23.1,
    changeLabel: "前月比",
    previousValue: 2312,
    trend: "up",
    icon: <Users className="size-4" />,
  },
}

// Trend Down
export const TrendDown: Story = {
  args: {
    title: "離脱率",
    value: 4.2,
    suffix: "%",
    change: -15.3,
    changeLabel: "前月比",
    previousValue: 4.96,
    trend: "down",
    icon: <Activity className="size-4" />,
  },
}

// Neutral trend
export const Neutral: Story = {
  args: {
    title: "コンバージョン率",
    value: 3.2,
    suffix: "%",
    change: 0,
    changeLabel: "変化なし",
    trend: "neutral",
    icon: <Percent className="size-4" />,
  },
}

// Glass variant
export const GlassVariant: Story = {
  args: {
    title: "在庫数",
    value: 1234,
    suffix: "個",
    change: 8.2,
    changeLabel: "前週比",
    variant: "glass",
    icon: <Package className="size-4" />,
  },
}

// Gradient variant
export const GradientVariant: Story = {
  args: {
    title: "成長率",
    value: 156,
    suffix: "%",
    change: 45.2,
    changeLabel: "前年比",
    variant: "gradient",
    icon: <TrendingUp className="size-4" />,
  },
}

// With sparkline
export const WithSparkline: Story = {
  args: {
    title: "日次売上",
    value: 890000,
    prefix: "¥",
    change: 5.3,
    changeLabel: "前日比",
    icon: <DollarSign className="size-4" />,
    sparkline: [45, 52, 38, 65, 48, 72, 56, 63, 81, 78, 89],
  },
}

// Sparkline trend down
export const SparklineDown: Story = {
  args: {
    title: "直帰率",
    value: 42.3,
    suffix: "%",
    change: -8.2,
    changeLabel: "前週比",
    trend: "down",
    icon: <Activity className="size-4" />,
    sparkline: [65, 58, 62, 55, 48, 52, 45, 42],
  },
}

// Grid of KPIs
export const KPIGrid: StoryObj = {
  render: () => (
    <div className="grid grid-cols-2 gap-4 w-[680px]">
      <KPICard
        title="総売上"
        value={12450000}
        prefix="¥"
        change={12.5}
        changeLabel="前月比"
        icon={<DollarSign className="size-4" />}
      />
      <KPICard
        title="アクティブユーザー"
        value={2847}
        suffix="人"
        change={23.1}
        changeLabel="前月比"
        icon={<Users className="size-4" />}
      />
      <KPICard
        title="コンバージョン率"
        value={3.2}
        suffix="%"
        change={-2.1}
        changeLabel="前月比"
        icon={<Percent className="size-4" />}
      />
      <KPICard
        title="在庫数"
        value={1234}
        suffix="個"
        change={0}
        changeLabel="変化なし"
        icon={<Package className="size-4" />}
      />
    </div>
  ),
  parameters: {
    layout: "centered",
  },
}

// All variants showcase
export const AllVariants: StoryObj = {
  render: () => (
    <div className="space-y-4 w-[320px]">
      <KPICard
        title="Default"
        value={1000}
        change={5}
        variant="default"
      />
      <KPICard
        title="Glass"
        value={2000}
        change={-3}
        variant="glass"
      />
      <KPICard
        title="Gradient"
        value={3000}
        change={12}
        variant="gradient"
      />
      <KPICard
        title="Outline"
        value={4000}
        change={0}
        variant="outline"
      />
    </div>
  ),
  parameters: {
    layout: "centered",
  },
}
