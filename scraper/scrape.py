"""
DineOnCampus scraper — Pierce Dining Hall, Stevens Institute of Technology.

Uses Playwright (headless Chrome) to bypass Cloudflare bot protection.
The browser solves the CF challenge naturally, then we run fetch() calls
from inside that browser context (which already holds valid CF cookies).
"""

import os
import sys
import time
import logging
from datetime import date

import requests
from playwright.sync_api import sync_playwright

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
log = logging.getLogger(__name__)

BASE_API    = "https://apiv4.dineoncampus.com"
LOCATION_ID = os.getenv("DINEONCAMPUS_LOCATION_ID", "58adee613191a2d1edd788c4")
SITE_URL    = "https://dineoncampus.com/stevensdining"
APP_URL     = os.getenv("APP_URL", "http://localhost:3000")
SECRET      = os.getenv("SCRAPER_SECRET", "dev-secret")


def browser_fetch(page, url: str) -> dict:
    """Run fetch() inside the live browser context so CF cookies are included."""
    return page.evaluate("async (u) => { const r = await fetch(u); return r.json(); }", url)


def scrape(scrape_date: str) -> list[dict]:
    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=True)
        page = browser.new_page()

        log.info("Opening dining page (letting Cloudflare challenge run)…")
        page.goto(SITE_URL, wait_until="networkidle", timeout=30_000)
        log.info("Page ready")

        periods_url = f"{BASE_API}/locations/{LOCATION_ID}/periods/?date={scrape_date}"
        periods = browser_fetch(page, periods_url).get("periods", [])

        if not periods:
            log.warning("No periods returned — dining hall may be closed on %s", scrape_date)
            browser.close()
            return []

        log.info("Periods: %s", [p.get("name") for p in periods])

        all_items: list[dict] = []
        for period in periods:
            period_name = period.get("name", "Unknown")
            period_id   = str(period.get("id", ""))
            log.info("Fetching %s…", period_name)

            menu_url = f"{BASE_API}/locations/{LOCATION_ID}/menu?date={scrape_date}&period={period_id}"
            categories = browser_fetch(page, menu_url).get("menu", {}).get("categories", [])

            for cat in categories:
                station = cat.get("name", "Other")
                for item in cat.get("items", []):
                    nuts    = item.get("nutrients", [])
                    serving = item.get("portion", {}).get("size")
                    all_items.append({
                        "date":        scrape_date,
                        "mealPeriod":  period_name,
                        "station":     station,
                        "name":        item.get("name", "Unknown"),
                        "servingSize": str(serving) if serving else None,
                        "calories":    to_int(nutrient(nuts, "calories")),
                        "protein":     nutrient(nuts, "protein"),
                        "carbs":       nutrient(nuts, "total carb"),
                        "fat":         nutrient(nuts, "total fat"),
                    })
            time.sleep(0.3)

        browser.close()

    log.info("Scraped %d items total", len(all_items))
    return all_items


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


def sync_to_app(items: list[dict]) -> None:
    resp = requests.post(
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
            sync_to_app(items)
        else:
            log.warning("No items scraped — dining hall may be closed today.")
    except Exception as e:
        log.error("Fatal: %s", e)
        sys.exit(1)
