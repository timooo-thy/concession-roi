"use client";

import React, { useState } from "react";
import { CalculatedTrip, TransportMode } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { resolveBusDistance, resolveTrainDistance } from "@/lib/distance-resolver";
import { RefreshCw } from "lucide-react";

interface EditTripDialogProps {
  trip: CalculatedTrip | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedTrip: CalculatedTrip) => void;
}

function EditTripForm({
  trip,
  onClose,
  onSave,
}: {
  trip: CalculatedTrip;
  onClose: () => void;
  onSave: (updatedTrip: CalculatedTrip) => void;
}) {
  const [origin, setOrigin] = useState<string>(trip.origin);
  const [destination, setDestination] = useState<string>(trip.destination);
  const [serviceNo, setServiceNo] = useState<string>(trip.serviceNo || "");
  const [distanceKm, setDistanceKm] = useState<string>(trip.distanceKm.toString());
  const [dateStr] = useState<string>(trip.dateStr);
  const [timeStr, setTimeStr] = useState<string>(trip.timeStr);
  const [mode, setMode] = useState<TransportMode>(
    trip.mode === "TRAIN" ? "TRAIN" : "BUS"
  );

  const handleRecalculateDistance = () => {
    if (mode === "BUS") {
      const res = resolveBusDistance(serviceNo, origin, destination);
      setDistanceKm(res.distanceKm.toString());
    } else {
      const res = resolveTrainDistance(origin, destination);
      setDistanceKm(res.distanceKm.toString());
    }
  };

  const handleSave = () => {
    const dist = parseFloat(distanceKm) || 1.0;
    const updated: CalculatedTrip = {
      ...trip,
      origin,
      destination,
      serviceNo: mode === "BUS" ? serviceNo : undefined,
      distanceKm: dist,
      dateStr,
      timeStr,
      mode,
      isManualOverride: true,
    };
    onSave(updated);
  };

  return (
    <>
      <div className="space-y-3 py-2 text-xs">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="font-semibold text-stone-700 dark:text-stone-300 block mb-1">
              Transport Mode
            </label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as TransportMode)}
              className="w-full h-9 rounded-xl border border-stone-300 dark:border-stone-700 bg-[#FAF7F2] dark:bg-[#1E1916] px-3 text-xs text-stone-900 dark:text-stone-100"
            >
              <option value="BUS">Bus</option>
              <option value="TRAIN">Train (MRT/LRT)</option>
            </select>
          </div>

          {mode === "BUS" && (
            <div>
              <label className="font-semibold text-stone-700 dark:text-stone-300 block mb-1">
                Bus Service No.
              </label>
              <Input
                value={serviceNo}
                onChange={(e) => setServiceNo(e.target.value)}
                placeholder="e.g. 300, 190"
                className="h-9 border-stone-300 dark:border-stone-700 bg-[#FAF7F2] dark:bg-[#1E1916]"
              />
            </div>
          )}
        </div>

        <div>
          <label className="font-semibold text-stone-700 dark:text-stone-300 block mb-1">
            Origin (Boarding Stop / Station)
          </label>
          <Input
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            placeholder="e.g. Choa Chu Kang Int"
            className="h-9 border-stone-300 dark:border-stone-700 bg-[#FAF7F2] dark:bg-[#1E1916]"
          />
        </div>

        <div>
          <label className="font-semibold text-stone-700 dark:text-stone-300 block mb-1">
            Destination (Alighting Stop / Station)
          </label>
          <Input
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="e.g. Opp Concord Pr Sch"
            className="h-9 border-stone-300 dark:border-stone-700 bg-[#FAF7F2] dark:bg-[#1E1916]"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-stone-700 dark:text-stone-300">
                Distance (km)
              </label>
              <button
                type="button"
                onClick={handleRecalculateDistance}
                className="text-[10px] text-orange-600 hover:underline flex items-center gap-0.5 cursor-pointer font-bold"
              >
                <RefreshCw className="h-2.5 w-2.5" />
                Auto
              </button>
            </div>
            <Input
              type="number"
              step="0.1"
              min="0.1"
              value={distanceKm}
              onChange={(e) => setDistanceKm(e.target.value)}
              className="h-9 font-mono border-stone-300 dark:border-stone-700 bg-[#FAF7F2] dark:bg-[#1E1916]"
            />
          </div>

          <div>
            <label className="font-semibold text-stone-700 dark:text-stone-300 block mb-1">
              Time
            </label>
            <Input
              value={timeStr}
              onChange={(e) => setTimeStr(e.target.value)}
              placeholder="e.g. 11:21 PM"
              className="h-9 font-mono border-stone-300 dark:border-stone-700 bg-[#FAF7F2] dark:bg-[#1E1916]"
            />
          </div>
        </div>
      </div>

      <DialogFooter className="gap-2">
        <Button variant="outline" size="sm" onClick={onClose}>
          Cancel
        </Button>
        <Button size="sm" onClick={handleSave} className="bg-orange-600 hover:bg-orange-500">
          Save & Recalculate
        </Button>
      </DialogFooter>
    </>
  );
}

export function EditTripDialog({
  trip,
  isOpen,
  onClose,
  onSave,
}: EditTripDialogProps) {
  if (!trip) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md bg-[#FFFDF9] dark:bg-[#241F1C] border-stone-200 dark:border-stone-800">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-stone-900 dark:text-white">
            Edit Trip Details
          </DialogTitle>
        </DialogHeader>

        <EditTripForm
          key={trip.id}
          trip={trip}
          onClose={onClose}
          onSave={onSave}
        />
      </DialogContent>
    </Dialog>
  );
}
