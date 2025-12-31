import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Clock } from "./components";

const meta: Meta = {
  title: "Features/Theme",
  tags: ["autodocs"],
};

export default meta;

const getHighContrastFromCookie = () => {
  if (typeof document === "undefined") return false;
  const cookies = document.cookie.split(";");
  const cookie = cookies.find((c) => c.trim().startsWith("highContrast="));
  return cookie?.split("=")[1] === "true";
};

const ThemeSwitcher = () => {
  const [highContrast, setHighContrast] = useState(getHighContrastFromCookie);

  const toggleTheme = () => {
    const newValue = !highContrast;
    setHighContrast(newValue);
    document.cookie = `highContrast=${newValue}; path=/`;
    // Force re-render by reloading the iframe
    window.location.reload();
  };

  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ marginBottom: "1rem" }}>
        <button
          onClick={toggleTheme}
          style={{
            padding: "8px 16px",
            fontSize: "14px",
            cursor: "pointer",
            borderRadius: "4px",
            border: "1px solid #ccc",
            background: highContrast ? "#333" : "#fff",
            color: highContrast ? "#fff" : "#333",
          }}
        >
          {highContrast ? "Disable" : "Enable"} High Contrast
        </button>
      </div>
      <Clock />
      <p style={{ marginTop: "1rem", color: "#666", fontSize: "14px" }}>
        Toggle high contrast to see the second hand change color.
        <br />
        In high contrast mode, the second hand is black instead of red.
      </p>
    </div>
  );
};

export const ThemeSwitching: StoryObj = {
  render: () => <ThemeSwitcher />,
  parameters: {
    layout: "centered",
  },
};
