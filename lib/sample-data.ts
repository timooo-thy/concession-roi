export interface SamplePreset {
  id: string;
  name: string;
  tagline: string;
  description: string;
  badge: string;
  badgeVariant: 'success' | 'warning' | 'info' | 'purple';
  icon: string;
  rawText: string;
}

export const SAMPLE_DATASETS: SamplePreset[] = [
  {
    id: 'field-commuter',
    name: 'Field Sales / Power Commuter',
    tagline: '3-4 daily trips (East ⇄ CBD ⇄ West)',
    description: 'Frequent multi-trip traveler taking 69 trips across Pasir Ris, Tanjong Pagar, and Jurong East. Achieves solid breakeven.',
    badge: '+$33.71 Profit',
    badgeVariant: 'success',
    icon: 'zap',
    rawText: `PAGE 1 OF 3
STATEMENT GENERATED ON
 01 Aug 2026
S8812345D
 
MARCUS LIM (FIELD SALES)
8000 8888 7777 6666
July 2026 Transit Statement
 01 Jul 2026 - 31 Jul 2026
Date Journey Charges
01 Jul 2026
(Wed)
Pasir Ris - Tanjong Pagar
08:30 AM
  Train Pasir Ris - Tanjong Pagar
 Pass Usage
01 Jul 2026
(Wed)
Tanjong Pagar - Jurong East
01:15 PM
  Train Tanjong Pagar - Jurong East
 Pass Usage
01 Jul 2026
(Wed)
Jurong East - Pasir Ris
06:45 PM
  Train Jurong East - Pasir Ris
 Pass Usage
02 Jul 2026
(Thu)
Pasir Ris - Tanjong Pagar
08:30 AM
  Train Pasir Ris - Tanjong Pagar
 Pass Usage
02 Jul 2026
(Thu)
Tanjong Pagar - Jurong East
01:15 PM
  Train Tanjong Pagar - Jurong East
 Pass Usage
02 Jul 2026
(Thu)
Jurong East - Pasir Ris
06:45 PM
  Train Jurong East - Pasir Ris
 Pass Usage
03 Jul 2026
(Fri)
Pasir Ris - Tanjong Pagar
08:30 AM
  Train Pasir Ris - Tanjong Pagar
 Pass Usage
03 Jul 2026
(Fri)
Tanjong Pagar - Jurong East
01:15 PM
  Train Tanjong Pagar - Jurong East
 Pass Usage
03 Jul 2026
(Fri)
Jurong East - Pasir Ris
06:45 PM
  Train Jurong East - Pasir Ris
 Pass Usage
06 Jul 2026
(Mon)
Pasir Ris - Tanjong Pagar
08:30 AM
  Train Pasir Ris - Tanjong Pagar
 Pass Usage
06 Jul 2026
(Mon)
Tanjong Pagar - Jurong East
01:15 PM
  Train Tanjong Pagar - Jurong East
 Pass Usage
06 Jul 2026
(Mon)
Jurong East - Pasir Ris
06:45 PM
  Train Jurong East - Pasir Ris
 Pass Usage
07 Jul 2026
(Tue)
Pasir Ris - Tanjong Pagar
08:30 AM
  Train Pasir Ris - Tanjong Pagar
 Pass Usage
07 Jul 2026
(Tue)
Tanjong Pagar - Jurong East
01:15 PM
  Train Tanjong Pagar - Jurong East
 Pass Usage
07 Jul 2026
(Tue)
Jurong East - Pasir Ris
06:45 PM
  Train Jurong East - Pasir Ris
 Pass Usage
08 Jul 2026
(Wed)
Pasir Ris - Tanjong Pagar
08:30 AM
  Train Pasir Ris - Tanjong Pagar
 Pass Usage
08 Jul 2026
(Wed)
Tanjong Pagar - Jurong East
01:15 PM
  Train Tanjong Pagar - Jurong East
 Pass Usage
08 Jul 2026
(Wed)
Jurong East - Pasir Ris
06:45 PM
  Train Jurong East - Pasir Ris
 Pass Usage
09 Jul 2026
(Thu)
Pasir Ris - Tanjong Pagar
08:30 AM
  Train Pasir Ris - Tanjong Pagar
 Pass Usage
09 Jul 2026
(Thu)
Tanjong Pagar - Jurong East
01:15 PM
  Train Tanjong Pagar - Jurong East
 Pass Usage
09 Jul 2026
(Thu)
Jurong East - Pasir Ris
06:45 PM
  Train Jurong East - Pasir Ris
 Pass Usage
10 Jul 2026
(Fri)
Pasir Ris - Tanjong Pagar
08:30 AM
  Train Pasir Ris - Tanjong Pagar
 Pass Usage
10 Jul 2026
(Fri)
Tanjong Pagar - Jurong East
01:15 PM
  Train Tanjong Pagar - Jurong East
 Pass Usage
10 Jul 2026
(Fri)
Jurong East - Pasir Ris
06:45 PM
  Train Jurong East - Pasir Ris
 Pass Usage
13 Jul 2026
(Mon)
Pasir Ris - Tanjong Pagar
08:30 AM
  Train Pasir Ris - Tanjong Pagar
 Pass Usage
13 Jul 2026
(Mon)
Tanjong Pagar - Jurong East
01:15 PM
  Train Tanjong Pagar - Jurong East
 Pass Usage
13 Jul 2026
(Mon)
Jurong East - Pasir Ris
06:45 PM
  Train Jurong East - Pasir Ris
 Pass Usage
14 Jul 2026
(Tue)
Pasir Ris - Tanjong Pagar
08:30 AM
  Train Pasir Ris - Tanjong Pagar
 Pass Usage
14 Jul 2026
(Tue)
Tanjong Pagar - Jurong East
01:15 PM
  Train Tanjong Pagar - Jurong East
 Pass Usage
14 Jul 2026
(Tue)
Jurong East - Pasir Ris
06:45 PM
  Train Jurong East - Pasir Ris
 Pass Usage
15 Jul 2026
(Wed)
Pasir Ris - Tanjong Pagar
08:30 AM
  Train Pasir Ris - Tanjong Pagar
 Pass Usage
15 Jul 2026
(Wed)
Tanjong Pagar - Jurong East
01:15 PM
  Train Tanjong Pagar - Jurong East
 Pass Usage
15 Jul 2026
(Wed)
Jurong East - Pasir Ris
06:45 PM
  Train Jurong East - Pasir Ris
 Pass Usage
16 Jul 2026
(Thu)
Pasir Ris - Tanjong Pagar
08:30 AM
  Train Pasir Ris - Tanjong Pagar
 Pass Usage
16 Jul 2026
(Thu)
Tanjong Pagar - Jurong East
01:15 PM
  Train Tanjong Pagar - Jurong East
 Pass Usage
16 Jul 2026
(Thu)
Jurong East - Pasir Ris
06:45 PM
  Train Jurong East - Pasir Ris
 Pass Usage
17 Jul 2026
(Fri)
Pasir Ris - Tanjong Pagar
08:30 AM
  Train Pasir Ris - Tanjong Pagar
 Pass Usage
17 Jul 2026
(Fri)
Tanjong Pagar - Jurong East
01:15 PM
  Train Tanjong Pagar - Jurong East
 Pass Usage
17 Jul 2026
(Fri)
Jurong East - Pasir Ris
06:45 PM
  Train Jurong East - Pasir Ris
 Pass Usage
20 Jul 2026
(Mon)
Pasir Ris - Tanjong Pagar
08:30 AM
  Train Pasir Ris - Tanjong Pagar
 Pass Usage
20 Jul 2026
(Mon)
Tanjong Pagar - Jurong East
01:15 PM
  Train Tanjong Pagar - Jurong East
 Pass Usage
20 Jul 2026
(Mon)
Jurong East - Pasir Ris
06:45 PM
  Train Jurong East - Pasir Ris
 Pass Usage
21 Jul 2026
(Tue)
Pasir Ris - Tanjong Pagar
08:30 AM
  Train Pasir Ris - Tanjong Pagar
 Pass Usage
21 Jul 2026
(Tue)
Tanjong Pagar - Jurong East
01:15 PM
  Train Tanjong Pagar - Jurong East
 Pass Usage
21 Jul 2026
(Tue)
Jurong East - Pasir Ris
06:45 PM
  Train Jurong East - Pasir Ris
 Pass Usage
22 Jul 2026
(Wed)
Pasir Ris - Tanjong Pagar
08:30 AM
  Train Pasir Ris - Tanjong Pagar
 Pass Usage
22 Jul 2026
(Wed)
Tanjong Pagar - Jurong East
01:15 PM
  Train Tanjong Pagar - Jurong East
 Pass Usage
22 Jul 2026
(Wed)
Jurong East - Pasir Ris
06:45 PM
  Train Jurong East - Pasir Ris
 Pass Usage
23 Jul 2026
(Thu)
Pasir Ris - Tanjong Pagar
08:30 AM
  Train Pasir Ris - Tanjong Pagar
 Pass Usage
23 Jul 2026
(Thu)
Tanjong Pagar - Jurong East
01:15 PM
  Train Tanjong Pagar - Jurong East
 Pass Usage
23 Jul 2026
(Thu)
Jurong East - Pasir Ris
06:45 PM
  Train Jurong East - Pasir Ris
 Pass Usage
24 Jul 2026
(Fri)
Pasir Ris - Tanjong Pagar
08:30 AM
  Train Pasir Ris - Tanjong Pagar
 Pass Usage
24 Jul 2026
(Fri)
Tanjong Pagar - Jurong East
01:15 PM
  Train Tanjong Pagar - Jurong East
 Pass Usage
24 Jul 2026
(Fri)
Jurong East - Pasir Ris
06:45 PM
  Train Jurong East - Pasir Ris
 Pass Usage
27 Jul 2026
(Mon)
Pasir Ris - Tanjong Pagar
08:30 AM
  Train Pasir Ris - Tanjong Pagar
 Pass Usage
27 Jul 2026
(Mon)
Tanjong Pagar - Jurong East
01:15 PM
  Train Tanjong Pagar - Jurong East
 Pass Usage
27 Jul 2026
(Mon)
Jurong East - Pasir Ris
06:45 PM
  Train Jurong East - Pasir Ris
 Pass Usage
28 Jul 2026
(Tue)
Pasir Ris - Tanjong Pagar
08:30 AM
  Train Pasir Ris - Tanjong Pagar
 Pass Usage
28 Jul 2026
(Tue)
Tanjong Pagar - Jurong East
01:15 PM
  Train Tanjong Pagar - Jurong East
 Pass Usage
28 Jul 2026
(Tue)
Jurong East - Pasir Ris
06:45 PM
  Train Jurong East - Pasir Ris
 Pass Usage
29 Jul 2026
(Wed)
Pasir Ris - Tanjong Pagar
08:30 AM
  Train Pasir Ris - Tanjong Pagar
 Pass Usage
29 Jul 2026
(Wed)
Tanjong Pagar - Jurong East
01:15 PM
  Train Tanjong Pagar - Jurong East
 Pass Usage
29 Jul 2026
(Wed)
Jurong East - Pasir Ris
06:45 PM
  Train Jurong East - Pasir Ris
 Pass Usage
30 Jul 2026
(Thu)
Pasir Ris - Tanjong Pagar
08:30 AM
  Train Pasir Ris - Tanjong Pagar
 Pass Usage
30 Jul 2026
(Thu)
Tanjong Pagar - Jurong East
01:15 PM
  Train Tanjong Pagar - Jurong East
 Pass Usage
30 Jul 2026
(Thu)
Jurong East - Pasir Ris
06:45 PM
  Train Jurong East - Pasir Ris
 Pass Usage
31 Jul 2026
(Fri)
Pasir Ris - Tanjong Pagar
08:30 AM
  Train Pasir Ris - Tanjong Pagar
 Pass Usage
31 Jul 2026
(Fri)
Tanjong Pagar - Jurong East
01:15 PM
  Train Tanjong Pagar - Jurong East
 Pass Usage
31 Jul 2026
(Fri)
Jurong East - Pasir Ris
06:45 PM
  Train Jurong East - Pasir Ris
 Pass Usage
Total: $ 0.00`,
  },
  {
    id: 'islandwide-voyager',
    name: 'Islandwide Voyager',
    tagline: 'Cross-island travels across East, West, North & South',
    description: 'Heavy commuter taking 72 long-distance trips between Woodlands, Changi Airport, Jurong East, and HarbourFront.',
    badge: '+$48.55 Profit',
    badgeVariant: 'purple',
    icon: 'compass',
    rawText: `PAGE 1 OF 3
STATEMENT GENERATED ON
 01 Aug 2026
T0234567C
 
DANIEL KOH (ISLANDWIDE VOYAGER)
8000 9876 5432 1098
July 2026 Transit Statement
 01 Jul 2026 - 31 Jul 2026
Date Journey Charges
01 Jul 2026
(Wed)
Woodlands - Changi Airport
08:30 AM
  Train Woodlands - Changi Airport
 Pass Usage
01 Jul 2026
(Wed)
Changi Airport - Jurong East
02:00 PM
  Train Changi Airport - Jurong East
 Pass Usage
01 Jul 2026
(Wed)
Jurong East - Woodlands
07:30 PM
  Train Jurong East - Woodlands
 Pass Usage
02 Jul 2026
(Thu)
Woodlands - HarbourFront
08:45 AM
  Train Woodlands - HarbourFront
 Pass Usage
02 Jul 2026
(Thu)
HarbourFront - Punggol
01:30 PM
  Train HarbourFront - Punggol
 Pass Usage
02 Jul 2026
(Thu)
Punggol - Woodlands
07:00 PM
  Train Punggol - Woodlands
 Pass Usage
03 Jul 2026
(Fri)
Woodlands - Raffles Place
08:30 AM
  Train Woodlands - Raffles Place
 Pass Usage
03 Jul 2026
(Fri)
Raffles Place - Woodlands
06:30 PM
  Train Raffles Place - Woodlands
 Pass Usage
04 Jul 2026
(Sat)
Woodlands - Changi Airport
08:30 AM
  Train Woodlands - Changi Airport
 Pass Usage
04 Jul 2026
(Sat)
Changi Airport - Jurong East
02:00 PM
  Train Changi Airport - Jurong East
 Pass Usage
04 Jul 2026
(Sat)
Jurong East - Woodlands
07:30 PM
  Train Jurong East - Woodlands
 Pass Usage
06 Jul 2026
(Mon)
Woodlands - HarbourFront
08:45 AM
  Train Woodlands - HarbourFront
 Pass Usage
06 Jul 2026
(Mon)
HarbourFront - Punggol
01:30 PM
  Train HarbourFront - Punggol
 Pass Usage
06 Jul 2026
(Mon)
Punggol - Woodlands
07:00 PM
  Train Punggol - Woodlands
 Pass Usage
07 Jul 2026
(Tue)
Woodlands - Raffles Place
08:30 AM
  Train Woodlands - Raffles Place
 Pass Usage
07 Jul 2026
(Tue)
Raffles Place - Woodlands
06:30 PM
  Train Raffles Place - Woodlands
 Pass Usage
08 Jul 2026
(Wed)
Woodlands - Changi Airport
08:30 AM
  Train Woodlands - Changi Airport
 Pass Usage
08 Jul 2026
(Wed)
Changi Airport - Jurong East
02:00 PM
  Train Changi Airport - Jurong East
 Pass Usage
08 Jul 2026
(Wed)
Jurong East - Woodlands
07:30 PM
  Train Jurong East - Woodlands
 Pass Usage
09 Jul 2026
(Thu)
Woodlands - HarbourFront
08:45 AM
  Train Woodlands - HarbourFront
 Pass Usage
09 Jul 2026
(Thu)
HarbourFront - Punggol
01:30 PM
  Train HarbourFront - Punggol
 Pass Usage
09 Jul 2026
(Thu)
Punggol - Woodlands
07:00 PM
  Train Punggol - Woodlands
 Pass Usage
10 Jul 2026
(Fri)
Woodlands - Raffles Place
08:30 AM
  Train Woodlands - Raffles Place
 Pass Usage
10 Jul 2026
(Fri)
Raffles Place - Woodlands
06:30 PM
  Train Raffles Place - Woodlands
 Pass Usage
11 Jul 2026
(Sat)
Woodlands - Changi Airport
08:30 AM
  Train Woodlands - Changi Airport
 Pass Usage
11 Jul 2026
(Sat)
Changi Airport - Jurong East
02:00 PM
  Train Changi Airport - Jurong East
 Pass Usage
11 Jul 2026
(Sat)
Jurong East - Woodlands
07:30 PM
  Train Jurong East - Woodlands
 Pass Usage
13 Jul 2026
(Mon)
Woodlands - HarbourFront
08:45 AM
  Train Woodlands - HarbourFront
 Pass Usage
13 Jul 2026
(Mon)
HarbourFront - Punggol
01:30 PM
  Train HarbourFront - Punggol
 Pass Usage
13 Jul 2026
(Mon)
Punggol - Woodlands
07:00 PM
  Train Punggol - Woodlands
 Pass Usage
14 Jul 2026
(Tue)
Woodlands - Raffles Place
08:30 AM
  Train Woodlands - Raffles Place
 Pass Usage
14 Jul 2026
(Tue)
Raffles Place - Woodlands
06:30 PM
  Train Raffles Place - Woodlands
 Pass Usage
15 Jul 2026
(Wed)
Woodlands - Changi Airport
08:30 AM
  Train Woodlands - Changi Airport
 Pass Usage
15 Jul 2026
(Wed)
Changi Airport - Jurong East
02:00 PM
  Train Changi Airport - Jurong East
 Pass Usage
15 Jul 2026
(Wed)
Jurong East - Woodlands
07:30 PM
  Train Jurong East - Woodlands
 Pass Usage
16 Jul 2026
(Thu)
Woodlands - HarbourFront
08:45 AM
  Train Woodlands - HarbourFront
 Pass Usage
16 Jul 2026
(Thu)
HarbourFront - Punggol
01:30 PM
  Train HarbourFront - Punggol
 Pass Usage
16 Jul 2026
(Thu)
Punggol - Woodlands
07:00 PM
  Train Punggol - Woodlands
 Pass Usage
17 Jul 2026
(Fri)
Woodlands - Raffles Place
08:30 AM
  Train Woodlands - Raffles Place
 Pass Usage
17 Jul 2026
(Fri)
Raffles Place - Woodlands
06:30 PM
  Train Raffles Place - Woodlands
 Pass Usage
18 Jul 2026
(Sat)
Woodlands - Changi Airport
08:30 AM
  Train Woodlands - Changi Airport
 Pass Usage
18 Jul 2026
(Sat)
Changi Airport - Jurong East
02:00 PM
  Train Changi Airport - Jurong East
 Pass Usage
18 Jul 2026
(Sat)
Jurong East - Woodlands
07:30 PM
  Train Jurong East - Woodlands
 Pass Usage
20 Jul 2026
(Mon)
Woodlands - HarbourFront
08:45 AM
  Train Woodlands - HarbourFront
 Pass Usage
20 Jul 2026
(Mon)
HarbourFront - Punggol
01:30 PM
  Train HarbourFront - Punggol
 Pass Usage
20 Jul 2026
(Mon)
Punggol - Woodlands
07:00 PM
  Train Punggol - Woodlands
 Pass Usage
21 Jul 2026
(Tue)
Woodlands - Raffles Place
08:30 AM
  Train Woodlands - Raffles Place
 Pass Usage
21 Jul 2026
(Tue)
Raffles Place - Woodlands
06:30 PM
  Train Raffles Place - Woodlands
 Pass Usage
22 Jul 2026
(Wed)
Woodlands - Changi Airport
08:30 AM
  Train Woodlands - Changi Airport
 Pass Usage
22 Jul 2026
(Wed)
Changi Airport - Jurong East
02:00 PM
  Train Changi Airport - Jurong East
 Pass Usage
22 Jul 2026
(Wed)
Jurong East - Woodlands
07:30 PM
  Train Jurong East - Woodlands
 Pass Usage
23 Jul 2026
(Thu)
Woodlands - HarbourFront
08:45 AM
  Train Woodlands - HarbourFront
 Pass Usage
23 Jul 2026
(Thu)
HarbourFront - Punggol
01:30 PM
  Train HarbourFront - Punggol
 Pass Usage
23 Jul 2026
(Thu)
Punggol - Woodlands
07:00 PM
  Train Punggol - Woodlands
 Pass Usage
24 Jul 2026
(Fri)
Woodlands - Raffles Place
08:30 AM
  Train Woodlands - Raffles Place
 Pass Usage
24 Jul 2026
(Fri)
Raffles Place - Woodlands
06:30 PM
  Train Raffles Place - Woodlands
 Pass Usage
25 Jul 2026
(Sat)
Woodlands - Changi Airport
08:30 AM
  Train Woodlands - Changi Airport
 Pass Usage
25 Jul 2026
(Sat)
Changi Airport - Jurong East
02:00 PM
  Train Changi Airport - Jurong East
 Pass Usage
25 Jul 2026
(Sat)
Jurong East - Woodlands
07:30 PM
  Train Jurong East - Woodlands
 Pass Usage
27 Jul 2026
(Mon)
Woodlands - HarbourFront
08:45 AM
  Train Woodlands - HarbourFront
 Pass Usage
27 Jul 2026
(Mon)
HarbourFront - Punggol
01:30 PM
  Train HarbourFront - Punggol
 Pass Usage
27 Jul 2026
(Mon)
Punggol - Woodlands
07:00 PM
  Train Punggol - Woodlands
 Pass Usage
28 Jul 2026
(Tue)
Woodlands - Raffles Place
08:30 AM
  Train Woodlands - Raffles Place
 Pass Usage
28 Jul 2026
(Tue)
Raffles Place - Woodlands
06:30 PM
  Train Raffles Place - Woodlands
 Pass Usage
29 Jul 2026
(Wed)
Woodlands - Changi Airport
08:30 AM
  Train Woodlands - Changi Airport
 Pass Usage
29 Jul 2026
(Wed)
Changi Airport - Jurong East
02:00 PM
  Train Changi Airport - Jurong East
 Pass Usage
29 Jul 2026
(Wed)
Jurong East - Woodlands
07:30 PM
  Train Jurong East - Woodlands
 Pass Usage
30 Jul 2026
(Thu)
Woodlands - HarbourFront
08:45 AM
  Train Woodlands - HarbourFront
 Pass Usage
30 Jul 2026
(Thu)
HarbourFront - Punggol
01:30 PM
  Train HarbourFront - Punggol
 Pass Usage
30 Jul 2026
(Thu)
Punggol - Woodlands
07:00 PM
  Train Punggol - Woodlands
 Pass Usage
31 Jul 2026
(Fri)
Woodlands - Raffles Place
08:30 AM
  Train Woodlands - Raffles Place
 Pass Usage
31 Jul 2026
(Fri)
Raffles Place - Woodlands
06:30 PM
  Train Raffles Place - Woodlands
 Pass Usage
Total: $ 0.00`,
  },
  {
    id: 'cbd-commuter',
    name: 'Daily CBD Worker (9-to-5)',
    tagline: 'Standard 2 trips/day (Tampines ⇄ Raffles Place)',
    description: 'Demonstrates why a standard 2-trips-a-day commuter with morning off-peak discount spends $85.56 and DOES NOT break even on the $122 pass.',
    badge: 'Deficit Case (-$36.44)',
    badgeVariant: 'warning',
    icon: 'train',
    rawText: `PAGE 1 OF 2
STATEMENT GENERATED ON
 01 Aug 2026
S9123456A
 
ALEX TAN (CBD COMMUTER)
8000 1234 5678 9912
July 2026 Transit Statement
 01 Jul 2026 - 31 Jul 2026
Date Journey Charges
01 Jul 2026
(Wed)
Tampines - Raffles Place
07:20 AM
  Train Tampines - Raffles Place
 Pass Usage
01 Jul 2026
(Wed)
Raffles Place - Tampines
06:30 PM
  Train Raffles Place - Tampines
 Pass Usage
02 Jul 2026
(Thu)
Tampines - Raffles Place
07:20 AM
  Train Tampines - Raffles Place
 Pass Usage
02 Jul 2026
(Thu)
Raffles Place - Tampines
06:30 PM
  Train Raffles Place - Tampines
 Pass Usage
03 Jul 2026
(Fri)
Tampines - Raffles Place
07:20 AM
  Train Tampines - Raffles Place
 Pass Usage
03 Jul 2026
(Fri)
Raffles Place - Tampines
06:30 PM
  Train Raffles Place - Tampines
 Pass Usage
06 Jul 2026
(Mon)
Tampines - Raffles Place
07:20 AM
  Train Tampines - Raffles Place
 Pass Usage
06 Jul 2026
(Mon)
Raffles Place - Tampines
06:30 PM
  Train Raffles Place - Tampines
 Pass Usage
07 Jul 2026
(Tue)
Tampines - Raffles Place
07:20 AM
  Train Tampines - Raffles Place
 Pass Usage
07 Jul 2026
(Tue)
Raffles Place - Tampines
06:30 PM
  Train Raffles Place - Tampines
 Pass Usage
08 Jul 2026
(Wed)
Tampines - Raffles Place
07:20 AM
  Train Tampines - Raffles Place
 Pass Usage
08 Jul 2026
(Wed)
Raffles Place - Tampines
06:30 PM
  Train Raffles Place - Tampines
 Pass Usage
09 Jul 2026
(Thu)
Tampines - Raffles Place
07:20 AM
  Train Tampines - Raffles Place
 Pass Usage
09 Jul 2026
(Thu)
Raffles Place - Tampines
06:30 PM
  Train Raffles Place - Tampines
 Pass Usage
10 Jul 2026
(Fri)
Tampines - Raffles Place
07:20 AM
  Train Tampines - Raffles Place
 Pass Usage
10 Jul 2026
(Fri)
Raffles Place - Tampines
06:30 PM
  Train Raffles Place - Tampines
 Pass Usage
13 Jul 2026
(Mon)
Tampines - Raffles Place
07:20 AM
  Train Tampines - Raffles Place
 Pass Usage
13 Jul 2026
(Mon)
Raffles Place - Tampines
06:30 PM
  Train Raffles Place - Tampines
 Pass Usage
14 Jul 2026
(Tue)
Tampines - Raffles Place
07:20 AM
  Train Tampines - Raffles Place
 Pass Usage
14 Jul 2026
(Tue)
Raffles Place - Tampines
06:30 PM
  Train Raffles Place - Tampines
 Pass Usage
15 Jul 2026
(Wed)
Tampines - Raffles Place
07:20 AM
  Train Tampines - Raffles Place
 Pass Usage
15 Jul 2026
(Wed)
Raffles Place - Tampines
06:30 PM
  Train Raffles Place - Tampines
 Pass Usage
16 Jul 2026
(Thu)
Tampines - Raffles Place
07:20 AM
  Train Tampines - Raffles Place
 Pass Usage
16 Jul 2026
(Thu)
Raffles Place - Tampines
06:30 PM
  Train Raffles Place - Tampines
 Pass Usage
17 Jul 2026
(Fri)
Tampines - Raffles Place
07:20 AM
  Train Tampines - Raffles Place
 Pass Usage
17 Jul 2026
(Fri)
Raffles Place - Tampines
06:30 PM
  Train Raffles Place - Tampines
 Pass Usage
20 Jul 2026
(Mon)
Tampines - Raffles Place
07:20 AM
  Train Tampines - Raffles Place
 Pass Usage
20 Jul 2026
(Mon)
Raffles Place - Tampines
06:30 PM
  Train Raffles Place - Tampines
 Pass Usage
21 Jul 2026
(Tue)
Tampines - Raffles Place
07:20 AM
  Train Tampines - Raffles Place
 Pass Usage
21 Jul 2026
(Tue)
Raffles Place - Tampines
06:30 PM
  Train Raffles Place - Tampines
 Pass Usage
22 Jul 2026
(Wed)
Tampines - Raffles Place
07:20 AM
  Train Tampines - Raffles Place
 Pass Usage
22 Jul 2026
(Wed)
Raffles Place - Tampines
06:30 PM
  Train Raffles Place - Tampines
 Pass Usage
23 Jul 2026
(Thu)
Tampines - Raffles Place
07:20 AM
  Train Tampines - Raffles Place
 Pass Usage
23 Jul 2026
(Thu)
Raffles Place - Tampines
06:30 PM
  Train Raffles Place - Tampines
 Pass Usage
24 Jul 2026
(Fri)
Tampines - Raffles Place
07:20 AM
  Train Tampines - Raffles Place
 Pass Usage
24 Jul 2026
(Fri)
Raffles Place - Tampines
06:30 PM
  Train Raffles Place - Tampines
 Pass Usage
27 Jul 2026
(Mon)
Tampines - Raffles Place
07:20 AM
  Train Tampines - Raffles Place
 Pass Usage
27 Jul 2026
(Mon)
Raffles Place - Tampines
06:30 PM
  Train Raffles Place - Tampines
 Pass Usage
28 Jul 2026
(Tue)
Tampines - Raffles Place
07:20 AM
  Train Tampines - Raffles Place
 Pass Usage
28 Jul 2026
(Tue)
Raffles Place - Tampines
06:30 PM
  Train Raffles Place - Tampines
 Pass Usage
29 Jul 2026
(Wed)
Tampines - Raffles Place
07:20 AM
  Train Tampines - Raffles Place
 Pass Usage
29 Jul 2026
(Wed)
Raffles Place - Tampines
06:30 PM
  Train Raffles Place - Tampines
 Pass Usage
30 Jul 2026
(Thu)
Tampines - Raffles Place
07:20 AM
  Train Tampines - Raffles Place
 Pass Usage
30 Jul 2026
(Thu)
Raffles Place - Tampines
06:30 PM
  Train Raffles Place - Tampines
 Pass Usage
31 Jul 2026
(Fri)
Tampines - Raffles Place
07:20 AM
  Train Tampines - Raffles Place
 Pass Usage
31 Jul 2026
(Fri)
Raffles Place - Tampines
06:30 PM
  Train Raffles Place - Tampines
 Pass Usage
Total: $ 0.00`,
  },
  {
    id: 'casual-commuter',
    name: 'Casual / Hybrid Worker',
    tagline: '2-3 days office + weekend social trips',
    description: 'Hybrid worker taking 16 trips a month ($32.40). Demonstrates a heavy deficit case where pay-per-ride is vastly superior.',
    badge: 'Deficit Case (-$89.60)',
    badgeVariant: 'warning',
    icon: 'coffee',
    rawText: `PAGE 1 OF 1
STATEMENT GENERATED ON
 02 Aug 2026
S9567890B
 
CHLOE LIM (HYBRID WORKER)
8000 4567 8901 2345
July 2026 Transit Statement
 01 Jul 2026 - 31 Jul 2026
Date Journey Charges
03 Jul 2026
(Fri)
Bishan - City Hall
09:15 AM
  Train Bishan - City Hall
 Pass Usage
03 Jul 2026
(Fri)
City Hall - Bishan
06:30 PM
  Train City Hall - Bishan
 Pass Usage
07 Jul 2026
(Tue)
Bishan - Tanjong Pagar
09:20 AM
  Train Bishan - Tanjong Pagar
 Pass Usage
07 Jul 2026
(Tue)
Tanjong Pagar - Bishan
07:00 PM
  Train Tanjong Pagar - Bishan
 Pass Usage
10 Jul 2026
(Fri)
Bishan - Somerset
02:15 PM
  Train Bishan - Somerset
 Pass Usage
10 Jul 2026
(Fri)
Somerset - Bishan
08:45 PM
  Train Somerset - Bishan
 Pass Usage
14 Jul 2026
(Tue)
Bishan - Marina Bay
09:30 AM
  Train Bishan - Marina Bay
 Pass Usage
14 Jul 2026
(Tue)
Marina Bay - Bishan
06:15 PM
  Train Marina Bay - Bishan
 Pass Usage
18 Jul 2026
(Sat)
Bishan - Bugis
01:30 PM
  Train Bishan - Bugis
 Pass Usage
18 Jul 2026
(Sat)
Bugis - Bishan
07:00 PM
  Train Bugis - Bishan
 Pass Usage
21 Jul 2026
(Tue)
Bishan - City Hall
09:10 AM
  Train Bishan - City Hall
 Pass Usage
21 Jul 2026
(Tue)
City Hall - Bishan
06:40 PM
  Train City Hall - Bishan
 Pass Usage
24 Jul 2026
(Fri)
Bishan - Promenade
03:00 PM
  Train Bishan - Promenade
 Pass Usage
24 Jul 2026
(Fri)
Promenade - Bishan
09:30 PM
  Train Promenade - Bishan
 Pass Usage
28 Jul 2026
(Tue)
Bishan - City Hall
09:15 AM
  Train Bishan - City Hall
 Pass Usage
28 Jul 2026
(Tue)
City Hall - Bishan
06:20 PM
  Train City Hall - Bishan
 Pass Usage
Total: $ 0.00`,
  },
];
