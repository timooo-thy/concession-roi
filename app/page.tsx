"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Navbar } from "@/components/Navbar";
import { StatementUploader } from "@/components/StatementUploader";
import { PassSelector } from "@/components/PassSelector";
import { ConcessionPeriodSelector } from "@/components/ConcessionPeriodSelector";
import { RoiSummaryCards } from "@/components/RoiSummaryCards";
import { TripListTable } from "@/components/TripListTable";
import {
  ParsedStatementResult,
  parseStatementText,
  mergeParsedStatementResults,
} from "@/lib/pdf-parser";
import {
  calculatePassPeriod,
  filterTripsByPassPeriod,
  getRecommendedStartDates,
  getUniqueMonths,
  formatDateToIso,
  parseDateString,
} from "@/lib/concession-period";
import { CalculatedTrip } from "@/types";
import { calculateFares } from "@/lib/fare-calculator";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldCheck, Zap, ArrowRightLeft, CalendarDays } from "lucide-react";

const STORAGE_KEY = "sg_concession_roi_data_v3";

export default function Home() {
  const [statementData, setStatementData] =
    useState<ParsedStatementResult | null>(null);
  const [passCost, setPassCost] = useState<number>(122.0);
  const [selectedPresetId, setSelectedPresetId] =
    useState<string>("adult-hybrid");
  const [dateMode, setDateMode] = useState<"full" | "custom">("full");
  const [passStartDateIso, setPassStartDateIso] = useState<string>("");
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
        if (parsed.dateMode) setDateMode(parsed.dateMode);
        if (parsed.passStartDateIso)
          setPassStartDateIso(parsed.passStartDateIso);
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
            dateMode,
            passStartDateIso,
          }),
        );
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (e) {
      console.error("Error saving state:", e);
    }
  }, [statementData, passCost, selectedPresetId, dateMode, passStartDateIso, isMounted]);

  // Recommended presets based on loaded dataset
  const recommendedPresets = useMemo(() => {
    if (!statementData || statementData.trips.length === 0) return [];
    return getRecommendedStartDates(statementData.trips);
  }, [statementData]);

  // Ensure passStartDateIso is initialized when new statement data arrives
  useEffect(() => {
    if (statementData && statementData.trips.length > 0 && !passStartDateIso) {
      if (recommendedPresets.length > 0) {
        setPassStartDateIso(recommendedPresets[0].isoDate);
      } else {
        const firstTripDate = parseDateString(statementData.trips[0].dateStr);
        if (firstTripDate) {
          setPassStartDateIso(formatDateToIso(firstTripDate));
        }
      }
    }
  }, [statementData, passStartDateIso, recommendedPresets]);

  const handleParsed = (result: ParsedStatementResult) => {
    // If existing statements exist and new result has statements, merge them
    if (
      statementData &&
      statementData.loadedStatements &&
      statementData.loadedStatements.length > 0 &&
      result.loadedStatements &&
      result.loadedStatements.length > 0
    ) {
      const existingStatements = statementData.loadedStatements;
      const newStatements = result.loadedStatements;

      const combinedStatements = [...existingStatements];
      for (const ns of newStatements) {
        if (!combinedStatements.some((es) => es.fileName === ns.fileName && es.tripsCount === ns.tripsCount)) {
          combinedStatements.push(ns);
        }
      }

      // Re-parse all statements into a merged result
      const parsedItems = combinedStatements.map((info) => {
        const parsed = parseStatementText(info.rawText || "", info.fileName);
        return { info, result: parsed };
      });

      const merged = mergeParsedStatementResults(parsedItems);
      setStatementData(merged);
      
      const uniqueMonths = getUniqueMonths(merged.trips);
      setDateMode(uniqueMonths.length <= 1 ? "full" : "custom");

      const newPresets = getRecommendedStartDates(merged.trips);
      if (newPresets.length > 0) {
        setPassStartDateIso(newPresets[0].isoDate);
      }
    } else {
      setStatementData(result);
      const uniqueMonths = getUniqueMonths(result.trips);
      setDateMode(uniqueMonths.length <= 1 ? "full" : "custom");

      const newPresets = getRecommendedStartDates(result.trips);
      if (newPresets.length > 0) {
        setPassStartDateIso(newPresets[0].isoDate);
      }
    }
  };

  const handleRemoveStatement = (statementId: string) => {
    if (!statementData || !statementData.loadedStatements) return;

    const remaining = statementData.loadedStatements.filter(
      (s) => s.id !== statementId
    );

    if (remaining.length === 0) {
      setStatementData(null);
      localStorage.removeItem(STORAGE_KEY);
      return;
    }

    const parsedItems = remaining.map((info) => {
      const parsed = parseStatementText(info.rawText || "", info.fileName);
      return { info, result: parsed };
    });

    const merged = mergeParsedStatementResults(parsedItems);
    setStatementData(merged);
    const uniqueMonths = getUniqueMonths(merged.trips);
    setDateMode(uniqueMonths.length <= 1 ? "full" : "custom");
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
      t.id === updatedTrip.id ? updatedTrip : t
    );
    const { calculatedTrips, journeys, summary } = calculateFares(newTrips);

    // Retain statement metadata
    summary.statementDate = statementData.summary.statementDate;
    summary.accountNumber = statementData.summary.accountNumber;
    summary.cardName = statementData.summary.cardName;
    summary.billingPeriod = statementData.summary.billingPeriod;
    summary.cardNumber = statementData.summary.cardNumber;
    summary.loadedStatements = statementData.summary.loadedStatements;

    setStatementData({
      ...statementData,
      trips: calculatedTrips,
      journeys,
      summary,
    });
  };

  const handleReset = () => {
    if (confirm("Are you sure you want to clear all statement data?")) {
      setStatementData(null);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  // Compute calculated concession pass period
  const calculatedPeriod = useMemo(() => {
    const effectiveStart =
      passStartDateIso ||
      (statementData?.trips[0]
        ? formatDateToIso(parseDateString(statementData.trips[0].dateStr) || new Date())
        : formatDateToIso(new Date()));

    return calculatePassPeriod(effectiveStart);
  }, [passStartDateIso, statementData]);

  // Compute active filtered dataset (Strict window isolation when custom period is selected)
  const { activeTrips, activeSummary } = useMemo(() => {
    if (!statementData) {
      return { activeTrips: [], activeSummary: null };
    }

    if (dateMode === "full") {
      const summary = {
        ...statementData.summary,
        isCustomPeriod: false,
        loadedStatements: statementData.loadedStatements || statementData.summary.loadedStatements,
      };
      return {
        activeTrips: statementData.trips,
        activeSummary: summary,
      };
    }

    // Custom Concession Pass Window Mode
    const filtered = filterTripsByPassPeriod(
      statementData.trips,
      calculatedPeriod.startDate,
      calculatedPeriod.endDate
    );

    const { summary: filteredSummary } = calculateFares(filtered);
    filteredSummary.statementDate = statementData.summary.statementDate;
    filteredSummary.accountNumber = statementData.summary.accountNumber;
    filteredSummary.cardName = statementData.summary.cardName;
    filteredSummary.cardNumber = statementData.summary.cardNumber;
    filteredSummary.billingPeriod = statementData.summary.billingPeriod;
    filteredSummary.isCustomPeriod = true;
    filteredSummary.activePassRange = calculatedPeriod.formattedRange;
    filteredSummary.loadedStatements =
      statementData.loadedStatements || statementData.summary.loadedStatements;

    return {
      activeTrips: filtered,
      activeSummary: filteredSummary,
    };
  }, [statementData, dateMode, calculatedPeriod]);

  const handleExportCsv = () => {
    if (!statementData || activeTrips.length === 0) return;

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

    const rows = activeTrips.map((t, idx) => [
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

    const dateLabel =
      dateMode === "custom"
        ? `${calculatedPeriod.startDateStr.replace(/\s+/g, "_")}_to_${calculatedPeriod.endDateStr.replace(/\s+/g, "_")}`
        : statementData.metadata.billingPeriod
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
            <StatementUploader
              onParsed={handleParsed}
              loadedStatements={[]}
            />

            {/* Feature Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <Card className="border-stone-200 dark:border-stone-800 bg-[#FFFDF9]/90 dark:bg-[#241F1C]/90 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-5 flex items-start gap-3.5">
                  <div className="p-2.5 bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400 rounded-xl shrink-0">
                    <CalendarDays className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-stone-900 dark:text-white mb-1">
                      Mid-month concession support
                    </h4>
                    <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                      Upload multiple monthly statements to evaluate passes starting any day of the month.
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
                      Distance fares & rebates
                    </h4>
                    <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                      Computes journey-chained fares across statement boundaries and early rail discounts.
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
                      Private & browser local
                    </h4>
                    <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                      All PDF parsing and transit calculations execute locally in your browser.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <div className="space-y-6 sm:space-y-8 animate-in fade-in-50 duration-300">
            {/* Concession Period Selector / Date Mode Tab */}
            <ConcessionPeriodSelector
              activeMode={dateMode}
              onModeChange={setDateMode}
              startDateIso={passStartDateIso}
              onStartDateChange={setPassStartDateIso}
              calculatedPeriod={calculatedPeriod}
              totalStatementTrips={statementData.trips.length}
              inPeriodTripsCount={activeTrips.length}
              recommendedPresets={recommendedPresets}
            />

            {/* ROI Dashboard & Gantry Breakeven Gauge */}
            {activeSummary && (
              <RoiSummaryCards
                summary={activeSummary}
                passCostDollars={passCost}
              />
            )}

            {/* Statement Management & Additional Statement Uploader */}
            <details className="group rounded-2xl border border-stone-200 dark:border-stone-800 bg-[#FFFDF9]/90 dark:bg-[#241F1C]/90 backdrop-blur-sm p-4 sm:p-5 transition-all">
              <summary className="flex items-center justify-between cursor-pointer font-bold text-xs sm:text-sm text-stone-800 dark:text-stone-200 select-none">
                <span className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-orange-600" />
                  Manage Statements & Upload More PDFs ({statementData.loadedStatements?.length || 1} loaded)
                </span>
                <span className="text-xs text-orange-600 group-open:rotate-180 transition-transform">
                  ▼
                </span>
              </summary>
              <div className="pt-4">
                <StatementUploader
                  onParsed={handleParsed}
                  loadedStatements={statementData.loadedStatements}
                  onRemoveStatement={handleRemoveStatement}
                />
              </div>
            </details>

            {/* Itemised Trip Table (Strictly showing active in-window trips) */}
            <TripListTable
              trips={activeTrips}
              onUpdateTrip={handleUpdateTrip}
              onExportCsv={handleExportCsv}
              activePassRange={dateMode === "custom" ? calculatedPeriod.formattedRange : undefined}
              totalUnfilteredTrips={statementData.trips.length}
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
