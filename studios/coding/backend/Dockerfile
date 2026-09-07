FROM python:3.12-slim

# This service never compiles or executes submitted code. Piston owns that
# isolated boundary, so compiler toolchains do not belong in this image.
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY pyproject.toml .
RUN pip install --no-cache-dir fastapi uvicorn[standard] pydantic pydantic-settings httpx

COPY src /app/src

EXPOSE 2358

CMD ["uvicorn", "main:app", "--app-dir", "src", "--host", "0.0.0.0", "--port", "2358", "--reload"]
