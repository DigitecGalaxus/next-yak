import { basePlaywrightConfig } from "../../playwright-base.ts";

export default basePlaywrightConfig({
  name: "next-pages-rspack",
  urlPattern: "/[case-name]",
  port: 3006,
});
