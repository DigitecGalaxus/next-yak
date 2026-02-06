import path from "node:path";
import fs from "node:fs/promises";
import { createHash } from "node:crypto";

const __dirname = path.dirname(new URL(import.meta.url).pathname);

export interface TestEnvironment {
  /** Absolute path to the tmp directory containing the files */
  dir: string;
  /** Remove this specific environment from disk */
  cleanup(): Promise<void>;
}

/** Manages temporary on-disk directories for bundler integration tests. */
export class TestEnvironmentManager {
  private static readonly ROOT = path.join(__dirname, ".tmp");

  /**
   * Create a new isolated environment with the given files on disk.
   * Uses a deterministic hash of the file contents as directory name
   * so that CSS class name hashes remain stable across test runs.
   * A random suffix is intentionally avoided because the SWC plugin
   * derives CSS class names from file paths — random paths would cause
   * snapshot churn on every run.
   * Returns a TestEnvironment with the tmpDir path and a cleanup method.
   */
  static async createEnvironment(
    files: Record<string, string>,
  ): Promise<TestEnvironment> {
    const hash = createHash("sha256");
    for (const key of Object.keys(files).sort()) {
      hash.update(key);
      hash.update(files[key]);
    }
    const id = hash.digest("hex").slice(0, 16);
    const dir = path.join(this.ROOT, id);

    for (const [filename, content] of Object.entries(files)) {
      const fullPath = path.join(dir, filename);
      await fs.mkdir(path.dirname(fullPath), { recursive: true });
      await fs.writeFile(fullPath, content);
    }

    return {
      dir,
      async cleanup() {
        await fs.rm(dir, { recursive: true, force: true });
      },
    };
  }

  /**
   * Remove the entire .tmp directory from disk (all environments).
   * Called in beforeAll/afterAll as safety net.
   */
  static async removeAllFromDisk(): Promise<void> {
    await fs.rm(this.ROOT, { recursive: true, force: true });
  }
}
