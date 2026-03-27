import { basePlaywrightConfig } from "../../playwright-base.ts";

export default basePlaywrightConfig({
  name: "next-pages-webpack",
  urlPattern: "/[case-name]",
  port: 3003,
});
