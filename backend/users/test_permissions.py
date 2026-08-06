from django.test import TestCase
from rest_framework.test import APIClient
from users.models import User


class UserPermissionsTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="driver1",
            email="driver1@example.com",
            password="Password123!",
            role="USER"
        )
        self.operator = User.objects.create_user(
            username="operator1",
            email="operator1@example.com",
            password="Password123!",
            role="OPERATOR"
        )
        self.admin = User.objects.create_user(
            username="admin1",
            email="admin1@example.com",
            password="Password123!",
            role="ADMIN"
        )

    def test_unauthenticated_access_blocked(self):
        res = self.client.get("/api/auth/profile/")
        self.assertEqual(res.status_code, 401)

    def test_user_profile_fetch(self):
        self.client.force_authenticate(user=self.user)
        res = self.client.get("/api/auth/profile/")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data["username"], "driver1")
        self.assertEqual(res.data["role"], "USER")

    def test_profile_role_tampering_blocked(self):
        self.client.force_authenticate(user=self.user)
        res = self.client.patch("/api/auth/profile/", {"role": "ADMIN", "is_superuser": True}, format="json")
        self.assertEqual(res.status_code, 200)
        self.user.refresh_from_db()
        self.assertEqual(self.user.role, "USER")
        self.assertFalse(self.user.is_superuser)
