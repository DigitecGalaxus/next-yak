import type { Preview } from "@storybook/react";
import { YakThemeProvider } from "@yak/react";
import { getYakThemeContext } from "@yak/react/context/baseContext";

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
