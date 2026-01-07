import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { Header, HeaderWithBreadcrumb } from "@/components/ui/header"

const meta = {
  title: "Layout/Header",
  component: Header,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="min-h-[200px] bg-background">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Header>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    title: "ダッシュボード",
    user: {
      name: "田中太郎",
      email: "tanaka@example.com",
      initials: "田中",
    },
  },
}

export const WithNotifications: Story = {
  args: {
    title: "ダッシュボード",
    notificationCount: 5,
    user: {
      name: "田中太郎",
      email: "tanaka@example.com",
    },
  },
}

export const ManyNotifications: Story = {
  args: {
    title: "ダッシュボード",
    notificationCount: 150,
    user: {
      name: "田中太郎",
      email: "tanaka@example.com",
    },
  },
}

export const WithoutSearch: Story = {
  args: {
    title: "設定",
    showSearch: false,
    user: {
      name: "田中太郎",
      email: "tanaka@example.com",
    },
  },
}

export const WithAvatar: Story = {
  args: {
    title: "プロフィール",
    user: {
      name: "John Doe",
      email: "john@example.com",
      avatar: "https://github.com/shadcn.png",
    },
  },
}

export const WithBreadcrumb: StoryObj<typeof HeaderWithBreadcrumb> = {
  render: () => (
    <HeaderWithBreadcrumb
      breadcrumbs={[
        { label: "ホーム", href: "/" },
        { label: "プロジェクト", href: "/projects" },
        { label: "詳細" },
      ]}
      user={{
        name: "田中太郎",
        email: "tanaka@example.com",
      }}
    />
  ),
}

export const MinimalHeader: Story = {
  args: {
    showSearch: false,
    showNotifications: false,
  },
  render: (args) => (
    <Header {...args}>
      <span className="text-lg font-semibold">カスタムコンテンツ</span>
    </Header>
  ),
}
