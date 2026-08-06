import os
import sys
import django

sys.path.append(os.path.abspath(os.path.dirname(__file__)))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "evchargex.settings")
django.setup()

from django.db import transaction
from stations.models import Station
from charging.models import Charger
from users.models import User


interstate_stations_data = [
    # Himatnagar & Shamlaji (Gujarat-Rajasthan Border)
    {
        "station_name": "Tata Power Hub - Himatnagar Bypass (NH-48)",
        "address": "NH-48, Near Motipura Circle",
        "city": "Himatnagar",
        "state": "Gujarat",
        "pincode": "383001",
        "latitude": 23.6000,
        "longitude": 73.0000,
        "contact_number": "+91 98250 11001",
        "operator_name": "Tata Power EV Charging",
        "external_source": "MANUAL",
        "availability_is_live": True,
        "chargers": [
            {"connector_type": "CCS2", "power_output_kw": 60, "price_per_kwh": 16.50, "status": "AVAILABLE"},
            {"connector_type": "Type2", "power_output_kw": 22, "price_per_kwh": 14.00, "status": "AVAILABLE"},
        ]
    },
    {
        "station_name": "Jio-bp Pulse - Shamlaji Border Plaza (NH-48)",
        "address": "NH-48, Gujarat-Rajasthan Border",
        "city": "Shamlaji",
        "state": "Gujarat",
        "pincode": "383355",
        "latitude": 23.8500,
        "longitude": 73.3500,
        "contact_number": "+91 98250 11002",
        "operator_name": "Jio-bp Pulse",
        "external_source": "MANUAL",
        "availability_is_live": True,
        "chargers": [
            {"connector_type": "CCS2", "power_output_kw": 120, "price_per_kwh": 18.00, "status": "AVAILABLE"},
            {"connector_type": "CCS2", "power_output_kw": 60, "price_per_kwh": 16.00, "status": "AVAILABLE"},
        ]
    },
    # Udaipur Region (Rajasthan)
    {
        "station_name": "Zeon Charging Superhub - Udaipur NH-48",
        "address": "NH-48, Paras Circle, Near Goverdhan Vilas",
        "city": "Udaipur",
        "state": "Rajasthan",
        "pincode": "313001",
        "latitude": 24.5850,
        "longitude": 73.7120,
        "contact_number": "+91 98290 22001",
        "operator_name": "Zeon Charging",
        "external_source": "MANUAL",
        "availability_is_live": True,
        "chargers": [
            {"connector_type": "CCS2", "power_output_kw": 150, "price_per_kwh": 19.50, "status": "AVAILABLE"},
            {"connector_type": "CHAdeMO", "power_output_kw": 50, "price_per_kwh": 17.00, "status": "AVAILABLE"},
            {"connector_type": "GB/T", "power_output_kw": 50, "price_per_kwh": 16.00, "status": "AVAILABLE"},
        ]
    },
    {
        "station_name": "Tata Power Hub - Nathdwara Bypass (NH-48)",
        "address": "NH-48 Highway Plaza, Nathdwara",
        "city": "Nathdwara",
        "state": "Rajasthan",
        "pincode": "313301",
        "latitude": 24.8900,
        "longitude": 73.8200,
        "contact_number": "+91 98290 22002",
        "operator_name": "Tata Power EV Charging",
        "external_source": "MANUAL",
        "availability_is_live": True,
        "chargers": [
            {"connector_type": "CCS2", "power_output_kw": 60, "price_per_kwh": 16.50, "status": "AVAILABLE"},
            {"connector_type": "Type2", "power_output_kw": 22, "price_per_kwh": 14.00, "status": "AVAILABLE"},
        ]
    },
    # Bhilwara & Beawar (Rajasthan)
    {
        "station_name": "Statiq EV Station - Bhilwara Highway (NH-48)",
        "address": "NH-48 Bypass, Near Hotel Landmark",
        "city": "Bhilwara",
        "state": "Rajasthan",
        "pincode": "311001",
        "latitude": 25.3500,
        "longitude": 74.6300,
        "contact_number": "+91 98290 22003",
        "operator_name": "Statiq",
        "external_source": "MANUAL",
        "availability_is_live": True,
        "chargers": [
            {"connector_type": "CCS2", "power_output_kw": 60, "price_per_kwh": 16.00, "status": "AVAILABLE"},
            {"connector_type": "Type2", "power_output_kw": 22, "price_per_kwh": 13.50, "status": "AVAILABLE"},
        ]
    },
    {
        "station_name": "ChargeZone - Beawar Junction Hub (NH-48)",
        "address": "NH-48, Beawar Toll Plaza Junction",
        "city": "Beawar",
        "state": "Rajasthan",
        "pincode": "305901",
        "latitude": 26.1000,
        "longitude": 74.3200,
        "contact_number": "+91 98290 22004",
        "operator_name": "ChargeZone",
        "external_source": "MANUAL",
        "availability_is_live": True,
        "chargers": [
            {"connector_type": "CCS2", "power_output_kw": 120, "price_per_kwh": 17.50, "status": "AVAILABLE"},
            {"connector_type": "CCS2", "power_output_kw": 60, "price_per_kwh": 15.50, "status": "AVAILABLE"},
        ]
    },
    # Ajmer & Kishangarh (Rajasthan)
    {
        "station_name": "Tata Power EZ Charge - Ajmer Bypass (NH-48)",
        "address": "NH-48, Jaipur Road, Near Janana Hospital Circle",
        "city": "Ajmer",
        "state": "Rajasthan",
        "pincode": "305001",
        "latitude": 26.4500,
        "longitude": 74.6400,
        "contact_number": "+91 98290 22005",
        "operator_name": "Tata Power EZ Charge",
        "external_source": "MANUAL",
        "availability_is_live": True,
        "chargers": [
            {"connector_type": "CCS2", "power_output_kw": 60, "price_per_kwh": 16.50, "status": "AVAILABLE"},
            {"connector_type": "Type2", "power_output_kw": 22, "price_per_kwh": 14.00, "status": "AVAILABLE"},
        ]
    },
    {
        "station_name": "Jio-bp Pulse - Kishangarh Marble Plaza (NH-48)",
        "address": "NH-48, Kishangarh Toll Plaza",
        "city": "Kishangarh",
        "state": "Rajasthan",
        "pincode": "305801",
        "latitude": 26.5800,
        "longitude": 74.8600,
        "contact_number": "+91 98290 22006",
        "operator_name": "Jio-bp Pulse",
        "external_source": "MANUAL",
        "availability_is_live": True,
        "chargers": [
            {"connector_type": "CCS2", "power_output_kw": 150, "price_per_kwh": 19.00, "status": "AVAILABLE"},
            {"connector_type": "CHAdeMO", "power_output_kw": 50, "price_per_kwh": 17.00, "status": "AVAILABLE"},
        ]
    },
    # Jaipur Expressway (Rajasthan)
    {
        "station_name": "Zeon Fast Charger - Jaipur Ajmer Expressway (NH-48)",
        "address": "NH-48, 200 Feet Bypass, Ajmer Road",
        "city": "Jaipur",
        "state": "Rajasthan",
        "pincode": "302021",
        "latitude": 26.8500,
        "longitude": 75.7600,
        "contact_number": "+91 98290 22007",
        "operator_name": "Zeon Charging",
        "external_source": "MANUAL",
        "availability_is_live": True,
        "chargers": [
            {"connector_type": "CCS2", "power_output_kw": 180, "price_per_kwh": 20.00, "status": "AVAILABLE"},
            {"connector_type": "CCS2", "power_output_kw": 60, "price_per_kwh": 16.50, "status": "AVAILABLE"},
            {"connector_type": "GB/T", "power_output_kw": 50, "price_per_kwh": 15.50, "status": "AVAILABLE"},
        ]
    },
    {
        "station_name": "Statiq EV Station - Jaipur Delhi Highway (NH-48)",
        "address": "NH-48, Kukas, Near Amity University Gate",
        "city": "Jaipur",
        "state": "Rajasthan",
        "pincode": "302038",
        "latitude": 26.9800,
        "longitude": 75.8500,
        "contact_number": "+91 98290 22008",
        "operator_name": "Statiq",
        "external_source": "MANUAL",
        "availability_is_live": True,
        "chargers": [
            {"connector_type": "CCS2", "power_output_kw": 120, "price_per_kwh": 18.00, "status": "AVAILABLE"},
            {"connector_type": "Type2", "power_output_kw": 22, "price_per_kwh": 14.00, "status": "AVAILABLE"},
        ]
    },
    # Shahpura & Kotputli (Rajasthan)
    {
        "station_name": "ChargeZone - Shahpura Highway Plaza (NH-48)",
        "address": "NH-48, Shahpura Bypass",
        "city": "Shahpura",
        "state": "Rajasthan",
        "pincode": "303103",
        "latitude": 27.3900,
        "longitude": 75.9600,
        "contact_number": "+91 98290 22009",
        "operator_name": "ChargeZone",
        "external_source": "MANUAL",
        "availability_is_live": True,
        "chargers": [
            {"connector_type": "CCS2", "power_output_kw": 60, "price_per_kwh": 16.00, "status": "AVAILABLE"},
            {"connector_type": "Type2", "power_output_kw": 22, "price_per_kwh": 13.50, "status": "AVAILABLE"},
        ]
    },
    {
        "station_name": "Tata Power Hub - Kotputli Highway Plaza (NH-48)",
        "address": "NH-48, Kotputli Bypass",
        "city": "Kotputli",
        "state": "Rajasthan",
        "pincode": "303108",
        "latitude": 27.7000,
        "longitude": 76.2000,
        "contact_number": "+91 98290 22010",
        "operator_name": "Tata Power EZ Charge",
        "external_source": "MANUAL",
        "availability_is_live": True,
        "chargers": [
            {"connector_type": "CCS2", "power_output_kw": 120, "price_per_kwh": 17.50, "status": "AVAILABLE"},
            {"connector_type": "CCS2", "power_output_kw": 60, "price_per_kwh": 16.00, "status": "AVAILABLE"},
        ]
    },
    # Neemrana & Rewari (Rajasthan-Haryana Border)
    {
        "station_name": "Jio-bp Pulse - Neemrana Fort Hub (NH-48)",
        "address": "NH-48, Neemrana Japanese Zone Gate",
        "city": "Neemrana",
        "state": "Rajasthan",
        "pincode": "301705",
        "latitude": 27.9900,
        "longitude": 76.3800,
        "contact_number": "+91 98120 33001",
        "operator_name": "Jio-bp Pulse",
        "external_source": "MANUAL",
        "availability_is_live": True,
        "chargers": [
            {"connector_type": "CCS2", "power_output_kw": 150, "price_per_kwh": 18.50, "status": "AVAILABLE"},
            {"connector_type": "Type2", "power_output_kw": 22, "price_per_kwh": 14.00, "status": "AVAILABLE"},
        ]
    },
    {
        "station_name": "Statiq EV Station - Bahrwor Rewari Junction (NH-48)",
        "address": "NH-48 Highway Junction, Bahrwor",
        "city": "Rewari",
        "state": "Haryana",
        "pincode": "123401",
        "latitude": 28.1800,
        "longitude": 76.6200,
        "contact_number": "+91 98120 33002",
        "operator_name": "Statiq",
        "external_source": "MANUAL",
        "availability_is_live": True,
        "chargers": [
            {"connector_type": "CCS2", "power_output_kw": 60, "price_per_kwh": 16.00, "status": "AVAILABLE"},
            {"connector_type": "CCS2", "power_output_kw": 60, "price_per_kwh": 16.00, "status": "AVAILABLE"},
        ]
    },
    # Gurgaon & Delhi NCR
    {
        "station_name": "Zeon Supercharger - Manesar Industrial Plaza (NH-48)",
        "address": "NH-48, IMT Manesar Sector 1",
        "city": "Gurgaon",
        "state": "Haryana",
        "pincode": "122051",
        "latitude": 28.3500,
        "longitude": 76.9300,
        "contact_number": "+91 98120 33003",
        "operator_name": "Zeon Charging",
        "external_source": "MANUAL",
        "availability_is_live": True,
        "chargers": [
            {"connector_type": "CCS2", "power_output_kw": 180, "price_per_kwh": 19.50, "status": "AVAILABLE"},
            {"connector_type": "CHAdeMO", "power_output_kw": 50, "price_per_kwh": 17.00, "status": "AVAILABLE"},
        ]
    },
    {
        "station_name": "Tata Power Superhub - Cyber City Gurgaon (NH-48)",
        "address": "NH-48, DLF Cyber City Phase 2",
        "city": "Gurgaon",
        "state": "Haryana",
        "pincode": "122002",
        "latitude": 28.4590,
        "longitude": 77.0260,
        "contact_number": "+91 98120 33004",
        "operator_name": "Tata Power EZ Charge",
        "external_source": "MANUAL",
        "availability_is_live": True,
        "chargers": [
            {"connector_type": "CCS2", "power_output_kw": 120, "price_per_kwh": 18.00, "status": "AVAILABLE"},
            {"connector_type": "Type2", "power_output_kw": 22, "price_per_kwh": 14.50, "status": "AVAILABLE"},
        ]
    },
    {
        "station_name": "Jio-bp Pulse - Delhi IGI Airport Aerocity (NH-48)",
        "address": "Aerocity Complex, Near IGI Airport T3",
        "city": "New Delhi",
        "state": "Delhi",
        "pincode": "110037",
        "latitude": 28.5560,
        "longitude": 77.1000,
        "contact_number": "+91 98110 44001",
        "operator_name": "Jio-bp Pulse",
        "external_source": "MANUAL",
        "availability_is_live": True,
        "chargers": [
            {"connector_type": "CCS2", "power_output_kw": 240, "price_per_kwh": 21.00, "status": "AVAILABLE"},
            {"connector_type": "CCS2", "power_output_kw": 120, "price_per_kwh": 18.50, "status": "AVAILABLE"},
            {"connector_type": "GB/T", "power_output_kw": 50, "price_per_kwh": 16.50, "status": "AVAILABLE"},
        ]
    },
    {
        "station_name": "Tata Power Superhub - Connaught Place (New Delhi)",
        "address": "Inner Circle, Connaught Place",
        "city": "New Delhi",
        "state": "Delhi",
        "pincode": "110001",
        "latitude": 28.6130,
        "longitude": 77.2090,
        "contact_number": "+91 98110 44002",
        "operator_name": "Tata Power EZ Charge",
        "external_source": "MANUAL",
        "availability_is_live": True,
        "chargers": [
            {"connector_type": "CCS2", "power_output_kw": 120, "price_per_kwh": 18.50, "status": "AVAILABLE"},
            {"connector_type": "Type2", "power_output_kw": 22, "price_per_kwh": 14.00, "status": "AVAILABLE"},
        ]
    },
]

def run_seed():
    print("--- Seeding Interstate Highway Stations along NH-48 Corridor (Ahmedabad -> Udaipur -> Ajmer -> Jaipur -> Delhi) ---")

    operator_user = User.objects.filter(role="OPERATOR").first() or User.objects.filter(role="ADMIN").first()

    with transaction.atomic():
        created_stations = 0
        created_chargers = 0

        for item in interstate_stations_data:
            chargers_data = item.pop("chargers", [])

            station, created = Station.objects.get_or_create(
                station_name=item["station_name"],
                defaults={
                    "operator": operator_user,
                    "address": item["address"],
                    "city": item["city"],
                    "state": item["state"],
                    "pincode": item.get("pincode", ""),
                    "latitude": item["latitude"],
                    "longitude": item["longitude"],
                    "contact_number": item.get("contact_number", ""),
                    "operator_name": item.get("operator_name", "Tata Power"),
                    "external_source": item.get("external_source", "MANUAL"),
                    "availability_is_live": item.get("availability_is_live", True),
                    "status": "OPEN",
                    "rating": 4.5,
                }
            )

            if created:
                created_stations += 1
                for c_idx, c_data in enumerate(chargers_data):
                    charger_num = f"CHG-INTERSTATE-{station.id}-{c_idx + 1}"
                    Charger.objects.create(
                        station=station,
                        charger_name=f"Charger #{c_idx + 1} ({c_data['connector_type']})",
                        charger_number=charger_num,
                        connector_type=c_data["connector_type"],
                        power_output_kw=c_data["power_output_kw"],
                        price_per_kwh=c_data["price_per_kwh"],
                        status=c_data["status"],
                    )
                    created_chargers += 1


        print(f"Successfully added {created_stations} interstate stations and {created_chargers} fast chargers!")

    total_st = Station.objects.count()
    print(f"Total Stations in DB now: {total_st}")

if __name__ == "__main__":
    run_seed()
