# scrapers/__init__.py
import importlib
import asyncio

def dispatch_scraper(site: str, category_slug: str, cfg: dict):
    """
    Dynamically import the scraper class for `site`,
    instantiate it, and run it in an asyncio loop.
    """
    # e.g. site="jumia" → module "scrapers.jumia", class "JumiaScraper"
    module = importlib.import_module(f"scrapers.{site.lower()}")
    ScraperClass = getattr(module, f"{site.capitalize()}Scraper")

    # run the async .run() entrypoint in its own event loop
    asyncio.run(ScraperClass(category_slug, cfg).run())
