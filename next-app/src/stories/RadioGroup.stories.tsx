import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import * as React from "react"

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

const meta = {
  title: "Forms/RadioGroup",
  component: RadioGroup,
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
} satisfies Meta<typeof RadioGroup>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <RadioGroup defaultValue="option-1">
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option-1" id="option-1" />
        <Label htmlFor="option-1">オプション1</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option-2" id="option-2" />
        <Label htmlFor="option-2">オプション2</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option-3" id="option-3" />
        <Label htmlFor="option-3">オプション3</Label>
      </div>
    </RadioGroup>
  ),
}

export const WithLabel: Story = {
  render: () => (
    <div className="space-y-3">
      <Label className="text-base">お支払い方法</Label>
      <RadioGroup defaultValue="card">
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="card" id="card" />
          <Label htmlFor="card">クレジットカード</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="bank" id="bank" />
          <Label htmlFor="bank">銀行振込</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="convenience" id="convenience" />
          <Label htmlFor="convenience">コンビニ払い</Label>
        </div>
      </RadioGroup>
    </div>
  ),
}

export const WithDescription: Story = {
  render: () => (
    <div className="space-y-3">
      <Label className="text-base">プランを選択</Label>
      <RadioGroup defaultValue="basic" className="space-y-3">
        <div className="flex items-start space-x-3">
          <RadioGroupItem value="basic" id="basic" className="mt-1" />
          <div className="space-y-1">
            <Label htmlFor="basic" className="font-medium">
              ベーシック - ¥1,000/月
            </Label>
            <p className="text-sm text-muted-foreground">
              個人利用に最適。基本機能がすべて使えます。
            </p>
          </div>
        </div>
        <div className="flex items-start space-x-3">
          <RadioGroupItem value="pro" id="pro" className="mt-1" />
          <div className="space-y-1">
            <Label htmlFor="pro" className="font-medium">
              プロ - ¥3,000/月
            </Label>
            <p className="text-sm text-muted-foreground">
              チーム向け。高度な機能と優先サポート付き。
            </p>
          </div>
        </div>
        <div className="flex items-start space-x-3">
          <RadioGroupItem value="enterprise" id="enterprise" className="mt-1" />
          <div className="space-y-1">
            <Label htmlFor="enterprise" className="font-medium">
              エンタープライズ - 要相談
            </Label>
            <p className="text-sm text-muted-foreground">
              大規模組織向け。カスタマイズと専任サポート。
            </p>
          </div>
        </div>
      </RadioGroup>
    </div>
  ),
}

export const Horizontal: Story = {
  render: () => (
    <div className="space-y-3">
      <Label className="text-base">サイズ</Label>
      <RadioGroup defaultValue="m" className="flex gap-4">
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="s" id="size-s" />
          <Label htmlFor="size-s">S</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="m" id="size-m" />
          <Label htmlFor="size-m">M</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="l" id="size-l" />
          <Label htmlFor="size-l">L</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="xl" id="size-xl" />
          <Label htmlFor="size-xl">XL</Label>
        </div>
      </RadioGroup>
    </div>
  ),
}

export const WithDisabled: Story = {
  render: () => (
    <RadioGroup defaultValue="option-1">
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option-1" id="d-option-1" />
        <Label htmlFor="d-option-1">利用可能</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option-2" id="d-option-2" />
        <Label htmlFor="d-option-2">利用可能</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option-3" id="d-option-3" disabled />
        <Label htmlFor="d-option-3" className="text-muted-foreground">
          利用不可（準備中）
        </Label>
      </div>
    </RadioGroup>
  ),
}

export const CardStyle: Story = {
  render: () => {
    const [selected, setSelected] = React.useState("standard")

    return (
      <div className="space-y-3">
        <Label className="text-base">配送方法</Label>
        <RadioGroup value={selected} onValueChange={setSelected} className="space-y-2">
          {[
            {
              value: "standard",
              title: "通常配送",
              description: "3-5営業日でお届け",
              price: "無料",
            },
            {
              value: "express",
              title: "お急ぎ便",
              description: "1-2営業日でお届け",
              price: "¥500",
            },
            {
              value: "same-day",
              title: "当日配送",
              description: "本日中にお届け",
              price: "¥1,000",
            },
          ].map((option) => (
            <div
              key={option.value}
              className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-colors ${
                selected === option.value
                  ? "border-primary bg-primary/5"
                  : "border-white/10 hover:border-white/20"
              }`}
              onClick={() => setSelected(option.value)}
            >
              <div className="flex items-center gap-3">
                <RadioGroupItem value={option.value} id={option.value} />
                <div>
                  <Label htmlFor={option.value} className="font-medium cursor-pointer">
                    {option.title}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {option.description}
                  </p>
                </div>
              </div>
              <span className="text-sm font-medium">{option.price}</span>
            </div>
          ))}
        </RadioGroup>
      </div>
    )
  },
}

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = React.useState("a")

    return (
      <div className="space-y-4">
        <RadioGroup value={value} onValueChange={setValue}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="a" id="c-a" />
            <Label htmlFor="c-a">オプションA</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="b" id="c-b" />
            <Label htmlFor="c-b">オプションB</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="c" id="c-c" />
            <Label htmlFor="c-c">オプションC</Label>
          </div>
        </RadioGroup>
        <p className="text-sm text-muted-foreground">
          選択中: <span className="font-medium text-foreground">{value}</span>
        </p>
      </div>
    )
  },
}
