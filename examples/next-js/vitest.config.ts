import react from "@vitejs/plugin-react";
import { defineConfig, mergeConfig } from "vitest/config";

// https://vitejs.dev/config/
export default mergeConfig(
  {
    plugins: [react()],
  },
  defineConfig({
    test: {
      globals: true,
      environment: "jsdom",

      // This is only necessary because we use Vitest and Jest (to see verify that both work)
      // and they should use different snapshot names
      resolveSnapshotPath: (testPath, snapshotExtension) =>
        testPath.replace("__tests__", "__tests__/__vite_snapshots__") +
        snapshotExtension,
    },
  }),
);
