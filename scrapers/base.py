# File: scrapers/base.py

from playwright.async_api import async_playwright
from pathlib import Path
import asyncio, uuid, datetime, random, re
from urllib.parse import urlparse, urljoin

from app import models, db
from sqlalchemy import select
from app.models import Category


class BaseScraper:
    site_id: str

    def __init__(self, category_slug: str, cfg: dict):
        self.category_slug = category_slug
        self.selectors = cfg

        # Derive base_url (e.g. "https://shopwice.com") to resolve relative paths
        parsed = urlparse(self.selectors["url"])
        self.base_url = f"{parsed.scheme}://{parsed.netloc}"

    async def _retry(self, fn: callable, *args, retries: int = 3, backoff_base: float = 1.0, **kwargs):
        """
        Calls `await fn(*args, **kwargs)`, retrying up to `retries` times
        with exponential back-off (1s, 2s, 3s...).
        """
        for attempt in range(1, retries + 1):
            try:
                return await fn(*args, **kwargs)
            except Exception as e:
                if attempt == retries:
                    raise
                wait = backoff_base * attempt
                print(f"⚠️  {fn.__name__} failed (attempt {attempt}), retrying in {wait:.1f}s…")
                await asyncio.sleep(wait)

    async def parse_items(self, items):
        """
        Given a list of Playwright ElementHandles, extract
        title, price, link & image and return a list of payload dicts.
        """
        payloads = []
        for item in items:
            try:
                # — TITLE —
                title_el = await item.query_selector(self.selectors["title"])
                title = (await title_el.text_content()).strip() if title_el else None

                # — PRICE —
                price = 0.0
                price_el = await item.query_selector(self.selectors["price"])
                price_text = (await price_el.text_content()).strip() if price_el else ""
                if price_text:
                    # grab first numeric group (handles commas)
                    match = re.search(r"[\d,\.]+", price_text)
                    if match:
                        raw = match.group().replace(",", "")
                        try:
                            price = float(raw)
                        except ValueError:
                            price = 0.0

                # — AFFILIATE LINK —
                link_el = await item.query_selector(self.selectors["link"])
                href = await link_el.get_attribute("href") if link_el else None
                if href and not href.startswith("http"):
                    href = urljoin(self.base_url, href)

                # — IMAGE URL —
                img_el = await item.query_selector(self.selectors["img"])
                img_url = None
                if img_el:
                    # 1) try srcset lists (data-srcset or srcset)
                    for attr in ("data-srcset", "srcset"):
                        val = await img_el.get_attribute(attr)
                        if val:
                            # pick the largest width candidate
                            candidates = [s.strip() for s in val.split(",")]
                            def width_of(s: str):
                                try:
                                    return int(s.rsplit(" ", 1)[1].rstrip("w"))
                                except:
                                    return 0
                            best = max(candidates, key=width_of)
                            img_url = best.split(" ", 1)[0]
                            break
                    # 2) fallback to data-src or src or any custom data-wood-src
                    if not img_url:
                        for attr in ("data-src", "data-wood-src", "src"):
                            v = await img_el.get_attribute(attr)
                            if v:
                                img_url = v
                                break
                    # 3) normalize relative to absolute
                    if img_url and not img_url.startswith("http"):
                        img_url = urljoin(self.base_url, img_url)

                # Only emit if we have the 3 essentials
                if title and href and img_url:
                    payloads.append({
                        "id":            str(uuid.uuid4()),
                        "title":         title,
                        "price":         price,
                        "affiliate_url": href,
                        "image_url":     img_url,
                        "scraped_at":    datetime.datetime.utcnow(),
                    })

            except Exception as e:
                print("❌ parse_items error:", e)

        return payloads

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
                        session.add(models.VendorListing(
                            product_id=row["id"],
                            site_id=self.site_id,
                            site_category_id=self.category_slug,
                            price=row["price"],
                            affiliate_url=row["affiliate_url"],
                            image_url=row["image_url"],
                            scraped_at=row["scraped_at"],
                        ))
                    await session.commit()
                print(f"💾 Saved batch ({len(payloads)} items)")
                return
            except Exception as e:
                print(f"⚠️  Save failed (attempt {attempt}): {e}")
                if attempt == retries:
                    raise
                await asyncio.sleep(attempt)

    async def resolve_category_id(self, session):
        return await session.scalar(
            select(Category.id).where(Category.slug == self.category_slug)
        )

    async def run(self):
        async with async_playwright() as p:
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

            # 1) Navigate to the category’s base URL
            await self._retry(page.goto, self.selectors["url"], timeout=60000)

            pag = self.selectors.get("pagination", {})

            # — Infinite scroll support —
            if pag.get("type") == "infinite":
                prev_count = 0
                scroll_delay = pag.get("scroll_delay", 2.0)
                print("⏬ Starting infinite scroll…")
                while True:
                    await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
                    await asyncio.sleep(scroll_delay)
                    items = await page.query_selector_all(self.selectors["item"])
                    print(f"   → loaded {len(items)} items")
                    if len(items) <= prev_count:
                        print("🔚 No new items, done.")
                        break
                    prev_count = len(items)

                payloads = await self.parse_items(items)
                await self._save_with_retry(payloads)

            # — Paginated (query / path / next-button) —
            else:
                page_num = 1
                max_pages = pag.get("max_pages", None)

                while True:
                    # build the URL
                    if pag.get("type") == "query":
                        url = f"{self.selectors['url']}?{pag['param']}={page_num}"
                    elif pag.get("type") == "path":
                        url = self.selectors['url'].rstrip("/") + pag['template'].format(n=page_num)
                    else:
                        url = self.selectors["url"]

                    print(f"→ fetching: {url}")
                    await self._retry(page.goto, url, timeout=60000)
                    await self._retry(page.wait_for_selector, self.selectors["item"], timeout=30000)

                    items = await page.query_selector_all(self.selectors["item"])
                    if not items:
                        print("🔚 No items found, stopping.")
                        break

                    payloads = await self.parse_items(items)
                    await self._save_with_retry(payloads)

                    # if "next" pagination, click the button
                    if pag.get("type") == "next":
                        nxt = await page.query_selector(pag["next_selector"])
                        if not nxt:
                            print("🔚 No “Next” button, done.")
                            break
                        await nxt.click()
                        await asyncio.sleep(random.uniform(1, 3))
                    else:
                        page_num += 1
                        if max_pages and page_num > max_pages:
                            print("🔚 Reached max_pages, stopping.")
                            break
                        await asyncio.sleep(random.uniform(1, 3))

            await browser.close()
            print("✅ Browser closed")