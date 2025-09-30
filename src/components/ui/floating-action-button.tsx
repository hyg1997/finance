import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef, useEffect, useState } from "react";

import { cn } from "@/lib/utils";

const fabVariants = cva(
  "fixed inline-flex items-center justify-center rounded-full font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 shadow-lg hover:shadow-2xl hover:shadow-primary/25 active:scale-95 z-modal group hover:scale-110",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90 hover:rotate-90 transition-all duration-300",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:rotate-90 transition-all duration-300",
        success:
          "bg-success text-success-foreground hover:bg-success/90 hover:rotate-90 transition-all duration-300",
        warning:
          "bg-warning text-warning-foreground hover:bg-warning/90 hover:rotate-90 transition-all duration-300",
        error:
          "bg-error text-error-foreground hover:bg-error/90 hover:rotate-90 transition-all duration-300",
      },
      size: {
        default: "h-14 w-14",
        sm: "h-12 w-12",
        lg: "h-16 w-16",
      },
      position: {
        "bottom-right": "bottom-6 right-6",
        "bottom-left": "bottom-6 left-6",
        "bottom-center": "bottom-6 left-1/2 -translate-x-1/2",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      position: "bottom-right",
    },
  }
);

export interface FloatingActionButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof fabVariants> {
  icon?: React.ReactNode;
  label?: string;
  extended?: boolean;
}

const FloatingActionButton = forwardRef<
  HTMLButtonElement,
  FloatingActionButtonProps
>(
  (
    {
      className,
      variant,
      size,
      position,
      icon,
      label,
      extended = false,
      children,
      ...props
    },
    ref
  ) => {
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    useEffect(() => {
      const handleScroll = () => {
        const currentScrollY = window.scrollY;

        if (currentScrollY > lastScrollY && currentScrollY > 100) {
          setIsVisible(false);
        } else {
          setIsVisible(true);
        }

        setLastScrollY(currentScrollY);
      };

      window.addEventListener("scroll", handleScroll, { passive: true });
      return () => window.removeEventListener("scroll", handleScroll);
    }, [lastScrollY]);

    const content = children || (
      <>
        {icon && (
          <span
            className={cn(
              "flex items-center justify-center",
              extended && label && "mr-2"
            )}
          >
            {icon}
          </span>
        )}
        {extended && label && (
          <span className="text-sm font-medium whitespace-nowrap">{label}</span>
        )}
      </>
    );

    return (
      <button
        ref={ref}
        className={cn(
          fabVariants({
            variant,
            size: extended ? undefined : size,
            position,
            className,
          }),
          extended && "px-4 h-14 rounded-full min-w-[56px]",

          isVisible ? "translate-y-0 opacity-100" : "translate-y-16 opacity-0",
          "transition-all duration-300 ease-out"
        )}
        aria-label={label || "Floating action button"}
        {...props}
      >
        <span className="absolute inset-0 overflow-hidden rounded-full">
          <span className="absolute inset-0 bg-white/20 opacity-0 transition-opacity duration-150 hover:opacity-100 rounded-full" />
        </span>

        <span className="relative flex items-center justify-center">
          {content}
        </span>
      </button>
    );
  }
);

FloatingActionButton.displayName = "FloatingActionButton";

export { FloatingActionButton, fabVariants };
