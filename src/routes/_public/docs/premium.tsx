import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Check, X } from 'lucide-react'
import {
  DocsLayout,
  DocSection,
  DocSubSection,
  DocParagraph,
  DocList,
  DocTable,
  DocCode,
  DocLink,
  DocBlockquote,
} from '@/components/docs/DocsLayout'
import { useTheme } from '@/components/layout/ThemeProvider'

export const Route = createFileRoute('/_public/docs/premium')({
  head: () => ({
    meta: [
      { title: 'Premium Features | Docs | Eziox' },
      {
        name: 'description',
        content:
          'Unlock advanced features with Eziox Pro, Creator, and Lifetime plans.',
      },
    ],
  }),
  component: PremiumDoc,
})

// Feature availability matrix: [Free, Pro, Creator, Lifetime]
const FEATURE_MATRIX: boolean[][] = [
  [true, true, true, true], // Unlimited Links
  [true, true, true, true], // All 31+ Themes
  [true, true, true, true], // All Backgrounds
  [true, true, true, true], // Media Embeds
  [true, true, true, true], // Full Analytics
  [false, true, true, true], // Custom CSS
  [false, true, true, true], // Custom Fonts
  [false, true, true, true], // Remove Branding
  [false, true, true, true], // Profile Backups
  [false, true, true, true], // Export Analytics
  [false, false, true, true], // Custom Domain
  [false, false, true, true], // Password Links
  [false, false, true, true], // Email Collection
  [false, false, true, true], // Priority Support
]

export function PremiumDoc() {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const s = 'docs.pages.premium.sections'

  const features = t(`${s}.comparison.features`, {
    returnObjects: true,
  }) as string[]
  const headers = t(`${s}.comparison.headers`, {
    returnObjects: true,
  }) as string[]
  const pricingRows = t(`${s}.pricing.rows`, {
    returnObjects: true,
  }) as string[][]

  // Build comparison rows with icons
  const comparisonRows = features.map((feature, idx) => {
    const availability = FEATURE_MATRIX[idx] || [false, false, false, false]
    return [
      feature,
      ...availability.map((available) =>
        available ? (
          <Check
            size={18}
            style={{ color: theme.colors.primary }}
            strokeWidth={3}
          />
        ) : (
          <X
            size={18}
            style={{ color: theme.colors.foregroundMuted }}
            strokeWidth={2}
          />
        ),
      ),
    ]
  })

  return (
    <DocsLayout
      title={t('docs.pages.premium.title')}
      description={t('docs.pages.premium.description')}
      category="Features"
      icon="Crown"
    >
      <DocSection title={t(`${s}.philosophy.title`)}>
        <DocBlockquote>{t(`${s}.philosophy.quote`)}</DocBlockquote>
        <DocParagraph>{t(`${s}.philosophy.text`)}</DocParagraph>
      </DocSection>

      <DocSection title={t(`${s}.comparison.title`)}>
        <DocTable headers={headers} rows={comparisonRows} />
      </DocSection>

      <DocSection title={t(`${s}.pricing.title`)}>
        <DocTable
          headers={
            t(`${s}.pricing.headers`, { returnObjects: true }) as string[]
          }
          rows={pricingRows}
        />
      </DocSection>

      <DocSection title={t(`${s}.free.title`)}>
        <DocParagraph>{t(`${s}.free.intro`)}</DocParagraph>
        <DocList
          items={t(`${s}.free.features`, { returnObjects: true }) as string[]}
        />
        <DocSubSection title={t(`${s}.free.limitationsTitle`)}>
          <DocList
            items={
              t(`${s}.free.limitations`, { returnObjects: true }) as string[]
            }
          />
        </DocSubSection>
      </DocSection>

      <DocSection title={t(`${s}.pro.title`)}>
        <DocParagraph>{t(`${s}.pro.intro`)}</DocParagraph>

        <DocSubSection title={t(`${s}.pro.cssTitle`)}>
          <DocParagraph>{t(`${s}.pro.cssText`)}</DocParagraph>
          <DocCode>{t(`${s}.pro.cssExample`)}</DocCode>
        </DocSubSection>

        <DocSubSection title={t(`${s}.pro.otherTitle`)}>
          <DocList
            items={
              t(`${s}.pro.otherFeatures`, { returnObjects: true }) as string[]
            }
          />
        </DocSubSection>
      </DocSection>

      <DocSection title={t(`${s}.creator.title`)}>
        <DocParagraph>{t(`${s}.creator.intro`)}</DocParagraph>

        <DocSubSection title={t(`${s}.creator.domainTitle`)}>
          <DocParagraph>{t(`${s}.creator.domainText`)}</DocParagraph>
        </DocSubSection>

        <DocSubSection title={t(`${s}.creator.otherTitle`)}>
          <DocList
            items={
              t(`${s}.creator.otherFeatures`, {
                returnObjects: true,
              }) as string[]
            }
          />
        </DocSubSection>
      </DocSection>

      <DocSection title={t(`${s}.lifetime.title`)}>
        <DocParagraph>{t(`${s}.lifetime.intro`)}</DocParagraph>
        <DocList
          items={
            t(`${s}.lifetime.features`, { returnObjects: true }) as string[]
          }
        />
      </DocSection>

      <DocSection title={t(`${s}.upgrade.title`)}>
        <DocList
          items={t(`${s}.upgrade.steps`, { returnObjects: true }) as string[]}
        />
        <DocParagraph>
          {t(`${s}.upgrade.ctaPrefix`)}{' '}
          <DocLink href="/pricing">{t(`${s}.upgrade.ctaLink`)}</DocLink>{' '}
          {t(`${s}.upgrade.ctaSuffix`)}
        </DocParagraph>
      </DocSection>
    </DocsLayout>
  )
}
