import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'
import {
  Unlink, ExternalLink, Check, AlertCircle, Loader2, Eye, EyeOff, RefreshCw,
  Sparkles, Shield, Zap, Lock, KeyRound,
} from 'lucide-react'
import { SiDiscord, SiSteam, SiTwitch, SiGithub } from 'react-icons/si'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  getConnectedPlatformsFn, getOAuthUrlFn, disconnectPlatformFn, toggleShowOnProfileFn,
  SUPPORTED_PLATFORMS, type SupportedPlatform,
} from '@/server/functions/social-integrations'

const PLATFORM_CONFIG: Record<SupportedPlatform, {
  name: string; icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>
  color: string; gradient: string; description: string
}> = {
  discord: { name: 'Discord', icon: SiDiscord, color: '#5865F2', gradient: 'from-[#5865F2] to-[#7289DA]', description: 'Show your Discord status and server info' },
  steam: { name: 'Steam', icon: SiSteam, color: '#66c0f4', gradient: 'from-[#1b2838] to-[#2a475e]', description: 'Display your Steam profile and games' },
  twitch: { name: 'Twitch', icon: SiTwitch, color: '#9146FF', gradient: 'from-[#9146FF] to-[#772CE8]', description: 'Show your Twitch channel and live status' },
  github: { name: 'GitHub', icon: SiGithub, color: '#24292e', gradient: 'from-[#24292e] to-[#1a1e22]', description: 'Link your GitHub profile and repos' },
}

export function IntegrationsTab() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [disconnectPlatform, setDisconnectPlatform] = useState<SupportedPlatform | null>(null)
  const [connectingPlatform, setConnectingPlatform] = useState<SupportedPlatform | null>(null)

  const { data: connectedData, isLoading } = useQuery({ queryKey: ['connected-platforms'], queryFn: () => getConnectedPlatformsFn() })

  const connectMutation = useMutation({
    mutationFn: async (platform: SupportedPlatform) => {
      setConnectingPlatform(platform)
      const result = await getOAuthUrlFn({ data: { platform } })
      if ('error' in result && result.error) throw new Error(result.error)
      if ('url' in result && result.url) window.location.href = result.url
    },
    onError: () => { setConnectingPlatform(null) },
  })
  const disconnectMutation = useMutation({
    mutationFn: (platform: SupportedPlatform) => disconnectPlatformFn({ data: { platform } }),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: ['connected-platforms'] }); setDisconnectPlatform(null) },
  })
  const toggleVisibilityMutation = useMutation({
    mutationFn: ({ platform, show }: { platform: SupportedPlatform; show: boolean }) => toggleShowOnProfileFn({ data: { platform, show } }),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: ['connected-platforms'] }) },
  })

  const connectedPlatforms = connectedData?.integrations || []
  const isConnected = (platform: string) => connectedPlatforms.some((p) => p.platform === platform)
  const getConnection = (platform: string) => connectedPlatforms.find((p) => p.platform === platform)

  if (isLoading) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
          <Sparkles className="absolute inset-0 m-auto h-6 w-6 text-primary" />
        </div>
        <p className="text-muted-foreground">{t('common.loading')}</p>
      </motion.div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      {/* Hero Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl backdrop-blur-xl bg-card/30 border border-border/20 p-6 md:p-8">
        <div className="absolute inset-0 bg-linear-to-br from-primary/8 via-transparent to-accent/8 pointer-events-none" />
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl bg-primary/10 -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full blur-3xl bg-accent/10 translate-y-1/2 -translate-x-1/2 pointer-events-none" />

        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/15"><Zap className="h-5 w-5 text-primary" /></div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">{t('integrations.title')}</h1>
            </div>
            <p className="max-w-md text-foreground-muted">{t('integrations.description')}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-sm bg-card/40 border border-border/20">
              <div className="flex -space-x-2">
                {connectedPlatforms.slice(0, 3).map((p) => {
                  const config = PLATFORM_CONFIG[p.platform as SupportedPlatform]
                  const Icon = config?.icon
                  return Icon ? (
                    <div key={p.platform} className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: config.color, boxShadow: '0 0 0 2px var(--background)' }}>
                      <Icon className="h-3 w-3 text-white" />
                    </div>
                  ) : null
                })}
              </div>
              <span className="text-sm font-medium text-foreground">{connectedPlatforms.length}/{SUPPORTED_PLATFORMS.length} {t('integrations.connected_count')}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Platform Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {SUPPORTED_PLATFORMS.map((platformId, index) => {
          const platform = PLATFORM_CONFIG[platformId]
          const Icon = platform.icon
          const connected = isConnected(platformId)
          const connection = getConnection(platformId)
          const isConnecting = connectingPlatform === platformId

          return (
            <motion.div key={platformId} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}
              whileHover={{ y: -2 }}
              className={`group relative overflow-hidden rounded-2xl backdrop-blur-xl border theme-animation ${
                connected ? 'border-primary/25 bg-card/35' : 'border-border/20 bg-card/25'
              }`}>
              <div className="absolute inset-0 bg-linear-to-br from-primary/3 via-transparent to-accent/3 pointer-events-none" />
              {connected && <div className="absolute top-3 right-3"><Badge className="gap-1 border bg-emerald-500/15 text-emerald-400 border-emerald-500/25"><Check className="h-3 w-3" />{t('integrations.connected_badge')}</Badge></div>}

              <div className="relative p-5 space-y-4">
                <div className="flex items-start gap-4">
                  <motion.div whileHover={{ scale: 1.05, rotate: 5 }} className="p-3 rounded-xl" style={{ backgroundColor: `${platform.color}15`, boxShadow: connected ? `0 0 20px ${platform.color}20` : 'none' }}>
                    <Icon className="h-6 w-6" style={{ color: platform.color }} />
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg text-foreground">{platform.name}</h3>
                    {connected && connection?.platformUsername ? (
                      <p className="text-sm text-foreground-muted truncate">@{connection.platformUsername}</p>
                    ) : (
                      <p className="text-sm text-foreground-muted line-clamp-1">{platform.description}</p>
                    )}
                  </div>
                </div>

                {connected ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg backdrop-blur-sm bg-background-secondary/20 border border-border/15">
                      <div className="flex items-center gap-2">
                        {connection?.showOnProfile ? <Eye className="h-4 w-4 text-primary" /> : <EyeOff className="h-4 w-4 text-foreground-muted" />}
                        <span className="text-sm text-foreground">{t('integrations.show_on_profile')}</span>
                      </div>
                      <Switch checked={connection?.showOnProfile ?? true} onCheckedChange={(checked) => toggleVisibilityMutation.mutate({ platform: platformId, show: checked })} disabled={toggleVisibilityMutation.isPending} />
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1 border-border/30 hover:bg-card/50" onClick={() => setDisconnectPlatform(platformId)}>
                        <Unlink className="h-4 w-4 mr-2" />{t('integrations.disconnect')}
                      </Button>
                      {platformId !== 'steam' && (
                        <Button variant="outline" size="sm" className="border-border/30 hover:bg-card/50" onClick={() => connectMutation.mutate(platformId)} disabled={isConnecting}>
                          <RefreshCw className={`h-4 w-4 ${isConnecting ? 'animate-spin' : ''}`} />
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  <Button className="w-full relative overflow-hidden group/btn" style={{ background: `linear-gradient(135deg, ${platform.color}, ${platform.color}dd)` }} disabled={isConnecting} onClick={() => connectMutation.mutate(platformId)}>
                    <span className="absolute inset-0 bg-white/10 translate-y-full group-hover/btn:translate-y-0 theme-animation" />
                    <span className="relative flex items-center justify-center gap-2">
                      {isConnecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />}
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
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
        className="overflow-hidden rounded-2xl backdrop-blur-xl bg-card/30 border border-border/20">
        <div className="p-5 border-b border-border/15">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/15"><Shield className="h-5 w-5 text-emerald-400" /></div>
            <div>
              <h3 className="font-semibold text-foreground">{t('integrations.security.title')}</h3>
              <p className="text-sm text-foreground-muted">{t('integrations.security.subtitle')}</p>
            </div>
          </div>
        </div>
        <div className="p-5 grid gap-4 sm:grid-cols-3">
          {[
            { icon: Lock, title: t('integrations.security.oauth_title'), desc: t('integrations.security.oauth_desc') },
            { icon: KeyRound, title: t('integrations.security.no_password_title'), desc: t('integrations.security.no_password_desc') },
            { icon: Unlink, title: t('integrations.security.revoke_title'), desc: t('integrations.security.revoke_desc') },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="p-1.5 rounded-md mt-0.5 bg-primary/10"><item.icon className="h-4 w-4 text-primary" /></div>
              <div><p className="text-sm font-medium text-foreground">{item.title}</p><p className="text-xs mt-0.5 text-foreground-muted">{item.desc}</p></div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Disconnect Dialog */}
      <AlertDialog open={!!disconnectPlatform} onOpenChange={() => setDisconnectPlatform(null)}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2"><AlertCircle className="h-5 w-5 text-destructive" />{t('integrations.disconnect_confirm.title')}</AlertDialogTitle>
            <AlertDialogDescription>{t('integrations.disconnect_confirm.description', { platform: disconnectPlatform ? PLATFORM_CONFIG[disconnectPlatform]?.name : '' })}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={() => disconnectPlatform && disconnectMutation.mutate(disconnectPlatform)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {disconnectMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Unlink className="h-4 w-4 mr-2" />{t('integrations.disconnect')}</>}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  )
}
