"use client"

import * as React from "react"
import { Search, Bell, Menu, Command } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "./button"
import { Avatar, AvatarFallback, AvatarImage } from "./avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./dropdown-menu"
import { Badge } from "./badge"

interface HeaderProps extends React.HTMLAttributes<HTMLElement> {
  title?: string
  showSearch?: boolean
  showNotifications?: boolean
  notificationCount?: number
  onSearchClick?: () => void
  onMenuClick?: () => void
  user?: {
    name: string
    email: string
    avatar?: string
    initials?: string
  }
  onLogout?: () => void
}

function Header({
  className,
  title,
  showSearch = true,
  showNotifications = true,
  notificationCount = 0,
  onSearchClick,
  onMenuClick,
  user,
  onLogout,
  children,
  ...props
}: HeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-50 flex items-center justify-between h-14 px-4 border-b border-border bg-background/80 backdrop-blur-sm",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-4">
        {onMenuClick && (
          <Button variant="ghost" size="icon" onClick={onMenuClick} className="lg:hidden">
            <Menu className="size-5" />
          </Button>
        )}
        {title && <h1 className="text-lg font-semibold">{title}</h1>}
        {children}
      </div>

      <div className="flex items-center gap-2">
        {showSearch && (
          <Button
            variant="outline"
            size="sm"
            className="hidden md:flex items-center gap-2 text-muted-foreground"
            onClick={onSearchClick}
          >
            <Search className="size-4" />
            <span>検索...</span>
            <kbd className="pointer-events-none ml-2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
              <Command className="size-3" />K
            </kbd>
          </Button>
        )}

        {showNotifications && (
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="size-5" />
            {notificationCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 size-5 p-0 flex items-center justify-center text-[10px]"
              >
                {notificationCount > 99 ? "99+" : notificationCount}
              </Badge>
            )}
          </Button>
        )}

        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="size-8">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>{user.initials || user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span>{user.name}</span>
                  <span className="text-xs font-normal text-muted-foreground">{user.email}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>プロフィール</DropdownMenuItem>
              <DropdownMenuItem>設定</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onLogout} className="text-destructive">
                ログアウト
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  )
}

// Simple breadcrumb header variant
interface BreadcrumbItem {
  label: string
  href?: string
}

interface HeaderWithBreadcrumbProps extends Omit<HeaderProps, "title"> {
  breadcrumbs: BreadcrumbItem[]
}

function HeaderWithBreadcrumb({ breadcrumbs, ...props }: HeaderWithBreadcrumbProps) {
  return (
    <Header {...props}>
      <nav className="flex items-center gap-1 text-sm">
        {breadcrumbs.map((item, index) => (
          <React.Fragment key={index}>
            {index > 0 && <span className="text-muted-foreground">/</span>}
            {item.href ? (
              <a href={item.href} className="text-muted-foreground hover:text-foreground">
                {item.label}
              </a>
            ) : (
              <span className="text-foreground font-medium">{item.label}</span>
            )}
          </React.Fragment>
        ))}
      </nav>
    </Header>
  )
}

export { Header, HeaderWithBreadcrumb, type BreadcrumbItem }
