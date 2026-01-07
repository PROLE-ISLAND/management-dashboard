import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import * as React from "react"
import { Globe, Check } from "lucide-react"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"

const meta: Meta = {
  title: "Form/Select",
  component: Select,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
}

export default meta

export const Default: StoryObj = {
  render: () => (
    <Select>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="選択してください" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="option1">オプション 1</SelectItem>
        <SelectItem value="option2">オプション 2</SelectItem>
        <SelectItem value="option3">オプション 3</SelectItem>
      </SelectContent>
    </Select>
  ),
}

export const WithLabel: StoryObj = {
  render: () => (
    <div className="grid gap-2 w-[250px]">
      <Label htmlFor="framework">フレームワーク</Label>
      <Select>
        <SelectTrigger id="framework">
          <SelectValue placeholder="フレームワークを選択" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="next">Next.js</SelectItem>
          <SelectItem value="remix">Remix</SelectItem>
          <SelectItem value="astro">Astro</SelectItem>
          <SelectItem value="gatsby">Gatsby</SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
}

export const WithGroups: StoryObj = {
  render: () => (
    <Select>
      <SelectTrigger className="w-[250px]">
        <SelectValue placeholder="タイムゾーンを選択" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>アジア</SelectLabel>
          <SelectItem value="asia/tokyo">東京 (GMT+9)</SelectItem>
          <SelectItem value="asia/seoul">ソウル (GMT+9)</SelectItem>
          <SelectItem value="asia/shanghai">上海 (GMT+8)</SelectItem>
          <SelectItem value="asia/singapore">シンガポール (GMT+8)</SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>アメリカ</SelectLabel>
          <SelectItem value="america/new_york">ニューヨーク (GMT-5)</SelectItem>
          <SelectItem value="america/los_angeles">ロサンゼルス (GMT-8)</SelectItem>
          <SelectItem value="america/chicago">シカゴ (GMT-6)</SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>ヨーロッパ</SelectLabel>
          <SelectItem value="europe/london">ロンドン (GMT+0)</SelectItem>
          <SelectItem value="europe/paris">パリ (GMT+1)</SelectItem>
          <SelectItem value="europe/berlin">ベルリン (GMT+1)</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  ),
}

export const WithDefaultValue: StoryObj = {
  render: () => (
    <Select defaultValue="medium">
      <SelectTrigger className="w-[180px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="small">小</SelectItem>
        <SelectItem value="medium">中</SelectItem>
        <SelectItem value="large">大</SelectItem>
      </SelectContent>
    </Select>
  ),
}

export const Disabled: StoryObj = {
  render: () => (
    <div className="space-y-4">
      <Select disabled>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="無効な Select" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">オプション 1</SelectItem>
        </SelectContent>
      </Select>

      <Select>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="一部無効なオプション" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="available">利用可能</SelectItem>
          <SelectItem value="disabled" disabled>
            利用不可
          </SelectItem>
          <SelectItem value="also-available">これも利用可能</SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
}

export const SmallSize: StoryObj = {
  render: () => (
    <div className="flex items-center gap-4">
      <Select>
        <SelectTrigger size="sm" className="w-[150px]">
          <SelectValue placeholder="Small" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="1">オプション 1</SelectItem>
          <SelectItem value="2">オプション 2</SelectItem>
          <SelectItem value="3">オプション 3</SelectItem>
        </SelectContent>
      </Select>

      <Select>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Default" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="1">オプション 1</SelectItem>
          <SelectItem value="2">オプション 2</SelectItem>
          <SelectItem value="3">オプション 3</SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
}

export const WithIcon: StoryObj = {
  render: () => (
    <Select defaultValue="ja">
      <SelectTrigger className="w-[200px]">
        <Globe className="size-4 mr-2 text-muted-foreground" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="ja">日本語</SelectItem>
        <SelectItem value="en">English</SelectItem>
        <SelectItem value="zh">中文</SelectItem>
        <SelectItem value="ko">한국어</SelectItem>
      </SelectContent>
    </Select>
  ),
}

export const FormExample: StoryObj = {
  render: () => (
    <div className="space-y-4 w-[300px]">
      <div className="grid gap-2">
        <Label>国</Label>
        <Select defaultValue="jp">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="jp">日本</SelectItem>
            <SelectItem value="us">アメリカ</SelectItem>
            <SelectItem value="uk">イギリス</SelectItem>
            <SelectItem value="de">ドイツ</SelectItem>
            <SelectItem value="fr">フランス</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label>都道府県</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="都道府県を選択" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>関東</SelectLabel>
              <SelectItem value="tokyo">東京都</SelectItem>
              <SelectItem value="kanagawa">神奈川県</SelectItem>
              <SelectItem value="chiba">千葉県</SelectItem>
              <SelectItem value="saitama">埼玉県</SelectItem>
            </SelectGroup>
            <SelectSeparator />
            <SelectGroup>
              <SelectLabel>関西</SelectLabel>
              <SelectItem value="osaka">大阪府</SelectItem>
              <SelectItem value="kyoto">京都府</SelectItem>
              <SelectItem value="hyogo">兵庫県</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label>配送方法</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="配送方法を選択" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="standard">
              通常配送（3-5営業日）
            </SelectItem>
            <SelectItem value="express">
              速達（1-2営業日）
            </SelectItem>
            <SelectItem value="overnight">
              翌日配送
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  ),
}

export const Controlled: StoryObj = {
  render: () => {
    const [value, setValue] = React.useState("")

    return (
      <div className="space-y-4">
        <Select value={value} onValueChange={setValue}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="ステータスを選択" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="draft">下書き</SelectItem>
            <SelectItem value="pending">保留中</SelectItem>
            <SelectItem value="published">公開済み</SelectItem>
            <SelectItem value="archived">アーカイブ</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">
          選択された値: {value || "なし"}
        </p>
      </div>
    )
  },
}
