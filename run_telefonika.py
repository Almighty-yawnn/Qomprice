import yaml
import asyncio
from scrapers.telefonika import TelefonikaScraper

async def main():
    # Load the YAML to get all category slugs
    cfg = yaml.safe_load(open("scrapers/selectors/telefonika.yaml", encoding="utf-8"))
    for slug in cfg.keys():
        print(f"🚀 Scraping category: {slug}")
        scraper = TelefonikaScraper(slug)  # Only pass the slug!
        await scraper.run()
        print(f"✅ Done with {slug}\n")

if __name__ == "__main__":
    asyncio.run(main())
