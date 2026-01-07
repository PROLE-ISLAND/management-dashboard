"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  Calculator,
  Calendar,
  CreditCard,
  Settings,
  Smile,
  User,
  Home,
  BarChart3,
  Folder,
  Users,
  Search,
  FileText,
  type LucideIcon,
} from "lucide-react"

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "./command"

interface CommandAction {
  id: string
  label: string
  icon?: LucideIcon
  shortcut?: string
  onSelect?: () => void
  href?: string
  keywords?: string[]
}

interface CommandGroup {
  heading: string
  items: CommandAction[]
}

interface CommandMenuProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  groups?: CommandGroup[]
  placeholder?: string
  emptyMessage?: string
}

const defaultGroups: CommandGroup[] = [
  {
    heading: "ナビゲーション",
    items: [
      { id: "home", label: "ダッシュボード", icon: Home, href: "/", shortcut: "⌘H" },
      { id: "analytics", label: "分析", icon: BarChart3, href: "/analytics" },
      { id: "projects", label: "プロジェクト", icon: Folder, href: "/projects" },
      { id: "team", label: "チーム", icon: Users, href: "/team" },
    ],
  },
  {
    heading: "アクション",
    items: [
      { id: "search", label: "検索", icon: Search, shortcut: "⌘K", keywords: ["find", "search"] },
      { id: "new-project", label: "新規プロジェクト", icon: Folder, shortcut: "⌘N", keywords: ["create", "new"] },
      { id: "new-document", label: "新規ドキュメント", icon: FileText, keywords: ["create", "doc"] },
    ],
  },
  {
    heading: "設定",
    items: [
      { id: "profile", label: "プロフィール", icon: User, shortcut: "⌘P" },
      { id: "settings", label: "設定", icon: Settings, shortcut: "⌘," },
    ],
  },
]

function CommandMenu({
  open: controlledOpen,
  onOpenChange,
  groups = defaultGroups,
  placeholder = "検索またはコマンドを入力...",
  emptyMessage = "結果が見つかりません",
}: CommandMenuProps) {
  const [open, setOpen] = React.useState(false)
  const router = useRouter()

  const isControlled = controlledOpen !== undefined
  const isOpen = isControlled ? controlledOpen : open
  const setIsOpen = isControlled ? onOpenChange || (() => {}) : setOpen

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setIsOpen(!isOpen)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [isOpen, setIsOpen])

  const handleSelect = (action: CommandAction) => {
    setIsOpen(false)
    if (action.onSelect) {
      action.onSelect()
    } else if (action.href) {
      router.push(action.href)
    }
  }

  return (
    <CommandDialog open={isOpen} onOpenChange={setIsOpen}>
      <CommandInput placeholder={placeholder} />
      <CommandList>
        <CommandEmpty>{emptyMessage}</CommandEmpty>
        {groups.map((group, groupIndex) => (
          <React.Fragment key={group.heading}>
            {groupIndex > 0 && <CommandSeparator />}
            <CommandGroup heading={group.heading}>
              {group.items.map((item) => (
                <CommandItem
                  key={item.id}
                  onSelect={() => handleSelect(item)}
                  keywords={item.keywords}
                >
                  {item.icon && <item.icon className="mr-2 size-4" />}
                  <span>{item.label}</span>
                  {item.shortcut && <CommandShortcut>{item.shortcut}</CommandShortcut>}
                </CommandItem>
              ))}
            </CommandGroup>
          </React.Fragment>
        ))}
      </CommandList>
    </CommandDialog>
  )
}

// Hook to control command menu
function useCommandMenu() {
  const [open, setOpen] = React.useState(false)

  const toggle = React.useCallback(() => setOpen((prev) => !prev), [])
  const close = React.useCallback(() => setOpen(false), [])
  const openMenu = React.useCallback(() => setOpen(true), [])

  return { open, setOpen, toggle, close, openMenu }
}

export { CommandMenu, useCommandMenu, type CommandAction, type CommandGroup }
