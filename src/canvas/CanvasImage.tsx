import type { ImgHTMLAttributes } from "react";

/**
 * Every image on the canvas, always eager.
 *
 * The stage is one composited surface — no scrollport, positioned entirely by a
 * transform on a `will-change: transform` ancestor — and the browser never
 * re-evaluates `loading="lazy"` images inside it. They stay pending forever, so
 * the card thumbnails and badges simply never appear (a data-URI image does it
 * too, which is what rules out any asset-path or bundling cause).
 *
 * Lazy-loading buys nothing here anyway: the canvas shows the whole board at
 * once, so there is no "below the fold" to defer. Use this instead of a bare
 * <img> anywhere under .stage — `loading` is pinned after the spread so a stray
 * `loading="lazy"` on a call site can't reintroduce the bug.
 */
export function CanvasImage(props: ImgHTMLAttributes<HTMLImageElement>) {
  return <img draggable={false} decoding="async" {...props} loading="eager" />;
}
