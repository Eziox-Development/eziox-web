import { createFileRoute } from '@tanstack/react-router'
import {
  DocsLayout,
  DocSection,
  DocSubSection,
  DocParagraph,
  DocList,
  DocTable,
  DocCode,
  DocLink,
  DocInlineCode,
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

function ApiDoc() {
  return (
    <DocsLayout
      title="API Access"
      description="Integrate Eziox with your applications using our REST API."
      category="Features"
      icon="Key"
    >
      <DocSection title="Overview">
        <DocParagraph>The Eziox API allows you to:</DocParagraph>
        <DocList
          items={[
            'Read your profile data',
            'Manage your links programmatically',
            'Access analytics data',
            'Apply templates',
          ]}
        />
      </DocSection>

      <DocSection title="Authentication">
        <DocParagraph>
          All API requests require an API key. Generate one at{' '}
          <DocLink href="/profile?tab=api">Dashboard → API Access</DocLink>.
        </DocParagraph>

        <DocSubSection title="API Key Format">
          <DocCode>{`ezx_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`}</DocCode>
        </DocSubSection>

        <DocSubSection title="Using Your Key">
          <DocParagraph>
            Include your API key in the{' '}
            <DocInlineCode>Authorization</DocInlineCode> header:
          </DocParagraph>
          <DocCode>
            {`curl -X GET "https://api.eziox.link/v1/profile" \\
  -H "Authorization: Bearer ezx_your_api_key_here"`}
          </DocCode>
        </DocSubSection>
      </DocSection>

      <DocSection title="Rate Limits">
        <DocParagraph>Rate limits vary by subscription tier:</DocParagraph>
        <DocTable
          headers={['Tier', 'Requests/Hour']}
          rows={[
            ['Free', '1,000'],
            ['Pro', '5,000'],
            ['Creator', '10,000'],
            ['Lifetime', '10,000'],
          ]}
        />

        <DocSubSection title="Rate Limit Headers">
          <DocParagraph>
            Every response includes rate limit information:
          </DocParagraph>
          <DocCode>
            {`X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1706140800`}
          </DocCode>
        </DocSubSection>
      </DocSection>

      <DocSection title="Endpoints">
        <DocSubSection title="Get Profile">
          <DocCode>{`GET /v1/profile`}</DocCode>
          <DocParagraph>Returns your profile information.</DocParagraph>
        </DocSubSection>

        <DocSubSection title="List Links">
          <DocCode>{`GET /v1/links`}</DocCode>
          <DocParagraph>Returns all your links.</DocParagraph>
          <DocTable
            headers={['Parameter', 'Type', 'Description']}
            rows={[
              ['limit', 'number', 'Max results (default: 50)'],
              ['offset', 'number', 'Pagination offset'],
              ['active', 'boolean', 'Filter by active status'],
            ]}
          />
        </DocSubSection>

        <DocSubSection title="Create Link">
          <DocCode>{`POST /v1/links`}</DocCode>
        </DocSubSection>

        <DocSubSection title="Update Link">
          <DocCode>{`PATCH /v1/links/:id`}</DocCode>
        </DocSubSection>

        <DocSubSection title="Delete Link">
          <DocCode>{`DELETE /v1/links/:id`}</DocCode>
        </DocSubSection>

        <DocSubSection title="Get Analytics">
          <DocCode>{`GET /v1/analytics`}</DocCode>
          <DocTable
            headers={['Parameter', 'Type', 'Description']}
            rows={[
              ['period', 'string', '7d, 30d, 90d, 1y'],
              ['metric', 'string', 'views, clicks, all'],
            ]}
          />
        </DocSubSection>
      </DocSection>

      <DocSection title="Permissions">
        <DocParagraph>
          When creating an API key, you can configure granular permissions:
        </DocParagraph>
        <DocTable
          headers={['Permission', 'Access']}
          rows={[
            ['profile:read', 'Read profile data'],
            ['profile:write', 'Update profile'],
            ['links:read', 'List links'],
            ['links:write', 'Create/update links'],
            ['links:delete', 'Delete links'],
            ['analytics:read', 'Access analytics'],
            ['templates:read', 'List templates'],
            ['templates:apply', 'Apply templates'],
          ]}
        />
      </DocSection>

      <DocSection title="Error Codes">
        <DocTable
          headers={['Code', 'HTTP Status', 'Description']}
          rows={[
            ['UNAUTHORIZED', '401', 'Invalid or missing API key'],
            ['FORBIDDEN', '403', 'Insufficient permissions'],
            ['NOT_FOUND', '404', 'Resource not found'],
            ['RATE_LIMIT_EXCEEDED', '429', 'Too many requests'],
            ['INTERNAL_ERROR', '500', 'Server error'],
          ]}
        />
      </DocSection>

      <DocSection title="More Information">
        <DocParagraph>
          For interactive examples and detailed response schemas, check out our{' '}
          <DocLink href="/api-docs">API Reference</DocLink>.
        </DocParagraph>
      </DocSection>
    </DocsLayout>
  )
}
