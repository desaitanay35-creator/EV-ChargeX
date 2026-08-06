import os
import sys
import django
import random
from decimal import Decimal

# Setup Django
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'evchargex.settings')
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()
from vehicles.models import Vehicle
from stations.models import Station

def update():
    print("--- Starting DB User and Vehicle Updates ---")
    
    # 1. Keep list of seeded customer users from the seeder
    new_usernames = [
        "aravind_shah", "priya_patel", "rahul_sharma", "neha_mehta", "amit_joshi",
        "pooja_desai", "vikram_rathod", "sanjana_vyas", "deepak_trivedi", "ananya_dave"
    ]
    
    # Create the 3 new operators: adani, tata, torent
    print("Creating new operators...")
    operators = []
    op_data = [
        ("adani", "adani@evchargex.com"),
        ("tata", "tata@evchargex.com"),
        ("torent", "torent@evchargex.com")
    ]
    # Ensure operators exist and are lowercase
    operators = []
    op_data = [
        ("adani", "adani@evchargex.com"),
        ("tata", "tata@evchargex.com"),
        ("torent", "torent@evchargex.com")
    ]
    for username, email in op_data:
        op = User.objects.filter(username__iexact=username).first()
        if op:
            op.username = username  # Force lowercase
            op.email = email
            op.role = 'OPERATOR'
            op.set_password("password123")
            op.save()
        else:
            op = User.objects.create_user(
                username=username,
                email=email,
                password="password123",
                role="OPERATOR",
                is_verified=True,
                phone=f"+9199{random.randint(10000000, 99999999)}"
            )
        operators.append(op)
        
    # Assign all 205 stations to these three new operators in equal portions first
    stations = list(Station.objects.all())
    print(f"Assigning {len(stations)} stations to the 3 new operators in equal portions...")
    for idx, station in enumerate(stations):
        op = operators[idx % len(operators)]
        station.operator = op
        station.availability_is_live = True
        station.save(update_fields=['operator', 'availability_is_live'])
        
    # Now it is safe to delete old operators without losing stations
    new_op_usernames = ["adani", "tata", "torent"]
    old_operators = User.objects.filter(role='OPERATOR').exclude(username__in=new_op_usernames)
    print(f"Deleting {old_operators.count()} old operators...")
    old_operators.delete()

    # Delete old customer users except admin and the ones in our keep list
    old_users_to_delete = User.objects.filter(is_superuser=False).exclude(username__in=new_usernames).exclude(role='OPERATOR')
    print(f"Deleting {old_users_to_delete.count()} old customer users...")
    old_users_to_delete.delete()
        
    # Set efficiency of all existing vehicles to 3.20 km/kWh
    print("Setting efficiency of all existing vehicles to 3.20...")
    Vehicle.objects.all().update(efficiency=Decimal("3.20"))
    
    # Add 10 more cars in vehicle table (1 for each of the 10 customer users)
    print("Adding 10 more vehicles to the database...")
    Vehicle.objects.filter(registration_number__startswith="GJ01EV5").delete()
    customer_users = User.objects.filter(username__in=new_usernames)
    
    reg_num_counter = 5000
    for idx, u in enumerate(customer_users):
        Vehicle.objects.create(
            user=u,
            vehicle_type="Car",
            brand="Hyundai" if idx % 2 == 0 else "Tata",
            model="Kona EV" if idx % 2 == 0 else "Nexon EV Max",
            registration_number=f"GJ01EV{reg_num_counter}",
            battery_capacity=Decimal("39.20") if idx % 2 == 0 else Decimal("40.50"),
            current_battery_percentage=Decimal("75.0"),
            connector_type="CCS2",
            efficiency=Decimal("3.20"), # 3.2 km/kWh means range is small enough that typical trips will require charging in the middle
            manufacturing_year=2023,
            color="Red" if idx % 2 == 0 else "Teal"
        )
        reg_num_counter += 1
        
    print("DB updates completed successfully!")

if __name__ == '__main__':
    update()
