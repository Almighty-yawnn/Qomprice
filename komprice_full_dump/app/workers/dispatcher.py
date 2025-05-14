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




import os, importlib, yaml
from pathlib import Path
import redis, rq

r = redis.Redis.from_url(os.getenv("REDIS_URL", "redis://redis:6379/0"))
queue = rq.Queue("scrapers", connection=r)

CONFIG = yaml.safe_load(Path("category_settings.yaml").read_text())

for job in CONFIG:
    site = job["site"]
    category = job["category"]
    mod = importlib.import_module(f"scrapers.{site.lower()}")
    klass = getattr(mod, f"{site.capitalize()}Scraper")
    queue.enqueue(klass(category).run)
