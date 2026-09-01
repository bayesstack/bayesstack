"""Pytest global configuration and environment setup for BayesStack API tests."""

import os
import pytest

# Ensure tests default to SQLite in-memory/file if DATABASE_URL is not set
if "DATABASE_URL" not in os.environ:
    os.environ["DATABASE_URL"] = "sqlite+aiosqlite:///./test_bayesstack.db"
