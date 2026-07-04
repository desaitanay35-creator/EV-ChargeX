from django.contrib import admin
from .models import Charger, ChargingSession

admin.site.register(Charger)
admin.site.register(ChargingSession)