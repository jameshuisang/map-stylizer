# Fork notes

- Product: Map Stylizer
- Repository: https://github.com/jameshuisang/map-stylizer
- Upstream: https://github.com/maplibre/maputnik
- Initial upstream revision: `8a298d4d1329fbf7f1150cd06ef1fae23a138ade` (2026-10-28)
- License: MIT; see `LICENSE` and `desktop/LICENSE`.

The first fork change establishes product metadata, the title and toolbar name, a root deployment path with an optional `MAP_STYLIZER_BASE_PATH`, and local development instructions. The editor is the upstream implementation; custom styling workflows can now be developed on this base. Upstream CSS classes, storage keys, desktop binary names, translations, and artwork remain intact to keep updates manageable.

## Update from upstream

Keep `origin` pointing to this fork and `upstream` pointing to MapLibre. Review and merge upstream on a branch:

```sh
git fetch upstream
git switch -c update-maputnik
git merge upstream/main
npm ci
npm run build
npm run lint
npx vitest run
npm test
```

Review conflicts in product metadata and the deployment base carefully. Upstream CI is retained. Upstream deployment, release, and Dependabot auto-merge jobs are restricted to the upstream repository; configure intentional fork destinations and review permissions before enabling them here. The upstream desktop application has not been customized or validated for this fork.
