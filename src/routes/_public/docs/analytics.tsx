import { createFileRoute } from '@tanstack/react-router'
import {
  DocsLayout,
  DocSection,
  DocSubSection,
  DocParagraph,
  DocList,
  DocTable,
  DocLink,
} from '@/components/docs/DocsLayout'

export const Route = createFileRoute('/_public/docs/analytics')({
  head: () => ({
    meta: [
      { title: 'Analytics | Docs | Eziox' },
      {
        name: 'description',
        content:
          'Track your profile performance with detailed analytics and insights.',
      },
    ],
  }),
  component: AnalyticsDoc,
})

function AnalyticsDoc() {
  return (
    <DocsLayout
      title="Analytics"
      description="Track your profile performance with detailed analytics and insights."
      category="Features"
      icon="BarChart3"
    >
      <DocSection title="Overview">
        <DocParagraph>
          Access your analytics at{' '}
          <DocLink href="/analytics">eziox.link/analytics</DocLink> or from your
          Dashboard.
        </DocParagraph>

        <DocSubSection title="Key Metrics">
          <DocTable
            headers={['Metric', 'Description']}
            rows={[
              ['Profile Views', 'Total visits to your bio page'],
              ['Link Clicks', 'Total clicks across all links'],
              ['Click Rate', 'Clicks ÷ Views (engagement rate)'],
              ['Followers', 'Users following your profile'],
            ]}
          />
        </DocSubSection>
      </DocSection>

      <DocSection title="Time Ranges">
        <DocParagraph>View your data across different periods:</DocParagraph>
        <DocList
          items={[
            '7 Days - Recent activity',
            '30 Days - Monthly overview (default)',
            '90 Days - Quarterly trends',
            '1 Year - Long-term growth',
          ]}
        />
      </DocSection>

      <DocSection title="Charts & Visualizations">
        <DocSubSection title="Daily Activity Chart">
          <DocParagraph>Interactive bar chart showing:</DocParagraph>
          <DocList
            items={[
              'Daily profile views (blue bars)',
              'Daily link clicks (purple bars)',
              'Hover for exact numbers',
            ]}
          />
        </DocSubSection>

        <DocSubSection title="Top Performing Links">
          <DocParagraph>See which links get the most engagement:</DocParagraph>
          <DocList
            items={[
              'Link title and URL',
              'Click count',
              'Percentage of total clicks',
              'Click trend (up/down)',
            ]}
          />
        </DocSubSection>

        <DocSubSection title="Traffic Sources">
          <DocParagraph>Understand where your visitors come from:</DocParagraph>
          <DocList
            items={[
              'Direct traffic',
              'Social media referrals',
              'Search engines',
              'Other websites',
            ]}
          />
        </DocSubSection>
      </DocSection>

      <DocSection title="Link Analytics">
        <DocParagraph>Each link has its own detailed analytics:</DocParagraph>

        <DocSubSection title="Per-Link Metrics">
          <DocList
            items={[
              'Total Clicks - Lifetime click count',
              'Unique Visitors - Deduplicated by session',
              'Click Heatmap - Clicks by hour (0-23)',
            ]}
          />
        </DocSubSection>

        <DocSubSection title="Device Breakdown">
          <DocList
            items={[
              'Desktop vs Mobile vs Tablet',
              'Browser distribution (Chrome, Firefox, Safari, etc.)',
              'Operating system (Windows, macOS, iOS, Android)',
            ]}
          />
        </DocSubSection>
      </DocSection>

      <DocSection title="Export Data (Pro+)">
        <DocParagraph>Export your analytics in multiple formats:</DocParagraph>
        <DocList
          items={['CSV - Spreadsheet-compatible', 'JSON - Developer-friendly']}
        />
        <DocParagraph>Export includes:</DocParagraph>
        <DocList
          items={[
            'Daily view/click counts',
            'Link performance data',
            'Traffic source breakdown',
            'Device statistics',
          ]}
        />
      </DocSection>

      <DocSection title="Privacy & Data">
        <DocParagraph>We take privacy seriously:</DocParagraph>
        <DocList
          items={[
            'IP Anonymization - Last octet zeroed (GDPR compliant)',
            "No Third-Party Tracking - We don't use Google Analytics",
            'Data Retention - 30 days for Free, unlimited for Pro+',
            'Self-Service Export - Download all your data anytime',
          ]}
        />
      </DocSection>

      <DocSection title="Tips for Growth">
        <DocList
          items={[
            'Post consistently - Share your bio link regularly',
            'Optimize link order - Put important links at the top',
            'Use compelling titles - Clear, action-oriented text',
            'Track campaigns - Use UTM parameters for marketing',
            'A/B test - Try different link titles and thumbnails',
          ]}
        />
        <DocParagraph>
          Want more insights? Upgrade to <DocLink href="/pricing">Pro</DocLink>{' '}
          for extended data retention and export features.
        </DocParagraph>
      </DocSection>
    </DocsLayout>
  )
}
