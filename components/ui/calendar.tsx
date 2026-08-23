"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-2", className)}
      classNames={{
        months: "flex flex-col sm:flex-row gap-4 relative",
        month: "space-y-3",
        month_caption: "flex justify-center pt-1 relative items-center mb-2",
        caption_label: "text-sm font-bold font-mono text-stone-900 dark:text-stone-100",
        nav: "flex items-center gap-1",
        button_previous: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-70 hover:opacity-100 absolute left-1 top-0 border-stone-200 dark:border-stone-700"
        ),
        button_next: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-70 hover:opacity-100 absolute right-1 top-0 border-stone-200 dark:border-stone-700"
        ),
        month_grid: "w-full border-collapse space-y-1",
        weekdays: "flex justify-between",
        weekday:
          "text-stone-500 dark:text-stone-400 rounded-md w-8 font-mono font-medium text-[0.8rem] text-center",
        week: "flex w-full mt-1 justify-between",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-8 w-8 p-0 font-mono font-medium text-xs aria-selected:opacity-100 hover:bg-orange-100 dark:hover:bg-orange-950/60 rounded-lg transition-colors"
        ),
        range_end: "day-range-end",
        selected:
          "bg-orange-600 text-white hover:bg-orange-600 hover:text-white focus:bg-orange-600 focus:text-white font-bold shadow-sm shadow-orange-600/30",
        today: "bg-orange-100/70 dark:bg-orange-950/50 text-orange-900 dark:text-orange-300 font-bold border border-orange-300 dark:border-orange-800",
        outside:
          "day-outside text-stone-300 dark:text-stone-600 opacity-50 aria-selected:bg-orange-500/50 aria-selected:text-stone-400 aria-selected:opacity-30",
        disabled: "text-stone-300 dark:text-stone-700 opacity-40 cursor-not-allowed",
        range_middle:
          "aria-selected:bg-orange-100 dark:aria-selected:bg-orange-950 aria-selected:text-orange-900 dark:aria-selected:text-orange-100",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) => {
          if (orientation === "left") {
            return <ChevronLeft className="h-4 w-4 text-stone-700 dark:text-stone-300" />;
          }
          return <ChevronRight className="h-4 w-4 text-stone-700 dark:text-stone-300" />;
        },
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
