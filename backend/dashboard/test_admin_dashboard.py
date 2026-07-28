from decimal import Decimal
from datetime import date, timedelta
from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient

from users.models import User
from stations.models import Station
from charging.models import Charger, ChargingSession
from bookings.models import Booking
from payments.models import Payment
from trips.models import Trip
from vehicles.models import Vehicle


class AdminDashboardTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        today = timezone.localdate()

        # Users
        self.admin = User.objects.create_user(
            username="admin1", email="admin@test.com", password="password123", role="ADMIN"
        )
        self.operator = User.objects.create_user(
            username="op1", email="op1@test.com", password="password123", role="OPERATOR"
        )
        self.user = User.objects.create_user(
            username="user1", email="user1@test.com", password="password123", role="USER"
        )
        self.blocked_user = User.objects.create_user(
            username="blocked1", email="blocked@test.com", password="password123", role="USER", is_active=False
        )

        # Vehicle & Trip
        self.vehicle = Vehicle.objects.create(
            user=self.user,
            vehicle_type="Car",
            brand="Tesla",
            model="Model 3",
            variant="Long Range",
            registration_number="EV-101",
            battery_capacity=Decimal("75.0"),
            current_battery_percentage=Decimal("50.0"),
            connector_type="CCS2",
            efficiency=Decimal("6.5"),
            manufacturing_year=2023
        )
        self.trip = Trip.objects.create(
            user=self.user,
            vehicle=self.vehicle,
            source="Location A",
            destination="Location B",
            distance_km=Decimal("50.0"),
            estimated_time=45,
            estimated_battery_needed=Decimal("15.0")
        )

        # Station & Chargers
        self.station = Station.objects.create(
            operator=self.operator, station_name="Metro Charge", address="123 Main St",
            city="Metro City", state="State A", pincode="123456", latitude=12.97, longitude=77.59,
            opening_time="06:00:00", closing_time="22:00:00", contact_number="9876543210",
            email="metro@test.com", status="OPEN"
        )
        self.charger1 = Charger.objects.create(
            station=self.station, charger_name="Fast Charger 1", charger_number="CH-001",
            charger_type="DC", connector_type="CCS2", power_output_kw=50.0, voltage=400,
            current=125, price_per_kwh=15.00, status="OCCUPIED", installation_date=today
        )
        self.charger2 = Charger.objects.create(
            station=self.station, charger_name="AC Charger 2", charger_number="CH-002",
            charger_type="AC", connector_type="Type2", power_output_kw=22.0, voltage=230,
            current=32, price_per_kwh=10.00, status="AVAILABLE", installation_date=today
        )

        # Bookings
        self.booking = Booking.objects.create(
            user=self.user, vehicle=self.vehicle, trip=self.trip, station=self.station, charger=self.charger1,
            booking_date=today, booking_start_time="10:00:00", booking_end_time="11:00:00",
            estimated_duration=60, booking_status="CONFIRMED"
        )

        # Active Session
        self.session = ChargingSession.objects.create(
            booking=self.booking, charger=self.charger1, vehicle=self.vehicle,
            start_time=timezone.now(), battery_before=20.0, session_status="ACTIVE"
        )

        # Payments
        self.success_payment = Payment.objects.create(
            user=self.user, charging_session=self.session, amount=Decimal("500.00"),
            payment_method="UPI", payment_status="SUCCESS"
        )
        self.pending_payment = Payment.objects.create(
            user=self.user, amount=Decimal("200.00"), payment_method="CASH", payment_status="PENDING"
        )
        self.failed_payment = Payment.objects.create(
            user=self.user, amount=Decimal("150.00"), payment_method="UPI", payment_status="FAILED"
        )
        self.refunded_payment = Payment.objects.create(
            user=self.user, amount=Decimal("100.00"), payment_method="UPI", payment_status="REFUNDED"
        )

    def test_unauthenticated_dashboard_access_returns_401(self):
        response = self.client.get("/api/dashboard/admin/")
        self.assertEqual(response.status_code, 401)

    def test_user_access_returns_403(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get("/api/dashboard/admin/")
        self.assertEqual(response.status_code, 403)

    def test_operator_access_returns_403(self):
        self.client.force_authenticate(user=self.operator)
        response = self.client.get("/api/dashboard/admin/")
        self.assertEqual(response.status_code, 403)

    def test_admin_access_returns_200_with_full_dashboard(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.get("/api/dashboard/admin/")
        self.assertEqual(response.status_code, 200)

        data = response.json()
        self.assertIn("summary", data)
        self.assertIn("period_summary", data)
        self.assertIn("recent_users", data)
        self.assertIn("recent_bookings", data)
        self.assertIn("active_sessions", data)
        self.assertIn("station_status_breakdown", data)
        self.assertIn("charger_status_breakdown", data)
        self.assertIn("payment_status_breakdown", data)
        self.assertIn("revenue_trend", data)
        self.assertIn("system_alerts", data)

    def test_summary_user_and_operator_metrics(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.get("/api/dashboard/admin/")
        summary = response.json()["summary"]

        self.assertEqual(summary["total_users"], 4)  # admin, op1, user1, blocked1
        self.assertEqual(summary["active_users"], 3)
        self.assertEqual(summary["blocked_users"], 1)
        self.assertEqual(summary["operator_role_count"], 1)
        self.assertEqual(summary["operators_with_stations"], 1)
        self.assertEqual(summary["operators_without_stations"], 0)

    def test_operator_without_station_metric_and_alert(self):
        # Create operator without stations
        unassigned_op = User.objects.create_user(
            username="op_unassigned", email="op_unassigned@test.com", password="password123", role="OPERATOR"
        )
        self.client.force_authenticate(user=self.admin)
        response = self.client.get("/api/dashboard/admin/")
        data = response.json()
        summary = data["summary"]
        alerts = data["system_alerts"]

        self.assertEqual(summary["operators_without_stations"], 1)
        op_alert = next((a for a in alerts if a["id"] == "operator-without-station"), None)
        self.assertIsNotNone(op_alert)
        self.assertEqual(op_alert["type"], "WARNING")
        self.assertEqual(op_alert["target"], "/system-admin/operators")
        self.assertTrue(op_alert["action_available"])

    def test_revenue_calculations_exclude_failed_and_refunded(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.get("/api/dashboard/admin/")
        summary = response.json()["summary"]

        # Only success_payment = 500.00
        self.assertEqual(summary["successful_revenue"], "500.00")
        # Only pending_payment = 200.00
        self.assertEqual(summary["pending_revenue"], "200.00")

    def test_recent_users_hides_passwords_and_sensitive_data(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.get("/api/dashboard/admin/")
        recent_users = response.json()["recent_users"]

        self.assertGreater(len(recent_users), 0)
        first_u = recent_users[0]
        self.assertIn("id", first_u)
        self.assertIn("username", first_u)
        self.assertIn("email", first_u)
        self.assertIn("role", first_u)
        self.assertNotIn("password", first_u)
        self.assertNotIn("address", first_u)

    def test_active_session_status_mismatch_alert(self):
        # Change charger status to AVAILABLE while session is ACTIVE
        self.charger1.status = "AVAILABLE"
        self.charger1.save()

        self.client.force_authenticate(user=self.admin)
        response = self.client.get("/api/dashboard/admin/")
        alerts = response.json()["system_alerts"]

        mismatch_alert = next((a for a in alerts if a["id"] == "active-session-charger-mismatch"), None)
        self.assertIsNotNone(mismatch_alert)
        self.assertEqual(mismatch_alert["count"], 1)

    def test_occupied_charger_without_session_alert(self):
        # Create charger marked OCCUPIED but with no active session
        Charger.objects.create(
            station=self.station, charger_name="Ghost Charger", charger_number="CH-GHOST",
            charger_type="DC", connector_type="CCS2", power_output_kw=50.0, voltage=400,
            current=125, price_per_kwh=15.00, status="OCCUPIED", installation_date=timezone.localdate()
        )

        self.client.force_authenticate(user=self.admin)
        response = self.client.get("/api/dashboard/admin/")
        alerts = response.json()["system_alerts"]

        ghost_alert = next((a for a in alerts if a["id"] == "occupied-charger-without-session"), None)
        self.assertIsNotNone(ghost_alert)

    def test_no_database_mutations_on_dashboard_get(self):
        self.client.force_authenticate(user=self.admin)

        users_count_before = User.objects.count()
        stations_count_before = Station.objects.count()
        chargers_count_before = Charger.objects.count()
        bookings_count_before = Booking.objects.count()
        sessions_count_before = ChargingSession.objects.count()
        payments_count_before = Payment.objects.count()

        # Call GET endpoint 3 times
        for _ in range(3):
            res = self.client.get("/api/dashboard/admin/?range=30d")
            self.assertEqual(res.status_code, 200)

        self.assertEqual(User.objects.count(), users_count_before)
        self.assertEqual(Station.objects.count(), stations_count_before)
        self.assertEqual(Charger.objects.count(), chargers_count_before)
        self.assertEqual(Booking.objects.count(), bookings_count_before)
        self.assertEqual(ChargingSession.objects.count(), sessions_count_before)
        self.assertEqual(Payment.objects.count(), payments_count_before)
