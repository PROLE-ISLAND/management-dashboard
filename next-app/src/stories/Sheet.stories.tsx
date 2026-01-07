import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import * as React from "react"
import { Settings, Filter, X } from "lucide-react"

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const meta = {
  title: "Overlay/Sheet",
  component: Sheet,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Sheet>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">シートを開く</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>シートタイトル</SheetTitle>
          <SheetDescription>
            シートの説明文がここに入ります。
          </SheetDescription>
        </SheetHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            シートのコンテンツエリアです。
          </p>
        </div>
      </SheetContent>
    </Sheet>
  ),
}

export const FromLeft: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">左から開く</Button>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>ナビゲーション</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-2 py-4">
          <Button variant="ghost" className="justify-start">ダッシュボード</Button>
          <Button variant="ghost" className="justify-start">プロジェクト</Button>
          <Button variant="ghost" className="justify-start">チーム</Button>
          <Button variant="ghost" className="justify-start">設定</Button>
        </nav>
      </SheetContent>
    </Sheet>
  ),
}

export const FromTop: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">上から開く</Button>
      </SheetTrigger>
      <SheetContent side="top">
        <SheetHeader>
          <SheetTitle>通知</SheetTitle>
          <SheetDescription>最新の通知を確認できます。</SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  ),
}

export const FromBottom: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">下から開く</Button>
      </SheetTrigger>
      <SheetContent side="bottom">
        <SheetHeader>
          <SheetTitle>アクション</SheetTitle>
          <SheetDescription>操作を選択してください。</SheetDescription>
        </SheetHeader>
        <div className="flex gap-2 py-4">
          <Button className="flex-1">確認</Button>
          <Button variant="outline" className="flex-1">キャンセル</Button>
        </div>
      </SheetContent>
    </Sheet>
  ),
}

export const SettingsPanel: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">
          <Settings className="mr-2 size-4" />
          設定
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>設定</SheetTitle>
          <SheetDescription>
            アプリケーションの設定を変更します。
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">名前</Label>
            <Input id="name" placeholder="名前を入力" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">メールアドレス</Label>
            <Input id="email" type="email" placeholder="email@example.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="language">言語</Label>
            <Select defaultValue="ja">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ja">日本語</SelectItem>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="zh">中文</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button variant="outline">キャンセル</Button>
          </SheetClose>
          <Button>保存</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
}

export const FilterPanel: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">
          <Filter className="mr-2 size-4" />
          フィルター
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>フィルター</SheetTitle>
          <SheetDescription>
            表示するデータを絞り込みます。
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>ステータス</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="すべて" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべて</SelectItem>
                <SelectItem value="active">有効</SelectItem>
                <SelectItem value="inactive">無効</SelectItem>
                <SelectItem value="pending">保留中</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>カテゴリ</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="すべて" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべて</SelectItem>
                <SelectItem value="dev">開発</SelectItem>
                <SelectItem value="design">デザイン</SelectItem>
                <SelectItem value="marketing">マーケティング</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="search">キーワード</Label>
            <Input id="search" placeholder="検索..." />
          </div>
        </div>
        <SheetFooter>
          <Button variant="ghost">リセット</Button>
          <Button>適用</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
}

export const WideSheet: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">詳細パネル</Button>
      </SheetTrigger>
      <SheetContent className="w-[600px] sm:max-w-[600px]">
        <SheetHeader>
          <SheetTitle>プロジェクト詳細</SheetTitle>
          <SheetDescription>
            プロジェクトの詳細情報を表示しています。
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground text-xs">作成日</Label>
              <p className="text-sm">2024年1月15日</p>
            </div>
            <div>
              <Label className="text-muted-foreground text-xs">更新日</Label>
              <p className="text-sm">2024年1月20日</p>
            </div>
            <div>
              <Label className="text-muted-foreground text-xs">ステータス</Label>
              <p className="text-sm">進行中</p>
            </div>
            <div>
              <Label className="text-muted-foreground text-xs">担当者</Label>
              <p className="text-sm">田中太郎</p>
            </div>
          </div>
          <div>
            <Label className="text-muted-foreground text-xs">説明</Label>
            <p className="text-sm mt-1">
              プロジェクトの詳細な説明文がここに入ります。
              複数行にわたる長い説明も表示できます。
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  ),
}
