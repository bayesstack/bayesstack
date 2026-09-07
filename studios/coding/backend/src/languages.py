"""The product language allowlist, independent of a provider's runtime catalog."""

from dataclasses import dataclass

from config import settings


@dataclass(frozen=True, slots=True)
class SupportedLanguage:
    id: str
    display_name: str
    piston_runtime: str


def supported_languages() -> dict[str, SupportedLanguage]:
    return {
        "python": SupportedLanguage("python", "Python", settings.PISTON_RUNTIME_PYTHON),
        "cpp": SupportedLanguage("cpp", "C++", settings.PISTON_RUNTIME_CPP),
        "javascript": SupportedLanguage("javascript", "JavaScript", settings.PISTON_RUNTIME_JAVASCRIPT),
    }


def get_language(language_id: str) -> SupportedLanguage:
    language = supported_languages().get(language_id.strip().lower())
    if not language:
        raise ValueError("Unsupported language.")
    return language
