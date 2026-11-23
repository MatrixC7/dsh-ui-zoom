/**
 * Host half of the UI zoom plugin bundle.
 *
 * The client half owns the zoom level, persistence, settings row and the
 * coordinate engine. This half only publishes deployment-level defaults to the
 * page (the client reads them from `__DSH_UI_ZOOM_CONFIG__`), so the tunables
 * live in the profile's `cordis.patch.yml` config and survive upgrades.
 */
import z from '@deepseek-ai/schemastery'

/**
 * Deployment settings shared with the browser half.
 * - `defaultScale`: zoom used when nothing is stored yet, in percent.
 * - `minScale` / `maxScale`: lowest and highest selectable zoom, in percent.
 * - `step`: ladder step for the stepper buttons and Ctrl+wheel, in percent.
 * - `compatOverlayHostHeight`: rewrite `100vh` overlay hosts to `height:100%`
 *   (dsh-better-sidebar compatibility).
 */
export const Config = z.object({
  defaultScale: z.natural().min(50).max(250).default(100),
  minScale: z.natural().min(50).max(250).default(50),
  maxScale: z.natural().min(50).max(250).default(250),
  step: z.natural().min(5).max(50).default(5),
  compatOverlayHostHeight: z.boolean().default(true),
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
    table.push({ kind: 'global', name: '__DSH_UI_ZOOM_CONFIG__', value: config })
  })
}
