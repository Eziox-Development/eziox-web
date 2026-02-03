import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
  DocsLayout,
  DocSection,
  DocSubSection,
  DocParagraph,
  DocList,
  DocTable,
  DocLink,
  DocBlockquote,
} from '@/components/docs/DocsLayout'

export const Route = createFileRoute('/_public/docs/analytics')({
  head: () => ({
    meta: [
      { title: 'Analytics | Docs | Eziox' },
      {
        name: 'description',
        content: 'Track your profile performance with detailed analytics and insights.',
      },
    ],
  }),
  component: AnalyticsDoc,
})

export function AnalyticsDoc() {
  const { t } = useTranslation()

  return (
    <DocsLayout
      title={t('docs.pages.analytics.title')}
      description={t('docs.pages.analytics.description')}
      category="Features"
      icon="BarChart3"
    >
      <DocSection title={t('docs.pages.analytics.sections.overview.title')}>
        <DocParagraph>
          {t('docs.pages.analytics.sections.overview.intro', { link: '' })}
          <DocLink href="/analytics">{typeof window !== 'undefined' ? (window.location.hostname === 'localhost' ? 'localhost:5173' : window.location.hostname) : 'eziox.link'}/analytics</DocLink>
        </DocParagraph>

        <DocSubSection title={t('docs.pages.analytics.sections.overview.keyMetrics')}>
          <DocTable
            headers={['Metric', 'Description']}
            rows={[
              [
                t('docs.pages.analytics.sections.metrics.profileViews'),
                t('docs.pages.analytics.sections.metrics.profileViewsDesc'),
              ],
              [
                t('docs.pages.analytics.sections.metrics.linkClicks'),
                t('docs.pages.analytics.sections.metrics.linkClicksDesc'),
              ],
              [
                t('docs.pages.analytics.sections.metrics.clickRate'),
                t('docs.pages.analytics.sections.metrics.clickRateDesc'),
              ],
              [
                t('docs.pages.analytics.sections.metrics.followers'),
                t('docs.pages.analytics.sections.metrics.followersDesc'),
              ],
            ]}
          />
        </DocSubSection>
      </DocSection>

      <DocSection title={t('docs.pages.analytics.sections.timeRanges.title')}>
        <DocParagraph>
          {t('docs.pages.analytics.sections.timeRanges.description')}
        </DocParagraph>

        <DocTable
          headers={[t('common.period'), t('common.description')]}
          rows={[
            [
              t('docs.pages.analytics.sections.timeRanges.today'),
              t('docs.pages.analytics.sections.timeRanges.todayDesc'),
            ],
            [
              t('docs.pages.analytics.sections.timeRanges.week'),
              t('docs.pages.analytics.sections.timeRanges.weekDesc'),
            ],
            [
              t('docs.pages.analytics.sections.timeRanges.month'),
              t('docs.pages.analytics.sections.timeRanges.monthDesc'),
            ],
            [
              t('docs.pages.analytics.sections.timeRanges.year'),
              t('docs.pages.analytics.sections.timeRanges.yearDesc'),
            ],
            [
              t('docs.pages.analytics.sections.timeRanges.allTime'),
              t('docs.pages.analytics.sections.timeRanges.allTimeDesc'),
            ],
          ]}
        />
      </DocSection>

      <DocSection title={t('docs.pages.analytics.sections.charts.title')}>
        <DocParagraph>
          {t('docs.pages.analytics.sections.charts.description')}
        </DocParagraph>

        <DocList
          items={[
            `**${t('docs.pages.analytics.sections.charts.viewsOverTime')}** - ${t('docs.pages.analytics.sections.charts.viewsOverTimeDesc')}`,
            `**${t('docs.pages.analytics.sections.charts.topLinks')}** - ${t('docs.pages.analytics.sections.charts.topLinksDesc')}`,
            `**${t('docs.pages.analytics.sections.charts.deviceBreakdown')}** - ${t('docs.pages.analytics.sections.charts.deviceBreakdownDesc')}`,
            `**${t('docs.pages.analytics.sections.charts.geoDistribution')}** - ${t('docs.pages.analytics.sections.charts.geoDistributionDesc')}`,
          ]}
        />
      </DocSection>

      <DocSection title={t('docs.pages.analytics.sections.export.title')}>
        <DocParagraph>
          {t('docs.pages.analytics.sections.export.description')}
        </DocParagraph>

        <DocBlockquote type="info">
          {t('docs.pages.analytics.sections.export.formats')}
        </DocBlockquote>

        <DocParagraph>
          {t('docs.pages.analytics.sections.export.howTo')}
        </DocParagraph>
      </DocSection>

      <DocSection title={t('docs.pages.analytics.sections.tips.title')}>
        <DocList
          items={[
            t('docs.pages.analytics.sections.tips.tip1'),
            t('docs.pages.analytics.sections.tips.tip2'),
            t('docs.pages.analytics.sections.tips.tip3'),
            t('docs.pages.analytics.sections.tips.tip4'),
          ]}
        />
      </DocSection>
    </DocsLayout>
  )
}
