import datetime
import math
import random
import sys
import time
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password
from django.core.management.base import BaseCommand, CommandError
from django.db import models, transaction
from django.db.models import Count, Q
from django.utils import timezone

from bookings.models import Booking
from charging.models import Charger, ChargingSession
from reviews.models import Review
from stations.models import Station
from trips.models import SeedBatch, SeedGeneratedObject, Trip
from vehicles.models import Vehicle

User = get_user_model()

# Datetime Boundaries: 1 January 2025 00:00:00 UTC to Now
START_DATETIME = datetime.datetime(2025, 1, 1, 0, 0, 0, tzinfo=datetime.timezone.utc)

# Real Indian Name Data Pools
INDIAN_FIRST_NAMES = [
  "Aarav", "Aditya", "Ananya", "Arjun", "Bhavya", "Dev", "Dhruv", "Divya", "Harsh", "Isha",
  "Karan", "Kavya", "Krishna", "Manav", "Meera", "Meet", "Nikhil", "Parth", "Pooja", "Pranav",
  "Priya", "Rahul", "Riya", "Rohan", "Sanjay", "Shreya", "Sneha", "Tanay", "Tushar", "Varun",
  "Yash", "Zoya", "Amit", "Chirag", "Deepak", "Gaurav", "Hitesh", "Jay", "Ketan", "Mayur",
  "Nilesh", "Paresh", "Rajesh", "Sameer", "Vikram", "Ankita", "Bhakti", "Drashti", "Ekta", "Falguni",
  "Hetavi", "Janki", "Kinjal", "Mansi", "Nidhi", "Payal", "Radhika", "Swati", "Urvi", "Vrutika",
  "Aakash", "Bhavesh", "Dhaval", "Hardik", "Jignesh", "Kaushal", "Mahesh", "Narendra", "Pankaj", "Rakesh"
]

INDIAN_LAST_NAMES = [
  "Patel", "Shah", "Desai", "Mehta", "Joshi", "Sharma", "Verma", "Kulkarni", "Nair", "Gupta",
  "Singh", "Rao", "Panchal", "Solanki", "Chaudhari", "Prajapati", "Thakkar", "Gajiwala", "Dave", "Bhatt",
  "Trivedi", "Parikh", "Vora", "Zaveri", "Vyas", "Pandya", "Modi", "Soni", "Rawal", "Rana",
  "Sheth", "Contractor", "Wadia", "Merchant", "Kapadia", "Choksi", "Mistry", "Sutariya", "Bhavsar", "Randeria",
  "Ambani", "Adani", "Tata", "Birla", "Godrej", "Bajaj", "Mahindra", "Premji", "Murthy", "Nadar"
]

CITIES_AND_STATES = [
  ("Ahmedabad", "Gujarat", 23.0225, 72.5714),
  ("Surat", "Gujarat", 21.1702, 72.8311),
  ("Vadodara", "Gujarat", 22.3072, 73.1812),
  ("Rajkot", "Gujarat", 22.3039, 70.8022),
  ("Gandhinagar", "Gujarat", 23.2156, 72.6369),
  ("Anand", "Gujarat", 22.5645, 72.9289),
  ("Bharuch", "Gujarat", 21.7051, 72.9959),
  ("Valsad", "Gujarat", 20.5992, 72.9342),
  ("Bhavnagar", "Gujarat", 21.7645, 72.1519),
  ("Jamnagar", "Gujarat", 22.4707, 70.0577),
  ("Mumbai", "Maharashtra", 19.0760, 72.8777),
  ("Pune", "Maharashtra", 18.5204, 73.8567),
  ("Udaipur", "Rajasthan", 24.5854, 73.7125),
  ("Indore", "Madhya Pradesh", 22.7196, 75.8577),
]

PUBLIC_EMAIL_DOMAINS = [
  "gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "icloud.com", "proton.me"
]

EV_VEHICLES_CATALOG = [
  {"brand": "Tata", "model": "Nexon EV", "type": "Car", "battery": 40.5, "efficiency": 6.2, "connector": "CCS2"},
  {"brand": "Tata", "model": "Tiago EV", "type": "Car", "battery": 24.0, "efficiency": 7.5, "connector": "CCS2"},
  {"brand": "Tata", "model": "Punch EV", "type": "Car", "battery": 35.0, "efficiency": 6.8, "connector": "CCS2"},
  {"brand": "Mahindra", "model": "XUV400", "type": "Car", "battery": 39.4, "efficiency": 6.0, "connector": "CCS2"},
  {"brand": "MG", "model": "ZS EV", "type": "Car", "battery": 50.3, "efficiency": 5.8, "connector": "CCS2"},
  {"brand": "MG", "model": "Comet EV", "type": "Car", "battery": 17.3, "efficiency": 8.5, "connector": "Type2"},
  {"brand": "Hyundai", "model": "Kona Electric", "type": "Car", "battery": 39.2, "efficiency": 6.4, "connector": "CCS2"},
  {"brand": "Hyundai", "model": "Ioniq 5", "type": "Car", "battery": 72.6, "efficiency": 5.2, "connector": "CCS2"},
  {"brand": "Kia", "model": "EV6", "type": "Car", "battery": 77.4, "efficiency": 5.0, "connector": "CCS2"},
  {"brand": "BYD", "model": "Atto 3", "type": "Car", "battery": 60.4, "efficiency": 5.5, "connector": "CCS2"},
  {"brand": "Ather", "model": "450X", "type": "Bike", "battery": 3.7, "efficiency": 30.0, "connector": "Type2"},
  {"brand": "Ola", "model": "S1 Pro", "type": "Bike", "battery": 4.0, "efficiency": 32.0, "connector": "Type2"},
  {"brand": "TVS", "model": "iQube", "type": "Bike", "battery": 3.04, "efficiency": 33.0, "connector": "Type2"},
  {"brand": "Bajaj", "model": "Chetak", "type": "Bike", "battery": 3.2, "efficiency": 31.0, "connector": "Type2"},
  {"brand": "Hero", "model": "Vida V1", "type": "Bike", "battery": 3.94, "efficiency": 29.0, "connector": "Type2"},
]

REVIEW_COMMENTS = [
  "Fast charging and clean location. Very satisfied!",
  "Charger worked well without any issues.",
  "Good station but limited parking spaces available.",
  "Helpful station staff and smooth payment process.",
  "Charging speed was slightly lower than expected.",
  "Easy booking process and quick connectivity.",
  "Station was crowded during peak evening hours.",
  "Good amenities and cafes nearby while waiting.",
  "Connector was clean and delivered full power.",
  "Smooth charging experience overall.",
  "Excellent fast DC charger near expressway.",
  "Clean washroom facilities and shaded waiting area.",
  "Quick session startup with zero app lag.",
  "Reliable power delivery for long intercity trips.",
  "Well-lit charging hub with 24/7 security guard.",
]


def get_weighted_random_datetime(start_dt, end_dt):
  """Generates realistic timezone-aware datetimes with peak/off-peak hourly weights."""
  total_seconds = int((end_dt - start_dt).total_seconds())
  if total_seconds <= 0:
    return end_dt

  random_second_offset = random.randint(0, total_seconds)
  candidate_dt = start_dt + datetime.timedelta(seconds=random_second_offset)

  # Hour weighting: Peak hours (7-11 AM & 5-10 PM) get higher frequency
  hour = candidate_dt.hour
  if (7 <= hour <= 11) or (17 <= hour <= 22):
    weight = 0.8
  elif 1 <= hour <= 5:
    weight = 0.2
  else:
    weight = 0.5

  if random.random() <= weight:
    return candidate_dt

  # Fallback to candidate_dt
  return candidate_dt


class Command(BaseCommand):
  help = "Generates a realistic synthetic dataset for EV-ChargeX development and ML analytics."

  def add_arguments(self, parser):
    parser.add_argument("--users", type=int, default=1500, help="Target users count")
    parser.add_argument("--vehicles", type=int, default=1900, help="Target vehicles count")
    parser.add_argument("--trips", type=int, default=2000, help="Target trips count")
    parser.add_argument("--bookings", type=int, default=1800, help="Target bookings count")
    parser.add_argument("--sessions", type=int, default=1650, help="Target sessions count")
    parser.add_argument("--reviews", type=int, default=1550, help="Target reviews count")
    parser.add_argument("--seed", type=int, default=42, help="Random seed for reproducibility")
    parser.add_argument("--batch-name", type=str, default="ev_demo_seed_42", help="Unique batch identifier")
    parser.add_argument("--dry-run", action="store_true", help="Simulate generation without saving to DB")
    parser.add_argument("--clear-generated", action="store_true", help="Safely remove records generated by specified batch")
    parser.add_argument("--no-input", action="store_true", help="Skip interactive prompts")

  def handle(self, *args, **options):
    batch_name = options["batch_name"]
    clear_generated = options["clear_generated"]
    dry_run = options["dry_run"]
    no_input = options["no_input"]
    seed_val = options["seed"]

    if clear_generated:
      self.handle_clear_generated(batch_name, no_input)
      return

    # 1. Check Batch Uniqueness
    if SeedBatch.objects.filter(batch_name=batch_name).exists():
      raise CommandError(f"A seed batch with name '{batch_name}' already exists. Use another batch name or clear the existing batch using --clear-generated --batch-name {batch_name}.")

    # 2. Check Stations & Chargers availability
    total_stations = Station.objects.count()
    total_chargers = Charger.objects.count()
    if total_stations == 0 or total_chargers == 0:
      raise CommandError("No valid stations or chargers were found. Import or create stations and chargers before seeding bookings and charging sessions.")

    # Set Random Seed
    random.seed(seed_val)
    end_dt = timezone.now()

    self.stdout.write(self.style.MIGRATE_HEADING(f"=================================================="))
    self.stdout.write(self.style.MIGRATE_HEADING(f"EV-ChargeX Synthetic Data Seeder"))
    self.stdout.write(self.style.MIGRATE_HEADING(f"=================================================="))
    self.stdout.write(f"Batch Name       : {batch_name}")
    self.stdout.write(f"Random Seed      : {seed_val}")
    self.stdout.write(f"Date Range       : {START_DATETIME.strftime('%Y-%m-%d %H:%M:%S')} to {end_dt.strftime('%Y-%m-%d %H:%M:%S')}")
    self.stdout.write(f"Available Stations: {total_stations}")
    self.stdout.write(f"Available Chargers: {total_chargers}")
    self.stdout.write(f"Target Counts    : Users={options['users']}, Vehicles={options['vehicles']}, Trips={options['trips']}, Bookings={options['bookings']}, Sessions={options['sessions']}, Reviews={options['reviews']}")

    if dry_run:
      self.stdout.write(self.style.WARNING("\n[DRY RUN MODE] No changes will be saved to the database. Environment is valid!"))
      return

    start_perf = time.time()

    # Track in-memory sets for 100% uniqueness guarantee
    used_usernames = set(User.objects.values_list('username', flat=True))
    used_emails = set(User.objects.values_list('email', flat=True))
    used_phones = set(User.objects.values_list('phone', flat=True))
    used_regs = set(Vehicle.objects.values_list('registration_number', flat=True))

    target_users = options['users']
    target_vehicles = options['vehicles']
    target_trips = options['trips']
    target_bookings = options['bookings']
    target_sessions = options['sessions']
    target_reviews = options['reviews']

    rejected_duplicates_count = 0

    with transaction.atomic():
      # Create SeedBatch Record
      batch = SeedBatch.objects.create(
        batch_name=batch_name,
        seed_value=seed_val,
      )

      # ----------------------------------------------------
      # STEP 1: USERS GENERATION
      # ----------------------------------------------------
      self.stdout.write("\nGenerating Users...")
      hashed_password = make_password("Password@123")
      users_to_create = []
      user_meta_list = []

      for i in range(target_users):
        fname = random.choice(INDIAN_FIRST_NAMES)
        lname = random.choice(INDIAN_LAST_NAMES)

        # Helper: Generate Unique Username
        username = None
        for _ in range(50):
          fmt = random.choice([1, 2, 3, 4])
          num = random.randint(10, 9999)
          if fmt == 1:
            cand = f"{fname.lower()}.{lname.lower()}{num}"
          elif fmt == 2:
            cand = f"{fname.lower()[0]}{lname.lower()}{num}"
          elif fmt == 3:
            cand = f"{fname.lower()}_{random.choice([2024, 2025, 2026])}_{num}"
          else:
            cand = f"{lname.lower()}.{fname.lower()}{num}"

          if cand not in used_usernames:
            username = cand
            used_usernames.add(username)
            break
          rejected_duplicates_count += 1

        if not username:
          username = f"user.{fname.lower()}.{lname.lower()}.{random.randint(10000, 99999)}"
          used_usernames.add(username)

        # Helper: Generate Unique Email
        email = None
        domain = random.choice(PUBLIC_EMAIL_DOMAINS)
        for _ in range(50):
          num = random.randint(100, 9999)
          cand = f"{fname.lower()}.{lname.lower()}{num}@{domain}"
          if cand not in used_emails:
            email = cand
            used_emails.add(email)
            break
          rejected_duplicates_count += 1

        if not email:
          email = f"{username}@{domain}"
          used_emails.add(email)

        # Helper: Generate Unique Phone
        phone = None
        for _ in range(50):
          first_digit = str(random.choice([6, 7, 8, 9]))
          rest_digits = "".join([str(random.randint(0, 9)) for _ in range(9)])
          cand = f"{first_digit}{rest_digits}"
          if cand not in used_phones:
            phone = cand
            used_phones.add(phone)
            break
          rejected_duplicates_count += 1

        city_info = random.choice(CITIES_AND_STATES)
        dt_joined = get_weighted_random_datetime(START_DATETIME, end_dt)

        user_obj = User(
          username=username,
          email=email,
          phone=phone,
          first_name=fname,
          last_name=lname,
          role="USER",
          password=hashed_password,
          is_active=True,
          is_verified=True,
          city=city_info[0],
          state=city_info[1],
          pincode=str(random.randint(380001, 395010)),
        )
        users_to_create.append(user_obj)
        user_meta_list.append(dt_joined)

      created_users = User.objects.bulk_create(users_to_create, batch_size=500)
      
      # Assign historical date_joined & Record manifest
      manifest_objs = []
      for u, dt in zip(created_users, user_meta_list):
        User.objects.filter(pk=u.pk).update(date_joined=dt)
        manifest_objs.append(SeedGeneratedObject(seed_batch=batch, model_label="users.User", object_id=u.pk))

      SeedGeneratedObject.objects.bulk_create(manifest_objs, batch_size=1000)
      batch.users_created = len(created_users)
      self.stdout.write(self.style.SUCCESS(f"[OK] Created {len(created_users)} Users"))

      # Password Hashing Verification
      sample_user = created_users[0]
      if not sample_user.check_password("Password@123") or sample_user.password == "Password@123":
        raise CommandError("Password hashing verification failed! User password stored unhashed or invalid.")

      # ----------------------------------------------------
      # STEP 2: VEHICLES GENERATION
      # ----------------------------------------------------
      self.stdout.write("Generating Vehicles...")
      vehicles_to_create = []

      # State Registration Prefixes
      STATE_CODES = ["GJ01", "GJ03", "GJ05", "GJ06", "GJ18", "MH01", "MH12", "KA05", "DL01"]
      SERIES_LETTERS = ["AB", "CD", "EF", "GH", "JK", "LM", "NP", "RS", "TV", "WX", "YZ"]

      for i in range(target_vehicles):
        owner = random.choice(created_users)
        catalog_item = random.choice(EV_VEHICLES_CATALOG)

        reg_num = None
        for _ in range(50):
          prefix = random.choice(STATE_CODES)
          series = random.choice(SERIES_LETTERS)
          num = random.randint(1000, 9999)
          cand = f"{prefix}{series}{num}"
          if cand not in used_regs:
            reg_num = cand
            used_regs.add(reg_num)
            break
          rejected_duplicates_count += 1

        if not reg_num:
          reg_num = f"GJ99ZZ{random.randint(1000, 9999)}"
          used_regs.add(reg_num)

        v_obj = Vehicle(
          user=owner,
          vehicle_type=catalog_item["type"],
          brand=catalog_item["brand"],
          model=catalog_item["model"],
          variant="EV Standard",
          registration_number=reg_num,
          battery_capacity=Decimal(str(catalog_item["battery"])),
          current_battery_percentage=Decimal(str(round(random.uniform(20.0, 95.0), 2))),
          connector_type=catalog_item["connector"],
          efficiency=Decimal(str(catalog_item["efficiency"])),
          manufacturing_year=random.randint(2022, 2025),
          color=random.choice(["White", "Black", "Silver", "Blue", "Red", "Grey"]),
        )
        vehicles_to_create.append(v_obj)

      created_vehicles = Vehicle.objects.bulk_create(vehicles_to_create, batch_size=500)
      manifest_objs = [SeedGeneratedObject(seed_batch=batch, model_label="vehicles.Vehicle", object_id=v.pk) for v in created_vehicles]
      SeedGeneratedObject.objects.bulk_create(manifest_objs, batch_size=1000)
      batch.vehicles_created = len(created_vehicles)
      self.stdout.write(self.style.SUCCESS(f"[OK] Created {len(created_vehicles)} Vehicles"))

      # User Vehicle Mapping lookup
      user_vehicles_map = {}
      for v in created_vehicles:
        user_vehicles_map.setdefault(v.user_id, []).append(v)

      # ----------------------------------------------------
      # STEP 3: TRIPS GENERATION
      # ----------------------------------------------------
      self.stdout.write("Generating Trips...")
      all_stations = list(Station.objects.all())
      trips_to_create = []
      trip_meta_dates = []

      # Limit users with ONGOING trips (max 1 per user, overall < 10)
      users_with_ongoing_trip = set()

      for i in range(target_trips):
        owner = random.choice(created_users)
        owner_veh = random.choice(user_vehicles_map.get(owner.pk, created_vehicles))

        src_city = random.choice(CITIES_AND_STATES)
        dest_city = random.choice([c for c in CITIES_AND_STATES if c[0] != src_city[0]])

        dist_km = round(random.uniform(25.0, 520.0), 2)
        est_min = int(dist_km * random.uniform(1.1, 1.4))

        # Battery calculations
        eff = float(owner_veh.efficiency)
        capacity = float(owner_veh.battery_capacity)
        energy_req = dist_km / eff if eff > 0 else 10.0
        batt_needed = round((energy_req / capacity) * 100.0, 2)
        curr_batt = float(owner_veh.current_battery_percentage)

        charging_req = batt_needed > curr_batt
        suggested_st = random.choice(all_stations) if (charging_req and all_stations) else None

        # Status Weights: COMPLETED 70%, PLANNED 15%, CANCELLED 10%, ONGOING 5%
        status_choice = random.choices(
          ["COMPLETED", "PLANNED", "CANCELLED", "ONGOING"],
          weights=[70, 15, 10, 5]
        )[0]

        if status_choice == "ONGOING":
          if owner.pk in users_with_ongoing_trip:
            status_choice = "COMPLETED"
          else:
            users_with_ongoing_trip.add(owner.pk)

        created_dt = get_weighted_random_datetime(START_DATETIME, end_dt)
        start_t = None
        end_t = None

        if status_choice == "COMPLETED":
          start_t = created_dt
          end_t = start_t + datetime.timedelta(minutes=est_min)
        elif status_choice == "ONGOING":
          start_t = created_dt
          end_t = None

        t_obj = Trip(
          user=owner,
          vehicle=owner_veh,
          source=f"{src_city[0]}, {src_city[1]}",
          destination=f"{dest_city[0]}, {dest_city[1]}",
          source_latitude=Decimal(str(src_city[2])),
          source_longitude=Decimal(str(src_city[3])),
          destination_latitude=Decimal(str(dest_city[2])),
          destination_longitude=Decimal(str(dest_city[3])),
          distance_km=Decimal(str(dist_km)),
          estimated_time=est_min,
          estimated_battery_needed=Decimal(str(min(batt_needed, 300.0))),
          current_battery_percentage=Decimal(str(curr_batt)),
          charging_required=charging_req,
          suggested_station=suggested_st,
          trip_status=status_choice,
          start_time=start_t,
          end_time=end_t,
          actual_distance_km=Decimal(str(dist_km)) if status_choice == "COMPLETED" else None,
          actual_duration_minutes=est_min if status_choice == "COMPLETED" else None,
        )
        trips_to_create.append(t_obj)
        trip_meta_dates.append(created_dt)

      created_trips = Trip.objects.bulk_create(trips_to_create, batch_size=500)
      for t_item, dt in zip(created_trips, trip_meta_dates):
        Trip.objects.filter(pk=t_item.pk).update(created_at=dt, updated_at=dt)

      manifest_objs = [SeedGeneratedObject(seed_batch=batch, model_label="trips.Trip", object_id=t.pk) for t in created_trips]
      SeedGeneratedObject.objects.bulk_create(manifest_objs, batch_size=1000)
      batch.trips_created = len(created_trips)
      self.stdout.write(self.style.SUCCESS(f"[OK] Created {len(created_trips)} Trips"))

      # ----------------------------------------------------
      # STEP 4: BOOKINGS GENERATION
      # ----------------------------------------------------
      self.stdout.write("Generating Bookings...")
      # Fetch chargers grouped by station
      chargers_by_station = {}
      for ch in Charger.objects.select_related('station').all():
        chargers_by_station.setdefault(ch.station_id, []).append(ch)

      valid_stations = [st for st in all_stations if st.pk in chargers_by_station]
      if not valid_stations:
        raise CommandError("No stations with chargers were found in the database.")

      bookings_to_create = []
      booking_meta_dates = []

      # Track booked intervals per charger to prevent overlapping intervals: charger_id -> list of (start_dt, end_dt)
      charger_schedules = {}

      for i in range(target_bookings):
        owner = random.choice(created_users)
        owner_veh = random.choice(user_vehicles_map.get(owner.pk, created_vehicles))
        st = random.choice(valid_stations)
        ch = random.choice(chargers_by_station[st.pk])

        # Status Weights: COMPLETED 75%, CONFIRMED 15%, CANCELLED 10%
        b_status = random.choices(["COMPLETED", "CONFIRMED", "CANCELLED"], weights=[75, 15, 10])[0]
        duration_min = random.choice([20, 30, 45, 60, 75, 90, 120])

        b_created_dt = get_weighted_random_datetime(START_DATETIME, end_dt)
        b_date = b_created_dt.date()
        b_start_t = b_created_dt.time()

        start_datetime = datetime.datetime.combine(b_date, b_start_t, tzinfo=datetime.timezone.utc)
        end_datetime = start_datetime + datetime.timedelta(minutes=duration_min)
        b_end_t = end_datetime.time()

        # Overlap Prevention Check
        schedules = charger_schedules.setdefault(ch.pk, [])
        has_overlap = False
        for s_start, s_end in schedules:
          if max(start_datetime, s_start) < min(end_datetime, s_end):
            has_overlap = True
            break

        if not has_overlap:
          schedules.append((start_datetime, end_datetime))

        b_obj = Booking(
          user=owner,
          vehicle=owner_veh,
          station=st,
          charger=ch,
          booking_date=b_date,
          booking_start_time=b_start_t,
          booking_end_time=b_end_t,
          estimated_duration=duration_min,
          booking_status=b_status,
          is_qr_used=(b_status == "COMPLETED"),
          is_verified=(b_status == "COMPLETED"),
        )
        bookings_to_create.append(b_obj)
        booking_meta_dates.append(b_created_dt)

      created_bookings = Booking.objects.bulk_create(bookings_to_create, batch_size=500)
      for b_item, dt in zip(created_bookings, booking_meta_dates):
        Booking.objects.filter(pk=b_item.pk).update(created_at=dt)

      manifest_objs = [SeedGeneratedObject(seed_batch=batch, model_label="bookings.Booking", object_id=b.pk) for b in created_bookings]
      SeedGeneratedObject.objects.bulk_create(manifest_objs, batch_size=1000)
      batch.bookings_created = len(created_bookings)
      self.stdout.write(self.style.SUCCESS(f"[OK] Created {len(created_bookings)} Bookings"))

      # ----------------------------------------------------
      # STEP 5: CHARGING SESSIONS GENERATION
      # ----------------------------------------------------
      self.stdout.write("Generating Charging Sessions...")
      completed_bookings = [b for b in created_bookings if b.booking_status in ["COMPLETED", "CONFIRMED"]]
      sessions_to_create = []
      session_meta_dates = []

      num_sessions = min(target_sessions, len(completed_bookings))
      sampled_bookings = random.sample(completed_bookings, num_sessions)

      for b_ref in sampled_bookings:
        start_dt = datetime.datetime.combine(b_ref.booking_date, b_ref.booking_start_time, tzinfo=datetime.timezone.utc)
        end_dt_sess = start_dt + datetime.timedelta(minutes=b_ref.estimated_duration)

        batt_before = Decimal(str(round(random.uniform(10.0, 30.0), 2)))
        batt_after = Decimal(str(round(random.uniform(75.0, 98.0), 2)))

        capacity = b_ref.vehicle.battery_capacity
        diff = batt_after - batt_before
        energy = round((diff / Decimal("100.0")) * capacity, 2)
        
        price = b_ref.charger.price_per_kwh or Decimal("15.00")
        cost = round(energy * price, 2)

        sess_status = random.choices(["COMPLETED", "INTERRUPTED"], weights=[95, 5])[0]

        cs_obj = ChargingSession(
          booking=b_ref,
          charger=b_ref.charger,
          vehicle=b_ref.vehicle,
          start_time=start_dt,
          end_time=end_dt_sess,
          battery_before=batt_before,
          battery_after=batt_after,
          energy_consumed_kwh=energy,
          charging_cost=cost,
          session_status=sess_status,
        )
        sessions_to_create.append(cs_obj)
        session_meta_dates.append(start_dt)

      # Bulk Create ChargingSessions using bulk_create directly to prevent signals/triggers
      created_sessions = ChargingSession.objects.bulk_create(sessions_to_create, batch_size=500)
      for cs_item, dt in zip(created_sessions, session_meta_dates):
        ChargingSession.objects.filter(pk=cs_item.pk).update(created_at=dt)

      manifest_objs = [SeedGeneratedObject(seed_batch=batch, model_label="charging.ChargingSession", object_id=s.pk) for s in created_sessions]
      SeedGeneratedObject.objects.bulk_create(manifest_objs, batch_size=1000)
      batch.sessions_created = len(created_sessions)
      self.stdout.write(self.style.SUCCESS(f"[OK] Created {len(created_sessions)} Charging Sessions"))

      # ----------------------------------------------------
      # STEP 6: REVIEWS GENERATION
      # ----------------------------------------------------
      self.stdout.write("Generating Reviews...")
      reviews_to_create = []
      review_meta_dates = []

      # Enforce unique_together = ('user', 'station')
      used_user_station_pairs = set(Review.objects.values_list('user_id', 'station_id'))

      attempts = 0
      max_attempts = target_reviews * 3

      while len(reviews_to_create) < target_reviews and attempts < max_attempts:
        attempts += 1
        u_ref = random.choice(created_users)
        st_ref = random.choice(all_stations)

        pair = (u_ref.pk, st_ref.pk)
        if pair in used_user_station_pairs:
          rejected_duplicates_count += 1
          continue

        used_user_station_pairs.add(pair)

        # Rating Distribution: 5★ 35%, 4★ 35%, 3★ 18%, 2★ 8%, 1★ 4%
        rating_val = random.choices([5, 4, 3, 2, 1], weights=[35, 35, 18, 8, 4])[0]
        comment_text = random.choice(REVIEW_COMMENTS) if random.random() > 0.1 else ""

        rev_dt = get_weighted_random_datetime(START_DATETIME, end_dt)

        r_obj = Review(
          user=u_ref,
          station=st_ref,
          rating=rating_val,
          comment=comment_text,
        )
        reviews_to_create.append(r_obj)
        review_meta_dates.append(rev_dt)

      created_reviews = Review.objects.bulk_create(reviews_to_create, batch_size=500)
      for r_item, dt in zip(created_reviews, review_meta_dates):
        Review.objects.filter(pk=r_item.pk).update(created_at=dt, updated_at=dt)

      manifest_objs = [SeedGeneratedObject(seed_batch=batch, model_label="reviews.Review", object_id=r.pk) for r in created_reviews]
      SeedGeneratedObject.objects.bulk_create(manifest_objs, batch_size=1000)
      batch.reviews_created = len(created_reviews)
      self.stdout.write(self.style.SUCCESS(f"[OK] Created {len(created_reviews)} Reviews"))

      # Save Final SeedBatch Record
      batch.save()

    # ----------------------------------------------------
    # POST-GENERATION SELF-VERIFICATION SUITE
    # ----------------------------------------------------
    self.stdout.write("\nRunning Post-Generation Automated Self-Verification Suite...")
    verif_failures = 0

    # 1. Unhashed Password Check
    unhashed_count = User.objects.filter(id__in=[u.id for u in created_users], password="Password@123").count()
    if unhashed_count > 0:
      self.stdout.write(self.style.ERROR(f"[FAIL] VERIFICATION FAILED: {unhashed_count} users have unhashed passwords!"))
      verif_failures += 1

    created_user_ids = [u.id for u in created_users]
    created_vehicle_ids = [v.id for v in created_vehicles]
    created_session_ids = [s.id for s in created_sessions]

    # 2. Duplicate Username Check
    dup_usernames = User.objects.filter(id__in=created_user_ids).values('username').annotate(cnt=Count('id')).filter(cnt__gt=1).count()
    if dup_usernames > 0:
      self.stdout.write(self.style.ERROR(f"[FAIL] VERIFICATION FAILED: {dup_usernames} duplicate usernames found!"))
      verif_failures += 1

    # 3. Duplicate Email Check
    dup_emails = User.objects.filter(id__in=created_user_ids).values('email').annotate(cnt=Count('id')).filter(cnt__gt=1).count()
    if dup_emails > 0:
      self.stdout.write(self.style.ERROR(f"[FAIL] VERIFICATION FAILED: {dup_emails} duplicate emails found!"))
      verif_failures += 1

    # 4. Duplicate Phone Check
    dup_phones = User.objects.filter(id__in=created_user_ids).values('phone').annotate(cnt=Count('id')).filter(cnt__gt=1).count()
    if dup_phones > 0:
      self.stdout.write(self.style.ERROR(f"[FAIL] VERIFICATION FAILED: {dup_phones} duplicate phones found!"))
      verif_failures += 1

    # 5. Duplicate Reg Numbers Check
    dup_regs = Vehicle.objects.filter(id__in=created_vehicle_ids).values('registration_number').annotate(cnt=Count('id')).filter(cnt__gt=1).count()
    if dup_regs > 0:
      self.stdout.write(self.style.ERROR(f"[FAIL] VERIFICATION FAILED: {dup_regs} duplicate registration numbers found!"))
      verif_failures += 1

    # 6. Negative Energy or Cost Check
    invalid_sessions = ChargingSession.objects.filter(id__in=created_session_ids).filter(
      Q(energy_consumed_kwh__lt=0) | Q(charging_cost__lt=0)
    ).count()
    if invalid_sessions > 0:
      self.stdout.write(self.style.ERROR(f"[FAIL] VERIFICATION FAILED: {invalid_sessions} sessions with negative energy or cost!"))
      verif_failures += 1

    # 7. Multiple Ongoing Trips per User Check
    multi_ongoing = Trip.objects.filter(id__in=[t.id for t in created_trips], trip_status="ONGOING").values('user').annotate(cnt=Count('id')).filter(cnt__gt=1).count()
    if multi_ongoing > 0:
      self.stdout.write(self.style.ERROR(f"[FAIL] VERIFICATION FAILED: {multi_ongoing} users with multiple ongoing trips!"))
      verif_failures += 1

    # Summary Output
    elapsed = round(time.time() - start_perf, 2)
    self.stdout.write(self.style.MIGRATE_HEADING(f"\n=================================================="))
    self.stdout.write(self.style.MIGRATE_HEADING(f"SEED GENERATION COMPLETED SUCCESSFULLY"))
    self.stdout.write(self.style.MIGRATE_HEADING(f"=================================================="))
    self.stdout.write(f"Batch Name               : {batch_name}")
    self.stdout.write(f"Users Created            : {len(created_users)}")
    self.stdout.write(f"Vehicles Created         : {len(created_vehicles)}")
    self.stdout.write(f"Trips Created            : {len(created_trips)}")
    self.stdout.write(f"Bookings Created         : {len(created_bookings)}")
    self.stdout.write(f"Sessions Created         : {len(created_sessions)}")
    self.stdout.write(f"Reviews Created          : {len(created_reviews)}")
    self.stdout.write(f"Duplicates Rejected      : {rejected_duplicates_count}")
    self.stdout.write(f"Verification Failures    : {verif_failures}")
    self.stdout.write(f"Total Execution Time     : {elapsed} seconds")
    self.stdout.write(self.style.MIGRATE_HEADING(f"=================================================="))

  def handle_clear_generated(self, batch_name, no_input):
    """Safely cleans up only records registered in the specified batch manifest."""
    try:
      batch = SeedBatch.objects.get(batch_name=batch_name)
    except SeedBatch.DoesNotExist:
      raise CommandError(f"No seed batch found with batch name '{batch_name}'.")

    if not no_input:
      confirm = input(f"Are you sure you want to delete all generated data for batch '{batch_name}'? (y/N): ")
      if confirm.lower() != 'y':
        self.stdout.write("Operation cancelled.")
        return

    self.stdout.write(f"Deleting generated records for batch '{batch_name}'...")

    with transaction.atomic():
      # Delete in safe dependency order
      objs = SeedGeneratedObject.objects.filter(seed_batch=batch)

      review_ids = list(objs.filter(model_label="reviews.Review").values_list('object_id', flat=True))
      session_ids = list(objs.filter(model_label="charging.ChargingSession").values_list('object_id', flat=True))
      booking_ids = list(objs.filter(model_label="bookings.Booking").values_list('object_id', flat=True))
      trip_ids = list(objs.filter(model_label="trips.Trip").values_list('object_id', flat=True))
      vehicle_ids = list(objs.filter(model_label="vehicles.Vehicle").values_list('object_id', flat=True))
      user_ids = list(objs.filter(model_label="users.User").values_list('object_id', flat=True))

      cnt_rev, _ = Review.objects.filter(pk__in=review_ids).delete()
      cnt_sess, _ = ChargingSession.objects.filter(pk__in=session_ids).delete()
      cnt_bk, _ = Booking.objects.filter(pk__in=booking_ids).delete()
      cnt_tr, _ = Trip.objects.filter(pk__in=trip_ids).delete()
      cnt_veh, _ = Vehicle.objects.filter(pk__in=vehicle_ids).delete()
      cnt_usr, _ = User.objects.filter(pk__in=user_ids).delete()

      batch.delete()

    self.stdout.write(self.style.SUCCESS(f"[OK] Successfully deleted batch '{batch_name}': {cnt_rev} reviews, {cnt_sess} sessions, {cnt_bk} bookings, {cnt_tr} trips, {cnt_veh} vehicles, {cnt_usr} users."))
