import { basePlaywrightConfig } from "../../playwright-base.ts";

export default basePlaywrightConfig({
  name: "next-pages-turbopack",
  urlPattern: "/[case-name]",
  port: 3004,
});
