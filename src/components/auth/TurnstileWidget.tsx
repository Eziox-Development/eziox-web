import { useEffect, useRef, useCallback } from 'react'

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
  const renderedRef = useRef(false)

  const handleVerify = useCallback((token: string) => {
    onVerify(token)
  }, [onVerify])

  const handleError = useCallback(() => {
    onError?.()
  }, [onError])

  const handleExpire = useCallback(() => {
    onExpire?.()
  }, [onExpire])

  useEffect(() => {
    const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY || '0x4AAAAAACNdGGhEBeVq7GQb'
    
    if (!containerRef.current || renderedRef.current) return

    const renderWidget = () => {
      if (!window.turnstile || !containerRef.current || renderedRef.current) return
      if (widgetIdRef.current) return

      // Clear container before rendering
      containerRef.current.innerHTML = ''
      
      renderedRef.current = true
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        callback: handleVerify,
        'error-callback': handleError,
        'expired-callback': handleExpire,
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
        renderedRef.current = false
      }
    }
  }, [handleVerify, handleError, handleExpire])

  return <div ref={containerRef} className="turnstile-container" />
}
