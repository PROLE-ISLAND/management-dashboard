import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { Folder, FileText, Settings } from "lucide-react"

import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbLink,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"

const meta = {
  title: "Navigation/Breadcrumb",
  component: Breadcrumb,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Breadcrumb>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    items: [
      { label: "ホーム", href: "/" },
      { label: "プロジェクト", href: "/projects" },
      { label: "詳細" },
    ],
  },
}

export const TwoLevels: Story = {
  args: {
    items: [
      { label: "ホーム", href: "/" },
      { label: "設定" },
    ],
  },
}

export const ManyLevels: Story = {
  args: {
    items: [
      { label: "ホーム", href: "/" },
      { label: "プロジェクト", href: "/projects" },
      { label: "チームA", href: "/projects/team-a" },
      { label: "2024年Q1", href: "/projects/team-a/q1" },
      { label: "月次レポート", href: "/projects/team-a/q1/monthly" },
      { label: "1月" },
    ],
    maxItems: 4,
  },
}

export const WithIcons: Story = {
  args: {
    items: [
      { label: "ホーム", href: "/" },
      { label: "ドキュメント", href: "/docs", icon: <Folder className="size-3.5" /> },
      { label: "ガイド", href: "/docs/guide", icon: <FileText className="size-3.5" /> },
      { label: "設定" },
    ],
  },
}

export const WithoutHomeIcon: Story = {
  args: {
    items: [
      { label: "ダッシュボード", href: "/" },
      { label: "分析", href: "/analytics" },
      { label: "売上レポート" },
    ],
    showHomeIcon: false,
  },
}

export const CustomSeparator: Story = {
  args: {
    items: [
      { label: "ホーム", href: "/" },
      { label: "プロジェクト", href: "/projects" },
      { label: "詳細" },
    ],
    separator: <span className="mx-1">/</span>,
  },
}

export const CollapsedItems: Story = {
  args: {
    items: [
      { label: "ホーム", href: "/" },
      { label: "組織", href: "/org" },
      { label: "チーム", href: "/org/teams" },
      { label: "プロジェクト", href: "/org/teams/projects" },
      { label: "タスク", href: "/org/teams/projects/tasks" },
      { label: "サブタスク", href: "/org/teams/projects/tasks/sub" },
      { label: "詳細" },
    ],
    maxItems: 4,
  },
}

// Using builder components
export const UsingBuilderComponents: StoryObj = {
  render: () => (
    <BreadcrumbList>
      <BreadcrumbLink href="/">ホーム</BreadcrumbLink>
      <BreadcrumbLink href="/settings">設定</BreadcrumbLink>
      <BreadcrumbPage>プロフィール</BreadcrumbPage>
    </BreadcrumbList>
  ),
}

export const InContext: StoryObj = {
  render: () => (
    <div className="space-y-4 w-[600px]">
      <div className="border-b border-white/10 pb-4">
        <Breadcrumb
          items={[
            { label: "ダッシュボード", href: "/" },
            { label: "プロジェクト", href: "/projects" },
            { label: "プロジェクトA" },
          ]}
        />
      </div>
      <div>
        <h1 className="text-2xl font-bold">プロジェクトA</h1>
        <p className="text-muted-foreground mt-1">
          プロジェクトの詳細ページです。
        </p>
      </div>
    </div>
  ),
}
