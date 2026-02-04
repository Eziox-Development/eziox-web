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

export const Route = createFileRoute('/_public/docs/customization')({
  head: () => ({
    meta: [
      { title: 'Customization | Docs | Eziox' },
      {
        name: 'description',
        content: 'Advanced styling options to make your bio page unique.',
      },
    ],
  }),
  component: CustomizationDoc,
})

export function CustomizationDoc() {
  const { t } = useTranslation()
  const s = 'docs.pages.customization.sections'

  return (
    <DocsLayout
      title={t('docs.pages.customization.title')}
      description={t('docs.pages.customization.description')}
      category="Basics"
      icon="Palette"
    >
      <DocSection title={t(`${s}.themes.title`)}>
        <DocSubSection title={t(`${s}.themes.builtIn`)}>
          <DocParagraph>{t(`${s}.themes.builtInIntro`)}</DocParagraph>
          <DocList
            items={[
              t(`${s}.themes.builtInFeatures.0`),
              t(`${s}.themes.builtInFeatures.1`),
              t(`${s}.themes.builtInFeatures.2`),
            ]}
          />
        </DocSubSection>

        <DocSubSection title={t(`${s}.themes.categories`)}>
          <DocList
            items={[
              t(`${s}.themes.categoriesList.0`),
              t(`${s}.themes.categoriesList.1`),
              t(`${s}.themes.categoriesList.2`),
              t(`${s}.themes.categoriesList.3`),
              t(`${s}.themes.categoriesList.4`),
              t(`${s}.themes.categoriesList.5`),
              t(`${s}.themes.categoriesList.6`),
              t(`${s}.themes.categoriesList.7`),
            ]}
          />
        </DocSubSection>
      </DocSection>

      <DocSection title={t(`${s}.themeBuilder.title`)}>
        <DocParagraph>{t(`${s}.themeBuilder.intro`)}</DocParagraph>

        <DocSubSection title={t(`${s}.themeBuilder.limits`)}>
          <DocParagraph>{t(`${s}.themeBuilder.limitsIntro`)}</DocParagraph>
          <DocTable
            headers={['Tier', 'Custom Themes']}
            rows={[
              ['Free', '1'],
              ['Pro', '5'],
              ['Creator', '10'],
              ['Lifetime', '10'],
            ]}
          />
        </DocSubSection>

        <DocSubSection title={t(`${s}.themeBuilder.presets`)}>
          <DocParagraph>{t(`${s}.themeBuilder.presetsIntro`)}</DocParagraph>
          <DocList
            items={[
              t(`${s}.themeBuilder.presetsList.0`),
              t(`${s}.themeBuilder.presetsList.1`),
              t(`${s}.themeBuilder.presetsList.2`),
              t(`${s}.themeBuilder.presetsList.3`),
              t(`${s}.themeBuilder.presetsList.4`),
              t(`${s}.themeBuilder.presetsList.5`),
              t(`${s}.themeBuilder.presetsList.6`),
              t(`${s}.themeBuilder.presetsList.7`),
            ]}
          />
        </DocSubSection>

        <DocSubSection title={t(`${s}.themeBuilder.colors`)}>
          <DocList
            items={[
              t(`${s}.themeBuilder.colorsList.0`),
              t(`${s}.themeBuilder.colorsList.1`),
              t(`${s}.themeBuilder.colorsList.2`),
              t(`${s}.themeBuilder.colorsList.3`),
            ]}
          />
        </DocSubSection>

        <DocSubSection title={t(`${s}.themeBuilder.fonts`)}>
          <DocList
            items={[
              t(`${s}.themeBuilder.fontsList.0`),
              t(`${s}.themeBuilder.fontsList.1`),
              t(`${s}.themeBuilder.fontsList.2`),
              t(`${s}.themeBuilder.fontsList.3`),
              t(`${s}.themeBuilder.fontsList.4`),
              t(`${s}.themeBuilder.fontsList.5`),
              t(`${s}.themeBuilder.fontsList.6`),
              t(`${s}.themeBuilder.fontsList.7`),
            ]}
          />
        </DocSubSection>
      </DocSection>

      <DocSection title={t(`${s}.effects.title`)}>
        <DocSubSection title={t(`${s}.effects.glowIntensity`)}>
          <DocList
            items={[
              t(`${s}.effects.glowOptions.0`),
              t(`${s}.effects.glowOptions.1`),
              t(`${s}.effects.glowOptions.2`),
              t(`${s}.effects.glowOptions.3`),
            ]}
          />
        </DocSubSection>

        <DocSubSection title={t(`${s}.effects.borderRadius`)}>
          <DocList
            items={[
              t(`${s}.effects.borderRadiusOptions.0`),
              t(`${s}.effects.borderRadiusOptions.1`),
              t(`${s}.effects.borderRadiusOptions.2`),
            ]}
          />
        </DocSubSection>

        <DocSubSection title={t(`${s}.effects.cardStyle`)}>
          <DocList
            items={[
              t(`${s}.effects.cardStyleOptions.0`),
              t(`${s}.effects.cardStyleOptions.1`),
              t(`${s}.effects.cardStyleOptions.2`),
              t(`${s}.effects.cardStyleOptions.3`),
            ]}
          />
        </DocSubSection>
      </DocSection>

      <DocSection title={t(`${s}.backgrounds.title`)}>
        <DocSubSection title={t(`${s}.backgrounds.types`)}>
          <DocTable
            headers={['Type', 'Description', 'Tier']}
            rows={[
              [
                t(`${s}.backgrounds.typesTable.0.0`),
                t(`${s}.backgrounds.typesTable.0.1`),
                t(`${s}.backgrounds.typesTable.0.2`),
              ],
              [
                t(`${s}.backgrounds.typesTable.1.0`),
                t(`${s}.backgrounds.typesTable.1.1`),
                t(`${s}.backgrounds.typesTable.1.2`),
              ],
              [
                t(`${s}.backgrounds.typesTable.2.0`),
                t(`${s}.backgrounds.typesTable.2.1`),
                t(`${s}.backgrounds.typesTable.2.2`),
              ],
              [
                t(`${s}.backgrounds.typesTable.3.0`),
                t(`${s}.backgrounds.typesTable.3.1`),
                t(`${s}.backgrounds.typesTable.3.2`),
              ],
              [
                t(`${s}.backgrounds.typesTable.4.0`),
                t(`${s}.backgrounds.typesTable.4.1`),
                t(`${s}.backgrounds.typesTable.4.2`),
              ],
            ]}
          />
        </DocSubSection>

        <DocSubSection title={t(`${s}.backgrounds.animated`)}>
          <DocParagraph>{t(`${s}.backgrounds.animatedIntro`)}</DocParagraph>
          <DocList
            items={[
              t(`${s}.backgrounds.animatedCategories.0`),
              t(`${s}.backgrounds.animatedCategories.1`),
              t(`${s}.backgrounds.animatedCategories.2`),
              t(`${s}.backgrounds.animatedCategories.3`),
              t(`${s}.backgrounds.animatedCategories.4`),
            ]}
          />
        </DocSubSection>
      </DocSection>

      <DocSection title={t(`${s}.bestPractices.title`)}>
        <DocList
          items={[
            t(`${s}.bestPractices.tips.0`),
            t(`${s}.bestPractices.tips.1`),
            t(`${s}.bestPractices.tips.2`),
            t(`${s}.bestPractices.tips.3`),
          ]}
        />
        <DocParagraph>
          {t(`${s}.bestPractices.inspiration`).split('Templates Gallery')[0]}
          <DocLink href="/templates">Templates Gallery</DocLink>
          {t(`${s}.bestPractices.inspiration`).split('Templates Gallery')[1] ||
            '.'}
        </DocParagraph>
      </DocSection>
    </DocsLayout>
  )
}
