from .base import BaseScraper

class ShopwiceScraper(BaseScraper):
    site_id = "SHOPWICE"

    def __init__(self, category_slug: str, selectors: dict):
        super().__init__(category_slug, selectors)
