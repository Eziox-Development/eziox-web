import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { getSpotifyConnectionFn, disconnectSpotifyFn } from '@/server/functions/spotify'
import {
  User,
  AtSign,
  MapPin,
  Globe,
  Cake,
  ChevronDown,
  Plus,
  Search,
  X,
  Camera,
  ImageIcon,
  Link2,
  Loader2,
  Trash2,
} from 'lucide-react'
import {
  SiSpotify
} from 'react-icons/si'
import { SOCIAL_PLATFORMS, ADDITIONAL_PLATFORMS, CREATOR_TYPES, PRONOUNS_OPTIONS } from '../constants'
import type { ProfileFormData } from '../types'

interface ProfileTabProps {
  formData: ProfileFormData
  updateField: <K extends keyof ProfileFormData>(key: K, value: ProfileFormData[K]) => void
  updateSocial: (key: string, value: string) => void
  customPronouns: string
  setCustomPronouns: (v: string) => void
  avatar: string | null
  banner: string | null
  onAvatarChange: (url: string | null) => void
  onBannerChange: (url: string | null) => void
}

export function ProfileTab({
  formData,
  updateField,
  updateSocial,
  customPronouns,
  setCustomPronouns,
  avatar,
  banner,
  onAvatarChange,
  onBannerChange,
}: ProfileTabProps) {
  const queryClient = useQueryClient()
  const getSpotifyConnection = useServerFn(getSpotifyConnectionFn)
  const disconnectSpotify = useServerFn(disconnectSpotifyFn)

  // Spotify connection state
  const { data: spotifyConnection } = useQuery({
    queryKey: ['spotify-connection'],
    queryFn: () => getSpotifyConnection(),
  })

  const spotifyDisconnectMutation = useMutation({
    mutationFn: () => disconnectSpotify(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['spotify-connection'] })
    },
  })
  const { t } = useTranslation()
  const [showMoreSocials, setShowMoreSocials] = useState(false)
  const [socialSearch, setSocialSearch] = useState('')

  const filteredAdditional = ADDITIONAL_PLATFORMS.filter(
    (p) => p.label.toLowerCase().includes(socialSearch.toLowerCase())
  )

  return (
    <motion.div
      key="profile"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Avatar & Banner */}
      <div className="overflow-hidden backdrop-blur-xl rounded-lg bg-card/10 border border-border/20">
        <div className="p-5 border-b border-border/20">
          <h2 className="text-lg font-bold flex items-center gap-2 text-foreground">
            <Camera size={20} className="text-primary" />
            {t('dashboard.profile.title')}
          </h2>
        </div>
        <div className="p-5">
          {/* Banner */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 text-foreground-muted">{t('dashboard.profile.banner')}</label>
            <div
              className="h-32 relative overflow-hidden cursor-pointer group rounded-lg bg-linear-to-br from-primary to-accent"
              style={{
                background: banner ? `url(${banner}) center/cover` : undefined,
              }}
            >
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-(--animation-speed) flex items-center justify-center">
                <ImageIcon size={24} className="text-white" />
              </div>
            </div>
            <input
              type="url"
              value={banner || ''}
              onChange={(e) => onBannerChange(e.target.value || null)}
              placeholder={t('dashboard.profile.bannerUrl')}
              className="mt-2 w-full px-4 py-3 focus:outline-none transition-colors duration-(--animation-speed) rounded-lg bg-background-secondary/30 border border-border/20 text-foreground placeholder-foreground-muted/50 focus:border-primary/50"
            />
          </div>

          {/* Avatar */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 text-foreground-muted">{t('dashboard.profile.avatar')}</label>
            <div className="flex items-center gap-4">
              <div
                className="w-20 h-20 relative overflow-hidden cursor-pointer group rounded-lg bg-linear-to-br from-primary to-accent"
                style={{
                  background: avatar ? `url(${avatar}) center/cover` : undefined,
                }}
              >
                {!avatar && (
                  <div className="w-full h-full flex items-center justify-center font-bold text-2xl text-primary-foreground">
                    {(formData.name || 'U').charAt(0)}
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-(--animation-speed) flex items-center justify-center">
                  <Camera size={20} className="text-white" />
                </div>
              </div>
              <input
                type="url"
                value={avatar || ''}
                onChange={(e) => onAvatarChange(e.target.value || null)}
                placeholder={t('dashboard.profile.avatarUrl')}
                className="flex-1 px-4 py-3 focus:outline-none transition-colors duration-(--animation-speed) rounded-lg bg-background-secondary/30 border border-border/20 text-foreground placeholder-foreground-muted/50 focus:border-primary/50"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Basic Info */}
      <div className="rounded-lg overflow-hidden bg-card/50 border border-border backdrop-blur-xl">
        <div className="p-5 border-b border-border">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <User size={20} className="text-primary" />
            {t('dashboard.profile.basicInfo')}
          </h2>
        </div>
        <div className="p-5 space-y-4">
          <InputField
            label={t('dashboard.profile.displayName')}
            icon={User}
            value={formData.name}
            onChange={(v) => updateField('name', v)}
            placeholder={t('dashboard.profile.namePlaceholder')}
          />
          <InputField
            label={t('dashboard.profile.username')}
            icon={AtSign}
            value={formData.username}
            onChange={(v) => updateField('username', v.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
            placeholder={t('dashboard.profile.usernamePlaceholder')}
            hint={`eziox.link/${formData.username || 'username'}`}
          />

          <div>
            <label className="block text-sm font-medium text-foreground-muted mb-2">{t('dashboard.profile.bio')}</label>
            <textarea
              value={formData.bio}
              onChange={(e) => updateField('bio', e.target.value)}
              placeholder={t('dashboard.profile.bioPlaceholder')}
              rows={4}
              className="w-full px-4 py-3 rounded-xl bg-background-secondary border border-border text-foreground placeholder-foreground-muted/50 focus:outline-none focus:border-primary/50 resize-none transition-colors duration-(--animation-speed)"
            />
          </div>

          <InputField
            label={t('dashboard.profile.website')}
            icon={Globe}
            value={formData.website}
            onChange={(v) => updateField('website', v)}
            placeholder={t('dashboard.profile.websitePlaceholder')}
          />

          <InputField
            label={t('dashboard.profile.location')}
            icon={MapPin}
            value={formData.location}
            onChange={(v) => updateField('location', v)}
            placeholder={t('dashboard.profile.locationPlaceholder')}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground-muted mb-2">{t('dashboard.profile.pronouns')}</label>
              <select
                value={formData.pronouns}
                onChange={(e) => updateField('pronouns', e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-background-secondary border border-border text-foreground focus:outline-none focus:border-primary/50 transition-colors duration-(--animation-speed)"
              >
                {PRONOUNS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-card">
                    {opt.label}
                  </option>
                ))}
              </select>
              {formData.pronouns === 'custom' && (
                <input
                  type="text"
                  value={customPronouns}
                  onChange={(e) => setCustomPronouns(e.target.value)}
                  placeholder={t('dashboard.profile.customPronouns')}
                  className="mt-2 w-full px-4 py-3 rounded-xl bg-background-secondary border border-border text-foreground placeholder-foreground-muted/50 focus:outline-none focus:border-primary/50 transition-colors duration-(--animation-speed)"
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground-muted mb-2">{t('dashboard.profile.birthday')}</label>
              <div className="relative">
                <Cake size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground-muted/50" />
                <input
                  type="date"
                  value={formData.birthday}
                  onChange={(e) => updateField('birthday', e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-background-secondary border border-border text-foreground focus:outline-none focus:border-primary/50 transition-colors duration-(--animation-speed)"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground-muted mb-2">{t('dashboard.profile.creatorType')}</label>
            <div className="flex flex-wrap gap-2">
              {CREATOR_TYPES.filter((ct) => ct.value).map((type) => (
                <button
                  key={type.value}
                  onClick={() => {
                    const current = formData.creatorTypes || []
                    if (current.includes(type.value)) {
                      updateField('creatorTypes', current.filter((t) => t !== type.value))
                    } else {
                      updateField('creatorTypes', [...current, type.value])
                    }
                  }}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-(--animation-speed) ${
                    formData.creatorTypes?.includes(type.value)
                      ? 'bg-primary/20 text-primary border border-primary/30'
                      : 'bg-background-secondary text-foreground-muted border border-border hover:bg-background-secondary/80'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Social Links */}
      <div className="rounded-lg overflow-hidden bg-card/50 border border-border backdrop-blur-xl">
        <div className="p-5 border-b border-border">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Globe size={20} className="text-primary" />
            {t('dashboard.profile.socialLinks')}
          </h2>
        </div>
        <div className="p-5 space-y-3">
          {SOCIAL_PLATFORMS.map((platform) => {
            const Icon = platform.icon
            return (
              <div key={platform.key} className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: platform.bgColor }}
                >
                  <Icon size={18} style={{ color: platform.color }} />
                </div>
                <input
                  type="text"
                  value={formData.socials[platform.key] || ''}
                  onChange={(e) => updateSocial(platform.key, e.target.value)}
                  placeholder={platform.placeholder}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-background-secondary border border-border text-foreground placeholder-foreground-muted/50 focus:outline-none focus:border-primary/50 transition-colors duration-(--animation-speed)"
                />
              </div>
            )
          })}

          <button
            onClick={() => setShowMoreSocials(!showMoreSocials)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-background-secondary border border-border text-foreground-muted hover:bg-background-secondary/80 transition-colors duration-(--animation-speed)"
          >
            <Plus size={16} />
            {t('dashboard.profile.addMore')}
            <ChevronDown size={16} className={`transition-transform duration-(--animation-speed) ${showMoreSocials ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {showMoreSocials && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3 overflow-hidden"
              >
                <div className="relative">
                  <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground-muted/50" />
                  <input
                    type="text"
                    value={socialSearch}
                    onChange={(e) => setSocialSearch(e.target.value)}
                    placeholder={t('dashboard.profile.searchPlatforms')}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-background-secondary border border-border text-foreground placeholder-foreground-muted/50 focus:outline-none focus:border-primary/50 transition-colors duration-(--animation-speed)"
                  />
                  {socialSearch && (
                    <button
                      onClick={() => setSocialSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      <X size={14} className="text-foreground-muted/50" />
                    </button>
                  )}
                </div>

                {filteredAdditional.map((platform) => {
                  const Icon = platform.icon
                  return (
                    <div key={platform.key} className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: platform.bgColor }}
                      >
                        <Icon size={18} style={{ color: platform.color }} />
                      </div>
                      <input
                        type="text"
                        value={formData.socials[platform.key] || ''}
                        onChange={(e) => updateSocial(platform.key, e.target.value)}
                        placeholder={platform.placeholder}
                        className="flex-1 px-4 py-2.5 rounded-xl bg-background-secondary border border-border text-foreground placeholder-foreground-muted/50 focus:outline-none focus:border-primary/50 transition-colors duration-(--animation-speed)"
                      />
                    </div>
                  )
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Connected Services */}
      <div className="rounded-lg overflow-hidden bg-card/50 border border-border backdrop-blur-xl mt-6">
        <div className="p-5 border-b border-border">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Link2 size={20} className="text-primary" />
            {t('dashboard.profile.connectedServices')}
          </h2>
          <p className="text-sm text-foreground-muted mt-1">
            {t('dashboard.profile.connectedServicesDesc')}
          </p>
        </div>
        <div className="p-5 space-y-3">
          {/* Spotify Service */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-background-secondary/50 hover:bg-background-secondary/70 transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                <SiSpotify size={20} className="text-green-500" />
              </div>
              <div>
                <p className="font-medium text-foreground">{t('dashboard.profile.services.spotify.name')}</p>
                <p className="text-xs text-foreground-muted">
                  {spotifyConnection?.connected 
                    ? t('dashboard.profile.services.spotify.connectedSince', { 
                        date: spotifyConnection.connectedAt ? new Date(spotifyConnection.connectedAt).toLocaleDateString() : ''
                      })
                    : t('dashboard.profile.services.spotify.description')}
                </p>
              </div>
            </div>
            {spotifyConnection?.connected ? (
              <button
                onClick={() => spotifyDisconnectMutation.mutate()}
                disabled={spotifyDisconnectMutation.isPending}
                className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors text-sm font-medium flex items-center gap-2"
              >
                {spotifyDisconnectMutation.isPending ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Trash2 size={14} />
                )}
                {t('common.disconnect')}
              </button>
            ) : (
              <a
                href="/api/spotify/connect"
                className="px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors text-sm font-medium flex items-center gap-2"
              >
                <Link2 size={14} />
                {t('common.connect')}
              </a>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function InputField({
  label,
  icon: Icon,
  value,
  onChange,
  placeholder,
  hint,
}: {
  label: string
  icon: typeof User
  value: string
  onChange: (v: string) => void
  placeholder: string
  hint?: string
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-foreground-muted mb-2">{label}</label>
      <div className="relative">
        <Icon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground-muted/50" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-12 pr-4 py-3 rounded-xl bg-background-secondary border border-border text-foreground placeholder-foreground-muted/50 focus:outline-none focus:border-primary/50 transition-colors duration-(--animation-speed)"
        />
      </div>
      {hint && <p className="text-xs text-primary mt-1.5 font-mono">{hint}</p>}
    </div>
  )
}
