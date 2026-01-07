import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { Check, AlertCircle, Clock, X } from "lucide-react"

import { Badge } from "@/components/ui/badge"

const meta = {
  title: "UI/Badge",
  component: Badge,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "secondary", "destructive", "outline"],
    },
  },
} satisfies Meta<typeof Badge>

export default meta
type Story = StoryObj<typeof meta>

// Default
export const Default: Story = {
  args: {
    children: "Badge",
  },
}

// Secondary
export const Secondary: Story = {
  args: {
    variant: "secondary",
    children: "Secondary",
  },
}

// Destructive
export const Destructive: Story = {
  args: {
    variant: "destructive",
    children: "Error",
  },
}

// Outline
export const Outline: Story = {
  args: {
    variant: "outline",
    children: "Outline",
  },
}

// With icon
export const WithIcon: Story = {
  args: {
    children: (
      <>
        <Check className="size-3" />
        Completed
      </>
    ),
  },
}

// Status badges
export const StatusBadges: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="default">
        <Check className="size-3" />
        完了
      </Badge>
      <Badge variant="secondary">
        <Clock className="size-3" />
        進行中
      </Badge>
      <Badge variant="destructive">
        <X className="size-3" />
        エラー
      </Badge>
      <Badge variant="outline">
        <AlertCircle className="size-3" />
        保留
      </Badge>
    </div>
  ),
}

// Priority badges
export const PriorityBadges: Story = {
  render: () => (
    <div className="flex gap-2">
      <Badge className="bg-red-500 hover:bg-red-500/90">高</Badge>
      <Badge className="bg-yellow-500 hover:bg-yellow-500/90 text-black">中</Badge>
      <Badge className="bg-green-500 hover:bg-green-500/90">低</Badge>
    </div>
  ),
}

// Category badges
export const CategoryBadges: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="outline">売上</Badge>
      <Badge variant="outline">マーケティング</Badge>
      <Badge variant="outline">開発</Badge>
      <Badge variant="outline">カスタマーサポート</Badge>
    </div>
  ),
}

// All variants
export const AllVariants: Story = {
  render: () => (
    <div className="flex gap-2">
      <Badge variant="default">Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="outline">Outline</Badge>
    </div>
  ),
}
