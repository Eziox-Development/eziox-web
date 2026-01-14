import { createFileRoute } from '@tanstack/react-router'
import { Hero, ProfileCard, BlogFeed } from '@/components/portfolio'
import { blogPosts } from '@/lib/blog-data'
import { motion } from 'motion/react'

export const Route = createFileRoute('/_public/')({
  component: HomePage,
})

function HomePage() {
  const posts = blogPosts
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Hero Section */}
      <Hero />

      {/* Main Content - Two Column Layout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
          {/* Left Column - Profile Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-5"
          >
            <div className="lg:sticky lg:top-24">
              <ProfileCard />
            </div>
          </motion.div>

          {/* Right Column - Blog Feed */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-7"
          >
            <BlogFeed posts={posts} count={5} showViewAll={true} />
          </motion.div>
        </div>
      </section>
    </motion.div>
  )
}
