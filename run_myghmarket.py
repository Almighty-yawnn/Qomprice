import yaml
import asyncio
from scrapers.myghmarket import MyGHMarketScraper

async def main():
    cfg = yaml.safe_load(open("scrapers/selectors/myghmarket.yaml", encoding="utf-8"))
    for slug in cfg.keys():
        print(f"🚀 Scraping category: {slug}")
        scraper = MyGHMarketScraper(slug)
        await scraper.run()
        print(f"✅ Done with {slug}\n")

if __name__ == "__main__":
    asyncio.run(main())
