---
name: ingest-statement
description: >-
  Ingests one or more SimplyGo statement PDF files into the regression test suite,
  diagnoses fare calculation discrepancies against Singapore transit fare rules,
  logically refines domain models/rules without hardcoding, and validates that
  all benchmarks achieve >= 99.5% accuracy.
---

# SimplyGo Statement Ingestion & Regression Workflow

Use this skill whenever the user provides one or more SimplyGo PDF statement file paths (e.g. `/Users/.../SimplyGo Statement Month Year xxxx.pdf`) to analyze, fix fare calculation discrepancies, or add to the regression test suite.

---

## Strict Operating Principles

1. **NO HARDCODING**:
   - Never write logic that checks `filename`, card number, specific dates, trip IDs, or arbitrary per-trip if-conditions to force a fare number.
   - All logic changes MUST represent legitimate, generalizable Singapore public transit fare rules (LTA / Public Transport Council / SimplyGo).
2. **ZERO REGRESSION TOLERANCE**:
   - Every existing statement in `tests/fixtures/statements/` must continue to pass with $\ge 99.5\%$ individual accuracy and $\ge 99.5\%$ combined suite accuracy.
3. **AUTOMATED VERIFICATION**:
   - Run `bun test` and `bun run build` to ensure all tests and type checks pass.

---

## Step-by-Step Execution Workflow

### Step 1: Copy PDF File(s) to Fixtures

When given one or more PDF file paths (or wildcard paths):

1. Copy the PDF file(s) into `tests/fixtures/statements/`:
   ```bash
   cp "<provided-file-path>" tests/fixtures/statements/
   ```
2. Verify the destination file exists in `tests/fixtures/statements/`.

---

### Step 2: Run Forensic Discrepancy Analysis

Execute the automated statement analyzer script:

```bash
bun run .agents/skills/ingest-statement/scripts/analyze-statement.js "tests/fixtures/statements/<statement-filename>.pdf"
```

The script will report:

- Total trips evaluated
- Billed statement total vs Algorithm calculated total
- Initial accuracy percentage
- Detailed journey-by-journey and leg-by-leg discrepancies (billed vs calculated fares, resolved stop names, distances, and transfer flags).

---

### Step 3: Classify and Fix Discrepancies

Identify the root cause of each variance and apply the appropriate domain-level fix:

#### Category A: Bus Stop Name Resolution

- **Symptom**: Bus leg distance is 0 km or defaults to 1.5 km because the stop name in SimplyGo differs from the LTA bus stop database (e.g. `Lot 1/Choa Chu Kang Stn`, `Opp Blk 765`, interchange boarding/alighting bays).
- **Fix**: Update [`lib/distance-resolver.ts`](file:///Users/timooothy/Desktop/concession-roi/lib/distance-resolver.ts) or add stop name mappings/aliases in [`public/data/transit-data.json`](file:///Users/timooothy/Desktop/concession-roi/public/data/transit-data.json).

#### Category B: MRT Station Pair Distance Calibration

- **Symptom**: MRT trip fare is off by $\pm \$0.04$ or $\pm \$0.08$ because the calculated shortest-path network distance crosses a fare stage boundary (e.g. 12.3 km vs 12.0 km).
- **Fix**: Update `mrtDistances` in [`public/data/transit-data.json`](file:///Users/timooothy/Desktop/concession-roi/public/data/transit-data.json) with calibrated distance for the station pair `STATION_A__STATION_B` (and reciprocal `STATION_B__STATION_A`).

#### Category C: Transfer Window & Mode Timing Heuristics

- **Symptom**: Valid transfers were marked as new journeys or expired transfers were chained.
- **Rules in [`lib/fare-calculator.ts`](file:///Users/timooothy/Desktop/concession-roi/lib/fare-calculator.ts)**:
  - Bus to Bus: $\le 55\text{ min}$ tap-in to tap-in gap.
  - Bus to Train: $\le 75\text{ min}$ tap-in to tap-in gap.
  - Train to Bus: Distance-scaled transit time + 45-minute transfer window:
    $$\text{estTrainMinutes} = \min(45, \max(8, \operatorname{round}(\text{distanceKm} \times 2.8 + 5)))$$
    $$\text{maxAllowedTapInGap} = \min(90, \text{estTrainMinutes} + 45)$$
  - Consecutive trains are disqualified unless it is an Out-of-Station Interchange (OSI) $\le 15\text{ min}$.
  - Total journey time $\le 120\text{ min}$, max 6 legs (5 transfers).

#### Category D: Special Fare Progression Rules

- **Express Bus Legs**: Express buses participate in distance fare transfers using `EXPRESS_FARE_TABLE`.
- **Early Morning Rail Discount**: 50¢ rebate for MRT tap-in before 7:45 AM on weekdays (excluding public holidays).
- **Missing Tap Penalty**: `(MISSING ENTRY)` or `(MISSING EXIT)` trips are charged flat penalties ($2.50 MRT / $2.54 Bus). If a bus has a missing entry but a recorded exit tap, subsequent transfers into MRT/bus within 45 min remain valid with marginal fare deducted from the paid penalty.
- **Midnight Rollover**: Overnight trips listed under the previous date header with `12:xx AM` following `11:xx PM` must have timestamp shifted by `+24 hours`.

---

### Step 4: Register Statement in Regression Suite

Edit [`tests/regression.test.ts`](file:///Users/timooothy/Desktop/concession-roi/tests/regression.test.ts) to add the new statement to `BENCHMARKS`:

```typescript
{
  filename: "<statement-filename>.pdf",
  expectedMinTrips: <parsed-trip-count - 5>,
  expectedStatementTotal: <statement-billed-total>,
  minAccuracyPercent: 99.5,
},
```

---

### Step 5: Iteration & Verification Loop

1. Run the test suite:
   ```bash
   bun test
   ```
2. If any statement benchmark achieves $< 99.5\%$ accuracy:
   - Run `bun run .agents/skills/ingest-statement/scripts/analyze-statement.js "tests/fixtures/statements/<failing-file>.pdf"`
   - Pinpoint the exact journey discrepancies.
   - Adjust transit distances or general calculation rules.
   - Re-run `bun test`.
3. Repeat until **ALL statements pass with $\ge 99.5\%$ accuracy**.
4. Confirm build passes:
   ```bash
   bun run build
   ```
5. Report final individual and combined accuracy table to the user.
