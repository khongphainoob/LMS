# -*- coding: utf-8 -*-
"""
Base Service Module for LMS Services

Provides common CRUD operations, caching, and utility methods
that can be used across all service implementations.
"""

from typing import Optional, List, Dict, Any
import frappe
from functools import wraps
import json
from datetime import timedelta


class BaseService:
    """Base service with common operations for all services."""

    def __init__(self, doctype: str):
        """
        Initialize service with a DocType.

        Args:
            doctype: Frappe DocType name this service manages
        """
        self.doctype = doctype
        self.cache_prefix = f"lms:{doctype.lower().replace(' ', '_')}"

    def get(self, name: str, fields: Optional[List[str]] = None, use_cache: bool = True) -> Dict[str, Any]:
        """
        Get a document by name with optional caching.

        Args:
            name: Document name
            fields: Specific fields to retrieve (None = all fields)
            use_cache: Whether to use caching

        Returns:
            Document as dictionary
        """
        if use_cache:
            cache_key = f"{self.cache_prefix}:{name}"
            cached = frappe.cache().get_value(cache_key)
            if cached:
                return cached

        if fields:
            doc = frappe.get_doc(self.doctype, name)
            result = doc.as_dict(include=fields)
        else:
            result = frappe.get_doc(self.doctype, name).as_dict()

        # Cache for 5 minutes
        if use_cache:
            frappe.cache().set_value(cache_key, result, expires_in_sec=300)

        return result

    def get_list(
        self,
        filters: Optional[Dict] = None,
        fields: Optional[List[str]] = None,
        limit: int = 20,
        start: int = 0,
        order_by: str = "creation desc",
        as_dict: bool = True
    ) -> List[Dict[str, Any]]:
        """
        Get list of documents.

        Args:
            filters: Filter conditions
            fields: Specific fields to retrieve
            limit: Maximum number of results
            start: Starting offset
            order_by: Sort order
            as_dict: Return as list of dicts

        Returns:
            List of documents
        """
        return frappe.get_all(
            self.doctype,
            filters=filters,
            fields=fields,
            limit=limit,
            start=start,
            order_by=order_by
        )

    def get_single(self, field: Optional[str] = None) -> Any:
        """
        Get value from single DocType.

        Args:
            field: Specific field to get

        Returns:
            Field value or full document if field is None
        """
        if field:
            return frappe.db.get_single_value(self.doctype, field)
        return frappe.get_single(self.doctype).as_dict()

    def create(self, data: Dict[str, Any], ignore_permissions: bool = False) -> str:
        """
        Create a new document.

        Args:
            data: Document data
            ignore_permissions: Skip permission checks

        Returns:
            New document name
        """
        doc = frappe.new_doc(self.doctype)
        doc.update(data)
        doc.insert(ignore_permissions=ignore_permissions)
        return doc.name

    def update(self, name: str, data: Dict[str, Any], ignore_permissions: bool = False) -> str:
        """
        Update a document.

        Args:
            name: Document name
            data: Data to update
            ignore_permissions: Skip permission checks

        Returns:
            Updated document name
        """
        doc = frappe.get_doc(self.doctype, name)
        doc.update(data)
        doc.save(ignore_permissions=ignore_permissions)

        # Invalidate cache
        self._clear_cache(name)

        return doc.name

    def delete(self, name: str, ignore_permissions: bool = False) -> bool:
        """
        Delete a document.

        Args:
            name: Document name
            ignore_permissions: Skip permission checks

        Returns:
            True if successful
        """
        frappe.delete_doc(self.doctype, name, ignore_permissions=ignore_permissions)

        # Invalidate cache
        self._clear_cache(name)

        return True

    def exists(self, name: str) -> bool:
        """Check if document exists."""
        return frappe.db.exists(self.doctype, name)

    def count(self, filters: Optional[Dict] = None) -> int:
        """
        Count documents matching filters.

        Args:
            filters: Filter conditions

        Returns:
            Number of matching documents
        """
        return frappe.db.count(self.doctype, filters=filters)

    def get_value(self, name: str, field: str, default: Any = None) -> Any:
        """
        Get a single field value from a document.

        Args:
            name: Document name
            field: Field name
            default: Default value if not found

        Returns:
            Field value or default
        """
        value = frappe.db.get_value(self.doctype, name, field)
        return value if value is not None else default

    def set_value(self, name: str, field: str, value: Any, commit: bool = True) -> bool:
        """
        Set a single field value on a document.

        Args:
            name: Document name
            field: Field name
            value: Value to set
            commit: Commit immediately

        Returns:
            True if successful
        """
        frappe.db.set_value(self.doctype, name, field, value, commit=commit)
        self._clear_cache(name)
        return True

    def _clear_cache(self, name: str):
        """Clear cache for a specific document."""
        cache_key = f"{self.cache_prefix}:{name}"
        frappe.cache().delete_value(cache_key)

    @staticmethod
    def clear_cache_pattern(pattern: str):
        """
        Clear all cache entries matching a pattern.

        Note: This requires raw Redis client for pattern matching.
        """
        try:
            redis_conn = frappe.cache().redis_conn
            for key in redis_conn.scan_iter(match=pattern):
                redis_conn.delete(key)
        except Exception as e:
            frappe.logger("lms").warning(f"Failed to clear cache pattern {pattern}: {e}")


def cache_result(ttl: int = 300, cache_key_func: callable = None):
    """
    Decorator to cache service method results.

    Args:
        ttl: Cache time-to-live in seconds
        cache_key_func: Custom function to generate cache key.
                         If not provided, generates from function name and args.

    Example:
        @cache_result(ttl=600)
        def get_rubric(self, rubric_id):
            return self._fetch_from_db(rubric_id)
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Generate cache key
            if cache_key_func:
                cache_key = cache_key_func(*args, **kwargs)
            else:
                # Default key generation: function_name:args_hash
                args_str = f"{args}_{kwargs}"
                import hashlib
                args_hash = hashlib.md5(args_str.encode()).hexdigest()[:12]
                cache_key = f"{func.__name__}:{args_hash}"

            # Try to get from cache
            cached = frappe.cache().get_value(cache_key)
            if cached:
                return cached

            # Execute function
            result = func(*args, **kwargs)

            # Cache result
            frappe.cache().set_value(cache_key, result, expires_in_sec=ttl)

            return result
        return wrapper
    return decorator


def handle_service_errors(default_return=None, log_error=True):
    """
    Decorator to handle common service errors gracefully.

    Args:
        default_return: Value to return on error
        log_error: Whether to log the error

    Example:
        @handle_service_errors(default_return=[], log_error=True)
        def get_submissions(self, session_id):
            return frappe.get_all(...)
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            try:
                return func(*args, **kwargs)
            except frappe.DoesNotExistError as e:
                if log_error:
                    frappe.logger("lms").warning(f"Document not found in {func.__name__}: {e}")
                return default_return
            except frappe.ValidationError as e:
                if log_error:
                    frappe.logger("lms").warning(f"Validation error in {func.__name__}: {e}")
                return default_return
            except Exception as e:
                if log_error:
                    frappe.logger("lms").error(f"Error in {func.__name__}: {e}")
                return default_return
        return wrapper
    return decorator
