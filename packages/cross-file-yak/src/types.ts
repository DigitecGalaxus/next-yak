export interface Cache<STORED> {
  set(key: string, data: STORED): void;
  get(key: string): STORED | undefined;
  addDependency?(key: string, filePath: string): void;
}
