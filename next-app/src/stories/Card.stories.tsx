import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { MoreHorizontal } from "lucide-react"

import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  CardAction,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const meta = {
  title: "UI/Card",
  component: Card,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-[400px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Card>

export default meta
type Story = StoryObj<typeof meta>

// Default
export const Default: Story = {
  render: () => (
    <Card>
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card description goes here</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Card content goes here. This is where the main content of the card lives.</p>
      </CardContent>
    </Card>
  ),
}

// With footer
export const WithFooter: Story = {
  render: () => (
    <Card>
      <CardHeader>
        <CardTitle>Create Project</CardTitle>
        <CardDescription>Deploy your new project in one-click.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Your project will be deployed to the cloud and accessible via a unique URL.
        </p>
      </CardContent>
      <CardFooter className="gap-2">
        <Button variant="outline">Cancel</Button>
        <Button>Deploy</Button>
      </CardFooter>
    </Card>
  ),
}

// With action
export const WithAction: Story = {
  render: () => (
    <Card>
      <CardHeader>
        <CardTitle>Team Members</CardTitle>
        <CardDescription>Manage your team members</CardDescription>
        <CardAction>
          <Button variant="ghost" size="icon-sm">
            <MoreHorizontal className="size-4" />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 text-sm">
          <li className="flex justify-between">
            <span>John Doe</span>
            <Badge variant="secondary">Admin</Badge>
          </li>
          <li className="flex justify-between">
            <span>Jane Smith</span>
            <Badge variant="outline">Member</Badge>
          </li>
        </ul>
      </CardContent>
    </Card>
  ),
}

// Stats card
export const StatsCard: Story = {
  render: () => (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription>Total Revenue</CardDescription>
        <CardTitle className="text-3xl">¥12,450,000</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground">
          +20.1% from last month
        </p>
      </CardContent>
    </Card>
  ),
}

// Glass effect card
export const GlassEffect: Story = {
  render: () => (
    <Card className="bg-card/50 backdrop-blur-xl border-white/10">
      <CardHeader>
        <CardTitle>Glass Card</CardTitle>
        <CardDescription>Semi-transparent with blur effect</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          This card uses glassmorphism design with backdrop blur.
        </p>
      </CardContent>
    </Card>
  ),
}

// Gradient border card
export const GradientBorder: Story = {
  render: () => (
    <div className="p-[1px] rounded-xl bg-gradient-to-r from-primary via-purple-500 to-pink-500">
      <Card className="rounded-[11px]">
        <CardHeader>
          <CardTitle>Gradient Border</CardTitle>
          <CardDescription>Card with gradient border effect</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Achieved using a wrapper div with gradient background.
          </p>
        </CardContent>
      </Card>
    </div>
  ),
}

// Interactive card
export const Interactive: Story = {
  render: () => (
    <Card className="cursor-pointer transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10">
      <CardHeader>
        <CardTitle>Interactive Card</CardTitle>
        <CardDescription>Hover to see the effect</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          This card has hover effects for better interactivity.
        </p>
      </CardContent>
    </Card>
  ),
}

// Grid of cards
export const CardGrid: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4 w-[500px]">
      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Users</CardDescription>
          <CardTitle className="text-2xl">2,847</CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Revenue</CardDescription>
          <CardTitle className="text-2xl">¥1.2M</CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Orders</CardDescription>
          <CardTitle className="text-2xl">384</CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Growth</CardDescription>
          <CardTitle className="text-2xl">+12.5%</CardTitle>
        </CardHeader>
      </Card>
    </div>
  ),
  decorators: [
    (Story) => (
      <div>
        <Story />
      </div>
    ),
  ],
}
