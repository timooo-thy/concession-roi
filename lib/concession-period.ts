import { CalculatedTrip, RawTrip } from "@/types";

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const FULL_MONTH_NAMES = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
];

export interface PassPeriodResult {
  startDate: Date;
  endDate: Date;
  startDateStr: string; // e.g. "15 Jul 2026"
  endDateStr: string; // e.g. "14 Aug 2026"
  startDateIso: string; // e.g. "2026-07-15"
  endDateIso: string; // e.g. "2026-08-14"
  formattedRange: string; // e.g. "15 Jul 2026 – 14 Aug 2026"
  totalDays: number;
}

/**
 * Parses date strings in various formats:
 * - "15 Jul 2026" or "15 July 2026"
 * - "2026-07-15"
 * - "15/07/2026"
 */
export function parseDateString(dateStr: string): Date | null {
  if (!dateStr) return null;
  const clean = dateStr.trim();

  // Try standard ISO "YYYY-MM-DD"
  if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
    const [y, m, d] = clean.split("-").map((n) => parseInt(n, 10));
    return new Date(y, m - 1, d, 12, 0, 0);
  }

  // Try "DD Mon YYYY" e.g. "15 Jul 2026" or "15 July 2026"
  const dmyMatch = clean.match(/^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/);
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1], 10);
    const monthName = dmyMatch[2].toLowerCase();
    const year = parseInt(dmyMatch[3], 10);

    let monthIdx = MONTH_NAMES.findIndex(
      (m) => m.toLowerCase() === monthName.slice(0, 3)
    );
    if (monthIdx === -1) {
      monthIdx = FULL_MONTH_NAMES.findIndex((m) => m === monthName);
    }

    if (monthIdx !== -1) {
      return new Date(year, monthIdx, day, 12, 0, 0);
    }
  }

  // Fallback to Date.parse
  const ts = Date.parse(clean);
  if (!isNaN(ts)) {
    return new Date(ts);
  }

  return null;
}

export function formatDateToDisplay(date: Date): string {
  const day = date.getDate().toString().padStart(2, "0");
  const month = MONTH_NAMES[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

export function formatDateToIso(date: Date): string {
  const y = date.getFullYear();
  const m = (date.getMonth() + 1).toString().padStart(2, "0");
  const d = date.getDate().toString().padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Calculates the pass expiration date based on the official TransitLink rule:
 * "The pass expires on the day before the same numerical date in the next calendar month."
 * With month-end clamping (e.g. 31 Jan -> 28 Feb, 31 Mar -> 30 Apr).
 */
export function calculatePassPeriod(inputStartDate: Date | string): PassPeriodResult {
  const start =
    typeof inputStartDate === "string"
      ? parseDateString(inputStartDate) || new Date()
      : new Date(inputStartDate);

  // Normalize start to 00:00:00
  const startYear = start.getFullYear();
  const startMonth = start.getMonth(); // 0 to 11
  const startDay = start.getDate();

  // Determine target month and year
  const nextMonth = (startMonth + 1) % 12;
  const nextYear = startMonth === 11 ? startYear + 1 : startYear;

  // Number of days in the next calendar month
  const daysInNextMonth = new Date(nextYear, nextMonth + 1, 0).getDate();

  let endYear = nextYear;
  let endMonth = nextMonth;
  let endDay = startDay - 1;

  if (startDay === 1) {
    // If starting on the 1st (e.g., 01 Jul), the pass expires on the last day of the SAME month (31 Jul).
    endYear = startYear;
    endMonth = startMonth;
    endDay = new Date(startYear, startMonth + 1, 0).getDate();
  } else if (startDay > daysInNextMonth) {
    // Shorter month case: e.g. Start 31 Jan -> Next month Feb has 28 days -> Expires on last day of Feb (28 Feb)
    endDay = daysInNextMonth;
  } else if (endDay === 0) {
    // Safety check
    endDay = daysInNextMonth;
  }

  const startDateObj = new Date(startYear, startMonth, startDay, 0, 0, 0, 0);
  const endDateObj = new Date(endYear, endMonth, endDay, 23, 59, 59, 999);

  const startDateStr = formatDateToDisplay(startDateObj);
  const endDateStr = formatDateToDisplay(endDateObj);
  const startDateIso = formatDateToIso(startDateObj);
  const endDateIso = formatDateToIso(endDateObj);

  return {
    startDate: startDateObj,
    endDate: endDateObj,
    startDateStr,
    endDateStr,
    startDateIso,
    endDateIso,
    formattedRange: `${startDateStr} – ${endDateStr}`,
    totalDays: Math.max(
      28,
      Math.min(
        31,
        Math.round(
          (endDateObj.getTime() - startDateObj.getTime()) / (1000 * 60 * 60 * 24)
        ) + 1
      )
    ),
  };
}

/**
 * Filter trips strictly falling between start and end date (inclusive).
 */
export function filterTripsByPassPeriod(
  trips: CalculatedTrip[],
  startDate: Date | string,
  endDate: Date | string
): CalculatedTrip[] {
  const startObj =
    typeof startDate === "string" ? parseDateString(startDate) : startDate;
  const endObj =
    typeof endDate === "string" ? parseDateString(endDate) : endDate;

  if (!startObj || !endObj) return trips;

  // Set start to start of day, end to end of day
  const startTs = new Date(
    startObj.getFullYear(),
    startObj.getMonth(),
    startObj.getDate(),
    0,
    0,
    0,
    0
  ).getTime();

  const endTs = new Date(
    endObj.getFullYear(),
    endObj.getMonth(),
    endObj.getDate(),
    23,
    59,
    59,
    999
  ).getTime();

  return trips.filter((trip) => {
    const tripDate = parseDateString(trip.dateStr);
    if (!tripDate) return false;
    const t = tripDate.getTime();
    return t >= startTs && t <= endTs;
  });
}

/**
 * Generates smart quick presets from loaded trips:
 * 1. Earliest trip date
 * 2. 15th of the earliest month
 * 3. 1st of the earliest month
 * 4. 1st / 15th of any subsequent months found
 */
export function getRecommendedStartDates(
  trips: (RawTrip | CalculatedTrip)[]
): { label: string; dateStr: string; isoDate: string }[] {
  if (!trips || trips.length === 0) return [];

  const validDates = trips
    .map((t) => parseDateString(t.dateStr))
    .filter((d): d is Date => d !== null)
    .sort((a, b) => a.getTime() - b.getTime());

  if (validDates.length === 0) return [];

  const earliest = validDates[0];
  const presets: { label: string; dateStr: string; isoDate: string }[] = [];

  // Earliest recorded trip date
  presets.push({
    label: `Earliest (${formatDateToDisplay(earliest)})`,
    dateStr: formatDateToDisplay(earliest),
    isoDate: formatDateToIso(earliest),
  });

  // Unique months in dataset
  const seenMonths = new Set<string>();
  for (const d of validDates) {
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (!seenMonths.has(key)) {
      seenMonths.add(key);

      // 15th of this month
      const midMonth = new Date(d.getFullYear(), d.getMonth(), 15, 12, 0, 0);
      if (midMonth.getTime() !== earliest.getTime()) {
        presets.push({
          label: `15th of ${MONTH_NAMES[d.getMonth()]} (${formatDateToDisplay(midMonth)})`,
          dateStr: formatDateToDisplay(midMonth),
          isoDate: formatDateToIso(midMonth),
        });
      }

      // 1st of this month
      const firstOfMonth = new Date(d.getFullYear(), d.getMonth(), 1, 12, 0, 0);
      if (firstOfMonth.getTime() !== earliest.getTime()) {
        presets.push({
          label: `1st of ${MONTH_NAMES[d.getMonth()]} (${formatDateToDisplay(firstOfMonth)})`,
          dateStr: formatDateToDisplay(firstOfMonth),
          isoDate: formatDateToIso(firstOfMonth),
        });
      }
    }
  }

  return presets;
}

/**
 * Returns the list of unique year-month keys (e.g. ["2026-6"]) present in the trips dataset.
 */
export function getUniqueMonths(
  trips: (RawTrip | CalculatedTrip)[]
): string[] {
  if (!trips || trips.length === 0) return [];
  const seenMonths = new Set<string>();
  for (const t of trips) {
    const d = parseDateString(t.dateStr);
    if (d) {
      seenMonths.add(`${d.getFullYear()}-${d.getMonth()}`);
    }
  }
  return Array.from(seenMonths);
}

