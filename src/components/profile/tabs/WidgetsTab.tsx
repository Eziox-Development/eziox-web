import { useState } from 'react'
import { motion, AnimatePresence, Reorder } from 'motion/react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { useTranslation } from 'react-i18next'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  getMyWidgetsFn, getWidgetTypesFn, createWidgetFn, updateWidgetFn, deleteWidgetFn, reorderWidgetsFn,
} from '@/server/functions/widgets'
import { DateTimePicker } from '@/components/ui/date-time-picker'
import { LocationSearch } from '@/components/ui/location-search'
import {
  Plus, GripVertical, Trash2, X, Loader2, ToggleLeft, ToggleRight, Crown, Settings, Eye, EyeOff,
  CloudSun, Timer, Smartphone, Headphones, Package, Sparkles, type LucideIcon,
} from 'lucide-react'
import { SiTwitch, SiYoutube, SiGithub } from 'react-icons/si'
import type { IconType } from 'react-icons'

const LUCIDE_ICON_MAP: Record<string, LucideIcon> = { CloudSun, Timer, Smartphone, Headphones }
const REACT_ICON_MAP: Record<string, IconType> = { Youtube: SiYoutube, Twitch: SiTwitch, Github: SiGithub }

type Widget = { id: string; type: string; title: string | null; isActive: boolean | null; order: number | null; config?: Record<string, unknown> | null }
type WidgetType = { id: string; name: string; description: string; icon: string; premium: boolean; available: boolean }

const inputCls = 'w-full px-4 py-3 rounded-xl bg-background-secondary/40 backdrop-blur-sm border border-border/20 text-foreground placeholder-foreground-muted/40 focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 theme-animation'
const inputSmCls = 'w-full px-3 py-2 rounded-lg bg-background-secondary/40 backdrop-blur-sm border border-border/20 text-foreground text-sm placeholder-foreground-muted/40 focus:outline-none focus:border-primary/40 theme-animation'

export function WidgetsTab() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [isAddingWidget, setIsAddingWidget] = useState(false)
  const [editingWidget, setEditingWidget] = useState<Widget | null>(null)
  const [selectedType, setSelectedType] = useState<string | null>(null)

  const getMyWidgets = useServerFn(getMyWidgetsFn)
  const getWidgetTypes = useServerFn(getWidgetTypesFn)
  const createWidget = useServerFn(createWidgetFn)
  const updateWidget = useServerFn(updateWidgetFn)
  const deleteWidget = useServerFn(deleteWidgetFn)
  const reorderWidgets = useServerFn(reorderWidgetsFn)

  const { data: widgets = [], isLoading } = useQuery({ queryKey: ['my-widgets'], queryFn: () => getMyWidgets() })
  const { data: widgetTypes = [] } = useQuery({ queryKey: ['widget-types'], queryFn: () => getWidgetTypes() })

  const createMutation = useMutation({
    mutationFn: (data: { type: string; title?: string; config?: Record<string, unknown> }) => createWidget({ data }),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: ['my-widgets'] }); setIsAddingWidget(false); setSelectedType(null) },
  })
  const updateMutation = useMutation({
    mutationFn: (data: { id: string; title?: string; isActive?: boolean; config?: Record<string, unknown> }) => updateWidget({ data }),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: ['my-widgets'] }); setEditingWidget(null) },
  })
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteWidget({ data: { id } }),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: ['my-widgets'] }) },
  })
  const reorderMutation = useMutation({
    mutationFn: (data: { id: string; order: number }[]) => reorderWidgets({ data: { widgets: data } }),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: ['my-widgets'] }) },
  })

  const handleReorder = (newOrder: typeof widgets) => { reorderMutation.mutate(newOrder.map((w, i) => ({ id: w.id, order: i }))) }
  const handleAddWidget = () => { if (!selectedType) return; const wt = widgetTypes.find((t) => t.id === selectedType); createMutation.mutate({ type: selectedType, title: wt?.name }) }
  const handleToggleActive = (widget: Widget) => { updateMutation.mutate({ id: widget.id, isActive: !widget.isActive }) }

  const getWidgetIcon = (type: string): LucideIcon | IconType => {
    const wt = widgetTypes.find((t) => t.id === type); const iconName = wt?.icon || 'Package'
    if (REACT_ICON_MAP[iconName]) return REACT_ICON_MAP[iconName]; return LUCIDE_ICON_MAP[iconName] || Package
  }
  const getWidgetName = (type: string) => { const wt = widgetTypes.find((t) => t.id === type); return wt?.name || type }

  return (
    <motion.div key="widgets" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">{t('dashboard.widgets.title', 'Profile Widgets')}</h2>
          <p className="text-sm text-foreground-muted">{t('dashboard.widgets.description', 'Add interactive widgets to your bio page')}</p>
        </div>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => setIsAddingWidget(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium bg-linear-to-br from-primary to-accent text-primary-foreground glow-primary">
          <Plus size={18} />{t('dashboard.widgets.addWidget', 'Add Widget')}
        </motion.button>
      </div>

      {/* Add Widget Panel */}
      <AnimatePresence>
        {isAddingWidget && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="rounded-2xl backdrop-blur-xl bg-card/30 border border-border/20">
              <div className="p-5 flex items-center justify-between border-b border-border/15">
                <h3 className="font-bold text-foreground">{t('dashboard.widgets.selectWidget', 'Select Widget Type')}</h3>
                <button onClick={() => { setIsAddingWidget(false); setSelectedType(null) }} className="p-2 rounded-lg hover:bg-card/50 theme-animation"><X size={18} className="text-foreground-muted" /></button>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                  {widgetTypes.map((type: WidgetType) => (
                    <motion.button key={type.id} whileHover={{ scale: type.available ? 1.02 : 1 }} whileTap={{ scale: type.available ? 0.98 : 1 }}
                      onClick={() => type.available && setSelectedType(type.id)} disabled={!type.available}
                      className={`relative p-4 rounded-xl border text-left theme-animation ${
                        selectedType === type.id ? 'border-primary/40 bg-primary/8 glow-primary' : type.available ? 'border-border/20 hover:border-border/40 hover:bg-card/30' : 'border-border/10 opacity-40 cursor-not-allowed'
                      }`}>
                      {type.premium && !type.available && <div className="absolute top-2 right-2"><Crown size={14} className="text-amber-400" /></div>}
                      <div className="mb-2">{(() => { const Icon = REACT_ICON_MAP[type.icon] || LUCIDE_ICON_MAP[type.icon] || Package; return <Icon size={24} className="text-foreground" /> })()}</div>
                      <p className="font-medium text-foreground text-sm">{type.name}</p>
                      <p className="text-xs text-foreground-muted mt-1 line-clamp-2">{type.description}</p>
                    </motion.button>
                  ))}
                </div>
                <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} onClick={handleAddWidget} disabled={!selectedType || createMutation.isPending}
                  className="w-full py-3 rounded-xl font-medium text-primary-foreground bg-linear-to-r from-primary to-accent disabled:opacity-50 flex items-center justify-center gap-2 glow-primary">
                  {createMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}{t('dashboard.widgets.addWidget', 'Add Widget')}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Widgets List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12"><Loader2 size={32} className="animate-spin text-primary" /></div>
      ) : widgets.length === 0 ? (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="rounded-2xl backdrop-blur-xl bg-card/30 border border-border/20 p-12 text-center">
          <Sparkles size={48} className="mx-auto mb-4 text-foreground-muted/30" />
          <p className="text-foreground-muted mb-2">{t('dashboard.widgets.noWidgets', 'No widgets yet')}</p>
          <p className="text-sm text-foreground-muted/50">{t('dashboard.widgets.addFirst', 'Add your first widget to enhance your bio page')}</p>
        </motion.div>
      ) : (
        <Reorder.Group axis="y" values={widgets} onReorder={handleReorder} className="space-y-3">
          {widgets.map((widget, index) => (
            <Reorder.Item key={widget.id} value={widget}>
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`rounded-2xl overflow-hidden backdrop-blur-xl border cursor-grab active:cursor-grabbing theme-animation ${
                  widget.isActive ? 'bg-card/30 border-border/20 hover:border-border/40' : 'bg-card/15 border-border/10 opacity-60'
                }`}>
                <div className="p-4 flex items-center gap-4">
                  <GripVertical size={20} className="text-foreground-muted/40 shrink-0" />
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-background-secondary/30 backdrop-blur-sm border border-border/10">
                    {(() => { const Icon = getWidgetIcon(widget.type); return <Icon size={24} className="text-foreground" /> })()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{widget.title || getWidgetName(widget.type)}</p>
                    <p className="text-sm text-foreground-muted truncate">{getWidgetName(widget.type)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleToggleActive(widget as Widget)}
                      className={`p-2 rounded-lg theme-animation ${widget.isActive ? 'text-emerald-400 hover:bg-emerald-500/15' : 'text-foreground-muted hover:bg-card/50'}`}>
                      {widget.isActive ? <Eye size={18} /> : <EyeOff size={18} />}
                    </motion.button>
                    <button onClick={() => setEditingWidget(widget as Widget)} className="p-2 rounded-lg hover:bg-card/50 theme-animation"><Settings size={16} className="text-foreground-muted" /></button>
                    <button onClick={() => deleteMutation.mutate(widget.id)} className="p-2 rounded-lg hover:bg-destructive/15 theme-animation"><Trash2 size={16} className="text-destructive" /></button>
                  </div>
                </div>
              </motion.div>
            </Reorder.Item>
          ))}
        </Reorder.Group>
      )}

      {/* Edit Widget Modal */}
      <AnimatePresence>
        {editingWidget && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setEditingWidget(null)}>
            <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
              transition={{ type: 'spring' as const, stiffness: 400, damping: 30 }}
              className="w-full max-w-md p-6 rounded-2xl backdrop-blur-xl bg-card/80 border border-border/30 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-foreground">{t('dashboard.widgets.editWidget', 'Edit Widget')}</h3>
                <button onClick={() => setEditingWidget(null)} className="p-2 rounded-lg hover:bg-card/50 theme-animation"><X size={18} className="text-foreground-muted" /></button>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 rounded-xl bg-background-secondary/20 backdrop-blur-sm border border-border/10">
                  <div>{(() => { const Icon = getWidgetIcon(editingWidget.type); return <Icon size={32} className="text-foreground" /> })()}</div>
                  <div><p className="font-medium text-foreground">{getWidgetName(editingWidget.type)}</p><p className="text-sm text-foreground-muted">{editingWidget.type}</p></div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground-muted mb-2">{t('dashboard.widgets.widgetTitle', 'Widget Title')}</label>
                  <input type="text" value={editingWidget.title || ''} onChange={(e) => setEditingWidget({ ...editingWidget, title: e.target.value })} placeholder={getWidgetName(editingWidget.type)} className={inputCls} />
                </div>

                {/* Widget-specific configs */}
                {editingWidget.type === 'countdown' && (
                  <div className="space-y-3 p-4 rounded-xl bg-background-secondary/15 backdrop-blur-sm border border-border/10">
                    <h4 className="text-sm font-medium text-foreground">{t('dashboard.widgets.config.countdown', 'Countdown Settings')}</h4>
                    <div><label className="block text-xs text-foreground-muted mb-2">{t('dashboard.widgets.config.targetDate', 'Target Date')}</label>
                      <DateTimePicker value={(editingWidget.config?.targetDate as string) || ''} onChange={(v) => setEditingWidget({ ...editingWidget, config: { ...editingWidget.config, targetDate: v } })} placeholder={t('dashboard.widgets.config.selectDateTime', 'Select date and time')} />
                    </div>
                  </div>
                )}
                {editingWidget.type === 'youtube' && (
                  <div className="space-y-3 p-4 rounded-xl bg-background-secondary/15 backdrop-blur-sm border border-border/10">
                    <h4 className="text-sm font-medium text-foreground">{t('dashboard.widgets.config.youtube', 'YouTube Settings')}</h4>
                    <div><label className="block text-xs text-foreground-muted mb-1">{t('dashboard.widgets.config.videoId', 'Video ID')}</label>
                      <input type="text" value={(editingWidget.config?.videoId as string) || ''} onChange={(e) => setEditingWidget({ ...editingWidget, config: { ...editingWidget.config, videoId: e.target.value } })} placeholder="dQw4w9WgXcQ" className={inputSmCls} />
                    </div>
                  </div>
                )}
                {editingWidget.type === 'weather' && (
                  <div className="space-y-3 p-4 rounded-xl bg-background-secondary/15 backdrop-blur-sm border border-border/10">
                    <h4 className="text-sm font-medium text-foreground">{t('dashboard.widgets.config.weather', 'Weather Settings')}</h4>
                    <div><label className="block text-xs text-foreground-muted mb-2">{t('dashboard.widgets.config.position', 'Position')}</label>
                      <div className="grid grid-cols-2 gap-2">
                        {[{ value: 'top-left', label: t('dashboard.widgets.config.topLeft', 'Top Left') }, { value: 'top-right', label: t('dashboard.widgets.config.topRight', 'Top Right') }, { value: 'bottom-left', label: t('dashboard.widgets.config.bottomLeft', 'Bottom Left') }, { value: 'bottom-right', label: t('dashboard.widgets.config.bottomRight', 'Bottom Right') }].map((pos) => (
                          <button key={pos.value} type="button" onClick={() => setEditingWidget({ ...editingWidget, config: { ...editingWidget.config, position: pos.value } })}
                            className={`px-3 py-2 rounded-lg text-sm font-medium theme-animation ${(editingWidget.config?.position as string) === pos.value ? 'bg-primary text-primary-foreground' : 'bg-background-secondary/30 border border-border/20 text-foreground hover:border-primary/30'}`}>
                            {pos.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div><label className="block text-xs text-foreground-muted mb-1">{t('dashboard.widgets.config.location', 'Location')}</label>
                      <LocationSearch value={(editingWidget.config?.location as string) || ''} onChange={(location, coords) => setEditingWidget({ ...editingWidget, config: { ...editingWidget.config, location, ...(coords && { lat: coords.lat, lon: coords.lon }) } })} />
                    </div>
                  </div>
                )}
                {editingWidget.type === 'soundcloud' && (
                  <div className="space-y-3 p-4 rounded-xl bg-background-secondary/15 backdrop-blur-sm border border-border/10">
                    <h4 className="text-sm font-medium text-foreground">{t('dashboard.widgets.config.soundcloud', 'SoundCloud Settings')}</h4>
                    <div><label className="block text-xs text-foreground-muted mb-1">{t('dashboard.widgets.config.trackUrl', 'Track URL')}</label>
                      <input type="url" value={(editingWidget.config?.trackUrl as string) || ''} onChange={(e) => setEditingWidget({ ...editingWidget, config: { ...editingWidget.config, trackUrl: e.target.value } })} placeholder="https://soundcloud.com/artist/track" className={inputSmCls} />
                    </div>
                  </div>
                )}
                {editingWidget.type === 'twitch' && (
                  <div className="space-y-3 p-4 rounded-xl bg-background-secondary/15 backdrop-blur-sm border border-border/10">
                    <h4 className="text-sm font-medium text-foreground">{t('dashboard.widgets.config.twitch', 'Twitch Settings')}</h4>
                    <div><label className="block text-xs text-foreground-muted mb-1">{t('dashboard.widgets.config.channelName', 'Channel Name')}</label>
                      <input type="text" value={(editingWidget.config?.channelName as string) || ''} onChange={(e) => setEditingWidget({ ...editingWidget, config: { ...editingWidget.config, channelName: e.target.value } })} placeholder="ninja" className={inputSmCls} />
                    </div>
                  </div>
                )}
                {editingWidget.type === 'github' && (
                  <div className="space-y-3 p-4 rounded-xl bg-background-secondary/15 backdrop-blur-sm border border-border/10">
                    <h4 className="text-sm font-medium text-foreground">{t('dashboard.widgets.config.github', 'GitHub Settings')}</h4>
                    <div><label className="block text-xs text-foreground-muted mb-1">{t('dashboard.widgets.config.username', 'Username')}</label>
                      <input type="text" value={(editingWidget.config?.username as string) || ''} onChange={(e) => setEditingWidget({ ...editingWidget, config: { ...editingWidget.config, username: e.target.value } })} placeholder="octocat" className={inputSmCls} />
                    </div>
                  </div>
                )}
                {editingWidget.type === 'social_feed' && (
                  <div className="space-y-3 p-4 rounded-xl bg-background-secondary/15 backdrop-blur-sm border border-border/10">
                    <h4 className="text-sm font-medium text-foreground">{t('dashboard.widgets.config.socialFeed', 'Social Feed Settings')}</h4>
                    <div><label className="block text-xs text-foreground-muted mb-1">{t('dashboard.widgets.config.platform', 'Platform')}</label>
                      <Select value={(editingWidget.config?.platform as string) || ''} onValueChange={(v) => setEditingWidget({ ...editingWidget, config: { ...editingWidget.config, platform: v } })}>
                        <SelectTrigger className="w-full h-10"><SelectValue placeholder="Select platform..." /></SelectTrigger>
                        <SelectContent><SelectItem value="twitter">Twitter/X</SelectItem><SelectItem value="instagram">Instagram</SelectItem><SelectItem value="tiktok">TikTok</SelectItem><SelectItem value="youtube">YouTube</SelectItem></SelectContent>
                      </Select>
                    </div>
                    <div><label className="block text-xs text-foreground-muted mb-1">{t('dashboard.widgets.config.username', 'Username')}</label>
                      <input type="text" value={(editingWidget.config?.username as string) || ''} onChange={(e) => setEditingWidget({ ...editingWidget, config: { ...editingWidget.config, username: e.target.value } })} placeholder="username" className={inputSmCls} />
                    </div>
                  </div>
                )}

                {/* Visibility Toggle */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-background-secondary/20 backdrop-blur-sm border border-border/10">
                  <div>
                    <p className="font-medium text-foreground">{t('dashboard.widgets.visibility', 'Visibility')}</p>
                    <p className="text-sm text-foreground-muted">{editingWidget.isActive ? t('dashboard.widgets.visible', 'Visible on your bio page') : t('dashboard.widgets.hidden', 'Hidden from visitors')}</p>
                  </div>
                  <button onClick={() => setEditingWidget({ ...editingWidget, isActive: !editingWidget.isActive })} className="p-2">
                    {editingWidget.isActive ? <ToggleRight size={32} className="text-emerald-400" /> : <ToggleLeft size={32} className="text-foreground-muted" />}
                  </button>
                </div>

                <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                  onClick={() => {
                    const configToSave = editingWidget.config && Object.keys(editingWidget.config).length > 0 ? editingWidget.config : undefined
                    updateMutation.mutate({ id: editingWidget.id, title: editingWidget.title || undefined, isActive: editingWidget.isActive ?? true, config: configToSave })
                  }}
                  disabled={updateMutation.isPending}
                  className="w-full py-3 rounded-xl font-medium text-primary-foreground bg-linear-to-r from-primary to-accent disabled:opacity-50 flex items-center justify-center gap-2 glow-primary">
                  {updateMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : null}{t('dashboard.save')}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
