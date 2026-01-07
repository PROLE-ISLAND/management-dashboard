import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import * as React from "react"
import { Moon, Sun, Bell, Mail, Lock, Wifi } from "lucide-react"

import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

const meta: Meta<typeof Switch> = {
  title: "Form/Switch",
  component: Switch,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {},
}

export const WithLabel: StoryObj = {
  render: () => (
    <div className="flex items-center space-x-2">
      <Switch id="airplane-mode" />
      <Label htmlFor="airplane-mode">機内モード</Label>
    </div>
  ),
}

export const Checked: Story = {
  args: {
    defaultChecked: true,
  },
}

export const Disabled: StoryObj = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Switch id="disabled-off" disabled />
        <Label htmlFor="disabled-off" className="text-muted-foreground">
          無効（オフ）
        </Label>
      </div>
      <div className="flex items-center space-x-2">
        <Switch id="disabled-on" disabled defaultChecked />
        <Label htmlFor="disabled-on" className="text-muted-foreground">
          無効（オン）
        </Label>
      </div>
    </div>
  ),
}

export const SettingsExample: StoryObj = {
  render: () => (
    <div className="w-[350px] space-y-4">
      <h3 className="text-lg font-medium">設定</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Bell className="size-4 text-muted-foreground" />
            <div>
              <Label htmlFor="notifications">通知</Label>
              <p className="text-xs text-muted-foreground">プッシュ通知を受け取る</p>
            </div>
          </div>
          <Switch id="notifications" defaultChecked />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Mail className="size-4 text-muted-foreground" />
            <div>
              <Label htmlFor="emails">メール</Label>
              <p className="text-xs text-muted-foreground">メールニュースレター</p>
            </div>
          </div>
          <Switch id="emails" />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Lock className="size-4 text-muted-foreground" />
            <div>
              <Label htmlFor="2fa">2段階認証</Label>
              <p className="text-xs text-muted-foreground">セキュリティを強化</p>
            </div>
          </div>
          <Switch id="2fa" defaultChecked />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Wifi className="size-4 text-muted-foreground" />
            <div>
              <Label htmlFor="wifi">Wi-Fi</Label>
              <p className="text-xs text-muted-foreground">ワイヤレス接続</p>
            </div>
          </div>
          <Switch id="wifi" defaultChecked />
        </div>
      </div>
    </div>
  ),
}

export const DarkModeToggle: StoryObj = {
  render: () => {
    const [isDark, setIsDark] = React.useState(true)

    return (
      <div className="flex items-center space-x-3">
        <Sun className={`size-4 ${!isDark ? "text-yellow-500" : "text-muted-foreground"}`} />
        <Switch
          id="dark-mode"
          checked={isDark}
          onCheckedChange={setIsDark}
        />
        <Moon className={`size-4 ${isDark ? "text-blue-400" : "text-muted-foreground"}`} />
      </div>
    )
  },
}

export const Controlled: StoryObj = {
  render: () => {
    const [enabled, setEnabled] = React.useState(false)

    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="controlled"
            checked={enabled}
            onCheckedChange={setEnabled}
          />
          <Label htmlFor="controlled">コントロールされたスイッチ</Label>
        </div>
        <p className="text-sm text-muted-foreground">
          状態: {enabled ? "オン" : "オフ"}
        </p>
      </div>
    )
  },
}

export const FormCard: StoryObj = {
  render: () => (
    <div className="rounded-lg border p-4 w-[350px] space-y-4">
      <div>
        <h4 className="text-sm font-medium">マーケティングメール</h4>
        <p className="text-xs text-muted-foreground">新製品やアップデートの情報を受け取る</p>
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="promo" className="text-sm">プロモーション</Label>
          <Switch id="promo" defaultChecked />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="newsletter" className="text-sm">ニュースレター</Label>
          <Switch id="newsletter" defaultChecked />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="updates" className="text-sm">製品アップデート</Label>
          <Switch id="updates" />
        </div>
      </div>
    </div>
  ),
}
