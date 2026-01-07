import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import * as React from "react"
import type { DateRange } from "react-day-picker"

import { DateRangePicker } from "@/components/ui/date-range-picker"

const meta = {
  title: "Forms/DateRangePicker",
  component: DateRangePicker,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof DateRangePicker>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const [value, setValue] = React.useState<DateRange | undefined>()
    return <DateRangePicker value={value} onChange={setValue} />
  },
}

export const WithPreselectedRange: Story = {
  render: () => {
    const [value, setValue] = React.useState<DateRange | undefined>({
      from: new Date(2024, 0, 1),
      to: new Date(2024, 0, 31),
    })
    return <DateRangePicker value={value} onChange={setValue} />
  },
}

export const CustomPlaceholder: Story = {
  render: () => {
    const [value, setValue] = React.useState<DateRange | undefined>()
    return (
      <DateRangePicker
        value={value}
        onChange={setValue}
        placeholder="日付範囲を選択してください"
      />
    )
  },
}

export const AlignEnd: Story = {
  render: () => {
    const [value, setValue] = React.useState<DateRange | undefined>()
    return (
      <div className="flex justify-end w-[500px]">
        <DateRangePicker value={value} onChange={setValue} align="end" />
      </div>
    )
  },
}
