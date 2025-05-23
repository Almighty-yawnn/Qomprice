import asyncio
from scrapers.telefonika import TelefonikaScraper

async def main():
    # only one category here, but you can loop all keys in your YAML if you add more
    scraper = TelefonikaScraper("phones-tablets")
    await scraper.run()

if __name__ == "__main__":
    asyncio.run(main())
