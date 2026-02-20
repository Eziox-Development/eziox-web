import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'motion/react'
import {
  Code2,
  Copy,
  Check,
  Lightbulb,
  BookOpen,
  Sparkles,
  ChevronDown,
  AlertTriangle,
  Palette,
} from 'lucide-react'
import { useCSSState, usePlaygroundPermissions } from '../-use-playground'
import { SaveButton, PremiumGate } from '../-components'

const CSS_EXAMPLES = [
  {
    id: 'glow-links',
    title: 'Glow Links',
    desc: 'Add a neon glow effect on hover',
    css: `.link-card:hover {\n  box-shadow: 0 0 20px var(--primary),\n             0 0 40px var(--primary-alpha);\n  transform: translateY(-2px);\n}`,
  },
  {
    id: 'glass-profile',
    title: 'Glass Profile Card',
    desc: 'Frosted glass effect on the profile section',
    css: `.profile-section {\n  background: rgba(255, 255, 255, 0.05);\n  backdrop-filter: blur(20px);\n  border: 1px solid rgba(255, 255, 255, 0.1);\n  border-radius: 24px;\n  padding: 2rem;\n}`,
  },
  {
    id: 'gradient-text',
    title: 'Gradient Username',
    desc: 'Rainbow gradient on your display name',
    css: `.profile-name {\n  background: linear-gradient(135deg, #f97316, #ec4899, #8b5cf6);\n  -webkit-background-clip: text;\n  -webkit-text-fill-color: transparent;\n  background-clip: text;\n}`,
  },
  {
    id: 'animated-border',
    title: 'Animated Border',
    desc: 'Rotating gradient border on link cards',
    css: `.link-card {\n  border: 2px solid transparent;\n  background-origin: border-box;\n  background-clip: padding-box, border-box;\n  background-image:\n    linear-gradient(#0a0a0a, #0a0a0a),\n    linear-gradient(var(--angle, 0deg), #8b5cf6, #ec4899, #f97316);\n  animation: rotate-border 3s linear infinite;\n}\n@keyframes rotate-border {\n  to { --angle: 360deg; }\n}`,
  },
  {
    id: 'hide-branding',
    title: 'Hide Footer',
    desc: 'Remove the Eziox branding footer',
    css: `.eziox-branding,\n.profile-footer {\n  display: none !important;\n}`,
  },
  {
    id: 'custom-scrollbar',
    title: 'Custom Scrollbar',
    desc: 'Styled thin scrollbar',
    css: `::-webkit-scrollbar {\n  width: 6px;\n}\n::-webkit-scrollbar-track {\n  background: transparent;\n}\n::-webkit-scrollbar-thumb {\n  background: rgba(139, 92, 246, 0.3);\n  border-radius: 3px;\n}\n::-webkit-scrollbar-thumb:hover {\n  background: rgba(139, 92, 246, 0.5);\n}`,
  },
] as const

const CSS_SELECTORS = [
  { selector: '.profile-page', desc: 'css.selectors.profilePage' },
  { selector: '.profile-section', desc: 'css.selectors.profileSection' },
  { selector: '.profile-name', desc: 'css.selectors.profileName' },
  { selector: '.profile-bio', desc: 'css.selectors.profileBio' },
  { selector: '.profile-avatar', desc: 'css.selectors.profileAvatar' },
  { selector: '.link-card', desc: 'css.selectors.linkCard' },
  { selector: '.link-card:hover', desc: 'css.selectors.linkCardHover' },
  { selector: '.social-links', desc: 'css.selectors.socialLinks' },
  { selector: '.eziox-branding', desc: 'css.selectors.branding' },
] as const

export function CSSTab() {
  const { t } = useTranslation()
  const { isCreator } = usePlaygroundPermissions()
  const { cssInput, setCssInput, isDirty, resetCSS, mutation } = useCSSState()
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [expandedSection, setExpandedSection] = useState<string | null>(
    'examples',
  )

  if (!isCreator) return <PremiumGate />

  const copyToClipboard = (text: string, id: string) => {
    void navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const insertExample = (css: string) => {
    setCssInput(cssInput ? `${cssInput}\n\n${css}` : css)
  }

  const toggleSection = (id: string) =>
    setExpandedSection(expandedSection === id ? null : id)

  const lineCount = (cssInput || '').split('\n').length

  return (
    <div className="space-y-6">
      {/* ── Code Editor ── */}
      <div className="rounded-2xl border border-white/6 bg-white/2 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 bg-white/3 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Code2 size={14} className="text-violet-400" />
            <span className="text-xs font-semibold text-white/50 uppercase tracking-widest">
              {t('playground.css.title')}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-white/20 font-mono">
              {lineCount} {t('playground.css.lines')}
            </span>
            {cssInput && (
              <button
                onClick={() => copyToClipboard(cssInput, 'editor')}
                className="flex items-center gap-1 text-[10px] text-white/25 hover:text-violet-400 transition-colors"
              >
                {copiedId === 'editor' ? (
                  <Check size={10} />
                ) : (
                  <Copy size={10} />
                )}
                {copiedId === 'editor'
                  ? t('playground.css.copied')
                  : t('playground.css.copy')}
              </button>
            )}
          </div>
        </div>
        <div className="relative">
          <textarea
            value={cssInput}
            onChange={(e) => setCssInput(e.target.value)}
            placeholder={t('playground.css.placeholder')}
            rows={20}
            spellCheck={false}
            className="w-full bg-[#0a0a0a] text-sm text-white/80 font-mono leading-relaxed p-5 resize-y min-h-[300px] focus:outline-none placeholder:text-white/15 selection:bg-violet-500/30"
          />
        </div>
        <div className="flex items-center gap-3 px-5 py-2.5 bg-white/2 border-t border-white/5">
          <AlertTriangle size={11} className="text-amber-500/50 shrink-0" />
          <p className="text-[10px] text-white/25">
            {t('playground.css.hint')}
          </p>
        </div>
      </div>

      {/* ── Collapsible Sections ── */}
      <div className="space-y-3">
        {/* Examples */}
        <div className="rounded-2xl border border-white/6 bg-white/2 overflow-hidden">
          <button
            onClick={() => toggleSection('examples')}
            className="w-full flex items-center gap-3 px-5 py-4 hover:bg-white/2 transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0">
              <Sparkles size={14} className="text-violet-400" />
            </div>
            <div className="text-left flex-1">
              <span className="text-sm font-semibold text-white/70">
                {t('playground.css.examplesTitle')}
              </span>
              <p className="text-[10px] text-white/25 mt-0.5">
                {t('playground.css.examplesDesc')}
              </p>
            </div>
            <ChevronDown
              size={14}
              className={`text-white/20 transition-transform ${expandedSection === 'examples' ? 'rotate-180' : ''}`}
            />
          </button>
          <AnimatePresence>
            {expandedSection === 'examples' && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="px-5 pb-5 grid grid-cols-1 md:grid-cols-2 gap-3">
                  {CSS_EXAMPLES.map((ex) => (
                    <div
                      key={ex.id}
                      className="rounded-xl border border-white/6 bg-white/2 overflow-hidden group"
                    >
                      <div className="px-3.5 py-2.5 border-b border-white/5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-white/60">
                            {ex.title}
                          </span>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => copyToClipboard(ex.css, ex.id)}
                              className="p-1 rounded text-white/20 hover:text-violet-400 transition-colors"
                            >
                              {copiedId === ex.id ? (
                                <Check size={10} />
                              ) : (
                                <Copy size={10} />
                              )}
                            </button>
                            <button
                              onClick={() => insertExample(ex.css)}
                              className="px-2 py-0.5 rounded text-[9px] font-semibold text-violet-400 bg-violet-500/10 hover:bg-violet-500/20 transition-colors"
                            >
                              {t('playground.css.insert')}
                            </button>
                          </div>
                        </div>
                        <p className="text-[10px] text-white/20 mt-0.5">
                          {ex.desc}
                        </p>
                      </div>
                      <pre className="px-3.5 py-2.5 text-[10px] font-mono text-white/35 leading-relaxed overflow-x-auto whitespace-pre">
                        {ex.css}
                      </pre>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Selectors Reference */}
        <div className="rounded-2xl border border-white/6 bg-white/2 overflow-hidden">
          <button
            onClick={() => toggleSection('selectors')}
            className="w-full flex items-center gap-3 px-5 py-4 hover:bg-white/2 transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center shrink-0">
              <BookOpen size={14} className="text-cyan-400" />
            </div>
            <div className="text-left flex-1">
              <span className="text-sm font-semibold text-white/70">
                {t('playground.css.selectorsTitle')}
              </span>
              <p className="text-[10px] text-white/25 mt-0.5">
                {t('playground.css.selectorsDesc')}
              </p>
            </div>
            <ChevronDown
              size={14}
              className={`text-white/20 transition-transform ${expandedSection === 'selectors' ? 'rotate-180' : ''}`}
            />
          </button>
          <AnimatePresence>
            {expandedSection === 'selectors' && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="px-5 pb-5">
                  <div className="rounded-xl border border-white/6 overflow-hidden">
                    {CSS_SELECTORS.map((sel, i) => (
                      <div
                        key={sel.selector}
                        className={`flex items-center gap-3 px-4 py-2.5 ${i > 0 ? 'border-t border-white/4' : ''} hover:bg-white/2 transition-colors group`}
                      >
                        <code className="text-[11px] font-mono text-violet-400/70 bg-violet-500/5 px-2 py-0.5 rounded shrink-0">
                          {sel.selector}
                        </code>
                        <span className="text-[10px] text-white/30 flex-1">
                          {t(`playground.${sel.desc}`)}
                        </span>
                        <button
                          onClick={() =>
                            copyToClipboard(sel.selector, sel.selector)
                          }
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-white/20 hover:text-violet-400"
                        >
                          {copiedId === sel.selector ? (
                            <Check size={10} />
                          ) : (
                            <Copy size={10} />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Tips & Hints */}
        <div className="rounded-2xl border border-white/6 bg-white/2 overflow-hidden">
          <button
            onClick={() => toggleSection('tips')}
            className="w-full flex items-center gap-3 px-5 py-4 hover:bg-white/2 transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
              <Lightbulb size={14} className="text-amber-400" />
            </div>
            <div className="text-left flex-1">
              <span className="text-sm font-semibold text-white/70">
                {t('playground.css.tipsTitle')}
              </span>
              <p className="text-[10px] text-white/25 mt-0.5">
                {t('playground.css.tipsDesc')}
              </p>
            </div>
            <ChevronDown
              size={14}
              className={`text-white/20 transition-transform ${expandedSection === 'tips' ? 'rotate-180' : ''}`}
            />
          </button>
          <AnimatePresence>
            {expandedSection === 'tips' && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="px-5 pb-5 space-y-2.5">
                  {(
                    [
                      'devtools',
                      'variables',
                      'important',
                      'animations',
                      'responsive',
                    ] as const
                  ).map((tip) => (
                    <div
                      key={tip}
                      className="flex gap-3 p-3 rounded-xl bg-white/2 border border-white/5"
                    >
                      <Palette
                        size={12}
                        className="text-amber-400/50 mt-0.5 shrink-0"
                      />
                      <div>
                        <span className="text-xs font-medium text-white/50">
                          {t(`playground.css.tip_${tip}_title`)}
                        </span>
                        <p className="text-[10px] text-white/25 mt-0.5 leading-relaxed">
                          {t(`playground.css.tip_${tip}_desc`)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <SaveButton
        onClick={() => mutation.mutate(cssInput)}
        onReset={resetCSS}
        isPending={mutation.isPending}
        show={isDirty}
      />
    </div>
  )
}
