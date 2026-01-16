import { createFileRoute, Link } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { Fragment } from 'react'
import {
  FileText, Scale, UserCheck, Shield, AlertTriangle, Ban,
  Gavel, Globe, Mail, ChevronRight, Calendar, CheckCircle,
} from 'lucide-react'

function renderContent(text: string) {
  const parts: React.ReactNode[] = []
  const lines = text.split('\n')
  
  lines.forEach((line, lineIndex) => {
    if (lineIndex > 0) parts.push(<br key={`br-${lineIndex}`} />)
    
    let remaining = line
    let partIndex = 0
    
    while (remaining.length > 0) {
      const boldMatch = remaining.match(/\*\*([^*]+)\*\*/)
      const linkMatch = remaining.match(/\[([^\]]+)\]\(([^)]+)\)/)
      const bulletMatch = remaining.match(/^• /)
      
      if (bulletMatch && remaining.startsWith('• ')) {
        parts.push(<span key={`bullet-${lineIndex}-${partIndex}`} className="text-purple-400">• </span>)
        remaining = remaining.slice(2)
        partIndex++
        continue
      }
      
      let nextMatch: { index: number; type: 'bold' | 'link'; length: number } | null = null
      
      if (boldMatch?.index !== undefined) {
        nextMatch = { index: boldMatch.index, type: 'bold', length: boldMatch[0].length }
      }
      if (linkMatch?.index !== undefined && (!nextMatch || linkMatch.index < nextMatch.index)) {
        nextMatch = { index: linkMatch.index, type: 'link', length: linkMatch[0].length }
      }
      
      if (!nextMatch) {
        parts.push(<Fragment key={`text-${lineIndex}-${partIndex}`}>{remaining}</Fragment>)
        break
      }
      
      if (nextMatch.index > 0) {
        parts.push(<Fragment key={`pre-${lineIndex}-${partIndex}`}>{remaining.slice(0, nextMatch.index)}</Fragment>)
        partIndex++
      }
      
      if (nextMatch.type === 'bold' && boldMatch) {
        parts.push(
          <strong key={`bold-${lineIndex}-${partIndex}`} style={{ color: 'var(--foreground)' }}>
            {boldMatch[1]}
          </strong>
        )
      } else if (nextMatch.type === 'link' && linkMatch) {
        parts.push(
          <Link
            key={`link-${lineIndex}-${partIndex}`}
            to={linkMatch[2] as '/'}
            className="underline hover:no-underline"
            style={{ color: '#8b5cf6' }}
          >
            {linkMatch[1]}
          </Link>
        )
      }
      
      remaining = remaining.slice(nextMatch.index + nextMatch.length)
      partIndex++
    }
  })
  
  return parts
}

export const Route = createFileRoute('/_public/terms')({
  head: () => ({
    meta: [
      { title: 'Terms of Service | Eziox' },
      { name: 'description', content: 'Terms of Service for Eziox - Rules and guidelines for using our platform.' },
    ],
  }),
  component: TermsPage,
})

const LAST_UPDATED = 'January 16, 2026'

const SECTIONS = [
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

function TermsPage() {
  return (
    <div className="min-h-screen pt-24 pb-12 px-4" style={{ background: 'var(--background)' }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6" style={{ background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
            <Scale size={16} style={{ color: '#8b5cf6' }} />
            <span className="text-sm font-medium" style={{ color: '#8b5cf6' }}>Terms of Service</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>
            Terms of Service
          </h1>
          <p className="text-lg mb-4" style={{ color: 'var(--foreground-muted)' }}>
            Please read these terms carefully before using our platform.
          </p>
          <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
            Last Updated: {LAST_UPDATED}
          </p>
        </motion.div>

        {/* Quick Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12 p-6 rounded-3xl"
          style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.08)' }}
        >
          <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--foreground)' }}>Quick Navigation</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {SECTIONS.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all hover:scale-[1.02]"
                style={{ background: 'rgba(255, 255, 255, 0.03)', color: 'var(--foreground-muted)' }}
              >
                <section.icon size={14} style={{ color: '#8b5cf6' }} />
                <span className="truncate">{section.title}</span>
              </a>
            ))}
          </div>
        </motion.div>

        {/* Sections */}
        <div className="space-y-8">
          {SECTIONS.map((section, index) => (
            <motion.section
              key={section.id}
              id={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              className="p-6 rounded-3xl scroll-mt-24"
              style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.08)' }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(139, 92, 246, 0.15)' }}>
                  <section.icon size={20} style={{ color: '#8b5cf6' }} />
                </div>
                <h2 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>{section.title}</h2>
              </div>
              <div 
                className="prose prose-invert max-w-none text-sm leading-relaxed space-y-3"
                style={{ color: 'var(--foreground-muted)' }}
              >
                {section.content.split('\n\n').map((paragraph, i) => (
                  <p key={i}>{renderContent(paragraph)}</p>
                ))}
              </div>
            </motion.section>
          ))}
        </div>

        {/* Related Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 p-6 rounded-3xl"
          style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.08)' }}
        >
          <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--foreground)' }}>Related Policies</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { title: 'Privacy Policy', href: '/privacy', icon: Shield },
              { title: 'Cookie Policy', href: '/cookies', icon: FileText },
              { title: 'About Us', href: '/about', icon: Globe },
            ].map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="flex items-center justify-between p-4 rounded-xl transition-all hover:scale-[1.02]"
                style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)' }}
              >
                <div className="flex items-center gap-3">
                  <link.icon size={18} style={{ color: '#8b5cf6' }} />
                  <span style={{ color: 'var(--foreground)' }}>{link.title}</span>
                </div>
                <ChevronRight size={16} style={{ color: 'var(--foreground-muted)' }} />
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
