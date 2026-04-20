# -*- coding: utf-8 -*-
"""
LMS Services Module

This module contains business logic services for the LMS application.
Services provide a clean separation between API layers and data access,
with built-in caching, error handling, and common CRUD operations.
"""

from .base_service import BaseService, cache_result, handle_service_errors

__all__ = [
    "BaseService",
    "cache_result",
    "handle_service_errors",
]
