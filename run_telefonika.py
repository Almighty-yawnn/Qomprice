import yaml
import asyncio
from scrapers.telefonika import TelefonikaScraper

async def main():
    # Load selectors config for Telefonika categories
    cfg = yaml.safe_load(open("scrapers/selectors/telefonika.yaml", encoding="utf-8"))
    
    for slug, selectors in cfg.items():
        print(f"🚀 Scraping category: {slug}")
        scraper = TelefonikaScraper(slug, selectors)
        await scraper.run()
        print(f"✅ Done with {slug}\n")

if __name__ == "__main__":
    asyncio.run(main())
