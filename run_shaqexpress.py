import yaml
import asyncio
from scrapers.shaqexpress import ShaqexpressScraper

async def main():
    # Load selectors config for Shaqexpress categories
    cfg = yaml.safe_load(open("scrapers/selectors/shaqexpress.yaml", encoding="utf-8"))
    
    for slug, selectors in cfg.items():
        print(f"🚀 Scraping category: {slug}")
        scraper = ShaqexpressScraper(slug, selectors)
        await scraper.run()
        print(f"✅ Done with {slug}\n")

if __name__ == "__main__":
    asyncio.run(main())
