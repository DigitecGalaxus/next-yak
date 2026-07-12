import { render } from "@solidjs/web";
import { YakThemeProvider } from "@yak/solid";
import App from "./App.tsx";
import { theme } from "./theme.ts";
import "./globals.ts";

render(
  () => (
    <YakThemeProvider theme={theme()}>
      <App />
    </YakThemeProvider>
  ),
  document.getElementById("root")!,
);
