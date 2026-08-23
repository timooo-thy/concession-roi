"use client";

import React, { useState } from "react";
import { CalculatedTrip } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Bus,
  Train,
  Search,
  ArrowRight,
  SunMedium,
  ArrowRightLeft,
  Edit2,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { EditTripDialog } from "./EditTripDialog";

interface TripListTableProps {
  trips: CalculatedTrip[];
  onUpdateTrip: (updated: CalculatedTrip) => void;
  onExportCsv: () => void;
}

export function TripListTable({
  trips,
  onUpdateTrip,
  onExportCsv,
}: TripListTableProps) {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [modeFilter, setModeFilter] = useState<
    "ALL" | "BUS" | "TRAIN" | "TRANSFERS" | "EARLY"
  >("ALL");
  const [editingTrip, setEditingTrip] = useState<CalculatedTrip | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(15);

  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    setCurrentPage(1);
  };

  const handleModeFilterChange = (
    mode: "ALL" | "BUS" | "TRAIN" | "TRANSFERS" | "EARLY",
  ) => {
    setModeFilter(mode);
    setCurrentPage(1);
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  const filteredTrips = trips.filter((t) => {
    // Mode match
    if (modeFilter === "BUS" && t.mode !== "BUS") return false;
    if (modeFilter === "TRAIN" && t.mode !== "TRAIN") return false;
    if (modeFilter === "TRANSFERS" && !t.isTransfer) return false;
    if (modeFilter === "EARLY" && !t.isEarlyMorningDiscount) return false;

    // Search match
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchOrigin = t.origin.toLowerCase().includes(q);
      const matchDest = t.destination.toLowerCase().includes(q);
      const matchService = (t.serviceNo || "").toLowerCase().includes(q);
      const matchDate = t.dateStr.toLowerCase().includes(q);
      if (!matchOrigin && !matchDest && !matchService && !matchDate)
        return false;
    }
    return true;
  });

  const totalFilteredFareCents = filteredTrips.reduce(
    (acc, t) => acc + t.chainedFareCents,
    0,
  );
  const totalFilteredDist = filteredTrips.reduce(
    (acc, t) => acc + t.distanceKm,
    0,
  );

  const totalPages = Math.max(1, Math.ceil(filteredTrips.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const endIndex = Math.min(filteredTrips.length, startIndex + pageSize);
  const paginatedTrips = filteredTrips.slice(startIndex, endIndex);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (safeCurrentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (safeCurrentPage >= totalPages - 2) {
        pages.push(
          1,
          "...",
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages,
        );
      } else {
        pages.push(
          1,
          "...",
          safeCurrentPage - 1,
          safeCurrentPage,
          safeCurrentPage + 1,
          "...",
          totalPages,
        );
      }
    }
    return pages;
  };

  return (
    <Card className="border-stone-200 dark:border-stone-800 shadow-md overflow-hidden bg-[#FFFDF9] dark:bg-[#241F1C]">
      <CardHeader className="p-4 sm:p-6 border-b border-stone-100 dark:border-stone-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-base sm:text-lg font-black text-stone-900 dark:text-white flex items-center gap-2">
                <span>Transit ledger</span>
                <Badge
                  variant="secondary"
                  className="text-xs font-mono px-2.5 py-0.5 bg-orange-100/70 dark:bg-orange-950/60 text-orange-800 dark:text-orange-300 border border-orange-200 dark:border-orange-900"
                >
                  {filteredTrips.length} of {trips.length} trips
                </Badge>
              </CardTitle>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              Standard adult distance fares applying transfer rules and the morning pre-peak rail discount
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onExportCsv}
              className="text-xs font-mono font-bold flex items-center gap-1.5 border-stone-300 dark:border-stone-700 bg-white/70 dark:bg-stone-900/60 text-stone-800 dark:text-stone-200 hover:text-orange-600 hover:border-orange-400"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-orange-500" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Search and Filters Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
            <Input
              type="text"
              placeholder="Search station, bus stop, bus no (e.g. 300, Jurong)..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9 h-9 text-xs bg-[#FAF7F2]/80 dark:bg-[#1E1916]/80 font-mono border-stone-300 dark:border-stone-700"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => handleModeFilterChange("ALL")}
              type="button"
              className={`px-3 py-1.5 text-xs rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
                modeFilter === "ALL"
                  ? "bg-orange-600 text-white shadow-sm"
                  : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200"
              }`}
            >
              All ({trips.length})
            </button>
            <button
              onClick={() => handleModeFilterChange("TRAIN")}
              type="button"
              className={`px-3 py-1.5 text-xs rounded-lg font-bold transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap ${
                modeFilter === "TRAIN"
                  ? "bg-orange-600 text-white shadow-sm"
                  : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200"
              }`}
            >
              <Train className="h-3.5 w-3.5" />
              Train ({trips.filter((t) => t.mode === "TRAIN").length})
            </button>
            <button
              onClick={() => handleModeFilterChange("BUS")}
              type="button"
              className={`px-3 py-1.5 text-xs rounded-lg font-bold transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap ${
                modeFilter === "BUS"
                  ? "bg-amber-600 text-white shadow-sm"
                  : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200"
              }`}
            >
              <Bus className="h-3.5 w-3.5" />
              Bus ({trips.filter((t) => t.mode === "BUS").length})
            </button>
            <button
              onClick={() => handleModeFilterChange("TRANSFERS")}
              type="button"
              className={`px-3 py-1.5 text-xs rounded-lg font-bold transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap ${
                modeFilter === "TRANSFERS"
                  ? "bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-sm"
                  : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200"
              }`}
            >
              <ArrowRightLeft className="h-3.5 w-3.5" />
              Transfers ({trips.filter((t) => t.isTransfer).length})
            </button>
            <button
              onClick={() => handleModeFilterChange("EARLY")}
              type="button"
              className={`px-3 py-1.5 text-xs rounded-lg font-bold transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap ${
                modeFilter === "EARLY"
                  ? "bg-yellow-600 text-white shadow-sm"
                  : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200"
              }`}
            >
              <SunMedium className="h-3.5 w-3.5" />
              Pre-7:45am ({trips.filter((t) => t.isEarlyMorningDiscount).length}
              )
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-stone-100/70 dark:bg-stone-900/60 font-mono text-[11px] uppercase tracking-wider text-stone-600 dark:text-stone-400">
              <TableRow>
                <TableHead className="w-12 text-center">#</TableHead>
                <TableHead className="w-36">Date & Time</TableHead>
                <TableHead className="w-32">Mode & Service</TableHead>
                <TableHead>Route (Origin → Destination)</TableHead>
                <TableHead className="w-24 text-right">Distance</TableHead>
                <TableHead className="w-28 text-right">Card Fare</TableHead>
                <TableHead className="w-14 text-center">Edit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTrips.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-12 text-xs text-stone-500 font-mono"
                  >
                    No transit trips matched the current filter.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedTrips.map((t, idx) => {
                  const globalIdx = startIndex + idx + 1;
                  const fareDollars = (t.chainedFareCents / 100).toFixed(2);
                  const standaloneDollars = (
                    t.individualFareCents / 100
                  ).toFixed(2);
                  const hasTransferRebate =
                    t.isTransfer && t.chainedFareCents < t.individualFareCents;

                  return (
                    <TableRow
                      key={t.id || globalIdx}
                      className={`hover:bg-orange-50/30 dark:hover:bg-orange-950/10 transition-colors ${
                        t.isTransfer
                          ? "bg-amber-50/30 dark:bg-amber-950/15 border-l-4 border-l-orange-500"
                          : ""
                      }`}
                    >
                      <TableCell className="text-center font-mono text-xs text-stone-400">
                        {globalIdx}
                      </TableCell>

                      <TableCell className="text-xs">
                        <div className="font-bold text-stone-900 dark:text-stone-100 font-mono">
                          {t.dateStr}
                        </div>
                        <div className="text-[11px] text-stone-500 dark:text-stone-400 font-mono">
                          {t.timeStr} {t.dayOfWeek && `(${t.dayOfWeek})`}
                        </div>
                      </TableCell>

                      <TableCell className="text-xs">
                        {t.mode === "TRAIN" ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-orange-100 dark:bg-orange-950 text-orange-800 dark:text-orange-300 text-xs font-bold font-mono">
                            <Train className="h-3.5 w-3.5" />
                            Train
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-xs font-bold font-mono">
                            <Bus className="h-3.5 w-3.5" />
                            Bus {t.serviceNo || ""}
                          </span>
                        )}
                      </TableCell>

                      <TableCell className="text-xs">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-semibold text-stone-900 dark:text-stone-100">
                            {t.origin}
                          </span>
                          <ArrowRight className="h-3 w-3 text-stone-400 shrink-0" />
                          <span className="font-semibold text-stone-900 dark:text-stone-100">
                            {t.destination}
                          </span>
                        </div>

                        {/* Badges for Transfer & Discounts */}
                        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                          {t.isTransfer && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-orange-50 dark:bg-orange-950 text-orange-700 dark:text-orange-300 px-2 py-0.5 rounded border border-orange-200 dark:border-orange-900 font-mono">
                              <ArrowRightLeft className="h-2.5 w-2.5" />
                              Transfer Leg ({t.transferJourneyId})
                            </span>
                          )}
                          {t.isEarlyMorningDiscount && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-900 font-mono">
                              <SunMedium className="h-2.5 w-2.5" />
                              Pre-7:45am Rail (-$0.50)
                            </span>
                          )}
                          {t.isManualOverride && (
                            <span className="text-[10px] font-semibold bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 px-2 py-0.5 rounded border border-stone-200 dark:border-stone-700 font-mono">
                              Manual Override
                            </span>
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="text-right text-xs font-mono font-bold text-stone-700 dark:text-stone-300">
                        {t.distanceKm} km
                      </TableCell>

                      <TableCell className="text-right text-xs font-mono">
                        <div className="font-black text-stone-900 dark:text-white text-sm">
                          ${fareDollars}
                        </div>
                        {hasTransferRebate && (
                          <div className="text-[10px] text-stone-400 line-through">
                            ${standaloneDollars}
                          </div>
                        )}
                      </TableCell>

                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingTrip(t)}
                          className="h-7 w-7 rounded-lg hover:bg-stone-200 dark:hover:bg-stone-800 cursor-pointer"
                          title="Edit trip details or distance"
                        >
                          <Edit2 className="h-3.5 w-3.5 text-stone-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination & Ledger Summary Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-stone-100/70 dark:bg-stone-900/70 border-t border-stone-200 dark:border-stone-800 gap-3 text-xs font-mono">
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
            <span className="text-stone-600 dark:text-stone-400">
              {filteredTrips.length > 0
                ? `Showing ${startIndex + 1}–${endIndex} of ${filteredTrips.length} trips (${totalFilteredDist.toFixed(1)} km • $${(totalFilteredFareCents / 100).toFixed(2)})`
                : "0 trips"}
            </span>

            {/* Page Size Selector */}
            <div className="flex items-center gap-1.5 text-stone-500">
              <span className="text-[11px]">Show:</span>
              <select
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                className="h-7 rounded-md border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs px-2 text-stone-800 dark:text-stone-200"
              >
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>

          {/* Pagination Navigation */}
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(1)}
                disabled={safeCurrentPage === 1}
                className="h-7 w-7 rounded-lg"
                title="First Page"
              >
                <ChevronsLeft className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safeCurrentPage === 1}
                className="h-7 w-7 rounded-lg"
                title="Previous Page"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>

              <div className="flex items-center gap-1 px-1">
                {getPageNumbers().map((page, i) =>
                  typeof page === "number" ? (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(page)}
                      type="button"
                      className={`h-7 min-w-7 px-2 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer ${
                        safeCurrentPage === page
                          ? "bg-orange-600 text-white shadow-sm"
                          : "bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700"
                      }`}
                    >
                      {page}
                    </button>
                  ) : (
                    <span key={i} className="px-1 text-stone-400">
                      {page}
                    </span>
                  ),
                )}
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={safeCurrentPage === totalPages}
                className="h-7 w-7 rounded-lg"
                title="Next Page"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(totalPages)}
                disabled={safeCurrentPage === totalPages}
                className="h-7 w-7 rounded-lg"
                title="Last Page"
              >
                <ChevronsRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>

      <EditTripDialog
        trip={editingTrip}
        isOpen={!!editingTrip}
        onClose={() => setEditingTrip(null)}
        onSave={(updated) => {
          onUpdateTrip(updated);
          setEditingTrip(null);
        }}
      />
    </Card>
  );
}
