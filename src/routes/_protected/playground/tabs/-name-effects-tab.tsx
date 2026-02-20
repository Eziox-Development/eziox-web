import { useRef, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'motion/react'
import {
  Sparkles,
  CircleOff,
  Rainbow,
  Palette,
  Zap,
  Type,
  Check,
  Waves,
  ChevronsUp,
  Flame,
  Wind,
  SlidersHorizontal,
  Plus,
  X,
} from 'lucide-react'
import { useNameEffectState } from '../-use-playground'
import { SaveButton, ColorPicker, Slider } from '../-components'
import type { NameEffect } from '../-types'

// ── Style definitions ──
const NAME_STYLES = [
  { id: 'none', icon: CircleOff, color: 'from-zinc-500 to-zinc-600' },
  { id: 'glow', icon: Sparkles, color: 'from-violet-500 to-purple-600' },
  { id: 'gradient', icon: Palette, color: 'from-pink-500 to-orange-500' },
  {
    id: 'rainbow',
    icon: Rainbow,
    color: 'from-red-500 via-yellow-500 to-blue-500',
  },
  { id: 'neon', icon: Zap, color: 'from-cyan-400 to-blue-500' },
  { id: 'glitch', icon: Type, color: 'from-red-500 to-pink-600' },
] as const

const NAME_ANIMATIONS = [
  { id: 'none', icon: CircleOff, color: 'from-zinc-500 to-zinc-600' },
  { id: 'typing', icon: Type, color: 'from-emerald-500 to-teal-500' },
  { id: 'bounce-in', icon: ChevronsUp, color: 'from-blue-500 to-cyan-500' },
  { id: 'wave', icon: Waves, color: 'from-violet-500 to-indigo-500' },
  { id: 'flicker', icon: Flame, color: 'from-amber-500 to-orange-500' },
  { id: 'pulse', icon: Wind, color: 'from-pink-500 to-rose-500' },
  { id: 'float', icon: Sparkles, color: 'from-teal-500 to-emerald-500' },
] as const

const GLOW_INTENSITIES = ['subtle', 'medium', 'strong'] as const
const TEXT_TRANSFORMS = ['none', 'uppercase', 'lowercase'] as const

// ── Combination rules: which animations are compatible with which styles ──
const STYLE_ANIM_COMPAT: Record<string, string[]> = {
  none: ['none'],
  glow: ['none', 'typing', 'pulse', 'float', 'flicker'],
  gradient: ['none', 'typing', 'wave', 'bounce-in'],
  rainbow: ['none', 'typing', 'wave', 'bounce-in', 'pulse'],
  neon: ['none', 'typing', 'flicker', 'pulse', 'float'],
  glitch: ['none', 'bounce-in', 'flicker'],
}

function isAnimCompatible(style: string, anim: string): boolean {
  return STYLE_ANIM_COMPAT[style]?.includes(anim) ?? false
}

// ── Live Preview ──
function NamePreview({ effect }: { effect: NameEffect }) {
  const { t } = useTranslation()
  const measureRef = useRef<HTMLSpanElement>(null)
  const [textWidth, setTextWidth] = useState<number | null>(null)

  useEffect(() => {
    if (measureRef.current) setTextWidth(measureRef.current.offsetWidth)
  })
  const name = t('playground.nameEffects.previewName')
  const glowColor = effect.glowColor ?? '#8b5cf6'
  const intensity =
    effect.glowIntensity === 'strong'
      ? 24
      : effect.glowIntensity === 'subtle'
        ? 6
        : 14
  const gradColors = effect.gradientColors ?? ['#7c3aed', '#ec4899']
  const spacing = effect.letterSpacing ?? 0
  const transform = effect.textTransform ?? 'none'

  const getTextStyle = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      letterSpacing: spacing > 0 ? `${spacing}px` : undefined,
      textTransform: transform !== 'none' ? transform : undefined,
    }
    switch (effect.style) {
      case 'glow':
        return {
          ...base,
          textShadow: `0 0 ${intensity}px ${glowColor}, 0 0 ${intensity * 2}px ${glowColor}40`,
          color: 'white',
        }
      case 'neon':
        return {
          ...base,
          textShadow: `0 0 ${intensity}px ${glowColor}, 0 0 ${intensity * 2}px ${glowColor}60, 0 0 ${intensity * 3}px ${glowColor}30`,
          color: glowColor,
        }
      case 'gradient':
        return {
          ...base,
          background: `linear-gradient(135deg, ${gradColors.join(', ')})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }
      case 'rainbow':
        return {
          ...base,
          background:
            'linear-gradient(90deg, #ef4444, #f97316, #eab308, #22c55e, #3b82f6, #8b5cf6, #ec4899)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          backgroundSize: '200% 100%',
        }
      case 'glitch':
        return {
          ...base,
          color: 'white',
          textShadow: '2px 0 #ff0040, -2px 0 #00ff9f',
        }
      default:
        return { ...base, color: 'rgba(255,255,255,0.8)' }
    }
  }

  const isTyping = effect.animation === 'typing'

  const getAnimation = () => {
    switch (effect.animation) {
      case 'typing':
        return undefined
      case 'bounce-in':
        return { y: [-20, 0], opacity: [0, 1] }
      case 'wave':
        return { y: [0, -4, 0] }
      case 'flicker':
        return { opacity: [1, 0.4, 1, 0.7, 1] }
      case 'pulse':
        return { scale: [1, 1.03, 1] }
      case 'float':
        return { y: [0, -3, 0] }
      default:
        return undefined
    }
  }

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
      <div className="relative bg-[#0a0a0a] p-8 flex flex-col items-center justify-center min-h-[280px]">
        {/* Avatar */}
        <div className="w-16 h-16 rounded-full bg-white/10 border-2 border-white/15 flex items-center justify-center mb-4">
          <span className="text-2xl">👤</span>
        </div>
        {/* Name with effect */}
        <motion.div
          key={`${effect.style}-${effect.animation}`}
          className="text-2xl font-extrabold tracking-tight"
          style={isTyping ? {} : getTextStyle()}
          animate={getAnimation()}
          transition={{
            duration: effect.animation === 'flicker' ? 0.8 : 2.5,
            repeat: Infinity,
            repeatType: effect.animation === 'bounce-in' ? 'loop' : 'mirror',
            ease: 'easeInOut',
          }}
        >
          {isTyping ? (
            <span className="inline-block relative whitespace-nowrap">
              {/* Hidden full-width measure span */}
              <span ref={measureRef} className="invisible absolute whitespace-nowrap" aria-hidden>
                {name}
              </span>
              <motion.span
                key={`typing-${effect.style}-${textWidth}`}
                className="inline-block overflow-hidden whitespace-nowrap align-bottom"
                animate={textWidth ? { width: [0, textWidth, textWidth, 0] } : {}}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'linear', times: [0, 0.55, 0.85, 1] }}
                style={{ ...getTextStyle(), width: 0 }}
              >
                {name}
              </motion.span>
              <motion.span
                className="inline-block w-[2px] h-[1em] bg-current align-middle ml-0.5"
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, repeatType: 'mirror' }}
              />
            </span>
          ) : effect.style === 'glitch' ? (
            <span className="relative">
              <span className="relative z-10">{name}</span>
              <motion.span
                className="absolute inset-0 text-[#ff0040] z-0"
                animate={{ x: [-1, 1, -1] }}
                transition={{ duration: 0.15, repeat: Infinity }}
              >
                {name}
              </motion.span>
              <motion.span
                className="absolute inset-0 text-[#00ff9f] z-0"
                animate={{ x: [1, -1, 1] }}
                transition={{ duration: 0.15, repeat: Infinity, delay: 0.05 }}
              >
                {name}
              </motion.span>
            </span>
          ) : (
            name
          )}
        </motion.div>
        {/* Bio skeleton */}
        <div className="h-2 w-28 rounded-full bg-white/10 mt-3" />
        {/* Combo badge */}
        {effect.style !== 'none' &&
          effect.animation &&
          effect.animation !== 'none' && (
            <div className="mt-5 flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20">
              <Sparkles size={10} className="text-violet-400" />
              <span className="text-[9px] text-violet-300 font-semibold">
                {t(`playground.nameEffects.${effect.style}`)} +{' '}
                {t(`playground.nameEffects.anim_${effect.animation}`)}
              </span>
            </div>
          )}
      </div>
      <div className="flex items-center justify-between px-4 py-2.5 bg-white/2 border-t border-white/5">
        <span className="text-[10px] text-white/25 font-mono">
          {t('playground.nameEffects.style')}
        </span>
        <span className="text-[10px] text-white/25">
          {t('playground.bg.livePreviewHint')}
        </span>
      </div>
    </div>
  )
}

export function NameEffectsTab() {
  const { t } = useTranslation()
  const {
    localNameEffect,
    setLocalNameEffect,
    isDirty,
    resetNameEffect,
    mutation,
  } = useNameEffectState()

  const set = (patch: Partial<NameEffect>) =>
    setLocalNameEffect({ ...localNameEffect, ...patch })

  const currentAnim = localNameEffect.animation ?? 'none'
  const gradColors = localNameEffect.gradientColors ?? ['#7c3aed', '#ec4899']

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-8 items-start">
      <div className="space-y-6">
        {/* ── Style ── */}
        <div className="rounded-2xl border border-white/6 bg-white/2 p-5 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={14} className="text-white/40" />
            <span className="text-xs font-semibold text-white/40 uppercase tracking-widest">
              {t('playground.nameEffects.style')}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {NAME_STYLES.map((s) => {
              const active = localNameEffect.style === s.id
              return (
                <button
                  key={s.id}
                  onClick={() => {
                    const newStyle = s.id as NameEffect['style']
                    const patch: Partial<NameEffect> = { style: newStyle }
                    if (!isAnimCompatible(newStyle, currentAnim))
                      patch.animation = 'none'
                    set(patch)
                  }}
                  className={`relative flex flex-col items-center gap-2 py-3.5 px-2 rounded-xl transition-all duration-200 group ${active ? 'bg-white/8' : 'hover:bg-white/4'}`}
                >
                  {active && (
                    <motion.div
                      layoutId="name-style"
                      className={`absolute inset-0 rounded-xl bg-linear-to-br ${s.color} opacity-[0.12]`}
                      transition={{
                        type: 'spring',
                        stiffness: 400,
                        damping: 30,
                      }}
                    />
                  )}
                  <div
                    className={`relative w-9 h-9 rounded-xl flex items-center justify-center transition-all ${active ? `bg-linear-to-br ${s.color} shadow-lg` : 'bg-white/6 group-hover:bg-white/10'}`}
                  >
                    <s.icon size={16} className="text-white" />
                  </div>
                  <span
                    className={`relative text-[10px] font-semibold ${active ? 'text-white' : 'text-white/35'}`}
                  >
                    {t(`playground.nameEffects.${s.id}`)}
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

        {/* ── Animation (only if style != none) ── */}
        <AnimatePresence>
          {localNameEffect.style !== 'none' && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="rounded-2xl border border-white/6 bg-white/2 p-5 space-y-4"
            >
              <div className="flex items-center gap-2 mb-1">
                <Waves size={14} className="text-white/40" />
                <span className="text-xs font-semibold text-white/40 uppercase tracking-widest">
                  {t('playground.nameEffects.animation')}
                </span>
                <span className="ml-auto text-[9px] text-white/15">
                  {t('playground.nameEffects.comboHint')}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {NAME_ANIMATIONS.map((a) => {
                  const compatible = isAnimCompatible(
                    localNameEffect.style,
                    a.id,
                  )
                  const active = currentAnim === a.id
                  return (
                    <button
                      key={a.id}
                      onClick={() =>
                        compatible &&
                        set({ animation: a.id as NameEffect['animation'] })
                      }
                      disabled={!compatible}
                      className={`relative flex flex-col items-center gap-2 py-3 px-2 rounded-xl transition-all duration-200 group ${!compatible ? 'opacity-20 cursor-not-allowed' : active ? 'bg-white/8' : 'hover:bg-white/4'}`}
                    >
                      {active && compatible && (
                        <motion.div
                          layoutId="name-anim"
                          className={`absolute inset-0 rounded-xl bg-linear-to-br ${a.color} opacity-[0.12]`}
                          transition={{
                            type: 'spring',
                            stiffness: 400,
                            damping: 30,
                          }}
                        />
                      )}
                      <div
                        className={`relative w-8 h-8 rounded-lg flex items-center justify-center transition-all ${active ? `bg-linear-to-br ${a.color} shadow-lg` : 'bg-white/6 group-hover:bg-white/10'}`}
                      >
                        <a.icon size={14} className="text-white" />
                      </div>
                      <span
                        className={`relative text-[9px] font-semibold ${active ? 'text-white' : 'text-white/30'}`}
                      >
                        {t(`playground.nameEffects.anim_${a.id}`)}
                      </span>
                      {active && compatible && (
                        <div className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-white/15 flex items-center justify-center">
                          <Check size={7} className="text-white" />
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Gradient Colors ── */}
        <AnimatePresence>
          {localNameEffect.style === 'gradient' && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="rounded-2xl border border-white/6 bg-white/2 p-5 space-y-4"
            >
              <div className="flex items-center gap-2 mb-1">
                <Palette size={14} className="text-white/40" />
                <span className="text-xs font-semibold text-white/40 uppercase tracking-widest">
                  {t('playground.nameEffects.gradientColors')}
                </span>
              </div>
              <div className="flex flex-wrap gap-2 items-center">
                {gradColors.map((c, i) => (
                  <div key={i} className="relative group">
                    <input
                      type="color"
                      value={c}
                      onChange={(e) => {
                        const cols = [...gradColors]
                        cols[i] = e.target.value
                        set({ gradientColors: cols })
                      }}
                      className="w-10 h-10 rounded-xl cursor-pointer border-2 border-white/10 hover:border-white/25 transition-colors"
                    />
                    {gradColors.length > 2 && (
                      <button
                        onClick={() =>
                          set({
                            gradientColors: gradColors.filter(
                              (_, j) => j !== i,
                            ),
                          })
                        }
                        className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={8} className="text-white" />
                      </button>
                    )}
                  </div>
                ))}
                {gradColors.length < 5 && (
                  <button
                    onClick={() =>
                      set({ gradientColors: [...gradColors, '#06b6d4'] })
                    }
                    className="w-10 h-10 rounded-xl border-2 border-dashed border-white/10 hover:border-violet-500/40 hover:bg-violet-500/5 flex items-center justify-center transition-all"
                  >
                    <Plus size={14} className="text-white/30" />
                  </button>
                )}
              </div>
              {/* Gradient preview bar */}
              <div
                className="h-3 rounded-full"
                style={{
                  background: `linear-gradient(90deg, ${gradColors.join(', ')})`,
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Glow / Neon Settings ── */}
        <AnimatePresence>
          {(localNameEffect.style === 'glow' ||
            localNameEffect.style === 'neon') && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="rounded-2xl border border-white/6 bg-white/2 p-5 space-y-4"
            >
              <div className="flex items-center gap-2 mb-1">
                <Zap size={14} className="text-white/40" />
                <span className="text-xs font-semibold text-white/40 uppercase tracking-widest">
                  {t('playground.nameEffects.glowSettings')}
                </span>
              </div>
              <ColorPicker
                label={t('playground.nameEffects.glowColor')}
                value={localNameEffect.glowColor ?? '#8b5cf6'}
                onChange={(v) => set({ glowColor: v })}
              />
              <div className="space-y-2">
                <span className="text-[10px] font-semibold text-white/30 uppercase tracking-wider">
                  {t('playground.nameEffects.glowIntensity')}
                </span>
                <div className="flex gap-2">
                  {GLOW_INTENSITIES.map((i) => {
                    const active =
                      (localNameEffect.glowIntensity ?? 'medium') === i
                    return (
                      <button
                        key={i}
                        onClick={() => set({ glowIntensity: i })}
                        className={`relative flex-1 py-2 rounded-xl text-xs font-medium transition-all ${active ? 'bg-white/10 text-white ring-1 ring-white/20' : 'bg-white/3 text-white/40 hover:bg-white/6'}`}
                      >
                        {active && (
                          <motion.div
                            layoutId="glow-int"
                            className="absolute inset-0 rounded-xl bg-violet-500/10 ring-1 ring-violet-500/30"
                            transition={{
                              type: 'spring',
                              stiffness: 400,
                              damping: 30,
                            }}
                          />
                        )}
                        <span className="relative">
                          {t(`playground.nameEffects.intensity_${i}`)}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
              {localNameEffect.style === 'neon' && (
                <button
                  onClick={() =>
                    set({ neonFlicker: !localNameEffect.neonFlicker })
                  }
                  className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all ${localNameEffect.neonFlicker ? 'bg-cyan-500/10 border border-cyan-500/20' : 'bg-white/3 border border-white/6'}`}
                >
                  <Flame
                    size={14}
                    className={
                      localNameEffect.neonFlicker
                        ? 'text-cyan-400'
                        : 'text-white/30'
                    }
                  />
                  <span
                    className={`text-xs font-medium ${localNameEffect.neonFlicker ? 'text-cyan-300' : 'text-white/40'}`}
                  >
                    {t('playground.nameEffects.neonFlicker')}
                  </span>
                  <div
                    className={`ml-auto w-8 h-4.5 rounded-full transition-all ${localNameEffect.neonFlicker ? 'bg-cyan-500' : 'bg-white/10'}`}
                  >
                    <motion.div
                      className="w-3.5 h-3.5 rounded-full bg-white shadow-sm mt-[2px]"
                      animate={{ x: localNameEffect.neonFlicker ? 16 : 2 }}
                      transition={{
                        type: 'spring',
                        stiffness: 500,
                        damping: 30,
                      }}
                    />
                  </div>
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Typography ── */}
        <div className="rounded-2xl border border-white/6 bg-white/2 p-5 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <SlidersHorizontal size={14} className="text-white/40" />
            <span className="text-xs font-semibold text-white/40 uppercase tracking-widest">
              {t('playground.nameEffects.typography')}
            </span>
          </div>
          <Slider
            label={t('playground.nameEffects.letterSpacing')}
            value={localNameEffect.letterSpacing ?? 0}
            min={0}
            max={16}
            onChange={(v) => set({ letterSpacing: v })}
            unit="px"
          />
          <div className="space-y-2">
            <span className="text-[10px] font-semibold text-white/30 uppercase tracking-wider">
              {t('playground.nameEffects.textTransform')}
            </span>
            <div className="flex gap-2">
              {TEXT_TRANSFORMS.map((tf) => {
                const active = (localNameEffect.textTransform ?? 'none') === tf
                return (
                  <button
                    key={tf}
                    onClick={() => set({ textTransform: tf })}
                    className={`relative flex-1 py-2 rounded-xl text-xs font-medium transition-all ${active ? 'bg-white/10 text-white ring-1 ring-white/20' : 'bg-white/3 text-white/40 hover:bg-white/6'}`}
                  >
                    {active && (
                      <motion.div
                        layoutId="text-tf"
                        className="absolute inset-0 rounded-xl bg-pink-500/10 ring-1 ring-pink-500/30"
                        transition={{
                          type: 'spring',
                          stiffness: 400,
                          damping: 30,
                        }}
                      />
                    )}
                    <span className="relative">
                      {t(`playground.nameEffects.tf_${tf}`)}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <SaveButton
          onClick={() => mutation.mutate(localNameEffect)}
          onReset={resetNameEffect}
          isPending={mutation.isPending}
          show={isDirty}
        />
      </div>

      <div className="hidden xl:block">
        <NamePreview effect={localNameEffect} />
      </div>
    </div>
  )
}
