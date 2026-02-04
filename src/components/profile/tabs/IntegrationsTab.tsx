import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'
import {
  Unlink,
  ExternalLink,
  Check,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  RefreshCw,
  Sparkles,
  Shield,
  Zap,
  Lock,
  KeyRound,
} from 'lucide-react'
import { SiDiscord, SiSteam, SiTwitch, SiGithub } from 'react-icons/si'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  getConnectedPlatformsFn,
  getOAuthUrlFn,
  disconnectPlatformFn,
  toggleShowOnProfileFn,
  SUPPORTED_PLATFORMS,
  type SupportedPlatform,
} from '@/server/functions/social-integrations'
import { useTheme } from '@/components/layout/ThemeProvider'

const PLATFORM_CONFIG: Record<
  SupportedPlatform,
  {
    name: string
    icon: React.ComponentType<{
      className?: string
      style?: React.CSSProperties
    }>
    color: string
    gradient: string
    description: string
  }
> = {
  discord: {
    name: 'Discord',
    icon: SiDiscord,
    color: '#5865F2',
    gradient: 'from-[#5865F2] to-[#7289DA]',
    description: 'Show your Discord status and server info',
  },
  steam: {
    name: 'Steam',
    icon: SiSteam,
    color: '#66c0f4',
    gradient: 'from-[#1b2838] to-[#2a475e]',
    description: 'Display your Steam profile and games',
  },
  twitch: {
    name: 'Twitch',
    icon: SiTwitch,
    color: '#9146FF',
    gradient: 'from-[#9146FF] to-[#772CE8]',
    description: 'Show your Twitch channel and live status',
  },
  github: {
    name: 'GitHub',
    icon: SiGithub,
    color: '#24292e',
    gradient: 'from-[#24292e] to-[#1a1e22]',
    description: 'Link your GitHub profile and repos',
  },
}

export function IntegrationsTab() {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const queryClient = useQueryClient()
  const [disconnectPlatform, setDisconnectPlatform] =
    useState<SupportedPlatform | null>(null)
  const [connectingPlatform, setConnectingPlatform] =
    useState<SupportedPlatform | null>(null)

  // Card style based on theme
  const getCardStyle = () => {
    switch (theme.effects.cardStyle) {
      case 'glass':
        return 'backdrop-blur-xl bg-card/10 border border-border/20'
      case 'neon':
        return 'bg-card/5 border border-primary/30 shadow-[0_0_20px_rgba(var(--primary-rgb),0.15)]'
      case 'gradient':
        return 'bg-linear-to-br from-card/20 to-background-secondary/20 border border-border/20'
      case 'flat':
      default:
        return 'bg-card border border-border/30'
    }
  }
  const cardStyle = getCardStyle()

  const { data: connectedData, isLoading } = useQuery({
    queryKey: ['connected-platforms'],
    queryFn: () => getConnectedPlatformsFn(),
  })

  const connectMutation = useMutation({
    mutationFn: async (platform: SupportedPlatform) => {
      setConnectingPlatform(platform)
      const result = await getOAuthUrlFn({ data: { platform } })
      if ('error' in result && result.error) {
        throw new Error(result.error)
      }
      if ('url' in result && result.url) {
        window.location.href = result.url
      }
    },
    onError: () => {
      setConnectingPlatform(null)
    },
  })

  const disconnectMutation = useMutation({
    mutationFn: (platform: SupportedPlatform) =>
      disconnectPlatformFn({ data: { platform } }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['connected-platforms'] })
      setDisconnectPlatform(null)
    },
  })

  const toggleVisibilityMutation = useMutation({
    mutationFn: ({
      platform,
      show,
    }: {
      platform: SupportedPlatform
      show: boolean
    }) => toggleShowOnProfileFn({ data: { platform, show } }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['connected-platforms'] })
    },
  })

  const connectedPlatforms = connectedData?.integrations || []

  const isConnected = (platform: string) =>
    connectedPlatforms.some((p) => p.platform === platform)

  const getConnection = (platform: string) =>
    connectedPlatforms.find((p) => p.platform === platform)

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-20 gap-4"
      >
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
          <Sparkles className="absolute inset-0 m-auto h-6 w-6 text-primary" />
        </div>
        <p className="text-muted-foreground">{t('common.loading')}</p>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Hero Header */}
      <div
        className="relative overflow-hidden rounded-2xl border p-6 md:p-8"
        style={{
          background: `linear-gradient(135deg, ${theme.colors.primary}10, transparent, ${theme.colors.accent}10)`,
          borderColor: theme.colors.border + '50',
        }}
      >
        <div
          className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"
          style={{ backgroundColor: theme.colors.primary + '15' }}
        />
        <div
          className="absolute bottom-0 left-0 w-48 h-48 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"
          style={{ backgroundColor: theme.colors.accent + '15' }}
        />

        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div
                className="p-2 rounded-lg"
                style={{ backgroundColor: theme.colors.primary + '20' }}
              >
                <Zap
                  className="h-5 w-5"
                  style={{ color: theme.colors.primary }}
                />
              </div>
              <h1
                className="text-2xl md:text-3xl font-bold bg-clip-text"
                style={{
                  backgroundImage: `linear-gradient(to right, ${theme.colors.foreground}, ${theme.colors.foreground}aa)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {t('integrations.title')}
              </h1>
            </div>
            <p
              className="max-w-md"
              style={{ color: theme.colors.foregroundMuted }}
            >
              {t('integrations.description')}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div
              className="flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur border"
              style={{
                backgroundColor: theme.colors.background + 'cc',
                borderColor: theme.colors.border + '50',
              }}
            >
              <div className="flex -space-x-2">
                {connectedPlatforms.slice(0, 3).map((p) => {
                  const config =
                    PLATFORM_CONFIG[p.platform as SupportedPlatform]
                  const Icon = config?.icon
                  return Icon ? (
                    <div
                      key={p.platform}
                      className="w-6 h-6 rounded-full flex items-center justify-center"
                      style={{
                        backgroundColor: config.color,
                        boxShadow: `0 0 0 2px ${theme.colors.background}`,
                      }}
                    >
                      <Icon className="h-3 w-3 text-white" />
                    </div>
                  ) : null
                })}
              </div>
              <span
                className="text-sm font-medium"
                style={{ color: theme.colors.foreground }}
              >
                {connectedPlatforms.length}/{SUPPORTED_PLATFORMS.length}{' '}
                {t('integrations.connected_count')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Platform Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {SUPPORTED_PLATFORMS.map((platformId, index) => {
          const platform = PLATFORM_CONFIG[platformId]
          const Icon = platform.icon
          const connected = isConnected(platformId)
          const connection = getConnection(platformId)
          const isConnecting = connectingPlatform === platformId

          return (
            <motion.div
              key={platformId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group relative overflow-hidden rounded-xl border transition-all duration-300"
              style={{
                borderColor: connected
                  ? theme.colors.primary + '50'
                  : theme.colors.border + '50',
                background: connected
                  ? `linear-gradient(135deg, ${theme.colors.primary}10, transparent)`
                  : theme.colors.card + '50',
              }}
            >
              {/* Gradient overlay on hover */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: `linear-gradient(135deg, ${platform.gradient})`,
                  opacity: connected ? 0.05 : 0,
                }}
              />

              {/* Connected indicator */}
              {connected && (
                <div className="absolute top-3 right-3">
                  <Badge
                    className="gap-1 border"
                    style={{
                      backgroundColor: '#10b98120',
                      color: '#10b981',
                      borderColor: '#10b98130',
                    }}
                  >
                    <Check className="h-3 w-3" />
                    {t('integrations.connected_badge')}
                  </Badge>
                </div>
              )}

              <div className="relative p-5 space-y-4">
                {/* Platform Header */}
                <div className="flex items-start gap-4">
                  <motion.div
                    whileHover={{ scale: 1.05, rotate: 5 }}
                    className="p-3 rounded-xl transition-colors"
                    style={{
                      backgroundColor: `${platform.color}15`,
                      boxShadow: connected
                        ? `0 0 20px ${platform.color}20`
                        : 'none',
                    }}
                  >
                    <Icon
                      className="h-6 w-6"
                      style={{ color: platform.color }}
                    />
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <h3
                      className="font-semibold text-lg"
                      style={{ color: theme.colors.foreground }}
                    >
                      {platform.name}
                    </h3>
                    {connected && connection?.platformUsername ? (
                      <p
                        className="text-sm truncate"
                        style={{ color: theme.colors.foregroundMuted }}
                      >
                        @{connection.platformUsername}
                      </p>
                    ) : (
                      <p
                        className="text-sm line-clamp-1"
                        style={{ color: theme.colors.foregroundMuted }}
                      >
                        {platform.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Connected State */}
                {connected ? (
                  <div className="space-y-3">
                    {/* Visibility Toggle */}
                    <div
                      className="flex items-center justify-between p-3 rounded-lg border"
                      style={{
                        backgroundColor: theme.colors.background + '50',
                        borderColor: theme.colors.border + '30',
                      }}
                    >
                      <div className="flex items-center gap-2">
                        {connection?.showOnProfile ? (
                          <Eye
                            className="h-4 w-4"
                            style={{ color: theme.colors.primary }}
                          />
                        ) : (
                          <EyeOff
                            className="h-4 w-4"
                            style={{ color: theme.colors.foregroundMuted }}
                          />
                        )}
                        <span
                          className="text-sm"
                          style={{ color: theme.colors.foreground }}
                        >
                          {t('integrations.show_on_profile')}
                        </span>
                      </div>
                      <Switch
                        checked={connection?.showOnProfile ?? true}
                        onCheckedChange={(checked) =>
                          toggleVisibilityMutation.mutate({
                            platform: platformId,
                            show: checked,
                          })
                        }
                        disabled={toggleVisibilityMutation.isPending}
                      />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        style={{
                          borderColor: theme.colors.border + '50',
                          color: theme.colors.foreground,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor =
                            theme.colors.primary + '10'
                          e.currentTarget.style.color = theme.colors.primary
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent'
                          e.currentTarget.style.color = theme.colors.foreground
                        }}
                        onClick={() => setDisconnectPlatform(platformId)}
                      >
                        <Unlink className="h-4 w-4 mr-2" />
                        {t('integrations.disconnect')}
                      </Button>
                      {platformId !== 'steam' && (
                        <Button
                          variant="outline"
                          size="sm"
                          style={{
                            borderColor: theme.colors.border + '50',
                            color: theme.colors.foreground,
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor =
                              theme.colors.primary + '10'
                            e.currentTarget.style.color = theme.colors.primary
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor =
                              'transparent'
                            e.currentTarget.style.color =
                              theme.colors.foreground
                          }}
                          onClick={() => connectMutation.mutate(platformId)}
                          disabled={isConnecting}
                        >
                          <RefreshCw
                            className={`h-4 w-4 ${isConnecting ? 'animate-spin' : ''}`}
                          />
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Connect Button */
                  <Button
                    className="w-full relative overflow-hidden group/btn"
                    style={{
                      background: `linear-gradient(135deg, ${platform.color}, ${platform.color}dd)`,
                    }}
                    disabled={isConnecting}
                    onClick={() => connectMutation.mutate(platformId)}
                  >
                    <span className="absolute inset-0 bg-white/10 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
                    <span className="relative flex items-center justify-center gap-2">
                      {isConnecting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <ExternalLink className="h-4 w-4" />
                      )}
                      {t('integrations.connect')}
                    </span>
                  </Button>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Security Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className={`overflow-hidden rounded-xl ${cardStyle}`}
      >
        <div
          className="p-5 border-b"
          style={{ borderColor: theme.colors.border + '20' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="p-2 rounded-lg"
              style={{ backgroundColor: '#10b98120' }}
            >
              <Shield className="h-5 w-5" style={{ color: '#10b981' }} />
            </div>
            <div>
              <h3
                className="font-semibold"
                style={{ color: theme.colors.foreground }}
              >
                {t('integrations.security.title')}
              </h3>
              <p
                className="text-sm"
                style={{ color: theme.colors.foregroundMuted }}
              >
                {t('integrations.security.subtitle')}
              </p>
            </div>
          </div>
        </div>
        <div className="p-5 grid gap-4 sm:grid-cols-3">
          <div className="flex items-start gap-3">
            <div
              className="p-1.5 rounded-md mt-0.5"
              style={{ backgroundColor: theme.colors.primary + '10' }}
            >
              <Lock
                className="h-4 w-4"
                style={{ color: theme.colors.primary }}
              />
            </div>
            <div>
              <p
                className="text-sm font-medium"
                style={{ color: theme.colors.foreground }}
              >
                {t('integrations.security.oauth_title')}
              </p>
              <p
                className="text-xs mt-0.5"
                style={{ color: theme.colors.foregroundMuted }}
              >
                {t('integrations.security.oauth_desc')}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div
              className="p-1.5 rounded-md mt-0.5"
              style={{ backgroundColor: theme.colors.primary + '10' }}
            >
              <KeyRound
                className="h-4 w-4"
                style={{ color: theme.colors.primary }}
              />
            </div>
            <div>
              <p
                className="text-sm font-medium"
                style={{ color: theme.colors.foreground }}
              >
                {t('integrations.security.no_password_title')}
              </p>
              <p
                className="text-xs mt-0.5"
                style={{ color: theme.colors.foregroundMuted }}
              >
                {t('integrations.security.no_password_desc')}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div
              className="p-1.5 rounded-md mt-0.5"
              style={{ backgroundColor: theme.colors.primary + '10' }}
            >
              <Unlink
                className="h-4 w-4"
                style={{ color: theme.colors.primary }}
              />
            </div>
            <div>
              <p
                className="text-sm font-medium"
                style={{ color: theme.colors.foreground }}
              >
                {t('integrations.security.revoke_title')}
              </p>
              <p
                className="text-xs mt-0.5"
                style={{ color: theme.colors.foregroundMuted }}
              >
                {t('integrations.security.revoke_desc')}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Disconnect Confirmation Dialog */}
      <AlertDialog
        open={!!disconnectPlatform}
        onOpenChange={() => setDisconnectPlatform(null)}
      >
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              {t('integrations.disconnect_confirm.title')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('integrations.disconnect_confirm.description', {
                platform: disconnectPlatform
                  ? PLATFORM_CONFIG[disconnectPlatform]?.name
                  : '',
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                disconnectPlatform &&
                disconnectMutation.mutate(disconnectPlatform)
              }
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {disconnectMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Unlink className="h-4 w-4 mr-2" />
                  {t('integrations.disconnect')}
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  )
}
