# Changelog

All notable changes to `dsh-ui-zoom` are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses
[Semantic Versioning](https://semver.org/).

## [0.4.2] - 2026-11-23

### Fixed

- A zoom step no longer dispatches a second `resize` event; every step used to
  make the application reflow twice.
- Disabling the plugin now removes its injected stylesheet, so the
  `[data-dsh-panel-host]` compatibility rule cannot leak into a 100% UI.
- Re-activation (HMR) refreshes the stylesheet instead of keeping stale rules.

### Added

- Zoom changes made in another window or tab of the same GUI are followed
  through the `storage` event.
- The HUD toast is announced through `role="status"` / `aria-live`, preset
  buttons expose `aria-pressed`, the settings row is a labelled `role="group"`,
  and the current percentage is a polite live region.
- `package.json` now carries `repository`, `homepage` and `bugs` metadata.

### Changed

- The stepper buttons and `Ctrl + wheel` now use uniform 5% steps from 50% to
  250%. The old ladder jumped 135 → 150 (and 150 → 175), so 140/145 and the
  other skipped values were unreachable from the controls.

## [0.4.1] - 2026-11-23

### Fixed

- Pointer, mouse and touch event coordinates (`clientX/clientY`, `pageX/pageY`,
  `offsetX/offsetY`, `movementX/movementY`, `x/y`) are normalized into the same
  CSS layout-pixel space as `getBoundingClientRect` and `window.innerWidth`.
  This fixes the caret and selection in the sidebar's CodeMirror markdown
  editor landing far from the pointer, and the same class of offset in context
  menus, drag handles, image panning and terminal selection.
- The old raw-rect exception for `.dshwv-img` is gone; the whale widget's
  hit-test ratio is unchanged because rect and event coordinates now share one
  space.

### Changed

- `caretRangeFromPoint` and `caretPositionFromPoint` convert layout pixels back
  to the visual pixels the DOM hit-testing APIs expect.
- Documented the APIs that intentionally stay in visual pixels: window scroll
  offsets, `document.documentElement.clientWidth/clientHeight`,
  `IntersectionObserverEntry` rects, wheel deltas and `screenX/screenY`.

## [0.4.0] - 2026-10-18

### Fixed

- Fixed `100vh` overlay hosts (for example `[data-dsh-panel-host]` panels)
  overflowing the viewport under CSS zoom.

### Changed

- Reworked the coordinate engine and compatibility-shim layer around one
  layout-pixel viewport/rect model, keeping the whale widget working.
