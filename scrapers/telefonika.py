import yaml
from pathlib import Path
from .base import BaseScraper

class TelefonikaScraper(BaseScraper):
    site_id = "TELEFONIKA"

    def __init__(self, category_slug: str):
        # Load selectors YAML for this site and category
        path = Path(__file__).parent / "selectors" / "telefonika.yaml"
        with open(path, encoding="utf-8") as f:
            selectors_all = yaml.safe_load(f)
        if category_slug not in selectors_all:
            raise ValueError(f"Category '{category_slug}' not found in telefonika selectors.")
        selectors = selectors_all[category_slug]
        super().__init__(category_slug, selectors)
