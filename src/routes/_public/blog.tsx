import { createFileRoute, Link } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { useQuery } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { getBlogPostsFn } from '@/server/functions/blog'
import { useTheme } from '@/components/portfolio/ThemeProvider'
import {
  BookOpen,
  Calendar,
  Clock,
  ArrowRight,
  Tag,
  Sparkles,
  Loader2,
} from 'lucide-react'

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  coverImage: string | null
  category: string | null
  featured: boolean | null
  publishedAt: Date | null
  createdAt: Date
}

export const Route = createFileRoute('/_public/blog')({
  head: () => ({
    meta: [
      { title: 'Blog | Eziox' },
      { name: 'description', content: 'Tips, tutorials, and updates from the Eziox team. Learn how to grow your online presence.' },
    ],
  }),
  component: BlogPage,
})

function BlogPage() {
  const { theme } = useTheme()
  const getBlogPosts = useServerFn(getBlogPostsFn)

  const { data: posts, isLoading } = useQuery({
    queryKey: ['blog-posts'],
    queryFn: () => getBlogPosts({ data: { limit: 20, published: true } }),
  })

  const featuredPost = posts?.find((p: BlogPost) => p.featured)
  const regularPosts = (posts?.filter((p: BlogPost) => !p.featured) || []) as BlogPost[]

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const estimateReadTime = (content: string) => {
    const words = content.split(/\s+/).length
    return Math.max(1, Math.ceil(words / 200))
  }

  return (
    <div className="min-h-screen pt-32 pb-20 px-4" style={{ background: 'var(--background)' }}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6" style={{ background: `${theme.colors.primary}15`, border: `1px solid ${theme.colors.primary}30` }}>
            <BookOpen size={16} style={{ color: theme.colors.primary }} />
            <span className="text-sm font-medium" style={{ color: theme.colors.foreground }}>Blog</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold mb-4" style={{ color: theme.colors.foreground, fontFamily: 'var(--font-display)' }}>
            Tips & Tutorials
          </h1>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: theme.colors.foregroundMuted }}>
            Learn how to make the most of Eziox and grow your online presence
          </p>
        </motion.div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin" style={{ color: theme.colors.primary }} />
          </div>
        ) : posts && posts.length > 0 ? (
          <>
            {featuredPost && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-12"
              >
                <motion.div
                  className="relative overflow-hidden rounded-3xl cursor-pointer"
                  style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}
                  whileHover={{ y: -4, boxShadow: `0 20px 40px ${theme.colors.primary}15` }}
                >
                  <div className="grid lg:grid-cols-2 gap-8 p-8">
                    <div className="flex flex-col justify-center">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium" style={{ background: `${theme.colors.primary}20`, color: theme.colors.primary }}>
                          <Sparkles size={12} />
                          Featured
                        </span>
                        {featuredPost.category && (
                          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs" style={{ background: theme.colors.backgroundSecondary, color: theme.colors.foregroundMuted }}>
                            <Tag size={12} />
                            {featuredPost.category}
                          </span>
                        )}
                      </div>
                      <h2 className="text-2xl lg:text-3xl font-bold mb-3" style={{ color: theme.colors.foreground }}>
                        {featuredPost.title}
                      </h2>
                      <p className="mb-6 line-clamp-3" style={{ color: theme.colors.foregroundMuted }}>
                        {featuredPost.excerpt}
                      </p>
                      <div className="flex items-center gap-4 text-sm" style={{ color: theme.colors.foregroundMuted }}>
                        <span className="flex items-center gap-1.5">
                          <Calendar size={14} />
                          {formatDate(featuredPost.publishedAt || featuredPost.createdAt)}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock size={14} />
                          {estimateReadTime(featuredPost.content)} min read
                        </span>
                      </div>
                    </div>
                    {featuredPost.coverImage && (
                      <div className="relative aspect-video lg:aspect-auto rounded-2xl overflow-hidden" style={{ background: theme.colors.backgroundSecondary }}>
                        <img src={featuredPost.coverImage} alt={featuredPost.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            )}

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {regularPosts.map((post: BlogPost, i: number) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                >
                  <motion.article
                    className="h-full rounded-2xl overflow-hidden cursor-pointer"
                    style={{ background: theme.colors.card, border: `1px solid ${theme.colors.border}` }}
                    whileHover={{ y: -4, boxShadow: `0 20px 40px ${theme.colors.primary}10` }}
                  >
                    {post.coverImage && (
                      <div className="aspect-video overflow-hidden" style={{ background: theme.colors.backgroundSecondary }}>
                        <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="p-6">
                      {post.category && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs mb-3" style={{ background: theme.colors.backgroundSecondary, color: theme.colors.foregroundMuted }}>
                          <Tag size={10} />
                          {post.category}
                        </span>
                      )}
                      <h3 className="text-lg font-bold mb-2 line-clamp-2" style={{ color: theme.colors.foreground }}>
                        {post.title}
                      </h3>
                      <p className="text-sm mb-4 line-clamp-2" style={{ color: theme.colors.foregroundMuted }}>
                        {post.excerpt}
                      </p>
                      <div className="flex items-center justify-between text-xs" style={{ color: theme.colors.foregroundMuted }}>
                        <span className="flex items-center gap-1.5">
                          <Calendar size={12} />
                          {formatDate(post.publishedAt || post.createdAt)}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock size={12} />
                          {estimateReadTime(post.content)} min
                        </span>
                      </div>
                    </div>
                  </motion.article>
                </motion.div>
              ))}
            </div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center" style={{ background: `${theme.colors.primary}15` }}>
              <BookOpen size={40} style={{ color: theme.colors.primary }} />
            </div>
            <h2 className="text-2xl font-bold mb-3" style={{ color: theme.colors.foreground }}>
              Coming Soon
            </h2>
            <p className="max-w-md mx-auto mb-8" style={{ color: theme.colors.foregroundMuted }}>
              We're working on some great content for you. Check back soon for tips, tutorials, and platform updates.
            </p>
            <Link to="/changelog">
              <motion.button
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium"
                style={{ background: theme.colors.primary, color: 'white' }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                View Changelog
                <ArrowRight size={18} />
              </motion.button>
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  )
}
