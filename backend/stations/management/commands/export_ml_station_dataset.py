import csv
from pathlib import Path
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.db.models import Count, Avg, Sum, Q

from stations.models import Station
from charging.models import ChargingSession
from bookings.models import Booking
from payments.models import Payment


class Command(BaseCommand):
    help = "Export ML-ready station dataset combining station metadata with EV-ChargeX operational features."

    def add_arguments(self, parser):
        parser.add_argument("--state", type=str, default="Gujarat", help="Filter stations by state")
        parser.add_argument("--output", type=str, default="datasets/gujarat_ev_station_features.csv", help="CSV output path")

    def handle(self, *args, **options):
        state_filter = options["state"]
        out_path = Path(options["output"])
        out_path.parent.mkdir(parents=True, exist_ok=True)

        stations = Station.objects.all().prefetch_related("chargers")
        if state_filter:
            stations = stations.filter(Q(state__iexact=state_filter) | Q(address__icontains=state_filter))

        self.stdout.write(self.style.NOTICE(f"Exporting ML dataset for {stations.count()} stations to {out_path}..."))

        headers = [
            "station_id",
            "external_id",
            "external_source",
            "is_managed",
            "station_name",
            "latitude",
            "longitude",
            "city",
            "state",
            "operator_name",
            "connector_types",
            "charger_powers_kw",
            "charger_count",
            "data_quality_score",
            "source_last_verified_at",
            "total_bookings_count",
            "confirmed_bookings_count",
            "cancelled_bookings_count",
            "completed_sessions_count",
            "active_sessions_count",
            "avg_session_duration_minutes",
            "total_energy_consumed_kwh",
            "total_settled_revenue",
            "attribution",
        ]

        rows = []

        for station in stations:
            chargers = list(station.chargers.all())
            conn_types = list(set([c.connector_type for c in chargers if c.connector_type]))
            powers = [str(c.power_output_kw) for c in chargers if c.power_output_kw is not None]

            is_managed = (station.external_source == "MANUAL" or station.booking_enabled)

            # Query operational data for this station
            bookings_qs = Booking.objects.filter(station=station)
            has_booking_history = bookings_qs.exists()

            total_bookings = bookings_qs.count() if has_booking_history else None
            confirmed_bookings = bookings_qs.filter(booking_status="CONFIRMED").count() if has_booking_history else None
            cancelled_bookings = bookings_qs.filter(booking_status="CANCELLED").count() if has_booking_history else None

            sessions_qs = ChargingSession.objects.filter(charger__station=station)
            has_session_history = sessions_qs.exists()

            completed_sessions = sessions_qs.filter(session_status="COMPLETED").count() if has_session_history else None
            active_sessions = sessions_qs.filter(session_status="ACTIVE").count() if has_session_history else None

            # Calculate session duration
            avg_duration = None
            total_energy = None
            if has_session_history:
                completed_qs = sessions_qs.filter(session_status="COMPLETED")
                if completed_qs.exists():
                    durations = []
                    for s in completed_qs:
                        if s.start_time and s.end_time:
                            diff_mins = (s.end_time - s.start_time).total_seconds() / 60.0
                            if diff_mins > 0:
                                durations.append(diff_mins)
                    if durations:
                        avg_duration = round(sum(durations) / len(durations), 2)

                    energy_sum = completed_qs.aggregate(total=Sum("energy_consumed_kwh"))["total"]
                    if energy_sum is not None:
                        total_energy = round(float(energy_sum), 2)

            # Calculate settled revenue
            payments_qs = Payment.objects.filter(charging_session__charger__station=station, payment_status="SUCCESS")

            total_revenue = None
            if payments_qs.exists():
                rev_sum = payments_qs.aggregate(total=Sum("amount"))["total"]
                if rev_sum is not None:
                    total_revenue = round(float(rev_sum), 2)

            rows.append({
                "station_id": station.id,
                "external_id": station.external_id or "",
                "external_source": station.external_source,
                "is_managed": is_managed,
                "station_name": station.station_name,
                "latitude": str(station.latitude),
                "longitude": str(station.longitude),
                "city": station.city,
                "state": station.state,
                "operator_name": station.operator_name or (station.operator.username if station.operator else ""),
                "connector_types": ";".join(conn_types),
                "charger_powers_kw": ";".join(powers),
                "charger_count": len(chargers),
                "data_quality_score": station.data_quality_score,
                "source_last_verified_at": station.source_last_verified_at.isoformat() if station.source_last_verified_at else "",
                "total_bookings_count": total_bookings if total_bookings is not None else "",
                "confirmed_bookings_count": confirmed_bookings if confirmed_bookings is not None else "",
                "cancelled_bookings_count": cancelled_bookings if cancelled_bookings is not None else "",
                "completed_sessions_count": completed_sessions if completed_sessions is not None else "",
                "active_sessions_count": active_sessions if active_sessions is not None else "",
                "avg_session_duration_minutes": avg_duration if avg_duration is not None else "",
                "total_energy_consumed_kwh": total_energy if total_energy is not None else "",
                "total_settled_revenue": total_revenue if total_revenue is not None else "",
                "attribution": "Source: Open Charge Map" if station.external_source == "OPEN_CHARGE_MAP" else "EV-ChargeX Operational",
            })

        with open(out_path, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=headers)
            writer.writeheader()
            writer.writerows(rows)

        self.stdout.write(self.style.SUCCESS(f"Dataset successfully exported to {out_path} ({len(rows)} records)."))
