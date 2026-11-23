# dsh-ui-zoom

[English](README.en.md) | [中文](README.md)

> A UI Zoom / Window Scaling plugin for [DeepSeek Harness (DSH)](https://github.com/deepseek-ai/deepseek-harness). Scale the entire application interface proportionally (80%, 110%, 125%, 150%, etc.) just like in VS Code.

![UI Zoom Preview](icon.svg)

---

## ✨ Features

- 🔍 **Proportional UI Zooming**: Unlike simple font-size scaling, this scales the entire UI — sidebars, inputs, buttons, chat cards, spacing, icons, and fonts proportionally.
- ⚙️ **Native Settings Integration**: Automatically adds a "UI Scale" (`界面缩放`) section under **Settings -> General**, right below the font size option.
- 🎛️ **Quick Presets & Fine-tuning**:
  - One-click presets: `80%`, `90%`, `100%`, `110%`, `125%`, `150%`.
  - Stepper controls (`−` / `+`) and `Ctrl + Mouse Wheel` adjust in uniform 5% steps (50%–250%).
  - One-click **Reset (100%)** button.
- ⌨️ **Global Keyboard Shortcuts** (VS Code style):
  - `Ctrl + =` / `Ctrl + +` (or `Cmd` on macOS): Zoom in.
  - `Ctrl + -` (or `Cmd` on macOS): Zoom out.
  - `Ctrl + 0` (or `Cmd` on macOS): Reset zoom to 100%.
  - `Ctrl + Mouse Wheel`: Zoom in/out smoothly.
- 🧭 **Visual HUD Feedback**: Shows a clean, translucent toast indicator in the bottom-right corner when zooming via shortcuts or wheel.
- 🎯 **Pixel-Perfect Popover Alignment**: Includes an internal coordinate calibration engine so portal popups (such as the bottom-left account menu, dropdowns, and tooltips) remain perfectly anchored without offset or floating gaps at any zoom level.
- 🖱️ **Unified Pointer Coordinates**: Mouse/touch event coordinates (`clientX/clientY`, `pageX/pageY`, `offsetX/offsetY`, `movementX/movementY`) are normalized into the same CSS layout space as `getBoundingClientRect` and `window.innerWidth`. The caret and selection in the sidebar's CodeMirror markdown editor therefore land exactly under the pointer, and drag handles, context menus and image panning stay aligned at any zoom level.
- 💾 **Persistent**: Zoom settings are saved in local storage and automatically restored across sessions and page reloads; other windows/tabs of the same GUI follow zoom changes automatically.

---

## ⚠️ Compatibility and Known Limits

- The coordinate engine targets Chromium (the Electron runtime of DSH Desktop and Chromium-based Web GUIs); other browsers are not verified.
- Scripts see one CSS layout-pixel space for rects, viewport sizes and pointer events. Window scroll offsets, `document.documentElement.clientWidth/clientHeight`, `IntersectionObserverEntry` rects, wheel deltas and `screenX/screenY` keep their native visual-pixel semantics (see the engine notes at the top of `client.js`); convert them yourself before mixing with layout coordinates.
- The zoom level is stored in the GUI origin's `localStorage` (key `dsh.ui.zoom_scale`); clearing site data or changing origin (for example a Web GUI on a different port) resets it to 100%.

---

## 📦 Installation

### Option 1: Install from Local Clone (Recommended for Developers)

1. Clone this repository into your workspace:
   ```bash
   git clone https://github.com/<your-username>/dsh-ui-zoom.git
   ```

2. Install the bundle into your active DSH profile using DSH Plugin Manager or the CLI:
   ```bash
   dsh profile install-bundle /path/to/dsh-ui-zoom
   ```
   *Or ask your DSH assistant in the chat:*
   > "Please install the dsh-ui-zoom plugin from the workspace"

3. Refresh your DSH window (`Ctrl + R` or `F5`).

### Option 2: Install via npm (If Published)

Once published to npm (e.g. `dsh-ui-zoom`):
```bash
dsh profile install-bundle dsh-ui-zoom
```

---

## 🚀 Usage

### Method 1: Settings Panel
1. Click the **Settings (设置)** icon in the sidebar.
2. Go to **General (通用)**.
3. Locate **UI Scale (界面缩放)** to pick a preset or adjust with `+` / `−`.

### Method 2: Shortcuts
- Press `Ctrl + =` to scale up.
- Press `Ctrl + -` to scale down.
- Press `Ctrl + 0` to restore default.
- Hold `Ctrl` and scroll your mouse wheel.

---

## 🛠️ Architecture

- **Host Entry (`index.js`)**: Declares the Cordis bundle manifest.
- **Client Module (`client.js`)**:
  - Injects into the `settings.general.item` slot via `@deepseek-ai/cordis`.
  - Manages global keyboard and mouse wheel listeners.
  - Normalizes `Element.prototype.getBoundingClientRect`, `Range` rects, viewport sizes and pointer event coordinates into one CSS layout space, ensuring portal menus (like `createPortal(..., document.body)`) stay pixel-perfect and editors (CodeMirror caret/selection) hit-test exactly under the pointer.
- **Localization (`locale/`)**: Built-in support for English and Simplified Chinese.

```text
dsh-ui-zoom/
├── package.json          # Package manifest and configuration
├── cordis.patch.yml      # DSH Cordis bundle patch
├── index.js              # Host-side entry
├── client.js             # Client-side UI, zoom & coordinate correction
├── icon.svg              # Vector icon
├── locale/
│   ├── zh.json           # Chinese locale and metadata
│   └── en.json           # English locale and metadata
├── LICENSE               # MIT License
├── README.md             # Chinese documentation (default)
├── README.en.md          # English documentation
└── CHANGELOG.md          # Version history
```

---

## 📄 License

[MIT License](LICENSE)
