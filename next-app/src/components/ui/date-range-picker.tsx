"use client"

import * as React from "react"
import { format, subDays, startOfMonth, endOfMonth, startOfYear, subMonths } from "date-fns"
import { ja } from "date-fns/locale"
import { Calendar as CalendarIcon, ChevronDown } from "lucide-react"
import type { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "./button"
import { Calendar } from "./calendar"
import { Popover, PopoverContent, PopoverTrigger } from "./popover"

interface DateRangePickerProps {
  value?: DateRange
  onChange?: (range: DateRange | undefined) => void
  placeholder?: string
  presets?: DateRangePreset[]
  align?: "start" | "center" | "end"
  className?: string
}

interface DateRangePreset {
  label: string
  getValue: () => DateRange
}

const defaultPresets: DateRangePreset[] = [
  {
    label: "今日",
    getValue: () => ({ from: new Date(), to: new Date() }),
  },
  {
    label: "過去7日間",
    getValue: () => ({ from: subDays(new Date(), 6), to: new Date() }),
  },
  {
    label: "過去30日間",
    getValue: () => ({ from: subDays(new Date(), 29), to: new Date() }),
  },
  {
    label: "今月",
    getValue: () => ({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) }),
  },
  {
    label: "先月",
    getValue: () => {
      const lastMonth = subMonths(new Date(), 1)
      return { from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) }
    },
  },
  {
    label: "過去3ヶ月",
    getValue: () => ({ from: subMonths(new Date(), 3), to: new Date() }),
  },
  {
    label: "今年",
    getValue: () => ({ from: startOfYear(new Date()), to: new Date() }),
  },
]

function DateRangePicker({
  value,
  onChange,
  placeholder = "期間を選択",
  presets = defaultPresets,
  align = "start",
  className,
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false)

  const formatDateRange = (range: DateRange | undefined) => {
    if (!range?.from) return placeholder
    if (!range.to) return format(range.from, "yyyy/MM/dd", { locale: ja })
    return `${format(range.from, "yyyy/MM/dd", { locale: ja })} - ${format(range.to, "yyyy/MM/dd", { locale: ja })}`
  }

  const handlePresetClick = (preset: DateRangePreset) => {
    onChange?.(preset.getValue())
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "justify-start text-left font-normal min-w-[240px]",
            !value?.from && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 size-4" />
          <span className="flex-1">{formatDateRange(value)}</span>
          <ChevronDown className="ml-2 size-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align={align}>
        <div className="flex">
          {/* Presets */}
          <div className="border-r border-border p-2 space-y-1 hidden sm:block">
            {presets.map((preset) => (
              <Button
                key={preset.label}
                variant="ghost"
                size="sm"
                className="w-full justify-start text-xs"
                onClick={() => handlePresetClick(preset)}
              >
                {preset.label}
              </Button>
            ))}
          </div>
          {/* Calendar */}
          <div className="p-3">
            <Calendar
              mode="range"
              selected={value}
              onSelect={onChange}
              numberOfMonths={2}
              locale={ja}
              initialFocus
            />
          </div>
        </div>
        {/* Mobile presets */}
        <div className="border-t border-border p-2 sm:hidden">
          <div className="grid grid-cols-3 gap-1">
            {presets.slice(0, 6).map((preset) => (
              <Button
                key={preset.label}
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={() => handlePresetClick(preset)}
              >
                {preset.label}
              </Button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export { DateRangePicker, type DateRangePreset }
