# workers/dispatcher.py
import os
import yaml
import importlib
from pathlib import Path
import redis, rq

from scrapers import dispatch_scraper

# set up Redis queue
r = redis.Redis.from_url(os.getenv("REDIS_URL", "redis://localhost:6379/0"))
q = rq.Queue("scrapers", connection=r)

# your list of jobs: site + category
CONFIG = yaml.safe_load(Path("category_settings.yaml").read_text())

BASE_DIR = Path(__file__).parent.parent  # <project_root>/

for job in CONFIG:
    site = job["site"]              # e.g. "jumia"
    slug = job["category"]          # e.g. "phones-tablets"

    # 1️⃣ load the selectors file for that site
    selectors_path = (
        BASE_DIR
        / "scrapers"
        / "selectors"
        / f"{site.lower()}.yaml"
    )
    site_cfg = yaml.safe_load(selectors_path.read_text())

    # 2️⃣ import the right scraper class
    mod = importlib.import_module(f"scrapers.{site.lower()}")
    ScraperClass = getattr(mod, f"{site.capitalize()}Scraper")

    # 3️⃣ enqueue one job per category, passing in the per-category cfg
    q.enqueue(
        dispatch_scraper,      # ← module‐level function
        site,
        slug,
        site_cfg[slug],
        #job_timeout=600         # optional: kill if it runs >10m
    )






# # /app/workers/dispatcher.py
# import yaml, importlib, os
# import redis, rq
# from pathlib import Path

# r = redis.Redis.from_url(os.getenv("REDIS_URL", "redis://..."))
# q = rq.Queue("scrapers", connection=r)

# SITE = "jumia"
# module = importlib.import_module(f"scrapers.{SITE}")
# ScraperClass = getattr(module, f"{SITE.capitalize()}Scraper")

# selectors = yaml.safe_load(Path("selectors/jumia.yaml").read_text())

# for slug, cfg in selectors.items():
#     # pass the cfg dict into the constructor
#     q.enqueue(ScraperClass, slug, cfg)













# import os
# import importlib
# import yaml
# from pathlib import Path
# import redis
# import rq
# import logging

# # Setup basic logging
# logging.basicConfig(level=logging.INFO)
# logger = logging.getLogger(__name__)

# # Setup Redis and RQ
# r = redis.Redis.from_url(os.getenv("REDIS_URL", "redis://redis:6379/0"))
# queue = rq.Queue("scrapers", connection=r)

# # Load job config
# CONFIG = yaml.safe_load(Path("category_settings.yaml").read_text())

# for job in CONFIG:
#     site = job.get("site")
#     category = job.get("category")

#     try:
#         mod = importlib.import_module(f"scrapers.{site.lower()}")
#         klass = getattr(mod, f"{site.capitalize()}Scraper")
#         queue.enqueue(klass(category).run)
#         logger.info(f"Enqueued {site} scraper for category: {category}")

#     except ModuleNotFoundError as e:
#         logger.error(f"Module not found for site '{site}': {e}")

#     except AttributeError as e:
#         logger.error(f"Class not found in module 'scrapers.{site.lower()}': {e}")

#     except Exception as e:
#         logger.error(f"Unexpected error for site '{site}': {e}")



#   Last working

# import os, importlib, yaml
# from pathlib import Path
# import redis, rq

# r = redis.Redis.from_url(os.getenv("REDIS_URL", "redis://redis:6379/0"))
# queue = rq.Queue("scrapers", connection=r)

# CONFIG = yaml.safe_load(Path("category_settings.yaml").read_text())

# for job in CONFIG:
#     site = job["site"]
#     category = job["category"]
#     mod = importlib.import_module(f"scrapers.{site.lower()}")
#     klass = getattr(mod, f"{site.capitalize()}Scraper")
#     queue.enqueue(klass(category).run)
