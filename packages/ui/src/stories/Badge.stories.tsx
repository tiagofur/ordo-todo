import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from "../components/ui/badge";

const meta: Meta<typeof Badge> = {
  title: "UI/Badge",
  component: Badge,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A small status badge component for labels, tags, and status indicators.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "secondary", "destructive", "outline"],
      description: "The visual style of the badge",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Default: Story = {
  args: {
    children: "Badge",
    variant: "default",
  },
};

export const Secondary: Story = {
  args: {
    children: "Secondary",
    variant: "secondary",
  },
};

export const Destructive: Story = {
  args: {
    children: "Destructive",
    variant: "destructive",
  },
};

export const Outline: Story = {
  args: {
    children: "Outline",
    variant: "outline",
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="default">Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="outline">Outline</Badge>
    </div>
  ),
};

export const StatusBadges: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge className="bg-green-500/10 text-green-500">Completed</Badge>
      <Badge className="bg-yellow-500/10 text-yellow-500">In Progress</Badge>
      <Badge className="bg-blue-500/10 text-blue-500">Todo</Badge>
      <Badge className="bg-red-500/10 text-red-500">Overdue</Badge>
    </div>
  ),
};

export const PriorityBadges: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge className="bg-gray-500/10 text-gray-500">Low</Badge>
      <Badge className="bg-blue-500/10 text-blue-500">Medium</Badge>
      <Badge className="bg-orange-500/10 text-orange-500">High</Badge>
      <Badge className="bg-red-500/10 text-red-500">Urgent</Badge>
    </div>
  ),
};
