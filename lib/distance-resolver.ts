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
  .replace(/\bINT\s+B\d+(\s*&\s*B\d+)?\b/g, 'INT')
  .replace(/\bTEMPORARY\b/g, 'TEMP')
  .replace(/\bSTATION\b/g, 'STN')
  .replace(/\bPR SCH\b/g, 'PRI SCH')
  .replace(/\bSEC SCH\b/g, 'SEC SCH')
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

  const key1 = `${bestOrigin.toUpperCase()}__${bestDest.toUpperCase()}`;
  const key2 = `${bestDest.toUpperCase()}__${bestOrigin.toUpperCase()}`;

  const dist = transitData.mrtDistances[key1] ?? transitData.mrtDistances[key2];
  if (dist !== undefined && dist > 0) {
    return { distanceKm: dist, matchedOrigin: bestOrigin, matchedDest: bestDest };
  }

  // Fallback distance estimate for unrecognized stations
  return { distanceKm: 4.5, matchedOrigin: origin, matchedDest: destination };
}

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
 * Resolves distance for a bus trip given service number, origin stop name, and destination stop name
 */
export function resolveBusDistance(
  serviceNo: string | undefined,
  originName: string,
  destName: string
): { distanceKm: number; matchedOrigin: string; matchedDest: string } {
  const svc = (serviceNo || '').toUpperCase().trim();
  const routeDirs = transitData.busRoutes[svc];

  if (!routeDirs) {
    // If service not in routes (e.g. specialized shuttle), fallback to coordinate distance or default
    return { distanceKm: 3.2, matchedOrigin: originName, matchedDest: destName };
  }

  const originCodes = new Set(findBusStopCodes(originName));
  const destCodes = new Set(findBusStopCodes(destName));

  // Check both directions
  for (const dirKey of Object.keys(routeDirs)) {
    const stops = routeDirs[dirKey];
    let originIndex = -1;
    let originStop: RouteStop | null = null;

    for (let i = 0; i < stops.length; i++) {
      if (originCodes.has(stops[i].c)) {
        originIndex = i;
        originStop = stops[i];
        break;
      }
    }

    if (originIndex !== -1 && originStop) {
      for (let j = originIndex + 1; j < stops.length; j++) {
        if (destCodes.has(stops[j].c)) {
          const destStop = stops[j];
          const dist = Math.max(0.1, Number((destStop.d - originStop.d).toFixed(1)));
          const oName = transitData.busStops[originStop.c]?.n || originName;
          const dName = transitData.busStops[destStop.c]?.n || destName;
          return { distanceKm: dist, matchedOrigin: oName, matchedDest: dName };
        }
      }
    }
  }

  // Fallback: estimate from coordinates if stop codes were found
  const firstOCode = Array.from(originCodes)[0];
  const firstDCode = Array.from(destCodes)[0];
  if (firstOCode && firstDCode) {
    const oStop = transitData.busStops[firstOCode];
    const dStop = transitData.busStops[firstDCode];
    if (oStop && dStop) {
      const straightLineDist = haversineDistance(oStop.lat, oStop.lng, dStop.lat, dStop.lng);
      const estimatedRoadDist = Number((straightLineDist * 1.3).toFixed(1)); // 1.3 road winding factor
      return { distanceKm: Math.max(0.8, estimatedRoadDist), matchedOrigin: oStop.n, matchedDest: dStop.n };
    }
  }

  return { distanceKm: 2.8, matchedOrigin: originName, matchedDest: destName };
}
