/** Recipe photos are portrait 4:5, the shape every card, hero and circle crops from. */
export const PHOTO_W = 640
export const PHOTO_H = 800

/**
 * The centred source rectangle that fills a `outW` x `outH` frame without
 * stretching, the same crop CSS `object-fit: cover` makes.
 */
export function coverCrop(srcW: number, srcH: number, outW = PHOTO_W, outH = PHOTO_H) {
  const scale = Math.max(outW / srcW, outH / srcH)
  const w = outW / scale
  const h = outH / scale
  return { x: (srcW - w) / 2, y: (srcH - h) / 2, w, h }
}
