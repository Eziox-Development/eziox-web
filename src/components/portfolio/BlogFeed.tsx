import { Link } from '@tanstack/react-router'
import { getRecentPosts, type BlogPost } from '@/lib/blog-data'
import { BlogPostCard } from './BlogPostCard'
import { ArrowRight, Newspaper, Sparkles } from 'lucide-react'
import { motion } from 'motion/react'

interface BlogFeedProps {
  posts: BlogPost[]
  count?: number
  showViewAll?: boolean
}

export function BlogFeed({
  posts: allPosts,
  count = 5,
  showViewAll = true,
}: BlogFeedProps) {
  const posts = getRecentPosts(count, allPosts)

  return (
    <section className="relative">
      {/* Background decoration */}
      <div
        className="absolute -top-20 -right-20 w-64 h-64 rounded-full pointer-events-none opacity-20 blur-3xl"
        style={{ background: 'var(--accent)' }}
      />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
      >
        <div className="flex items-start gap-4">
          {/* Animated icon */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="hidden sm:flex p-3 rounded-2xl"
            style={{
              background:
                'linear-gradient(135deg, var(--primary), var(--accent))',
              boxShadow: '0 0 25px rgba(var(--primary-rgb, 99, 102, 241), 0.3)',
            }}
          >
            <Newspaper
              className="w-6 h-6"
              style={{ color: 'var(--primary-foreground)' }}
            />
          </motion.div>

          <div>
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-2xl md:text-3xl font-bold flex items-center gap-2"
              style={{
                color: 'var(--foreground)',
                fontFamily: 'var(--font-display)',
              }}
            >
              Recent Posts
              <motion.span
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <Sparkles size={20} style={{ color: 'var(--primary)' }} />
              </motion.span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-sm mt-1.5"
              style={{
                color: 'var(--foreground-muted)',
                fontFamily: 'var(--font-body)',
              }}
            >
              Thoughts, tutorials, and insights
            </motion.p>
          </div>
        </div>

        {showViewAll && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Link
              to="/archive"
              className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 hover:gap-3 hover:shadow-lg"
              style={{
                background:
                  'linear-gradient(135deg, var(--primary), var(--accent))',
                color: 'var(--primary-foreground)',
                fontFamily: 'var(--font-body)',
                boxShadow:
                  '0 4px 15px rgba(var(--primary-rgb, 99, 102, 241), 0.3)',
              }}
            >
              View all
              <motion.span className="group-hover:translate-x-1 transition-transform duration-300">
                <ArrowRight size={16} />
              </motion.span>
            </Link>
          </motion.div>
        )}
      </motion.div>

      {/* Decorative line */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="h-px mb-8"
        style={{
          background:
            'linear-gradient(90deg, transparent, var(--border), var(--primary), var(--border), transparent)',
          transformOrigin: 'left',
        }}
      />

      {/* Posts Grid */}
      <div className="space-y-8">
        {posts.map((post, index) => (
          <BlogPostCard key={post.slug} post={post} index={index} />
        ))}
      </div>

      {/* Empty State with anime style */}
      {posts.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative text-center py-16 rounded-3xl overflow-hidden"
          style={{
            backgroundColor: 'var(--card)',
            border: '1px solid var(--border)',
          }}
        >
          {/* Background glow */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              background:
                'radial-gradient(circle at center, var(--primary), transparent 70%)',
            }}
          />

          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="relative"
          >
            <div
              className="mx-auto w-20 h-20 rounded-2xl flex items-center justify-center mb-6"
              style={{
                background:
                  'linear-gradient(135deg, var(--primary), var(--accent))',
                boxShadow:
                  '0 0 40px rgba(var(--primary-rgb, 99, 102, 241), 0.4)',
              }}
            >
              <Newspaper
                className="w-10 h-10"
                style={{ color: 'var(--primary-foreground)' }}
              />
            </div>
            <p
              className="text-xl font-semibold mb-2"
              style={{
                color: 'var(--foreground)',
                fontFamily: 'var(--font-display)',
              }}
            >
              No posts yet
            </p>
            <p
              className="text-sm"
              style={{
                color: 'var(--foreground-muted)',
                fontFamily: 'var(--font-body)',
              }}
            >
              Check back soon for new content!
            </p>
          </motion.div>
        </motion.div>
      )}
    </section>
  )
}
