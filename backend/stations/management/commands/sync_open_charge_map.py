from django.core.management.base import BaseCommand
from django.core.management import call_command


class Command(BaseCommand):
    help = "Periodic scheduled synchronization wrapper for Open Charge Map Gujarat/India dataset."

    def add_arguments(self, parser):
        parser.add_argument("--state", type=str, default="Gujarat", help="State to synchronize (default: Gujarat)")
        parser.add_argument("--max-results", type=int, default=5000, help="Max POIs to fetch during sync")

    def handle(self, *args, **options):
        state = options["state"]
        max_results = options["max_results"]

        self.stdout.write(self.style.NOTICE(f"Triggering scheduled sync for {state}..."))
        call_command(
            "import_open_charge_map",
            country="IN",
            state=state,
            max_results=max_results,
            update_existing=True
        )
        self.stdout.write(self.style.SUCCESS("Scheduled Open Charge Map synchronization complete."))
