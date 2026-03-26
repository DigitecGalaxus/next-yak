import { basePlaywrightConfig } from "../../playwright-base.ts";

export default basePlaywrightConfig({
  name: "vite",
  urlPattern: "/[case-name].html",
  port: 5173,
});
