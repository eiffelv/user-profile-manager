import React, { useState, useRef, useEffect } from 'react';
import { User as UserIcon } from 'lucide-react';

interface LazyImageProps {
  src?: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  fallback?: React.ReactNode;
}

/**
 * LazyImage Component
 * Implements lazy loading for images with intersection observer
 * Includes loading states and fallback support
 */
const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className = '',
  width,
  height,
  fallback
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
  };

  // Default fallback
  const defaultFallback = (
    <div 
      className={`flex items-center justify-center bg-gray-200 ${className}`}
      style={{ width, height }}
    >
      <UserIcon className="w-6 h-6 text-gray-400" />
    </div>
  );

  // Show fallback if no src, error occurred, or custom fallback provided
  if (!src || hasError) {
    return fallback ? <>{fallback}</> : defaultFallback;
  }

  return (
    <div className="relative" style={{ width, height }}>
      {/* Placeholder while loading */}
      {!isLoaded && (
        <div 
          className={`absolute inset-0 flex items-center justify-center bg-gray-200 animate-pulse ${className}`}
        >
          <UserIcon className="w-6 h-6 text-gray-400" />
        </div>
      )}
      
      {/* Actual image - only load when in view */}
      <img
        ref={imgRef}
        src={isInView ? src : undefined}
        alt={alt}
        className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
        style={{ width, height }}
        onLoad={handleLoad}
        onError={handleError}
        loading="lazy" // Native lazy loading as fallback
      />
    </div>
  );
};

export default LazyImage;
