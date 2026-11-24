# Changelog

All notable changes to `dsh-ui-zoom` are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses
[Semantic Versioning](https://semver.org/).

## [0.5.2] - 2026-11-24

### Fixed

- Modal dialogs no longer flash at their overflowing size before the shim pulls
  them back into the window. The clamp is now applied inside a patched
  `HTMLDialogElement.prototype.showModal`, in the same task that opens the
  dialog, so the very first frame is already capped; before, the clamp waited
  for the `toggle` event and a `requestAnimationFrame`, which let the dialog
  paint one frame at its overflowing position and then visibly jump. The
  `toggle` path stays as a fallback for dialogs shown through the `open`
  attribute, and the `ResizeObserver` keeps handling content that arrives later
  (it runs after layout but before paint, so that path does not flash either).

### Added

- Regression check that the clamp is in place for the dialog's first paint, plus
  a control run showing the dialog un-clamped without the `showModal` patch.

## [0.5.1] - 2026-11-24

### Fixed

- Modal `<dialog>` elements from third-party plugins no longer overflow the
  window under zoom. Chromium does not divide viewport units by the CSS zoom
  factor, so a dialog that caps itself with `max-height: calc(100vh - …)` is
  laid out zoom-factor times taller than the window at 125%+; `margin: auto`
  then pushes its header — close button included — above the window's top edge,
  leaving a couple of pixels of that button on screen. It looked present, but
  hover and clicks only landed in that sliver. The shim measures open modal
  dialogs in the plugin's layout-pixel space, marks the ones that really
  overflow with `data-dsh-ui-zoom-clamp`, and caps those with percentages
  (which do resolve against the zoomed viewport). Dialogs that already fit, and
  every dialog at 100%, keep the author's CSS untouched.

### Added

- `compatDialogClamp` Host config (default `true`) to switch the dialog shim
  off, alongside the existing `compatOverlayHostHeight`.
- `--dsh-ui-zoom-factor` custom property on the root element while zoomed, so
  third-party CSS that has to stay zoom-correct can divide `vh`/`vw` values by
  it.
- Regression coverage for the dialog shim: overflow at 150% is fixed, the
  button is hit-testable again, the 100% layout is untouched, and a control
  run with the shim disabled reproduces the original overflow.

## [0.5.0] - 2026-11-23

### Added

- Client locale service integration: the settings row and HUD register a
  `uiZoom` dictionary and resolve copy through `ctx.locale`, so a language
  switch applies immediately; the browser language remains the fallback.
- Host `Config` (`defaultScale`, `minScale`, `maxScale`, `step`,
  `compatOverlayHostHeight`) declared in `index.js` and injected into the page,
  replacing the hard-coded ladder limits.
- Zoom commands register with `ctx.shortcuts` when the service is available,
  making them visible/rebindable in Settings → Shortcuts with conflict checks;
  registration failures or a missing service fall back to the raw listener.
- Dependency-free regression harness (`test/`) driving real Chromium over the
  DevTools protocol, plus a GitHub Actions workflow.
- `Ctrl + wheel` steps are coalesced to one ladder step per animation frame.

### Changed

- The compatibility rule for `100vh` overlay hosts can be disabled through
  `compatOverlayHostHeight`.

### Fixed

- `elementFromPoint`, `elementsFromPoint`, `caretRangeFromPoint` and
  `caretPositionFromPoint` now scale layout-pixel inputs up to the visual
  pixels the DOM hit-testing APIs expect; the previous conversion divided in
  the wrong direction.

### Documentation

- Rewrote the Chinese and English README: real installation commands
  (`dsh plugin --profile … add`), the Desktop Plugin Manager flow, upgrade and
  removal, the config reference, a FAQ, and a warning that the npm package of
  the same name belongs to a different project.
- Refreshed the plugin metadata descriptions in `locale/zh.json` and
  `locale/en.json`.

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
