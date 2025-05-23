import yaml
import asyncio
from scrapers.get4lessghana import Get4LessGhanaScraper

async def main():
    cfg = yaml.safe_load(open("scrapers/selectors/get4lessghana.yaml", encoding="utf-8"))
    for slug in cfg.keys():
        print(f"🚀 Scraping category: {slug}")
        scraper = Get4LessGhanaScraper(slug)  # only slug, no selectors
        await scraper.run()
        print(f"✅ Done with {slug}\n")

if __name__ == "__main__":
    asyncio.run(main())
