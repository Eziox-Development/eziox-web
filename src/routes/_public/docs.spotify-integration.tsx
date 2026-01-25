import { createFileRoute } from '@tanstack/react-router'
import {
  DocsLayout,
  DocSection,
  DocSubSection,
  DocParagraph,
  DocList,
  DocLink,
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

function SpotifyDoc() {
  return (
    <DocsLayout
      title="Spotify Integration"
      description="Display your currently playing music on your bio page."
      category="Integrations"
      icon="Music"
    >
      <DocSection title="Overview">
        <DocParagraph>
          The Spotify integration displays a "Now Playing" widget on your bio
          page with:
        </DocParagraph>
        <DocList
          items={[
            'Album artwork with blur background',
            'Song title and artist name',
            'Live progress bar',
            'Direct link to the track on Spotify',
            '"Not listening" state when offline',
          ]}
        />
      </DocSection>

      <DocSection title="Setup">
        <DocSubSection title="Step 1: Connect Your Account">
          <DocList
            items={[
              'Go to Dashboard → Settings',
              'Find the Spotify section',
              'Click Connect Spotify',
              'Authorize Eziox to access your listening activity',
            ]}
          />
        </DocSubSection>

        <DocSubSection title="Step 2: Configure Privacy">
          <DocParagraph>
            After connecting, you can control visibility:
          </DocParagraph>
          <DocList
            items={[
              'Show on Profile - Toggle to show/hide the widget',
              'Show When Offline - Display "Not listening" or hide completely',
            ]}
          />
        </DocSubSection>
      </DocSection>

      <DocSection title="How It Works">
        <DocSubSection title="Real-Time Updates">
          <DocParagraph>
            The widget refreshes every 10 seconds to show your current track.
          </DocParagraph>
        </DocSubSection>

        <DocSubSection title="Token Management">
          <DocList
            items={[
              'We securely store your Spotify tokens (encrypted with AES-256-GCM)',
              'Tokens auto-refresh when expired',
              'You can disconnect anytime',
            ]}
          />
        </DocSubSection>

        <DocSubSection title="Privacy">
          <DocList
            items={[
              'We only access your "currently playing" data',
              "We don't access your playlists, saved tracks, or listening history",
              'Your Spotify data is never shared with third parties',
            ]}
          />
        </DocSubSection>
      </DocSection>

      <DocSection title="Troubleshooting">
        <DocSubSection title="Widget Not Showing">
          <DocList
            items={[
              'Check that Spotify is connected in Settings',
              'Ensure "Show on Profile" is enabled',
              "Make sure you're actively playing music (not paused)",
            ]}
          />
        </DocSubSection>

        <DocSubSection title="Wrong Track Showing">
          <DocList
            items={[
              'The widget updates every 10 seconds',
              'Try refreshing the page',
              "Check if you're playing on the correct device",
            ]}
          />
        </DocSubSection>

        <DocSubSection title="Connection Issues">
          <DocList
            items={[
              'Disconnect Spotify in Settings',
              'Clear your browser cache',
              'Reconnect your account',
            ]}
          />
        </DocSubSection>
      </DocSection>

      <DocSection title="Disconnect">
        <DocParagraph>To remove the Spotify integration:</DocParagraph>
        <DocList
          items={[
            'Go to Dashboard → Settings',
            'Click Disconnect in the Spotify section',
            'Your tokens are immediately deleted',
          ]}
        />
        <DocParagraph>
          You can also revoke access from{' '}
          <DocLink href="https://www.spotify.com/account/apps/">
            Spotify Account Settings
          </DocLink>
          .
        </DocParagraph>
      </DocSection>

      <DocSection title="Supported Platforms">
        <DocParagraph>The integration works with:</DocParagraph>
        <DocList
          items={[
            'Spotify Desktop App',
            'Spotify Web Player',
            'Spotify Mobile App',
            'Spotify on smart speakers (limited)',
          ]}
        />
      </DocSection>

      <DocSection title="Future Features">
        <DocParagraph>Coming soon:</DocParagraph>
        <DocList
          items={[
            'Recently played tracks',
            'Top artists/tracks display',
            'Playlist embeds',
            'Apple Music integration',
          ]}
        />
      </DocSection>
    </DocsLayout>
  )
}
