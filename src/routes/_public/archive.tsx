import { createFileRoute } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { 
  History, 
  Rocket, 
  Database, 
  Users, 
  FileText, 
  ArrowRight,
  Sparkles,
  Link as LinkIcon,
  Zap,
  Shield,
  Palette,
} from 'lucide-react'

export const Route = createFileRoute('/_public/archive')({
  component: ArchivePage,
})

// Eziox Website Timeline/Changelog
const timeline = [
  {
    date: '14.01.2026',
    title: 'Bio System Launch',
    description: 'Eziox is no longer a private portfolio - now a public bio link platform for everyone.',
    icon: Users,
    type: 'major',
  },
  {
    date: '14.01.2026',
    title: 'Rebranding to Eziox',
    description: 'Name changed from "Portfolio" to "Eziox" with new domain eziox.link.',
    icon: Sparkles,
    type: 'major',
  },
  {
    date: '14.01.2026',
    title: 'Complete Migration',
    description: 'Successfully migrated all data and features from Appwrite to Neon PostgreSQL.',
    icon: Database,
    type: 'feature',
  },
  {
    date: '14.01.2026',
    title: 'Backend Migration Started',
    description: 'Started migration from Appwrite to Neon PostgreSQL with Drizzle ORM.',
    icon: Database,
    type: 'feature',
  },
  {
    date: '14.01.2026',
    title: 'URL Shortener System',
    description: 'Implemented custom URL shortener with click tracking and analytics.',
    icon: LinkIcon,
    type: 'feature',
  },
  {
    date: '14.01.2026',
    title: 'Cloudinary Integration',
    description: 'Added image upload support for avatars and banners via Cloudinary.',
    icon: Palette,
    type: 'feature',
  },
  {
    date: '13.01.2026',
    title: 'Blog Posts & Projects',
    description: 'Published initial blog posts and project showcases.',
    icon: FileText,
    type: 'content',
  },
  {
    date: '13.01.2026',
    title: 'Authentication System',
    description: 'Implemented secure login and registration with session management.',
    icon: Shield,
    type: 'feature',
  },
  {
    date: '13.01.2026',
    title: 'Documentation System',
    description: 'Added comprehensive docs system for guides and tutorials.',
    icon: FileText,
    type: 'feature',
  },
  {
    date: '13.01.2026',
    title: 'Project Created',
    description: 'Initial creation of the portfolio project for personal use at portfolio.novaplex.xyz.',
    icon: Rocket,
    type: 'major',
  },
]

function ArchivePage() {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative max-w-4xl mx-auto px-4 sm:px-6 pt-16 sm:pt-20 pb-16"
    >
      {/* Background decorations */}
      <div
        className="absolute top-20 left-0 w-96 h-96 rounded-full pointer-events-none opacity-10 blur-3xl"
        style={{ background: 'var(--primary)' }}
      />
      <div
        className="absolute top-1/3 right-0 w-64 h-64 rounded-full pointer-events-none opacity-10 blur-3xl"
        style={{ background: 'var(--accent)' }}
      />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative text-center mb-16"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full mb-6"
          style={{
            background: 'linear-gradient(135deg, var(--primary), var(--accent))',
            boxShadow: '0 4px 20px rgba(99, 102, 241, 0.3)',
          }}
        >
          <History size={18} style={{ color: 'white' }} />
          <span className="text-xs font-bold uppercase tracking-widest text-white">
            Changelog
          </span>
        </motion.div>

        <h1
          className="text-4xl sm:text-5xl lg:text-6xl font-black mb-6"
          style={{
            background: 'linear-gradient(135deg, var(--foreground), var(--primary))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Eziox Timeline
        </h1>

        <p
          className="text-lg max-w-2xl mx-auto"
          style={{ color: 'var(--foreground-muted)' }}
        >
          The journey of Eziox from a personal portfolio to a public bio link platform.
          Every milestone, feature, and update documented.
        </p>
      </motion.div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div
          className="absolute left-8 top-0 bottom-0 w-0.5"
          style={{ background: 'linear-gradient(to bottom, var(--primary), var(--accent), transparent)' }}
        />

        <div className="space-y-8">
          {timeline.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="relative pl-20"
            >
              {/* Icon */}
              <div
                className="absolute left-4 w-8 h-8 rounded-full flex items-center justify-center"
                style={{
                  background: item.type === 'major' 
                    ? 'linear-gradient(135deg, var(--primary), var(--accent))'
                    : 'var(--card)',
                  border: item.type !== 'major' ? '2px solid var(--border)' : 'none',
                  boxShadow: item.type === 'major' ? '0 4px 15px rgba(99, 102, 241, 0.4)' : 'none',
                }}
              >
                <item.icon 
                  size={16} 
                  style={{ color: item.type === 'major' ? 'white' : 'var(--primary)' }} 
                />
              </div>

              {/* Content */}
              <div
                className="p-6 rounded-2xl"
                style={{
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span
                    className="text-xs font-mono px-2 py-1 rounded"
                    style={{ background: 'var(--background-secondary)', color: 'var(--foreground-muted)' }}
                  >
                    {item.date}
                  </span>
                  {item.type === 'major' && (
                    <span
                      className="text-xs font-semibold px-2 py-1 rounded"
                      style={{ background: 'rgba(99, 102, 241, 0.2)', color: 'var(--primary)' }}
                    >
                      Major Update
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--foreground)' }}>
                  {item.title}
                </h3>
                <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
                  {item.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Future Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-16 text-center p-8 rounded-2xl"
        style={{
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1))',
          border: '1px solid var(--border)',
        }}
      >
        <Zap size={32} className="mx-auto mb-4" style={{ color: 'var(--primary)' }} />
        <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
          What's Next?
        </h3>
        <p className="text-sm mb-4" style={{ color: 'var(--foreground-muted)' }}>
          Premium features, custom domains, advanced analytics, and more coming soon.
        </p>
        <div className="flex items-center justify-center gap-2 text-sm" style={{ color: 'var(--primary)' }}>
          <span>Stay tuned for updates</span>
          <ArrowRight size={16} />
        </div>
      </motion.div>
    </motion.section>
  )
}
