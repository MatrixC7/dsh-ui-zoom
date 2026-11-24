#!/usr/bin/env node
/**
 * Dependency-free regression harness for dsh-ui-zoom.
 *
 * It starts a tiny static server for the plugin bundle and a fixture page, then
 * drives a real Chromium through the DevTools protocol. Set CHROME_PATH to the
 * browser executable (CI does this); otherwise common install locations are
 * probed.
 *
 * Covered: pointer-coordinate normalization (the CodeMirror caret class of bug),
 * drag selection, the 5% ladder, Ctrl+wheel coalescing, Host Config, locale
 * switching, ctx.shortcuts integration/fallback and teardown restoration.
 */
import http from 'node:http'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { spawn, execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const TEST_DIR = path.join(ROOT, 'test')
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

function findChrome() {
  if (process.env.CHROME_PATH && fs.existsSync(process.env.CHROME_PATH)) return process.env.CHROME_PATH
  const candidates = process.platform === 'win32'
    ? [
        path.join(process.env.LOCALAPPDATA || '', 'Google/Chrome/Application/chrome.exe'),
        'C:/Program Files/Google/Chrome/Application/chrome.exe',
        'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
        'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
      ]
    : ['/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable']
  for (const candidate of candidates) {
    if (candidate && fs.existsSync(candidate)) return candidate
  }
  for (const command of ['chromium', 'chromium-browser', 'google-chrome', 'google-chrome-stable']) {
    try {
      const found = execFileSync(process.platform === 'win32' ? 'where' : 'which', [command], { encoding: 'utf8' }).trim().split(/\r?\n/)[0]
      if (found && fs.existsSync(found)) return found
    } catch (error) {}
  }
  throw new Error('Chromium not found; set CHROME_PATH to a Chrome/Chromium executable')
}

function startServer() {
  const types = { '.js': 'text/javascript', '.html': 'text/html', '.css': 'text/css' }
  const server = http.createServer((request, response) => {
    const url = decodeURIComponent((request.url || '/').split('?')[0])
    const file = url === '/plugin/client.js'
      ? path.join(ROOT, 'client.js')
      : path.join(TEST_DIR, 'page.html')
    fs.readFile(file, (error, data) => {
      if (error) {
        response.writeHead(404)
        response.end('not found')
        return
      }
      response.writeHead(200, { 'content-type': types[path.extname(file)] || 'application/octet-stream', 'cache-control': 'no-store' })
      response.end(data)
    })
  })
  return new Promise((resolve, reject) => {
    server.once('error', reject)
    server.listen(0, '127.0.0.1', () => resolve({
      port: server.address().port,
      close: () => new Promise(done => server.close(done))
    }))
  })
}

class Cdp {
  constructor(socket) {
    this.socket = socket
    this.nextId = 0
    this.pending = new Map()
    socket.addEventListener('message', event => {
      const message = JSON.parse(event.data)
      const resolver = message.id === undefined ? undefined : this.pending.get(message.id)
      if (resolver === undefined) return
      this.pending.delete(message.id)
      resolver(message)
    })
  }

  send(method, params = {}) {
    const id = ++this.nextId
    this.socket.send(JSON.stringify({ id, method, params }))
    return new Promise(resolve => this.pending.set(id, resolve))
  }

  async evaluate(expression) {
    const message = await this.send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
    if (message.result && message.result.exceptionDetails) {
      throw new Error('evaluate failed: ' + JSON.stringify(message.result.exceptionDetails))
    }
    return message.result && message.result.result ? message.result.result.value : undefined
  }

  async waitFor(expression, timeoutMs = 8000) {
    const deadline = Date.now() + timeoutMs
    while (Date.now() < deadline) {
      try {
        if (await this.evaluate(expression)) return
      } catch (error) {}
      await sleep(80)
    }
    throw new Error('timed out waiting for ' + expression)
  }

  async click(x, y) {
    await this.send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', buttons: 1, clickCount: 1 })
    await this.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', buttons: 0, clickCount: 1 })
    await sleep(120)
  }

  async pressCtrl(key, code, keyCode) {
    await this.send('Input.dispatchKeyEvent', { type: 'keyDown', modifiers: 2, key, code, windowsVirtualKeyCode: keyCode, nativeVirtualKeyCode: keyCode })
    await this.send('Input.dispatchKeyEvent', { type: 'keyUp', modifiers: 2, key, code, windowsVirtualKeyCode: keyCode, nativeVirtualKeyCode: keyCode })
    await sleep(90)
  }

  async drag(from, to) {
    await this.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: from.x, y: from.y, button: 'left', buttons: 1, clickCount: 1 })
    for (let step = 1; step <= 6; step += 1) {
      await this.send('Input.dispatchMouseEvent', {
        type: 'mouseMoved',
        x: from.x + (to.x - from.x) * step / 6,
        y: from.y + (to.y - from.y) * step / 6,
        button: 'left',
        buttons: 1
      })
    }
    await this.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: to.x, y: to.y, button: 'left', buttons: 0, clickCount: 1 })
    await sleep(180)
  }
}

async function launchChrome(chromePath, pageUrl) {
  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dsh-ui-zoom-test-'))
  const proc = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=0',
    `--user-data-dir=${userDataDir}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-gpu',
    '--hide-scrollbars',
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--window-size=1400,1000',
    pageUrl
  ], { stdio: ['ignore', 'ignore', 'pipe'] })

  const activePortFile = path.join(userDataDir, 'DevToolsActivePort')
  const deadline = Date.now() + 15000
  let port
  while (Date.now() < deadline) {
    if (fs.existsSync(activePortFile)) {
      const first = fs.readFileSync(activePortFile, 'utf8').split(/\r?\n/)[0]
      if (first) { port = Number(first); break }
    }
    await sleep(100)
  }
  if (!port) throw new Error('Chromium did not expose a DevTools port')

  const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()
  const target = targets.find(item => item.type === 'page')
  if (!target) throw new Error('no page target')
  const socket = new WebSocket(target.webSocketDebuggerUrl)
  await new Promise((resolve, reject) => {
    socket.addEventListener('open', resolve, { once: true })
    socket.addEventListener('error', reject, { once: true })
  })
  const cdp = new Cdp(socket)
  await cdp.send('Runtime.enable')
  return { proc, cdp, close: () => { try { socket.close() } catch (error) {} proc.kill() } }
}

/* ------------------------------- scenarios ------------------------------- */

const results = []
function check(name, condition, detail) {
  results.push({ name, ok: Boolean(condition), detail })
  console.log(`${condition ? 'PASS' : 'FAIL'}  ${name}${detail === undefined ? '' : '  — ' + detail}`)
}

async function openPage(cdp, query) {
  await cdp.evaluate(`location.search = ${JSON.stringify(query)}`)
  await sleep(350)
  await cdp.waitFor('window.__pluginApplied === true && window.__pageReady === true')
  const errors = await cdp.evaluate('window.__errors')
  check(`page ready (${query})`, Array.isArray(errors) && errors.length === 0, errors && errors.join(' | '))
}

async function zoomOf(cdp) {
  return cdp.evaluate('Math.round(parseFloat(getComputedStyle(document.documentElement).zoom) * 100)')
}

async function main() {
  const chromePath = findChrome()
  const server = await startServer()
  const browser = await launchChrome(chromePath, `http://127.0.0.1:${server.port}/`)
  const cdp = browser.cdp
  try {
    await cdp.waitFor('window.__pluginApplied === true && window.__pageReady === true')

    // 1. Pointer coordinates: the caret computed from the event must agree with
    //    the caret the browser places from the same pointer position.
    await openPage(cdp, '?scale=125')
    const geometry = await cdp.evaluate(`(() => {
      const rect = document.getElementById('editable').getBoundingClientRect();
      return { left: rect.left, top: rect.top, charWidth: window.__measureChar(), zoom: parseFloat(getComputedStyle(document.documentElement).zoom) };
    })()`)
    const index = 50
    const layoutX = geometry.left + index * geometry.charWidth + geometry.charWidth / 2
    const layoutY = geometry.top + 12
    await cdp.click(layoutX * geometry.zoom, layoutY * geometry.zoom)
    const hit = await cdp.evaluate('window.__hit')
    const hitIndex = hit === null ? -1 : Math.round((hit.clientX - hit.rectLeft) / hit.charWidth)
    check('pointer caret', hit !== null && Math.abs(hit.caretOffset - index) <= 1, hit === null ? 'no pointer hit' : `offset=${hit.caretOffset} expected≈${index}`)
    check('event/rect coordinate space', Math.abs(hitIndex - index) <= 1, `event index=${hitIndex} expected≈${index}`)

    // 2. Drag selection over the pointer-normalized surface.
    const from = { x: (geometry.left + 10 * geometry.charWidth) * geometry.zoom, y: layoutY * geometry.zoom }
    const to = { x: (geometry.left + 30 * geometry.charWidth) * geometry.zoom, y: layoutY * geometry.zoom }
    await cdp.drag(from, to)
    const selected = await cdp.evaluate('String(getSelection())')
    const expectedSelection = await cdp.evaluate('window.__text.slice(10, 30)')
    check('drag selection', selected === expectedSelection, JSON.stringify(selected))

    // 3. Uniform 5% ladder.
    await openPage(cdp, '?scale=125')
    await cdp.pressCtrl('=', 'Equal', 187)
    const up1 = await zoomOf(cdp)
    await cdp.pressCtrl('=', 'Equal', 187)
    const up2 = await zoomOf(cdp)
    await cdp.pressCtrl('-', 'Minus', 189)
    const down1 = await zoomOf(cdp)
    check('5% ladder', up1 === 130 && up2 === 135 && down1 === 130, `${up1}/${up2}/${down1}`)

    // 4. Ctrl+wheel is coalesced: a burst of events must not produce one full
    //    application reflow (and one storage write) per event.
    await openPage(cdp, '?scale=125')
    await cdp.evaluate(`(() => {
      window.__writes = 0;
      const original = Storage.prototype.setItem;
      Storage.prototype.setItem = function (key, value) {
        if (key === 'dsh.ui.zoom_scale') window.__writes += 1;
        return original.call(this, key, value);
      };
    })()`)
    await Promise.all(Array.from({ length: 12 }, () => cdp.send('Input.dispatchMouseEvent', {
      type: 'mouseWheel', x: 300, y: 300, deltaX: 0, deltaY: -120, modifiers: 2, button: 'none'
    })))
    await sleep(500)
    const wheelZoom = await zoomOf(cdp)
    const writes = await cdp.evaluate('window.__writes')
    check('wheel coalescing', wheelZoom > 125 && wheelZoom < 185 && writes < 12, `zoom=${wheelZoom} writes=${writes}`)

    // 5. Host Config drives defaults, range, step and the compatibility rule.
    const config = JSON.stringify({ step: 10, minScale: 60, maxScale: 120, defaultScale: 80, compatOverlayHostHeight: false })
    await openPage(cdp, '?nosave=1&config=' + encodeURIComponent(config))
    const configStart = await zoomOf(cdp)
    await cdp.pressCtrl('=', 'Equal', 187)
    const configUp = await zoomOf(cdp)
    const compatOff = await cdp.evaluate(`document.querySelector('style[data-plugin-css="dsh-ui-zoom/styles"]').textContent.includes('[data-dsh-panel-host]')`)
    check('config defaults/step', configStart === 80 && configUp === 90, `${configStart} -> ${configUp}`)
    check('config compat toggle', compatOff === false, `rule present=${compatOff}`)

    // 6. Invalid config falls back to built-in defaults.
    await openPage(cdp, '?nosave=1&config=' + encodeURIComponent(JSON.stringify({ minScale: 300, maxScale: 10, step: 0 })))
    check('invalid config fallback', (await zoomOf(cdp)) === 100)

    // 7. Locale service: dictionary registration and live language switch.
    await openPage(cdp, '?scale=125&locale=1&lang=zh')
    await cdp.pressCtrl('=', 'Equal', 187)
    const zhToast = await cdp.evaluate(`document.getElementById('dsh-zoom-hud').textContent`)
    await cdp.evaluate(`window.__localeTest.setActive('en')`)
    await cdp.pressCtrl('=', 'Equal', 187)
    const enToast = await cdp.evaluate(`document.getElementById('dsh-zoom-hud').textContent`)
    check('locale registration', (await cdp.evaluate('window.__localeTest.registrations()')) === 1)
    check('locale switch', /^界面缩放/.test(zhToast) && /^UI Zoom/.test(enToast), `${zhToast} | ${enToast}`)

    // 8. Shortcut service: commands registered, raw listener stands down, and a
    //    rejected registration falls back to the raw listener.
    await openPage(cdp, '?scale=125&shortcuts=ok')
    const ids = await cdp.evaluate('window.__shortcutsTest.registrations.map(command => command.id)')
    const beforeRaw = await zoomOf(cdp)
    await cdp.pressCtrl('=', 'Equal', 187)
    const afterRaw = await zoomOf(cdp)
    await cdp.evaluate(`window.__shortcutsTest.run('dsh-ui-zoom.zoom-in')`)
    const afterService = await zoomOf(cdp)
    check('shortcut registration', Array.isArray(ids) && ids.length === 3, JSON.stringify(ids))
    check('shortcut owns keys', beforeRaw === afterRaw && afterService === afterRaw + 5, `${beforeRaw}/${afterRaw}/${afterService}`)

    await openPage(cdp, '?scale=125&shortcuts=throws')
    await cdp.pressCtrl('=', 'Equal', 187)
    check('shortcut fallback', (await zoomOf(cdp)) === 130)

    // 9. Top-layer dialogs: Chromium keeps viewport units unscaled under CSS
    //    zoom, so a modal dialog capped with `100vh` is laid out zoom-factor
    //    times taller than the window and its header — close button included —
    //    ends up above the top edge. The shim clamps only dialogs it measured as
    //    overflowing, so the close button stays hoverable and clickable.
    await openPage(cdp, '?scale=150')
    await cdp.evaluate('window.__openTallDialog()')
    await sleep(400)
    const zoomedDialog = await cdp.evaluate('window.__dialogState()')
    const clampedDialog = await cdp.evaluate(`(() => {
      const dialog = document.getElementById('tall-dialog');
      return {
        maxHeight: getComputedStyle(dialog).maxHeight,
        styleRules: document.querySelector('style[data-plugin-css="dsh-ui-zoom/styles"]').textContent.includes('data-dsh-ui-zoom-clamp'),
        factor: getComputedStyle(document.documentElement).getPropertyValue('--dsh-ui-zoom-factor').trim(),
      };
    })()`)
    check('dialog clamp under zoom',
      zoomedDialog.open && zoomedDialog.modal === true && zoomedDialog.clamped === true && zoomedDialog.fits === true && zoomedDialog.buttonVisible === true && zoomedDialog.buttonHit === 'tall-close',
      JSON.stringify({ clamped: zoomedDialog.clamped, fits: zoomedDialog.fits, buttonVisible: zoomedDialog.buttonVisible, hit: zoomedDialog.buttonHit, rect: zoomedDialog.rect, viewport: zoomedDialog.viewport }))
    // The clamp must be in place for the dialog's very first frame: otherwise
    // the dialog paints at its overflowing size and visibly jumps right after.
    await openPage(cdp, '?scale=150')
    const firstFrame = await cdp.evaluate('window.__openTallDialogFirstFrame()')
    check('dialog clamped before first paint', firstFrame.clamped === true && firstFrame.fits === true, JSON.stringify(firstFrame))
    check('dialog clamp wired', clampedDialog.styleRules === true && clampedDialog.factor === '1.5' && clampedDialog.maxHeight !== 'none', JSON.stringify(clampedDialog))

    await openPage(cdp, '?scale=100')
    await cdp.evaluate('window.__openTallDialog()')
    await sleep(300)
    const plainDialog = await cdp.evaluate('window.__dialogState()')
    const plainFactor = await cdp.evaluate(`document.documentElement.style.getPropertyValue('--dsh-ui-zoom-factor')`)
    check('dialog untouched at 100%',
      plainDialog.clamped === false && plainDialog.buttonHit === 'tall-close' && plainFactor === '',
      JSON.stringify({ clamped: plainDialog.clamped, hit: plainDialog.buttonHit, factor: plainFactor }))

    // The modal-presence flag drives the Windows titlebar drag-region lift; it
    // must appear while a modal is open and disappear again afterwards (a
    // document-wide :has() selector would do this in CSS, at a measured cost of
    // ~76% extra script time on a streaming list, hence the flag).
    const presenceOpen = await cdp.evaluate("document.documentElement.getAttribute('data-dsh-ui-zoom-modal')")
    await cdp.evaluate('window.__closeTallDialog()')
    await cdp.evaluate(`document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }))`)
    await sleep(120)
    const presenceClosed = await cdp.evaluate("document.documentElement.getAttribute('data-dsh-ui-zoom-modal')")
    check('modal presence flag', presenceOpen === '1' && presenceClosed === null, JSON.stringify({ open: presenceOpen, closed: presenceClosed }))

    // Control: with the shim switched off the same fixture really does overflow
    // the window and its close button falls outside it, so the checks above
    // prove the fix instead of a dialog that never overflows in the first place.
    await openPage(cdp, '?scale=150&config=' + encodeURIComponent(JSON.stringify({ compatDialogClamp: false })))
    await cdp.evaluate('window.__openTallDialog()')
    await sleep(400)
    const controlDialog = await cdp.evaluate('window.__dialogState()')
    check('dialog overflow without shim',
      controlDialog.clamped === false && controlDialog.open === true && controlDialog.fits === false && controlDialog.buttonVisible === false,
      JSON.stringify({ clamped: controlDialog.clamped, fits: controlDialog.fits, buttonVisible: controlDialog.buttonVisible, rect: controlDialog.rect, viewport: controlDialog.viewport }))

    // 10. Fixed overlays capped with viewport units (route panels, alerts): the
    //     shim caps only the ones that overflow, so their own scroller stays
    //     reachable instead of running past the bottom edge.
    const openOverlay = async (pageQuery) => {
      await openPage(cdp, pageQuery)
      await cdp.evaluate('window.__openVhOverlay()')
      // A gesture is what triggers the overlay pass in the real app.
      await cdp.evaluate(`document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }))`)
      await sleep(400)
      return cdp.evaluate('window.__vhOverlayState()')
    }
    const zoomedOverlay = await openOverlay('?scale=150')
    check('vh overlay clamped under zoom',
      zoomedOverlay.open === true && zoomedOverlay.clamped === true && zoomedOverlay.fits === true,
      JSON.stringify(zoomedOverlay))
    const plainOverlay = await openOverlay('?scale=100')
    check('vh overlay untouched at 100%',
      plainOverlay.clamped === false && plainOverlay.fits === true,
      JSON.stringify(plainOverlay))
    const controlOverlay = await openOverlay('?scale=150&config=' + encodeURIComponent(JSON.stringify({ compatOverflowClamp: false })))
    check('vh overlay overflows without shim',
      controlOverlay.clamped === false && controlOverlay.fits === false,
      JSON.stringify(controlOverlay))

    // 11. Teardown restores the native APIs, styles, zoom and the dialog marker.
    await openPage(cdp, '?scale=150')
    await cdp.evaluate('window.__openTallDialog()')
    await sleep(300)
    const teardown = await cdp.evaluate(`(() => {
      for (const cleanup of window.__pluginCleanups) cleanup();
      return {
        styleCount: document.querySelectorAll('style[data-plugin-css="dsh-ui-zoom/styles"]').length,
        mousePatched: Object.getOwnPropertyDescriptor(MouseEvent.prototype, 'clientX').get.toString().includes('toLayoutPixels'),
        zoom: document.documentElement.style.zoom,
        factor: document.documentElement.style.getPropertyValue('--dsh-ui-zoom-factor'),
        dialogClamped: document.getElementById('tall-dialog').hasAttribute('data-dsh-ui-zoom-clamp'),
        toast: document.getElementById('dsh-zoom-hud') === null,
      };
    })()`)
    check('teardown restores', teardown.styleCount === 0 && teardown.mousePatched === false && teardown.zoom === '' && teardown.factor === '' && teardown.dialogClamped === false && teardown.toast, JSON.stringify(teardown))

    const failed = results.filter(result => !result.ok)
    console.log(`\n${results.length - failed.length}/${results.length} checks passed`)
    if (failed.length > 0) process.exitCode = 1
  } finally {
    browser.close()
    await server.close()
  }
}

main().catch(error => {
  console.error(error && error.stack || error)
  process.exitCode = 1
})
