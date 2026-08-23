"use client";

import React, { useEffect } from "react";
import { StatementSummary } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ConcessionSmartCard } from "./ConcessionSmartCard";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Ticket,
  Percent,
  Route,
  AlertCircle,
  CheckCircle2,
  Train,
  Bus,
  ShieldCheck,
  Zap,
} from "lucide-react";
import confetti from "canvas-confetti";

interface RoiSummaryCardsProps {
  summary: StatementSummary;
  passCostDollars: number;
}

export function RoiSummaryCards({
  summary,
  passCostDollars,
}: RoiSummaryCardsProps) {
  const normalFare = summary.totalNormalFareDollars;
  const netSavings = Number((normalFare - passCostDollars).toFixed(2));
  const isProfitable = netSavings >= 0;
  const roiPercentage =
    passCostDollars > 0
      ? Number(((netSavings / passCostDollars) * 100).toFixed(1))
      : 0;

  const breakevenProgress =
    passCostDollars > 0
      ? Math.min(100, Math.round((normalFare / passCostDollars) * 100))
      : 100;

  // Trigger celebratory confetti on profitable mount
  useEffect(() => {
    if (isProfitable) {
      const timer = setTimeout(() => {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.5 },
          colors: ["#f97316", "#fbbf24", "#10b981", "#ea580c"],
        });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isProfitable, summary.totalNormalFareDollars, passCostDollars]);

  return (
    <div className="space-y-6">
      {/* Top Section: Smart Card & Gantry Verdict Side-by-Side */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: Interactive Tactile Smart Card (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-center">
          <ConcessionSmartCard
            summary={summary}
            passCostDollars={passCostDollars}
          />
        </div>

        {/* Right: Gantry Gate Verdict & Breakeven Gauge (7 cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between">
          <Card
            className={`h-full border-2 overflow-hidden flex flex-col justify-between ${
              isProfitable
                ? "border-emerald-500/40 bg-gradient-to-br from-emerald-500/5 via-[#FFFDF9] dark:via-[#241F1C] to-emerald-500/10"
                : "border-amber-500/40 bg-gradient-to-br from-amber-500/5 via-[#FFFDF9] dark:via-[#241F1C] to-orange-500/10"
            }`}
          >
            <CardContent className="p-5 sm:p-6 flex flex-col justify-between h-full space-y-5">
              {/* Gantry Display Header */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                      <span
                        className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                          isProfitable ? "bg-emerald-400" : "bg-orange-400"
                        }`}
                      />
                      <span
                        className={`relative inline-flex rounded-full h-3 w-3 ${
                          isProfitable ? "bg-emerald-500" : "bg-orange-500"
                        }`}
                      />
                    </span>
                    <span className="text-[11px] font-mono uppercase tracking-widest font-bold text-stone-500 dark:text-stone-400">
                      SimplyGo Breakeven Matrix
                    </span>
                  </div>

                  <Badge
                    variant={isProfitable ? "success" : "warning"}
                    className="text-xs px-2.5 py-0.5 font-bold shadow-sm"
                  >
                    {isProfitable
                      ? `+${roiPercentage}% ROI`
                      : `${roiPercentage}% ROI`}
                  </Badge>
                </div>

                <div className="flex items-start gap-3.5">
                  <div
                    className={`p-3 rounded-2xl shrink-0 ${
                      isProfitable
                        ? "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 shadow-sm"
                        : "bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 shadow-sm"
                    }`}
                  >
                    {isProfitable ? (
                      <CheckCircle2 className="h-6 w-6" />
                    ) : (
                      <AlertCircle className="h-6 w-6" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-black text-stone-900 dark:text-white tracking-tight">
                      {isProfitable
                        ? `🎉 Pass saves $${netSavings.toFixed(2)}`
                        : `💡 Pay-per-ride saves $${Math.abs(netSavings).toFixed(2)}`}
                    </h3>
                    <p className="text-xs text-stone-600 dark:text-stone-300 mt-1 leading-relaxed">
                      {isProfitable
                        ? `Your trips cost $${normalFare.toFixed(2)} in standard distance fares, beating the $${passCostDollars.toFixed(2)} pass cost (+${roiPercentage}% ROI). The pass saved you money.`
                        : `Your trips only used $${normalFare.toFixed(2)} of the $${passCostDollars.toFixed(2)} pass cost (${breakevenProgress}% of breakeven). Paying per ride would have saved you $${Math.abs(netSavings).toFixed(2)}.`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Interactive Breakeven Progress Bar */}
              <div className="space-y-2 pt-2 border-t border-stone-200/80 dark:border-stone-800">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-stone-600 dark:text-stone-400 flex items-center gap-1">
                    <Zap className="h-3.5 w-3.5 text-orange-500" />
                    Breakeven target
                  </span>
                  <span className="font-mono font-bold text-stone-900 dark:text-white">
                    ${normalFare.toFixed(2)} / ${passCostDollars.toFixed(2)} ({breakevenProgress}%)
                  </span>
                </div>

                <div className="relative pt-1">
                  <Progress
                    value={normalFare}
                    max={passCostDollars}
                    className="h-3"
                    indicatorClassName={
                      isProfitable
                        ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                        : "bg-gradient-to-r from-orange-500 to-amber-400"
                    }
                  />

                  {/* Milestone Marker */}
                  <div className="flex justify-between text-[10px] text-stone-400 font-mono mt-1.5">
                    <span>$0.00 (Start)</span>
                    <span className="font-bold text-stone-700 dark:text-stone-300">
                      🎯 ${passCostDollars.toFixed(2)} Breakeven
                    </span>
                    <span>
                      {normalFare > passCostDollars
                        ? `+$${(normalFare - passCostDollars).toFixed(2)} Net Profit`
                        : `${breakevenProgress}% Funded`}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 4 Core High-Impact KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Standard Fare */}
        <Card className="border-stone-200 dark:border-stone-800 bg-[#FFFDF9] dark:bg-[#241F1C] shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider font-mono">
                Card Fare Equivalent
              </span>
              <div className="p-2 bg-orange-100/70 dark:bg-orange-950/60 rounded-xl text-orange-600 dark:text-orange-400">
                <DollarSign className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2.5 flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white font-mono tracking-tight">
                ${normalFare.toFixed(2)}
              </span>
              <span className="text-xs text-stone-500 dark:text-stone-400">
                actual fare
              </span>
            </div>
            <div className="mt-3.5 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 pt-2.5 border-t border-stone-100 dark:border-stone-800">
              <span className="flex items-center gap-1 font-medium">
                <Ticket className="h-3.5 w-3.5 text-orange-500" />
                {summary.totalTrips} total legs
              </span>
              <span className="flex items-center gap-1 font-medium">
                <Route className="h-3.5 w-3.5 text-amber-500" />
                {summary.totalDistanceKm} km
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Pass Cost Benchmark */}
        <Card className="border-stone-200 dark:border-stone-800 bg-[#FFFDF9] dark:bg-[#241F1C] shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider font-mono">
                Monthly Pass Rate
              </span>
              <div className="p-2 bg-amber-100/70 dark:bg-amber-950/60 rounded-xl text-amber-600 dark:text-amber-400">
                <Ticket className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2.5 flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white font-mono tracking-tight">
                ${passCostDollars.toFixed(2)}
              </span>
              <span className="text-xs text-stone-500 dark:text-stone-400">
                per month
              </span>
            </div>
            <div className="mt-3.5 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 pt-2.5 border-t border-stone-100 dark:border-stone-800">
              <span className="flex items-center gap-1.5">
                <Train className="h-3.5 w-3.5 text-orange-500" />
                {summary.totalTrainTrips} Train
                <span className="text-stone-300 dark:text-stone-700">•</span>
                <Bus className="h-3.5 w-3.5 text-amber-500" />
                {summary.totalBusTrips} Bus
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Net Profit / Loss */}
        <Card
          className={`border-stone-200 dark:border-stone-800 shadow-sm hover:shadow-md transition-shadow ${
            isProfitable
              ? "bg-gradient-to-b from-emerald-50/50 dark:from-emerald-950/20 to-[#FFFDF9] dark:to-[#241F1C]"
              : "bg-gradient-to-b from-orange-50/50 dark:from-orange-950/20 to-[#FFFDF9] dark:to-[#241F1C]"
          }`}
        >
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider font-mono">
                Net Profit / Deficit
              </span>
              <div
                className={`p-2 rounded-xl ${
                  isProfitable
                    ? "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400"
                    : "bg-orange-100 dark:bg-orange-950/80 text-orange-600 dark:text-orange-400"
                }`}
              >
                {isProfitable ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
              </div>
            </div>
            <div className="mt-2.5 flex items-baseline gap-1.5">
              <span
                className={`text-2xl sm:text-3xl font-black font-mono tracking-tight ${
                  isProfitable
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-orange-600 dark:text-orange-400"
                }`}
              >
                {isProfitable
                  ? `+$${netSavings.toFixed(2)}`
                  : `-$${Math.abs(netSavings).toFixed(2)}`}
              </span>
              <span className="text-xs text-stone-500 dark:text-stone-400">
                {isProfitable ? "saved" : "deficit"}
              </span>
            </div>
            <div className="mt-3.5 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 pt-2.5 border-t border-stone-100 dark:border-stone-800">
              <span>Transfer Rebates</span>
              <span className="font-semibold text-stone-800 dark:text-stone-200 font-mono">
                ${summary.totalTransferSavingsDollars.toFixed(2)} saved
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Card 4: ROI % */}
        <Card className="border-stone-200 dark:border-stone-800 bg-[#FFFDF9] dark:bg-[#241F1C] shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider font-mono">
                Return on Investment
              </span>
              <div className="p-2 bg-orange-100/70 dark:bg-orange-950/60 rounded-xl text-orange-600 dark:text-orange-400">
                <Percent className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2.5 flex items-baseline gap-1.5">
              <span
                className={`text-2xl sm:text-3xl font-black font-mono tracking-tight ${
                  isProfitable
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-orange-600 dark:text-orange-400"
                }`}
              >
                {roiPercentage >= 0 ? `+${roiPercentage}%` : `${roiPercentage}%`}
              </span>
              <span className="text-xs text-stone-500 dark:text-stone-400">
                net yield
              </span>
            </div>
            <div className="mt-3.5 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 pt-2.5 border-t border-stone-100 dark:border-stone-800">
              <span>Breakeven Target</span>
              <span className="font-semibold text-stone-800 dark:text-stone-200 font-mono">
                ${passCostDollars.toFixed(2)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Metadata Pill Banner */}
      {(summary.cardName ||
        summary.cardNumber ||
        summary.billingPeriod ||
        summary.statementDate) && (
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-stone-600 dark:text-stone-400 bg-stone-100/80 dark:bg-stone-900/60 p-3.5 rounded-xl border border-stone-200/80 dark:border-stone-800">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 font-mono">
            {summary.cardName && (
              <div>
                <span className="font-bold text-stone-800 dark:text-stone-200">
                  Card Name:
                </span>{" "}
                {summary.cardName}
              </div>
            )}
            {summary.cardNumber && (
              <div>
                <span className="font-bold text-stone-800 dark:text-stone-200">
                  CAN:
                </span>{" "}
                {summary.cardNumber}
              </div>
            )}
            {summary.billingPeriod && (
              <div>
                <span className="font-bold text-stone-800 dark:text-stone-200">
                  Statement Period:
                </span>{" "}
                {summary.billingPeriod}
              </div>
            )}
          </div>

          <div className="text-[11px] text-stone-500 font-sans flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-orange-500" />
            Verified Distance Fare Matrix (2026)
          </div>
        </div>
      )}
    </div>
  );
}
