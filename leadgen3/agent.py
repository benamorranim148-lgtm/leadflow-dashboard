"""
Lead Generation Agent (Free version — uses OpenStreetMap, no billing needed)
------------------------------------------------------------------------------
Searches for businesses via OpenStreetMap (Nominatim + Overpass API, both
free and require no API key), then uses Claude to analyze each one and
score how likely they are to need a given service (e.g. "an e-commerce
website").

Usage:
    python agent.py --query "clothes" --location "Tunis, Tunisia" --service "e-commerce website"

Notes on --query:
    This should be an OpenStreetMap shop/amenity keyword, e.g.:
    clothes, bakery, hairdresser, restaurant, gym, pharmacy, electronics,
    furniture, car_repair, beauty, supermarket
    (OpenStreetMap tag reference: https://wiki.openstreetmap.org/wiki/Key:shop)
"""

import argparse
import csv
import os
import re
import time
import requests
from anthropic import Anthropic

# ---------------------------------------------------------------------------
# CONFIG
# ---------------------------------------------------------------------------
ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY")
client = Anthropic(api_key=ANTHROPIC_API_KEY)

# OpenStreetMap asks that you set a real User-Agent identifying your app
HEADERS = {"User-Agent": "lead-gen-agent/1.0 (personal project)"}

NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"

# Several public Overpass mirrors — if one is overloaded/times out, we try the next
OVERPASS_URLS = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
    "https://overpass.openstreetmap.ru/api/interpreter",
]

SEARCH_RADIUS_METERS = 5000  # ~5km around the city center, keeps queries fast


# ---------------------------------------------------------------------------
# STEP 1 — Turn a location string into a center point (Nominatim, free)
# ---------------------------------------------------------------------------
def get_center_point(location: str):
    params = {"q": location, "format": "json", "limit": 1}
    resp = requests.get(NOMINATIM_URL, params=params, headers=HEADERS, timeout=15)
    resp.raise_for_status()
    data = resp.json()
    if not data:
        raise ValueError(f"Could not find location: {location}")

    lat, lon = float(data[0]["lat"]), float(data[0]["lon"])
    return lat, lon


# ---------------------------------------------------------------------------
# STEP 2 — Search for businesses near that point via Overpass API (free)
# ---------------------------------------------------------------------------
def search_businesses(query: str, location: str, max_results: int = 20):
    lat, lon = get_center_point(location)

    # Translate normal business searches into the OSM tags commonly used
    # for those businesses.
    q = query.strip().lower()

    tag_map = {
        # Gyms / fitness
        "gym": [("leisure", "fitness_centre")],
        "gyms": [("leisure", "fitness_centre")],
        "fitness": [("leisure", "fitness_centre")],
        "fitness centre": [("leisure", "fitness_centre")],
        "fitness center": [("leisure", "fitness_centre")],
        "salle de sport": [("leisure", "fitness_centre")],
        "club de fitness": [("leisure", "fitness_centre")],
        "gymnase": [("leisure", "sports_centre")],
        "sports centre": [("leisure", "sports_centre")],
        "sports center": [("leisure", "sports_centre")],

        # Cafes
        "cafe": [("amenity", "cafe")],
        "café": [("amenity", "cafe")],
        "coffee shop": [("amenity", "cafe")],
        "coffee": [("amenity", "cafe")],

        # Restaurants
        "restaurant": [("amenity", "restaurant")],
        "restaurants": [("amenity", "restaurant")],

        # Other common business types
        "pharmacy": [("amenity", "pharmacy")],
        "pharmacie": [("amenity", "pharmacy")],
        "bakery": [("shop", "bakery")],
        "boulangerie": [("shop", "bakery")],
        "clothes": [("shop", "clothes")],
        "clothing": [("shop", "clothes")],
        "furniture": [("shop", "furniture")],
        "electronics": [("shop", "electronics")],
        "supermarket": [("shop", "supermarket")],
        "hairdresser": [("shop", "hairdresser")],
        "coiffeur": [("shop", "hairdresser")],
        "beauty": [("shop", "beauty")],
        "beauty salon": [("shop", "beauty")],
    }

    tags = tag_map.get(q)

    if tags:
        # nwr = nodes + ways + relations, so businesses mapped as areas
        # are included too.
        clauses = []
        for key, value in tags:
            clauses.append(
                f'nwr["{key}"="{value}"](around:{SEARCH_RADIUS_METERS},{lat},{lon});'
            )

        overpass_query = f"""
        [out:json][timeout:25];
        (
            {"".join(clauses)}
        );
        out center tags;
        """
    else:
        # Fallback for arbitrary OSM shop/amenity/leisure keywords.
        safe_query = re.escape(q)
        overpass_query = f"""
        [out:json][timeout:25];
        (
            nwr["shop"~"{safe_query}",i](around:{SEARCH_RADIUS_METERS},{lat},{lon});
            nwr["amenity"~"{safe_query}",i](around:{SEARCH_RADIUS_METERS},{lat},{lon});
            nwr["leisure"~"{safe_query}",i](around:{SEARCH_RADIUS_METERS},{lat},{lon});
        );
        out center tags;
        """

    last_error = None
    elements = None

    for url in OVERPASS_URLS:
        try:
            resp = requests.post(
                url,
                data={"data": overpass_query},
                headers=HEADERS,
                timeout=35,
            )
            resp.raise_for_status()
            elements = resp.json().get("elements", [])
            break
        except requests.exceptions.RequestException as e:
            print(f"  [info] Overpass mirror {url} failed ({e}), trying next...")
            last_error = e

    if elements is None:
        raise RuntimeError(f"All Overpass mirrors failed. Last error: {last_error}")

    businesses = []
    for el in elements[:max_results]:
        tags = el.get("tags", {})
        name = tags.get("name")
        if not name:
            continue

        website = tags.get("website") or tags.get("contact:website")
        phone = tags.get("phone") or tags.get("contact:phone")

        addr_parts = [
            tags.get("addr:housenumber"),
            tags.get("addr:street"),
            tags.get("addr:city"),
        ]
        address = ", ".join([p for p in addr_parts if p]) or None

        businesses.append({
            "name": name,
            "address": address,
            "website": website,
            "phone": phone,
        })

    return businesses


# ---------------------------------------------------------------------------
# STEP 3 — Enrich: pull a text snapshot of the business's website, if any
# ---------------------------------------------------------------------------
def fetch_website_snapshot(url: str, max_chars: int = 3000):
    if not url:
        return None
    try:
        resp = requests.get(url, timeout=10, headers={"User-Agent": "Mozilla/5.0"})
        text = re.sub(r"<[^>]+>", " ", resp.text)
        text = re.sub(r"\s+", " ", text).strip()
        return text[:max_chars]
    except Exception as e:
        return f"[could not fetch website: {e}]"


# ---------------------------------------------------------------------------
# STEP 4 — Analyze each lead with Claude
# ---------------------------------------------------------------------------
def score_lead(business: dict, service: str):
    prompt = f"""You are helping a freelancer qualify sales leads.

Service being sold: {service}

Business info:
- Name: {business.get('name')}
- Address: {business.get('address') or 'Unknown'}
- Website: {business.get('website') or 'None found'}
- Website content snapshot: {business.get('website_snapshot') or 'No website found'}

Task:
1. Score from 1-10 how likely this business needs the service above (10 = urgent, obvious need; 1 = clearly not a fit).
2. Give ONE short sentence explaining why.

Respond ONLY in this exact format, nothing else:
SCORE: <number>
REASON: <one sentence>"""

    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=150,
        messages=[{"role": "user", "content": prompt}],
    )

    reply = message.content[0].text.strip()

    score, reason = None, None
    for line in reply.splitlines():
        if line.upper().startswith("SCORE:"):
            score = line.split(":", 1)[1].strip()
        elif line.upper().startswith("REASON:"):
            reason = line.split(":", 1)[1].strip()

    return score or "?", reason or reply


# ---------------------------------------------------------------------------
# MAIN PIPELINE
# ---------------------------------------------------------------------------
def run(query: str, location: str, service: str, max_results: int, output_file: str):
    print(f"Searching OpenStreetMap for '{query}' in '{location}'...")
    businesses = search_businesses(query, location, max_results)
    print(f"Found {len(businesses)} named businesses. Enriching + scoring...\n")

    if not businesses:
        print("No results. Try a broader --query (e.g. 'shop' instead of a specific type),")
        print("or double check OSM tag names: https://wiki.openstreetmap.org/wiki/Key:shop")
        return

    rows = []
    for b in businesses:
        b["website_snapshot"] = fetch_website_snapshot(b.get("website"))

        score, reason = score_lead(b, service)
        print(f"  -> {b['name']}: score {score} — {reason}")

        rows.append({
            "name": b["name"],
            "address": b.get("address") or "",
            "website": b.get("website") or "",
            "phone": b.get("phone") or "",
            "score": score,
            "reason": reason,
        })

    rows.sort(key=lambda r: (r["score"] if r["score"].isdigit() else 0), reverse=True)

    with open(output_file, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["name", "address", "website", "phone", "score", "reason"])
        writer.writeheader()
        writer.writerows(rows)

    print(f"\nDone. Results saved to {output_file}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="AI Lead Generation Agent (free OpenStreetMap version)")
    parser.add_argument("--query", required=True, help="OSM shop/amenity keyword, e.g. 'clothes', 'bakery', 'gym'")
    parser.add_argument("--location", required=True, help="Location, e.g. 'Tunis, Tunisia'")
    parser.add_argument("--service", required=True, help="Service you're selling, e.g. 'e-commerce website'")
    parser.add_argument("--max-results", type=int, default=15)
    parser.add_argument("--output", default="leads.csv")
    args = parser.parse_args()

    if not ANTHROPIC_API_KEY:
        raise SystemExit("Missing API key. Set ANTHROPIC_API_KEY as an environment variable.")

    run(args.query, args.location, args.service, args.max_results, args.output)
