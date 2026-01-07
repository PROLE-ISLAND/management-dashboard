import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import * as React from "react"
import { Volume2, VolumeX } from "lucide-react"

import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"

const meta = {
  title: "Forms/Slider",
  component: Slider,
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
} satisfies Meta<typeof Slider>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    defaultValue: [50],
    max: 100,
    step: 1,
  },
}

export const WithLabel: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex justify-between">
        <Label>音量</Label>
        <span className="text-sm text-muted-foreground">50%</span>
      </div>
      <Slider defaultValue={[50]} max={100} step={1} />
    </div>
  ),
}

export const WithValue: Story = {
  render: () => {
    const [value, setValue] = React.useState([33])

    return (
      <div className="space-y-4">
        <div className="flex justify-between">
          <Label>進捗</Label>
          <span className="text-sm font-medium">{value[0]}%</span>
        </div>
        <Slider
          value={value}
          onValueChange={setValue}
          max={100}
          step={1}
        />
      </div>
    )
  },
}

export const Range: Story = {
  render: () => {
    const [value, setValue] = React.useState([25, 75])

    return (
      <div className="space-y-4">
        <div className="flex justify-between">
          <Label>価格範囲</Label>
          <span className="text-sm text-muted-foreground">
            ¥{value[0].toLocaleString()} - ¥{value[1].toLocaleString()}
          </span>
        </div>
        <Slider
          value={value}
          onValueChange={setValue}
          max={100}
          step={1}
        />
      </div>
    )
  },
}

export const Steps: Story = {
  render: () => {
    const [value, setValue] = React.useState([2])
    const steps = ["XS", "S", "M", "L", "XL"]

    return (
      <div className="space-y-4">
        <div className="flex justify-between">
          <Label>サイズ</Label>
          <span className="text-sm font-medium">{steps[value[0]]}</span>
        </div>
        <Slider
          value={value}
          onValueChange={setValue}
          max={4}
          step={1}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          {steps.map((step) => (
            <span key={step}>{step}</span>
          ))}
        </div>
      </div>
    )
  },
}

export const VolumeControl: Story = {
  render: () => {
    const [value, setValue] = React.useState([70])
    const isMuted = value[0] === 0

    return (
      <div className="flex items-center gap-3">
        <button
          onClick={() => setValue(isMuted ? [70] : [0])}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          {isMuted ? (
            <VolumeX className="size-5" />
          ) : (
            <Volume2 className="size-5" />
          )}
        </button>
        <Slider
          value={value}
          onValueChange={setValue}
          max={100}
          step={1}
          className="flex-1"
        />
        <span className="text-sm text-muted-foreground w-8 text-right">
          {value[0]}
        </span>
      </div>
    )
  },
}

export const PriceFilter: Story = {
  render: () => {
    const [value, setValue] = React.useState([1000, 8000])
    const min = 0
    const max = 10000

    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>価格フィルター</Label>
          <p className="text-sm text-muted-foreground">
            ¥{value[0].toLocaleString()} から ¥{value[1].toLocaleString()}
          </p>
        </div>
        <Slider
          value={value}
          onValueChange={setValue}
          min={min}
          max={max}
          step={100}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>¥{min.toLocaleString()}</span>
          <span>¥{max.toLocaleString()}</span>
        </div>
      </div>
    )
  },
}

export const BudgetAllocation: Story = {
  render: () => {
    const [marketing, setMarketing] = React.useState([30])
    const [development, setDevelopment] = React.useState([50])
    const [operations, setOperations] = React.useState([20])

    const total = marketing[0] + development[0] + operations[0]

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Label className="text-base">予算配分</Label>
          <span className={`text-sm font-medium ${total !== 100 ? "text-destructive" : "text-emerald-400"}`}>
            合計: {total}%
          </span>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>マーケティング</span>
              <span className="font-medium">{marketing[0]}%</span>
            </div>
            <Slider value={marketing} onValueChange={setMarketing} max={100} step={5} />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>開発</span>
              <span className="font-medium">{development[0]}%</span>
            </div>
            <Slider value={development} onValueChange={setDevelopment} max={100} step={5} />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>運用</span>
              <span className="font-medium">{operations[0]}%</span>
            </div>
            <Slider value={operations} onValueChange={setOperations} max={100} step={5} />
          </div>
        </div>
      </div>
    )
  },
}

export const Disabled: Story = {
  args: {
    defaultValue: [50],
    max: 100,
    disabled: true,
  },
}
