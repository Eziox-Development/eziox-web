import { createFileRoute } from '@tanstack/react-router'
import {
  FileText,
  Scale,
  UserCheck,
  Shield,
  AlertTriangle,
  Ban,
  Gavel,
  Globe,
  Mail,
  Calendar,
  CheckCircle,
  Cookie,
} from 'lucide-react'
import {
  LegalPageLayout,
  type LegalSection,
  type RelatedLink,
} from '@/components/legal/LegalPageLayout'

export const Route = createFileRoute('/_public/terms')({
  head: () => ({
    meta: [
      { title: 'Terms of Service | Eziox' },
      {
        name: 'description',
        content:
          'Terms of Service for Eziox - Rules and guidelines for using our platform.',
      },
    ],
  }),
  component: TermsPage,
})

const LAST_UPDATED = 'January 21, 2026'
const ACCENT_COLOR = '#8b5cf6'

const SECTIONS: LegalSection[] = [
  {
    id: 'acceptance',
    title: 'Acceptance of Terms',
    icon: CheckCircle,
    content: `By accessing or using Eziox ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of these terms, you may not access the Service.

These Terms apply to all visitors, users, and others who access or use the Service. By using the Service, you represent that you are at least 13 years of age, or the age of majority in your jurisdiction, whichever is greater.

We reserve the right to update these Terms at any time. We will notify you of any changes by posting the new Terms on this page and updating the "Last Updated" date.`,
  },
  {
    id: 'account',
    title: 'Account Terms',
    icon: UserCheck,
    content: `**Account Creation:**
• You must provide accurate and complete information when creating an account
• You are responsible for maintaining the security of your account and password
• You must notify us immediately of any unauthorized access to your account
• You may not use another person's account without permission

**Account Responsibilities:**
• You are responsible for all activity that occurs under your account
• You must not share your account credentials with others
• You must keep your contact information up to date
• You are responsible for the content you post on your profile

**Account Termination:**
• You may delete your account at any time through your profile settings
• We may suspend or terminate accounts that violate these Terms
• Upon termination, your right to use the Service will immediately cease`,
  },
  {
    id: 'acceptable-use',
    title: 'Acceptable Use Policy',
    icon: Shield,
    content: `You agree to use the Service only for lawful purposes. You must NOT:

**Prohibited Content:**
• Post illegal, harmful, threatening, abusive, or harassing content
• Share content that promotes violence, discrimination, or hate speech
• Upload sexually explicit or pornographic material
• Post content that infringes on intellectual property rights
• Share personal information of others without consent

**Prohibited Activities:**
• Attempt to gain unauthorized access to the Service or other accounts
• Use the Service to send spam, phishing, or malicious content
• Interfere with or disrupt the Service or servers
• Use automated tools to scrape or collect data without permission
• Impersonate another person or entity
• Use the Service for any illegal or unauthorized purpose

**Link Policies:**
• All links on your bio page must lead to legitimate, safe destinations
• You may not use link shorteners to disguise malicious URLs
• Links to illegal content, malware, or phishing sites are prohibited
• We reserve the right to remove any links that violate these policies`,
  },
  {
    id: 'content',
    title: 'User Content',
    icon: FileText,
    content: `**Your Content:**
• You retain ownership of all content you post on the Service
• By posting content, you grant us a non-exclusive, worldwide, royalty-free license to use, display, and distribute your content in connection with the Service
• You represent that you have all necessary rights to post your content

**Content Moderation:**
• We reserve the right to remove any content that violates these Terms
• We may review content for compliance with our policies
• We are not obligated to monitor all content but may do so at our discretion

**Copyright:**
• We respect intellectual property rights and expect users to do the same
• If you believe your copyright has been infringed, please contact us
• Repeat infringers may have their accounts terminated`,
  },
  {
    id: 'prohibited',
    title: 'Prohibited Uses',
    icon: Ban,
    content: `The following uses of the Service are strictly prohibited:

**Commercial Restrictions:**
• Using the Service for unauthorized commercial purposes
• Selling, reselling, or exploiting the Service without permission
• Using the Service to promote pyramid schemes or multi-level marketing

**Technical Restrictions:**
• Reverse engineering or attempting to extract source code
• Modifying, adapting, or hacking the Service
• Using the Service to transmit viruses or malicious code
• Overloading or attacking our infrastructure

**Legal Restrictions:**
• Violating any applicable laws or regulations
• Facilitating illegal activities or transactions
• Evading account suspensions or bans

Violation of these prohibitions may result in immediate account termination and potential legal action.`,
  },
  {
    id: 'intellectual-property',
    title: 'Intellectual Property',
    icon: Scale,
    content: `**Our Intellectual Property:**
• The Service, including its design, features, and content, is owned by Eziox
• Our trademarks, logos, and brand elements may not be used without permission
• The source code and underlying technology are proprietary

**Your Intellectual Property:**
• You retain all rights to your original content
• We do not claim ownership of your bio page content
• You grant us a license to display your content as part of the Service

**Third-Party Content:**
• Some features may include third-party content or services
• Third-party content is subject to its own terms and licenses
• We are not responsible for third-party content or services`,
  },
  {
    id: 'disclaimers',
    title: 'Disclaimers',
    icon: AlertTriangle,
    content: `**Service Provided "As Is":**
THE SERVICE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED.

**No Warranty:**
• We do not warrant that the Service will be uninterrupted or error-free
• We do not warrant that defects will be corrected
• We do not warrant that the Service is free of viruses or harmful components

**Limitation of Liability:**
TO THE MAXIMUM EXTENT PERMITTED BY LAW, EZIOX SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, OR GOODWILL.

**Indemnification:**
You agree to indemnify and hold harmless Eziox and its affiliates from any claims, damages, or expenses arising from your use of the Service or violation of these Terms.`,
  },
  {
    id: 'termination',
    title: 'Termination',
    icon: Gavel,
    content: `**By You:**
• You may terminate your account at any time by deleting it through your profile settings
• Upon termination, your data will be deleted according to our Privacy Policy

**By Us:**
• We may suspend or terminate your account for any violation of these Terms
• We may terminate accounts that are inactive for extended periods
• We may discontinue the Service at any time with reasonable notice

**Effect of Termination:**
• All provisions of these Terms that should survive termination will survive
• You will lose access to your account and all associated data
• We are not liable for any loss resulting from termination`,
  },
  {
    id: 'governing-law',
    title: 'Governing Law',
    icon: Globe,
    content: `**Jurisdiction:**
These Terms shall be governed by and construed in accordance with the laws of Germany, without regard to its conflict of law provisions.

**Dispute Resolution:**
• Any disputes arising from these Terms shall be resolved through good-faith negotiation
• If negotiation fails, disputes shall be submitted to binding arbitration
• You waive any right to participate in class action lawsuits

**Severability:**
If any provision of these Terms is found to be unenforceable, the remaining provisions will continue in full force and effect.

**Entire Agreement:**
These Terms, together with our Privacy Policy and Cookie Policy, constitute the entire agreement between you and Eziox regarding the Service.`,
  },
  {
    id: 'changes',
    title: 'Changes to Terms',
    icon: Calendar,
    content: `We reserve the right to modify these Terms at any time:

• We will provide notice of significant changes via email or in-app notification
• Changes will be effective immediately upon posting
• Your continued use of the Service after changes constitutes acceptance
• If you disagree with changes, you must stop using the Service

We encourage you to review these Terms periodically for any updates.`,
  },
  {
    id: 'contact',
    title: 'Contact Information',
    icon: Mail,
    content: `If you have any questions about these Terms of Service:

**Email:** legal@eziox.link
**Website:** https://eziox.link/about
**GitHub:** https://github.com/Eziox-Development

For privacy-related inquiries, please see our Privacy Policy or contact privacy@eziox.link.

We aim to respond to all inquiries within 48 hours.`,
  },
]

const RELATED_LINKS: RelatedLink[] = [
  { title: 'Privacy Policy', href: '/privacy', icon: Shield },
  { title: 'Cookie Policy', href: '/cookies', icon: Cookie },
  { title: 'About Us', href: '/about', icon: Globe },
]

function TermsPage() {
  return (
    <LegalPageLayout
      title="Terms of Service"
      subtitle="Please read these terms carefully before using our platform."
      badge="Terms of Service"
      badgeIcon={Scale}
      accentColor={ACCENT_COLOR}
      lastUpdated={LAST_UPDATED}
      sections={SECTIONS}
      relatedLinks={RELATED_LINKS}
    />
  )
}
