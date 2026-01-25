import { createFileRoute } from '@tanstack/react-router'
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

function FaqDoc() {
  return (
    <DocsLayout
      title="FAQ"
      description="Frequently asked questions about Eziox."
      category="Support"
      icon="HelpCircle"
    >
      <DocSection title="General">
        <DocSubSection title="What is Eziox?">
          <DocParagraph>
            Eziox is a modern bio link platform that lets you create a
            personalized page with all your important links in one place. Share
            one link instead of many.
          </DocParagraph>
        </DocSubSection>

        <DocSubSection title="Is Eziox free?">
          <DocParagraph>
            Yes! Eziox Core is completely free with unlimited links, all themes,
            full analytics, and more. Premium tiers offer additional
            customization options.
          </DocParagraph>
        </DocSubSection>

        <DocSubSection title="How is Eziox different from Linktree?">
          <DocList
            items={[
              'No paywalls on core features - All themes and analytics are free',
              'Modern design - 31+ themes with animated backgrounds',
              'Better privacy - No third-party tracking, GDPR compliant',
              'Open development - Transparent about our features and roadmap',
            ]}
          />
        </DocSubSection>
      </DocSection>

      <DocSection title="Account">
        <DocSubSection title="How do I change my username?">
          <DocList
            items={[
              'Go to Dashboard → Profile',
              'Edit the Username field',
              'Click Save Changes',
            ]}
          />
          <DocParagraph>
            Note: Your old username becomes available for others immediately.
          </DocParagraph>
        </DocSubSection>

        <DocSubSection title="How do I delete my account?">
          <DocList
            items={[
              'Go to Dashboard → Settings → Danger Zone',
              'Click Delete Account',
              'Confirm with your password',
            ]}
          />
          <DocParagraph>
            All your data will be permanently deleted within 30 days.
          </DocParagraph>
        </DocSubSection>

        <DocSubSection title="I forgot my password">
          <DocList
            items={[
              'Go to Sign In',
              'Click Forgot Password',
              'Enter your email address',
              'Check your inbox for a reset link',
            ]}
          />
        </DocSubSection>

        <DocSubSection title="Why can't I log in?">
          <DocParagraph>Common reasons:</DocParagraph>
          <DocList
            items={[
              'Wrong password - Try the password reset',
              'Account locked - Wait 30 minutes after 5 failed attempts',
              '2FA required - Enter your authenticator code',
              'Email not verified - Check your inbox for verification email',
            ]}
          />
        </DocSubSection>
      </DocSection>

      <DocSection title="Links">
        <DocSubSection title="How many links can I add?">
          <DocParagraph>
            Unlimited! There's no limit on the number of links.
          </DocParagraph>
        </DocSubSection>

        <DocSubSection title="Can I reorder my links?">
          <DocParagraph>
            Yes! Drag and drop links in the Dashboard to reorder them.
          </DocParagraph>
        </DocSubSection>

        <DocSubSection title="Can I schedule links?">
          <DocParagraph>
            Yes! Set start and end dates for links to appear/disappear
            automatically. Available for all users.
          </DocParagraph>
        </DocSubSection>

        <DocSubSection title="Can I track link clicks?">
          <DocParagraph>
            Yes! Every link has detailed analytics including:
          </DocParagraph>
          <DocList
            items={[
              'Total clicks',
              'Device breakdown',
              'Geographic data',
              'Click heatmap by hour',
            ]}
          />
        </DocSubSection>
      </DocSection>

      <DocSection title="Customization">
        <DocSubSection title="How do I change my theme?">
          <DocList
            items={[
              'Go to Dashboard → Customization',
              'Browse the theme gallery',
              'Click a theme to preview',
              'Click Apply to save',
            ]}
          />
        </DocSubSection>

        <DocSubSection title="Can I use custom colors?">
          <DocParagraph>
            Yes! Use the Theme Builder to create custom color schemes, or use
            Custom CSS (Pro+) for full control.
          </DocParagraph>
        </DocSubSection>

        <DocSubSection title="Can I use my own domain?">
          <DocParagraph>
            Yes, with Creator tier! Add your domain in Dashboard → Creator and
            configure DNS.
          </DocParagraph>
        </DocSubSection>
      </DocSection>

      <DocSection title="Premium">
        <DocSubSection title="What payment methods do you accept?">
          <DocParagraph>
            We accept all major credit cards via Stripe:
          </DocParagraph>
          <DocList items={['Visa', 'Mastercard', 'American Express', 'And more']} />
        </DocSubSection>

        <DocSubSection title="Can I cancel my subscription?">
          <DocParagraph>
            Yes, cancel anytime from Dashboard → Subscription. You'll keep
            access until the end of your billing period.
          </DocParagraph>
        </DocSubSection>

        <DocSubSection title="Do you offer refunds?">
          <DocParagraph>
            We offer a 7-day money-back guarantee for first-time subscribers.
            Contact support@eziox.link.
          </DocParagraph>
        </DocSubSection>

        <DocSubSection title="What's included in Lifetime?">
          <DocParagraph>Everything in Creator tier, forever:</DocParagraph>
          <DocList
            items={[
              'All current features',
              'All future features',
              'No recurring payments',
              'Exclusive Lifetime badge',
            ]}
          />
        </DocSubSection>
      </DocSection>

      <DocSection title="Technical">
        <DocSubSection title="What browsers are supported?">
          <DocList
            items={['Chrome 90+', 'Firefox 90+', 'Safari 14+', 'Edge 90+']}
          />
        </DocSubSection>

        <DocSubSection title="Is there a mobile app?">
          <DocParagraph>
            Not yet, but our website is fully mobile-optimized. A PWA is planned
            for the future.
          </DocParagraph>
        </DocSubSection>

        <DocSubSection title="Do you have an API?">
          <DocParagraph>
            Yes! Generate API keys in Dashboard → API Access. See our{' '}
            <DocLink href="/docs/api">API Documentation</DocLink>.
          </DocParagraph>
        </DocSubSection>
      </DocSection>

      <DocSection title="Support">
        <DocSubSection title="How do I contact support?">
          <DocList
            items={[
              'Email: support@eziox.link',
              'Contact Form: eziox.link/contact',
              'Discord: Coming soon',
            ]}
          />
        </DocSubSection>

        <DocSubSection title="I found a bug!">
          <DocParagraph>Report bugs via:</DocParagraph>
          <DocList
            items={[
              'GitHub Issues: github.com/Eziox-Development',
              'Email: bugs@eziox.link',
            ]}
          />
        </DocSubSection>

        <DocSubSection title="I have a feature request">
          <DocParagraph>We love feedback! Submit feature requests via:</DocParagraph>
          <DocList items={['GitHub Discussions', 'Email: feedback@eziox.link']} />
        </DocSubSection>
      </DocSection>

      <DocSection title="Still have questions?">
        <DocParagraph>
          <DocLink href="/contact">Contact us</DocLink> and we'll be happy to
          help!
        </DocParagraph>
      </DocSection>
    </DocsLayout>
  )
}
