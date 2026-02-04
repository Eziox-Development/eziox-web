/**
 * Theme Builder Page
 * Full-page layout with sidebar navigation and large live preview
 * Pro+ feature for creating custom themes
 */

import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/hooks/use-auth'
import { useTheme } from '@/components/layout/ThemeProvider'
import { useServerFn } from '@tanstack/react-start'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  getCustomThemesFn,
  createCustomThemeFn,
  updateCustomThemeFn,
  deleteCustomThemeFn,
  setActiveCustomThemeFn,
  exportCustomThemeFn,
  importCustomThemeFn,
} from '@/server/functions/profile-settings'
import type { CustomTheme } from '@/server/db/schema'
import {
  Palette,
  Plus,
  Trash2,
  Check,
  Crown,
  Loader2,
  Download,
  Upload,
  Paintbrush,
  Type,
  Sparkles,
  Save,
  ChevronRight,
  ChevronLeft,
  Smartphone,
  Monitor,
  RotateCcw,
  Copy,
  Layers,
  Wand2,
  Star,
  Music,
  Link as LinkIcon,
  Instagram,
  Twitter,
  Youtube,
  Moon,
  Droplets,
  TreePine,
  Sun,
  Flower,
} from 'lucide-react'

export const Route = createFileRoute('/_protected/theme-builder')({
  head: () => ({
    meta: [
      { title: 'Theme Builder | Eziox' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  component: ThemeBuilderPage,
})

const DEFAULT_THEME: Omit<CustomTheme, 'id' | 'createdAt'> = {
  name: 'My Custom Theme',
  colors: {
    background: '#0a0a0f',
    backgroundSecondary: '#12121a',
    foreground: '#ffffff',
    foregroundMuted: '#a1a1aa',
    primary: '#6366f1',
    accent: '#8b5cf6',
    border: '#27272a',
    card: '#18181b',
  },
  typography: {
    displayFont: 'Inter',
    bodyFont: 'Inter',
    displayFontUrl:
      'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
    bodyFontUrl:
      'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
  },
  effects: {
    glowIntensity: 'subtle',
    borderRadius: 'rounded',
    cardStyle: 'flat',
  },
}

const PRESETS = [
  {
    name: 'Midnight',
    icon: Moon,
    colors: {
      background: '#0a0a0f',
      backgroundSecondary: '#12121a',
      foreground: '#ffffff',
      foregroundMuted: '#a1a1aa',
      primary: '#6366f1',
      accent: '#8b5cf6',
      border: '#27272a',
      card: '#18181b',
    },
  },
  {
    name: 'Ocean',
    icon: Droplets,
    colors: {
      background: '#0c1929',
      backgroundSecondary: '#132f4c',
      foreground: '#ffffff',
      foregroundMuted: '#94a3b8',
      primary: '#0ea5e9',
      accent: '#06b6d4',
      border: '#1e3a5f',
      card: '#0f2744',
    },
  },
  {
    name: 'Forest',
    icon: TreePine,
    colors: {
      background: '#0d1f0d',
      backgroundSecondary: '#1a3a1a',
      foreground: '#ffffff',
      foregroundMuted: '#86efac',
      primary: '#22c55e',
      accent: '#10b981',
      border: '#166534',
      card: '#14532d',
    },
  },
  {
    name: 'Sunset',
    icon: Sun,
    colors: {
      background: '#1a0a0a',
      backgroundSecondary: '#2d1515',
      foreground: '#ffffff',
      foregroundMuted: '#fca5a5',
      primary: '#f97316',
      accent: '#ef4444',
      border: '#7f1d1d',
      card: '#450a0a',
    },
  },
  {
    name: 'Lavender',
    icon: Flower,
    colors: {
      background: '#1a1625',
      backgroundSecondary: '#2d2640',
      foreground: '#ffffff',
      foregroundMuted: '#c4b5fd',
      primary: '#a855f7',
      accent: '#d946ef',
      border: '#581c87',
      card: '#3b0764',
    },
  },
  {
    name: 'Rose',
    icon: Sparkles,
    colors: {
      background: '#1a0f14',
      backgroundSecondary: '#2d1a24',
      foreground: '#ffffff',
      foregroundMuted: '#fda4af',
      primary: '#f43f5e',
      accent: '#ec4899',
      border: '#881337',
      card: '#4c0519',
    },
  },
  {
    name: 'Gold',
    icon: Star,
    colors: {
      background: '#1a1608',
      backgroundSecondary: '#2d2610',
      foreground: '#ffffff',
      foregroundMuted: '#fcd34d',
      primary: '#eab308',
      accent: '#f59e0b',
      border: '#854d0e',
      card: '#422006',
    },
  },
  {
    name: 'Light',
    icon: Sun,
    colors: {
      background: '#ffffff',
      backgroundSecondary: '#f4f4f5',
      foreground: '#18181b',
      foregroundMuted: '#71717a',
      primary: '#6366f1',
      accent: '#8b5cf6',
      border: '#e4e4e7',
      card: '#fafafa',
    },
  },
]

const FONTS = [
  {
    name: 'Inter',
    url: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
  },
  {
    name: 'Poppins',
    url: 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap',
  },
  {
    name: 'Montserrat',
    url: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap',
  },
  {
    name: 'Space Grotesk',
    url: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap',
  },
  {
    name: 'JetBrains Mono',
    url: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap',
  },
  {
    name: 'Orbitron',
    url: 'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700&display=swap',
  },
  {
    name: 'Playfair Display',
    url: 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap',
  },
  {
    name: 'Roboto',
    url: 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap',
  },
]

type EditorSection = 'presets' | 'colors' | 'typography' | 'effects'
type PreviewDevice = 'mobile' | 'desktop'

function ThemeBuilderPage() {
  const { t } = useTranslation()
  const { currentUser } = useAuth()
  useTheme()
  const queryClient = useQueryClient()

  // Server functions
  const getCustomThemes = useServerFn(getCustomThemesFn)
  const createTheme = useServerFn(createCustomThemeFn)
  const updateTheme = useServerFn(updateCustomThemeFn)
  const deleteTheme = useServerFn(deleteCustomThemeFn)
  const setActiveTheme = useServerFn(setActiveCustomThemeFn)
  const exportTheme = useServerFn(exportCustomThemeFn)
  const importTheme = useServerFn(importCustomThemeFn)

  // State
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [activeSection, setActiveSection] = useState<EditorSection>('presets')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [editing, setEditing] = useState<Omit<
    CustomTheme,
    'id' | 'createdAt'
  > | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [previewDevice, setPreviewDevice] = useState<PreviewDevice>('mobile')

  // Query
  const { data, isLoading } = useQuery({
    queryKey: ['custom-themes'],
    queryFn: () => getCustomThemes(),
  })

  const themes = data?.themes || []
  const canCreate = data?.canCreate || false
  const maxThemes = data?.maxThemes || 0
  const activeThemeId = data?.activeThemeId

  // Load selected theme into editor
  useEffect(() => {
    if (selectedId && themes.length) {
      const found = themes.find((x) => x.id === selectedId)
      if (found) {
        setEditing({
          name: found.name,
          colors: { ...found.colors },
          typography: { ...found.typography },
          effects: { ...found.effects },
        })
      }
    }
  }, [selectedId, themes])

  // Mutations
  const createMut = useMutation({
    mutationFn: (t: CustomTheme) => createTheme({ data: t }),
    onSuccess: (r) => {
      toast.success(t('themeBuilder.toast.created'))
      setIsCreating(false)
      setSelectedId(r.theme.id)
      setHasChanges(false)
      void queryClient.invalidateQueries({ queryKey: ['custom-themes'] })
    },
    onError: () => toast.error(t('themeBuilder.toast.error')),
  })

  const updateMut = useMutation({
    mutationFn: (t: CustomTheme) => updateTheme({ data: t }),
    onSuccess: () => {
      toast.success(t('themeBuilder.toast.saved'))
      setHasChanges(false)
      void queryClient.invalidateQueries({ queryKey: ['custom-themes'] })
    },
    onError: () => toast.error(t('themeBuilder.toast.error')),
  })

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteTheme({ data: { themeId: id } }),
    onSuccess: () => {
      toast.success(t('themeBuilder.toast.deleted'))
      setSelectedId(null)
      setEditing(null)
      void queryClient.invalidateQueries({ queryKey: ['custom-themes'] })
    },
  })

  const activateMut = useMutation({
    mutationFn: (id: string | null) =>
      setActiveTheme({ data: { themeId: id } }),
    onSuccess: () => {
      toast.success(t('themeBuilder.toast.activated'))
      void queryClient.invalidateQueries({ queryKey: ['custom-themes'] })
    },
  })

  // Handlers
  const handleCreate = () => {
    setIsCreating(true)
    setSelectedId(null)
    setEditing({ ...DEFAULT_THEME })
    setHasChanges(false)
    setActiveSection('presets')
  }

  const handleSave = () => {
    if (!editing) return
    if (isCreating) {
      createMut.mutate({
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        ...editing,
      })
    } else if (selectedId) {
      const found = themes.find((x) => x.id === selectedId)
      if (found) {
        updateMut.mutate({
          ...editing,
          id: selectedId,
          createdAt: found.createdAt,
        })
      }
    }
  }

  const handleExport = async () => {
    if (!selectedId) return
    const r = await exportTheme({ data: { themeId: selectedId } })
    const blob = new Blob([JSON.stringify(r.data, null, 2)], {
      type: 'application/json',
    })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `${editing?.name || 'theme'}.json`
    a.click()
    toast.success(t('themeBuilder.toast.exported'))
  }

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e) => {
      const f = (e.target as HTMLInputElement).files?.[0]
      if (!f) return
      try {
        const d = JSON.parse(await f.text())
        await importTheme({ data: d })
        toast.success(t('themeBuilder.toast.imported'))
        void queryClient.invalidateQueries({ queryKey: ['custom-themes'] })
      } catch {
        toast.error(t('themeBuilder.toast.invalidFile'))
      }
    }
    input.click()
  }

  const handleReset = () => {
    if (selectedId) {
      const found = themes.find((x) => x.id === selectedId)
      if (found) {
        setEditing({
          name: found.name,
          colors: { ...found.colors },
          typography: { ...found.typography },
          effects: { ...found.effects },
        })
        setHasChanges(false)
      }
    } else if (isCreating) {
      setEditing({ ...DEFAULT_THEME })
      setHasChanges(false)
    }
  }

  const updateColor = (key: keyof CustomTheme['colors'], value: string) => {
    if (editing) {
      setEditing({ ...editing, colors: { ...editing.colors, [key]: value } })
      setHasChanges(true)
    }
  }

  const updateFont = (key: 'displayFont' | 'bodyFont', value: string) => {
    const font = FONTS.find((x) => x.name === value)
    if (editing && font) {
      setEditing({
        ...editing,
        typography: {
          ...editing.typography,
          [key]: value,
          [key === 'displayFont' ? 'displayFontUrl' : 'bodyFontUrl']: font.url,
        },
      })
      setHasChanges(true)
    }
  }

  const updateEffect = <K extends keyof CustomTheme['effects']>(
    key: K,
    value: CustomTheme['effects'][K],
  ) => {
    if (editing) {
      setEditing({ ...editing, effects: { ...editing.effects, [key]: value } })
      setHasChanges(true)
    }
  }

  const applyPreset = (preset: (typeof PRESETS)[0]) => {
    if (editing) {
      setEditing({ ...editing, colors: { ...preset.colors } })
      setHasChanges(true)
    }
  }

  // Loading state
  if (!currentUser || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 size={40} className="animate-spin text-primary" />
      </div>
    )
  }

  // Upgrade prompt for non-Pro users
  if (!canCreate && themes.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg text-center"
        >
          <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-linear-to-br from-primary to-accent flex items-center justify-center shadow-2xl shadow-primary/30">
            <Crown size={48} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            {t('themeBuilder.upgrade.title')}
          </h1>
          <p className="text-lg text-foreground-muted mb-8">
            {t('themeBuilder.upgrade.description')}
          </p>
          <Link
            to="/profile"
            search={{ tab: 'subscription' }}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold text-white bg-linear-to-r from-primary to-accent hover:scale-105 transition-transform shadow-xl shadow-primary/30"
          >
            <Crown size={20} />
            {t('themeBuilder.upgrade.cta')}
            <ChevronRight size={18} />
          </Link>
        </motion.div>
      </div>
    )
  }

  const isSaving = createMut.isPending || updateMut.isPending
  const c = editing?.colors || DEFAULT_THEME.colors
  const borderRadius =
    editing?.effects.borderRadius === 'pill'
      ? '24px'
      : editing?.effects.borderRadius === 'sharp'
        ? '4px'
        : '12px'

  const editorSections: {
    id: EditorSection
    icon: typeof Palette
    label: string
  }[] = [
    { id: 'presets', icon: Wand2, label: t('themeBuilder.colors.presets') },
    { id: 'colors', icon: Palette, label: t('themeBuilder.tabs.colors') },
    { id: 'typography', icon: Type, label: t('themeBuilder.tabs.typography') },
    { id: 'effects', icon: Sparkles, label: t('themeBuilder.tabs.effects') },
  ]

  return (
    <div className="min-h-screen bg-background pt-20 pb-8">
      <div className="h-[calc(100vh-8rem)] flex overflow-hidden max-w-[1920px] mx-auto">
        {/* Left Sidebar - Theme List */}
        <motion.aside
          initial={false}
          animate={{ width: sidebarCollapsed ? 64 : 280 }}
          className="h-full border-r border-border bg-card flex flex-col shrink-0"
        >
          {/* Sidebar Header */}
          <div className="p-4 border-b border-border flex items-center justify-between">
            {!sidebarCollapsed && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-linear-to-br from-primary to-accent flex items-center justify-center">
                  <Paintbrush size={16} className="text-white" />
                </div>
                <div>
                  <h2 className="font-semibold text-foreground text-sm">
                    {t('themeBuilder.title')}
                  </h2>
                  <p className="text-xs text-foreground-muted">
                    {themes.length}/{maxThemes}
                  </p>
                </div>
              </div>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 rounded-lg hover:bg-background-secondary transition-colors"
            >
              {sidebarCollapsed ? (
                <ChevronRight size={16} />
              ) : (
                <ChevronLeft size={16} />
              )}
            </button>
          </div>

          {/* Theme List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {themes.map((themeItem) => (
              <button
                key={themeItem.id}
                onClick={() => {
                  setSelectedId(themeItem.id)
                  setIsCreating(false)
                  setHasChanges(false)
                }}
                className={`w-full p-3 rounded-xl text-left transition-all ${
                  selectedId === themeItem.id
                    ? 'bg-primary text-white'
                    : 'hover:bg-background-secondary'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg shrink-0"
                    style={{
                      background: `linear-gradient(135deg, ${themeItem.colors.primary}, ${themeItem.colors.accent})`,
                    }}
                  />
                  {!sidebarCollapsed && (
                    <>
                      <span className="text-sm font-medium truncate flex-1">
                        {themeItem.name}
                      </span>
                      {activeThemeId === themeItem.id && (
                        <Check size={14} className="shrink-0" />
                      )}
                    </>
                  )}
                </div>
              </button>
            ))}

            {isCreating && (
              <div className="p-3 rounded-xl bg-primary text-white">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                    <Plus size={16} />
                  </div>
                  {!sidebarCollapsed && (
                    <span className="text-sm font-medium">
                      {t('themeBuilder.actions.new')}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Footer */}
          <div className="p-2 border-t border-border space-y-1">
            {themes.length < maxThemes && (
              <button
                onClick={handleCreate}
                className={`w-full p-3 rounded-xl bg-linear-to-r from-primary to-accent text-white font-medium transition-all hover:scale-[1.02] flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-2'}`}
              >
                <Plus size={18} />
                {!sidebarCollapsed && t('themeBuilder.actions.new')}
              </button>
            )}
            <button
              onClick={handleImport}
              className={`w-full p-3 rounded-xl bg-background-secondary text-foreground-muted hover:text-foreground transition-colors flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-2'}`}
            >
              <Upload size={18} />
              {!sidebarCollapsed && t('themeBuilder.actions.import')}
            </button>
          </div>
        </motion.aside>

        {/* Main Content */}
        {editing ? (
          <div className="flex-1 flex overflow-hidden">
            {/* Editor Panel */}
            <div className="w-[400px] border-r border-border bg-background-secondary flex flex-col shrink-0">
              {/* Editor Header */}
              <div className="p-4 border-b border-border bg-card">
                <div className="flex items-center justify-between mb-3">
                  <input
                    value={editing.name}
                    onChange={(e) => {
                      setEditing({ ...editing, name: e.target.value })
                      setHasChanges(true)
                    }}
                    className="text-lg font-bold bg-transparent outline-none text-foreground flex-1"
                    placeholder="Theme name"
                  />
                  <div className="flex items-center gap-1">
                    {selectedId && (
                      <>
                        <button
                          onClick={handleExport}
                          className="p-2 rounded-lg hover:bg-background-secondary transition-colors"
                          title={t('themeBuilder.actions.export')}
                        >
                          <Download
                            size={16}
                            className="text-foreground-muted"
                          />
                        </button>
                        <button
                          onClick={() => deleteMut.mutate(selectedId)}
                          className="p-2 rounded-lg hover:bg-red-500/20 transition-colors"
                          title={t('themeBuilder.actions.delete')}
                        >
                          <Trash2 size={16} className="text-red-400" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {hasChanges && (
                    <button
                      onClick={handleReset}
                      className="p-2 rounded-lg hover:bg-background-secondary transition-colors"
                      title="Reset changes"
                    >
                      <RotateCcw size={16} className="text-foreground-muted" />
                    </button>
                  )}
                  {selectedId && activeThemeId !== selectedId && (
                    <button
                      onClick={() => activateMut.mutate(selectedId)}
                      className="px-3 py-1.5 rounded-lg bg-background-secondary text-sm font-medium text-foreground hover:bg-primary hover:text-white transition-colors"
                    >
                      {t('themeBuilder.actions.activate')}
                    </button>
                  )}
                  {selectedId && activeThemeId === selectedId && (
                    <span className="px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400 text-sm font-medium">
                      {t('themeBuilder.actions.active')}
                    </span>
                  )}
                  <button
                    onClick={handleSave}
                    disabled={!hasChanges || isSaving}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-linear-to-r from-primary to-accent text-white font-medium disabled:opacity-50 transition-all hover:scale-[1.02]"
                  >
                    {isSaving ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Save size={16} />
                    )}
                    {isSaving
                      ? t('themeBuilder.actions.saving')
                      : t('themeBuilder.actions.save')}
                  </button>
                </div>
              </div>

              {/* Section Navigation */}
              <div className="flex border-b border-border bg-card">
                {editorSections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors ${
                      activeSection === section.id
                        ? 'text-primary border-b-2 border-primary bg-primary/5'
                        : 'text-foreground-muted hover:text-foreground'
                    }`}
                  >
                    <section.icon size={18} />
                    {section.label}
                  </button>
                ))}
              </div>

              {/* Editor Content */}
              <div className="flex-1 overflow-y-auto p-4">
                <AnimatePresence mode="wait">
                  {activeSection === 'presets' && (
                    <motion.div
                      key="presets"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="space-y-3"
                    >
                      <p className="text-sm text-foreground-muted mb-4">
                        Choose a preset to get started quickly
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        {PRESETS.map((preset) => (
                          <button
                            key={preset.name}
                            onClick={() => applyPreset(preset)}
                            className="group relative p-4 rounded-2xl transition-all hover:scale-[1.02] overflow-hidden"
                            style={{
                              background: preset.colors.background,
                              border: `2px solid ${preset.colors.border}`,
                            }}
                          >
                            <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative">
                              <div className="flex justify-center gap-1 mb-3">
                                <div
                                  className="w-6 h-6 rounded-full shadow-lg"
                                  style={{ background: preset.colors.primary }}
                                />
                                <div
                                  className="w-6 h-6 rounded-full shadow-lg"
                                  style={{ background: preset.colors.accent }}
                                />
                              </div>
                              <div className="text-center">
                                <div className="w-8 h-8 mx-auto mb-2 flex items-center justify-center">
                                  <preset.icon
                                    size={20}
                                    style={{ color: preset.colors.foreground }}
                                  />
                                </div>
                                <span
                                  className="text-sm font-medium"
                                  style={{ color: preset.colors.foreground }}
                                >
                                  {preset.name}
                                </span>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {activeSection === 'colors' && (
                    <motion.div
                      key="colors"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="space-y-4"
                    >
                      {(
                        Object.keys(editing.colors) as Array<
                          keyof CustomTheme['colors']
                        >
                      ).map((key) => (
                        <div key={key} className="group">
                          <label className="text-xs font-medium text-foreground-muted mb-2 block uppercase tracking-wide">
                            {t(`themeBuilder.colors.${key}`)}
                          </label>
                          <div className="flex gap-2">
                            <div className="relative">
                              <input
                                type="color"
                                value={editing.colors[key]}
                                onChange={(e) =>
                                  updateColor(key, e.target.value)
                                }
                                className="w-12 h-12 rounded-xl cursor-pointer border-2 border-border"
                              />
                            </div>
                            <input
                              type="text"
                              value={editing.colors[key]}
                              onChange={(e) => updateColor(key, e.target.value)}
                              className="flex-1 px-4 py-3 rounded-xl text-sm font-mono bg-card border border-border text-foreground outline-none focus:border-primary transition-colors"
                            />
                            <button
                              onClick={() =>
                                navigator.clipboard.writeText(
                                  editing.colors[key],
                                )
                              }
                              className="p-3 rounded-xl bg-card border border-border hover:bg-background-secondary transition-colors"
                            >
                              <Copy
                                size={16}
                                className="text-foreground-muted"
                              />
                            </button>
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}

                  {activeSection === 'typography' && (
                    <motion.div
                      key="typography"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="space-y-6"
                    >
                      <div>
                        <label className="text-xs font-medium text-foreground-muted mb-2 block uppercase tracking-wide">
                          {t('themeBuilder.typography.displayFont')}
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {FONTS.map((f) => (
                            <button
                              key={f.name}
                              onClick={() => updateFont('displayFont', f.name)}
                              className={`p-4 rounded-xl text-left transition-all ${
                                editing.typography.displayFont === f.name
                                  ? 'bg-primary text-white'
                                  : 'bg-card border border-border hover:border-primary'
                              }`}
                            >
                              <span
                                className="text-lg font-bold block mb-1"
                                style={{ fontFamily: f.name }}
                              >
                                Aa
                              </span>
                              <span className="text-xs opacity-80">
                                {f.name}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-foreground-muted mb-2 block uppercase tracking-wide">
                          {t('themeBuilder.typography.bodyFont')}
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {FONTS.map((f) => (
                            <button
                              key={f.name}
                              onClick={() => updateFont('bodyFont', f.name)}
                              className={`p-4 rounded-xl text-left transition-all ${
                                editing.typography.bodyFont === f.name
                                  ? 'bg-primary text-white'
                                  : 'bg-card border border-border hover:border-primary'
                              }`}
                            >
                              <span
                                className="text-sm block mb-1"
                                style={{ fontFamily: f.name }}
                              >
                                Body text
                              </span>
                              <span className="text-xs opacity-80">
                                {f.name}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeSection === 'effects' && (
                    <motion.div
                      key="effects"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="space-y-6"
                    >
                      {/* Glow Intensity */}
                      <div>
                        <label className="text-xs font-medium text-foreground-muted mb-3 block uppercase tracking-wide">
                          {t('themeBuilder.effects.glowIntensity')}
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                          {(
                            ['none', 'subtle', 'medium', 'strong'] as const
                          ).map((v) => (
                            <button
                              key={v}
                              onClick={() => updateEffect('glowIntensity', v)}
                              className={`py-3 rounded-xl text-sm font-medium transition-all ${
                                editing.effects.glowIntensity === v
                                  ? 'bg-primary text-white'
                                  : 'bg-card border border-border hover:border-primary text-foreground'
                              }`}
                            >
                              {t(`themeBuilder.effects.${v}`)}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Border Radius */}
                      <div>
                        <label className="text-xs font-medium text-foreground-muted mb-3 block uppercase tracking-wide">
                          {t('themeBuilder.effects.borderRadius')}
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {(['sharp', 'rounded', 'pill'] as const).map((v) => (
                            <button
                              key={v}
                              onClick={() => updateEffect('borderRadius', v)}
                              className={`py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                                editing.effects.borderRadius === v
                                  ? 'bg-primary text-white'
                                  : 'bg-card border border-border hover:border-primary text-foreground'
                              }`}
                            >
                              <div
                                className="w-4 h-4 bg-current"
                                style={{
                                  borderRadius:
                                    v === 'sharp'
                                      ? '2px'
                                      : v === 'rounded'
                                        ? '6px'
                                        : '50%',
                                }}
                              />
                              {t(`themeBuilder.effects.${v}`)}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Card Style */}
                      <div>
                        <label className="text-xs font-medium text-foreground-muted mb-3 block uppercase tracking-wide">
                          {t('themeBuilder.effects.cardStyle')}
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {(['flat', 'glass', 'neon', 'gradient'] as const).map(
                            (v) => (
                              <button
                                key={v}
                                onClick={() => updateEffect('cardStyle', v)}
                                className={`py-4 rounded-xl text-sm font-medium transition-all ${
                                  editing.effects.cardStyle === v
                                    ? 'bg-primary text-white'
                                    : 'bg-card border border-border hover:border-primary text-foreground'
                                }`}
                              >
                                {t(`themeBuilder.effects.${v}`)}
                              </button>
                            ),
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Preview Panel */}
            <div className="flex-1 flex flex-col bg-[#1a1a1a] overflow-hidden">
              {/* Preview Header */}
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white/60">
                    Live Preview
                  </span>
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                </div>
                <div className="flex items-center gap-2 bg-white/10 rounded-xl p-1">
                  <button
                    onClick={() => setPreviewDevice('mobile')}
                    className={`p-2 rounded-lg transition-colors ${previewDevice === 'mobile' ? 'bg-white/20 text-white' : 'text-white/40 hover:text-white/60'}`}
                  >
                    <Smartphone size={18} />
                  </button>
                  <button
                    onClick={() => setPreviewDevice('desktop')}
                    className={`p-2 rounded-lg transition-colors ${previewDevice === 'desktop' ? 'bg-white/20 text-white' : 'text-white/40 hover:text-white/60'}`}
                  >
                    <Monitor size={18} />
                  </button>
                </div>
              </div>

              {/* Preview Content */}
              <div className="flex-1 flex items-center justify-center p-8 overflow-auto">
                <motion.div
                  layout
                  className="relative"
                  style={{
                    width: previewDevice === 'mobile' ? 375 : 800,
                    height: previewDevice === 'mobile' ? 667 : 600,
                  }}
                >
                  {/* Device Frame */}
                  <div
                    className={`absolute inset-0 rounded-[40px] p-3 ${previewDevice === 'mobile' ? 'bg-gray-800' : 'bg-gray-700 rounded-2xl'}`}
                    style={{
                      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                    }}
                  >
                    {/* Screen */}
                    <div
                      className="w-full h-full overflow-hidden"
                      style={{
                        borderRadius:
                          previewDevice === 'mobile' ? '32px' : '8px',
                        background: c.background,
                      }}
                    >
                      {/* Bio Page Preview */}
                      <div
                        className="h-full overflow-y-auto p-6"
                        style={{ fontFamily: editing.typography.bodyFont }}
                      >
                        {/* Profile Header */}
                        <div className="text-center mb-6">
                          <div
                            className="w-24 h-24 mx-auto mb-4 rounded-full"
                            style={{
                              background: `linear-gradient(135deg, ${c.primary}, ${c.accent})`,
                              boxShadow:
                                editing.effects.glowIntensity !== 'none'
                                  ? `0 0 ${editing.effects.glowIntensity === 'strong' ? '40px' : editing.effects.glowIntensity === 'medium' ? '25px' : '15px'} ${c.primary}60`
                                  : undefined,
                            }}
                          />
                          <h1
                            className="text-2xl font-bold mb-1"
                            style={{
                              color: c.foreground,
                              fontFamily: editing.typography.displayFont,
                            }}
                          >
                            {currentUser?.name || 'Your Name'}
                          </h1>
                          <p
                            className="text-sm mb-2"
                            style={{ color: c.foregroundMuted }}
                          >
                            @{currentUser?.username || 'username'}
                          </p>
                          <p
                            className="text-sm max-w-xs mx-auto"
                            style={{ color: c.foregroundMuted }}
                          >
                            Creator • Designer • Building cool stuff ✨
                          </p>
                        </div>

                        {/* Social Icons */}
                        <div className="flex justify-center gap-3 mb-6">
                          {[Instagram, Twitter, Youtube, Music].map(
                            (Icon, i) => (
                              <div
                                key={i}
                                className="w-10 h-10 rounded-full flex items-center justify-center"
                                style={{
                                  background: c.backgroundSecondary,
                                  border: `1px solid ${c.border}`,
                                }}
                              >
                                <Icon
                                  size={18}
                                  style={{ color: c.foregroundMuted }}
                                />
                              </div>
                            ),
                          )}
                        </div>

                        {/* Links */}
                        <div className="space-y-3">
                          {[
                            {
                              icon: LinkIcon,
                              text: 'My Website',
                              color: c.primary,
                            },
                            {
                              icon: Youtube,
                              text: 'YouTube Channel',
                              color: '#ff0000',
                            },
                            {
                              icon: Music,
                              text: 'Listen on Spotify',
                              color: '#1DB954',
                            },
                            {
                              icon: Star,
                              text: 'Support My Work',
                              color: c.accent,
                            },
                          ].map((link, i) => (
                            <div
                              key={i}
                              className="flex items-center gap-3 p-4 transition-all hover:scale-[1.02]"
                              style={{
                                background:
                                  editing.effects.cardStyle === 'glass'
                                    ? `${c.card}80`
                                    : editing.effects.cardStyle === 'gradient'
                                      ? `linear-gradient(135deg, ${c.card}, ${c.backgroundSecondary})`
                                      : c.card,
                                border: `1px solid ${c.border}`,
                                borderRadius,
                                backdropFilter:
                                  editing.effects.cardStyle === 'glass'
                                    ? 'blur(10px)'
                                    : undefined,
                                boxShadow:
                                  editing.effects.cardStyle === 'neon'
                                    ? `0 0 20px ${c.primary}40, inset 0 0 20px ${c.primary}10`
                                    : undefined,
                              }}
                            >
                              <div
                                className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                                style={{ background: `${link.color}20` }}
                              >
                                <link.icon
                                  size={20}
                                  style={{ color: link.color }}
                                />
                              </div>
                              <span
                                className="font-medium flex-1"
                                style={{ color: c.foreground }}
                              >
                                {link.text}
                              </span>
                              <ChevronRight
                                size={18}
                                style={{ color: c.foregroundMuted }}
                              />
                            </div>
                          ))}
                        </div>

                        {/* Footer */}
                        <div className="mt-8 text-center">
                          <p
                            className="text-xs"
                            style={{ color: c.foregroundMuted }}
                          >
                            Made with Eziox
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Notch (mobile only) */}
                  {previewDevice === 'mobile' && (
                    <div className="absolute top-5 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-800 rounded-full" />
                  )}
                </motion.div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-background-secondary flex items-center justify-center">
                <Layers size={32} className="text-foreground-muted" />
              </div>
              <p className="text-foreground-muted mb-4">
                {t('themeBuilder.empty.select')}
              </p>
              {themes.length < maxThemes && (
                <button
                  onClick={handleCreate}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-linear-to-r from-primary to-accent text-white font-medium hover:scale-105 transition-transform"
                >
                  <Plus size={18} />
                  {t('themeBuilder.actions.new')}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
