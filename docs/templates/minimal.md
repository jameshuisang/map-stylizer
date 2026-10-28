# Minimal

A light indoor and outdoor map theme for Mappedin JS. Warm neutral geometry recedes, labels stay readable, and blue signals selection and navigation.

## Preview and files

Run `npm start`, then open `http://127.0.0.1:8888/minimal.html` for the Mappedin Office Demo. The existing editor also links to Minimal and offers it as the first style in **Open → Gallery Styles**.

| File in `src/templates/minimal/` | Purpose |
| --- | --- |
| `palette.json` | Source of truth for the 29 named colors. Edit this, then regenerate. |
| `reference.tokens.json` | Nine cleaned light interface tokens extracted from the two user-supplied CSS files, with source hashes. |
| `indoor.json` | Mappedin Studio indoor theme data. Apply with the SDK adapter. |
| `indoor.studio.ts` | Self-contained version accepted by Mappedin Studio’s Indoor Style upload. |
| `outdoor.json` | MapLibre v8 JSON targeting Mappedin’s authenticated OSM tiles and existing font endpoint. |
| `outdoor-preview.json` | Same visual rules with OpenFreeMap tiles/fonts for the standalone Maputnik editor. This is a separate provider configuration, not a replacement for the Mappedin export. |
| `thumbnail.svg` | Original schematic gallery thumbnail; not a screenshot of real geography. |

```sh
npm run templates:build
```

The generator validates both outdoor styles with the installed MapLibre style specification. Do not edit generated files directly. The template uses hex colors because the target map configuration accepts this format; the preview’s own CSS uses OKLCH.

## What was cleaned

The pasted material is web interface CSS. It does not provide the vector map’s land, water, roads, buildings, tile schema, or label collision rules. We retained a small color reference and independently designed the map palette and layer rules. No copied website layout CSS, proprietary fonts, symbols, or images are shipped.

The first paste starts with `root` instead of `:root`. Both pastes include large reset/layout/utility sections, repeated theme overrides, framework-prefixed variables, and values such as Lightning CSS light/dark flags that are compiler machinery rather than design choices. One misleading alpha token (`--system-white-a17: #ffffff17`) encodes about 9% opacity, despite its name. Those rules and ambiguous tokens were discarded rather than carried into the template.

The nine reference tokens retain their source values (short white normalized from `#fff` to `#ffffff`). The primary accent consistently uses `#0071e3`, rather than mixing it with the first paste’s `#007aff`. The cream map shell `#f9f5ed` informs the canvas. The water, greenery, building, road, and indoor geometry colors in `palette.json` are authored choices, not extracted cartography. Dark mode remains a separate future template.

## Mappedin integration

Mappedin Studio exports indoor theme data as TypeScript-wrapped JSON and outdoor styles as MapLibre JSON. These are different contracts; neither file is MVF venue geometry. The indoor JSON is not a `show3dMap` options object and does not automatically style a map when fetched.

The typed adapter at `src/minimal/apply-indoor.ts` applies geometry colors/heights through `updateState`. `src/minimal/preview.ts` demonstrates creation, labels, selection, floors, error recovery, and downloads using Mappedin JS 6.30.0. The preview uses only Mappedin’s published public demo credentials and map, with no private credentials or customer data.

```ts
import { getMapData, show3dMap } from '@mappedin/mappedin-js';
import { applyMinimalIndoor } from './src/minimal/apply-indoor';

const mapData = await getMapData(yourMapOptions);
const mapView = await show3dMap(container, mapData, {
  outdoorView: { style: absoluteHostedMinimalOutdoorUrl },
});
applyMinimalIndoor(mapView, mapData, space =>
  spaceRoles[space.id] ?? (space.type === 'hallway' ? 'hallway' : 'standard')
);
```

`spaceRoles` is a venue-specific map of IDs to `standard`, `inaccessible`, `bathroom`, `hallway`, or `connection`. The adapter does not guess room meaning from English names. It preserves exterior/void/open-to-below spaces. Selection, labels, path colors, and marker colors require application behavior; theme tokens alone do not create those objects or event handlers. The adapter intentionally changes space and object heights for the low-rise Minimal appearance.

Host the outdoor JSON on a URL accessible to your app. Mappedin’s tile and font endpoints require SDK authentication; they are not a standalone public tile service. Use the public preview variant for Maputnik. OpenFreeMap data attribution is included in that variant. Changing tile providers requires checking source-layer and field compatibility, not just swapping a URL.

## References and provenance

- [Mappedin Studio formats](https://developer.mappedin.com/docs/tools/mappedin-studio)
- [Mappedin outdoor styling](https://developer.mappedin.com/web-sdk/outdoor-map)
- [Mappedin indoor colors and textures](https://developer.mappedin.com/web-sdk/images-textures)
- [Mappedin demo keys, maps, and terms](https://developer.mappedin.com/docs/demo-keys-and-maps)
- [OpenFreeMap setup and attribution](https://openfreemap.org/quick_start/)

Formats and endpoint conventions were checked against the official guides and a download from the public Mappedin Studio demo on 2026-10-28. No baseline Studio implementation or pasted CSS stylesheet is redistributed. Mappedin SDK licensing is separate from the Maputnik fork’s MIT license; its package retains its own license and third-party notices.

## Verification

On 2026-10-28, the production build and ESLint passed, along with 52 Vitest tests. Twelve focused Chromium checks passed for the gallery, editor, imports, and downloads. All three downloads were also verified against the packaged production build, including its inlined indoor JSON asset. A deliberately wrong expected filename made the new download assertion fail, then the original assertion was restored.

The Studio upload accepted `indoor.studio.ts` and displayed the Minimal colors. The Mappedin Office Demo rendered in both development and production builds; both floors and the keyboard room selector were checked visually. These checks used desktop browsers and public demo data, not a private customer venue or physical mobile device.
