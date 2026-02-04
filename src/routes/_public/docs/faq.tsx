import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
  DocsLayout,
  DocSection,
  DocSubSection,
  DocParagraph,
  DocList,
  DocLink,
} from '@/components/docs/DocsLayout'

export const Route = createFileRoute('/_public/docs/faq')({
  head: () => ({
    meta: [
      { title: 'FAQ | Docs | Eziox' },
      {
        name: 'description',
        content: 'Frequently asked questions about Eziox.',
      },
    ],
  }),
  component: FaqDoc,
})

export function FaqDoc() {
  const { t } = useTranslation()
  const s = 'docs.pages.faq.sections'

  return (
    <DocsLayout
      title={t('docs.pages.faq.title')}
      description={t('docs.pages.faq.description')}
      category="Support"
      icon="HelpCircle"
    >
      <DocSection title={t(`${s}.general.title`)}>
        <DocSubSection title={t(`${s}.general.whatIsEziox`)}>
          <DocParagraph>{t(`${s}.general.whatIsEzioxAnswer`)}</DocParagraph>
        </DocSubSection>

        <DocSubSection title={t(`${s}.general.isFree`)}>
          <DocParagraph>{t(`${s}.general.isFreeAnswer`)}</DocParagraph>
        </DocSubSection>

        <DocSubSection title={t(`${s}.general.vsLinktree`)}>
          <DocList
            items={[
              t(`${s}.general.vsLinktreeFeatures.0`),
              t(`${s}.general.vsLinktreeFeatures.1`),
              t(`${s}.general.vsLinktreeFeatures.2`),
              t(`${s}.general.vsLinktreeFeatures.3`),
            ]}
          />
        </DocSubSection>
      </DocSection>

      <DocSection title={t(`${s}.account.title`)}>
        <DocSubSection title={t(`${s}.account.changeUsername`)}>
          <DocList
            items={[
              t(`${s}.account.changeUsernameSteps.0`),
              t(`${s}.account.changeUsernameSteps.1`),
              t(`${s}.account.changeUsernameSteps.2`),
            ]}
          />
          <DocParagraph>{t(`${s}.account.changeUsernameNote`)}</DocParagraph>
        </DocSubSection>

        <DocSubSection title={t(`${s}.account.deleteAccount`)}>
          <DocList
            items={[
              t(`${s}.account.deleteAccountSteps.0`),
              t(`${s}.account.deleteAccountSteps.1`),
              t(`${s}.account.deleteAccountSteps.2`),
            ]}
          />
          <DocParagraph>{t(`${s}.account.deleteAccountNote`)}</DocParagraph>
        </DocSubSection>

        <DocSubSection title={t(`${s}.account.forgotPassword`)}>
          <DocList
            items={[
              t(`${s}.account.forgotPasswordSteps.0`),
              t(`${s}.account.forgotPasswordSteps.1`),
              t(`${s}.account.forgotPasswordSteps.2`),
              t(`${s}.account.forgotPasswordSteps.3`),
            ]}
          />
        </DocSubSection>

        <DocSubSection title={t(`${s}.account.cantLogin`)}>
          <DocParagraph>{t(`${s}.account.cantLoginIntro`)}</DocParagraph>
          <DocList
            items={[
              t(`${s}.account.cantLoginReasons.0`),
              t(`${s}.account.cantLoginReasons.1`),
              t(`${s}.account.cantLoginReasons.2`),
              t(`${s}.account.cantLoginReasons.3`),
            ]}
          />
        </DocSubSection>
      </DocSection>

      <DocSection title={t(`${s}.links.title`)}>
        <DocSubSection title={t(`${s}.links.howManyLinks`)}>
          <DocParagraph>{t(`${s}.links.howManyLinksAnswer`)}</DocParagraph>
        </DocSubSection>

        <DocSubSection title={t(`${s}.links.reorderLinks`)}>
          <DocParagraph>{t(`${s}.links.reorderLinksAnswer`)}</DocParagraph>
        </DocSubSection>

        <DocSubSection title={t(`${s}.links.scheduleLinks`)}>
          <DocParagraph>{t(`${s}.links.scheduleLinksAnswer`)}</DocParagraph>
        </DocSubSection>

        <DocSubSection title={t(`${s}.links.trackClicks`)}>
          <DocParagraph>{t(`${s}.links.trackClicksIntro`)}</DocParagraph>
          <DocList
            items={[
              t(`${s}.links.trackClicksFeatures.0`),
              t(`${s}.links.trackClicksFeatures.1`),
              t(`${s}.links.trackClicksFeatures.2`),
              t(`${s}.links.trackClicksFeatures.3`),
            ]}
          />
        </DocSubSection>
      </DocSection>

      <DocSection title={t(`${s}.customization.title`)}>
        <DocSubSection title={t(`${s}.customization.changeTheme`)}>
          <DocList
            items={[
              t(`${s}.customization.changeThemeSteps.0`),
              t(`${s}.customization.changeThemeSteps.1`),
              t(`${s}.customization.changeThemeSteps.2`),
              t(`${s}.customization.changeThemeSteps.3`),
            ]}
          />
        </DocSubSection>

        <DocSubSection title={t(`${s}.customization.customColors`)}>
          <DocParagraph>
            {t(`${s}.customization.customColorsAnswer`)}
          </DocParagraph>
        </DocSubSection>

        <DocSubSection title={t(`${s}.customization.customDomain`)}>
          <DocParagraph>
            {t(`${s}.customization.customDomainAnswer`)}
          </DocParagraph>
        </DocSubSection>
      </DocSection>

      <DocSection title={t(`${s}.premium.title`)}>
        <DocSubSection title={t(`${s}.premium.paymentMethods`)}>
          <DocParagraph>{t(`${s}.premium.paymentMethodsIntro`)}</DocParagraph>
          <DocList
            items={[
              t(`${s}.premium.paymentMethodsList.0`),
              t(`${s}.premium.paymentMethodsList.1`),
              t(`${s}.premium.paymentMethodsList.2`),
              t(`${s}.premium.paymentMethodsList.3`),
            ]}
          />
        </DocSubSection>

        <DocSubSection title={t(`${s}.premium.cancelSubscription`)}>
          <DocParagraph>
            {t(`${s}.premium.cancelSubscriptionAnswer`)}
          </DocParagraph>
        </DocSubSection>

        <DocSubSection title={t(`${s}.premium.refunds`)}>
          <DocParagraph>{t(`${s}.premium.refundsAnswer`)}</DocParagraph>
        </DocSubSection>

        <DocSubSection title={t(`${s}.premium.lifetimeIncludes`)}>
          <DocParagraph>{t(`${s}.premium.lifetimeIncludesIntro`)}</DocParagraph>
          <DocList
            items={[
              t(`${s}.premium.lifetimeIncludesList.0`),
              t(`${s}.premium.lifetimeIncludesList.1`),
              t(`${s}.premium.lifetimeIncludesList.2`),
              t(`${s}.premium.lifetimeIncludesList.3`),
            ]}
          />
        </DocSubSection>
      </DocSection>

      <DocSection title={t(`${s}.technical.title`)}>
        <DocSubSection title={t(`${s}.technical.browsers`)}>
          <DocList
            items={[
              t(`${s}.technical.browsersList.0`),
              t(`${s}.technical.browsersList.1`),
              t(`${s}.technical.browsersList.2`),
              t(`${s}.technical.browsersList.3`),
            ]}
          />
        </DocSubSection>

        <DocSubSection title={t(`${s}.technical.mobileApp`)}>
          <DocParagraph>{t(`${s}.technical.mobileAppAnswer`)}</DocParagraph>
        </DocSubSection>

        <DocSubSection title={t(`${s}.technical.hasApi`)}>
          <DocParagraph>
            {t(`${s}.technical.hasApiAnswer`)}{' '}
            <DocLink href="/docs/api">API Documentation</DocLink>.
          </DocParagraph>
        </DocSubSection>
      </DocSection>

      <DocSection title={t(`${s}.support.title`)}>
        <DocSubSection title={t(`${s}.support.contactSupport`)}>
          <DocList
            items={[
              t(`${s}.support.contactSupportOptions.0`),
              t(`${s}.support.contactSupportOptions.1`),
              t(`${s}.support.contactSupportOptions.2`),
            ]}
          />
        </DocSubSection>

        <DocSubSection title={t(`${s}.support.foundBug`)}>
          <DocParagraph>{t(`${s}.support.foundBugIntro`)}</DocParagraph>
          <DocList
            items={[
              t(`${s}.support.foundBugOptions.0`),
              t(`${s}.support.foundBugOptions.1`),
            ]}
          />
        </DocSubSection>

        <DocSubSection title={t(`${s}.support.featureRequest`)}>
          <DocParagraph>{t(`${s}.support.featureRequestIntro`)}</DocParagraph>
          <DocList
            items={[
              t(`${s}.support.featureRequestOptions.0`),
              t(`${s}.support.featureRequestOptions.1`),
            ]}
          />
        </DocSubSection>
      </DocSection>

      <DocSection title={t(`${s}.stillQuestions.title`)}>
        <DocParagraph>
          <DocLink href="/support">{t(`${s}.stillQuestions.text`)}</DocLink>
        </DocParagraph>
      </DocSection>
    </DocsLayout>
  )
}
