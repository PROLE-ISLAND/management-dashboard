import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import * as React from "react"

import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

const meta = {
  title: "Forms/Textarea",
  component: Textarea,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-[400px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Textarea>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    placeholder: "入力してください...",
  },
}

export const WithLabel: Story = {
  render: () => (
    <div className="space-y-2">
      <Label htmlFor="message">メッセージ</Label>
      <Textarea id="message" placeholder="メッセージを入力してください..." />
    </div>
  ),
}

export const WithDescription: Story = {
  render: () => (
    <div className="space-y-2">
      <Label htmlFor="bio">自己紹介</Label>
      <Textarea
        id="bio"
        placeholder="あなたについて教えてください..."
        className="min-h-[100px]"
      />
      <p className="text-xs text-muted-foreground">
        最大500文字まで入力できます。
      </p>
    </div>
  ),
}

export const WithCharacterCount: Story = {
  render: () => {
    const [value, setValue] = React.useState("")
    const maxLength = 200

    return (
      <div className="space-y-2">
        <Label htmlFor="limited">コメント</Label>
        <Textarea
          id="limited"
          placeholder="コメントを入力..."
          value={value}
          onChange={(e) => setValue(e.target.value.slice(0, maxLength))}
          className="min-h-[100px]"
        />
        <div className="flex justify-end">
          <span
            className={`text-xs ${
              value.length >= maxLength
                ? "text-destructive"
                : "text-muted-foreground"
            }`}
          >
            {value.length} / {maxLength}
          </span>
        </div>
      </div>
    )
  },
}

export const WithError: Story = {
  render: () => (
    <div className="space-y-2">
      <Label htmlFor="error-textarea" className="text-destructive">
        必須フィールド
      </Label>
      <Textarea
        id="error-textarea"
        placeholder="入力必須です..."
        className="border-destructive focus-visible:ring-destructive"
      />
      <p className="text-xs text-destructive">
        このフィールドは必須です。
      </p>
    </div>
  ),
}

export const Disabled: Story = {
  args: {
    placeholder: "入力不可",
    disabled: true,
  },
}

export const ReadOnly: Story = {
  args: {
    readOnly: true,
    defaultValue: "この内容は読み取り専用です。\n編集することはできません。",
  },
}

export const CustomRows: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>小さい (rows=2)</Label>
        <Textarea placeholder="短いテキスト..." rows={2} />
      </div>
      <div className="space-y-2">
        <Label>デフォルト (rows=3)</Label>
        <Textarea placeholder="通常のテキスト..." rows={3} />
      </div>
      <div className="space-y-2">
        <Label>大きい (rows=6)</Label>
        <Textarea placeholder="長いテキスト..." rows={6} />
      </div>
    </div>
  ),
}

export const AutoResize: Story = {
  render: () => {
    const textareaRef = React.useRef<HTMLTextAreaElement>(null)

    const handleInput = () => {
      const textarea = textareaRef.current
      if (textarea) {
        textarea.style.height = "auto"
        textarea.style.height = `${textarea.scrollHeight}px`
      }
    }

    return (
      <div className="space-y-2">
        <Label htmlFor="auto-resize">自動リサイズ</Label>
        <Textarea
          ref={textareaRef}
          id="auto-resize"
          placeholder="入力すると自動的にサイズが変わります..."
          onInput={handleInput}
          className="min-h-[60px] resize-none overflow-hidden"
        />
      </div>
    )
  },
}

export const FormExample: Story = {
  render: () => (
    <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
      <div className="space-y-2">
        <Label htmlFor="form-subject">件名 *</Label>
        <input
          id="form-subject"
          type="text"
          placeholder="件名を入力"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="form-message">本文 *</Label>
        <Textarea
          id="form-message"
          placeholder="メッセージを入力..."
          className="min-h-[150px]"
          required
        />
      </div>
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline">
          下書き保存
        </Button>
        <Button type="submit">送信</Button>
      </div>
    </form>
  ),
}
