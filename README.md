# SimplyGo concession pass ROI calculator

Calculates whether buying a Singapore Adult Monthly Travel Pass ($122 per month) saves you money based on your real transit history.

Most daily 9-to-5 commuters taking two train rides a day spend around $85 to $95 a month. They lose money on the $122 pass. This tool parses your monthly SimplyGo statement, reconstructs every trip leg and transfer chain, and computes your exact distance fares under Land Transport Authority rules.

## What it does

- Parses SimplyGo PDF statements and pasted text records directly in your browser. No files leave your machine.
- Resolves bus stops and MRT stations offline using coordinates and route paths in `public/data/transit-data.json`.
- Applies the official distance fare matrix, transfer rules (up to five transfers within 120 minutes), and the morning pre-peak rail discount (50 cents off before 7:45 AM on weekdays).
- Shows your break-even status, net savings or loss, and an editable ledger of every ride.
- Exports your processed trip history to CSV.

## Getting started

Run with Bun:

```bash
bun install
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## How fare calculation works

1. **Distance resolution.** Train trips look up station-to-station rail distances. Bus trips match origin and destination stops along specific service routes to find the exact kilometers travelled.
2. **Transfer journey chaining.** Consecutive boardings within 45 minutes of alighting (up to 120 minutes total journey time) get grouped into a single journey. Distance fares apply to the cumulative kilometers, with distance capped at 40.2 km.
3. **Discounts and special rules.** Morning weekday rail taps before 7:45 AM receive up to a 50-cent discount. Express buses and flat-fare feeder services apply their specific fare tables.
4. **ROI math.** The tool compares your total computed distance fares against the $122 pass price to give your net profit or deficit.

## Built with

- Next.js 16 (App Router)
- React 19
- Tailwind CSS v4
- unpdf (local PDF text extraction)
- Lucide icons
