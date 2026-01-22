import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import {
  getReferralCodeFn,
  getReferralStatsFn,
} from '@/server/functions/referrals'
import {
  Users,
  Trophy,
  TrendingUp,
  Star,
  QrCode,
  Copy,
  Check,
  Share2,
  Loader2,
  Sparkles,
  ArrowRight,
  Download,
  X,
  Palette,
} from 'lucide-react'
import { useTheme } from '@/components/layout/ThemeProvider'
import QRCode from 'qrcode'

export function ReferralsTab() {
  const { theme } = useTheme()
  const accentColor = theme.colors.primary
  const [copied, setCopied] = useState(false)
  const [showQRModal, setShowQRModal] = useState(false)
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [qrColor, setQrColor] = useState('#ffffff')
  const [qrBgColor, setQrBgColor] = useState('#000000')
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
    if (!codeData?.link) return

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join Eziox',
          text: 'Create your bio link page on Eziox!',
          url: codeData.link,
        })
      } catch {
        // User cancelled or share failed - fallback to copy
        await handleCopy()
      }
    } else {
      // Fallback for desktop browsers without Web Share API
      await handleCopy()
    }
  }

  const generateQRCode = async (url: string) => {
    try {
      const dataUrl = await QRCode.toDataURL(url, {
        width: 400,
        margin: 2,
        color: {
          dark: qrColor,
          light: qrBgColor,
        },
        errorCorrectionLevel: 'H',
      })
      setQrDataUrl(dataUrl)
    } catch (err) {
      console.error('QR Code generation failed:', err)
    }
  }

  useEffect(() => {
    if (showQRModal && codeData?.link) {
      void generateQRCode(codeData.link)
    }
  }, [showQRModal, codeData?.link, qrColor, qrBgColor])

  const downloadQRCode = () => {
    if (!qrDataUrl) return
    const link = document.createElement('a')
    link.download = `eziox-referral-${codeData?.code || 'qr'}.png`
    link.href = qrDataUrl
    link.click()
  }

  const referralCount = statsData?.referralCount || 0

  return (
    <motion.div
      key="referrals"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          {
            label: 'Referrals',
            value: referralCount,
            icon: Users,
            gradient: 'from-indigo-500 to-purple-500',
          },
          {
            label: 'Points',
            value: referralCount * 5,
            icon: Trophy,
            gradient: 'from-yellow-500 to-orange-500',
          },
          {
            label: 'Rate',
            value: '100%',
            icon: TrendingUp,
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
            gradient: 'from-amber-500 to-yellow-500',
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="p-4 rounded-xl text-center"
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
            }}
          >
            <div
              className={`w-10 h-10 mx-auto mb-2 rounded-lg flex items-center justify-center bg-gradient-to-br ${stat.gradient}`}
            >
              <stat.icon size={20} className="text-white" />
            </div>
            <p
              className="text-xl font-bold"
              style={{ color: 'var(--foreground)' }}
            >
              {statsLoading ? '-' : stat.value}
            </p>
            <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Referral Card */}
      <div className="relative">
        <div
          className="absolute inset-0 rounded-3xl blur-2xl opacity-50"
          style={{
            background: `linear-gradient(135deg, ${accentColor}, var(--accent))`,
          }}
        />
        <div
          className="relative p-8 rounded-3xl"
          style={{
            background: 'rgba(var(--card-rgb, 30, 30, 30), 0.9)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${accentColor}, var(--accent))`,
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
                Share to invite friends
              </p>
            </div>
          </div>

          {codeLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2
                className="w-8 h-8 animate-spin"
                style={{ color: accentColor }}
              />
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div
                  className="p-5 rounded-2xl cursor-pointer"
                  style={{ background: 'var(--background-secondary)' }}
                  onClick={() =>
                    navigator.clipboard.writeText(codeData?.code || '')
                  }
                >
                  <span
                    className="text-xs font-medium uppercase"
                    style={{ color: 'var(--foreground-muted)' }}
                  >
                    Code
                  </span>
                  <p
                    className="font-mono text-2xl font-bold"
                    style={{ color: accentColor }}
                  >
                    {codeData?.code}
                  </p>
                </div>
                <div
                  className="p-5 rounded-2xl cursor-pointer"
                  style={{ background: 'var(--background-secondary)' }}
                  onClick={handleCopy}
                >
                  <span
                    className="text-xs font-medium uppercase"
                    style={{ color: 'var(--foreground-muted)' }}
                  >
                    Link
                  </span>
                  <p
                    className="text-sm font-medium truncate"
                    style={{ color: 'var(--foreground)' }}
                  >
                    {codeData?.link}
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <motion.button
                  onClick={handleCopy}
                  className="flex-1 flex items-center justify-center gap-3 py-4 rounded-xl font-semibold text-white"
                  style={{
                    background: `linear-gradient(135deg, ${accentColor}, var(--accent))`,
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {copied ? <Check size={20} /> : <Copy size={20} />}
                  {copied ? 'Copied!' : 'Copy Link'}
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
                  Share
                </motion.button>
              </div>
              <motion.button
                onClick={() => setShowQRModal(true)}
                className="w-full mt-3 flex items-center justify-center gap-3 py-4 rounded-xl font-semibold"
                style={{
                  background: 'var(--background-secondary)',
                  color: 'var(--foreground)',
                  border: '1px solid var(--border)',
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <QrCode size={20} />
                Show QR Code
              </motion.button>
            </>
          )}
        </div>
      </div>

      {/* How It Works */}
      <div className="grid md:grid-cols-3 gap-4">
        {[
          {
            step: '1',
            title: 'Share Link',
            description: 'Send your referral link',
            icon: Share2,
          },
          {
            step: '2',
            title: 'Friends Join',
            description: 'They create an account',
            icon: Users,
          },
          {
            step: '3',
            title: 'Earn Rewards',
            description: '+5 points per referral',
            icon: Trophy,
          },
        ].map((item, index) => (
          <div
            key={item.step}
            className="relative p-6 rounded-2xl text-center"
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
            }}
          >
            <div
              className="w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center text-xl font-bold text-white"
              style={{
                background: `linear-gradient(135deg, ${accentColor}, var(--accent))`,
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
            <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
              {item.description}
            </p>
            {index < 2 && (
              <ArrowRight
                size={24}
                className="hidden md:block absolute top-1/2 -right-6 transform -translate-y-1/2"
                style={{ color: 'var(--foreground-muted)' }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Referred Users */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
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
            <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
              People who joined using your link
            </p>
          </div>
          <span
            className="px-4 py-2 rounded-full text-sm font-semibold"
            style={{
              background: 'var(--background-secondary)',
              color: 'var(--foreground)',
            }}
          >
            {referralCount} users
          </span>
        </div>
        {statsLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2
              className="w-8 h-8 animate-spin"
              style={{ color: accentColor }}
            />
          </div>
        ) : statsData?.referredUsers && statsData.referredUsers.length > 0 ? (
          <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {statsData.referredUsers.map((user) => (
              <Link
                key={user.id}
                to="/$username"
                params={{ username: user.username }}
                className="flex items-center gap-4 p-5 hover:bg-white/5"
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
                      {(user.name || user.username).charAt(0).toUpperCase()}
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
                    style={{ color: accentColor }}
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
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Sparkles
              size={40}
              className="mx-auto mb-4"
              style={{ color: 'var(--foreground-muted)' }}
            />
            <h3
              className="text-xl font-semibold mb-2"
              style={{ color: 'var(--foreground)' }}
            >
              No referrals yet
            </h3>
            <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
              Share your link to start earning!
            </p>
          </div>
        )}
      </div>

      {/* QR Code Modal */}
      <AnimatePresence>
        {showQRModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0, 0, 0, 0.8)' }}
            onClick={() => setShowQRModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md p-6 rounded-3xl"
              style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3
                  className="text-xl font-bold"
                  style={{ color: 'var(--foreground)' }}
                >
                  QR Code
                </h3>
                <button
                  onClick={() => setShowQRModal(false)}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  style={{ color: 'var(--foreground-muted)' }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* QR Code Display */}
              <div className="flex justify-center mb-6">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="QR Code"
                    className="w-64 h-64 rounded-2xl"
                  />
                ) : (
                  <div
                    className="w-64 h-64 rounded-2xl flex items-center justify-center"
                    style={{ background: 'var(--background-secondary)' }}
                  >
                    <Loader2
                      className="w-8 h-8 animate-spin"
                      style={{ color: accentColor }}
                    />
                  </div>
                )}
              </div>

              {/* Color Customization */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label
                    className="flex items-center gap-2 text-sm font-medium mb-2"
                    style={{ color: 'var(--foreground-muted)' }}
                  >
                    <Palette size={16} />
                    QR Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={qrColor}
                      onChange={(e) => setQrColor(e.target.value)}
                      className="w-10 h-10 rounded-lg cursor-pointer border-0"
                      style={{ background: 'transparent' }}
                    />
                    <input
                      type="text"
                      value={qrColor}
                      onChange={(e) => setQrColor(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg text-sm font-mono"
                      style={{
                        background: 'var(--background-secondary)',
                        color: 'var(--foreground)',
                        border: '1px solid var(--border)',
                      }}
                    />
                  </div>
                </div>
                <div>
                  <label
                    className="flex items-center gap-2 text-sm font-medium mb-2"
                    style={{ color: 'var(--foreground-muted)' }}
                  >
                    <Palette size={16} />
                    Background
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={qrBgColor}
                      onChange={(e) => setQrBgColor(e.target.value)}
                      className="w-10 h-10 rounded-lg cursor-pointer border-0"
                      style={{ background: 'transparent' }}
                    />
                    <input
                      type="text"
                      value={qrBgColor}
                      onChange={(e) => setQrBgColor(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg text-sm font-mono"
                      style={{
                        background: 'var(--background-secondary)',
                        color: 'var(--foreground)',
                        border: '1px solid var(--border)',
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Preset Colors */}
              <div className="mb-6">
                <p
                  className="text-sm font-medium mb-2"
                  style={{ color: 'var(--foreground-muted)' }}
                >
                  Presets
                </p>
                <div className="flex gap-2 flex-wrap">
                  {[
                    { fg: '#ffffff', bg: '#000000', label: 'Classic' },
                    { fg: '#000000', bg: '#ffffff', label: 'Light' },
                    { fg: '#6366f1', bg: '#1e1e2e', label: 'Indigo' },
                    { fg: '#ec4899', bg: '#1e1e2e', label: 'Pink' },
                    { fg: '#22c55e', bg: '#0a0a0a', label: 'Green' },
                    { fg: '#f59e0b', bg: '#1c1917', label: 'Amber' },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      onClick={() => {
                        setQrColor(preset.fg)
                        setQrBgColor(preset.bg)
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-105"
                      style={{
                        background: preset.bg,
                        color: preset.fg,
                        border: `1px solid ${preset.fg}40`,
                      }}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <motion.button
                  onClick={downloadQRCode}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white"
                  style={{
                    background: `linear-gradient(135deg, ${accentColor}, var(--accent))`,
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={!qrDataUrl}
                >
                  <Download size={18} />
                  Download PNG
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
