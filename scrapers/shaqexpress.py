# scrapers/shaqex.py
import asyncio
from .base import BaseScraper


class ShaqexpressScraper(BaseScraper):
    site_id = "SHAQEXPRESS"


async def main():
    scraper = ShaqexpressScraper(category_slug="phones-tablets")
    await scraper.run()
    print("✅  ShaQexpress scrape complete")


if __name__ == "__main__":
    asyncio.run(main())
