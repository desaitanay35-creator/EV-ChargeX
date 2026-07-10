import requests
from django.conf import settings
API_URL = "https://api.openchargemap.io/v3/poi"

API_KEY = settings.OPENCHARGEMAP_API_KEY




def fetch_stations(latitude, longitude, distance=20):

    params = {
        "output": "json",
        "countrycode": "IN",
        "latitude": latitude,
        "longitude": longitude,
        "distance": distance,
        "distanceunit": "KM",
        "maxresults": 20,
        "key": API_KEY,
    }

    headers = {
        "X-API-Key": API_KEY,
        "User-Agent": "EVChargeX/1.0"
    }

    response = requests.get(
        API_URL,
        params=params,
        headers=headers,
        timeout=15,
    )

    return response.json()