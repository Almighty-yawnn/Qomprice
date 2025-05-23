# scrapers/get4lessghana.py
import asyncio
from .base import BaseScraper
from pathlib import Path
import yaml


class Get4LessGhanaScraper(BaseScraper):
    site_id = "GET4LESSGHANA"

    def __init__(self, category_slug: str):
        # Load selectors YAML for this site and category
        path = Path(__file__).parent / "selectors" / "get4lessghana.yaml"
        with open(path, encoding="utf-8") as f:
            selectors_all = yaml.safe_load(f)
        if category_slug not in selectors_all:
            raise ValueError(f"Category '{category_slug}' not found in selectors YAML.")
        selectors = selectors_all[category_slug]
        super().__init__(category_slug, selectors)


async def main():
    scraper = Get4LessGhanaScraper(category_slug="laptops")  # change category as needed
    await scraper.run()
    print("✅  Get4LessGhana scrape complete")


if __name__ == "__main__":
    asyncio.run(main())
