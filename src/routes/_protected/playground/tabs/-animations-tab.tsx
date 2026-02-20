import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'motion/react'
import {
  Sparkles,
  Layers,
  MousePointer2,
  MonitorPlay,
  Palette,
  CircleOff,
  Zap,
  RotateCcw,
  Wind,
  Feather,
  Waves,
  ArrowUpRight,
  Flame,
  MoveRight,
  ChevronsUp,
  FlipVertical,
  Check,
  Power,
} from 'lucide-react'
import { useAnimationsState, usePlaygroundPermissions } from '../-use-playground'
import { SaveButton, ColorPicker, PremiumGate } from '../-components'
import type { AnimatedProfileSettings } from '../-types'

const AVATAR_ANIMS = [
  { id: 'none', icon: CircleOff, color: 'from-zinc-500 to-zinc-600' },
  { id: 'pulse', icon: Zap, color: 'from-yellow-500 to-amber-500' },
  { id: 'glow', icon: Sparkles, color: 'from-violet-500 to-purple-600' },
  { id: 'bounce', icon: ChevronsUp, color: 'from-emerald-500 to-teal-500' },
  { id: 'rotate', icon: RotateCcw, color: 'from-blue-500 to-cyan-500' },
  { id: 'shake', icon: Wind, color: 'from-orange-500 to-red-500' },
  { id: 'float', icon: Feather, color: 'from-pink-500 to-rose-500' },
] as const

const BANNER_ANIMS = [
  { id: 'none', icon: CircleOff, color: 'from-zinc-500 to-zinc-600' },
  { id: 'parallax', icon: Layers, color: 'from-blue-500 to-indigo-500' },
  { id: 'gradient-shift', icon: Palette, color: 'from-pink-500 to-violet-500' },
  { id: 'particles', icon: Sparkles, color: 'from-emerald-500 to-cyan-500' },
  { id: 'wave', icon: Waves, color: 'from-cyan-500 to-blue-500' },
  { id: 'aurora', icon: Flame, color: 'from-green-400 to-teal-500' },
] as const

const LINK_EFFECTS = [
  { id: 'none', icon: CircleOff, color: 'from-zinc-500 to-zinc-600' },
  { id: 'scale', icon: ArrowUpRight, color: 'from-violet-500 to-purple-500' },
  { id: 'glow', icon: Sparkles, color: 'from-amber-500 to-yellow-500' },
  { id: 'slide', icon: MoveRight, color: 'from-blue-500 to-cyan-500' },
  { id: 'shake', icon: Wind, color: 'from-red-500 to-orange-500' },
  { id: 'flip', icon: FlipVertical, color: 'from-pink-500 to-rose-500' },
  { id: 'tilt', icon: Layers, color: 'from-indigo-500 to-violet-500' },
  { id: 'lift', icon: ChevronsUp, color: 'from-emerald-500 to-green-500' },
] as const

const PAGE_TRANS = [
  { id: 'none', label: 'playground.anim.transNone' },
  { id: 'fade', label: 'playground.anim.transFade' },
  { id: 'slide', label: 'playground.anim.transSlide' },
  { id: 'zoom', label: 'playground.anim.transZoom' },
  { id: 'blur', label: 'playground.anim.transBlur' },
] as const

// ── Avatar animation CSS for preview ──
const AVATAR_ANIM_CSS: Record<string, string> = {
  none: '',
  pulse: 'animate-pulse',
  glow: 'shadow-[0_0_20px_var(--glow)]',
  bounce: 'animate-bounce',
  rotate: 'animate-spin',
  shake: 'animate-pulse',
  float: 'animate-bounce',
}

// ── Live Preview ──
function AnimPreview({ anim }: { anim: AnimatedProfileSettings }) {
  const { t } = useTranslation()
  const glowColor = anim.glowColor ?? '#8b5cf6'
  const particleColor = anim.particleColor ?? '#34d399'

  const bannerBg =
    anim.bannerAnimation === 'gradient-shift'
      ? 'bg-linear-to-r from-violet-600 via-pink-500 to-orange-400'
      : anim.bannerAnimation === 'aurora'
        ? 'bg-linear-to-r from-green-400 via-teal-500 to-cyan-500'
        : anim.bannerAnimation === 'wave'
          ? 'bg-linear-to-r from-blue-500 via-cyan-400 to-blue-600'
          : 'bg-linear-to-br from-white/8 to-white/3'

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

      <div className="relative bg-[#0a0a0a] overflow-hidden">
        {/* Banner */}
        <motion.div
          className={`h-24 ${bannerBg} relative overflow-hidden`}
          animate={
            anim.bannerAnimation === 'gradient-shift'
              ? { backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }
              : undefined
          }
          transition={
            anim.bannerAnimation === 'gradient-shift'
              ? { duration: 4, repeat: Infinity, ease: 'linear' }
              : undefined
          }
          style={{
            backgroundSize:
              anim.bannerAnimation === 'gradient-shift'
                ? '200% 200%'
                : undefined,
          }}
        >
          {anim.bannerAnimation === 'particles' && (
            <div className="absolute inset-0">
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 rounded-full"
                  style={{
                    background: particleColor,
                    left: `${10 + i * 12}%`,
                    top: `${20 + (i % 3) * 25}%`,
                  }}
                  animate={{ y: [-5, 5, -5], opacity: [0.3, 0.8, 0.3] }}
                  transition={{
                    duration: 2 + i * 0.3,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </div>
          )}
          {anim.bannerAnimation === 'wave' && (
            <motion.div
              className="absolute bottom-0 left-0 right-0 h-8 bg-linear-to-t from-[#0a0a0a] to-transparent"
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />
          )}
        </motion.div>

        {/* Profile area */}
        <div className="px-5 pb-5 -mt-7 relative">
          <motion.div
            className={`w-14 h-14 rounded-full border-2 border-[#0a0a0a] flex items-center justify-center mx-auto relative ${AVATAR_ANIM_CSS[anim.avatarAnimation] ?? ''}`}
            style={
              {
                background: 'rgba(255,255,255,0.12)',
                '--glow': glowColor,
              } as React.CSSProperties
            }
            animate={
              anim.avatarAnimation === 'pulse'
                ? { scale: [1, 1.05, 1] }
                : anim.avatarAnimation === 'bounce'
                  ? { y: [0, -6, 0] }
                  : anim.avatarAnimation === 'rotate'
                    ? { rotate: [0, 360] }
                    : anim.avatarAnimation === 'shake'
                      ? { x: [-2, 2, -2, 0] }
                      : anim.avatarAnimation === 'float'
                        ? { y: [0, -4, 0] }
                        : undefined
            }
            transition={{
              duration: anim.avatarAnimation === 'rotate' ? 4 : 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            {anim.avatarAnimation === 'glow' && (
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  boxShadow: `0 0 16px ${glowColor}, 0 0 32px ${glowColor}40`,
                }}
              />
            )}
            <span className="text-lg relative">👤</span>
          </motion.div>

          <div className="text-center mt-3 mb-4">
            <div className="h-3 w-20 rounded-full bg-white/25 mx-auto" />
            <div className="h-2 w-14 rounded-full bg-white/12 mx-auto mt-1.5" />
          </div>

          {/* Links */}
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/6 border border-white/8 cursor-pointer"
                whileHover={
                  anim.linkHoverEffect === 'scale'
                    ? { scale: 1.03 }
                    : anim.linkHoverEffect === 'glow'
                      ? { boxShadow: `0 0 16px ${glowColor}40` }
                      : anim.linkHoverEffect === 'slide'
                        ? { x: 4 }
                        : anim.linkHoverEffect === 'shake'
                          ? { x: [-1, 1, -1, 0] }
                          : anim.linkHoverEffect === 'tilt'
                            ? { rotateZ: 1 }
                            : anim.linkHoverEffect === 'lift'
                              ? {
                                  y: -2,
                                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                                }
                              : undefined
                }
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                <div className="w-3.5 h-3.5 rounded bg-white/15 shrink-0" />
                <div className="h-2 rounded-full bg-white/20 flex-1" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between px-4 py-2.5 bg-white/2 border-t border-white/5">
        <span className="text-[10px] text-white/25 font-mono">
          {t('playground.anim.avatarAnimation')}
        </span>
        <span className="text-[10px] text-white/25">
          {t('playground.bg.livePreviewHint')}
        </span>
      </div>
    </div>
  )
}

// ── Selector Grid ──
function AnimGrid<T extends string>({
  items,
  active,
  onSelect,
  layoutId,
  t,
}: {
  items: readonly {
    id: T
    icon: React.ComponentType<{ size?: number; className?: string }>
    color: string
  }[]
  active: T
  onSelect: (id: T) => void
  layoutId: string
  t: (key: string) => string
}) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {items.map((item) => {
        const isActive = active === item.id
        return (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            className={`relative flex flex-col items-center gap-2 py-3 px-2 rounded-xl transition-all duration-200 group ${isActive ? 'bg-white/8' : 'hover:bg-white/4'}`}
          >
            {isActive && (
              <motion.div
                layoutId={layoutId}
                className={`absolute inset-0 rounded-xl bg-linear-to-br ${item.color} opacity-[0.12]`}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <div
              className={`relative w-8 h-8 rounded-lg flex items-center justify-center transition-all ${isActive ? `bg-linear-to-br ${item.color} shadow-lg` : 'bg-white/6 group-hover:bg-white/10'}`}
            >
              <item.icon size={14} className="text-white" />
            </div>
            <span
              className={`relative text-[9px] font-semibold ${isActive ? 'text-white' : 'text-white/30'}`}
            >
              {t(
                `playground.anim.${item.id === 'gradient-shift' ? 'bannerGradientShift' : item.id}`,
              )}
            </span>
            {isActive && (
              <div className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-white/15 flex items-center justify-center">
                <Check size={7} className="text-white" />
              </div>
            )}
          </button>
        )
      })}
    </div>
  )
}

export function AnimationsTab() {
  const { t } = useTranslation()
  const { isCreator } = usePlaygroundPermissions()
  const { localAnimated, setLocalAnimated, isDirty, resetAnimated, mutation } =
    useAnimationsState()

  if (!isCreator) return <PremiumGate />

  const set = (patch: Partial<AnimatedProfileSettings>) =>
    setLocalAnimated({ ...localAnimated, ...patch })

  const needsGlow =
    localAnimated.avatarAnimation === 'glow' ||
    localAnimated.linkHoverEffect === 'glow'
  const needsParticle = localAnimated.bannerAnimation === 'particles'

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-8 items-start">
      <div className="space-y-6">
        {/* ── Enable Toggle ── */}
        <div className="rounded-2xl border border-white/6 bg-white/2 p-5">
          <button
            onClick={() => set({ enabled: !localAnimated.enabled })}
            className="w-full flex items-center gap-4"
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${localAnimated.enabled ? 'bg-linear-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/20' : 'bg-white/6'}`}
            >
              <Power size={18} className="text-white" />
            </div>
            <div className="text-left flex-1">
              <span className="text-sm font-semibold text-white/70">
                {t('playground.anim.enable')}
              </span>
              <p className="text-[10px] text-white/25 mt-0.5">
                {t('playground.anim.enableDesc')}
              </p>
            </div>
            <div
              className={`w-11 h-6 rounded-full transition-all ${localAnimated.enabled ? 'bg-violet-500' : 'bg-white/10'}`}
            >
              <motion.div
                className="w-5 h-5 rounded-full bg-white shadow-sm mt-0.5"
                animate={{ x: localAnimated.enabled ? 22 : 2 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            </div>
          </button>
        </div>

        <AnimatePresence>
          {localAnimated.enabled && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* ── Avatar Animation ── */}
              <div className="rounded-2xl border border-white/6 bg-white/2 p-5 space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles size={14} className="text-white/40" />
                  <span className="text-xs font-semibold text-white/40 uppercase tracking-widest">
                    {t('playground.anim.avatarAnimation')}
                  </span>
                </div>
                <AnimGrid
                  items={AVATAR_ANIMS}
                  active={localAnimated.avatarAnimation}
                  onSelect={(id) =>
                    set({
                      avatarAnimation:
                        id as AnimatedProfileSettings['avatarAnimation'],
                    })
                  }
                  layoutId="avatar-anim"
                  t={t}
                />
              </div>

              {/* ── Banner Animation ── */}
              <div className="rounded-2xl border border-white/6 bg-white/2 p-5 space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <Layers size={14} className="text-white/40" />
                  <span className="text-xs font-semibold text-white/40 uppercase tracking-widest">
                    {t('playground.anim.bannerAnimation')}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {BANNER_ANIMS.map((item) => {
                    const isActive = localAnimated.bannerAnimation === item.id
                    return (
                      <button
                        key={item.id}
                        onClick={() =>
                          set({
                            bannerAnimation:
                              item.id as AnimatedProfileSettings['bannerAnimation'],
                          })
                        }
                        className={`relative flex flex-col items-center gap-2 py-3 px-2 rounded-xl transition-all duration-200 group ${isActive ? 'bg-white/8' : 'hover:bg-white/4'}`}
                      >
                        {isActive && (
                          <motion.div
                            layoutId="banner-anim"
                            className={`absolute inset-0 rounded-xl bg-linear-to-br ${item.color} opacity-[0.12]`}
                            transition={{
                              type: 'spring',
                              stiffness: 400,
                              damping: 30,
                            }}
                          />
                        )}
                        <div
                          className={`relative w-8 h-8 rounded-lg flex items-center justify-center transition-all ${isActive ? `bg-linear-to-br ${item.color} shadow-lg` : 'bg-white/6 group-hover:bg-white/10'}`}
                        >
                          <item.icon size={14} className="text-white" />
                        </div>
                        <span
                          className={`relative text-[9px] font-semibold ${isActive ? 'text-white' : 'text-white/30'}`}
                        >
                          {t(
                            `playground.anim.banner${item.id.charAt(0).toUpperCase() + item.id.slice(1).replace(/-./g, (m) => (m[1] ?? '').toUpperCase())}`,
                          )}
                        </span>
                        {isActive && (
                          <div className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-white/15 flex items-center justify-center">
                            <Check size={7} className="text-white" />
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* ── Link Hover Effect ── */}
              <div className="rounded-2xl border border-white/6 bg-white/2 p-5 space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <MousePointer2 size={14} className="text-white/40" />
                  <span className="text-xs font-semibold text-white/40 uppercase tracking-widest">
                    {t('playground.anim.linkHoverEffect')}
                  </span>
                </div>
                <AnimGrid
                  items={LINK_EFFECTS}
                  active={localAnimated.linkHoverEffect}
                  onSelect={(id) =>
                    set({
                      linkHoverEffect:
                        id as AnimatedProfileSettings['linkHoverEffect'],
                    })
                  }
                  layoutId="link-effect"
                  t={t}
                />
              </div>

              {/* ── Page Transition ── */}
              <div className="rounded-2xl border border-white/6 bg-white/2 p-5 space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <MonitorPlay size={14} className="text-white/40" />
                  <span className="text-xs font-semibold text-white/40 uppercase tracking-widest">
                    {t('playground.anim.pageTransition')}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {PAGE_TRANS.map((tr) => {
                    const isActive = localAnimated.pageTransition === tr.id
                    return (
                      <button
                        key={tr.id}
                        onClick={() =>
                          set({
                            pageTransition:
                              tr.id as AnimatedProfileSettings['pageTransition'],
                          })
                        }
                        className={`relative px-4 py-2 rounded-xl text-xs font-medium transition-all ${isActive ? 'bg-white/10 text-white ring-1 ring-white/20' : 'bg-white/3 text-white/40 hover:bg-white/6 hover:text-white/60'}`}
                      >
                        {isActive && (
                          <motion.div
                            layoutId="page-trans"
                            className="absolute inset-0 rounded-xl bg-violet-500/10 ring-1 ring-violet-500/30"
                            transition={{
                              type: 'spring',
                              stiffness: 400,
                              damping: 30,
                            }}
                          />
                        )}
                        <span className="relative">{t(tr.label)}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* ── Color Settings ── */}
              {(needsGlow || needsParticle) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="rounded-2xl border border-white/6 bg-white/2 p-5 space-y-4"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Palette size={14} className="text-white/40" />
                    <span className="text-xs font-semibold text-white/40 uppercase tracking-widest">
                      {t('playground.anim.colorSettings')}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {needsGlow && (
                      <ColorPicker
                        label={t('playground.anim.glowColor')}
                        value={localAnimated.glowColor ?? '#8b5cf6'}
                        onChange={(v) => set({ glowColor: v })}
                      />
                    )}
                    {needsParticle && (
                      <ColorPicker
                        label={t('playground.anim.particleColor')}
                        value={localAnimated.particleColor ?? '#34d399'}
                        onChange={(v) => set({ particleColor: v })}
                      />
                    )}
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <SaveButton
          onClick={() => mutation.mutate(localAnimated)}
          onReset={resetAnimated}
          isPending={mutation.isPending}
          show={isDirty}
        />
      </div>

      <div className="hidden xl:block">
        <AnimPreview anim={localAnimated} />
      </div>
    </div>
  )
}
