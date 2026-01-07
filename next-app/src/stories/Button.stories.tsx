import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { Mail, Loader2, ChevronRight, Plus, Download, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"

const meta = {
  title: "UI/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "destructive", "outline", "secondary", "ghost", "link"],
    },
    size: {
      control: "select",
      options: ["default", "sm", "lg", "icon", "icon-sm", "icon-lg"],
    },
    disabled: {
      control: "boolean",
    },
    asChild: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

// Default
export const Default: Story = {
  args: {
    children: "Button",
  },
}

// Primary (default variant)
export const Primary: Story = {
  args: {
    variant: "default",
    children: "Primary Button",
  },
}

// Secondary
export const Secondary: Story = {
  args: {
    variant: "secondary",
    children: "Secondary",
  },
}

// Destructive
export const Destructive: Story = {
  args: {
    variant: "destructive",
    children: "Delete",
  },
}

// Outline
export const Outline: Story = {
  args: {
    variant: "outline",
    children: "Outline",
  },
}

// Ghost
export const Ghost: Story = {
  args: {
    variant: "ghost",
    children: "Ghost",
  },
}

// Link
export const Link: Story = {
  args: {
    variant: "link",
    children: "Link Button",
  },
}

// With Icon Left
export const WithIconLeft: Story = {
  args: {
    children: (
      <>
        <Mail className="size-4" />
        Login with Email
      </>
    ),
  },
}

// With Icon Right
export const WithIconRight: Story = {
  args: {
    children: (
      <>
        Next Step
        <ChevronRight className="size-4" />
      </>
    ),
  },
}

// Loading State
export const Loading: Story = {
  args: {
    disabled: true,
    children: (
      <>
        <Loader2 className="size-4 animate-spin" />
        Loading...
      </>
    ),
  },
}

// Icon Only
export const IconOnly: Story = {
  args: {
    variant: "outline",
    size: "icon",
    children: <Plus className="size-4" />,
    "aria-label": "Add item",
  },
}

// Sizes showcase
export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Button size="sm">Small</Button>
      <Button size="default">Default</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
}

// Icon sizes
export const IconSizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Button size="icon-sm" variant="outline">
        <Plus className="size-4" />
      </Button>
      <Button size="icon" variant="outline">
        <Plus className="size-4" />
      </Button>
      <Button size="icon-lg" variant="outline">
        <Plus className="size-5" />
      </Button>
    </div>
  ),
}

// All variants
export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button variant="default">Default</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
    </div>
  ),
}

// Button group example
export const ButtonGroup: Story = {
  render: () => (
    <div className="flex gap-2">
      <Button variant="outline">
        <Download className="size-4" />
        Export
      </Button>
      <Button>
        <Plus className="size-4" />
        Add New
      </Button>
      <Button variant="destructive" size="icon">
        <Trash2 className="size-4" />
      </Button>
    </div>
  ),
}

// Disabled state
export const Disabled: Story = {
  args: {
    disabled: true,
    children: "Disabled",
  },
}
