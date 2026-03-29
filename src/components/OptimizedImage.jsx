import React, { useState, useRef, useEffect } from 'react';

const OptimizedImage = ({ 
  src, 
  alt, 
  className, 
  placeholder = "https://placehold.co/600x400?text=Loading...",
  ...props 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef();

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

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    console.error(`[OptimizedImage] Failed to load: ${src}`);
    setHasError(true);
    setIsLoaded(true);
  };

  const imageSrc = !src || hasError ? "https://placehold.co/600x400?text=Image+Not+Found" : src;

  // If no src is provided, mark as loaded immediately to show placeholder
  useEffect(() => {
    if (!src) {
      setIsLoaded(true);
    }
  }, [src]);

  return (
    <div ref={imgRef} className={`relative overflow-hidden ${className}`}>
      {/* Placeholder */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <img 
            src={placeholder} 
            alt="Loading placeholder"
            className="w-full h-full object-contain opacity-50"
          />
        </div>
      )}
      
      {/* Actual image */}
      {isInView && (
        <img
          src={imageSrc}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          className={`w-full h-full object-contain transition-all duration-700 ${
            isLoaded ? 'opacity-100 blur-0' : 'opacity-0 blur-md scale-95'
          }`}
          loading="lazy"
          decoding="async"
          {...props}
        />
      )}
    </div>
  );
};

export default OptimizedImage;
