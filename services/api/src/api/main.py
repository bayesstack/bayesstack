"""Single FastAPI server for the BayesStack modular monolith."""

from fastapi import FastAPI

app = FastAPI(title="BayesStack API", version="0.1.0")


@app.get("/health")
def health():
    return {"service": "api", "status": "ok"}
