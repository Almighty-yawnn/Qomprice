import yaml
from pathlib import Path
from .base import BaseScraper

class TelefonikaScraper(BaseScraper):
    site_id = "TELEFONIKA"

    def __init__(self, category_slug: str):
        path = Path(__file__).parent / "selectors" / "telefonika.yaml"
        selectors_all = yaml.safe_load(open(path, encoding="utf-8"))
        if category_slug not in selectors_all:
            raise ValueError(f"Category '{category_slug}' not found in telefonika selectors.")
        selectors = selectors_all[category_slug]
        super().__init__(category_slug, selectors)


# Optional standalone runner
# if __name__ == "__main__":
#     import asyncio, yaml
#     cfg_all = yaml.safe_load(open(
#         Path(__file__).parent / "selectors" / "telefonika.yaml",
#         encoding="utf-8"
#     ))
#     async def main():
#         for slug in cfg_all:
#             print(f"🚀 Scraping Telefonika → {slug}")
#             scraper = TelefonikaScraper(slug)
#             await scraper.run()
#             print(f"✅ Done {slug}\n")
#     asyncio.run(main())







# #import asyncio
# from .base import BaseScraper


# class TelefonikaScraper(BaseScraper):
#     site_id = "TELEFONIKA"
#     base_url = "https://telefonika.com"
#     # You can add more config here if your BaseScraper supports it,
#     # like category slugs, pagination params, headers,


# async def main():
#     # Specify the category slug or URL path you want to scrape
#     scraper = TelefonikaScraper(category_slug="mobiles-oppo")  # example category
#     await scraper.run()
#     print("✅  Telefonika scrape complete")


# if __name__ == "__main__":
#     asyncio.run(main())
