import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'motion/react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import {
  getSpotifyAuthUrlFn,
  getSpotifyConnectionFn,
  disconnectSpotifyFn,
  updateSpotifySettingsFn,
} from '@/server/functions/spotify'
import { SiSpotify } from 'react-icons/si'
import {
  Link2,
  Unlink,
  Loader2,
  CheckCircle2,
  Eye,
  EyeOff,
  ExternalLink,
  AlertCircle,
  Shield,
  Zap,
  Image,
  BarChart3,
} from 'lucide-react'

interface SpotifyConnectProps {
  theme: {
    colors: {
      primary: string
      accent: string
      foreground: string
      foregroundMuted: string
      background: string
      backgroundSecondary: string
      card: string
      border: string
    }
  }
}

const SPOTIFY_GREEN = '#1DB954'

export function SpotifyConnect({ theme }: SpotifyConnectProps) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [isConnecting, setIsConnecting] = useState(false)

  const getAuthUrl = useServerFn(getSpotifyAuthUrlFn)
  const getConnection = useServerFn(getSpotifyConnectionFn)
  const disconnect = useServerFn(disconnectSpotifyFn)
  const updateSettings = useServerFn(updateSpotifySettingsFn)

  const { data: connection, isLoading } = useQuery({
    queryKey: ['spotifyConnection'],
    queryFn: () => getConnection(),
  })

  const connectMutation = useMutation({
    mutationFn: async () => {
      setIsConnecting(true)
      const result = await getAuthUrl()
      if (result.url) window.location.href = result.url
    },
    onError: () => setIsConnecting(false),
  })

  const disconnectMutation = useMutation({
    mutationFn: () => disconnect(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['spotifyConnection'] })
      void queryClient.invalidateQueries({ queryKey: ['nowPlaying'] })
    },
  })

  const toggleVisibilityMutation = useMutation({
    mutationFn: (showOnProfile: boolean) => updateSettings({ data: { showOnProfile } }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['spotifyConnection'] }),
  })

  const cardStyle = {
    background: `linear-gradient(135deg, ${theme.colors.card}ee, ${theme.colors.backgroundSecondary}cc)`,
    border: `1px solid ${theme.colors.border}`,
    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
  }

  if (isLoading) {
    return (
      <div className="rounded-3xl backdrop-blur-xl p-6" style={cardStyle}>
        <div className="flex items-center gap-4">
          <Loader2 size={24} className="animate-spin" style={{ color: theme.colors.foregroundMuted }} />
          <span className="text-sm" style={{ color: theme.colors.foregroundMuted }}>
            {t('spotify.connect.loading')}
          </span>
        </div>
      </div>
    )
  }

  const features = [
    { icon: Zap, label: t('spotify.connect.features.realtime') },
    { icon: Image, label: t('spotify.connect.features.albumArt') },
    { icon: BarChart3, label: t('spotify.connect.features.progressBar') },
    { icon: Shield, label: t('spotify.connect.features.privacy') },
  ]

  return (
    <motion.div
      className="rounded-3xl overflow-hidden relative backdrop-blur-xl"
      style={cardStyle}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      {/* Decorative gradient */}
      <div
        className="absolute -top-24 -right-24 w-48 h-48 opacity-10 pointer-events-none blur-3xl"
        style={{ background: SPOTIFY_GREEN }}
      />

      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <motion.div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${SPOTIFY_GREEN}25, ${SPOTIFY_GREEN}10)`,
                border: `1px solid ${SPOTIFY_GREEN}30`,
              }}
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              <SiSpotify size={28} style={{ color: SPOTIFY_GREEN }} />
            </motion.div>
            <div>
              <h3 className="text-lg font-bold" style={{ color: theme.colors.foreground }}>
                {t('spotify.connect.title')}
              </h3>
              <p className="text-sm" style={{ color: theme.colors.foregroundMuted }}>
                {connection?.connected ? t('spotify.connect.connected') : t('spotify.connect.subtitle')}
              </p>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {connection?.connected ? (
              <motion.div
                key="connected"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                style={{ background: `${SPOTIFY_GREEN}20`, color: SPOTIFY_GREEN }}
              >
                <CheckCircle2 size={14} />
                {t('spotify.connect.connected')}
              </motion.div>
            ) : (
              <motion.div
                key="disconnected"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                style={{ background: `${theme.colors.foregroundMuted}15`, color: theme.colors.foregroundMuted }}
              >
                <AlertCircle size={14} />
                {t('spotify.connect.notConnected')}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {connection?.connected ? (
          <div className="space-y-4">
            {/* Visibility Toggle */}
            <motion.div
              className="flex items-center justify-between p-4 rounded-2xl"
              style={{ background: theme.colors.backgroundSecondary }}
              whileHover={{ scale: 1.01 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: connection.showOnProfile ? `${SPOTIFY_GREEN}20` : `${theme.colors.foregroundMuted}15` }}
                >
                  {connection.showOnProfile ? (
                    <Eye size={20} style={{ color: SPOTIFY_GREEN }} />
                  ) : (
                    <EyeOff size={20} style={{ color: theme.colors.foregroundMuted }} />
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: theme.colors.foreground }}>
                    {t('spotify.connect.showOnProfile')}
                  </p>
                  <p className="text-xs" style={{ color: theme.colors.foregroundMuted }}>
                    {connection.showOnProfile ? t('spotify.connect.visibleToVisitors') : t('spotify.connect.activityHidden')}
                  </p>
                </div>
              </div>

              <motion.button
                onClick={() => toggleVisibilityMutation.mutate(!connection.showOnProfile)}
                disabled={toggleVisibilityMutation.isPending}
                className="relative w-14 h-7 rounded-full transition-colors cursor-pointer"
                style={{ background: connection.showOnProfile ? SPOTIFY_GREEN : theme.colors.border }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  className="absolute top-1 w-5 h-5 rounded-full bg-white shadow-md"
                  animate={{ left: connection.showOnProfile ? 32 : 4 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              </motion.button>
            </motion.div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <motion.a
                href="https://open.spotify.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-sm font-semibold transition-all"
                style={{ background: theme.colors.backgroundSecondary, color: theme.colors.foreground }}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <ExternalLink size={18} />
                {t('spotify.connect.openSpotify')}
              </motion.a>

              <motion.button
                onClick={() => disconnectMutation.mutate()}
                disabled={disconnectMutation.isPending}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-sm font-semibold transition-all"
                style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                {disconnectMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <Unlink size={18} />}
                {t('spotify.connect.disconnect')}
              </motion.button>
            </div>

            {/* Connected Since */}
            <p className="text-xs text-center pt-2" style={{ color: theme.colors.foregroundMuted }}>
              {t('spotify.connect.connectedSince')} {new Date(connection.connectedAt!).toLocaleDateString()}
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Description */}
            <p className="text-sm leading-relaxed" style={{ color: theme.colors.foregroundMuted }}>
              {t('spotify.connect.connectDescription')}
            </p>

            {/* Features Grid */}
            <div className="grid grid-cols-2 gap-3">
              {features.map(({ icon: Icon, label }) => (
                <motion.div
                  key={label}
                  className="flex items-center gap-2.5 p-3 rounded-xl"
                  style={{ background: theme.colors.backgroundSecondary }}
                  whileHover={{ scale: 1.02, x: 4 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${SPOTIFY_GREEN}15` }}>
                    <Icon size={16} style={{ color: SPOTIFY_GREEN }} />
                  </div>
                  <span className="text-xs font-medium" style={{ color: theme.colors.foreground }}>{label}</span>
                </motion.div>
              ))}
            </div>

            {/* Connect Button */}
            <motion.button
              onClick={() => connectMutation.mutate()}
              disabled={isConnecting || connectMutation.isPending}
              className="w-full flex items-center justify-center gap-2.5 px-5 py-4 rounded-2xl text-base font-bold text-white transition-all"
              style={{
                background: `linear-gradient(135deg, ${SPOTIFY_GREEN}, #1ed760)`,
                boxShadow: `0 8px 24px ${SPOTIFY_GREEN}40`,
              }}
              whileHover={{ scale: 1.02, y: -2, boxShadow: `0 12px 32px ${SPOTIFY_GREEN}50` }}
              whileTap={{ scale: 0.98 }}
            >
              {isConnecting || connectMutation.isPending ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  <Link2 size={20} />
                  {t('spotify.connect.connectButton')}
                </>
              )}
            </motion.button>

            {/* Privacy Note */}
            <div className="flex items-center justify-center gap-2 text-xs" style={{ color: theme.colors.foregroundMuted }}>
              <Shield size={14} style={{ color: SPOTIFY_GREEN }} />
              <span>{t('spotify.connect.privacyNote')}</span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}
