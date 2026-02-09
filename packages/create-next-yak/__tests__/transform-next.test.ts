import { describe, it, expect } from "vitest";
import { transformNextConfig } from "../src/transform-next.ts";

describe("transformNextConfig", () => {
  it("wraps ESM identifier export", () => {
    const input = `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

export default nextConfig;
`;
    const result = transformNextConfig(input);
    expect(result).toContain("withYak");
    expect(result).toContain("next-yak/withYak");
    expect(result).toContain("export default withYak(nextConfig)");
  });

  it("wraps ESM inline object export", () => {
    const input = `export default {
  reactStrictMode: true,
};
`;
    const result = transformNextConfig(input);
    expect(result).toContain("next-yak/withYak");
    expect(result).toContain("export default withYak({");
  });

  it("wraps ESM export already wrapped by another plugin", () => {
    const input = `import createMDX from "@next/mdx";

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
};

export default withMDX(nextConfig);
`;
    const result = transformNextConfig(input);
    expect(result).toContain("next-yak/withYak");
    expect(result).toContain("export default withYak(withMDX(nextConfig))");
  });

  it("wraps CJS module.exports", () => {
    const input = `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

module.exports = nextConfig;
`;
    const result = transformNextConfig(input);
    expect(result).not.toContain("import ");
    expect(result).toContain("require");
    expect(result).toContain("next-yak/withYak");
    expect(result).toContain("module.exports = withYak(nextConfig)");
  });

  it("handles TypeScript config", () => {
    const input = `import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
};

export default nextConfig;
`;
    const result = transformNextConfig(input);
    expect(result).toContain("next-yak/withYak");
    expect(result).toContain("export default withYak(nextConfig)");
  });

  it("throws if no default export found", () => {
    const input = `const config = { reactStrictMode: true };`;
    expect(() => transformNextConfig(input)).toThrow(
      "Could not find default export"
    );
  });
});
