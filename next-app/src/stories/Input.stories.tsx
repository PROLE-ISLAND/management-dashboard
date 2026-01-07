import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import * as React from "react"
import { Search, Mail, Lock, Eye, EyeOff, User, Calendar } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

const meta = {
  title: "Forms/Input",
  component: Input,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-[350px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    placeholder: "入力してください",
  },
}

export const WithLabel: Story = {
  render: () => (
    <div className="space-y-2">
      <Label htmlFor="email">メールアドレス</Label>
      <Input id="email" type="email" placeholder="email@example.com" />
    </div>
  ),
}

export const WithDescription: Story = {
  render: () => (
    <div className="space-y-2">
      <Label htmlFor="username">ユーザー名</Label>
      <Input id="username" placeholder="username" />
      <p className="text-xs text-muted-foreground">
        3文字以上20文字以内で入力してください。
      </p>
    </div>
  ),
}

export const WithError: Story = {
  render: () => (
    <div className="space-y-2">
      <Label htmlFor="email-error" className="text-destructive">
        メールアドレス
      </Label>
      <Input
        id="email-error"
        type="email"
        placeholder="email@example.com"
        className="border-destructive focus-visible:ring-destructive"
        defaultValue="invalid-email"
      />
      <p className="text-xs text-destructive">
        有効なメールアドレスを入力してください。
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

export const WithIcon: Story = {
  render: () => (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
      <Input placeholder="検索..." className="pl-9" />
    </div>
  ),
}

export const PasswordWithToggle: Story = {
  render: () => {
    const [show, setShow] = React.useState(false)
    return (
      <div className="space-y-2">
        <Label htmlFor="password">パスワード</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            id="password"
            type={show ? "text" : "password"}
            placeholder="パスワードを入力"
            className="pl-9 pr-9"
          />
          <button
            type="button"
            onClick={() => setShow(!show)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </div>
    )
  },
}

export const WithButton: Story = {
  render: () => (
    <div className="flex gap-2">
      <Input placeholder="メールアドレス" type="email" />
      <Button>登録</Button>
    </div>
  ),
}

export const AllTypes: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>テキスト</Label>
        <Input type="text" placeholder="テキスト入力" />
      </div>
      <div className="space-y-2">
        <Label>メール</Label>
        <Input type="email" placeholder="email@example.com" />
      </div>
      <div className="space-y-2">
        <Label>パスワード</Label>
        <Input type="password" placeholder="パスワード" />
      </div>
      <div className="space-y-2">
        <Label>数値</Label>
        <Input type="number" placeholder="0" />
      </div>
      <div className="space-y-2">
        <Label>日付</Label>
        <Input type="date" />
      </div>
      <div className="space-y-2">
        <Label>時間</Label>
        <Input type="time" />
      </div>
      <div className="space-y-2">
        <Label>URL</Label>
        <Input type="url" placeholder="https://example.com" />
      </div>
      <div className="space-y-2">
        <Label>電話番号</Label>
        <Input type="tel" placeholder="090-1234-5678" />
      </div>
    </div>
  ),
}

export const FormExample: Story = {
  render: () => (
    <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
      <div className="space-y-2">
        <Label htmlFor="form-name">名前 *</Label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input id="form-name" placeholder="山田太郎" className="pl-9" required />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="form-email">メールアドレス *</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            id="form-email"
            type="email"
            placeholder="email@example.com"
            className="pl-9"
            required
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="form-date">開始日</Label>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input id="form-date" type="date" className="pl-9" />
        </div>
      </div>
      <Button type="submit" className="w-full">
        送信
      </Button>
    </form>
  ),
}
