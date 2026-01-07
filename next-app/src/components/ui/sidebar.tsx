"use client"

import * as React from "react"
import Link from "next/link"
import { cva, type VariantProps } from "class-variance-authority"
import {
  ChevronLeft,
  ChevronRight,
  Home,
  BarChart3,
  Users,
  Settings,
  Folder,
  type LucideIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "./button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip"
import { ScrollArea } from "./scroll-area"

const sidebarVariants = cva(
  "flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out",
  {
    variants: {
      collapsed: {
        true: "w-16",
        false: "w-64",
      },
    },
    defaultVariants: {
      collapsed: false,
    },
  }
)

interface SidebarContextValue {
  collapsed: boolean
  setCollapsed: (collapsed: boolean) => void
}

const SidebarContext = React.createContext<SidebarContextValue | undefined>(undefined)

function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}

interface SidebarProviderProps {
  children: React.ReactNode
  defaultCollapsed?: boolean
}

function SidebarProvider({ children, defaultCollapsed = false }: SidebarProviderProps) {
  const [collapsed, setCollapsed] = React.useState(defaultCollapsed)

  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed }}>
      <TooltipProvider delayDuration={0}>{children}</TooltipProvider>
    </SidebarContext.Provider>
  )
}

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  collapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
}

function Sidebar({ className, collapsed: controlledCollapsed, onCollapsedChange, children, ...props }: SidebarProps) {
  const context = React.useContext(SidebarContext)
  const collapsed = controlledCollapsed ?? context?.collapsed ?? false
  const setCollapsed = onCollapsedChange ?? context?.setCollapsed ?? (() => {})

  return (
    <aside className={cn(sidebarVariants({ collapsed }), className)} {...props}>
      {children}
      <div className="mt-auto p-2 border-t border-sidebar-border">
        <Button
          variant="ghost"
          size="icon"
          className="w-full"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
        </Button>
      </div>
    </aside>
  )
}

function SidebarHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const { collapsed } = useSidebar()

  return (
    <div
      className={cn(
        "flex items-center h-14 px-4 border-b border-sidebar-border shrink-0",
        collapsed && "justify-center px-2",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

function SidebarContent({ className, children }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <ScrollArea className={cn("flex-1 py-2", className)}>
      {children}
    </ScrollArea>
  )
}

function SidebarGroup({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("px-2 py-2", className)} {...props}>
      {children}
    </div>
  )
}

function SidebarGroupLabel({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const { collapsed } = useSidebar()

  if (collapsed) return null

  return (
    <div
      className={cn("px-2 py-1 text-xs font-medium text-sidebar-foreground/60 uppercase tracking-wider", className)}
      {...props}
    >
      {children}
    </div>
  )
}

interface SidebarItemProps extends React.HTMLAttributes<HTMLAnchorElement> {
  href?: string
  icon?: LucideIcon
  active?: boolean
  badge?: string | number
}

function SidebarItem({
  className,
  href = "#",
  icon: Icon,
  active = false,
  badge,
  children,
  ...props
}: SidebarItemProps) {
  const { collapsed } = useSidebar()

  const content = (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
        "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent",
        active && "bg-sidebar-accent text-sidebar-foreground",
        collapsed && "justify-center px-2",
        className
      )}
      {...props}
    >
      {Icon && <Icon className="size-4 shrink-0" />}
      {!collapsed && <span className="flex-1 truncate">{children}</span>}
      {!collapsed && badge && (
        <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium rounded-full bg-primary/20 text-primary">
          {badge}
        </span>
      )}
    </Link>
  )

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="right">
          <p>{children}</p>
          {badge && <span className="ml-2 text-xs opacity-70">({badge})</span>}
        </TooltipContent>
      </Tooltip>
    )
  }

  return content
}

function SidebarFooter({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("p-2 border-t border-sidebar-border", className)} {...props}>
      {children}
    </div>
  )
}

// Pre-built sidebar with common navigation
interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  badge?: string | number
}

interface SidebarNavProps {
  logo?: React.ReactNode
  collapsedLogo?: React.ReactNode
  items?: NavItem[]
  activeHref?: string
  footer?: React.ReactNode
}

function SidebarNav({
  logo = "Dashboard",
  collapsedLogo = "D",
  items = defaultNavItems,
  activeHref = "/",
  footer,
}: SidebarNavProps) {
  const { collapsed } = useSidebar()

  return (
    <Sidebar>
      <SidebarHeader>
        {collapsed ? (
          <span className="text-lg font-bold">{collapsedLogo}</span>
        ) : (
          <span className="text-lg font-semibold">{logo}</span>
        )}
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>メニュー</SidebarGroupLabel>
          {items.map((item) => (
            <SidebarItem
              key={item.href}
              href={item.href}
              icon={item.icon}
              active={activeHref === item.href}
              badge={item.badge}
            >
              {item.label}
            </SidebarItem>
          ))}
        </SidebarGroup>
      </SidebarContent>
      {footer && <SidebarFooter>{footer}</SidebarFooter>}
    </Sidebar>
  )
}

const defaultNavItems: NavItem[] = [
  { label: "ダッシュボード", href: "/", icon: Home },
  { label: "分析", href: "/analytics", icon: BarChart3, badge: "New" },
  { label: "プロジェクト", href: "/projects", icon: Folder },
  { label: "チーム", href: "/team", icon: Users },
  { label: "設定", href: "/settings", icon: Settings },
]

export {
  Sidebar,
  SidebarProvider,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarItem,
  SidebarFooter,
  SidebarNav,
  useSidebar,
  type NavItem,
}
