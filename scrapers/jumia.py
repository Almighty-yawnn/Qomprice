# scrapers/jumia.py
import asyncio
from .base import BaseScraper


class JumiaScraper(BaseScraper):
    site_id = "JUMIA"


async def main():
    scraper = JumiaScraper(category_slug="phones-tablets")
    await scraper.run()
    print("✅  Jumia scrape complete")


if __name__ == "__main__":
    asyncio.run(main())
