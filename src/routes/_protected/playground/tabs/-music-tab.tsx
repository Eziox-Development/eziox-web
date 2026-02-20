import React from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'motion/react'
import {
  Music, Power, Volume2, Volume1, VolumeX,
  Radio, RefreshCw, Play, Repeat,
  Zap, Info,
} from 'lucide-react'
import { SiYoutube } from 'react-icons/si'
import { useMusicState } from '../-use-playground'
import { SaveButton } from '../-components'
import type { ProfileMusicSettings } from '../-types'

// ── Source detection ──
type MusicSource = 'youtube' | 'spotify' | 'direct' | 'none'

function detectSource(url: string): MusicSource {
  if (!url) return 'none'
  if (/youtube\.com|youtu\.be/.test(url)) return 'youtube'
  if (/spotify\.com/.test(url)) return 'spotify'
  return 'direct'
}

const SOURCE_META: Record<MusicSource, { label: string; icon: React.ElementType; color: string }> = {
  youtube:  { label: 'YouTube',       icon: SiYoutube, color: 'text-red-400' },
  spotify:  { label: 'Spotify',       icon: Radio,   color: 'text-green-400' },
  direct:   { label: 'Direct Audio',  icon: Music,   color: 'text-blue-400' },
  none:     { label: 'No source',     icon: Music,   color: 'text-white/20' },
}

// ── Equalizer bars animation ──
function EqBars({ active }: { active: boolean }) {
  return (
    <div className="flex items-end gap-[2px] h-4">
      {[0.6, 1, 0.75, 0.9, 0.5].map((h, i) => (
        <motion.div
          key={i}
          className="w-[3px] rounded-full bg-violet-400"
          animate={active ? { scaleY: [h, 1, h * 0.4, 1, h] } : { scaleY: 0.15 }}
          transition={active ? { duration: 0.8 + i * 0.1, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.3 }}
          style={{ originY: 1, height: '100%' }}
        />
      ))}
    </div>
  )
}

// ── Live Preview ──
function MusicPreview({ music }: { music: ProfileMusicSettings }) {
  const { t } = useTranslation()
  const source = detectSource(music.url)
  const meta = SOURCE_META[source]
  const vol = Math.round(music.volume * 100)

  return (
    <div className="sticky top-6 rounded-2xl overflow-hidden border border-white/6 shadow-2xl shadow-black/50 bg-[#0d0d0d]">
      {/* Browser chrome */}
      <div className="flex items-center gap-2 px-4 py-3 bg-white/3 border-b border-white/5">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
        </div>
        <div className="flex-1 mx-8 h-5 rounded-md bg-white/4 flex items-center justify-center">
          <span className="text-[9px] text-white/25 font-mono tracking-wider">eziox.link/@username</span>
        </div>
      </div>

      {/* Player mockup */}
      <div className="p-6 space-y-5 bg-[#0a0a0a]">
        {/* Source badge */}
        <div className="flex items-center gap-2">
          <meta.icon size={13} className={meta.color} />
          <span className={`text-[10px] font-semibold ${meta.color}`}>{meta.label}</span>
          {music.enabled && source !== 'none' && (
            <span className="ml-auto text-[9px] px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-400 font-semibold">
              {t('playground.music.active')}
            </span>
          )}
        </div>

        {/* Album art / waveform area */}
        <div className="rounded-xl bg-white/3 border border-white/6 h-28 flex items-center justify-center relative overflow-hidden">
          {music.enabled && source !== 'none' ? (
            <>
              <div className="absolute inset-0 bg-linear-to-br from-violet-500/10 to-purple-600/5" />
              <div className="relative flex flex-col items-center gap-3">
                <EqBars active={music.enabled} />
                <span className="text-[9px] text-white/30 font-mono max-w-[200px] truncate px-2 text-center">
                  {music.url || '—'}
                </span>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Music size={24} className="text-white/10" />
              <span className="text-[9px] text-white/20">{t('playground.music.noSource')}</span>
            </div>
          )}
        </div>

        {/* Controls row */}
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${music.enabled && source !== 'none' ? 'bg-violet-500' : 'bg-white/6'}`}>
            <Play size={12} className="text-white ml-0.5" />
          </div>
          <div className="flex-1 h-1 rounded-full bg-white/8 overflow-hidden">
            <div className="h-full w-1/3 rounded-full bg-violet-500/50" />
          </div>
          {music.loop && <Repeat size={12} className="text-violet-400" />}
        </div>

        {/* Volume */}
        <div className="flex items-center gap-2">
          {vol === 0 ? <VolumeX size={12} className="text-white/30 shrink-0" />
            : vol < 50 ? <Volume1 size={12} className="text-white/30 shrink-0" />
              : <Volume2 size={12} className="text-white/30 shrink-0" />}
          <div className="flex-1 h-1 rounded-full bg-white/8 overflow-hidden">
            <div className="h-full rounded-full bg-white/30 transition-all" style={{ width: `${vol}%` }} />
          </div>
          <span className="text-[9px] text-white/25 font-mono w-7 text-right">{vol}%</span>
        </div>

        {/* Flags */}
        <div className="flex gap-2">
          {music.autoplay && (
            <span className="flex items-center gap-1 text-[9px] px-2 py-1 rounded-lg bg-white/4 text-white/30">
              <Zap size={9} className="text-yellow-400" />{t('playground.music.autoplay')}
            </span>
          )}
          {music.loop && (
            <span className="flex items-center gap-1 text-[9px] px-2 py-1 rounded-lg bg-white/4 text-white/30">
              <RefreshCw size={9} className="text-blue-400" />{t('playground.music.loop')}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between px-4 py-2.5 bg-white/2 border-t border-white/5">
        <span className="text-[10px] text-white/25 font-mono">{t('playground.music.hiddenPlayer')}</span>
        <span className="text-[10px] text-white/25">{t('playground.bg.livePreviewHint')}</span>
      </div>
    </div>
  )
}

export function MusicTab() {
  const { t } = useTranslation()
  const { localMusic, setLocalMusic, isDirty, resetMusic, mutation } = useMusicState()

  const set = (patch: Partial<ProfileMusicSettings>) =>
    setLocalMusic({ ...localMusic, ...patch })

  const source = detectSource(localMusic.url)
  const meta = SOURCE_META[source]
  const vol = Math.round(localMusic.volume * 100)

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-8 items-start">
      <div className="space-y-6">

        {/* ── Enable Toggle ── */}
        <div className="rounded-2xl border border-white/6 bg-white/2 p-5">
          <button onClick={() => set({ enabled: !localMusic.enabled })}
            className="w-full flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${localMusic.enabled ? 'bg-linear-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/20' : 'bg-white/6'}`}>
              <Power size={18} className="text-white" />
            </div>
            <div className="text-left flex-1">
              <span className="text-sm font-semibold text-white/70">{t('playground.music.title')}</span>
              <p className="text-[10px] text-white/25 mt-0.5">{t('playground.music.description')}</p>
            </div>
            <div className={`w-11 h-6 rounded-full transition-all ${localMusic.enabled ? 'bg-violet-500' : 'bg-white/10'}`}>
              <motion.div className="w-5 h-5 rounded-full bg-white shadow-sm mt-0.5"
                animate={{ x: localMusic.enabled ? 22 : 2 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }} />
            </div>
          </button>
        </div>

        <AnimatePresence>
          {localMusic.enabled && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }} className="space-y-6">

              {/* ── URL Input ── */}
              <div className="rounded-2xl border border-white/6 bg-white/2 p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <Music size={14} className="text-white/40" />
                  <span className="text-xs font-semibold text-white/40 uppercase tracking-widest">{t('playground.music.audioUrl')}</span>
                  {/* Source badge */}
                  <AnimatePresence>
                    {source !== 'none' && (
                      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                        className={`ml-auto flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/5 border border-white/8`}>
                        <meta.icon size={10} className={meta.color} />
                        <span className={`text-[9px] font-semibold ${meta.color}`}>{meta.label}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <input
                  value={localMusic.url}
                  onChange={(e) => set({ url: e.target.value })}
                  placeholder={t('playground.music.audioPlaceholder')}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/4 border border-white/8 text-xs text-white/80 placeholder:text-white/20 focus:outline-none focus:border-violet-500/40 focus:bg-white/6 transition-all font-mono"
                />
                <p className="text-[10px] text-white/20 leading-relaxed">{t('playground.music.audioFormats')}</p>
              </div>

              {/* ── Volume ── */}
              <div className="rounded-2xl border border-white/6 bg-white/2 p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <Volume2 size={14} className="text-white/40" />
                  <span className="text-xs font-semibold text-white/40 uppercase tracking-widest">{t('playground.music.volume')}</span>
                  <span className="ml-auto text-xs font-mono text-white/40">{vol}%</span>
                </div>
                <div className="flex items-center gap-3">
                  <VolumeX size={14} className="text-white/20 shrink-0" />
                  <input type="range" min={0} max={100} value={vol}
                    onChange={(e) => set({ volume: Number(e.target.value) / 100 })}
                    className="flex-1 h-1.5 rounded-full appearance-none bg-white/10 accent-violet-500 cursor-pointer" />
                  <Volume2 size={14} className="text-white/20 shrink-0" />
                </div>
                {/* Volume bar visual */}
                <div className="h-1 rounded-full bg-white/6 overflow-hidden">
                  <motion.div className="h-full rounded-full bg-linear-to-r from-violet-500 to-purple-400"
                    animate={{ width: `${vol}%` }} transition={{ type: 'spring', stiffness: 300, damping: 30 }} />
                </div>
              </div>

              {/* ── Playback Settings ── */}
              <div className="rounded-2xl border border-white/6 bg-white/2 p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <Radio size={14} className="text-white/40" />
                  <span className="text-xs font-semibold text-white/40 uppercase tracking-widest">{t('playground.music.playback')}</span>
                </div>

                {/* Autoplay */}
                <button onClick={() => set({ autoplay: !localMusic.autoplay })}
                  className="w-full flex items-center gap-4 py-1">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${localMusic.autoplay ? 'bg-linear-to-br from-yellow-500 to-orange-500 shadow-lg shadow-yellow-500/20' : 'bg-white/6'}`}>
                    <Zap size={16} className="text-white" />
                  </div>
                  <div className="text-left flex-1">
                    <span className="text-sm font-semibold text-white/70">{t('playground.music.autoplay')}</span>
                    <p className="text-[10px] text-white/25 mt-0.5">{t('playground.music.autoplayDesc')}</p>
                  </div>
                  <div className={`w-11 h-6 rounded-full transition-all ${localMusic.autoplay ? 'bg-yellow-500' : 'bg-white/10'}`}>
                    <motion.div className="w-5 h-5 rounded-full bg-white shadow-sm mt-0.5"
                      animate={{ x: localMusic.autoplay ? 22 : 2 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }} />
                  </div>
                </button>

                <div className="h-px bg-white/5" />

                {/* Loop */}
                <button onClick={() => set({ loop: !localMusic.loop })}
                  className="w-full flex items-center gap-4 py-1">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${localMusic.loop ? 'bg-linear-to-br from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/20' : 'bg-white/6'}`}>
                    <RefreshCw size={16} className="text-white" />
                  </div>
                  <div className="text-left flex-1">
                    <span className="text-sm font-semibold text-white/70">{t('playground.music.loop')}</span>
                    <p className="text-[10px] text-white/25 mt-0.5">{t('playground.music.loopDesc')}</p>
                  </div>
                  <div className={`w-11 h-6 rounded-full transition-all ${localMusic.loop ? 'bg-blue-500' : 'bg-white/10'}`}>
                    <motion.div className="w-5 h-5 rounded-full bg-white shadow-sm mt-0.5"
                      animate={{ x: localMusic.loop ? 22 : 2 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }} />
                  </div>
                </button>
              </div>

              {/* ── Info hint ── */}
              <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-violet-500/5 border border-violet-500/15">
                <Info size={14} className="text-violet-400 mt-0.5 shrink-0" />
                <p className="text-[10px] text-white/35 leading-relaxed">{t('playground.music.noVisiblePlayer')}</p>
              </div>

            </motion.div>
          )}
        </AnimatePresence>

        <SaveButton onClick={() => mutation.mutate(localMusic)} onReset={resetMusic} isPending={mutation.isPending} show={isDirty} />
      </div>

      <div className="hidden xl:block">
        <MusicPreview music={localMusic} />
      </div>
    </div>
  )
}
