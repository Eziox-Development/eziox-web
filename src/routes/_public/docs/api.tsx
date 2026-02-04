import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
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

export const Route = createFileRoute('/_public/docs/api')({
  head: () => ({
    meta: [
      { title: 'API Access | Docs | Eziox' },
      {
        name: 'description',
        content: 'Integrate Eziox with your applications using our REST API.',
      },
    ],
  }),
  component: ApiDoc,
})

export function ApiDoc() {
  const { t } = useTranslation()
  const s = 'docs.pages.api.sections'

  return (
    <DocsLayout
      title={t('docs.pages.api.title')}
      description={t('docs.pages.api.description')}
      category="Features"
      icon="Key"
    >
      <DocSection title={t(`${s}.overview.title`)}>
        <DocParagraph>{t(`${s}.overview.intro`)}</DocParagraph>
        <DocList
          items={[
            t(`${s}.overview.features.0`),
            t(`${s}.overview.features.1`),
            t(`${s}.overview.features.2`),
            t(`${s}.overview.features.3`),
          ]}
        />
      </DocSection>

      <DocSection title={t(`${s}.authentication.title`)}>
        <DocParagraph>
          {t(`${s}.authentication.intro`)}{' '}
          <DocLink href="/profile?tab=api">
            {t(`${s}.authentication.dashboardLink`)}
          </DocLink>
          .
        </DocParagraph>

        <DocSubSection title={t(`${s}.authentication.keyFormat`)}>
          <DocParagraph>{t(`${s}.authentication.keyFormatDesc`)}</DocParagraph>
          <DocCode>{`ezx_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`}</DocCode>
        </DocSubSection>

        <DocSubSection title={t(`${s}.authentication.usingKey`)}>
          <DocParagraph>{t(`${s}.authentication.usingKeyDesc`)}</DocParagraph>
          <DocCode language="bash">
            {`curl -X GET "https://api.eziox.link/v1/profile" \\
  -H "Authorization: Bearer ezx_your_api_key_here"`}
          </DocCode>
        </DocSubSection>
      </DocSection>

      <DocSection title={t(`${s}.rateLimits.title`)}>
        <DocParagraph>{t(`${s}.rateLimits.intro`)}</DocParagraph>
        <DocTable
          headers={['Tier', t(`${s}.rateLimits.requestsPerHour`)]}
          rows={[
            [t(`${s}.rateLimits.tiers.free`), '1,000'],
            [t(`${s}.rateLimits.tiers.pro`), '5,000'],
            [t(`${s}.rateLimits.tiers.creator`), '10,000'],
            [t(`${s}.rateLimits.tiers.lifetime`), '10,000'],
          ]}
        />

        <DocSubSection title={t(`${s}.keyLimits.title`)}>
          <DocParagraph>{t(`${s}.keyLimits.intro`)}</DocParagraph>
          <DocTable
            headers={['Tier', t(`${s}.keyLimits.activeKeys`)]}
            rows={[
              [t(`${s}.rateLimits.tiers.free`), '2'],
              [t(`${s}.rateLimits.tiers.pro`), '5'],
              [t(`${s}.rateLimits.tiers.creator`), '10'],
              [t(`${s}.rateLimits.tiers.lifetime`), '10'],
            ]}
          />
        </DocSubSection>

        <DocSubSection title={t(`${s}.rateLimits.headers`)}>
          <DocParagraph>{t(`${s}.rateLimits.headersDesc`)}</DocParagraph>
          <DocCode>
            {`X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1706140800`}
          </DocCode>
        </DocSubSection>
      </DocSection>

      <DocSection title={t(`${s}.endpoints.title`)}>
        <DocBlockquote type="info">
          {t(`${s}.endpoints.baseUrl`)}: `$
          api.eziox.link/v1`
        </DocBlockquote>

        <DocSubSection title={t(`${s}.endpoints.getProfile`)}>
          <DocCode language="http">{`GET /v1/profile`}</DocCode>
          <DocParagraph>{t(`${s}.endpoints.getProfileDesc`)}</DocParagraph>
        </DocSubSection>

        <DocSubSection title={t(`${s}.endpoints.listLinks`)}>
          <DocCode language="http">{`GET /v1/links`}</DocCode>
          <DocParagraph>{t(`${s}.endpoints.listLinksDesc`)}</DocParagraph>
          <DocTable
            headers={[t(`${s}.endpoints.parameters`), 'Type', 'Description']}
            rows={[
              ['limit', 'number', t(`${s}.endpoints.paramLimit`)],
              ['offset', 'number', t(`${s}.endpoints.paramOffset`)],
              ['active', 'boolean', t(`${s}.endpoints.paramActive`)],
            ]}
          />
        </DocSubSection>

        <DocSubSection title={t(`${s}.endpoints.createLink`)}>
          <DocCode language="http">{`POST /v1/links`}</DocCode>
          <DocParagraph>{t(`${s}.endpoints.createLinkDesc`)}</DocParagraph>
        </DocSubSection>

        <DocSubSection title={t(`${s}.endpoints.updateLink`)}>
          <DocCode language="http">{`PATCH /v1/links/:id`}</DocCode>
          <DocParagraph>{t(`${s}.endpoints.updateLinkDesc`)}</DocParagraph>
        </DocSubSection>

        <DocSubSection title={t(`${s}.endpoints.deleteLink`)}>
          <DocCode language="http">{`DELETE /v1/links/:id`}</DocCode>
          <DocParagraph>{t(`${s}.endpoints.deleteLinkDesc`)}</DocParagraph>
        </DocSubSection>

        <DocSubSection title={t(`${s}.endpoints.getAnalytics`)}>
          <DocCode language="http">{`GET /v1/analytics`}</DocCode>
          <DocParagraph>{t(`${s}.endpoints.getAnalyticsDesc`)}</DocParagraph>
          <DocTable
            headers={[t(`${s}.endpoints.parameters`), 'Type', 'Description']}
            rows={[
              ['period', 'string', t(`${s}.endpoints.paramPeriod`)],
              ['metric', 'string', t(`${s}.endpoints.paramMetric`)],
            ]}
          />
        </DocSubSection>
      </DocSection>

      <DocSection title={t(`${s}.permissions.title`)}>
        <DocParagraph>{t(`${s}.permissions.intro`)}</DocParagraph>
        <DocTable
          headers={['Permission', 'Access']}
          rows={[
            ['profile:read', t(`${s}.permissions.profileRead`)],
            ['profile:write', t(`${s}.permissions.profileWrite`)],
            ['links:read', t(`${s}.permissions.linksRead`)],
            ['links:write', t(`${s}.permissions.linksWrite`)],
            ['links:delete', t(`${s}.permissions.linksDelete`)],
            ['analytics:read', t(`${s}.permissions.analyticsRead`)],
            ['templates:read', t(`${s}.permissions.templatesRead`)],
            ['templates:apply', t(`${s}.permissions.templatesApply`)],
          ]}
        />
      </DocSection>

      <DocSection title={t(`${s}.errors.title`)}>
        <DocTable
          headers={['Code', 'HTTP Status', 'Description']}
          rows={[
            ['UNAUTHORIZED', '401', t(`${s}.errors.unauthorized`)],
            ['FORBIDDEN', '403', t(`${s}.errors.forbidden`)],
            ['NOT_FOUND', '404', t(`${s}.errors.notFound`)],
            ['RATE_LIMIT_EXCEEDED', '429', t(`${s}.errors.rateLimitExceeded`)],
            ['VALIDATION_ERROR', '400', t(`${s}.errors.validationError`)],
            ['INTERNAL_ERROR', '500', t(`${s}.errors.internalError`)],
          ]}
        />
      </DocSection>

      <DocSection title={t(`${s}.moreInfo.title`)}>
        <DocParagraph>
          {t(`${s}.moreInfo.text`)}{' '}
          <DocLink href="/api-docs">{t(`${s}.moreInfo.apiReference`)}</DocLink>.
        </DocParagraph>
      </DocSection>
    </DocsLayout>
  )
}
