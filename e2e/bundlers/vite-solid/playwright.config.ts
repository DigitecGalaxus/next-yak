import { basePlaywrightConfig } from "../../playwright-base.ts";

export default basePlaywrightConfig({
  name: "vite-solid",
  urlPattern: "/[case-name].html",
  port: 5373,
  framework: "solid",
});
