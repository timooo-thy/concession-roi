import transitDataRaw from '@/public/data/transit-data.json';

export interface BusStopInfo {
  c: string; // code
  n: string; // name
  r: string; // road
  lat: number;
  lng: number;
}

export interface RouteStop {
  s: number; // sequence
  c: string; // code
  d: number; // distance
}

export interface TransitData {
  version: string;
  busStops: Record<string, BusStopInfo>;
  stopNameToCodes: Record<string, string[]>;
  busRoutes: Record<string, Record<string, RouteStop[]>>;
  mrtStations: Record<string, string[]>;
  mrtDistances: Record<string, number>;
}

const transitData = transitDataRaw as unknown as TransitData;

export function normalizeTransitName(name: string): string {
  if (!name) return '';
  return name
    .toUpperCase()
    .replace(/\b(BOARD|ALIGHT)\s+/g, '')
    .replace(/\bCP\b/g, 'CHECKPT')
    .replace(/\bINTERCHANGE\s*(B\d+(\s*&\s*B\d+)?)?\b/g, 'INT')
    .replace(/\bINT\s*B\d+(\s*&\s*B\d+)?\b/g, 'INT')
    .replace(/\bBUKIT\b/g, 'BT')
    .replace(/\bTANJONG\b/g, 'TG')
    .replace(/\bLORONG\b/g, 'LOR')
    .replace(/\bUPPER\b/g, 'UPP')
    .replace(/\bTEMPORARY\b/g, 'TEMP')
    .replace(/\bSTATION\b/g, 'STN')
    .replace(/\bPR SCH\b/g, 'PRI SCH')
    .replace(/\bPRIMARY SCH\b/g, 'PRI SCH')
    .replace(/\bSEC SCH\b/g, 'SEC SCH')
    .replace(/\bSECONDARY SCH\b/g, 'SEC SCH')
    .replace(/[^A-Z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Calculates Haversine distance in km between two lat/lng coordinates
 */
export function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Resolves MRT station-to-station distance
 */
export function resolveTrainDistance(origin: string, destination: string): { distanceKm: number; matchedOrigin: string; matchedDest: string } {
  const normOrigin = origin.toUpperCase().replace(/\bMRT\b/gi, '').replace(/\bLRT\b/gi, '').replace(/\bSTN\b/gi, '').replace(/\bSTATION\b/gi, '').trim();
  const normDest = destination.toUpperCase().replace(/\bMRT\b/gi, '').replace(/\bLRT\b/gi, '').replace(/\bSTN\b/gi, '').replace(/\bSTATION\b/gi, '').trim();

  // Find direct match in station names
  const stationNames = Object.keys(transitData.mrtStations);
  const bestOrigin = stationNames.find(s => s.toUpperCase() === normOrigin) ||
                     stationNames.find(s => s.toUpperCase().includes(normOrigin) || normOrigin.includes(s.toUpperCase())) ||
                     origin;

  const bestDest = stationNames.find(s => s.toUpperCase() === normDest) ||
                   stationNames.find(s => s.toUpperCase().includes(normDest) || normDest.includes(s.toUpperCase())) ||
                   destination;

  if (bestOrigin.toUpperCase() === bestDest.toUpperCase()) {
    return { distanceKm: 0.0, matchedOrigin: bestOrigin, matchedDest: bestDest };
  }

  const key1 = `${bestOrigin.toUpperCase()}__${bestDest.toUpperCase()}`;
  const key2 = `${bestDest.toUpperCase()}__${bestOrigin.toUpperCase()}`;

  const dist = transitData.mrtDistances[key1] ?? transitData.mrtDistances[key2];
  if (dist !== undefined && dist > 0) {
    return { distanceKm: dist, matchedOrigin: bestOrigin, matchedDest: bestDest };
  }

  // Fallback distance estimate for unrecognized stations
  return { distanceKm: 4.5, matchedOrigin: origin, matchedDest: destination };
}

const INTERCHANGE_ALIASES: Record<string, string[]> = {
  "JURONG EAST INT": ["28009", "28301", "28431", "28211"],
  "CHOA CHU KANG INT": ["44009", "44531", "44539"],
  "CLEMENTI INT": ["17009", "17171", "17179"],
  "BOON LAY INT": ["22009", "22201", "22209"],
  "WOODLANDS INT": ["46009", "46521", "46529"],
  "BUKIT PANJANG INT": ["44009", "44851", "44859", "44021", "44029"],
  "BEDOK INT": ["84009", "84031", "84039"],
  "TAMPINES INT": ["75009", "75051", "75059"],
};

/**
 * Finds candidate bus stop codes for a given stop name
 */
export function findBusStopCodes(stopName: string): string[] {
  const rawNorm = stopName.toUpperCase().trim();
  const cleanNorm = normalizeTransitName(stopName);

  // Exact lookup
  if (transitData.stopNameToCodes[rawNorm]) {
    return transitData.stopNameToCodes[rawNorm];
  }
  if (transitData.stopNameToCodes[cleanNorm]) {
    return transitData.stopNameToCodes[cleanNorm];
  }

  // Fuzzy lookup in busStops dictionary
  const matches: { code: string; score: number }[] = [];
  for (const [code, info] of Object.entries(transitData.busStops)) {
    const infoNorm = normalizeTransitName(info.n);
    if (infoNorm === cleanNorm) {
      return [code];
    }
    if (infoNorm.includes(cleanNorm) || cleanNorm.includes(infoNorm)) {
      matches.push({ code, score: Math.abs(infoNorm.length - cleanNorm.length) });
    }
  }

  matches.sort((a, b) => a.score - b.score);
  return matches.map(m => m.code).slice(0, 10);
}

/**
 * Expands stop code candidates with interchange aliases and opposite-side stops
 */
export function findExpandedBusStopCodes(stopName: string): string[] {
  const cleanNorm = normalizeTransitName(stopName);
  const rawNorm = stopName.toUpperCase().trim();
  const codes: string[] = [...findBusStopCodes(stopName)];

  const add = (arr: string[] | undefined) => {
    if (!arr) return;
    for (const c of arr) {
      if (!codes.includes(c)) codes.push(c);
    }
  };

  // Check interchange aliases
  for (const [intName, intCodes] of Object.entries(INTERCHANGE_ALIASES)) {
    if (cleanNorm.includes(intName) || rawNorm.includes(intName)) {
      add(intCodes);
    }
  }

  // Check opposite stop name (e.g. "Opp Kranji Stn" <-> "Kranji Stn")
  if (cleanNorm.startsWith("OPP ")) {
    add(transitData.stopNameToCodes[cleanNorm.slice(4).trim()]);
  } else {
    add(transitData.stopNameToCodes[`OPP ${cleanNorm}`]);
  }

  return codes;
}

/**
 * Resolves distance for a bus trip given service number, origin stop name, and destination stop name
 */
export function resolveBusDistance(
  serviceNo: string | undefined,
  originName: string,
  destName: string
): { distanceKm: number; matchedOrigin: string; matchedDest: string } {
  const svc = (serviceNo || '').toUpperCase().trim();
  const routeDirs = transitData.busRoutes[svc];

  if (!routeDirs || originName.toUpperCase().includes('MISSING') || destName.toUpperCase().includes('MISSING')) {
    return { distanceKm: 3.2, matchedOrigin: originName, matchedDest: destName };
  }

  const findSegment = (oCodes: Set<string>, dCodes: Set<string>) => {
    let bestDist = Infinity;
    let bestOriginStop: RouteStop | null = null;
    let bestDestStop: RouteStop | null = null;

    for (const dirKey of Object.keys(routeDirs)) {
      const stops = routeDirs[dirKey];
      for (let i = 0; i < stops.length; i++) {
        if (oCodes.has(stops[i].c)) {
          for (let j = i + 1; j < stops.length; j++) {
            if (dCodes.has(stops[j].c)) {
              const dist = Math.max(0.1, Number((stops[j].d - stops[i].d).toFixed(1)));
              if (dist < bestDist) {
                bestDist = dist;
                bestOriginStop = stops[i];
                bestDestStop = stops[j];
              }
            }
          }
        }
      }
    }
    return { bestDist, bestOriginStop, bestDestStop };
  };

  // Pass 1: exact matches
  const exactOCodes = new Set(findBusStopCodes(originName));
  const exactDCodes = new Set(findBusStopCodes(destName));
  let result = findSegment(exactOCodes, exactDCodes);

  // Pass 2: expanded matches (interchanges & opposite pairs) if not found
  if (result.bestDist === Infinity) {
    const expOCodes = new Set(findExpandedBusStopCodes(originName));
    const expDCodes = new Set(findExpandedBusStopCodes(destName));
    result = findSegment(expOCodes, expDCodes);
  }

  if (result.bestDist !== Infinity && result.bestOriginStop && result.bestDestStop) {
    const oName = transitData.busStops[result.bestOriginStop.c]?.n || originName;
    const dName = transitData.busStops[result.bestDestStop.c]?.n || destName;
    return { distanceKm: result.bestDist, matchedOrigin: oName, matchedDest: dName };
  }

  // Fallback: estimate from coordinates if stop codes were found
  const allO = Array.from(new Set([...exactOCodes, ...findExpandedBusStopCodes(originName)]));
  const allD = Array.from(new Set([...exactDCodes, ...findExpandedBusStopCodes(destName)]));
  if (allO[0] && allD[0]) {
    const oStop = transitData.busStops[allO[0]];
    const dStop = transitData.busStops[allD[0]];
    if (oStop && dStop) {
      const straightLineDist = haversineDistance(oStop.lat, oStop.lng, dStop.lat, dStop.lng);
      const estimatedRoadDist = Number((straightLineDist * 1.3).toFixed(1)); // 1.3 road winding factor
      return { distanceKm: Math.max(0.8, estimatedRoadDist), matchedOrigin: oStop.n, matchedDest: dStop.n };
    }
  }

  return { distanceKm: 2.8, matchedOrigin: originName, matchedDest: destName };
}
