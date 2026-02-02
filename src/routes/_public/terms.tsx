import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
  FileText,
  Scale,
  UserCheck,
  Shield,
  AlertTriangle,
  Ban,
  Gavel,
  Globe,
  Mail,
  CheckCircle,
  CreditCard,
  RotateCcw,
  Share2,
  Link,
  Eye,
  Clock,
  Users,
} from 'lucide-react'
import {
  LegalPageLayout,
  type LegalSection,
  type RelatedLink,
} from '@/components/legal/LegalPageLayout'

export const Route = createFileRoute('/_public/terms')({
  head: () => ({
    meta: [
      { title: 'Terms of Service | Eziox' },
      {
        name: 'description',
        content:
          'Terms of Service for Eziox. Rules and guidelines for using our bio-link platform.',
      },
    ],
  }),
  component: TermsPage,
})

const LAST_UPDATED = '30. Januar 2026'
const ACCENT_COLOR = '#8b5cf6'

export function TermsPage() {
  const { t } = useTranslation()

  const SECTIONS: LegalSection[] = [
    {
      id: 'agreement',
      title: t('terms.sections.agreement.title'),
      icon: CheckCircle,
      content: t('terms.sections.agreement.content'),
    },
    {
      id: 'services',
      title: t('terms.sections.services.title'),
      icon: Globe,
      content: t('terms.sections.services.content'),
    },
    {
      id: 'ip',
      title: t('terms.sections.ip.title'),
      icon: Scale,
      content: t('terms.sections.ip.content'),
    },
    {
      id: 'userreps',
      title: t('terms.sections.userreps.title'),
      icon: UserCheck,
      content: t('terms.sections.userreps.content'),
    },
    {
      id: 'userreg',
      title: t('terms.sections.userreg.title'),
      icon: Users,
      content: t('terms.sections.userreg.content'),
    },
    {
      id: 'purchases',
      title: t('terms.sections.purchases.title'),
      icon: CreditCard,
      content: t('terms.sections.purchases.content'),
    },
    {
      id: 'subscriptions',
      title: t('terms.sections.subscriptions.title'),
      icon: RotateCcw,
      content: t('terms.sections.subscriptions.content'),
    },
    {
      id: 'prohibited',
      title: t('terms.sections.prohibited.title'),
      icon: Ban,
      content: t('terms.sections.prohibited.content'),
    },
    {
      id: 'ugc',
      title: t('terms.sections.ugc.title'),
      icon: FileText,
      content: t('terms.sections.ugc.content'),
    },
    {
      id: 'license',
      title: t('terms.sections.license.title'),
      icon: Scale,
      content: t('terms.sections.license.content'),
    },
    {
      id: 'socialmedia',
      title: t('terms.sections.socialmedia.title'),
      icon: Share2,
      content: t('terms.sections.socialmedia.content'),
    },
    {
      id: 'thirdparty',
      title: t('terms.sections.thirdparty.title'),
      icon: Link,
      content: t('terms.sections.thirdparty.content'),
    },
    {
      id: 'sitemanage',
      title: t('terms.sections.sitemanage.title'),
      icon: Eye,
      content: t('terms.sections.sitemanage.content'),
    },
    {
      id: 'privacy',
      title: t('terms.sections.privacy.title'),
      icon: Shield,
      content: t('terms.sections.privacy.content'),
    },
    {
      id: 'copyright',
      title: t('terms.sections.copyright.title'),
      icon: AlertTriangle,
      content: t('terms.sections.copyright.content'),
    },
    {
      id: 'termination',
      title: t('terms.sections.termination.title'),
      icon: Clock,
      content: t('terms.sections.termination.content'),
    },
    {
      id: 'modifications',
      title: t('terms.sections.modifications.title'),
      icon: AlertTriangle,
      content: t('terms.sections.modifications.content'),
    },
    {
      id: 'law',
      title: t('terms.sections.law.title'),
      icon: Gavel,
      content: t('terms.sections.law.content'),
    },
    {
      id: 'disputes',
      title: t('terms.sections.disputes.title'),
      icon: Scale,
      content: t('terms.sections.disputes.content'),
    },
    {
      id: 'corrections',
      title: t('terms.sections.corrections.title'),
      icon: FileText,
      content: t('terms.sections.corrections.content'),
    },
    {
      id: 'disclaimer',
      title: t('terms.sections.disclaimer.title'),
      icon: AlertTriangle,
      content: t('terms.sections.disclaimer.content'),
    },
    {
      id: 'liability',
      title: t('terms.sections.liability.title'),
      icon: Shield,
      content: t('terms.sections.liability.content'),
    },
    {
      id: 'indemnification',
      title: t('terms.sections.indemnification.title'),
      icon: Shield,
      content: t('terms.sections.indemnification.content'),
    },
    {
      id: 'userdata',
      title: t('terms.sections.userdata.title'),
      icon: FileText,
      content: t('terms.sections.userdata.content'),
    },
    {
      id: 'electronic',
      title: t('terms.sections.electronic.title'),
      icon: Mail,
      content: t('terms.sections.electronic.content'),
    },
    {
      id: 'california',
      title: t('terms.sections.california.title'),
      icon: Globe,
      content: t('terms.sections.california.content'),
    },
    {
      id: 'misc',
      title: t('terms.sections.misc.title'),
      icon: FileText,
      content: t('terms.sections.misc.content'),
    },
    {
      id: 'contact',
      title: t('terms.sections.contact.title'),
      icon: Mail,
      content: t('terms.sections.contact.content'),
    },
  ]

  const RELATED_LINKS: RelatedLink[] = [
    { title: t('terms.relatedLinks.privacy'), href: '/privacy', icon: Shield },
    {
      title: t('terms.relatedLinks.widerruf'),
      href: '/widerruf',
      icon: RotateCcw,
    },
    {
      title: t('terms.relatedLinks.imprint'),
      href: '/imprint',
      icon: FileText,
    },
  ]

  return (
    <LegalPageLayout
      title={t('terms.title')}
      subtitle={t('terms.subtitle')}
      badge={t('terms.badge')}
      badgeIcon={Scale}
      accentColor={ACCENT_COLOR}
      lastUpdated={LAST_UPDATED}
      sections={SECTIONS}
      relatedLinks={RELATED_LINKS}
    />
  )
}
