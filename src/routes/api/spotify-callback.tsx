import { createFileRoute } from '@tanstack/react-router'
import { handleSpotifyCallbackFn } from '@/server/functions/spotify'

export const Route = createFileRoute('/api/spotify-callback')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url)
        const code = url.searchParams.get('code')
        const state = url.searchParams.get('state')
        const error = url.searchParams.get('error')

        if (error) {
          return new Response(null, {
            status: 302,
            headers: {
              Location:
                '/profile?tab=settings&spotify=error&reason=' +
                encodeURIComponent(error),
            },
          })
        }

        if (!code || !state) {
          return new Response(null, {
            status: 302,
            headers: {
              Location:
                '/profile?tab=settings&spotify=error&reason=missing_params',
            },
          })
        }

        try {
          await handleSpotifyCallbackFn({ data: { code, state } })
          return new Response(null, {
            status: 302,
            headers: { Location: '/profile?tab=settings&spotify=success' },
          })
        } catch (err) {
          console.error('Spotify callback error:', err)
          return new Response(null, {
            status: 302,
            headers: {
              Location:
                '/profile?tab=settings&spotify=error&reason=callback_failed',
            },
          })
        }
      },
    },
  },
})
