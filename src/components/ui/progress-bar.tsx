import { cn } from "@/lib/utils";

interface ProgressBarProps {
  percentage: number;
  colors: {
    text: string;
    bg: string;
    border: string;
    hover: string;
  };
  className?: string;
  showLabel?: boolean;
}

export function ProgressBar({
  percentage,
  colors,
  className,
  showLabel = false,
}: ProgressBarProps) {
  const clampedPercentage = Math.min(Math.max(percentage, 0), 100);

  return (
    <div className={cn("space-y-1", className)}>
      {showLabel && (
        <div className="flex justify-between items-center text-xs">
          <span className="text-muted-foreground">Available</span>
          <span className={colors.text}>{clampedPercentage.toFixed(1)}%</span>
        </div>
      )}
      <div className="w-full bg-gray-400/50 rounded-full h-2 overflow-hidden">
        <div
          className={cn(
            "h-full transition-all duration-500 ease-out rounded-full",
            colors.bg
          )}
          style={{ width: `${clampedPercentage}%` }}
        />
      </div>
    </div>
  );
}
