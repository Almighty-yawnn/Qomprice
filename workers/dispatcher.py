import os, yaml, importlib
from pathlib import Path
import redis, rq
from rq_scheduler import Scheduler

BASE_DIR = Path(__file__).parent.parent
CONFIG = yaml.safe_load((BASE_DIR / "category_settings.yaml").read_text())

redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
conn = redis.from_url(redis_url)
queue = rq.Queue("scrapers", connection=conn)
scheduler = Scheduler(queue=queue, connection=conn)

for job in CONFIG:
    site = job["site"]
    category = job["category"]
    cron_expr = job.get("cron", "0 0 * * *")

    selectors_path = BASE_DIR / "scrapers" / "selectors" / f"{site.lower()}.yaml"
    selectors_all = yaml.safe_load(selectors_path.read_text())
    if category not in selectors_all:
        raise ValueError(f"Category '{category}' not in selectors for {site}")
    selectors = selectors_all[category]

    scheduler.cron(
        cron_expr,
        func="scrapers.dispatch_scraper:dispatch_scraper",
        args=[site, category, selectors],
        id=f"{site}.{category}",
        queue_name="scrapers"
    )

print("✔ Scheduled all scraper jobs.")




















# # workers/dispatcher.py
# import os
# import yaml
# import importlib
# from pathlib import Path
# import redis, rq

# from scrapers import dispatch_scraper

# # set up Redis queue
# r = redis.Redis.from_url(os.getenv("REDIS_URL", "redis://localhost:6379/0"))
# q = rq.Queue("scrapers", connection=r)

# # your list of jobs: site + category
# CONFIG = yaml.safe_load(Path("category_settings.yaml").read_text())

# BASE_DIR = Path(__file__).parent.parent  # <project_root>/

# for job in CONFIG:
#     site = job["site"]              # e.g. "jumia"
#     slug = job["category"]          # e.g. "phones-tablets"

#     # 1️⃣ load the selectors file for that site
#     selectors_path = (
#         BASE_DIR
#         / "scrapers"
#         / "selectors"
#         / f"{site.lower()}.yaml"
#     )
#     site_cfg = yaml.safe_load(selectors_path.read_text())

#     # 2️⃣ import the right scraper class
#     mod = importlib.import_module(f"scrapers.{site.lower()}")
#     ScraperClass = getattr(mod, f"{site.capitalize()}Scraper")

#     # 3️⃣ enqueue one job per category, passing in the per-category cfg
#     q.enqueue(
#         dispatch_scraper,      # ← module‐level function
#         site,
#         slug,
#         site_cfg[slug],
#         #job_timeout=600         # optional: kill if it runs >10m
#     )




