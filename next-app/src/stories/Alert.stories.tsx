import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import * as React from "react"

import { Alert, Banner } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

const meta = {
  title: "Feedback/Alert",
  component: Alert,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-[500px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Alert>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    title: "お知らせ",
    children: "システムメンテナンスのため、明日午前2時から4時までサービスが停止します。",
  },
}

export const Info: Story = {
  args: {
    variant: "info",
    title: "ヒント",
    children: "キーボードショートカット ⌘K でクイック検索が使えます。",
  },
}

export const Success: Story = {
  args: {
    variant: "success",
    title: "保存完了",
    children: "変更が正常に保存されました。",
  },
}

export const Warning: Story = {
  args: {
    variant: "warning",
    title: "注意",
    children: "セッションの有効期限が近づいています。作業内容を保存してください。",
  },
}

export const Destructive: Story = {
  args: {
    variant: "destructive",
    title: "エラー",
    children: "データの取得に失敗しました。しばらく経ってから再試行してください。",
  },
}

export const WithClose: Story = {
  render: () => {
    const [visible, setVisible] = React.useState(true)

    if (!visible) {
      return (
        <Button onClick={() => setVisible(true)} variant="outline">
          アラートを表示
        </Button>
      )
    }

    return (
      <Alert
        variant="info"
        title="閉じることができます"
        onClose={() => setVisible(false)}
      >
        ×ボタンをクリックすると閉じます。
      </Alert>
    )
  },
}

export const WithoutTitle: Story = {
  args: {
    variant: "info",
    children: "タイトルなしのシンプルなアラートです。",
  },
}

// Banner stories
export const BannerDefault: StoryObj<typeof Banner> = {
  render: () => (
    <div className="w-full -mx-4">
      <Banner variant="info" title="お知らせ">
        新機能がリリースされました。
      </Banner>
    </div>
  ),
  parameters: {
    layout: "fullscreen",
  },
}

export const BannerWithAction: StoryObj<typeof Banner> = {
  render: () => (
    <Banner
      variant="warning"
      title="プランの更新"
      action={<Button size="sm" variant="outline">アップグレード</Button>}
      onClose={() => {}}
    >
      無料プランの上限に近づいています。
    </Banner>
  ),
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <div className="w-full">
        <Story />
      </div>
    ),
  ],
}

export const AllVariants: StoryObj = {
  render: () => (
    <div className="space-y-4 w-[500px]">
      <Alert variant="default" title="Default">
        デフォルトのアラートスタイルです。
      </Alert>
      <Alert variant="info" title="Info">
        情報を伝えるアラートです。
      </Alert>
      <Alert variant="success" title="Success">
        成功を伝えるアラートです。
      </Alert>
      <Alert variant="warning" title="Warning">
        警告を伝えるアラートです。
      </Alert>
      <Alert variant="destructive" title="Destructive">
        エラーを伝えるアラートです。
      </Alert>
    </div>
  ),
}
