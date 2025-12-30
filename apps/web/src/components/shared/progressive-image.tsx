"use client";

import { useState, useCallback } from "react";
import Image, { type ImageProps } from "next/image";
import { cn } from "@/lib/utils";

interface ProgressiveImageProps extends Omit<ImageProps, "onLoad"> {
  /**
   * Optional placeholder color/gradient while loading
   */
  placeholderColor?: string;
  /**
   * Show a skeleton while loading
   */
  showSkeleton?: boolean;
}

/**
 * Progressive image loading component with fade-in animation.
 * Uses Next.js Image optimization with added UX for loading states.
 * 
 * @example
 * ```tsx
 * <ProgressiveImage
 *   src="/hero.jpg"
 *   alt="Hero image"
 *   width={800}
 *   height={400}
 *   priority
 * />
 * ```
 */
export function ProgressiveImage({
  className,
  placeholderColor = "hsl(var(--muted))",
  showSkeleton = true,
  ...props
}: ProgressiveImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div
      className={cn(
        "relative overflow-hidden",
        className
      )}
      style={{
        backgroundColor: !isLoaded && showSkeleton ? placeholderColor : undefined,
      }}
    >
      {/* Skeleton pulse animation while loading */}
      {!isLoaded && showSkeleton && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      )}
      
      <Image
        {...props}
        className={cn(
          "transition-opacity duration-300",
          isLoaded ? "opacity-100" : "opacity-0",
          className
        )}
        onLoad={handleLoad}
      />
    </div>
  );
}

/**
 * Avatar image with fallback initials.
 */
interface AvatarImageProps {
  src?: string | null;
  alt: string;
  name?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
};

export function AvatarImage({
  src,
  alt,
  name,
  size = "md",
  className,
}: AvatarImageProps) {
  const [hasError, setHasError] = useState(false);

  const getInitials = (name?: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (!src || hasError) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-full bg-primary/10 text-primary font-medium",
          sizeClasses[size],
          className
        )}
      >
        {getInitials(name)}
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={size === "lg" ? 48 : size === "md" ? 40 : 32}
      height={size === "lg" ? 48 : size === "md" ? 40 : 32}
      className={cn(
        "rounded-full object-cover",
        sizeClasses[size],
        className
      )}
      onError={() => setHasError(true)}
    />
  );
}
