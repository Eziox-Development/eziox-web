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
} from '@/components/docs/DocsLayout'

export const Route = createFileRoute('/_public/docs/getting-started')({
  head: () => ({
    meta: [
      { title: 'Getting Started | Docs | Eziox' },
      {
        name: 'description',
        content:
          'Learn how to create your Eziox bio page and customize it to your liking.',
      },
    ],
  }),
  component: GettingStartedDoc,
})

export function GettingStartedDoc() {
  const { t } = useTranslation()
  const s = 'docs.pages.gettingStarted.sections'

  return (
    <DocsLayout
      title={t('docs.pages.gettingStarted.title')}
      description={t('docs.pages.gettingStarted.description')}
      category="Basics"
      icon="Rocket"
    >
      <DocSection title={t(`${s}.account.title`)}>
        <DocParagraph>{t(`${s}.account.intro`)}</DocParagraph>
        <DocList
          items={[
            t(`${s}.account.steps.0`),
            t(`${s}.account.steps.1`),
            t(`${s}.account.steps.2`),
            t(`${s}.account.steps.3`),
          ]}
        />
      </DocSection>

      <DocSection title={t(`${s}.profile.title`)}>
        <DocParagraph>
          {t(`${s}.profile.intro`)}{' '}
          <DocLink href="/profile">Dashboard</DocLink>
        </DocParagraph>

        <DocSubSection title={t(`${s}.profile.basicTitle`)}>
          <DocList
            items={[
              t(`${s}.profile.basicList.0`),
              t(`${s}.profile.basicList.1`),
              t(`${s}.profile.basicList.2`),
              t(`${s}.profile.basicList.3`),
            ]}
          />
        </DocSubSection>

        <DocSubSection title={t(`${s}.profile.socialTitle`)}>
          <DocParagraph>{t(`${s}.profile.socialIntro`)}</DocParagraph>
          <DocList
            items={[
              t(`${s}.profile.socialList.0`),
              t(`${s}.profile.socialList.1`),
              t(`${s}.profile.socialList.2`),
              t(`${s}.profile.socialList.3`),
              t(`${s}.profile.socialList.4`),
              t(`${s}.profile.socialList.5`),
              t(`${s}.profile.socialList.6`),
              t(`${s}.profile.socialList.7`),
            ]}
          />
        </DocSubSection>
      </DocSection>

      <DocSection title={t(`${s}.links.title`)}>
        <DocParagraph>{t(`${s}.links.intro`)}</DocParagraph>
        <DocList
          items={[
            t(`${s}.links.steps.0`),
            t(`${s}.links.steps.1`),
            t(`${s}.links.steps.2`),
            t(`${s}.links.steps.3`),
          ]}
        />

        <DocSubSection title={t(`${s}.links.featuresTitle`)}>
          <DocList
            items={[
              t(`${s}.links.featuresList.0`),
              t(`${s}.links.featuresList.1`),
              t(`${s}.links.featuresList.2`),
              t(`${s}.links.featuresList.3`),
            ]}
          />
        </DocSubSection>
      </DocSection>

      <DocSection title={t(`${s}.widgets.title`)}>
        <DocParagraph>{t(`${s}.widgets.intro`)}</DocParagraph>
        <DocList
          items={[
            t(`${s}.widgets.steps.0`),
            t(`${s}.widgets.steps.1`),
            t(`${s}.widgets.steps.2`),
            t(`${s}.widgets.steps.3`),
          ]}
        />
        <DocSubSection title={t(`${s}.widgets.typesTitle`)}>
          <DocList
            items={[
              t(`${s}.widgets.typesList.0`),
              t(`${s}.widgets.typesList.1`),
              t(`${s}.widgets.typesList.2`),
              t(`${s}.widgets.typesList.3`),
              t(`${s}.widgets.typesList.4`),
              t(`${s}.widgets.typesList.5`),
            ]}
          />
        </DocSubSection>
      </DocSection>

      <DocSection title={t(`${s}.themes.title`)}>
        <DocParagraph>{t(`${s}.themes.intro`)}</DocParagraph>
        <DocTable
          headers={[
            t(`${s}.themes.tableHeaders.0`),
            t(`${s}.themes.tableHeaders.1`),
          ]}
          rows={t(`${s}.themes.tableRows`, { returnObjects: true }) as [
            string,
            string,
          ][]}
        />
        <DocSubSection title={t(`${s}.themes.changeTitle`)}>
          <DocList
            items={[
              t(`${s}.themes.changeSteps.0`),
              t(`${s}.themes.changeSteps.1`),
              t(`${s}.themes.changeSteps.2`),
              t(`${s}.themes.changeSteps.3`),
            ]}
          />
        </DocSubSection>
      </DocSection>

      <DocSection title={t(`${s}.next.title`)}>
        <DocList
          items={[
            t(`${s}.next.items.0`),
            t(`${s}.next.items.1`),
            t(`${s}.next.items.2`),
            t(`${s}.next.items.3`),
          ]}
        />
        <DocParagraph>
          {t(`${s}.next.helpPrefix`)}{' '}
          <DocLink href="/contact">{t(`${s}.next.contactLabel`)}</DocLink>{' '}
          {t(`${s}.next.helpInfix`)}{' '}
          <DocLink href="/docs/faq">{t(`${s}.next.faqLabel`)}</DocLink>{' '}
          {t(`${s}.next.helpSuffix`)}
        </DocParagraph>
      </DocSection>
    </DocsLayout>
  )
}
