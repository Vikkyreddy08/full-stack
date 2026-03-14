import logging
import functools
import json
from django.http import JsonResponse
from django.utils import timezone
from rest_framework import status

logger = logging.getLogger(__name__)

def log_request(view_func):
    """
    Enhanced Middleware-style decorator to log request details.
    Compatible with FBVs, CBVs, and method_decorator.
    """
    @functools.wraps(view_func)
    def wrapper(*args, **kwargs):
        # Identify the request object
        # args[0] is request (FBV) or self (CBV method) or request (method_decorator)
        request = None
        for arg in args:
            if hasattr(arg, 'user') and hasattr(arg, 'path'):
                request = arg
                break
        
        if not request:
            # Fallback for unexpected signatures
            return view_func(*args, **kwargs)
        
        user = request.user if request.user.is_authenticated else "Anonymous"
        timestamp = timezone.now().strftime("%Y-%m-%d %H:%M:%S")
        
        # Capture body (excluding sensitive data)
        body = {}
        if hasattr(request, 'data'):
            body = request.data
        elif hasattr(request, 'body') and request.body:
            try:
                body = json.loads(request.body)
            except:
                body = "Un-parseable body"

        # Mask sensitive fields
        if isinstance(body, dict):
            body = body.copy()
            for key in ['password', 'card_number', 'cvv', 'refresh']:
                if key in body:
                    body[key] = "********"

        logger.info(
            f"[{timestamp}] | User: {user} | Path: {request.path} | Method: {request.method} | Body: {body}"
        )
        return view_func(*args, **kwargs)
    return wrapper

def require_role(allowed_roles):
    """
    Decorator to restrict access based on user roles.
    Compatible with FBVs, CBVs, and method_decorator.
    """
    def decorator(view_func):
        @functools.wraps(view_func)
        def wrapper(*args, **kwargs):
            # Identify the request object
            request = None
            for arg in args:
                if hasattr(arg, 'user') and hasattr(arg, 'path'):
                    request = arg
                    break

            if not request or not request.user.is_authenticated:
                return JsonResponse(
                    {"status": "error", "message": "Authentication required"}, 
                    status=status.HTTP_401_UNAUTHORIZED
                )
            
            # Allow superusers always
            if request.user.is_superuser:
                return view_func(*args, **kwargs)

            # Check custom role field
            user_role = getattr(request.user, 'role', None)
            if user_role not in allowed_roles:
                logger.warning(f"Access denied for user {request.user} with role {user_role}")
                return JsonResponse(
                    {"status": "error", "message": f"Access denied. Required roles: {allowed_roles}"}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            
            return view_func(*args, **kwargs)
        return wrapper
    return decorator

# Specific shortcuts
admin_only = require_role(['admin'])
staff_only = require_role(['admin', 'employee'])
