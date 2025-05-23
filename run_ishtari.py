import yaml
import asyncio
from scrapers.istari import IshtariScraper

async def main():
    # load the entire selectors YAML
    cfg_all = yaml.safe_load(
        open("scrapers/selectors/istari.yaml", encoding="utf-8")
    )

    for slug, selectors in cfg_all.items():
        print(f"🚀 Scraping category: {slug}")
        # pass both slug and its selectors dict
        scraper = IshtariScraper(slug, selectors)
        await scraper.run()
        print(f"✅ Done with {slug}\n")

if __name__ == "__main__":
    asyncio.run(main())