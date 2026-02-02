import { createFileRoute } from '@tanstack/react-router'
import { useMemo } from 'react'
import { motion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import {
  Cookie,
  Shield,
  Settings,
  Eye,
  Clock,
  Globe,
  Mail,
  CheckCircle,
  Info,
  FileText,
} from 'lucide-react'
import {
  LegalPageLayout,
  CookieTable,
  type LegalSection,
  type RelatedLink,
} from '@/components/legal/LegalPageLayout'
import { useTheme } from '@/components/layout/ThemeProvider'

export const Route = createFileRoute('/_public/cookies')({
  head: () => ({
    meta: [
      { title: 'Cookie Policy | Eziox' },
      {
        name: 'description',
        content:
          'Cookie Policy for Eziox - Learn about how we use cookies and similar technologies.',
      },
    ],
  }),
  component: CookiesPage,
})

const LAST_UPDATED = '27. Januar 2026'
const ACCENT_COLOR = '#f59e0b'

export function CookiesPage() {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const cardRadius = useMemo(
    () =>
      theme.effects.borderRadius === 'pill'
        ? '24px'
        : theme.effects.borderRadius === 'sharp'
          ? '8px'
          : '16px',
    [theme.effects.borderRadius],
  )

  const cookieTypes = useMemo(
    () => [
      {
        name: t('cookies.cookieTypes.essential.name'),
        icon: Shield,
        color: '#10b981',
        required: true,
        description: t('cookies.cookieTypes.essential.description'),
        cookies: [
          {
            name: t('cookies.cookies.sessionToken.name'),
            purpose: t('cookies.cookies.sessionToken.purpose'),
            duration: t('cookies.duration.7days'),
            type: t('cookies.type.httpCookie'),
          },
          {
            name: t('cookies.cookies.cfClearance.name'),
            purpose: t('cookies.cookies.cfClearance.purpose'),
            duration: t('cookies.duration.30min'),
            type: t('cookies.type.httpCookie'),
          },
        ],
      },
      {
        name: t('cookies.cookieTypes.functional.name'),
        icon: Settings,
        color: '#3b82f6',
        required: false,
        description: t('cookies.cookieTypes.functional.description'),
        cookies: [
          {
            name: t('cookies.cookies.theme.name'),
            purpose: t('cookies.cookies.theme.purpose'),
            duration: t('cookies.duration.persistent'),
            type: t('cookies.type.localStorage'),
          },
          {
            name: t('cookies.cookies.sidebarCollapsed.name'),
            purpose: t('cookies.cookies.sidebarCollapsed.purpose'),
            duration: t('cookies.duration.persistent'),
            type: t('cookies.type.localStorage'),
          },
        ],
      },
      {
        name: t('cookies.cookieTypes.analytics.name'),
        icon: Eye,
        color: '#8b5cf6',
        required: false,
        description: t('cookies.cookieTypes.analytics.description'),
        cookies: [
          {
            name: t('cookies.cookies.internalAnalytics.name'),
            purpose: t('cookies.cookies.internalAnalytics.purpose'),
            duration: t('cookies.duration.session'),
            type: t('cookies.type.serverSide'),
          },
        ],
      },
    ],
    [t],
  )

  const sections: LegalSection[] = useMemo(
    () => [
      {
        id: 'rechtsgrundlage',
        title: t('cookies.sections.legalBasis.title'),
        icon: Info,
        content: t('cookies.sections.legalBasis.content'),
      },
      {
        id: 'what-are-cookies',
        title: t('cookies.sections.whatAreCookies.title'),
        icon: Cookie,
        content: t('cookies.sections.whatAreCookies.content'),
      },
      {
        id: 'how-we-use',
        title: t('cookies.sections.howWeUse.title'),
        icon: Settings,
        content: t('cookies.sections.howWeUse.content'),
      },
      {
        id: 'your-choices',
        title: t('cookies.sections.yourChoices.title'),
        icon: CheckCircle,
        content: t('cookies.sections.yourChoices.content'),
      },
      {
        id: 'third-party',
        title: t('cookies.sections.thirdParty.title'),
        icon: Globe,
        content: t('cookies.sections.thirdParty.content'),
      },
      {
        id: 'data-security',
        title: t('cookies.sections.security.title'),
        icon: Shield,
        content: t('cookies.sections.security.content'),
      },
      {
        id: 'updates',
        title: t('cookies.sections.updates.title'),
        icon: Clock,
        content: t('cookies.sections.updates.content'),
      },
      {
        id: 'contact',
        title: t('cookies.sections.contact.title'),
        icon: Mail,
        content: t('cookies.sections.contact.content'),
      },
    ],
    [t],
  )

  const relatedLinks: RelatedLink[] = useMemo(
    () => [
      {
        title: t('cookies.relatedLinks.privacy'),
        href: '/privacy',
        icon: Shield,
      },
      {
        title: t('cookies.relatedLinks.terms'),
        href: '/terms',
        icon: FileText,
      },
      {
        title: t('cookies.relatedLinks.imprint'),
        href: '/imprint',
        icon: Globe,
      },
    ],
    [t],
  )

  return (
    <LegalPageLayout
      title={t('cookies.title')}
      subtitle={t('cookies.subtitle')}
      badge={t('cookies.badge')}
      badgeIcon={Cookie}
      accentColor={ACCENT_COLOR}
      lastUpdated={LAST_UPDATED}
      sections={sections}
      relatedLinks={relatedLinks}
    >
      {/* Cookie Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <h2
          className="text-2xl font-bold mb-6"
          style={{
            color: theme.colors.foreground,
            fontFamily: theme.typography.displayFont,
          }}
        >
          {t('cookies.cookieTypes.title')}
        </h2>
        <div className="space-y-5">
          {cookieTypes.map((type, index) => (
            <motion.div
              key={type.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + index * 0.05 }}
              className="p-5"
              style={{
                background: theme.colors.card,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: cardRadius,
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 flex items-center justify-center rounded-xl"
                    style={{ background: `${type.color}20` }}
                  >
                    <type.icon size={22} style={{ color: type.color }} />
                  </div>
                  <div>
                    <h3
                      className="font-bold"
                      style={{ color: theme.colors.foreground }}
                    >
                      {type.name}
                    </h3>
                    <p
                      className="text-sm"
                      style={{ color: theme.colors.foregroundMuted }}
                    >
                      {type.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {type.required ? (
                    <span
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg"
                      style={{
                        background: 'rgba(16, 185, 129, 0.15)',
                        color: '#10b981',
                      }}
                    >
                      <CheckCircle size={12} />
                      {t('cookies.required')}
                    </span>
                  ) : (
                    <span
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg"
                      style={{
                        background: theme.colors.backgroundSecondary,
                        color: theme.colors.foregroundMuted,
                      }}
                    >
                      <Info size={12} />
                      {t('cookies.optional')}
                    </span>
                  )}
                </div>
              </div>

              <CookieTable cookies={type.cookies} accentColor={type.color} />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </LegalPageLayout>
  )
}
