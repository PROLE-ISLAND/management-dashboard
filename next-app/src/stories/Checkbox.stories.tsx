import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import * as React from "react"

import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

const meta: Meta<typeof Checkbox> = {
  title: "Form/Checkbox",
  component: Checkbox,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {},
}

export const WithLabel: StoryObj = {
  render: () => (
    <div className="flex items-center space-x-2">
      <Checkbox id="terms" />
      <Label htmlFor="terms">利用規約に同意する</Label>
    </div>
  ),
}

export const Checked: Story = {
  args: {
    defaultChecked: true,
  },
}

export const Disabled: StoryObj = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Checkbox id="disabled" disabled />
        <Label htmlFor="disabled" className="text-muted-foreground">
          無効（未チェック）
        </Label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="disabled-checked" disabled defaultChecked />
        <Label htmlFor="disabled-checked" className="text-muted-foreground">
          無効（チェック済み）
        </Label>
      </div>
    </div>
  ),
}

export const FormExample: StoryObj = {
  render: () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <p className="text-sm font-medium">通知設定</p>
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox id="email" defaultChecked />
            <Label htmlFor="email">メール通知を受け取る</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="push" defaultChecked />
            <Label htmlFor="push">プッシュ通知を受け取る</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="sms" />
            <Label htmlFor="sms">SMS通知を受け取る</Label>
          </div>
        </div>
      </div>
    </div>
  ),
}

export const WithDescription: StoryObj = {
  render: () => (
    <div className="items-top flex space-x-2">
      <Checkbox id="terms-desc" />
      <div className="grid gap-1.5 leading-none">
        <Label htmlFor="terms-desc">利用規約に同意する</Label>
        <p className="text-sm text-muted-foreground">
          サービスの利用規約とプライバシーポリシーに同意します。
        </p>
      </div>
    </div>
  ),
}

export const Controlled: StoryObj = {
  render: () => {
    const [checked, setChecked] = React.useState(false)

    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="controlled"
            checked={checked}
            onCheckedChange={(value) => setChecked(value === true)}
          />
          <Label htmlFor="controlled">コントロールされたチェックボックス</Label>
        </div>
        <p className="text-sm text-muted-foreground">
          状態: {checked ? "チェック済み" : "未チェック"}
        </p>
      </div>
    )
  },
}

export const TodoList: StoryObj = {
  render: () => {
    const [todos, setTodos] = React.useState([
      { id: 1, text: "デザインレビュー", completed: true },
      { id: 2, text: "コードレビュー", completed: false },
      { id: 3, text: "テスト作成", completed: false },
      { id: 4, text: "ドキュメント更新", completed: true },
    ])

    const toggleTodo = (id: number) => {
      setTodos(
        todos.map((todo) =>
          todo.id === id ? { ...todo, completed: !todo.completed } : todo
        )
      )
    }

    return (
      <div className="space-y-3 w-[250px]">
        <p className="text-sm font-medium">タスク一覧</p>
        {todos.map((todo) => (
          <div key={todo.id} className="flex items-center space-x-2">
            <Checkbox
              id={`todo-${todo.id}`}
              checked={todo.completed}
              onCheckedChange={() => toggleTodo(todo.id)}
            />
            <Label
              htmlFor={`todo-${todo.id}`}
              className={todo.completed ? "line-through text-muted-foreground" : ""}
            >
              {todo.text}
            </Label>
          </div>
        ))}
        <p className="text-xs text-muted-foreground pt-2">
          完了: {todos.filter((t) => t.completed).length} / {todos.length}
        </p>
      </div>
    )
  },
}
