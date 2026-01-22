import { useState, useEffect } from 'react'
import { Link } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'motion/react'
import { useTheme } from '@/components/layout/ThemeProvider'
import {
  ChevronRight,
  Globe,
  ExternalLink,
  BarChart3,
  TrendingUp,
  Palette,
  Paintbrush,
  Shield,
  Handshake,
  Crown,
  Copy,
  Check,
  QrCode,
  X,
  Download,
  Share2,
} from 'lucide-react'
import { DASHBOARD_TABS } from './constants'
import type { TabType, ProfileUser } from './types'
import QRCode from 'qrcode'

interface ProfileSidebarProps {
  currentUser: ProfileUser
  activeTab: TabType
  setActiveTab: (tab: TabType) => void
  badges: { links?: number; referrals?: number; badges?: number }
  onCopyBioUrl: () => void
  copied: boolean
}

export function ProfileSidebar({
  currentUser,
  activeTab,
  setActiveTab,
  badges,
  onCopyBioUrl,
  copied,
}: ProfileSidebarProps) {
  const { theme } = useTheme()
  const avatar = currentUser.profile?.avatar
  const accentColor = theme.colors.primary
  const [showQRModal, setShowQRModal] = useState(false)
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [qrColor, setQrColor] = useState('#ffffff')
  const [qrBgColor, setQrBgColor] = useState('#000000')

  const bioUrl = `https://eziox.link/${currentUser.username}`

  useEffect(() => {
    if (showQRModal) {
      void QRCode.toDataURL(bioUrl, {
        width: 400,
        margin: 2,
        color: { dark: qrColor, light: qrBgColor },
        errorCorrectionLevel: 'H',
      })
        .then(setQrDataUrl)
        .catch(console.error)
    }
  }, [showQRModal, bioUrl, qrColor, qrBgColor])

  const downloadQRCode = () => {
    if (!qrDataUrl) return
    const link = document.createElement('a')
    link.download = `eziox-${currentUser.username}-qr.png`
    link.href = qrDataUrl
    link.click()
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${currentUser.name || currentUser.username} on Eziox`,
          url: bioUrl,
        })
      } catch {
        /* cancelled */
      }
    } else {
      onCopyBioUrl()
    }
  }

  const getBadgeCount = (tabId: TabType): number | undefined => {
    if (tabId === 'links') return badges.links
    if (tabId === 'referrals') return badges.referrals
    if (tabId === 'badges') return badges.badges
    return undefined
  }

  const groupedTabs = {
    main: DASHBOARD_TABS.filter((t) => t.category === 'main'),
    premium: DASHBOARD_TABS.filter((t) => t.category === 'premium'),
    account: DASHBOARD_TABS.filter((t) => t.category === 'account'),
  }

  return (
    <motion.aside
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="lg:w-72 shrink-0"
    >
      <div
        className="lg:sticky lg:top-28 rounded-2xl overflow-hidden"
        style={{
          background: theme.colors.card,
          border: `1px solid ${theme.colors.border}`,
        }}
      >
        <div
          className="p-5 border-b"
          style={{ borderColor: theme.colors.border }}
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <div
                className="w-12 h-12 rounded-full overflow-hidden"
                style={{
                  background: avatar
                    ? `url(${avatar}) center/cover`
                    : `linear-gradient(135deg, ${accentColor}, ${theme.colors.accent})`,
                }}
              >
                {!avatar && (
                  <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg">
                    {(currentUser.name || 'U').charAt(0)}
                  </div>
                )}
              </div>
              <div
                className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-green-500 border-2"
                style={{ borderColor: theme.colors.card }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p
                className="font-semibold truncate"
                style={{ color: theme.colors.foreground }}
              >
                {currentUser.name || 'Anonymous'}
              </p>
              <p
                className="text-xs truncate"
                style={{ color: theme.colors.foregroundMuted }}
              >
                @{currentUser.username}
              </p>
            </div>
          </div>
        </div>

        <nav className="p-3">
          <p
            className="px-3 py-2 text-xs font-semibold uppercase tracking-wider"
            style={{ color: theme.colors.foregroundMuted }}
          >
            Dashboard
          </p>
          {groupedTabs.main.map((tab) => (
            <SidebarButton
              key={tab.id}
              tab={tab}
              isActive={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              accentColor={accentColor}
              badge={getBadgeCount(tab.id)}
            />
          ))}

          <div
            className="my-3 border-t"
            style={{ borderColor: theme.colors.border }}
          />
          <p
            className="px-3 py-2 text-xs font-semibold uppercase tracking-wider"
            style={{ color: theme.colors.foregroundMuted }}
          >
            Premium
          </p>
          {groupedTabs.premium.map((tab) => (
            <SidebarButton
              key={tab.id}
              tab={tab}
              isActive={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              accentColor={accentColor}
            />
          ))}

          <div
            className="my-3 border-t"
            style={{ borderColor: theme.colors.border }}
          />
          <p
            className="px-3 py-2 text-xs font-semibold uppercase tracking-wider"
            style={{ color: theme.colors.foregroundMuted }}
          >
            Account
          </p>
          {groupedTabs.account.map((tab) => (
            <SidebarButton
              key={tab.id}
              tab={tab}
              isActive={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              accentColor={accentColor}
            />
          ))}

          <div
            className="my-3 border-t"
            style={{ borderColor: theme.colors.border }}
          />
          <p
            className="px-3 py-2 text-xs font-semibold uppercase tracking-wider"
            style={{ color: theme.colors.foregroundMuted }}
          >
            Quick Links
          </p>

          <QuickLink
            to="/$username"
            params={{ username: currentUser.username }}
            icon={Globe}
            label="My Bio Page"
            external
          />
          <QuickLink to="/analytics" icon={BarChart3} label="Analytics" />
          <QuickLink to="/leaderboard" icon={TrendingUp} label="Leaderboard" />
          <QuickLink to="/playground" icon={Palette} label="Playground" />
          <QuickLink
            to="/theme-builder"
            icon={Paintbrush}
            label="Theme Builder"
            premium
          />
        </nav>

        {(currentUser.role === 'admin' || currentUser.role === 'owner') && (
          <div
            className="p-4 border-t"
            style={{ borderColor: theme.colors.border }}
          >
            <p
              className="text-xs font-medium mb-2 flex items-center gap-1.5"
              style={{ color: '#ef4444' }}
            >
              <Crown size={12} />
              Admin
            </p>
            <nav className="space-y-1">
              <Link
                to="/admin"
                className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-red-500/10 transition-colors"
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(239, 68, 68, 0.1)' }}
                >
                  <Shield size={16} style={{ color: '#ef4444' }} />
                </div>
                <span
                  className="text-sm"
                  style={{ color: theme.colors.foreground }}
                >
                  Admin Panel
                </span>
                <ChevronRight
                  size={14}
                  className="ml-auto"
                  style={{ color: theme.colors.foregroundMuted }}
                />
              </Link>
              <Link
                to="/admin/partner-applications"
                className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-teal-500/10 transition-colors"
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(20, 184, 166, 0.1)' }}
                >
                  <Handshake size={16} style={{ color: '#14b8a6' }} />
                </div>
                <span
                  className="text-sm"
                  style={{ color: theme.colors.foreground }}
                >
                  Partner Apps
                </span>
                <ChevronRight
                  size={14}
                  className="ml-auto"
                  style={{ color: theme.colors.foregroundMuted }}
                />
              </Link>
            </nav>
          </div>
        )}

        <div
          className="p-4 border-t"
          style={{ borderColor: theme.colors.border }}
        >
          <p
            className="text-xs font-medium mb-2"
            style={{ color: theme.colors.foregroundMuted }}
          >
            Your Bio Link
          </p>
          <div className="flex items-center gap-2">
            <div
              className="flex-1 px-3 py-2 rounded-lg text-sm font-mono truncate"
              style={{
                background: theme.colors.backgroundSecondary,
                color: accentColor,
              }}
            >
              eziox.link/{currentUser.username}
            </div>
            <button
              onClick={onCopyBioUrl}
              className="p-2 rounded-lg transition-colors hover:opacity-80"
              style={{ background: theme.colors.backgroundSecondary }}
              title="Copy link"
            >
              {copied ? (
                <Check size={18} className="text-green-500" />
              ) : (
                <Copy
                  size={18}
                  style={{ color: theme.colors.foregroundMuted }}
                />
              )}
            </button>
            <button
              onClick={() => setShowQRModal(true)}
              className="p-2 rounded-lg transition-colors hover:opacity-80"
              style={{ background: theme.colors.backgroundSecondary }}
              title="Show QR Code"
            >
              <QrCode
                size={18}
                style={{ color: theme.colors.foregroundMuted }}
              />
            </button>
          </div>
        </div>
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
              className="w-full max-w-sm p-6 rounded-3xl"
              style={{
                background: theme.colors.card,
                border: `1px solid ${theme.colors.border}`,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3
                  className="text-lg font-bold"
                  style={{ color: theme.colors.foreground }}
                >
                  Bio Page QR Code
                </h3>
                <button
                  onClick={() => setShowQRModal(false)}
                  className="p-2 rounded-lg hover:bg-white/10"
                >
                  <X
                    size={18}
                    style={{ color: theme.colors.foregroundMuted }}
                  />
                </button>
              </div>

              <div className="flex justify-center mb-4">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="QR Code"
                    className="w-48 h-48 rounded-xl"
                  />
                ) : (
                  <div
                    className="w-48 h-48 rounded-xl animate-pulse"
                    style={{ background: theme.colors.backgroundSecondary }}
                  />
                )}
              </div>

              <p
                className="text-center text-sm mb-4 font-mono"
                style={{ color: accentColor }}
              >
                eziox.link/{currentUser.username}
              </p>

              {/* Color Presets */}
              <div className="mb-4">
                <p
                  className="text-xs font-medium mb-2"
                  style={{ color: theme.colors.foregroundMuted }}
                >
                  Style
                </p>
                <div className="flex gap-2 flex-wrap">
                  {[
                    { fg: '#ffffff', bg: '#000000', label: 'Classic' },
                    { fg: '#000000', bg: '#ffffff', label: 'Light' },
                    { fg: accentColor, bg: '#1e1e2e', label: 'Accent' },
                    { fg: '#ec4899', bg: '#1e1e2e', label: 'Pink' },
                    { fg: '#22c55e', bg: '#0a0a0a', label: 'Green' },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      onClick={() => {
                        setQrColor(preset.fg)
                        setQrBgColor(preset.bg)
                      }}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all hover:scale-105"
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
              <div className="flex gap-2">
                <motion.button
                  onClick={downloadQRCode}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium text-white text-sm"
                  style={{
                    background: `linear-gradient(135deg, ${accentColor}, ${theme.colors.accent})`,
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Download size={16} />
                  Download
                </motion.button>
                <motion.button
                  onClick={handleShare}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm"
                  style={{
                    background: theme.colors.backgroundSecondary,
                    color: theme.colors.foreground,
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Share2 size={16} />
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.aside>
  )
}

function SidebarButton({
  tab,
  isActive,
  onClick,
  accentColor,
  badge,
}: {
  tab: (typeof DASHBOARD_TABS)[number]
  isActive: boolean
  onClick: () => void
  accentColor: string
  badge?: number
}) {
  const { theme } = useTheme()
  const Icon = tab.icon

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
        isActive ? 'bg-white/10' : 'hover:bg-white/5'
      }`}
    >
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
        style={{
          background: isActive ? accentColor : theme.colors.backgroundSecondary,
        }}
      >
        <Icon
          size={18}
          style={{ color: isActive ? 'white' : theme.colors.foregroundMuted }}
        />
      </div>
      <span
        className="flex-1 text-left text-sm"
        style={{
          color: isActive
            ? theme.colors.foreground
            : theme.colors.foregroundMuted,
        }}
      >
        {tab.label}
      </span>
      {badge !== undefined && badge > 0 && (
        <span
          className="px-2 py-0.5 rounded-full text-xs font-medium"
          style={{
            background: theme.colors.backgroundSecondary,
            color: theme.colors.foregroundMuted,
          }}
        >
          {badge}
        </span>
      )}
      <ChevronRight
        size={16}
        style={{ color: isActive ? accentColor : 'transparent' }}
      />
    </button>
  )
}

function QuickLink({
  to,
  params,
  icon: Icon,
  label,
  external,
  premium,
}: {
  to: string
  params?: Record<string, string>
  icon: typeof Globe
  label: string
  external?: boolean
  premium?: boolean
}) {
  const { theme } = useTheme()

  return (
    <Link
      to={to}
      params={params}
      target={external ? '_blank' : undefined}
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors"
    >
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center"
        style={{
          background: premium
            ? `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`
            : theme.colors.backgroundSecondary,
        }}
      >
        <Icon
          size={18}
          style={{ color: premium ? 'white' : theme.colors.foregroundMuted }}
        />
      </div>
      <span style={{ color: theme.colors.foreground }}>{label}</span>
      {external && (
        <ExternalLink
          size={14}
          style={{ color: theme.colors.foregroundMuted }}
        />
      )}
      {premium && <Crown size={12} style={{ color: '#f59e0b' }} />}
    </Link>
  )
}
