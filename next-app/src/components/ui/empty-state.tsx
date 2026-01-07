"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import {
  FileX,
  Search,
  FolderOpen,
  Inbox,
  AlertCircle,
  Plus,
  type LucideIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "./button"

const emptyStateVariants = cva(
  "flex flex-col items-center justify-center text-center p-8",
  {
    variants: {
      size: {
        sm: "p-4 gap-2",
        default: "p-8 gap-4",
        lg: "p-12 gap-6",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

type EmptyStateType = "no-data" | "no-results" | "empty-folder" | "inbox" | "error" | "custom"

const iconMap: Record<EmptyStateType, LucideIcon> = {
  "no-data": FileX,
  "no-results": Search,
  "empty-folder": FolderOpen,
  inbox: Inbox,
  error: AlertCircle,
  custom: FileX,
}

const defaultMessages: Record<EmptyStateType, { title: string; description: string }> = {
  "no-data": {
    title: "データがありません",
    description: "表示するデータがまだありません。",
  },
  "no-results": {
    title: "検索結果がありません",
    description: "条件に一致するデータが見つかりませんでした。検索条件を変更してみてください。",
  },
  "empty-folder": {
    title: "フォルダが空です",
    description: "このフォルダにはまだファイルがありません。",
  },
  inbox: {
    title: "受信トレイは空です",
    description: "新しいメッセージはありません。",
  },
  error: {
    title: "エラーが発生しました",
    description: "データの取得中に問題が発生しました。再試行してください。",
  },
  custom: {
    title: "",
    description: "",
  },
}

interface EmptyStateProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof emptyStateVariants> {
  type?: EmptyStateType
  icon?: LucideIcon | React.ReactNode
  title?: string
  description?: string
  action?: {
    label: string
    onClick: () => void
    icon?: LucideIcon
  }
  secondaryAction?: {
    label: string
    onClick: () => void
  }
}

function EmptyState({
  className,
  size,
  type = "no-data",
  icon,
  title,
  description,
  action,
  secondaryAction,
  ...props
}: EmptyStateProps) {
  const defaults = defaultMessages[type]
  const IconComponent = typeof icon === "function" ? icon : iconMap[type]

  const iconSize = size === "sm" ? "size-8" : size === "lg" ? "size-16" : "size-12"
  const titleSize = size === "sm" ? "text-sm" : size === "lg" ? "text-xl" : "text-base"
  const descSize = size === "sm" ? "text-xs" : size === "lg" ? "text-base" : "text-sm"

  return (
    <div
      className={cn(emptyStateVariants({ size }), className)}
      {...props}
    >
      {/* Icon */}
      <div className={cn(
        "rounded-full bg-muted/50 p-4",
        size === "sm" && "p-2",
        size === "lg" && "p-6"
      )}>
        {typeof icon === "function" ? (
          <IconComponent className={cn(iconSize, "text-muted-foreground")} />
        ) : icon ? (
          icon
        ) : (
          <IconComponent className={cn(iconSize, "text-muted-foreground")} />
        )}
      </div>

      {/* Text */}
      <div className="space-y-1">
        <h3 className={cn("font-medium text-foreground", titleSize)}>
          {title || defaults.title}
        </h3>
        <p className={cn("text-muted-foreground max-w-sm", descSize)}>
          {description || defaults.description}
        </p>
      </div>

      {/* Actions */}
      {(action || secondaryAction) && (
        <div className="flex items-center gap-2 mt-2">
          {action && (
            <Button onClick={action.onClick} size={size === "sm" ? "sm" : "default"}>
              {action.icon && <action.icon className="mr-2 size-4" />}
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              variant="ghost"
              onClick={secondaryAction.onClick}
              size={size === "sm" ? "sm" : "default"}
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

// Specialized empty states
function NoDataState(props: Omit<EmptyStateProps, "type">) {
  return <EmptyState type="no-data" {...props} />
}

function NoResultsState(props: Omit<EmptyStateProps, "type">) {
  return <EmptyState type="no-results" {...props} />
}

function ErrorState(props: Omit<EmptyStateProps, "type">) {
  return <EmptyState type="error" {...props} />
}

export { EmptyState, NoDataState, NoResultsState, ErrorState, emptyStateVariants }
