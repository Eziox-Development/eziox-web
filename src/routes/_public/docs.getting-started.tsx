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

function GettingStartedDoc() {
  return (
    <DocsLayout
      title="Getting Started"
      description="Learn how to create your Eziox bio page and customize it to your liking."
      category="Basics"
      icon="Rocket"
    >
      <DocSection title="Creating Your Account">
        <DocParagraph>
          Welcome to Eziox! This guide will help you create your personalized
          bio page in just a few minutes.
        </DocParagraph>
        <DocList
          items={[
            'Visit eziox.link/sign-up to create your account',
            'Enter your email address and choose a secure password',
            'Pick a unique username - this will be your bio page URL (eziox.link/yourusername)',
            'Verify your email address by clicking the link we send you',
          ]}
        />
      </DocSection>

      <DocSection title="Setting Up Your Profile">
        <DocParagraph>
          Once you're logged in, head to your{' '}
          <DocLink href="/profile">Dashboard</DocLink> to customize your
          profile.
        </DocParagraph>

        <DocSubSection title="Basic Information">
          <DocList
            items={[
              'Display Name - Your public name shown on your bio page',
              'Bio - A short description about yourself (max 160 characters)',
              'Avatar - Upload a profile picture (recommended: 400x400px)',
              'Banner - Add a header image (recommended: 1200x400px)',
            ]}
          />
        </DocSubSection>

        <DocSubSection title="Social Links">
          <DocParagraph>Connect your social media accounts:</DocParagraph>
          <DocList
            items={[
              'Twitter/X',
              'Instagram',
              'YouTube',
              'TikTok',
              'Twitch',
              'Discord',
              'GitHub',
              'LinkedIn',
            ]}
          />
        </DocSubSection>
      </DocSection>

      <DocSection title="Adding Links">
        <DocParagraph>
          Your bio page can contain unlimited links. To add a link:
        </DocParagraph>
        <DocList
          items={[
            'Go to Dashboard → Links',
            'Click Add Link',
            'Enter the URL and a title',
            'Optionally add an icon and description',
            'Drag to reorder your links',
          ]}
        />

        <DocSubSection title="Link Features">
          <DocList
            items={[
              'Thumbnails - Add custom images to your links',
              'Scheduling - Set start/end dates for time-limited links',
              'Analytics - Track clicks on each link',
              'Featured - Highlight important links with special styles',
            ]}
          />
        </DocSubSection>
      </DocSection>

      <DocSection title="Choosing a Theme">
        <DocParagraph>
          Eziox offers 31+ themes across 8 categories:
        </DocParagraph>
        <DocTable
          headers={['Category', 'Themes']}
          rows={[
            ['General', 'eziox-default, obsidian, midnight, ember'],
            ['Gamer', 'neon-green, rgb-fusion, cyberpunk'],
            ['VTuber', 'kawaii-pink, pastel-dream, anime-night'],
            ['Developer', 'terminal, github-dark, vscode'],
            ['Streamer', 'twitch, youtube, kick'],
            ['Artist', 'canvas, watercolor, gallery'],
            ['Minimal', 'minimal-dark, minimal-light, aurora'],
            ['Premium', 'ocean-depths, forest-night, neon-tokyo'],
          ]}
        />
        <DocParagraph>To change your theme:</DocParagraph>
        <DocList
          items={[
            'Go to Dashboard → Customization',
            'Browse the theme gallery',
            'Click on a theme to preview it',
            'Click Apply to save',
          ]}
        />
      </DocSection>

      <DocSection title="Next Steps">
        <DocList
          items={[
            'Customize Your Profile - Advanced styling options',
            'Link Analytics - Track your performance',
            'API Access - Integrate with external tools',
            'Premium Features - Unlock advanced features',
          ]}
        />
        <DocParagraph>
          Need help? Visit our <DocLink href="/contact">Contact Page</DocLink>{' '}
          or check out the <DocLink href="/docs/faq">FAQ</DocLink>.
        </DocParagraph>
      </DocSection>
    </DocsLayout>
  )
}
