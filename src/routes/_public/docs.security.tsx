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

function SecurityDoc() {
  return (
    <DocsLayout
      title="Security"
      description="Learn about Eziox's security features and best practices."
      category="Account"
      icon="Shield"
    >
      <DocSection title="Account Security">
        <DocSubSection title="Strong Passwords">
          <DocParagraph>We enforce password requirements:</DocParagraph>
          <DocList
            items={[
              'Minimum 8 characters',
              'At least one uppercase letter',
              'At least one lowercase letter',
              'At least one number',
            ]}
          />
        </DocSubSection>

        <DocSubSection title="Two-Factor Authentication (2FA)">
          <DocParagraph>
            Add an extra layer of security with TOTP-based 2FA:
          </DocParagraph>
          <DocList
            items={[
              'Go to Dashboard → Settings → Security',
              'Click Enable 2FA',
              'Scan the QR code with your authenticator app',
              'Enter the 6-digit code to confirm',
            ]}
          />
          <DocParagraph>Supported Apps:</DocParagraph>
          <DocList
            items={['Google Authenticator', 'Authy', '1Password', 'Bitwarden']}
          />
        </DocSubSection>

        <DocSubSection title="Recovery Codes">
          <DocParagraph>
            When you enable 2FA, you'll receive 10 recovery codes:
          </DocParagraph>
          <DocList
            items={[
              'Each code can only be used once',
              'Store them in a safe place',
              'Use them if you lose access to your authenticator',
              'Regenerate codes anytime from Settings',
            ]}
          />
        </DocSubSection>
      </DocSection>

      <DocSection title="Data Protection">
        <DocSubSection title="Encryption">
          <DocList
            items={[
              'Passwords - Hashed with bcrypt (cost factor 12)',
              'Sessions - 64-character cryptographically secure tokens',
              'OAuth Tokens - Encrypted with AES-256-GCM',
              '2FA Secrets - Encrypted at rest',
            ]}
          />
        </DocSubSection>

        <DocSubSection title="Secure Cookies">
          <DocList
            items={[
              'HTTP-Only - Prevents JavaScript access (XSS protection)',
              'Secure Flag - Only sent over HTTPS',
              'SameSite=Lax - CSRF protection',
            ]}
          />
        </DocSubSection>

        <DocSubSection title="IP Anonymization">
          <DocParagraph>
            We anonymize IP addresses for GDPR compliance:
          </DocParagraph>
          <DocList
            items={[
              'Last octet zeroed (e.g., 192.168.1.x)',
              'Full IPs never stored in analytics',
              'Hashed IPs used for session security',
            ]}
          />
        </DocSubSection>
      </DocSection>

      <DocSection title="Bot Protection">
        <DocSubSection title="Cloudflare Turnstile">
          <DocParagraph>
            We use Cloudflare Turnstile for invisible bot protection:
          </DocParagraph>
          <DocList
            items={[
              'No annoying CAPTCHAs',
              'Protects sign-up, sign-in, and password reset',
              'Privacy-preserving verification',
            ]}
          />
        </DocSubSection>

        <DocSubSection title="Rate Limiting">
          <DocParagraph>We limit requests to prevent abuse:</DocParagraph>
          <DocTable
            headers={['Endpoint', 'Limit']}
            rows={[
              ['Login attempts', '5 per 30 minutes'],
              ['Password reset', '3 per hour'],
              ['API requests', '1,000-10,000 per hour'],
              ['File uploads', '10 per minute'],
            ]}
          />
        </DocSubSection>
      </DocSection>

      <DocSection title="Privacy Controls">
        <DocSubSection title="Data Export">
          <DocParagraph>Download all your data anytime:</DocParagraph>
          <DocList
            items={[
              'Go to Dashboard → Settings → Privacy & Data',
              'Click Export My Data',
              'Receive a JSON file with all your information',
            ]}
          />
        </DocSubSection>

        <DocSubSection title="Account Deletion">
          <DocParagraph>Permanently delete your account:</DocParagraph>
          <DocList
            items={[
              'Go to Dashboard → Settings → Danger Zone',
              'Click Delete Account',
              'Confirm with your password',
              'All data deleted within 30 days',
            ]}
          />
        </DocSubSection>
      </DocSection>

      <DocSection title="Best Practices">
        <DocSubSection title="Do's">
          <DocList
            items={[
              '✅ Use a unique, strong password',
              '✅ Enable two-factor authentication',
              '✅ Keep recovery codes in a safe place',
              '✅ Review login notifications',
              '✅ Sign out on shared devices',
            ]}
          />
        </DocSubSection>

        <DocSubSection title="Don'ts">
          <DocList
            items={[
              '❌ Share your password with anyone',
              '❌ Use the same password on multiple sites',
              '❌ Click suspicious links in emails',
              '❌ Ignore login notifications',
              '❌ Store passwords in plain text',
            ]}
          />
        </DocSubSection>
      </DocSection>

      <DocSection title="Reporting Security Issues">
        <DocParagraph>Found a vulnerability? Contact us:</DocParagraph>
        <DocList
          items={[
            'Email: security@eziox.link',
            'Response Time: Within 48 hours',
          ]}
        />
        <DocParagraph>
          We appreciate responsible disclosure and may offer recognition for
          valid reports.
        </DocParagraph>
      </DocSection>

      <DocSection title="Compliance">
        <DocSubSection title="GDPR">
          <DocList
            items={[
              'Data minimization',
              'Right to access and deletion',
              'IP anonymization',
              'Consent-based processing',
            ]}
          />
        </DocSubSection>
        <DocParagraph>
          Questions about security? Contact us at{' '}
          <DocLink href="mailto:security@eziox.link">
            security@eziox.link
          </DocLink>
          .
        </DocParagraph>
      </DocSection>
    </DocsLayout>
  )
}
