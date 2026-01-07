"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from "lucide-react"

import { cn } from "@/lib/utils"

const alertVariants = cva(
  "relative w-full rounded-lg border px-4 py-3 text-sm [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground [&>svg~*]:pl-7",
  {
    variants: {
      variant: {
        default: "bg-card/50 border-white/10 text-foreground backdrop-blur-sm",
        info: "bg-blue-500/10 border-blue-500/20 text-blue-400 [&>svg]:text-blue-400",
        success: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 [&>svg]:text-emerald-400",
        warning: "bg-yellow-500/10 border-yellow-500/20 text-yellow-400 [&>svg]:text-yellow-400",
        destructive: "bg-red-500/10 border-red-500/20 text-red-400 [&>svg]:text-red-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const iconMap = {
  default: Info,
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  destructive: AlertCircle,
}

interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  title?: string
  onClose?: () => void
  icon?: React.ReactNode
}

function Alert({
  className,
  variant = "default",
  title,
  children,
  onClose,
  icon,
  ...props
}: AlertProps) {
  const IconComponent = iconMap[variant || "default"]

  return (
    <div
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    >
      {icon || <IconComponent className="size-4" />}
      <div className="flex-1">
        {title && <AlertTitle>{title}</AlertTitle>}
        {children && <AlertDescription>{children}</AlertDescription>}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="absolute right-2 top-2 rounded-md p-1 opacity-70 hover:opacity-100 transition-opacity"
        >
          <X className="size-4" />
          <span className="sr-only">閉じる</span>
        </button>
      )}
    </div>
  )
}

function AlertTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h5
      className={cn("mb-1 font-medium leading-none tracking-tight", className)}
      {...props}
    />
  )
}

function AlertDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <div
      className={cn("text-sm opacity-90 [&_p]:leading-relaxed", className)}
      {...props}
    />
  )
}

// Banner variant - full width, often at top of page
interface BannerProps extends AlertProps {
  action?: React.ReactNode
}

function Banner({
  className,
  variant = "info",
  title,
  children,
  onClose,
  action,
  ...props
}: BannerProps) {
  const IconComponent = iconMap[variant || "info"]

  return (
    <div
      role="alert"
      className={cn(
        "flex items-center gap-3 px-4 py-3 text-sm",
        alertVariants({ variant }),
        "rounded-none border-x-0 border-t-0",
        className
      )}
      {...props}
    >
      <IconComponent className="size-4 shrink-0" />
      <div className="flex-1 flex items-center gap-2">
        {title && <span className="font-medium">{title}</span>}
        {children && <span className="opacity-90">{children}</span>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
      {onClose && (
        <button
          onClick={onClose}
          className="shrink-0 rounded-md p-1 opacity-70 hover:opacity-100 transition-opacity"
        >
          <X className="size-4" />
          <span className="sr-only">閉じる</span>
        </button>
      )}
    </div>
  )
}

export { Alert, AlertTitle, AlertDescription, Banner, alertVariants }
