from decimal import Decimal
from django.test import TestCase
from rest_framework.test import APIClient
from users.models import User
from stations.models import Station


class AdminUserGovernanceTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_user(
            username="admin1",
            email="admin1@example.com",
            password="Password123!",
            role="ADMIN"
        )
        self.user = User.objects.create_user(
            username="driver1",
            email="driver1@example.com",
            password="Password123!",
            role="USER"
        )
        self.operator_unassigned = User.objects.create_user(
            username="op_free",
            email="op_free@example.com",
            password="Password123!",
            role="OPERATOR"
        )
        self.operator_assigned = User.objects.create_user(
            username="op_assigned",
            email="op_assigned@example.com",
            password="Password123!",
            role="OPERATOR"
        )

        self.station = Station.objects.create(
            station_name="Station 1",
            operator=self.operator_assigned,
            address="123 Road",
            city="Ahmedabad",
            state="Gujarat",
            pincode="380001",
            opening_time="06:00:00",
            closing_time="23:00:00",
            contact_number="9876543210",
            email="st1@example.com",
            latitude=Decimal("23.0000000"),
            longitude=Decimal("72.5000000")
        )

    def test_user_cannot_access_admin_user_list(self):
        self.client.force_authenticate(user=self.user)
        res = self.client.get("/api/auth/admin/users/")
        self.assertEqual(res.status_code, 403)

    def test_operator_cannot_access_admin_user_list(self):
        self.client.force_authenticate(user=self.operator_unassigned)
        res = self.client.get("/api/auth/admin/users/")
        self.assertEqual(res.status_code, 403)

    def test_admin_can_list_users_and_filter(self):
        self.client.force_authenticate(user=self.admin)
        res = self.client.get("/api/auth/admin/users/?role=OPERATOR")
        self.assertEqual(res.status_code, 200)
        items = res.data["results"] if isinstance(res.data, dict) and "results" in res.data else res.data
        self.assertEqual(len(items), 2)

    def test_admin_can_block_and_unblock_user(self):
        self.client.force_authenticate(user=self.admin)
        res_block = self.client.post(f"/api/auth/admin/users/{self.user.id}/block/")
        self.assertEqual(res_block.status_code, 200)
        self.user.refresh_from_db()
        self.assertFalse(self.user.is_active)

        res_unblock = self.client.post(f"/api/auth/admin/users/{self.user.id}/unblock/")
        self.assertEqual(res_unblock.status_code, 200)
        self.user.refresh_from_db()
        self.assertTrue(self.user.is_active)

    def test_admin_cannot_block_self(self):
        self.client.force_authenticate(user=self.admin)
        res = self.client.post(f"/api/auth/admin/users/{self.admin.id}/block/")
        self.assertEqual(res.status_code, 400)

    def test_convert_user_to_operator(self):
        self.client.force_authenticate(user=self.admin)
        res = self.client.post(f"/api/auth/admin/users/{self.user.id}/change-role/", {"role": "OPERATOR"}, format="json")
        self.assertEqual(res.status_code, 200)
        self.user.refresh_from_db()
        self.assertEqual(self.user.role, "OPERATOR")

    def test_convert_unassigned_operator_to_user(self):
        self.client.force_authenticate(user=self.admin)
        res = self.client.post(f"/api/auth/admin/users/{self.operator_unassigned.id}/change-role/", {"role": "USER"}, format="json")
        self.assertEqual(res.status_code, 200)
        self.operator_unassigned.refresh_from_db()
        self.assertEqual(self.operator_unassigned.role, "USER")

    def test_cannot_convert_assigned_operator_to_user(self):
        self.client.force_authenticate(user=self.admin)
        res = self.client.post(f"/api/auth/admin/users/{self.operator_assigned.id}/change-role/", {"role": "USER"}, format="json")
        self.assertEqual(res.status_code, 400)
        self.operator_assigned.refresh_from_db()
        self.assertEqual(self.operator_assigned.role, "OPERATOR")

    def test_forbidden_field_patch_rejected(self):
        self.client.force_authenticate(user=self.admin)
        res = self.client.patch(f"/api/auth/admin/users/{self.user.id}/", {"is_superuser": True}, format="json")
        self.assertEqual(res.status_code, 400)
        self.user.refresh_from_db()
        self.assertFalse(self.user.is_superuser)
