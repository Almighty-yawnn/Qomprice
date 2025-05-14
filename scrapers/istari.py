import asyncio, sys
from .base import BaseScraper


class IstariScraper(BaseScraper):
    site_id = "ISTARI"


async def main():
    # 1) read --category flag or default
    category = "phones-tablets"
    if len(sys.argv) > 1 and sys.argv[1] == "--category":
        category = sys.argv[2]

    scraper = IstariScraper(category_slug=category)
    await scraper.run()
    print(f"✅  Istari scrape complete for '{category}'")


if __name__ == "__main__":
    asyncio.run(main())
