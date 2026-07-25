from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.role == "ADMIN"
        )


class IsOperator(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.role == "OPERATOR"
        )


class IsUser(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.role == "USER"
        )


class IsOperatorOrAdmin(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.role in ["ADMIN", "OPERATOR"]
        )


# Alias for backward compatibility
IsAdminOrOperator = IsOperatorOrAdmin


class IsAdminOrOwner(BasePermission):
    def has_object_permission(self, request, view, obj):
        return (
            request.user and
            request.user.is_authenticated and
            (
                request.user.role == "ADMIN" or
                getattr(obj, "user", None) == request.user
            )
        )


class IsAdminOrOperatorOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return request.user and request.user.is_authenticated
        return (
            request.user and
            request.user.is_authenticated and
            request.user.role in ["ADMIN", "OPERATOR"]
        )


class CanManageStation(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return request.user and request.user.is_authenticated
        if request.method == "POST":
            # Only ADMIN can create stations
            return request.user and request.user.is_authenticated and request.user.role == "ADMIN"
        return request.user and request.user.is_authenticated and request.user.role in ["ADMIN", "OPERATOR"]

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        if request.user.role == "ADMIN":
            return True
        if request.user.role == "OPERATOR":
            return obj.operator == request.user
        return False


class CanManageCharger(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return request.user and request.user.is_authenticated
        return request.user and request.user.is_authenticated and request.user.role in ["ADMIN", "OPERATOR"]

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        if request.user.role == "ADMIN":
            return True
        if request.user.role == "OPERATOR":
            return obj.station.operator == request.user
        return False