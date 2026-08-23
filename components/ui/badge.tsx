import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-lg border px-2.5 py-0.5 text-xs font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-orange-600 text-white shadow-sm",
        secondary:
          "border-stone-200 dark:border-stone-800 bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200",
        destructive:
          "border-transparent bg-red-600 text-white shadow-sm",
        outline:
          "text-stone-800 dark:text-stone-200 border-stone-300 dark:border-stone-700 bg-white/50 dark:bg-stone-900/50",
        success:
          "border-emerald-200 dark:border-emerald-900 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300",
        warning:
          "border-amber-200 dark:border-amber-900 bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300",
        info:
          "border-orange-200 dark:border-orange-900 bg-orange-100 dark:bg-orange-950 text-orange-800 dark:text-orange-300",
        purple:
          "border-purple-200 dark:border-purple-900 bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
