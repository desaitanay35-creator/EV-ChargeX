import datetime
from decimal import Decimal
from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient
from rest_framework import status

from users.models import User
from stations.models import Station
from charging.models import Charger, ChargingSession
from bookings.models import Booking
from trips.models import Trip
from vehicles.models import Vehicle
from payments.models import Payment
from charging.services import estimate_charging_result, CHARGING_EFFICIENCY


class AutomaticChargingEstimationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.now = timezone.now()

        # Users
        self.user1 = User.objects.create_user(
            username="driver_est1", email="d1@est.com", password="Password123!", role="USER"
        )
        self.user2 = User.objects.create_user(
            username="driver_est2", email="d2@est.com", password="Password123!", role="USER"
        )
        self.op1 = User.objects.create_user(
            username="operator_est1", email="op1@est.com", password="Password123!", role="OPERATOR"
        )
        self.op2 = User.objects.create_user(
            username="operator_est2", email="op2@est.com", password="Password123!", role="OPERATOR"
        )

        # Vehicles
        self.vehicle60 = Vehicle.objects.create(
            user=self.user1, vehicle_type="Car", brand="Tesla", model="Model 3",
            registration_number="EV-EST-60", battery_capacity=Decimal("60.0"),
            current_battery_percentage=Decimal("40.0"), connector_type="CCS2",
            efficiency=Decimal("6.0"), manufacturing_year=2023
        )
        self.vehicle_other = Vehicle.objects.create(
            user=self.user2, vehicle_type="Car", brand="Tata", model="Nexon EV",
            registration_number="EV-EST-40", battery_capacity=Decimal("40.0"),
            current_battery_percentage=Decimal("20.0"), connector_type="CCS2",
            efficiency=Decimal("5.0"), manufacturing_year=2023
        )

        # Trips
        self.trip1 = Trip.objects.create(
            user=self.user1, vehicle=self.vehicle60, source="City A", destination="City B",
            distance_km=Decimal("100.0"), estimated_time=80, estimated_battery_needed=Decimal("25.0")
        )
        self.trip2 = Trip.objects.create(
            user=self.user2, vehicle=self.vehicle_other, source="City X", destination="City Y",
            distance_km=Decimal("50.0"), estimated_time=40, estimated_battery_needed=Decimal("15.0")
        )

        # Station & Charger
        self.station1 = Station.objects.create(
            operator=self.op1, station_name="Est Station 1", address="Street 1",
            city="Metropolis", state="State", pincode="110001", latitude=28.61, longitude=77.20,
            opening_time="00:00:00", closing_time="23:59:59", contact_number="9990001112",
            email="s1@est.com", status="OPEN"
        )
        self.charger30 = Charger.objects.create(
            station=self.station1, charger_name="DC 30kW", charger_number="CH-EST-30",
            charger_type="DC", connector_type="CCS2", power_output_kw=Decimal("30.0"),
            voltage=400, current=75, price_per_kwh=Decimal("12.00"), status="OCCUPIED",
            installation_date=datetime.date.today()
        )

        # Booking
        self.booking1 = Booking.objects.create(
            user=self.user1, vehicle=self.vehicle60, trip=self.trip1, station=self.station1, charger=self.charger30,
            booking_date=self.now.date(), booking_start_time="10:00:00", booking_end_time="11:00:00",
            estimated_duration=60, booking_status="CONFIRMED", is_qr_used=True, qr_code="EV-BKG-EST-1"
        )

    def test_30kw_charger_17_minutes_40_percent_start_formula(self):
        # 17 minutes ago
        start_time = self.now - datetime.timedelta(minutes=17)
        session = ChargingSession.objects.create(
            booking=self.booking1, charger=self.charger30, vehicle=self.vehicle60,
            start_time=start_time, battery_before=Decimal("40.00"), session_status="ACTIVE"
        )

        result = estimate_charging_result(session, end_time=self.now)

        # Duration: 17 min
        self.assertEqual(result["duration_minutes"], 17)
        # 30 kW * (17/60) hours = 8.5 kWh input energy
        self.assertEqual(result["energy_input_kwh"], "8.50")
        # 8.5 kWh * 0.90 efficiency = 7.65 kWh usable energy
        self.assertEqual(result["energy_delivered_kwh"], "7.65")
        # 7.65 kWh / 60 kWh * 100 = 12.75% battery gain
        self.assertEqual(result["battery_gain_percent"], "12.75")
        # 40.00 + 12.75 = 52.75% final battery
        self.assertEqual(result["battery_after"], "52.75")
        # 7.65 kWh * ₹12.00/kWh = ₹91.80 cost
        self.assertEqual(result["charging_cost"], "91.80")

    def test_taper_model_above_80_percent_and_clamping_at_100(self):
        # Session starting at 75% for 60 minutes on 30kW charger
        start_time = self.now - datetime.timedelta(minutes=60)
        session = ChargingSession.objects.create(
            booking=self.booking1, charger=self.charger30, vehicle=self.vehicle60,
            start_time=start_time, battery_before=Decimal("75.00"), session_status="ACTIVE"
        )

        result = estimate_charging_result(session, end_time=self.now)
        final_bat = Decimal(result["battery_after"])
        self.assertLessEqual(final_bat, Decimal("100.00"))

        # Session starting at 100%
        session100 = ChargingSession.objects.create(
            booking=self.booking1, charger=self.charger30, vehicle=self.vehicle60,
            start_time=start_time, battery_before=Decimal("100.00"), session_status="ACTIVE"
        )
        res100 = estimate_charging_result(session100, end_time=self.now)
        self.assertEqual(res100["battery_after"], "100.00")
        self.assertEqual(res100["battery_gain_percent"], "0.00")
        self.assertEqual(res100["energy_delivered_kwh"], "0.00")
        self.assertEqual(res100["charging_cost"], "0.00")

    def test_completion_preview_endpoint_does_not_mutate_db(self):
        session = ChargingSession.objects.create(
            booking=self.booking1, charger=self.charger30, vehicle=self.vehicle60,
            start_time=self.now - datetime.timedelta(minutes=20),
            battery_before=Decimal("30.00"), session_status="ACTIVE"
        )

        self.client.force_authenticate(user=self.operator_est1 if hasattr(self, 'operator_est1') else self.op1)
        res = self.client.get(f"/api/charging/sessions/{session.id}/completion-preview/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)

        data = res.json()
        self.assertIn("estimate", data)
        self.assertEqual(data["estimate"]["battery_before"], "30.00")

        # Confirm session is still ACTIVE and battery_after is None in DB
        session.refresh_from_db()
        self.assertEqual(session.session_status, "ACTIVE")
        self.assertIsNone(session.battery_after)

    def test_automatic_stop_charging_workflow(self):
        now_fresh = timezone.now()
        session = ChargingSession.objects.create(
            booking=self.booking1, charger=self.charger30, vehicle=self.vehicle60,
            start_time=now_fresh - datetime.timedelta(minutes=17),
            battery_before=Decimal("40.00"), session_status="ACTIVE"
        )

        self.client.force_authenticate(user=self.op1)
        # Note: battery_after is NOT sent in payload
        res = self.client.post("/api/charging/stop/", {"session_id": session.id}, format="json")
        self.assertEqual(res.status_code, status.HTTP_200_OK)

        data = res.json()
        self.assertAlmostEqual(float(data["battery_after"]), 52.75, delta=0.1)
        self.assertAlmostEqual(float(data["energy_consumed_kwh"]), 7.65, delta=0.1)
        self.assertAlmostEqual(float(data["charging_cost"]), 91.80, delta=0.5)

        # Verify DB session state
        session.refresh_from_db()
        self.assertEqual(session.session_status, "COMPLETED")
        self.assertAlmostEqual(float(session.battery_after), 52.75, delta=0.1)

        # Verify vehicle battery updated
        self.vehicle60.refresh_from_db()
        self.assertAlmostEqual(float(self.vehicle60.current_battery_percentage), 52.75, delta=0.1)

        # Verify charger status set to AVAILABLE
        self.charger30.refresh_from_db()
        self.assertEqual(self.charger30.status, "AVAILABLE")

        # Verify single PENDING payment created
        payments = Payment.objects.filter(charging_session=session)
        self.assertEqual(payments.count(), 1)
        self.assertEqual(payments.first().payment_status, "PENDING")

    def test_unauthorized_user_and_operator_cannot_stop_session(self):
        session = ChargingSession.objects.create(
            booking=self.booking1, charger=self.charger30, vehicle=self.vehicle60,
            start_time=self.now - datetime.timedelta(minutes=10),
            battery_before=Decimal("40.00"), session_status="ACTIVE"
        )

        # Wrong driver (user2) tries to stop
        self.client.force_authenticate(user=self.user2)
        res1 = self.client.post("/api/charging/stop/", {"session_id": session.id}, format="json")
        self.assertEqual(res1.status_code, status.HTTP_403_FORBIDDEN)

        # Wrong operator (op2) tries to stop
        self.client.force_authenticate(user=self.op2)
        res2 = self.client.post("/api/charging/stop/", {"session_id": session.id}, format="json")
        self.assertEqual(res2.status_code, status.HTTP_403_FORBIDDEN)

    def test_duplicate_stop_request_is_idempotent(self):
        session = ChargingSession.objects.create(
            booking=self.booking1, charger=self.charger30, vehicle=self.vehicle60,
            start_time=self.now - datetime.timedelta(minutes=17),
            battery_before=Decimal("40.00"), session_status="ACTIVE"
        )

        self.client.force_authenticate(user=self.op1)
        res1 = self.client.post("/api/charging/stop/", {"session_id": session.id}, format="json")
        self.assertEqual(res1.status_code, status.HTTP_200_OK)

        # Duplicate stop call
        res2 = self.client.post("/api/charging/stop/", {"session_id": session.id}, format="json")
        self.assertEqual(res2.status_code, status.HTTP_200_OK)
        self.assertEqual(res2.json()["message"], "Charging session was already completed.")
