import { Link } from '@tanstack/react-router'
import { type BlogPost, formatDate } from '@/lib/blog-data'
import { Calendar, Clock, ArrowUpRight, Sparkles, BookOpen } from 'lucide-react'
import { motion } from 'motion/react'

interface BlogPostCardProps {
  post: BlogPost
  index?: number
  variant?: 'default' | 'compact'
}

export function BlogPostCard({
  post,
  index = 0,
  variant = 'default',
}: BlogPostCardProps) {
  const isCompact = variant === 'compact'

  return (
    <motion.article
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        type: 'spring',
        stiffness: 100,
      }}
      whileHover={{ y: -5 }}
      className="group relative"
    >
      {/* Glow effect on hover */}
      <div
        className="absolute -inset-1 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"
        style={{
          background: 'linear-gradient(135deg, var(--primary), var(--accent))',
        }}
      />

      <Link
        to="/blog/$slug"
        params={{ slug: post.slug }}
        className={`relative block rounded-2xl overflow-hidden transition-all duration-500 ${
          isCompact ? '' : 'hover:shadow-2xl'
        }`}
        style={{
          backgroundColor: 'var(--card)',
          border: '1px solid var(--border)',
        }}
      >
        {/* Cover Image */}
        {!isCompact && post.coverImage && (
          <div className="relative h-52 overflow-hidden">
            <motion.img
              src={post.coverImage}
              alt={post.coverImageAlt || post.title}
              className="w-full h-full object-cover"
              loading="lazy"
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.6 }}
            />

            {/* Anime-style gradient overlay */}
            <div
              className="absolute inset-0 opacity-60 group-hover:opacity-40 transition-opacity duration-500"
              style={{
                background: `linear-gradient(
                  to top,
                  var(--card) 0%,
                  transparent 50%,
                  transparent 100%
                )`,
              }}
            />

            {/* Shimmer effect on hover */}
            <motion.div
              className="absolute inset-0 opacity-0 group-hover:opacity-100"
              initial={{ x: '-100%' }}
              whileHover={{ x: '100%' }}
              transition={{ duration: 0.8 }}
              style={{
                background:
                  'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
              }}
            />

            {/* Category Badge with glow */}
            <div className="absolute top-4 left-4">
              <motion.span
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 + 0.3, type: 'spring' }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-sm"
                style={{
                  background:
                    'linear-gradient(135deg, var(--primary), var(--accent))',
                  color: 'var(--primary-foreground)',
                  fontFamily: 'var(--font-body)',
                  boxShadow:
                    '0 4px 15px rgba(var(--primary-rgb, 99, 102, 241), 0.4)',
                }}
              >
                <Sparkles size={10} />
                {post.category}
              </motion.span>
            </div>

            {/* Reading time badge */}
            <div className="absolute top-4 right-4">
              <span
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium backdrop-blur-md"
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  color: 'white',
                  fontFamily: 'var(--font-body)',
                }}
              >
                <BookOpen size={10} />
                {post.readingTime} min
              </span>
            </div>
          </div>
        )}

        {/* Content */}
        <div className={`relative ${isCompact ? 'p-4' : 'p-6'}`}>
          {/* Category for compact variant */}
          {isCompact && (
            <span
              className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider"
              style={{
                color: 'var(--primary)',
                fontFamily: 'var(--font-body)',
              }}
            >
              <Sparkles size={10} />
              {post.category}
            </span>
          )}

          {/* Title with gradient on hover */}
          <h3
            className={`font-bold leading-snug transition-all duration-300 ${
              isCompact ? 'text-base mt-1' : 'text-xl'
            }`}
            style={{
              color: 'var(--foreground)',
              fontFamily: 'var(--font-display)',
            }}
          >
            <span className="bg-gradient-to-r from-[var(--foreground)] to-[var(--foreground)] group-hover:from-[var(--primary)] group-hover:to-[var(--accent)] bg-clip-text group-hover:text-transparent transition-all duration-300">
              {post.title}
            </span>
          </h3>

          {/* Excerpt */}
          {!isCompact && (
            <p
              className="mt-3 text-sm leading-relaxed line-clamp-2"
              style={{
                color: 'var(--foreground-muted)',
                fontFamily: 'var(--font-body)',
              }}
            >
              {post.excerpt}
            </p>
          )}

          {/* Meta with icons */}
          <div
            className={`flex items-center gap-4 ${isCompact ? 'mt-3' : 'mt-4'}`}
          >
            <span
              className="inline-flex items-center gap-1.5 text-xs"
              style={{
                color: 'var(--foreground-muted)',
                fontFamily: 'var(--font-body)',
              }}
            >
              <Calendar size={12} className="opacity-70" />
              {formatDate(post.publishDate)}
            </span>
            {isCompact && (
              <span
                className="inline-flex items-center gap-1.5 text-xs"
                style={{
                  color: 'var(--foreground-muted)',
                  fontFamily: 'var(--font-body)',
                }}
              >
                <Clock size={12} className="opacity-70" />
                {post.readingTime} min
              </span>
            )}
          </div>

          {/* Tags with hover effect */}
          {!isCompact && (
            <div className="flex flex-wrap gap-2 mt-4">
              {post.tags.slice(0, 3).map((tag, tagIndex) => (
                <motion.span
                  key={tag}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 + tagIndex * 0.05 + 0.4 }}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-200 hover:scale-105"
                  style={{
                    backgroundColor: 'var(--background-secondary)',
                    color: 'var(--foreground-muted)',
                    fontFamily: 'var(--font-body)',
                    border: '1px solid var(--border)',
                  }}
                >
                  #{tag}
                </motion.span>
              ))}
            </div>
          )}

          {/* Read More with arrow animation */}
          {!isCompact && (
            <motion.div
              className="flex items-center gap-2 mt-5 text-sm font-semibold"
              style={{
                color: 'var(--primary)',
                fontFamily: 'var(--font-body)',
              }}
            >
              <span className="relative">
                Read article
                <motion.span
                  className="absolute bottom-0 left-0 h-0.5 bg-current"
                  initial={{ width: 0 }}
                  whileHover={{ width: '100%' }}
                  transition={{ duration: 0.3 }}
                />
              </span>
              <motion.div className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300">
                <ArrowUpRight size={16} />
              </motion.div>
            </motion.div>
          )}
        </div>

        {/* Bottom accent line */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-1"
          initial={{ scaleX: 0 }}
          whileHover={{ scaleX: 1 }}
          transition={{ duration: 0.4 }}
          style={{
            background: 'linear-gradient(90deg, var(--primary), var(--accent))',
            transformOrigin: 'left',
          }}
        />
      </Link>
    </motion.article>
  )
}
