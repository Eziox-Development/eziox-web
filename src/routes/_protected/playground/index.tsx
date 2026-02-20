import { useState, useRef, useEffect } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import {
  ImageIcon,
  LayoutGrid,
  Sparkles,
  Type,
  Code2,
  DoorOpen,
  Music,
  Wand2,
  Zap,
  History,
  Lock,
  ChevronRight,
  ChevronDown,
  Eye,
  ExternalLink,
  RotateCw,
  Home,
  User,
  LogOut,
  Search,
  MousePointer2,
  Paintbrush,
  Settings,
  Crown,
  Layers,
  Globe,
  Check,
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import {
  SUPPORTED_LANGUAGES,
  LANGUAGE_NAMES,
  LANGUAGE_FLAGS,
  isValidLanguage,
  type SupportedLanguage,
} from '@/lib/i18n'
import type { PlaygroundTabType, PlaygroundTab } from './-types'
import { usePlaygroundPermissions } from './-use-playground'

// Tab Components
import { BackgroundTab } from './tabs/-background-tab'
import { LayoutTab } from './tabs/-layout-tab'
import { AnimationsTab } from './tabs/-animations-tab'
import { FontsTab } from './tabs/-fonts-tab'
import { CSSTab } from './tabs/-css-tab'
import { IntroGateTab } from './tabs/-intro-gate-tab'
import { MusicTab } from './tabs/-music-tab'
import { NameEffectsTab } from './tabs/-name-effects-tab'
import { StatusTextTab } from './tabs/-status-text-tab'
import { CursorTab } from './tabs/-cursor-tab'
import { EffectsTab } from './tabs/-effects-tab'
import { BackupsTab } from './tabs/-backups-tab'

export const Route = createFileRoute('/_protected/playground/')({
  component: PlaygroundPage,
  head: () => ({
    meta: [
      { title: 'Playground | Eziox' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
})

// ─── Nav structure with collapsible sections ─────────────────────────────────

interface NavSection {
  id: string
  labelKey: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  collapsible: boolean
  items: PlaygroundTab[]
}

const NAV_SECTIONS: NavSection[] = [
  {
    id: 'customize',
    labelKey: 'playground.nav.customize',
    icon: Paintbrush,
    collapsible: true,
    items: [
      { id: 'background', labelKey: 'playground.tabs.background', descKey: 'playground.tabs.backgroundDesc', icon: ImageIcon },
      { id: 'layout', labelKey: 'playground.tabs.layout', descKey: 'playground.tabs.layoutDesc', icon: LayoutGrid },
      { id: 'fonts', labelKey: 'playground.tabs.fonts', descKey: 'playground.tabs.fontsDesc', icon: Type, premium: true },
      { id: 'css', labelKey: 'playground.tabs.css', descKey: 'playground.tabs.cssDesc', icon: Code2, premium: true },
    ],
  },
  {
    id: 'effects',
    labelKey: 'playground.nav.effects',
    icon: Sparkles,
    collapsible: true,
    items: [
      { id: 'animations', labelKey: 'playground.tabs.animations', descKey: 'playground.tabs.animationsDesc', icon: Sparkles, premium: true },
      { id: 'name-effects', labelKey: 'playground.tabs.nameEffects', descKey: 'playground.tabs.nameEffectsDesc', icon: Wand2 },
      { id: 'effects', labelKey: 'playground.tabs.effects', descKey: 'playground.tabs.effectsDesc', icon: Zap },
      { id: 'cursor', labelKey: 'playground.tabs.cursor', descKey: 'playground.tabs.cursorDesc', icon: MousePointer2 },
    ],
  },
  {
    id: 'content',
    labelKey: 'playground.nav.content',
    icon: Layers,
    collapsible: true,
    items: [
      { id: 'intro-gate', labelKey: 'playground.tabs.introGate', descKey: 'playground.tabs.introGateDesc', icon: DoorOpen },
      { id: 'music', labelKey: 'playground.tabs.music', descKey: 'playground.tabs.musicDesc', icon: Music },
      { id: 'status-text', labelKey: 'playground.tabs.statusText', descKey: 'playground.tabs.statusTextDesc', icon: Type },
    ],
  },
  {
    id: 'manage',
    labelKey: 'playground.nav.manage',
    icon: Settings,
    collapsible: false,
    items: [
      { id: 'backups', labelKey: 'playground.tabs.backups', descKey: 'playground.tabs.backupsDesc', icon: History },
    ],
  },
]

const ALL_TABS = NAV_SECTIONS.flatMap((s) => s.items)

const TAB_COMPONENTS: Record<PlaygroundTabType, React.ComponentType> = {
  background: BackgroundTab,
  layout: LayoutTab,
  animations: AnimationsTab,
  fonts: FontsTab,
  css: CSSTab,
  'intro-gate': IntroGateTab,
  music: MusicTab,
  'name-effects': NameEffectsTab,
  'status-text': StatusTextTab,
  cursor: CursorTab,
  effects: EffectsTab,
  backups: BackupsTab,
}

// ─── Sidebar search ──────────────────────────────────────────────────────────

function SidebarSearch({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const { t } = useTranslation()
  return (
    <div className="relative">
      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t('playground.nav.search')}
        className="w-full h-9 pl-9 pr-3 rounded-lg bg-background-secondary/80 border border-border/50 text-sm text-foreground placeholder:text-foreground-muted/60 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
      />
      {value && (
        <button onClick={() => onChange('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-foreground text-xs">
          ✕
        </button>
      )}
    </div>
  )
}

// ─── Language Switcher ───────────────────────────────────────────────────────

function LanguageSwitcherRow() {
  const { t, i18n } = useTranslation()
  const currentLang = (isValidLanguage(i18n.language) ? i18n.language : 'en') as SupportedLanguage
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-foreground-muted hover:text-foreground hover:bg-background-secondary/60 transition-colors"
      >
        <Globe size={15} className="shrink-0" />
        <span className="flex-1 text-left">{t('playground.nav.language')}</span>
        <span className="text-base leading-none">{LANGUAGE_FLAGS[currentLang]}</span>
        <ChevronDown size={13} className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-0 right-0 mb-1 rounded-xl border border-border bg-card shadow-xl shadow-black/30 overflow-hidden z-50"
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <button
                key={lang}
                onClick={() => { void i18n.changeLanguage(lang); setOpen(false) }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-colors ${
                  currentLang === lang
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-foreground-muted hover:text-foreground hover:bg-background-secondary/60'
                }`}
              >
                <span className="text-base leading-none">{LANGUAGE_FLAGS[lang]}</span>
                <span className="flex-1 text-left">{LANGUAGE_NAMES[lang]}</span>
                {currentLang === lang && <Check size={13} className="text-primary" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── User dropdown ───────────────────────────────────────────────────────────

function UserDropdown() {
  const { t } = useTranslation()
  const { currentUser, signOut } = useAuth()
  const { isCreator } = usePlaygroundPermissions()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const avatar = currentUser?.profile?.avatar as string | undefined
  const username = currentUser?.username ?? 'user'
  const tier = (currentUser?.tier as string) ?? 'free'

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-background-secondary/80 transition-colors group"
      >
        <div className="w-8 h-8 rounded-lg bg-linear-to-br from-primary to-accent flex items-center justify-center text-white text-xs font-bold overflow-hidden shrink-0">
          {avatar ? (
            <img src={avatar} alt="" className="w-full h-full object-cover" />
          ) : (
            username[0]?.toUpperCase()
          )}
        </div>
        <div className="flex-1 text-left min-w-0">
          <div className="text-sm font-semibold text-foreground truncate">{username}</div>
          <div className="flex items-center gap-1.5">
            {isCreator && <Crown size={10} className="text-amber-400" />}
            <span className="text-[10px] text-foreground-muted uppercase tracking-wider font-medium">{tier}</span>
          </div>
        </div>
        <ChevronDown size={14} className={`text-foreground-muted transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-0 right-0 mb-2 rounded-xl border border-border/60 bg-card/95 backdrop-blur-xl shadow-2xl shadow-black/20 overflow-hidden z-50"
          >
            <div className="p-1.5">
              <Link
                to="/"
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-foreground-muted hover:text-foreground hover:bg-background-secondary/80 transition-colors"
                onClick={() => setOpen(false)}
              >
                <Home size={15} />
                <span>{t('playground.nav.home')}</span>
              </Link>
              <Link
                to="/profile"
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-foreground-muted hover:text-foreground hover:bg-background-secondary/80 transition-colors"
                onClick={() => setOpen(false)}
              >
                <User size={15} />
                <span>{t('playground.nav.dashboard')}</span>
              </Link>
              <a
                href={`/${username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-foreground-muted hover:text-foreground hover:bg-background-secondary/80 transition-colors"
                onClick={() => setOpen(false)}
              >
                <Eye size={15} />
                <span>{t('playground.nav.viewProfile')}</span>
                <ExternalLink size={11} className="ml-auto opacity-50" />
              </a>
            </div>
            <div className="border-t border-border/40 p-1.5">
              <button
                onClick={() => { setOpen(false); void signOut() }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <LogOut size={15} />
                <span>{t('playground.nav.signOut')}</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Main ────────────────────────────────────────────────────────────────────

function PlaygroundPage() {
  const { t } = useTranslation()
  const { currentUser, isCreator } = usePlaygroundPermissions()
  const [activeTab, setActiveTab] = useState<PlaygroundTabType>('background')
  const [search, setSearch] = useState('')
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})

  const toggleSection = (id: string) =>
    setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }))

  const activeTabData = ALL_TABS.find((tab) => tab.id === activeTab)
  const activeSectionData = NAV_SECTIONS.find((s) => s.items.some((i) => i.id === activeTab))
  const ActiveTabComponent = TAB_COMPONENTS[activeTab]

  const searchLower = search.toLowerCase()

  const handleResetToDefault = () => {
    toast.success(t('playground.resetSuccess'))
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">

      {/* ── Sidebar ── */}
      <aside className="w-64 h-screen flex flex-col border-r border-border/40 bg-card/50 backdrop-blur-sm shrink-0">

        {/* Brand */}
        <div className="px-4 pt-5 pb-3">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-linear-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
              <Wand2 size={16} className="text-white" />
            </div>
            <div>
              <span className="text-sm font-bold text-foreground tracking-tight">Playground</span>
              <span className="block text-[10px] text-foreground-muted -mt-0.5">by Eziox</span>
            </div>
          </Link>
        </div>

        {/* Search */}
        <div className="px-3 pb-3">
          <SidebarSearch value={search} onChange={setSearch} />
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 pb-3 space-y-1 scrollbar-thin">
          {NAV_SECTIONS.map((section) => {
            const isOpen = !collapsed[section.id]
            const filteredItems = search
              ? section.items.filter((item) =>
                  t(item.labelKey).toLowerCase().includes(searchLower) ||
                  t(item.descKey).toLowerCase().includes(searchLower)
                )
              : section.items

            if (search && filteredItems.length === 0) return null

            return (
              <div key={section.id}>
                {/* Section header */}
                {section.collapsible ? (
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full flex items-center gap-2 px-2 py-1.5 text-[11px] font-semibold text-foreground-muted uppercase tracking-wider hover:text-foreground transition-colors"
                  >
                    <section.icon size={13} className="opacity-60" />
                    <span className="flex-1 text-left">{t(section.labelKey)}</span>
                    <ChevronRight size={12} className={`transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} />
                  </button>
                ) : (
                  <div className="flex items-center gap-2 px-2 py-1.5 text-[11px] font-semibold text-foreground-muted uppercase tracking-wider">
                    <section.icon size={13} className="opacity-60" />
                    <span>{t(section.labelKey)}</span>
                  </div>
                )}

                {/* Section items */}
                <AnimatePresence initial={false}>
                  {(isOpen || search) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-0.5 py-0.5">
                        {filteredItems.map((item) => {
                          const isActive = activeTab === item.id
                          const isLocked = item.premium && !isCreator
                          return (
                            <button
                              key={item.id}
                              onClick={() => !isLocked && setActiveTab(item.id)}
                              disabled={isLocked}
                              className={`w-full flex items-center gap-2.5 pl-7 pr-2 py-2 rounded-lg text-left transition-all text-sm ${
                                isActive
                                  ? 'bg-primary/10 text-primary font-medium'
                                  : 'text-foreground-muted hover:text-foreground hover:bg-background-secondary/60'
                              } ${isLocked ? 'opacity-40 cursor-not-allowed' : ''}`}
                            >
                              {isActive && (
                                <motion.div
                                  layoutId="sidebar-active"
                                  className="absolute left-3 w-1 h-4 rounded-full bg-primary"
                                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                                />
                              )}
                              <item.icon size={15} className={isActive ? 'text-primary' : ''} />
                              <span className="flex-1 truncate">{t(item.labelKey)}</span>
                              {isLocked && <Lock size={12} />}
                              {item.premium && !isLocked && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-linear-to-r from-amber-500 to-orange-500 text-white leading-none">
                                  PRO
                                </span>
                              )}
                            </button>
                          )
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </nav>

        {/* Quick actions */}
        <div className="px-3 py-2 border-t border-border/30 space-y-1">
          <a
            href={`/${currentUser?.username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-foreground-muted hover:text-foreground hover:bg-background-secondary/60 transition-colors"
          >
            <Eye size={15} className="text-primary" />
            <span>{t('playground.preview')}</span>
            <ExternalLink size={11} className="ml-auto opacity-50" />
          </a>
          <button
            onClick={handleResetToDefault}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <RotateCw size={15} />
            <span>{t('playground.reset')}</span>
          </button>
          <LanguageSwitcherRow />
        </div>

        {/* User dropdown */}
        <div className="px-3 pb-3 pt-1 border-t border-border/30">
          <UserDropdown />
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 h-screen overflow-y-auto">

        {/* Top bar with breadcrumbs */}
        <header className="sticky top-0 z-30 h-14 flex items-center justify-between px-8 border-b border-border/30 bg-background/80 backdrop-blur-lg">
          <nav className="flex items-center gap-1.5 text-sm">
            <Link to="/" className="text-foreground-muted hover:text-foreground transition-colors">
              {t('playground.nav.home')}
            </Link>
            <ChevronRight size={13} className="text-foreground-muted/50" />
            <span className="text-foreground-muted">
              {activeSectionData ? t(activeSectionData.labelKey) : t('playground.title')}
            </span>
            <ChevronRight size={13} className="text-foreground-muted/50" />
            <span className="text-foreground font-medium">
              {activeTabData ? t(activeTabData.labelKey) : ''}
            </span>
          </nav>
        </header>

        {/* Content area */}
        <div className="p-8">
          <div className="w-full">

            {/* Page header */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="mb-8"
              >
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border">
                  {activeTabData && (
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <activeTabData.icon size={20} className="text-primary" />
                    </div>
                  )}
                  <div>
                    <h1 className="text-xl font-bold text-foreground tracking-tight">
                      {activeTabData ? t(activeTabData.labelKey) : ''}
                    </h1>
                    <p className="text-sm text-foreground-muted mt-0.5">
                      {activeTabData ? t(activeTabData.descKey) : ''}
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Tab content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.22 }}
              >
                <ActiveTabComponent />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  )
}
