"""
DineOnCampus scraper — Pierce Dining Hall, Stevens Institute of Technology.

Endpoints (apiv4.dineoncampus.com):
  GET /locations/{LOCATION_ID}/periods/?date=YYYY-MM-DD   → meal periods + IDs
  GET /locations/{LOCATION_ID}/menu?date=YYYY-MM-DD&period={id} → items

Uses cloudscraper to bypass Cloudflare bot detection.
POSTs scraped items to the local Next.js /api/menu/sync endpoint.
"""

import os
import sys
import time
import logging
from datetime import date

import cloudscraper

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
log = logging.getLogger(__name__)

BASE_API    = "https://apiv4.dineoncampus.com"
LOCATION_ID = os.getenv("DINEONCAMPUS_LOCATION_ID", "58adee613191a2d1edd788c4")
APP_URL     = os.getenv("APP_URL", "http://localhost:3000")
SECRET      = os.getenv("SCRAPER_SECRET", "dev-secret")

scraper = cloudscraper.create_scraper(browser={"browser": "chrome", "platform": "darwin", "mobile": False})
scraper.headers.update({
    "Origin":  "https://dineoncampus.com",
    "Referer": "https://dineoncampus.com/stevensdining/",
})


# ---------------------------------------------------------------------------
# API helpers
# ---------------------------------------------------------------------------

def get(path: str, **params) -> dict:
    url  = f"{BASE_API}{path}"
    resp = scraper.get(url, params=params, timeout=20)
    resp.raise_for_status()
    return resp.json()


def fetch_periods(scrape_date: str) -> list[dict]:
    data = get(f"/locations/{LOCATION_ID}/periods/", date=scrape_date)
    return data.get("periods", [])


def fetch_menu(scrape_date: str, period_id: str) -> list[dict]:
    data = get(f"/locations/{LOCATION_ID}/menu", date=scrape_date, period=period_id)
    return data.get("menu", {}).get("categories", [])


# ---------------------------------------------------------------------------
# Parsing
# ---------------------------------------------------------------------------

def nutrient(nutrients: list[dict], name: str) -> float | None:
    for n in nutrients:
        if name.lower() in n.get("name", "").lower():
            try:
                return float(n["value"])
            except (KeyError, TypeError, ValueError):
                return None
    return None


def to_int(val: float | None) -> int | None:
    return int(val) if val is not None else None


def parse_items(categories: list[dict], period_name: str, scrape_date: str) -> list[dict]:
    items = []
    for cat in categories:
        station = cat.get("name", "Other")
        for item in cat.get("items", []):
            nutrients = item.get("nutrients", [])
            serving   = item.get("portion", {}).get("size")
            items.append({
                "date":        scrape_date,
                "mealPeriod":  period_name,
                "station":     station,
                "name":        item.get("name", "Unknown"),
                "servingSize": str(serving) if serving else None,
                "calories":    to_int(nutrient(nutrients, "calories")),
                "protein":     nutrient(nutrients, "protein"),
                "carbs":       nutrient(nutrients, "total carb"),
                "fat":         nutrient(nutrients, "total fat"),
            })
    return items


# ---------------------------------------------------------------------------
# Main scrape + sync
# ---------------------------------------------------------------------------

def scrape(scrape_date: str) -> list[dict]:
    periods = fetch_periods(scrape_date)
    if not periods:
        log.warning("No periods returned — dining hall may be closed on %s", scrape_date)
        return []

    log.info("Found %d periods: %s", len(periods), [p.get("name") for p in periods])

    all_items: list[dict] = []
    for period in periods:
        name = period.get("name", "Unknown")
        pid  = str(period.get("id", ""))
        log.info("Fetching %s (id=%s)…", name, pid)
        categories = fetch_menu(scrape_date, pid)
        all_items.extend(parse_items(categories, name, scrape_date))
        time.sleep(0.4)

    log.info("Scraped %d items total", len(all_items))
    return all_items


def sync(items: list[dict]) -> None:
    import requests as _req
    resp = _req.post(
        f"{APP_URL}/api/menu/sync",
        json={"items": items, "secret": SECRET},
        headers={"Content-Type": "application/json"},
        timeout=30,
    )
    resp.raise_for_status()
    result = resp.json()
    log.info("Sync complete — synced: %s, failed: %s", result.get("synced"), result.get("failed"))


if __name__ == "__main__":
    target_date = sys.argv[1] if len(sys.argv) > 1 else str(date.today())
    log.info("Scraping menu for %s…", target_date)
    try:
        items = scrape(target_date)
        if items:
            sync(items)
    except Exception as e:
        log.error("Fatal: %s", e)
        sys.exit(1)
