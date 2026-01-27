import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useAuth } from '@/hooks/use-auth'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import {
  getMaintenanceSettingsFn,
  updateMaintenanceSettingsFn,
  toggleMaintenanceModeFn,
} from '@/server/functions/maintenance'
import { searchUsersFn } from '@/server/functions/users-search'
import { siteConfig } from '@/lib/site-config'
import {
  ShieldCheck,
  Loader2,
  CheckCircle2,
  XCircle,
  Settings,
  Construction,
  Clock,
  Mail,
  Plus,
  X,
  Power,
  AlertTriangle,
  ArrowLeft,
  Calendar,
  Search,
  User,
} from 'lucide-react'
import { Link } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected/admin/settings')({
  head: () => ({
    meta: [
      { title: 'Site Settings | Admin | Eziox' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  component: AdminSettingsPage,
})

// Get theme colors from site config (with fallback)
const theme =
  siteConfig.themes.find((t) => t.id === 'eziox-default') ??
  siteConfig.themes[0]!

function AdminSettingsPage() {
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const searchInputRef = useRef<HTMLInputElement>(null)

  const getMaintenanceSettings = useServerFn(getMaintenanceSettingsFn)
  const updateMaintenanceSettings = useServerFn(updateMaintenanceSettingsFn)
  const toggleMaintenanceMode = useServerFn(toggleMaintenanceModeFn)
  const searchUsers = useServerFn(searchUsersFn)

  const [actionResult, setActionResult] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)

  const [maintenanceForm, setMaintenanceForm] = useState<{
    enabled: boolean
    message: string
    allowedEmails: string[]
    estimatedEndDate: string
    estimatedEndHour: string
    estimatedEndMinute: string
  }>({
    enabled: false,
    message: 'We are currently performing maintenance. Please check back soon.',
    allowedEmails: [],
    estimatedEndDate: '',
    estimatedEndHour: '',
    estimatedEndMinute: '',
  })

  const [userSearch, setUserSearch] = useState('')
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const [searchResults, setSearchResults] = useState<
    Array<{
      id: string
      email: string
      username: string
      name: string | null
      avatar: string | null
    }>
  >([])
  const [isSearching, setIsSearching] = useState(false)

  const isOwner = currentUser?.role === 'owner'

  useEffect(() => {
    if (currentUser && !isOwner) {
      void navigate({ to: '/admin' })
    }
  }, [currentUser, isOwner, navigate])

  const { data: maintenanceData, isLoading } = useQuery({
    queryKey: ['admin-maintenance-settings'],
    queryFn: () => getMaintenanceSettings(),
    enabled: isOwner,
  })

  useEffect(() => {
    if (maintenanceData) {
      // Parse estimated end time if it exists
      let endDate = ''
      let endHour = ''
      let endMinute = ''
      if (maintenanceData.estimatedEndTime) {
        try {
          const date = new Date(maintenanceData.estimatedEndTime)
          if (!isNaN(date.getTime())) {
            endDate = date.toISOString().split('T')[0] ?? ''
            endHour = date.getHours().toString().padStart(2, '0')
            endMinute = date.getMinutes().toString().padStart(2, '0')
          }
        } catch {
          // If parsing fails, leave empty
        }
      }

      setMaintenanceForm({
        enabled: maintenanceData.enabled || false,
        message:
          maintenanceData.message ||
          'We are currently performing maintenance. Please check back soon.',
        allowedEmails: maintenanceData.allowedEmails || [],
        estimatedEndDate: endDate,
        estimatedEndHour: endHour,
        estimatedEndMinute: endMinute,
      })
    }
  }, [maintenanceData])

  // User search effect
  useEffect(() => {
    if (userSearch.length < 2) {
      setSearchResults([])
      setShowUserDropdown(false)
      return
    }

    const searchTimeout = setTimeout(async () => {
      setIsSearching(true)
      try {
        const result = await searchUsers({
          data: { query: userSearch, limit: 8 },
        })
        // Filter out already added emails
        const filtered = result.users.filter(
          (u) => !maintenanceForm.allowedEmails.includes(u.email),
        )
        setSearchResults(filtered)
        setShowUserDropdown(true)
      } catch {
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    }, 300)

    return () => clearTimeout(searchTimeout)
  }, [userSearch, maintenanceForm.allowedEmails, searchUsers])

  // Format estimated end time for display
  const formattedEndTime = useMemo(() => {
    if (!maintenanceForm.estimatedEndDate) return null
    try {
      const date = new Date(
        `${maintenanceForm.estimatedEndDate}T${maintenanceForm.estimatedEndHour || '00'}:${maintenanceForm.estimatedEndMinute || '00'}`,
      )
      return date.toLocaleString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })
    } catch {
      return null
    }
  }, [
    maintenanceForm.estimatedEndDate,
    maintenanceForm.estimatedEndHour,
    maintenanceForm.estimatedEndMinute,
  ])

  const updateMutation = useMutation({
    mutationFn: (
      data: Parameters<typeof updateMaintenanceSettings>[0]['data'],
    ) => updateMaintenanceSettings({ data }),
    onSuccess: (result) => {
      setActionResult({ type: 'success', message: result.message })
      void queryClient.invalidateQueries({
        queryKey: ['admin-maintenance-settings'],
      })
      setTimeout(() => setActionResult(null), 3000)
    },
    onError: (e: { message?: string }) => {
      setActionResult({
        type: 'error',
        message: e.message || 'Failed to update settings',
      })
      setTimeout(() => setActionResult(null), 3000)
    },
  })

  const toggleMutation = useMutation({
    mutationFn: () => toggleMaintenanceMode(),
    onSuccess: (result) => {
      setActionResult({ type: 'success', message: result.message })
      setMaintenanceForm((prev) => ({ ...prev, enabled: result.enabled }))
      void queryClient.invalidateQueries({
        queryKey: ['admin-maintenance-settings'],
      })
      setTimeout(() => setActionResult(null), 3000)
    },
    onError: (e: { message?: string }) => {
      setActionResult({
        type: 'error',
        message: e.message || 'Failed to toggle maintenance mode',
      })
      setTimeout(() => setActionResult(null), 3000)
    },
  })

  const handleAddEmail = (email: string) => {
    const normalizedEmail = email.trim().toLowerCase()
    if (
      normalizedEmail &&
      !maintenanceForm.allowedEmails.includes(normalizedEmail)
    ) {
      setMaintenanceForm((prev) => ({
        ...prev,
        allowedEmails: [...prev.allowedEmails, normalizedEmail],
      }))
    }
    setUserSearch('')
    setShowUserDropdown(false)
  }

  const handleSelectUser = (user: { email: string }) => {
    handleAddEmail(user.email)
  }

  const handleRemoveEmail = (email: string) => {
    setMaintenanceForm((prev) => ({
      ...prev,
      allowedEmails: prev.allowedEmails.filter((e) => e !== email),
    }))
  }

  const handleSaveSettings = () => {
    // Build ISO string from date/time parts
    let estimatedEndTime: string | null = null
    if (maintenanceForm.estimatedEndDate) {
      const hour = maintenanceForm.estimatedEndHour || '00'
      const minute = maintenanceForm.estimatedEndMinute || '00'
      estimatedEndTime = new Date(
        `${maintenanceForm.estimatedEndDate}T${hour}:${minute}:00`,
      ).toISOString()
    }

    updateMutation.mutate({
      enabled: maintenanceForm.enabled,
      message: maintenanceForm.message,
      allowedEmails: maintenanceForm.allowedEmails,
      estimatedEndTime,
    })
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Loader2 className="w-10 h-10" style={{ color: 'var(--primary)' }} />
        </motion.div>
      </div>
    )
  }

  if (!isOwner) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md mx-auto text-center"
        >
          <motion.div
            className="w-20 h-20 mx-auto mb-6 rounded-3xl flex items-center justify-center"
            style={{
              background:
                'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(239, 68, 68, 0.05))',
            }}
          >
            <ShieldCheck size={40} style={{ color: '#ef4444' }} />
          </motion.div>
          <h1
            className="text-3xl font-bold mb-3"
            style={{ color: 'var(--foreground)' }}
          >
            Owner Access Required
          </h1>
          <p
            className="text-lg mb-6"
            style={{ color: 'var(--foreground-muted)' }}
          >
            This area requires owner privileges.
          </p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <motion.div
          className="absolute top-40 left-1/4 w-[500px] h-[500px] rounded-full blur-3xl"
          style={{ background: 'rgba(139, 92, 246, 0.08)' }}
          animate={{ scale: [1, 1.2, 1], x: [0, 50, 0] }}
          transition={{ duration: 20, repeat: Infinity }}
        />
      </div>

      <AnimatePresence>
        {actionResult && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 px-6 py-4 rounded-2xl flex items-center gap-3"
            style={{
              background:
                actionResult.type === 'success'
                  ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.9), rgba(16, 185, 129, 0.9))'
                  : 'linear-gradient(135deg, rgba(239, 68, 68, 0.9), rgba(220, 38, 38, 0.9))',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
            }}
          >
            {actionResult.type === 'success' ? (
              <CheckCircle2 size={20} />
            ) : (
              <XCircle size={20} />
            )}
            <span className="text-white font-medium">
              {actionResult.message}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link
            to="/admin"
            className="inline-flex items-center gap-2 text-sm mb-4 transition-colors hover:opacity-80"
            style={{ color: 'var(--foreground-muted)' }}
          >
            <ArrowLeft size={16} />
            Back to Admin
          </Link>

          <div className="flex items-center gap-4">
            <motion.div
              className="w-14 h-14 rounded-2xl flex items-center justify-center relative"
              style={{
                background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
              }}
              whileHover={{ scale: 1.05, rotate: 5 }}
            >
              <Settings size={28} className="text-white" />
            </motion.div>
            <div>
              <h1
                className="text-3xl font-bold"
                style={{ color: 'var(--foreground)' }}
              >
                Site Settings
              </h1>
              <p
                className="text-sm"
                style={{ color: 'var(--foreground-muted)' }}
              >
                Owner-only configuration
              </p>
            </div>
          </div>
        </motion.div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2
              className="w-8 h-8 animate-spin"
              style={{ color: 'var(--primary)' }}
            />
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-3xl overflow-hidden"
            style={{
              background: 'rgba(255, 255, 255, 0.02)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            {/* Maintenance Mode Header */}
            <div
              className="p-6 flex items-center justify-between"
              style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{
                    background: maintenanceForm.enabled
                      ? 'rgba(245, 158, 11, 0.15)'
                      : 'rgba(34, 197, 94, 0.15)',
                  }}
                >
                  <Construction
                    size={24}
                    style={{
                      color: maintenanceForm.enabled ? '#f59e0b' : '#22c55e',
                    }}
                  />
                </div>
                <div>
                  <h2
                    className="text-xl font-semibold"
                    style={{ color: 'var(--foreground)' }}
                  >
                    Maintenance Mode
                  </h2>
                  <p
                    className="text-sm"
                    style={{ color: 'var(--foreground-muted)' }}
                  >
                    {maintenanceForm.enabled
                      ? 'Site is in maintenance mode'
                      : 'Site is publicly accessible'}
                  </p>
                </div>
              </div>

              <motion.button
                onClick={() => toggleMutation.mutate()}
                disabled={toggleMutation.isPending}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-3 px-6 py-3 rounded-xl font-medium transition-all"
                style={{
                  background: maintenanceForm.enabled
                    ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(16, 185, 129, 0.2))'
                    : 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(234, 88, 12, 0.2))',
                  border: maintenanceForm.enabled
                    ? '1px solid rgba(34, 197, 94, 0.3)'
                    : '1px solid rgba(245, 158, 11, 0.3)',
                  color: maintenanceForm.enabled ? '#22c55e' : '#f59e0b',
                }}
              >
                {toggleMutation.isPending ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Power size={18} />
                )}
                {maintenanceForm.enabled
                  ? 'Disable Maintenance'
                  : 'Enable Maintenance'}
              </motion.button>
            </div>

            {/* Warning Banner when enabled */}
            {maintenanceForm.enabled && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="px-6 py-4 flex items-center gap-3"
                style={{
                  background: 'rgba(245, 158, 11, 0.1)',
                  borderBottom: '1px solid rgba(245, 158, 11, 0.2)',
                }}
              >
                <AlertTriangle size={20} style={{ color: '#f59e0b' }} />
                <p className="text-sm" style={{ color: '#fbbf24' }}>
                  <strong>Maintenance mode is active.</strong> Only you and
                  allowed emails can access the site. All other visitors see the
                  maintenance page.
                </p>
              </motion.div>
            )}

            {/* Settings Form */}
            <div className="p-6 space-y-6">
              {/* Message */}
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: 'var(--foreground)' }}
                >
                  Maintenance Message
                </label>
                <textarea
                  value={maintenanceForm.message}
                  onChange={(e) =>
                    setMaintenanceForm((prev) => ({
                      ...prev,
                      message: e.target.value,
                    }))
                  }
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl text-sm resize-none transition-all focus:ring-2 focus:ring-purple-500/30"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    color: 'var(--foreground)',
                  }}
                  placeholder="Message shown to visitors during maintenance..."
                />
              </div>

              {/* Estimated End Time - Modern Date/Time Picker */}
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: theme.colors.foreground }}
                >
                  <Calendar size={14} className="inline mr-2" />
                  Estimated End Time (optional)
                </label>
                <p
                  className="text-xs mb-3"
                  style={{ color: theme.colors.foregroundMuted }}
                >
                  Set when you expect maintenance to be complete.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Date Picker */}
                  <div className="sm:col-span-1">
                    <label
                      className="block text-xs mb-1.5"
                      style={{ color: theme.colors.foregroundMuted }}
                    >
                      Date
                    </label>
                    <input
                      type="date"
                      value={maintenanceForm.estimatedEndDate}
                      onChange={(e) =>
                        setMaintenanceForm((prev) => ({
                          ...prev,
                          estimatedEndDate: e.target.value,
                        }))
                      }
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 rounded-xl text-sm transition-all focus:ring-2"
                      style={{
                        background: `${theme.colors.backgroundSecondary}`,
                        border: `1px solid ${theme.colors.border}`,
                        color: theme.colors.foreground,
                        colorScheme: 'dark',
                      }}
                    />
                  </div>

                  {/* Hour Picker */}
                  <div>
                    <label
                      className="block text-xs mb-1.5"
                      style={{ color: theme.colors.foregroundMuted }}
                    >
                      Hour
                    </label>
                    <select
                      value={maintenanceForm.estimatedEndHour}
                      onChange={(e) =>
                        setMaintenanceForm((prev) => ({
                          ...prev,
                          estimatedEndHour: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 rounded-xl text-sm transition-all focus:ring-2"
                      style={{
                        background: theme.colors.backgroundSecondary,
                        border: `1px solid ${theme.colors.border}`,
                        color: theme.colors.foreground,
                      }}
                    >
                      <option value="">--</option>
                      {Array.from({ length: 24 }, (_, i) => (
                        <option key={i} value={i.toString().padStart(2, '0')}>
                          {i.toString().padStart(2, '0')}:00
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Minute Picker */}
                  <div>
                    <label
                      className="block text-xs mb-1.5"
                      style={{ color: theme.colors.foregroundMuted }}
                    >
                      Minute
                    </label>
                    <select
                      value={maintenanceForm.estimatedEndMinute}
                      onChange={(e) =>
                        setMaintenanceForm((prev) => ({
                          ...prev,
                          estimatedEndMinute: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 rounded-xl text-sm transition-all focus:ring-2"
                      style={{
                        background: theme.colors.backgroundSecondary,
                        border: `1px solid ${theme.colors.border}`,
                        color: theme.colors.foreground,
                      }}
                    >
                      <option value="">--</option>
                      {['00', '15', '30', '45'].map((m) => (
                        <option key={m} value={m}>
                          :{m}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Preview formatted time */}
                {formattedEndTime && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 px-4 py-2.5 rounded-xl flex items-center gap-2"
                    style={{
                      background: `${theme.colors.primary}15`,
                      border: `1px solid ${theme.colors.primary}30`,
                    }}
                  >
                    <Clock size={14} style={{ color: theme.colors.primary }} />
                    <span
                      className="text-sm"
                      style={{ color: theme.colors.accent }}
                    >
                      Estimated return:{' '}
                      <strong style={{ color: theme.colors.primary }}>
                        {formattedEndTime}
                      </strong>
                    </span>
                  </motion.div>
                )}

                {/* Quick presets */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {[
                    { label: '1 hour', hours: 1 },
                    { label: '2 hours', hours: 2 },
                    { label: '4 hours', hours: 4 },
                    { label: 'Tomorrow', hours: 24 },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        const date = new Date()
                        date.setHours(date.getHours() + preset.hours)
                        const isoDate = date.toISOString().split('T')[0] ?? ''
                        setMaintenanceForm((prev) => ({
                          ...prev,
                          estimatedEndDate: isoDate,
                          estimatedEndHour: date
                            .getHours()
                            .toString()
                            .padStart(2, '0'),
                          estimatedEndMinute: (
                            (Math.ceil(date.getMinutes() / 15) * 15) %
                            60
                          )
                            .toString()
                            .padStart(2, '0'),
                        }))
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-105"
                      style={{
                        background: `${theme.colors.primary}10`,
                        border: `1px solid ${theme.colors.primary}20`,
                        color: theme.colors.primary,
                      }}
                    >
                      +{preset.label}
                    </button>
                  ))}
                  {maintenanceForm.estimatedEndDate && (
                    <button
                      type="button"
                      onClick={() =>
                        setMaintenanceForm((prev) => ({
                          ...prev,
                          estimatedEndDate: '',
                          estimatedEndHour: '',
                          estimatedEndMinute: '',
                        }))
                      }
                      className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-105"
                      style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        color: '#ef4444',
                      }}
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Allowed Emails with User Search */}
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: theme.colors.foreground }}
                >
                  <Mail size={14} className="inline mr-2" />
                  Allowed Users (can bypass maintenance)
                </label>
                <p
                  className="text-xs mb-3"
                  style={{ color: theme.colors.foregroundMuted }}
                >
                  Your owner account always has access. Search for existing
                  users to grant access during maintenance.
                </p>

                {/* User Search Input */}
                <div className="relative mb-3">
                  <div className="relative">
                    <Search
                      size={16}
                      className="absolute left-4 top-1/2 -translate-y-1/2"
                      style={{ color: theme.colors.foregroundMuted }}
                    />
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && userSearch.includes('@')) {
                          handleAddEmail(userSearch)
                        }
                      }}
                      className="w-full pl-11 pr-4 py-3 rounded-xl text-sm transition-all focus:ring-2"
                      style={{
                        background: theme.colors.backgroundSecondary,
                        border: `1px solid ${theme.colors.border}`,
                        color: theme.colors.foreground,
                      }}
                      placeholder="Search users by name, username, or email..."
                    />
                    {isSearching && (
                      <Loader2
                        size={16}
                        className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin"
                        style={{ color: theme.colors.primary }}
                      />
                    )}
                  </div>

                  {/* Search Results Dropdown */}
                  <AnimatePresence>
                    {showUserDropdown && searchResults.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute z-50 w-full mt-2 rounded-xl overflow-hidden shadow-2xl"
                        style={{
                          background: theme.colors.card,
                          border: `1px solid ${theme.colors.border}`,
                        }}
                      >
                        {searchResults.map((user) => (
                          <button
                            key={user.id}
                            type="button"
                            onClick={() => handleSelectUser(user)}
                            className="w-full px-4 py-3 flex items-center gap-3 transition-all hover:bg-white/5"
                            style={{
                              borderBottom: `1px solid ${theme.colors.border}`,
                            }}
                          >
                            {user.avatar ? (
                              <img
                                src={user.avatar}
                                alt={user.name || user.username}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            ) : (
                              <div
                                className="w-8 h-8 rounded-full flex items-center justify-center"
                                style={{
                                  background: `${theme.colors.primary}20`,
                                }}
                              >
                                <User
                                  size={14}
                                  style={{ color: theme.colors.primary }}
                                />
                              </div>
                            )}
                            <div className="flex-1 text-left">
                              <p
                                className="text-sm font-medium"
                                style={{ color: theme.colors.foreground }}
                              >
                                {user.name || user.username}
                              </p>
                              <p
                                className="text-xs"
                                style={{ color: theme.colors.foregroundMuted }}
                              >
                                {user.email}
                              </p>
                            </div>
                            <Plus
                              size={16}
                              style={{ color: theme.colors.primary }}
                            />
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* No results message */}
                  {showUserDropdown &&
                    searchResults.length === 0 &&
                    userSearch.length >= 2 &&
                    !isSearching && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute z-50 w-full mt-2 px-4 py-3 rounded-xl"
                        style={{
                          background: theme.colors.card,
                          border: `1px solid ${theme.colors.border}`,
                        }}
                      >
                        <p
                          className="text-sm"
                          style={{ color: theme.colors.foregroundMuted }}
                        >
                          No users found. Press Enter to add "{userSearch}" as
                          email.
                        </p>
                      </motion.div>
                    )}
                </div>

                {/* Added Emails List */}
                {maintenanceForm.allowedEmails.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {maintenanceForm.allowedEmails.map((email) => (
                      <motion.div
                        key={email}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm"
                        style={{
                          background: `${theme.colors.primary}15`,
                          border: `1px solid ${theme.colors.primary}30`,
                          color: theme.colors.accent,
                        }}
                      >
                        <User size={12} />
                        <span>{email}</span>
                        <button
                          onClick={() => handleRemoveEmail(email)}
                          className="hover:opacity-70 transition-opacity ml-1"
                        >
                          <X size={14} />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Save Button */}
              <div
                className="pt-4"
                style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}
              >
                <motion.button
                  onClick={handleSaveSettings}
                  disabled={updateMutation.isPending}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2"
                  style={{
                    background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                    color: '#ffffff',
                  }}
                >
                  {updateMutation.isPending ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <CheckCircle2 size={18} />
                  )}
                  Save Settings
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
