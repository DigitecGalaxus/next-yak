import { basePlaywrightConfig } from "../../playwright-base.ts";

export default basePlaywrightConfig({
  name: "vite-qwik",
  urlPattern: "/[case-name]/",
  port: 5374,
  framework: "qwik",
});
