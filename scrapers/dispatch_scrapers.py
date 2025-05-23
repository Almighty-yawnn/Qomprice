import asyncio, importlib

def dispatch_scraper(site: str, category_slug: str, selectors: dict):
    """
    Entry point for RQ: instantiate and run the right scraper.
    """
    mod = importlib.import_module(f"scrapers.{site.lower()}")
    ScraperCls = getattr(mod, f"{site.capitalize()}Scraper")
    scraper = ScraperCls(category_slug, selectors)
    asyncio.run(scraper.run())