/**
 * Generates per-package release notes for a snapshot (canary) publish.
 *
 * Snapshot publishes do not consume `.changeset/*.md`, so without filtering
 * every prerelease would re-announce the entire pending pile. We mark a
 * changeset as "already shipped" when its introducing commit is reachable
 * from the package's most recent semver tag.
 *
 * Caller is responsible for stashing/restoring `.changeset/*.md` around
 * `changeset version --snapshot`, since that step deletes them.
 *
 * Env:
 *   OUTPUT_DIR        — directory to write `<safe-pkg-name>.md` files into
 *   GITHUB_REPOSITORY — for the `Full Changelog` compare link
 */
import * as fs from "node:fs";
import * as path from "node:path";
import { execSync } from "node:child_process";
import readChangesets from "@changesets/read";
import * as git from "@changesets/git";
import changelog from "@changesets/cli/changelog";

const { getReleaseLine } = changelog;

type ReleaseType = "major" | "minor" | "patch";
type Groups = Record<ReleaseType, { changeset: any; type: ReleaseType }[]>;

const cwd = process.cwd();
const repo = process.env.GITHUB_REPOSITORY;
function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) {
    console.error(`${name} env var is required`);
    process.exit(1);
  }
  return v;
}
const outDir = requireEnv("OUTPUT_DIR");
fs.mkdirSync(outDir, { recursive: true });

async function main() {
  const packagesDir = path.join(cwd, "packages");
  const packages: { name: string; version: string; private?: boolean }[] = [];
  for (const d of fs.readdirSync(packagesDir)) {
    const jsonPath = path.join(packagesDir, d, "package.json");
    if (!fs.existsSync(jsonPath)) continue;
    const pkg = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
    if (pkg.private) continue;
    packages.push(pkg);
  }

  const changesets = await readChangesets(cwd);
  if (changesets.length) {
    const paths = changesets.map((c) => `.changeset/${c.id}.md`);
    const shaList = await git.getCommitsThatAddFiles(paths, { cwd, short: true });
    for (let i = 0; i < changesets.length; i++) {
      (changesets[i] as any).commit = shaList[i] || undefined;
    }
  }

  // Glob `[0-9]*` skips legacy `v`-prefixed tags (e.g. `next-yak@v2.3.0`) so
  // `-v:refname` actually sorts current semver tags to the top.
  const prevTagByPkg = new Map<string, string>();
  for (const pkg of packages) {
    let prevTag = "";
    try {
      prevTag =
        execSync(`git tag --list '${pkg.name}@[0-9]*' --sort=-v:refname`, { encoding: "utf8" })
          .split("\n")
          .filter(Boolean)[0] || "";
    } catch {}
    prevTagByPkg.set(pkg.name, prevTag);
  }

  function isCommitInTag(commit: string | undefined, tag: string | undefined): boolean {
    if (!commit || !tag) return false;
    try {
      execSync(`git merge-base --is-ancestor ${commit} ${tag}`, { stdio: "ignore" });
      return true;
    } catch {
      return false;
    }
  }

  const byPkg = new Map<string, Groups>();
  for (const cs of changesets) {
    for (const release of cs.releases) {
      if (release.type === "none") continue;
      if (isCommitInTag((cs as any).commit, prevTagByPkg.get(release.name))) continue;
      let groups = byPkg.get(release.name);
      if (!groups) {
        groups = { major: [], minor: [], patch: [] };
        byPkg.set(release.name, groups);
      }
      groups[release.type as ReleaseType].push({ changeset: cs, type: release.type as ReleaseType });
    }
  }

  const labels: Record<ReleaseType, string> = {
    major: "Major Changes",
    minor: "Minor Changes",
    patch: "Patch Changes",
  };
  for (const pkg of packages) {
    const groups = byPkg.get(pkg.name);
    const parts: string[] = [];
    if (groups) {
      for (const t of ["major", "minor", "patch"] as const) {
        if (groups[t].length === 0) continue;
        parts.push(`### ${labels[t]}`, "");
        for (const { changeset, type } of groups[t]) {
          parts.push(await getReleaseLine(changeset, type, null));
        }
        parts.push("");
      }
    }
    if (parts.length === 0) parts.push("No new changes since the previous release.", "");

    const prevTag = prevTagByPkg.get(pkg.name);
    if (prevTag && repo) {
      const currentTag = `${pkg.name}@${pkg.version}`;
      const compareUrl = `https://github.com/${repo}/compare/${encodeURIComponent(prevTag)}...${encodeURIComponent(currentTag)}`;
      parts.push(`**Full Changelog**: ${compareUrl}`);
    }

    const safe = pkg.name.replace(/[@/]/g, "_");
    fs.writeFileSync(path.join(outDir, `${safe}.md`), parts.join("\n"));
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
