"""Configuration settings for BayesStack API."""

from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


API_DIRECTORY = Path(__file__).resolve().parents[2]
PROJECT_ROOT = API_DIRECTORY.parents[1] if len(API_DIRECTORY.parents) > 1 else API_DIRECTORY


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(API_DIRECTORY / ".env", PROJECT_ROOT / ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    PROJECT_NAME: str = "BayesStack API"
    VERSION: str = "0.1.0"
    BAYESSTACK_ENV: str = Field(default="development", validation_alias="BAYESSTACK_ENV")

    # Company & Brand Identity Settings
    COMPANY_NAME: str = Field(
        default="Ahsinam Technologies Private Limited",
        validation_alias="COMPANY_NAME",
        description="Registered legal company name",
    )
    COMPANY_LEGAL_NAME: str = Field(
        default="Ahsinam Technologies Private Limited",
        validation_alias="COMPANY_LEGAL_NAME",
        description="Full legal corporate entity name",
    )
    COMPANY_TRADE_NAME: str = Field(
        default="Ahsinam Technologies",
        validation_alias="COMPANY_TRADE_NAME",
        description="Company trade name",
    )
    COMPANY_CIN: str = Field(
        default="U85500MH2024PTC424430",
        validation_alias="COMPANY_CIN",
        description="Corporate Identification Number (CIN)",
    )
    COMPANY_ROC: str = Field(
        default="ROC Mumbai",
        validation_alias="COMPANY_ROC",
        description="Registrar of Companies",
    )
    COMPANY_INCORPORATION_DATE: str = Field(
        default="April 29, 2024",
        validation_alias="COMPANY_INCORPORATION_DATE",
        description="Incorporation date",
    )
    COMPANY_JURISDICTION: str = Field(
        default="India",
        validation_alias="COMPANY_JURISDICTION",
        description="Jurisdiction / Country",
    )
    COMPANY_REGISTERED_ADDRESS: str = Field(
        default="B.K.-1588, ROOM NO-5, SECTION 27, NEAR SATRAMDAS HOSPITAL, Ulhasnagar-4, Thane District, Maharashtra, India, 421004",
        validation_alias="COMPANY_REGISTERED_ADDRESS",
        description="Official registered office address",
    )
    COMPANY_DPO_ADDRESS: str = Field(
        default="Data Protection Office, Ahsinam Technologies Private Limited, B.K.-1588, ROOM NO-5, SECTION 27, NEAR SATRAMDAS HOSPITAL, Ulhasnagar-4, Thane District, Maharashtra, India, 421004",
        validation_alias="COMPANY_DPO_ADDRESS",
        description="Data Protection Office address",
    )
    PRODUCT_NAME: str = Field(
        default="BayesStack",
        validation_alias="PRODUCT_NAME",
        description="Primary platform and product name",
    )
    SUPPORT_EMAIL: str = Field(
        default="support@bayesstack.com",
        validation_alias="SUPPORT_EMAIL",
    )
    PRIVACY_EMAIL: str = Field(
        default="privacy@bayesstack.com",
        validation_alias="PRIVACY_EMAIL",
    )
    SECURITY_EMAIL: str = Field(
        default="security@bayesstack.com",
        validation_alias="SECURITY_EMAIL",
    )

    # Authentication session settings. The JWT and cookie use the same TTL
    # so returning users remain signed in until the session expires.
    SESSION_TTL_DAYS: int = Field(default=7, ge=1, le=30, validation_alias="SESSION_TTL_DAYS")
    SESSION_COOKIE_SECURE: bool | None = Field(default=None, validation_alias="SESSION_COOKIE_SECURE")
    JWT_SECRET_KEY: str = Field(
        default="bayesstack_dev_super_secret_jwt_key_2026",
        validation_alias="JWT_SECRET_KEY",
    )

    @property
    def session_cookie_secure(self) -> bool:
        """Use secure cookies in production while keeping local HTTP usable."""
        return self.SESSION_COOKIE_SECURE if self.SESSION_COOKIE_SECURE is not None else self.BAYESSTACK_ENV == "production"

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

    # Private Coding Studio judge boundary. The public UI only calls this API;
    # it never receives a Piston endpoint or execution-provider credentials.
    JUDGE_SERVICE_URL: str = Field(default="http://localhost:2358", validation_alias="JUDGE_SERVICE_URL")
    JUDGE_SERVICE_TIMEOUT_SECONDS: float = Field(default=45.0, validation_alias="JUDGE_SERVICE_TIMEOUT_SECONDS")
    JUDGE_SERVICE_TOKEN: str | None = Field(default=None, validation_alias="JUDGE_SERVICE_TOKEN")

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
