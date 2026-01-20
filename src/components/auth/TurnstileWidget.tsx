import { useEffect, useRef } from 'react'

interface TurnstileWidgetProps {
  onVerify: (token: string) => void
  onError?: () => void
  onExpire?: () => void
}

declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, options: {
        sitekey: string
        callback: (token: string) => void
        'error-callback'?: () => void
        'expired-callback'?: () => void
        theme?: 'light' | 'dark' | 'auto'
        size?: 'normal' | 'compact'
      }) => string
      reset: (widgetId: string) => void
      remove: (widgetId: string) => void
    }
    __turnstileScriptLoaded?: boolean
  }
}

export function TurnstileWidget({ onVerify, onError, onExpire }: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)
  const callbacksRef = useRef({ onVerify, onError, onExpire })

  // Keep callbacks ref updated without triggering re-render
  callbacksRef.current = { onVerify, onError, onExpire }

  useEffect(() => {
    const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY || '0x4AAAAAACNdGGhEBeVq7GQb'
    
    if (!containerRef.current) return
    
    // If already rendered, don't re-render
    if (widgetIdRef.current) return

    const renderWidget = () => {
      if (!window.turnstile || !containerRef.current) return
      if (widgetIdRef.current) return

      // Clear container before rendering
      containerRef.current.innerHTML = ''
      
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        callback: (token: string) => callbacksRef.current.onVerify(token),
        'error-callback': () => callbacksRef.current.onError?.(),
        'expired-callback': () => callbacksRef.current.onExpire?.(),
        theme: 'auto',
        size: 'normal',
      })
    }

    if (window.turnstile) {
      renderWidget()
    } else if (!window.__turnstileScriptLoaded) {
      window.__turnstileScriptLoaded = true
      const script = document.createElement('script')
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js'
      script.async = true
      script.defer = true
      script.onload = renderWidget
      document.head.appendChild(script)
    } else {
      // Script is loading, wait for it
      const checkInterval = setInterval(() => {
        if (window.turnstile) {
          clearInterval(checkInterval)
          renderWidget()
        }
      }, 100)
      return () => clearInterval(checkInterval)
    }

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current)
        } catch {
          // Widget may already be removed
        }
        widgetIdRef.current = null
      }
    }
  }, []) // Empty deps - only run once on mount

  return <div ref={containerRef} className="turnstile-container" />
}
