import { basePlaywrightConfig } from "../../playwright-base.ts";

export default basePlaywrightConfig({
  name: "next-app-rspack",
  urlPattern: "/[case-name]",
  port: 3005,
});
