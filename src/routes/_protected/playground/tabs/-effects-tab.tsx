import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'motion/react'
import {
  Sparkles,
  CircleOff,
  Snowflake,
  CloudRain,
  Flame,
  Wind,
  Zap,
  Star,
  Code2,
  Palette,
  Power,
  Check,
} from 'lucide-react'
import { useEffectsState } from '../-use-playground'
import { SaveButton, ColorPicker } from '../-components'
import type { ProfileEffects } from '../-types'

const EFFECTS = [
  {
    id: 'none',
    icon: CircleOff,
    color: 'from-zinc-500 to-zinc-600',
    particle: null,
  },
  {
    id: 'sparkles',
    icon: Sparkles,
    color: 'from-yellow-400 to-amber-500',
    particle: '✦',
  },
  {
    id: 'snow',
    icon: Snowflake,
    color: 'from-sky-300 to-blue-400',
    particle: '❄',
  },
  {
    id: 'rain',
    icon: CloudRain,
    color: 'from-blue-400 to-indigo-500',
    particle: '│',
  },
  {
    id: 'confetti',
    icon: Zap,
    color: 'from-pink-500 to-violet-500',
    particle: '■',
  },
  {
    id: 'fireflies',
    icon: Flame,
    color: 'from-amber-400 to-orange-500',
    particle: '●',
  },
  {
    id: 'bubbles',
    icon: Wind,
    color: 'from-cyan-400 to-teal-500',
    particle: '○',
  },
  {
    id: 'stars',
    icon: Star,
    color: 'from-violet-400 to-purple-500',
    particle: '★',
  },
  {
    id: 'matrix',
    icon: Code2,
    color: 'from-green-400 to-emerald-500',
    particle: '0',
  },
] as const

const INTENSITIES = ['subtle', 'normal', 'intense'] as const

// ── Particle count by intensity ──
const PARTICLE_COUNTS: Record<string, number> = {
  subtle: 8,
  normal: 14,
  intense: 22,
}

// ── Live Preview ──
function EffectsPreview({ effects }: { effects: ProfileEffects }) {
  const { t } = useTranslation()
  const effectDef = EFFECTS.find((e) => e.id === effects.effect) ?? EFFECTS[0]
  const color = effects.color ?? '#fbbf24'
  const count = PARTICLE_COUNTS[effects.intensity ?? 'normal'] ?? 14
  const isRain = effects.effect === 'rain'
  const isMatrix = effects.effect === 'matrix'
  const isSnow = effects.effect === 'snow'

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

      <div className="relative bg-[#0a0a0a] overflow-hidden min-h-[320px]">
        {/* Particles */}
        {effects.enabled && effects.effect !== 'none' && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(count)].map((_, i) => {
              const left = `${5 + ((i * 37) % 90)}%`
              const delay = (i * 0.3) % 3
              const dur = isRain
                ? 0.8 + (i % 3) * 0.3
                : isMatrix
                  ? 1.5 + (i % 4) * 0.5
                  : 2.5 + (i % 5) * 0.8
              const size = isRain
                ? 8
                : isMatrix
                  ? 10
                  : isSnow
                    ? 10 + (i % 3) * 4
                    : 6 + (i % 4) * 2

              return (
                <motion.div
                  key={i}
                  className="absolute select-none"
                  style={{
                    left,
                    top: -20,
                    fontSize: size,
                    color: isMatrix ? '#22c55e' : color,
                    opacity: 0.6 + (i % 4) * 0.1,
                    textShadow:
                      effects.effect === 'fireflies' ||
                      effects.effect === 'sparkles'
                        ? `0 0 6px ${color}`
                        : undefined,
                  }}
                  animate={{
                    y: [0, 340],
                    x: isSnow ? [0, i % 2 === 0 ? 15 : -15, 0] : undefined,
                    opacity:
                      effects.effect === 'fireflies'
                        ? [0.2, 0.8, 0.2]
                        : undefined,
                    rotate:
                      effects.effect === 'confetti' ? [0, 360] : undefined,
                  }}
                  transition={{
                    y: {
                      duration: dur,
                      repeat: Infinity,
                      delay,
                      ease: isRain ? 'linear' : 'easeIn',
                    },
                    x: isSnow
                      ? {
                          duration: dur * 1.5,
                          repeat: Infinity,
                          delay,
                          ease: 'easeInOut',
                        }
                      : undefined,
                    opacity:
                      effects.effect === 'fireflies'
                        ? { duration: 1.5, repeat: Infinity, delay }
                        : undefined,
                    rotate:
                      effects.effect === 'confetti'
                        ? { duration: dur, repeat: Infinity, delay }
                        : undefined,
                  }}
                >
                  {isMatrix
                    ? String.fromCharCode(0x30a0 + (Math.floor(i * 7.3) % 96))
                    : effectDef.particle}
                </motion.div>
              )
            })}
          </div>
        )}

        {/* Profile skeleton */}
        <div className="relative z-10 flex flex-col items-center pt-10 pb-8 px-5">
          <div className="w-16 h-16 rounded-full bg-white/10 border-2 border-white/15 flex items-center justify-center mb-3">
            <span className="text-2xl">👤</span>
          </div>
          <div className="h-3.5 w-24 rounded-full bg-white/20 mb-2" />
          <div className="h-2 w-16 rounded-full bg-white/10 mb-6" />
          <div className="w-full space-y-2.5 max-w-[200px]">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-white/5 border border-white/8"
              >
                <div className="w-3.5 h-3.5 rounded bg-white/15 shrink-0" />
                <div className="h-2 rounded-full bg-white/15 flex-1" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between px-4 py-2.5 bg-white/2 border-t border-white/5">
        <div className="flex items-center gap-1.5">
          {effects.enabled && effects.effect !== 'none' && (
            <div
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ background: color }}
            />
          )}
          <span className="text-[10px] text-white/25 font-mono">
            {effects.enabled && effects.effect !== 'none'
              ? t(`playground.effects.${effects.effect}`)
              : t('playground.effects.none')}
          </span>
        </div>
        <span className="text-[10px] text-white/25">
          {t('playground.bg.livePreviewHint')}
        </span>
      </div>
    </div>
  )
}

export function EffectsTab() {
  const { t } = useTranslation()
  const { localEffects, setLocalEffects, isDirty, resetEffects, mutation } =
    useEffectsState()

  const set = (patch: Partial<ProfileEffects>) =>
    setLocalEffects({ ...localEffects, ...patch })

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-8 items-start">
      <div className="space-y-6">
        {/* ── Enable Toggle ── */}
        <div className="rounded-2xl border border-white/6 bg-white/2 p-5">
          <button
            onClick={() => set({ enabled: !localEffects.enabled })}
            className="w-full flex items-center gap-4"
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${localEffects.enabled ? 'bg-linear-to-br from-amber-500 to-orange-500 shadow-lg shadow-amber-500/20' : 'bg-white/6'}`}
            >
              <Power size={18} className="text-white" />
            </div>
            <div className="text-left flex-1">
              <span className="text-sm font-semibold text-white/70">
                {t('playground.effects.title')}
              </span>
              <p className="text-[10px] text-white/25 mt-0.5">
                {t('playground.effects.desc')}
              </p>
            </div>
            <div
              className={`w-11 h-6 rounded-full transition-all ${localEffects.enabled ? 'bg-amber-500' : 'bg-white/10'}`}
            >
              <motion.div
                className="w-5 h-5 rounded-full bg-white shadow-sm mt-0.5"
                animate={{ x: localEffects.enabled ? 22 : 2 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            </div>
          </button>
        </div>

        <AnimatePresence>
          {localEffects.enabled && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* ── Effect Selection ── */}
              <div className="rounded-2xl border border-white/6 bg-white/2 p-5 space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles size={14} className="text-white/40" />
                  <span className="text-xs font-semibold text-white/40 uppercase tracking-widest">
                    {t('playground.effects.selectEffect')}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {EFFECTS.map((e) => {
                    const active = localEffects.effect === e.id
                    return (
                      <button
                        key={e.id}
                        onClick={() =>
                          set({ effect: e.id as ProfileEffects['effect'] })
                        }
                        className={`relative flex flex-col items-center gap-2 py-3.5 px-2 rounded-xl transition-all duration-200 group ${active ? 'bg-white/8' : 'hover:bg-white/4'}`}
                      >
                        {active && (
                          <motion.div
                            layoutId="effect-sel"
                            className={`absolute inset-0 rounded-xl bg-linear-to-br ${e.color} opacity-[0.12]`}
                            transition={{
                              type: 'spring',
                              stiffness: 400,
                              damping: 30,
                            }}
                          />
                        )}
                        <div
                          className={`relative w-9 h-9 rounded-xl flex items-center justify-center transition-all ${active ? `bg-linear-to-br ${e.color} shadow-lg` : 'bg-white/6 group-hover:bg-white/10'}`}
                        >
                          <e.icon size={16} className="text-white" />
                        </div>
                        <span
                          className={`relative text-[10px] font-semibold ${active ? 'text-white' : 'text-white/35'}`}
                        >
                          {t(`playground.effects.${e.id}`)}
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

              {/* ── Intensity & Color ── */}
              <AnimatePresence>
                {localEffects.effect !== 'none' && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="space-y-6"
                  >
                    {/* Intensity */}
                    <div className="rounded-2xl border border-white/6 bg-white/2 p-5 space-y-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Zap size={14} className="text-white/40" />
                        <span className="text-xs font-semibold text-white/40 uppercase tracking-widest">
                          {t('playground.effects.intensity')}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        {INTENSITIES.map((i) => {
                          const active =
                            (localEffects.intensity ?? 'normal') === i
                          return (
                            <button
                              key={i}
                              onClick={() => set({ intensity: i })}
                              className={`relative flex-1 py-2.5 rounded-xl text-xs font-medium transition-all ${active ? 'bg-white/10 text-white ring-1 ring-white/20' : 'bg-white/3 text-white/40 hover:bg-white/6'}`}
                            >
                              {active && (
                                <motion.div
                                  layoutId="effect-int"
                                  className="absolute inset-0 rounded-xl bg-amber-500/10 ring-1 ring-amber-500/30"
                                  transition={{
                                    type: 'spring',
                                    stiffness: 400,
                                    damping: 30,
                                  }}
                                />
                              )}
                              <span className="relative">
                                {t(`playground.effects.intensity_${i}`)}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {/* Color */}
                    <div className="rounded-2xl border border-white/6 bg-white/2 p-5 space-y-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Palette size={14} className="text-white/40" />
                        <span className="text-xs font-semibold text-white/40 uppercase tracking-widest">
                          {t('playground.effects.color')}
                        </span>
                      </div>
                      <ColorPicker
                        label={t('playground.effects.effectColor')}
                        value={localEffects.color ?? '#fbbf24'}
                        onChange={(v) => set({ color: v })}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        <SaveButton
          onClick={() => mutation.mutate(localEffects)}
          onReset={resetEffects}
          isPending={mutation.isPending}
          show={isDirty}
        />
      </div>

      <div className="hidden xl:block">
        <EffectsPreview effects={localEffects} />
      </div>
    </div>
  )
}
