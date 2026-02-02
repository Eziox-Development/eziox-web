import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
  Shield,
  Lock,
  Database,
  Cookie,
  Globe,
  UserCheck,
  FileText,
  Calendar,
  Scale,
  Server,
  CreditCard,
  Users,
  MessageSquare,
  Puzzle,
  RefreshCw,
  BookOpen,
} from 'lucide-react'
import {
  LegalPageLayout,
  type LegalSection,
  type RelatedLink,
} from '@/components/legal/LegalPageLayout'

export const Route = createFileRoute('/_public/privacy')({
  head: () => ({
    meta: [
      { title: 'Privacy Policy | Eziox' },
      {
        name: 'description',
        content:
          'Privacy Policy for Eziox according to GDPR. Learn how we collect, process and protect your personal data.',
      },
    ],
  }),
  component: PrivacyPage,
})

const LAST_UPDATED = '30. Januar 2026'
const ACCENT_COLOR = '#14b8a6'

export function PrivacyPage() {
  const { t } = useTranslation()

  const SECTIONS: LegalSection[] = [
    {
      id: 'preamble',
      title: t('privacy.sections.preamble.title'),
      icon: Shield,
      content: t('privacy.sections.preamble.content'),
    },
    {
      id: 'controller',
      title: t('privacy.sections.controller.title'),
      icon: UserCheck,
      content: t('privacy.sections.controller.content'),
    },
    {
      id: 'overview',
      title: t('privacy.sections.overview.title'),
      icon: Database,
      content: t('privacy.sections.overview.content'),
    },
    {
      id: 'legal-basis',
      title: t('privacy.sections.legalBasis.title'),
      icon: Scale,
      content: t('privacy.sections.legalBasis.content'),
    },
    {
      id: 'security',
      title: t('privacy.sections.security.title'),
      icon: Lock,
      content: t('privacy.sections.security.content'),
    },
    {
      id: 'transfer',
      title: t('privacy.sections.transfer.title'),
      icon: Server,
      content: t('privacy.sections.transfer.content'),
    },
    {
      id: 'international',
      title: t('privacy.sections.international.title'),
      icon: Globe,
      content: t('privacy.sections.international.content'),
    },
    {
      id: 'retention',
      title: t('privacy.sections.retention.title'),
      icon: Calendar,
      content: t('privacy.sections.retention.content'),
    },
    {
      id: 'rights',
      title: t('privacy.sections.rights.title'),
      icon: FileText,
      content: t('privacy.sections.rights.content'),
    },
    {
      id: 'services',
      title: t('privacy.sections.services.title'),
      icon: Users,
      content: t('privacy.sections.services.content'),
    },
    {
      id: 'payment',
      title: t('privacy.sections.payment.title'),
      icon: CreditCard,
      content: t('privacy.sections.payment.content'),
    },
    {
      id: 'cookies',
      title: t('privacy.sections.cookies.title'),
      icon: Cookie,
      content: t('privacy.sections.cookies.content'),
    },
    {
      id: 'registration',
      title: t('privacy.sections.registration.title'),
      icon: UserCheck,
      content: t('privacy.sections.registration.content'),
    },
    {
      id: 'contact',
      title: t('privacy.sections.contact.title'),
      icon: MessageSquare,
      content: t('privacy.sections.contact.content'),
    },
    {
      id: 'plugins',
      title: t('privacy.sections.plugins.title'),
      icon: Puzzle,
      content: t('privacy.sections.plugins.content'),
    },
    {
      id: 'changes',
      title: t('privacy.sections.changes.title'),
      icon: RefreshCw,
      content: t('privacy.sections.changes.content'),
    },
    {
      id: 'definitions',
      title: t('privacy.sections.definitions.title'),
      icon: BookOpen,
      content: t('privacy.sections.definitions.content'),
    },
  ]

  const RELATED_LINKS: RelatedLink[] = [
    { title: t('privacy.related.terms'), href: '/terms', icon: Scale },
    { title: t('privacy.related.cookies'), href: '/cookies', icon: Cookie },
    { title: t('privacy.related.imprint'), href: '/imprint', icon: FileText },
  ]

  return (
    <LegalPageLayout
      title={t('privacy.hero.title')}
      subtitle={t('privacy.hero.subtitle')}
      badge={t('privacy.badge')}
      badgeIcon={Shield}
      accentColor={ACCENT_COLOR}
      lastUpdated={LAST_UPDATED}
      sections={SECTIONS}
      relatedLinks={RELATED_LINKS}
      generatorCredit={{
        text: 'Created with free Privacy Policy Generator by',
        url: 'https://datenschutz-generator.de/',
        name: 'Dr. Thomas Schwenke',
      }}
    />
  )
}

export default PrivacyPage
