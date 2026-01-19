import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useAuth } from '@/hooks/use-auth'
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
  Eye,
  EyeOff,
  Save,
  ChevronRight,
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
    name: 'Light',
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
]

function ThemeBuilderPage() {
  const { currentUser } = useAuth()
  const queryClient = useQueryClient()
  const getCustomThemes = useServerFn(getCustomThemesFn)
  const createTheme = useServerFn(createCustomThemeFn)
  const updateTheme = useServerFn(updateCustomThemeFn)
  const deleteTheme = useServerFn(deleteCustomThemeFn)
  const setActiveTheme = useServerFn(setActiveCustomThemeFn)
  const exportTheme = useServerFn(exportCustomThemeFn)
  const importTheme = useServerFn(importCustomThemeFn)

  const [activeTab, setActiveTab] = useState<
    'colors' | 'typography' | 'effects'
  >('colors')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [editing, setEditing] = useState<Omit<
    CustomTheme,
    'id' | 'createdAt'
  > | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [showPreview, setShowPreview] = useState(true)
  const [hasChanges, setHasChanges] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['custom-themes'],
    queryFn: () => getCustomThemes(),
  })
  const themes = data?.themes || []
  const canCreate = data?.canCreate || false
  const maxThemes = data?.maxThemes || 0

  useEffect(() => {
    if (selectedId && themes.length) {
      const t = themes.find((x) => x.id === selectedId)
      if (t)
        setEditing({
          name: t.name,
          colors: { ...t.colors },
          typography: { ...t.typography },
          effects: { ...t.effects },
        })
    }
  }, [selectedId, themes])

  const createMut = useMutation({
    mutationFn: (t: CustomTheme) => createTheme({ data: t }),
    onSuccess: (r) => {
      toast.success('Theme created!')
      setIsCreating(false)
      setSelectedId(r.theme.id)
      setHasChanges(false)
      void queryClient.invalidateQueries({ queryKey: ['custom-themes'] })
    },
    onError: () => toast.error('Failed'),
  })
  const updateMut = useMutation({
    mutationFn: (t: CustomTheme) => updateTheme({ data: t }),
    onSuccess: () => {
      toast.success('Saved!')
      setHasChanges(false)
      void queryClient.invalidateQueries({ queryKey: ['custom-themes'] })
    },
    onError: () => toast.error('Failed'),
  })
  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteTheme({ data: { themeId: id } }),
    onSuccess: () => {
      toast.success('Deleted')
      setSelectedId(null)
      setEditing(null)
      void queryClient.invalidateQueries({ queryKey: ['custom-themes'] })
    },
  })
  const activateMut = useMutation({
    mutationFn: (id: string | null) =>
      setActiveTheme({ data: { themeId: id } }),
    onSuccess: () => {
      toast.success('Activated!')
      void queryClient.invalidateQueries({ queryKey: ['custom-themes'] })
    },
  })

  const handleCreate = () => {
    setIsCreating(true)
    setSelectedId(null)
    setEditing({ ...DEFAULT_THEME })
    setHasChanges(false)
  }
  const handleSave = () => {
    if (!editing) return
    if (isCreating)
      createMut.mutate({
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        ...editing,
      })
    else if (selectedId) {
      const t = themes.find((x) => x.id === selectedId)
      if (t)
        updateMut.mutate({ ...editing, id: selectedId, createdAt: t.createdAt })
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
    toast.success('Exported!')
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
        toast.success('Imported!')
        void queryClient.invalidateQueries({ queryKey: ['custom-themes'] })
      } catch {
        toast.error('Invalid file')
      }
    }
    input.click()
  }
  const updateColor = (k: keyof CustomTheme['colors'], v: string) => {
    if (editing) {
      setEditing({ ...editing, colors: { ...editing.colors, [k]: v } })
      setHasChanges(true)
    }
  }
  const updateFont = (k: 'displayFont' | 'bodyFont', v: string) => {
    const f = FONTS.find((x) => x.name === v)
    if (editing && f) {
      setEditing({
        ...editing,
        typography: {
          ...editing.typography,
          [k]: v,
          [k === 'displayFont' ? 'displayFontUrl' : 'bodyFontUrl']: f.url,
        },
      })
      setHasChanges(true)
    }
  }
  const updateEffect = <K extends keyof CustomTheme['effects']>(
    k: K,
    v: CustomTheme['effects'][K],
  ) => {
    if (editing) {
      setEditing({ ...editing, effects: { ...editing.effects, [k]: v } })
      setHasChanges(true)
    }
  }
  const applyPreset = (p: (typeof PRESETS)[0]) => {
    if (editing) {
      setEditing({ ...editing, name: p.name, colors: { ...p.colors } })
      setHasChanges(true)
    }
  }

  if (!currentUser || isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2
          className="w-10 h-10 animate-spin"
          style={{ color: 'var(--primary)' }}
        />
      </div>
    )
  if (!canCreate)
    return (
      <div className="min-h-screen pt-28 pb-12">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div
              className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center"
              style={{
                background:
                  'linear-gradient(135deg, var(--primary), var(--accent))',
              }}
            >
              <Crown size={40} className="text-white" />
            </div>
            <h1
              className="text-3xl font-bold mb-4"
              style={{ color: 'var(--foreground)' }}
            >
              Theme Builder
            </h1>
            <p
              className="text-lg mb-8"
              style={{ color: 'var(--foreground-muted)' }}
            >
              Create custom themes with Pro or higher.
            </p>
            <Link
              to="/profile"
              search={{ tab: 'subscription' }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white"
              style={{
                background:
                  'linear-gradient(135deg, var(--primary), var(--accent))',
              }}
            >
              <Crown size={20} />
              Upgrade
              <ChevronRight size={18} />
            </Link>
          </motion.div>
        </div>
      </div>
    )

  const isSaving = createMut.isPending || updateMut.isPending
  const c = editing?.colors || DEFAULT_THEME.colors

  return (
    <div className="min-h-screen pt-28 pb-12">
      <div className="max-w-7xl mx-auto px-4 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{
                background:
                  'linear-gradient(135deg, var(--primary), var(--accent))',
              }}
            >
              <Paintbrush size={24} className="text-white" />
            </div>
            <div>
              <h1
                className="text-2xl font-bold"
                style={{ color: 'var(--foreground)' }}
              >
                Theme Builder
              </h1>
              <p
                className="text-sm"
                style={{ color: 'var(--foreground-muted)' }}
              >
                {themes.length}/{maxThemes} themes
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleImport}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm"
              style={{
                background: 'var(--background-secondary)',
                border: '1px solid var(--border)',
                color: 'var(--foreground)',
              }}
            >
              <Upload size={16} />
              Import
            </button>
            {themes.length < maxThemes && (
              <button
                onClick={handleCreate}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
                style={{ background: 'var(--primary)' }}
              >
                <Plus size={16} />
                New
              </button>
            )}
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* List */}
          <div className="lg:w-56 shrink-0">
            <div
              className="rounded-2xl p-4 space-y-2"
              style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
              }}
            >
              <h3
                className="text-xs font-semibold uppercase mb-3"
                style={{ color: 'var(--foreground-muted)' }}
              >
                Themes
              </h3>
              {themes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setSelectedId(t.id)
                    setIsCreating(false)
                    setHasChanges(false)
                  }}
                  className="w-full p-3 rounded-xl text-left"
                  style={{
                    background:
                      selectedId === t.id
                        ? 'var(--primary)'
                        : 'var(--background-secondary)',
                    color: selectedId === t.id ? '#fff' : 'var(--foreground)',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-5 h-5 rounded"
                      style={{
                        background: `linear-gradient(135deg, ${t.colors.primary}, ${t.colors.accent})`,
                      }}
                    />
                    <span className="text-sm truncate">{t.name}</span>
                    {data?.activeThemeId === t.id && (
                      <Check size={12} className="ml-auto" />
                    )}
                  </div>
                </button>
              ))}
              {isCreating && (
                <div
                  className="p-3 rounded-xl"
                  style={{ background: 'var(--primary)', color: '#fff' }}
                >
                  <div className="flex items-center gap-2">
                    <Plus size={14} />
                    <span className="text-sm">New Theme</span>
                  </div>
                </div>
              )}
              {!themes.length && !isCreating && (
                <p
                  className="text-sm text-center py-4"
                  style={{ color: 'var(--foreground-muted)' }}
                >
                  No themes
                </p>
              )}
            </div>
          </div>
          {/* Editor */}
          {editing ? (
            <div className="flex-1">
              <div
                className="rounded-2xl overflow-hidden"
                style={{
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                }}
              >
                <div
                  className="flex items-center justify-between p-4 border-b"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <input
                    value={editing.name}
                    onChange={(e) => {
                      setEditing({ ...editing, name: e.target.value })
                      setHasChanges(true)
                    }}
                    className="text-lg font-bold bg-transparent outline-none"
                    style={{ color: 'var(--foreground)' }}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowPreview(!showPreview)}
                      className="p-2 rounded-lg"
                      style={{ background: 'var(--background-secondary)' }}
                    >
                      {showPreview ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    {selectedId && (
                      <>
                        <button
                          onClick={handleExport}
                          className="p-2 rounded-lg"
                          style={{ background: 'var(--background-secondary)' }}
                        >
                          <Download size={16} />
                        </button>
                        <button
                          onClick={() => activateMut.mutate(selectedId)}
                          disabled={data?.activeThemeId === selectedId}
                          className="px-3 py-2 rounded-lg text-sm"
                          style={{
                            background:
                              data?.activeThemeId === selectedId
                                ? 'var(--primary)'
                                : 'var(--background-secondary)',
                            color:
                              data?.activeThemeId === selectedId
                                ? '#fff'
                                : 'var(--foreground)',
                          }}
                        >
                          {data?.activeThemeId === selectedId
                            ? 'Active'
                            : 'Activate'}
                        </button>
                        <button
                          onClick={() => deleteMut.mutate(selectedId)}
                          className="p-2 rounded-lg hover:bg-red-500/10"
                        >
                          <Trash2 size={16} style={{ color: '#ef4444' }} />
                        </button>
                      </>
                    )}
                    <button
                      onClick={handleSave}
                      disabled={!hasChanges || isSaving}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50"
                      style={{
                        background: hasChanges
                          ? 'var(--primary)'
                          : 'var(--background-secondary)',
                      }}
                    >
                      {isSaving ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Save size={16} />
                      )}
                      Save
                    </button>
                  </div>
                </div>
                <div
                  className="flex border-b p-1 gap-1"
                  style={{
                    borderColor: 'var(--border)',
                    background: 'var(--background-secondary)',
                  }}
                >
                  {[
                    { id: 'colors', icon: Palette },
                    { id: 'typography', icon: Type },
                    { id: 'effects', icon: Sparkles },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setActiveTab(t.id as typeof activeTab)}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm"
                      style={{
                        background:
                          activeTab === t.id ? 'var(--card)' : 'transparent',
                        color:
                          activeTab === t.id
                            ? 'var(--foreground)'
                            : 'var(--foreground-muted)',
                      }}
                    >
                      <t.icon size={16} />
                      {t.id}
                    </button>
                  ))}
                </div>
                <div className="flex">
                  <div className="flex-1 p-6 max-h-[60vh] overflow-y-auto">
                    <AnimatePresence mode="wait">
                      {activeTab === 'colors' && (
                        <motion.div
                          key="c"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="space-y-6"
                        >
                          <div>
                            <label
                              className="text-xs font-semibold uppercase mb-3 block"
                              style={{ color: 'var(--foreground-muted)' }}
                            >
                              Presets
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                              {PRESETS.map((p) => (
                                <button
                                  key={p.name}
                                  onClick={() => applyPreset(p)}
                                  className="p-2 rounded-xl hover:scale-105 transition"
                                  style={{
                                    background: p.colors.background,
                                    border: `1px solid ${p.colors.border}`,
                                  }}
                                >
                                  <div className="flex justify-center gap-1 mb-1">
                                    <div
                                      className="w-3 h-3 rounded-full"
                                      style={{ background: p.colors.primary }}
                                    />
                                    <div
                                      className="w-3 h-3 rounded-full"
                                      style={{ background: p.colors.accent }}
                                    />
                                  </div>
                                  <span
                                    className="text-[10px]"
                                    style={{ color: p.colors.foreground }}
                                  >
                                    {p.name}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            {Object.entries(editing.colors).map(([k, v]) => (
                              <div key={k}>
                                <label
                                  className="text-xs mb-2 block capitalize"
                                  style={{ color: 'var(--foreground)' }}
                                >
                                  {k.replace(/([A-Z])/g, ' $1')}
                                </label>
                                <div className="flex gap-2">
                                  <input
                                    type="color"
                                    value={v}
                                    onChange={(e) =>
                                      updateColor(
                                        k as keyof CustomTheme['colors'],
                                        e.target.value,
                                      )
                                    }
                                    className="w-10 h-10 rounded-lg cursor-pointer border-0"
                                  />
                                  <input
                                    type="text"
                                    value={v}
                                    onChange={(e) =>
                                      updateColor(
                                        k as keyof CustomTheme['colors'],
                                        e.target.value,
                                      )
                                    }
                                    className="flex-1 px-3 py-2 rounded-lg text-sm font-mono"
                                    style={{
                                      background: 'var(--background-secondary)',
                                      color: 'var(--foreground)',
                                      border: '1px solid var(--border)',
                                    }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                      {activeTab === 'typography' && (
                        <motion.div
                          key="t"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="space-y-4"
                        >
                          <div>
                            <label
                              className="text-xs mb-2 block"
                              style={{ color: 'var(--foreground)' }}
                            >
                              Display Font
                            </label>
                            <select
                              value={editing.typography.displayFont}
                              onChange={(e) =>
                                updateFont('displayFont', e.target.value)
                              }
                              className="w-full px-4 py-3 rounded-xl"
                              style={{
                                background: 'var(--background-secondary)',
                                color: 'var(--foreground)',
                                border: '1px solid var(--border)',
                              }}
                            >
                              {FONTS.map((f) => (
                                <option key={f.name} value={f.name}>
                                  {f.name}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label
                              className="text-xs mb-2 block"
                              style={{ color: 'var(--foreground)' }}
                            >
                              Body Font
                            </label>
                            <select
                              value={editing.typography.bodyFont}
                              onChange={(e) =>
                                updateFont('bodyFont', e.target.value)
                              }
                              className="w-full px-4 py-3 rounded-xl"
                              style={{
                                background: 'var(--background-secondary)',
                                color: 'var(--foreground)',
                                border: '1px solid var(--border)',
                              }}
                            >
                              {FONTS.map((f) => (
                                <option key={f.name} value={f.name}>
                                  {f.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </motion.div>
                      )}
                      {activeTab === 'effects' && (
                        <motion.div
                          key="e"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="space-y-4"
                        >
                          <div>
                            <label
                              className="text-xs mb-2 block"
                              style={{ color: 'var(--foreground)' }}
                            >
                              Glow Intensity
                            </label>
                            <div className="flex gap-2">
                              {(
                                ['none', 'subtle', 'medium', 'strong'] as const
                              ).map((v) => (
                                <button
                                  key={v}
                                  onClick={() =>
                                    updateEffect('glowIntensity', v)
                                  }
                                  className="flex-1 py-2 rounded-lg text-xs capitalize"
                                  style={{
                                    background:
                                      editing.effects.glowIntensity === v
                                        ? 'var(--primary)'
                                        : 'var(--background-secondary)',
                                    color:
                                      editing.effects.glowIntensity === v
                                        ? '#fff'
                                        : 'var(--foreground)',
                                  }}
                                >
                                  {v}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div>
                            <label
                              className="text-xs mb-2 block"
                              style={{ color: 'var(--foreground)' }}
                            >
                              Border Radius
                            </label>
                            <div className="flex gap-2">
                              {(['sharp', 'rounded', 'pill'] as const).map(
                                (v) => (
                                  <button
                                    key={v}
                                    onClick={() =>
                                      updateEffect('borderRadius', v)
                                    }
                                    className="flex-1 py-2 rounded-lg text-xs capitalize"
                                    style={{
                                      background:
                                        editing.effects.borderRadius === v
                                          ? 'var(--primary)'
                                          : 'var(--background-secondary)',
                                      color:
                                        editing.effects.borderRadius === v
                                          ? '#fff'
                                          : 'var(--foreground)',
                                    }}
                                  >
                                    {v}
                                  </button>
                                ),
                              )}
                            </div>
                          </div>
                          <div>
                            <label
                              className="text-xs mb-2 block"
                              style={{ color: 'var(--foreground)' }}
                            >
                              Card Style
                            </label>
                            <div className="flex gap-2">
                              {(
                                ['flat', 'glass', 'neon', 'gradient'] as const
                              ).map((v) => (
                                <button
                                  key={v}
                                  onClick={() => updateEffect('cardStyle', v)}
                                  className="flex-1 py-2 rounded-lg text-xs capitalize"
                                  style={{
                                    background:
                                      editing.effects.cardStyle === v
                                        ? 'var(--primary)'
                                        : 'var(--background-secondary)',
                                    color:
                                      editing.effects.cardStyle === v
                                        ? '#fff'
                                        : 'var(--foreground)',
                                  }}
                                >
                                  {v}
                                </button>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  {showPreview && (
                    <div
                      className="w-72 border-l p-4"
                      style={{
                        borderColor: 'var(--border)',
                        background: c.background,
                      }}
                    >
                      <div
                        className="rounded-xl p-4"
                        style={{
                          background: c.card,
                          border: `1px solid ${c.border}`,
                        }}
                      >
                        <div
                          className="w-12 h-12 rounded-full mx-auto mb-3"
                          style={{
                            background: `linear-gradient(135deg, ${c.primary}, ${c.accent})`,
                          }}
                        />
                        <h3
                          className="text-center font-bold mb-1"
                          style={{
                            color: c.foreground,
                            fontFamily: editing.typography.displayFont,
                          }}
                        >
                          Preview
                        </h3>
                        <p
                          className="text-center text-xs mb-4"
                          style={{
                            color: c.foregroundMuted,
                            fontFamily: editing.typography.bodyFont,
                          }}
                        >
                          Theme preview
                        </p>
                        <div className="space-y-2">
                          {['Link 1', 'Link 2'].map((l) => (
                            <div
                              key={l}
                              className="py-2 px-3 rounded-lg text-sm text-center"
                              style={{
                                background: c.backgroundSecondary,
                                color: c.foreground,
                                border: `1px solid ${c.border}`,
                              }}
                            >
                              {l}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center py-20">
              <p style={{ color: 'var(--foreground-muted)' }}>
                Select or create a theme
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
