import { execSync, spawn } from "child_process";
import kill from "tree-kill";
import { mkdirSync, readFileSync } from "fs";
import path from "path";

const __dirname = new URL(".", import.meta.url).pathname;
const resultDir = path.resolve(__dirname, "./results");
const lighthouseArgs = "--preset=perf --only-categories=performance --chrome-flags=\"--headless\"";

// run npm run build:
execSync("npm run build", { cwd: __dirname, stdio: "inherit" });

// spawn server with npm run start
const server = spawn("npm", ["run", "start"], {
  cwd: __dirname,
  shell: true,
});

// wait for server to start (1s)
await new Promise((resolve) => setTimeout(resolve, 1000));

// wait for server to start:
Promise.all([
  fetch("http://localhost:3000/yak"),
  fetch("http://localhost:3000/yak"),
  fetch("http://localhost:3000/styled"),
  fetch("http://localhost:3000/styled"),
])
  .then(runTests)
  .finally(async () => {
    kill(server.pid, "SIGKILL");
  });

async function runTests() {
  // run lighthouse performance tests 3 times:
  const runs = 3;
  const urls = ["yak", "styled"];
  const results = {};
  for (let i = 0; i < runs; i++) {
    for (const url of urls) {
      results[url] = results[url] || [];
      results[url].push(await runLighthouse(url, i));
    }
  }

  for (const pathName of urls) {
    execSync(
      `npx lighthouse http://localhost:3000/${pathName} --output-path="${path.resolve(resultDir,pathName)}.html" ${lighthouseArgs}`,
      { cwd: __dirname, stdio: "inherit" }
    );
  }

  console.table(
    Object.fromEntries(
      Object.entries(results).map(([url, runs]) => [
        url,
        {
          score: round(mean(runs.map((run) => run.score)), 0),
          scoreMin: round(Math.min(...runs.map((run) => run.score)), 0),
          scoreMax: round(Math.max(...runs.map((run) => run.score)), 0),
          fcp: round(mean(runs.map((run) => run.firstContentfulPaint)), 0),
          fcpMin: round(Math.min(
            ...runs.map((run) => run.firstContentfulPaint)
          ), 0),
          fcpMax: round(Math.max(
            ...runs.map((run) => run.firstContentfulPaint)
          ), 0),
          lcp: round(mean(runs.map((run) => run.lcp)), 0),
          lcpMin: round(Math.min(...runs.map((run) => run.lcp)), 0),
          lcpMax: round(Math.max(...runs.map((run) => run.lcp)), 0),
          blockingTime: round(mean(runs.map((run) => run.blockingTime)), 2),
          blockingTimeMin: round(Math.min(
            ...runs.map((run) => run.blockingTime)
          ), 2),
          blockingTimeMax: round(Math.max(
            ...runs.map((run) => run.blockingTime)
          ), 2),
          ttfb: round(mean(runs.map((run) => run.ttfb)), 2),
          ttfbMin: round(Math.min(
            ...runs.map((run) => run.ttfb)
          ), 2),
          ttbMax: round(Math.max(
            ...runs.map((run) => run.ttfb)
          ), 2),
          transferSize: readableNumber(round(mean(runs.map((run) => run.transferSize)) / 1024, 2), "kb"),
        },
      ])
    )
  );
}

async function runLighthouse(pathName, run) {

  mkdirSync(resultDir, { recursive: true });
  const json = path.resolve(resultDir, `${pathName}_${run}.json`);
  execSync(
    `npx lighthouse http://localhost:3000/${pathName} --output=json --output-path="${json}" ${lighthouseArgs}`,
    { cwd: __dirname, stdio: "inherit" }
  );
  const results = JSON.parse(readFileSync(json, "utf-8"));
  const score = results.categories.performance.score * 100;
  const lcp = results.audits["largest-contentful-paint"].numericValue;
  const blockingTime = results.audits["total-blocking-time"].numericValue;
  const transferSize = results.audits["total-byte-weight"].numericValue;
  const firstContentfulPaint =
    results.audits["first-contentful-paint"].numericValue;
 const ttfb = results.audits["server-response-time"].numericValue;

  return { score, lcp, blockingTime, transferSize, firstContentfulPaint, ttfb };
}

function mean(numbers) {
  return numbers.reduce((a, b) => a + b) / numbers.length;
}

function round(number, decimals) {
    return Math.round(number * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

function readableNumber(number, unit) {
    return `${number.toLocaleString()} ${unit}`;
}