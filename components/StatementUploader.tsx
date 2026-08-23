"use client";

import React, { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  parseStatementPdf,
  parseStatementText,
  ParsedStatementResult,
} from "@/lib/pdf-parser";
import { SAMPLE_DATASETS, SamplePreset } from "@/lib/sample-data";
import {
  UploadCloud,
  FileText,
  Sparkles,
  Loader2,
  AlertCircle,
  Zap,
  ArrowRight,
  Train,
  Coffee,
  Compass,
} from "lucide-react";
import confetti from "canvas-confetti";

interface StatementUploaderProps {
  onParsed: (result: ParsedStatementResult) => void;
}

export function StatementUploader({ onParsed }: StatementUploaderProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<boolean>(false);
  const [rawTextInput, setRawTextInput] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processPdfFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setError("Please upload a valid SimplyGo PDF statement file (.pdf)");
      return;
    }
    setError(null);
    setIsLoading(true);

    try {
      const buffer = await file.arrayBuffer();
      const result = await parseStatementPdf(buffer);
      if (result.trips.length === 0) {
        setError(
          "Could not detect transit trips in this PDF. Please ensure it is an official SimplyGo transit statement."
        );
      } else {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.6 },
          colors: ["#f97316", "#fbbf24", "#ea580c"],
        });
        onParsed(result);
      }
    } catch (err: unknown) {
      console.error("PDF Parsing error:", err);
      setError(
        "Failed to parse PDF statement. Please verify the PDF is not password-protected or try pasting text."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processPdfFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processPdfFile(e.target.files[0]);
    }
  };

  const handleParseText = () => {
    if (!rawTextInput.trim()) {
      setError("Please paste your SimplyGo statement text first.");
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      const result = parseStatementText(rawTextInput);
      if (result.trips.length === 0) {
        setError("Could not parse transit trips from the provided text.");
      } else {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.6 },
          colors: ["#f97316", "#fbbf24", "#ea580c"],
        });
        onParsed(result);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError("Failed to parse statement text: " + msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadPreset = (preset: SamplePreset) => {
    setError(null);
    setIsLoading(true);
    try {
      const result = parseStatementText(preset.rawText);
      confetti({
        particleCount: 45,
        spread: 65,
        origin: { y: 0.5 },
        colors: ["#f97316", "#fbbf24", "#ea580c"],
      });
      onParsed(result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError("Failed to load preset: " + msg);
    } finally {
      setIsLoading(false);
    }
  };

  const getPresetIcon = (iconName: string) => {
    switch (iconName) {
      case "train":
        return <Train className="h-4 w-4 text-orange-600 dark:text-orange-400" />;
      case "zap":
        return <Zap className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />;
      case "coffee":
        return <Coffee className="h-4 w-4 text-amber-600 dark:text-amber-400" />;
      case "compass":
        return <Compass className="h-4 w-4 text-purple-600 dark:text-purple-400" />;
      default:
        return <Sparkles className="h-4 w-4 text-orange-600 dark:text-orange-400" />;
    }
  };

  return (
    <Card className="border-stone-200 dark:border-stone-800 shadow-md overflow-hidden bg-[#FFFDF9] dark:bg-[#241F1C]">
      <CardHeader className="p-5 sm:p-6 border-b border-stone-100 dark:border-stone-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 text-[11px] font-bold font-mono uppercase tracking-wider">
                Statement Ingestion
              </span>
              <span className="text-xs text-stone-400 font-mono">•</span>
              <span className="text-xs text-stone-500 dark:text-stone-400">
                SimplyGo Monthly PDF & Text Records
              </span>
            </div>
            <CardTitle className="text-lg sm:text-xl font-black text-stone-900 dark:text-white tracking-tight mt-1">
              Load Your Transit Statement
            </CardTitle>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              Upload a SimplyGo statement PDF, paste records, or pick a test preset.
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5 sm:p-6 space-y-6">
        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-start gap-2.5 animate-in fade-in-50">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <div className="leading-relaxed">{error}</div>
          </div>
        )}

        {/* 1-Click Interactive Sample Commuter Presets */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-stone-900 dark:text-white flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-orange-500" />
              Test Scenarios
            </span>
            <span className="text-[11px] text-stone-400 font-mono">
              Click to load
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {SAMPLE_DATASETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleLoadPreset(preset)}
                disabled={isLoading}
                className="group relative p-3.5 rounded-xl border border-stone-200/90 dark:border-stone-800 bg-[#FAF7F2]/70 dark:bg-[#1E1916]/70 hover:border-orange-500 dark:hover:border-orange-500 hover:bg-orange-50/50 dark:hover:bg-orange-950/30 text-left transition-all duration-200 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="p-1.5 rounded-lg bg-white dark:bg-stone-900 shadow-sm border border-stone-200/60 dark:border-stone-700">
                      {getPresetIcon(preset.icon)}
                    </div>
                    <Badge
                      variant={preset.badgeVariant}
                      className="text-[10px] px-2 py-0.2 font-semibold"
                    >
                      {preset.badge}
                    </Badge>
                  </div>
                  <h4 className="font-bold text-xs text-stone-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                    {preset.name}
                  </h4>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1 line-clamp-2 leading-relaxed">
                    {preset.tagline}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-stone-200/60 dark:border-stone-700/60 flex items-center justify-between text-[11px] font-semibold text-orange-600 dark:text-orange-400">
                  <span>Load Sample</span>
                  <ArrowRight className="h-3 w-3 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Tabs for PDF Drag & Drop and Text Paste */}
        <div className="pt-2">
          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4 bg-stone-100 dark:bg-stone-800/80 p-1 rounded-xl">
              <TabsTrigger
                value="upload"
                className="flex items-center justify-center gap-2 text-xs font-semibold py-2 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-stone-900 data-[state=active]:text-orange-600 dark:data-[state=active]:text-orange-400 data-[state=active]:shadow-sm"
              >
                <UploadCloud className="h-4 w-4 text-orange-500" />
                Upload PDF
              </TabsTrigger>
              <TabsTrigger
                value="paste"
                className="flex items-center justify-center gap-2 text-xs font-semibold py-2 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-stone-900 data-[state=active]:text-orange-600 dark:data-[state=active]:text-orange-400 data-[state=active]:shadow-sm"
              >
                <FileText className="h-4 w-4 text-amber-500" />
                Paste Text Records
              </TabsTrigger>
            </TabsList>

            {/* Upload PDF Tab */}
            <TabsContent value="upload">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleFileDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 sm:p-10 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center min-h-[190px] ${
                  dragOver
                    ? "border-orange-500 bg-orange-50/70 dark:bg-orange-950/40 ring-4 ring-orange-500/20"
                    : "border-stone-300 dark:border-stone-700 hover:border-orange-400 dark:hover:border-orange-500 bg-[#FAF7F2]/50 dark:bg-[#1E1916]/40"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  className="hidden"
                  onChange={handleFileSelect}
                />
                {isLoading ? (
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-9 w-9 text-orange-600 animate-spin" />
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-stone-800 dark:text-stone-200">
                        Extracting statement and calculating distance fares...
                      </p>
                      <p className="text-xs text-stone-500 font-mono">
                        Matching bus stop sequences and MRT paths
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="p-3.5 bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400 rounded-2xl mb-3 shadow-inner">
                      <UploadCloud className="h-7 w-7" />
                    </div>
                    <p className="text-sm sm:text-base font-bold text-stone-800 dark:text-stone-200">
                      Drop your SimplyGo PDF here
                    </p>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 max-w-md">
                      Accepts monthly e-statements from the SimplyGo app. Processed locally in your browser.
                    </p>
                  </>
                )}
              </div>
            </TabsContent>

            {/* Paste Raw Text Tab */}
            <TabsContent value="paste">
              <div className="space-y-3">
                <textarea
                  value={rawTextInput}
                  onChange={(e) => setRawTextInput(e.target.value)}
                  placeholder="Paste statement text here (e.g. 31 Jul 2026 / Train Choa Chu Kang - Jurong East / Bus 300 Opp Concord Pr Sch)..."
                  rows={6}
                  className="w-full rounded-xl border border-stone-200 dark:border-stone-800 bg-[#FAF7F2]/60 dark:bg-[#1E1916]/60 p-3.5 text-xs font-mono text-stone-800 dark:text-stone-200 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] text-stone-400 font-mono">
                    {rawTextInput.split("\n").filter(Boolean).length} lines entered
                  </span>
                  <Button
                    onClick={handleParseText}
                    disabled={isLoading || !rawTextInput.trim()}
                    className="text-xs font-bold font-mono px-5 bg-orange-600 hover:bg-orange-500"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                        Calculating...
                      </>
                    ) : (
                      "Calculate Distance Fares"
                    )}
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
}
