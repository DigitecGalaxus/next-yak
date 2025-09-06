import { spawn } from "cross-spawn";
import { existsSync, rmSync } from "fs";
import { join, resolve } from "path";

export class NextTestSetup {
  // private fixturePath: string;
  // constructor(fixturePath: string) {
  // this.options = {
  //   pluginEnabled: true,
  //   buildCommand: "build",
  //   devCommand: "dev",
  //   port: null,
  //   env: {},
  //   ...options,
  // };
  // this.processes = [];
  // this.port = null;
  // }
  // async setup() {
  //   this.port = await getPort({ port: this.options.port || 3000 });
  //   await this.installDependencies();
  //   await this.configurePlugin();
  // }
  // async installDependencies() {
  //   if (!existsSync(join(this.fixturePath, "node_modules"))) {
  //     console.log(`Installing dependencies for ${this.fixturePath}...`);
  //     await this.runCommand("npm", ["install"], { cwd: this.fixturePath });
  //   }
  // }
  //   async configurePlugin() {
  //     const configPath = join(this.fixturePath, "next.config.js");
  //     const pluginEnabled = this.options.pluginEnabled;
  //     const config = `
  // /** @type {import('next').NextConfig} */
  // const nextConfig = {
  //   experimental: {
  //     swcPlugins: ${pluginEnabled ? '[["your-swc-plugin", {}]]' : "[]"}
  //   },
  //   webpack: (config, { dev, isServer }) => {
  //     ${
  //       pluginEnabled
  //         ? `
  //     // Add your webpack plugin configuration here
  //     // config.plugins.push(new YourWebpackPlugin());
  //     `
  //         : ""
  //     }
  //     return config;
  //   },
  //   // Disable telemetry for consistent performance
  //   telemetry: false,
  // };
  // module.exports = nextConfig;
  //     `;
  //     writeFileSync(configPath, config.trim());
  //   }
  // async startDev() {
  //   return new Promise((resolve, reject) => {
  //     const child = spawn("npm", ["run", this.options.devCommand], {
  //       cwd: this.fixturePath,
  //       stdio: "pipe",
  //       env: {
  //         ...process.env,
  //         PORT: this.port.toString(),
  //         NODE_ENV: "development",
  //         ...this.options.env,
  //       },
  //     });
  //     this.processes.push(child);
  //     let resolved = false;
  //     const timeout = setTimeout(() => {
  //       if (!resolved) {
  //         resolved = true;
  //         reject(new Error("Dev server startup timeout"));
  //       }
  //     }, 60000);
  //     child.stdout.on("data", (data) => {
  //       const output = data.toString();
  //       if (
  //         !resolved &&
  //         (output.includes("Ready in") || output.includes("started server"))
  //       ) {
  //         resolved = true;
  //         clearTimeout(timeout);
  //         resolve(child);
  //       }
  //     });
  //     child.stderr.on("data", (data) => {
  //       const output = data.toString();
  //       if (output.includes("Error") && !resolved) {
  //         resolved = true;
  //         clearTimeout(timeout);
  //         reject(new Error(`Dev server failed: ${output}`));
  //       }
  //     });
  //     child.on("close", (code) => {
  //       if (!resolved) {
  //         resolved = true;
  //         clearTimeout(timeout);
  //         if (code === 0) {
  //           resolve(child);
  //         } else {
  //           reject(new Error(`Dev server exited with code ${code}`));
  //         }
  //       }
  //     });
  //   });
  // }
  // async connectToHMR() {
  //   const wsUrl = `ws://localhost:${this.port}/_next/webpack-hmr`;
  //   return new Promise((resolve, reject) => {
  //     const ws = new WebSocket(wsUrl);
  //     const timeout = setTimeout(() => {
  //       ws.close();
  //       reject(new Error("HMR WebSocket connection timeout"));
  //     }, 10000);
  //     ws.on("open", () => {
  //       clearTimeout(timeout);
  //       resolve(ws);
  //     });
  //     ws.on("error", (error) => {
  //       clearTimeout(timeout);
  //       reject(error);
  //     });
  //   });
  // }
  // async measureHMR(filePath, modification) {
  //   const ws = await this.connectToHMR();
  //   return new Promise((resolve, reject) => {
  //     const startTime = process.hrtime.bigint();
  //     let resolved = false;
  //     const timeout = setTimeout(() => {
  //       if (!resolved) {
  //         resolved = true;
  //         ws.close();
  //         reject(new Error("HMR measurement timeout"));
  //       }
  //     }, 30000);
  //     const handleMessage = (data) => {
  //       try {
  //         const message = JSON.parse(data.toString());
  //         if (
  //           (message.action === "built" || message.action === "sync") &&
  //           !resolved
  //         ) {
  //           resolved = true;
  //           clearTimeout(timeout);
  //           const endTime = process.hrtime.bigint();
  //           const duration = Number(endTime - startTime) / 1000000;
  //           ws.close();
  //           resolve(duration);
  //         }
  //       } catch (e) {
  //         // Ignore JSON parse errors
  //       }
  //     };
  //     ws.on("message", handleMessage);
  //     // Trigger the modification after a short delay
  //     setTimeout(() => {
  //       modification(filePath);
  //     }, 1000);
  //   });
  // }
  // modifyFile(filePath, content) {
  //   writeFileSync(filePath, content);
  // }
  // addHMRMarker(filePath) {
  //   const content = readFileSync(filePath, "utf8");
  //   const timestamp = Date.now();
  //   if (content.includes("/* HMR_MARKER */")) {
  //     const newContent = content.replace(
  //       /\/\* HMR_MARKER \*\/.*$/m,
  //       `/* HMR_MARKER */ // Modified at ${timestamp}`,
  //     );
  //     writeFileSync(filePath, newContent);
  //   } else {
  //     // Add marker at the end
  //     writeFileSync(
  //       filePath,
  //       `${content}\n/* HMR_MARKER */ // Modified at ${timestamp}`,
  //     );
  //   }
  // }
  // async cleanup() {
  //   // Kill all spawned processes
  //   for (const process of this.processes) {
  //     if (process.pid && !process.killed) {
  //       try {
  //         await new Promise((resolve) => {
  //           kill(process.pid, "SIGTERM", (err) => {
  //             resolve();
  //           });
  //         });
  //       } catch (e) {
  //         // Process might already be dead
  //       }
  //     }
  //   }
  //   this.processes = [];
  // }
}

async function runCommand(
  command: string,
  args: string[] = [],
  options: any = {},
) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: "pipe",
      ...options,
      env: {
        ...process.env,
        // PORT: this.port?.toString(),
        // NODE_ENV: options.env?.NODE_ENV || "development",
        // ...this.options.env,
        ...options.env,
      },
    });

    // this.processes.push(child);

    let stdout = "";
    let stderr = "";

    child.stdout?.on("data", (data) => {
      stdout += data.toString();
    });

    child.stderr?.on("data", (data) => {
      stderr += data.toString();
    });

    child.on("close", (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
      } else {
        reject(new Error(`Command failed with code ${code}: ${stderr}`));
      }
    });
  });
}

export function cleanBuild(fixturePath: string) {
  const buildDir = join(resolve(fixturePath), ".next");
  if (existsSync(buildDir)) {
    rmSync(buildDir, { recursive: true, force: true });
  }
}

export async function build(fixturePath: string) {
  await runCommand("npm", ["run", "build"], {
    cwd: resolve(fixturePath),
    env: { NODE_ENV: "production" },
  });
}
