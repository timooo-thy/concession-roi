import fs from "fs";
import path from "path";
import { parseStatementPdf } from "../../../../lib/pdf-parser";

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error(
      "Usage: bun run .agents/skills/ingest-statement/scripts/analyze-statement.ts <path-to-pdf-statement>",
    );
    process.exit(1);
  }

  const targetPath = path.resolve(args[0]);
  if (!fs.existsSync(targetPath)) {
    console.error(`File not found: ${targetPath}`);
    process.exit(1);
  }

  const filename = path.basename(targetPath);
  const fileBuffer = fs.readFileSync(targetPath);
  const result = await parseStatementPdf(fileBuffer.buffer, filename);

  const statementTotal = result.metadata.statementTotal ?? 0;
  const algorithmTotal = result.summary.totalNormalFareDollars;
  const diffDollars = algorithmTotal - statementTotal;
  const accuracy =
    statementTotal > 0
      ? (1 - Math.abs(diffDollars) / statementTotal) * 100
      : 100;

  console.log(
    `\n================================================================`,
  );
  console.log(`📄 Statement Analysis: ${filename}`);
  console.log(`  - Card / Ref: ${result.metadata.cardNumber || "Unknown"}`);
  console.log(
    `  - Statement Period: ${result.metadata.statementPeriod || "Unknown"}`,
  );
  console.log(`  - Total Trips: ${result.trips.length}`);
  console.log(`  - Statement Billed Total: $${statementTotal.toFixed(2)}`);
  console.log(`  - Algorithm Calc Total:  $${algorithmTotal.toFixed(2)}`);
  console.log(
    `  - Variance:              ${diffDollars >= 0 ? "+" : ""}$${diffDollars.toFixed(2)} (${diffDollars === 0 ? "EXACT MATCH" : `${(diffDollars * 100).toFixed(0)}c`})`,
  );
  console.log(
    `  - Accuracy:              ${accuracy.toFixed(2)}% (Target: >= 99.5%)`,
  );
  console.log(
    `================================================================\n`,
  );

  const discrepancyJourneys = [];

  for (let j = 0; j < result.journeys.length; j++) {
    const journey = result.journeys[j];
    const jBilledCents = journey.trips.reduce(
      (s, t) => s + (t.billedFareCents || 0),
      0,
    );
    const jCalcCents = journey.totalFareCents;

    if (jBilledCents !== jCalcCents) {
      discrepancyJourneys.push({
        journeyIndex: j + 1,
        journey,
        jBilledCents,
        jCalcCents,
        diffCents: jCalcCents - jBilledCents,
      });
    }
  }

  if (discrepancyJourneys.length === 0) {
    console.log(
      `🎉 Perfect match! All journeys matched billed fares with 0 discrepancies.`,
    );
    return;
  }

  console.log(
    `⚠️  Found ${discrepancyJourneys.length} journeys with fare discrepancies:\n`,
  );

  for (const item of discrepancyJourneys) {
    const { journeyIndex, journey, jBilledCents, jCalcCents, diffCents } = item;
    console.log(
      `----------------------------------------------------------------`,
    );
    console.log(
      `Journey ${journeyIndex} on ${journey.dateStr} (${journey.startTimeStr} -> ${journey.endTimeStr})`,
    );
    console.log(
      `  Billed: $${(jBilledCents / 100).toFixed(2)} | Calc: $${(jCalcCents / 100).toFixed(2)} | Diff: ${diffCents >= 0 ? "+" : ""}${diffCents}c`,
    );
    console.log(
      `  Total Distance: ${journey.totalDistanceKm} km | Legs: ${journey.trips.length}`,
    );

    for (let t = 0; t < journey.trips.length; t++) {
      const trip = journey.trips[t];
      const billed = trip.billedFareCents || 0;
      const calc = trip.chainedFareCents;
      const legDiff = calc - billed;

      console.log(
        `    Leg ${t + 1}: ${trip.timeStr} | ${trip.mode} ${trip.serviceNo || ""} | "${trip.origin}" -> "${trip.destination}"`,
      );
      console.log(
        `      Resolved: "${trip.resolvedOrigin || trip.origin}" -> "${trip.resolvedDestination || trip.destination}"`,
      );
      console.log(
        `      Dist: ${trip.distanceKm} km | Transfer: ${trip.isTransfer ? "YES" : "NO"} | Standalone Fare: $${(trip.individualFareCents / 100).toFixed(2)}`,
      );
      console.log(
        `      Billed: $${(billed / 100).toFixed(2)} | Chained: $${(calc / 100).toFixed(2)} | Leg Diff: ${legDiff >= 0 ? "+" : ""}${legDiff}c`,
      );
    }
  }
  console.log(
    `----------------------------------------------------------------\n`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
