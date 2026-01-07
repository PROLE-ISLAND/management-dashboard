"use client"

import * as React from "react"
import Link from "next/link"
import { ChevronRight, Home, MoreHorizontal } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu"

interface BreadcrumbItem {
  label: string
  href?: string
  icon?: React.ReactNode
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  separator?: React.ReactNode
  maxItems?: number
  showHomeIcon?: boolean
  className?: string
}

function Breadcrumb({
  items,
  separator,
  maxItems = 4,
  showHomeIcon = true,
  className,
}: BreadcrumbProps) {
  const needsCollapse = items.length > maxItems

  // If we need to collapse, show first, ellipsis, and last (maxItems - 1) items
  const visibleItems = needsCollapse
    ? [items[0], ...items.slice(-(maxItems - 1))]
    : items

  const collapsedItems = needsCollapse
    ? items.slice(1, -(maxItems - 1))
    : []

  return (
    <nav aria-label="パンくずリスト" className={cn("flex items-center", className)}>
      <ol className="flex items-center gap-1.5 text-sm">
        {visibleItems.map((item, index) => {
          const isFirst = index === 0
          const isLast = index === visibleItems.length - 1
          const showCollapsedMenu = needsCollapse && index === 1

          return (
            <React.Fragment key={item.label}>
              {/* Collapsed items dropdown */}
              {showCollapsedMenu && (
                <>
                  <li>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
                        <MoreHorizontal className="size-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        {collapsedItems.map((collapsedItem) => (
                          <DropdownMenuItem key={collapsedItem.label} asChild>
                            {collapsedItem.href ? (
                              <Link href={collapsedItem.href}>
                                {collapsedItem.label}
                              </Link>
                            ) : (
                              <span>{collapsedItem.label}</span>
                            )}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </li>
                  <BreadcrumbSeparator separator={separator} />
                </>
              )}

              {/* Regular item */}
              <li className="flex items-center">
                {item.href && !isLast ? (
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors",
                      isFirst && showHomeIcon && "gap-1"
                    )}
                  >
                    {isFirst && showHomeIcon && <Home className="size-3.5" />}
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                ) : (
                  <span
                    className={cn(
                      "flex items-center gap-1.5",
                      isLast ? "text-foreground font-medium" : "text-muted-foreground"
                    )}
                    aria-current={isLast ? "page" : undefined}
                  >
                    {isFirst && showHomeIcon && !item.href && (
                      <Home className="size-3.5" />
                    )}
                    {item.icon}
                    <span>{item.label}</span>
                  </span>
                )}
              </li>

              {/* Separator */}
              {!isLast && <BreadcrumbSeparator separator={separator} />}
            </React.Fragment>
          )
        })}
      </ol>
    </nav>
  )
}

function BreadcrumbSeparator({
  separator,
}: {
  separator?: React.ReactNode
}) {
  return (
    <li role="presentation" aria-hidden="true" className="text-muted-foreground/50">
      {separator || <ChevronRight className="size-3.5" />}
    </li>
  )
}

// Helper component for building breadcrumbs
interface BreadcrumbBuilderProps {
  children: React.ReactNode
  separator?: React.ReactNode
  className?: string
}

function BreadcrumbList({ children, separator, className }: BreadcrumbBuilderProps) {
  const items = React.Children.toArray(children)

  return (
    <nav aria-label="パンくずリスト" className={cn("flex items-center", className)}>
      <ol className="flex items-center gap-1.5 text-sm">
        {items.map((child, index) => (
          <React.Fragment key={index}>
            <li>{child}</li>
            {index < items.length - 1 && <BreadcrumbSeparator separator={separator} />}
          </React.Fragment>
        ))}
      </ol>
    </nav>
  )
}

function BreadcrumbLink({
  href,
  children,
  className,
}: {
  href: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <Link
      href={href}
      className={cn(
        "text-muted-foreground hover:text-foreground transition-colors",
        className
      )}
    >
      {children}
    </Link>
  )
}

function BreadcrumbPage({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <span
      className={cn("text-foreground font-medium", className)}
      aria-current="page"
    >
      {children}
    </span>
  )
}

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  type BreadcrumbItem,
}
