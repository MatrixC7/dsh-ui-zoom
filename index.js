/**
 * Host half of the UI zoom plugin bundle.
 *
 * The client half owns the zoom level, persistence, settings row and the
 * coordinate engine. This half only publishes deployment-level defaults to the
 * page (the client reads them from `__DSH_UI_ZOOM_CONFIG__`), so the tunables
 * live in the profile's `cordis.patch.yml` config and survive upgrades.
 */
import { createRequire } from 'node:module'
import z from '@deepseek-ai/schemastery'

/** The bundle's own version, published so the client's diagnostics report names it. */
const { version: PLUGIN_VERSION } = createRequire(import.meta.url)('./package.json')

/**
 * Deployment settings shared with the browser half.
 * - `defaultScale`: zoom used when nothing is stored yet, in percent.
 * - `minScale` / `maxScale`: lowest and highest selectable zoom, in percent.
 * - `step`: ladder step for the stepper buttons and Ctrl+wheel, in percent.
 * - `compatOverlayHostHeight`: rewrite `100vh` overlay hosts to `height:100%`
 *   (dsh-better-sidebar compatibility).
 * - `compatDialogClamp`: keep modal `<dialog>` elements that overflow the
 *   window inside it under zoom (third-party dialogs sized with `100vh`).
 * - `compatOverflowClamp`: do the same for fixed-position overlays sized with
 *   viewport units (route panels, alerts and guides that would otherwise run
 *   past the window and clip their own scroll container).
 * - `diagnostics`: start with the console diagnostics ring buffer and the
 *   "copy diagnostics report" button switched on. It can also be toggled live in
 *   Settings → General → UI Zoom without restarting (localStorage override).
 */
export const Config = z.object({
  defaultScale: z.natural().min(50).max(250).default(100),
  minScale: z.natural().min(50).max(250).default(50),
  maxScale: z.natural().min(50).max(250).default(250),
  step: z.natural().min(5).max(50).default(5),
  compatOverlayHostHeight: z.boolean().default(true),
  compatDialogClamp: z.boolean().default(true),
  compatOverflowClamp: z.boolean().default(true),
  diagnostics: z.boolean().default(false),
})

/** The page injection needs the web server. */
export const inject = ['webServer']

/**
 * Publish the validated config as a page global, which the client half reads
 * before installing its coordinate engine.
 * @param ctx - host context.
 * @param config - validated deployment config.
 */
export function apply(ctx, config) {
  ctx.on('webserver/index-inject', (table) => {
    // The client half reports this in its diagnostics snapshot, so a report
    // always says which build produced it.
    table.push({ kind: 'global', name: '__DSH_UI_ZOOM_CONFIG__', value: { ...config, version: PLUGIN_VERSION } })
  })
}
