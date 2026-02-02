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

export const Route = createFileRoute('/_public/docs/security')({
  head: () => ({
    meta: [
      { title: 'Security | Docs | Eziox' },
      {
        name: 'description',
        content: "Learn about Eziox's security features and best practices.",
      },
    ],
  }),
  component: SecurityDoc,
})

export function SecurityDoc() {
  const { t } = useTranslation()
  const s = 'docs.pages.security.sections'

  return (
    <DocsLayout
      title={t('docs.pages.security.title')}
      description={t('docs.pages.security.description')}
      category="Account"
      icon="Shield"
    >
      {/* Account Security */}
      <DocSection title={t(`${s}.accountSecurity.title`)}>
        <DocSubSection title={t(`${s}.accountSecurity.passwords.title`)}>
          <DocParagraph>{t(`${s}.accountSecurity.passwords.intro`)}</DocParagraph>
          <DocList
            items={t(`${s}.accountSecurity.passwords.requirements`, {
              returnObjects: true,
            }) as string[]}
          />
          <DocParagraph>{t(`${s}.accountSecurity.passwords.advanced`)}</DocParagraph>
          <DocList
            items={t(`${s}.accountSecurity.passwords.advancedList`, {
              returnObjects: true,
            }) as string[]}
          />
        </DocSubSection>

        <DocSubSection title={t(`${s}.accountSecurity.twoFactor.title`)}>
          <DocParagraph>{t(`${s}.accountSecurity.twoFactor.intro`)}</DocParagraph>
          <DocList
            items={t(`${s}.accountSecurity.twoFactor.steps`, {
              returnObjects: true,
            }) as string[]}
          />
          <DocParagraph>{t(`${s}.accountSecurity.twoFactor.appsTitle`)}</DocParagraph>
          <DocList
            items={t(`${s}.accountSecurity.twoFactor.apps`, {
              returnObjects: true,
            }) as string[]}
          />
        </DocSubSection>

        <DocSubSection title={t(`${s}.accountSecurity.recoveryCodes.title`)}>
          <DocParagraph>{t(`${s}.accountSecurity.recoveryCodes.intro`)}</DocParagraph>
          <DocList
            items={t(`${s}.accountSecurity.recoveryCodes.features`, {
              returnObjects: true,
            }) as string[]}
          />
        </DocSubSection>

        <DocSubSection title={t(`${s}.accountSecurity.loginProtection.title`)}>
          <DocParagraph>{t(`${s}.accountSecurity.loginProtection.intro`)}</DocParagraph>
          <DocList
            items={t(`${s}.accountSecurity.loginProtection.features`, {
              returnObjects: true,
            }) as string[]}
          />
        </DocSubSection>
      </DocSection>

      {/* Data Protection */}
      <DocSection title={t(`${s}.dataProtection.title`)}>
        <DocSubSection title={t(`${s}.dataProtection.encryption.title`)}>
          <DocList
            items={t(`${s}.dataProtection.encryption.items`, {
              returnObjects: true,
            }) as string[]}
          />
        </DocSubSection>

        <DocSubSection title={t(`${s}.dataProtection.cookies.title`)}>
          <DocList
            items={t(`${s}.dataProtection.cookies.items`, {
              returnObjects: true,
            }) as string[]}
          />
        </DocSubSection>

        <DocSubSection title={t(`${s}.dataProtection.ipAnonymization.title`)}>
          <DocParagraph>{t(`${s}.dataProtection.ipAnonymization.intro`)}</DocParagraph>
          <DocList
            items={t(`${s}.dataProtection.ipAnonymization.items`, {
              returnObjects: true,
            }) as string[]}
          />
        </DocSubSection>
      </DocSection>

      {/* Bot Protection & Rate Limiting */}
      <DocSection title={t(`${s}.botProtection.title`)}>
        <DocSubSection title={t(`${s}.botProtection.turnstile.title`)}>
          <DocParagraph>{t(`${s}.botProtection.turnstile.intro`)}</DocParagraph>
          <DocList
            items={t(`${s}.botProtection.turnstile.features`, {
              returnObjects: true,
            }) as string[]}
          />
        </DocSubSection>

        <DocSubSection title={t(`${s}.botProtection.rateLimiting.title`)}>
          <DocParagraph>{t(`${s}.botProtection.rateLimiting.intro`)}</DocParagraph>
          <DocTable
            headers={t(`${s}.botProtection.rateLimiting.headers`, {
              returnObjects: true,
            }) as string[]}
            rows={t(`${s}.botProtection.rateLimiting.rows`, {
              returnObjects: true,
            }) as string[][]}
          />
        </DocSubSection>

        <DocSubSection title={t(`${s}.botProtection.ddos.title`)}>
          <DocParagraph>{t(`${s}.botProtection.ddos.intro`)}</DocParagraph>
          <DocList
            items={t(`${s}.botProtection.ddos.features`, {
              returnObjects: true,
            }) as string[]}
          />
        </DocSubSection>
      </DocSection>

      {/* Input Validation */}
      <DocSection title={t(`${s}.inputValidation.title`)}>
        <DocParagraph>{t(`${s}.inputValidation.intro`)}</DocParagraph>
        <DocList
          items={t(`${s}.inputValidation.items`, {
            returnObjects: true,
          }) as string[]}
        />
      </DocSection>

      {/* Privacy Controls */}
      <DocSection title={t(`${s}.privacyControls.title`)}>
        <DocSubSection title={t(`${s}.privacyControls.dataExport.title`)}>
          <DocParagraph>{t(`${s}.privacyControls.dataExport.intro`)}</DocParagraph>
          <DocList
            items={t(`${s}.privacyControls.dataExport.steps`, {
              returnObjects: true,
            }) as string[]}
          />
        </DocSubSection>

        <DocSubSection title={t(`${s}.privacyControls.accountDeletion.title`)}>
          <DocParagraph>{t(`${s}.privacyControls.accountDeletion.intro`)}</DocParagraph>
          <DocList
            items={t(`${s}.privacyControls.accountDeletion.steps`, {
              returnObjects: true,
            }) as string[]}
          />
        </DocSubSection>

        <DocSubSection title={t(`${s}.privacyControls.cookieConsent.title`)}>
          <DocParagraph>{t(`${s}.privacyControls.cookieConsent.intro`)}</DocParagraph>
          <DocList
            items={t(`${s}.privacyControls.cookieConsent.features`, {
              returnObjects: true,
            }) as string[]}
          />
        </DocSubSection>
      </DocSection>

      {/* Best Practices */}
      <DocSection title={t(`${s}.bestPractices.title`)}>
        <DocSubSection title={t(`${s}.bestPractices.dos.title`)}>
          <DocList
            items={t(`${s}.bestPractices.dos.items`, {
              returnObjects: true,
            }) as string[]}
          />
        </DocSubSection>

        <DocSubSection title={t(`${s}.bestPractices.donts.title`)}>
          <DocList
            items={t(`${s}.bestPractices.donts.items`, {
              returnObjects: true,
            }) as string[]}
          />
        </DocSubSection>
      </DocSection>

      {/* Reporting */}
      <DocSection title={t(`${s}.reporting.title`)}>
        <DocParagraph>{t(`${s}.reporting.intro`)}</DocParagraph>
        <DocList
          items={t(`${s}.reporting.contact`, {
            returnObjects: true,
          }) as string[]}
        />
        <DocParagraph>{t(`${s}.reporting.note`)}</DocParagraph>
      </DocSection>

      {/* Compliance */}
      <DocSection title={t(`${s}.compliance.title`)}>
        <DocSubSection title={t(`${s}.compliance.gdpr.title`)}>
          <DocList
            items={t(`${s}.compliance.gdpr.items`, {
              returnObjects: true,
            }) as string[]}
          />
        </DocSubSection>
        <DocParagraph>
          {t(`${s}.compliance.contact`)}{' '}
          <DocLink href="mailto:security@eziox.link">
            {t(`${s}.compliance.email`)}
          </DocLink>
          .
        </DocParagraph>
      </DocSection>

      {/* Planned Features */}
      <DocSection title={t(`${s}.planned.title`)}>
        <DocBlockquote type="info">{t(`${s}.planned.note`)}</DocBlockquote>
        <DocParagraph>{t(`${s}.planned.intro`)}</DocParagraph>
        <DocList
          items={t(`${s}.planned.items`, {
            returnObjects: true,
          }) as string[]}
        />
      </DocSection>
    </DocsLayout>
  )
}
