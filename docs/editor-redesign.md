# Editor redesign — 2026-10-28

The primary product is one map styling workspace. Minimal is an importable JSON template, not a separate app. The original light CSS reference is the palette source; invented beige/olive colors were removed after user feedback. The user confirmed the light direction.

## Implementation and review stages

1. Palette/data audit: all29 roles traced to exact source variables; clean native indoor `Minimal.json` and public MapLibre `Minimal.outdoor.json` generated deterministically. Input validation rejects malformed supported values with field paths.
2. Toolcraft integration: pinned MIT upstream source components retained with Base UI behavior and scoped CSS. Buttons, menus, selects, inputs and disclosures are real Toolcraft components. No starter scaffolder replaced the editor engine.
3. Main workspace: Import/Export remain visible. Advanced actions are grouped in Map/Tools. Layers and a contextual inspector share a compact left rail. Common appearance properties show first; data/filter/JSON and uncommon properties are disclosed deliberately.
4. Indoor documents: the same root workspace accepts native Mappedin theme JSON, edits it against a public Office Demo, and exports only the supported theme fields. Role previews and demo credentials never enter exports. Emoji are stripped from display labels without modifying source venue records. The former template route redirects to the editor.
5. Review: independent source reviews caught and fixed mismatched wall paths, missing imported opacity, ineffective unlinked heights, menu focus restoration, and text-field undo interception. Browser checks cover both JSON types, editing/exports, palette fields, advanced disclosures and invalid imports. Toolcraft popup keyboard/focus behavior was manually checked in the app browser.

The indoor preview uses controlled public demo room labels for an explicit demo role map; integrations with customer venues should supply their own stable ID/metadata role resolver. The selected-space role preview can demonstrate any semantic role without changing the template format.

## Verification result

The final production build, TypeScript, ESLint, Sass Stylelint and diff checks passed. Vitest:78 tests passed. Focused Chromium coverage:39 outdoor checks plus5 integrated indoor checks;4 affected disclosure/color checks also passed after the final inspector adjustment. A deliberately wrong export filename was rejected by the new test before restoration. The complete legacy browser suite was not run.

Direct app-browser checks verified a menu opens from Enter, Escape restores its trigger, a floor changes from the keyboard, and a room color edit visibly changes rendered geometry. Final Minimal was re-imported afterward, leaving the editor on the clean source palette. Public demo data and desktop browsers were used; private venue integrations and physical touch devices were not tested.
