# dsh-ui-zoom 界面缩放插件

[English](README.md) | [中文](README.zh.md)

> 适用于 [DeepSeek Harness (DSH)](https://github.com/deepseek-ai/deepseek-harness) 的全局 UI 缩放插件。类似于 VS Code 的窗口缩放机制，支持将整个界面等比例缩放至 80%、110%、125%、150% 等任意比例。

![UI 缩放图标](icon.svg)

---

## ✨ 功能特性

- 🔍 **等比整体缩放**：不同于单纯修改字体字号，本插件成比例缩放整个应用界面的所有元素（包括侧边栏、输入区域、按钮、对话卡片、间距、图标及字体）。
- ⚙️ **无缝融入设置面板**：自动注册至「**设置 -> 通用**」，紧跟在「字号」选项下方。
- 🎛️ **常用预设与微调**：
  - 常用预设快捷按钮：`80%`、`90%`、`100%`、`110%`、`125%`、`150%`。
  - 步进器按钮（`−` / `+`）支持平滑微调。
  - 一键 **重置 (100%)** 按钮。
- ⌨️ **全局快捷键支持**（VS Code 习惯）：
  - **`Ctrl` + `=`** 或 **`Ctrl` + `+`**（macOS 上为 `Cmd`）：放大界面。
  - **`Ctrl` + `-`**（macOS 上为 `Cmd`）：缩小界面。
  - **`Ctrl` + `0`**（macOS 上为 `Cmd`）：一键重置为 100%。
  - **`Ctrl` + 鼠标滚轮**：按住 Ctrl 滚动鼠标滚轮快速连续缩放。
- 🧭 **即时 HUD 提示**：使用快捷键或滚轮调整缩放时，屏幕右下角自动浮现半透明提示框展示当前缩放百分比。
- 🎯 **完美解决浮层错位（Double-Zoom Fix）**：内置视口坐标空间校准机制，解决 CSS `zoom` 下通过 `createPortal` 挂载的弹出菜单（如左下角用户名菜单、下拉选择器、工具提示等）位置错位或悬空的问题，始终精准贴合。
- 💾 **自动持久化**：缩放配置自动保存在本地缓存中，刷新页面或下次启动时自动恢复。

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

如果将该包发布至 npm（例如 `dsh-plugin-ui-zoom`）：
```bash
dsh profile install-bundle dsh-plugin-ui-zoom
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
├── index.js              # Host 端入口
├── client.js             # Client 端渲染逻辑、DOM 缩放与坐标修复
├── icon.svg              # 矢量图标
├── locale/
│   ├── zh.json           # 简体中文文案与元数据
│   └── en.json           # 英文文案与元数据
├── LICENSE               # MIT 开源许可证
├── README.md             # 英文文档
└── README.zh.md          # 中文文档
```

---

## 📄 开源许可证

本项目采用 [MIT 许可证](LICENSE)。
