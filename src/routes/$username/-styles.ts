import type {
  NameEffect,
  CustomCursor,
  LayoutSettings,
  AnimatedProfileSettings,
  CustomBackground,
} from '@/server/db/schema'
import { getCursorPackById, isOverlayCursor } from '@/lib/cursor-packs'

// ── Name Effect Style ──
export function getNameStyle(nameEffect: NameEffect | null): React.CSSProperties {
  if (!nameEffect || nameEffect.style === 'none') return {}
  const colors = nameEffect.gradientColors || ['#8b5cf6', '#06b6d4']
  const spacing = nameEffect.letterSpacing ?? 0
  const transform = nameEffect.textTransform ?? 'none'
  const base: React.CSSProperties = {
    letterSpacing: spacing > 0 ? `${spacing}px` : undefined,
    textTransform: transform !== 'none' ? transform : undefined,
  }
  switch (nameEffect.style) {
    case 'gradient':
      return {
        ...base,
        background: `linear-gradient(135deg, ${colors.join(', ')})`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      }
    case 'rainbow':
      return {
        ...base,
        background: 'linear-gradient(90deg, #ff0000, #ff8800, #ffff00, #00ff00, #0088ff, #8b5cf6, #ff0000)',
        backgroundSize: '200% 100%',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        animation: 'rainbow-shift 3s linear infinite',
      }
    case 'glow': {
      const glowColor = nameEffect.glowColor || '#8b5cf6'
      const intensity = nameEffect.glowIntensity === 'strong' ? 24 : nameEffect.glowIntensity === 'subtle' ? 6 : 14
      return {
        ...base,
        textShadow: `0 0 ${intensity}px ${glowColor}, 0 0 ${intensity * 2}px ${glowColor}40`,
      }
    }
    case 'neon': {
      const neonColor = nameEffect.glowColor || '#00ff88'
      const nIntensity = nameEffect.glowIntensity === 'strong' ? 24 : nameEffect.glowIntensity === 'subtle' ? 6 : 14
      return {
        ...base,
        color: neonColor,
        textShadow: `0 0 ${nIntensity}px ${neonColor}, 0 0 ${nIntensity * 2}px ${neonColor}60, 0 0 ${nIntensity * 3}px ${neonColor}30`,
        animation: nameEffect.neonFlicker ? 'neon-flicker 1.5s infinite alternate' : undefined,
      }
    }
    case 'glitch':
      return { ...base, color: 'white', textShadow: '2px 0 #ff0040, -2px 0 #00ff9f' }
    default:
      return base
  }
}

// ── Name Animation Props ──
export function getNameAnimation(animation: string | undefined): {
  animate?: Record<string, unknown>
  initial?: Record<string, unknown>
  transition?: Record<string, unknown>
} {
  switch (animation) {
    case 'bounce-in':
      return { animate: { y: [-20, 0], opacity: [0, 1] }, transition: { duration: 0.8, repeat: Infinity, repeatType: 'loop', ease: 'easeOut' } }
    case 'wave':
      return { animate: { y: [0, -4, 0] }, transition: { duration: 2.5, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' } }
    case 'flicker':
      return { animate: { opacity: [1, 0.4, 1, 0.7, 1] }, transition: { duration: 0.8, repeat: Infinity, ease: 'easeInOut' } }
    case 'pulse':
      return { animate: { scale: [1, 1.03, 1] }, transition: { duration: 2.5, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' } }
    case 'float':
      return { animate: { y: [0, -3, 0] }, transition: { duration: 2.5, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' } }
    default:
      return {}
  }
}

// ── Cursor Style ──
export function getCursorStyle(customCursor: CustomCursor | null): React.CSSProperties {
  if (!customCursor?.enabled) return {}
  if (customCursor.type === 'pack' && customCursor.packId) {
    const pack = getCursorPackById(customCursor.packId)
    if (!pack) return {}
    // Overlay packs (no .cur) → hide native cursor, React div overlay renders the image
    if (isOverlayCursor(pack)) return { cursor: 'none' }
    if (pack.cursorUrl) return { cursor: `url("${pack.cursorUrl}") 0 0, auto` }
    return {}
  }
  if (customCursor.type === 'browser' && customCursor.browserPreset) {
    return { cursor: customCursor.browserPreset }
  }
  if (customCursor.type === 'custom' && customCursor.customUrl) {
    const url = customCursor.customUrl.toLowerCase()
    // Image files → overlay renders them, hide native cursor
    if (url.endsWith('.png') || url.endsWith('.gif') || url.endsWith('.webp') || url.endsWith('.jpg') || url.endsWith('.jpeg') || url.endsWith('.svg')) {
      return { cursor: 'none' }
    }
    return { cursor: `url("${customCursor.customUrl}") 0 0, auto` }
  }
  return {}
}

// ── Background Style ──
export function getBackgroundStyle(bg: CustomBackground | null): React.CSSProperties {
  const fallback = { background: 'linear-gradient(180deg, #0a0a0f 0%, #12121a 100%)' }
  if (!bg) return fallback
  if (bg.type === 'solid' || bg.type === 'gradient') {
    return { background: bg.value || fallback.background }
  }
  if (bg.type === 'image') {
    return {
      background: `url(${bg.imageUrl}) center/cover fixed`,
      ...(bg.imageBlur ? { filter: `blur(${bg.imageBlur}px)` } : {}),
    }
  }
  return fallback
}

// ── Card Shadow ──
export function getCardShadowStyle(layoutSettings: LayoutSettings | null, glowColor?: string) {
  const shadow = layoutSettings?.cardShadow ?? 'md'
  const glow = glowColor || 'rgba(139,92,246,0.3)'
  switch (shadow) {
    case 'none': return 'none'
    case 'sm': return '0 4px 12px rgba(0,0,0,0.2)'
    case 'lg': return '0 30px 80px -20px rgba(0,0,0,0.5)'
    case 'xl': return '0 40px 100px -20px rgba(0,0,0,0.6), 0 0 40px rgba(0,0,0,0.3)'
    case 'glow': return `0 20px 60px -15px rgba(0,0,0,0.4), 0 0 40px ${glow}`
    case 'md':
    default: return '0 20px 60px -15px rgba(0,0,0,0.4)'
  }
}

// ── Link Style Props (matches LINK_STYLE_CSS from layout tab LivePreview) ──
export function getLinkStyleProps(style: string, link: { backgroundColor?: string | null; textColor?: string | null }, borderRadius: number) {
  const base: React.CSSProperties = {
    background: link.backgroundColor
      ? `linear-gradient(135deg, ${link.backgroundColor}20, ${link.backgroundColor}10)`
      : 'rgba(255,255,255,0.12)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius,
  }
  switch (style) {
    case 'minimal':
      return { ...base, background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', boxShadow: 'none' } as React.CSSProperties
    case 'bold':
      return { ...base, background: link.backgroundColor ? `${link.backgroundColor}40` : 'rgba(255,255,255,0.2)', border: '2px solid rgba(255,255,255,0.2)', fontWeight: 700 } as React.CSSProperties
    case 'glass':
      return { ...base, background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.15)' } as React.CSSProperties
    case 'outline':
      return { ...base, background: 'transparent', border: '2px solid rgba(255,255,255,0.25)' } as React.CSSProperties
    case 'gradient':
      return { ...base, background: link.backgroundColor ? `linear-gradient(to right, ${link.backgroundColor}33, ${link.backgroundColor}1a)` : 'linear-gradient(to right, rgba(139,92,246,0.2), rgba(236,72,153,0.2))', border: '1px solid rgba(255,255,255,0.1)' } as React.CSSProperties
    case 'neon':
      return { ...base, background: 'transparent', border: '1px solid rgba(139,92,246,0.5)', boxShadow: '0 0 12px rgba(139,92,246,0.3)' } as React.CSSProperties
    default:
      return base
  }
}

// ── Avatar Animation ──
export function getAvatarAnimation(animatedProfile: AnimatedProfileSettings | null) {
  if (!animatedProfile?.enabled) return {}
  const glowColor = animatedProfile.glowColor ?? '#8b5cf6'
  const anims: Record<string, object> = {
    pulse: { animate: { scale: [1, 1.05, 1] }, transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' } },
    glow: { animate: { boxShadow: [`0 0 16px ${glowColor}, 0 0 32px ${glowColor}40`, `0 0 24px ${glowColor}, 0 0 48px ${glowColor}60`, `0 0 16px ${glowColor}, 0 0 32px ${glowColor}40`] }, transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' } },
    bounce: { animate: { y: [0, -6, 0] }, transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' } },
    rotate: { animate: { rotate: [0, 360] }, transition: { duration: 4, repeat: Infinity, ease: 'linear' } },
    shake: { animate: { x: [-2, 2, -2, 0] }, transition: { duration: 0.5, repeat: Infinity, repeatDelay: 2 } },
    float: { animate: { y: [0, -4, 0] }, transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' } },
  }
  return anims[animatedProfile.avatarAnimation || ''] || {}
}

// ── Banner Animation ──
export function getBannerAnimation(animatedProfile: AnimatedProfileSettings | null) {
  if (!animatedProfile?.enabled) return {}
  const anims: Record<string, object> = {
    parallax: { style: { transform: 'translateZ(-1px) scale(1.1)' } },
    'gradient-shift': { animate: { backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }, transition: { duration: 8, repeat: Infinity, ease: 'linear' }, style: { backgroundSize: '200% 200%' } },
    particles: {}, // particles are rendered as separate elements in the bio page
    wave: { animate: { y: [0, -3, 0, 3, 0] }, transition: { duration: 6, repeat: Infinity, ease: 'easeInOut' } },
    aurora: { animate: { opacity: [0.7, 1, 0.7], scale: [1, 1.02, 1] }, transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' } },
  }
  return anims[animatedProfile.bannerAnimation || ''] || {}
}

// ── Link Hover Animation ──
export function getLinkHoverAnimation(isHovered: boolean, animatedProfile: AnimatedProfileSettings | null) {
  const effect = animatedProfile?.enabled ? animatedProfile.linkHoverEffect : 'scale'
  if (!isHovered) return { scale: 1, y: 0, x: 0, rotateX: 0, rotateY: 0 }
  switch (effect) {
    case 'none': return { scale: 1, y: 0, x: 0 }
    case 'glow': return { scale: 1.01, y: -1 }
    case 'slide': return { scale: 1, x: 6, y: 0 }
    case 'shake': return { scale: 1, x: [0, -2, 2, -2, 0], y: 0 }
    case 'flip': return { scale: 1, rotateX: 5, y: -2 }
    case 'tilt': return { scale: 1.01, rotateY: 3, y: -1 }
    case 'lift': return { scale: 1.03, y: -6 }
    case 'scale':
    default: return { scale: 1.02, y: -2 }
  }
}

// ── Link Glow Shadow ──
export function getLinkGlowShadow(isHovered: boolean, link: { backgroundColor?: string | null }, animatedProfile: AnimatedProfileSettings | null) {
  if (!isHovered || animatedProfile?.linkHoverEffect !== 'glow') return undefined
  const color = animatedProfile?.glowColor || link.backgroundColor || 'rgba(139,92,246,0.4)'
  return `0 0 16px ${color}40, 0 0 32px ${color}20`
}

// ── Link Shadow (matches SHADOW_CSS from layout tab) ──
export function getLinkShadowCSS(shadow: string): string | undefined {
  switch (shadow) {
    case 'none': return 'none'
    case 'sm': return '0 1px 2px rgba(0,0,0,0.15)'
    case 'md': return '0 4px 6px -1px rgba(0,0,0,0.2), 0 2px 4px -2px rgba(0,0,0,0.15)'
    case 'lg': return '0 10px 15px -3px rgba(0,0,0,0.25), 0 4px 6px -4px rgba(0,0,0,0.15)'
    case 'xl': return '0 20px 25px -5px rgba(0,0,0,0.3), 0 8px 10px -6px rgba(0,0,0,0.2)'
    case 'glow': return '0 10px 15px -3px rgba(0,0,0,0.25), 0 0 15px rgba(139,92,246,0.2)'
    default: return undefined
  }
}

// ── Link Layout Transform (matches LivePreview cardLayout effects) ──
export function getLinkLayoutTransform(
  cardLayout: string,
  index: number,
  tiltDegree: number,
): React.CSSProperties | undefined {
  switch (cardLayout) {
    case 'tilt':
      return {
        transform: `rotateY(${index % 2 === 0 ? tiltDegree * 0.4 : -tiltDegree * 0.4}deg)`,
      }
    case 'stack':
      return {
        position: 'relative' as const,
        zIndex: 10 - index,
        transform: `translateX(${index * 4}px)`,
        opacity: 1 - index * 0.1,
        marginTop: index > 0 ? -8 : 0,
      }
    default:
      return undefined
  }
}

// ── Minimal Link Style Override (no bg, just divider) ──
export function getMinimalLinkStyle(
  index: number,
  totalLinks: number,
  padding: number,
): React.CSSProperties {
  return {
    background: 'transparent',
    border: 'none',
    borderBottom: index < totalLinks - 1 ? '1px solid rgba(255,255,255,0.06)' : undefined,
    borderRadius: 0,
    padding: `${Math.max(padding * 0.6, 8)}px 4px`,
  }
}

// ── CSS Keyframes ──
export const CSS_KEYFRAMES = `
@keyframes rainbow-shift { 0% { background-position: 0% 50%; } 100% { background-position: 200% 50%; } }
@keyframes glitch { 0% { transform: translate(0); } 20% { transform: translate(-2px, 2px); } 40% { transform: translate(-2px, -2px); } 60% { transform: translate(2px, 2px); } 80% { transform: translate(2px, -2px); } 100% { transform: translate(0); } }
@keyframes typewriter-blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
@keyframes sparkle-float { 0% { transform: translateY(0) rotate(0deg); opacity: 1; } 100% { transform: translateY(-100vh) rotate(720deg); opacity: 0; } }
@keyframes snow-fall { 0% { transform: translateY(-10vh) translateX(0); opacity: 1; } 100% { transform: translateY(110vh) translateX(20px); opacity: 0.3; } }
@keyframes rain-fall { 0% { transform: translateY(-10vh); opacity: 0.7; } 100% { transform: translateY(110vh); opacity: 0; } }
@keyframes firefly-float { 0%, 100% { transform: translate(0, 0); opacity: 0.3; } 25% { transform: translate(30px, -20px); opacity: 1; } 50% { transform: translate(-20px, -40px); opacity: 0.6; } 75% { transform: translate(10px, 20px); opacity: 0.9; } }
@keyframes bubble-rise { 0% { transform: translateY(100vh) scale(0.5); opacity: 0.6; } 100% { transform: translateY(-10vh) scale(1.2); opacity: 0; } }
@keyframes name-typing { 0% { max-width: 0; } 50% { max-width: 100%; } 85% { max-width: 100%; } 100% { max-width: 0; } }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
@keyframes neon-flicker { 0%, 19%, 21%, 23%, 25%, 54%, 56%, 100% { opacity: 1; } 20%, 24%, 55% { opacity: 0.4; } }
`
