# Map Stylizer

A visual map styling tool built on [Maputnik](https://github.com/maplibre/maputnik) and MapLibre GL JS.

## Run locally

Use Node.js 22.13 or newer, as supported by the upstream project. The existing `.nvmrc` is retained.

```sh
npm ci
npm start
```

Open **http://localhost:8888/**. The editor saves your work in this browser's local storage. Use **Save** to download a style file you can keep or use elsewhere.

## What you can do

- Open a starter style, a style URL, or your own style JSON.
- Edit layers, colors, typography, filters, expressions, and data sources with a live map preview.
- Inspect map features and edit the full style as JSON.
- Undo and redo changes, then export your style or an HTML map.

Some starter styles and tile providers require their own API keys. The application does not need a backend to edit styles; map tiles, fonts, sprites, and search use the providers configured in the style/editor and need network access. Browser storage is specific to this origin and browser.

## Build and verify

```sh
npm run build
npm run lint
npx vitest run
npx playwright install chromium
npm test
```

Production files are written to `dist/`. Serve that directory with a static web server. For hosting under a subpath, build with the matching base:

```sh
MAP_STYLIZER_BASE_PATH=/map-stylizer/ npm run build
```

No hosted deployment is configured for this fork yet.

## Upstream and license

Forked from [maplibre/maputnik](https://github.com/maplibre/maputnik). The original MIT license, copyright notices, editor internals, translations, and upstream artwork are retained. Maputnik and MapLibre are the upstream projects; this is an independent fork.

See [fork notes](docs/FORK.md) for the source revision and update procedure, and [the original README](docs/UPSTREAM_README.md) for upstream documentation.
