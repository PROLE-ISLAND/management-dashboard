import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { Home, BarChart3, Users, Settings, Folder, FileText, Mail, Bell } from "lucide-react"

import {
  Sidebar,
  SidebarProvider,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarItem,
  SidebarFooter,
  SidebarNav,
  type NavItem,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const meta = {
  title: "Layout/Sidebar",
  component: Sidebar,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <SidebarProvider>
        <div className="flex h-screen">
          <Story />
          <main className="flex-1 p-6 bg-background">
            <h1 className="text-2xl font-bold">Main Content</h1>
            <p className="text-muted-foreground mt-2">
              サイドバーの開閉ボタンで折りたたみができます
            </p>
          </main>
        </div>
      </SidebarProvider>
    ),
  ],
} satisfies Meta<typeof Sidebar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Sidebar>
      <SidebarHeader>
        <span className="text-lg font-semibold">Dashboard</span>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>メニュー</SidebarGroupLabel>
          <SidebarItem href="/" icon={Home} active>
            ダッシュボード
          </SidebarItem>
          <SidebarItem href="/analytics" icon={BarChart3} badge="New">
            分析
          </SidebarItem>
          <SidebarItem href="/projects" icon={Folder}>
            プロジェクト
          </SidebarItem>
          <SidebarItem href="/team" icon={Users}>
            チーム
          </SidebarItem>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>設定</SidebarGroupLabel>
          <SidebarItem href="/settings" icon={Settings}>
            設定
          </SidebarItem>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="flex items-center gap-3 px-2">
          <Avatar className="size-8">
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">John Doe</p>
            <p className="text-xs text-muted-foreground truncate">john@example.com</p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  ),
}

export const WithNavPreset: Story = {
  render: () => {
    const navItems: NavItem[] = [
      { label: "ダッシュボード", href: "/", icon: Home },
      { label: "分析", href: "/analytics", icon: BarChart3, badge: "5" },
      { label: "プロジェクト", href: "/projects", icon: Folder },
      { label: "ドキュメント", href: "/docs", icon: FileText },
      { label: "メール", href: "/mail", icon: Mail, badge: "12" },
      { label: "通知", href: "/notifications", icon: Bell },
      { label: "チーム", href: "/team", icon: Users },
      { label: "設定", href: "/settings", icon: Settings },
    ]

    return (
      <SidebarNav
        logo="経営ダッシュボード"
        collapsedLogo="経"
        items={navItems}
        activeHref="/analytics"
        footer={
          <div className="flex items-center gap-3 px-2">
            <Avatar className="size-8">
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">田中太郎</p>
            </div>
          </div>
        }
      />
    )
  },
}

export const Collapsed: Story = {
  decorators: [
    (Story) => (
      <SidebarProvider defaultCollapsed>
        <div className="flex h-screen">
          <Story />
          <main className="flex-1 p-6 bg-background">
            <h1 className="text-2xl font-bold">Main Content</h1>
          </main>
        </div>
      </SidebarProvider>
    ),
  ],
  render: () => (
    <SidebarNav
      logo="Dashboard"
      collapsedLogo="D"
      activeHref="/"
    />
  ),
}
