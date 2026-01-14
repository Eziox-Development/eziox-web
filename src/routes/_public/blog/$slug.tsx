import { createFileRoute, Link } from '@tanstack/react-router'
import {
  Calendar,
  Clock,
  ArrowLeft,
  ExternalLink,
  Github,
  User,
  Sparkles,
  BookOpen,
  Hash,
} from 'lucide-react'
import { getPostBySlug, formatDate, getPostsByYear } from '@/lib/blog-data'
import { MarkdownContent, Timeline } from '@/components/portfolio'
import { motion } from 'motion/react'

export const Route = createFileRoute('/_public/blog/$slug')({
  component: BlogPostPage,
})

function BlogPostPage() {
  const { slug } = Route.useParams()
  const post = getPostBySlug(slug)

  if (!post) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative min-h-[calc(100vh-200px)] flex items-center justify-center px-4 sm:px-6"
      >
        <div className="relative max-w-2xl w-full text-center space-y-8">
          {/* Background glow */}
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
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
              className="mx-auto w-24 h-24 rounded-2xl flex items-center justify-center mb-4"
              style={{
                background:
                  'linear-gradient(135deg, var(--primary), var(--accent))',
                boxShadow:
                  '0 0 40px rgba(var(--primary-rgb, 99, 102, 241), 0.4)',
              }}
            >
              <BookOpen
                className="w-12 h-12"
                style={{ color: 'var(--primary-foreground)' }}
              />
            </div>
          </motion.div>
          <h1
            className="text-4xl sm:text-5xl font-bold"
            style={{
              color: 'var(--foreground)',
              fontFamily: 'var(--font-display)',
            }}
          >
            Post not found
          </h1>
          <p
            className="text-lg max-w-md mx-auto"
            style={{ color: 'var(--foreground-muted)' }}
          >
            The blog post you're looking for doesn't exist or has been moved.
          </p>
          <Link
            to="/archive"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all hover:scale-105"
            style={{
              background:
                'linear-gradient(135deg, var(--primary), var(--accent))',
              color: 'var(--primary-foreground)',
              boxShadow:
                '0 4px 20px rgba(var(--primary-rgb, 99, 102, 241), 0.3)',
            }}
          >
            <ArrowLeft size={16} />
            Back to Archive
          </Link>
        </div>
      </motion.div>
    )
  }

  const postsByYear = getPostsByYear()
  const relatedPosts = (
    postsByYear[new Date(post.publishDate).getFullYear().toString()] || []
  )
    .filter((p) => p.slug !== post.slug)
    .slice(0, 3)

  return (
    <motion.article
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative max-w-5xl mx-auto px-4 sm:px-6 pt-16 sm:pt-22 pb-16 space-y-12"
    >
      {/* Background decorations */}
      <div
        className="absolute top-0 right-0 w-96 h-96 rounded-full pointer-events-none opacity-10 blur-3xl"
        style={{ background: 'var(--primary)' }}
      />
      <div
        className="absolute bottom-1/3 left-0 w-64 h-64 rounded-full pointer-events-none opacity-10 blur-3xl"
        style={{ background: 'var(--accent)' }}
      />

      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="relative flex items-center gap-3 text-sm font-medium"
      >
        <Link
          to="/archive"
          className="group inline-flex items-center gap-2 rounded-xl px-4 py-2 transition-all hover:scale-105"
          style={{
            backgroundColor: 'var(--background-secondary)',
            border: '1px solid var(--border)',
            color: 'var(--foreground-muted)',
          }}
        >
          <ArrowLeft
            size={14}
            className="group-hover:-translate-x-1 transition-transform"
          />
          Back to archive
        </Link>
      </motion.div>

      <motion.header
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative space-y-6"
      >
        <Link
          to="/category/$category"
          params={{
            category: post.category.toLowerCase().replace(/\s+/g, '-'),
          }}
          className="inline-block"
        >
          <motion.span
            whileHover={{ scale: 1.05 }}
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-xl transition-all"
            style={{
              background:
                'linear-gradient(135deg, var(--primary), var(--accent))',
              color: 'var(--primary-foreground)',
              fontFamily: 'var(--font-body)',
              boxShadow:
                '0 4px 15px rgba(var(--primary-rgb, 99, 102, 241), 0.3)',
            }}
          >
            <Sparkles size={12} />
            {post.category}
          </motion.span>
        </Link>
        <h1
          className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight"
          style={{
            color: 'var(--foreground)',
            fontFamily: 'var(--font-display)',
          }}
        >
          {post.title}
        </h1>
        <p
          className="text-lg sm:text-xl leading-relaxed"
          style={{ color: 'var(--foreground-muted)' }}
        >
          {post.excerpt}
        </p>

        {/* Meta info with icons */}
        <div className="flex flex-wrap items-center gap-3">
          {post.author && (
            <span
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm"
              style={{
                backgroundColor: 'var(--background-secondary)',
                border: '1px solid var(--border)',
                color: 'var(--foreground-muted)',
                fontFamily: 'var(--font-body)',
              }}
            >
              <User size={14} />
              {post.author}
            </span>
          )}
          <span
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm"
            style={{
              backgroundColor: 'var(--background-secondary)',
              border: '1px solid var(--border)',
              color: 'var(--foreground-muted)',
              fontFamily: 'var(--font-body)',
            }}
          >
            <Calendar size={14} />
            {formatDate(post.publishDate)}
          </span>
          <span
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm"
            style={{
              backgroundColor: 'var(--background-secondary)',
              border: '1px solid var(--border)',
              color: 'var(--foreground-muted)',
              fontFamily: 'var(--font-body)',
            }}
          >
            <Clock size={14} />
            {post.readingTime} min read
          </span>
        </div>

        {/* Tags with proper Link params */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag, index) => (
              <motion.div
                key={tag}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + index * 0.05 }}
              >
                <Link
                  to="/tag/$tag"
                  params={{ tag: tag.toLowerCase().replace(/\s+/g, '-') }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-105"
                  style={{
                    backgroundColor: 'var(--background-secondary)',
                    border: '1px solid var(--border)',
                    color: 'var(--foreground-muted)',
                  }}
                >
                  <Hash size={10} />
                  {tag}
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {/* Project Links with glow */}
        {(post.projectUrl || post.githubUrl) && (
          <div className="flex flex-wrap gap-3 pt-4">
            {post.projectUrl && (
              <motion.a
                href={post.projectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all"
                style={{
                  background:
                    'linear-gradient(135deg, var(--primary), var(--accent))',
                  color: 'var(--primary-foreground)',
                  boxShadow:
                    '0 4px 20px rgba(var(--primary-rgb, 99, 102, 241), 0.3)',
                }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <ExternalLink size={16} />
                Visit Project
              </motion.a>
            )}
            {post.githubUrl && (
              <motion.a
                href={post.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all"
                style={{
                  backgroundColor: 'var(--background-secondary)',
                  border: '1px solid var(--border)',
                  color: 'var(--foreground)',
                }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Github size={16} />
                View Code
              </motion.a>
            )}
          </div>
        )}
      </motion.header>

      {post.coverImage && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="relative group rounded-3xl overflow-hidden"
          style={{
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)',
          }}
        >
          {/* Glow effect on hover */}
          <div
            className="absolute -inset-1 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl -z-10"
            style={{
              background:
                'linear-gradient(135deg, var(--primary), var(--accent))',
            }}
          />
          <img
            src={post.coverImage}
            alt={post.coverImageAlt || post.title}
            className="w-full h-[360px] sm:h-[480px] object-cover transition-transform group-hover:scale-105 duration-700"
            loading="lazy"
          />
          {/* Shimmer overlay */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ x: '-100%' }}
            whileHover={{ x: '200%' }}
            transition={{ duration: 0.8 }}
            style={{
              background:
                'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
              width: '50%',
            }}
          />
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="relative prose prose-invert max-w-none"
        style={{
          backgroundColor: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: '1.5rem',
          padding: '2.5rem',
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
        }}
      >
        {/* Top gradient accent */}
        <div
          className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl"
          style={{
            background: 'linear-gradient(90deg, var(--primary), var(--accent))',
          }}
        />
        <MarkdownContent content={post.content} />
      </motion.div>

      {relatedPosts.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="relative space-y-8 pt-12"
        >
          {/* Gradient divider */}
          <div
            className="absolute top-0 left-0 right-0 h-px"
            style={{
              background:
                'linear-gradient(90deg, transparent, var(--primary), var(--accent), var(--primary), transparent)',
            }}
          />

          <div className="flex items-center gap-4">
            <motion.div
              className="p-3 rounded-xl"
              style={{
                background:
                  'linear-gradient(135deg, var(--primary), var(--accent))',
              }}
              whileHover={{ scale: 1.1, rotate: 5 }}
            >
              <Sparkles
                size={20}
                style={{ color: 'var(--primary-foreground)' }}
              />
            </motion.div>
            <h2
              className="text-2xl sm:text-3xl font-bold"
              style={{
                color: 'var(--foreground)',
                fontFamily: 'var(--font-display)',
              }}
            >
              More from {new Date(post.publishDate).getFullYear()}
            </h2>
          </div>
          <Timeline posts={[post, ...relatedPosts]} />
        </motion.section>
      )}
    </motion.article>
  )
}
