from playwright.async_api import async_playwright
from pathlib import Path
import yaml, asyncio, uuid, datetime
from app import models, db
from sqlalchemy import select
from app.models import Category

class BaseScraper:
    site_id: str
    selectors: dict

    def __init__(self, category_slug: str):
        self.category_slug = category_slug
        self.selectors = self.load_selectors()

    def load_selectors(self):
        path = Path(__file__).parent / "selectors" / f"{self.site_id.lower()}.yaml"
        with open(path, encoding="utf-8") as f:
            return yaml.safe_load(f)[self.category_slug]

    async def run(self):
        async with async_playwright() as p:
            # Launch browser in non-headless mode for debugging
            browser = await p.chromium.launch(headless=True)

            # Set user-agent via browser context
            context = await browser.new_context(
                extra_http_headers={
                    "User-Agent": (
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                        "AppleWebKit/537.36 (KHTML, like Gecko) "
                        "Chrome/120.0.0.0 Safari/537.36"
                    )
                },
                viewport={"width": 1280, "height": 720}
            )

            page = await context.new_page()

            # Go to target URL
            await page.goto(self.selectors["url"], timeout=60000)
            await page.wait_for_load_state("networkidle")

            # Dump page content for manual debugging
            content = await page.content()
            print("✅ Page loaded — writing debug.html")
            with open("debug.html", "w", encoding="utf-8") as f:
                f.write(content)

            # Wait for product cards to be visible
            await page.wait_for_selector(self.selectors["item"], timeout=60000)

            items = await page.query_selector_all(self.selectors["item"])
            payloads = []

            for item in items:
                try:
                    # TITLE
                    title_el = await item.query_selector(self.selectors["title"])
                    title = await title_el.text_content() if title_el else None

                    # PRICE
                    price_el = await item.query_selector(self.selectors["price"])
                    price_text = await price_el.text_content() if price_el else ""
                    price = float(''.join(filter(str.isdigit, price_text))) / 100 if price_text else 0.0

                    # LINK
                    link_el = await item.query_selector(self.selectors["link"])
                    href = await link_el.get_attribute("href") if link_el else None

                    # IMAGE
                    img_el = await item.query_selector(self.selectors["img"])
                    img = await img_el.get_attribute("src") or await img_el.get_attribute("data-src") if img_el else None

                    if title and href:
                        payloads.append({
                            "id": str(uuid.uuid4()),
                            "title": title.strip(),
                            "price": price,
                            "affiliate_url": href,
                            "image_url": img,
                            "scraped_at": datetime.datetime.utcnow(),
                        })

                except Exception as e:
                    print("❌ Error parsing product:", e)


            await browser.close()
            await self.save(payloads)

    async def save(self, payloads):
        async with db.AsyncSessionLocal() as session:
            for row in payloads:
                product = models.Product(
                    id=row["id"],
                    title=row["title"],
                    universal_category_id=await self.resolve_category_id(session),
                )
                session.add(product)

                listing = models.VendorListing(
                    product_id=row["id"],
                    site_id=self.site_id,
                    site_category_id=self.category_slug,
                    price=row["price"],
                    affiliate_url=row["affiliate_url"],
                )
                session.add(listing)

            await session.commit()

    async def resolve_category_id(self, session):
        result = await session.scalar(
            select(Category.id).where(Category.slug == self.category_slug)
        )
        return result
