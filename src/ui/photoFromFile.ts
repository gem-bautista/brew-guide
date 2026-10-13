import { coverCrop, PHOTO_H, PHOTO_W } from '../domain/photo'

/**
 * Turns a picked image into the small JPEG a personal recipe stores. Photos
 * live in localStorage with the recipes, which holds only a few megabytes, so
 * a phone's 4 MB original is cropped to 4:5 and shrunk to about 60 KB.
 */
export async function photoFromFile(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file)
  try {
    const { x, y, w, h } = coverCrop(bitmap.width, bitmap.height)
    const canvas = document.createElement('canvas')
    canvas.width = PHOTO_W
    canvas.height = PHOTO_H
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('This browser cannot resize photos.')
    ctx.drawImage(bitmap, x, y, w, h, 0, 0, PHOTO_W, PHOTO_H)
    return canvas.toDataURL('image/jpeg', 0.78)
  } finally {
    bitmap.close()
  }
}
