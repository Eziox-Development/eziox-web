import { useEffect, useRef, useId } from 'react'

interface TurnstileWidgetProps {
  onVerify: (token: string) => void
  onError?: () => void
  onExpire?: () => void
}

declare global {
  interface Window {
    turnstile?: {
      render: (container: string | HTMLElement, options: {
        sitekey: string
        callback: (token: string) => void
        'error-callback'?: () => void
        'expired-callback'?: () => void
        'timeout-callback'?: () => void
        theme?: 'light' | 'dark' | 'auto'
        size?: 'normal' | 'compact'
        'refresh-expired'?: 'auto' | 'manual' | 'never'
      }) => string
      reset: (widgetId: string) => void
      remove: (widgetId: string) => void
      getResponse: (widgetId: string) => string | undefined
      isExpired: (widgetId: string) => boolean
    }
  }
}

const TURNSTILE_SCRIPT_ID = 'cf-turnstile-script'

function loadTurnstileScript(): Promise<void> {
  return new Promise((resolve) => {
    // Already loaded
    if (window.turnstile) {
      resolve()
      return
    }

    // Check if script tag exists but not yet loaded
    const existingScript = document.getElementById(TURNSTILE_SCRIPT_ID)
    if (existingScript) {
      const checkInterval = setInterval(() => {
        if (window.turnstile) {
          clearInterval(checkInterval)
          resolve()
        }
      }, 50)
      return
    }

    // Create script - NO async/defer for explicit mode
    const script = document.createElement('script')
    script.id = TURNSTILE_SCRIPT_ID
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=onTurnstileLoad'
    
    // Use onload callback
    ;(window as Window & { onTurnstileLoad?: () => void }).onTurnstileLoad = () => {
      resolve()
    }
    
    document.head.appendChild(script)
  })
}

export function TurnstileWidget({ onVerify, onError, onExpire }: TurnstileWidgetProps) {
  const uniqueId = useId()
  const containerId = `turnstile-${uniqueId.replace(/:/g, '-')}`
  const widgetIdRef = useRef<string | null>(null)
  const mountedRef = useRef(true)
  const callbacksRef = useRef({ onVerify, onError, onExpire })

  // Keep callbacks ref updated
  callbacksRef.current = { onVerify, onError, onExpire }

  useEffect(() => {
    mountedRef.current = true
    const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY || '0x4AAAAAACNdGGhEBeVq7GQb'
    let retryTimeout: NodeJS.Timeout | null = null

    const initWidget = async () => {
      await loadTurnstileScript()
      
      if (!mountedRef.current || !window.turnstile) return

      const container = document.getElementById(containerId)
      if (!container) return

      // Remove any existing widget first
      if (widgetIdRef.current) {
        try {
          window.turnstile.remove(widgetIdRef.current)
        } catch {
          // Ignore
        }
        widgetIdRef.current = null
      }

      // Clear container
      container.innerHTML = ''

      // Render new widget
      try {
        widgetIdRef.current = window.turnstile.render(`#${containerId}`, {
          sitekey: siteKey,
          callback: (token: string) => {
            if (mountedRef.current) {
              callbacksRef.current.onVerify(token)
            }
          },
          'error-callback': () => {
            if (mountedRef.current) {
              callbacksRef.current.onError?.()
              // Retry after 3 seconds on error
              retryTimeout = setTimeout(() => {
                if (mountedRef.current) {
                  void initWidget()
                }
              }, 3000)
            }
          },
          'expired-callback': () => {
            if (mountedRef.current) {
              callbacksRef.current.onExpire?.()
            }
          },
          'timeout-callback': () => {
            if (mountedRef.current) {
              callbacksRef.current.onError?.()
              // Retry after 3 seconds on timeout
              retryTimeout = setTimeout(() => {
                if (mountedRef.current) {
                  void initWidget()
                }
              }, 3000)
            }
          },
          theme: 'auto',
          size: 'normal',
          'refresh-expired': 'auto',
        })
      } catch (e) {
        console.error('Turnstile render error:', e)
        // Retry after 3 seconds on render error
        retryTimeout = setTimeout(() => {
          if (mountedRef.current) {
            void initWidget()
          }
        }, 3000)
      }
    }

    void initWidget()

    return () => {
      mountedRef.current = false
      
      // Clear retry timeout
      if (retryTimeout) {
        clearTimeout(retryTimeout)
      }
      
      // Clean up widget on unmount
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current)
        } catch {
          // Widget may already be removed
        }
        widgetIdRef.current = null
      }
    }
  }, [containerId])

  return <div id={containerId} className="turnstile-container" />
}
