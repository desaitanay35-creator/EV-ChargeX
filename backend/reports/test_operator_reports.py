from decimal import Decimal
from django.test import TestCase
from rest_framework.test import APIClient
from users.models import User
from stations.models import Station


class OperatorReportsSecurityTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="driver1",
            email="driver1@example.com",
            password="Password123!",
            role="USER"
        )
        self.op_a = User.objects.create_user(
            username="operatorA",
            email="op_a@example.com",
            password="Password123!",
            role="OPERATOR"
        )
        self.unassigned_op = User.objects.create_user(
            username="operatorUnassigned",
            email="op_u@example.com",
            password="Password123!",
            role="OPERATOR"
        )

        self.station_a = Station.objects.create(
            station_name="Station A",
            operator=self.op_a,
            address="123 Street A",
            city="Ahmedabad",
            state="Gujarat",
            pincode="380001",
            opening_time="06:00:00",
            closing_time="23:00:00",
            contact_number="9876543210",
            email="stationa@example.com",
            latitude=23.0,
            longitude=72.5
        )

    def test_unassigned_operator_receives_zero_summary(self):
        self.client.force_authenticate(user=self.unassigned_op)
        res = self.client.get("/api/reports/operator-dashboard/?range=30d")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data["summary"]["assigned_stations"], 0)
        self.assertEqual(res.data["summary"]["successful_revenue"], "0.00")

    def test_assigned_operator_report_access(self):
        self.client.force_authenticate(user=self.op_a)
        res = self.client.get("/api/reports/operator-dashboard/?range=30d")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data["summary"]["assigned_stations"], 1)

    def test_driver_user_cannot_access_operator_reports(self):
        self.client.force_authenticate(user=self.user)
        res = self.client.get("/api/reports/operator-dashboard/?range=30d")
        self.assertEqual(res.status_code, 403)
