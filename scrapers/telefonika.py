import asyncio
from .base import BaseScraper


class TelefonikaScraper(BaseScraper):
    site_id = "TELEFONIKA"
    base_url = "https://telefonika.com"
    # You can add more config here if your BaseScraper supports it,
    # like category slugs, pagination params, headers,


async def main():
    # Specify the category slug or URL path you want to scrape
    scraper = TelefonikaScraper(category_slug="mobiles-oppo")  # example category
    await scraper.run()
    print("✅  Telefonika scrape complete")


if __name__ == "__main__":
    asyncio.run(main())
