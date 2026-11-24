window.__ModuleLoader__.load({
  id: 'dsh-ui-zoom',
  factory(require) {
    const React = require('react');
    const h = React.createElement;

    /* =========================================================================
     * SECTION 1: CSS Theme Styles & Global Rules
     * ========================================================================= */
    const CSS_TAG_ID = 'dsh-ui-zoom/styles';
    const CSS_TEXT = `
      .dsh-ui-zoom-row {
        border-bottom: 0.5px solid var(--dsw-alias-border-l2, rgba(128, 128, 128, 0.2));
        align-items: center;
        gap: 16px;
        padding: 16px 0;
        display: flex;
        justify-content: space-between;
        flex-wrap: wrap;
      }
      .dsh-ui-zoom-row-text {
        flex-direction: column;
        flex: 1 1 260px;
        gap: 4px;
        min-width: 0;
        display: flex;
      }
      .dsh-ui-zoom-title {
        color: var(--dsw-alias-label-primary);
        font-size: 14px;
        font-weight: 500;
        line-height: 22px;
      }
      .dsh-ui-zoom-desc {
        color: var(--dsw-alias-label-tertiary, var(--dsw-alias-label-secondary));
        font-size: 12px;
        font-weight: 400;
        line-height: 18px;
      }
      .dsh-ui-zoom-hint {
        color: var(--dsw-alias-label-tertiary);
        font-size: 11px;
        line-height: 16px;
        opacity: 0.85;
      }
      .dsh-ui-zoom-controls {
        align-items: center;
        gap: 10px;
        display: inline-flex;
        flex-wrap: wrap;
      }
      .dsh-ui-zoom-presets {
        display: inline-flex;
        gap: 6px;
        align-items: center;
      }
      .dsh-ui-zoom-preset-btn {
        border-radius: var(--dsw-radius-md, 6px);
        padding: 4px 8px;
        font-size: 12px;
        font-weight: 400;
        cursor: pointer;
        border: 1px solid var(--dsw-alias-border-l1, rgba(128, 128, 128, 0.2));
        background: var(--dsw-alias-bg-module-platform, var(--dsw-alias-bg-layer-1, rgba(128, 128, 128, 0.08)));
        color: var(--dsw-alias-label-primary);
        transition: all 0.15s ease;
      }
      .dsh-ui-zoom-preset-btn:hover {
        background: var(--dsw-alias-bg-layer-2, rgba(128, 128, 128, 0.18));
        border-color: var(--dsw-alias-border-l2, rgba(128, 128, 128, 0.4));
      }
      .dsh-ui-zoom-preset-btn.active {
        background: #2563eb;
        color: #ffffff !important;
        border-color: transparent;
        font-weight: 600;
      }
      body[data-ds-dark-theme] .dsh-ui-zoom-preset-btn.active {
        background: var(--dsw-static-deepseek-450, #5686fe);
        color: #ffffff !important;
      }
      .dsh-ui-zoom-stepper {
        border-radius: var(--dsw-radius-md, 6px);
        background: var(--dsw-alias-bg-module-platform, rgba(128, 128, 128, 0.08));
        border: 1px solid var(--dsw-alias-border-l1, rgba(128, 128, 128, 0.2));
        justify-content: center;
        align-items: center;
        height: 32px;
        display: inline-flex;
      }
      .dsh-ui-zoom-stepper-btn {
        width: 28px;
        height: 100%;
        border: none;
        background: transparent;
        color: var(--dsw-alias-label-primary);
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        font-weight: 500;
        transition: background 0.12s;
        padding: 0;
      }
      .dsh-ui-zoom-stepper-btn:hover:not(:disabled) {
        background: var(--dsw-alias-bg-layer-2, rgba(128, 128, 128, 0.15));
      }
      .dsh-ui-zoom-stepper-btn:disabled {
        opacity: 0.35;
        cursor: not-allowed;
      }
      .dsh-ui-zoom-value {
        text-align: center;
        font-variant-numeric: tabular-nums;
        min-width: 48px;
        padding: 0 4px;
        color: var(--dsw-alias-label-primary);
        font-size: 13px;
        font-weight: 500;
        line-height: 20px;
      }
      .dsh-ui-zoom-reset-btn {
        border-radius: var(--dsw-radius-md, 6px);
        padding: 5px 10px;
        font-size: 12px;
        cursor: pointer;
        border: 1px solid var(--dsw-alias-border-l2, rgba(128, 128, 128, 0.3));
        background: transparent;
        color: var(--dsw-alias-label-secondary);
        transition: all 0.15s ease;
      }
      .dsh-ui-zoom-reset-btn:hover:not(:disabled) {
        background: var(--dsw-alias-bg-layer-2, rgba(128, 128, 128, 0.15));
        color: var(--dsw-alias-label-primary);
      }
      .dsh-ui-zoom-reset-btn:disabled {
        opacity: 0.4;
        cursor: default;
      }
    `;

    /* =========================================================================
     * SECTION 2: Ecosystem Compatibility Shim & Quirks
     * =========================================================================
     * Isolates workarounds for Chromium CSS zoom engine quirks and third-party
     * plugin layout assumptions so core plugin logic remains clean and orthogonal.
     */
    const COMPAT_SHIM = {
      // 1. Quirk: In Chromium, '100vh' on a zoomed document does not scale down with CSS zoom,
      // evaluating to unscaled physical viewport height. Fixed full-screen overlay hosts that declare
      // 'height: 100vh' (e.g. dsh-better-sidebar [data-dsh-panel-host]) overflow past the screen bottom.
      // Changing them to 'height: 100%' binds them correctly to the CSS layout viewport.
      overlayHostSelectors: [
        '[data-dsh-panel-host]'
      ],

      // 2. Quirk: the same viewport-unit rule breaks modal <dialog> elements. A dialog that
      // caps its height the usual third-party way — 'max-height: calc(100vh - …)' — is laid
      // out zoom-factor times taller than the window at 125%+, because 1vh stays one
      // *unscaled* viewport pixel while every CSS length around it is rendered magnified.
      // It keeps centred through 'margin:auto', so its header — and the close button in that
      // header — is pushed above the window's top edge: only a few pixels of the button stay
      // inside the window, which is exactly why it looks present but almost never receives a
      // hover or a click (and why it is trivial to click at 100%).
      // The clamp rule below caps *percentages*, which do resolve in the zoomed (layout)
      // coordinate space — '100%' there is the zoom-corrected viewport. It is only applied to
      // dialogs the shim measured as overflowing, so a dialog that already fits, and every
      // dialog at 100%, keeps the author's CSS untouched.
      dialogClampAttribute: 'data-dsh-ui-zoom-clamp',

      // 3. No widget keeps raw visual rects anymore: the coordinate engine below exposes
      // CSS layout pixels to every API a script can read (rects, viewport sizes and pointer
      // events), so a third-party widget must compare layout rects with layout event
      // coordinates — mixing in raw visual pixels is what broke hit-testing under zoom.

      // 4. Quirk: Third-party widget buttons that handle pointer events in capturing phase
      // can be interrupted or mis-routed under zoom; prevent pointerdown capture leakage.
      isProtectedPointerElement(el) {
        return !!(el && el.closest && el.closest('.dshwv-menu-btn'));
      },

      generateCssRules() {
        const rules = [];
        if (this.overlayHostSelectors.length && (!SETTINGS || SETTINGS.compatOverlayHostHeight !== false)) {
          rules.push(`
          /* Compatibility Shim: normalize fixed overlay hosts with 100vh under CSS zoom */
          ${this.overlayHostSelectors.join(',\n')} {
            height: 100% !important;
          }
        `);
        }
        if (!SETTINGS || SETTINGS.compatDialogClamp !== false || SETTINGS.compatOverflowClamp !== false) {
          rules.push(`
          /* Compatibility Shim: keep overflowing overlays inside the zoomed viewport.
             The plugin marks modal dialogs and vh-sized fixed overlays itself; a third
             party can opt in by adding the attribute to a fixed/top-layer element. */
          [${this.dialogClampAttribute}] {
            max-height: calc(100% - 64px) !important;
            max-width: calc(100% - 64px) !important;
          }
          dialog[${this.dialogClampAttribute}] {
            max-height: calc(100% - var(--dsh-frame-chrome-top, 0px) - 32px) !important;
            max-width: calc(100% - 32px) !important;
          }
        `);
        }
        // DSH paints the Windows titlebar drag region as a `-webkit-app-region: drag`
        // pseudo-element across the top of the frame (`--dsh-windows-titlebar-height`).
        // A drag region is non-client area: hover and clicks inside it never reach
        // the page. As soon as the interface is zoomed, a modal that reaches the top
        // of the window (full-height panels, for instance) has its header — close
        // button included — sitting under that band, so the button looks fine and is
        // half dead. Keeping modal surfaces out of the drag region restores input
        // there; dragging the window while a modal is open is not wanted anyway.
        rules.push(`
          /* Compatibility Shim: modal surfaces stay out of the window drag region */
          [aria-modal="true"],
          [role="dialog"],
          [aria-modal="true"] *,
          [role="dialog"] *,
          dialog[open],
          dialog[open] * {
            -webkit-app-region: no-drag !important;
          }
          /* Belt and braces: while a modal is open, drop the titlebar's own drag
             region for that moment (the window cannot usefully be dragged behind a
             modal anyway). The attribute is maintained by the plugin rather than
             with :has(), which measurably slows down a streaming chat: one :has()
             rule over a 3000-row list cost ~76% extra script time in the harness. */
          html[data-dsh-ui-zoom-modal="1"] [data-windows-titlebar] .frame::before,
          html[data-dsh-ui-zoom-modal="1"] [data-windows-titlebar].frame::before,
          html[data-windows-titlebar][data-dsh-ui-zoom-modal="1"] .frame::before {
            -webkit-app-region: no-drag !important;
          }
        `);
        return rules.join('\n');
      }
    };

    let styleEl = null;

    function ensureStyles() {
      if (typeof document === 'undefined') return;
      const text = CSS_TEXT + '\n' + COMPAT_SHIM.generateCssRules();
      const existing = document.querySelector('style[data-plugin-css="' + CSS_TAG_ID + '"]');
      if (existing) {
        // Re-activation (HMR) must refresh the sheet, not keep a stale copy.
        if (existing.textContent !== text) existing.textContent = text;
        styleEl = existing;
        return;
      }
      styleEl = document.createElement('style');
      styleEl.dataset.plugin = 'dsh-ui-zoom';
      styleEl.dataset.pluginCss = CSS_TAG_ID;
      styleEl.textContent = text;
      document.head.appendChild(styleEl);
    }

    function removeStyles() {
      if (styleEl !== null && styleEl.parentElement !== null) {
        styleEl.parentElement.removeChild(styleEl);
      }
      styleEl = null;
    }

    /* =========================================================================
     * SECTION 2b: Client Locale Service Copy
     * =========================================================================
     * Visible copy resolves through the Client locale service when the profile
     * provides one (the Host-backed language preference, live switches), and
     * falls back to the browser language when the service is absent.
     */
    const LOCALE_NS = 'uiZoom';
    const MESSAGES = {
      zh: {
        title: '界面缩放',
        desc: '等比缩放整个应用界面大小（类似于 VS Code 窗口缩放）。',
        hint: '快捷键：Ctrl + = / - 缩放，Ctrl + 0 重置（支持 Ctrl + 鼠标滚轮）',
        reset: '重置 (100%)',
        zoomIn: '放大界面',
        zoomOut: '缩小界面',
        hud: '界面缩放: {percent}%'
      },
      en: {
        title: 'UI Zoom',
        desc: 'Scales the entire application interface proportionally (similar to VS Code window zoom).',
        hint: 'Shortcuts: Ctrl + = / - to zoom, Ctrl + 0 to reset (Ctrl + mouse wheel supported)',
        reset: 'Reset (100%)',
        zoomIn: 'Zoom in',
        zoomOut: 'Zoom out',
        hud: 'UI Zoom: {percent}%'
      }
    };

    let localeService = null;
    let localeBound = null;

    function attachLocaleService(service) {
      localeService = service && typeof service === 'object' ? service : null;
      localeBound = null;
      if (localeService && typeof localeService.bind === 'function') {
        try {
          localeBound = localeService.bind(LOCALE_NS);
        } catch (e) {
          localeBound = null;
        }
      }
    }

    function readClientService(ctx, name) {
      if (!ctx) return undefined;
      try {
        if (typeof ctx.get === 'function') return ctx.get(name);
        return ctx[name];
      } catch (e) {
        return undefined;
      }
    }

    function activeLocaleIsZh() {
      let active = '';
      if (localeService && typeof localeService.getSnapshot === 'function') {
        try {
          const snapshot = localeService.getSnapshot();
          active = snapshot && typeof snapshot.active === 'string' ? snapshot.active : '';
        } catch (e) {}
      }
      if (active === '' && typeof document !== 'undefined') {
        active = document.documentElement.lang || '';
      }
      if (active === '' && typeof navigator !== 'undefined') {
        active = navigator.language || '';
      }
      return String(active).toLowerCase().startsWith('zh');
    }

    function formatCopy(template, params) {
      if (!params) return template;
      let text = template;
      for (const [name, value] of Object.entries(params)) {
        text = text.split('{' + name + '}').join(String(value));
      }
      return text;
    }

    function translate(key, params) {
      if (localeBound !== null) {
        try {
          const text = localeBound(key, params);
          if (typeof text === 'string' && text !== '' && text !== key) return text;
        } catch (e) {}
      }
      const dictionary = activeLocaleIsZh() ? MESSAGES.zh : MESSAGES.en;
      return formatCopy(dictionary[key] || MESSAGES.en[key] || key, params);
    }

    /* =========================================================================
     * SECTION 3: Scale Ladders, Presets & Reactive State
     * ========================================================================= */
    const STORAGE_KEY = 'dsh.ui.zoom_scale';

    // Host-provided Config (injected into the page as a global by index.js).
    // Missing/invalid fields fall back to the defaults, so the plugin still runs
    // in compositions without the Host half.
    const DEFAULT_SETTINGS = {
      defaultScale: 100,
      minScale: 50,
      maxScale: 250,
      step: 5,
      compatOverlayHostHeight: true,
      compatDialogClamp: true,
      compatOverflowClamp: true
    };

    function readUiZoomSettings() {
      const raw = typeof globalThis !== 'undefined' ? globalThis.__DSH_UI_ZOOM_CONFIG__ : undefined;
      const source = raw && typeof raw === 'object' ? raw : {};
      const integer = (value, fallback, low, high) => {
        const number = typeof value === 'number' ? value : parseInt(value, 10);
        if (!Number.isFinite(number)) return fallback;
        return Math.min(Math.max(Math.round(number), low), high);
      };
      let minScale = integer(source.minScale, DEFAULT_SETTINGS.minScale, 25, 400);
      let maxScale = integer(source.maxScale, DEFAULT_SETTINGS.maxScale, minScale + 5, 500);
      if (!(minScale < maxScale)) {
        minScale = DEFAULT_SETTINGS.minScale;
        maxScale = DEFAULT_SETTINGS.maxScale;
      }
      const step = integer(source.step, DEFAULT_SETTINGS.step, 5, 50);
      const defaultScale = integer(source.defaultScale, DEFAULT_SETTINGS.defaultScale, minScale, maxScale);
      const compatOverlayHostHeight = source.compatOverlayHostHeight === undefined
        ? DEFAULT_SETTINGS.compatOverlayHostHeight
        : source.compatOverlayHostHeight !== false;
      const compatDialogClamp = source.compatDialogClamp === undefined
        ? DEFAULT_SETTINGS.compatDialogClamp
        : source.compatDialogClamp !== false;
      const compatOverflowClamp = source.compatOverflowClamp === undefined
        ? DEFAULT_SETTINGS.compatOverflowClamp
        : source.compatOverflowClamp !== false;
      return { defaultScale, minScale, maxScale, step, compatOverlayHostHeight, compatDialogClamp, compatOverflowClamp };
    }

    const SETTINGS = readUiZoomSettings();
    const MIN_SCALE = SETTINGS.minScale;
    const MAX_SCALE = SETTINGS.maxScale;
    const SCALE_STEP = SETTINGS.step;
    const PRESETS = [80, 90, 100, 110, 125, 150].filter(scale => scale >= MIN_SCALE && scale <= MAX_SCALE);
    // Uniform steps across the whole range: a coarse ladder skipped values such
    // as 140/145, so the stepper and Ctrl+wheel could not reach them.
    const LADDER = [];
    for (let value = MIN_SCALE; value <= MAX_SCALE; value += SCALE_STEP) LADDER.push(value);

    function loadSavedScale() {
      if (typeof localStorage === 'undefined') return SETTINGS.defaultScale;
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = parseInt(raw, 10);
          if (!isNaN(parsed) && parsed >= MIN_SCALE && parsed <= MAX_SCALE) {
            return parsed;
          }
        }
      } catch (e) {}
      return SETTINGS.defaultScale;
    }

    let currentScale = loadSavedScale();
    const listeners = new Set();
    let toastTimeout = null;
    let toastEl = null;

    /* =========================================================================
     * SECTION 3: Viewport & Geometry Coordinate Engine
     *
     * In Chromium with CSS zoom on <html>, everything a script can read is
     * reported in visual (device) pixels, while CSS lengths are interpreted in
     * the zoomed (layout) coordinate space. This engine exposes one single space
     * to application code — CSS layout pixels — so anchors, portals and
     * hit-testing all agree:
     * 1. window.innerWidth / innerHeight & VisualViewport are converted from
     *    visual pixels to CSS layout pixels.
     * 2. Element/Range getBoundingClientRect & getClientRects are converted to
     *    CSS layout pixels, so React Portals, popovers, dropdowns and anchor
     *    calculations do not suffer from double-zoom positioning errors.
     * 3. Pointer, mouse, wheel and touch event coordinates (clientX/clientY,
     *    pageX/pageY, offsetX/offsetY, movementX/movementY, x/y) are converted
     *    to that same space. Without it, CodeMirror's posAtCoords (the markdown
     *    editor caret), drag handles and cursor-anchored menus compare visual
     *    pixels against layout rects and land far from the pointer.
     * 4. elementFromPoint / elementsFromPoint / caretRangeFromPoint /
     *    caretPositionFromPoint accept layout pixels and convert them back to
     *    the visual pixels the DOM hit-testing APIs expect.
     *
     * Known limits, kept in visual pixels on purpose:
     * - window.scrollX / scrollY and pageXOffset / pageYOffset: Chromium reads
     *   and writes root scrolling in visual pixels, so scaling only the getters
     *   would desynchronize them from scrollTo(); DSH never scrolls the root.
     * - IntersectionObserverEntry rects, wheel deltas and screenX / screenY are
     *   not pointer positions in the document layout.
     *
     * document.documentElement.clientWidth / clientHeight / scrollWidth /
     * scrollHeight are normalised too (see installWindowAndRectPatches): they are
     * the root-viewport special case, and leaving them in visual pixels made
     * installed plugins mix spaces — dsh-rewind compared a patched rect against
     * documentElement.clientWidth, CodeMirror derived "iOS keyboard open" from
     * visualViewport.height / documentElement.clientHeight.
     * ========================================================================= */
    const origGetBoundingClientRect = Element.prototype.getBoundingClientRect;
    const origGetClientRects = Element.prototype.getClientRects;
    const origRangeGetBoundingClientRect = typeof Range !== 'undefined' ? Range.prototype.getBoundingClientRect : null;
    const origRangeGetClientRects = typeof Range !== 'undefined' ? Range.prototype.getClientRects : null;
    const origElementFromPoint = typeof document !== 'undefined' ? Document.prototype.elementFromPoint : null;
    const origElementsFromPoint = typeof document !== 'undefined' ? Document.prototype.elementsFromPoint : null;
    const origCaretRangeFromPoint = typeof document !== 'undefined' ? Document.prototype.caretRangeFromPoint : null;
    const origCaretPositionFromPoint = typeof document !== 'undefined' ? Document.prototype.caretPositionFromPoint : null;

    // --- Pointer coordinate hooks ---
    // Every patched getter keeps its original descriptor so the teardown restores it exactly.
    const pointerCoordProps = ['clientX', 'clientY', 'x', 'y', 'offsetX', 'offsetY', 'pageX', 'pageY', 'movementX', 'movementY'];
    const touchCoordProps = ['clientX', 'clientY', 'pageX', 'pageY'];
    const coordRestores = [];

    function toLayoutPixels(value) {
      if (currentScale === 100) return value;
      return value / (currentScale / 100);
    }

    function patchCoordinateGetters(proto, props) {
      if (!proto) return;
      for (const prop of props) {
        const desc = Object.getOwnPropertyDescriptor(proto, prop);
        if (!desc || typeof desc.get !== 'function') continue;
        try {
          const patched = {
            configurable: true,
            enumerable: desc.enumerable,
            get() {
              return toLayoutPixels(desc.get.call(this));
            }
          };
          if (typeof desc.set === 'function') {
            patched.set = function set(value) { desc.set.call(this, value); };
          }
          Object.defineProperty(proto, prop, patched);
          coordRestores.push({ proto, prop, desc });
        } catch (e) {}
      }
    }

    function unpatchCoordinateGetters() {
      for (let i = coordRestores.length - 1; i >= 0; i--) {
        const entry = coordRestores[i];
        try { Object.defineProperty(entry.proto, entry.prop, entry.desc); } catch (e) {}
      }
      coordRestores.length = 0;
    }

    // --- Window & Viewport Dimension Hooks ---
    // Under CSS zoom, Chromium reports visual pixels on window.innerWidth /
    // innerHeight and visualViewport, while CSS lengths are layout pixels.
    // Calibrate the viewport getters to CSS layout pixels (documentElement.client*
    // keeps its root-viewport special case, listed under known limits above).
    const origInnerWidthDesc = typeof window !== 'undefined'
      ? (Object.getOwnPropertyDescriptor(window, 'innerWidth') || Object.getOwnPropertyDescriptor(Window.prototype, 'innerWidth'))
      : null;
    const origInnerHeightDesc = typeof window !== 'undefined'
      ? (Object.getOwnPropertyDescriptor(window, 'innerHeight') || Object.getOwnPropertyDescriptor(Window.prototype, 'innerHeight'))
      : null;

    const origVVProto = typeof window !== 'undefined' && typeof VisualViewport !== 'undefined'
      ? VisualViewport.prototype
      : null;
    const origVVWidthDesc = origVVProto ? Object.getOwnPropertyDescriptor(origVVProto, 'width') : null;
    const origVVHeightDesc = origVVProto ? Object.getOwnPropertyDescriptor(origVVProto, 'height') : null;
    const origVVOffsetLeftDesc = origVVProto ? Object.getOwnPropertyDescriptor(origVVProto, 'offsetLeft') : null;
    const origVVOffsetTopDesc = origVVProto ? Object.getOwnPropertyDescriptor(origVVProto, 'offsetTop') : null;

    // The root element keeps its own viewport metrics: Chromium reports
    // documentElement.clientWidth/clientHeight and scrollWidth/scrollHeight in
    // visual pixels while every other box metric (including the patched rects)
    // is in layout pixels. Two installed plugins mix the two — dsh-rewind's
    // panel clamp compares a patched rect against documentElement.clientWidth,
    // and CodeMirror decides the iOS keyboard is open from
    // visualViewport.height / documentElement.clientHeight — so the root values
    // are normalised on the instance instead of being left as a documented gap.
    const ROOT_METRIC_NAMES = ['clientWidth', 'clientHeight', 'scrollWidth', 'scrollHeight'];
    const origRootMetricDescs = {};
    if (typeof document !== 'undefined' && document.documentElement) {
      for (const name of ROOT_METRIC_NAMES) {
        const desc = Object.getOwnPropertyDescriptor(Element.prototype, name);
        if (desc && typeof desc.get === 'function') origRootMetricDescs[name] = desc;
      }
    }
    const rootMetricPatched = new Set();

    function scaleRect(rect, factor) {
      const x = rect.x / factor;
      const y = rect.y / factor;
      const width = rect.width / factor;
      const height = rect.height / factor;
      if (typeof DOMRect !== 'undefined') {
        try {
          return new DOMRect(x, y, width, height);
        } catch (e) {}
      }
      return {
        x, y, width, height,
        top: y,
        bottom: y + height,
        left: x,
        right: x + width,
        toJSON() {
          return {
            x: this.x, y: this.y,
            width: this.width, height: this.height,
            top: this.top, bottom: this.bottom,
            left: this.left, right: this.right
          };
        }
      };
    }

    function installWindowAndRectPatches() {
      // An effect re-run must start from the native getters, otherwise pointer
      // coordinates would be divided by the zoom factor twice.
      unpatchCoordinateGetters();

      // 1. window.innerWidth & window.innerHeight
      if (origInnerWidthDesc && origInnerWidthDesc.get) {
        try {
          Object.defineProperty(window, 'innerWidth', {
            configurable: true,
            enumerable: true,
            get() {
              const raw = origInnerWidthDesc.get.call(window);
              if (currentScale === 100) return raw;
              return Math.round(raw / (currentScale / 100));
            }
          });
        } catch (e) {}
      }
      if (origInnerHeightDesc && origInnerHeightDesc.get) {
        try {
          Object.defineProperty(window, 'innerHeight', {
            configurable: true,
            enumerable: true,
            get() {
              const raw = origInnerHeightDesc.get.call(window);
              if (currentScale === 100) return raw;
              return Math.round(raw / (currentScale / 100));
            }
          });
        } catch (e) {}
      }

      // 1b. documentElement client/scroll metrics in layout pixels
      for (const name of ROOT_METRIC_NAMES) {
        const desc = origRootMetricDescs[name];
        if (!desc) continue;
        try {
          Object.defineProperty(document.documentElement, name, {
            configurable: true,
            enumerable: desc.enumerable,
            get() {
              const raw = desc.get.call(document.documentElement);
              if (currentScale === 100) return raw;
              return Math.round(raw / (currentScale / 100));
            }
          });
          rootMetricPatched.add(name);
        } catch (e) {}
      }

      // 2. visualViewport getters
      if (origVVProto) {
        try {
          if (origVVWidthDesc && origVVWidthDesc.get) {
            Object.defineProperty(origVVProto, 'width', {
              configurable: true,
              enumerable: true,
              get() {
                const raw = origVVWidthDesc.get.call(this);
                if (currentScale === 100) return raw;
                return raw / (currentScale / 100);
              }
            });
          }
          if (origVVHeightDesc && origVVHeightDesc.get) {
            Object.defineProperty(origVVProto, 'height', {
              configurable: true,
              enumerable: true,
              get() {
                const raw = origVVHeightDesc.get.call(this);
                if (currentScale === 100) return raw;
                return raw / (currentScale / 100);
              }
            });
          }
          if (origVVOffsetLeftDesc && origVVOffsetLeftDesc.get) {
            Object.defineProperty(origVVProto, 'offsetLeft', {
              configurable: true,
              enumerable: true,
              get() {
                const raw = origVVOffsetLeftDesc.get.call(this);
                if (currentScale === 100) return raw;
                return raw / (currentScale / 100);
              }
            });
          }
          if (origVVOffsetTopDesc && origVVOffsetTopDesc.get) {
            Object.defineProperty(origVVProto, 'offsetTop', {
              configurable: true,
              enumerable: true,
              get() {
                const raw = origVVOffsetTopDesc.get.call(this);
                if (currentScale === 100) return raw;
                return raw / (currentScale / 100);
              }
            });
          }
        } catch (e) {}
      }

      // 3. Element & Range getBoundingClientRect
      // Everything (including DSH portal menus, popups and third-party widget
      // positioning) receives rects in layout coordinates (CSS pixels).
      Element.prototype.getBoundingClientRect = function() {
        const rect = origGetBoundingClientRect.apply(this, arguments);
        if (currentScale === 100) return rect;
        return scaleRect(rect, currentScale / 100);
      };

      Element.prototype.getClientRects = function() {
        const list = origGetClientRects.apply(this, arguments);
        if (currentScale === 100) return list;
        const factor = currentScale / 100;
        const result = [];
        for (let i = 0; i < list.length; i++) {
          result.push(scaleRect(list[i], factor));
        }
        result.item = function(index) { return this[index] || null; };
        return result;
      };

      if (origRangeGetBoundingClientRect) {
        Range.prototype.getBoundingClientRect = function() {
          const rect = origRangeGetBoundingClientRect.apply(this, arguments);
          if (currentScale === 100) return rect;
          return scaleRect(rect, currentScale / 100);
        };
      }

      if (origRangeGetClientRects) {
        Range.prototype.getClientRects = function() {
          const list = origRangeGetClientRects.apply(this, arguments);
          if (currentScale === 100) return list;
          const factor = currentScale / 100;
          const result = [];
          for (let i = 0; i < list.length; i++) {
            result.push(scaleRect(list[i], factor));
          }
          result.item = function(index) { return this[index] || null; };
          return result;
        };
      }

      // 4. document.elementFromPoint & friends
      // The DOM hit-testing APIs take visual (physical) pixels natively; callers
      // in this layout-coordinate world pass CSS layout pixels, so scale the
      // point back up to visual pixels before hit-testing.
      if (origElementFromPoint) {
        Document.prototype.elementFromPoint = function(x, y) {
          if (currentScale === 100) return origElementFromPoint.call(this, x, y);
          const factor = currentScale / 100;
          return origElementFromPoint.call(this, x * factor, y * factor) || origElementFromPoint.call(this, x, y);
        };
      }
      if (origElementsFromPoint) {
        Document.prototype.elementsFromPoint = function(x, y) {
          if (currentScale === 100) return origElementsFromPoint.call(this, x, y);
          const factor = currentScale / 100;
          return origElementsFromPoint.call(this, x * factor, y * factor);
        };
      }
      if (origCaretRangeFromPoint) {
        Document.prototype.caretRangeFromPoint = function(x, y) {
          if (currentScale === 100) return origCaretRangeFromPoint.call(this, x, y);
          const factor = currentScale / 100;
          return origCaretRangeFromPoint.call(this, x * factor, y * factor);
        };
      }
      if (origCaretPositionFromPoint) {
        Document.prototype.caretPositionFromPoint = function(x, y) {
          if (currentScale === 100) return origCaretPositionFromPoint.call(this, x, y);
          const factor = currentScale / 100;
          return origCaretPositionFromPoint.call(this, x * factor, y * factor);
        };
      }

      // 5. Pointer coordinate calibration
      // MouseEvent's clientX/clientY, pageX/pageY, offsetX/offsetY, movementX/Y
      // and x/y are read together with the rects above by drag handles,
      // CodeMirror and cursor-anchored menus, so they use the same layout-pixel
      // space. PointerEvent, WheelEvent and DragEvent inherit MouseEvent and are
      // covered here; wheel *delta* values are not coordinates and stay as they
      // are. Touch carries its own getters and is patched separately, while
      // screenX/screenY remain physical screen pixels.
      if (typeof MouseEvent !== 'undefined') {
        patchCoordinateGetters(MouseEvent.prototype, pointerCoordProps);
      }
      if (typeof Touch !== 'undefined') {
        patchCoordinateGetters(Touch.prototype, touchCoordProps);
      }
    }

    function uninstallWindowAndRectPatches() {
      if (origInnerWidthDesc) {
        try { Object.defineProperty(window, 'innerWidth', origInnerWidthDesc); } catch (e) {}
      }
      if (origInnerHeightDesc) {
        try { Object.defineProperty(window, 'innerHeight', origInnerHeightDesc); } catch (e) {}
      }
      if (origVVProto) {
        try {
          if (origVVWidthDesc) Object.defineProperty(origVVProto, 'width', origVVWidthDesc);
          if (origVVHeightDesc) Object.defineProperty(origVVProto, 'height', origVVHeightDesc);
          if (origVVOffsetLeftDesc) Object.defineProperty(origVVProto, 'offsetLeft', origVVOffsetLeftDesc);
          if (origVVOffsetTopDesc) Object.defineProperty(origVVProto, 'offsetTop', origVVOffsetTopDesc);
        } catch (e) {}
      }
      if (typeof document !== 'undefined' && document.documentElement) {
        for (const name of rootMetricPatched) {
          try { delete document.documentElement[name]; } catch (e) {}
        }
        rootMetricPatched.clear();
      }
      Element.prototype.getBoundingClientRect = origGetBoundingClientRect;
      Element.prototype.getClientRects = origGetClientRects;
      if (origRangeGetBoundingClientRect) {
        Range.prototype.getBoundingClientRect = origRangeGetBoundingClientRect;
      }
      if (origRangeGetClientRects) {
        Range.prototype.getClientRects = origRangeGetClientRects;
      }
      if (origElementFromPoint) {
        Document.prototype.elementFromPoint = origElementFromPoint;
      }
      if (origElementsFromPoint) {
        Document.prototype.elementsFromPoint = origElementsFromPoint;
      }
      if (origCaretRangeFromPoint) {
        Document.prototype.caretRangeFromPoint = origCaretRangeFromPoint;
      }
      if (origCaretPositionFromPoint) {
        Document.prototype.caretPositionFromPoint = origCaretPositionFromPoint;
      }
      unpatchCoordinateGetters();
    }

    /* =========================================================================
     * SECTION 3b: Viewport-Unit Overflow Shim (modal dialogs & fixed overlays)
     *
     * Chromium does not divide viewport units by the CSS zoom factor, so `1vh`
     * stays one *unscaled* viewport pixel while every CSS length around it is
     * rendered magnified. Anything that caps itself with
     * `max-height: calc(100vh - …)` — the usual third-party pattern — therefore
     * ends up laid out zoom-factor times taller than the window at 125%+.
     *
     * Two shapes hit users:
     * 1. Modal <dialog>s stay centred through `margin: auto`, so the header (and
     *    the close button with it) is pushed above the window's top edge: only a
     *    few pixels of the button remain on screen, which is why it looks present
     *    but almost never receives a hover or a click.
     * 2. Fixed-position overlays (route panels, alerts, guides) simply run past
     *    the bottom edge, and whatever they would scroll to is clipped away.
     *
     * The shim measures candidates in the layout-pixel space the coordinate
     * engine exposes, marks only the ones that really overflow, and lets the
     * stylesheet cap them with percentages (which do resolve in the zoomed
     * coordinate space). Elements that already fit, and every element at 100%,
     * are never touched.
     * ========================================================================= */
    const DIALOG_CLAMP_ATTR = COMPAT_SHIM.dialogClampAttribute;
    const observedDialogs = new Set();
    let dialogClampFrame = null;
    let dialogResizeObserver = null;
    let viewportUnitSelectors = null;
    let viewportUnitSheetCount = -1;
    let lastOverlayPass = 0;
    const origShowModal = typeof HTMLDialogElement !== 'undefined' ? HTMLDialogElement.prototype.showModal : null;
    // Box properties whose viewport units make an overlay zoom-fragile.
    const VIEWPORT_UNIT_PROPERTIES = ['height', 'max-height', 'min-height', 'width', 'max-width', 'min-width', 'inset', 'top', 'right', 'bottom', 'left'];
    const VIEWPORT_UNIT_VALUE = /(?:^|[^\w.-])\d*\.?\d+(?:d|s|l)?v(?:h|w)\b/;

    function dialogClampEnabled() {
      return !SETTINGS || SETTINGS.compatDialogClamp !== false;
    }

    function openModalDialogs() {
      if (typeof document === 'undefined') return [];
      const dialogs = [];
      for (const element of document.querySelectorAll('dialog[open]')) {
        if (!element.open) continue;
        // `:modal` keeps non-modal dialogs (which are laid out inside their DOM
        // parent and would resolve `100%` against something else) out of scope.
        let modal = true;
        try { modal = element.matches(':modal'); } catch (e) {}
        if (modal) dialogs.push(element);
      }
      return dialogs;
    }

    function releaseDialogClamps() {
      if (typeof document === 'undefined') return;
      for (const element of document.querySelectorAll('[' + DIALOG_CLAMP_ATTR + ']')) {
        element.removeAttribute(DIALOG_CLAMP_ATTR);
      }
    }

    function overflowsViewport(element, viewportWidth, viewportHeight) {
      // Everything here is CSS layout pixels: getBoundingClientRect and
      // window.innerWidth are patched above, and CSS lengths use that space.
      const rect = element.getBoundingClientRect();
      if (!(rect.width > 0) && !(rect.height > 0)) return false;
      return rect.top < -0.5 || rect.left < -0.5
        || rect.bottom > viewportHeight + 0.5 || rect.right > viewportWidth + 0.5;
    }

    function observeDialog(dialog) {
      if (dialogResizeObserver === null || observedDialogs.has(dialog)) return;
      observedDialogs.add(dialog);
      try { dialogResizeObserver.observe(dialog); } catch (e) {}
    }

    function watchDialogs(dialogs) {
      if (dialogResizeObserver === null) return;
      const active = new Set(dialogs);
      for (const dialog of [...observedDialogs]) {
        if (active.has(dialog)) continue;
        observedDialogs.delete(dialog);
        try { dialogResizeObserver.unobserve(dialog); } catch (e) {}
      }
      for (const dialog of dialogs) observeDialog(dialog);
    }

    function syncDialogClamps() {
      dialogClampFrame = null;
      if (typeof document === 'undefined' || !dialogClampEnabled()) return;
      const dialogs = openModalDialogs();
      if (currentScale === 100) {
        releaseDialogClamps();
        watchDialogs(dialogs);
        return;
      }
      for (const dialog of dialogs) clampDialogNow(dialog);
      watchDialogs(dialogs);
      clampViewportUnitOverlays();
    }

    /**
     * Clamp one open modal dialog if it overflows the window.
     *
     * `showModal()` runs this before the browser paints the dialog, so the dialog
     * never appears at its overflowing size first and then jumps: the cap is in
     * place for the very first frame.
     */
    function clampDialogNow(dialog) {
      if (typeof document === 'undefined' || !dialogClampEnabled()) return;
      if (typeof HTMLDialogElement === 'undefined' || !(dialog instanceof HTMLDialogElement)) return;
      if (!dialog.open || currentScale === 100) return;
      // Already clamped dialogs stay clamped: their current rect is the clamped
      // one, so re-measuring them would oscillate.
      if (dialog.hasAttribute(DIALOG_CLAMP_ATTR)) return;
      if (!overflowsViewport(dialog, window.innerWidth, window.innerHeight)) return;
      dialog.setAttribute(DIALOG_CLAMP_ATTR, '');
    }

    // --- Fixed overlays sized from viewport units -----------------------------

    function overlayClampEnabled() {
      return !SETTINGS || SETTINGS.compatOverflowClamp !== false;
    }

    /**
     * Selectors of author rules that size a box from viewport units.
     *
     * Chromium keeps `1vh` at one *unscaled* viewport pixel, so those rules are
     * the only place the quirk can bite; scanning the stylesheets once and
     * caching the result keeps the per-gesture check cheap. The cache is dropped
     * when a plugin injects another sheet, and cross-origin sheets are skipped.
     */
    function viewportUnitRules() {
      if (typeof document === 'undefined') return [];
      const sheetCount = document.styleSheets.length;
      if (viewportUnitSelectors !== null && sheetCount === viewportUnitSheetCount) return viewportUnitSelectors;
      const selectors = new Set();
      let visited = 0;
      const visit = (rules) => {
        if (!rules) return;
        for (const rule of rules) {
          if (visited > 20000) return;
          visited += 1;
          // A style rule may also carry nested rules (`rule.cssRules`), so the
          // declaration block is inspected here and the children after it.
          const style = rule.style;
          if (style && typeof rule.selectorText === 'string' && rule.selectorText !== '') {
            for (const property of VIEWPORT_UNIT_PROPERTIES) {
              const value = style.getPropertyValue(property);
              if (value !== '' && VIEWPORT_UNIT_VALUE.test(value)) {
                selectors.add(rule.selectorText);
                break;
              }
            }
          }
          if (rule.cssRules) visit(rule.cssRules);
        }
      };
      for (const sheet of Array.from(document.styleSheets)) {
        let rules = null;
        try { rules = sheet.cssRules; } catch (e) { continue; }
        try { visit(rules); } catch (e) {}
      }
      viewportUnitSelectors = [...selectors].filter(selector => !/:host\b/.test(selector));
      viewportUnitSheetCount = sheetCount;
      return viewportUnitSelectors;
    }

    function isViewportAnchored(element) {
      // `100%` only means "the zoom-corrected viewport" for boxes whose
      // containing block is the initial containing block.
      if (element.tagName === 'DIALOG') {
        try { if (element.open && element.matches(':modal')) return true; } catch (e) {}
      }
      try { if (element.matches(':popover-open')) return true; } catch (e) {}
      let style = null;
      try { style = getComputedStyle(element); } catch (e) { return false; }
      return style !== null && style.position === 'fixed';
    }

    /**
     * Cap fixed overlays whose viewport-unit sizing makes them overflow the
     * window, so their own scroll container stays reachable.
     *
     * Only elements that (a) are anchored to the viewport, (b) scroll their
     * overflow and (c) really run past the window are marked. A backdrop or a
     * fullscreen media viewer is left alone: capping it would shrink the paint
     * without making anything reachable.
     */
    function clampViewportUnitOverlays() {
      if (!overlayClampEnabled() || currentScale === 100) return;
      const now = Date.now();
      if (now - lastOverlayPass < 120) return;
      lastOverlayPass = now;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      for (const selector of viewportUnitRules()) {
        let elements = null;
        try { elements = document.querySelectorAll(selector); } catch (e) { continue; }
        if (elements.length === 0 || elements.length > 80) continue;
        for (const element of elements) {
          if (element.hasAttribute(DIALOG_CLAMP_ATTR)) continue;
          if (!isViewportAnchored(element)) continue;
          let style = null;
          try { style = getComputedStyle(element); } catch (e) { continue; }
          if (style === null) continue;
          const scrolls = /auto|scroll/.test(style.overflowY) || /auto|scroll/.test(style.overflowX);
          if (!scrolls) continue;
          if (!overflowsViewport(element, viewportWidth, viewportHeight)) continue;
          element.setAttribute(DIALOG_CLAMP_ATTR, '');
        }
      }
    }

    function scheduleDialogClampSync() {
      if (typeof document === 'undefined' || !dialogClampEnabled()) return;
      if (dialogClampFrame !== null) return;
      dialogClampFrame = typeof requestAnimationFrame === 'function'
        ? requestAnimationFrame(syncDialogClamps)
        : setTimeout(syncDialogClamps, 16);
    }

    /**
     * Clamp dialogs the instant they are shown.
     *
     * Waiting for the `toggle` event costs a frame — the dialog paints at its
     * overflowing size, then the shim pulls it back, which reads as the window
     * "jumping into place". Patching `showModal` measures and clamps inside the
     * same task that opens the dialog, so the first paint is already capped.
     */
    function patchDialogShowModal() {
      if (origShowModal === null || typeof HTMLDialogElement === 'undefined' || !dialogClampEnabled()) {
        return () => {};
      }
      try {
        HTMLDialogElement.prototype.showModal = function showModal() {
          const result = origShowModal.apply(this, arguments);
          try {
            if (currentScale !== 100) {
              clampDialogNow(this);
              observeDialog(this);
            }
          } catch (e) {}
          return result;
        };
      } catch (e) {
        return () => {};
      }
      return () => {
        try { HTMLDialogElement.prototype.showModal = origShowModal; } catch (e) {}
      };
    }

    const MODAL_PRESENCE_ATTR = 'data-dsh-ui-zoom-modal';
    let modalPresenceFrame = null;
    let modalPresenceTimer = null;

    /**
     * Mirror "a modal is open" onto <html>.
     *
     * The Windows titlebar drag region swallows pointer input, so a modal that
     * reaches the top of the window must lift it (see the stylesheet rule). A
     * `:has()` selector would do that without JavaScript, but it makes every
     * chat mutation re-evaluate a document-wide selector — measured at ~76% extra
     * script time in the harness — so the flag is kept here instead.
     */
    function syncModalPresence() {
      if (typeof document === 'undefined') return;
      modalPresenceFrame = null;
      let open = false;
      try { open = document.querySelector('[aria-modal="true"], dialog[open]') !== null; } catch (e) { open = false; }
      try {
        if (open) document.documentElement.setAttribute(MODAL_PRESENCE_ATTR, '1');
        else document.documentElement.removeAttribute(MODAL_PRESENCE_ATTR);
      } catch (e) {}
    }

    function scheduleModalPresenceSync() {
      if (typeof document === 'undefined') return;
      if (modalPresenceFrame !== null) return;
      modalPresenceFrame = typeof requestAnimationFrame === 'function'
        ? requestAnimationFrame(syncModalPresence)
        : setTimeout(syncModalPresence, 16);
    }

    function installModalPresenceWatcher() {
      if (typeof document === 'undefined') return () => {};
      const handle = () => scheduleModalPresenceSync();
      // Any of these can open or close a modal: a click on a menu entry, a
      // keyboard shortcut (Ctrl+, opens settings), Escape, or a native <dialog>
      // toggling. The timer is the safety net for modals the app opens on its
      // own, where no event reaches us first.
      document.addEventListener('click', handle, true);
      document.addEventListener('pointerup', handle, true);
      document.addEventListener('keydown', handle, true);
      document.addEventListener('toggle', handle, true);
      modalPresenceTimer = setInterval(syncModalPresence, 1500);
      syncModalPresence();
      return () => {
        document.removeEventListener('click', handle, true);
        document.removeEventListener('pointerup', handle, true);
        document.removeEventListener('keydown', handle, true);
        document.removeEventListener('toggle', handle, true);
        if (modalPresenceTimer !== null) { clearInterval(modalPresenceTimer); modalPresenceTimer = null; }
        if (modalPresenceFrame !== null) {
          if (typeof cancelAnimationFrame === 'function') cancelAnimationFrame(modalPresenceFrame);
          clearTimeout(modalPresenceFrame);
          modalPresenceFrame = null;
        }
        try { document.documentElement.removeAttribute(MODAL_PRESENCE_ATTR); } catch (e) {}
      };
    }

    function installDialogClampWatchers() {
      if (typeof document === 'undefined' || !dialogClampEnabled()) return () => {};
      const restoreShowModal = patchDialogShowModal();
      // `toggle` (capture) is the fallback for dialogs shown without
      // showModal() (an `open` attribute); the ResizeObserver covers content
      // that arrives after the dialog opened, the resize listener covers window
      // changes, and the gesture listeners catch menus/popovers that only appear
      // after a click.
      const handleToggle = () => scheduleDialogClampSync();
      const handleResize = () => scheduleDialogClampSync();
      const handleGesture = () => scheduleDialogClampSync();
      document.addEventListener('toggle', handleToggle, true);
      window.addEventListener('resize', handleResize);
      window.addEventListener('click', handleGesture, true);
      window.addEventListener('pointerup', handleGesture, true);
      if (typeof ResizeObserver !== 'undefined') {
        // ResizeObserver runs after layout but before paint of the same frame,
        // so clamping here is still invisible to the user.
        dialogResizeObserver = new ResizeObserver(() => syncDialogClamps());
      }
      syncDialogClamps();
      return () => {
        restoreShowModal();
        document.removeEventListener('toggle', handleToggle, true);
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('click', handleGesture, true);
        window.removeEventListener('pointerup', handleGesture, true);
        if (dialogResizeObserver !== null) {
          for (const dialog of observedDialogs) {
            try { dialogResizeObserver.unobserve(dialog); } catch (e) {}
          }
          observedDialogs.clear();
          dialogResizeObserver.disconnect();
          dialogResizeObserver = null;
        }
        if (dialogClampFrame !== null) {
          if (typeof cancelAnimationFrame === 'function') cancelAnimationFrame(dialogClampFrame);
          clearTimeout(dialogClampFrame);
          dialogClampFrame = null;
        }
        releaseDialogClamps();
      };
    }

    /* =========================================================================
     * SECTION 4: DOM Zoom & HUD Toast Notification
     * ========================================================================= */
    function syncWhaleWidgetPosition() {
      if (typeof window === 'undefined') return;
      // Dispatch resize event so third-party widgets like dsh-whale-widget re-settle with the new viewport dimensions
      try {
        window.dispatchEvent(new Event('resize'));
      } catch (e) {}
    }

    function applyZoomToDOM(scale) {
      if (typeof document === 'undefined') return;
      const root = document.documentElement;
      if (scale === 100) {
        root.style.zoom = '';
        root.style.removeProperty('--dsh-ui-zoom-factor');
      } else {
        root.style.zoom = String(scale / 100);
        // Viewport units are not divided by CSS zoom (see the shim above), so
        // third-party CSS that has to stay zoom-correct can divide by this.
        root.style.setProperty('--dsh-ui-zoom-factor', String(scale / 100));
      }
      // One window resize reaches every viewport consumer; dispatching a second
      // one used to make each zoom step reflow the app twice.
      syncWhaleWidgetPosition();
      if (typeof window !== 'undefined' && window.visualViewport) {
        try {
          window.visualViewport.dispatchEvent(new Event('resize'));
        } catch (e) {}
      }
    }

    function showZoomToast(scale) {
      if (typeof document === 'undefined') return;
      if (!toastEl) {
        toastEl = document.createElement('div');
        toastEl.id = 'dsh-zoom-hud';
        // Announce the new zoom level to assistive technology without stealing focus.
        toastEl.setAttribute('role', 'status');
        toastEl.setAttribute('aria-live', 'polite');
        toastEl.setAttribute('aria-atomic', 'true');
        toastEl.style.cssText = [
          'position: fixed',
          'bottom: 28px',
          'right: 28px',
          'padding: 8px 16px',
          'background: var(--dsw-alias-bg-overlay, rgba(20, 24, 30, 0.95))',
          'color: var(--dsw-alias-label-primary, #ffffff)',
          'border: 1px solid var(--dsw-alias-border-l2, rgba(255, 255, 255, 0.15))',
          'border-radius: 8px',
          'font-size: 13px',
          'font-weight: 500',
          'font-family: inherit',
          'box-shadow: 0 4px 16px rgba(0, 0, 0, 0.35)',
          'z-index: 999999',
          'pointer-events: none',
          'display: flex',
          'align-items: center',
          'gap: 8px',
          'transition: opacity 0.15s ease-out, transform 0.15s ease-out',
          'backdrop-filter: blur(8px)'
        ].join(';');
        document.body.appendChild(toastEl);
      }
      toastEl.textContent = translate('hud', { percent: scale });
      toastEl.style.opacity = '1';
      toastEl.style.transform = 'translateY(0)';

      if (toastTimeout) clearTimeout(toastTimeout);
      toastTimeout = setTimeout(() => {
        if (toastEl) {
          toastEl.style.opacity = '0';
          toastEl.style.transform = 'translateY(6px)';
        }
      }, 1200);
    }

    /* =========================================================================
     * SECTION 5: Zoom Action Operators
     * ========================================================================= */
    const REVERSED_LADDER = [...LADDER].reverse();

    function setScale(targetScale, triggerToast = true, persist = true) {
      const clamped = Math.min(Math.max(Math.round(targetScale), MIN_SCALE), MAX_SCALE);
      currentScale = clamped;
      applyZoomToDOM(clamped);
      // Whether a modal dialog overflows is a function of the zoom level, so the
      // shim is re-evaluated against the new viewport in the same task (no paint
      // happens in between, so the dialog never flashes at its unclamped size).
      releaseDialogClamps();
      lastOverlayPass = 0;
      syncDialogClamps();
      if (persist) {
        try {
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, String(clamped));
          }
        } catch (e) {}
      }
      for (const cb of listeners) {
        try { cb(clamped); } catch (e) {}
      }
      if (triggerToast) {
        showZoomToast(clamped);
      }
    }

    // Adopt a zoom saved by another window (the `storage` event never fires in
    // the window that wrote the value, so this cannot loop).
    function adoptStoredScale(rawValue) {
      if (rawValue === null) return;
      const parsed = parseInt(rawValue, 10);
      if (isNaN(parsed) || parsed < MIN_SCALE || parsed > MAX_SCALE) return;
      if (parsed === currentScale) return;
      setScale(parsed, false, false);
    }

    function zoomIn() {
      if (currentScale >= MAX_SCALE) return;
      const next = LADDER.find(v => v > currentScale);
      setScale(next !== undefined ? next : Math.min(currentScale + SCALE_STEP, MAX_SCALE), true);
    }

    function zoomOut() {
      if (currentScale <= MIN_SCALE) return;
      const prev = REVERSED_LADDER.find(v => v < currentScale);
      setScale(prev !== undefined ? prev : Math.max(currentScale - SCALE_STEP, MIN_SCALE), true);
    }

    function resetZoom() {
      setScale(Math.min(Math.max(100, MIN_SCALE), MAX_SCALE), true);
    }

    // Native shortcut integration: when the Host exposes ctx.shortcuts, the
    // zoom actions become visible/rebindable commands in Settings → Shortcuts
    // and participate in conflict detection. A raw key listener remains the
    // fallback for compositions (or rejected registrations) where the service
    // is unavailable.
    const SHORTCUT_PROFILES = ['desktop:macos', 'desktop:windows', 'desktop:linux', 'web:macos', 'web:windows', 'web:linux'];
    const SHORTCUT_REGIONS = ['page', 'editable', 'terminal'];
    const SHORTCUT_MODALS = ['settings', 'shortcuts'];

    function shortcutDefaults(code) {
      const defaults = {};
      for (const profile of SHORTCUT_PROFILES) {
        defaults[profile] = { code, modifiers: ['primary'] };
      }
      return defaults;
    }

    function installShortcutCommands(service) {
      if (!service || typeof service.register !== 'function') return null;
      const definitions = [
        { id: 'dsh-ui-zoom.zoom-in', key: 'zoomIn', code: 'Equal', run: zoomIn },
        { id: 'dsh-ui-zoom.zoom-out', key: 'zoomOut', code: 'Minus', run: zoomOut },
        { id: 'dsh-ui-zoom.zoom-reset', key: 'reset', code: 'Digit0', run: resetZoom }
      ];
      const disposers = [];
      try {
        for (const definition of definitions) {
          disposers.push(service.register({
            id: definition.id,
            label: () => translate(definition.key),
            aliases: [definition.id],
            defaults: shortcutDefaults(definition.code),
            regions: SHORTCUT_REGIONS,
            modals: SHORTCUT_MODALS,
            resolve: () => ({ status: 'handled', run: definition.run })
          }));
        }
      } catch (e) {
        // A conflicting default (or an older service shape) must not take the
        // plugin down: roll the partial registration back and use the listener.
        for (const dispose of disposers.reverse()) {
          try { dispose(); } catch (error) {}
        }
        return null;
      }
      return () => {
        for (const dispose of disposers) {
          try { dispose(); } catch (e) {}
        }
      };
    }

    /* =========================================================================
     * SECTION 6: React UI Settings Component
     * ========================================================================= */
    function useLocaleRevision() {
      const [revision, setRevision] = React.useState(0);
      React.useEffect(() => {
        if (localeService === null || typeof localeService.subscribe !== 'function') return undefined;
        return localeService.subscribe(() => setRevision(value => value + 1));
      }, []);
      return revision;
    }

    function ZoomSettingsRow() {
      const [scale, setScaleState] = React.useState(currentScale);
      // Re-render when the active locale switches (dictionary registration or a
      // language change bumps the locale revision).
      useLocaleRevision();

      React.useEffect(() => {
        const update = (newScale) => setScaleState(newScale);
        listeners.add(update);
        return () => {
          listeners.delete(update);
        };
      }, []);

      const title = translate('title');
      const desc = translate('desc');
      const hint = translate('hint');
      const resetLabel = translate('reset');

      return h('div', { className: 'dsh-ui-zoom-row', role: 'group', 'aria-label': title },
        h('div', { className: 'dsh-ui-zoom-row-text' },
          h('div', { className: 'dsh-ui-zoom-title' }, title),
          h('div', { className: 'dsh-ui-zoom-desc' }, desc),
          h('div', { className: 'dsh-ui-zoom-hint' }, hint)
        ),
        h('div', { className: 'dsh-ui-zoom-controls' },
          // Presets
          h('div', { className: 'dsh-ui-zoom-presets' },
            PRESETS.map((p) =>
              h('button', {
                key: p,
                type: 'button',
                className: 'dsh-ui-zoom-preset-btn' + (scale === p ? ' active' : ''),
                onClick: () => setScale(p, false),
                'aria-label': `${p}%`,
                'aria-pressed': scale === p
              }, `${p}%`)
            )
          ),
          // Stepper
          h('div', { className: 'dsh-ui-zoom-stepper' },
            h('button', {
              type: 'button',
              className: 'dsh-ui-zoom-stepper-btn',
              disabled: scale <= MIN_SCALE,
              onClick: zoomOut,
              'aria-label': translate('zoomOut')
            }, '−'),
            h('span', { className: 'dsh-ui-zoom-value', 'aria-live': 'polite', 'aria-atomic': 'true' }, `${scale}%`),
            h('button', {
              type: 'button',
              className: 'dsh-ui-zoom-stepper-btn',
              disabled: scale >= MAX_SCALE,
              onClick: zoomIn,
              'aria-label': translate('zoomIn')
            }, '+')
          ),
          // Reset button
          h('button', {
            type: 'button',
            className: 'dsh-ui-zoom-reset-btn',
            disabled: scale === 100,
            onClick: resetZoom,
            'aria-label': resetLabel
          }, resetLabel)
        )
      );
    }

    /* =========================================================================
     * SECTION 7: Cordis Plugin Lifecycle & Global Shortcuts
     * ========================================================================= */
    return {
      inject: ['slots'],
      apply(ctx) {
        ensureStyles();

        // 0. Client locale: the HUD and the settings row resolve copy through the
        // shared service when the composition provides it (live language switch),
        // and fall back to the browser language otherwise.
        const locale = readClientService(ctx, 'locale');
        attachLocaleService(locale);
        ctx.effect(() => {
          if (!locale || typeof locale.register !== 'function') return;
          return locale.register(LOCALE_NS, { zh: MESSAGES.zh, en: MESSAGES.en });
        }, 'ui-zoom: dictionaries');

        // 1. Install rect & viewport patches, restore zoom and listen to keyboard / wheel shortcuts
        ctx.effect(() => {
          installWindowAndRectPatches();
          applyZoomToDOM(currentScale);
          const disposeDialogClampWatchers = installDialogClampWatchers();
          const disposeModalPresence = installModalPresenceWatcher();

          // Workaround for third-party widget button clicks under pointerdown capture
          function handleProtectedPointerDown(e) {
            if (COMPAT_SHIM.isProtectedPointerElement(e.target)) {
              e.stopPropagation();
            }
          }
          window.addEventListener('pointerdown', handleProtectedPointerDown, true);

          // Prefer the Host command service. If it is unavailable at apply time
          // (or its registration is rejected), the capture listener below keeps
          // the shortcuts working.
          let disposeShortcuts = installShortcutCommands(readClientService(ctx, 'shortcuts'));

          function handleKeyDown(e) {
            if (disposeShortcuts !== null) return;
            if (!(e.ctrlKey || e.metaKey) || e.altKey) return;
            // Never steal a key from an active IME composition.
            if (e.isComposing || e.keyCode === 229) return;
            if (e.key === '=' || e.key === '+' || e.code === 'Equal' || e.code === 'NumpadAdd') {
              e.preventDefault();
              zoomIn();
            } else if (e.key === '-' || e.key === '_' || e.code === 'Minus' || e.code === 'NumpadSubtract') {
              e.preventDefault();
              zoomOut();
            } else if (e.key === '0' || e.code === 'Digit0' || e.code === 'Numpad0') {
              e.preventDefault();
              resetZoom();
            }
          }

          // Ctrl+wheel is coalesced to at most one ladder step per animation
          // frame: a trackpad emits dozens of wheel events per second, and each
          // step re-lays out the entire application.
          let wheelFrame = null;
          let wheelDirection = 0;
          function flushWheelStep() {
            wheelFrame = null;
            const direction = wheelDirection;
            wheelDirection = 0;
            if (direction < 0) zoomIn();
            else if (direction > 0) zoomOut();
          }
          function handleWheel(e) {
            if (!(e.ctrlKey || e.metaKey)) return;
            e.preventDefault();
            if (e.deltaY === 0) return;
            wheelDirection = e.deltaY < 0 ? -1 : 1;
            if (wheelFrame !== null) return;
            wheelFrame = typeof requestAnimationFrame === 'function'
              ? requestAnimationFrame(flushWheelStep)
              : setTimeout(flushWheelStep, 16);
          }

          window.addEventListener('keydown', handleKeyDown, { capture: true });
          window.addEventListener('wheel', handleWheel, { passive: false });

          // Follow zoom changes made in other windows/tabs of the same GUI.
          function handleStorage(event) {
            if (event.key !== STORAGE_KEY) return;
            adoptStoredScale(event.newValue);
          }
          window.addEventListener('storage', handleStorage);

          return () => {
            uninstallWindowAndRectPatches();
            disposeDialogClampWatchers();
            disposeModalPresence();
            window.removeEventListener('pointerdown', handleProtectedPointerDown, true);
            window.removeEventListener('keydown', handleKeyDown, { capture: true });
            window.removeEventListener('wheel', handleWheel);
            window.removeEventListener('storage', handleStorage);
            if (disposeShortcuts !== null) {
              const dispose = disposeShortcuts;
              disposeShortcuts = null;
              dispose();
            }
            if (wheelFrame !== null) {
              if (typeof cancelAnimationFrame === 'function') cancelAnimationFrame(wheelFrame);
              clearTimeout(wheelFrame);
              wheelFrame = null;
            }
            removeStyles();
            if (toastTimeout) clearTimeout(toastTimeout);
            if (toastEl && toastEl.parentElement) {
              toastEl.parentElement.removeChild(toastEl);
              toastEl = null;
            }
            document.documentElement.style.zoom = '';
            document.documentElement.style.removeProperty('--dsh-ui-zoom-factor');
            syncWhaleWidgetPosition();
          };
        });

        // 2. Register into settings.general.item
        ctx.slots.inject('settings.general.item', () => ctx.slots.register({
          name: 'settings.general.item',
          id: 'ui-zoom',
          order: 11.5,
        }, ZoomSettingsRow));
      }
    };
  }
});
