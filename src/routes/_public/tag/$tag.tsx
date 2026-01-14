import { createFileRoute } from '@tanstack/react-router'
import { BlogPostCard, TaxonomyFilter } from '@/components/portfolio'
import { blogPosts, getPostsByTag } from '@/lib/blog-data'
import { motion } from 'motion/react'
import { Hash, FileText } from 'lucide-react'

export const Route = createFileRoute('/_public/tag/$tag')({
  component: TagPage,
})

function TagPage() {
  const { tag } = Route.useParams()
  const canonicalTag = tag
  const posts = getPostsByTag(canonicalTag)

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative max-w-6xl mx-auto px-4 sm:px-6 py-16 space-y-12"
    >
      {/* Background decorations */}
      <div
        className="absolute top-0 right-1/4 w-96 h-96 rounded-full pointer-events-none opacity-10 blur-3xl"
        style={{ background: 'var(--accent)' }}
      />
      <div
        className="absolute bottom-1/3 left-0 w-64 h-64 rounded-full pointer-events-none opacity-10 blur-3xl"
        style={{ background: 'var(--primary)' }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative space-y-8 text-center"
      >
        {/* Badge with gradient */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full"
          style={{
            background:
              'linear-gradient(135deg, var(--accent), var(--primary))',
            boxShadow: '0 4px 20px rgba(var(--primary-rgb, 99, 102, 241), 0.3)',
          }}
        >
          <Hash size={16} style={{ color: 'var(--primary-foreground)' }} />
          <span
            className="text-xs font-bold uppercase tracking-widest"
            style={{ color: 'var(--primary-foreground)' }}
          >
            Tag
          </span>
        </motion.div>

        {/* Title with gradient text */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl sm:text-5xl lg:text-6xl font-black capitalize"
          style={{
            background:
              'linear-gradient(135deg, var(--foreground), var(--accent))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontFamily: 'var(--font-display)',
          }}
        >
          #{canonicalTag}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-base sm:text-lg lg:text-xl max-w-2xl mx-auto"
          style={{
            color: 'var(--foreground-muted)',
            fontFamily: 'var(--font-body)',
          }}
        >
          Every post covering {canonicalTag}, from quick hits to deep dives.
        </motion.p>

        {/* Post count badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm"
          style={{
            backgroundColor: 'var(--card)',
            border: '1px solid var(--border)',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
          }}
        >
          <FileText size={16} style={{ color: 'var(--primary)' }} />
          <span style={{ color: 'var(--foreground-muted)' }}>
            <strong style={{ color: 'var(--foreground)' }}>
              {posts.length}
            </strong>{' '}
            {posts.length === 1 ? 'post' : 'posts'}
          </span>
        </motion.div>
      </motion.div>

      {/* Decorative line */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="h-px"
        style={{
          background:
            'linear-gradient(90deg, transparent, var(--accent), var(--primary), var(--accent), transparent)',
          transformOrigin: 'center',
        }}
      />

      <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-8 space-y-8"
        >
          {posts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative rounded-3xl p-16 text-center space-y-6 overflow-hidden"
              style={{
                backgroundColor: 'var(--card)',
                border: '1px solid var(--border)',
              }}
            >
              {/* Background glow */}
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  background:
                    'radial-gradient(circle at center, var(--accent), transparent 70%)',
                }}
              />
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="relative"
              >
                <div
                  className="mx-auto w-20 h-20 rounded-2xl flex items-center justify-center mb-4"
                  style={{
                    background:
                      'linear-gradient(135deg, var(--accent), var(--primary))',
                    boxShadow:
                      '0 0 40px rgba(var(--primary-rgb, 99, 102, 241), 0.4)',
                  }}
                >
                  <Hash
                    className="w-10 h-10"
                    style={{ color: 'var(--primary-foreground)' }}
                  />
                </div>
              </motion.div>
              <p
                className="relative text-xl font-semibold"
                style={{
                  color: 'var(--foreground)',
                  fontFamily: 'var(--font-display)',
                }}
              >
                No posts with this tag yet
              </p>
              <p
                className="relative"
                style={{ color: 'var(--foreground-muted)' }}
              >
                Check back soon for new content!
              </p>
            </motion.div>
          ) : (
            posts.map((post, index) => (
              <motion.div
                key={post.slug}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.2 + index * 0.08,
                  type: 'spring',
                  stiffness: 100,
                }}
              >
                <BlogPostCard post={post} index={index} />
              </motion.div>
            ))
          )}
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-4"
        >
          <TaxonomyFilter posts={blogPosts} activeTag={canonicalTag} />
        </motion.div>
      </div>
    </motion.section>
  )
}
