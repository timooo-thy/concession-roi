import { RawTrip, CalculatedTrip, JourneyChain, StatementSummary, LoadedStatementInfo } from '@/types';
import { resolveBusDistance, resolveTrainDistance } from './distance-resolver';
import { calculateFares, parseTripTimestamp } from './fare-calculator';
import { getDocumentProxy } from 'unpdf';

export interface ParsedStatementResult {
  metadata: {
    statementDate?: string;
    accountNumber?: string;
    cardName?: string;
    cardNumber?: string;
    billingPeriod?: string;
    statementTotal?: number;
  };
  trips: CalculatedTrip[];
  journeys: JourneyChain[];
  summary: StatementSummary;
  rawText: string;
  loadedStatements?: LoadedStatementInfo[];
}

/**
 * Parses a sequence of text tokens or lines extracted from a SimplyGo Transit Statement
 */
export function parseTokens(tokens: string[]): {
  metadata: ParsedStatementResult['metadata'];
  rawTrips: (RawTrip & {
    distanceKm: number;
    resolvedOrigin?: string;
    resolvedDestination?: string;
    billedFareCents?: number;
    hasBilledPrice?: boolean;
  })[];
} {
  const metadata: ParsedStatementResult['metadata'] = {};
  const fullJoined = tokens.join('\n');

  // Metadata extraction
  const genMatch = fullJoined.match(/STATEMENT\s+GENERATED\s+ON\s*[\r\n\s]+([0-9]{1,2}\s+[A-Za-z]{3}\s+[0-9]{4})/i);
  if (genMatch) metadata.statementDate = genMatch[1].trim();

  const nricMatch = fullJoined.match(/([STFGMS]\d{7}[A-Z])/i);
  if (nricMatch) metadata.accountNumber = nricMatch[1].trim();

  const canMatch = fullJoined.match(/(\b8\d{3}\s*\d{4}\s*\d{4}\s*\d{4}\b|\b4\d{3}\s*\d{2}\*{2}\s*\*{4}\s*\d{4}\b)/);
  if (canMatch) metadata.cardNumber = canMatch[1].trim();

  const periodMatch = fullJoined.match(/([0-9]{1,2}\s+[A-Za-z]{3}\s+[0-9]{4}\s*-\s*[0-9]{1,2}\s+[A-Za-z]{3}\s+[0-9]{4})/i);
  if (periodMatch) metadata.billingPeriod = periodMatch[1].trim();

  const nameMatch = fullJoined.match(/[STFGMS]\d{7}[A-Z]\s*[\r\n\s]+([A-Z0-9\s]{3,30})[\r\n\s]+[48]\d{3}/i);
  if (nameMatch) metadata.cardName = nameMatch[1].trim();

  const totalMatch = fullJoined.match(/Total:\s*\$\s*([\d\.]+)/i);
  if (totalMatch) metadata.statementTotal = parseFloat(totalMatch[1]);

  const rawTrips: (RawTrip & {
    distanceKm: number;
    resolvedOrigin?: string;
    resolvedDestination?: string;
    billedFareCents?: number;
    hasBilledPrice?: boolean;
  })[] = [];

  let currentDate = '';
  let currentDay = '';
  let tripIdCounter = 0;

  const dateRegex = /^(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4})$/i;
  const timeRegex = /^(\d{1,2}:\d{2}\s*(?:AM|PM))$/i;

  let i = 0;
  while (i < tokens.length) {
    const tok = tokens[i];

    // Date header
    if (dateRegex.test(tok)) {
      currentDate = tok;
      if (i + 1 < tokens.length && /^\([A-Za-z]{3,}\)$/.test(tokens[i + 1])) {
        currentDay = tokens[i + 1].replace(/[()]/g, '');
        i++;
      }
      i++;
      continue;
    }

    // Time token
    if (timeRegex.test(tok)) {
      const timeStr = tok;
      let mode: 'BUS' | 'TRAIN' | 'UNKNOWN' = 'UNKNOWN';
      let serviceNo: string | undefined = undefined;
      let origin = '';
      let dest = '';
      let billedFareCents: number | undefined = undefined;
      let hasBilledPrice = false;

      let ptr = i + 1;
      if (ptr < tokens.length) {
        const nextTok = tokens[ptr];

        if (/^Train$/i.test(nextTok)) {
          mode = 'TRAIN';
          ptr++;
        } else if (/^Bus\s+([A-Za-z0-9]+)$/i.test(nextTok)) {
          mode = 'BUS';
          serviceNo = nextTok.match(/^Bus\s+([A-Za-z0-9]+)$/i)![1];
          ptr++;
        } else if (/^Train\s+(.+?)\s*-\s*(.+)$/i.test(nextTok)) {
          mode = 'TRAIN';
          const m = nextTok.match(/^Train\s+(.+?)\s*-\s*(.+)$/i)!;
          origin = m[1].trim();
          dest = m[2].trim();
          ptr++;
        } else if (/^Bus\s+([A-Za-z0-9]+)\s+(.+?)\s*-\s*(.+)$/i.test(nextTok)) {
          mode = 'BUS';
          const m = nextTok.match(/^Bus\s+([A-Za-z0-9]+)\s+(.+?)\s*-\s*(.+)$/i)!;
          serviceNo = m[1];
          origin = m[2].trim();
          dest = m[3].trim();
          ptr++;
        }
      }

      // Check for route string (Origin - Destination) if not already extracted
      if (!origin && !dest && ptr < tokens.length && tokens[ptr].includes(' - ')) {
        const parts = tokens[ptr].split(' - ');
        origin = parts[0].trim();
        dest = parts.slice(1).join(' - ').trim();
        ptr++;
      }

      // Check for Price or Pass Usage token
      if (ptr < tokens.length) {
        const pTok = tokens[ptr];
        if (pTok.startsWith('$')) {
          const num = parseFloat(pTok.replace('$', '').trim());
          if (!isNaN(num)) {
            billedFareCents = Math.round(num * 100);
            hasBilledPrice = true;
            ptr++;
          }
        } else if (/^Pass\s*Usage$/i.test(pTok)) {
          hasBilledPrice = false;
          ptr++;
        }
      }

      if (origin && dest && mode !== 'UNKNOWN') {
        const res = mode === 'BUS'
          ? resolveBusDistance(serviceNo, origin, dest)
          : resolveTrainDistance(origin, dest);

        rawTrips.push({
          id: `trip-${++tripIdCounter}`,
          dateStr: currentDate,
          dayOfWeek: currentDay,
          timeStr,
          mode,
          serviceNo,
          origin,
          destination: dest,
          distanceKm: res.distanceKm,
          resolvedOrigin: res.matchedOrigin,
          resolvedDestination: res.matchedDest,
          billedFareCents,
          hasBilledPrice,
        });
        i = ptr;
        continue;
      }
    }

    i++;
  }

  return { metadata, rawTrips };
}

/**
 * Parses raw text from a SimplyGo Transit Statement
 */
export function parseStatementText(text: string, fileName?: string): ParsedStatementResult {
  const lines = text
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(l => l.length > 0);

  const { metadata, rawTrips } = parseTokens(lines);
  const { calculatedTrips, journeys, summary } = calculateFares(rawTrips);

  summary.statementDate = metadata.statementDate;
  summary.accountNumber = metadata.accountNumber;
  summary.cardName = metadata.cardName;
  summary.cardNumber = metadata.cardNumber;
  summary.billingPeriod = metadata.billingPeriod;
  summary.statementTotal = metadata.statementTotal;

  const loadedStatement: LoadedStatementInfo = {
    id: `stmt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    fileName: fileName || (metadata.billingPeriod ? `Statement (${metadata.billingPeriod})` : 'Pasted Statement'),
    statementDate: metadata.statementDate,
    billingPeriod: metadata.billingPeriod,
    tripsCount: calculatedTrips.length,
    rawText: text,
  };

  summary.loadedStatements = [loadedStatement];

  return {
    metadata,
    trips: calculatedTrips,
    journeys,
    summary,
    rawText: text,
    loadedStatements: [loadedStatement],
  };
}

/**
 * Extracts text from PDF buffer and parses SimplyGo statement using unpdf
 */
export async function parseStatementPdf(pdfBuffer: ArrayBuffer, fileName: string = "Statement.pdf"): Promise<ParsedStatementResult> {
  const pdf = await getDocumentProxy(new Uint8Array(pdfBuffer));
  const allTokens: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    for (const item of (content.items as { str?: string }[])) {
      const s = item.str?.trim();
      if (s) allTokens.push(s);
    }
  }

  const rawText = allTokens.join('\n');
  const { metadata, rawTrips } = parseTokens(allTokens);
  const { calculatedTrips, journeys, summary } = calculateFares(rawTrips);

  summary.statementDate = metadata.statementDate;
  summary.accountNumber = metadata.accountNumber;
  summary.cardName = metadata.cardName;
  summary.cardNumber = metadata.cardNumber;
  summary.billingPeriod = metadata.billingPeriod;
  summary.statementTotal = metadata.statementTotal;

  const loadedStatement: LoadedStatementInfo = {
    id: `stmt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    fileName: fileName,
    statementDate: metadata.statementDate,
    billingPeriod: metadata.billingPeriod,
    tripsCount: calculatedTrips.length,
    rawText,
  };

  summary.loadedStatements = [loadedStatement];

  return {
    metadata,
    trips: calculatedTrips,
    journeys,
    summary,
    rawText,
    loadedStatements: [loadedStatement],
  };
}

/**
 * Merges multiple parsed statement results into a unified statement result.
 * Deduplicates identical trips, recalculates distance fares across all trips chronologically,
 * and unions statement metadata.
 */
export function mergeParsedStatementResults(
  statementList: { info: LoadedStatementInfo; result: ParsedStatementResult }[]
): ParsedStatementResult {
  if (statementList.length === 0) {
    throw new Error("No statement datasets to merge");
  }

  if (statementList.length === 1) {
    const single = statementList[0];
    return {
      ...single.result,
      loadedStatements: [single.info],
      summary: {
        ...single.result.summary,
        loadedStatements: [single.info],
      },
    };
  }

  // Combine raw text
  const combinedRawText = statementList.map(s => s.result.rawText).join('\n--- NEXT STATEMENT ---\n');

  // Collect all trips and deduplicate
  const seenTripKeys = new Set<string>();
  const uniqueRawTrips: (RawTrip & {
    distanceKm: number;
    resolvedOrigin?: string;
    resolvedDestination?: string;
    billedFareCents?: number;
    hasBilledPrice?: boolean;
  })[] = [];

  for (const s of statementList) {
    for (const trip of s.result.trips) {
      const key = `${trip.dateStr}|${trip.timeStr}|${trip.mode}|${trip.serviceNo || ''}|${trip.origin}|${trip.destination}`;
      if (!seenTripKeys.has(key)) {
        seenTripKeys.add(key);
        uniqueRawTrips.push({
          id: `trip-${uniqueRawTrips.length + 1}`,
          dateStr: trip.dateStr,
          dayOfWeek: trip.dayOfWeek,
          timeStr: trip.timeStr,
          mode: trip.mode,
          serviceNo: trip.serviceNo,
          origin: trip.origin,
          destination: trip.destination,
          distanceKm: trip.distanceKm,
          resolvedOrigin: trip.resolvedOrigin,
          resolvedDestination: trip.resolvedDestination,
          billedFareCents: trip.billedFareCents,
          hasBilledPrice: trip.hasBilledPrice,
          timestamp: trip.timestamp || parseTripTimestamp(trip.dateStr, trip.timeStr),
        });
      }
    }
  }

  // Recalculate fares and journeys across the entire combined dataset
  const { calculatedTrips, journeys, summary } = calculateFares(uniqueRawTrips);

  // Combine metadata
  const cardName = statementList.map(s => s.result.metadata.cardName).find(Boolean);
  const cardNumber = statementList.map(s => s.result.metadata.cardNumber).find(Boolean);
  const accountNumber = statementList.map(s => s.result.metadata.accountNumber).find(Boolean);
  const statementDates = statementList.map(s => s.result.metadata.statementDate).filter(Boolean);
  const latestStatementDate = statementDates[statementDates.length - 1];

  const statementTotals = statementList
    .map(s => s.result.metadata.statementTotal)
    .filter((t): t is number => t !== undefined);
  const combinedStatementTotal = statementTotals.length > 0
    ? Number(statementTotals.reduce((a, b) => a + b, 0).toFixed(2))
    : undefined;

  const billingPeriods = Array.from(
    new Set(
      statementList
        .map((s) => s.result.metadata.billingPeriod?.trim())
        .filter((p): p is string => Boolean(p))
    )
  );
  
  const combinedBillingPeriod = billingPeriods.length > 0
    ? billingPeriods.join(" & ")
    : (summary.earliestDate && summary.latestDate ? `${summary.earliestDate} - ${summary.latestDate}` : undefined);

  const loadedStatements = statementList.map(s => ({
    ...s.info,
    tripsCount: s.result.trips.length,
  }));

  const mergedMetadata: ParsedStatementResult['metadata'] = {
    cardName,
    cardNumber,
    accountNumber,
    statementDate: latestStatementDate,
    billingPeriod: combinedBillingPeriod,
    statementTotal: combinedStatementTotal,
  };

  summary.statementDate = latestStatementDate;
  summary.accountNumber = accountNumber;
  summary.cardName = cardName;
  summary.cardNumber = cardNumber;
  summary.billingPeriod = combinedBillingPeriod;
  summary.statementTotal = combinedStatementTotal;
  summary.loadedStatements = loadedStatements;

  return {
    metadata: mergedMetadata,
    trips: calculatedTrips,
    journeys,
    summary,
    rawText: combinedRawText,
    loadedStatements,
  };
}

/**
 * Parses multiple PDF statement files in parallel and merges them.
 */
export async function parseMultipleStatementPdfs(
  files: { name: string; buffer: ArrayBuffer }[]
): Promise<ParsedStatementResult> {
  const parsedList = await Promise.all(
    files.map(async (file) => {
      const result = await parseStatementPdf(file.buffer, file.name);
      const info: LoadedStatementInfo = result.loadedStatements?.[0] || {
        id: `stmt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        fileName: file.name,
        billingPeriod: result.metadata.billingPeriod,
        statementDate: result.metadata.statementDate,
        tripsCount: result.trips.length,
        rawText: result.rawText,
      };
      return { info, result };
    })
  );

  return mergeParsedStatementResults(parsedList);
}
