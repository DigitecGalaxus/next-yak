import { basePlaywrightConfig } from "../../playwright-base.ts";

export default basePlaywrightConfig({
  name: "tanstack-start-rsbuild",
  urlPattern: "/[case-name]",
  port: 3005,
});
