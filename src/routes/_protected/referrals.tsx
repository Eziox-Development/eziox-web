/**
 * Referrals Dashboard Page
 * View and manage referral code and referred users
 */

import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useQuery } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { getReferralCodeFn, getReferralStatsFn } from '@/server/functions/referrals'
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
} from 'lucide-react'

export const Route = createFileRoute('/_protected/referrals')({
  component: ReferralsPage,
})

function ReferralsPage() {
  const [copied, setCopied] = useState(false)

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

  const handleCopy = async () => {
    if (codeData?.link) {
      await navigator.clipboard.writeText(codeData.link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
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
      void handleCopy()
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}
          >
            <Gift className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
              Referrals
            </h1>
            <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
              Invite friends and earn rewards
            </p>
          </div>
        </div>
      </motion.div>

      {/* Referral Code Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="p-6 rounded-2xl mb-6"
        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold" style={{ color: 'var(--foreground)' }}>
            Your Referral Link
          </h2>
          {codeData?.isOwner && (
            <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-500">
              <Crown size={12} />
              Owner Code
            </span>
          )}
        </div>

        {codeLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--primary)' }} />
          </div>
        ) : (
          <>
            {/* Code Display */}
            <div
              className="flex items-center gap-3 p-4 rounded-xl mb-4"
              style={{ background: 'var(--background-secondary)' }}
            >
              <div className="flex-1 min-w-0">
                <p className="text-xs mb-1" style={{ color: 'var(--foreground-muted)' }}>
                  Referral Code
                </p>
                <p className="font-mono font-bold text-lg truncate" style={{ color: 'var(--primary)' }}>
                  {codeData?.code}
                </p>
              </div>
              <button
                onClick={handleCopy}
                className="shrink-0 p-3 rounded-xl transition-all hover:scale-105"
                style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
              >
                {copied ? (
                  <Check size={20} className="text-green-500" />
                ) : (
                  <Copy size={20} style={{ color: 'var(--foreground-muted)' }} />
                )}
              </button>
            </div>

            {/* Link Display */}
            <div
              className="flex items-center gap-3 p-4 rounded-xl mb-4"
              style={{ background: 'var(--background-secondary)' }}
            >
              <div className="flex-1 min-w-0">
                <p className="text-xs mb-1" style={{ color: 'var(--foreground-muted)' }}>
                  Share Link
                </p>
                <p className="text-sm truncate" style={{ color: 'var(--foreground)' }}>
                  {codeData?.link}
                </p>
              </div>
              <a
                href={codeData?.link}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 p-3 rounded-xl transition-all hover:scale-105"
                style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
              >
                <ExternalLink size={20} style={{ color: 'var(--foreground-muted)' }} />
              </a>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleCopy}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all hover:scale-[1.02]"
                style={{ background: 'var(--primary)', color: 'white' }}
              >
                {copied ? <Check size={18} /> : <Copy size={18} />}
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
              <button
                onClick={handleShare}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all hover:scale-[1.02]"
                style={{ background: 'var(--background-secondary)', color: 'var(--foreground)' }}
              >
                <Share2 size={18} />
                Share
              </button>
            </div>
          </>
        )}
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 gap-4 mb-6"
      >
        <div
          className="p-5 rounded-2xl text-center"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <Users size={20} style={{ color: 'var(--primary)' }} />
          </div>
          <p className="text-3xl font-bold mb-1" style={{ color: 'var(--foreground)' }}>
            {statsLoading ? '-' : statsData?.referralCount || 0}
          </p>
          <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
            Users Referred
          </p>
        </div>
        <div
          className="p-5 rounded-2xl text-center"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <Trophy size={20} style={{ color: '#eab308' }} />
          </div>
          <p className="text-3xl font-bold mb-1" style={{ color: 'var(--foreground)' }}>
            {statsLoading ? '-' : (statsData?.referralCount || 0) * 5}
          </p>
          <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
            Points Earned
          </p>
        </div>
      </motion.div>

      {/* Referred By */}
      {statsData?.referredBy && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="p-4 rounded-2xl mb-6"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <p className="text-sm mb-3" style={{ color: 'var(--foreground-muted)' }}>
            You were referred by
          </p>
          <Link
            to="/$username"
            params={{ username: statsData.referredBy.username }}
            className="flex items-center gap-3 p-3 rounded-xl transition-all hover:bg-white/5"
          >
            <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center overflow-hidden">
              {statsData.referredBy.avatar ? (
                <img
                  src={statsData.referredBy.avatar}
                  alt={statsData.referredBy.name || statsData.referredBy.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white font-bold">
                  {(statsData.referredBy.name || statsData.referredBy.username).charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <p className="font-medium" style={{ color: 'var(--foreground)' }}>
                {statsData.referredBy.name || statsData.referredBy.username}
              </p>
              <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
                @{statsData.referredBy.username}
              </p>
            </div>
          </Link>
        </motion.div>
      )}

      {/* Referred Users List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-2xl overflow-hidden"
        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
      >
        <div className="p-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <h2 className="font-semibold" style={{ color: 'var(--foreground)' }}>
            Referred Users
          </h2>
        </div>

        {statsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--primary)' }} />
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
                    className="flex items-center gap-3 p-4 transition-all hover:bg-white/5"
                  >
                    <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center overflow-hidden">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name || user.username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-white font-bold">
                          {(user.name || user.username).charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate" style={{ color: 'var(--foreground)' }}>
                        {user.name || user.username}
                      </p>
                      <p className="text-sm truncate" style={{ color: 'var(--foreground-muted)' }}>
                        @{user.username}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>
                        Joined
                      </p>
                      <p className="text-sm" style={{ color: 'var(--foreground)' }}>
                        {new Date(user.joinedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-12">
            <Sparkles size={40} className="mx-auto mb-4 opacity-30" style={{ color: 'var(--foreground-muted)' }} />
            <p className="font-medium mb-1" style={{ color: 'var(--foreground)' }}>
              No referrals yet
            </p>
            <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
              Share your link to start earning rewards!
            </p>
          </div>
        )}
      </motion.div>
    </div>
  )
}
