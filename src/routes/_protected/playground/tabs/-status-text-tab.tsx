import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'motion/react'
import { Type, Palette, Plus, X, Power, Gauge, Smile } from 'lucide-react'
import { BsTypeH1 } from 'react-icons/bs'
import { FaKeyboard } from 'react-icons/fa6'
import EmojiPicker, { Theme, EmojiStyle } from 'emoji-picker-react'
import { useStatusTextState } from '../-use-playground'
import { SaveButton } from '../-components'
import type { StatusText } from '../-types'

// ── Live Preview ──
function StatusTextPreview({ status }: { status: StatusText }) {
  const [displayed, setDisplayed] = useState('')
  const [cursor, setCursor] = useState(true)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const cursorRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!status.enabled || !status.text) { setDisplayed(''); return }
    if (!status.typewriter) { setDisplayed(status.text); return }

    setDisplayed('')
    let i = 0
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      i++
      setDisplayed(status.text.slice(0, i))
      if (i >= status.text.length && intervalRef.current) clearInterval(intervalRef.current)
    }, status.typewriterSpeed ?? 60)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [status.text, status.typewriter, status.typewriterSpeed, status.enabled])

  useEffect(() => {
    cursorRef.current = setInterval(() => setCursor((c) => !c), 530)
    return () => { if (cursorRef.current) clearInterval(cursorRef.current) }
  }, [])

  const renderText = () => {
    if (!displayed) return null
    const words = displayed.split(' ')
    return words.map((word, wi) => {
      const match = (status.coloredWords ?? []).find(
        (cw) => cw.word && word.toLowerCase().includes(cw.word.toLowerCase())
      )
      return (
        <span key={wi} style={match ? { color: match.color } : undefined}>
          {word}{wi < words.length - 1 ? ' ' : ''}
        </span>
      )
    })
  }

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

      {/* Profile mockup */}
      <div className="p-6 bg-[#0a0a0a] space-y-4">
        {/* Avatar + name row */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-linear-to-br from-violet-500 to-purple-600 shrink-0" />
          <div className="space-y-1.5">
            <div className="h-3 w-24 rounded-full bg-white/20" />
            {/* Status text */}
            <div className="flex items-center gap-1.5 min-h-[18px]">
              {status.enabled && status.emoji && (
                <span className="text-sm leading-none">{status.emoji}</span>
              )}
              {status.enabled && status.text ? (
                <span className="text-[11px] text-white/60 leading-none">
                  {renderText()}
                  {status.typewriter && cursor && (
                    <span className="inline-block w-px h-[10px] bg-violet-400 ml-px align-middle" />
                  )}
                </span>
              ) : (
                <div className="h-2.5 w-32 rounded-full bg-white/8" />
              )}
            </div>
          </div>
        </div>

        {/* Colored words legend */}
        {status.enabled && (status.coloredWords ?? []).length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {(status.coloredWords ?? []).filter(cw => cw.word).map((cw, i) => (
              <span key={i} className="text-[9px] px-2 py-0.5 rounded-full bg-white/4 font-mono"
                style={{ color: cw.color }}>
                {cw.word}
              </span>
            ))}
          </div>
        )}

        {/* Skeleton links */}
        <div className="space-y-2 pt-1">
          {[80, 65, 72].map((w, i) => (
            <div key={i} className="h-8 rounded-xl bg-white/4" style={{ width: `${w}%` }} />
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between px-4 py-2.5 bg-white/2 border-t border-white/5">
        <span className="text-[10px] text-white/25 font-mono">
          {status.typewriter ? `${status.typewriterSpeed ?? 60}ms / char` : 'static'}
        </span>
        <span className="text-[10px] text-white/25">{status.enabled ? 'enabled' : 'disabled'}</span>
      </div>
    </div>
  )
}

export function StatusTextTab() {
  const { t } = useTranslation()
  const { localStatusText, setLocalStatusText, isDirty, resetStatusText, mutation } = useStatusTextState()
  const [emojiOpen, setEmojiOpen] = useState(false)
  const emojiRef = useRef<HTMLDivElement>(null)

  const set = (patch: Partial<StatusText>) =>
    setLocalStatusText({ ...localStatusText, ...patch })

  // Close emoji picker on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) {
        setEmojiOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const addColoredWord = () => {
    const words = [...(localStatusText.coloredWords ?? [])]
    words.push({ word: '', color: '#8b5cf6' })
    set({ coloredWords: words })
  }

  const updateColoredWord = (i: number, patch: { word?: string; color?: string }) => {
    const words = [...(localStatusText.coloredWords ?? [])]
    const existing = words[i] ?? { word: '', color: '#8b5cf6' }
    words[i] = { word: patch.word ?? existing.word, color: patch.color ?? existing.color }
    set({ coloredWords: words })
  }

  const removeColoredWord = (i: number) => {
    const words = [...(localStatusText.coloredWords ?? [])]
    words.splice(i, 1)
    set({ coloredWords: words })
  }

  const speed = localStatusText.typewriterSpeed ?? 60

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-8 items-start">
      <div className="space-y-6">

        {/* ── Enable Toggle ── */}
        <div className="rounded-2xl border border-white/6 bg-white/2 p-5">
          <button onClick={() => set({ enabled: !localStatusText.enabled })}
            className="w-full flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${localStatusText.enabled ? 'bg-linear-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/20' : 'bg-white/6'}`}>
              <Power size={18} className="text-white" />
            </div>
            <div className="text-left flex-1">
              <span className="text-sm font-semibold text-white/70">{t('playground.statusText.title')}</span>
              <p className="text-[10px] text-white/25 mt-0.5">{t('playground.statusText.desc')}</p>
            </div>
            <div className={`w-11 h-6 rounded-full transition-all ${localStatusText.enabled ? 'bg-violet-500' : 'bg-white/10'}`}>
              <motion.div className="w-5 h-5 rounded-full bg-white shadow-sm mt-0.5"
                animate={{ x: localStatusText.enabled ? 22 : 2 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }} />
            </div>
          </button>
        </div>

        <AnimatePresence>
          {localStatusText.enabled && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }} className="space-y-6">

              {/* ── Content ── */}
              <div className="rounded-2xl border border-white/6 bg-white/2 p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <Type size={14} className="text-white/40" />
                  <span className="text-xs font-semibold text-white/40 uppercase tracking-widest">{t('playground.statusText.content')}</span>
                </div>

                {/* Text input */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-white/30 uppercase tracking-wider flex items-center gap-1.5">
                    <BsTypeH1 className="text-white/25" size={12} />
                    {t('playground.statusText.text')}
                  </label>
                  <input
                    value={localStatusText.text}
                    onChange={(e) => set({ text: e.target.value })}
                    placeholder={t('playground.statusText.textPlaceholder')}
                    className="w-full px-3 py-2.5 rounded-xl bg-white/4 border border-white/8 text-sm text-white/80 placeholder:text-white/20 focus:outline-none focus:border-violet-500/40 focus:bg-white/6 transition-all"
                  />
                </div>

                {/* Emoji picker */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-white/30 uppercase tracking-wider flex items-center gap-1.5">
                    <Smile size={12} className="text-white/25" />
                    {t('playground.statusText.emoji')}
                  </label>
                  <div className="relative flex items-center gap-2" ref={emojiRef}>
                    <button
                      onClick={() => setEmojiOpen((o) => !o)}
                      className={`w-10 h-10 rounded-xl border text-xl flex items-center justify-center transition-all ${emojiOpen ? 'border-violet-500/40 bg-violet-500/10' : 'border-white/8 bg-white/4 hover:border-white/15'}`}
                    >
                      {localStatusText.emoji || '😊'}
                    </button>
                    <input
                      value={localStatusText.emoji ?? ''}
                      onChange={(e) => set({ emoji: e.target.value })}
                      placeholder={t('playground.statusText.emojiPlaceholder')}
                      className="flex-1 px-3 py-2.5 rounded-xl bg-white/4 border border-white/8 text-sm text-white/80 placeholder:text-white/20 focus:outline-none focus:border-violet-500/40 focus:bg-white/6 transition-all"
                    />
                    {localStatusText.emoji && (
                      <button onClick={() => set({ emoji: '' })}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all">
                        <X size={14} />
                      </button>
                    )}
                    {/* Emoji picker dropdown */}
                    <AnimatePresence>
                      {emojiOpen && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -8 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -8 }}
                          transition={{ duration: 0.15 }}
                          className="absolute z-50 mt-1 top-full left-0"
                          style={{ position: 'absolute', top: '100%', left: 0, marginTop: 4 }}
                        >
                          <EmojiPicker
                            theme={Theme.DARK}
                            emojiStyle={EmojiStyle.NATIVE}
                            onEmojiClick={(emojiData) => {
                              set({ emoji: emojiData.emoji })
                              setEmojiOpen(false)
                            }}
                            width={320}
                            height={380}
                            searchPlaceholder={t('playground.statusText.emojiSearch')}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              {/* ── Typewriter ── */}
              <div className="rounded-2xl border border-white/6 bg-white/2 p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <FaKeyboard size={13} className="text-white/40" />
                  <span className="text-xs font-semibold text-white/40 uppercase tracking-widest">{t('playground.statusText.typewriter')}</span>
                </div>

                {/* Typewriter toggle */}
                <button onClick={() => set({ typewriter: !localStatusText.typewriter })}
                  className="w-full flex items-center gap-4">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${localStatusText.typewriter ? 'bg-linear-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/20' : 'bg-white/6'}`}>
                    <FaKeyboard size={15} className="text-white" />
                  </div>
                  <div className="text-left flex-1">
                    <span className="text-sm font-semibold text-white/70">{t('playground.statusText.typewriterEnable')}</span>
                    <p className="text-[10px] text-white/25 mt-0.5">{t('playground.statusText.typewriterDesc')}</p>
                  </div>
                  <div className={`w-11 h-6 rounded-full transition-all ${localStatusText.typewriter ? 'bg-violet-500' : 'bg-white/10'}`}>
                    <motion.div className="w-5 h-5 rounded-full bg-white shadow-sm mt-0.5"
                      animate={{ x: localStatusText.typewriter ? 22 : 2 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }} />
                  </div>
                </button>

                {/* Speed slider */}
                <AnimatePresence>
                  {localStatusText.typewriter && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                      <div className="pt-2 space-y-3">
                        <div className="flex items-center gap-2">
                          <Gauge size={13} className="text-white/40" />
                          <span className="text-[10px] font-semibold text-white/30 uppercase tracking-wider">{t('playground.statusText.typewriterSpeed')}</span>
                          <span className="ml-auto text-xs font-mono text-white/40">{speed}ms</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[9px] text-white/20 w-8 text-right">Fast</span>
                          <input type="range" min={20} max={200} value={speed}
                            onChange={(e) => set({ typewriterSpeed: Number(e.target.value) })}
                            className="flex-1 h-1.5 rounded-full appearance-none bg-white/10 accent-violet-500 cursor-pointer" />
                          <span className="text-[9px] text-white/20 w-8">Slow</span>
                        </div>
                        <div className="h-1 rounded-full bg-white/6 overflow-hidden">
                          <motion.div className="h-full rounded-full bg-linear-to-r from-violet-500 to-purple-400"
                            animate={{ width: `${((speed - 20) / 180) * 100}%` }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }} />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* ── Colored Words ── */}
              <div className="rounded-2xl border border-white/6 bg-white/2 p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <Palette size={14} className="text-white/40" />
                  <span className="text-xs font-semibold text-white/40 uppercase tracking-widest">{t('playground.statusText.coloredWords')}</span>
                  <span className="ml-auto text-[9px] text-white/20">{t('playground.statusText.coloredWordsDesc')}</span>
                </div>

                <div className="space-y-2">
                  {(localStatusText.coloredWords ?? []).map((cw, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-2">
                      <input
                        type="text"
                        value={cw.word}
                        onChange={(e) => updateColoredWord(i, { word: e.target.value })}
                        placeholder={t('playground.statusText.wordPlaceholder')}
                        className="flex-1 px-3 py-2 rounded-xl bg-white/4 border border-white/8 text-sm text-white/80 placeholder:text-white/20 focus:outline-none focus:border-violet-500/40 transition-all"
                      />
                      {/* Color swatch + native picker */}
                      <label className="relative w-9 h-9 rounded-xl border border-white/8 overflow-hidden cursor-pointer shrink-0 hover:border-white/20 transition-all"
                        style={{ backgroundColor: cw.color }}>
                        <input type="color" value={cw.color}
                          onChange={(e) => updateColoredWord(i, { color: e.target.value })}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                      </label>
                      <button onClick={() => removeColoredWord(i)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white/25 hover:text-red-400 hover:bg-red-500/10 transition-all shrink-0">
                        <X size={13} />
                      </button>
                    </motion.div>
                  ))}

                  <button onClick={addColoredWord}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed border-white/10 text-xs font-semibold text-white/30 hover:border-violet-500/30 hover:text-violet-400 hover:bg-violet-500/5 transition-all w-full justify-center">
                    <Plus size={13} />
                    {t('playground.statusText.addWord')}
                  </button>
                </div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>

        <SaveButton onClick={() => mutation.mutate(localStatusText)} onReset={resetStatusText} isPending={mutation.isPending} show={isDirty} />
      </div>

      <div className="hidden xl:block">
        <StatusTextPreview status={localStatusText} />
      </div>
    </div>
  )
}
