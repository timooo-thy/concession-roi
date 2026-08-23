import requests
import json
import time
import os
import math

KEY = os.environ.get('LTA_API_KEY', 'At79jQ5DTCqVQcQsZ7uiWw==')
HEADERS = {'AccountKey': KEY, 'accept': 'application/json'}

def fetch_all(endpoint):
    results = []
    skip = 0
    while True:
        url = f'https://datamall2.mytransport.sg/ltaodataservice/{endpoint}?$skip={skip}'
        try:
            r = requests.get(url, headers=HEADERS, timeout=30)
            if r.status_code != 200:
                print(f"Error fetching {endpoint} at skip {skip}: {r.status_code}", flush=True)
                break
            data = r.json().get('value', [])
            if not data:
                break
            results.extend(data)
            print(f"{endpoint}: fetched {len(results)} items...", flush=True)
            if len(data) < 500:
                break
            skip += 500
            time.sleep(0.05)
        except Exception as e:
            print(f"Exception fetching {endpoint} at skip {skip}: {e}", flush=True)
            break
    return results

def normalize_name(name):
    if not name:
        return ""
    name = name.upper()
    # Normalize common abbreviations and characters
    replacements = [
        ("INT B1 & B2", "INT"),
        ("INT B1", "INT"),
        ("INT B2", "INT"),
        ("TEMPORARY", "TEMP"),
        ("STATION", "STN"),
        ("OPP ", "OPP "),
        ("AFT ", "AFT "),
        ("BEF ", "BEF "),
        ("SCH", "SCH"),
        ("PR SCH", "PRI SCH"),
        ("SEC SCH", "SEC SCH"),
        ("BLK ", "BLK "),
    ]
    for old, new in replacements:
        name = name.replace(old, new)
    # Remove punctuation
    cleaned = "".join(c if c.isalnum() or c.isspace() else " " for c in name)
    return " ".join(cleaned.split())

# MRT / LRT Network Stations and Inter-station Distances (km)
# Comprehensive mapping for all lines: NSL, EWL, NEL, CCL, DTL, TEL, BPLRT, SKLRT, PGLRT
MRT_LINES = {
    "NS": [
        ("Jurong East", "NS1"),
        ("Bukit Batok", "NS2", 2.1),
        ("Bukit Gombak", "NS3", 1.2),
        ("Choa Chu Kang", "NS4", 3.2),
        ("Yew Tee", "NS5", 1.4),
        ("Kranji", "NS7", 4.3),
        ("Marsiling", "NS8", 1.7),
        ("Woodlands", "NS9", 1.5),
        ("Admiralty", "NS10", 1.7),
        ("Sembawang", "NS11", 2.4),
        ("Canberra", "NS12", 1.4),
        ("Yishun", "NS13", 1.6),
        ("Khatib", "NS14", 1.4),
        ("Yio Chu Kang", "NS15", 5.0),
        ("Ang Mo Kio", "NS16", 1.4),
        ("Bishan", "NS17", 2.3),
        ("Braddell", "NS18", 1.1),
        ("Toa Payoh", "NS19", 1.0),
        ("Novena", "NS20", 1.5),
        ("Newton", "NS21", 1.2),
        ("Orchard", "NS22", 1.2),
        ("Somerset", "NS23", 1.0),
        ("Dhoby Ghaut", "NS24", 0.9),
        ("City Hall", "NS25", 1.1),
        ("Raffles Place", "NS26", 1.0),
        ("Marina Bay", "NS27", 1.1),
        ("Marina South Pier", "NS28", 1.0),
    ],
    "EW": [
        ("Pasir Ris", "EW1"),
        ("Tampines", "EW2", 2.4),
        ("Simei", "EW3", 1.3),
        ("Tanah Merah", "EW4", 2.1),
        ("Bedok", "EW5", 2.0),
        ("Kembangan", "EW6", 1.9),
        ("Eunos", "EW7", 1.1),
        ("Paya Lebar", "EW8", 1.2),
        ("Aljunied", "EW9", 1.4),
        ("Kallang", "EW10", 1.4),
        ("Lavender", "EW11", 1.1),
        ("Bugis", "EW12", 1.0),
        ("City Hall", "EW13", 1.0),
        ("Raffles Place", "EW14", 1.0),
        ("Tanjong Pagar", "EW15", 1.3),
        ("Outram Park", "EW16", 1.1),
        ("Tiong Bahru", "EW17", 1.2),
        ("Redhill", "EW18", 1.1),
        ("Queenstown", "EW19", 1.3),
        ("Commonwealth", "EW20", 1.1),
        ("Buona Vista", "EW21", 1.2),
        ("Dover", "EW22", 1.5),
        ("Clementi", "EW23", 1.8),
        ("Jurong East", "EW24", 3.7),
        ("Chinese Garden", "EW25", 1.5),
        ("Lakeside", "EW26", 1.3),
        ("Boon Lay", "EW27", 1.8),
        ("Pioneer", "EW28", 1.1),
        ("Joo Koon", "EW29", 2.4),
        ("Gul Circle", "EW30", 2.3),
        ("Tuas Crescent", "EW31", 1.7),
        ("Tuas West Road", "EW32", 1.2),
        ("Tuas Link", "EW33", 2.2),
    ],
    "CG": [
        ("Tanah Merah", "EW4"),
        ("Expo", "CG1", 3.0),
        ("Changi Airport", "CG2", 3.4),
    ],
    "NE": [
        ("HarbourFront", "NE1"),
        ("Outram Park", "NE3", 2.5),
        ("Chinatown", "NE4", 0.9),
        ("Clarke Quay", "NE5", 0.7),
        ("Dhoby Ghaut", "NE6", 1.3),
        ("Little India", "NE7", 1.1),
        ("Farrer Park", "NE8", 0.9),
        ("Boon Keng", "NE9", 1.2),
        ("Potong Pasir", "NE10", 1.4),
        ("Woodleigh", "NE11", 1.0),
        ("Serangoon", "NE12", 1.1),
        ("Kovan", "NE13", 1.7),
        ("Hougang", "NE14", 1.4),
        ("Buangkok", "NE15", 1.3),
        ("Sengkang", "NE16", 1.2),
        ("Punggol", "NE17", 1.6),
        ("Punggol Coast", "NE18", 1.6),
    ],
    "CC": [
        ("Dhoby Ghaut", "CC1"),
        ("Bras Basah", "CC2", 0.7),
        ("Esplanade", "CC3", 0.7),
        ("Promenade", "CC4", 0.8),
        ("Nicoll Highway", "CC5", 1.1),
        ("Stadium", "CC6", 1.3),
        ("Mountbatten", "CC7", 0.9),
        ("Dakota", "CC8", 0.8),
        ("Paya Lebar", "CC9", 1.1),
        ("MacPherson", "CC10", 1.0),
        ("Tai Seng", "CC11", 1.2),
        ("Bartley", "CC12", 1.3),
        ("Serangoon", "CC13", 1.1),
        ("Lorong Chuan", "CC14", 1.2),
        ("Bishan", "CC15", 1.6),
        ("Marymount", "CC16", 1.4),
        ("Caldecott", "CC17", 1.3),
        ("Botanic Gardens", "CC19", 2.6),
        ("Farrer Road", "CC20", 1.2),
        ("Holland Village", "CC21", 1.1),
        ("Buona Vista", "CC22", 0.9),
        ("one-north", "CC23", 1.1),
        ("Kent Ridge", "CC24", 1.2),
        ("Haw Par Villa", "CC25", 1.4),
        ("Pasir Panjang", "CC26", 1.3),
        ("Labrador Park", "CC27", 1.2),
        ("Telok Blangah", "CC28", 1.0),
        ("HarbourFront", "CC29", 1.3),
    ],
    "CE": [
        ("Promenade", "CC4"),
        ("Bayfront", "CE1", 1.2),
        ("Marina Bay", "CE2", 1.3),
    ],
    "DT": [
        ("Bukit Panjang", "DT1"),
        ("Cashew", "DT2", 1.1),
        ("Hillview", "DT3", 1.0),
        ("Beauty World", "DT5", 2.2),
        ("King Albert Park", "DT6", 1.2),
        ("Sixth Avenue", "DT7", 1.4),
        ("Tan Kah Kee", "DT8", 1.2),
        ("Botanic Gardens", "DT9", 1.1),
        ("Stevens", "DT10", 1.1),
        ("Newton", "DT11", 1.2),
        ("Little India", "DT12", 1.3),
        ("Rochor", "DT13", 0.8),
        ("Bugis", "DT14", 0.7),
        ("Promenade", "DT15", 1.0),
        ("Bayfront", "DT16", 1.1),
        ("Downtown", "DT17", 0.9),
        ("Telok Ayer", "DT18", 0.6),
        ("Chinatown", "DT19", 0.7),
        ("Fort Canning", "DT20", 1.2),
        ("Bencoolen", "DT21", 1.1),
        ("Jalan Besar", "DT22", 0.9),
        ("Bendemeer", "DT23", 1.2),
        ("Geylang Bahru", "DT24", 1.3),
        ("Mattar", "DT25", 1.4),
        ("MacPherson", "DT26", 1.0),
        ("Ubi", "DT27", 1.1),
        ("Kaki Bukit", "DT28", 1.2),
        ("Bedok North", "DT29", 1.3),
        ("Bedok Reservoir", "DT30", 1.5),
        ("Tampines West", "DT31", 1.6),
        ("Tampines", "DT32", 1.2),
        ("Tampines East", "DT33", 1.3),
        ("Upper Changi", "DT34", 1.8),
        ("Expo", "DT35", 1.1),
    ],
    "TE": [
        ("Woodlands North", "TE1"),
        ("Woodlands", "TE2", 1.6),
        ("Woodlands South", "TE3", 1.4),
        ("Springleaf", "TE4", 4.1),
        ("Lentor", "TE5", 2.2),
        ("Mayflower", "TE6", 1.3),
        ("Bright Hill", "TE7", 1.2),
        ("Upper Thomson", "TE8", 1.4),
        ("Caldecott", "TE9", 2.0),
        ("Stevens", "TE11", 3.0),
        ("Napier", "TE12", 1.8),
        ("Orchard Boulevard", "TE13", 0.9),
        ("Orchard", "TE14", 0.9),
        ("Great World", "TE15", 1.1),
        ("Havelock", "TE16", 0.9),
        ("Outram Park", "TE17", 1.2),
        ("Maxwell", "TE18", 0.9),
        ("Shenton Way", "TE19", 0.8),
        ("Marina Bay", "TE20", 0.9),
        ("Gardens by the Bay", "TE22", 1.7),
        ("Tanjong Rhu", "TE23", 2.2),
        ("Katong Park", "TE24", 1.3),
        ("Tanjong Katong", "TE25", 1.4),
        ("Marine Parade", "TE26", 1.2),
        ("Marine Terrace", "TE27", 1.1),
        ("Siglap", "TE28", 1.4),
        ("Bayshore", "TE29", 1.2),
    ],
    "BP": [
        ("Choa Chu Kang", "BP1"),
        ("South View", "BP2", 0.8),
        ("Keat Hong", "BP3", 0.5),
        ("Teck Whye", "BP4", 0.6),
        ("Phoenix", "BP5", 0.7),
        ("Bukit Panjang", "BP6", 0.6),
        ("Petir", "BP7", 0.5),
        ("Pending", "BP8", 0.5),
        ("Bangkit", "BP9", 0.6),
        ("Fajar", "BP10", 0.6),
        ("Segar", "BP11", 0.6),
        ("Jelapang", "BP12", 0.6),
        ("Senja", "BP13", 0.6),
        ("Bukit Panjang", "BP6", 0.7),
    ]
}

def build_mrt_graph():
    # Build graph with all stations and edges
    stations = set()
    station_names = {} # name -> set of codes
    graph = {} # node -> list of (neighbor, distance)

    def add_edge(u, v, dist):
        stations.add(u)
        stations.add(v)
        if u not in graph: graph[u] = []
        if v not in graph: graph[v] = []
        graph[u].append((v, dist))
        graph[v].append((u, dist))

    # Add line edges
    for line_name, line_stations in MRT_LINES.items():
        prev_code = None
        for item in line_stations:
            name = item[0]
            code = item[1]
            dist = item[2] if len(item) > 2 else 0.0
            
            if name not in station_names:
                station_names[name] = set()
            station_names[name].add(code)
            
            if prev_code is not None:
                add_edge(prev_code, code, dist)
            prev_code = code

    # Add 0-distance interchange edges between station codes of the same station name
    for name, codes in station_names.items():
        codes_list = list(codes)
        for i in range(len(codes_list)):
            for j in range(i + 1, len(codes_list)):
                add_edge(codes_list[i], codes_list[j], 0.0)

    # Precalculate shortest distances between all station names using Dijkstra
    import heapq
    station_dist_matrix = {} # "OriginStation__DestStation" -> shortest distance

    all_names = list(station_names.keys())
    for name in all_names:
        start_codes = list(station_names[name])
        # Dijkstra from all start_codes
        dists = {code: float('inf') for code in stations}
        pq = []
        for sc in start_codes:
            dists[sc] = 0.0
            heapq.heappush(pq, (0.0, sc))

        while pq:
            d, u = heapq.heappop(pq)
            if d > dists[u]:
                continue
            for v, weight in graph.get(u, []):
                if dists[u] + weight < dists[v]:
                    dists[v] = dists[u] + weight
                    heapq.heappush(pq, (dists[v], v))

        # Record minimum distance to each destination station name
        for target_name in all_names:
            target_codes = list(station_names[target_name])
            min_d = min(dists[tc] for tc in target_codes)
            key = f"{name.upper()}__{target_name.upper()}"
            station_dist_matrix[key] = round(min_d, 2)

    return station_names, station_dist_matrix

def main():
    print("Fetching Bus Stops from LTA DataMall...", flush=True)
    raw_stops = fetch_all('BusStops')
    
    print("Fetching Bus Routes from LTA DataMall...", flush=True)
    raw_routes = fetch_all('BusRoutes')

    print("Processing Bus Stops...", flush=True)
    bus_stops = {} # code -> { name, road, lat, lng }
    stop_name_to_codes = {} # normalized_name -> list of codes

    for s in raw_stops:
        code = s['BusStopCode']
        desc = s['Description']
        road = s['RoadName']
        bus_stops[code] = {
            'c': code,
            'n': desc,
            'r': road,
            'lat': s['Latitude'],
            'lng': s['Longitude']
        }
        norm = normalize_name(desc)
        if norm not in stop_name_to_codes:
            stop_name_to_codes[norm] = []
        if code not in stop_name_to_codes[norm]:
            stop_name_to_codes[norm].append(code)

        # Also store original desc uppercase
        orig_norm = desc.strip().upper()
        if orig_norm not in stop_name_to_codes:
            stop_name_to_codes[orig_norm] = []
        if code not in stop_name_to_codes[orig_norm]:
            stop_name_to_codes[orig_norm].append(code)

    print("Processing Bus Routes...", flush=True)
    # Group by ServiceNo -> Direction -> list of (code, distance)
    bus_routes = {}
    for r in raw_routes:
        svc = r['ServiceNo'].upper()
        direction = r['Direction'] # 1 or 2
        seq = r['StopSequence']
        code = r['BusStopCode']
        dist = r.get('Distance') or 0.0

        if svc not in bus_routes:
            bus_routes[svc] = {}
        dir_key = str(direction)
        if dir_key not in bus_routes[svc]:
            bus_routes[svc][dir_key] = []
        
        bus_routes[svc][dir_key].append({
            's': seq,
            'c': code,
            'd': float(dist)
        })

    # Sort each direction by sequence
    for svc, dirs in bus_routes.items():
        for dir_key in dirs:
            dirs[dir_key].sort(key=lambda x: x['s'])

    print("Building MRT Network Graph and Distance Matrix...", flush=True)
    station_names, mrt_dist_matrix = build_mrt_graph()

    output_data = {
        'version': '2026.08',
        'busStops': bus_stops,
        'stopNameToCodes': stop_name_to_codes,
        'busRoutes': bus_routes,
        'mrtStations': {k: list(v) for k, v in station_names.items()},
        'mrtDistances': mrt_dist_matrix
    }

    os.makedirs('public/data', exist_ok=True)
    output_path = 'public/data/transit-data.json'
    print(f"Writing transit data to {output_path}...", flush=True)
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, separators=(',', ':'))

    size_mb = os.path.getsize(output_path) / (1024 * 1024)
    print(f"Done! transit-data.json generated successfully. Size: {size_mb:.2f} MB", flush=True)

if __name__ == '__main__':
    main()
