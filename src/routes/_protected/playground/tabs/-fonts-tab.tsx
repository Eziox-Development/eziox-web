import { useRef, useMemo, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'motion/react'
import {
  Type,
  Upload,
  Trash2,
  ExternalLink,
  Loader2,
  Check,
  FileType2,
} from 'lucide-react'
import { useFontsState, usePlaygroundPermissions } from '../-use-playground'
import { PremiumGate } from '../-components'
import { PRESET_FONTS } from '../-types'

// Load @font-face for all preset fonts so preview text renders correctly
function usePresetFontLoader() {
  useEffect(() => {
    const id = 'preset-font-faces'
    if (document.getElementById(id)) return
    const style = document.createElement('style')
    style.id = id
    style.textContent = PRESET_FONTS.map((f) => {
      const ext = f.url.split('.').pop() ?? 'ttf'
      const fmt = ext === 'woff2' ? 'woff2' : ext === 'woff' ? 'woff' : ext === 'otf' ? 'opentype' : 'truetype'
      return `@font-face{font-family:'${f.name}';src:url('${f.url}') format('${fmt}');font-weight:100 900;font-display:swap;}`
    }).join('\n')
    document.head.appendChild(style)
    return () => { style.remove() }
  }, [])
}

const CATEGORIES = [
  'all',
  'sans',
  'display',
  'serif',
  'handwriting',
  'mono',
] as const

// ── Live Preview ──
function FontPreview({
  fonts,
}: {
  fonts?: { name: string; url: string; type: 'display' | 'body' }[]
}) {
  const { t } = useTranslation()
  const displayFont = fonts?.find((f) => f.type === 'display')
  const bodyFont = fonts?.find((f) => f.type === 'body')

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
      <div className="p-6 space-y-6 bg-[#0a0a0a]">
        {/* Display font preview */}
        <div className="space-y-2">
          <span className="text-[10px] font-semibold text-white/30 uppercase tracking-widest">
            {t('playground.fonts.display')}
          </span>
          <div className="p-4 rounded-xl bg-white/3 border border-white/6">
            <p
              className="text-2xl font-bold text-white/90 leading-tight"
              style={{ fontFamily: displayFont?.name }}
            >
              {displayFont?.name ?? 'System Default'}
            </p>
            <p
              className="text-sm text-white/40 mt-1"
              style={{ fontFamily: displayFont?.name }}
            >
              ABCDEFGHIJKLM 0123456789
            </p>
          </div>
        </div>
        {/* Body font preview */}
        <div className="space-y-2">
          <span className="text-[10px] font-semibold text-white/30 uppercase tracking-widest">
            {t('playground.fonts.body')}
          </span>
          <div className="p-4 rounded-xl bg-white/3 border border-white/6">
            <p
              className="text-sm text-white/70 leading-relaxed"
              style={{ fontFamily: bodyFont?.name }}
            >
              {bodyFont?.name ?? 'System Default'} — The quick brown fox jumps
              over the lazy dog. Pack my box with five dozen liquor jugs.
            </p>
          </div>
        </div>
        {/* Active fonts list */}
        <div className="space-y-2">
          <span className="text-[10px] font-semibold text-white/30 uppercase tracking-widest">
            {t('playground.fonts.current')}
          </span>
          {!fonts || fonts.length === 0 ? (
            <p className="text-xs text-white/20 italic">
              {t('playground.fonts.noFonts')}
            </p>
          ) : (
            <div className="space-y-1.5">
              {fonts.map((f) => (
                <div
                  key={f.name}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/3"
                >
                  <Type size={12} className="text-white/25 shrink-0" />
                  <span
                    className="text-xs text-white/60 flex-1 truncate"
                    style={{ fontFamily: f.name }}
                  >
                    {f.name}
                  </span>
                  <span className="text-[9px] text-white/25 uppercase">
                    {f.type}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between px-4 py-2.5 bg-white/2 border-t border-white/5">
        <span className="text-[10px] text-white/25 font-mono">
          {t('playground.fonts.presets')}
        </span>
        <span className="text-[10px] text-white/25">
          {t('playground.bg.livePreviewHint')}
        </span>
      </div>
    </div>
  )
}

export function FontsTab() {
  const { t } = useTranslation()
  const { isCreator } = usePlaygroundPermissions()
  usePresetFontLoader()
  const {
    customFonts,
    newFontName,
    setNewFontName,
    newFontUrl,
    setNewFontUrl,
    newFontType,
    setNewFontType,
    fontCategory,
    setFontCategory,
    fontUploading,
    setFontUploading,
    uploadedFileName,
    setUploadedFileName,
    fontMutation,
    removeFontMutation,
    uploadFont,
  } = useFontsState()
  const fileRef = useRef<HTMLInputElement>(null)

  if (!isCreator) return <PremiumGate />

  const filteredPresets = useMemo(
    () =>
      fontCategory === 'all'
        ? PRESET_FONTS
        : PRESET_FONTS.filter((f) => f.category === fontCategory),
    [fontCategory],
  )

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validTypes = ['.ttf', '.otf', '.woff', '.woff2']
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase()
    if (!validTypes.includes(ext)) {
      return
    }

    setFontUploading(true)
    try {
      const reader = new FileReader()
      reader.onload = async () => {
        const base64 = reader.result as string
        const name =
          newFontName || file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ')
        const result = await uploadFont({
          data: { fontName: name, fileName: file.name, fontData: base64 },
        })
        if (result.url) {
          setNewFontUrl(result.url)
          setUploadedFileName(file.name)
          if (!newFontName) setNewFontName(name)
        }
        setFontUploading(false)
      }
      reader.readAsDataURL(file)
    } catch {
      setFontUploading(false)
    }
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-8 items-start">
      <div className="space-y-6">
        {/* ── Active Fonts ── */}
        <AnimatePresence>
          {customFonts && customFonts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="rounded-2xl border border-white/6 bg-white/2 p-5 space-y-3"
            >
              <div className="flex items-center gap-2 mb-1">
                <Type size={14} className="text-white/40" />
                <span className="text-xs font-semibold text-white/40 uppercase tracking-widest">
                  {t('playground.fonts.current')}
                </span>
                <span className="ml-auto text-[10px] text-white/20">
                  {customFonts.length}/4
                </span>
              </div>
              <div className="space-y-2">
                {customFonts.map((font) => (
                  <motion.div
                    key={font.id}
                    layout
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 12 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/3 border border-white/6 group"
                  >
                    <div className="w-9 h-9 rounded-lg bg-linear-to-br from-violet-500/20 to-pink-500/20 flex items-center justify-center shrink-0">
                      <FileType2 size={16} className="text-violet-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div
                        className="text-sm font-medium text-white/80 truncate"
                        style={{ fontFamily: font.name }}
                      >
                        {font.name}
                      </div>
                      <div className="text-[10px] text-white/30">
                        {font.type === 'display'
                          ? t('playground.fonts.display')
                          : t('playground.fonts.body')}
                      </div>
                    </div>
                    <button
                      onClick={() => removeFontMutation.mutate(font.id)}
                      disabled={removeFontMutation.isPending}
                      className="p-1.5 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={14} />
                    </button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Upload Font ── */}
        <div className="rounded-2xl border border-white/6 bg-white/2 p-5 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <Upload size={14} className="text-white/40" />
            <span className="text-xs font-semibold text-white/40 uppercase tracking-widest">
              {t('playground.fonts.addFont')}
            </span>
          </div>

          <input
            ref={fileRef}
            type="file"
            accept=".ttf,.otf,.woff,.woff2"
            onChange={handleFileUpload}
            className="hidden"
          />

          {/* Drop zone */}
          <button
            onClick={() => fileRef.current?.click()}
            disabled={fontUploading}
            className="w-full h-28 rounded-xl border-2 border-dashed border-white/10 hover:border-violet-500/40 hover:bg-violet-500/5 transition-all flex flex-col items-center justify-center gap-2 group"
          >
            {fontUploading ? (
              <>
                <Loader2 size={24} className="animate-spin text-violet-400" />
                <span className="text-xs text-white/40">
                  {t('playground.bg.uploading')}
                </span>
              </>
            ) : uploadedFileName ? (
              <>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-violet-500/10">
                  <Check size={14} className="text-violet-400" />
                  <span className="text-xs text-violet-300 font-medium">
                    {uploadedFileName}
                  </span>
                </div>
                <span className="text-[10px] text-white/25">
                  {t('playground.bg.clickToChange')}
                </span>
              </>
            ) : (
              <>
                <Upload
                  size={24}
                  className="text-white/20 group-hover:text-violet-400 transition-colors"
                />
                <span className="text-xs text-white/30 group-hover:text-white/50 transition-colors">
                  .ttf .otf .woff .woff2
                </span>
              </>
            )}
          </button>

          {/* Font name + type */}
          <div className="grid grid-cols-[1fr_auto] gap-3">
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-white/30 uppercase tracking-wider">
                {t('playground.fonts.fontName')}
              </label>
              <input
                type="text"
                value={newFontName}
                onChange={(e) => setNewFontName(e.target.value)}
                placeholder="My Font..."
                className="w-full px-3 py-2 rounded-lg bg-white/4 border border-white/8 text-sm text-white/80 placeholder:text-white/20 focus:outline-none focus:border-violet-500/40 transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-white/30 uppercase tracking-wider">
                {t('playground.fonts.fontType')}
              </label>
              <div className="flex gap-1">
                {(['display', 'body'] as const).map((tp) => (
                  <button
                    key={tp}
                    onClick={() => setNewFontType(tp)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${newFontType === tp ? 'bg-violet-500/20 text-violet-300 ring-1 ring-violet-500/30' : 'bg-white/4 text-white/30 hover:bg-white/6'}`}
                  >
                    {t(`playground.fonts.${tp}`)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              if (newFontName && newFontUrl)
                fontMutation.mutate({
                  name: newFontName,
                  url: newFontUrl,
                  type: newFontType,
                })
            }}
            disabled={!newFontName || !newFontUrl || fontMutation.isPending}
            className="w-full py-2.5 rounded-xl bg-linear-to-r from-violet-600 to-purple-600 text-white text-sm font-semibold disabled:opacity-30 hover:brightness-110 transition-all flex items-center justify-center gap-2"
          >
            {fontMutation.isPending ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Upload size={14} />
            )}
            {t('playground.fonts.addFont')}
          </button>
        </div>

        {/* ── Preset Fonts ── */}
        <div className="rounded-2xl border border-white/6 bg-white/2 p-5 space-y-4">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Type size={14} className="text-white/40" />
              <span className="text-xs font-semibold text-white/40 uppercase tracking-widest">
                {t('playground.fonts.presets')}
              </span>
            </div>
            <a
              href="https://fonts.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[10px] text-white/25 hover:text-violet-400 transition-colors"
            >
              <ExternalLink size={10} />
              Google Fonts
            </a>
          </div>

          {/* Category pills */}
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setFontCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold uppercase tracking-wider transition-all ${fontCategory === cat ? 'bg-white/10 text-white ring-1 ring-white/20' : 'bg-white/3 text-white/30 hover:bg-white/6 hover:text-white/50'}`}
              >
                {t(`playground.fonts.cat_${cat}`)}
              </button>
            ))}
          </div>

          {/* Font grid */}
          <div className="grid grid-cols-2 gap-2.5">
            {filteredPresets.map((font) => {
              const isAdded = customFonts?.some((f) => f.name === font.name)
              return (
                <motion.div
                  key={font.name}
                  layout
                  className={`relative p-3.5 rounded-xl border transition-all ${isAdded ? 'border-violet-500/30 bg-violet-500/5' : 'border-white/6 bg-white/2 hover:border-white/12'}`}
                >
                  {isAdded && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-violet-500/20 flex items-center justify-center">
                      <Check size={10} className="text-violet-400" />
                    </div>
                  )}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold text-white/70">
                      {font.name}
                    </span>
                    <span className="text-[9px] text-white/20 uppercase ml-auto">
                      {font.category}
                    </span>
                  </div>
                  <p
                    className="text-[11px] text-white/35 mb-3 truncate leading-relaxed"
                    style={{ fontFamily: font.name }}
                  >
                    The quick brown fox jumps over the lazy dog
                  </p>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() =>
                        fontMutation.mutate({
                          name: font.name,
                          url: font.url,
                          type: 'display',
                        })
                      }
                      disabled={isAdded || fontMutation.isPending}
                      className="flex-1 py-1.5 rounded-lg text-[10px] font-semibold bg-violet-500/10 text-violet-400 hover:bg-violet-500/20 transition-colors disabled:opacity-30"
                    >
                      {t('playground.fonts.display')}
                    </button>
                    <button
                      onClick={() =>
                        fontMutation.mutate({
                          name: font.name,
                          url: font.url,
                          type: 'body',
                        })
                      }
                      disabled={isAdded || fontMutation.isPending}
                      className="flex-1 py-1.5 rounded-lg text-[10px] font-semibold bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 transition-colors disabled:opacity-30"
                    >
                      {t('playground.fonts.body')}
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="hidden xl:block">
        <FontPreview fonts={customFonts} />
      </div>
    </div>
  )
}
