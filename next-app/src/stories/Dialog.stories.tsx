import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import * as React from "react"
import { AlertTriangle, Trash2, Settings, User } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const meta: Meta = {
  title: "Overlay/Dialog",
  component: Dialog,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
}

export default meta

export const Default: StoryObj = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">ダイアログを開く</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>ダイアログタイトル</DialogTitle>
          <DialogDescription>
            これはダイアログの説明文です。ユーザーに対して必要な情報を提供します。
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            ここにコンテンツが入ります。
          </p>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">キャンセル</Button>
          </DialogClose>
          <Button>確認</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
}

export const ConfirmDelete: StoryObj = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive">
          <Trash2 className="size-4 mr-2" />
          削除
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="size-5" />
            削除の確認
          </DialogTitle>
          <DialogDescription>
            この操作は取り消せません。本当に削除しますか？
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 px-1">
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3">
            <p className="text-sm text-destructive">
              「サンプルプロジェクト」を削除すると、関連するすべてのデータが失われます。
            </p>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">キャンセル</Button>
          </DialogClose>
          <Button variant="destructive">削除する</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
}

export const FormDialog: StoryObj = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <User className="size-4 mr-2" />
          プロフィール編集
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>プロフィール編集</DialogTitle>
          <DialogDescription>
            プロフィール情報を更新します。完了したら保存をクリックしてください。
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">名前</Label>
            <Input id="name" defaultValue="山田 太郎" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">メールアドレス</Label>
            <Input id="email" type="email" defaultValue="yamada@example.com" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="username">ユーザー名</Label>
            <Input id="username" defaultValue="@yamada" />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">キャンセル</Button>
          </DialogClose>
          <Button type="submit">保存</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
}

export const SettingsDialog: StoryObj = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>設定</DialogTitle>
          <DialogDescription>
            アプリケーションの設定を変更します。
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">通知</p>
              <p className="text-xs text-muted-foreground">メール通知を受け取る</p>
            </div>
            <Button variant="outline" size="sm">オン</Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">ダークモード</p>
              <p className="text-xs text-muted-foreground">ダークテーマを使用する</p>
            </div>
            <Button variant="outline" size="sm">オン</Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">言語</p>
              <p className="text-xs text-muted-foreground">表示言語を選択</p>
            </div>
            <Button variant="outline" size="sm">日本語</Button>
          </div>
        </div>
        <DialogFooter>
          <Button>保存</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
}

export const WithoutCloseButton: StoryObj = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">閉じるボタンなし</Button>
      </DialogTrigger>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>重要なお知らせ</DialogTitle>
          <DialogDescription>
            このダイアログは閉じるボタンがありません。
            フッターのボタンで閉じてください。
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button>了解しました</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
}

export const LongContent: StoryObj = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">長いコンテンツ</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>利用規約</DialogTitle>
          <DialogDescription>
            サービスをご利用いただくには、以下の利用規約に同意していただく必要があります。
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4 text-sm text-muted-foreground">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i}>
              <h4 className="font-medium text-foreground mb-1">第{i + 1}条 条項タイトル</h4>
              <p>
                これは利用規約の条項です。長いテキストをスクロールして読む必要がある場合の
                表示例です。ユーザーはすべての内容を確認した上で同意することが求められます。
              </p>
            </div>
          ))}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">同意しない</Button>
          </DialogClose>
          <Button>同意する</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
}
