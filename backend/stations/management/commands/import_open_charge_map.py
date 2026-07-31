import json
import os
import time
from pathlib import Path
from django.core.management.base import BaseCommand
from django.utils import timezone

from stations.integrations.open_charge_map import (
    fetch_open_charge_map_pois,
    fetch_open_charge_map_pois_india,
    normalize_poi_data,
    process_import_records,
)


class Command(BaseCommand):
    help = "Import and normalize EV charging stations from Open Charge Map for India / regional expansion."

    def add_arguments(self, parser):
        parser.add_argument("--country", type=str, default="IN", help="Country code (default: IN)")
        parser.add_argument("--scope", type=str, default="india", choices=["india", "gujarat", "region", "state"], help="Import scope")
        parser.add_argument("--target-count", type=int, default=2500, help="Target POI count for India import")
        parser.add_argument("--max-results-per-region", type=int, default=500, help="Max results per regional query")
        parser.add_argument("--region", type=str, default=None, help="Filter broad region (e.g. Western India, Southern India)")
        parser.add_argument("--state", type=str, default=None, help="Filter scope by state (e.g. Gujarat, Maharashtra)")
        parser.add_argument("--dry-run", action="store_true", help="Perform normalization without writing to DB")
        parser.add_argument("--update-existing", action="store_true", default=True, help="Update existing OCM stations")
        parser.add_argument("--skip-chargers", action="store_true", help="Skip connector/charger creation")
        parser.add_argument("--report-file", type=str, default=None, help="Path to save JSON summary report")
        parser.add_argument("--verbose", action="store_true", help="Enable verbose stdout output")
        parser.add_argument("--resume", type=str, default=None, help="Path to resume checkpoint file")
        parser.add_argument("--batch-size", type=int, default=100, help="Batch transaction size")

    def handle(self, *args, **options):
        country = options["country"]
        scope = options["scope"]
        target_count = options["target_count"]
        max_per_region = options["max_results_per_region"]
        region_filter = options["region"]
        state_filter = options["state"]
        dry_run = options["dry_run"]
        update_existing = options["update_existing"]
        skip_chargers = options["skip_chargers"]
        report_file = options["report_file"]
        verbose = options["verbose"]
        resume_file = options["resume"]
        batch_size = options["batch_size"]

        start_time = time.time()

        if state_filter and state_filter.lower() in ["gujarat", "gj"]:
            scope = "gujarat"

        self.stdout.write(self.style.NOTICE(
            f"Starting Open Charge Map import [Scope: {scope}, Country: {country}, Target: {target_count}, Dry-run: {dry_run}]"
        ))

        api_start = time.time()
        try:
            if scope == "gujarat":
                raw_pois = fetch_open_charge_map_pois(mode="gujarat", country_code=country, max_results=target_count)
            else:
                raw_pois = fetch_open_charge_map_pois_india(
                    target_count=target_count,
                    max_results_per_region=max_per_region,
                    region_filter=region_filter,
                    state_filter=state_filter,
                    resume_file=resume_file,
                )
        except Exception as e:
            self.stderr.write(self.style.ERROR(f"API Fetch Failed: {str(e)}"))
            raise e

        api_duration = round(time.time() - api_start, 3)

        normalized_pois = []
        rejected_coords = 0

        for poi in raw_pois:
            norm = normalize_poi_data(poi)
            if not norm:
                rejected_coords += 1
                continue

            normalized_pois.append(norm)

        import_start = time.time()
        report = process_import_records(
            normalized_pois,
            dry_run=dry_run,
            update_existing=update_existing,
            batch_size=batch_size,
            skip_chargers=skip_chargers,
        )
        import_duration = round(time.time() - import_start, 3)
        total_duration = round(time.time() - start_time, 3)

        report["fetched_pois"] = len(raw_pois)
        report["invalid_coordinate_records"] = rejected_coords
        report["api_duration_seconds"] = api_duration
        report["import_duration_seconds"] = import_duration
        report["total_duration_seconds"] = total_duration
        report["dry_run"] = dry_run
        report["attribution"] = "Source: Open Charge Map"

        self.stdout.write(self.style.SUCCESS(
            f"Import complete: {report['created_stations']} created, {report['updated_stations']} updated, "
            f"{report['skipped_stations']} skipped, {report['imported_chargers']} chargers processed in {total_duration}s."
        ))

        if report_file:
            out_path = Path(report_file)
            out_path.parent.mkdir(parents=True, exist_ok=True)
            with open(out_path, "w", encoding="utf-8") as f:
                json.dump(report, f, indent=2)
            self.stdout.write(self.style.SUCCESS(f"Saved import report to {report_file}"))

        if verbose:
            self.stdout.write(json.dumps(report, indent=2))
