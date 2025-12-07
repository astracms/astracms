# Changesets

This directory is used by [Changesets](https://github.com/changesets/changesets) to manage versioning and changelogs for the AstraCMS packages.

## Adding a changeset

When you make a change that should be released, run:

```bash
pnpm changeset
```

This will prompt you to:
1. Select which packages have changed
2. Choose the semver bump type (major, minor, patch)
3. Write a summary of the changes

## Publishing

Publishing is handled automatically by the GitHub Actions release workflow. When changesets are merged to main, a "Version Packages" PR will be created. Merging that PR triggers the npm publish.
