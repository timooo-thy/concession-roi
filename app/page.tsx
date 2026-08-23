"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { StatementUploader } from "@/components/StatementUploader";
import { PassSelector } from "@/components/PassSelector";
import { RoiSummaryCards } from "@/components/RoiSummaryCards";
import { TripListTable } from "@/components/TripListTable";
import { ParsedStatementResult } from "@/lib/pdf-parser";
import { CalculatedTrip } from "@/types";
import { calculateFares } from "@/lib/fare-calculator";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, ShieldCheck, Zap, ArrowRightLeft } from "lucide-react";

const STORAGE_KEY = "sg_concession_roi_data_v2";

export default function Home() {
  const [statementData, setStatementData] =
    useState<ParsedStatementResult | null>(null);
  const [passCost, setPassCost] = useState<number>(122.0);
  const [selectedPresetId, setSelectedPresetId] =
    useState<string>("adult-hybrid");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.statementData) setStatementData(parsed.statementData);
        if (parsed.passCost !== undefined) setPassCost(parsed.passCost);
        if (parsed.selectedPresetId)
          setSelectedPresetId(parsed.selectedPresetId);
      }
    } catch (e) {
      console.error("Error loading cached statement:", e);
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (!isMounted) return;
    try {
      if (statementData) {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            statementData,
            passCost,
            selectedPresetId,
          }),
        );
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (e) {
      console.error("Error saving state:", e);
    }
  }, [statementData, passCost, selectedPresetId, isMounted]);

  const handleParsed = (result: ParsedStatementResult) => {
    setStatementData(result);
  };

  const handlePassChange = (presetId: string, customPrice?: number) => {
    setSelectedPresetId(presetId);
    if (customPrice !== undefined) {
      setPassCost(customPrice);
    }
  };

  const handleUpdateTrip = (updatedTrip: CalculatedTrip) => {
    if (!statementData) return;
    const newTrips = statementData.trips.map((t) =>
      t.id === updatedTrip.id ? updatedTrip : t,
    );
    const { calculatedTrips, journeys, summary } = calculateFares(newTrips);

    // Retain statement metadata
    summary.statementDate = statementData.summary.statementDate;
    summary.accountNumber = statementData.summary.accountNumber;
    summary.cardName = statementData.summary.cardName;
    summary.billingPeriod = statementData.summary.billingPeriod;
    summary.cardNumber = statementData.summary.cardNumber;

    setStatementData({
      ...statementData,
      trips: calculatedTrips,
      journeys,
      summary,
    });
  };

  const handleReset = () => {
    if (confirm("Are you sure you want to clear current statement data?")) {
      setStatementData(null);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const handleExportCsv = () => {
    if (!statementData || statementData.trips.length === 0) return;

    const headers = [
      "Index",
      "Date",
      "Time",
      "Day",
      "Mode",
      "Service",
      "Origin",
      "Destination",
      "Distance_KM",
      "Calculated_Card_Fare_SGD",
      "Standalone_Fare_SGD",
      "Is_Transfer_Leg",
      "Early_Morning_Rail_Discount",
      "Journey_Group_ID",
    ];

    const rows = statementData.trips.map((t, idx) => [
      idx + 1,
      `"${t.dateStr}"`,
      `"${t.timeStr}"`,
      `"${t.dayOfWeek || ""}"`,
      `"${t.mode}"`,
      `"${t.serviceNo || ""}"`,
      `"${t.origin}"`,
      `"${t.destination}"`,
      t.distanceKm,
      (t.chainedFareCents / 100).toFixed(2),
      (t.individualFareCents / 100).toFixed(2),
      t.isTransfer ? "YES" : "NO",
      t.isEarlyMorningDiscount ? "YES" : "NO",
      `"${t.transferJourneyId}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const dateLabel = statementData.metadata.billingPeriod
      ? statementData.metadata.billingPeriod.replace(/\s+/g, "_")
      : "statement";
    link.setAttribute("download", `SimplyGo_ROI_${dateLabel}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] dark:bg-[#1A1614] flex flex-col font-sans transition-colors bg-transit-grid">
      <Navbar
        onReset={handleReset}
        onExportCsv={handleExportCsv}
        hasData={!!statementData}
      />

      <main className="container mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8 flex-1">
        {/* Pass Selector Bar */}
        <PassSelector
          currentPassCost={passCost}
          selectedPresetId={selectedPresetId}
          onPassChange={handlePassChange}
        />

        {/* If no statement loaded, show Uploader as hero banner */}
        {!statementData ? (
          <div className="space-y-6">
            <StatementUploader onParsed={handleParsed} />

            {/* Feature Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <Card className="border-stone-200 dark:border-stone-800 bg-[#FFFDF9]/90 dark:bg-[#241F1C]/90 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-5 flex items-start gap-3.5">
                  <div className="p-2.5 bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400 rounded-xl shrink-0">
                    <Zap className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-stone-900 dark:text-white mb-1">
                      Distance fare calculator
                    </h4>
                    <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                      Computes LTA Distance Fares using local bus stop codes and
                      MRT graph paths.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-stone-200 dark:border-stone-800 bg-[#FFFDF9]/90 dark:bg-[#241F1C]/90 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-5 flex items-start gap-3.5">
                  <div className="p-2.5 bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 rounded-xl shrink-0">
                    <ArrowRightLeft className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-stone-900 dark:text-white mb-1">
                      Transfer rebates and early rail
                    </h4>
                    <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                      Applies transfer rules and the morning pre-peak rail
                      discount.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-stone-200 dark:border-stone-800 bg-[#FFFDF9]/90 dark:bg-[#241F1C]/90 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-5 flex items-start gap-3.5">
                  <div className="p-2.5 bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400 rounded-xl shrink-0">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-stone-900 dark:text-white mb-1">
                      Private and local
                    </h4>
                    <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                      Everything runs locally in your browser. No data leaves
                      your machine.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <div className="space-y-6 sm:space-y-8 animate-in fade-in-50 duration-300">
            {/* ROI Dashboard & Gantry Breakeven Gauge */}
            <RoiSummaryCards
              summary={statementData.summary}
              passCostDollars={passCost}
            />

            {/* Collapsible Uploader for replacing statement */}
            <details className="group rounded-2xl border border-stone-200 dark:border-stone-800 bg-[#FFFDF9]/90 dark:bg-[#241F1C]/90 backdrop-blur-sm p-4 sm:p-5 transition-all">
              <summary className="flex items-center justify-between cursor-pointer font-bold text-xs sm:text-sm text-stone-800 dark:text-stone-200 select-none">
                <span className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-orange-600" />
                  Upload another statement
                </span>
                <span className="text-xs text-orange-600 group-open:rotate-180 transition-transform">
                  ▼
                </span>
              </summary>
              <div className="pt-4">
                <StatementUploader onParsed={handleParsed} />
              </div>
            </details>

            {/* Itemised Trip Table */}
            <TripListTable
              trips={statementData.trips}
              onUpdateTrip={handleUpdateTrip}
              onExportCsv={handleExportCsv}
            />
          </div>
        )}
      </main>

      <footer className="border-t border-stone-200/90 dark:border-stone-800/90 py-6 text-center text-xs text-stone-500 dark:text-stone-400 bg-[#FAF7F2]/60 dark:bg-[#1A1614]/60">
        <div className="container mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-mono">
            <span className="font-bold text-stone-800 dark:text-stone-200">
              SimplyGo Concession Pass ROI Calculator 2026
            </span>
          </div>
          <div className="text-stone-400">
            Source: Land Transport Authority (LTA DataMall) & SimplyGo Transit.
          </div>
        </div>
      </footer>
    </div>
  );
}
