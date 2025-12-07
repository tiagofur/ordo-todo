import type { Meta, StoryObj } from "@storybook/react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../components/ui/card";
import { Button } from "../components/ui/button";

const meta: Meta<typeof Card> = {
  title: "UI/Card",
  component: Card,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A versatile card container component for grouping related content.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card description goes here</CardDescription>
      </CardHeader>
      <CardContent>
        <p>This is the card content. You can put any content here.</p>
      </CardContent>
    </Card>
  ),
};

export const WithFooter: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Create Project</CardTitle>
        <CardDescription>Deploy your new project in one-click.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Your project will be deployed to our cloud infrastructure.</p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">Cancel</Button>
        <Button>Deploy</Button>
      </CardFooter>
    </Card>
  ),
};

export const TaskCard: Story = {
  render: () => (
    <Card className="w-[350px] border-l-4 border-l-purple-500">
      <CardHeader>
        <CardTitle className="text-lg">Implement authentication</CardTitle>
        <CardDescription>High Priority • Due Tomorrow</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Set up OAuth providers and implement login/logout functionality.
        </p>
      </CardContent>
      <CardFooter>
        <div className="flex gap-2">
          <span className="text-xs bg-purple-500/10 text-purple-500 px-2 py-1 rounded">Backend</span>
          <span className="text-xs bg-blue-500/10 text-blue-500 px-2 py-1 rounded">Security</span>
        </div>
      </CardFooter>
    </Card>
  ),
};

export const StatsCard: Story = {
  render: () => (
    <Card className="w-[200px]">
      <CardHeader className="pb-2">
        <CardDescription>Total Tasks</CardDescription>
        <CardTitle className="text-3xl">24</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-green-500">+12% from last week</p>
      </CardContent>
    </Card>
  ),
};
