import { createFileRoute } from '@tanstack/react-router'
import { Timeline, TaxonomyFilter } from '@/components/portfolio'
import { blogPosts, getAllCategories, getAllTags } from '@/lib/blog-data'
import { motion } from 'motion/react'
import { Archive, FileText, FolderOpen, Hash } from 'lucide-react'

export const Route = createFileRoute('/_public/archive')({
  component: ArchivePage,
})

function ArchivePage() {
  const allPosts = blogPosts
  const categories = getAllCategories()
  const tags = getAllTags()

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-16 sm:pt-20 pb-16 space-y-14"
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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative space-y-8 text-center"
      >
        {/* Badge with gradient */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
          className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full"
          style={{
            background:
              'linear-gradient(135deg, var(--primary), var(--accent))',
            boxShadow: '0 4px 20px rgba(var(--primary-rgb, 99, 102, 241), 0.3)',
          }}
        >
          <Archive size={18} style={{ color: 'var(--primary-foreground)' }} />
          <span
            className="text-xs font-bold uppercase tracking-widest"
            style={{ color: 'var(--primary-foreground)' }}
          >
            Archive
          </span>
        </motion.div>

        {/* Title with gradient */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black leading-tight"
          style={{
            background:
              'linear-gradient(135deg, var(--foreground), var(--primary))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontFamily: 'var(--font-display)',
          }}
        >
          Every article in one place
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-base sm:text-lg lg:text-xl max-w-2xl mx-auto leading-relaxed"
          style={{
            color: 'var(--foreground-muted)',
            fontFamily: 'var(--font-body)',
          }}
        >
          Browse the full catalog of essays, tutorials, and ideas—organized
          chronologically with quick filters for the topics that matter most to
          you.
        </motion.p>

        {/* Stats with glow */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 pt-6"
        >
          {[
            { icon: FileText, label: 'posts', count: allPosts.length },
            { icon: FolderOpen, label: 'categories', count: categories.length },
            { icon: Hash, label: 'tags', count: tags.length },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + index * 0.1, type: 'spring' }}
              whileHover={{ scale: 1.05, y: -2 }}
              className="flex items-center gap-3 px-5 py-3 rounded-xl text-sm"
              style={{
                backgroundColor: 'var(--card)',
                border: '1px solid var(--border)',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
              }}
            >
              <div
                className="p-2 rounded-lg"
                style={{
                  background:
                    'linear-gradient(135deg, var(--primary), var(--accent))',
                }}
              >
                <stat.icon
                  size={16}
                  style={{ color: 'var(--primary-foreground)' }}
                />
              </div>
              <span style={{ color: 'var(--foreground-muted)' }}>
                <strong
                  style={{ color: 'var(--foreground)', fontSize: '1.2em' }}
                >
                  {stat.count}
                </strong>{' '}
                {stat.label}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Decorative line */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="h-px"
        style={{
          background:
            'linear-gradient(90deg, transparent, var(--primary), var(--accent), var(--primary), transparent)',
          transformOrigin: 'center',
        }}
      />

      <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-8"
        >
          <Timeline posts={allPosts} />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-4"
        >
          <TaxonomyFilter posts={allPosts} />
        </motion.div>
      </div>
    </motion.section>
  )
}
