export type TransportMode = 'BUS' | 'TRAIN' | 'UNKNOWN';

export interface RawTrip {
  id: string;
  dateStr: string; // e.g. "31 Jul 2026"
  dayOfWeek?: string; // e.g. "Fri"
  timeStr: string; // e.g. "11:21 PM" or "07:22 PM"
  mode: TransportMode;
  serviceNo?: string; // e.g. "300" or undefined for Train
  origin: string; // e.g. "Choa Chu Kang Int B1 & B2" or "Choa Chu Kang"
  destination: string; // e.g. "Opp Concord Pr Sch" or "Jurong East"
  originalCharges?: string; // e.g. "Pass Usage" or "$ 0.00"
  timestamp?: number; // epoch ms
  billedFareCents?: number;
  hasBilledPrice?: boolean;
}

export interface CalculatedTrip extends RawTrip {
  distanceKm: number;
  individualFareCents: number; // Standalone fare without transfer
  chainedFareCents: number; // Actual fare paid after transfer rules
  isTransfer: boolean;
  transferJourneyId: string;
  isEarlyMorningDiscount: boolean;
  resolvedOrigin?: string;
  resolvedDestination?: string;
  isManualOverride?: boolean;
}

export interface JourneyChain {
  id: string;
  dateStr: string;
  trips: CalculatedTrip[];
  totalDistanceKm: number;
  totalFareCents: number;
  standaloneFareCents: number;
  transferSavingsCents: number;
  startTimeStr: string;
  endTimeStr: string;
}

export interface PassTypeConfig {
  id: string;
  name: string;
  description: string;
  priceDollars: number;
  modes: ('BUS' | 'TRAIN')[];
}

export interface StatementSummary {
  statementDate?: string;
  accountNumber?: string;
  cardName?: string;
  cardNumber?: string;
  billingPeriod?: string;
  totalTrips: number;
  totalBusTrips: number;
  totalTrainTrips: number;
  totalDistanceKm: number;
  totalNormalFareDollars: number;
  totalStandaloneFareDollars: number;
  totalTransferSavingsDollars: number;
  passCostDollars: number;
  netSavingsDollars: number;
  roiPercentage: number;
  isProfitable: boolean;
  earliestDate?: string;
  latestDate?: string;
}
