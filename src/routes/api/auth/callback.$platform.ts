/**
 * OAuth Callback Handler for Social Integrations
 * Handles callbacks from Discord, Steam, Twitch, GitHub
 */

import { createFileRoute } from '@tanstack/react-router'
import { handleOAuthCallbackFn, SUPPORTED_PLATFORMS } from '@/server/functions/social-integrations'

export const Route = createFileRoute('/api/auth/callback/$platform')({
  server: {
    handlers: {
      GET: async ({ request, params }: { request: Request; params: { platform: string } }) => {
        const { platform } = params
        const url = new URL(request.url)
        const baseUrl = process.env.APP_URL || 'https://eziox.link'
        
        // Validate platform
        if (!SUPPORTED_PLATFORMS.includes(platform as typeof SUPPORTED_PLATFORMS[number])) {
          return new Response(null, {
            status: 302,
            headers: { Location: `${baseUrl}/profile?tab=integrations&error=invalid_platform` },
          })
        }

        const code = url.searchParams.get('code')
        const state = url.searchParams.get('state')
        
        // Steam uses OpenID, extract Steam ID from claimed_id
        let steamId: string | null = null
        if (platform === 'steam') {
          const claimedId = url.searchParams.get('openid.claimed_id')
          if (claimedId) {
            const match = claimedId.match(/\/id\/(\d+)$/)
            steamId = match && match[1] ? match[1] : null
          }
        }

        const authCode: string | null = platform === 'steam' ? steamId : code

        if (!authCode || !state) {
          return new Response(null, {
            status: 302,
            headers: { Location: `${baseUrl}/profile?tab=integrations&error=missing_params` },
          })
        }

        try {
          const result = await handleOAuthCallbackFn({
            data: {
              platform: platform as typeof SUPPORTED_PLATFORMS[number],
              code: authCode,
              state,
            },
          })

          if ('error' in result && result.error) {
            return new Response(null, {
              status: 302,
              headers: { Location: `${baseUrl}/profile?tab=integrations&error=${result.error}` },
            })
          }

          return new Response(null, {
            status: 302,
            headers: { Location: `${baseUrl}/profile?tab=integrations&success=${platform}` },
          })
        } catch (error) {
          console.error('OAuth callback error:', error)
          return new Response(null, {
            status: 302,
            headers: { Location: `${baseUrl}/profile?tab=integrations&error=callback_failed` },
          })
        }
      },
    },
  },
})
