import { basePlaywrightConfig } from "../../playwright-base.ts";

export default basePlaywrightConfig({
  name: "next-app-turbopack",
  urlPattern: "/[case-name]",
  port: 3002,
});
