import type { LucideIcon } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { Link } from '@tanstack/react-router'
import { Save, Loader2, Crown, Lock, Check } from 'lucide-react'

// ─── Save Button ─────────────────────────────────────────────────────────────

export function SaveButton({
  onClick,
  onReset,
  isPending,
  show = true,
}: {
  onClick: () => void
  onReset?: () => void
  isPending: boolean
  show?: boolean
}) {
  const { t } = useTranslation()
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed bottom-6 left-1/2 z-50"
          style={{ translateX: '-50%' }}
          initial={{ opacity: 0, y: 24, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 420, damping: 32 }}
        >
          <div className="flex items-center gap-4 px-5 py-3 rounded-2xl bg-card border border-border shadow-2xl shadow-black/40 backdrop-blur-md">
            <span className="text-sm font-medium text-foreground whitespace-nowrap">{t('playground.unsavedChanges')}</span>
            {onReset && (
              <button
                onClick={onReset}
                className="text-sm text-foreground-muted hover:text-foreground transition-colors px-2 py-1 rounded-lg hover:bg-background-secondary"
              >
                {t('common.reset')}
              </button>
            )}
            <button
              onClick={onClick}
              disabled={isPending}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:brightness-110 transition-all disabled:opacity-60"
            >
              {isPending ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              {t('playground.saveChanges')}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ─── Toggle Switch ───────────────────────────────────────────────────────────

export function ToggleSwitch({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${
        enabled ? 'bg-primary' : 'bg-background-secondary border border-border'
      }`}
    >
      <motion.div
        className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm"
        animate={{ left: enabled ? 22 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </button>
  )
}

// ─── Section ─────────────────────────────────────────────────────────────────

export function Section({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-xl border border-border bg-card p-5 ${className}`}>{children}</div>
}

export function SectionHeader({ title, desc, icon: Icon, right }: { title: string; desc?: string; icon?: LucideIcon; right?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-5">
      <div className="flex items-start gap-3 min-w-0">
        {Icon && (
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
            <Icon size={16} className="text-primary" />
          </div>
        )}
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          {desc && <p className="text-xs text-foreground-muted mt-0.5">{desc}</p>}
        </div>
      </div>
      {right}
    </div>
  )
}

// ─── Toggle Row ──────────────────────────────────────────────────────────────

export function ToggleRow({ label, desc, enabled, onToggle }: { label: string; desc?: string; enabled: boolean; onToggle: () => void }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <div className="min-w-0">
        <div className="text-sm font-medium text-foreground">{label}</div>
        {desc && <div className="text-xs text-foreground-muted mt-0.5">{desc}</div>}
      </div>
      <ToggleSwitch enabled={enabled} onToggle={onToggle} />
    </div>
  )
}

// ─── Option Pill ─────────────────────────────────────────────────────────────

export function Pill({ active, onClick, children, disabled }: { active: boolean; onClick: () => void; children: React.ReactNode; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
        active ? 'bg-primary text-primary-foreground' : 'bg-background-secondary text-foreground-muted hover:text-foreground hover:bg-background-secondary/80'
      } ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  )
}

// ─── Selection Card ──────────────────────────────────────────────────────────

export function SelectionCard({ active, onClick, disabled, icon: Icon, label, desc, className = '' }: {
  active: boolean; onClick: () => void; disabled?: boolean; icon?: LucideIcon; label: string; desc?: string; className?: string
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`relative p-3.5 rounded-xl border text-left transition-all group ${
        active ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-primary/40'
      } ${disabled ? 'opacity-40 cursor-not-allowed' : ''} ${className}`}
    >
      {active && (
        <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
          <Check size={10} className="text-primary-foreground" />
        </div>
      )}
      {Icon && <Icon size={18} className={`mb-2 ${active ? 'text-primary' : 'text-foreground-muted group-hover:text-foreground'}`} />}
      <div className={`text-xs font-semibold ${active ? 'text-primary' : 'text-foreground'}`}>{label}</div>
      {desc && <div className="text-[10px] text-foreground-muted mt-0.5 leading-tight">{desc}</div>}
    </button>
  )
}

// ─── Color Picker ────────────────────────────────────────────────────────────

export function ColorPicker({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="w-8 h-8 rounded-lg cursor-pointer border border-border" />
        <span className="text-xs text-foreground-muted font-mono w-16">{value}</span>
      </div>
    </div>
  )
}

// ─── Slider ──────────────────────────────────────────────────────────────────

export function Slider({ label, value, min, max, step = 1, onChange, unit = '' }: {
  label: string; value: number; min: number; max: number; step?: number; onChange: (v: number) => void; unit?: string
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-foreground">{label}</span>
        <span className="text-xs text-foreground-muted font-mono">{value}{unit}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none bg-background-secondary accent-primary cursor-pointer"
      />
    </div>
  )
}

// ─── Text Input ──────────────────────────────────────────────────────────────

export function TextInput({ label, value, onChange, placeholder, type = 'text' }: {
  label?: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string
}) {
  return (
    <div className="space-y-1.5">
      {label && <label className="text-sm font-medium text-foreground">{label}</label>}
      <input
        type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full h-10 px-3 rounded-lg bg-background-secondary border border-border text-sm text-foreground placeholder:text-foreground-muted/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
      />
    </div>
  )
}

// ─── Textarea ────────────────────────────────────────────────────────────────

export function TextArea({ label, value, onChange, placeholder, rows = 4 }: {
  label?: string; value: string; onChange: (v: string) => void; placeholder?: string; rows?: number
}) {
  return (
    <div className="space-y-1.5">
      {label && <label className="text-sm font-medium text-foreground">{label}</label>}
      <textarea
        value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={rows}
        className="w-full px-3 py-2.5 rounded-lg bg-background-secondary border border-border text-sm text-foreground placeholder:text-foreground-muted/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all resize-none font-mono"
      />
    </div>
  )
}

// ─── Premium Gate ────────────────────────────────────────────────────────────

export function PremiumGate() {
  const { t } = useTranslation()
  return (
    <div className="rounded-xl border border-border bg-card p-10 text-center">
      <Lock size={40} className="mx-auto mb-3 text-foreground-muted" />
      <h3 className="text-lg font-semibold text-foreground mb-1">{t('playground.creatorOnly')}</h3>
      <p className="text-sm text-foreground-muted mb-5">{t('playground.upgradeToCreator')}</p>
      <Link to="/pricing" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm">
        <Crown size={16} />
        {t('playground.upgradePlan')}
      </Link>
    </div>
  )
}
