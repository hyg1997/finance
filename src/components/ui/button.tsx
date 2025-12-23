import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef, ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden active:scale-95 group",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow-lg hover:shadow-primary/25 transform hover:-translate-y-0.5 transition-all duration-200",
        destructive:
          "bg-error text-error-foreground hover:bg-error/90 shadow-sm hover:shadow-lg hover:shadow-error/25 transform hover:-translate-y-0.5 transition-all duration-200",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground shadow-sm hover:shadow-md hover:border-primary/50 transition-all duration-200",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-200",
        ghost:
          "hover:bg-accent hover:text-accent-foreground transition-all duration-200",
        link: "text-primary underline-offset-4 hover:underline transition-all duration-200",
        success:
          "bg-success text-success-foreground hover:bg-success/90 shadow-sm hover:shadow-lg hover:shadow-success/25 transform hover:-translate-y-0.5 transition-all duration-200",
        warning:
          "bg-warning text-warning-foreground hover:bg-warning/90 shadow-sm hover:shadow-lg hover:shadow-warning/25 transform hover:-translate-y-0.5 transition-all duration-200",
      },
      size: {
        default: "h-10 px-4 py-2 min-w-[44px]",
        sm: "h-9 rounded-md px-3 min-w-[36px]",
        lg: "h-12 rounded-lg px-8 min-w-[48px]",
        xl: "h-14 rounded-lg px-10 text-base min-w-[56px]",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8",
        "icon-lg": "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";

    if (asChild) {
      return (
        <Comp
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          {...props}
        >
          {children}
        </Comp>
      );
    }

    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size, className }),
          "cursor-pointer"
        )}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        <span className="absolute inset-0 overflow-hidden rounded-[inherit]">
          <span className="absolute inset-0 bg-white/10 opacity-0 transition-opacity duration-200 hover:opacity-100" />
        </span>

        <span className="relative flex items-center justify-center gap-2">
          {loading ? (
            <svg
              className="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          ) : leftIcon ? (
            leftIcon
          ) : null}

          {children}

          {!loading && rightIcon && rightIcon}
        </span>
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
