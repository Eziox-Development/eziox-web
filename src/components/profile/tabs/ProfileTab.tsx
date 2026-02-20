import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DatePicker } from '@/components/ui/date-picker'
import {
  getSpotifyConnectionFn,
  disconnectSpotifyFn,
} from '@/server/functions/spotify'
import {
  getConnectedPlatformsFn,
  getOAuthUrlFn,
} from '@/server/functions/social-integrations'
import { uploadAvatarFn, uploadBannerFn } from '@/server/functions/upload'
import { getAppHostname } from '@/lib/utils'
import {
  User,
  AtSign,
  MapPin,
  Globe,
  ChevronDown,
  Plus,
  Search,
  X,
  Camera,
  Link2,
  Loader2,
  Trash2,
  Upload,
  ExternalLink,
  Sparkles,
} from 'lucide-react'
import {
  SiSpotify,
  SiDiscord,
  SiSteam,
  SiTwitch,
  SiGithub,
} from 'react-icons/si'
import {
  SOCIAL_PLATFORMS,
  ADDITIONAL_PLATFORMS,
  CREATOR_TYPES,
  PRONOUNS_OPTIONS,
} from '../constants'
import type { ProfileFormData, UpdateFieldFn } from '../types'

// ─── Motion Variants ────────────────────────────────────────────────────────

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.98 },
  visible: (i: number) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { delay: i * 0.08, type: 'spring' as const, stiffness: 260, damping: 24 },
  }),
}

const glowHover = {
  rest: { boxShadow: '0 0 0 0 rgba(var(--primary-rgb), 0)' },
  hover: { boxShadow: '0 0 24px 2px rgba(var(--primary-rgb), 0.12)', scale: 1.005 },
}

// ─── Glass Card Wrapper ─────────────────────────────────────────────────────

function GlassCard({ children, index = 0, className = '' }: { children: React.ReactNode; index?: number; className?: string }) {
  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      className={`relative overflow-hidden rounded-2xl backdrop-blur-xl bg-card/30 border border-border/20 ${className}`}
    >
      <div className="absolute inset-0 bg-linear-to-br from-primary/[0.03] via-transparent to-accent/[0.03] pointer-events-none" />
      <div className="relative">{children}</div>
    </motion.div>
  )
}

// ─── Section Header ─────────────────────────────────────────────────────────

function SectionHeader({ icon: Icon, title, subtitle }: { icon: typeof User; title: string; subtitle?: string }) {
  return (
    <div className="p-5 border-b border-border/15">
      <div className="flex items-center gap-3">
        <motion.div
          whileHover={{ rotate: 8, scale: 1.1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          className="w-10 h-10 rounded-xl flex items-center justify-center bg-linear-to-br from-primary/20 to-accent/10"
        >
          <Icon size={20} className="text-primary" />
        </motion.div>
        <div>
          <h2 className="text-lg font-bold text-foreground">{title}</h2>
          {subtitle && <p className="text-sm text-foreground-muted">{subtitle}</p>}
        </div>
      </div>
    </div>
  )
}

// ─── Input Field ────────────────────────────────────────────────────────────

function InputField({ label, icon: Icon, value, onChange, placeholder, hint }: {
  label: string; icon: typeof User; value: string; onChange: (v: string) => void; placeholder: string; hint?: string
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-foreground-muted mb-2">{label}</label>
      <div className="relative group">
        <Icon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground-muted/50 group-focus-within:text-primary theme-animation" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-12 pr-4 py-3 rounded-xl bg-background-secondary/60 backdrop-blur-sm border border-border/30 text-foreground placeholder-foreground-muted/40 focus:outline-none focus:border-primary/50 focus:bg-background-secondary/80 focus:ring-2 focus:ring-primary/10 theme-animation"
        />
      </div>
      {hint && <p className="text-xs text-primary/70 mt-1.5 font-mono">{hint}</p>}
    </div>
  )
}

// ─── Connected Service Card ─────────────────────────────────────────────────

function ServiceCard({ name, icon: Icon, color, bgColor, connected, description, onConnect, onDisconnect, loading }: {
  name: string; icon: React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>
  color: string; bgColor: string; connected: boolean; description: string
  onConnect: () => void; onDisconnect?: () => void; loading?: boolean
}) {
  return (
    <motion.div
      variants={glowHover}
      initial="rest"
      whileHover="hover"
      className="flex items-center justify-between p-4 rounded-xl backdrop-blur-sm bg-background-secondary/30 border border-border/15 theme-animation"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: bgColor }}>
          <Icon size={20} style={{ color }} />
        </div>
        <div>
          <p className="font-medium text-foreground">{name}</p>
          <p className="text-xs text-foreground-muted">{description}</p>
        </div>
      </div>
      {connected ? (
        onDisconnect ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onDisconnect}
            disabled={loading}
            className="px-3 py-1.5 rounded-lg bg-destructive/15 text-destructive hover:bg-destructive/25 theme-animation text-sm font-medium flex items-center gap-2"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
            Disconnect
          </motion.button>
        ) : (
          <span className="px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 text-sm font-medium">Connected</span>
        )
      ) : (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onConnect}
          disabled={loading}
          className="px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 theme-animation"
          style={{ background: bgColor, color }}
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <ExternalLink size={14} />}
          Connect
        </motion.button>
      )}
    </motion.div>
  )
}

// ─── Props ──────────────────────────────────────────────────────────────────

interface ProfileTabProps {
  formData: ProfileFormData
  updateField: UpdateFieldFn
  updateSocial: (key: string, value: string) => void
  customPronouns: string
  setCustomPronouns: (v: string) => void
  avatar: string | null
  banner: string | null
  onAvatarChange: (url: string | null) => void
  onBannerChange: (url: string | null) => void
}

// ─── Main Component ─────────────────────────────────────────────────────────

export function ProfileTab({
  formData, updateField, updateSocial, customPronouns, setCustomPronouns,
  avatar, banner, onAvatarChange, onBannerChange,
}: ProfileTabProps) {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const bannerInputRef = useRef<HTMLInputElement>(null)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [isUploadingBanner, setIsUploadingBanner] = useState(false)
  const [showMoreSocials, setShowMoreSocials] = useState(false)
  const [socialSearch, setSocialSearch] = useState('')

  const getSpotifyConnection = useServerFn(getSpotifyConnectionFn)
  const disconnectSpotify = useServerFn(disconnectSpotifyFn)
  const uploadAvatar = useServerFn(uploadAvatarFn)
  const uploadBanner = useServerFn(uploadBannerFn)

  const { data: spotifyConnection } = useQuery({
    queryKey: ['spotify-connection'],
    queryFn: () => getSpotifyConnection(),
  })

  const { data: connectedPlatforms } = useQuery({
    queryKey: ['connected-platforms'],
    queryFn: () => getConnectedPlatformsFn(),
  })

  const spotifyDisconnectMutation = useMutation({
    mutationFn: () => disconnectSpotify(),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: ['spotify-connection'] }) },
  })

  const connectPlatformMutation = useMutation({
    mutationFn: (platform: 'discord' | 'steam' | 'twitch' | 'github') => getOAuthUrlFn({ data: { platform } }),
    onSuccess: (data) => { if (data.url) window.location.href = data.url },
  })

  const handleAvatarUpload = async (file: File) => {
    setIsUploadingAvatar(true)
    try {
      const reader = new FileReader()
      reader.onload = async (e) => {
        const base64 = e.target?.result as string
        const result = await uploadAvatar({ data: { image: base64 } })
        if (result.avatarUrl) onAvatarChange(result.avatarUrl)
        setIsUploadingAvatar(false)
      }
      reader.readAsDataURL(file)
    } catch { setIsUploadingAvatar(false) }
  }

  const handleBannerUpload = async (file: File) => {
    setIsUploadingBanner(true)
    try {
      const reader = new FileReader()
      reader.onload = async (e) => {
        const base64 = e.target?.result as string
        const result = await uploadBanner({ data: { image: base64 } })
        if (result.bannerUrl) onBannerChange(result.bannerUrl)
        setIsUploadingBanner(false)
      }
      reader.readAsDataURL(file)
    } catch { setIsUploadingBanner(false) }
  }

  const isPlatformConnected = (platform: string) =>
    connectedPlatforms?.integrations?.some((i) => i.platform === platform) ?? false

  const filteredAdditional = ADDITIONAL_PLATFORMS.filter((p: { label: string }) =>
    p.label.toLowerCase().includes(socialSearch.toLowerCase()),
  )

  return (
    <motion.div
      key="profile"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      {/* ── Avatar & Banner ── */}
      <GlassCard index={0}>
        <SectionHeader icon={Camera} title={t('dashboard.profile.title')} />
        <div className="p-5 space-y-6">
          {/* Banner */}
          <div>
            <label className="block text-sm font-medium mb-2 text-foreground-muted">{t('dashboard.profile.banner')}</label>
            <motion.div
              whileHover={{ scale: 1.005 }}
              className="h-36 relative overflow-hidden cursor-pointer group rounded-xl bg-linear-to-br from-primary/30 to-accent/30 border border-border/10"
              style={{ background: banner ? `url(${banner}) center/cover` : undefined }}
              onClick={() => bannerInputRef.current?.click()}
            >
              <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 theme-animation flex items-center justify-center gap-2">
                {isUploadingBanner ? (
                  <Loader2 size={24} className="text-white animate-spin" />
                ) : (
                  <>
                    <Upload size={24} className="text-white" />
                    <span className="text-white text-sm font-medium">{t('dashboard.profile.uploadBanner')}</span>
                  </>
                )}
              </div>
            </motion.div>
            <input ref={bannerInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) void handleBannerUpload(file) }} />
            <div className="mt-2 flex gap-2">
              <input
                type="url" value={banner || ''} onChange={(e) => onBannerChange(e.target.value || null)}
                placeholder={t('dashboard.profile.bannerUrl')}
                className="flex-1 px-4 py-3 rounded-xl bg-background-secondary/40 backdrop-blur-sm border border-border/20 text-foreground placeholder-foreground-muted/40 focus:outline-none focus:border-primary/40 theme-animation"
              />
              {banner && (
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => onBannerChange(null)} className="px-3 py-2 rounded-xl bg-destructive/15 text-destructive hover:bg-destructive/25 theme-animation">
                  <Trash2 size={18} />
                </motion.button>
              )}
            </div>
          </div>

          {/* Avatar */}
          <div>
            <label className="block text-sm font-medium mb-2 text-foreground-muted">{t('dashboard.profile.avatar')}</label>
            <div className="flex items-center gap-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="w-20 h-20 relative overflow-hidden cursor-pointer group rounded-xl bg-linear-to-br from-primary to-accent ring-2 ring-primary/20"
                style={{ background: avatar ? `url(${avatar}) center/cover` : undefined }}
                onClick={() => avatarInputRef.current?.click()}
              >
                {!avatar && (
                  <div className="w-full h-full flex items-center justify-center font-bold text-2xl text-primary-foreground">
                    {(formData.name || 'U').charAt(0)}
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 theme-animation flex items-center justify-center">
                  {isUploadingAvatar ? <Loader2 size={20} className="text-white animate-spin" /> : <Camera size={20} className="text-white" />}
                </div>
              </motion.div>
              <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) void handleAvatarUpload(file) }} />
              <div className="flex-1 flex gap-2">
                <input
                  type="url" value={avatar || ''} onChange={(e) => onAvatarChange(e.target.value || null)}
                  placeholder={t('dashboard.profile.avatarUrl')}
                  className="flex-1 px-4 py-3 rounded-xl bg-background-secondary/40 backdrop-blur-sm border border-border/20 text-foreground placeholder-foreground-muted/40 focus:outline-none focus:border-primary/40 theme-animation"
                />
                {avatar && (
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => onAvatarChange(null)} className="px-3 py-2 rounded-xl bg-destructive/15 text-destructive hover:bg-destructive/25 theme-animation">
                    <Trash2 size={18} />
                  </motion.button>
                )}
              </div>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* ── Basic Info ── */}
      <GlassCard index={1}>
        <SectionHeader icon={User} title={t('dashboard.profile.basicInfo')} />
        <div className="p-5 space-y-4">
          <InputField label={t('dashboard.profile.displayName')} icon={User} value={formData.name} onChange={(v) => updateField('name', v)} placeholder={t('dashboard.profile.namePlaceholder')} />
          <InputField
            label={t('dashboard.profile.username')} icon={AtSign} value={formData.username}
            onChange={(v) => updateField('username', v.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
            placeholder={t('dashboard.profile.usernamePlaceholder')}
            hint={`${getAppHostname()}/${formData.username || 'username'}`}
          />
          <div>
            <label className="block text-sm font-medium text-foreground-muted mb-2">{t('dashboard.profile.bio')}</label>
            <textarea
              value={formData.bio} onChange={(e) => updateField('bio', e.target.value)}
              placeholder={t('dashboard.profile.bioPlaceholder')} rows={4}
              className="w-full px-4 py-3 rounded-xl bg-background-secondary/60 backdrop-blur-sm border border-border/30 text-foreground placeholder-foreground-muted/40 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 resize-none theme-animation"
            />
          </div>
          <InputField label={t('dashboard.profile.website')} icon={Globe} value={formData.website} onChange={(v) => updateField('website', v)} placeholder={t('dashboard.profile.websitePlaceholder')} />
          <InputField label={t('dashboard.profile.location')} icon={MapPin} value={formData.location} onChange={(v) => updateField('location', v)} placeholder={t('dashboard.profile.locationPlaceholder')} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground-muted mb-2">{t('dashboard.profile.pronouns')}</label>
              <Select value={formData.pronouns || 'none'} onValueChange={(value) => updateField('pronouns', value === 'none' ? '' : value)}>
                <SelectTrigger className="w-full h-12"><SelectValue placeholder={t('dashboard.profile.selectPronouns', 'Select...')} /></SelectTrigger>
                <SelectContent>
                  {PRONOUNS_OPTIONS.map((opt: { value: string; label: string }) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formData.pronouns === 'custom' && (
                <input type="text" value={customPronouns} onChange={(e) => setCustomPronouns(e.target.value)} placeholder={t('dashboard.profile.customPronouns')}
                  className="mt-2 w-full px-4 py-3 rounded-xl bg-background-secondary/60 backdrop-blur-sm border border-border/30 text-foreground placeholder-foreground-muted/40 focus:outline-none focus:border-primary/50 theme-animation"
                />
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground-muted mb-2">{t('dashboard.profile.birthday')}</label>
              <DatePicker value={formData.birthday} onChange={(value) => updateField('birthday', value)} placeholder={t('dashboard.profile.birthdayPlaceholder', 'Select your birthday')} fromYear={1900} toYear={new Date().getFullYear()} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground-muted mb-2">{t('dashboard.profile.creatorType')}</label>
            <div className="flex flex-wrap gap-2">
              {CREATOR_TYPES.filter((ct: { value: string }) => ct.value).map((type: { value: string; label: string }) => (
                <motion.button
                  key={type.value}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    const current = formData.creatorTypes || []
                    if (current.includes(type.value)) {
                      updateField('creatorTypes', current.filter((t: string) => t !== type.value))
                    } else {
                      updateField('creatorTypes', [...current, type.value])
                    }
                  }}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium theme-animation ${
                    formData.creatorTypes?.includes(type.value)
                      ? 'bg-primary/20 text-primary border border-primary/30 glow-primary'
                      : 'bg-background-secondary/50 text-foreground-muted border border-border/20 hover:border-border/40'
                  }`}
                >
                  {type.label}
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </GlassCard>

      {/* ── Social Links ── */}
      <GlassCard index={2}>
        <SectionHeader icon={Globe} title={t('dashboard.profile.socialLinks')} />
        <div className="p-5 space-y-3">
          {SOCIAL_PLATFORMS.map((platform: { key: string; icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>; placeholder: string; color: string; bgColor: string }) => {
            const Icon = platform.icon
            return (
              <div key={platform.key} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: platform.bgColor }}>
                  <Icon size={18} style={{ color: platform.color }} />
                </div>
                <input
                  type="text" value={formData.socials[platform.key] || ''} onChange={(e) => updateSocial(platform.key, e.target.value)}
                  placeholder={platform.placeholder}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-background-secondary/40 backdrop-blur-sm border border-border/20 text-foreground placeholder-foreground-muted/40 focus:outline-none focus:border-primary/40 theme-animation"
                />
              </div>
            )
          })}

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => setShowMoreSocials(!showMoreSocials)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-background-secondary/30 backdrop-blur-sm border border-border/15 text-foreground-muted hover:bg-background-secondary/50 theme-animation"
          >
            <Plus size={16} />
            {t('dashboard.profile.addMore')}
            <ChevronDown size={16} className={`theme-animation ${showMoreSocials ? 'rotate-180' : ''}`} />
          </motion.button>

          <AnimatePresence>
            {showMoreSocials && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-3 overflow-hidden">
                <div className="relative">
                  <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground-muted/50" />
                  <input type="text" value={socialSearch} onChange={(e) => setSocialSearch(e.target.value)} placeholder={t('dashboard.profile.searchPlatforms')}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-background-secondary/40 backdrop-blur-sm border border-border/20 text-foreground placeholder-foreground-muted/40 focus:outline-none focus:border-primary/40 theme-animation"
                  />
                  {socialSearch && (
                    <button onClick={() => setSocialSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                      <X size={14} className="text-foreground-muted/50" />
                    </button>
                  )}
                </div>
                {filteredAdditional.map((platform: { key: string; icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>; placeholder: string; color: string; bgColor: string }) => {
                  const Icon = platform.icon
                  return (
                    <div key={platform.key} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: platform.bgColor }}>
                        <Icon size={18} style={{ color: platform.color }} />
                      </div>
                      <input type="text" value={formData.socials[platform.key] || ''} onChange={(e) => updateSocial(platform.key, e.target.value)} placeholder={platform.placeholder}
                        className="flex-1 px-4 py-2.5 rounded-xl bg-background-secondary/40 backdrop-blur-sm border border-border/20 text-foreground placeholder-foreground-muted/40 focus:outline-none focus:border-primary/40 theme-animation"
                      />
                    </div>
                  )
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </GlassCard>

      {/* ── Connected Services ── */}
      <GlassCard index={3}>
        <SectionHeader icon={Link2} title={t('dashboard.profile.connectedServices')} subtitle={t('dashboard.profile.connectedServicesDesc')} />
        <div className="p-5 space-y-3">
          <ServiceCard
            name={t('dashboard.profile.services.spotify.name')} icon={SiSpotify} color="#1DB954" bgColor="#1DB95415"
            connected={!!spotifyConnection?.connected}
            description={spotifyConnection?.connected
              ? t('dashboard.profile.services.spotify.connectedSince', { date: spotifyConnection.connectedAt ? new Date(spotifyConnection.connectedAt).toLocaleDateString() : '' })
              : t('dashboard.profile.services.spotify.description')}
            onConnect={() => { window.location.href = '/api/spotify/connect' }}
            onDisconnect={() => spotifyDisconnectMutation.mutate()}
            loading={spotifyDisconnectMutation.isPending}
          />
          <ServiceCard name="Discord" icon={SiDiscord} color="#5865F2" bgColor="#5865F215" connected={isPlatformConnected('discord')}
            description={isPlatformConnected('discord') ? t('integrations.connected_badge') : t('dashboard.profile.services.discord.description')}
            onConnect={() => connectPlatformMutation.mutate('discord')} loading={connectPlatformMutation.isPending}
          />
          <ServiceCard name="Twitch" icon={SiTwitch} color="#9146FF" bgColor="#9146FF15" connected={isPlatformConnected('twitch')}
            description={isPlatformConnected('twitch') ? t('integrations.connected_badge') : t('dashboard.profile.services.twitch.description')}
            onConnect={() => connectPlatformMutation.mutate('twitch')} loading={connectPlatformMutation.isPending}
          />
          <ServiceCard name="GitHub" icon={SiGithub} color="#e6edf3" bgColor="#e6edf310" connected={isPlatformConnected('github')}
            description={isPlatformConnected('github') ? t('integrations.connected_badge') : t('dashboard.profile.services.github.description')}
            onConnect={() => connectPlatformMutation.mutate('github')} loading={connectPlatformMutation.isPending}
          />
          <ServiceCard name="Steam" icon={SiSteam} color="#66c0f4" bgColor="#66c0f415" connected={isPlatformConnected('steam')}
            description={isPlatformConnected('steam') ? t('integrations.connected_badge') : t('dashboard.profile.services.steam.description')}
            onConnect={() => connectPlatformMutation.mutate('steam')} loading={connectPlatformMutation.isPending}
          />

          <a href="/profile?tab=integrations"
            className="flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-border/30 text-foreground-muted hover:text-foreground hover:border-primary/30 hover:bg-primary/[0.03] theme-animation text-sm"
          >
            <Sparkles size={16} />
            {t('dashboard.profile.manageIntegrations')}
          </a>
        </div>
      </GlassCard>
    </motion.div>
  )
}
