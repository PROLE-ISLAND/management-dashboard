import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import * as React from "react"
import { Home, BarChart3, Users, Settings, Folder, Search, FileText, Mail } from "lucide-react"

import { CommandMenu, type CommandGroup } from "@/components/ui/command-menu"
import { Button } from "@/components/ui/button"

const meta = {
  title: "Navigation/CommandMenu",
  component: CommandMenu,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof CommandMenu>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const [open, setOpen] = React.useState(false)

    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          ⌘K を押すか、下のボタンをクリックしてコマンドパレットを開きます
        </p>
        <Button onClick={() => setOpen(true)}>コマンドパレットを開く</Button>
        <CommandMenu open={open} onOpenChange={setOpen} />
      </div>
    )
  },
}

export const CustomGroups: Story = {
  render: () => {
    const [open, setOpen] = React.useState(false)

    const customGroups: CommandGroup[] = [
      {
        heading: "ページ",
        items: [
          { id: "dashboard", label: "ダッシュボード", icon: Home, href: "/" },
          { id: "analytics", label: "売上分析", icon: BarChart3, href: "/analytics" },
          { id: "team", label: "チーム管理", icon: Users, href: "/team" },
        ],
      },
      {
        heading: "プロジェクト",
        items: [
          { id: "project-a", label: "プロジェクトA", icon: Folder, href: "/projects/a" },
          { id: "project-b", label: "プロジェクトB", icon: Folder, href: "/projects/b" },
          { id: "project-c", label: "プロジェクトC", icon: Folder, href: "/projects/c" },
        ],
      },
      {
        heading: "最近のドキュメント",
        items: [
          { id: "doc-1", label: "2024年Q1レポート.pdf", icon: FileText },
          { id: "doc-2", label: "予算計画.xlsx", icon: FileText },
          { id: "doc-3", label: "会議メモ.md", icon: FileText },
        ],
      },
    ]

    return (
      <div className="space-y-4">
        <Button onClick={() => setOpen(true)}>カスタムコマンドを開く</Button>
        <CommandMenu
          open={open}
          onOpenChange={setOpen}
          groups={customGroups}
          placeholder="ページやドキュメントを検索..."
        />
      </div>
    )
  },
}

export const WithActions: Story = {
  render: () => {
    const [open, setOpen] = React.useState(false)

    const actionGroups: CommandGroup[] = [
      {
        heading: "クイックアクション",
        items: [
          {
            id: "new-project",
            label: "新規プロジェクト作成",
            icon: Folder,
            shortcut: "⌘N",
            onSelect: () => alert("新規プロジェクト作成"),
          },
          {
            id: "search",
            label: "グローバル検索",
            icon: Search,
            shortcut: "⌘F",
            onSelect: () => alert("検索を開く"),
          },
          {
            id: "compose",
            label: "メール作成",
            icon: Mail,
            shortcut: "⌘M",
            onSelect: () => alert("メール作成"),
          },
        ],
      },
      {
        heading: "設定",
        items: [
          {
            id: "settings",
            label: "設定を開く",
            icon: Settings,
            shortcut: "⌘,",
            onSelect: () => alert("設定を開く"),
          },
        ],
      },
    ]

    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          アクションを選択するとアラートが表示されます
        </p>
        <Button onClick={() => setOpen(true)}>アクション付きコマンド</Button>
        <CommandMenu
          open={open}
          onOpenChange={setOpen}
          groups={actionGroups}
        />
      </div>
    )
  },
}
