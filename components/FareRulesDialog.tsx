"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Train,
  ArrowRightLeft,
  SunMedium,
  ShieldCheck,
  Zap,
} from "lucide-react";

interface FareRulesDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FareRulesDialog({ isOpen, onClose }: FareRulesDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg bg-[#FFFDF9] dark:bg-[#241F1C] border-stone-200 dark:border-stone-800">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400">
              <Train className="h-4 w-4" />
            </div>
            <DialogTitle className="text-base font-black tracking-tight text-stone-900 dark:text-white">
              Singapore public transit fare rules (2026)
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4 text-xs text-stone-600 dark:text-stone-300 py-2 leading-relaxed">
          <div className="p-3.5 rounded-xl bg-[#FAF7F2] dark:bg-[#1E1916] border border-stone-200 dark:border-stone-800">
            <h4 className="font-bold text-stone-900 dark:text-white flex items-center gap-1.5 mb-1">
              <Zap className="h-3.5 w-3.5 text-orange-500" />
              Distance-based fares
            </h4>
            <p>
              Fares depend on total journey distance, not the number of rides. Base adult fare is $1.28 for up to 3.2 km, and caps at $2.57 beyond 40.2 km.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#FAF7F2] dark:bg-[#1E1916] border border-stone-200 dark:border-stone-800">
            <h4 className="font-bold text-stone-900 dark:text-white flex items-center gap-1.5 mb-1">
              <ArrowRightLeft className="h-3.5 w-3.5 text-amber-500" />
              Journey transfer rules
            </h4>
            <ul className="list-disc list-inside space-y-1 mt-1">
              <li>You have <strong>45 minutes</strong> to transfer between legs.</li>
              <li>Total journey time cannot exceed <strong>2 hours</strong>.</li>
              <li>You get up to <strong>5 transfers</strong> per journey.</li>
              <li>Reboarding the same bus service breaks the journey.</li>
            </ul>
          </div>

          <div className="p-3.5 rounded-xl bg-[#FAF7F2] dark:bg-[#1E1916] border border-stone-200 dark:border-stone-800">
            <h4 className="font-bold text-stone-900 dark:text-white flex items-center gap-1.5 mb-1">
              <SunMedium className="h-3.5 w-3.5 text-yellow-600 dark:text-yellow-500" />
              Morning rail discount
            </h4>
            <p>
              Tap into any MRT or LRT station before 7:45 AM on weekdays (excluding public holidays) to get a <strong>$0.50 discount</strong> on the rail leg.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#FAF7F2] dark:bg-[#1E1916] border border-stone-200 dark:border-stone-800">
            <h4 className="font-bold text-stone-900 dark:text-white flex items-center gap-1.5 mb-1">
              <ShieldCheck className="h-3.5 w-3.5 text-orange-500" />
              Local processing
            </h4>
            <p>
              This app processes your SimplyGo statements and coordinates locally in the browser. No personal data leaves your device.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button size="sm" onClick={onClose} className="text-xs font-bold bg-orange-600 hover:bg-orange-500">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
