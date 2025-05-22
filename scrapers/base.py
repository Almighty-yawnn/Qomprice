from playwright.async_api import async_playwright
from pathlib import Path
import yaml, asyncio, uuid, datetime, random
from app import models, db
from sqlalchemy import select
from app.models import Category




class BaseScraper:
    site_id: str

    def __init__(self, category_slug: str, cfg: dict):
        self.category_slug = category_slug
        self.selectors = cfg


    async def _retry(
        self,
        fn: callable,
        *args,
        retries: int = 3,
        backoff_base: float = 1.0,
        **kwargs
    ):
        """
        Calls `await fn(*args, **kwargs)`, retrying up to `retries` times
        with exponential back-off (1s, 2s, 3s...).
        """
        for attempt in range(1, retries + 1):
            try:
                return await fn(*args, **kwargs)
            except Exception as e:
                if attempt == retries:
                    # give up
                    raise
                wait = backoff_base * attempt
                print(f"⚠️  {fn.__name__} failed (attempt {attempt}), retrying in {wait:.1f}s…")
                await asyncio.sleep(wait)


    


    # def load_selectors(self):
    #     path = Path(__file__).parent / "selectors" / f"{self.site_id.lower()}.yaml"
    #     with open(path, encoding="utf-8") as f:
    #         return yaml.safe_load(f)[self.category_slug]


    async def parse_items(self, items):
            """
            Given a list of Playwright ElementHandles, extract
            title, price, link & image and return a list of payload dicts.
            """
            payloads = []
            for item in items:
                try:
                    # TITLE
                    title_el = await item.query_selector(self.selectors["title"])
                    title = (await title_el.text_content()).strip() if title_el else None

                    # PRICE (strip non-digits, assume last two digits are cents)
                    price_el = await item.query_selector(self.selectors["price"])
                    price_text = await price_el.text_content() if price_el else ""
                    price = float(''.join(filter(str.isdigit, price_text))) / 100 if price_text else 0.0

                    # LINK
                    link_el = await item.query_selector(self.selectors["link"])
                    href = await link_el.get_attribute("href") if link_el else None

                    # IMAGE
                    img_el = await item.query_selector(self.selectors["img"])
                    img = await img_el.get_attribute("data-src") or await img_el.get_attribute("src") if img_el else None
                    
                    
                    if title and href and img:
                        payloads.append({
                            "id":       str(uuid.uuid4()),
                            "title":    title,
                            "price":    price,
                            "affiliate_url": href,
                            "image_url":     img,
                            "scraped_at":    datetime.datetime.utcnow(),
                        })
                    

                except Exception as e:
                    print("❌ parse_items error:", e)

            return payloads


    async def run(self):
        async with async_playwright() as p:
            print('running scrapper')
            browser = await p.chromium.launch(headless=True)
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
            print('scraped')

            page_num = 1
            all_payloads = []

            while True:
                if page_num > 3:
                    print("🔚 Reached page limit (3), stopping.")
                    break
                url = self.selectors["url"] + f"?page={page_num}"
                print(url)

                # 🔁 retryable navigation
                await self._retry(page.goto, url, timeout=60000)
                
                await self._retry(
                    page.wait_for_selector,
                    self.selectors["item"],
                    timeout=30000
                )

                items = await page.query_selector_all(self.selectors["item"])
                if not items:
                    print('about to break')
                    break

                # if page_num == 1:
                #     print(await items[0].inner_html())
                payloads = await self.parse_items(items)
                
                #all_payloads.extend(payloads)
                await self._save_with_retry(payloads)
                print('item selected, parsed, and extended')
                

                # 💤 throttle before next page
                delay = random.uniform(1.0, 3.0)
                await asyncio.sleep(delay)

                page_num += 1

            await browser.close()
            print('browser closed')
            #await self.save(all_payloads)
    

    async def _save_with_retry(self, payloads, retries: int = 3):
        """
        Save this small batch of payloads, retrying commit if necessary.
        """
        for attempt in range(1, retries + 1):
            try:
                async with db.AsyncSessionLocal() as session:
                    for row in payloads:
                        product = models.Product(
                            id=row["id"],
                            title=row["title"],
                            universal_category_id=await self.resolve_category_id(session),
                        )
                        session.add(product)
                        session.add(
                            models.VendorListing(
                                product_id=row["id"],
                                site_id=self.site_id,
                                site_category_id=self.category_slug,
                                price=row["price"],
                                affiliate_url=row["affiliate_url"],
                                image_url=row["image_url"],
                                scraped_at=datetime.datetime.utcnow(),
                            )
                        )
                    await session.commit()
                print(f"💾 Page saved ({len(payloads)} rows)")
                return
            except Exception as e:
                print(f"⚠️  Save failed (attempt {attempt}): {e}")
                if attempt == retries:
                    raise
                await asyncio.sleep(attempt)    



    async def resolve_category_id(self, session):
        result = await session.scalar(
            select(Category.id).where(Category.slug == self.category_slug)
        )
        return result






    # async def save(self, payloads):
    #     async with db.AsyncSessionLocal() as session:
    #         for row in payloads:
    #             product = models.Product(
    #                 id=row["id"],
    #                 title=row["title"],
    #                 universal_category_id=await self.resolve_category_id(session),
    #             )
    #             session.add(product)

    #             listing = models.VendorListing(
    #                 product_id=row["id"],
    #                 site_id=self.site_id,
    #                 site_category_id=self.category_slug,
    #                 price=row["price"],
    #                 affiliate_url=row["affiliate_url"],
    #                 image_url=row["image_url"],
    #                 scraped_at=datetime.datetime.utcnow(),
    #             )
    #             session.add(listing)
    #             print('saved...')

    #         await session.commit()