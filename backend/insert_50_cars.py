import os
import sys
import django

sys.path.append(os.path.abspath(os.path.dirname(__file__)))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "evchargex.settings")
django.setup()

from django.db import transaction
from vehicles.models import Vehicle
from users.models import User
from bookings.models import Booking
from charging.models import ChargingSession
from trips.models import Trip

# 50 Car Data Tuples provided by user
car_data = [
    (1, 'Car', 'Tata', 'Nexon EV', 'Creative Plus LR', 'GJ01EV1001', 40.50, 82, 'CCS2', 8.10, 2024, 'Pristine White', '2026-07-20 10:15:00', 1),
    (2, 'Car', 'Tata', 'Punch EV', 'Empowered Plus S LR', 'GJ01EV1002', 35.00, 64, 'CCS2', 7.80, 2025, 'Daytona Grey', '2026-07-20 10:30:00', 2),
    (3, 'Car', 'Tata', 'Tiago EV', 'XZ Plus Long Range', 'GJ01EV1003', 24.00, 91, 'CCS2', 7.20, 2024, 'Ocean Blue', '2026-07-20 10:45:00', 3),
    (4, 'Car', 'Tata', 'Tigor EV', 'XZ Plus Tech Lux', 'GJ01EV1004', 26.00, 48, 'CCS2', 7.00, 2023, 'Magnetic Red', '2026-07-20 11:00:00', 4),
    (5, 'Car', 'Mahindra', 'XUV400', 'EL Pro 34.5', 'GJ01EV1005', 34.50, 73, 'CCS2', 7.50, 2024, 'Everest White', '2026-07-20 11:15:00', 5),

    (6, 'Car', 'Mahindra', 'XUV400', 'EL Pro 39.4', 'GJ01EV1006', 39.40, 56, 'CCS2', 7.30, 2025, 'Nebula Blue', '2026-07-20 11:30:00', 6),
    (7, 'Car', 'MG', 'ZS EV', 'Exclusive Pro', 'GJ01EV1007', 50.30, 87, 'CCS2', 7.20, 2024, 'Glaze Red', '2026-07-20 11:45:00', 7),
    (8, 'Car', 'MG', 'Comet EV', 'Exclusive', 'GJ01EV1008', 17.30, 69, 'Type2', 8.50, 2025, 'Candy White', '2026-07-20 12:00:00', 8),
    (9, 'Car', 'Hyundai', 'Creta Electric', 'Premium Plus LR', 'GJ01EV1009', 51.40, 78, 'CCS2', 7.40, 2025, 'Abyss Black', '2026-07-20 12:15:00', 9),
    (10, 'Car', 'Hyundai', 'Kona Electric', 'Premium', 'GJ01EV1010', 39.20, 42, 'CCS2', 7.60, 2023, 'Atlas White', '2026-07-20 12:30:00', 10),

    (11, 'Car', 'BYD', 'Atto 3', 'Premium', 'GJ01EV1011', 49.90, 84, 'CCS2', 7.40, 2024, 'Ski White', '2026-07-20 12:45:00', 11),
    (12, 'Car', 'BYD', 'Atto 3', 'Superior', 'GJ01EV1012', 60.50, 61, 'CCS2', 7.10, 2025, 'Boulder Grey', '2026-07-20 13:00:00', 12),
    (13, 'Car', 'BYD', 'Seal', 'Premium', 'GJ01EV1013', 61.40, 76, 'CCS2', 7.00, 2025, 'Aurora White', '2026-07-20 13:15:00', 13),
    (14, 'Car', 'Kia', 'EV6', 'GT-Line AWD', 'GJ01EV1014', 77.40, 58, 'CCS2', 5.80, 2024, 'Yacht Blue', '2026-07-20 13:30:00', 14),
    (15, 'Car', 'BMW', 'iX1', 'xDrive30', 'GJ01EV1015', 64.80, 67, 'CCS2', 5.60, 2025, 'Mineral White', '2026-07-20 13:45:00', 15),

    (16, 'Car', 'BMW', 'i4', 'eDrive35 M Sport', 'GJ01EV1016', 70.20, 52, 'CCS2', 5.80, 2024, 'Black Sapphire', '2026-07-20 14:00:00', 16),
    (17, 'Car', 'Mercedes-Benz', 'EQA', '250 Plus', 'GJ01EV1017', 70.50, 80, 'CCS2', 5.90, 2025, 'Polar White', '2026-07-20 14:15:00', 17),
    (18, 'Car', 'Volvo', 'EX40', 'Ultra Twin Motor', 'GJ01EV1018', 78.00, 46, 'CCS2', 5.30, 2025, 'Fjord Blue', '2026-07-20 14:30:00', 18),
    (19, 'Car', 'Tata', 'Curvv EV', 'Empowered Plus A 55', 'GJ01EV1019', 55.00, 93, 'CCS2', 7.30, 2025, 'Flame Red', '2026-07-20 14:45:00', 19),
    (20, 'Car', 'Hyundai', 'Ioniq 5', 'Long Range RWD', 'GJ01EV1020', 72.60, 71, 'CCS2', 6.00, 2024, 'Gravity Gold', '2026-07-20 15:00:00', 20),

    (21, 'Car', 'MG', 'Windsor EV', 'Essence', 'GJ01EV1021', 38.00, 66, 'Type2', 7.90, 2025, 'Starburst Black', '2026-07-21 09:00:00', 21),
    (22, 'Car', 'Tata', 'Tiago EV', 'XE Medium Range', 'GJ01EV1022', 19.20, 54, 'Type2', 8.00, 2023, 'Opal White', '2026-07-21 09:15:00', 22),
    (23, 'Car', 'Tata', 'Punch EV', 'Adventure S MR', 'GJ01EV1023', 25.00, 88, 'Type2', 8.20, 2024, 'Seaweed Green', '2026-07-21 09:30:00', 23),
    (24, 'Car', 'MG', 'Comet EV', 'Excite', 'GJ01EV1024', 17.30, 37, 'Type2', 8.60, 2024, 'Apple Green', '2026-07-21 09:45:00', 24),
    (25, 'Car', 'Mahindra', 'e2o Plus', 'P6', 'GJ01EV1025', 10.08, 79, 'Type2', 9.10, 2022, 'Arctic Silver', '2026-07-21 10:00:00', 25),

    (26, 'Car', 'Nissan', 'Leaf', 'SV Plus', 'GJ01EV1026', 62.00, 62, 'CHAdeMO', 6.20, 2023, 'Pearl White', '2026-07-21 10:15:00', 26),
    (27, 'Car', 'Nissan', 'Leaf', 'SL Plus', 'GJ01EV1027', 62.00, 45, 'CHAdeMO', 6.00, 2024, 'Deep Blue Pearl', '2026-07-21 10:30:00', 27),
    (28, 'Car', 'Mitsubishi', 'Outlander PHEV', 'GT', 'GJ01EV1028', 20.00, 74, 'CHAdeMO', 5.40, 2023, 'Diamond Red', '2026-07-21 10:45:00', 28),
    (29, 'Car', 'Nissan', 'e-NV200', 'Evalia', 'GJ01EV1029', 40.00, 59, 'CHAdeMO', 5.80, 2022, 'Brilliant Silver', '2026-07-21 11:00:00', 29),
    (30, 'Car', 'Mitsubishi', 'i-MiEV', 'Standard', 'GJ01EV1030', 16.00, 83, 'CHAdeMO', 7.00, 2021, 'Cool Silver', '2026-07-21 11:15:00', 30),

    (31, 'Car', 'BYD', 'Dolphin', 'Extended Range', 'GJ01EV1031', 60.48, 77, 'GB/T', 7.60, 2025, 'Coral Pink', '2026-07-21 11:30:00', 31),
    (32, 'Car', 'BYD', 'Han EV', 'Executive', 'GJ01EV1032', 85.40, 68, 'GB/T', 5.90, 2024, 'Space Black', '2026-07-21 11:45:00', 32),
    (33, 'Car', 'BYD', 'Tang EV', 'Flagship', 'GJ01EV1033', 86.40, 51, 'GB/T', 5.50, 2024, 'Mountain Grey', '2026-07-21 12:00:00', 33),
    (34, 'Car', 'BYD', 'e6', 'GL', 'GJ01EV1034', 71.70, 90, 'GB/T', 6.50, 2023, 'Crystal White', '2026-07-21 12:15:00', 34),
    (35, 'Car', 'BYD', 'Qin Plus EV', 'Long Range', 'GJ01EV1035', 57.60, 63, 'GB/T', 7.10, 2025, 'Silver Sand', '2026-07-21 12:30:00', 35),

    (36, 'Car', 'Tata', 'Nexon EV', 'Fearless Plus LR', 'GJ01EV1036', 40.50, 35, 'CCS2', 8.00, 2025, 'Fearless Red', '2026-07-21 12:45:00', 36),
    (37, 'Car', 'Tata', 'Curvv EV', 'Creative 45', 'GJ01EV1037', 45.00, 72, 'CCS2', 7.50, 2025, 'Virtual Sunrise', '2026-07-21 13:00:00', 37),
    (38, 'Car', 'Mahindra', 'BE 6', 'Pack Three', 'GJ01EV1038', 79.00, 86, 'CCS2', 6.40, 2026, 'Firestorm Orange', '2026-07-21 13:15:00', 38),
    (39, 'Car', 'Mahindra', 'XEV 9e', 'Pack Three', 'GJ01EV1039', 79.00, 57, 'CCS2', 6.20, 2026, 'Desert Myst', '2026-07-21 13:30:00', 39),
    (40, 'Car', 'MG', 'ZS EV', 'Essence', 'GJ01EV1040', 50.30, 41, 'CCS2', 7.00, 2023, 'Sable Black', '2026-07-21 13:45:00', 40),

    (41, 'Car', 'BYD', 'Seal', 'Performance', 'GJ01EV1041', 82.56, 94, 'CCS2', 5.80, 2025, 'Atlantis Grey', '2026-07-21 14:00:00', 41),
    (42, 'Car', 'Kia', 'EV6', 'GT-Line RWD', 'GJ01EV1042', 77.40, 69, 'CCS2', 6.10, 2025, 'Runway Red', '2026-07-21 14:15:00', 42),
    (43, 'Car', 'BMW', 'iX', 'xDrive40', 'GJ01EV1043', 76.60, 47, 'CCS2', 5.00, 2024, 'Phytonic Blue', '2026-07-21 14:30:00', 43),
    (44, 'Car', 'Mercedes-Benz', 'EQB', '350 4MATIC', 'GJ01EV1044', 66.50, 75, 'CCS2', 5.50, 2025, 'Cosmos Black', '2026-07-21 14:45:00', 44),
    (45, 'Car', 'Audi', 'Q8 e-tron', '55 Quattro', 'GJ01EV1045', 114.00, 60, 'CCS2', 4.20, 2025, 'Mythos Black', '2026-07-21 15:00:00', 45),

    (46, 'Car', 'Volvo', 'EC40', 'Recharge Ultimate', 'GJ01EV1046', 78.00, 82, 'CCS2', 5.40, 2025, 'Cloud Blue', '2026-07-21 15:15:00', 46),
    (47, 'Car', 'Jaguar', 'I-PACE', 'HSE', 'GJ01EV1047', 90.00, 55, 'CCS2', 4.70, 2024, 'Fuji White', '2026-07-21 15:30:00', 47),
    (48, 'Car', 'Porsche', 'Taycan', '4S', 'GJ01EV1048', 93.40, 70, 'CCS2', 4.30, 2025, 'Jet Black', '2026-07-21 15:45:00', 48),
    (49, 'Car', 'Tesla', 'Model Y', 'Long Range AWD', 'GJ01EV1049', 78.10, 89, 'CCS2', 6.50, 2026, 'Stealth Grey', '2026-07-21 16:00:00', 49),
    (50, 'Car', 'Tesla', 'Model 3', 'Long Range AWD', 'GJ01EV1050', 75.00, 38, 'CCS2', 6.70, 2025, 'Pearl White', '2026-07-21 16:15:00', 50),
]

def run_import():
    print("--- Inserting 50 EV Cars and Assigning to Active Driver Users ---")

    driver_users = list(User.objects.filter(role='USER'))
    if not driver_users:
        driver_users = list(User.objects.all())

    print(f"Assigning cars across {len(driver_users)} users...")

    with transaction.atomic():
        old_vehicles = list(Vehicle.objects.all())
        print(f"Found {len(old_vehicles)} existing vehicles in database.")

        temp_user = driver_users[0]
        temp_vehicle = Vehicle.objects.create(
            user=temp_user,
            vehicle_type='Car',
            brand='TempHolding',
            model='TempHolding',
            registration_number='TEMP_HOLD_000',
            battery_capacity=50,
            current_battery_percentage=50,
            connector_type='CCS2',
            efficiency=6,
            manufacturing_year=2024,
            color='White'
        )

        Booking.objects.all().update(vehicle=temp_vehicle)
        ChargingSession.objects.all().update(vehicle=temp_vehicle)
        Trip.objects.all().update(vehicle=temp_vehicle)

        # Delete old vehicles
        old_ids = [v.id for v in old_vehicles]
        Vehicle.objects.filter(id__in=old_ids).delete()
        print("Deleted all previous vehicles and bikes from user profiles.")

        created_vehicles = []
        for idx, row in enumerate(car_data):
            _, v_type, brand, model, variant, reg_no, capacity, batt_pct, connector, eff, year, color, created_at_str, _ = row

            chosen_user = driver_users[idx % len(driver_users)]

            v = Vehicle.objects.create(
                user=chosen_user,
                vehicle_type=v_type,
                brand=brand,
                model=model,
                variant=variant,
                registration_number=reg_no,
                battery_capacity=capacity,
                current_battery_percentage=batt_pct,
                connector_type=connector,
                efficiency=eff,
                manufacturing_year=year,
                color=color,
            )
            created_vehicles.append(v)

        print(f"Successfully created {len(created_vehicles)} new EV cars!")

        # Re-link bookings/sessions/trips to newly created vehicles
        first_veh = created_vehicles[0]
        Booking.objects.all().update(vehicle=first_veh)
        ChargingSession.objects.all().update(vehicle=first_veh)
        Trip.objects.all().update(vehicle=first_veh)

        temp_vehicle.delete()
        print("Removed temporary holding vehicle.")

    total_vehicles = Vehicle.objects.count()
    print(f"\nTotal Vehicles in DB now: {total_vehicles}")

if __name__ == "__main__":
    run_import()
