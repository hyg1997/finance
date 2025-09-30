import { Loader2 } from "lucide-react";
import React from "react";

import { cn } from "@/lib/styles";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "default" | "primary" | "secondary";
  className?: string;
  text?: string;
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
  xl: "h-12 w-12",
} as const;

const variantClasses = {
  default: "text-gray-500",
  primary: "text-blue-600",
  secondary: "text-gray-400",
} as const;

export function LoadingSpinner({
  size = "md",
  variant = "default",
  className,
  text,
}: LoadingSpinnerProps) {
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className="flex flex-col items-center gap-2">
        <Loader2
          className={cn(
            "animate-spin",
            sizeClasses[size],
            variantClasses[variant]
          )}
        />
        {text && (
          <p className={cn("text-sm font-medium", variantClasses[variant])}>
            {text}
          </p>
        )}
      </div>
    </div>
  );
}

export function PageLoadingSpinner({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingSpinner size="lg" variant="primary" text={text} />
    </div>
  );
}

export function ButtonLoadingSpinner({ size = "sm" }: { size?: "sm" | "md" }) {
  return <Loader2 className={cn("animate-spin", sizeClasses[size])} />;
}

export function CardLoadingSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="bg-muted rounded-lg p-6 space-y-4 loading-skeleton">
        <div className="h-4 bg-muted-foreground/20 rounded w-3/4"></div>
        <div className="space-y-2">
          <div className="h-3 bg-muted-foreground/20 rounded"></div>
          <div className="h-3 bg-muted-foreground/20 rounded w-5/6"></div>
        </div>
        <div className="h-8 bg-muted-foreground/20 rounded w-1/3"></div>
      </div>
    </div>
  );
}

export function TableLoadingSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="animate-pulse space-y-4">
      {Array.from({ length: rows }).map((_, index) => (
        // eslint-disable-next-line react/no-array-index-key
        <div key={`table-row-skeleton-${index}`} className="flex space-x-4">
          <div className="h-4 bg-gray-300 rounded w-1/4"></div>
          <div className="h-4 bg-gray-300 rounded w-1/3"></div>
          <div className="h-4 bg-gray-300 rounded w-1/6"></div>
          <div className="h-4 bg-gray-300 rounded w-1/4"></div>
        </div>
      ))}
    </div>
  );
}
