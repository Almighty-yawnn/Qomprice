from .base import BaseScraper

class IshtariScraper(BaseScraper):
    site_id = "ISTARI"

    def __init__(self, category_slug: str, selectors: dict):
        super().__init__(category_slug, selectors)
