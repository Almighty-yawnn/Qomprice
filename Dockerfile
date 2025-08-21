# Use Playwright's Python image with browsers preinstalled
FROM mcr.microsoft.com/playwright/python:v1.52.0-jammy

# Set workdir
WORKDIR /app

# System timezone etc. (optional)
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

# Only copy requirements first to leverage Docker layer caching
COPY requirements.txt .

# Install Python deps
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of your app
COPY . .

# Expose the Railway PORT
ENV PORT=8000

# Start FastAPI (Railway sets $PORT)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "$PORT"]














# # -------------------------------------------------------
# # Komprice unified image  (api + worker)
# # -------------------------------------------------------
#   FROM python:3.12-slim AS base

#   # 1️⃣  OS libs that Playwright/Chromium need
#   RUN apt-get update && \
#       apt-get install -y --no-install-recommends \
#           libglib2.0-0 libnss3 libnspr4 \
#           libatk1.0-0 libatk-bridge2.0-0 libatspi2.0-0 \
#           libdbus-1-3 libcups2 libexpat1 \
#           libx11-6 libxcomposite1 libxdamage1 libxext6 libxfixes3 libxrandr2 \
#           libx11-xcb1 libxcb1 libxkbcommon0 libgbm1 \
#           libpango-1.0-0 libcairo2 libasound2 \
#           libgtk-3-0 libdrm2 fonts-liberation xdg-utils \
#       && rm -rf /var/lib/apt/lists/*
  
#   # 2️⃣  Python deps
#   WORKDIR /app
#   ENV PYTHONPATH=/app
#   COPY requirements.txt .
#   RUN pip install --no-cache-dir -r requirements.txt
  
#   # 3️⃣  Playwright browsers (cached layer)
#   RUN playwright install --with-deps chromium
  
#   # 4️⃣  Project code
#   COPY . .
  
#   # 5️⃣  Default entrypoint — overridden by worker in docker-compose.yml
#   CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
  





# # FROM python:3.12-slim
# # WORKDIR /app
# # COPY requirements.txt .
# # RUN pip install -r requirements.txt
# # #RUN playwright install --with-deps chromium
# # COPY . .               
# # CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]





# # FROM python:3.12-slim
# # WORKDIR /app
# # COPY requirements.txt .
# # RUN pip install --no-cache-dir -r requirements.txt 
# # RUN playwright install --with-deps chromium
# # COPY . .
# # CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]



