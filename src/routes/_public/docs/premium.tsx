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
  DocBlockquote,
} from '@/components/docs/DocsLayout'

export const Route = createFileRoute('/_public/docs/premium')({
  head: () => ({
    meta: [
      { title: 'Premium Features | Docs | Eziox' },
      {
        name: 'description',
        content:
          'Unlock advanced features with Eziox Pro, Creator, and Lifetime plans.',
      },
    ],
  }),
  component: PremiumDoc,
})

function PremiumDoc() {
  return (
    <DocsLayout
      title="Premium Features"
      description="Unlock advanced features with Eziox Pro, Creator, and Lifetime plans."
      category="Features"
      icon="Crown"
    >
      <DocSection title="Philosophy">
        <DocBlockquote>
          Free is fully usable. Paid tiers improve comfort, control, and polish
          — not access.
        </DocBlockquote>
        <DocParagraph>
          Everyone gets the core experience. Premium is about refinement, not
          restriction.
        </DocParagraph>
      </DocSection>

      <DocSection title="Tier Comparison">
        <DocTable
          headers={['Feature', 'Free', 'Pro', 'Creator', 'Lifetime']}
          rows={[
            ['Unlimited Links', '✅', '✅', '✅', '✅'],
            ['All 31+ Themes', '✅', '✅', '✅', '✅'],
            ['All Backgrounds', '✅', '✅', '✅', '✅'],
            ['Media Embeds', '✅', '✅', '✅', '✅'],
            ['Full Analytics', '✅', '✅', '✅', '✅'],
            ['Custom CSS', '❌', '✅', '✅', '✅'],
            ['Custom Fonts', '❌', '✅', '✅', '✅'],
            ['Remove Branding', '❌', '✅', '✅', '✅'],
            ['Profile Backups', '❌', '✅', '✅', '✅'],
            ['Export Analytics', '❌', '✅', '✅', '✅'],
            ['Custom Domain', '❌', '❌', '✅', '✅'],
            ['Password Links', '❌', '❌', '✅', '✅'],
            ['Email Collection', '❌', '❌', '✅', '✅'],
            ['Priority Support', '❌', '❌', '✅', '✅'],
          ]}
        />
      </DocSection>

      <DocSection title="Pricing">
        <DocTable
          headers={['Tier', 'Price', 'Billing']}
          rows={[
            ['Free', '€0', 'Forever'],
            ['Pro', '€2.99', 'Monthly'],
            ['Creator', '€5.99', 'Monthly'],
            ['Lifetime', '€29', 'One-time'],
          ]}
        />
      </DocSection>

      <DocSection title="Free Tier (Eziox Core)">
        <DocParagraph>
          Everything you need to create a beautiful bio page:
        </DocParagraph>
        <DocList
          items={[
            'Unlimited links and short links',
            'All 31+ themes and color schemes',
            'All backgrounds (solid, gradient, image, video, animated)',
            'All animations and effects',
            'Spotify, SoundCloud & YouTube embeds',
            'Social media icons and integrations',
            'Profile picture & banner customization',
            'Full analytics dashboard (30-day retention)',
            'Mobile-optimized responsive design',
          ]}
        />
        <DocParagraph>Limitations:</DocParagraph>
        <DocList
          items={[
            'Subtle "Powered by Eziox" branding',
            'No custom CSS or fonts',
            'No analytics export',
          ]}
        />
      </DocSection>

      <DocSection title="Pro Tier">
        <DocParagraph>
          Essential power features for customization enthusiasts:
        </DocParagraph>

        <DocSubSection title="Custom CSS">
          <DocParagraph>
            Write your own styles to override any element:
          </DocParagraph>
          <DocCode>
            {`/* Make links glow on hover */
.link-card:hover {
  box-shadow: 0 0 30px var(--primary);
}`}
          </DocCode>
        </DocSubSection>

        <DocSubSection title="Other Pro Features">
          <DocList
            items={[
              'Custom Fonts - Upload up to 4 fonts',
              'Remove Branding - Hide the footer link',
              'Profile Backups - Automatic with restore',
              'Export Analytics - CSV or JSON',
              'Pro Badge - Show your support',
            ]}
          />
        </DocSubSection>
      </DocSection>

      <DocSection title="Creator Tier">
        <DocParagraph>Professional toolkit for serious creators:</DocParagraph>

        <DocSubSection title="Custom Domain">
          <DocParagraph>
            Use your own domain (e.g., links.yourdomain.com):
          </DocParagraph>
          <DocList
            items={[
              'Add your domain in Dashboard → Creator',
              'Configure DNS (CNAME to cname.eziox.link)',
              'Wait for SSL certificate (automatic)',
            ]}
          />
        </DocSubSection>

        <DocSubSection title="Other Creator Features">
          <DocList
            items={[
              'Password-Protected Links',
              'Link Expiration',
              'Email Collection with GDPR-compliant forms',
              'Custom Open Graph images',
              'Priority Support',
              'Early Access to new features',
              'Creator Badge',
            ]}
          />
        </DocSubSection>
      </DocSection>

      <DocSection title="Lifetime Tier">
        <DocParagraph>Everything in Creator, forever:</DocParagraph>
        <DocList
          items={[
            'One-time payment - No recurring charges',
            'All future features included',
            'Exclusive Lifetime badge',
            'Priority support forever',
            'Never pay again',
          ]}
        />
      </DocSection>

      <DocSection title="How to Upgrade">
        <DocList
          items={[
            'Go to Pricing',
            'Choose your plan',
            'Complete payment via Stripe',
            'Features activate instantly',
          ]}
        />
        <DocParagraph>
          Ready to upgrade? Visit our{' '}
          <DocLink href="/pricing">Pricing Page</DocLink> to get started.
        </DocParagraph>
      </DocSection>
    </DocsLayout>
  )
}
