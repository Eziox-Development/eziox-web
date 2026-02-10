import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/components/layout/ThemeProvider'
import { toast } from 'sonner'
import {
  getIncidentsFn,
  createIncidentFn,
  updateIncidentFn,
} from '@/server/functions/status'
import {
  AlertTriangle,
  CheckCircle2,
  Plus,
  Send,
  Loader2,
  X,
  Clock,
  Activity,
  ChevronDown,
} from 'lucide-react'

const SEVERITY_COLORS: Record<string, string> = {
  minor: '#f59e0b',
  major: '#f97316',
  critical: '#ef4444',
}

const STATUS_COLORS: Record<string, string> = {
  investigating: '#ef4444',
  identified: '#f97316',
  monitoring: '#3b82f6',
  resolved: '#22c55e',
}

export function IncidentsTab() {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const queryClient = useQueryClient()

  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null)
  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    severity: 'minor' as 'minor' | 'major' | 'critical',
    affectedServices: [] as string[],
  })
  const [updateForm, setUpdateForm] = useState({
    message: '',
    status: 'investigating' as 'investigating' | 'identified' | 'monitoring' | 'resolved',
  })

  const getIncidents = useServerFn(getIncidentsFn)
  const createIncident = useServerFn(createIncidentFn)
  const updateIncident = useServerFn(updateIncidentFn)

  const { data: incidents, isLoading } = useQuery({
    queryKey: ['admin', 'incidents'],
    queryFn: () => getIncidents(),
    refetchInterval: 15000,
  })

  const createMutation = useMutation({
    mutationFn: () =>
      createIncident({
        data: {
          title: createForm.title,
          description: createForm.description,
          severity: createForm.severity,
          affectedServices: createForm.affectedServices,
        },
      }),
    onSuccess: () => {
      toast.success(t('admin.incidents.created', 'Incident created'))
      setShowCreateForm(false)
      setCreateForm({ title: '', description: '', severity: 'minor', affectedServices: [] })
      void queryClient.invalidateQueries({ queryKey: ['admin', 'incidents'] })
      void queryClient.invalidateQueries({ queryKey: ['status-incidents'] })
    },
    onError: () => toast.error(t('admin.incidents.createFailed', 'Failed to create incident')),
  })

  const updateMutation = useMutation({
    mutationFn: (incidentId: string) =>
      updateIncident({
        data: {
          incidentId,
          message: updateForm.message,
          status: updateForm.status,
        },
      }),
    onSuccess: () => {
      toast.success(t('admin.incidents.updated', 'Incident updated'))
      setUpdateForm({ message: '', status: 'investigating' })
      setSelectedIncidentId(null)
      void queryClient.invalidateQueries({ queryKey: ['admin', 'incidents'] })
      void queryClient.invalidateQueries({ queryKey: ['status-incidents'] })
    },
    onError: () => toast.error(t('admin.incidents.updateFailed', 'Failed to update incident')),
  })

  const activeCount = incidents?.active?.length || 0
  const resolvedCount = incidents?.resolved?.length || 0

  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ background: '#f59e0b15' }}
          >
            <Activity size={24} style={{ color: '#f59e0b' }} />
          </div>
          <div>
            <h1 className="text-xl font-bold" style={{ color: theme.colors.foreground }}>
              {t('admin.incidents.title', 'Incident Management')}
            </h1>
            <p className="text-sm" style={{ color: theme.colors.foregroundMuted }}>
              {t('admin.incidents.description', 'Create and manage service incidents')}
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-all hover:scale-[1.02]"
          style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})` }}
        >
          <Plus size={16} />
          {t('admin.incidents.create', 'New Incident')}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: t('admin.incidents.activeIncidents', 'Active'), value: activeCount, icon: AlertTriangle, color: '#ef4444' },
          { label: t('admin.incidents.resolvedIncidents', 'Resolved'), value: resolvedCount, icon: CheckCircle2, color: '#22c55e' },
          { label: t('admin.incidents.totalIncidents', 'Total'), value: activeCount + resolvedCount, icon: Activity, color: theme.colors.primary },
          { label: t('admin.incidents.last30Days', 'Last 30 days'), value: resolvedCount, icon: Clock, color: '#3b82f6' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="p-4 rounded-xl"
            style={{ background: `${theme.colors.card}80`, border: `1px solid ${theme.colors.border}` }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${stat.color}15` }}>
                <stat.icon size={20} style={{ color: stat.color }} />
              </div>
              <div>
                <p className="text-xl font-bold" style={{ color: theme.colors.foreground }}>{stat.value}</p>
                <p className="text-xs" style={{ color: theme.colors.foregroundMuted }}>{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Active Incidents */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: theme.colors.foregroundMuted }}>
          <AlertTriangle size={14} style={{ color: '#ef4444' }} />
          {t('admin.incidents.activeIncidents', 'Active Incidents')}
          {activeCount > 0 && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold" style={{ background: '#ef444420', color: '#ef4444' }}>
              {activeCount}
            </span>
          )}
        </h2>

        {isLoading ? (
          <div className="p-8 text-center">
            <Loader2 className="w-6 h-6 mx-auto animate-spin" style={{ color: theme.colors.primary }} />
          </div>
        ) : activeCount === 0 ? (
          <div
            className="p-8 text-center rounded-xl"
            style={{ background: `${theme.colors.card}80`, border: `1px solid ${theme.colors.border}` }}
          >
            <CheckCircle2 size={32} className="mx-auto mb-2" style={{ color: '#22c55e', opacity: 0.4 }} />
            <p className="text-sm font-medium" style={{ color: theme.colors.foreground }}>
              {t('admin.incidents.noActive', 'No active incidents')}
            </p>
            <p className="text-xs mt-1" style={{ color: theme.colors.foregroundMuted }}>
              {t('admin.incidents.noActiveDesc', 'All systems are operating normally')}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {incidents!.active.map((incident) => {
              const color = SEVERITY_COLORS[incident.severity] || '#f59e0b'
              const isSelected = selectedIncidentId === incident.id
              return (
                <div
                  key={incident.id}
                  className="rounded-xl overflow-hidden"
                  style={{ background: `${theme.colors.card}80`, border: `1px solid ${color}25`, borderLeft: `3px solid ${color}` }}
                >
                  <button
                    onClick={() => setSelectedIncidentId(isSelected ? null : incident.id)}
                    className="w-full text-left p-4 flex items-start justify-between gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-semibold truncate" style={{ color: theme.colors.foreground }}>{incident.title}</h3>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase shrink-0" style={{ background: `${color}18`, color }}>
                          {incident.severity}
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium shrink-0" style={{ background: `${STATUS_COLORS[incident.status] || '#3b82f6'}15`, color: STATUS_COLORS[incident.status] || '#3b82f6' }}>
                          {incident.status}
                        </span>
                      </div>
                      <p className="text-xs truncate" style={{ color: theme.colors.foregroundMuted }}>{incident.description}</p>
                      <p className="text-[10px] mt-1" style={{ color: theme.colors.foregroundMuted }}>
                        {new Date(incident.createdAt).toLocaleString()}
                        {incident.updates && incident.updates.length > 0 && ` · ${incident.updates.length} updates`}
                      </p>
                    </div>
                    <ChevronDown
                      size={14}
                      className={`shrink-0 mt-1 transition-transform ${isSelected ? 'rotate-180' : ''}`}
                      style={{ color: theme.colors.foregroundMuted }}
                    />
                  </button>

                  <AnimatePresence>
                    {isSelected && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 space-y-3" style={{ borderTop: `1px solid ${theme.colors.border}30` }}>
                          {/* Timeline */}
                          {incident.updates && incident.updates.length > 0 && (
                            <div className="pt-3 space-y-2">
                              <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: theme.colors.foregroundMuted }}>Timeline</p>
                              {incident.updates.map((update) => (
                                <div key={update.id} className="flex gap-2 items-start">
                                  <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: STATUS_COLORS[update.status] || '#3b82f6' }} />
                                  <div>
                                    <p className="text-xs" style={{ color: theme.colors.foreground }}>{update.message}</p>
                                    <p className="text-[10px]" style={{ color: theme.colors.foregroundMuted }}>
                                      {new Date(update.createdAt).toLocaleString()} — <span style={{ color: STATUS_COLORS[update.status] || '#3b82f6' }}>{update.status}</span>
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Update form */}
                          <div className="pt-3" style={{ borderTop: `1px solid ${theme.colors.border}30` }}>
                            <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: theme.colors.foregroundMuted }}>
                              Post Update
                            </p>
                            <div className="space-y-2">
                              <textarea
                                value={updateForm.message}
                                onChange={(e) => setUpdateForm((f) => ({ ...f, message: e.target.value }))}
                                placeholder="Describe the update..."
                                rows={2}
                                className="w-full px-3 py-2 rounded-lg text-xs outline-none resize-none"
                                style={{ background: `${theme.colors.foreground}05`, border: `1px solid ${theme.colors.border}`, color: theme.colors.foreground }}
                              />
                              <div className="flex items-center gap-2">
                                <select
                                  value={updateForm.status}
                                  onChange={(e) => setUpdateForm((f) => ({ ...f, status: e.target.value as typeof f.status }))}
                                  className="px-2.5 py-1.5 rounded-lg text-xs outline-none"
                                  style={{ background: `${theme.colors.foreground}05`, border: `1px solid ${theme.colors.border}`, color: theme.colors.foreground }}
                                >
                                  <option value="investigating">Investigating</option>
                                  <option value="identified">Identified</option>
                                  <option value="monitoring">Monitoring</option>
                                  <option value="resolved">Resolved</option>
                                </select>
                                <button
                                  onClick={() => updateMutation.mutate(incident.id)}
                                  disabled={!updateForm.message || updateMutation.isPending}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white disabled:opacity-50"
                                  style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})` }}
                                >
                                  {updateMutation.isPending ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                                  Post Update
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Resolved Incidents */}
      {resolvedCount > 0 && (
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: theme.colors.foregroundMuted }}>
            <CheckCircle2 size={14} style={{ color: '#22c55e' }} />
            {t('admin.incidents.resolvedIncidents', 'Resolved')}
            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium" style={{ background: '#22c55e15', color: '#22c55e' }}>
              {resolvedCount}
            </span>
          </h2>
          <div className="space-y-2">
            {incidents!.resolved.map((incident) => (
              <div
                key={incident.id}
                className="p-3.5 rounded-xl flex items-start justify-between gap-3"
                style={{ background: `${theme.colors.card}80`, border: `1px solid ${theme.colors.border}`, borderLeft: '3px solid #22c55e' }}
              >
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-medium truncate" style={{ color: theme.colors.foreground }}>{incident.title}</h3>
                  <p className="text-xs mt-0.5" style={{ color: theme.colors.foregroundMuted }}>{incident.description}</p>
                  <p className="text-[10px] mt-1" style={{ color: theme.colors.foregroundMuted }}>
                    {new Date(incident.createdAt).toLocaleDateString()}
                    {incident.resolvedAt && ` — ${new Date(incident.resolvedAt).toLocaleDateString()}`}
                  </p>
                </div>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-medium shrink-0" style={{ background: '#22c55e15', color: '#22c55e' }}>
                  Resolved
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Incident Modal */}
      <AnimatePresence>
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
            onClick={() => setShowCreateForm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg rounded-2xl p-6"
              style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#f59e0b15' }}>
                    <AlertTriangle size={20} style={{ color: '#f59e0b' }} />
                  </div>
                  <h2 className="text-lg font-bold" style={{ color: theme.colors.foreground }}>
                    {t('admin.incidents.createTitle', 'Create Incident')}
                  </h2>
                </div>
                <button onClick={() => setShowCreateForm(false)} className="p-2 rounded-lg hover:bg-white/5">
                  <X size={18} style={{ color: theme.colors.foregroundMuted }} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium mb-1.5 block" style={{ color: theme.colors.foregroundMuted }}>Title</label>
                  <input
                    value={createForm.title}
                    onChange={(e) => setCreateForm((f) => ({ ...f, title: e.target.value }))}
                    placeholder="Brief incident title..."
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                    style={{ background: `${theme.colors.foreground}05`, border: `1px solid ${theme.colors.border}`, color: theme.colors.foreground }}
                  />
                </div>

                <div>
                  <label className="text-xs font-medium mb-1.5 block" style={{ color: theme.colors.foregroundMuted }}>Description</label>
                  <textarea
                    value={createForm.description}
                    onChange={(e) => setCreateForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder="Detailed description of the incident..."
                    rows={3}
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none"
                    style={{ background: `${theme.colors.foreground}05`, border: `1px solid ${theme.colors.border}`, color: theme.colors.foreground }}
                  />
                </div>

                <div>
                  <label className="text-xs font-medium mb-1.5 block" style={{ color: theme.colors.foregroundMuted }}>Severity</label>
                  <div className="flex gap-2">
                    {(['minor', 'major', 'critical'] as const).map((sev) => {
                      const color = SEVERITY_COLORS[sev]
                      const isActive = createForm.severity === sev
                      return (
                        <button
                          key={sev}
                          onClick={() => setCreateForm((f) => ({ ...f, severity: sev }))}
                          className="flex-1 py-2 rounded-xl text-xs font-medium transition-all capitalize"
                          style={{
                            background: isActive ? `${color}18` : `${theme.colors.foreground}05`,
                            border: `1px solid ${isActive ? color : theme.colors.border}`,
                            color: isActive ? color : theme.colors.foregroundMuted,
                          }}
                        >
                          {sev}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium mb-1.5 block" style={{ color: theme.colors.foregroundMuted }}>
                    Affected Services (comma-separated)
                  </label>
                  <input
                    value={createForm.affectedServices.join(', ')}
                    onChange={(e) =>
                      setCreateForm((f) => ({
                        ...f,
                        affectedServices: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                      }))
                    }
                    placeholder="e.g. API, Database, Auth"
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                    style={{ background: `${theme.colors.foreground}05`, border: `1px solid ${theme.colors.border}`, color: theme.colors.foreground }}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="px-4 py-2.5 rounded-xl text-sm font-medium"
                    style={{ color: theme.colors.foregroundMuted }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => createMutation.mutate()}
                    disabled={!createForm.title || !createForm.description || createMutation.isPending}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white disabled:opacity-50"
                    style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})` }}
                  >
                    {createMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                    {t('admin.incidents.create', 'Create Incident')}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
