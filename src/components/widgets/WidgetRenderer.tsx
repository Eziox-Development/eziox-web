import { CountdownWidget } from './CountdownWidget'
import { YouTubeWidget } from './YouTubeWidget'
import { WeatherWidget } from './WeatherWidget'
import { motion } from 'motion/react'
import { Headphones, Twitch, Github, Smartphone, Package } from 'lucide-react'

interface Widget {
  id: string
  type: string
  title: string | null
  config: Record<string, unknown> | null
}

interface WidgetRendererProps {
  widget: Widget
}

export function WidgetRenderer({ widget }: WidgetRendererProps) {
  const config = (widget.config || {}) as Record<string, unknown>

  switch (widget.type) {
    case 'countdown':
      return (
        <CountdownWidget
          config={config as Parameters<typeof CountdownWidget>[0]['config']}
          title={widget.title}
        />
      )

    case 'youtube':
      return (
        <YouTubeWidget
          config={config as Parameters<typeof YouTubeWidget>[0]['config']}
          title={widget.title}
        />
      )

    case 'weather':
      return (
        <WeatherWidget
          config={config as Parameters<typeof WeatherWidget>[0]['config']}
          title={widget.title}
        />
      )

    case 'soundcloud':
      return (
        <SoundCloudPlaceholder
          config={config}
          title={widget.title}
        />
      )

    case 'twitch':
      return (
        <TwitchPlaceholder
          config={config}
          title={widget.title}
        />
      )

    case 'github':
      return (
        <GitHubPlaceholder
          config={config}
          title={widget.title}
        />
      )

    case 'social_feed':
      return (
        <SocialFeedPlaceholder
          config={config}
          title={widget.title}
        />
      )

    default:
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 text-center"
        >
          <Package size={32} className="mx-auto mb-2 text-white/40" />
          <p className="text-white/60 text-sm">Unknown widget type: {widget.type}</p>
        </motion.div>
      )
  }
}

function SoundCloudPlaceholder({ config, title }: { config: Record<string, unknown>; title: string | null }) {
  const trackUrl = config.trackUrl as string | undefined

  if (!trackUrl) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 text-center"
      >
        <Headphones size={32} className="mx-auto mb-2 text-orange-400" />
        <p className="text-white/60 text-sm">No track configured</p>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl overflow-hidden backdrop-blur-xl bg-white/5 border border-white/10"
    >
      {title && (
        <div className="p-4 border-b border-white/10">
          <h3 className="font-bold text-white">{title}</h3>
        </div>
      )}
      <iframe
        width="100%"
        height="166"
        scrolling="no"
        frameBorder="no"
        allow="autoplay"
        src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(trackUrl)}&color=%23ff5500&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false`}
      />
    </motion.div>
  )
}

function TwitchPlaceholder({ config, title }: { config: Record<string, unknown>; title: string | null }) {
  const channelName = config.channelName as string | undefined

  if (!channelName) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 text-center"
      >
        <Twitch size={32} className="mx-auto mb-2 text-purple-400" />
        <p className="text-white/60 text-sm">No channel configured</p>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-2xl backdrop-blur-xl bg-linear-to-br from-purple-500/20 to-purple-900/20 border border-purple-500/20"
    >
      {title && (
        <h3 className="text-lg font-bold text-white text-center mb-4">{title}</h3>
      )}
      <div className="flex items-center justify-center gap-3">
        <Twitch size={24} className="text-purple-400" />
        <span className="text-white font-medium">{channelName}</span>
      </div>
      <p className="text-center text-white/60 text-sm mt-3">
        Twitch API integration required
      </p>
    </motion.div>
  )
}

function GitHubPlaceholder({ config, title }: { config: Record<string, unknown>; title: string | null }) {
  const username = config.username as string | undefined

  if (!username) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 text-center"
      >
        <Github size={32} className="mx-auto mb-2 text-white/40" />
        <p className="text-white/60 text-sm">No username configured</p>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-2xl backdrop-blur-xl bg-linear-to-br from-gray-800/50 to-gray-900/50 border border-white/10"
    >
      {title && (
        <h3 className="text-lg font-bold text-white text-center mb-4">{title}</h3>
      )}
      <div className="flex items-center justify-center gap-3">
        <Github size={24} className="text-white" />
        <a
          href={`https://github.com/${username}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-white font-medium hover:text-primary transition-colors"
        >
          @{username}
        </a>
      </div>
      <p className="text-center text-white/60 text-sm mt-3">
        GitHub API integration required for stats
      </p>
    </motion.div>
  )
}

function SocialFeedPlaceholder({ config, title }: { config: Record<string, unknown>; title: string | null }) {
  const platform = config.platform as string | undefined
  const username = config.username as string | undefined

  if (!platform || !username) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 text-center"
      >
        <Smartphone size={32} className="mx-auto mb-2 text-white/40" />
        <p className="text-white/60 text-sm">No social feed configured</p>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10"
    >
      {title && (
        <h3 className="text-lg font-bold text-white text-center mb-4">{title}</h3>
      )}
      <div className="flex items-center justify-center gap-3">
        <Smartphone size={24} className="text-white/60" />
        <span className="text-white font-medium capitalize">{platform}</span>
        <span className="text-white/60">@{username}</span>
      </div>
      <p className="text-center text-white/60 text-sm mt-3">
        Social API integration required
      </p>
    </motion.div>
  )
}
