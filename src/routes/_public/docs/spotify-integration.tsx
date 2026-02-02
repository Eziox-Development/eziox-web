import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
  DocsLayout,
  DocSection,
  DocSubSection,
  DocParagraph,
  DocList,
  DocLink,
  DocBlockquote,
} from '@/components/docs/DocsLayout'

export const Route = createFileRoute('/_public/docs/spotify-integration')({
  head: () => ({
    meta: [
      { title: 'Spotify Integration | Docs | Eziox' },
      {
        name: 'description',
        content: 'Display your currently playing music on your bio page.',
      },
    ],
  }),
  component: SpotifyDoc,
})

export function SpotifyDoc() {
  const { t } = useTranslation()
  const s = 'docs.pages.spotifyIntegration.sections'

  return (
    <DocsLayout
      title={t('docs.pages.spotifyIntegration.title')}
      description={t('docs.pages.spotifyIntegration.description')}
      category="Integrations"
      icon="Music"
    >
      <DocSection title={t(`${s}.overview.title`)}>
        <DocParagraph>{t(`${s}.overview.intro`)}</DocParagraph>
        <DocList
          items={t(`${s}.overview.features`, { returnObjects: true }) as string[]}
        />
      </DocSection>

      <DocSection title={t(`${s}.setup.title`)}>
        <DocSubSection title={t(`${s}.setup.connect.title`)}>
          <DocList
            items={t(`${s}.setup.connect.steps`, { returnObjects: true }) as string[]}
          />
        </DocSubSection>

        <DocSubSection title={t(`${s}.setup.privacy.title`)}>
          <DocParagraph>{t(`${s}.setup.privacy.intro`)}</DocParagraph>
          <DocList
            items={t(`${s}.setup.privacy.options`, { returnObjects: true }) as string[]}
          />
        </DocSubSection>
      </DocSection>

      <DocSection title={t(`${s}.howItWorks.title`)}>
        <DocSubSection title={t(`${s}.howItWorks.realtime.title`)}>
          <DocParagraph>{t(`${s}.howItWorks.realtime.text`)}</DocParagraph>
        </DocSubSection>

        <DocSubSection title={t(`${s}.howItWorks.tokens.title`)}>
          <DocList
            items={t(`${s}.howItWorks.tokens.items`, { returnObjects: true }) as string[]}
          />
        </DocSubSection>

        <DocSubSection title={t(`${s}.howItWorks.privacy.title`)}>
          <DocList
            items={t(`${s}.howItWorks.privacy.items`, { returnObjects: true }) as string[]}
          />
        </DocSubSection>
      </DocSection>

      <DocSection title={t(`${s}.troubleshooting.title`)}>
        <DocSubSection title={t(`${s}.troubleshooting.notShowing.title`)}>
          <DocList
            items={t(`${s}.troubleshooting.notShowing.items`, { returnObjects: true }) as string[]}
          />
        </DocSubSection>

        <DocSubSection title={t(`${s}.troubleshooting.wrongTrack.title`)}>
          <DocList
            items={t(`${s}.troubleshooting.wrongTrack.items`, { returnObjects: true }) as string[]}
          />
        </DocSubSection>

        <DocSubSection title={t(`${s}.troubleshooting.connection.title`)}>
          <DocList
            items={t(`${s}.troubleshooting.connection.items`, { returnObjects: true }) as string[]}
          />
        </DocSubSection>
      </DocSection>

      <DocSection title={t(`${s}.disconnect.title`)}>
        <DocParagraph>{t(`${s}.disconnect.intro`)}</DocParagraph>
        <DocList
          items={t(`${s}.disconnect.steps`, { returnObjects: true }) as string[]}
        />
        <DocParagraph>
          {t(`${s}.disconnect.revokePrefix`)}{' '}
          <DocLink href="https://www.spotify.com/account/apps/">
            {t(`${s}.disconnect.revokeLink`)}
          </DocLink>
          {t(`${s}.disconnect.revokeSuffix`)}
        </DocParagraph>
      </DocSection>

      <DocSection title={t(`${s}.platforms.title`)}>
        <DocParagraph>{t(`${s}.platforms.intro`)}</DocParagraph>
        <DocList
          items={t(`${s}.platforms.items`, { returnObjects: true }) as string[]}
        />
      </DocSection>

      <DocSection title={t(`${s}.future.title`)}>
        <DocBlockquote type="info">{t(`${s}.future.note`)}</DocBlockquote>
        <DocParagraph>{t(`${s}.future.intro`)}</DocParagraph>
        <DocList
          items={t(`${s}.future.items`, { returnObjects: true }) as string[]}
        />
      </DocSection>
    </DocsLayout>
  )
}
