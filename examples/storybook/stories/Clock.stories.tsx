import type { Meta, StoryObj } from "@storybook/react";
import { Clock } from "./components";

const meta: Meta<typeof Clock> = {
  title: "Components/Clock",
  component: Clock,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof Clock>;

export const Default: Story = {};

export const OnDarkBackground: Story = {
  decorators: [
    (Story) => (
      <div
        style={{
          background: "#1a1a2e",
          padding: "2rem",
          borderRadius: "8px",
        }}
      >
        <Story />
      </div>
    ),
  ],
};

export const WithDescription: Story = {
  decorators: [
    (Story) => (
      <div style={{ textAlign: "center" }}>
        <Story />
        <p style={{ marginTop: "1rem", color: "#666" }}>
          Hover over the clock to see the 3D effect!
        </p>
      </div>
    ),
  ],
};
