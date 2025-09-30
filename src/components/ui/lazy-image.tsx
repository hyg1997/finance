"use client";

import Image from "next/image";
import { useState, useRef, useEffect, memo } from "react";

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  fill?: boolean;
  priority?: boolean;
}

export const LazyImage = memo(function LazyImage({
  src,
  alt,
  className = "",
  width = 200,
  height = 200,
  fill = false,
  priority = false,
}: LazyImageProps) {
  const [isInView, setIsInView] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (priority) {
      setIsInView(true);
      return;
    }

    if (!imgRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry && entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(imgRef.current);

    return () => observer.disconnect();
  }, [priority]);

  return (
    <div ref={imgRef} className={`relative overflow-hidden ${className}`}>
      {isInView && (
        <>
          {fill ? (
            <Image
              src={src}
              alt={alt}
              fill
              priority={priority}
              className={`transition-opacity duration-300 ${
                isLoaded ? "opacity-100" : "opacity-0"
              }`}
              onLoad={() => setIsLoaded(true)}
              sizes="100vw"
            />
          ) : (
            <Image
              src={src}
              alt={alt}
              width={width}
              height={height}
              priority={priority}
              className={`transition-opacity duration-300 ${
                isLoaded ? "opacity-100" : "opacity-0"
              }`}
              onLoad={() => setIsLoaded(true)}
              sizes={`${width}px`}
            />
          )}
        </>
      )}
      {!isLoaded && (
        <div 
          className="absolute inset-0 bg-gray-200 animate-pulse"
          style={!fill ? { width, height } : undefined}
        />
      )}
    </div>
  );
});
