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
  - Stepper controls (`−` / `+`) with smooth 5%–10% steps.
  - One-click **Reset (100%)** button.
- ⌨️ **Global Keyboard Shortcuts** (VS Code style):
  - `Ctrl + =` / `Ctrl + +` (or `Cmd` on macOS): Zoom in.
  - `Ctrl + -` (or `Cmd` on macOS): Zoom out.
  - `Ctrl + 0` (or `Cmd` on macOS): Reset zoom to 100%.
  - `Ctrl + Mouse Wheel`: Zoom in/out smoothly.
- 🧭 **Visual HUD Feedback**: Shows a clean, translucent toast indicator in the bottom-right corner when zooming via shortcuts or wheel.
- 🎯 **Pixel-Perfect Popover Alignment**: Includes an internal coordinate calibration engine so portal popups (such as the bottom-left account menu, dropdowns, and tooltips) remain perfectly anchored without offset or floating gaps at any zoom level.
- 💾 **Persistent**: Zoom settings are saved in local storage and automatically restored across sessions and page reloads.

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
  - Dynamically aligns `Element.prototype.getBoundingClientRect` coordinates in zoomed space, ensuring portal menus (like `createPortal(..., document.body)`) stay pixel-perfect.
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
└── README.en.md          # English documentation
```

---

## 📄 License

[MIT License](LICENSE)
