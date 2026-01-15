import type { Preview } from "@storybook/react";
import { YakThemeProvider } from "next-yak";
import { getYakThemeContext } from "next-yak/context/baseContext";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [
    (Story) => (
      <YakThemeProvider theme={getYakThemeContext()}>
        <Story />
      </YakThemeProvider>
    ),
  ],
};

export default preview;
