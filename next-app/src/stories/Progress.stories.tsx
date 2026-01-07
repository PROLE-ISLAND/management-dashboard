import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import * as React from "react"
import { CheckCircle2, Upload, Download } from "lucide-react"

import { Progress } from "@/components/ui/progress"

const meta: Meta<typeof Progress> = {
  title: "Feedback/Progress",
  component: Progress,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-[400px]">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    value: 60,
  },
}

export const Values: StoryObj = {
  render: () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>0%</span>
        </div>
        <Progress value={0} />
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>25%</span>
        </div>
        <Progress value={25} />
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>50%</span>
        </div>
        <Progress value={50} />
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>75%</span>
        </div>
        <Progress value={75} />
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>100%</span>
        </div>
        <Progress value={100} />
      </div>
    </div>
  ),
}

export const WithLabel: StoryObj = {
  render: () => (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span>進捗状況</span>
        <span className="text-muted-foreground">66%</span>
      </div>
      <Progress value={66} />
    </div>
  ),
}

export const Animated: StoryObj = {
  render: () => {
    const [progress, setProgress] = React.useState(0)

    React.useEffect(() => {
      const timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            return 0
          }
          return prev + 10
        })
      }, 500)

      return () => clearInterval(timer)
    }, [])

    return (
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>読み込み中...</span>
          <span className="text-muted-foreground">{progress}%</span>
        </div>
        <Progress value={progress} />
      </div>
    )
  },
}

export const FileUpload: StoryObj = {
  render: () => {
    const [progress, setProgress] = React.useState(0)
    const [status, setStatus] = React.useState<"idle" | "uploading" | "complete">("idle")

    const startUpload = () => {
      setStatus("uploading")
      setProgress(0)
      const timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(timer)
            setStatus("complete")
            return 100
          }
          return prev + Math.random() * 15
        })
      }, 200)
    }

    return (
      <div className="space-y-4">
        <div className="rounded-lg border p-4 space-y-3">
          <div className="flex items-center gap-3">
            {status === "complete" ? (
              <CheckCircle2 className="size-5 text-emerald-500" />
            ) : (
              <Upload className="size-5 text-muted-foreground" />
            )}
            <div className="flex-1">
              <p className="text-sm font-medium">document.pdf</p>
              <p className="text-xs text-muted-foreground">
                {status === "idle" && "アップロード待ち"}
                {status === "uploading" && `アップロード中... ${Math.round(progress)}%`}
                {status === "complete" && "アップロード完了"}
              </p>
            </div>
          </div>
          {status === "uploading" && <Progress value={progress} />}
        </div>
        <button
          onClick={startUpload}
          disabled={status === "uploading"}
          className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md disabled:opacity-50"
        >
          {status === "complete" ? "再アップロード" : "アップロード開始"}
        </button>
      </div>
    )
  },
}

export const MultipleProgress: StoryObj = {
  render: () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Download className="size-4 text-muted-foreground" />
            <span>file1.zip</span>
          </div>
          <span className="text-muted-foreground">100%</span>
        </div>
        <Progress value={100} />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Download className="size-4 text-muted-foreground" />
            <span>file2.zip</span>
          </div>
          <span className="text-muted-foreground">75%</span>
        </div>
        <Progress value={75} />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Download className="size-4 text-muted-foreground" />
            <span>file3.zip</span>
          </div>
          <span className="text-muted-foreground">30%</span>
        </div>
        <Progress value={30} />
      </div>
    </div>
  ),
}

export const StorageUsage: StoryObj = {
  render: () => {
    const used = 7.2
    const total = 10
    const percentage = (used / total) * 100

    return (
      <div className="rounded-lg border p-4 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">ストレージ使用量</span>
          <span className="text-xs text-muted-foreground">
            {used} GB / {total} GB
          </span>
        </div>
        <Progress value={percentage} />
        <p className="text-xs text-muted-foreground">
          残り {(total - used).toFixed(1)} GB 使用可能
        </p>
      </div>
    )
  },
}

export const StepProgress: StoryObj = {
  render: () => {
    const steps = ["情報入力", "確認", "完了"]
    const currentStep = 1

    return (
      <div className="space-y-4">
        <Progress value={(currentStep / (steps.length - 1)) * 100} />
        <div className="flex justify-between">
          {steps.map((step, index) => (
            <div
              key={step}
              className={`text-xs ${
                index <= currentStep ? "text-primary font-medium" : "text-muted-foreground"
              }`}
            >
              {step}
            </div>
          ))}
        </div>
      </div>
    )
  },
}
