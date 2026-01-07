"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"

const spinnerVariants = cva("animate-spin text-muted-foreground", {
  variants: {
    size: {
      xs: "size-3",
      sm: "size-4",
      default: "size-6",
      lg: "size-8",
      xl: "size-12",
    },
  },
  defaultVariants: {
    size: "default",
  },
})

interface SpinnerProps
  extends React.SVGAttributes<SVGSVGElement>,
    VariantProps<typeof spinnerVariants> {}

function Spinner({ className, size, ...props }: SpinnerProps) {
  return (
    <Loader2
      className={cn(spinnerVariants({ size }), className)}
      {...props}
    />
  )
}

// Full-page loading overlay
interface LoadingOverlayProps {
  text?: string
  className?: string
}

function LoadingOverlay({ text = "読み込み中...", className }: LoadingOverlayProps) {
  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center",
        "bg-background/80 backdrop-blur-sm",
        className
      )}
    >
      <div className="flex flex-col items-center gap-3">
        <Spinner size="lg" />
        <p className="text-sm text-muted-foreground">{text}</p>
      </div>
    </div>
  )
}

// Inline loading indicator
interface LoadingInlineProps {
  text?: string
  size?: VariantProps<typeof spinnerVariants>["size"]
  className?: string
}

function LoadingInline({
  text,
  size = "sm",
  className,
}: LoadingInlineProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Spinner size={size} />
      {text && <span className="text-sm text-muted-foreground">{text}</span>}
    </div>
  )
}

// Card/Section loading state
interface LoadingCardProps {
  text?: string
  height?: string | number
  className?: string
}

function LoadingCard({
  text = "読み込み中...",
  height = 200,
  className,
}: LoadingCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3",
        "rounded-lg border border-white/[0.06] bg-card/50",
        className
      )}
      style={{ height }}
    >
      <Spinner size="default" />
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  )
}

// Button loading state helper
interface LoadingButtonContentProps {
  loading?: boolean
  children: React.ReactNode
  loadingText?: string
}

function LoadingButtonContent({
  loading,
  children,
  loadingText,
}: LoadingButtonContentProps) {
  if (!loading) return <>{children}</>

  return (
    <>
      <Spinner size="sm" className="mr-2" />
      {loadingText || children}
    </>
  )
}

// Dots loading animation
function LoadingDots({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="size-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:-0.3s]" />
      <div className="size-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:-0.15s]" />
      <div className="size-1.5 rounded-full bg-muted-foreground animate-bounce" />
    </div>
  )
}

// Pulse loading animation (for skeleton-like content)
function LoadingPulse({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted-foreground/10",
        className
      )}
    />
  )
}

export {
  Spinner,
  LoadingOverlay,
  LoadingInline,
  LoadingCard,
  LoadingButtonContent,
  LoadingDots,
  LoadingPulse,
  spinnerVariants,
}
