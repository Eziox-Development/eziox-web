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

function CustomizationDoc() {
  return (
    <DocsLayout
      title="Customization"
      description="Advanced styling options to make your bio page unique."
      category="Basics"
      icon="Palette"
    >
      <DocSection title="Themes">
        <DocSubSection title="Built-in Themes">
          <DocParagraph>
            We offer 31+ professionally designed themes. Each theme includes:
          </DocParagraph>
          <DocList
            items={[
              'Color Palette - Primary, accent, background, and text colors',
              'Typography - Display and body fonts',
              'Effects - Border radius, glow intensity, card styles',
            ]}
          />
        </DocSubSection>

        <DocSubSection title="Theme Categories">
          <DocList
            items={[
              'General - Clean, versatile designs for everyone',
              'Gamer - Vibrant neon colors and RGB effects',
              'VTuber - Kawaii aesthetics and anime-inspired palettes',
              'Developer - IDE-inspired themes (VS Code, GitHub, Terminal)',
              'Streamer - Platform-branded themes (Twitch, YouTube, Kick)',
              'Artist - Elegant, creative palettes',
              'Minimal - Clean, distraction-free designs',
              'Premium - Exclusive themes for Pro+ subscribers',
            ]}
          />
        </DocSubSection>
      </DocSection>

      <DocSection title="Backgrounds">
        <DocSubSection title="Background Types">
          <DocTable
            headers={['Type', 'Description', 'Tier']}
            rows={[
              ['Solid', 'Single color background', 'Free'],
              ['Gradient', 'Two-color gradient with angle control', 'Free'],
              ['Image', 'Upload custom background image', 'Free'],
              ['Video', 'Upload or link video background', 'Free'],
              ['Animated', '30+ animated presets', 'Free'],
            ]}
          />
        </DocSubSection>

        <DocSubSection title="Animated Presets">
          <DocParagraph>
            Choose from 30+ animated backgrounds across 5 categories:
          </DocParagraph>
          <DocList
            items={[
              'VTuber/Anime - Sakura petals, neon city, starfield, holographic shimmer',
              'Gamer - Matrix rain, cyber grid, RGB wave, particles, glitch',
              'Developer - Code rain, binary flow, terminal, circuit board',
              'Nature - Aurora borealis, ocean waves, fireflies, clouds',
              'Abstract - Fluid motion, geometric shapes, waves, bokeh',
            ]}
          />
        </DocSubSection>
      </DocSection>

      <DocSection title="Layout Options">
        <DocSubSection title="Card Styles">
          <DocList
            items={[
              'Solid - Opaque background cards',
              'Glass - Glassmorphism with blur effect',
              'Outline - Border-only cards',
            ]}
          />
        </DocSubSection>

        <DocSubSection title="Border Radius">
          <DocList
            items={[
              'Sharp - 8px corners',
              'Rounded - 16px corners (default)',
              'Pill - Fully rounded corners',
            ]}
          />
        </DocSubSection>
      </DocSection>

      <DocSection title="Pro Features">
        <DocSubSection title="Custom CSS (Pro+)">
          <DocParagraph>
            Write your own CSS to override any styles:
          </DocParagraph>
          <DocCode>
            {`/* Example: Custom link hover effect */
.link-card:hover {
  transform: scale(1.05) rotate(1deg);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}`}
          </DocCode>
          <DocParagraph>Limitations:</DocParagraph>
          <DocList
            items={[
              'Max 10,000 characters',
              'No @import or external resources',
              'No position: fixed (security)',
              'No JavaScript expressions',
            ]}
          />
        </DocSubSection>

        <DocSubSection title="Custom Fonts (Pro+)">
          <DocParagraph>Upload up to 4 custom fonts:</DocParagraph>
          <DocList
            items={[
              'Go to Dashboard → Creator',
              'Click Add Font',
              'Enter a Google Fonts URL or upload a font file',
              'Assign to Display or Body text',
            ]}
          />
        </DocSubSection>
      </DocSection>

      <DocSection title="Best Practices">
        <DocList
          items={[
            'Contrast - Ensure text is readable against your background',
            'Consistency - Use complementary colors and fonts',
            'Performance - Avoid heavy video backgrounds on mobile',
            'Accessibility - Test with screen readers and keyboard navigation',
          ]}
        />
        <DocParagraph>
          Need inspiration? Browse our{' '}
          <DocLink href="/templates">Templates Gallery</DocLink> to see what
          others have created.
        </DocParagraph>
      </DocSection>
    </DocsLayout>
  )
}
