import { RawTrip, CalculatedTrip, JourneyChain, StatementSummary } from '@/types';
import { resolveBusDistance, resolveTrainDistance } from './distance-resolver';
import { calculateFares } from './fare-calculator';
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
export function parseStatementText(text: string): ParsedStatementResult {
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

  // If the statement had an explicit total printed (e.g. $ 90.98), verify or attach
  if (metadata.statementTotal !== undefined && summary.totalNormalFareDollars === 0) {
    summary.totalNormalFareDollars = metadata.statementTotal;
  }

  return {
    metadata,
    trips: calculatedTrips,
    journeys,
    summary,
    rawText: text,
  };
}

/**
 * Extracts text from PDF buffer and parses SimplyGo statement using unpdf
 */
export async function parseStatementPdf(pdfBuffer: ArrayBuffer): Promise<ParsedStatementResult> {
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

  const { metadata, rawTrips } = parseTokens(allTokens);
  const { calculatedTrips, journeys, summary } = calculateFares(rawTrips);

  summary.statementDate = metadata.statementDate;
  summary.accountNumber = metadata.accountNumber;
  summary.cardName = metadata.cardName;
  summary.cardNumber = metadata.cardNumber;
  summary.billingPeriod = metadata.billingPeriod;

  if (metadata.statementTotal !== undefined && summary.totalNormalFareDollars === 0) {
    summary.totalNormalFareDollars = metadata.statementTotal;
  }

  return {
    metadata,
    trips: calculatedTrips,
    journeys,
    summary,
    rawText: allTokens.join('\n'),
  };
}
