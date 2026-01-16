import { useState } from 'react'
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
  CheckCircle,
  Eye,
  EyeOff,
  ExternalLink,
  AlertCircle,
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

export function SpotifyConnect({ theme }: SpotifyConnectProps) {
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
      if (result.url) {
        window.location.href = result.url
      }
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
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['spotifyConnection'] })
    },
  })

  if (isLoading) {
    return (
      <div className="p-6 rounded-2xl" style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}>
        <div className="flex items-center gap-3">
          <Loader2 size={20} className="animate-spin" style={{ color: theme.colors.foregroundMuted }} />
          <span style={{ color: theme.colors.foregroundMuted }}>Loading Spotify connection...</span>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      className="p-6 rounded-2xl overflow-hidden relative"
      style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="absolute top-0 right-0 w-32 h-32 opacity-5 pointer-events-none" style={{ background: `radial-gradient(circle, #1DB954 0%, transparent 70%)` }} />

      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: '#1DB95420' }}>
            <SiSpotify size={24} style={{ color: '#1DB954' }} />
          </div>
          <div>
            <h3 className="font-bold" style={{ color: theme.colors.foreground }}>Spotify Integration</h3>
            <p className="text-sm" style={{ color: theme.colors.foregroundMuted }}>
              {connection?.connected ? 'Connected' : 'Show what you\'re listening to'}
            </p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {connection?.connected ? (
            <motion.div
              key="connected"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
              style={{ background: '#1DB95420', color: '#1DB954' }}
            >
              <CheckCircle size={12} />
              Connected
            </motion.div>
          ) : (
            <motion.div
              key="disconnected"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
              style={{ background: `${theme.colors.foregroundMuted}20`, color: theme.colors.foregroundMuted }}
            >
              <AlertCircle size={12} />
              Not connected
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {connection?.connected ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: theme.colors.backgroundSecondary }}>
            <div className="flex items-center gap-3">
              {connection.showOnProfile ? (
                <Eye size={18} style={{ color: '#1DB954' }} />
              ) : (
                <EyeOff size={18} style={{ color: theme.colors.foregroundMuted }} />
              )}
              <div>
                <p className="text-sm font-medium" style={{ color: theme.colors.foreground }}>Show on profile</p>
                <p className="text-xs" style={{ color: theme.colors.foregroundMuted }}>
                  {connection.showOnProfile ? 'Visitors can see your activity' : 'Activity is hidden'}
                </p>
              </div>
            </div>
            <motion.button
              onClick={() => toggleVisibilityMutation.mutate(!connection.showOnProfile)}
              disabled={toggleVisibilityMutation.isPending}
              className="relative w-12 h-6 rounded-full transition-colors"
              style={{ background: connection.showOnProfile ? '#1DB954' : theme.colors.border }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-md"
                animate={{ left: connection.showOnProfile ? 28 : 4 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            </motion.button>
          </div>

          <div className="flex gap-2">
            <motion.a
              href="https://open.spotify.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{ background: theme.colors.backgroundSecondary, color: theme.colors.foreground }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <ExternalLink size={16} />
              Open Spotify
            </motion.a>
            <motion.button
              onClick={() => disconnectMutation.mutate()}
              disabled={disconnectMutation.isPending}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {disconnectMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Unlink size={16} />}
              Disconnect
            </motion.button>
          </div>

          <p className="text-xs text-center" style={{ color: theme.colors.foregroundMuted }}>
            Connected since {new Date(connection.connectedAt!).toLocaleDateString()}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm" style={{ color: theme.colors.foregroundMuted }}>
            Connect your Spotify account to display what you're currently listening to on your bio page.
            Your visitors will see real-time updates of your music activity.
          </p>

          <motion.button
            onClick={() => connectMutation.mutate()}
            disabled={isConnecting || connectMutation.isPending}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-white transition-all"
            style={{ background: '#1DB954', boxShadow: '0 4px 20px rgba(29, 185, 84, 0.3)' }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isConnecting || connectMutation.isPending ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>
                <Link2 size={18} />
                Connect Spotify
              </>
            )}
          </motion.button>

          <div className="flex items-center gap-2 text-xs" style={{ color: theme.colors.foregroundMuted }}>
            <SiSpotify size={12} style={{ color: '#1DB954' }} />
            <span>We only request read access to your playback</span>
          </div>
        </div>
      )}
    </motion.div>
  )
}
