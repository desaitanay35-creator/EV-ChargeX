from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from users.models import User
from stations.models import Station
from charging.models import Charger, ChargingSession
from bookings.models import Booking


class AdminOperatorManagementTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Users
        self.admin = User.objects.create_superuser(
            username="admin_test",
            email="admin@example.com",
            password="Password123!",
            role="ADMIN",
            phone="9000000001"
        )
        self.op1 = User.objects.create_user(
            username="operator1",
            email="op1@example.com",
            password="Password123!",
            role="OPERATOR",
            is_active=True,
            phone="9000000002"
        )
        self.op2 = User.objects.create_user(
            username="operator2",
            email="op2@example.com",
            password="Password123!",
            role="OPERATOR",
            is_active=True,
            phone="9000000003"
        )
        self.blocked_op = User.objects.create_user(
            username="blocked_op",
            email="blocked@example.com",
            password="Password123!",
            role="OPERATOR",
            is_active=False,
            phone="9000000004"
        )
        self.driver = User.objects.create_user(
            username="driver1",
            email="driver1@example.com",
            password="Password123!",
            role="USER",
            is_active=True,
            phone="9000000005"
        )


        # Station assigned to op1
        self.station = Station.objects.create(
            operator=self.op1,
            station_name="SG Highway Fast Charging Hub",
            address="SG Highway",
            city="Ahmedabad",
            state="Gujarat",
            pincode="380015",
            latitude=23.0225,
            longitude=72.5714,
            opening_time="00:00",
            closing_time="23:59",
            contact_number="9876543210",
            email="sghighway@evchargex.com",
            status="OPEN"
        )

        import datetime
        self.charger = Charger.objects.create(
            station=self.station,
            charger_name="Fast Charger 1",
            charger_number="CHG-001",
            charger_type="DC",
            connector_type="CCS2",
            power_output_kw=50.0,
            voltage=400,
            current=125,
            price_per_kwh=15.0,
            status="AVAILABLE",
            installation_date=datetime.date.today()
        )


    # 1. API access security tests
    def test_unauthenticated_operator_access_denied(self):
        url = reverse("admin-operator-list")
        res = self.client.get(url)
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_driver_operator_access_forbidden(self):
        self.client.force_authenticate(user=self.driver)
        url = reverse("admin-operator-list")
        res = self.client.get(url)
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_operator_access_forbidden(self):
        self.client.force_authenticate(user=self.op1)
        url = reverse("admin-operator-list")
        res = self.client.get(url)
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_can_list_operators(self):
        self.client.force_authenticate(user=self.admin)
        url = reverse("admin-operator-list")
        res = self.client.get(url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)

        data = res.data.get("results", res.data) if isinstance(res.data, dict) else res.data
        operator_usernames = [o["username"] for o in data]
        self.assertIn("operator1", operator_usernames)
        self.assertIn("operator2", operator_usernames)


    # 2. Operator creation tests
    def test_admin_create_valid_operator(self):
        self.client.force_authenticate(user=self.admin)
        url = reverse("admin-operator-list")
        payload = {
            "username": "new_operator",
            "email": "new_op@example.com",
            "phone": "9998887770",
            "password": "StrongPassword123!",
            "confirm_password": "StrongPassword123!",
            "first_name": "New",
            "last_name": "Op",
            "city": "Surat"
        }
        res = self.client.post(url, payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data["username"], "new_operator")
        self.assertEqual(res.data["role"], "OPERATOR")

        # Verify password hashed
        created_user = User.objects.get(username="new_operator")
        self.assertTrue(created_user.check_password("StrongPassword123!"))
        self.assertFalse(created_user.is_staff)
        self.assertFalse(created_user.is_superuser)

    def test_create_operator_mismatched_password_rejected(self):
        self.client.force_authenticate(user=self.admin)
        url = reverse("admin-operator-list")
        payload = {
            "username": "mismatch_op",
            "email": "mismatch@example.com",
            "phone": "9998887771",
            "password": "StrongPassword123!",
            "confirm_password": "DifferentPassword123!",
        }
        res = self.client.post(url, payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("confirm_password", res.data)

    def test_create_operator_duplicate_username_rejected(self):
        self.client.force_authenticate(user=self.admin)
        url = reverse("admin-operator-list")
        payload = {
            "username": "operator1",
            "email": "unique@example.com",
            "phone": "9998887772",
            "password": "StrongPassword123!",
            "confirm_password": "StrongPassword123!",
        }
        res = self.client.post(url, payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("username", res.data)

    def test_create_operator_prohibited_privilege_fields_rejected(self):
        self.client.force_authenticate(user=self.admin)
        url = reverse("admin-operator-list")
        payload = {
            "username": "hacker_op",
            "email": "hacker@example.com",
            "phone": "9998887773",
            "password": "StrongPassword123!",
            "confirm_password": "StrongPassword123!",
            "role": "ADMIN",
            "is_superuser": True
        }
        res = self.client.post(url, payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    # 3. Station Reassignment Tests
    def test_admin_reassign_station_to_active_operator(self):
        self.client.force_authenticate(user=self.admin)
        url = reverse("admin-station-assign-operator", kwargs={"station_id": self.station.id})
        payload = {"operator_id": self.op2.id}
        res = self.client.post(url, payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertTrue(res.data["reassigned"])
        self.assertEqual(res.data["new_operator"]["username"], "operator2")

        # Verify DB updated
        self.station.refresh_from_db()
        self.assertEqual(self.station.operator, self.op2)

    def test_reassign_same_operator_idempotent(self):
        self.client.force_authenticate(user=self.admin)
        url = reverse("admin-station-assign-operator", kwargs={"station_id": self.station.id})
        payload = {"operator_id": self.op1.id}
        res = self.client.post(url, payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertFalse(res.data["reassigned"])
        self.assertIn("already assigned", res.data["message"])

    def test_reassign_to_driver_user_rejected(self):
        self.client.force_authenticate(user=self.admin)
        url = reverse("admin-station-assign-operator", kwargs={"station_id": self.station.id})
        payload = {"operator_id": self.driver.id}
        res = self.client.post(url, payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("operator_id", res.data)

    def test_reassign_to_blocked_operator_rejected(self):
        self.client.force_authenticate(user=self.admin)
        url = reverse("admin-station-assign-operator", kwargs={"station_id": self.station.id})
        payload = {"operator_id": self.blocked_op.id}
        res = self.client.post(url, payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("operator_id", res.data)

    def test_reassign_station_with_active_session_blocked(self):
        import datetime
        from django.utils import timezone
        from vehicles.models import Vehicle
        from bookings.models import Booking

        vehicle = Vehicle.objects.create(
            user=self.driver,
            vehicle_type="Car",
            brand="Tata",
            model="Nexon EV",
            registration_number="GJ01AB1234",
            battery_capacity=40.0,
            current_battery_percentage=20.0,
            connector_type="CCS2",
            efficiency=15.0,
            manufacturing_year=2023
        )


        from trips.models import Trip
        trip = Trip.objects.create(
            user=self.driver,
            vehicle=vehicle,
            source="Ahmedabad",
            destination="Gandhinagar",
            distance_km=25.0,
            estimated_time=30,
            estimated_battery_needed=15.0
        )





        booking = Booking.objects.create(
            user=self.driver,
            trip=trip,
            station=self.station,
            charger=self.charger,
            booking_date=timezone.now().date(),
            booking_start_time="10:00:00",
            booking_end_time="11:00:00",
            estimated_duration=60,
            booking_status="CONFIRMED"
        )


        # Create an ACTIVE charging session
        ChargingSession.objects.create(
            booking=booking,
            charger=self.charger,
            vehicle=vehicle,
            start_time=timezone.now(),
            battery_before=20.0,
            session_status="ACTIVE"
        )

        self.client.force_authenticate(user=self.admin)
        url = reverse("admin-station-assign-operator", kwargs={"station_id": self.station.id})
        payload = {"operator_id": self.op2.id}
        res = self.client.post(url, payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("active charging sessions", res.data["detail"])


    # 4. Governance safeguards integration
    def test_assigned_operator_cannot_be_blocked(self):
        self.client.force_authenticate(user=self.admin)
        url = reverse("admin-user-block", kwargs={"pk": self.op1.id})
        res = self.client.post(url)
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Reassign those stations before blocking", res.data["detail"])

    def test_unassigned_operator_cannot_add_charger(self):
        self.client.force_authenticate(user=self.op2)
        url = "/api/charging/chargers/"
        payload = {
            "station": self.station.id,
            "charger_name": "Unauthorized Charger",
            "charger_number": "CHG-UNAUTH",
            "charger_type": "DC",
            "connector_type": "CCS2",
            "power_output_kw": 50.0,
            "voltage": 400,
            "current": 125,
            "price_per_kwh": 15.0,
            "status": "AVAILABLE",
            "installation_date": "2026-07-24"
        }
        res = self.client.post(url, payload, format="json")
        self.assertIn(res.status_code, [status.HTTP_400_BAD_REQUEST, status.HTTP_403_FORBIDDEN])

    def test_assigned_operator_can_add_charger(self):
        self.client.force_authenticate(user=self.op1)
        url = "/api/charging/chargers/"
        payload = {
            "station": self.station.id,
            "charger_name": "Auth Charger",
            "charger_number": "CHG-AUTH",
            "charger_type": "DC",
            "connector_type": "CCS2",
            "power_output_kw": 50.0,
            "voltage": 400,
            "current": 125,
            "price_per_kwh": 15.0,
            "status": "AVAILABLE",
            "installation_date": "2026-07-24"
        }
        res = self.client.post(url, payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)

