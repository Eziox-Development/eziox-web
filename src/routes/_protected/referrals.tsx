/**
 * Referrals Dashboard Page
 * Modern glassmorphism design with animations
 */

import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useQuery } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import {
  getReferralCodeFn,
  getReferralStatsFn,
} from '@/server/functions/referrals'
import {
  Gift,
  Copy,
  Check,
  Users,
  Crown,
  Loader2,
  Share2,
  ExternalLink,
  Sparkles,
  Trophy,
  TrendingUp,
  Zap,
  Star,
  ArrowRight,
  QrCode,
} from 'lucide-react'

export const Route = createFileRoute('/_protected/referrals')({
  head: () => ({
    meta: [
      { title: 'Referrals | Eziox' },
      { name: 'description', content: 'Invite friends and earn rewards' },
      { property: 'og:title', content: 'Referrals | Eziox' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  component: ReferralsPage,
})

function ReferralsPage() {
  const [copied, setCopied] = useState(false)
  const [copiedCode, setCopiedCode] = useState(false)

  const getReferralCode = useServerFn(getReferralCodeFn)
  const getReferralStats = useServerFn(getReferralStatsFn)

  const { data: codeData, isLoading: codeLoading } = useQuery({
    queryKey: ['referralCode'],
    queryFn: () => getReferralCode(),
  })

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['referralStats'],
    queryFn: () => getReferralStats(),
  })

  const handleCopyLink = async () => {
    if (codeData?.link) {
      await navigator.clipboard.writeText(codeData.link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleCopyCode = async () => {
    if (codeData?.code) {
      await navigator.clipboard.writeText(codeData.code)
      setCopiedCode(true)
      setTimeout(() => setCopiedCode(false), 2000)
    }
  }

  const handleShare = async () => {
    if (codeData?.link && navigator.share) {
      try {
        await navigator.share({
          title: 'Join Eziox',
          text: 'Create your bio link page on Eziox!',
          url: codeData.link,
        })
      } catch {
        // User cancelled or share failed
      }
    } else {
      void handleCopyLink()
    }
  }

  const referralCount = statsData?.referralCount || 0
  const pointsEarned = referralCount * 5

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <motion.div
          className="absolute top-20 right-1/4 w-[500px] h-[500px] rounded-full blur-3xl"
          style={{
            background:
              'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(139, 92, 246, 0.1))',
          }}
          animate={{ scale: [1, 1.2, 1], x: [0, 50, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-20 left-1/4 w-[400px] h-[400px] rounded-full blur-3xl"
          style={{
            background:
              'linear-gradient(135deg, rgba(236, 72, 153, 0.1), rgba(99, 102, 241, 0.1))',
          }}
          animate={{ scale: [1.2, 1, 1.2], y: [0, -30, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center relative"
            style={{
              background:
                'linear-gradient(135deg, var(--primary), var(--accent))',
              boxShadow: '0 20px 40px rgba(99, 102, 241, 0.4)',
            }}
          >
            <Gift className="w-10 h-10 text-white" />
            <motion.div
              className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center"
              style={{ background: '#22c55e' }}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Zap size={14} className="text-white" />
            </motion.div>
          </motion.div>
          <h1
            className="text-4xl font-bold mb-3"
            style={{ color: 'var(--foreground)' }}
          >
            Referral Program
          </h1>
          <p
            className="text-lg max-w-md mx-auto"
            style={{ color: 'var(--foreground-muted)' }}
          >
            Invite friends to Eziox and earn rewards for every signup
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {[
            {
              label: 'Total Referrals',
              value: referralCount,
              icon: Users,
              color: 'var(--primary)',
              gradient: 'from-indigo-500 to-purple-500',
            },
            {
              label: 'Points Earned',
              value: pointsEarned,
              icon: Trophy,
              color: '#eab308',
              gradient: 'from-yellow-500 to-orange-500',
            },
            {
              label: 'Conversion Rate',
              value: '100%',
              icon: TrendingUp,
              color: '#22c55e',
              gradient: 'from-green-500 to-emerald-500',
            },
            {
              label: 'Rank',
              value:
                referralCount > 10
                  ? 'Gold'
                  : referralCount > 5
                    ? 'Silver'
                    : 'Bronze',
              icon: Star,
              color: '#f59e0b',
              gradient: 'from-amber-500 to-yellow-500',
            },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              className="relative group"
            >
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity blur-xl"
                style={{
                  background: `linear-gradient(135deg, ${stat.color}40, transparent)`,
                }}
              />
              <div
                className="relative p-5 rounded-2xl text-center backdrop-blur-sm"
                style={{
                  background: 'rgba(var(--card-rgb, 30, 30, 30), 0.8)',
                  border: '1px solid var(--border)',
                }}
              >
                <div
                  className={`w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center bg-gradient-to-br ${stat.gradient}`}
                >
                  <stat.icon size={24} className="text-white" />
                </div>
                <p
                  className="text-3xl font-bold mb-1"
                  style={{ color: 'var(--foreground)' }}
                >
                  {statsLoading ? '-' : stat.value}
                </p>
                <p
                  className="text-xs font-medium"
                  style={{ color: 'var(--foreground-muted)' }}
                >
                  {stat.label}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Main Referral Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative mb-8"
        >
          <div
            className="absolute inset-0 rounded-3xl blur-2xl opacity-50"
            style={{
              background:
                'linear-gradient(135deg, var(--primary), var(--accent))',
            }}
          />
          <div
            className="relative p-8 rounded-3xl backdrop-blur-xl"
            style={{
              background: 'rgba(var(--card-rgb, 30, 30, 30), 0.9)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{
                    background:
                      'linear-gradient(135deg, var(--primary), var(--accent))',
                  }}
                >
                  <QrCode className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2
                    className="text-xl font-bold"
                    style={{ color: 'var(--foreground)' }}
                  >
                    Your Referral Link
                  </h2>
                  <p
                    className="text-sm"
                    style={{ color: 'var(--foreground-muted)' }}
                  >
                    Share this link to invite friends
                  </p>
                </div>
              </div>
              {codeData?.isOwner && (
                <motion.div
                  className="flex items-center gap-2 px-4 py-2 rounded-full"
                  style={{
                    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  }}
                  whileHover={{ scale: 1.05 }}
                >
                  <Crown size={16} className="text-white" />
                  <span className="text-sm font-semibold text-white">
                    Owner
                  </span>
                </motion.div>
              )}
            </div>

            {codeLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2
                  className="w-8 h-8 animate-spin"
                  style={{ color: 'var(--primary)' }}
                />
              </div>
            ) : (
              <>
                {/* Code Display */}
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <motion.div
                    className="p-5 rounded-2xl cursor-pointer group"
                    style={{ background: 'var(--background-secondary)' }}
                    onClick={handleCopyCode}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className="text-xs font-medium uppercase tracking-wider"
                        style={{ color: 'var(--foreground-muted)' }}
                      >
                        Referral Code
                      </span>
                      <motion.div
                        animate={{ scale: copiedCode ? 1.2 : 1 }}
                        className="p-1.5 rounded-lg transition-colors"
                        style={{
                          background: copiedCode
                            ? 'rgba(34, 197, 94, 0.2)'
                            : 'transparent',
                        }}
                      >
                        {copiedCode ? (
                          <Check size={16} className="text-green-500" />
                        ) : (
                          <Copy
                            size={16}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            style={{ color: 'var(--foreground-muted)' }}
                          />
                        )}
                      </motion.div>
                    </div>
                    <p
                      className="font-mono text-2xl font-bold tracking-wider"
                      style={{ color: 'var(--primary)' }}
                    >
                      {codeData?.code}
                    </p>
                  </motion.div>

                  <motion.div
                    className="p-5 rounded-2xl cursor-pointer group"
                    style={{ background: 'var(--background-secondary)' }}
                    onClick={handleCopyLink}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className="text-xs font-medium uppercase tracking-wider"
                        style={{ color: 'var(--foreground-muted)' }}
                      >
                        Share Link
                      </span>
                      <motion.div
                        animate={{ scale: copied ? 1.2 : 1 }}
                        className="p-1.5 rounded-lg transition-colors"
                        style={{
                          background: copied
                            ? 'rgba(34, 197, 94, 0.2)'
                            : 'transparent',
                        }}
                      >
                        {copied ? (
                          <Check size={16} className="text-green-500" />
                        ) : (
                          <Copy
                            size={16}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            style={{ color: 'var(--foreground-muted)' }}
                          />
                        )}
                      </motion.div>
                    </div>
                    <p
                      className="text-sm font-medium truncate"
                      style={{ color: 'var(--foreground)' }}
                    >
                      {codeData?.link}
                    </p>
                  </motion.div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <motion.button
                    onClick={handleCopyLink}
                    className="flex-1 flex items-center justify-center gap-3 py-4 rounded-xl font-semibold text-white"
                    style={{
                      background:
                        'linear-gradient(135deg, var(--primary), var(--accent))',
                      boxShadow: '0 10px 30px rgba(99, 102, 241, 0.4)',
                    }}
                    whileHover={{
                      scale: 1.02,
                      boxShadow: '0 15px 40px rgba(99, 102, 241, 0.5)',
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {copied ? <Check size={20} /> : <Copy size={20} />}
                    {copied ? 'Copied to Clipboard!' : 'Copy Referral Link'}
                  </motion.button>
                  <motion.button
                    onClick={handleShare}
                    className="flex-1 flex items-center justify-center gap-3 py-4 rounded-xl font-semibold"
                    style={{
                      background: 'var(--background-secondary)',
                      color: 'var(--foreground)',
                      border: '1px solid var(--border)',
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Share2 size={20} />
                    Share with Friends
                  </motion.button>
                  <motion.a
                    href={codeData?.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold"
                    style={{
                      background: 'var(--background-secondary)',
                      color: 'var(--foreground)',
                      border: '1px solid var(--border)',
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <ExternalLink size={20} />
                  </motion.a>
                </div>
              </>
            )}
          </div>
        </motion.div>

        {/* How It Works */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <h3
            className="text-xl font-bold mb-6 text-center"
            style={{ color: 'var(--foreground)' }}
          >
            How It Works
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                step: '1',
                title: 'Share Your Link',
                description: 'Send your unique referral link to friends',
                icon: Share2,
              },
              {
                step: '2',
                title: 'Friends Sign Up',
                description: 'They create an account using your link',
                icon: Users,
              },
              {
                step: '3',
                title: 'Earn Rewards',
                description: 'Get +5 points for each successful referral',
                icon: Trophy,
              },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="relative p-6 rounded-2xl text-center"
                style={{
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                }}
              >
                <div
                  className="w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center text-xl font-bold"
                  style={{
                    background:
                      'linear-gradient(135deg, var(--primary), var(--accent))',
                    color: 'white',
                  }}
                >
                  {item.step}
                </div>
                <h4
                  className="font-semibold mb-2"
                  style={{ color: 'var(--foreground)' }}
                >
                  {item.title}
                </h4>
                <p
                  className="text-sm"
                  style={{ color: 'var(--foreground-muted)' }}
                >
                  {item.description}
                </p>
                {index < 2 && (
                  <ArrowRight
                    size={24}
                    className="hidden md:block absolute top-1/2 -right-6 transform -translate-y-1/2"
                    style={{ color: 'var(--foreground-muted)' }}
                  />
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Referred By Section */}
        {statsData?.referredBy && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="p-6 rounded-2xl mb-8"
            style={{
              background:
                'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1))',
              border: '1px solid rgba(99, 102, 241, 0.2)',
            }}
          >
            <p
              className="text-sm font-medium mb-4"
              style={{ color: 'var(--foreground-muted)' }}
            >
              🎉 You were invited by
            </p>
            <Link
              to="/$username"
              params={{ username: statsData.referredBy.username }}
              className="flex items-center gap-4 p-4 rounded-xl transition-all hover:bg-white/5"
              style={{ background: 'var(--card)' }}
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center overflow-hidden">
                {statsData.referredBy.avatar ? (
                  <img
                    src={statsData.referredBy.avatar}
                    alt={
                      statsData.referredBy.name || statsData.referredBy.username
                    }
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white font-bold text-xl">
                    {(
                      statsData.referredBy.name || statsData.referredBy.username
                    )
                      .charAt(0)
                      .toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex-1">
                <p
                  className="font-semibold text-lg"
                  style={{ color: 'var(--foreground)' }}
                >
                  {statsData.referredBy.name || statsData.referredBy.username}
                </p>
                <p
                  className="text-sm"
                  style={{ color: 'var(--foreground-muted)' }}
                >
                  @{statsData.referredBy.username}
                </p>
              </div>
              <ArrowRight
                size={20}
                style={{ color: 'var(--foreground-muted)' }}
              />
            </Link>
          </motion.div>
        )}

        {/* Referred Users List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl overflow-hidden"
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
          }}
        >
          <div
            className="p-6 border-b flex items-center justify-between"
            style={{ borderColor: 'var(--border)' }}
          >
            <div>
              <h2
                className="text-xl font-bold"
                style={{ color: 'var(--foreground)' }}
              >
                Your Referrals
              </h2>
              <p
                className="text-sm"
                style={{ color: 'var(--foreground-muted)' }}
              >
                People who joined using your link
              </p>
            </div>
            <div
              className="px-4 py-2 rounded-full text-sm font-semibold"
              style={{
                background: 'var(--background-secondary)',
                color: 'var(--foreground)',
              }}
            >
              {statsLoading ? '-' : referralCount} users
            </div>
          </div>

          {statsLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2
                className="w-8 h-8 animate-spin"
                style={{ color: 'var(--primary)' }}
              />
            </div>
          ) : statsData?.referredUsers && statsData.referredUsers.length > 0 ? (
            <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
              <AnimatePresence>
                {statsData.referredUsers.map((user, index) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      to="/$username"
                      params={{ username: user.username }}
                      className="flex items-center gap-4 p-5 transition-all hover:bg-white/5"
                    >
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center overflow-hidden">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.name || user.username}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-white font-bold">
                            {(user.name || user.username)
                              .charAt(0)
                              .toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className="font-semibold truncate"
                          style={{ color: 'var(--foreground)' }}
                        >
                          {user.name || user.username}
                        </p>
                        <p
                          className="text-sm truncate"
                          style={{ color: 'var(--foreground-muted)' }}
                        >
                          @{user.username}
                        </p>
                      </div>
                      <div className="text-right">
                        <p
                          className="text-sm font-medium"
                          style={{ color: 'var(--foreground)' }}
                        >
                          +5 pts
                        </p>
                        <p
                          className="text-xs"
                          style={{ color: 'var(--foreground-muted)' }}
                        >
                          {new Date(user.joinedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="text-center py-16">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center"
                style={{ background: 'var(--background-secondary)' }}
              >
                <Sparkles
                  size={40}
                  style={{ color: 'var(--foreground-muted)' }}
                />
              </motion.div>
              <h3
                className="text-xl font-semibold mb-2"
                style={{ color: 'var(--foreground)' }}
              >
                No referrals yet
              </h3>
              <p
                className="text-sm mb-6 max-w-sm mx-auto"
                style={{ color: 'var(--foreground-muted)' }}
              >
                Share your referral link with friends and start earning rewards!
              </p>
              <motion.button
                onClick={handleCopyLink}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white"
                style={{
                  background:
                    'linear-gradient(135deg, var(--primary), var(--accent))',
                  boxShadow: '0 10px 30px rgba(99, 102, 241, 0.3)',
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Copy size={18} />
                Copy Your Link
              </motion.button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
