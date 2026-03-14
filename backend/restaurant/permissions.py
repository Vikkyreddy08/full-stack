from rest_framework import permissions

class IsAdmin(permissions.BasePermission):
    """
    Allows access only to admin users.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'admin')

class IsEmployee(permissions.BasePermission):
    """
    Allows access only to employee users.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'employee')

class IsAdminOrEmployee(permissions.BasePermission):
    """
    Allows access to admin or employee users.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and (request.user.role == 'admin' or request.user.role == 'employee'))

class IsOwnerOrAdminOrEmployee(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object, admins, or employees to edit it.
    """
    def has_object_permission(self, request, view, obj):
        # Admin and Employee can see/edit everything
        if request.user.role in ['admin', 'employee']:
            return True
        # Users can only see/edit their own orders
        return obj.user == request.user
