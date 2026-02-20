import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'motion/react'
import {
  DoorOpen, Power, Type, Paintbrush, User, Check, MousePointerClick,
} from 'lucide-react'
import { useIntroGateState } from '../-use-playground'
import { SaveButton } from '../-components'
import type { IntroGateSettings } from '../-types'

const STYLES = [
  {
    id: 'minimal',
    bg: 'bg-[#0a0a0a]',
    overlay: '',
    label: 'Minimal',
    desc: 'Clean dark screen',
  },
  {
    id: 'blur',
    bg: 'bg-[#0a0a0a]',
    overlay: 'backdrop-blur-md bg-black/40',
    label: 'Blur',
    desc: 'Frosted glass effect',
  },
  {
    id: 'overlay',
    bg: 'bg-[#0a0a0a]',
    overlay: 'bg-black/70',
    label: 'Overlay',
    desc: 'Dark overlay',
  },
  {
    id: 'cinematic',
    bg: 'bg-gradient-to-br from-[#0a0a0a] via-[#1a0a2e] to-[#0a0a0a]',
    overlay: 'bg-gradient-to-t from-black/60 via-transparent to-black/60',
    label: 'Cinematic',
    desc: 'Dramatic gradient',
  },
] as const

// ── Live Preview ──
function IntroGatePreview({ gate }: { gate: IntroGateSettings }) {
  const { t } = useTranslation()
  const style = STYLES.find((s) => s.id === gate.style) ?? STYLES[0]

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

      {/* Gate preview */}
      <div className={`relative min-h-[300px] flex flex-col items-center justify-center p-8 ${style.bg}`}>
        {/* Overlay layer */}
        {style.overlay && (
          <div className={`absolute inset-0 ${style.overlay}`} />
        )}

        {/* Fake blurred background content */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-4 left-4 right-4 h-16 rounded-xl bg-white/10" />
          <div className="absolute top-24 left-8 right-8 h-8 rounded-lg bg-white/8" />
          <div className="absolute top-36 left-12 right-12 h-6 rounded-lg bg-white/6" />
          <div className="absolute bottom-8 left-8 right-8 h-10 rounded-xl bg-white/8" />
        </div>

        {/* Gate content */}
        <div className="relative z-10 flex flex-col items-center gap-4 text-center">
          {gate.showAvatar && (
            <div className="w-14 h-14 rounded-full bg-linear-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <User size={22} className="text-white" />
            </div>
          )}
          <div className="space-y-1.5">
            <p className="text-sm font-semibold text-white leading-snug max-w-[180px]">
              {gate.text || t('playground.introGate.welcomePlaceholder')}
            </p>
          </div>
          <button className="mt-1 px-5 py-2 rounded-full bg-white text-black text-[11px] font-bold shadow-lg flex items-center gap-1.5">
            <MousePointerClick size={11} />
            {gate.buttonText || 'Enter'}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between px-4 py-2.5 bg-white/2 border-t border-white/5">
        <span className="text-[10px] text-white/25 font-mono">{style.label}</span>
        <span className="text-[10px] text-white/25">{t('playground.bg.livePreviewHint')}</span>
      </div>
    </div>
  )
}

export function IntroGateTab() {
  const { t } = useTranslation()
  const { localIntroGate, setLocalIntroGate, isDirty, resetIntroGate, mutation } = useIntroGateState()

  const set = (patch: Partial<IntroGateSettings>) =>
    setLocalIntroGate({ ...localIntroGate, ...patch })

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-8 items-start">
      <div className="space-y-6">

        {/* ── Enable Toggle ── */}
        <div className="rounded-2xl border border-white/6 bg-white/2 p-5">
          <button onClick={() => set({ enabled: !localIntroGate.enabled })}
            className="w-full flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${localIntroGate.enabled ? 'bg-linear-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/20' : 'bg-white/6'}`}>
              <Power size={18} className="text-white" />
            </div>
            <div className="text-left flex-1">
              <span className="text-sm font-semibold text-white/70">{t('playground.introGate.title')}</span>
              <p className="text-[10px] text-white/25 mt-0.5">{t('playground.introGate.description')}</p>
            </div>
            <div className={`w-11 h-6 rounded-full transition-all ${localIntroGate.enabled ? 'bg-violet-500' : 'bg-white/10'}`}>
              <motion.div className="w-5 h-5 rounded-full bg-white shadow-sm mt-0.5"
                animate={{ x: localIntroGate.enabled ? 22 : 2 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }} />
            </div>
          </button>
        </div>

        <AnimatePresence>
          {localIntroGate.enabled && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }} className="space-y-6">

              {/* ── Style ── */}
              <div className="rounded-2xl border border-white/6 bg-white/2 p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <Paintbrush size={14} className="text-white/40" />
                  <span className="text-xs font-semibold text-white/40 uppercase tracking-widest">{t('playground.introGate.style')}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {STYLES.map((s) => {
                    const active = localIntroGate.style === s.id
                    return (
                      <button key={s.id} onClick={() => set({ style: s.id })}
                        className={`relative rounded-xl overflow-hidden border transition-all ${active ? 'border-violet-500/40 ring-1 ring-violet-500/20' : 'border-white/6 hover:border-white/15'}`}>
                        {/* Mini preview */}
                        <div className={`h-16 ${s.bg} relative overflow-hidden`}>
                          {s.overlay && <div className={`absolute inset-0 ${s.overlay}`} />}
                          <div className="absolute inset-0 flex items-center justify-center z-10">
                            <div className="flex flex-col items-center gap-1">
                              <div className="w-5 h-5 rounded-full bg-white/20" />
                              <div className="w-12 h-1.5 rounded-full bg-white/30" />
                              <div className="w-8 h-4 rounded-full bg-white/20 mt-0.5" />
                            </div>
                          </div>
                          {active && (
                            <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-violet-500 flex items-center justify-center z-20">
                              <Check size={8} className="text-white" />
                            </div>
                          )}
                        </div>
                        <div className="px-3 py-2">
                          <span className={`text-[10px] font-semibold block ${active ? 'text-white' : 'text-white/50'}`}>{t(`playground.introGate.styles.${s.id}`)}</span>
                          <span className="text-[8px] text-white/20">{s.desc}</span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* ── Text Settings ── */}
              <div className="rounded-2xl border border-white/6 bg-white/2 p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <Type size={14} className="text-white/40" />
                  <span className="text-xs font-semibold text-white/40 uppercase tracking-widest">{t('playground.introGate.textSettings')}</span>
                </div>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold text-white/30 uppercase tracking-wider">{t('playground.introGate.welcomeText')}</label>
                    <input
                      value={localIntroGate.text}
                      onChange={(e) => set({ text: e.target.value })}
                      placeholder={t('playground.introGate.welcomePlaceholder')}
                      className="w-full px-3 py-2.5 rounded-xl bg-white/4 border border-white/8 text-sm text-white/80 placeholder:text-white/20 focus:outline-none focus:border-violet-500/40 focus:bg-white/6 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold text-white/30 uppercase tracking-wider">{t('playground.introGate.buttonText')}</label>
                    <input
                      value={localIntroGate.buttonText}
                      onChange={(e) => set({ buttonText: e.target.value })}
                      placeholder="Enter"
                      className="w-full px-3 py-2.5 rounded-xl bg-white/4 border border-white/8 text-sm text-white/80 placeholder:text-white/20 focus:outline-none focus:border-violet-500/40 focus:bg-white/6 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* ── Show Avatar ── */}
              <div className="rounded-2xl border border-white/6 bg-white/2 p-5">
                <button onClick={() => set({ showAvatar: !localIntroGate.showAvatar })}
                  className="w-full flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${localIntroGate.showAvatar ? 'bg-linear-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/20' : 'bg-white/6'}`}>
                    <User size={18} className="text-white" />
                  </div>
                  <div className="text-left flex-1">
                    <span className="text-sm font-semibold text-white/70">{t('playground.introGate.showAvatar')}</span>
                    <p className="text-[10px] text-white/25 mt-0.5">{t('playground.introGate.showAvatarDesc')}</p>
                  </div>
                  <div className={`w-11 h-6 rounded-full transition-all ${localIntroGate.showAvatar ? 'bg-violet-500' : 'bg-white/10'}`}>
                    <motion.div className="w-5 h-5 rounded-full bg-white shadow-sm mt-0.5"
                      animate={{ x: localIntroGate.showAvatar ? 22 : 2 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }} />
                  </div>
                </button>
              </div>

              {/* ── Info hint ── */}
              <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-violet-500/5 border border-violet-500/15">
                <DoorOpen size={14} className="text-violet-400 mt-0.5 shrink-0" />
                <p className="text-[10px] text-white/35 leading-relaxed">{t('playground.introGate.hint')}</p>
              </div>

            </motion.div>
          )}
        </AnimatePresence>

        <SaveButton onClick={() => mutation.mutate(localIntroGate)} onReset={resetIntroGate} isPending={mutation.isPending} show={isDirty} />
      </div>

      <div className="hidden xl:block">
        <IntroGatePreview gate={localIntroGate} />
      </div>
    </div>
  )
}
