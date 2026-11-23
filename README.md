# dsh-ui-zoom 界面缩放插件

[中文](README.md) | [English](README.en.md)

[![regression](https://github.com/MatrixC7/dsh-ui-zoom/actions/workflows/regression.yml/badge.svg)](https://github.com/MatrixC7/dsh-ui-zoom/actions/workflows/regression.yml)

> 适用于 [DeepSeek Harness (DSH)](https://github.com/deepseek-ai/deepseek-harness) 的全局 UI 缩放插件。类似 VS Code 的窗口缩放，把整个应用界面（侧边栏、输入区、按钮、对话卡片、间距、图标、字体）等比缩放到 50%–250%。

![UI 缩放图标](icon.svg)

---

## ✨ 功能特性

- 🔍 **等比整体缩放**：不是简单改字号，而是按比例缩放应用的全部界面元素。
- ⚙️ **融入设置面板**：注册到「设置 → 通用 → 界面缩放」，紧跟在「字号」下方。
- 🎛️ **预设与 5% 微调**：
  - 预设按钮：`80%`、`90%`、`100%`、`110%`、`125%`、`150%`。
  - 步进按钮（`−` / `+`）与 `Ctrl + 滚轮` 使用统一的 5% 阶梯（50%–250%），135–150 之间也能逐档调整。
  - 一键重置到 100%。
- ⌨️ **VS Code 习惯的快捷键**：
  - `Ctrl + =` / `Ctrl + +`（macOS 为 `Cmd`）：放大。
  - `Ctrl + -`（macOS 为 `Cmd`）：缩小。
  - `Ctrl + 0`（macOS 为 `Cmd`）：重置 100%。
  - `Ctrl + 滚轮`：连续缩放（按动画帧合并，触控板不会抖动）。
  - DSH 的快捷键服务可用时，三条缩放命令会出现在「设置 → 快捷键」，可查看、改键并参与冲突检测；服务缺失或注册失败时自动回退内置监听。
- 🌐 **跟随界面语言**：设置行与 HUD 文案通过 DSH Client locale 服务解析，切换语言即时生效（无服务时回退浏览器语言）。
- 🧭 **缩放 HUD**：快捷键/滚轮触发时，右下角短暂显示当前百分比，并带无障碍播报。
- 🎯 **浮层与命中测试修正**：统一坐标空间，修复 CSS `zoom` 下 Portal 菜单、右键菜单、分隔条拖拽、图片平移、终端选区以及右侧栏 Markdown 编辑器（CodeMirror）光标/选区的偏移。
- 💾 **持久化与多窗口**：缩放值保存在本地，刷新/重启自动恢复；同一 GUI 的其他窗口或标签页会跟随变化。
- ⚙️ **可配置的部署参数**：默认比例、上下限、步进，以及 `100vh` 浮层与模态弹窗的兼容规则，均可在 profile 的 `cordis.patch.yml` 中调整。

---

## 📦 安装

### 环境要求

- DeepSeek Harness（桌面端或 Web CLI 均可）。本仓库在 DSH `0.2.2-rc.5` 上验证。
- 桌面端的 profile 名为 `desktop`，由应用管理，请使用应用内「设置 → 插件」安装/卸载，不要用 CLI 直接操作该 profile。
- Web/自定义 profile 使用 `dsh` CLI；若未安装 CLI，可用 `npx -y @deepseek-ai/dsh ...` 代替下文命令。
- 从本地源码链接安装时，需要 Node.js 与 pnpm 可用。

### 方式一：DSH 桌面端（推荐）

1. 打开「设置 → 插件」（Plugin Manager）。
2. 选择「安装 / 从 GitHub 安装」。
3. 填入 GitHub 仓库：
   ```text
   https://github.com/MatrixC7/dsh-ui-zoom
   ```
   或使用 Git 规格：
   ```text
   github:MatrixC7/dsh-ui-zoom
   ```
4. 安装完成后重启 DSH（Host 半区需要重新加载），再刷新窗口。

也可以在对话框里直接让助手安装：

> 请帮我安装工作区下的 dsh-ui-zoom 插件（或“从 GitHub 安装 MatrixC7/dsh-ui-zoom”）。

### 方式二：CLI（Web / 自定义 profile）

```bash
# 从 GitHub 安装（把 web 换成你的 profile 名）
dsh plugin --profile web add github:MatrixC7/dsh-ui-zoom

# 本地开发检出：用 link: 指向仓库绝对路径，改动即时可见
dsh plugin --profile web add "link:/absolute/path/to/dsh-ui-zoom"

# 或先打包成 tarball 再安装（把 <version> 换成 npm pack 输出的版本号）
npm pack
dsh plugin --profile web add ./dsh-ui-zoom-<version>.tgz
```

安装后重启对应 profile：

```bash
dsh --profile web
```

### 不要按包名从 npm 安装

本仓库通过 **GitHub / 本地目录** 分发，尚未发布 npm 包。npm 上同名的 `dsh-ui-zoom` 由另一个仓库维护，版本与行为不同，请勿执行 `dsh plugin add dsh-ui-zoom`，否则会装到别的项目。

### 升级与卸载

```bash
# 列出已安装项
dsh plugin --profile web list

# 升级：重新 add 最新 GitHub 版本，或在 Plugin Manager 里更新
dsh plugin --profile web add github:MatrixC7/dsh-ui-zoom

# 卸载
dsh plugin --profile web remove dsh-ui-zoom
```

桌面端请在「设置 → 插件」中升级/停用/卸载。升级或卸载后重启 DSH。

---

## 🚀 使用

### 设置面板

1. 点击左下角齿轮打开「设置」。
2. 进入「通用」。
3. 找到「界面缩放」：点击预设、用 `−` / `+` 微调，或点「重置 (100%)」。

### 快捷键

- `Ctrl + =` 放大，`Ctrl + -` 缩小，`Ctrl + 0` 重置（macOS 用 `Cmd`）。
- `Ctrl + 滚轮` 连续缩放，每帧最多推进一级。
- 若 DSH 暴露了快捷键服务，这三条命令可在「设置 → 快捷键」中重新绑定；Web/Linux 上部分模态框会按 DSH 规则拦截快捷键，桌面端的原生绑定优先。

### 生效说明

- 仅修改客户端代码：刷新窗口（`Ctrl + R` / `F5`）即可。
- 修改了 Host Config 或升级了插件：需要重启 DSH。
- 缩放值保存在 GUI 源的 `localStorage`（键 `dsh.ui.zoom_scale`）；清除站点数据或更换 Web GUI 端口会重置为 100%。

---

## ⚙️ 配置

在 profile 的 `cordis.patch.yml` 中覆盖插件行即可（`config` 会整体替换，未写的字段使用默认值）：

- Web/自定义 profile：`~/.dsh/profiles/<profile>/cordis.patch.yml`
- Desktop profile：`%USERPROFILE%\.dsh\profiles\desktop\cordis.patch.yml`（桌面端优先使用 Plugin Manager 的插件配置入口；手工编辑后需重启应用）

```yaml
- id: ui-zoom
  name: dsh-ui-zoom
  config:
    defaultScale: 100        # 无历史记录时的初始比例
    minScale: 50             # 最小比例
    maxScale: 250            # 最大比例
    step: 5                  # 步进按钮与滚轮的阶梯（5–50）
    compatOverlayHostHeight: true  # 100vh 浮层宿主改写为 height:100%（better-sidebar 兼容）
    compatDialogClamp: true        # 超出窗口的模态 <dialog> 收进窗口内（第三方弹窗兼容）
```

| 字段 | 默认值 | 说明 |
|---|---|---|
| `defaultScale` | `100` | 首次使用的缩放比例（百分比） |
| `minScale` | `50` | 可缩放到的最小值 |
| `maxScale` | `250` | 可缩放到的最大值 |
| `step` | `5` | 步进/滚轮每档的百分比 |
| `compatOverlayHostHeight` | `true` | 是否启用 `[data-dsh-panel-host] { height:100% }` 兼容规则 |
| `compatDialogClamp` | `true` | 是否把超出窗口的模态 `<dialog>` 收进窗口（见下方「弹窗被顶出窗口」） |

修改后重启 DSH 生效。桌面端也可以直接在 profile 文件中调整后重启应用。

---

## ⚠️ 兼容性与已知限制

- 坐标引擎面向 **Chromium**（DSH Desktop 的 Electron 内核、基于 Chromium 的 Web GUI），其他浏览器未做验证。
- 插件把矩形、视口尺寸、指针事件与命中测试统一换算到 CSS 布局像素；以下 API 按浏览器语义保持视觉像素，混用时需自行换算：窗口滚动量、`document.documentElement.clientWidth/clientHeight`、`IntersectionObserver` 条目矩形、滚轮 delta、`screenX/screenY`。详见 [`client.js`](client.js) 顶部说明。
- 命中测试 API（`elementFromPoint` / `elementsFromPoint` / `caretRangeFromPoint` / `caretPositionFromPoint`）接收布局坐标，由插件换算成浏览器需要的视觉坐标。
- 第三方插件若自行对 CSS `zoom` 做补偿，可能与本插件重复换算；遇到偏移请先停用其他缩放/transform 类插件排查。
- **视口单位不随缩放缩小**：Chromium 不会把 `100vh`/`100vw` 除以 CSS `zoom`，所以用 `max-height: calc(100vh - …)` 限制高度的浮层在放大后会比窗口还大。模态 `<dialog>` 由 `compatDialogClamp` 收进窗口（见下条）；其他固定浮层如需自行补偿，可除以本插件在根元素上提供的 `--dsh-ui-zoom-factor`（例如 `calc(100vh / var(--dsh-ui-zoom-factor, 1))`）。
- 极端缩放（如 250%）下整页重排仍然存在，滚轮合帧只能降低频率。

---

## ❓ 常见问题

**设置里找不到「界面缩放」？**
确认插件已启用（Plugin Manager 中该行 `enabled`，且 `fiberPhase` 正常），然后重启 DSH。客户端 bundle 只有刷新后才会加载。

**快捷键没反应？**
先在「设置 → 快捷键」确认三条 Zoom 命令是否存在、是否被改绑或冲突；Web/Linux 的某些模态框会拦截快捷键，桌面端原生绑定优先。若快捷键服务未暴露，内置监听会接管。

**改了 `config` 没生效？**
Host Config 在 DSH 启动时注入页面，必须重启 DSH；仅刷新窗口不够。

**缩放值每次重启都变回 100%？**
检查是否在 Web GUI 且端口变化、或清除了站点数据。桌面端的源是稳定的，一般不会丢。

**右侧栏 Markdown 编辑光标仍然偏移？**
请确认版本 ≥ `0.4.1`，并检查是否同时启用了其他会改 `transform`/`zoom` 的插件。0.4.1 起已统一事件与矩形坐标。

**和 dsh-better-sidebar 的 100vh 冲突？**
默认开启 `compatOverlayHostHeight` 兼容规则；如需关闭，按上面的配置改为 `false` 并重启。

**弹窗被顶出窗口，右上角 × 点不到？（例如 dsh-cost-meter 的费用统计弹窗）**
这是「视口单位不随缩放缩小」导致的：弹窗用 `max-height: calc(100vh - …)` 限制高度，放大到 125% 以上时它会被排成比窗口高出一截，居中显示后标题栏连同 × 被顶到窗口上沿之外，只剩几个像素留在窗口里，所以鼠标移上去没有悬停效果、按下去也没反应。`0.5.1` 起由 `compatDialogClamp` 自动把这类「实测超出窗口」的模态弹窗收进窗口（100% 缩放时完全不动它）；如需关闭，把该配置改为 `false` 并重启。第三方弹窗自身改成 `max-height: calc(100% - …)` 也能根治。

---

## 🧪 开发与回归测试

仓库自带无第三方依赖的回归测试：启动本地静态服务，用真实 Chromium 通过 DevTools 协议驱动夹具页面，覆盖指针坐标、拖选、5% 阶梯、`Ctrl + 滚轮` 合帧、Host Config、locale 切换、快捷键注册/回退、超窗弹窗收敛与卸载还原。

```bash
# 需要 Node.js >= 22；CHROME_PATH 指向 Chrome/Chromium（CI 中自动设置）
CHROME_PATH=/path/to/chrome npm test
```

[`.github/workflows/regression.yml`](.github/workflows/regression.yml) 会在每次 push / PR 时运行同一套测试。

### 本地开发

```bash
git clone https://github.com/MatrixC7/dsh-ui-zoom.git
cd dsh-ui-zoom

# 安装到 Web profile（把路径换成该仓库的绝对路径；Windows 可写 "link:E:/Download/dsh-ui-zoom"）
dsh plugin --profile web add "link:/absolute/path/to/dsh-ui-zoom"

# 修改 client.js 后刷新窗口；修改 index.js 后重启 DSH
CHROME_PATH=/path/to/chrome npm test
```

---

## 🛠️ 项目结构

```text
dsh-ui-zoom/
├── package.json          # 插件清单、版本与发布文件列表
├── cordis.patch.yml      # DSH Cordis 编排补丁
├── index.js              # Host 端入口（Config + 页面注入）
├── client.js             # Client 端渲染、DOM 缩放、坐标引擎与快捷键
├── icon.svg              # 矢量图标
├── locale/
│   ├── zh.json           # 插件元数据（中文）
│   └── en.json           # 插件元数据（英文）
├── test/
│   ├── page.html         # 无依赖回归夹具
│   └── run.mjs           # Chromium/CDP 回归入口
├── .github/workflows/
│   └── regression.yml    # CI：push/PR 自动跑回归
├── CHANGELOG.md          # 版本变更记录
├── README.md             # 中文文档（默认）
├── README.en.md          # 英文文档
└── LICENSE               # MIT
```

---

## 📄 更新日志与许可证

- 版本变更见 [CHANGELOG.md](CHANGELOG.md)。
- 问题反馈：[GitHub Issues](https://github.com/MatrixC7/dsh-ui-zoom/issues)。
- 本项目采用 [MIT 许可证](LICENSE)。
