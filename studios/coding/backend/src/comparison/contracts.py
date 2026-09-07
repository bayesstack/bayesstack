from typing import Protocol


class OutputComparator(Protocol):
    def matches(self, actual: str, expected: str) -> bool: ...
