# Minimal

Minimal is a light map theme imported and edited in the main Map Stylizer workspace. It uses the actual light tokens in the supplied reference CSS: neutral white surfaces, cool grays, clear blue interaction colors, pale blue water, and a restrained green fill.

## Import the JSON in the editor

Run `npm start` and open **http://127.0.0.1:8888/**. Use **Import JSON** to open `src/templates/minimal/Minimal.json` in the main editor. No separate Minimal page is needed.

| File in `src/templates/minimal/` | Purpose |
| --- | --- |
| `Minimal.json` | Primary clean indoor theme. Plain JSON using the Mappedin Studio contract, with no TypeScript wrapper or application envelope. Import this in Map Stylizer. |
| `Minimal.outdoor.json` | Clean MapLibre v8 style using public OpenFreeMap tiles/fonts. Import this for the outdoor layer editor. |
| `palette.json` | Source of truth for 29 named color roles. Edit this, then regenerate. |
| `reference.tokens.json` | Seventeen normalized reference tokens and exact source-variable mappings for every role. |
| `indoor.json` | Same indoor theme as `Minimal.json`, retained as a compatibility path for SDK code. |
| `outdoor.json` | Matching outdoor style targeting Mappedin’s authenticated tile/font service. Use this inside Mappedin JS. |
| `outdoor-preview.json` | Public MapLibre style retained as a compatibility path for the gallery. |
| `indoor.studio.ts` | Optional self-contained TypeScript wrapper for Mappedin Studio’s Indoor Style upload. |
| `thumbnail.svg` | Original schematic gallery thumbnail using the template palette. |

Regenerate the JSON and Studio wrapper with:

```sh
npm run templates:build
```

The generator validates the outdoor files with the installed MapLibre style specification. Do not edit generated files directly. Map configuration colors remain six-digit sRGB hex, the format the map renderers consume.

## Corrected color application

The previous pass used authored beige and olive geometry colors even though the extracted site tokens were white and cool gray. Those invented values have been removed. Every one of the 29 current color roles now uses a value present in the second supplied CSS file’s light `:root` block. `reference.tokens.json` records the exact variable and source for each role.

The source defines interface colors, not the reference company’s roads, water, parks, tile schema, or cartographic label rules. Assigning those colors to map geometry is our design decision. In particular, water uses the source’s pale blue `#add6ff` accent-disabled token; parks use the source’s `#f5fff6` success-fill token; major roads use `#fffef2` warning-fill. These are transparent semantic mappings, not recovered cartography.

| Role | Previous value | Corrected value | Light source variable |
| --- | --- | --- | --- |
| `canvas` | `#f9f5ed` | `#fbfbfd` | `--apl-color-fill-secondary` |
| `surface` | `#ffffff` | `#ffffff` | `--apl-color-fill-primary` |
| `surfaceMuted` | `#f5f5f7` | `#f5f5f7` | `--apl-color-fill-tertiary` |
| `border` | `#e8e8ed` | `#e8e8ed` | `--apl-color-border-muted` |
| `text` | `#1d1d1f` | `#1d1d1f` | `--apl-color-glyph-default` |
| `textSecondary` | `#6e6e73` | `#6e6e73` | `--apl-color-glyph-muted` |
| `accent` | `#0071e3` | `#0071e3` | `--apl-color-fill-action-brand-accent-default` |
| `hover` | `#eaf3fc` | `#f5faff` | `--apl-color-glyph-action-brand-accent-disabled` |
| `selected` | `#d6eaff` | `#d6eaff` | `--apl-color-fill-action-brand-accent-selection` |
| `land` | `#f6f5f1` | `#fbfbfd` | `--apl-color-fill-secondary` |
| `park` | `#e3ecdf` | `#f5fff6` | `--apl-color-fill-success` |
| `water` | `#cfe4ee` | `#add6ff` | `--apl-color-fill-action-brand-accent-disabled` |
| `waterLabel` | `#456b7b` | `#00488f` | `--apl-color-fill-action-brand-accent-pressed` |
| `building` | `#e9e6e0` | `#e8e8ed` | `--apl-color-border-muted` |
| `buildingOutline` | `#d8d4cd` | `#d2d2d7` | `--apl-color-fill-action-secondary-pressed` |
| `road` | `#ffffff` | `#ffffff` | `--apl-color-fill-primary` |
| `roadCasing` | `#deddd8` | `#d2d2d7` | `--apl-color-fill-action-secondary-pressed` |
| `highway` | `#f3ead7` | `#fffef2` | `--apl-color-fill-warning` |
| `rail` | `#c9c7c2` | `#86868b` | `--apl-color-border-default` |
| `room` | `#f0eeea` | `#f5f5f7` | `--apl-color-fill-tertiary` |
| `hallway` | `#ffffff` | `#ffffff` | `--apl-color-fill-primary` |
| `inaccessible` | `#dedbd5` | `#e8e8ed` | `--apl-color-border-muted` |
| `bathroom` | `#e7f1f7` | `#f5faff` | `--apl-color-glyph-action-brand-accent-disabled` |
| `connection` | `#edf2f5` | `#d6eaff` | `--apl-color-fill-action-brand-accent-selection` |
| `wall` | `#d5d1c9` | `#d2d2d7` | `--apl-color-fill-action-secondary-pressed` |
| `wallTop` | `#a5a29b` | `#86868b` | `--apl-color-border-default` |
| `object` | `#e4e0d8` | `#e8e8ed` | `--apl-color-border-muted` |
| `success` | `#378447` | `#008009` | `--apl-color-glyph-success` |
| `error` | `#c83338` | `#e30000` | `--apl-color-glyph-error` |

No copied layout CSS, utility classes, proprietary fonts, symbols, or imagery are required by these JSON files. The template contains no emojis or icon characters. If venue names contain emojis, the editor’s label presentation must normalize those names separately; a color template does not change venue data.

## What was removed from the reference

The first paste begins with `root` instead of `:root` and contains duplicated responsive/dark overrides, shell layout rules, and alpha values. Both pastes contain compiler flags or framework-prefixed utility rules rather than reusable map settings. One token, `--system-white-a17: #ffffff17`, encodes approximately 9% opacity despite its name. The cleanup excludes this ambiguous alpha token, Lightning CSS light/dark flags, resets, utility classes, and proprietary font/symbol references.

Short hex values are expanded and case is normalized. The light `:root` block is authoritative; later dark-mode overrides are not accidentally mixed into this light template. The cream shell background `#f9f5ed` is present in the first paste, but is no longer used as the map canvas. Dark mode can be developed as its own deliberate variant.

## Mappedin and MapLibre formats

`Minimal.json` is indoor theme data. It is not a `show3dMap` options object, a MapLibre layer style, or MVF venue geometry. The main editor recognizes this indoor contract and applies its geometry colors through Mappedin JS. Importing `Minimal.outdoor.json` opens a MapLibre style with editable layers.

The editor previews the public Office Demo. Its known washroom and service-room labels are mapped explicitly for that demo only; this is not a classifier for arbitrary venues. After selecting a space, **Preview role** temporarily renders it as any supported room category so every category color can be inspected, even when the demo lacks that category. Role overrides are preview state only: they do not change venue geometry, are not saved into the theme JSON, and are not included in exported files.

For a custom Mappedin application, apply the indoor theme through `updateState` using the included typed adapter or your own integration. Venue-specific room roles should be mapped by stable IDs or metadata; do not infer bathrooms, connections, or inaccessible rooms from English names. Exterior, void, and open-to-below spaces should retain their structural behavior. Markers, paths, labels, and selection require application behavior; having those color tokens in a JSON file does not create those objects or event handlers.

`outdoor.json` uses Mappedin’s authenticated tile and font endpoints and is intended for its SDK. `Minimal.outdoor.json` uses public OpenFreeMap assets for independent MapLibre editing. The source-layer and field schema must be checked when switching providers; a URL substitution alone is not a general compatibility guarantee. Each public style includes the data attribution.

## References and provenance

- [Mappedin Studio formats](https://developer.mappedin.com/docs/tools/mappedin-studio)
- [Mappedin outdoor styling](https://developer.mappedin.com/web-sdk/outdoor-map)
- [Mappedin indoor colors and textures](https://developer.mappedin.com/web-sdk/images-textures)
- [Mappedin demo keys, maps, and terms](https://developer.mappedin.com/docs/demo-keys-and-maps)
- [OpenFreeMap setup and attribution](https://openfreemap.org/quick_start/)

Formats and endpoint conventions were initially checked against the official guides and a public Mappedin Studio export on 2026-10-28. Source hashes of the user-supplied CSS files are recorded in `reference.tokens.json`. No reference-company implementation or pasted stylesheet is redistributed. The Mappedin SDK retains its separate license and third-party notices.

## Template validation

Both outdoor provider variants pass the installed MapLibre style validator. `Minimal.json` matches the Studio indoor contract already accepted by the public Studio importer, and is identical to `indoor.json`. Generation is deterministic. Tests of editor import, geometry application, and UI behavior belong to the main editor’s verification, rather than to this palette provenance record.
