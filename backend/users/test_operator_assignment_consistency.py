import datetime
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status

from users.models import User
from stations.models import Station
from charging.models import Charger


class OperatorAssignmentConsistencyTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Operators
        self.op1 = User.objects.create_user(
            username="operator_tata", email="tata@test.com", password="Password123!", role="OPERATOR"
        )
        self.op2 = User.objects.create_user(
            username="operator_torent", email="torent@test.com", password="Password123!", role="OPERATOR"
        )
        self.admin = User.objects.create_superuser(
            username="admin_user", email="admin@test.com", password="Password123!", role="ADMIN"
        )

        # Station initially assigned to op1 (TATA)
        self.station = Station.objects.create(
            operator=self.op1,
            station_name="TORENT EV Station",
            address="Highway 10",
            city="Metropolis",
            state="State",
            pincode="110001",
            latitude=28.61,
            longitude=77.20,
            opening_time="00:00:00",
            closing_time="23:59:59",
            contact_number="9998887770",
            email="torentstation@test.com",
            status="OPEN"
        )

        self.charger1 = Charger.objects.create(
            station=self.station,
            charger_name="AC-Fast #1",
            charger_number="CH-001",
            charger_type="AC",
            connector_type="Type2",
            power_output_kw=22.0,
            voltage=230,
            current=32,
            price_per_kwh=12.00,
            status="AVAILABLE",
            installation_date=datetime.date.today()
        )
        self.charger2 = Charger.objects.create(
            station=self.station,
            charger_name="AC-Fast #2",
            charger_number="CH-002",
            charger_type="AC",
            connector_type="CCS2",
            power_output_kw=50.0,
            voltage=400,
            current=125,
            price_per_kwh=15.00,
            status="AVAILABLE",
            installation_date=datetime.date.today()
        )

    def test_unassigned_operator_gets_zero_stations_and_chargers(self):
        self.client.force_authenticate(user=self.op2)

        # Station endpoint
        res_st = self.client.get("/api/stations/")
        self.assertEqual(res_st.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res_st.json()), 0)

        # Charger endpoint
        res_ch = self.client.get("/api/charging/chargers/")
        self.assertEqual(res_ch.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res_ch.json()), 0)

        # Operator Dashboard endpoint
        res_db = self.client.get("/api/dashboard/operator/")
        self.assertEqual(res_db.status_code, status.HTTP_200_OK)
        db_data = res_db.json()
        self.assertEqual(db_data["summary"]["assigned_stations"], 0)
        self.assertEqual(db_data["summary"]["total_chargers"], 0)

    def test_assigned_operator_gets_station_and_chargers(self):
        self.client.force_authenticate(user=self.op1)

        # Station endpoint
        res_st = self.client.get("/api/stations/")
        self.assertEqual(res_st.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res_st.json()), 1)
        self.assertEqual(res_st.json()[0]["id"], self.station.id)

        # Charger endpoint
        res_ch = self.client.get("/api/charging/chargers/")
        self.assertEqual(res_ch.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res_ch.json()), 2)

        # Dashboard endpoint
        res_db = self.client.get("/api/dashboard/operator/")
        self.assertEqual(res_db.status_code, status.HTTP_200_OK)
        db_data = res_db.json()
        self.assertEqual(db_data["summary"]["assigned_stations"], 1)
        self.assertEqual(db_data["summary"]["total_chargers"], 2)

    def test_admin_reassignment_immediately_updates_querysets_and_dashboard(self):
        # 1. Reassign Station to op2 (Torent)
        self.client.force_authenticate(user=self.admin)
        url_reassign = f"/api/auth/admin/stations/{self.station.id}/assign-operator/"
        res_reassign = self.client.post(url_reassign, {"operator_id": self.op2.id}, format="json")
        self.assertEqual(res_reassign.status_code, status.HTTP_200_OK)

        # 2. Old operator (op1) now gets ZERO records
        self.client.force_authenticate(user=self.op1)
        self.assertEqual(len(self.client.get("/api/stations/").json()), 0)
        self.assertEqual(len(self.client.get("/api/charging/chargers/").json()), 0)
        self.assertEqual(self.client.get("/api/dashboard/operator/").json()["summary"]["assigned_stations"], 0)

        # 3. New operator (op2 - Torent) gains Station and Chargers
        self.client.force_authenticate(user=self.op2)
        res_st_new = self.client.get("/api/stations/").json()
        res_ch_new = self.client.get("/api/charging/chargers/").json()
        res_db_new = self.client.get("/api/dashboard/operator/").json()

        self.assertEqual(len(res_st_new), 1)
        self.assertEqual(res_st_new[0]["id"], self.station.id)
        self.assertEqual(len(res_ch_new), 2)
        self.assertEqual(res_db_new["summary"]["assigned_stations"], 1)
        self.assertEqual(res_db_new["summary"]["total_chargers"], 2)
