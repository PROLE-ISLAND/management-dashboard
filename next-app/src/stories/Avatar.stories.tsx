import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import * as React from "react"
import { User, Building2 } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const meta: Meta<typeof Avatar> = {
  title: "Data Display/Avatar",
  component: Avatar,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: StoryObj = {
  render: () => (
    <Avatar>
      <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
      <AvatarFallback>CN</AvatarFallback>
    </Avatar>
  ),
}

export const WithFallback: StoryObj = {
  render: () => (
    <Avatar>
      <AvatarImage src="/broken-image.jpg" alt="User" />
      <AvatarFallback>YT</AvatarFallback>
    </Avatar>
  ),
}

export const Sizes: StoryObj = {
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar className="size-6">
        <AvatarFallback className="text-xs">XS</AvatarFallback>
      </Avatar>
      <Avatar className="size-8">
        <AvatarFallback className="text-xs">SM</AvatarFallback>
      </Avatar>
      <Avatar className="size-10">
        <AvatarFallback className="text-sm">MD</AvatarFallback>
      </Avatar>
      <Avatar className="size-12">
        <AvatarFallback>LG</AvatarFallback>
      </Avatar>
      <Avatar className="size-16">
        <AvatarFallback className="text-lg">XL</AvatarFallback>
      </Avatar>
      <Avatar className="size-20">
        <AvatarFallback className="text-xl">2XL</AvatarFallback>
      </Avatar>
    </div>
  ),
}

export const WithIcon: StoryObj = {
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar>
        <AvatarFallback>
          <User className="size-4" />
        </AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>
          <Building2 className="size-4" />
        </AvatarFallback>
      </Avatar>
    </div>
  ),
}

export const AvatarGroup: StoryObj = {
  render: () => (
    <div className="flex -space-x-3">
      <Avatar className="border-2 border-background">
        <AvatarFallback className="bg-red-500 text-white">A</AvatarFallback>
      </Avatar>
      <Avatar className="border-2 border-background">
        <AvatarFallback className="bg-blue-500 text-white">B</AvatarFallback>
      </Avatar>
      <Avatar className="border-2 border-background">
        <AvatarFallback className="bg-green-500 text-white">C</AvatarFallback>
      </Avatar>
      <Avatar className="border-2 border-background">
        <AvatarFallback className="bg-purple-500 text-white">D</AvatarFallback>
      </Avatar>
      <Avatar className="border-2 border-background">
        <AvatarFallback className="bg-muted text-muted-foreground text-xs">
          +3
        </AvatarFallback>
      </Avatar>
    </div>
  ),
}

export const WithStatus: StoryObj = {
  render: () => (
    <div className="flex items-center gap-6">
      <div className="relative">
        <Avatar>
          <AvatarFallback>ON</AvatarFallback>
        </Avatar>
        <span className="absolute bottom-0 right-0 size-3 bg-emerald-500 rounded-full border-2 border-background" />
      </div>
      <div className="relative">
        <Avatar>
          <AvatarFallback>AW</AvatarFallback>
        </Avatar>
        <span className="absolute bottom-0 right-0 size-3 bg-yellow-500 rounded-full border-2 border-background" />
      </div>
      <div className="relative">
        <Avatar>
          <AvatarFallback>OF</AvatarFallback>
        </Avatar>
        <span className="absolute bottom-0 right-0 size-3 bg-zinc-500 rounded-full border-2 border-background" />
      </div>
      <div className="relative">
        <Avatar>
          <AvatarFallback>DN</AvatarFallback>
        </Avatar>
        <span className="absolute bottom-0 right-0 size-3 bg-red-500 rounded-full border-2 border-background" />
      </div>
    </div>
  ),
}

export const UserList: StoryObj = {
  render: () => {
    const users = [
      { name: "山田 太郎", email: "yamada@example.com", initials: "YT", status: "online" },
      { name: "鈴木 花子", email: "suzuki@example.com", initials: "SH", status: "away" },
      { name: "田中 次郎", email: "tanaka@example.com", initials: "TJ", status: "offline" },
    ]

    return (
      <div className="space-y-4 w-[300px]">
        {users.map((user) => (
          <div key={user.email} className="flex items-center gap-3">
            <div className="relative">
              <Avatar>
                <AvatarFallback>{user.initials}</AvatarFallback>
              </Avatar>
              <span
                className={`absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-background ${
                  user.status === "online"
                    ? "bg-emerald-500"
                    : user.status === "away"
                    ? "bg-yellow-500"
                    : "bg-zinc-500"
                }`}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
        ))}
      </div>
    )
  },
}

export const ColoredFallbacks: StoryObj = {
  render: () => {
    const colors = [
      { bg: "bg-red-500", text: "text-white", initials: "AB" },
      { bg: "bg-orange-500", text: "text-white", initials: "CD" },
      { bg: "bg-yellow-500", text: "text-black", initials: "EF" },
      { bg: "bg-green-500", text: "text-white", initials: "GH" },
      { bg: "bg-blue-500", text: "text-white", initials: "IJ" },
      { bg: "bg-purple-500", text: "text-white", initials: "KL" },
      { bg: "bg-pink-500", text: "text-white", initials: "MN" },
    ]

    return (
      <div className="flex items-center gap-2">
        {colors.map((color, i) => (
          <Avatar key={i}>
            <AvatarFallback className={`${color.bg} ${color.text}`}>
              {color.initials}
            </AvatarFallback>
          </Avatar>
        ))}
      </div>
    )
  },
}

export const ProfileCard: StoryObj = {
  render: () => (
    <div className="rounded-lg border p-4 w-[300px]">
      <div className="flex items-center gap-4">
        <Avatar className="size-16">
          <AvatarImage src="https://github.com/shadcn.png" />
          <AvatarFallback className="text-xl">SC</AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-semibold">shadcn</h3>
          <p className="text-sm text-muted-foreground">@shadcn</p>
          <p className="text-xs text-muted-foreground mt-1">プロダクトデザイナー</p>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t flex justify-around text-center">
        <div>
          <p className="text-lg font-semibold">128</p>
          <p className="text-xs text-muted-foreground">投稿</p>
        </div>
        <div>
          <p className="text-lg font-semibold">1.2K</p>
          <p className="text-xs text-muted-foreground">フォロワー</p>
        </div>
        <div>
          <p className="text-lg font-semibold">256</p>
          <p className="text-xs text-muted-foreground">フォロー中</p>
        </div>
      </div>
    </div>
  ),
}

export const CommentThread: StoryObj = {
  render: () => (
    <div className="space-y-4 w-[350px]">
      <div className="flex gap-3">
        <Avatar className="size-8 shrink-0">
          <AvatarFallback className="text-xs">YT</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">山田 太郎</span>
            <span className="text-xs text-muted-foreground">2時間前</span>
          </div>
          <p className="text-sm mt-1">素晴らしいデザインですね！参考になります。</p>
        </div>
      </div>
      <div className="flex gap-3 ml-8">
        <Avatar className="size-8 shrink-0">
          <AvatarFallback className="text-xs">SH</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">鈴木 花子</span>
            <span className="text-xs text-muted-foreground">1時間前</span>
          </div>
          <p className="text-sm mt-1">ありがとうございます！</p>
        </div>
      </div>
    </div>
  ),
}
