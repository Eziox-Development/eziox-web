import { motion } from 'motion/react'
import { Youtube } from 'lucide-react'

interface YouTubeWidgetProps {
  config: {
    videoId?: string
    autoplay?: boolean
    showControls?: boolean
  }
  title?: string | null
}

export function YouTubeWidget({ config, title }: YouTubeWidgetProps) {
  if (!config.videoId) {
    return (
      <div className="p-6 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 text-center">
        <Youtube size={32} className="mx-auto mb-2 text-white/40" />
        <p className="text-white/60 text-sm">No video configured</p>
      </div>
    )
  }

  const autoplay = config.autoplay ? 1 : 0
  const controls = config.showControls !== false ? 1 : 0

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
      <div className="aspect-video">
        <iframe
          src={`https://www.youtube.com/embed/${config.videoId}?autoplay=${autoplay}&controls=${controls}&rel=0`}
          title={title || 'YouTube Video'}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        />
      </div>
    </motion.div>
  )
}
