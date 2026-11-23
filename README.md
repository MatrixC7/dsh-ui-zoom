# dsh-ui-zoom 界面缩放插件

[中文](README.md) | [English](README.en.md)

> 适用于 [DeepSeek Harness (DSH)](https://github.com/deepseek-ai/deepseek-harness) 的全局 UI 缩放插件。类似于 VS Code 的窗口缩放机制，支持将整个界面等比例缩放至 80%、110%、125%、150% 等任意比例。

![UI 缩放图标](icon.svg)

---

## ✨ 功能特性

- 🔍 **等比整体缩放**：不同于单纯修改字体字号，本插件成比例缩放整个应用界面的所有元素（包括侧边栏、输入区域、按钮、对话卡片、间距、图标及字体）。
- ⚙️ **无缝融入设置面板**：自动注册至「**设置 -> 通用**」，紧跟在「字号」选项下方。
- 🎛️ **常用预设与微调**：
  - 常用预设快捷按钮：`80%`、`90%`、`100%`、`110%`、`125%`、`150%`。
  - 步进器按钮（`−` / `+`）与 `Ctrl + 鼠标滚轮` 以统一的 5% 为步进（50%–250%）。
  - 一键 **重置 (100%)** 按钮。
- ⌨️ **全局快捷键支持**（VS Code 习惯）：
  - **`Ctrl` + `=`** 或 **`Ctrl` + `+`**（macOS 上为 `Cmd`）：放大界面。
  - **`Ctrl` + `-`**（macOS 上为 `Cmd`）：缩小界面。
  - **`Ctrl` + `0`**（macOS 上为 `Cmd`）：一键重置为 100%。
  - **`Ctrl` + 鼠标滚轮**：按住 Ctrl 滚动鼠标滚轮连续缩放（按动画帧合并，连续滚动更平滑）。
  - 接入 DSH 快捷键服务后，三个缩放命令会出现在「**设置 → 快捷键**」中，可查看、改键并参与冲突检测；服务不可用或注册冲突时自动回退到内置监听。
- 🌐 **跟随界面语言**：设置行与 HUD 文案通过 DSH Client locale 服务解析，切换界面语言即时生效（服务缺失时回退到浏览器语言）。
- 🧭 **即时 HUD 提示**：使用快捷键或滚轮调整缩放时，屏幕右下角自动浮现半透明提示框展示当前缩放百分比。
- 🎯 **完美解决浮层错位（Double-Zoom Fix）**：内置视口坐标空间校准机制，解决 CSS `zoom` 下通过 `createPortal` 挂载的弹出菜单（如左下角用户名菜单、下拉选择器、工具提示等）位置错位或悬空的问题，始终精准贴合。
- 🖱️ **统一指针坐标系（Pointer Coordinate Calibration）**：鼠标/触控事件的 `clientX/clientY`、`pageX/pageY`、`offsetX/offsetY`、`movementX/movementY` 与 `getBoundingClientRect`、`window.innerWidth` 等全部换算到同一套 CSS 布局坐标。右侧栏 Markdown 编辑模式（CodeMirror）中的光标与选区因此精确落在鼠标位置，拖拽分隔条、框选复制、右键菜单、图片平移等交互也不会再随缩放偏移。
- 💾 **自动持久化**：缩放配置自动保存在本地缓存中，刷新页面或下次启动时自动恢复；同一 GUI 的其他窗口/标签页修改缩放时也会自动跟随。
- ⚙️ **可配置的部署参数**：`defaultScale`、`minScale`、`maxScale`、`step`、`compatOverlayHostHeight` 可在 `cordis.patch.yml` 的插件 `config` 中调整（默认 100/50/250/5%）。

---

## ⚠️ 兼容性与已知限制

- 坐标引擎面向 Chromium（DSH Desktop 的 Electron 内核，以及基于 Chromium 的 Web GUI），其他浏览器未做验证。
- 为了让脚本读到一致的坐标，插件把矩形、视口尺寸与指针事件统一换算到 CSS 布局像素；窗口滚动量、`document.documentElement.clientWidth/clientHeight`、`IntersectionObserver` 条目矩形、滚轮 delta 与 `screenX/screenY` 按浏览器语义保持视觉像素（详见 `client.js` 顶部说明），与上述坐标混用时需要自行换算。
- 命中测试 API（`elementFromPoint` / `elementsFromPoint` / `caretRangeFromPoint` / `caretPositionFromPoint`）在本插件下接受与 rect 相同的布局坐标，由插件换算为浏览器需要的视觉坐标；第三方代码请直接传布局坐标。
- 快捷键在 Web/Linux 上受 DSH 模态框限制（当前允许设置、快捷键等已知模态）；桌面端的原生键盘绑定优先执行。
- 缩放值保存在 GUI 源的 `localStorage`（键 `dsh.ui.zoom_scale`）；清除站点数据或更换源（例如 Web GUI 使用不同端口）会重置为 100%。

---

## 📦 安装方式

### 方式 1：本地仓库安装（推荐）

1. 将本仓库克隆至你的工作区或本地目录：
   ```bash
   git clone https://github.com/<你的用户名>/dsh-ui-zoom.git
   ```

2. 在 DSH 终端中使用 CLI 或通过 Plugin Manager 安装到当前 Profile：
   ```bash
   dsh profile install-bundle /path/to/dsh-ui-zoom
   ```
   *也可以直接在 DSH 对话框中让助手安装：*
   > “请帮我安装工作区下的 dsh-ui-zoom 插件”

3. 刷新 DSH 窗口（`Ctrl + R` 或 `F5`）即可立即生效。

### 方式 2：通过 npm 安装（若已发布）

如果将该包发布至 npm（例如 `dsh-ui-zoom`）：
```bash
dsh profile install-bundle dsh-ui-zoom
```

---

## 🚀 使用指南

### 方式 1：从设置面板调节
1. 点击左下角齿轮「**设置**」。
2. 点击「**通用**」选项卡。
3. 找到「**界面缩放**」，直接点击常用预设比例或使用 `+` / `−` 进行调整。

### 方式 2：使用快捷键
- 按 `Ctrl + =` 放大。
- 按 `Ctrl + -` 缩小。
- 按 `Ctrl + 0` 恢复默认大小。
- 按住 `Ctrl` 滚动鼠标滚轮放大/缩小。

---

## 🛠️ 项目结构

```text
dsh-ui-zoom/
├── package.json          # 插件清单与配置
├── cordis.patch.yml      # DSH Cordis 编排补丁
├── index.js              # Host 端入口（Config + 页面注入）
├── client.js             # Client 端渲染逻辑、DOM 缩放与坐标修复
├── icon.svg              # 矢量图标
├── locale/
│   ├── zh.json           # 简体中文文案与元数据
│   └── en.json           # 英文文案与元数据
├── test/
│   ├── page.html         # 无依赖回归测试夹具
│   └── run.mjs           # Chromium/CDP 回归测试入口
├── .github/workflows/
│   └── regression.yml    # CI：每次 push/PR 运行回归测试
├── LICENSE               # MIT 开源许可证
├── README.md             # 默认中文说明文档
├── README.en.md          # 英文说明文档
└── CHANGELOG.md          # 版本变更记录
```

---

## 🧪 开发与回归测试

仓库自带一套无第三方依赖的回归测试：启动本地静态服务后，通过 DevTools 协议驱动真实 Chromium，覆盖指针坐标换算、拖选、5% 阶梯、`Ctrl + 滚轮` 合帧、Host Config、locale 切换、快捷键注册/回退以及卸载还原。

```bash
# 需要 Node.js >= 22；CHROME_PATH 指向 Chrome/Chromium（CI 中自动设置）
CHROME_PATH=/path/to/chrome npm test
```

`.github/workflows/regression.yml` 会在每次 push / PR 时运行同一套测试。

---

## 📄 开源许可证

本项目采用 [MIT 许可证](LICENSE)。
