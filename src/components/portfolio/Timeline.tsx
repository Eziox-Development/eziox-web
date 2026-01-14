import { Link } from '@tanstack/react-router'
import { type BlogPost, formatDate } from '@/lib/blog-data'
import { Calendar, ArrowUpRight, Sparkles, BookOpen, Hash } from 'lucide-react'
import { motion } from 'motion/react'

interface TimelineProps {
  posts: BlogPost[]
}

export function Timeline({ posts }: TimelineProps) {
  const postsByYear = groupPostsByYear(posts)
  const years = Object.keys(postsByYear).sort((a, b) => Number(b) - Number(a))

  return (
    <div className="space-y-16">
      {years.map((year, yearIndex) => (
        <motion.section
          key={year}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.6,
            delay: yearIndex * 0.15,
            type: 'spring',
          }}
          className="relative"
        >
          {/* Year Header with gradient */}
          <div className="flex items-center gap-4 mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                delay: yearIndex * 0.15 + 0.2,
                type: 'spring',
                stiffness: 200,
              }}
              className="relative"
            >
              {/* Glow behind year */}
              <div
                className="absolute -inset-2 rounded-2xl blur-xl opacity-50"
                style={{
                  background:
                    'linear-gradient(135deg, var(--primary), var(--accent))',
                }}
              />
              <h2
                className="relative text-4xl md:text-5xl font-black px-4 py-2 rounded-xl"
                style={{
                  background:
                    'linear-gradient(135deg, var(--primary), var(--accent))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontFamily: 'var(--font-display)',
                }}
              >
                {year}
              </h2>
            </motion.div>

            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: yearIndex * 0.15 + 0.3, duration: 0.5 }}
              className="flex-1 h-0.5 rounded-full"
              style={{
                background:
                  'linear-gradient(90deg, var(--primary), transparent)',
                transformOrigin: 'left',
              }}
            />

            <motion.span
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: yearIndex * 0.15 + 0.4 }}
              className="text-sm px-4 py-1.5 rounded-full font-semibold flex items-center gap-2"
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
              {postsByYear[year]?.length ?? 0} posts
            </motion.span>
          </div>

          {/* Timeline Items */}
          <div className="relative">
            {/* Animated Timeline Line */}
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: '100%' }}
              transition={{ delay: yearIndex * 0.15 + 0.3, duration: 0.8 }}
              className="absolute left-[11px] top-6 bottom-6 w-0.5 rounded-full"
              style={{
                background:
                  'linear-gradient(180deg, var(--primary), var(--accent), var(--primary))',
              }}
            />

            <div className="space-y-8">
              {postsByYear[year]?.map((post, postIndex) => (
                <motion.article
                  key={post.slug}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    duration: 0.5,
                    delay: yearIndex * 0.15 + postIndex * 0.08,
                    type: 'spring',
                    stiffness: 100,
                  }}
                  className="relative pl-10 group"
                >
                  {/* Timeline Dot with pulse */}
                  <motion.div
                    className="absolute left-0 top-6 w-6 h-6 rounded-full flex items-center justify-center"
                    style={{
                      background:
                        'linear-gradient(135deg, var(--primary), var(--accent))',
                      boxShadow:
                        '0 0 20px rgba(var(--primary-rgb, 99, 102, 241), 0.5)',
                    }}
                    whileHover={{ scale: 1.3 }}
                  >
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: 'var(--primary-foreground)' }}
                    />
                  </motion.div>

                  {/* Post Card with glow */}
                  <motion.div
                    whileHover={{ x: 8, y: -4 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                    className="relative"
                  >
                    {/* Glow effect */}
                    <div
                      className="absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"
                      style={{
                        background:
                          'linear-gradient(135deg, var(--primary), var(--accent))',
                      }}
                    />

                    <Link
                      to="/blog/$slug"
                      params={{ slug: post.slug }}
                      className="relative block p-6 rounded-2xl transition-all duration-300"
                      style={{
                        backgroundColor: 'var(--card)',
                        border: '1px solid var(--border)',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                      }}
                    >
                      {/* Top row: Category + Reading time */}
                      <div className="flex items-center justify-between mb-3">
                        <span
                          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg"
                          style={{
                            background:
                              'linear-gradient(135deg, var(--primary), var(--accent))',
                            color: 'var(--primary-foreground)',
                            fontFamily: 'var(--font-body)',
                          }}
                        >
                          <Sparkles size={10} />
                          {post.category}
                        </span>
                        <span
                          className="flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-lg"
                          style={{
                            backgroundColor: 'var(--background-secondary)',
                            color: 'var(--foreground-muted)',
                            fontFamily: 'var(--font-body)',
                          }}
                        >
                          <BookOpen size={10} />
                          {post.readingTime} min read
                        </span>
                      </div>

                      {/* Title with gradient on hover */}
                      <h3
                        className="text-xl font-bold transition-all duration-300"
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
                      <p
                        className="text-sm mt-3 line-clamp-2 leading-relaxed"
                        style={{
                          color: 'var(--foreground-muted)',
                          fontFamily: 'var(--font-body)',
                        }}
                      >
                        {post.excerpt}
                      </p>

                      {/* Meta row */}
                      <div className="flex items-center gap-4 mt-4">
                        <span
                          className="flex items-center gap-1.5 text-xs"
                          style={{
                            color: 'var(--foreground-muted)',
                            fontFamily: 'var(--font-body)',
                          }}
                        >
                          <Calendar size={12} className="opacity-70" />
                          {formatDate(post.publishDate)}
                        </span>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mt-4">
                        {post.tags.slice(0, 4).map((tag, tagIndex) => (
                          <motion.span
                            key={tag}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{
                              delay:
                                yearIndex * 0.1 +
                                postIndex * 0.05 +
                                tagIndex * 0.03,
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-200 hover:scale-105"
                            style={{
                              backgroundColor: 'var(--background-secondary)',
                              color: 'var(--foreground-muted)',
                              fontFamily: 'var(--font-body)',
                              border: '1px solid var(--border)',
                            }}
                          >
                            <Hash size={10} />
                            {tag}
                          </motion.span>
                        ))}
                      </div>

                      {/* Read More with arrow */}
                      <motion.div
                        className="flex items-center gap-2 mt-4 text-sm font-semibold"
                        style={{
                          color: 'var(--primary)',
                          fontFamily: 'var(--font-body)',
                        }}
                      >
                        <span>Read article</span>
                        <motion.div className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300">
                          <ArrowUpRight size={16} />
                        </motion.div>
                      </motion.div>
                    </Link>
                  </motion.div>
                </motion.article>
              ))}
            </div>
          </div>
        </motion.section>
      ))}

      {/* Empty State with anime style */}
      {years.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative text-center py-20 rounded-3xl overflow-hidden"
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
              <BookOpen
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
              No posts found
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
    </div>
  )
}

// Helper to group posts by year
function groupPostsByYear(posts: BlogPost[]): Record<string, BlogPost[]> {
  const byYear: Record<string, BlogPost[]> = {}

  posts.forEach((post) => {
    const year = new Date(post.publishDate).getFullYear().toString()
    if (!byYear[year]) {
      byYear[year] = []
    }
    byYear[year].push(post)
  })

  // Sort posts within each year
  Object.keys(byYear).forEach((year) => {
    byYear[year]?.sort(
      (a, b) =>
        new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime(),
    )
  })

  return byYear
}
