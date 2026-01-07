import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import * as React from "react"
import { toast } from "sonner"
import { Bell, Check, Info, AlertTriangle, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Toaster } from "@/components/ui/sonner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

// ================== SELECT ==================
const selectMeta = {
  title: "Forms/Select",
  component: Select,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Select>

export default selectMeta

export const SelectDefault: StoryObj<typeof Select> = {
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

export const SelectWithCategories: StoryObj<typeof Select> = {
  render: () => (
    <Select>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="カテゴリ" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="dev">開発</SelectItem>
        <SelectItem value="marketing">マーケティング</SelectItem>
        <SelectItem value="design">デザイン</SelectItem>
        <SelectItem value="sales">営業</SelectItem>
        <SelectItem value="support">サポート</SelectItem>
      </SelectContent>
    </Select>
  ),
}

// ================== DIALOG ==================
export const DialogDefault: StoryObj<typeof Dialog> = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">ダイアログを開く</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>確認</DialogTitle>
          <DialogDescription>
            この操作は取り消せません。本当に実行しますか？
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline">キャンセル</Button>
          <Button>実行</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
}

export const DialogForm: StoryObj<typeof Dialog> = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>新規作成</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>プロジェクト作成</DialogTitle>
          <DialogDescription>
            新しいプロジェクトの情報を入力してください
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">プロジェクト名</Label>
            <Input id="name" placeholder="プロジェクト名を入力" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="category">カテゴリ</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="選択してください" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dev">開発</SelectItem>
                <SelectItem value="marketing">マーケティング</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button type="submit">作成</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
}

// ================== TABS ==================
export const TabsDefault: StoryObj<typeof Tabs> = {
  render: () => (
    <Tabs defaultValue="overview" className="w-[400px]">
      <TabsList>
        <TabsTrigger value="overview">概要</TabsTrigger>
        <TabsTrigger value="analytics">分析</TabsTrigger>
        <TabsTrigger value="settings">設定</TabsTrigger>
      </TabsList>
      <TabsContent value="overview" className="p-4">
        <h3 className="font-medium">概要</h3>
        <p className="text-sm text-muted-foreground mt-2">
          プロジェクトの概要情報がここに表示されます。
        </p>
      </TabsContent>
      <TabsContent value="analytics" className="p-4">
        <h3 className="font-medium">分析</h3>
        <p className="text-sm text-muted-foreground mt-2">
          詳細な分析データがここに表示されます。
        </p>
      </TabsContent>
      <TabsContent value="settings" className="p-4">
        <h3 className="font-medium">設定</h3>
        <p className="text-sm text-muted-foreground mt-2">
          プロジェクトの設定を変更できます。
        </p>
      </TabsContent>
    </Tabs>
  ),
}

// ================== TOAST ==================
export const ToastVariants: StoryObj = {
  decorators: [
    (Story) => (
      <>
        <Story />
        <Toaster richColors />
      </>
    ),
  ],
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Button onClick={() => toast("デフォルト通知")}>
        Default
      </Button>
      <Button onClick={() => toast.success("成功しました！")}>
        Success
      </Button>
      <Button onClick={() => toast.error("エラーが発生しました")}>
        Error
      </Button>
      <Button onClick={() => toast.warning("警告メッセージ")}>
        Warning
      </Button>
      <Button onClick={() => toast.info("お知らせ")}>
        Info
      </Button>
      <Button
        onClick={() =>
          toast("アクション付き", {
            action: {
              label: "取り消し",
              onClick: () => console.log("Undo"),
            },
          })
        }
      >
        With Action
      </Button>
    </div>
  ),
}

// ================== PROGRESS ==================
export const ProgressDefault: StoryObj<typeof Progress> = {
  render: () => {
    const [progress, setProgress] = React.useState(33)

    React.useEffect(() => {
      const timer = setInterval(() => {
        setProgress((prev) => (prev >= 100 ? 0 : prev + 10))
      }, 1000)
      return () => clearInterval(timer)
    }, [])

    return (
      <div className="w-[300px] space-y-4">
        <Progress value={progress} />
        <p className="text-sm text-muted-foreground text-center">{progress}%</p>
      </div>
    )
  },
}

export const ProgressStates: StoryObj<typeof Progress> = {
  render: () => (
    <div className="w-[300px] space-y-4">
      <div>
        <p className="text-sm mb-2">0%</p>
        <Progress value={0} />
      </div>
      <div>
        <p className="text-sm mb-2">25%</p>
        <Progress value={25} />
      </div>
      <div>
        <p className="text-sm mb-2">50%</p>
        <Progress value={50} />
      </div>
      <div>
        <p className="text-sm mb-2">75%</p>
        <Progress value={75} />
      </div>
      <div>
        <p className="text-sm mb-2">100%</p>
        <Progress value={100} />
      </div>
    </div>
  ),
}

// ================== SKELETON ==================
export const SkeletonCard: StoryObj<typeof Skeleton> = {
  render: () => (
    <div className="flex items-center space-x-4">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
    </div>
  ),
}

export const SkeletonTable: StoryObj<typeof Skeleton> = {
  render: () => (
    <div className="space-y-3">
      <div className="flex gap-4">
        <Skeleton className="h-8 flex-1" />
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-8 w-24" />
      </div>
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
      ))}
    </div>
  ),
}

// ================== AVATAR ==================
export const AvatarVariants: StoryObj<typeof Avatar> = {
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar>
        <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
      <Avatar className="size-12">
        <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
      <Avatar className="size-16">
        <AvatarFallback className="text-lg">田中</AvatarFallback>
      </Avatar>
    </div>
  ),
}

// ================== TOOLTIP ==================
export const TooltipDefault: StoryObj = {
  render: () => (
    <TooltipProvider>
      <div className="flex gap-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon">
              <Info className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>ヘルプ情報</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon">
              <Bell className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>通知</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  ),
}

// ================== DROPDOWN ==================
export const DropdownDefault: StoryObj<typeof DropdownMenu> = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">メニュー</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>アクション</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>編集</DropdownMenuItem>
        <DropdownMenuItem>複製</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive">削除</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
}

// ================== SWITCH & CHECKBOX ==================
export const FormControls: StoryObj = {
  render: () => (
    <div className="space-y-6 w-[300px]">
      <div className="flex items-center justify-between">
        <Label htmlFor="notifications">通知を有効にする</Label>
        <Switch id="notifications" />
      </div>
      <div className="flex items-center justify-between">
        <Label htmlFor="marketing">マーケティングメール</Label>
        <Switch id="marketing" defaultChecked />
      </div>
      <div className="space-y-3">
        <Label>オプション</Label>
        <div className="flex items-center space-x-2">
          <Checkbox id="terms" />
          <label htmlFor="terms" className="text-sm">利用規約に同意する</label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="privacy" defaultChecked />
          <label htmlFor="privacy" className="text-sm">プライバシーポリシーに同意する</label>
        </div>
      </div>
    </div>
  ),
}
