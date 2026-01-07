import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import * as React from "react"
import { HelpCircle, Info, Settings, Plus, Trash2, Edit, Copy } from "lucide-react"

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"

const meta: Meta = {
  title: "Overlay/Tooltip",
  component: Tooltip,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
}

export default meta

export const Default: StoryObj = {
  render: () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline">ホバーしてください</Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>これはツールチップです</p>
      </TooltipContent>
    </Tooltip>
  ),
}

export const Positions: StoryObj = {
  render: () => (
    <div className="flex items-center gap-8">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="sm">上</Button>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p>上に表示</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="sm">下</Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>下に表示</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="sm">左</Button>
        </TooltipTrigger>
        <TooltipContent side="left">
          <p>左に表示</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="sm">右</Button>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>右に表示</p>
        </TooltipContent>
      </Tooltip>
    </div>
  ),
}

export const WithIcon: StoryObj = {
  render: () => (
    <div className="flex items-center gap-2">
      <span className="text-sm">パスワード</span>
      <Tooltip>
        <TooltipTrigger asChild>
          <button className="text-muted-foreground hover:text-foreground">
            <HelpCircle className="size-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>8文字以上の英数字を含めてください</p>
        </TooltipContent>
      </Tooltip>
    </div>
  ),
}

export const IconButtons: StoryObj = {
  render: () => (
    <div className="flex items-center gap-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon">
            <Plus className="size-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>新規作成</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon">
            <Edit className="size-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>編集</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon">
            <Copy className="size-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>コピー</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon">
            <Trash2 className="size-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>削除</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon">
            <Settings className="size-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>設定</p>
        </TooltipContent>
      </Tooltip>
    </div>
  ),
}

export const LongContent: StoryObj = {
  render: () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline" size="sm">
          <Info className="size-4 mr-2" />
          詳細情報
        </Button>
      </TooltipTrigger>
      <TooltipContent className="max-w-[250px]">
        <p>
          これは長いツールチップのテキストです。
          複数行にわたる説明文を表示することができます。
          max-widthを設定することで折り返しが有効になります。
        </p>
      </TooltipContent>
    </Tooltip>
  ),
}

export const WithKeyboardShortcut: StoryObj = {
  render: () => (
    <div className="flex items-center gap-4">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="sm">
            保存
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p className="flex items-center gap-2">
            保存
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              ⌘S
            </kbd>
          </p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="sm">
            コピー
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p className="flex items-center gap-2">
            コピー
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              ⌘C
            </kbd>
          </p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="sm">
            貼り付け
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p className="flex items-center gap-2">
            貼り付け
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              ⌘V
            </kbd>
          </p>
        </TooltipContent>
      </Tooltip>
    </div>
  ),
}

export const DisabledButton: StoryObj = {
  render: () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <span tabIndex={0}>
          <Button disabled>
            無効なボタン
          </Button>
        </span>
      </TooltipTrigger>
      <TooltipContent>
        <p>このアクションは現在利用できません</p>
      </TooltipContent>
    </Tooltip>
  ),
}

export const FormFieldHelp: StoryObj = {
  render: () => (
    <div className="space-y-4 w-[300px]">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">ユーザー名</label>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="size-3.5 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              <p>3〜20文字の英数字とアンダースコアが使用できます</p>
            </TooltipContent>
          </Tooltip>
        </div>
        <input
          type="text"
          className="w-full h-9 px-3 rounded-md border bg-transparent text-sm"
          placeholder="username"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">APIキー</label>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="size-3.5 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              <p>設定画面から取得したAPIキーを入力してください</p>
            </TooltipContent>
          </Tooltip>
        </div>
        <input
          type="password"
          className="w-full h-9 px-3 rounded-md border bg-transparent text-sm"
          placeholder="sk-..."
        />
      </div>
    </div>
  ),
}
