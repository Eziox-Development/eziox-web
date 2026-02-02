/**
 * Security: Disable React DevTools in production
 *
 * This prevents users from inspecting React component state and structure.
 * Browser DevTools (F12, Console, Network) remain accessible - this is intentional:
 * - Blocking F12 is easily bypassed and annoys legitimate users
 * - Network requests are always visible regardless
 * - Real security comes from server-side validation, not client-side hiding
 *
 * What this DOES protect:
 * - React component tree inspection
 * - Component state/props viewing
 * - React-specific debugging
 *
 * What this does NOT protect (and shouldn't try to):
 * - Network requests (use HTTPS, proper auth)
 * - Source code (it's minified in production anyway)
 * - DOM structure (visible to anyone)
 */

export function disableDevTools() {
  if (typeof window === 'undefined') return

  // Only disable in production
  if (import.meta.env.DEV) return

  // Disable React DevTools only
  const disableReactDevTools = () => {
    const noop = () => undefined

    // Check if React DevTools is present
    if (typeof window.__REACT_DEVTOOLS_GLOBAL_HOOK__ === 'object') {
      const hook = window.__REACT_DEVTOOLS_GLOBAL_HOOK__

      // Replace all methods with no-op functions
      for (const prop in hook) {
        if (typeof hook[prop as keyof typeof hook] === 'function') {
          ;(hook as Record<string, unknown>)[prop] = noop
        }
      }

      // Disable inject method
      hook.inject = noop

      // Clear any existing data
      hook.renderers = new Map()
      hook.supportsFiber = false
      hook.checkDCE = noop
      hook.onCommitFiberRoot = noop
      hook.onCommitFiberUnmount = noop
    }

    // Prevent future installation
    Object.defineProperty(window, '__REACT_DEVTOOLS_GLOBAL_HOOK__', {
      value: {
        inject: noop,
        supportsFiber: false,
        checkDCE: noop,
        onCommitFiberRoot: noop,
        onCommitFiberUnmount: noop,
        renderers: new Map(),
      },
      writable: false,
      configurable: false,
    })
  }

  // Execute protection
  try {
    disableReactDevTools()
  } catch {
    // Silently fail - don't break the app if protection fails
  }
}

// Type declarations for React DevTools hook
declare global {
  interface Window {
    __REACT_DEVTOOLS_GLOBAL_HOOK__?: {
      inject: () => void
      supportsFiber: boolean
      checkDCE: () => void
      onCommitFiberRoot: () => void
      onCommitFiberUnmount: () => void
      renderers: Map<unknown, unknown>
    }
  }
}
