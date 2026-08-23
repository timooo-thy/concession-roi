"use client";

import React, { useState } from "react";
import {
  Train,
  Moon,
  Sun,
  RotateCcw,
  FileSpreadsheet,
  HelpCircle,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FareRulesDialog } from "./FareRulesDialog";
import Image from "next/image";

interface NavbarProps {
  onReset: () => void;
  onExportCsv: () => void;
  hasData: boolean;
}

export function Navbar({ onReset, onExportCsv, hasData }: NavbarProps) {
  const [isDark, setIsDark] = useState<boolean>(false);
  const [isRulesOpen, setIsRulesOpen] = useState<boolean>(false);

  React.useEffect(() => {
    setIsDark(
      document.documentElement.classList.contains("dark") ||
        localStorage.getItem("theme") === "dark",
    );
  }, []);

  const toggleTheme = () => {
    const isCurrentlyDark = document.documentElement.classList.contains("dark");
    if (isCurrentlyDark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDark(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDark(true);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-stone-200/90 dark:border-stone-800/90 bg-[#FAF7F2]/90 dark:bg-[#1A1614]/90 backdrop-blur-md transition-colors">
        <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          {/* Logo & Singapore Transit Pill */}
          <div className="flex items-center gap-3">
            <Image
              src="/icon.png"
              alt="SimplyGo ROI Logo"
              width={50}
              height={50}
              className="rounded-full"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-stone-900 dark:text-stone-50 text-lg tracking-tight">
                  SimplyGo{" "}
                  <span className="text-orange-600 dark:text-orange-500">
                    ROI
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsRulesOpen(true)}
                  className="rounded-full bg-orange-100 dark:bg-orange-950/80 px-2.5 py-0.5 text-[10px] font-bold text-orange-700 dark:text-orange-300 hover:bg-orange-200 transition-colors font-mono cursor-pointer flex items-center gap-1 border border-orange-200 dark:border-orange-900"
                >
                  <Zap className="h-2.5 w-2.5 text-orange-500" />
                  Last Updated: 2026
                </button>
              </div>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsRulesOpen(true)}
              className="text-xs font-semibold text-stone-600 dark:text-stone-400 hover:text-orange-600 dark:hover:text-orange-400 hidden md:flex items-center gap-1.5"
            >
              <HelpCircle className="h-3.5 w-3.5" />
              Fare Rules
            </Button>

            {hasData && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onExportCsv}
                  className="hidden sm:flex items-center gap-1.5 text-xs font-mono font-bold border-stone-300 dark:border-stone-700 bg-white/70 dark:bg-stone-900/60 text-stone-800 dark:text-stone-200 hover:text-orange-600 hover:border-orange-400"
                >
                  <FileSpreadsheet className="h-3.5 w-3.5 text-orange-500" />
                  Export CSV
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onReset}
                  className="text-xs text-stone-500 hover:text-rose-600 dark:hover:text-rose-400 font-semibold"
                >
                  <RotateCcw className="h-3.5 w-3.5 mr-1" />
                  Reset
                </Button>
              </>
            )}

            <Button
              variant="outline"
              size="icon"
              onClick={toggleTheme}
              className="h-9 w-9 rounded-xl border-stone-300 dark:border-stone-700 bg-white/70 dark:bg-stone-900/60 cursor-pointer"
              title={
                isDark
                  ? "Switch to Light (Warm Beige) Theme"
                  : "Switch to Dark Theme"
              }
            >
              {isDark ? (
                <Sun className="h-4 w-4 text-amber-400 transition-all" />
              ) : (
                <Moon className="h-4 w-4 text-stone-700 transition-all" />
              )}
            </Button>
          </div>
        </div>
      </header>

      <FareRulesDialog
        isOpen={isRulesOpen}
        onClose={() => setIsRulesOpen(false)}
      />
    </>
  );
}
