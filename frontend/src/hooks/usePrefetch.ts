import { useEffect } from 'react'

/**
 * Prefetch a route component when user hovers over a link
 * This makes navigation feel instant by preloading the chunk
 */
export function usePrefetch() {
  const prefetchedRoutes = new Set<string>()

  const prefetchRoute = (routePath: string) => {
    // Avoid prefetching the same route multiple times
    if (prefetchedRoutes.has(routePath)) return

    prefetchedRoutes.add(routePath)

    // Dynamically import the route component
    // This triggers Vite to download the chunk in the background
    switch (routePath) {
      case '/admin':
        import('../pages/AdminDashboard')
        break
      case '/admin/devices':
        import('../pages/AdminDevices')
        break
      case '/admin/login':
        import('../pages/AdminLogin')
        break
      case '/rooms':
        import('../pages/RoomsPage')
        break
      case '/about':
        import('../pages/AboutPage')
        break
      case '/contact':
        import('../pages/ContactPage')
        break
      case '/signup':
        import('../pages/Signup')
        break
      case '/profile':
        import('../pages/Profile')
        break
      case '/dashboard':
        import('../pages/GuestDashboard')
        break
      case '/checkout':
        import('../pages/Checkout')
        break
      default:
        // Don't prefetch unknown routes
        break
    }
  }

  return { prefetchRoute }
}

/**
 * Prefetch routes on page idle (low priority background task)
 * Preloads likely routes after initial page load completes
 */
export function usePrefetchOnIdle(routes: string[]) {
  useEffect(() => {
    // Wait for the page to be idle before prefetching
    if ('requestIdleCallback' in window) {
      const idleCallback = window.requestIdleCallback(() => {
        routes.forEach((route) => {
          switch (route) {
            case '/rooms':
              import('../pages/RoomsPage')
              break
            case '/about':
              import('../pages/AboutPage')
              break
            case '/contact':
              import('../pages/ContactPage')
              break
            case '/signup':
              import('../pages/Signup')
              break
            default:
              break
          }
        })
      })

      return () => window.cancelIdleCallback(idleCallback)
    } else {
      // Fallback for browsers without requestIdleCallback
      const timeout = setTimeout(() => {
        routes.forEach((route) => {
          switch (route) {
            case '/rooms':
              import('../pages/RoomsPage')
              break
            case '/about':
              import('../pages/AboutPage')
              break
            case '/contact':
              import('../pages/ContactPage')
              break
            default:
              break
          }
        })
      }, 2000) // Wait 2 seconds after page load

      return () => clearTimeout(timeout)
    }
  }, [routes])
}
