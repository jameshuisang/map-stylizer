# Toolcraft controls used by Map Stylizer

These are source-owned controls adapted from [Pixel Point Toolcraft](https://github.com/pixel-point/toolcraft), commit `4952c4a59dc85a5a29079d81c8666c4898461ab6`, retrieved 2026-10-28. Toolcraft is MIT-licensed; the full required notice is in `LICENSE.toolcraft.md`.

Button (including its loading state), Input, Accordion, DropdownMenu, and supporting primitives come from `starter/src/toolcraft/ui/`. The Select compound structure is trimmed to the parts this app uses. Base UI still owns keyboard navigation, popup positioning, focus, and ARIA behavior.

Local adaptation: imports are local, stable `tc-*` classes style the upstream `data-slot` parts with the project's CSS pipeline, and the Select removes optional runtime-only portal layering and scroll-fade helpers. We do not install the entire Toolcraft application/runtime, add Tailwind to the existing Sass application, or claim compatibility with Toolcraft's generated runtime verification gates. This is a component integration, as requested for this existing editor.

Import from `src/components/toolcraft`; the index loads its scoped CSS. `DropdownMenuContent` and `SelectContent` portal to the body and retain their own scoped presentation.
