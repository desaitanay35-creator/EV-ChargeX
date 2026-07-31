from django.test import TestCase
from rest_framework.test import APIClient
from users.models import User
from django.conf import settings


class AuthenticationRegressionTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.password = "Password123!"

        self.user = User.objects.create_user(
            username="test_driver",
            email="driver@example.com",
            password=self.password,
            role="USER",
            is_active=True
        )
        self.operator = User.objects.create_user(
            username="test_operator",
            email="operator@example.com",
            password=self.password,
            role="OPERATOR",
            is_active=True
        )
        self.admin = User.objects.create_superuser(
            username="test_admin",
            email="admin@example.com",
            password=self.password,
            role="ADMIN",
            is_active=True
        )
        self.inactive_user = User.objects.create_user(
            username="inactive_driver",
            email="inactive@example.com",
            password=self.password,
            role="USER",
            is_active=False
        )

    def test_01_user_credentials_authenticate(self):
        # Authenticate via username
        res = self.client.post("/api/auth/login/", {"username": "test_driver", "password": self.password}, format="json")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data.get("role"), "USER")
        self.assertIn("access", res.data)
        self.assertIn("refresh", res.data)

        # Authenticate via email
        res_email = self.client.post("/api/auth/login/", {"username": "driver@example.com", "password": self.password}, format="json")
        self.assertEqual(res_email.status_code, 200)
        self.assertEqual(res_email.data.get("role"), "USER")

    def test_02_operator_credentials_authenticate(self):
        res = self.client.post("/api/auth/login/", {"username": "test_operator", "password": self.password}, format="json")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data.get("role"), "OPERATOR")

        res_email = self.client.post("/api/auth/login/", {"username": "operator@example.com", "password": self.password}, format="json")
        self.assertEqual(res_email.status_code, 200)
        self.assertEqual(res_email.data.get("role"), "OPERATOR")

    def test_03_admin_credentials_authenticate(self):
        res = self.client.post("/api/auth/login/", {"username": "test_admin", "password": self.password}, format="json")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data.get("role"), "ADMIN")

        res_email = self.client.post("/api/auth/login/", {"username": "admin@example.com", "password": self.password}, format="json")
        self.assertEqual(res_email.status_code, 200)
        self.assertEqual(res_email.data.get("role"), "ADMIN")

    def test_04_incorrect_password_returns_401(self):
        res = self.client.post("/api/auth/login/", {"username": "test_driver", "password": "WrongPassword123!"}, format="json")
        self.assertEqual(res.status_code, 401)

    def test_05_unknown_account_returns_401(self):
        res = self.client.post("/api/auth/login/", {"username": "nonexistent_user", "password": self.password}, format="json")
        self.assertEqual(res.status_code, 401)

    def test_06_missing_username_returns_400(self):
        res = self.client.post("/api/auth/login/", {"password": self.password}, format="json")
        self.assertEqual(res.status_code, 400)

    def test_07_missing_password_returns_400(self):
        res = self.client.post("/api/auth/login/", {"username": "test_driver"}, format="json")
        self.assertEqual(res.status_code, 400)

    def test_08_inactive_account_rejected(self):
        res = self.client.post("/api/auth/login/", {"username": "inactive_driver", "password": self.password}, format="json")
        self.assertIn(res.status_code, [401, 403])

    def test_09_jwt_tokens_returned(self):
        res = self.client.post("/api/auth/login/", {"username": "test_driver", "password": self.password}, format="json")
        self.assertEqual(res.status_code, 200)
        self.assertTrue(len(res.data.get("access", "")) > 10)
        self.assertTrue(len(res.data.get("refresh", "")) > 10)

    def test_10_token_identifies_user(self):
        res = self.client.post("/api/auth/login/", {"username": "test_driver", "password": self.password}, format="json")
        self.assertEqual(res.status_code, 200)
        user_info = res.data.get("user", {})
        self.assertEqual(user_info.get("username"), "test_driver")
        self.assertEqual(user_info.get("email"), "driver@example.com")

    def test_11_role_remains_correct(self):
        res = self.client.post("/api/auth/login/", {"username": "test_operator", "password": self.password}, format="json")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data.get("role"), "OPERATOR")

    def test_12_password_remains_hashed(self):
        u = User.objects.get(username="test_driver")
        self.assertTrue(u.password.startswith("pbkdf2_sha256$"))
        self.assertTrue(u.has_usable_password())

    def test_13_expected_database_in_use(self):
        engine = settings.DATABASES["default"]["ENGINE"]
        self.assertIn("mysql", engine)

    def test_14_ocm_migrations_do_not_alter_users(self):
        self.assertTrue(hasattr(User, "role"))
        self.assertTrue(hasattr(User, "is_active"))
        self.assertEqual(User._meta.db_table, "users_user")
