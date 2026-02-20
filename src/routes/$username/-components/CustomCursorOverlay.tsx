import { useEffect, useRef } from 'react'
import type { CustomCursor } from '@/server/db/schema'
import { getCursorPackById, isOverlayCursor } from '@/lib/cursor-packs'

/**
 * Renders a custom cursor as a <div> with an <img> that follows the mouse.
 * Used for:
 *  1. Pack cursors that have no .cur file (animated-only packs with .png image)
 *  2. Custom uploaded cursors (.png, .gif, etc.)
 *
 * For .cur packs and browser presets, the normal CSS `cursor: url()` is used
 * instead (handled by getCursorStyle in -styles.ts).
 */
export function CustomCursorOverlay({ cursor }: { cursor: CustomCursor | null }) {
  const ref = useRef<HTMLDivElement>(null)

  // Determine if we need the overlay
  const overlayUrl = getOverlayImageUrl(cursor)

  useEffect(() => {
    if (!overlayUrl || !ref.current) return

    const el = ref.current
    const move = (e: MouseEvent) => {
      el.style.left = `${e.clientX}px`
      el.style.top = `${e.clientY}px`
    }

    window.addEventListener('mousemove', move)
    return () => window.removeEventListener('mousemove', move)
  }, [overlayUrl])

  if (!overlayUrl) return null

  return (
    <div
      ref={ref}
      className="fixed z-9999 pointer-events-none"
      style={{ transform: 'translate(-4px, -2px)' }}
    >
      <img
        src={overlayUrl}
        alt=""
        className="w-8 h-8 object-contain select-none"
        draggable={false}
      />
    </div>
  )
}

/**
 * Returns the image URL to use for the div-overlay cursor, or null if
 * this cursor config should use normal CSS cursor instead.
 */
function getOverlayImageUrl(cursor: CustomCursor | null): string | null {
  if (!cursor?.enabled) return null

  // Pack cursor with no .cur → use imageUrl overlay
  if (cursor.type === 'pack' && cursor.packId) {
    const pack = getCursorPackById(cursor.packId)
    if (pack && isOverlayCursor(pack)) return pack.imageUrl
    return null // has .cur → CSS handles it
  }

  // Custom uploaded image cursors (.png, .gif, .webp, .jpg) → use overlay
  // .cur files are handled by CSS cursor:url()
  if (cursor.type === 'custom' && cursor.customUrl) {
    const url = cursor.customUrl.toLowerCase()
    if (url.endsWith('.png') || url.endsWith('.gif') || url.endsWith('.webp') || url.endsWith('.jpg') || url.endsWith('.jpeg') || url.endsWith('.svg')) {
      return cursor.customUrl
    }
    return null // .cur → CSS handles it
  }

  return null
}

/** Returns true if this cursor config needs the overlay (and CSS cursor:none). */
export function needsCursorOverlay(cursor: CustomCursor | null): boolean {
  return getOverlayImageUrl(cursor) !== null
}
