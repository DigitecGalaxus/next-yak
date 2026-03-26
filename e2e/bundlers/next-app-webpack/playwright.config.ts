import { basePlaywrightConfig } from "../../playwright-base.ts";

export default basePlaywrightConfig({
  name: "next-app-webpack",
  urlPattern: "/[case-name]",
  port: 3001,
});
