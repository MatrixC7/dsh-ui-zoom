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
        background: var(--dsw-alias-brand-primary, #2563eb);
        color: #ffffff;
        border-color: transparent;
        font-weight: 600;
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

    function installRectPatches() {
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
    }

    function uninstallRectPatches() {
      Element.prototype.getBoundingClientRect = origGetBoundingClientRect;
      Element.prototype.getClientRects = origGetClientRects;
      if (origRangeGetBoundingClientRect) {
        Range.prototype.getBoundingClientRect = origRangeGetBoundingClientRect;
      }
      if (origRangeGetClientRects) {
        Range.prototype.getClientRects = origRangeGetClientRects;
      }
    }

    function applyZoomToDOM(scale) {
      if (typeof document === 'undefined') return;
      if (scale === 100) {
        document.documentElement.style.zoom = '';
      } else {
        document.documentElement.style.zoom = String(scale / 100);
      }
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

        // 1. Install rect patches, restore zoom and listen to keyboard / wheel shortcuts
        ctx.effect(() => {
          installRectPatches();
          applyZoomToDOM(currentScale);

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
            uninstallRectPatches();
            window.removeEventListener('keydown', handleKeyDown, { capture: true });
            window.removeEventListener('wheel', handleWheel);
            if (toastTimeout) clearTimeout(toastTimeout);
            if (toastEl && toastEl.parentElement) {
              toastEl.parentElement.removeChild(toastEl);
              toastEl = null;
            }
            document.documentElement.style.zoom = '';
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
