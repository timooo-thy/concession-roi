import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer select-none active:scale-95",
  {
    variants: {
      variant: {
        default:
          "bg-orange-600 hover:bg-orange-500 text-white shadow-md shadow-orange-600/20 active:bg-orange-700",
        destructive:
          "bg-red-600 text-white shadow-sm hover:bg-red-700 active:bg-red-800",
        outline:
          "border border-stone-300 dark:border-stone-800 bg-white/80 dark:bg-stone-900/80 shadow-sm hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-orange-600 dark:hover:text-orange-400 text-stone-800 dark:text-stone-200",
        secondary:
          "bg-amber-100/70 dark:bg-stone-800 text-stone-800 dark:text-stone-100 shadow-sm hover:bg-amber-200/70 dark:hover:bg-stone-700",
        ghost:
          "hover:bg-orange-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 hover:text-orange-600 dark:hover:text-orange-400",
        link: "text-orange-600 underline-offset-4 hover:underline",
        success:
          "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20",
        orange:
          "bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white shadow-md shadow-orange-600/25",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-11 rounded-xl px-8 text-base",
        icon: "h-9 w-9 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
