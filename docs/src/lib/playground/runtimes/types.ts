/** Shows the main file's default export in the preview. */
export type Renderer = {
  render(exported: unknown): void;
  dispose(): void;
};

export type Runtime = {
  /** the modules compiled code may require, by import specifier */
  modules: Record<string, unknown>;
  /** the packages a playground file may import, named in the error for any other import */
  packages: string[];
  createRenderer(container: HTMLElement): Renderer;
};
