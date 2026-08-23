"use client";

import React, { useState } from "react";
import { StatementSummary } from "@/types";
import {
  Wifi,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Zap,
} from "lucide-react";
import confetti from "canvas-confetti";

interface ConcessionSmartCardProps {
  summary: StatementSummary;
  passCostDollars: number;
  onSimulateTap?: () => void;
}

export function ConcessionSmartCard({
  summary,
  passCostDollars,
  onSimulateTap,
}: ConcessionSmartCardProps) {
  const [isTapped, setIsTapped] = useState(false);

  const normalFare = summary.totalNormalFareDollars;
  const netSavings = Number((normalFare - passCostDollars).toFixed(2));
  const isProfitable = netSavings >= 0;
  const roiPercentage =
    passCostDollars > 0
      ? Number(((netSavings / passCostDollars) * 100).toFixed(1))
      : 0;

  const handleCardTap = () => {
    setIsTapped(true);
    setTimeout(() => setIsTapped(false), 600);

    confetti({
      particleCount: isProfitable ? 60 : 30,
      spread: isProfitable ? 70 : 45,
      origin: { y: 0.6 },
      colors: isProfitable 
        ? ["#f97316", "#fbbf24", "#10b981", "#ea580c"]
        : ["#ef4444", "#f59e0b", "#d97706", "#b45309"],
    });

    if (onSimulateTap) {
      onSimulateTap();
    }
  };

  const cardHolderName = summary.cardName || "TRANSIT COMMUTER";
  const cardNumber = summary.cardNumber || "8000 •••• •••• 3365";
  const billingPeriod = summary.billingPeriod || "JULY 2026";

  return (
    <div className="relative group select-none">
      {/* Outer Card Shell with Warm Orange & Charcoal Aesthetic */}
      <div
        onClick={handleCardTap}
        className={`relative w-full max-w-md mx-auto aspect-[1.586/1] rounded-2xl p-5 sm:p-6 shadow-2xl transition-all duration-300 transform cursor-pointer overflow-hidden border border-orange-500/30 ${
          isTapped
            ? "scale-95 ring-4 ring-orange-500/50"
            : "hover:-translate-y-1 hover:shadow-orange-950/40"
        } ${
          isProfitable
            ? "bg-gradient-to-br from-[#1C1917] via-[#2A1E17] to-[#9A3412] text-white shadow-orange-950/50"
            : "bg-gradient-to-br from-[#1C1917] via-[#26201B] to-[#43281C] text-white shadow-stone-950/50"
        }`}
      >
        {/* Iridescent background mesh and warm transit wave lines */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-orange-500/25 via-amber-500/15 to-transparent pointer-events-none" />
        <div className="absolute -right-16 -bottom-16 w-56 h-56 bg-orange-600/15 rounded-full blur-3xl pointer-events-none" />
        
        {/* Subtle decorative transit tracks pattern */}
        <svg
          className="absolute right-0 top-0 h-full w-2/3 opacity-15 pointer-events-none"
          viewBox="0 0 200 120"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M0,20 Q60,100 120,40 T200,80" stroke="#f97316" />
          <path d="M0,45 Q70,115 130,55 T200,95" stroke="#fbbf24" />
          <path d="M0,70 Q80,130 140,70 T200,110" stroke="#f97316" />
          <circle cx="120" cy="40" r="4" fill="#fbbf24" />
          <circle cx="160" cy="65" r="4" fill="#f97316" />
        </svg>

        {/* Top Card Row: EMV Chip + SimplyGo Brand */}
        <div className="relative z-10 flex items-start justify-between">
          <div className="flex items-center gap-3">
            {/* Realistic Gold EMV Chip */}
            <div className="w-11 h-8 rounded-md bg-gradient-to-br from-amber-200 via-amber-400 to-yellow-600 p-0.5 shadow-inner border border-amber-300/70 relative overflow-hidden flex items-center justify-center">
              <div className="w-full h-[1px] bg-amber-800/40 absolute top-2.5" />
              <div className="w-full h-[1px] bg-amber-800/40 absolute bottom-2.5" />
              <div className="h-full w-[1px] bg-amber-800/40 absolute left-3.5" />
              <div className="h-full w-[1px] bg-amber-800/40 absolute right-3.5" />
              <div className="w-3.5 h-3 rounded-[3px] border border-amber-800/50 bg-amber-300/80" />
            </div>

            {/* NFC Contactless Waves */}
            <div className="text-amber-200/80 rotate-90 transform">
              <Wifi className="h-4 w-4" />
            </div>
          </div>

          <div className="text-right">
            <div className="flex items-center justify-end gap-1.5 font-black text-sm tracking-tight text-white">
              <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-yellow-200 bg-clip-text text-transparent">
                SimplyGo
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-500/30 text-orange-200 border border-orange-400/40 uppercase tracking-widest font-mono">
                CONCESSION
              </span>
            </div>
            <div className="text-[10px] font-medium text-amber-200/70 tracking-wider mt-0.5 font-mono">
              SG FARE CARD
            </div>
          </div>
        </div>

        {/* Middle Card: Live Concession Breakeven Status Stamp */}
        <div className="relative z-10 my-3.5 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-amber-200/70 font-mono">
              Monthly pass
            </div>
            <div className="text-lg sm:text-xl font-black text-white tracking-tight flex items-baseline gap-1.5">
              ${passCostDollars.toFixed(2)}
              <span className="text-xs font-normal text-amber-200/60">/ mo</span>
            </div>
          </div>

          <div className="text-right">
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold shadow-lg backdrop-blur-md border ${
                isProfitable
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/40 shadow-emerald-950/50"
                  : "bg-amber-500/20 text-amber-300 border-amber-400/40 shadow-amber-950/50"
              }`}
            >
              {isProfitable ? (
                <>
                  <TrendingUp className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>+{roiPercentage}% ROI (+${netSavings.toFixed(2)})</span>
                </>
              ) : (
                <>
                  <TrendingDown className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                  <span>{roiPercentage}% ROI (-${Math.abs(netSavings).toFixed(2)})</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Card Row: Card Number, Holder Name, Period, Tap Prompt */}
        <div className="relative z-10 flex items-end justify-between pt-1">
          <div>
            <div className="font-mono text-xs sm:text-sm tracking-widest text-amber-100/90 font-bold mb-1">
              {cardNumber}
            </div>
            <div className="text-[11px] font-bold text-white uppercase tracking-wider">
              {cardHolderName}
            </div>
            <div className="text-[9px] text-amber-200/60 uppercase tracking-wider font-mono">
              VALID: {billingPeriod}
            </div>
          </div>

          <div className="text-right">
            <div className="inline-flex items-center gap-1 text-[10px] text-orange-300 bg-orange-950/60 px-2 py-0.5 rounded-full border border-orange-500/30">
              <Zap className="h-2.5 w-2.5 text-amber-400 animate-pulse" />
              <span>Tap to test</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Footnote under card */}
      <div className="text-center mt-2.5">
        <span className="text-[11px] text-stone-500 dark:text-stone-400 flex items-center justify-center gap-1">
          <Sparkles className="h-3 w-3 text-orange-500" />
          Interactive card • Tap to test celebration
        </span>
      </div>
    </div>
  );
}
