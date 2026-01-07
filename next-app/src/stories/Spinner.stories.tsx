import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import * as React from "react"

import {
  Spinner,
  LoadingOverlay,
  LoadingInline,
  LoadingCard,
  LoadingButtonContent,
  LoadingDots,
  LoadingPulse,
} from "@/components/ui/spinner"
import { Button } from "@/components/ui/button"

const meta = {
  title: "Feedback/Spinner",
  component: Spinner,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Spinner>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {},
}

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <div className="flex flex-col items-center gap-2">
        <Spinner size="xs" />
        <span className="text-xs text-muted-foreground">XS</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Spinner size="sm" />
        <span className="text-xs text-muted-foreground">SM</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Spinner size="default" />
        <span className="text-xs text-muted-foreground">Default</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Spinner size="lg" />
        <span className="text-xs text-muted-foreground">LG</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Spinner size="xl" />
        <span className="text-xs text-muted-foreground">XL</span>
      </div>
    </div>
  ),
}

export const InlineLoading: Story = {
  render: () => (
    <div className="space-y-4">
      <LoadingInline text="読み込み中..." />
      <LoadingInline text="保存中..." size="xs" />
      <LoadingInline size="sm" />
    </div>
  ),
}

export const CardLoading: Story = {
  render: () => (
    <div className="w-[400px]">
      <LoadingCard text="データを取得中..." height={200} />
    </div>
  ),
}

export const ButtonLoading: Story = {
  render: () => {
    const [loading, setLoading] = React.useState(false)

    const handleClick = () => {
      setLoading(true)
      setTimeout(() => setLoading(false), 2000)
    }

    return (
      <div className="space-y-4">
        <Button onClick={handleClick} disabled={loading}>
          <LoadingButtonContent loading={loading} loadingText="保存中...">
            保存する
          </LoadingButtonContent>
        </Button>

        <Button variant="outline" onClick={handleClick} disabled={loading}>
          <LoadingButtonContent loading={loading}>
            送信
          </LoadingButtonContent>
        </Button>
      </div>
    )
  },
}

export const DotsAnimation: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">入力中</span>
      <LoadingDots />
    </div>
  ),
}

export const PulseAnimation: Story = {
  render: () => (
    <div className="space-y-4 w-[300px]">
      <div className="flex items-center gap-3">
        <LoadingPulse className="size-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <LoadingPulse className="h-4 w-3/4" />
          <LoadingPulse className="h-3 w-1/2" />
        </div>
      </div>
      <LoadingPulse className="h-32 w-full rounded-lg" />
      <div className="space-y-2">
        <LoadingPulse className="h-4 w-full" />
        <LoadingPulse className="h-4 w-5/6" />
        <LoadingPulse className="h-4 w-4/6" />
      </div>
    </div>
  ),
}

export const OverlayExample: Story = {
  render: () => {
    const [loading, setLoading] = React.useState(false)

    return (
      <div className="relative w-[400px] h-[300px] border border-white/10 rounded-lg p-4">
        <h3 className="font-medium mb-2">コンテンツエリア</h3>
        <p className="text-sm text-muted-foreground">
          「読み込み開始」ボタンをクリックすると、
          オーバーレイローディングが表示されます。
        </p>
        <Button
          onClick={() => {
            setLoading(true)
            setTimeout(() => setLoading(false), 3000)
          }}
          className="mt-4"
        >
          読み込み開始
        </Button>

        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg">
            <div className="flex flex-col items-center gap-3">
              <Spinner size="lg" />
              <p className="text-sm text-muted-foreground">処理中...</p>
            </div>
          </div>
        )}
      </div>
    )
  },
}

export const FullPageOverlay: Story = {
  render: () => {
    const [loading, setLoading] = React.useState(false)

    return (
      <>
        <Button
          onClick={() => {
            setLoading(true)
            setTimeout(() => setLoading(false), 3000)
          }}
        >
          フルページローディング
        </Button>
        {loading && <LoadingOverlay text="ページを読み込んでいます..." />}
      </>
    )
  },
  parameters: {
    layout: "fullscreen",
  },
}

export const TableLoading: Story = {
  render: () => (
    <div className="w-[500px] space-y-3">
      {/* Header */}
      <div className="flex gap-4 pb-2 border-b border-white/10">
        <LoadingPulse className="h-4 flex-1" />
        <LoadingPulse className="h-4 w-24" />
        <LoadingPulse className="h-4 w-24" />
      </div>
      {/* Rows */}
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex gap-4 items-center">
          <LoadingPulse className="h-8 flex-1" />
          <LoadingPulse className="h-8 w-24" />
          <LoadingPulse className="h-8 w-24" />
        </div>
      ))}
    </div>
  ),
}

export const FormLoading: Story = {
  render: () => (
    <div className="w-[350px] space-y-4">
      <div className="space-y-2">
        <LoadingPulse className="h-4 w-20" />
        <LoadingPulse className="h-10 w-full rounded-md" />
      </div>
      <div className="space-y-2">
        <LoadingPulse className="h-4 w-24" />
        <LoadingPulse className="h-10 w-full rounded-md" />
      </div>
      <div className="space-y-2">
        <LoadingPulse className="h-4 w-16" />
        <LoadingPulse className="h-24 w-full rounded-md" />
      </div>
      <LoadingPulse className="h-10 w-full rounded-md" />
    </div>
  ),
}
