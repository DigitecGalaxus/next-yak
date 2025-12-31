import type { Meta, StoryObj } from "@storybook/react";
import { Button, FancyButton, IconButton } from "./components";

const meta: Meta<typeof Button> = {
  title: "Components/Button",
  component: Button,
  tags: ["autodocs"],
  argTypes: {
    children: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: {
    children: "Click me",
  },
};

export const Fancy: Story = {
  render: (args) => (
    <FancyButton {...args}>{args.children ?? "Fancy Button"}</FancyButton>
  ),
};

export const Icon: Story = {
  render: (args) => (
    <IconButton {...args}>{args.children ?? "Icon Button"}</IconButton>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
      <Button>Default</Button>
      <FancyButton>Fancy</FancyButton>
      <IconButton>Icon</IconButton>
    </div>
  ),
};
