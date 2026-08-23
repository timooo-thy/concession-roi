"use client";

import React, { useState } from "react";
import { STANDARD_PASS_PRESETS } from "@/lib/fare-calculator";
import { PassTypeConfig } from "@/types";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { CreditCard, Edit3, CheckCircle2, Train, Bus } from "lucide-react";

interface PassSelectorProps {
  currentPassCost: number;
  selectedPresetId: string;
  onPassChange: (presetId: string, customPrice?: number) => void;
}

export function PassSelector({
  currentPassCost,
  selectedPresetId,
  onPassChange,
}: PassSelectorProps) {
  const [isCustom, setIsCustom] = useState(selectedPresetId === "custom");
  const [customPriceInput, setCustomPriceInput] = useState<string>(
    currentPassCost.toString()
  );

  const handleSelectPreset = (preset: PassTypeConfig) => {
    setIsCustom(false);
    setCustomPriceInput(preset.priceDollars.toString());
    onPassChange(preset.id, preset.priceDollars);
  };

  const handleCustomPriceChange = (val: string) => {
    setCustomPriceInput(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num >= 0) {
      onPassChange("custom", num);
    }
  };

  const handleSliderChange = (vals: number[]) => {
    const val = vals[0];
    setIsCustom(true);
    setCustomPriceInput(val.toString());
    onPassChange("custom", val);
  };

  return (
    <Card className="border-stone-200 dark:border-stone-800 bg-[#FFFDF9] dark:bg-[#241F1C] shadow-sm p-4 sm:p-5">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400">
            <CreditCard className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
              Monthly pass cost
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Compare your statement against standard concession pass rates.
            </p>
          </div>
        </div>

        {/* 2-Column Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {/* Preset Option: Official Adult Hybrid Pass */}
          {STANDARD_PASS_PRESETS.map((preset) => {
            const isSelected = !isCustom && selectedPresetId === preset.id;
            return (
              <div
                key={preset.id}
                onClick={() => handleSelectPreset(preset)}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? "border-orange-500 bg-orange-50/70 dark:bg-orange-950/30 dark:border-orange-500 shadow-sm ring-2 ring-orange-500/20"
                    : "border-stone-200 dark:border-stone-800 bg-white/70 dark:bg-stone-900/40 hover:border-stone-300 dark:hover:border-stone-700"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-stone-900 dark:text-stone-100">
                        {preset.name}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 text-[10px] font-bold font-mono">
                        OFFICIAL
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 leading-relaxed">
                      {preset.description}
                    </p>
                  </div>
                  {isSelected && (
                    <CheckCircle2 className="h-5 w-5 text-orange-600 dark:text-orange-400 shrink-0 ml-2" />
                  )}
                </div>

                <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-stone-100 dark:border-stone-800">
                  <div className="flex items-baseline gap-1.5 font-mono">
                    <span className="text-2xl font-black text-stone-900 dark:text-stone-100">
                      ${preset.priceDollars.toFixed(2)}
                    </span>
                    <span className="text-xs text-stone-500 dark:text-stone-400 font-sans">
                      / month
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-orange-600 dark:text-orange-400">
                    <Train className="h-3.5 w-3.5" />
                    <Bus className="h-3.5 w-3.5" />
                    <span>Unlimited Travel</span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Custom Pass Option */}
          <div
            onClick={() => {
              setIsCustom(true);
              const num = parseFloat(customPriceInput) || currentPassCost;
              onPassChange("custom", num);
            }}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
              isCustom
                ? "border-orange-500 bg-orange-50/70 dark:bg-orange-950/30 dark:border-orange-500 shadow-sm ring-2 ring-orange-500/20"
                : "border-stone-200 dark:border-stone-800 bg-white/70 dark:bg-stone-900/40 hover:border-stone-300 dark:hover:border-stone-700"
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                    <Edit3 className="h-3.5 w-3.5 text-orange-500" />
                    Custom monthly rate
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 text-[10px] font-bold font-mono">
                    CUSTOM
                  </span>
                </div>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 leading-relaxed">
                  Adjust the slider to evaluate your personal breakeven point.
                </p>
              </div>
              {isCustom && (
                <CheckCircle2 className="h-5 w-5 text-orange-600 dark:text-orange-400 shrink-0 ml-2" />
              )}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-3 pt-2.5 border-t border-stone-100 dark:border-stone-800">
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-stone-500">$</span>
                <Input
                  type="number"
                  step="1"
                  min="0"
                  max="500"
                  value={customPriceInput}
                  onChange={(e) => handleCustomPriceChange(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="h-8 w-24 px-2.5 py-0 text-base font-black font-mono border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900"
                />
                <span className="text-xs text-stone-500 font-sans">/ month</span>
              </div>

              <div className="w-full sm:w-40 pt-1 sm:pt-0" onClick={(e) => e.stopPropagation()}>
                <Slider
                  value={[currentPassCost]}
                  min={20}
                  max={250}
                  step={1}
                  onValueChange={handleSliderChange}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
