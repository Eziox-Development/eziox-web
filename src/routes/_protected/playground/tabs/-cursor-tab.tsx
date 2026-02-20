import { useState, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'motion/react'
import {
  MousePointer2,
  Package,
  Monitor,
  Upload,
  Loader2,
  Power,
  Check,
  ExternalLink,
  Info,
  ImageIcon,
  Crosshair,
  Hand,
  Grid3x3,
  EyeOff,
  Mouse,
} from 'lucide-react'
import { toast } from 'sonner'
import { useCursorState } from '../-use-playground'
import { SaveButton } from '../-components'
import type { CustomCursor } from '../-types'
import { CURSOR_PACKS, CURSOR_CATEGORIES, isOverlayCursor } from '@/lib/cursor-packs'

const BROWSER_PRESETS = [
  { id: 'default', icon: Mouse },
  { id: 'crosshair', icon: Crosshair },
  { id: 'pointer', icon: Hand },
  { id: 'cell', icon: Grid3x3 },
  { id: 'none', icon: EyeOff },
] as const

const CURSOR_SOURCES = [
  {
    name: 'VSTHEMES',
    url: 'https://vsthemes.org/en/cursors/anime/',
  },
  { name: 'DeviantArt Cursors', url: 'https://www.deviantart.com/tag/cursors' },
  { name: 'Sweezy Cursors', url: 'https://sweezy-cursors.com/collection/anime/' },
  { name: 'Custom Cursor', url: 'https://custom-cursor.com/en/' },
  { name: 'Cursor 4U', url: 'https://www.cursors-4u.com/cursor/' },
  { name: 'Colorfulstage', url: 'https://colorfulstage.com/media/download/' },
]

// ── Live Preview ──
function CursorPreview({ cursor }: { cursor: CustomCursor }) {
  const { t } = useTranslation()

  const getCursorStyle = (): string => {
    if (!cursor.enabled) return 'default'
    if (cursor.type === 'browser') return cursor.browserPreset ?? 'default'
    if (cursor.type === 'pack') {
      const pack = CURSOR_PACKS.find((p) => p.id === cursor.packId)
      if (!pack) return 'default'
      // Overlay packs: use imageUrl as CSS cursor for preview
      if (isOverlayCursor(pack) && pack.imageUrl) return `url(${pack.imageUrl}) 0 0, auto`
      return pack.cursorUrl ? `url(${pack.cursorUrl}), auto` : 'default'
    }
    if (cursor.type === 'custom' && cursor.customUrl)
      return `url(${cursor.customUrl}), auto`
    return 'default'
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

      <div
        className="relative bg-[#0a0a0a] min-h-[280px] flex flex-col items-center justify-center p-6"
        style={{ cursor: getCursorStyle() }}
      >
        <MousePointer2 size={32} className="text-white/10 mb-4" />
        <p className="text-[11px] text-white/25 text-center">
          {t('playground.cursor.previewHint')}
        </p>

        <div className="mt-6 w-full max-w-[200px] space-y-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/8"
              style={{ cursor: getCursorStyle() }}
            >
              <div className="w-3.5 h-3.5 rounded bg-white/15 shrink-0" />
              <div className="h-2 rounded-full bg-white/15 flex-1" />
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between px-4 py-2.5 bg-white/2 border-t border-white/5">
        <span className="text-[10px] text-white/25 font-mono">
          {cursor.enabled
            ? cursor.type === 'pack'
              ? (CURSOR_PACKS.find((p) => p.id === cursor.packId)?.name ?? '—')
              : cursor.type === 'browser'
                ? (cursor.browserPreset ?? 'default')
                : 'custom'
            : t('playground.cursor.browserPresets.default')}
        </span>
        <span className="text-[10px] text-white/25">
          {t('playground.bg.livePreviewHint')}
        </span>
      </div>
    </div>
  )
}

export function CursorTab() {
  const { t } = useTranslation()
  const {
    localCursor,
    setLocalCursor,
    cursorUploading,
    setCursorUploading,
    isDirty,
    resetCursor,
    mutation,
    uploadCursor,
  } = useCursorState()
  const [packCategory, setPackCategory] =
    useState<(typeof CURSOR_CATEGORIES)[number]>('all')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const set = (patch: Partial<CustomCursor>) =>
    setLocalCursor({ ...localCursor, ...patch })

  const filteredPacks =
    packCategory === 'all'
      ? CURSOR_PACKS
      : CURSOR_PACKS.filter((p) => p.category === packCategory)

  const handleFileUpload = useCallback(
    async (file: File) => {
      if (file.size > 512 * 1024) {
        toast.error(t('playground.cursor.fileTooLarge'))
        return
      }
      setCursorUploading(true)
      try {
        const reader = new FileReader()
        reader.onload = async () => {
          try {
            const result = await uploadCursor({
              data: {
                file: reader.result as string,
                filename: file.name,
                mimeType: file.type || 'application/octet-stream',
              },
            })
            if (result.success && result.url) {
              set({ customUrl: result.url, type: 'custom' })
              toast.success(t('playground.cursor.uploadSuccess'))
            }
          } catch {
            toast.error(t('playground.cursor.uploadFailed'))
          } finally {
            setCursorUploading(false)
          }
        }
        reader.readAsDataURL(file)
      } catch {
        setCursorUploading(false)
        toast.error(t('playground.cursor.uploadFailed'))
      }
    },
    [uploadCursor, setCursorUploading, set, t],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const file = e.dataTransfer.files[0]
      if (file) void handleFileUpload(file)
    },
    [handleFileUpload],
  )

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-8 items-start">
      <div className="space-y-6">
        {/* ── Enable Toggle ── */}
        <div className="rounded-2xl border border-white/6 bg-white/2 p-5">
          <button
            onClick={() => set({ enabled: !localCursor.enabled })}
            className="w-full flex items-center gap-4"
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${localCursor.enabled ? 'bg-linear-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/20' : 'bg-white/6'}`}
            >
              <Power size={18} className="text-white" />
            </div>
            <div className="text-left flex-1">
              <span className="text-sm font-semibold text-white/70">
                {t('playground.cursor.title')}
              </span>
              <p className="text-[10px] text-white/25 mt-0.5">
                {t('playground.cursor.desc')}
              </p>
            </div>
            <div
              className={`w-11 h-6 rounded-full transition-all ${localCursor.enabled ? 'bg-violet-500' : 'bg-white/10'}`}
            >
              <motion.div
                className="w-5 h-5 rounded-full bg-white shadow-sm mt-0.5"
                animate={{ x: localCursor.enabled ? 22 : 2 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            </div>
          </button>
        </div>

        <AnimatePresence>
          {localCursor.enabled && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* ── Cursor Type ── */}
              <div className="rounded-2xl border border-white/6 bg-white/2 p-5 space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <MousePointer2 size={14} className="text-white/40" />
                  <span className="text-xs font-semibold text-white/40 uppercase tracking-widest">
                    {t('playground.cursor.type')}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      {
                        id: 'pack',
                        icon: Package,
                        color: 'from-violet-500 to-purple-500',
                      },
                      {
                        id: 'browser',
                        icon: Monitor,
                        color: 'from-blue-500 to-cyan-500',
                      },
                      {
                        id: 'custom',
                        icon: Upload,
                        color: 'from-pink-500 to-rose-500',
                      },
                    ] as const
                  ).map((ct) => {
                    const active = localCursor.type === ct.id
                    return (
                      <button
                        key={ct.id}
                        onClick={() => set({ type: ct.id })}
                        className={`relative flex flex-col items-center gap-2 py-3.5 px-2 rounded-xl transition-all duration-200 group ${active ? 'bg-white/8' : 'hover:bg-white/4'}`}
                      >
                        {active && (
                          <motion.div
                            layoutId="cursor-type"
                            className={`absolute inset-0 rounded-xl bg-linear-to-br ${ct.color} opacity-[0.12]`}
                            transition={{
                              type: 'spring',
                              stiffness: 400,
                              damping: 30,
                            }}
                          />
                        )}
                        <div
                          className={`relative w-9 h-9 rounded-xl flex items-center justify-center transition-all ${active ? `bg-linear-to-br ${ct.color} shadow-lg` : 'bg-white/6 group-hover:bg-white/10'}`}
                        >
                          <ct.icon size={16} className="text-white" />
                        </div>
                        <span
                          className={`relative text-[10px] font-semibold ${active ? 'text-white' : 'text-white/35'}`}
                        >
                          {t(`playground.cursor.type_${ct.id}`)}
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

              {/* ── Pack Selection ── */}
              <AnimatePresence>
                {localCursor.type === 'pack' && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="rounded-2xl border border-white/6 bg-white/2 p-5 space-y-4"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Package size={14} className="text-white/40" />
                      <span className="text-xs font-semibold text-white/40 uppercase tracking-widest">
                        {t('playground.cursor.selectPack')}
                      </span>
                    </div>
                    {/* Category filter */}
                    <div className="flex flex-wrap gap-1.5">
                      {CURSOR_CATEGORIES.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setPackCategory(cat)}
                          className={`px-3 py-1 rounded-lg text-[10px] font-semibold transition-all ${packCategory === cat ? 'bg-violet-500/20 text-violet-300 ring-1 ring-violet-500/30' : 'bg-white/3 text-white/30 hover:bg-white/6'}`}
                        >
                          {t(`playground.cursor.cat_${cat}`)}
                        </button>
                      ))}
                    </div>
                    {/* Pack grid */}
                    <div className="grid grid-cols-2 gap-3">
                      {filteredPacks.map((pack) => {
                        const active = localCursor.packId === pack.id
                        const previewSrc = pack.imageUrl
                        const showAsImage = !!previewSrc
                        return (
                          <button
                            key={pack.id}
                            onClick={() => set({ packId: pack.id })}
                            className={`relative rounded-xl overflow-hidden border transition-all group ${active ? 'border-violet-500/40 ring-1 ring-violet-500/20 bg-violet-500/5' : 'border-white/6 hover:border-white/15 bg-white/2'}`}
                          >
                            {/* Preview area */}
                            <div className="h-20 bg-[#0a0a0a] flex items-center justify-center overflow-hidden relative">
                              {showAsImage ? (
                                <img
                                  src={previewSrc!}
                                  alt={pack.name}
                                  className="w-full h-full object-contain p-2"
                                  loading="lazy"
                                />
                              ) : (
                                <div className="flex flex-col items-center gap-1">
                                  <ImageIcon
                                    size={20}
                                    className="text-white/15"
                                  />
                                  <span className="text-[8px] text-white/15">
                                    .cur
                                  </span>
                                </div>
                              )}
                              {active && (
                                <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-violet-500 flex items-center justify-center shadow-lg">
                                  <Check size={10} className="text-white" />
                                </div>
                              )}
                            </div>
                            {/* Info */}
                            <div className="px-3 py-2">
                              <span
                                className={`text-[10px] font-semibold block ${active ? 'text-white' : 'text-white/50'}`}
                              >
                                {pack.name}
                              </span>
                              <span className="text-[8px] text-white/20 uppercase tracking-wider">
                                {pack.category}
                              </span>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── Browser Presets ── */}
              <AnimatePresence>
                {localCursor.type === 'browser' && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="rounded-2xl border border-white/6 bg-white/2 p-5 space-y-4"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Monitor size={14} className="text-white/40" />
                      <span className="text-xs font-semibold text-white/40 uppercase tracking-widest">
                        {t('playground.cursor.browserPreset')}
                      </span>
                    </div>
                    <div className="grid grid-cols-5 gap-2">
                      {BROWSER_PRESETS.map((preset) => {
                        const active =
                          (localCursor.browserPreset ?? 'default') === preset.id
                        return (
                          <button
                            key={preset.id}
                            onClick={() =>
                              set({
                                browserPreset:
                                  preset.id as CustomCursor['browserPreset'],
                              })
                            }
                            className={`relative flex flex-col items-center gap-2 py-3 rounded-xl transition-all ${active ? 'bg-white/8 ring-1 ring-white/20' : 'bg-white/2 hover:bg-white/5'}`}
                            style={{ cursor: preset.id }}
                          >
                            <preset.icon size={18} className={active ? 'text-white' : 'text-white/30'} />
                            <span
                              className={`text-[9px] font-semibold ${active ? 'text-white' : 'text-white/30'}`}
                            >
                              {t(`playground.cursor.browserPresets.${preset.id}`)}
                            </span>
                            {active && (
                              <div className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-blue-500 flex items-center justify-center">
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

              {/* ── Custom Upload ── */}
              <AnimatePresence>
                {localCursor.type === 'custom' && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="rounded-2xl border border-white/6 bg-white/2 p-5 space-y-4"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Upload size={14} className="text-white/40" />
                      <span className="text-xs font-semibold text-white/40 uppercase tracking-widest">
                        {t('playground.cursor.uploadTitle')}
                      </span>
                    </div>
                    {/* Drop zone */}
                    <div
                      onDrop={handleDrop}
                      onDragOver={(e) => e.preventDefault()}
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-white/10 hover:border-violet-500/30 rounded-xl p-6 flex flex-col items-center gap-3 cursor-pointer transition-all hover:bg-violet-500/3"
                    >
                      {cursorUploading ? (
                        <Loader2
                          size={24}
                          className="text-violet-400 animate-spin"
                        />
                      ) : (
                        <Upload size={24} className="text-white/20" />
                      )}
                      <div className="text-center">
                        <p className="text-xs text-white/40 font-medium">
                          {t('playground.cursor.uploadLabel')}
                        </p>
                        <p className="text-[10px] text-white/20 mt-1">
                          {t('playground.cursor.uploadDesc')}
                        </p>
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".cur,.ani,.gif,.png,.jpg,.jpeg,.webp"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0]
                          if (f) void handleFileUpload(f)
                        }}
                      />
                    </div>
                    {/* Current custom URL preview */}
                    {localCursor.customUrl && (
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-white/3 border border-white/6">
                        <div className="w-10 h-10 rounded-lg bg-[#0a0a0a] flex items-center justify-center overflow-hidden shrink-0">
                          <img
                            src={localCursor.customUrl}
                            alt="cursor"
                            className="w-8 h-8 object-contain"
                            onError={(e) => {
                              ;(e.target as HTMLImageElement).style.display =
                                'none'
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] text-white/50 font-mono truncate">
                            {localCursor.customUrl}
                          </p>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── Cursor Sources / Hints ── */}
              <div className="rounded-2xl border border-white/6 bg-white/2 p-5 space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <Info size={14} className="text-white/40" />
                  <span className="text-xs font-semibold text-white/40 uppercase tracking-widest">
                    {t('playground.cursor.sourcesTitle')}
                  </span>
                </div>
                <p className="text-[10px] text-white/25 leading-relaxed">
                  {t('playground.cursor.sourcesDesc')}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {CURSOR_SOURCES.map((src) => (
                    <a
                      key={src.name}
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/3 border border-white/6 hover:border-violet-500/20 hover:bg-violet-500/3 transition-all group"
                    >
                      <ExternalLink
                        size={10}
                        className="text-white/20 group-hover:text-violet-400 transition-colors shrink-0"
                      />
                      <span className="text-[10px] text-white/40 group-hover:text-white/60 font-medium truncate">
                        {src.name}
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <SaveButton
          onClick={() => mutation.mutate(localCursor)}
          onReset={resetCursor}
          isPending={mutation.isPending}
          show={isDirty}
        />
      </div>

      <div className="hidden xl:block">
        <CursorPreview cursor={localCursor} />
      </div>
    </div>
  )
}
