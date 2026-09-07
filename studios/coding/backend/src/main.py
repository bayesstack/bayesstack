"""FastAPI entrypoint for BayesStack's provider-agnostic coding judge."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from routers.system import router as system_router
from routers.evaluate import router as evaluate_router

app = FastAPI(
    title="BayesStack Coding Judge",
    description="Provider-agnostic execution orchestration. Untrusted code is delegated to Piston.",
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(system_router)
app.include_router(evaluate_router)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=settings.HOST, port=settings.PORT, reload=True)
