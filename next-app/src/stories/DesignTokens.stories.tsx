import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import * as React from "react"

const meta = {
  title: "Foundation/DesignTokens",
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta

export default meta

// Color Palette
export const ColorPalette: StoryObj = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold mb-4">基本カラー</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <ColorSwatch name="Background" className="bg-background" />
          <ColorSwatch name="Foreground" className="bg-foreground" textClass="text-background" />
          <ColorSwatch name="Card" className="bg-card" />
          <ColorSwatch name="Popover" className="bg-popover" />
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">アクセントカラー</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <ColorSwatch name="Primary" className="bg-primary" textClass="text-primary-foreground" />
          <ColorSwatch name="Secondary" className="bg-secondary" />
          <ColorSwatch name="Accent" className="bg-accent" />
          <ColorSwatch name="Muted" className="bg-muted" />
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">セマンティックカラー</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <ColorSwatch name="Destructive" className="bg-destructive" textClass="text-destructive-foreground" />
          <ColorSwatch name="Success" className="bg-emerald-500" textClass="text-white" />
          <ColorSwatch name="Warning" className="bg-yellow-500" textClass="text-black" />
          <ColorSwatch name="Info" className="bg-blue-500" textClass="text-white" />
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">チャートカラー</h2>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
          <ColorSwatch name="Chart 1" className="bg-[hsl(270,80%,60%)]" textClass="text-white" />
          <ColorSwatch name="Chart 2" className="bg-[hsl(250,70%,55%)]" textClass="text-white" />
          <ColorSwatch name="Chart 3" className="bg-[hsl(160,60%,50%)]" textClass="text-white" />
          <ColorSwatch name="Chart 4" className="bg-[hsl(45,90%,55%)]" textClass="text-black" />
          <ColorSwatch name="Chart 5" className="bg-[hsl(200,70%,55%)]" textClass="text-white" />
          <ColorSwatch name="Chart 6" className="bg-[hsl(0,70%,55%)]" textClass="text-white" />
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">ボーダー & リング</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <ColorSwatch name="Border" className="bg-border" />
          <ColorSwatch name="Input" className="bg-input" />
          <ColorSwatch name="Ring" className="bg-ring" />
        </div>
      </div>
    </div>
  ),
}

function ColorSwatch({
  name,
  className,
  textClass = "text-foreground",
}: {
  name: string
  className: string
  textClass?: string
}) {
  return (
    <div className="space-y-2">
      <div className={`h-20 rounded-lg border border-white/10 ${className}`} />
      <p className="text-sm font-medium">{name}</p>
    </div>
  )
}

// Typography
export const Typography: StoryObj = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold mb-4">見出し</h2>
        <div className="space-y-4">
          <div className="space-y-1">
            <h1 className="text-4xl font-bold tracking-tight">見出し1 (4xl/bold)</h1>
            <p className="text-xs text-muted-foreground">text-4xl font-bold tracking-tight</p>
          </div>
          <div className="space-y-1">
            <h2 className="text-3xl font-semibold tracking-tight">見出し2 (3xl/semibold)</h2>
            <p className="text-xs text-muted-foreground">text-3xl font-semibold tracking-tight</p>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-semibold tracking-tight">見出し3 (2xl/semibold)</h3>
            <p className="text-xs text-muted-foreground">text-2xl font-semibold tracking-tight</p>
          </div>
          <div className="space-y-1">
            <h4 className="text-xl font-semibold tracking-tight">見出し4 (xl/semibold)</h4>
            <p className="text-xs text-muted-foreground">text-xl font-semibold tracking-tight</p>
          </div>
          <div className="space-y-1">
            <h5 className="text-lg font-medium">見出し5 (lg/medium)</h5>
            <p className="text-xs text-muted-foreground">text-lg font-medium</p>
          </div>
          <div className="space-y-1">
            <h6 className="text-base font-medium">見出し6 (base/medium)</h6>
            <p className="text-xs text-muted-foreground">text-base font-medium</p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">本文</h2>
        <div className="space-y-4">
          <div className="space-y-1">
            <p className="text-lg">大きな本文 (lg)</p>
            <p className="text-xs text-muted-foreground">text-lg</p>
          </div>
          <div className="space-y-1">
            <p className="text-base">標準の本文 (base)</p>
            <p className="text-xs text-muted-foreground">text-base</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm">小さな本文 (sm)</p>
            <p className="text-xs text-muted-foreground">text-sm</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs">最小の本文 (xs)</p>
            <p className="text-xs text-muted-foreground">text-xs</p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">テキストカラー</h2>
        <div className="space-y-2">
          <p className="text-foreground">Foreground - 主要テキスト</p>
          <p className="text-muted-foreground">Muted Foreground - 補助テキスト</p>
          <p className="text-primary">Primary - アクセント</p>
          <p className="text-destructive">Destructive - エラー</p>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">フォントウェイト</h2>
        <div className="space-y-2">
          <p className="font-light">Light (300)</p>
          <p className="font-normal">Normal (400)</p>
          <p className="font-medium">Medium (500)</p>
          <p className="font-semibold">Semibold (600)</p>
          <p className="font-bold">Bold (700)</p>
        </div>
      </div>
    </div>
  ),
}

// Spacing
export const Spacing: StoryObj = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold mb-4">スペーシングスケール</h2>
        <div className="space-y-3">
          {[
            { name: "0.5", value: "0.125rem (2px)", className: "w-0.5" },
            { name: "1", value: "0.25rem (4px)", className: "w-1" },
            { name: "2", value: "0.5rem (8px)", className: "w-2" },
            { name: "3", value: "0.75rem (12px)", className: "w-3" },
            { name: "4", value: "1rem (16px)", className: "w-4" },
            { name: "6", value: "1.5rem (24px)", className: "w-6" },
            { name: "8", value: "2rem (32px)", className: "w-8" },
            { name: "12", value: "3rem (48px)", className: "w-12" },
            { name: "16", value: "4rem (64px)", className: "w-16" },
            { name: "24", value: "6rem (96px)", className: "w-24" },
          ].map((space) => (
            <div key={space.name} className="flex items-center gap-4">
              <div className={`h-4 bg-primary rounded ${space.className}`} />
              <span className="text-sm font-mono w-8">{space.name}</span>
              <span className="text-sm text-muted-foreground">{space.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  ),
}

// Border Radius
export const BorderRadius: StoryObj = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold mb-4">角丸</h2>
        <div className="flex flex-wrap gap-4">
          {[
            { name: "none", className: "rounded-none" },
            { name: "sm", className: "rounded-sm" },
            { name: "md", className: "rounded-md" },
            { name: "lg", className: "rounded-lg" },
            { name: "xl", className: "rounded-xl" },
            { name: "2xl", className: "rounded-2xl" },
            { name: "full", className: "rounded-full" },
          ].map((radius) => (
            <div key={radius.name} className="flex flex-col items-center gap-2">
              <div
                className={`size-16 bg-primary/20 border border-primary ${radius.className}`}
              />
              <span className="text-xs text-muted-foreground">{radius.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  ),
}

// Shadows
export const Shadows: StoryObj = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold mb-4">シャドウ</h2>
        <div className="flex flex-wrap gap-6">
          {[
            { name: "sm", className: "shadow-sm" },
            { name: "default", className: "shadow" },
            { name: "md", className: "shadow-md" },
            { name: "lg", className: "shadow-lg" },
            { name: "xl", className: "shadow-xl" },
            { name: "2xl", className: "shadow-2xl" },
          ].map((shadow) => (
            <div key={shadow.name} className="flex flex-col items-center gap-2">
              <div
                className={`size-20 bg-card rounded-lg border border-white/10 ${shadow.className}`}
              />
              <span className="text-xs text-muted-foreground">{shadow.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  ),
}

// Animation
export const Animation: StoryObj = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold mb-4">アニメーション</h2>
        <div className="flex flex-wrap gap-8">
          <div className="flex flex-col items-center gap-2">
            <div className="size-12 bg-primary rounded-lg animate-pulse" />
            <span className="text-xs text-muted-foreground">pulse</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="size-12 bg-primary rounded-lg animate-bounce" />
            <span className="text-xs text-muted-foreground">bounce</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="size-12 bg-primary rounded-full animate-spin" />
            <span className="text-xs text-muted-foreground">spin</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="size-12 bg-primary rounded-lg animate-ping" />
            <span className="text-xs text-muted-foreground">ping</span>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">トランジション</h2>
        <div className="flex flex-wrap gap-4">
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg transition-all hover:scale-105">
            Scale
          </button>
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg transition-all hover:opacity-80">
            Opacity
          </button>
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg transition-all hover:bg-primary/80">
            Background
          </button>
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg transition-all hover:shadow-lg">
            Shadow
          </button>
        </div>
      </div>
    </div>
  ),
}
