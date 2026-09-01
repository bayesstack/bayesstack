"""Security and password hashing utilities for BayesStack API."""

import hashlib
import hmac
import os


def hash_password(password: str) -> str:
    """Hash a password using PBKDF2-HMAC-SHA256."""
    salt = os.urandom(16)
    key = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 100_000)
    return f"{salt.hex()}${key.hex()}"


def verify_password(password: str, hashed_password: str) -> bool:
    """Verify a plain text password against a stored hash."""
    try:
        if "$" not in hashed_password:
            return False
        salt_hex, key_hex = hashed_password.split("$", 1)
        salt = bytes.fromhex(salt_hex)
        expected_key = bytes.fromhex(key_hex)
        computed_key = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 100_000)
        return hmac.compare_digest(expected_key, computed_key)
    except Exception:
        return False
