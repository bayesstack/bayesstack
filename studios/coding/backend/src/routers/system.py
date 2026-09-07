from fastapi import APIRouter

from config import settings
from languages import supported_languages
from schemas import LanguagePayload

router = APIRouter(tags=["Coding Judge"])


@router.get("/health")
async def get_health() -> dict[str, str]:
    return {"status": "healthy", "service": settings.SERVICE_NAME, "provider": settings.EXECUTION_PROVIDER}


@router.get("/api/v1/languages", response_model=list[LanguagePayload])
async def get_languages() -> list[LanguagePayload]:
    return [LanguagePayload(id=item.id, display_name=item.display_name) for item in supported_languages().values()]
