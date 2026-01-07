import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { FileSearch, Inbox, FolderPlus, RefreshCw } from "lucide-react"

import { EmptyState, NoDataState, NoResultsState, ErrorState } from "@/components/ui/empty-state"

const meta = {
  title: "Feedback/EmptyState",
  component: EmptyState,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-[500px] border border-dashed border-white/10 rounded-lg">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof EmptyState>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    type: "no-data",
  },
}

export const NoResults: Story = {
  args: {
    type: "no-results",
  },
}

export const EmptyFolder: Story = {
  args: {
    type: "empty-folder",
  },
}

export const InboxEmpty: Story = {
  args: {
    type: "inbox",
  },
}

export const Error: Story = {
  args: {
    type: "error",
    action: {
      label: "再試行",
      onClick: () => alert("再試行"),
      icon: RefreshCw,
    },
  },
}

export const WithAction: Story = {
  args: {
    type: "no-data",
    title: "プロジェクトがありません",
    description: "最初のプロジェクトを作成して始めましょう。",
    action: {
      label: "プロジェクトを作成",
      onClick: () => alert("作成"),
      icon: FolderPlus,
    },
  },
}

export const WithSecondaryAction: Story = {
  args: {
    type: "no-results",
    action: {
      label: "フィルターをクリア",
      onClick: () => alert("クリア"),
    },
    secondaryAction: {
      label: "ヘルプを見る",
      onClick: () => alert("ヘルプ"),
    },
  },
}

export const CustomIcon: Story = {
  args: {
    icon: FileSearch,
    title: "カスタムアイコン",
    description: "任意のLucideアイコンを使用できます。",
  },
}

export const SizeSmall: Story = {
  args: {
    type: "no-data",
    size: "sm",
  },
  decorators: [
    (Story) => (
      <div className="w-[300px] border border-dashed border-white/10 rounded-lg">
        <Story />
      </div>
    ),
  ],
}

export const SizeLarge: Story = {
  args: {
    type: "no-data",
    size: "lg",
  },
  decorators: [
    (Story) => (
      <div className="w-[600px] border border-dashed border-white/10 rounded-lg">
        <Story />
      </div>
    ),
  ],
}

// Specialized components
export const SpecializedNoData: StoryObj = {
  render: () => (
    <NoDataState
      title="売上データがありません"
      description="この期間の売上データはまだ記録されていません。"
      action={{
        label: "データをインポート",
        onClick: () => alert("インポート"),
      }}
    />
  ),
}

export const SpecializedNoResults: StoryObj = {
  render: () => (
    <NoResultsState
      description="「キーワード」に一致する結果がありません。別の検索ワードを試してみてください。"
    />
  ),
}

export const SpecializedError: StoryObj = {
  render: () => (
    <ErrorState
      title="読み込みエラー"
      description="ネットワークエラーが発生しました。"
      action={{
        label: "再読み込み",
        onClick: () => window.location.reload(),
        icon: RefreshCw,
      }}
    />
  ),
}
