# run_worker.py
from redis import Redis 
from rq.worker import SimpleWorker

if __name__ == "__main__":
    conn = Redis.from_url("redis://localhost:6379/0")
    worker = SimpleWorker(["scrapers"], connection=conn)
    worker.work()
