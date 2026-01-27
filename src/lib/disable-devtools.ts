/**
 * Security: Disable React DevTools and other debugging tools in production
 * This prevents users from inspecting component state and structure
 */

export function disableDevTools() {
  if (typeof window === 'undefined') return

  // Only disable in production
  if (import.meta.env.DEV) return

  // Disable React DevTools
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

  // Disable right-click context menu (optional - can be annoying for users)
  // Uncomment if you want to prevent right-click
  // document.addEventListener('contextmenu', (e) => e.preventDefault())

  // Disable keyboard shortcuts for DevTools
  const disableDevToolsShortcuts = () => {
    document.addEventListener('keydown', (e) => {
      // F12
      if (e.key === 'F12') {
        e.preventDefault()
        return false
      }

      // Ctrl+Shift+I (DevTools)
      if (e.ctrlKey && e.shiftKey && e.key === 'I') {
        e.preventDefault()
        return false
      }

      // Ctrl+Shift+J (Console)
      if (e.ctrlKey && e.shiftKey && e.key === 'J') {
        e.preventDefault()
        return false
      }

      // Ctrl+Shift+C (Inspect Element)
      if (e.ctrlKey && e.shiftKey && e.key === 'C') {
        e.preventDefault()
        return false
      }

      // Ctrl+U (View Source)
      if (e.ctrlKey && e.key === 'u') {
        e.preventDefault()
        return false
      }

      return true
    })
  }

  // Detect DevTools opening (basic detection)
  const detectDevTools = () => {
    const threshold = 160
    let devtoolsOpen = false

    const checkDevTools = () => {
      const widthThreshold = window.outerWidth - window.innerWidth > threshold
      const heightThreshold =
        window.outerHeight - window.innerHeight > threshold

      if (widthThreshold || heightThreshold) {
        if (!devtoolsOpen) {
          devtoolsOpen = true
          // Optional: You can add actions here when DevTools is detected
          // For example, redirect or show a warning
        }
      } else {
        devtoolsOpen = false
      }
    }

    // Check periodically
    setInterval(checkDevTools, 1000)
  }

  // Execute all protections
  try {
    disableReactDevTools()
    disableDevToolsShortcuts()
    detectDevTools()
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
