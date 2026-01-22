import { createFileRoute } from '@tanstack/react-router'
import {
  Shield,
  Lock,
  Eye,
  Database,
  Cookie,
  Mail,
  Globe,
  UserCheck,
  FileText,
  AlertCircle,
  Calendar,
} from 'lucide-react'
import {
  LegalPageLayout,
  type LegalSection,
  type RelatedLink,
} from '@/components/legal/LegalPageLayout'

export const Route = createFileRoute('/_public/privacy')({
  head: () => ({
    meta: [
      { title: 'Privacy Policy | Eziox' },
      {
        name: 'description',
        content:
          'Privacy Policy for Eziox - Learn how we collect, use, and protect your data.',
      },
    ],
  }),
  component: PrivacyPage,
})

const LAST_UPDATED = 'January 21, 2026'
const ACCENT_COLOR = '#14b8a6'

const SECTIONS: LegalSection[] = [
  {
    id: 'introduction',
    title: 'Introduction',
    icon: Shield,
    content: `Welcome to Eziox ("we," "our," or "us"). We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our bio link platform at eziox.link (the "Service").

By using our Service, you agree to the collection and use of information in accordance with this policy. If you do not agree with the terms of this Privacy Policy, please do not access the Service.`,
  },
  {
    id: 'data-collection',
    title: 'Information We Collect',
    icon: Database,
    content: `We collect several types of information to provide and improve our Service:

**Personal Information:**
• Email address (for account creation and communication)
• Username and display name
• Profile information (bio, avatar, banner, location, pronouns)
• Social media links you choose to add
• Birthday (optional, for age verification)

**Usage Data:**
• Profile views and link click statistics
• **Anonymized IP address** (last octet zeroed for GDPR compliance, e.g., 192.168.1.x)
• Browser name and version (e.g., "Chrome 120", "Firefox 121", "Brave", "Arc")
• Operating system (e.g., "Windows 11", "macOS", "iOS", "Android")
• Device type (Desktop, Mobile, Tablet)
• Referral sources (where visitors came from)

**Cookies and Tracking:**
• Session cookies for authentication
• Preference cookies for theme settings
• Analytics data (anonymized)

We do NOT collect:
• Full IP addresses (always anonymized before storage)
• Payment card details (handled securely by Stripe)
• Sensitive personal data (race, religion, political views)
• Data from minors under 13 years of age`,
  },
  {
    id: 'data-use',
    title: 'How We Use Your Information',
    icon: Eye,
    content: `We use the collected information for various purposes:

**Service Provision:**
• Create and manage your account
• Display your bio link page to visitors
• Track profile views and link clicks
• Enable social features (followers, leaderboard)

**Communication:**
• Send important account notifications
• Respond to your inquiries and support requests
• Send updates about new features (with your consent)

**Improvement:**
• Analyze usage patterns to improve the Service
• Debug and fix technical issues
• Develop new features based on user needs

**Security:**
• Detect and prevent fraud or abuse
• Protect against unauthorized access
• Enforce our Terms of Service`,
  },
  {
    id: 'data-sharing',
    title: 'Information Sharing',
    icon: UserCheck,
    content: `We do NOT sell your personal information. We may share your information only in the following circumstances:

**Public Profile Data:**
• Your username, display name, bio, avatar, and links are publicly visible on your bio page
• Profile statistics may be shown on the leaderboard (if you opt-in)

**Service Providers:**
• We use Neon (PostgreSQL) for database hosting
• We use Vercel/Netlify for web hosting
• These providers are bound by strict data protection agreements

**Legal Requirements:**
• We may disclose information if required by law
• To protect our rights, privacy, safety, or property
• To respond to lawful requests from public authorities

**Business Transfers:**
• In the event of a merger, acquisition, or sale of assets, your information may be transferred`,
  },
  {
    id: 'data-security',
    title: 'Data Security',
    icon: Lock,
    content: `We implement industry-standard security measures to protect your data:

**Technical Measures:**
• Passwords are hashed using bcrypt with salt rounds of 12
• All data transmission is encrypted via HTTPS/TLS
• Session tokens are cryptographically secure (64 characters)
• HTTP-only cookies prevent XSS attacks
• SQL injection prevention through parameterized queries (Drizzle ORM)
• IP addresses anonymized before storage (GDPR-compliant)
• 2FA/MFA support with encrypted secrets (AES-256-GCM)
• Cloudflare Turnstile for bot protection (no CAPTCHAs)

**Access Controls:**
• Role-based access control (user, admin, owner)
• Session expiration after 7 days of inactivity
• Automatic logout on suspicious activity

**Infrastructure:**
• Database hosted on secure cloud infrastructure (Neon)
• Regular security updates and patches
• DDoS protection through CDN

While we strive to protect your information, no method of transmission over the Internet is 100% secure. We cannot guarantee absolute security.`,
  },
  {
    id: 'cookies',
    title: 'Cookies & Tracking',
    icon: Cookie,
    content: `We use cookies and similar technologies:

**Essential Cookies:**
• session-token: Authentication (HTTP-only, secure, 7 days)
• theme: Your preferred color theme (local storage)

**Analytics:**
• We collect anonymized usage statistics
• No third-party tracking cookies (Google Analytics, Facebook Pixel, etc.)
• We do not track you across other websites

**Your Choices:**
• You can disable cookies in your browser settings
• Disabling essential cookies will prevent you from logging in
• You can clear your data at any time through your profile settings

For more details, see our [Cookie Policy](/cookies).`,
  },
  {
    id: 'your-rights',
    title: 'Your Rights (GDPR/CCPA)',
    icon: FileText,
    content: `Depending on your location, you may have the following rights:

**Access:** Request a copy of your personal data
**Rectification:** Correct inaccurate or incomplete data
**Erasure:** Request deletion of your data ("right to be forgotten")
**Portability:** Receive your data in a portable format
**Restriction:** Limit how we process your data
**Objection:** Object to certain processing activities
**Withdraw Consent:** Withdraw consent at any time

**Self-Service Options:**
• **Export Your Data:** Go to Profile Settings → Privacy & Data → Export to download all your personal data in JSON format
• **Delete Your Account:** Go to Profile Settings → Danger Zone → Delete Account to permanently delete your account and all associated data

**For EU/EEA Residents (GDPR):**
• We process data based on consent and legitimate interests
• You can file a complaint with your local data protection authority

**For California Residents (CCPA):**
• You have the right to know what data we collect
• You can request deletion of your data
• We do not sell personal information

For additional assistance, contact us at privacy@eziox.link`,
  },
  {
    id: 'data-retention',
    title: 'Data Retention',
    icon: Calendar,
    content: `We retain your data for as long as necessary:

**Active Accounts:**
• Profile data is retained while your account is active
• Usage statistics are retained for analytics purposes

**Deleted Accounts:**
• Account data is deleted within 30 days of deletion request
• Some data may be retained for legal compliance (up to 7 years)
• Anonymized analytics data may be retained indefinitely

**Inactive Accounts:**
• Accounts inactive for 2+ years may be flagged for deletion
• We will notify you before deleting inactive accounts`,
  },
  {
    id: 'children',
    title: "Children's Privacy",
    icon: AlertCircle,
    content: `Our Service is not intended for children under 13 years of age.

• We do not knowingly collect data from children under 13
• If we discover such data, we will delete it immediately
• Parents/guardians can contact us to request data deletion
• Users between 13-18 should have parental consent

If you believe a child has provided us with personal information, please contact us immediately at privacy@eziox.link`,
  },
  {
    id: 'international',
    title: 'International Transfers',
    icon: Globe,
    content: `Your information may be transferred to and processed in countries other than your own:

• Our servers are located in the United States and Europe
• We use Standard Contractual Clauses for EU data transfers
• We ensure adequate protection regardless of location

By using our Service, you consent to the transfer of your information to these locations.`,
  },
  {
    id: 'changes',
    title: 'Changes to This Policy',
    icon: FileText,
    content: `We may update this Privacy Policy from time to time:

• We will notify you of significant changes via email or in-app notification
• The "Last Updated" date at the top will be revised
• Continued use after changes constitutes acceptance
• We encourage you to review this policy periodically

Material changes will be announced at least 30 days before taking effect.`,
  },
  {
    id: 'contact',
    title: 'Contact Us',
    icon: Mail,
    content: `If you have questions about this Privacy Policy or our data practices:

**Email:** privacy@eziox.link
**Website:** https://eziox.link/about
**GitHub:** https://github.com/Eziox-Development

**Data Protection Officer:**
For GDPR-related inquiries, contact our DPO at dpo@eziox.link

We aim to respond to all inquiries within 48 hours.`,
  },
]

const RELATED_LINKS: RelatedLink[] = [
  { title: 'Terms of Service', href: '/terms', icon: FileText },
  { title: 'Cookie Policy', href: '/cookies', icon: Cookie },
  { title: 'About Us', href: '/about', icon: Globe },
]

function PrivacyPage() {
  return (
    <LegalPageLayout
      title="Your Privacy Matters"
      subtitle="We're committed to protecting your data and being transparent about how we use it."
      badge="Privacy Policy"
      badgeIcon={Shield}
      accentColor={ACCENT_COLOR}
      lastUpdated={LAST_UPDATED}
      sections={SECTIONS}
      relatedLinks={RELATED_LINKS}
    />
  )
}
