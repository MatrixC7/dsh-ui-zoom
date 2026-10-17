window.__ModuleLoader__.load({
  id: 'dsh-ui-zoom',
  factory(require) {
    const React = require('react');
    const h = React.createElement;

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

    function ensureStyles() {
      if (typeof document === 'undefined') return;
      if (!document.querySelector('style[data-plugin-css="' + CSS_TAG_ID + '"]')) {
        const style = document.createElement('style');
        style.dataset.plugin = 'dsh-ui-zoom';
        style.dataset.pluginCss = CSS_TAG_ID;
        style.textContent = CSS_TEXT;
        document.head.appendChild(style);
      }
    }

    const STORAGE_KEY = 'dsh.ui.zoom_scale';
    const PRESETS = [80, 90, 100, 110, 125, 150];
    const LADDER = [50, 60, 70, 75, 80, 85, 90, 95, 100, 105, 110, 115, 120, 125, 135, 150, 175, 200, 225, 250];

    function loadSavedScale() {
      if (typeof localStorage === 'undefined') return 100;
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = parseInt(raw, 10);
          if (!isNaN(parsed) && parsed >= 50 && parsed <= 250) {
            return parsed;
          }
        }
      } catch (e) {}
      return 100;
    }

    let currentScale = loadSavedScale();
    const listeners = new Set();
    let toastTimeout = null;
    let toastEl = null;

    // --- Rect Coordinate Scaling for Portals, Menus, Popovers and Tooltips ---
    const origGetBoundingClientRect = Element.prototype.getBoundingClientRect;
    const origGetClientRects = Element.prototype.getClientRects;
    const origRangeGetBoundingClientRect = typeof Range !== 'undefined' ? Range.prototype.getBoundingClientRect : null;
    const origRangeGetClientRects = typeof Range !== 'undefined' ? Range.prototype.getClientRects : null;
    const origElementFromPoint = typeof document !== 'undefined' ? Document.prototype.elementFromPoint : null;
    const origElementsFromPoint = typeof document !== 'undefined' ? Document.prototype.elementsFromPoint : null;

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

    // --- Viewport Dimension Scaling (for third-party floating widgets like dsh-whale-widget) ---
    const origInnerWidthDesc = Object.getOwnPropertyDescriptor(window, 'innerWidth') || {
      get() { return window.innerWidth; },
      configurable: true
    };
    const origInnerHeightDesc = Object.getOwnPropertyDescriptor(window, 'innerHeight') || {
      get() { return window.innerHeight; },
      configurable: true
    };
    const origClientWidthDesc = Object.getOwnPropertyDescriptor(Element.prototype, 'clientWidth') || {
      get() { return this.clientWidth; },
      configurable: true
    };
    const origClientHeightDesc = Object.getOwnPropertyDescriptor(Element.prototype, 'clientHeight') || {
      get() { return this.clientHeight; },
      configurable: true
    };

    function isWhaleHitTestImg(el) {
      // Only the whale hit-test image (.dshwv-img) needs raw physical coordinates to compare with MouseEvent clientX/clientY.
      // Other whale elements (like root, menuBtn, menuBox, etc.) calculate layout positions against viewport, so they need scaled layout coordinates.
      if (!el || typeof el.className !== 'string') return false;
      return el.className.indexOf('dshwv-img') !== -1;
    }

    function installWindowAndRectPatches() {
      // 1. Element & Range getBoundingClientRect
      // For general elements (including DSH portal menus, popups, and whale position calculation elements),
      // we scale the rect to layout coordinates (CSS pixels).
      // Only .dshwv-img preserves the visual rect for pixel-perfect hit-testing.
      Element.prototype.getBoundingClientRect = function() {
        const rect = origGetBoundingClientRect.apply(this, arguments);
        if (currentScale === 100) return rect;
        if (isWhaleHitTestImg(this)) return rect;
        return scaleRect(rect, currentScale / 100);
      };

      Element.prototype.getClientRects = function() {
        const list = origGetClientRects.apply(this, arguments);
        if (currentScale === 100) return list;
        if (isWhaleHitTestImg(this)) return list;
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

      // 2. document.elementFromPoint
      // Under CSS zoom, document.elementFromPoint takes layout coordinates (CSS pixels),
      // whereas MouseEvents supply visual clientX/clientY. We convert visual coordinates to layout coordinates.
      if (origElementFromPoint) {
        Document.prototype.elementFromPoint = function(x, y) {
          if (currentScale === 100) return origElementFromPoint.call(this, x, y);
          const factor = currentScale / 100;
          return origElementFromPoint.call(this, x / factor, y / factor) || origElementFromPoint.call(this, x, y);
        };
      }
      if (origElementsFromPoint) {
        Document.prototype.elementsFromPoint = function(x, y) {
          if (currentScale === 100) return origElementsFromPoint.call(this, x, y);
          const factor = currentScale / 100;
          return origElementsFromPoint.call(this, x / factor, y / factor);
        };
      }

      // 3. window.innerWidth & window.innerHeight
      // Under CSS zoom, layout viewport dimensions in CSS pixels equal visual pixels divided by zoom factor.
      try {
        Object.defineProperty(window, 'innerWidth', {
          get() {
            const raw = origInnerWidthDesc.get ? origInnerWidthDesc.get.call(window) : window.outerWidth;
            if (currentScale === 100) return raw;
            return Math.round(raw / (currentScale / 100));
          },
          configurable: true
        });
      } catch (e) {}

      try {
        Object.defineProperty(window, 'innerHeight', {
          get() {
            const raw = origInnerHeightDesc.get ? origInnerHeightDesc.get.call(window) : window.outerHeight;
            if (currentScale === 100) return raw;
            return Math.round(raw / (currentScale / 100));
          },
          configurable: true
        });
      } catch (e) {}

      // 4. documentElement.clientWidth & clientHeight fallback
      try {
        Object.defineProperty(Element.prototype, 'clientWidth', {
          get() {
            const raw = origClientWidthDesc.get ? origClientWidthDesc.get.call(this) : 0;
            if (currentScale === 100 || this !== document.documentElement) return raw;
            return Math.round(raw / (currentScale / 100));
          },
          configurable: true
        });
      } catch (e) {}

      try {
        Object.defineProperty(Element.prototype, 'clientHeight', {
          get() {
            const raw = origClientHeightDesc.get ? origClientHeightDesc.get.call(this) : 0;
            if (currentScale === 100 || this !== document.documentElement) return raw;
            return Math.round(raw / (currentScale / 100));
          },
          configurable: true
        });
      } catch (e) {}
    }

    function uninstallWindowAndRectPatches() {
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

      try {
        if (origInnerWidthDesc) Object.defineProperty(window, 'innerWidth', origInnerWidthDesc);
      } catch (e) {}
      try {
        if (origInnerHeightDesc) Object.defineProperty(window, 'innerHeight', origInnerHeightDesc);
      } catch (e) {}
      try {
        if (origClientWidthDesc) Object.defineProperty(Element.prototype, 'clientWidth', origClientWidthDesc);
      } catch (e) {}
      try {
        if (origClientHeightDesc) Object.defineProperty(Element.prototype, 'clientHeight', origClientHeightDesc);
      } catch (e) {}
    }

    function syncWhaleWidgetPosition() {
      if (typeof window === 'undefined') return;
      // Dispatch resize event so third-party widgets like dsh-whale-widget re-settle with the new viewport dimensions
      try {
        window.dispatchEvent(new Event('resize'));
      } catch (e) {}
    }

    function applyZoomToDOM(scale) {
      if (typeof document === 'undefined') return;
      if (scale === 100) {
        document.documentElement.style.zoom = '';
      } else {
        document.documentElement.style.zoom = String(scale / 100);
      }
      syncWhaleWidgetPosition();
    }

    function showZoomToast(scale) {
      if (typeof document === 'undefined') return;
      if (!toastEl) {
        toastEl = document.createElement('div');
        toastEl.id = 'dsh-zoom-hud';
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
      const isZh = (document.documentElement.lang || navigator.language || '').toLowerCase().startsWith('zh');
      toastEl.textContent = (isZh ? '界面缩放: ' : 'UI Zoom: ') + scale + '%';
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

    function setScale(targetScale, triggerToast = true) {
      const clamped = Math.min(Math.max(Math.round(targetScale), 50), 250);
      currentScale = clamped;
      applyZoomToDOM(clamped);
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, String(clamped));
        }
      } catch (e) {}
      for (const cb of listeners) {
        try { cb(clamped); } catch (e) {}
      }
      if (triggerToast) {
        showZoomToast(clamped);
      }
    }

    function zoomIn() {
      const next = LADDER.find(v => v > currentScale);
      setScale(next !== undefined ? next : Math.min(currentScale + 10, 250), true);
    }

    function zoomOut() {
      const reversed = [...LADDER].reverse();
      const prev = reversed.find(v => v < currentScale);
      setScale(prev !== undefined ? prev : Math.max(currentScale - 10, 50), true);
    }

    function resetZoom() {
      setScale(100, true);
    }

    function ZoomSettingsRow() {
      const [scale, setScaleState] = React.useState(currentScale);

      React.useEffect(() => {
        const update = (newScale) => setScaleState(newScale);
        listeners.add(update);
        return () => {
          listeners.delete(update);
        };
      }, []);

      const isZh = (typeof document !== 'undefined' && (document.documentElement.lang || navigator.language || '').toLowerCase().startsWith('zh'));

      const title = isZh ? '界面缩放' : 'UI Zoom';
      const desc = isZh
        ? '等比缩放整个应用界面大小（类似于 VS Code 窗口缩放）。'
        : 'Scale the entire application interface proportionally (similar to VS Code window zoom).';
      const hint = isZh
        ? '快捷键：Ctrl + = / - 缩放，Ctrl + 0 重置（支持 Ctrl + 鼠标滚轮）'
        : 'Shortcuts: Ctrl + = / - to zoom, Ctrl + 0 to reset (Ctrl + mouse wheel supported)';
      const resetLabel = isZh ? '重置 (100%)' : 'Reset (100%)';

      return h('div', { className: 'dsh-ui-zoom-row' },
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
                'aria-label': `${p}%`
              }, `${p}%`)
            )
          ),
          // Stepper
          h('div', { className: 'dsh-ui-zoom-stepper' },
            h('button', {
              type: 'button',
              className: 'dsh-ui-zoom-stepper-btn',
              disabled: scale <= 50,
              onClick: zoomOut,
              'aria-label': isZh ? '缩小界面' : 'Zoom out'
            }, '−'),
            h('span', { className: 'dsh-ui-zoom-value' }, `${scale}%`),
            h('button', {
              type: 'button',
              className: 'dsh-ui-zoom-stepper-btn',
              disabled: scale >= 250,
              onClick: zoomIn,
              'aria-label': isZh ? '放大界面' : 'Zoom in'
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

    return {
      inject: ['slots'],
      apply(ctx) {
        ensureStyles();

        // 1. Install rect & viewport patches, restore zoom and listen to keyboard / wheel shortcuts
        ctx.effect(() => {
          installWindowAndRectPatches();
          applyZoomToDOM(currentScale);

          // Workaround for third-party widget button clicks under pointerdown capture
          function handleWhaleMenuBtnPointerDown(e) {
            const btn = e.target && e.target.closest ? e.target.closest('.dshwv-menu-btn') : null;
            if (btn) {
              e.stopPropagation();
            }
          }
          window.addEventListener('pointerdown', handleWhaleMenuBtnPointerDown, true);

          function handleKeyDown(e) {
            if (!(e.ctrlKey || e.metaKey) || e.altKey) return;
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

          function handleWheel(e) {
            if (e.ctrlKey || e.metaKey) {
              e.preventDefault();
              if (e.deltaY < 0) {
                zoomIn();
              } else if (e.deltaY > 0) {
                zoomOut();
              }
            }
          }

          window.addEventListener('keydown', handleKeyDown, { capture: true });
          window.addEventListener('wheel', handleWheel, { passive: false });

          return () => {
            uninstallWindowAndRectPatches();
            window.removeEventListener('pointerdown', handleWhaleMenuBtnPointerDown, true);
            window.removeEventListener('keydown', handleKeyDown, { capture: true });
            window.removeEventListener('wheel', handleWheel);
            if (toastTimeout) clearTimeout(toastTimeout);
            if (toastEl && toastEl.parentElement) {
              toastEl.parentElement.removeChild(toastEl);
              toastEl = null;
            }
            document.documentElement.style.zoom = '';
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
