import { useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'motion/react'
import { toast } from 'sonner'
import {
  Palette,
  Layers,
  ImageIcon,
  Video,
  Sparkles,
  Lock,
  Upload,
  Loader2,
  Check,
  Trash2,
  Plus,
  RotateCcw,
  Zap,
} from 'lucide-react'
import { ANIMATED_PRESETS } from '@/components/backgrounds/AnimatedBackgrounds'
import { useBackgroundState, usePlaygroundPermissions } from '../-use-playground'
import {
  SaveButton,
  Pill,
  Slider,
  TextInput,
  ToggleSwitch,
} from '../-components'
import type { CustomBackground } from '../-types'

const BG_TYPES = [
  {
    id: 'solid',
    label: 'playground.bg.solid',
    icon: Palette,
    premium: false,
    color: 'from-violet-500 to-purple-600',
  },
  {
    id: 'gradient',
    label: 'playground.bg.gradient',
    icon: Layers,
    premium: false,
    color: 'from-pink-500 to-orange-500',
  },
  {
    id: 'image',
    label: 'playground.bg.image',
    icon: ImageIcon,
    premium: false,
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'video',
    label: 'playground.bg.video',
    icon: Video,
    premium: true,
    color: 'from-red-500 to-rose-600',
  },
  {
    id: 'animated',
    label: 'playground.bg.animated',
    icon: Sparkles,
    premium: true,
    color: 'from-emerald-500 to-teal-500',
  },
] as const

const ANIM_CATS = [
  { id: 'all', label: 'playground.bg.catAll' },
  { id: 'vtuber', label: 'playground.bg.catVtuber' },
  { id: 'gamer', label: 'playground.bg.catGamer' },
  { id: 'developer', label: 'playground.bg.catDeveloper' },
  { id: 'nature', label: 'playground.bg.catNature' },
  { id: 'abstract', label: 'playground.bg.catAbstract' },
] as const

const CG: Record<string, string> = {
  vtuber: 'from-pink-600 via-purple-600 to-indigo-600',
  gamer: 'from-green-600 via-cyan-600 to-blue-600',
  developer: 'from-emerald-600 via-teal-600 to-cyan-600',
  nature: 'from-green-600 via-emerald-500 to-teal-600',
  abstract: 'from-violet-600 via-fuchsia-600 to-pink-600',
}
const SOLIDS = [
  '#0a0a0a',
  '#0f0f0f',
  '#111827',
  '#0f172a',
  '#1a1a2e',
  '#7c3aed',
  '#2563eb',
  '#059669',
  '#dc2626',
  '#d97706',
  '#ec4899',
  '#06b6d4',
  '#ffffff',
  '#f8fafc',
  '#1e293b',
]
const GRADS = [
  { c: ['#7c3aed', '#ec4899'], a: 135 },
  { c: ['#06b6d4', '#3b82f6'], a: 135 },
  { c: ['#10b981', '#06b6d4'], a: 135 },
  { c: ['#f59e0b', '#ef4444'], a: 45 },
  { c: ['#8b5cf6', '#06b6d4', '#10b981'], a: 135 },
  { c: ['#1a1a2e', '#16213e', '#0f3460'], a: 180 },
  { c: ['#ff6b6b', '#feca57', '#48dbfb'], a: 135 },
  { c: ['#0f0c29', '#302b63', '#24243e'], a: 180 },
]

function LivePreview({ bg }: { bg: CustomBackground }) {
  const { t } = useTranslation()
  const bgStyle = useMemo((): React.CSSProperties => {
    switch (bg.type) {
      case 'solid':
        return { background: bg.value || '#0a0a0a' }
      case 'gradient':
        return {
          background: `linear-gradient(${bg.gradientAngle ?? 135}deg, ${(bg.gradientColors ?? ['#7c3aed', '#ec4899']).join(', ')})`,
        }
      case 'image':
        return bg.imageUrl
          ? {
              backgroundImage: `url(${bg.imageUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }
          : { background: '#111' }
      default:
        return { background: '#0a0a0a' }
    }
  }, [bg])
  const animCat =
    bg.type === 'animated'
      ? (ANIMATED_PRESETS.find((p) => p.id === bg.animatedPreset)?.category ??
        'abstract')
      : null

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
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
      </div>
      <div className="relative h-[460px] overflow-hidden">
        {bg.type === 'animated' && animCat ? (
          <div
            className={`absolute inset-0 bg-linear-to-br ${CG[animCat] ?? 'from-violet-600 to-fuchsia-600'}`}
          >
            <div
              className="absolute inset-0 opacity-[0.06]"
              style={{
                backgroundImage:
                  'radial-gradient(circle, white 1px, transparent 1px)',
                backgroundSize: '20px 20px',
              }}
            />
          </div>
        ) : bg.type === 'video' && bg.videoUrl ? (
          <video
            key={bg.videoUrl}
            src={bg.videoUrl}
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : bg.type === 'video' ? (
          <div className="absolute inset-0 bg-linear-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center">
            <Video size={32} className="text-white/15" />
          </div>
        ) : bg.type === 'image' ? (
          <div
            className="absolute inset-0"
            style={{
              ...bgStyle,
              opacity: (bg.imageOpacity ?? 100) / 100,
              filter: `blur(${bg.imageBlur ?? 0}px)`,
            }}
          />
        ) : (
          <div className="absolute inset-0" style={bgStyle} />
        )}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.35)_100%)]" />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 px-8">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-white/15 backdrop-blur-md border-2 border-white/25 flex items-center justify-center shadow-xl">
              <span className="text-3xl">👤</span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-green-400 border-2 border-black/50" />
          </div>
          <div className="text-center space-y-1.5">
            <div className="h-3.5 w-28 rounded-full bg-white/35 mx-auto" />
            <div className="h-2 w-20 rounded-full bg-white/20 mx-auto" />
          </div>
          <div className="w-full max-w-[220px] space-y-2">
            {[0.18, 0.14, 0.12, 0.1].map((op, i) => (
              <div
                key={i}
                className="h-9 rounded-xl backdrop-blur-sm border border-white/10 flex items-center px-3 gap-2"
                style={{ background: `rgba(255,255,255,${op})` }}
              >
                <div className="w-4 h-4 rounded-md bg-white/20" />
                <div className="h-2 rounded-full bg-white/30 flex-1" />
              </div>
            ))}
          </div>
        </div>
        {bg.type === 'animated' && bg.animatedPreset && (
          <div className="absolute top-3 right-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-sm border border-white/10">
              <Zap size={10} className="text-yellow-400" />
              <span className="text-[9px] text-white/80 font-medium">
                {ANIMATED_PRESETS.find((p) => p.id === bg.animatedPreset)?.name}
              </span>
            </div>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between px-4 py-2.5 bg-white/2 border-t border-white/5">
        <span className="text-[10px] text-white/25 font-mono">
          {t(`playground.bg.${bg.type}`)}
        </span>
        <span className="text-[10px] text-white/25">
          {t('playground.bg.livePreviewHint')}
        </span>
      </div>
    </div>
  )
}
export function BackgroundTab() {
  const { t } = useTranslation()
  const { isCreator } = usePlaygroundPermissions()
  const {
    localBackground,
    setLocalBackground,
    videoUploading,
    setVideoUploading,
    animatedCategory,
    setAnimatedCategory,
    isDirty,
    resetBackground,
    mutation,
    getUploadSignature,
  } = useBackgroundState()
  const fileRef = useRef<HTMLInputElement>(null)
  const bg = localBackground ?? { type: 'solid' as const, value: '#0a0a0a' }
  const set = (patch: Partial<CustomBackground>) =>
    setLocalBackground({ ...bg, ...patch } as CustomBackground)
  const filteredPresets = useMemo(
    () =>
      animatedCategory === 'all'
        ? ANIMATED_PRESETS
        : ANIMATED_PRESETS.filter((p) => p.category === animatedCategory),
    [animatedCategory],
  )
  const color = bg.value || '#0a0a0a'
  const gc = bg.gradientColors ?? ['#7c3aed', '#ec4899']
  const ga = bg.gradientAngle ?? 135

  const handleVideoUpload = async (file: File) => {
    if (file.size > 100 * 1024 * 1024) {
      toast.error(t('playground.bg.videoTooLarge'))
      return
    }
    setVideoUploading(true)
    try {
      const sig = await getUploadSignature({ data: { folder: 'backgrounds' } })
      const fd = new FormData()
      fd.append('file', file)
      fd.append('api_key', sig.apiKey)
      fd.append('timestamp', sig.timestamp.toString())
      fd.append('signature', sig.signature)
      fd.append('folder', sig.folder)
      fd.append('resource_type', 'video')
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${sig.cloudName}/video/upload`,
        { method: 'POST', body: fd },
      )
      const data = (await res.json()) as { secure_url?: string }
      if (data.secure_url) {
        set({
          type: 'video',
          value: data.secure_url,
          videoUrl: data.secure_url,
        })
        toast.success(t('playground.bg.videoUploaded'))
      }
    } catch {
      toast.error(t('playground.bg.uploadFailed'))
    } finally {
      setVideoUploading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-8 items-start">
      <div className="space-y-6">
        {/* ── Type selector tab bar ── */}
        <div className="flex gap-1.5 p-1.5 rounded-2xl bg-white/3 border border-white/6">
          {BG_TYPES.map((type) => {
            const locked = type.premium && !isCreator
            const active = bg.type === type.id
            const Icon = locked ? Lock : type.icon
            return (
              <button
                key={type.id}
                onClick={() =>
                  !locked && set({ type: type.id as CustomBackground['type'] })
                }
                disabled={locked}
                className={`relative flex-1 flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl transition-all duration-200 group ${active ? 'bg-white/8' : 'hover:bg-white/4'} ${locked ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                {active && (
                  <motion.div
                    layoutId="bg-type-glow"
                    className={`absolute inset-0 rounded-xl bg-linear-to-br ${type.color} opacity-[0.12]`}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <div
                  className={`relative w-9 h-9 rounded-xl flex items-center justify-center transition-all ${active ? `bg-linear-to-br ${type.color} shadow-lg` : 'bg-white/6 group-hover:bg-white/10'}`}
                >
                  <Icon size={16} className="text-white" />
                </div>
                <span
                  className={`relative text-[10px] font-semibold ${active ? 'text-white' : 'text-white/35 group-hover:text-white/55'}`}
                >
                  {t(type.label)}
                </span>
                {type.premium && (
                  <span className="absolute top-1.5 right-1.5 text-[7px] font-bold px-1 py-px rounded bg-amber-500/90 text-black leading-none">
                    PRO
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* ── Type-specific panels ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={bg.type}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="rounded-2xl border border-white/6 bg-white/2 p-5"
          >
            {/* ── Solid ── */}
            {bg.type === 'solid' && (
              <div className="space-y-6">
                <div
                  className="relative h-24 rounded-2xl overflow-hidden border border-white/8 cursor-pointer group"
                  style={{ background: color }}
                  onClick={() =>
                    document.getElementById('bg-color-pick')?.click()
                  }
                >
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="px-3 py-1.5 rounded-lg bg-black/50 backdrop-blur-sm text-xs text-white font-medium">
                      {t('playground.bg.clickToChange')}
                    </div>
                  </div>
                  <input
                    id="bg-color-pick"
                    type="color"
                    value={color}
                    onChange={(e) => set({ value: e.target.value })}
                    className="sr-only"
                  />
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/3 border border-white/6">
                  <div
                    className="w-8 h-8 rounded-lg border border-white/12 shrink-0"
                    style={{ background: color }}
                  />
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => set({ value: e.target.value })}
                    className="flex-1 bg-transparent text-sm font-mono text-white/80 focus:outline-none"
                    placeholder="#000000"
                  />
                  <button
                    onClick={() => set({ value: '#0a0a0a' })}
                    className="text-white/25 hover:text-white/60 transition-colors"
                  >
                    <RotateCcw size={13} />
                  </button>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-white/25 uppercase tracking-widest mb-3">
                    {t('playground.bg.presets')}
                  </p>
                  <div className="grid grid-cols-5 gap-2">
                    {SOLIDS.map((c) => (
                      <button
                        key={c}
                        onClick={() => set({ value: c })}
                        className={`h-10 rounded-xl border-2 transition-all hover:scale-105 ${color === c ? 'border-white/50 scale-105' : 'border-transparent hover:border-white/15'}`}
                        style={{ background: c }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── Gradient ── */}
            {bg.type === 'gradient' && (
              <div className="space-y-6">
                <div
                  className="h-20 rounded-2xl border border-white/8"
                  style={{
                    background: `linear-gradient(${ga}deg, ${gc.join(', ')})`,
                  }}
                />
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white/40 uppercase tracking-widest">
                      {t('playground.bg.angle')}
                    </span>
                    <span className="text-sm font-mono text-white/60">
                      {ga}°
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={360}
                    step={5}
                    value={ga}
                    onChange={(e) =>
                      set({ gradientAngle: Number(e.target.value) })
                    }
                    className="w-full h-1.5 rounded-full appearance-none bg-white/8 accent-violet-500 cursor-pointer"
                  />
                  <div className="grid grid-cols-8 gap-1">
                    {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
                      <button
                        key={a}
                        onClick={() => set({ gradientAngle: a })}
                        className={`py-1 rounded-lg text-[9px] font-mono transition-all ${ga === a ? 'bg-white/12 text-white' : 'bg-white/3 text-white/35 hover:bg-white/6'}`}
                      >
                        {a}°
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white/40 uppercase tracking-widest">
                      {t('playground.bg.colors')}
                    </span>
                    <button
                      onClick={() =>
                        set({ gradientColors: [...gc, '#06b6d4'] })
                      }
                      className="flex items-center gap-1 text-[10px] text-violet-400 hover:text-violet-300 font-medium"
                    >
                      <Plus size={11} />
                      {t('playground.bg.addColor')}
                    </button>
                  </div>
                  {gc.map((c, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-2.5 rounded-xl bg-white/3 border border-white/6"
                    >
                      <input
                        type="color"
                        value={c}
                        onChange={(e) => {
                          const n = [...gc]
                          n[i] = e.target.value
                          set({ gradientColors: n })
                        }}
                        className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent p-0 shrink-0"
                      />
                      <span className="text-xs font-mono text-white/40 flex-1">
                        {c}
                      </span>
                      <span className="text-[10px] text-white/20">
                        Stop {i + 1}
                      </span>
                      {gc.length > 2 && (
                        <button
                          onClick={() =>
                            set({
                              gradientColors: gc.filter((_, idx) => idx !== i),
                            })
                          }
                          className="text-white/15 hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-white/25 uppercase tracking-widest mb-3">
                    {t('playground.bg.presets')}
                  </p>
                  <div className="grid grid-cols-4 gap-2">
                    {GRADS.map((pg, i) => (
                      <button
                        key={i}
                        onClick={() =>
                          set({ gradientColors: pg.c, gradientAngle: pg.a })
                        }
                        className="h-12 rounded-xl border border-white/8 hover:border-white/25 hover:scale-105 transition-all"
                        style={{
                          background: `linear-gradient(${pg.a}deg, ${pg.c.join(', ')})`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── Image ── */}
            {bg.type === 'image' && (
              <div className="space-y-5">
                <TextInput
                  label={t('playground.bg.imageUrl')}
                  value={bg.imageUrl ?? ''}
                  onChange={(v) => set({ imageUrl: v, value: v })}
                  placeholder="https://..."
                />
                {bg.imageUrl && (
                  <div className="relative h-36 rounded-2xl overflow-hidden border border-white/8">
                    <img
                      src={bg.imageUrl}
                      alt=""
                      className="w-full h-full object-cover"
                      style={{
                        opacity: (bg.imageOpacity ?? 100) / 100,
                        filter: `blur(${bg.imageBlur ?? 0}px)`,
                      }}
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent flex items-end p-3">
                      <span className="text-[10px] text-white/50 font-medium">
                        {t('playground.bg.imagePreview')}
                      </span>
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-white/2 border border-white/6">
                  <Slider
                    label={t('playground.bg.opacity')}
                    value={bg.imageOpacity ?? 100}
                    min={0}
                    max={100}
                    onChange={(v) => set({ imageOpacity: v })}
                    unit="%"
                  />
                  <Slider
                    label={t('playground.bg.blur')}
                    value={bg.imageBlur ?? 0}
                    min={0}
                    max={20}
                    onChange={(v) => set({ imageBlur: v })}
                    unit="px"
                  />
                </div>
              </div>
            )}

            {/* ── Video ── */}
            {bg.type === 'video' && (
              <div className="space-y-5">
                {bg.videoUrl ? (
                  <div className="relative h-120 rounded-2xl overflow-hidden border border-white/8 group">
                    <video
                      key={bg.videoUrl}
                      src={bg.videoUrl}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <button
                        onClick={() => set({ videoUrl: '', value: '' })}
                        className="px-3 py-1.5 rounded-lg bg-red-500/80 backdrop-blur-sm text-xs text-white font-medium flex items-center gap-1.5"
                      >
                        <Trash2 size={12} />
                        {t('playground.bg.removeVideo')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="w-full h-120 rounded-2xl border-2 border-dashed border-white/10 hover:border-violet-500/40 hover:bg-violet-500/5 transition-all flex flex-col items-center justify-center gap-3 group"
                  >
                    {videoUploading ? (
                      <>
                        <Loader2
                          size={28}
                          className="animate-spin text-violet-400"
                        />
                        <span className="text-sm text-white/40">
                          {t('playground.bg.uploading')}
                        </span>
                      </>
                    ) : (
                      <>
                        <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/8 flex items-center justify-center group-hover:bg-violet-500/10 group-hover:border-violet-500/30 transition-all">
                          <Upload
                            size={20}
                            className="text-white/35 group-hover:text-violet-400 transition-colors"
                          />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium text-white/50 group-hover:text-white/70 transition-colors">
                            {t('playground.bg.uploadVideo')}
                          </p>
                          <p className="text-[10px] text-white/25 mt-0.5">
                            {t('playground.bg.videoFormats')}
                          </p>
                        </div>
                      </>
                    )}
                  </button>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0])
                      void handleVideoUpload(e.target.files[0])
                  }}
                />
                <TextInput
                  label={t('playground.bg.videoUrl')}
                  value={bg.videoUrl ?? ''}
                  onChange={(v) => set({ videoUrl: v, value: v })}
                  placeholder="https://..."
                />
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-white/3 border border-white/6">
                    <div>
                      <p className="text-sm font-medium text-white/70">
                        {t('playground.bg.loop')}
                      </p>
                      <p className="text-[10px] text-white/30 mt-0.5">
                        {t('playground.bg.loopDesc')}
                      </p>
                    </div>
                    <ToggleSwitch
                      enabled={bg.videoLoop ?? true}
                      onToggle={() =>
                        set({ videoLoop: !(bg.videoLoop ?? true) })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-white/3 border border-white/6">
                    <div>
                      <p className="text-sm font-medium text-white/70">
                        {t('playground.bg.muted')}
                      </p>
                      <p className="text-[10px] text-white/30 mt-0.5">
                        {t('playground.bg.mutedDesc')}
                      </p>
                    </div>
                    <ToggleSwitch
                      enabled={bg.videoMuted ?? true}
                      onToggle={() =>
                        set({ videoMuted: !(bg.videoMuted ?? true) })
                      }
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ── Animated ── */}
            {bg.type === 'animated' && (
              <div className="space-y-6">
                <div className="flex flex-wrap gap-1.5">
                  {ANIM_CATS.map((cat) => (
                    <Pill
                      key={cat.id}
                      active={animatedCategory === cat.id}
                      onClick={() => setAnimatedCategory(cat.id)}
                    >
                      {t(cat.label)}
                    </Pill>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-2.5">
                  {filteredPresets.map((preset) => {
                    const isActive = bg.animatedPreset === preset.id
                    const gradClass =
                      CG[preset.category] ?? 'from-violet-600 to-fuchsia-600'
                    return (
                      <button
                        key={preset.id}
                        onClick={() =>
                          set({ animatedPreset: preset.id, value: preset.id })
                        }
                        className={`relative h-24 rounded-2xl overflow-hidden transition-all duration-200 ${isActive ? 'ring-2 ring-violet-500 ring-offset-2 ring-offset-black scale-[1.02]' : 'hover:scale-[1.02] hover:ring-1 hover:ring-white/20'}`}
                      >
                        <div
                          className={`absolute inset-0 bg-linear-to-br ${gradClass}`}
                        />
                        <div
                          className="absolute inset-0 opacity-[0.08]"
                          style={{
                            backgroundImage:
                              'radial-gradient(circle, white 1px, transparent 1px)',
                            backgroundSize: '14px 14px',
                          }}
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent" />
                        {isActive && (
                          <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-violet-500 flex items-center justify-center">
                            <Check size={10} className="text-white" />
                          </div>
                        )}
                        <div className="absolute bottom-0 inset-x-0 p-2">
                          <p className="text-[10px] font-semibold text-white leading-tight">
                            {preset.name}
                          </p>
                          <p className="text-[8px] text-white/50 leading-tight truncate">
                            {preset.description}
                          </p>
                        </div>
                      </button>
                    )
                  })}
                </div>
                <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-white/2 border border-white/6">
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-white/40 uppercase tracking-widest">
                      {t('playground.bg.speed')}
                    </span>
                    <div className="flex gap-1.5">
                      {(['slow', 'normal', 'fast'] as const).map((s) => (
                        <Pill
                          key={s}
                          active={(bg.animatedSpeed ?? 'normal') === s}
                          onClick={() => set({ animatedSpeed: s })}
                        >
                          {t(`playground.bg.speed_${s}`)}
                        </Pill>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-white/40 uppercase tracking-widest">
                      {t('playground.bg.intensity')}
                    </span>
                    <div className="flex gap-1.5">
                      {(['subtle', 'normal', 'intense'] as const).map((i) => (
                        <Pill
                          key={i}
                          active={(bg.animatedIntensity ?? 'normal') === i}
                          onClick={() => set({ animatedIntensity: i })}
                        >
                          {t(`playground.bg.intensity_${i}`)}
                        </Pill>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white/40 uppercase tracking-widest">
                      {t('playground.bg.customColors')}
                    </span>
                    <button
                      onClick={() =>
                        set({
                          animatedColors: [
                            ...(bg.animatedColors ?? []),
                            '#7c3aed',
                          ],
                        })
                      }
                      className="flex items-center gap-1 text-[10px] text-violet-400 hover:text-violet-300 font-medium"
                    >
                      <Plus size={11} />
                      {t('playground.bg.addColor')}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(bg.animatedColors ?? []).map((c, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-1.5 p-1.5 rounded-lg bg-white/3 border border-white/6"
                      >
                        <input
                          type="color"
                          value={c}
                          onChange={(e) => {
                            const cols = [...(bg.animatedColors ?? [])]
                            cols[i] = e.target.value
                            set({ animatedColors: cols })
                          }}
                          className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent p-0"
                        />
                        <span className="text-xs font-mono text-white/40 w-14">
                          {c}
                        </span>
                        <button
                          onClick={() =>
                            set({
                              animatedColors: (bg.animatedColors ?? []).filter(
                                (_, idx) => idx !== i,
                              ),
                            })
                          }
                          className="text-white/20 hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <SaveButton
          onClick={() => mutation.mutate(localBackground)}
          onReset={resetBackground}
          isPending={mutation.isPending}
          show={isDirty}
        />
      </div>

      <div className="hidden xl:block">
        <LivePreview bg={bg} />
      </div>
    </div>
  )
}
