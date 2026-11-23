# dsh-ui-zoom

[English](README.en.md) | [中文](README.md)

[![regression](https://github.com/MatrixC7/dsh-ui-zoom/actions/workflows/regression.yml/badge.svg)](https://github.com/MatrixC7/dsh-ui-zoom/actions/workflows/regression.yml)

> A global UI zoom plugin for [DeepSeek Harness (DSH)](https://github.com/deepseek-ai/deepseek-harness). Like VS Code window zoom, it scales the whole interface — sidebars, composer, buttons, chat cards, spacing, icons and fonts — from 50% to 250%.

![UI Zoom icon](icon.svg)

---

## ✨ Features

- 🔍 **Proportional UI zooming** — scales every interface element, not just the font size.
- ⚙️ **Native settings row** — registered under **Settings → General → UI Zoom**, right below the font size option.
- 🎛️ **Presets and 5% fine-tuning**
  - Presets: `80%`, `90%`, `100%`, `110%`, `125%`, `150%`.
  - Stepper buttons (`−` / `+`) and `Ctrl + wheel` use one uniform 5% ladder (50%–250%), so values between 135 and 150 are reachable too.
  - One-click reset to 100%.
- ⌨️ **VS Code-style shortcuts**
  - `Ctrl + =` / `Ctrl + +` (`Cmd` on macOS): zoom in.
  - `Ctrl + -` (`Cmd` on macOS): zoom out.
  - `Ctrl + 0` (`Cmd` on macOS): reset to 100%.
  - `Ctrl + wheel`: continuous zoom, coalesced per animation frame.
  - When the DSH shortcut service is available, the three zoom commands appear in **Settings → Shortcuts** and can be inspected, rebound and conflict-checked; a built-in listener takes over when the service is absent or rejects the registration.
- 🌐 **Follows the UI language** — the settings row and HUD resolve copy through the DSH Client locale service, so language switches apply immediately (browser-language fallback).
- 🧭 **Zoom HUD** — a short-lived percentage toast in the bottom-right corner, announced to assistive technology.
- 🎯 **Correct coordinates and hit-testing** — one coordinate space fixes portal menus, context menus, splitter drags, image panning, terminal selection and the sidebar's CodeMirror markdown editor caret/selection under CSS `zoom`.
- 💾 **Persistent and multi-window** — the zoom level survives reloads and restarts; other windows/tabs of the same GUI follow changes.
- ⚙️ **Deployment config** — default scale, limits, step and the `100vh` overlay/modal-dialog compatibility rules are configurable in the profile's `cordis.patch.yml`.

---

## 📦 Installation

### Requirements

- DeepSeek Harness (Desktop or Web CLI). This repository is verified on DSH `0.2.2-rc.5`.
- The Desktop profile is named `desktop` and is owned by the app: install/remove through **Settings → Plugins**, not the CLI.
- Web/custom profiles use the `dsh` CLI. If it is not installed, replace `dsh` with `npx -y @deepseek-ai/dsh`.
- Linking a local checkout needs Node.js and pnpm.

### Option 1: DSH Desktop (recommended)

1. Open **Settings → Plugins** (Plugin Manager).
2. Choose **Install / Install from GitHub**.
3. Enter the repository:
   ```text
   https://github.com/MatrixC7/dsh-ui-zoom
   ```
   or the Git spec:
   ```text
   github:MatrixC7/dsh-ui-zoom
   ```
4. Restart DSH (the Host half must reload), then refresh the window.

You can also ask the assistant in chat:

> Install the dsh-ui-zoom plugin from GitHub (`MatrixC7/dsh-ui-zoom`) or from the workspace.

### Option 2: CLI (Web / custom profiles)

```bash
# From GitHub (replace "web" with your profile name)
dsh plugin --profile web add github:MatrixC7/dsh-ui-zoom

# Local checkout: link: keeps source edits visible immediately
dsh plugin --profile web add "link:/absolute/path/to/dsh-ui-zoom"

# Or pack a tarball first (replace <version> with the npm pack output)
npm pack
dsh plugin --profile web add ./dsh-ui-zoom-<version>.tgz
```

Restart the profile afterwards:

```bash
dsh --profile web
```

### Do not install by npm package name

This repository is distributed through **GitHub / a local directory**; it is not published to npm. The unrelated npm package named `dsh-ui-zoom` belongs to a different project, so do not run `dsh plugin add dsh-ui-zoom` — it would install that other plugin.

### Upgrade and removal

```bash
# List installed entries
dsh plugin --profile web list

# Upgrade: re-add the latest GitHub version, or update in Plugin Manager
dsh plugin --profile web add github:MatrixC7/dsh-ui-zoom

# Remove
dsh plugin --profile web remove dsh-ui-zoom
```

On Desktop, upgrade, disable or remove from **Settings → Plugins**. Restart DSH after upgrading or removing.

---

## 🚀 Usage

### Settings panel

1. Open **Settings** from the bottom-left gear.
2. Go to **General**.
3. Find **UI Zoom**: pick a preset, fine-tune with `−` / `+`, or click **Reset (100%)**.

### Shortcuts

- `Ctrl + =` zoom in, `Ctrl + -` zoom out, `Ctrl + 0` reset (`Cmd` on macOS).
- `Ctrl + wheel` for continuous zoom, at most one step per frame.
- When the DSH shortcut service is exposed, rebind the three commands under **Settings → Shortcuts**. On Web/Linux some modals intercept shortcuts per DSH rules; Desktop native bindings take priority.

### When changes take effect

- Client-only changes: refresh the window (`Ctrl + R` / `F5`).
- Host Config changes or plugin upgrades: restart DSH.
- The zoom level lives in the GUI origin's `localStorage` (key `dsh.ui.zoom_scale`); clearing site data or changing the Web GUI port resets it to 100%.

---

## ⚙️ Configuration

Override the plugin row in the profile's `cordis.patch.yml` (`config` is replaced wholesale; omitted fields use their defaults):

- Web/custom profile: `~/.dsh/profiles/<profile>/cordis.patch.yml`
- Desktop profile: `%USERPROFILE%\.dsh\profiles\desktop\cordis.patch.yml` (prefer the Plugin Manager's plugin-config entry; restart the app after a manual edit)

```yaml
- id: ui-zoom
  name: dsh-ui-zoom
  config:
    defaultScale: 100        # initial zoom when nothing is stored
    minScale: 50             # lowest selectable zoom
    maxScale: 250            # highest selectable zoom
    step: 5                  # stepper/wheel step, 5–50
    compatOverlayHostHeight: true  # rewrite 100vh overlay hosts to height:100% (better-sidebar compatibility)
    compatDialogClamp: true        # pull modal <dialog>s that overflow the window back inside it
```

| Field | Default | Description |
|---|---|---|
| `defaultScale` | `100` | Initial zoom percentage |
| `minScale` | `50` | Minimum zoom percentage |
| `maxScale` | `250` | Maximum zoom percentage |
| `step` | `5` | Percentage per stepper/wheel step |
| `compatOverlayHostHeight` | `true` | Whether to force `[data-dsh-panel-host] { height:100% }` |
| `compatDialogClamp` | `true` | Whether to pull overflowing modal `<dialog>` elements back inside the window |

Restart DSH after changing these values. On Desktop you can also edit the profile file and restart the app.

---

## ⚠️ Compatibility and Known Limits

- The coordinate engine targets **Chromium** (the Electron runtime of DSH Desktop and Chromium-based Web GUIs); other browsers are not verified.
- Rects, viewport sizes, pointer events and hit-testing inputs share one CSS layout-pixel space. The following keep native visual-pixel semantics and need conversion before mixing: window scroll offsets, `document.documentElement.clientWidth/clientHeight`, `IntersectionObserverEntry` rects, wheel deltas and `screenX/screenY`. See the notes at the top of [`client.js`](client.js).
- Hit-testing APIs (`elementFromPoint` / `elementsFromPoint` / `caretRangeFromPoint` / `caretPositionFromPoint`) accept layout coordinates; the plugin converts them to the visual coordinates the browser expects.
- A third-party plugin that compensates CSS `zoom` on its own can double-convert; disable other zoom/transform plugins first when chasing offsets.
- **Viewport units do not shrink with the zoom factor.** Chromium never divides `100vh`/`100vw` by CSS `zoom`, so an overlay that limits its height with `max-height: calc(100vh - …)` becomes taller than the window once zoomed in. Modal `<dialog>` elements are pulled back inside the window by `compatDialogClamp`; other fixed overlays that need to compensate can divide by `--dsh-ui-zoom-factor`, which the plugin publishes on the root element (e.g. `calc(100vh / var(--dsh-ui-zoom-factor, 1))`).
- Extreme zoom levels (e.g. 250%) still reflow the whole page; wheel coalescing only reduces the frequency.

---

## ❓ FAQ

**The UI Zoom row is missing.**
Make sure the plugin is enabled (the Plugin Manager row is `enabled` with a healthy `fiberPhase`), then restart DSH. The client bundle is only loaded after a refresh.

**Shortcuts do nothing.**
Check **Settings → Shortcuts** for the three Zoom commands and any rebinding/conflicts. On Web/Linux some modals block shortcuts; Desktop native bindings take priority. If the shortcut service is not exposed, the built-in listener handles the keys.

**Changed `config` has no effect.**
Host Config is injected into the page when DSH starts; restart DSH. A window refresh alone is not enough.

**Zoom resets to 100% after every restart.**
Check whether you are on a Web GUI whose port changes, or whether site data was cleared. The Desktop origin is stable.

**The markdown editor caret is still offset.**
Make sure the version is ≥ `0.4.1` and no other plugin changes `transform`/`zoom`. Since 0.4.1, event and rect coordinates share one space.

**Conflict with dsh-better-sidebar's `100vh`.**
The `compatOverlayHostHeight` rule is enabled by default; set it to `false` in the config and restart if needed.

**A dialog is pushed off the window and its × is nearly impossible to click (e.g. the dsh-cost-meter cost dialog).**
That is the viewport-unit issue above: the dialog limits itself with `max-height: calc(100vh - …)`, so above 125% it is laid out taller than the window, stays centred, and its header — close button included — ends up above the top edge with only a few pixels still inside the window. Hover never fires and clicks miss. Since `0.5.1`, `compatDialogClamp` pulls such measured-overflow modal dialogs back inside the window (nothing is touched at 100%); set it to `false` and restart to opt out. The upstream fix for the dialog itself is to use `max-height: calc(100% - …)`, which already resolves against the zoomed viewport.

---

## 🧪 Development and Regression Tests

The repository ships a dependency-free harness: it starts a static server and drives real Chromium over the DevTools protocol, covering pointer coordinates, drag selection, the 5% ladder, `Ctrl + wheel` coalescing, Host Config, locale switching, shortcut registration/fallback, overflowing dialogs and teardown restoration.

```bash
# Requires Node.js >= 22; CHROME_PATH points at Chrome/Chromium (set automatically in CI)
CHROME_PATH=/path/to/chrome npm test
```

[`.github/workflows/regression.yml`](.github/workflows/regression.yml) runs the same harness on every push / PR.

### Local development

```bash
git clone https://github.com/MatrixC7/dsh-ui-zoom.git
cd dsh-ui-zoom

# Install into the Web profile (use the checkout's absolute path; on Windows: "link:E:/Download/dsh-ui-zoom")
dsh plugin --profile web add "link:/absolute/path/to/dsh-ui-zoom"

# Refresh the window after client.js edits; restart DSH after index.js edits
CHROME_PATH=/path/to/chrome npm test
```

---

## 🛠️ Project Structure

```text
dsh-ui-zoom/
├── package.json          # Manifest, version and published file list
├── cordis.patch.yml      # DSH Cordis bundle patch
├── index.js              # Host entry (Config + page injection)
├── client.js             # Client UI, DOM zoom, coordinate engine and shortcuts
├── icon.svg              # Vector icon
├── locale/
│   ├── zh.json           # Chinese plugin metadata
│   └── en.json           # English plugin metadata
├── test/
│   ├── page.html         # Dependency-free regression fixture
│   └── run.mjs           # Chromium/CDP regression runner
├── .github/workflows/
│   └── regression.yml    # CI: regression on push/PR
├── CHANGELOG.md          # Version history
├── README.md             # Chinese documentation (default)
├── README.en.md          # English documentation
└── LICENSE               # MIT
```

---

## 📄 Changelog and License

- See [CHANGELOG.md](CHANGELOG.md) for version history.
- Report issues at [GitHub Issues](https://github.com/MatrixC7/dsh-ui-zoom/issues).
- [MIT License](LICENSE).
