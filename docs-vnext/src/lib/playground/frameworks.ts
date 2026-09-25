/** A new framework also needs an example, a runtime in runtimes/ and a types entry in generate-playground-types. */
export const frameworks = ["react", "solid"] as const;

export type FrameworkId = (typeof frameworks)[number];

export const DEFAULT_FRAMEWORK: FrameworkId = "react";

export const isFrameworkId = (value: unknown): value is FrameworkId =>
  frameworks.some((framework) => framework === value);
