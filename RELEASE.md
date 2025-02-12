# Next-Yak Release Guide

This document outlines the steps to release new versions of next-yak and yak-swc packages.

## Prerequisites

- Ensure you have pnpm installed
- Have access rights to publish on npm for both packages
- Have write access to the repository

## Release Steps

1. **Merge Pull Requests**
   - Review and merge all relevant PRs for this release
   - Ensure CI passes for all merged changes

2. **Update Main Branch**
   ```bash
   git checkout main
   git pull
   ```

3. **Install Dependencies**
   ```bash
   pnpm install
   ```
   This ensures all packages are properly installed after merges

4. **Version Update**
   ```bash
   pnpm run changeset version
   ```
   This will:
   - Update package.json files
   - Update CHANGELOG.md files

5. **Review Changes**
   - Review all generated CHANGELOG.md files
   - Ensure version bumps are appropriate
   - Check for any formatting issues

6. **Publish yak-swc (if changed)**
   ```bash
   cd packages/yak-swc
   pnpm publish . --no-git-checks
   ```

7. **Publish next-yak (if changed)**
   ```bash
   cd packages/next-yak
   pnpm publish . --no-git-checks
   ```

8. **Commit Changes**
   ```bash
   git add .
   git commit -m "release next-yak x.x.x and yak-swc x.x.x"
   ```
   Replace x.x.x with actual version numbers

9. **Create Release Tags**
   ```bash
   pnpm run changeset tag
   ```

10. **Push Changes**
    ```bash
    git push --follow-tags
    ```

## Post-Release Verification

- Verify packages are available on npm
- Check package installations work in a new project
- Verify documentation is updated
- Monitor for any reported issues