import React, { useState } from 'react'

interface OptimizedImageProps {
  src: string
  alt: string
  className?: string
  width?: number
  height?: number
  priority?: boolean // For above-the-fold images
  sizes?: string // Responsive sizes
}

/**
 * Optimized Image Component with:
 * - Lazy loading for below-the-fold images
 * - WebP format with fallback
 * - Responsive srcset
 * - Blur-up placeholder effect
 * - Priority loading for critical images
 */
const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  width,
  height,
  priority = false,
  sizes = '100vw'
}) => {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)

  // Convert Unsplash URLs to optimized versions with WebP
  const getOptimizedUrl = (url: string, format: 'webp' | 'jpg' = 'jpg') => {
    if (!url.includes('unsplash.com')) return url

    // Extract base URL and parameters
    const baseUrl = url.split('?')[0]
    const params = new URLSearchParams(url.split('?')[1] || '')

    // Set format to WebP for better compression
    if (format === 'webp') {
      params.set('fm', 'webp')
    }

    // Ensure quality is set to 90 for sharper images
    if (!params.has('q')) {
      params.set('q', '90')
    }

    // Ensure auto optimization
    params.set('auto', 'format,compress')

    return `${baseUrl}?${params.toString()}`
  }

  // Generate srcset for responsive images
  const generateSrcSet = (url: string, format: 'webp' | 'jpg' = 'jpg') => {
    if (!url.includes('unsplash.com')) return ''

    const baseUrl = url.split('?')[0]
    const widths = [400, 800, 1200, 1600, 2000]

    return widths
      .map((w) => {
        const params = new URLSearchParams(url.split('?')[1] || '')
        params.set('w', w.toString())
        params.set('auto', 'format,compress')
        params.set('q', '90')
        if (format === 'webp') {
          params.set('fm', 'webp')
        }
        return `${baseUrl}?${params.toString()} ${w}w`
      })
      .join(', ')
  }

  const webpSrc = getOptimizedUrl(src, 'webp')
  const jpgSrc = getOptimizedUrl(src, 'jpg')
  const webpSrcSet = generateSrcSet(src, 'webp')
  const jpgSrcSet = generateSrcSet(src, 'jpg')

  return (
    <picture className={`relative overflow-hidden ${className}`}>
      {/* WebP version for browsers that support it */}
      <source
        type="image/webp"
        srcSet={webpSrcSet || webpSrc}
        sizes={sizes}
      />

      {/* Fallback JPEG version */}
      <source
        type="image/jpeg"
        srcSet={jpgSrcSet || jpgSrc}
        sizes={sizes}
      />

      {/* Actual img element */}
      <img
        src={jpgSrc}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        className={`
          transition-opacity duration-500
          ${loaded ? 'opacity-100' : 'opacity-80'}
          ${error ? 'hidden' : 'block'}
          w-full h-full object-cover
        `}
      />

      {/* Loading placeholder with blur effect */}
      {!loaded && !error && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse" />
      )}

      {/* Error fallback */}
      {error && (
        <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
          <div className="text-gray-400 text-sm">Image unavailable</div>
        </div>
      )}
    </picture>
  )
}

export default OptimizedImage
