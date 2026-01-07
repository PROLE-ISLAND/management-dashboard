import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import * as React from "react"
import { User, Settings, CreditCard, Bell, Shield, Key } from "lucide-react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

const meta: Meta = {
  title: "Navigation/Tabs",
  component: Tabs,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-[600px]">
        <Story />
      </div>
    ),
  ],
}

export default meta

export const Default: StoryObj = {
  render: () => (
    <Tabs defaultValue="account">
      <TabsList>
        <TabsTrigger value="account">アカウント</TabsTrigger>
        <TabsTrigger value="password">パスワード</TabsTrigger>
        <TabsTrigger value="settings">設定</TabsTrigger>
      </TabsList>
      <TabsContent value="account" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>アカウント</CardTitle>
            <CardDescription>
              アカウント情報を変更します。保存をクリックして変更を適用してください。
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">名前</Label>
              <Input id="name" defaultValue="山田 太郎" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">メール</Label>
              <Input id="email" defaultValue="yamada@example.com" />
            </div>
            <Button>保存</Button>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="password" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>パスワード</CardTitle>
            <CardDescription>
              パスワードを変更します。変更後は再ログインが必要です。
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current">現在のパスワード</Label>
              <Input id="current" type="password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new">新しいパスワード</Label>
              <Input id="new" type="password" />
            </div>
            <Button>パスワードを変更</Button>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="settings" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>設定</CardTitle>
            <CardDescription>
              アプリケーションの設定を変更します。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              設定オプションがここに表示されます。
            </p>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  ),
}

export const WithIcons: StoryObj = {
  render: () => (
    <Tabs defaultValue="profile">
      <TabsList>
        <TabsTrigger value="profile">
          <User className="size-4 mr-2" />
          プロフィール
        </TabsTrigger>
        <TabsTrigger value="billing">
          <CreditCard className="size-4 mr-2" />
          請求
        </TabsTrigger>
        <TabsTrigger value="notifications">
          <Bell className="size-4 mr-2" />
          通知
        </TabsTrigger>
        <TabsTrigger value="security">
          <Shield className="size-4 mr-2" />
          セキュリティ
        </TabsTrigger>
      </TabsList>
      <TabsContent value="profile" className="mt-4">
        <div className="rounded-lg border p-4">
          <h3 className="font-medium mb-2">プロフィール設定</h3>
          <p className="text-sm text-muted-foreground">
            ユーザープロフィールの情報を管理します。
          </p>
        </div>
      </TabsContent>
      <TabsContent value="billing" className="mt-4">
        <div className="rounded-lg border p-4">
          <h3 className="font-medium mb-2">請求情報</h3>
          <p className="text-sm text-muted-foreground">
            支払い方法と請求履歴を確認します。
          </p>
        </div>
      </TabsContent>
      <TabsContent value="notifications" className="mt-4">
        <div className="rounded-lg border p-4">
          <h3 className="font-medium mb-2">通知設定</h3>
          <p className="text-sm text-muted-foreground">
            通知の受信方法を設定します。
          </p>
        </div>
      </TabsContent>
      <TabsContent value="security" className="mt-4">
        <div className="rounded-lg border p-4">
          <h3 className="font-medium mb-2">セキュリティ設定</h3>
          <p className="text-sm text-muted-foreground">
            2段階認証やセッション管理を行います。
          </p>
        </div>
      </TabsContent>
    </Tabs>
  ),
}

export const FullWidth: StoryObj = {
  render: () => (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="w-full grid grid-cols-4">
        <TabsTrigger value="overview">概要</TabsTrigger>
        <TabsTrigger value="analytics">分析</TabsTrigger>
        <TabsTrigger value="reports">レポート</TabsTrigger>
        <TabsTrigger value="exports">エクスポート</TabsTrigger>
      </TabsList>
      <TabsContent value="overview" className="mt-4">
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>総売上</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">¥1,234,567</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>総注文数</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">1,234件</p>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
      <TabsContent value="analytics" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>分析</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">分析データがここに表示されます。</p>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="reports" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>レポート</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">レポート一覧がここに表示されます。</p>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="exports" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>エクスポート</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">エクスポートオプションがここに表示されます。</p>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  ),
}

export const Disabled: StoryObj = {
  render: () => (
    <Tabs defaultValue="active">
      <TabsList>
        <TabsTrigger value="active">アクティブ</TabsTrigger>
        <TabsTrigger value="coming" disabled>
          準備中
        </TabsTrigger>
        <TabsTrigger value="archived">アーカイブ</TabsTrigger>
      </TabsList>
      <TabsContent value="active" className="mt-4">
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">
            アクティブなアイテムがここに表示されます。
          </p>
        </div>
      </TabsContent>
      <TabsContent value="archived" className="mt-4">
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">
            アーカイブされたアイテムがここに表示されます。
          </p>
        </div>
      </TabsContent>
    </Tabs>
  ),
}

export const VerticalStyle: StoryObj = {
  render: () => (
    <div className="flex gap-4">
      <Tabs defaultValue="general" orientation="vertical" className="flex gap-4">
        <TabsList className="flex-col h-auto">
          <TabsTrigger value="general" className="w-full justify-start">
            <Settings className="size-4 mr-2" />
            一般
          </TabsTrigger>
          <TabsTrigger value="security" className="w-full justify-start">
            <Shield className="size-4 mr-2" />
            セキュリティ
          </TabsTrigger>
          <TabsTrigger value="api" className="w-full justify-start">
            <Key className="size-4 mr-2" />
            API
          </TabsTrigger>
        </TabsList>
        <div className="flex-1">
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>一般設定</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  一般的な設定オプションです。
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>セキュリティ設定</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  セキュリティに関する設定です。
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="api">
            <Card>
              <CardHeader>
                <CardTitle>API設定</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  APIキーとアクセス設定です。
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  ),
}
