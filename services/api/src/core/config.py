"""Configuration settings for BayesStack API."""

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(".env", "services/api/.env", "../.env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    PROJECT_NAME: str = "BayesStack API"
    VERSION: str = "0.1.0"
    BAYESSTACK_ENV: str = Field(default="development", validation_alias="BAYESSTACK_ENV")

    # Multi-tenant domain settings
    BASE_DOMAINS: str = Field(
        default="localhost,bayesstack.com",
        validation_alias="BASE_DOMAINS",
        description="Comma-separated base domains used for tenant subdomain extraction",
    )

    # PostgreSQL configuration
    POSTGRES_USER: str = Field(default="bayesstack", validation_alias="POSTGRES_USER")
    POSTGRES_PASSWORD: str = Field(default="bayesstack_dev", validation_alias="POSTGRES_PASSWORD")
    POSTGRES_HOST: str = Field(default="localhost", validation_alias="POSTGRES_HOST")
    POSTGRES_PORT: int = Field(default=5432, validation_alias="POSTGRES_PORT")
    POSTGRES_DB: str = Field(default="bayesstack", validation_alias="POSTGRES_DB")

    DATABASE_URL: str | None = Field(default=None, validation_alias="DATABASE_URL")

    @property
    def parsed_base_domains(self) -> list[str]:
        """Return a clean list of allowed base domains for tenant resolution."""
        domains = [d.strip().lower() for d in self.BASE_DOMAINS.split(",") if d.strip()]
        return domains if domains else ["localhost", "bayesstack.com"]

    @property
    def async_database_url(self) -> str:
        """Return a SQLAlchemy-compatible async PostgreSQL or SQLite URL."""
        if self.BAYESSTACK_ENV == "testing":
            return "sqlite+aiosqlite:///:memory:"

        if self.DATABASE_URL:
            url = self.DATABASE_URL
            if url.startswith("postgresql://"):
                url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
            elif url.startswith("postgres://"):
                url = url.replace("postgres://", "postgresql+asyncpg://", 1)
            return url

        return (
            f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
            f"@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        )


settings = Settings()
