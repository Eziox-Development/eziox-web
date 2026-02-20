import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'motion/react'
import {
  LayoutGrid,
  Columns3,
  Layers,
  Square,
  Link2,
  Maximize2,
  SlidersHorizontal,
  Check,
} from 'lucide-react'
import { useLayoutState } from '../-use-playground'
import { SaveButton, Slider } from '../-components'
import type { LayoutSettings } from '../-types'

const CARD_LAYOUTS = [
  { id: 'default', icon: LayoutGrid, color: 'from-violet-500 to-purple-600' },
  { id: 'tilt', icon: Layers, color: 'from-pink-500 to-rose-600' },
  { id: 'stack', icon: Columns3, color: 'from-blue-500 to-cyan-500' },
  { id: 'grid', icon: LayoutGrid, color: 'from-emerald-500 to-teal-500' },
  { id: 'minimal', icon: Square, color: 'from-amber-500 to-orange-500' },
] as const

const PROFILE_LAYOUTS = [
  'default',
  'compact',
  'expanded',
  'centered',
  'minimal',
  'hero',
] as const
const LINK_STYLES = [
  'default',
  'minimal',
  'bold',
  'glass',
  'outline',
  'gradient',
  'neon',
] as const
const SHADOWS = ['none', 'sm', 'md', 'lg', 'xl', 'glow'] as const

const SHADOW_CSS: Record<string, string> = {
  none: 'shadow-none',
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
  glow: 'shadow-lg shadow-violet-500/20',
}

const LINK_STYLE_CSS: Record<string, string> = {
  default: 'bg-white/12 border border-white/10',
  minimal: 'bg-transparent border border-white/8',
  bold: 'bg-white/20 border-2 border-white/20 font-bold',
  glass: 'bg-white/8 backdrop-blur-md border border-white/15',
  outline: 'bg-transparent border-2 border-white/25',
  gradient:
    'bg-linear-to-r from-violet-500/20 to-pink-500/20 border border-white/10',
  neon: 'bg-transparent border border-violet-400/50 shadow-[0_0_12px_rgba(139,92,246,0.3)]',
}

// ── Live Preview ──
function LivePreview({ layout }: { layout: LayoutSettings }) {
  const { t } = useTranslation()
  const shadow = SHADOW_CSS[layout.cardShadow] ?? 'shadow-md'
  const linkCls = LINK_STYLE_CSS[layout.linkStyle] ?? LINK_STYLE_CSS.default
  const radius = layout.cardBorderRadius
  const spacing = layout.cardSpacing
  const padding = layout.cardPadding
  const pl = layout.profileLayout
  const cl = layout.cardLayout

  // Profile layout config
  const isCompact = pl === 'compact'
  const isExpanded = pl === 'expanded'
  const isMinimalProfile = pl === 'minimal'
  const isHero = pl === 'hero'
  const isCenteredProfile = pl === 'centered' || pl === 'default'

  const avatarSize = isExpanded || isHero ? 'w-16 h-16' : isCompact || isMinimalProfile ? 'w-10 h-10' : 'w-14 h-14'
  const showBanner = isHero || isExpanded
  const textAlign = isCompact || isHero ? 'text-left' : 'text-center'
  const flexDir = isCompact ? 'flex-row items-center gap-3' : isHero ? 'flex-row items-end gap-3' : 'flex-col items-center'

  // Card layout config
  const isGrid = cl === 'grid'
  const isTilt = cl === 'tilt'
  const isStack = cl === 'stack'
  const isMinimalCard = cl === 'minimal'

  return (
    <div className="sticky top-6 rounded-2xl overflow-hidden border border-white/6 shadow-2xl shadow-black/50 bg-[#0d0d0d]">
      <div className="flex items-center gap-2 px-4 py-3 bg-white/3 border-b border-white/5">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
        </div>
        <div className="flex-1 mx-8 h-5 rounded-md bg-white/4 flex items-center justify-center">
          <span className="text-[9px] text-white/25 font-mono tracking-wider">
            eziox.link/@username
          </span>
        </div>
      </div>
      <div className="relative h-[480px] overflow-y-auto bg-[#0a0a0a]">
        <div
          className="flex flex-col items-center"
          style={{
            maxWidth: Math.min(layout.maxWidth ?? 640, 300),
            margin: '0 auto',
          }}
        >
          {/* Banner (hero/expanded only) */}
          {showBanner && (
            <div className="w-full h-20 bg-linear-to-br from-violet-600/40 to-cyan-500/30 relative mb-0">
              <div className="absolute inset-0 bg-linear-to-t from-[#0a0a0a] to-transparent" />
            </div>
          )}

          {/* Avatar area */}
          <div
            className={`flex ${flexDir} w-full ${isMinimalProfile ? 'mb-3' : 'mb-5'}`}
            style={{
              padding: `${showBanner ? 0 : 20}px 20px 0`,
              marginTop: showBanner ? -20 : 0,
            }}
          >
            <div className={`${avatarSize} rounded-full bg-white/15 backdrop-blur-md border-2 border-white/25 flex items-center justify-center shrink-0 ${showBanner ? 'ring-2 ring-[#0a0a0a]' : ''}`}>
              <span className={isCompact || isMinimalProfile ? 'text-sm' : 'text-xl'}>👤</span>
            </div>
            <div className={`${textAlign} ${isCompact || isHero ? '' : 'mt-2'}`}>
              <div className={`h-3 ${isExpanded ? 'w-24' : 'w-20'} rounded-full bg-white/30 ${isCenteredProfile ? 'mx-auto' : ''}`} />
              <div className={`h-2 ${isExpanded ? 'w-16' : 'w-14'} rounded-full bg-white/15 ${isCenteredProfile ? 'mx-auto' : ''} mt-1.5`} />
              {(isExpanded || isHero) && (
                <div className={`h-1.5 w-28 rounded-full bg-white/8 ${isCenteredProfile ? 'mx-auto' : ''} mt-2`} />
              )}
            </div>
          </div>

          {/* Links */}
          <div className="w-full px-5 pb-5">
            {isMinimalCard ? (
              /* Minimal: no card bg, just text with dividers */
              <div className="flex flex-col" style={{ gap: 0 }}>
                {[1, 2, 3, 4].map((i) => (
                  <motion.div
                    key={i}
                    className="flex items-center gap-2 transition-all"
                    style={{
                      padding: `${Math.max(padding * 0.6, 8)}px 4px`,
                      borderBottom: i < 4 ? '1px solid rgba(255,255,255,0.06)' : undefined,
                    }}
                    whileHover={{ x: 4, opacity: 1 }}
                  >
                    <div className="w-3.5 h-3.5 rounded bg-white/15 shrink-0" />
                    <div className="h-2 rounded-full bg-white/20 flex-1" />
                    <div className="w-2 h-2 rounded-full bg-white/10" />
                  </motion.div>
                ))}
              </div>
            ) : isStack ? (
              /* Stack: overlapping cards with offset */
              <div className="relative" style={{ height: 4 * 36 + 40 }}>
                {[1, 2, 3, 4].map((i) => (
                  <motion.div
                    key={i}
                    className={`${linkCls} ${shadow} flex items-center gap-2 absolute left-0 right-0 transition-all`}
                    style={{
                      borderRadius: `${radius}px`,
                      padding: `${Math.max(padding * 0.5, 6)}px ${Math.max(padding * 0.7, 8)}px`,
                      top: (i - 1) * 36,
                      zIndex: 5 - i,
                      transform: `translateX(${(i - 1) * 4}px)`,
                      opacity: 1 - (i - 1) * 0.12,
                    }}
                    whileHover={{ y: -2, scale: 1.01 }}
                  >
                    <div className="w-4 h-4 rounded bg-white/20 shrink-0" />
                    <div className="h-2 rounded-full bg-white/25 flex-1" />
                  </motion.div>
                ))}
              </div>
            ) : (
              /* Default / Tilt / Grid */
              <div
                className={`w-full ${isGrid ? 'grid grid-cols-2' : 'flex flex-col'}`}
                style={{
                  gap: `${spacing}px`,
                  perspective: isTilt ? '400px' : undefined,
                }}
              >
                {[1, 2, 3, 4].map((i) => (
                  <motion.div
                    key={i}
                    className={`${linkCls} ${shadow} flex items-center gap-2 transition-all`}
                    style={{
                      borderRadius: `${radius}px`,
                      padding: `${Math.max(padding * 0.5, 6)}px ${Math.max(padding * 0.7, 8)}px`,
                      transform: isTilt
                        ? `rotateY(${i % 2 === 0 ? (layout.cardTiltDegree ?? 5) * 0.4 : -(layout.cardTiltDegree ?? 5) * 0.4}deg)`
                        : undefined,
                    }}
                    whileHover={{ scale: 1.02, rotateY: 0 }}
                  >
                    <div className="w-4 h-4 rounded bg-white/20 shrink-0" />
                    <div className="h-2 rounded-full bg-white/25 flex-1" />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between px-4 py-2.5 bg-white/2 border-t border-white/5">
        <span className="text-[10px] text-white/25 font-mono">
          {t('playground.layout.cardLayout')}
        </span>
        <span className="text-[10px] text-white/25">
          {t('playground.bg.livePreviewHint')}
        </span>
      </div>
    </div>
  )
}

export function LayoutTab() {
  const { t } = useTranslation()
  const { localLayout, setLocalLayout, isDirty, resetLayout, mutation } =
    useLayoutState()
  const set = (patch: Partial<LayoutSettings>) =>
    setLocalLayout({ ...localLayout, ...patch })

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-8 items-start">
      <div className="space-y-6">
        {/* ── Card Layout ── */}
        <div className="rounded-2xl border border-white/6 bg-white/2 p-5 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <LayoutGrid size={14} className="text-white/40" />
            <span className="text-xs font-semibold text-white/40 uppercase tracking-widest">
              {t('playground.layout.cardLayout')}
            </span>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {CARD_LAYOUTS.map((cl) => {
              const active = localLayout.cardLayout === cl.id
              return (
                <button
                  key={cl.id}
                  onClick={() => set({ cardLayout: cl.id })}
                  className={`relative flex flex-col items-center gap-2 py-3.5 px-2 rounded-xl transition-all duration-200 group ${active ? 'bg-white/8' : 'hover:bg-white/4'}`}
                >
                  {active && (
                    <motion.div
                      layoutId="card-layout-glow"
                      className={`absolute inset-0 rounded-xl bg-linear-to-br ${cl.color} opacity-[0.12]`}
                      transition={{
                        type: 'spring',
                        stiffness: 400,
                        damping: 30,
                      }}
                    />
                  )}
                  <div
                    className={`relative w-9 h-9 rounded-xl flex items-center justify-center transition-all ${active ? `bg-linear-to-br ${cl.color} shadow-lg` : 'bg-white/6 group-hover:bg-white/10'}`}
                  >
                    <cl.icon size={16} className="text-white" />
                  </div>
                  <span
                    className={`relative text-[10px] font-semibold ${active ? 'text-white' : 'text-white/35'}`}
                  >
                    {t(`playground.layout.card_${cl.id}`)}
                  </span>
                  {active && (
                    <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-white/15 flex items-center justify-center">
                      <Check size={8} className="text-white" />
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Profile Layout ── */}
        <div className="rounded-2xl border border-white/6 bg-white/2 p-5 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <Maximize2 size={14} className="text-white/40" />
            <span className="text-xs font-semibold text-white/40 uppercase tracking-widest">
              {t('playground.layout.profileLayout')}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {PROFILE_LAYOUTS.map((pl) => {
              const active = localLayout.profileLayout === pl
              return (
                <button
                  key={pl}
                  onClick={() => set({ profileLayout: pl })}
                  className={`relative py-2.5 px-3 rounded-xl text-xs font-medium transition-all ${active ? 'bg-white/10 text-white ring-1 ring-white/20' : 'bg-white/3 text-white/40 hover:bg-white/6 hover:text-white/60'}`}
                >
                  {active && (
                    <motion.div
                      layoutId="profile-layout-active"
                      className="absolute inset-0 rounded-xl bg-violet-500/10 ring-1 ring-violet-500/30"
                      transition={{
                        type: 'spring',
                        stiffness: 400,
                        damping: 30,
                      }}
                    />
                  )}
                  <span className="relative">
                    {t(`playground.layout.profile_${pl}`)}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Link Style ── */}
        <div className="rounded-2xl border border-white/6 bg-white/2 p-5 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <Link2 size={14} className="text-white/40" />
            <span className="text-xs font-semibold text-white/40 uppercase tracking-widest">
              {t('playground.layout.linkStyle')}
            </span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {LINK_STYLES.map((ls) => {
              const active = localLayout.linkStyle === ls
              return (
                <button
                  key={ls}
                  onClick={() => set({ linkStyle: ls })}
                  className={`relative py-2.5 px-3 rounded-xl text-[11px] font-medium transition-all ${active ? 'bg-white/10 text-white ring-1 ring-white/20' : 'bg-white/3 text-white/40 hover:bg-white/6 hover:text-white/60'}`}
                >
                  {active && (
                    <motion.div
                      layoutId="link-style-active"
                      className="absolute inset-0 rounded-xl bg-cyan-500/10 ring-1 ring-cyan-500/30"
                      transition={{
                        type: 'spring',
                        stiffness: 400,
                        damping: 30,
                      }}
                    />
                  )}
                  <span className="relative">
                    {t(`playground.layout.link_${ls}`)}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Spacing & Sizing ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key="spacing"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15 }}
            className="rounded-2xl border border-white/6 bg-white/2 p-5 space-y-5"
          >
            <div className="flex items-center gap-2 mb-1">
              <SlidersHorizontal size={14} className="text-white/40" />
              <span className="text-xs font-semibold text-white/40 uppercase tracking-widest">
                {t('playground.layout.spacing')}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-5">
              <Slider
                label={t('playground.layout.cardSpacing')}
                value={localLayout.cardSpacing}
                min={0}
                max={32}
                onChange={(v) => set({ cardSpacing: v })}
                unit="px"
              />
              <Slider
                label={t('playground.layout.cardPadding')}
                value={localLayout.cardPadding}
                min={0}
                max={32}
                onChange={(v) => set({ cardPadding: v })}
                unit="px"
              />
              <Slider
                label={t('playground.layout.borderRadius')}
                value={localLayout.cardBorderRadius}
                min={0}
                max={32}
                onChange={(v) => set({ cardBorderRadius: v })}
                unit="px"
              />
              <Slider
                label={t('playground.layout.maxWidth')}
                value={localLayout.maxWidth ?? 640}
                min={320}
                max={1200}
                step={10}
                onChange={(v) => set({ maxWidth: v })}
                unit="px"
              />
            </div>
            {localLayout.cardLayout === 'tilt' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Slider
                  label={t('playground.layout.tiltDegree')}
                  value={localLayout.cardTiltDegree ?? 5}
                  min={0}
                  max={15}
                  onChange={(v) => set({ cardTiltDegree: v })}
                  unit="°"
                />
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* ── Shadow ── */}
        <div className="rounded-2xl border border-white/6 bg-white/2 p-5 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <Layers size={14} className="text-white/40" />
            <span className="text-xs font-semibold text-white/40 uppercase tracking-widest">
              {t('playground.layout.shadow')}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {SHADOWS.map((sh) => {
              const active = localLayout.cardShadow === sh
              return (
                <button
                  key={sh}
                  onClick={() => set({ cardShadow: sh })}
                  className={`relative px-4 py-2 rounded-xl text-xs font-medium transition-all ${active ? 'bg-white/10 text-white ring-1 ring-white/20' : 'bg-white/3 text-white/40 hover:bg-white/6 hover:text-white/60'}`}
                >
                  {active && (
                    <motion.div
                      layoutId="shadow-active"
                      className="absolute inset-0 rounded-xl bg-pink-500/10 ring-1 ring-pink-500/30"
                      transition={{
                        type: 'spring',
                        stiffness: 400,
                        damping: 30,
                      }}
                    />
                  )}
                  <span className="relative">
                    {t(`playground.layout.shadow_${sh}`)}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        <SaveButton
          onClick={() => mutation.mutate(localLayout)}
          onReset={resetLayout}
          isPending={mutation.isPending}
          show={isDirty}
        />
      </div>

      <div className="hidden xl:block">
        <LivePreview layout={localLayout} />
      </div>
    </div>
  )
}
