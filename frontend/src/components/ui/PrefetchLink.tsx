import React, { useCallback } from 'react'
import { Link, LinkProps } from 'react-router-dom'

interface PrefetchLinkProps extends LinkProps {
  prefetch?: boolean
  children: React.ReactNode
}

/**
 * Enhanced Link component with automatic route prefetching on hover
 * Preloads the route chunk when user hovers, making navigation instant
 */
const PrefetchLink: React.FC<PrefetchLinkProps> = ({ 
  to, 
  prefetch = true, 
  children, 
  ...props 
}) => {
  const handleMouseEnter = useCallback(() => {
    if (!prefetch) return

    const path = typeof to === 'string' ? to : to.pathname

    // Trigger dynamic import based on route
    // This downloads the chunk in the background
    switch (path) {
      case '/admin':
        import('../../pages/AdminDashboard')
        break
      case '/admin/devices':
        import('../../pages/AdminDevices')
        break
      case '/admin/login':
        import('../../pages/AdminLogin')
        break
      case '/rooms':
        import('../../pages/RoomsPage')
        break
      case '/about':
        import('../../pages/AboutPage')
        break
      case '/contact':
        import('../../pages/ContactPage')
        break
      case '/signup':
        import('../../pages/Signup')
        break
      case '/profile':
        import('../../pages/Profile')
        break
      case '/dashboard':
        import('../../pages/GuestDashboard')
        break
      case '/checkout':
        import('../../pages/Checkout')
        break
      default:
        // Unknown route - don't prefetch
        break
    }
  }, [to, prefetch])

  return (
    <Link 
      to={to} 
      onMouseEnter={handleMouseEnter}
      onTouchStart={handleMouseEnter} // Also prefetch on mobile touch
      {...props}
    >
      {children}
    </Link>
  )
}

export default PrefetchLink
