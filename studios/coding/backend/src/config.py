"""Configuration for the Coding Studio judge boundary.

The service deliberately defaults to the deterministic mock provider. A local
developer should never need a compiler or Piston just to work on the platform.
"""

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(case_sensitive=True, extra="ignore")

    SERVICE_NAME: str = "BayesStack Coding Judge"
    VERSION: str = "2.0.0"
    ENVIRONMENT: str = "development"
    PORT: int = 2358
    HOST: str = "0.0.0.0"
    CORS_ORIGINS: list[str] = ["http://localhost:3005", "http://localhost:8000"]

    # Provider selection is intentionally explicit; Piston is never inferred
    # from a reachable URL because that makes a local boot execute hostile code.
    EXECUTION_PROVIDER: str = "mock"
    PISTON_BASE_URL: str = "http://piston:2000"
    PISTON_HTTP_TIMEOUT_SECONDS: float = Field(default=20.0, ge=1.0, le=60.0)
    PISTON_RUNTIME_PYTHON: str = "3.10.0"
    PISTON_RUNTIME_CPP: str = "10.2.0"
    PISTON_RUNTIME_JAVASCRIPT: str = "18.15.0"
    JUDGE_SERVICE_TOKEN: str | None = None

    MAX_SOURCE_SIZE_BYTES: int = Field(default=128 * 1024, ge=1024)
    MAX_STDIN_SIZE_BYTES: int = Field(default=64 * 1024, ge=1024)
    MAX_TEST_CASE_SIZE_BYTES: int = Field(default=64 * 1024, ge=1024)
    MAX_TEST_CASES: int = Field(default=100, ge=1, le=1_000)
    MAX_TIME_LIMIT_MS: int = Field(default=15_000, ge=100)
    MAX_MEMORY_LIMIT_MB: int = Field(default=1_024, ge=16)
    MAX_OUTPUT_SIZE_BYTES: int = Field(default=1_048_576, ge=1_024)
    MAX_PROVIDER_RESPONSE_BYTES: int = Field(default=1_179_648, ge=65_536)


settings = Settings()
