import { basePlaywrightConfig } from "../../playwright-base.ts";

export default basePlaywrightConfig({
  name: "vinext-pages",
  urlPattern: "/[case-name]",
  port: 3006,
});
