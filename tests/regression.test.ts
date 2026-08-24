import { describe, it, expect } from "bun:test";
import fs from "fs";
import path from "path";
import { parseStatementPdf } from "../lib/pdf-parser";

interface StatementBenchmark {
  filename: string;
  expectedMinTrips: number;
  expectedStatementTotal: number;
  minAccuracyPercent: number; // e.g. 99.5
}

const BENCHMARKS: StatementBenchmark[] = [
  {
    filename: "SimplyGo Statement_Jul_2026.pdf",
    expectedMinTrips: 115,
    expectedStatementTotal: 112.26,
    minAccuracyPercent: 99.5,
  },
  {
    filename: "SimplyGo Statement Jul 2026 8606.pdf",
    expectedMinTrips: 95,
    expectedStatementTotal: 90.98,
    minAccuracyPercent: 99.5,
  },
  {
    filename: "SimplyGo Statement Jul 2026 3505.pdf",
    expectedMinTrips: 30,
    expectedStatementTotal: 36.64,
    minAccuracyPercent: 99.5,
  },
  {
    filename: "SimplyGo Statement Apr 2026 8606.pdf",
    expectedMinTrips: 95,
    expectedStatementTotal: 91.71,
    minAccuracyPercent: 99.5,
  },
  {
    filename: "SimplyGo Statement Mar 2026 8606.pdf",
    expectedMinTrips: 100,
    expectedStatementTotal: 95.45,
    minAccuracyPercent: 99.5,
  },
  {
    filename: "SimplyGo Statement Apr 2026 8579.pdf",
    expectedMinTrips: 40,
    expectedStatementTotal: 45.36,
    minAccuracyPercent: 99.5,
  },
  {
    filename: "SimplyGo Statement Mar 2026 8579.pdf",
    expectedMinTrips: 135,
    expectedStatementTotal: 152.00,
    minAccuracyPercent: 99.5,
  },
  {
    filename: "SimplyGo Statement Jul 2026 8579.pdf",
    expectedMinTrips: 115,
    expectedStatementTotal: 119.07,
    minAccuracyPercent: 99.5,
  },
];

describe("Fare Calculation Algorithm - Statement Regression Test Suite", () => {
  let combinedStatementTotal = 0;
  let combinedAlgorithmTotal = 0;
  let combinedTripCount = 0;

  for (const benchmark of BENCHMARKS) {
    it(`should calculate ${benchmark.filename} with >= ${benchmark.minAccuracyPercent}% accuracy`, async () => {
      const fixturePath = path.join(__dirname, "fixtures/statements", benchmark.filename);
      expect(fs.existsSync(fixturePath)).toBe(true);

      const fileBuffer = fs.readFileSync(fixturePath);
      const result = await parseStatementPdf(fileBuffer.buffer, benchmark.filename);

      const statementTotal = benchmark.expectedStatementTotal;
      const algorithmTotal = result.summary.totalNormalFareDollars;
      const tripsCount = result.trips.length;

      expect(tripsCount).toBeGreaterThanOrEqual(benchmark.expectedMinTrips);

      const varianceDollars = Math.abs(algorithmTotal - statementTotal);
      const accuracyPercent = (1 - varianceDollars / statementTotal) * 100;

      combinedStatementTotal += statementTotal;
      combinedAlgorithmTotal += algorithmTotal;
      combinedTripCount += tripsCount;

      console.log(
        `\n[PASS] ${benchmark.filename}:` +
        `\n  - Trips Evaluated: ${tripsCount}` +
        `\n  - Statement Total: $${statementTotal.toFixed(2)}` +
        `\n  - Algorithm Total: $${algorithmTotal.toFixed(2)}` +
        `\n  - Variance: $${(algorithmTotal - statementTotal).toFixed(2)}` +
        `\n  - Accuracy: ${accuracyPercent.toFixed(2)}% (Threshold: >= ${benchmark.minAccuracyPercent}%)`
      );

      expect(accuracyPercent).toBeGreaterThanOrEqual(benchmark.minAccuracyPercent);
    });
  }

  it("should achieve >= 99.5% combined overall accuracy across all statement benchmarks", () => {
    const overallVariance = Math.abs(combinedAlgorithmTotal - combinedStatementTotal);
    const overallAccuracy = (1 - overallVariance / combinedStatementTotal) * 100;

    console.log(
      `\n=======================================================` +
      `\n📊 OVERALL REGRESSION SUITE RESULTS:` +
      `\n  - Total Statements: ${BENCHMARKS.length}` +
      `\n  - Total Trips: ${combinedTripCount}` +
      `\n  - Combined Statement Total: $${combinedStatementTotal.toFixed(2)}` +
      `\n  - Combined Algorithm Total: $${combinedAlgorithmTotal.toFixed(2)}` +
      `\n  - Combined Variance: $${(combinedAlgorithmTotal - combinedStatementTotal).toFixed(2)}` +
      `\n  - Overall Accuracy: ${overallAccuracy.toFixed(2)}% (Target: >= 99.5%)` +
      `\n=======================================================\n`
    );

    expect(overallAccuracy).toBeGreaterThanOrEqual(99.5);
  });
});
