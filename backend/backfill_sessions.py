import os
import sys
import django

# Setup Django
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'evchargex.settings')
django.setup()

from charging.models import ChargingSession

def backfill():
    print("--- Starting ChargingSession Station Backfill ---")
    sessions = ChargingSession.objects.filter(station__isnull=True)
    total = sessions.count()
    print(f"Found {total} sessions needing backfill.")
    
    updated = 0
    for s in sessions:
        if s.charger:
            s.station = s.charger.station
            s.save(update_fields=['station'])
            updated += 1
            if updated % 200 == 0:
                print(f"Processed {updated}/{total}...")
                
    print(f"Backfill complete! Updated {updated} sessions.")

if __name__ == '__main__':
    backfill()
