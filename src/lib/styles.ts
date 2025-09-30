import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines and merges CSS class names using clsx and tailwind-merge.
 * This utility function handles conditional classes and resolves Tailwind CSS conflicts.
 *
 * @param inputs - Variable number of class values (strings, objects, arrays, etc.)
 * @returns string - Merged and deduplicated class names
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Predefined card style configurations for consistent UI components.
 * Each style includes background, border, shadow, and hover effects.
 */
export const cardStyles = {
  default:
    "bg-card border border-border shadow-sm hover:shadow-md transition-shadow",
  elevated:
    "bg-card border border-border shadow-lg hover:shadow-xl transition-all duration-300",
  glass: "bg-card/80 backdrop-blur-sm border border-border/50 shadow-lg",
  minimal: "bg-card border-0 shadow-none hover:bg-accent/50 transition-colors",
  interactive:
    "bg-card border border-border shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-200 cursor-pointer",
  empty: "bg-card/50 border border-dashed border-border/50 shadow-none",
  glowing:
    "bg-card border border-border shadow-lg hover:shadow-xl hover:shadow-primary/20 transition-all duration-300",
} as const;

/**
 * Gradient style configurations for backgrounds and accents.
 * Includes various color combinations and directions.
 */
export const gradientStyles = {
  primary: "bg-gradient-to-r from-primary to-primary/80",
  secondary: "bg-gradient-to-r from-secondary to-secondary/80",
  accent: "bg-gradient-to-r from-accent to-accent/80",
  warning: "bg-gradient-to-r from-yellow-500 to-orange-500",
  error: "bg-gradient-to-r from-red-500 to-red-600",
  success: "bg-gradient-to-r from-green-500 to-emerald-500",
  info: "bg-gradient-to-r from-blue-500 to-cyan-500",
  muted: "bg-gradient-to-r from-muted to-muted/60",
  // Modern gradients
  modern1: "bg-gradient-modern-1",
  modern2: "bg-gradient-modern-2",
  modern3: "bg-gradient-modern-3",
  modern4: "bg-gradient-modern-4",
  modern5: "bg-gradient-modern-5",
  modern6: "bg-gradient-modern-6",
  violet: "bg-gradient-violet",
  indigo: "bg-gradient-indigo",
  pink: "bg-gradient-pink",
  teal: "bg-gradient-teal",
  cyan: "bg-gradient-cyan",
  page: "bg-gradient-to-br from-background via-background/95 to-muted/20",
  card: "bg-gradient-to-br from-card to-card/80",
  iconPrimary: "bg-gradient-to-br from-primary to-primary/80",
} as const;

/**
 * Animation style configurations for smooth transitions and effects.
 * Includes fade, slide, scale, and bounce animations.
 */
export const animationStyles = {
  fadeIn: "animate-fadeIn",
  slideUp: "animate-slideUp",
  slideDown: "animate-slideDown",
  scaleIn: "animate-scaleIn",
  bounceIn: "animate-bounceIn",
  slideInRight: "animate-slideInRight",
  slideInLeft: "animate-slideInLeft",
} as const;

/**
 * Button style configurations with different variants and sizes.
 * Includes hover effects and proper accessibility states.
 */
export const buttonStyles = {
  primary:
    "bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary/20",
  secondary:
    "bg-secondary text-secondary-foreground hover:bg-secondary/80 focus:ring-secondary/20",
  success: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500/20",
  destructive:
    "bg-destructive text-destructive-foreground hover:bg-destructive/90 focus:ring-destructive/20",
  outline:
    "border border-input bg-background hover:bg-accent hover:text-accent-foreground focus:ring-ring/20",
  ghost: "hover:bg-accent hover:text-accent-foreground focus:ring-ring/20",
} as const;

/**
 * Generates consistent color classes based on a color type or percentage.
 * Useful for creating themed components with consistent styling.
 *
 * @param colorOrPercentage - The color type or percentage to generate classes for
 * @returns object - Object containing text, background, and border classes
 */
export function getColorClasses(
  colorOrPercentage:
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "error"
    | "info"
    | "muted"
    | number
) {
  const colorMap = {
    primary: {
      text: "text-primary",
      bg: "bg-primary",
      border: "border-primary",
      hover: "hover:bg-primary/10",
    },
    secondary: {
      text: "text-secondary-foreground",
      bg: "bg-secondary",
      border: "border-secondary",
      hover: "hover:bg-secondary/80",
    },
    success: {
      text: "text-green-400",
      bg: "bg-green-400",
      border: "border-green-500",
      hover: "hover:bg-green-500",
    },
    warning: {
      text: "text-yellow-400",
      bg: "bg-yellow-400",
      border: "border-yellow-500",
      hover: "hover:bg-yellow-500",
    },
    error: {
      text: "text-red-400",
      bg: "bg-red-400",
      border: "border-red-500",
      hover: "hover:bg-red-500",
    },
    info: {
      text: "text-blue-400",
      bg: "bg-blue-400",
      border: "border-blue-500",
      hover: "hover:bg-blue-500",
    },
    muted: {
      text: "text-muted-foreground",
      bg: "bg-muted",
      border: "border-muted",
      hover: "hover:bg-muted/80",
    },
  };

  // If it's a number (percentage), determine color based on value
  if (typeof colorOrPercentage === "number") {
    // Handle NaN or invalid numbers
    if (isNaN(colorOrPercentage) || !isFinite(colorOrPercentage)) {
      return colorMap.muted;
    }

    if (colorOrPercentage >= 80) {
      return colorMap.success;
    } else if (colorOrPercentage >= 50) {
      return colorMap.warning;
    } else if (colorOrPercentage <= 20) {
      return colorMap.error;
    } else {
      return colorMap.muted;
    }
  }

  // Handle invalid string keys
  if (typeof colorOrPercentage === "string" && colorOrPercentage in colorMap) {
    return colorMap[colorOrPercentage as keyof typeof colorMap];
  }

  // Fallback to muted for any invalid input
  return colorMap.muted;
}
