"""Default comparator: line endings and insignificant whitespace do not matter."""


class WhitespaceInsensitiveComparator:
    def matches(self, actual: str, expected: str) -> bool:
        return actual.split() == expected.split()
