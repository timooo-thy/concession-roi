"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as ShadcnCalendar } from "@/components/ui/calendar";
import { PassPeriodResult, parseDateString, formatDateToIso, formatDateToDisplay } from "@/lib/concession-period";
import {
  Calendar as CalendarIcon,
  Clock,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  CalendarDays,
  Info,
  ChevronDown,
} from "lucide-react";

interface ConcessionPeriodSelectorProps {
  activeMode: "full" | "custom";
  onModeChange: (mode: "full" | "custom") => void;
  startDateIso: string;
  onStartDateChange: (dateIso: string) => void;
  calculatedPeriod: PassPeriodResult;
  totalStatementTrips: number;
  inPeriodTripsCount: number;
  recommendedPresets: { label: string; dateStr: string; isoDate: string }[];
}

export function ConcessionPeriodSelector({
  activeMode,
  onModeChange,
  startDateIso,
  onStartDateChange,
  calculatedPeriod,
  totalStatementTrips,
  inPeriodTripsCount,
  recommendedPresets,
}: ConcessionPeriodSelectorProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const selectedDate = startDateIso ? parseDateString(startDateIso) || undefined : undefined;

  const handleSelectDate = (date: Date | undefined) => {
    if (date) {
      onStartDateChange(formatDateToIso(date));
      setIsCalendarOpen(false);
    }
  };

  return (
    <Card className="border-stone-200 dark:border-stone-800 bg-[#FFFDF9] dark:bg-[#241F1C] shadow-sm p-4 sm:p-5">
      <div className="space-y-4">
        {/* Header and Mode Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 dark:border-stone-800 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400 shrink-0">
              <CalendarIcon className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                  Pass Validity & Date Window
                </h3>
                <Badge
                  variant={activeMode === "custom" ? "default" : "outline"}
                  className="text-[10px] px-2 py-0 font-mono font-bold"
                >
                  {activeMode === "custom" ? "1-Month Pass Filter" : "All Records"}
                </Badge>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {activeMode === "custom"
                  ? "Evaluating trips strictly within your 1-month concession validity window."
                  : "Evaluating all trips found across your uploaded statements."}
              </p>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center bg-stone-100 dark:bg-stone-800/80 p-1 rounded-xl shrink-0 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => onModeChange("full")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeMode === "full"
                  ? "bg-white dark:bg-stone-900 text-orange-600 dark:text-orange-400 shadow-sm font-bold"
                  : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200"
              }`}
            >
              Full Statements ({totalStatementTrips} trips)
            </button>
            <button
              type="button"
              onClick={() => onModeChange("custom")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeMode === "custom"
                  ? "bg-white dark:bg-stone-900 text-orange-600 dark:text-orange-400 shadow-sm font-bold"
                  : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200"
              }`}
            >
              <CalendarDays className="h-3.5 w-3.5 text-orange-500" />
              Custom Pass Window
            </button>
          </div>
        </div>

        {/* Custom Period Details & Controls */}
        {activeMode === "custom" && (
          <div className="space-y-4 pt-1 animate-in fade-in-50 duration-200">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              {/* Start Date Picker with Shadcn Popover + Calendar (5 cols) */}
              <div className="md:col-span-5 space-y-1.5">
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-orange-500" />
                  Concession Pass Start Date
                </label>
                
                <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between h-10 px-3 font-mono text-sm font-bold bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white hover:border-orange-500 focus:ring-2 focus:ring-orange-500"
                    >
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                        <span>
                          {selectedDate
                            ? formatDateToDisplay(selectedDate)
                            : calculatedPeriod.startDateStr}
                        </span>
                      </div>
                      <ChevronDown className="h-3.5 w-3.5 text-stone-400 opacity-70" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 border-stone-200 dark:border-stone-800 shadow-2xl rounded-2xl" align="start">
                    <ShadcnCalendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={handleSelectDate}
                      autoFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Calculated Expiry Card (7 cols) */}
              <div className="md:col-span-7 bg-orange-50/70 dark:bg-orange-950/30 border border-orange-200/80 dark:border-orange-900/60 rounded-xl p-3.5">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-[11px] font-bold text-orange-800 dark:text-orange-300 uppercase tracking-wider font-mono flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-orange-600 dark:text-orange-400" />
                    Computed Pass Validity Window
                  </span>
                  <Badge
                    variant="outline"
                    className="text-[10px] bg-white/80 dark:bg-stone-900/80 text-orange-700 dark:text-orange-300 border-orange-300 font-mono"
                  >
                    {calculatedPeriod.totalDays} Days Valid
                  </Badge>
                </div>

                <div className="flex flex-wrap items-center gap-2 font-mono">
                  <span className="text-sm font-black text-stone-900 dark:text-white bg-white/90 dark:bg-stone-900/90 px-2.5 py-1 rounded-lg border border-stone-200/60 dark:border-stone-700 shadow-2xs">
                    {calculatedPeriod.startDateStr}
                  </span>
                  <ArrowRight className="h-4 w-4 text-orange-500 shrink-0" />
                  <span className="text-sm font-black text-stone-900 dark:text-white bg-white/90 dark:bg-stone-900/90 px-2.5 py-1 rounded-lg border border-stone-200/60 dark:border-stone-700 shadow-2xs">
                    {calculatedPeriod.endDateStr} (23:59)
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400 mt-2 pt-1.5 border-t border-orange-200/50 dark:border-orange-900/40">
                  <span className="flex items-center gap-1">
                    <Info className="h-3 w-3 text-orange-500 shrink-0" />
                    Expires day before same numerical date next month.
                  </span>
                  <span className="font-semibold text-orange-700 dark:text-orange-400 font-mono">
                    {inPeriodTripsCount} of {totalStatementTrips} trips in scope
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Preset Buttons */}
            {recommendedPresets.length > 0 && (
              <div className="pt-1 flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold text-stone-500 dark:text-stone-400 flex items-center gap-1 font-mono uppercase">
                  <Sparkles className="h-3 w-3 text-orange-500" />
                  Quick Presets:
                </span>
                {recommendedPresets.slice(0, 4).map((preset) => {
                  const isSelected = startDateIso === preset.isoDate;
                  return (
                    <button
                      key={preset.isoDate + preset.label}
                      type="button"
                      onClick={() => onStartDateChange(preset.isoDate)}
                      className={`text-xs px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer font-medium ${
                        isSelected
                          ? "bg-orange-600 text-white border-orange-600 shadow-2xs font-bold"
                          : "bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:border-orange-400"
                      }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
