from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()


class Command(BaseCommand):
    help = "Repair existing users: ensure is_active=True, convert plain-text passwords to Django hashes, and preserve all data."

    def add_arguments(self, parser):
        parser.add_argument(
            "--default-password",
            type=str,
            default="Password123!",
            help="Default temporary password for users with unusable or corrupt passwords."
        )

    def handle(self, *args, **options):
        default_pwd = options["default_password"]
        users = User.objects.all()

        checked_count = 0
        activated_count = 0
        repaired_count = 0
        skipped_count = 0
        failed_count = 0

        self.stdout.write(self.style.NOTICE(f"Starting user repair for {users.count()} accounts..."))

        for user in users:
            checked_count += 1
            modified = False

            try:
                # 1. Ensure user is active
                if not user.is_active:
                    user.is_active = True
                    activated_count += 1
                    modified = True

                # 2. Inspect password hashing condition
                raw_pwd = user.password or ""
                is_django_hash = any(raw_pwd.startswith(prefix) for prefix in [
                    "pbkdf2_sha256$", "pbkdf2_sha1$", "bcrypt$", "argon2$", "scrypt$"
                ])

                if not is_django_hash:
                    # Password is empty, plain-text, or corrupt
                    if raw_pwd and not raw_pwd.startswith("!"):
                        # Plain-text password: hash the actual plain-text string
                        user.set_password(raw_pwd)
                        self.stdout.write(self.style.SUCCESS(f"Hashed plain-text password for user '{user.username}' (ID: {user.id})."))
                    else:
                        # Unusable or missing password: set secure development test password
                        user.set_password(default_pwd)
                        self.stdout.write(self.style.WARNING(f"Assigned default password to user '{user.username}' (ID: {user.id})."))

                    repaired_count += 1
                    modified = True
                else:
                    if not modified:
                        skipped_count += 1

                if modified:
                    user.save(update_fields=["is_active", "password"])

            except Exception as e:
                failed_count += 1
                self.stderr.write(self.style.ERROR(f"Failed repairing user ID {user.id} ({user.username}): {str(e)}"))

        self.stdout.write(self.style.SUCCESS(
            f"User repair complete: Checked {checked_count}, Activated {activated_count}, "
            f"Repaired {repaired_count}, Skipped {skipped_count}, Failed {failed_count}."
        ))
