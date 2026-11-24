# Changelog

All notable changes to `dsh-ui-zoom` are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses
[Semantic Versioning](https://semver.org/).

## [0.7.0] - 2026-11-24

### Added

- **Diagnostics mode** (off by default) for future zoom reports: a toggle in
  Settings → General → UI Zoom (localStorage override, applies immediately, no
  restart), a Host Config `diagnostics` for the from-boot default, a console
  event log with a `[dsh-ui-zoom]` prefix, and a "Copy diagnostics report"
  button that puts a JSON snapshot on the clipboard. The snapshot carries the
  plugin version (injected by the host half), effective settings, the viewport
  metrics the plugin normalises plus a `consistent` flag, which compatibility
  layers are on, the Windows titlebar drag-region state, every element carrying
  `data-dsh-ui-zoom-clamp` with its rect, and the last 40 shim decisions
  (zoom, clamps, drag-region lift, toggle).
- `window.__dshUiZoomDiagnostics()` exposes the same snapshot to page scripts.

### Changed

- The host half publishes its own version alongside the config, so a report
  always names the build that produced it.

### Tests

- Diagnostics checks: the API is present and disabled by default, and with the
  localStorage override it reports zoom, space consistency, the clamped dialog
  and the drag-region state (42 checks total).

## [0.6.3] - 2026-11-24

### Fixed

- `document.documentElement.clientWidth/clientHeight/scrollWidth/scrollHeight`
  are normalised to layout pixels like the patched rects and `innerWidth`. They
  are Chromium's root-viewport special case and used to stay in visual pixels,
  which made installed plugins mix coordinate spaces under zoom:
  - `dsh-rewind-plugin` clamps its panel with
    `rect.right <= document.documentElement.clientWidth`; with a layout-pixel
    rect against a visual-pixel viewport the panel always "fitted", so at 175%
    it could open off-screen.
  - CodeMirror (the sidebar editor) decides "iOS virtual keyboard is open" from
    `visualViewport.height * scale / documentElement.clientHeight < 0.85`; with
    a patched `visualViewport.height` (483) against a visual
    `clientHeight` (846) that ratio was 0.57, i.e. a permanent false positive.

### Tests

- New check that `innerWidth`, `innerHeight`, `body.clientWidth`,
  `documentElement.clientWidth/clientHeight` and the root rect all agree at
  150%, plus teardown removing the instance shadow properties (40 checks).

## [0.6.2] - 2026-11-24

### Fixed

- The drag-region lift no longer costs script time. 0.6.1 gated it with
  `html:has([aria-modal="true"]) …, html:has(dialog[open]) …`; a harness
  benchmark (3000 rows, constant text updates and appends, forced layout per
  iteration) measured **+76% script time** for one such rule and **+161%** for
  two, which a streaming chat would pay on every mutation. The flag is now
  maintained by the plugin as `html[data-dsh-ui-zoom-modal]`, kept in sync on
  click / pointerup / keydown / `toggle` plus a 1.5 s safety net for modals the
  app opens on its own. Same behaviour, no selector to re-evaluate.

### Tests

- New check that the flag appears while a dialog is open and disappears once it
  closes (39 checks total).

## [0.6.1] - 2026-11-24

### Fixed

- Modal surfaces no longer fall inside the window's titlebar drag region. On
  Windows the DSH frame paints that region as a `-webkit-app-region: drag`
  pseudo-element (`--dsh-windows-titlebar-height` tall), and a drag region is
  non-client area: the page never sees hover or clicks there. Once the interface
  is zoomed, a modal that reaches the top of the window (the settings surface at
  175%, for instance) puts its header — and the close button — inside that band,
  so the button looks complete but only the few pixels below the band respond.
  `WM_NCHITTEST` over the band reports `HTCAPTION`, which is how the band was
  identified. The shim now keeps modal surfaces out of the drag region and drops
  the titlebar's own drag region while a modal is open (it comes back through
  `:has()` as soon as the modal closes), so the window cannot be dragged behind
  a modal — which is what a modal wants anyway.

### Verification

- Regression suite still 38/38; the fix itself has to be verified in the desktop
  shell, where drag regions exist (headless Chromium has none).

## [0.6.0] - 2026-11-24

### Added

- Fixed-position overlays sized from viewport units are now capped as well, not
  just modal dialogs. The shim scans the same-origin stylesheets once for rules
  that size a box with `vh`/`dvh`/`vw` (cached until a plugin injects another
  sheet), then, on the same triggers as the dialog shim plus clicks/popovers,
  marks the ones that are anchored to the viewport, scroll their own overflow
  and really run past the window. That fixes the route panel in
  `dsh-harness-remote` and the peak/guide overlays in `dsh-cost-meter` at
  125%+, which used to lose their bottom edge (and their scroll target) to the
  window clip. Backdrops and fullscreen viewers are left alone: capping paint
  would not make anything reachable.
- `compatOverflowClamp` Host config (default `true`) to switch that pass off;
  the attribute-based CSS itself is shared with `compatDialogClamp`.

### Changed

- The `data-dsh-ui-zoom-clamp` stylesheet rule now caps generic overlays with
  `calc(100% - 64px)` and keeps the chrome-aware cap for `<dialog>` elements,
  which sit under the app title bar.

### Tests

- New fixture and checks for a fixed `max-height: calc(100vh - 72px)` overlay:
  clamped and reachable at 150%, untouched at 100%, and a control run with
  `compatOverflowClamp: false` proving it overflows without the shim.

## [0.5.3] - 2026-11-24

### Added

- The viewport-overflow cap is now available to third-party overlays, not just
  modal dialogs: an element that anchors itself to the viewport and carries
  `data-dsh-ui-zoom-clamp` gets `max-height`/`max-width` capped to the zoomed
  viewport by the plugin stylesheet. This is the zero-code way for a plugin
  sized with `100vh` (see `dsh-harness-remote`'s route panel) to stay inside the
  window; no change to that plugin's source is needed.

### Fixed

- The fallback keyboard listener no longer intercepts `Ctrl/Cmd + =`, `-` and
  `0` during an IME composition (`isComposing` or keyCode 229), where those keys
  belong to the input method.

### Documentation

- README FAQ documents the `dsh-better-sidebar` interaction: its panel-host
  geometry self-check compares the patched rect against `innerHeight × zoom`,
  which no longer holds once the compatibility rule caps the host to the window.
  The visual result stays correct, but the sidebar logs a "panel host geometry
  mismatch" warning and keeps a degraded rAF sync loop; the upstream fix is to
  compare against a probe element instead of `innerHeight × zoom`.

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
