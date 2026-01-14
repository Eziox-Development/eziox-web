import { Link } from '@tanstack/react-router'
import {
  getAllCategories,
  getAllTags,
  getPostsByCategory,
  getPostsByTag,
  type BlogPost,
} from '@/lib/blog-data'
import { Folder, Tag, Hash, Sparkles, ChevronRight, Layers } from 'lucide-react'
import { motion } from 'motion/react'

interface TaxonomyFilterProps {
  posts: BlogPost[]
  showCategories?: boolean
  showTags?: boolean
  activeCategory?: string
  activeTag?: string
}

export function TaxonomyFilter({
  posts,
  showCategories = true,
  showTags = true,
  activeCategory,
  activeTag,
}: TaxonomyFilterProps) {
  const categories = getAllCategories(posts)
  const tags = getAllTags(posts)

  return (
    <aside className="space-y-6">
      {/* Categories */}
      {showCategories && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, type: 'spring' }}
          className="relative rounded-2xl p-5 overflow-hidden"
          style={{
            backgroundColor: 'var(--card)',
            border: '1px solid var(--border)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          }}
        >
          {/* Background glow */}
          <div
            className="absolute top-0 right-0 w-32 h-32 rounded-full pointer-events-none opacity-20 blur-2xl"
            style={{ background: 'var(--primary)' }}
          />

          <div className="relative flex items-center gap-3 mb-5">
            <motion.div
              className="p-2 rounded-xl"
              style={{
                background:
                  'linear-gradient(135deg, var(--primary), var(--accent))',
              }}
              whileHover={{ scale: 1.1, rotate: 5 }}
            >
              <Folder
                size={16}
                style={{ color: 'var(--primary-foreground)' }}
              />
            </motion.div>
            <h3
              className="text-sm font-bold uppercase tracking-widest"
              style={{
                color: 'var(--foreground)',
                fontFamily: 'var(--font-display)',
              }}
            >
              Categories
            </h3>
          </div>

          <div className="relative space-y-1.5">
            {/* All Posts Link */}
            <Link
              to="/archive"
              className="group flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all duration-300"
              style={{
                background:
                  !activeCategory && !activeTag
                    ? 'linear-gradient(135deg, var(--primary), var(--accent))'
                    : 'transparent',
                color:
                  !activeCategory && !activeTag
                    ? 'var(--primary-foreground)'
                    : 'var(--foreground-muted)',
                fontFamily: 'var(--font-body)',
                boxShadow:
                  !activeCategory && !activeTag
                    ? '0 4px 15px rgba(var(--primary-rgb, 99, 102, 241), 0.3)'
                    : 'none',
              }}
            >
              <span className="flex items-center gap-2">
                <Layers size={14} />
                All Posts
              </span>
              {!activeCategory && !activeTag && <Sparkles size={14} />}
            </Link>

            {categories.map((category, index) => {
              const count = getPostsByCategory(category, posts).length
              const isActive =
                activeCategory?.toLowerCase() === category.toLowerCase()

              return (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    to="/category/$category"
                    params={{
                      category: category.toLowerCase().replace(/\s+/g, '-'),
                    }}
                    className="group flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all duration-300"
                    style={{
                      background: isActive
                        ? 'linear-gradient(135deg, var(--primary), var(--accent))'
                        : 'transparent',
                      color: isActive
                        ? 'var(--primary-foreground)'
                        : 'var(--foreground-muted)',
                      fontFamily: 'var(--font-body)',
                      boxShadow: isActive
                        ? '0 4px 15px rgba(var(--primary-rgb, 99, 102, 241), 0.3)'
                        : 'none',
                    }}
                  >
                    <span className="flex items-center gap-2">
                      <ChevronRight
                        size={14}
                        className="transition-transform duration-200 group-hover:translate-x-1"
                      />
                      {category}
                    </span>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{
                        backgroundColor: isActive
                          ? 'rgba(255,255,255,0.2)'
                          : 'var(--background-secondary)',
                        color: isActive
                          ? 'var(--primary-foreground)'
                          : 'var(--foreground-muted)',
                      }}
                    >
                      {count}
                    </span>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* Tags */}
      {showTags && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, type: 'spring' }}
          className="relative rounded-2xl p-5 overflow-hidden"
          style={{
            backgroundColor: 'var(--card)',
            border: '1px solid var(--border)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          }}
        >
          {/* Background glow */}
          <div
            className="absolute bottom-0 left-0 w-32 h-32 rounded-full pointer-events-none opacity-20 blur-2xl"
            style={{ background: 'var(--accent)' }}
          />

          <div className="relative flex items-center gap-3 mb-5">
            <motion.div
              className="p-2 rounded-xl"
              style={{
                background:
                  'linear-gradient(135deg, var(--accent), var(--primary))',
              }}
              whileHover={{ scale: 1.1, rotate: -5 }}
            >
              <Tag size={16} style={{ color: 'var(--primary-foreground)' }} />
            </motion.div>
            <h3
              className="text-sm font-bold uppercase tracking-widest"
              style={{
                color: 'var(--foreground)',
                fontFamily: 'var(--font-display)',
              }}
            >
              Tags
            </h3>
          </div>

          <div className="relative flex flex-wrap gap-2">
            {tags.map((tag, index) => {
              const count = getPostsByTag(tag, posts).length
              const isActive = activeTag?.toLowerCase() === tag.toLowerCase()

              return (
                <motion.div
                  key={tag}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.03, type: 'spring' }}
                  whileHover={{ scale: 1.05, y: -2 }}
                >
                  <Link
                    to="/tag/$tag"
                    params={{ tag: tag.toLowerCase().replace(/\s+/g, '-') }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300"
                    style={{
                      background: isActive
                        ? 'linear-gradient(135deg, var(--primary), var(--accent))'
                        : 'var(--background-secondary)',
                      color: isActive
                        ? 'var(--primary-foreground)'
                        : 'var(--foreground-muted)',
                      border: `1px solid ${isActive ? 'transparent' : 'var(--border)'}`,
                      fontFamily: 'var(--font-body)',
                      boxShadow: isActive
                        ? '0 4px 12px rgba(var(--primary-rgb, 99, 102, 241), 0.3)'
                        : 'none',
                    }}
                  >
                    <Hash size={10} />
                    {tag}
                    <span
                      className="opacity-70"
                      style={{
                        fontSize: '10px',
                      }}
                    >
                      {count}
                    </span>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      )}
    </aside>
  )
}
