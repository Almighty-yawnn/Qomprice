# run_jumia.py
import yaml, asyncio
from scrapers.jumia import JumiaScraper

async def main():
    cfg = yaml.safe_load(open("scrapers/selectors/jumia.yaml", encoding="utf-8"))
    for slug, selectors in cfg.items():
        print(f"🚀 Scraping category: {slug}")
        scraper = JumiaScraper(slug, selectors)
        await scraper.run()
        print(f"✅ Done with {slug}\n")

if __name__ == "__main__":
    asyncio.run(main())
