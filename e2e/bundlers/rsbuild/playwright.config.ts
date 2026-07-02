import { basePlaywrightConfig } from "../../playwright-base.ts";

export default basePlaywrightConfig({
  name: "rsbuild",
  urlPattern: "/[case-name].html",
  port: 5273,
});
