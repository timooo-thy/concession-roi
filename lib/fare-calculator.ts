import {
  RawTrip,
  CalculatedTrip,
  JourneyChain,
  StatementSummary,
  PassTypeConfig,
} from "@/types";

// Singapore Adult Card Fares (Dec 2025/2026 rates in cents)
// Distance (km) upper bound -> fare in cents
export const TRUNK_FARE_TABLE: { maxKm: number; cents: number }[] = [
  { maxKm: 3.2, cents: 128 },
  { maxKm: 4.2, cents: 138 },
  { maxKm: 5.2, cents: 149 },
  { maxKm: 6.2, cents: 159 },
  { maxKm: 7.2, cents: 168 },
  { maxKm: 8.2, cents: 175 },
  { maxKm: 9.2, cents: 182 },
  { maxKm: 10.2, cents: 186 },
  { maxKm: 11.2, cents: 190 },
  { maxKm: 12.2, cents: 194 },
  { maxKm: 13.2, cents: 198 },
  { maxKm: 14.2, cents: 202 },
  { maxKm: 15.2, cents: 207 },
  { maxKm: 16.2, cents: 211 },
  { maxKm: 17.2, cents: 215 },
  { maxKm: 18.2, cents: 220 },
  { maxKm: 19.2, cents: 224 },
  { maxKm: 20.2, cents: 227 },
  { maxKm: 21.2, cents: 230 },
  { maxKm: 22.2, cents: 233 },
  { maxKm: 23.2, cents: 236 },
  { maxKm: 24.2, cents: 238 },
  { maxKm: 25.2, cents: 240 },
  { maxKm: 26.2, cents: 242 },
  { maxKm: 27.2, cents: 243 },
  { maxKm: 28.2, cents: 244 },
  { maxKm: 29.2, cents: 245 },
  { maxKm: 30.2, cents: 246 },
  { maxKm: 31.2, cents: 247 },
  { maxKm: 32.2, cents: 248 },
  { maxKm: 33.2, cents: 249 },
  { maxKm: 34.2, cents: 250 },
  { maxKm: 35.2, cents: 251 },
  { maxKm: 36.2, cents: 252 },
  { maxKm: 37.2, cents: 253 },
  { maxKm: 38.2, cents: 254 },
  { maxKm: 39.2, cents: 255 },
  { maxKm: 40.2, cents: 256 },
  { maxKm: 9999.0, cents: 257 },
];

export const EXPRESS_FARE_TABLE: { maxKm: number; cents: number }[] = [
  { maxKm: 3.2, cents: 228 },
  { maxKm: 4.2, cents: 238 },
  { maxKm: 5.2, cents: 249 },
  { maxKm: 6.2, cents: 259 },
  { maxKm: 7.2, cents: 268 },
  { maxKm: 8.2, cents: 275 },
  { maxKm: 9.2, cents: 282 },
  { maxKm: 10.2, cents: 286 },
  { maxKm: 11.2, cents: 290 },
  { maxKm: 12.2, cents: 294 },
  { maxKm: 13.2, cents: 298 },
  { maxKm: 14.2, cents: 302 },
  { maxKm: 15.2, cents: 307 },
  { maxKm: 16.2, cents: 311 },
  { maxKm: 17.2, cents: 315 },
  { maxKm: 18.2, cents: 320 },
  { maxKm: 19.2, cents: 324 },
  { maxKm: 20.2, cents: 327 },
  { maxKm: 21.2, cents: 330 },
  { maxKm: 22.2, cents: 333 },
  { maxKm: 23.2, cents: 336 },
  { maxKm: 24.2, cents: 338 },
  { maxKm: 25.2, cents: 340 },
  { maxKm: 26.2, cents: 342 },
  { maxKm: 27.2, cents: 343 },
  { maxKm: 28.2, cents: 344 },
  { maxKm: 29.2, cents: 345 },
  { maxKm: 30.2, cents: 346 },
  { maxKm: 31.2, cents: 347 },
  { maxKm: 32.2, cents: 348 },
  { maxKm: 33.2, cents: 349 },
  { maxKm: 34.2, cents: 350 },
  { maxKm: 35.2, cents: 351 },
  { maxKm: 36.2, cents: 352 },
  { maxKm: 37.2, cents: 353 },
  { maxKm: 38.2, cents: 354 },
  { maxKm: 39.2, cents: 355 },
  { maxKm: 40.2, cents: 356 },
  { maxKm: 9999.0, cents: 357 },
];

export const STANDARD_PASS_PRESETS: PassTypeConfig[] = [
  {
    id: "adult-hybrid",
    name: "Adult Monthly Travel Pass (Hybrid Bus & Train)",
    description:
      "Unlimited travel on all basic public bus and train (MRT/LRT) services",
    priceDollars: 122.0,
    modes: ["BUS", "TRAIN"],
  },
];

export function isExpressBus(serviceNo?: string): boolean {
  if (!serviceNo) return false;
  const s = serviceNo.toUpperCase().trim();
  if (s.endsWith("E") || (s.endsWith("M") && s.startsWith("5"))) return true;
  const num = parseInt(s, 10);
  if (!isNaN(num)) {
    if (num >= 500 && num <= 520) return true;
  }
  return false;
}

export function isFeederBus(serviceNo?: string): boolean {
  if (!serviceNo) return false;
  const s = serviceNo.toUpperCase().trim();
  const num = parseInt(s, 10);
  if (!isNaN(num)) {
    // 290-299, 300-309, 350-359, 800-819, 900-919 are feeder services
    if (
      (num >= 290 && num <= 299) ||
      (num >= 300 && num <= 309) ||
      (num >= 350 && num <= 359) ||
      (num >= 800 && num <= 819) ||
      (num >= 900 && num <= 919) ||
      (num >= 240 && num <= 243)
    ) {
      return true;
    }
  }
  return false;
}

export function lookupDistanceFare(
  distanceKm: number,
  isExpress: boolean = false,
): number {
  const table = isExpress ? EXPRESS_FARE_TABLE : TRUNK_FARE_TABLE;
  const dist = Math.max(0.1, distanceKm);
  for (const tier of table) {
    if (dist <= tier.maxKm) {
      return tier.cents;
    }
  }
  return table[table.length - 1].cents;
}

export function isEarlyMorningRailDiscount(trip: RawTrip): boolean {
  if (trip.mode !== "TRAIN") return false;

  // Check day of week (Monday to Friday only)
  const day = trip.dayOfWeek?.toUpperCase();
  if (
    day === "SAT" ||
    day === "SUN" ||
    day === "SATURDAY" ||
    day === "SUNDAY"
  ) {
    return false;
  }

  // Parse timeStr (e.g. "07:22 AM", "7:22 AM", "11:21 PM")
  if (!trip.timeStr) return false;
  const match = trip.timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
  if (!match) return false;

  let hour = parseInt(match[1], 10);
  const min = parseInt(match[2], 10);
  const ampm = match[3]?.toUpperCase();

  if (ampm === "PM" && hour < 12) hour += 12;
  if (ampm === "AM" && hour === 12) hour = 0;

  // Before 7:45 AM
  if (hour < 7 || (hour === 7 && min < 45)) {
    return true;
  }
  return false;
}

export function parseTripTimestamp(dateStr: string, timeStr: string): number {
  try {
    const combined = `${dateStr} ${timeStr}`;
    const ts = Date.parse(combined);
    if (!isNaN(ts)) return ts;
  } catch {
    // fallback
  }
  return 0;
}


// OSI pairs for MRT
function isOsi(dest: string | undefined, orig: string | undefined) {
  if (!dest || !orig) return false;
  const d = dest.toLowerCase();
  const o = orig.toLowerCase();
  
  if (d.includes('newton') && o.includes('newton')) return true;
  if (d.includes('tampines') && o.includes('tampines')) return true;
  if (d.includes('bukit panjang') && o.includes('bukit panjang')) return true;
  
  return false;
}

/**
 * Calculates individual and journey-chained fares according to LTA Distance Fare rules
 */
export function calculateFares(
  rawTrips: (RawTrip & { distanceKm: number; resolvedOrigin?: string; resolvedDestination?: string })[]
): { calculatedTrips: CalculatedTrip[]; journeys: JourneyChain[]; summary: StatementSummary } {
  // Sort trips chronologically
  const sortedTrips = [...rawTrips].map((t, idx) => {
    const timestamp = t.timestamp || parseTripTimestamp(t.dateStr, t.timeStr) || idx * 1000;
    return { ...t, timestamp };
  }).sort((a, b) => a.timestamp - b.timestamp);

  const calculatedTrips: CalculatedTrip[] = [];
  const journeys: JourneyChain[] = [];

  let currentJourneyTrips: CalculatedTrip[] = [];
  let journeyCount = 0;
  let journeyRailDiscountCents = 0;

  for (let i = 0; i < sortedTrips.length; i++) {
    const raw = sortedTrips[i];
    const isExpress = raw.mode === 'BUS' && isExpressBus(raw.serviceNo);
    const isNight = raw.mode === 'BUS' && (raw.serviceNo?.toUpperCase().includes('NR') || raw.serviceNo?.toUpperCase().includes('NITE'));
    const isExcluded = isExpress || isNight; // Simplified exclusion check
    
    const isFeeder = raw.mode === 'BUS' && isFeederBus(raw.serviceNo);
    const isEarlyRail = isEarlyMorningRailDiscount(raw);

    // Standalone fare for this individual trip leg
    let standaloneCents = isFeeder 
      ? 128 
      : lookupDistanceFare(raw.distanceKm, isExpress);
    
    if (isEarlyRail) {
      standaloneCents = Math.max(0, standaloneCents - 50);
    }

    // Determine if this trip continues the current transfer journey
    const prevTrip = currentJourneyTrips[currentJourneyTrips.length - 1];
    let isContinuation = false;

    // A journey can have up to 6 legs (5 transfers)
    if (prevTrip && currentJourneyTrips.length < 6) { 
      const prevTs = prevTrip.timestamp ?? 0;
      const curTs = raw.timestamp ?? 0;
      const firstTs = currentJourneyTrips[0]?.timestamp ?? 0;

      // timeDiffMinutes uses tap-in to tap-in heuristic for PDF which lacks tap-out. 
      // Adjusted heuristic window to <= 60 minutes as per spec.
      const timeDiffMinutes = (curTs - prevTs) / (1000 * 60);
      const totalJourneyTimeMinutes = (curTs - firstTs) / (1000 * 60);

      const sameBusService = raw.mode === 'BUS' && prevTrip.mode === 'BUS' && raw.serviceNo === prevTrip.serviceNo;
      
      const hasTrain = currentJourneyTrips.some(t => t.mode === 'TRAIN');
      const isOsiTransfer = raw.mode === 'TRAIN' && prevTrip.mode === 'TRAIN' && 
                            timeDiffMinutes <= 15 && isOsi(prevTrip.resolvedDestination || prevTrip.destination, raw.resolvedOrigin || raw.origin);
      
      const trainDisqualification = raw.mode === 'TRAIN' && hasTrain && !isOsiTransfer;
      const prevWasExcluded = prevTrip.mode === 'BUS' && (isExpressBus(prevTrip.serviceNo) || prevTrip.serviceNo?.toUpperCase().includes('NR'));

      // If missing exit, distance might be 0 or there's a penalty fare. This might break the chain if time gap is too large, but handled by 60 min check.
      
      if (timeDiffMinutes >= 0 && 
          timeDiffMinutes <= 60 && 
          totalJourneyTimeMinutes <= 120 && 
          raw.dateStr === prevTrip.dateStr && 
          !sameBusService && 
          !trainDisqualification && 
          !isExcluded && 
          !prevWasExcluded) {
        isContinuation = true;
      }
    }

    const journeyId = isContinuation && prevTrip ? prevTrip.transferJourneyId : `journey-${++journeyCount}`;

    if (!isContinuation) {
       journeyRailDiscountCents = 0;
    }

    // Chained fare calculation
    let chainedFareCents = 0;
    if (raw.billedFareCents !== undefined && raw.hasBilledPrice) {
      // Use exact price extracted from PDF statement
      chainedFareCents = raw.billedFareCents;
    } else if (!isContinuation) {
      // First leg of a journey
      chainedFareCents = standaloneCents;
    } else {
      // Leg 2, 3, etc. in a transfer journey
      // Calculate cumulative distance by rounding per leg then summing, or summing exact then rounding?
      // Spec says sum then round or round then sum? Standard LTA usually uses sum of exact, then round to 1 dec.
      const prevCumDistance = Number(currentJourneyTrips.reduce((sum, t) => sum + t.distanceKm, 0).toFixed(1));
      const newCumDistance = Number((prevCumDistance + raw.distanceKm).toFixed(1));

      // Fare cap logic (distances > 40.2km are capped). lookupDistanceFare handles it since the table stops at 40.2.
      const prevTotalJourneyFare = lookupDistanceFare(prevCumDistance, false); // Journey fare is basic, excluded handled separately
      const newTotalJourneyFare = lookupDistanceFare(newCumDistance, false);
      const marginalFare = Math.max(0, newTotalJourneyFare - prevTotalJourneyFare);

      chainedFareCents = marginalFare;
      
      if (isEarlyRail && journeyRailDiscountCents < 50) {
        const discountAllowed = Math.min(50 - journeyRailDiscountCents, chainedFareCents);
        chainedFareCents -= discountAllowed;
        journeyRailDiscountCents += discountAllowed;
      }
    }

    const calcTrip: CalculatedTrip = {
      ...raw,
      distanceKm: Number(raw.distanceKm.toFixed(1)),
      individualFareCents: standaloneCents,
      chainedFareCents: chainedFareCents,
      isTransfer: isContinuation,
      transferJourneyId: journeyId,
      isEarlyMorningDiscount: isEarlyRail,
      resolvedOrigin: raw.resolvedOrigin || raw.origin,
      resolvedDestination: raw.resolvedDestination || raw.destination,
    };

    if (!isContinuation && currentJourneyTrips.length > 0) {
      // Finalize previous journey
      journeys.push(createJourneyChain(currentJourneyTrips));
      currentJourneyTrips = [];
    }

    currentJourneyTrips.push(calcTrip);
    calculatedTrips.push(calcTrip);
  }

  if (currentJourneyTrips.length > 0) {
    journeys.push(createJourneyChain(currentJourneyTrips));
  }

  // Calculate high-level summary
  const totalBusTrips = calculatedTrips.filter(t => t.mode === 'BUS').length;
  const totalTrainTrips = calculatedTrips.filter(t => t.mode === 'TRAIN').length;
  const totalDistanceKm = Number(calculatedTrips.reduce((sum, t) => sum + t.distanceKm, 0).toFixed(1));
  const totalNormalFareDollars = Number((calculatedTrips.reduce((sum, t) => sum + t.chainedFareCents, 0) / 100).toFixed(2));
  const totalStandaloneFareDollars = Number((calculatedTrips.reduce((sum, t) => sum + t.individualFareCents, 0) / 100).toFixed(2));
  const totalTransferSavingsDollars = Number((totalStandaloneFareDollars - totalNormalFareDollars).toFixed(2));

  const passCostDollars = 122.0; // Default Adult Hybrid
  const netSavingsDollars = Number((totalNormalFareDollars - passCostDollars).toFixed(2));
  const roiPercentage = passCostDollars > 0 
    ? Number(((netSavingsDollars / passCostDollars) * 100).toFixed(1))
    : 0;

  const dates = calculatedTrips.map(t => t.dateStr).filter(Boolean);
  const earliestDate = dates[0] || undefined;
  const latestDate = dates[dates.length - 1] || undefined;

  const summary: StatementSummary = {
    totalTrips: calculatedTrips.length,
    totalBusTrips,
    totalTrainTrips,
    totalDistanceKm,
    totalNormalFareDollars,
    totalStandaloneFareDollars,
    totalTransferSavingsDollars,
    passCostDollars,
    netSavingsDollars,
    roiPercentage,
    isProfitable: netSavingsDollars >= 0,
    earliestDate,
    latestDate,
  };

  return {
    calculatedTrips,
    journeys,
    summary,
  };
}

function createJourneyChain(trips: CalculatedTrip[]): JourneyChain {

  const totalDistanceKm = Number(
    trips.reduce((sum, t) => sum + t.distanceKm, 0).toFixed(1),
  );
  const totalFareCents = trips.reduce((sum, t) => sum + t.chainedFareCents, 0);
  const standaloneFareCents = trips.reduce(
    (sum, t) => sum + t.individualFareCents,
    0,
  );
  const transferSavingsCents = Math.max(
    0,
    standaloneFareCents - totalFareCents,
  );

  return {
    id: trips[0].transferJourneyId,
    dateStr: trips[0].dateStr,
    trips,
    totalDistanceKm,
    totalFareCents,
    standaloneFareCents,
    transferSavingsCents,
    startTimeStr: trips[0].timeStr,
    endTimeStr: trips[trips.length - 1].timeStr,
  };
}
