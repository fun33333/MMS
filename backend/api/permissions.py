from rest_framework import permissions

class IsStaffUser(permissions.BasePermission):
    """
    PRODUCTION: Allocates Read-Only access to Staff users.
    Allocates Write access to Admin users.
    """
    def has_permission(self, request, view):
        if request.user.is_superuser:
            return True
        if request.user.is_staff:
            return request.method in permissions.SAFE_METHODS
        return False


class AllowAnyForDevelopment(permissions.BasePermission):
    """
    DEVELOPMENT ONLY: Allow all operations without authentication.
    TODO: Replace with IsStaffUser in Phase 8 (Authentication).
    """
    def has_permission(self, request, view):
        return True  # Allow everything during development
